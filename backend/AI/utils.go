package AI

import (
	"log"
	"os"
)

// Utility to clean up temporary files
func CleanUpTempFile(path string) {
	err := os.Remove(path)
	if err != nil {
		log.Println("Error deleting file:", err)
	}
}
