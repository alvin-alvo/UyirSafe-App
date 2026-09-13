# ai_model — SigLIP2 road-incident classifier (current)

Fine-tuned `google/siglip2-base-patch16-256` + `best_model.pt`.

- Classes (`classes.json`): `accident`, `irrelevant`, `pothole`, `traffic`
- Input: 256×256, normalize mean/std 0.5
- Threshold: `CONFIDENCE_THRESHOLD = 0.70` → `needs_review: true`
  (`Needs Review` instead of auto-rejecting `irrelevant`)

## Run

```powershell
cd backend/ai_model
pip install -r Requirements.txt
python model.py        # -> http://0.0.0.0:5000
```

Paths (`best_model.pt`, `classes.json`, `metadata.json`) resolve
relative to this folder, so you can start it from any working directory.

## API

- `GET /health` → `{status, device, classes, cv_mean_acc}`
- `POST /classify` JSON `{"image": "<base64>", "mime_type": "..."}` →
  ```json
  {
    "category_index": 2,
    "category": {"key": "pothole", "label": "Pothole", "dept": "...", "action": "..."},
    "confidence": 92.4,
    "all_scores": [1.2, 0.5, 92.4, 5.9],
    "needs_review": false
  }
  ```
  `confidence` / `all_scores` are 0–100. The Go backend
  (`backend/AI/siglip.go`) normalizes confidence to 0–1 and maps
  `needs_review → "Needs Review"`, high-confidence `irrelevant →
  "Rejected"`, else `"Accepted"`.

## Go wiring

`POST /api/ai/detect` (multipart `image`) → `ClassifyWithSigLIP`
→ Flask `/classify`. Override URL with:

```powershell
$env:AI_MODEL_URL="http://localhost:5000/classify"
go run main.go
```
