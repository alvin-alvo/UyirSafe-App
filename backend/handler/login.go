package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/leoantony72/Uyir/model"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// Session expiry time
const sessionTTL = 24 * time.Hour

func LoginUser(c *gin.Context) {
	loginRequest := model.User{}
	if err := c.ShouldBindJSON(&loginRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request", "err": err.Error()})
		return
	}

	var storedUser model.User
	if err := Db.Where("name = ?", loginRequest.Name).First(&storedUser).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "User not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Error retrieving user data", "err": err.Error()})
		}
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(storedUser.Password), []byte(loginRequest.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid credentials"})
		return
	}
	sessionToken := uuid.New().String()

	// Store session token in the db
	session := model.Session{
		Token:     sessionToken,
		UserID:    storedUser.ID,
		ExpiresAt: time.Now().Add(sessionTTL),
	}

	if err := Db.Create(&session).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error creating session", "err": err.Error()})
		return
	}

	c.SetCookie("session_token", sessionToken, int(sessionTTL.Seconds()), "/", "", false, false)
	c.SetCookie("user_name", storedUser.Name, int(sessionTTL.Seconds()), "/", "", false, false)

	c.JSON(http.StatusOK, gin.H{"message": "Login successful", "user": storedUser.Name})
}


func Me(c *gin.Context) {

	token, err := c.Cookie("session_token")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Session token not found in cookie"})
		return
	}

	var session model.Session
	if err := Db.Where("token = ?", token).First(&session).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid session"})
		return
	}

	if session.ExpiresAt.Before(time.Now()) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Session expired"})
		return
	}

	var user model.User
	if err := Db.First(&user, "id = ?", session.UserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":       user.ID,
		"username": user.Name,
		"email":    user.Email,
		"points":   user.Points,
		"role":     user.Role,
	})
}