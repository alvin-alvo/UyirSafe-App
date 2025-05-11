package handler

import "github.com/gin-gonic/gin"

func GetData(c *gin.Context) {
	c.JSON(200, gin.H{"message": "working"})
}
