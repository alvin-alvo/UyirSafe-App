package handler

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/leoantony72/Uyir/model"
)

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
	var report model.Report
	if err := Db.First(&report, "id = ?", req.Id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Report not found"})
		return
	}
	report.Status = "Resolved"
	if err := Db.Save(&report).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update report status: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Report status updated successfully",
		"report":  report,
	})
}
