# DEPRECATED — old model (do not use for new work)

This folder is the **legacy** image-classification service:

- Model: MobileNetV2 with `uyir.pth`
  (`gui.py` → `mobilenet_v2` + `model.classifier[1]` → 4 outputs)
- Classes: `accident / others / potholes / traffic` (note plurals)
- Servers:
  - `gui.py` — Gradio on `http://0.0.0.0:7860`, endpoint `/classify_image`
  - `app.py` — interim Flask wrapper on `:7861`, endpoint `/predict`
- Weights: `uyir.pth` (kept here for reference only)

## Use this instead

**`backend/ai_model/`** — fine-tuned **SigLIP2**
(`google/siglip2-base-patch16-256` + `best_model.pt`):

- Classes (`classes.json`): `accident / irrelevant / pothole / traffic`
  (singular `pothole`, `irrelevant` instead of `others`)
- Server: `model.py` — Flask on `http://0.0.0.0:5000`
  - `POST /classify` with JSON `{"image": "<base64>"}`
  - `GET /health`
- Threshold: `CONFIDENCE_THRESHOLD = 0.70` → `needs_review: true`
  means `Needs Review` instead of auto-rejecting `irrelevant`.
- Go backend (`backend/AI/siglip.go` → `ClassifyWithSigLIP`)
  calls this service. `backend/AI/teachable.go` has been removed.

## Run the current stack

```powershell
cd backend/ai_model
pip install -r Requirements.txt
python model.py        # -> http://localhost:5000

cd backend
go run main.go         # -> http://localhost:6969, POST /api/ai/detect
```

The frontend's direct Gradio call (`NewReport.jsx` → `127.0.0.1:7860`)
is a leftover of this folder and needs a separate frontend task to
point at `/api/ai/detect` or the new `/classify` API.
