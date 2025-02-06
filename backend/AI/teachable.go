package AI

import (
	"bytes"
	"encoding/json"
	"log"
	"mime/multipart"
	"net/http"
	"os"
)

// Interacts with the Teachable Machine Model
func ClassifyWithTeachableMachine(imagePath string) (string, float64) {
	file, err := os.Open(imagePath)
	if err != nil {
		log.Println("Error opening image:", err)
		return "Unknown", 0
	}
	defer file.Close()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile("file", imagePath)
	if err != nil {
		log.Println("Error creating form:", err)
		return "Unknown", 0
	}
	_, err = part.Write([]byte{})
	writer.Close()

	req, err := http.NewRequest("POST", "https://teachablemachine.withgoogle.com/models/8N2NXMoJ8/", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Println("Error contacting Teachable Machine:", err)
		return "Unknown", 0
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	predictions := result["predictions"].([]interface{})
	topPrediction := predictions[0].(map[string]interface{})

	return topPrediction["class"].(string), topPrediction["confidence"].(float64)
}
