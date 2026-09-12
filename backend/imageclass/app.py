"""Flask API for hazard image classification with confidence threshold.

Replaces the auto-reject of "Irrelevant" images with a "Needs Review"
status when top-1 confidence < 70%.

Backend-only: response keeps label/confidence fields and only ADDS
"status", so existing frontend (ReportsPage already renders
"Needs Review") needs no change.

Model note: no SigLIP2 checkpoint is present in this repo. The active
model is MobileNetV2 (uyir.pth, see gui.py). To swap in SigLIP2 later,
replace classify_with_status import / SIGLIP2_* config below — the
threshold logic stays identical.

Run:
    pip install flask torch torchvision pillow
    python app.py          # -> http://0.0.0.0:7861/predict
"""
from flask import Flask, request, jsonify
from PIL import Image

from gui import classify_with_status, CONFIDENCE_THRESHOLD

# SigLIP2 swap-in point (not present yet):
#   SIGLIP2_MODEL_ID = "google/siglip2-base-patch16-224"
#   from transformers import AutoProcessor, AutoModelForZeroShotImageClassification
# Keep class names identical so threshold + status contract is unchanged.
SIGLIP2_MODEL_ID = None

app = Flask(__name__)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True, "threshold": CONFIDENCE_THRESHOLD})


@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files and "file" not in request.files:
        return jsonify({"error": "No image uploaded (use 'image' or 'file')"}), 400
    f = request.files.get("image", request.files.get("file"))
    try:
        img = Image.open(f.stream).convert("RGB")
    except Exception as e:
        return jsonify({"error": f"Invalid image: {e}"}), 400

    probs, label, confidence, status = classify_with_status(img)
    return jsonify({
        "label": label,
        "confidence": confidence,
        "status": status,  # Accepted | Needs Review | Rejected
        "threshold": CONFIDENCE_THRESHOLD,
        "probabilities": probs,
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7861)
