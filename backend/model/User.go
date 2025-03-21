package model

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID       string `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name     string `json:"username" gorm:"unique;not null"`
	Email    string `json:"email" gorm:"unique;not null"`
	Password string `json:"password" gorm:"not null"`
	Points   int    `json:"points"`
	Role     string `json:role`
}
type Session struct {
	ID        uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	Token     string    `json:"token" gorm:"uniqueIndex;not null"`
	UserID    string    `json:"user_id" gorm:"not null"`
	ExpiresAt time.Time `json:"expires_at" gorm:"not null"`
}

type Report struct {
	ID        string    `json:"id" gorm:"id"`
	UserID    string    `json:"uid" gorm:"user_id"`
	Longitude float64   `json:"longitude" gorm:"longitude"`
	Latitude  float64   `json:"latitude" gorm:"latitude"`
	Location  string    `json:"location" gorm:"location"`
	Date      time.Time `json:"date" gorm:"date"`
	Status    string    `json:"status" gorm:"status"`
	FilePath  string    `json:"file"`
	Type      string    `json:"type"`
}

func Migrate(db *gorm.DB) {
	db.AutoMigrate(&User{}, &Session{}, &Report{})
}
