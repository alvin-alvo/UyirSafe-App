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

func GetReportsForHospitals(c *gin.Context) {
    var reports []model.Report

    // Find reports where the type is "accidents".
    if err := Db.Table("reports").Where("type = ?", "acccidents").Find(&reports).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to fetch reports for hospitals: " + err.Error(),
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "data": reports,
    })
}

func GetReportsForPolice(c *gin.Context) {
    var reports []model.Report

    // Find reports where the type is "accidents" or "traffic jam".
    if err := Db.Table("reports").Where("type IN (?, ?)", "acccidents", "traffic jam").Find(&reports).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to fetch reports for police: " + err.Error(),
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "data": reports,
    })
}

func GetReportsForPWD(c *gin.Context) {
    var reports []model.Report

    // Find reports where the type is "potholes".
    if err := Db.Table("reports").Where("type = ?", "pothholes").Find(&reports).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to fetch reports for PWD: " + err.Error(),
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "data": reports,
    })
}

