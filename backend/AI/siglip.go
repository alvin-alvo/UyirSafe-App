package AI

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
)

// Default endpoint of the new SigLIP2 Flask service (backend/ai_model/model.py).
// Override with AI_MODEL_URL or AI_CLASSIFY_URL, e.g.
//   AI_MODEL_URL=http://localhost:5000/classify go run main.go
const defaultClassifyURL = "http://localhost:5000/classify"

func aiClassifyURL() string {
	if v := os.Getenv("AI_MODEL_URL"); v != "" {
		return v
	}
	if v := os.Getenv("AI_CLASSIFY_URL"); v != "" {
		return v
	}
	return defaultClassifyURL
}

type siglipCategory struct {
	Key    string `json:"key"`
	Label  string `json:"label"`
	Dept   string `json:"dept"`
	Action string `json:"action"`
	Color  string `json:"color"`
}

type siglipResponse struct {
	CategoryIndex int            `json:"category_index"`
	Category      siglipCategory `json:"category"`
	Confidence    float64        `json:"confidence"` // 0-100 from Flask
	AllScores     []float64      `json:"all_scores"` // 0-100 from Flask
	NeedsReview   bool           `json:"needs_review"`
}

// Classification is the normalized result used by handlers.
// Confidence is 0-1 to stay compatible with the previous 0-1 API
// contract (frontend AIDetector multiplies by 100).
type Classification struct {
	Label        string
	Confidence   float64 // 0-1
	NeedsReview  bool
	AllScores    []float64 // 0-100, ordered as classes.json
	Department   string
	Action       string
	RawConf100   float64
}

// ClassifyWithSigLIP sends a local image file to the ai_model Flask
// service (/classify, base64 JSON) and returns the normalized result.
func ClassifyWithSigLIP(imagePath string) (Classification, error) {
	data, err := os.ReadFile(imagePath)
	if err != nil {
		log.Println("Error opening image:", err)
		return Classification{Label: "Unknown", NeedsReview: true}, err
	}

	payload, err := json.Marshal(map[string]string{
		"image": base64.StdEncoding.EncodeToString(data),
	})
	if err != nil {
		return Classification{Label: "Unknown", NeedsReview: true}, err
	}

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Post(aiClassifyURL(), "application/json", bytes.NewReader(payload))
	if err != nil {
		log.Println("Error contacting SigLIP2 service:", err)
		return Classification{Label: "Unknown", NeedsReview: true}, fmt.Errorf("AI service unreachable: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errBody map[string]interface{}
		_ = json.NewDecoder(resp.Body).Decode(&errBody)
		log.Println("SigLIP2 service error:", resp.Status, errBody)
		return Classification{Label: "Unknown", NeedsReview: true}, fmt.Errorf("AI service status %s", resp.Status)
	}

	var result siglipResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		log.Println("Error decoding SigLIP2 JSON:", err)
		return Classification{Label: "Unknown", NeedsReview: true}, err
	}

	label := result.Category.Key
	if label == "" {
		label = "Unknown"
	}
	conf01 := result.Confidence / 100.0
	if conf01 < 0 {
		conf01 = 0
	}
	if conf01 > 1 {
		conf01 = 1
	}

	return Classification{
		Label:       label,
		Confidence:  conf01,
		NeedsReview: result.NeedsReview,
		AllScores:   result.AllScores,
		Department:  result.Category.Dept,
		Action:      result.Category.Action,
		RawConf100:  result.Confidence,
	}, nil
}
