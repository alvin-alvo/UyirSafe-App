package handler

import (
	"fmt"
	"math"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/leoantony72/Uyir/model"
)

// Define input structure
type Input struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

// Haversine formula to calculate distance in meters
func haversine(lat1, lon1, lat2, lon2 float64) float64 {
	const R = 6371000 // Earth radius in meters
	lat1, lon1, lat2, lon2 = lat1*(math.Pi/180), lon1*(math.Pi/180), lat2*(math.Pi/180), lon2*(math.Pi/180)
	dLat := lat2 - lat1
	dLon := lon2 - lon1

	a := math.Sin(dLat/2)*math.Sin(dLat/2) + math.Cos(lat1)*math.Cos(lat2)*math.Sin(dLon/2)*math.Sin(dLon/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return R * c
}

// SimilarReports function
func SimilarReports(c *gin.Context) {
	var input Input
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	// Debug: Print input coordinates
	fmt.Printf("Input coordinates: Latitude=%f, Longitude=%f\n", input.Latitude, input.Longitude)

	// Fetch all pending reports from the "reports" table
	var reports []model.Report
	if err := Db.Table("reports").Where("status = ?", "Pending").Find(&reports).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Error fetching reports"})
		return
	}

	// Debug: Print the number of pending reports found and their coordinates
	fmt.Printf("Found %d pending reports\n", len(reports))
	for _, report := range reports {
		fmt.Printf("Report ID %s: Latitude=%f, Longitude=%f\n", report.ID, report.Latitude, report.Longitude)
	}

	// Filter reports within 500 meters (update threshold as needed)
	var nearbyReports []model.Report
	for _, report := range reports {
		distance := haversine(input.Latitude, input.Longitude, report.Latitude, report.Longitude)
		fmt.Printf("Distance to report %s: %f meters\n", report.ID, distance)
		if distance < 500 { // Use 500 for 500 meters threshold
			nearbyReports = append(nearbyReports, report)
		}
	}

	fmt.Printf("Found %d nearby reports\n", len(nearbyReports))
	c.JSON(http.StatusOK, gin.H{"similar_reports": nearbyReports})
}
