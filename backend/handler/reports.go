package handler

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/leoantony72/Uyir/model"
	"gorm.io/gorm"
)

func GetReportsAndPoints(c *gin.Context) {
	userCookie, err := c.Cookie("session_token")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Missing session token"})
		return
	}

	var session model.Session
	if err := Db.Where("token = ?", userCookie).First(&session).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid session token"})
		return
	}

	var points int
	result := Db.Table("users").Select("points").Where("id = ?", session.UserID).Scan(&points)
	if result.Error != nil {
		log.Println("Error fetching user points:", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error fetching user points"})
		return
	}

	var reports []model.Report
	result = Db.Table("reports").Where("user_id = ?", session.UserID).Find(&reports)
	if result.Error != nil && result.Error != gorm.ErrRecordNotFound {
		log.Println("Error fetching reports:", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error fetching reports"})
		return
	}

	// Send JSON response with points and reports
	c.JSON(http.StatusOK, gin.H{
		"points": points,
		"data":   reports,
	})
}
