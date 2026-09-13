package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/leoantony72/Uyir/model"
)

// SupportReport increments the support count of an existing issue instead of
// creating a duplicate (Common / Pothole / Accident / Traffic workflows).
// POST /reports/support { "id": "<report-id>" } with session_token cookie.
func SupportReport(c *gin.Context) {
	var req struct {
		ID string `json:"id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || req.ID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing report id"})
		return
	}

	cookie, err := c.Cookie("session_token")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing session token"})
		return
	}
	var session model.Session
	if err := Db.Where("token = ?", cookie).First(&session).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid session token"})
		return
	}

	var report model.Report
	if err := Db.First(&report, "id = ?", req.ID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Report not found"})
		return
	}
	if report.Status == "Resolved" || report.Status == "Rejected" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Report is already closed"})
		return
	}

	// One support per user per report.
	var existing model.ReportSupport
	if err := Db.Where("report_id = ? AND user_id = ?", report.ID, session.UserID).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Already supported", "support_count": report.SupportCount})
		return
	}

	if err := Db.Create(&model.ReportSupport{ReportID: report.ID, UserID: session.UserID}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record support"})
		return
	}
	if err := Db.Model(&model.Report{}).Where("id = ?", report.ID).
		Update("support_count", report.SupportCount+1).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update support count"})
		return
	}
	report.SupportCount++

	c.JSON(http.StatusOK, gin.H{
		"message":       "Support recorded",
		"support_count": report.SupportCount,
		"visible":       IsVisibleToAuthority(report.Type, report.SupportCount),
		"report":        report,
	})
}
