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
	// "Needs Review" is intentionally excluded here — it has its own
	// dedicated route below for the frontend review section.
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

func GetNeedsReviewReports(c *gin.Context) {
	var reports []model.Report

	// find reports where the status is "Needs Review".
	// Separate from /reports/pending/ so the frontend can render
	// the human-review queue in its own section.
	if err := Db.Table("reports").Where("status = ?", "Needs Review").Find(&reports).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch reports needing review: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": reports,
	})
}

func GetReportsForHospitals(c *gin.Context) {
    var reports []model.Report

    // Road Accident workflow: immediate forwarding irrespective of support
    // count — accidents are emergency events. Canonical type "accident".
    if err := Db.Table("reports").Where("type = ? AND status = ?", TypeAccident, "Pending").Find(&reports).Error; err != nil {
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

    // Accidents: immediate (no threshold). Traffic: visible once support >= 3.
    if err := Db.Table("reports").Where(
        "status = ? AND ((type = ?) OR (type = ? AND support_count >= ?))",
        "Pending", TypeAccident, TypeTraffic, TrafficVisibleThreshold,
    ).Find(&reports).Error; err != nil {
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

    // Pothole workflow: visible on the government dashboard only once the
    // issue receives support from at least 5 independent users.
    if err := Db.Table("reports").Where(
        "type = ? AND status = ? AND support_count >= ?",
        TypePothole, "Pending", PotholeVisibleThreshold,
    ).Find(&reports).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to fetch reports for PWD: " + err.Error(),
        })
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "data": reports,
    })
}

