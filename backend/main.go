package main

import (
	"time"

	"github.com/leoantony72/Uyir/AI"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/leoantony72/Uyir/handler"
)

func main() {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // Change this if your frontend URL changes
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.GET("/", handler.GetData)

	r.POST("/signup", handler.RegisterUser)

	r.POST("/login", handler.LoginUser)

	r.POST("/new", handler.NewReport)

	r.POST("/api/ai/detect", AI.DetectHazard)

	r.GET("/user", handler.GetReportsAndPoints)

	r.GET("/reports", handler.GetAllReports)
	r.GET("/reports/pending/", handler.GetPendingReports)

	r.POST("/reports/updateStatus", handler.UpdateReportStatus)

	r.Run(":6969")
}
