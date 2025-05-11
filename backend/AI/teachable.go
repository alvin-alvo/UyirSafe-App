package AI

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
)

// ClassifyWithTeachableMachine sends an image to Teachable Machine and returns classification results.
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
		log.Println("Error creating form file:", err)
		return "Unknown", 0
	}

	_, err = io.Copy(part, file)
	if err != nil {
		log.Println("Error writing file to form:", err)
		return "Unknown", 0
	}
	writer.Close()

	// Ensure correct API URL
	req, err := http.NewRequest("POST", "https://teachablemachine.withgoogle.com/models/8N2NXMoJ8/", body)
	if err != nil {
		log.Println("Error creating request:", err)
		return "Unknown", 0
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Println("Error contacting Teachable Machine:", err)
		return "Unknown", 0
	}
	defer resp.Body.Close()

	// Decode JSON safely
	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		log.Println("Error decoding JSON:", err)
		return "Unknown", 0
	}
	log.Println("API Response:", result) // Debugging

	// Safely extract "predictions"
	predictions, exists := result["predictions"]
	if !exists {
		log.Println("No predictions key found in response:", result)
		return "Unknown", 0
	}

	predList, ok := predictions.([]interface{})
	if !ok || len(predList) == 0 {
		log.Println("Predictions format incorrect")
		return "Unknown", 0
	}

	topPrediction, ok := predList[0].(map[string]interface{})
	if !ok {
		log.Println("Invalid prediction format")
		return "Unknown", 0
	}

	className, _ := topPrediction["class"].(string)
	confidence, _ := topPrediction["confidence"].(float64)

	return className, confidence
}
