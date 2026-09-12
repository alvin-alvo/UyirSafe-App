package AI

import (
	"net/http"
	"github.com/gin-gonic/gin"
)

// Confidence below this forces "Needs Review" instead of auto-reject.
// Matches backend/ai_model/model.py CONFIDENCE_THRESHOLD (0.70).
// Frontend already renders this status, so the new fields are purely
// additive (no frontend change).
const ConfidenceThreshold = 0.70

// reviewStatus derives the report status from the SigLIP2 result.
// needsReview (conf < 0.70) -> "Needs Review" even for irrelevant;
// high-confidence irrelevant -> "Rejected"; else "Accepted".
func reviewStatus(hazardType string, needsReview bool) string {
	if needsReview {
		return "Needs Review"
	}
	switch hazardType {
	case "irrelevant", "Irrelevant", "Unknown", "":
		return "Rejected"
	default:
		return "Accepted"
	}
}

// DetectHazard handles image upload requests and classifies them with
// the local SigLIP2 service (backend/ai_model). Route unchanged:
// POST /api/ai/detect with multipart field "image".
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
	defer CleanUpTempFile(filePath)

	// Classify using the local SigLIP2 service (backend/ai_model)
	result, err := ClassifyWithSigLIP(filePath)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{
			"error":      "AI classification failed",
			"details":    err.Error(),
			"hazardType": "Unknown",
			"confidence": 0.0,
			"status":     "Needs Review",
			"threshold":  ConfidenceThreshold,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Image processed successfully",
		"hazardType": result.Label,
		"confidence": result.Confidence,
		"status":     reviewStatus(result.Label, result.NeedsReview),
		"threshold":  ConfidenceThreshold,
		"needs_review": result.NeedsReview,
		"all_scores":   result.AllScores,
		"department":   result.Department,
		"action":       result.Action,
	})
}
