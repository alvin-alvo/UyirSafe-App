package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/leoantony72/Uyir/model"
)


func GetAllReports(c *gin.Context) {
	var reports []model.Report

	// find reports.
	if err := Db.Table("reports").Find(&reports).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch reports: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": reports,
	})
}

func GetPendingReports(c *gin.Context) {
	var reports []model.Report

	// find reports where the status is "Pending".
	if err := Db.Table("reports").Where("status = ?", "Pending").Find(&reports).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch pending reports: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": reports,
	})
}
