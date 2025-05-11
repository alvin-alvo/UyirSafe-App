package handler

import (
	"context"

	"github.com/leoantony72/Uyir/database"

	"gorm.io/gorm"
)

var Ctx = context.Background()
var Db *gorm.DB = database.StartPostgres()
