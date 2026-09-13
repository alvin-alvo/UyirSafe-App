package handler

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/leoantony72/Uyir/AI"
	"github.com/leoantony72/Uyir/model"
	"github.com/leoantony72/Uyir/storage"
)

// NewReport handles new report submissions.
//
// Implements the Common Reporting Workflow + per-type workflows:
//   - Normalizes the frontend type to canonical accident/pothole/traffic.
//   - Enforces per-user active-report quotas (pothole 5, traffic 3,
//     accident unlimited — emergency events are never quota-blocked).
//   - Runs server-side AI classification: high-confidence "irrelevant" is
//     rejected without creating a record; low confidence (<70%) creates the
//     record with status "Needs Review" for the human-review queue.
//   - Uploads evidence to MinIO when configured, falling back to the local
//     uploads/ directory on a single-VM pilot setup.
func NewReport(c *gin.Context) {
	// Extract session token from cookies
	cookie, err := c.Cookie("session_token")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing session token"})
		return
	}
	fmt.Println("Session Token:", cookie)

	// Validate session token
	var session model.Session
	if err := Db.Where("token = ?", cookie).First(&session).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid session token"})
		return
	}
	fmt.Println("User ID:", session.UserID)

	// Parse form data
	if err := c.Request.ParseMultipartForm(10 << 20); err != nil { // 10MB limit
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form"})
		return
	}

	// Extract location data
	latStr := c.PostForm("latitude")
	lngStr := c.PostForm("longitude")
	location := c.PostForm("location")
	rawType := c.PostForm("type")
	reportType := NormalizeType(rawType)
	if reportType == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing report type"})
		return
	}
	if reportType != TypeAccident && reportType != TypePothole && reportType != TypeTraffic && reportType != TypeIrrelevant {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid report type"})
		return
	}

	latitude, err := strconv.ParseFloat(latStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid latitude value"})
		return
	}

	longitude, err := strconv.ParseFloat(lngStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid longitude value"})
		return
	}

	// Enforce per-user active-report quotas before consuming the upload.
	if max := MaxActiveForType(reportType); max >= 0 {
		var activeCount int64
		if err := Db.Table("reports").
			Where("user_id = ? AND type = ? AND status IN ?", session.UserID, reportType, []string{"Pending", "Needs Review"}).
			Count(&activeCount).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check report quota"})
			return
		}
		if activeCount >= int64(max) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": fmt.Sprintf("Active report limit reached for %s (max %d)", reportType, max),
				"type":  reportType,
				"limit": max,
			})
			return
		}
	}

	// Handle file upload
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File upload failed"})
		return
	}
	defer file.Close()

	_ = os.MkdirAll("uploads", 0o755)

	// Generate unique filename
	ext := filepath.Ext(header.Filename)
	filename := uuid.New().String() + ext
	tmpPath := "uploads/tmp-" + filename

	// Save uploaded file to temp path for AI classification
	if err := c.SaveUploadedFile(header, tmpPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	// Server-side AI classification (authoritative for status).
	// Fail-open to "Needs Review" when the model service is unreachable so
	// edge cases are queued for humans instead of being lost.
	finalType := reportType
	status := "Pending"
	needsReview := false
	if result, aiErr := AI.ClassifyWithSigLIP(tmpPath); aiErr != nil {
		status = "Needs Review"
		needsReview = true
	} else if result.NeedsReview {
		status = "Needs Review"
		needsReview = true
		// Preserve user intent for review queue when they picked a valid
		// hazard type; otherwise keep the model label.
		if reportType != TypeAccident && reportType != TypePothole && reportType != TypeTraffic {
			finalType = NormalizeType(result.Label)
		}
	} else if NormalizeType(result.Label) == TypeIrrelevant {
		_ = os.Remove(tmpPath)
		c.JSON(http.StatusUnprocessableEntity, gin.H{
			"error":      "Image classified as irrelevant",
			"status":     "Rejected",
			"hazardType": result.Label,
			"confidence": result.Confidence,
		})
		return
	} else {
		finalType = NormalizeType(result.Label)
		if finalType == "" {
			finalType = reportType
		}
		status = "Pending"
	}

	// Store evidence: MinIO first, local uploads/ as fallback so the pilot
	// still works when MinIO is down.
	savePath := "uploads/" + filename
	contentType := header.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/octet-stream"
	}
	if key, upErr := storage.UploadImage(c.Request.Context(), tmpPath, filename, contentType); upErr != nil {
		fmt.Println("MinIO upload failed, using local storage:", upErr)
		if renameErr := os.Rename(tmpPath, savePath); renameErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
			return
		}
	} else {
		savePath = "minio://" + key
		fmt.Println("MinIO upload OK:", savePath)
		_ = os.Remove(tmpPath)
	}

	// Populate report struct (creator counts as first supporter).
	report := model.Report{
		ID:           uuid.New().String(),
		UserID:       session.UserID,
		Latitude:     latitude,
		Longitude:    longitude,
		FilePath:     savePath,
		Location:     location,
		Type:         finalType,
		Status:       status,
		SupportCount: 1,
		Date:         time.Now(),
	}

	fmt.Println("Report Data:", report)

	// Save report to the database
	if err := Db.Create(&report).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to submit report"})
		return
	}
	_ = Db.Create(&model.ReportSupport{ReportID: report.ID, UserID: session.UserID}).Error

	// Accident workflow: forwarded immediately irrespective of support count.
	forwarded := NormalizeType(report.Type) == TypeAccident && report.Status == "Pending"

	// Return success response
	c.JSON(http.StatusOK, gin.H{
		"message":       "Report submitted successfully",
		"user_id":       report.UserID,
		"file_path":     report.FilePath,
		"status":        report.Status,
		"needs_review":  needsReview,
		"support_count": report.SupportCount,
		"visible":       IsVisibleToAuthority(report.Type, report.SupportCount),
		"forwarded":     forwarded,
		"location": gin.H{
			"latitude":  report.Latitude,
			"longitude": report.Longitude,
			"location":  report.Location,
		},
	})
}
