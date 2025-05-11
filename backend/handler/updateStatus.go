package handler

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/leoantony72/Uyir/model"
	"gorm.io/gorm"
)

var points = map[string]int{
	"acccidents": 10,
	"traffic jam":   2,
	"pothholes":   5,
}

func UpdateReportStatus(c *gin.Context) {
	var req struct {
		Id string `json:"id"`
	}

	// Bind the JSON request body to req.
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fmt.Println("Report ID:", req.Id)

	// Find the report by ID
	var report model.Report
	if err := Db.First(&report, "id = ?", req.Id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Report not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error: " + err.Error()})
		}
		return
	}

	// Update report status
	report.Status = "Resolved"
	if err := Db.Save(&report).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update report status: " + err.Error()})
		return
	}

	// Fetch and update user points
	var user model.User
	if err := Db.First(&user, "id = ?", report.UserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Get points from the map, default to 0 if the report type doesn't exist
	pointValue := points[report.Type]
	user.Points += pointValue

	if err := Db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user points: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Report status updated successfully and points awarded",
		"report":  report,
		"user":    user,
	})
}
