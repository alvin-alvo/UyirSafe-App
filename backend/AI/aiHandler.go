package AI

import (
	"net/http"
	"github.com/gin-gonic/gin"
)

// Handles image upload requests and calls Teachable Machine
func DetectHazard(c *gin.Context) {
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	// Save image temporarily
	filePath := "./uploads/" + file.Filename
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
		return
	}

	// Classify using Teachable Machine
	hazardType, confidence := ClassifyWithTeachableMachine(filePath)

	c.JSON(http.StatusOK, gin.H{
		"message":    "Image processed successfully",
		"hazardType": hazardType,
		"confidence": confidence,
	})
}
