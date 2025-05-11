package database

import (
	"log"

	"github.com/leoantony72/Uyir/model"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func StartPostgres() *gorm.DB {
	dbUser := "postgres"
	dbPassword := "yourpassword"
	dbName := "uyir"
	dbHost := "localhost" 
	dbPort := "5432"       
	dbUrl := "postgres://" + dbUser + ":" + dbPassword + "@" + dbHost + ":" + dbPort + "/" + dbName

	db, err := gorm.Open(postgres.Open(dbUrl), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect to the database:", err)
	}
	model.Migrate(db)
	return db
}
