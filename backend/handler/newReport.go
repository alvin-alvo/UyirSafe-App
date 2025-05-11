package handler

import (
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/leoantony72/Uyir/model"
)

// NewReport handles new report submissions
func NewReport(c *gin.Context) {
	var report model.Report

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
	Type := c.PostForm("type")

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

	// Handle file upload
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File upload failed"})
		return
	}
	defer file.Close()

	// Generate unique filename
	filename := uuid.New().String() + filepath.Ext(header.Filename)
	savePath := "uploads/" + filename

	// Save uploaded file
	if err := c.SaveUploadedFile(header, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	// Populate report struct
	report = model.Report{
		ID:        uuid.New().String(),
		UserID:    session.UserID,
		Latitude:  latitude,
		Longitude: longitude,
		FilePath:  savePath,
		Location:  location,
		Type:      Type,
		Status:    "Pending",
		Date:      time.Now(),
	}

	fmt.Println("Report Data:", report)

	// Save report to the database
	if err := Db.Create(&report).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to submit report"})
		return
	}

	// Return success response
	c.JSON(http.StatusOK, gin.H{
		"message":   "Report submitted successfully",
		"user_id":   report.UserID,
		"file_path": report.FilePath,
		"location": gin.H{
			"latitude":  report.Latitude,
			"longitude": report.Longitude,
			"location":  report.Location,
		},
	})
}
