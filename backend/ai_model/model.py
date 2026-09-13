"""
Run:
  pip install flask torch torchvision transformers pillow
  python app.py
"""

import os
import io
import json
import base64
from pathlib import Path

import torch
import torch.nn as nn
from torchvision import transforms
from transformers import SiglipModel
from PIL import Image
from flask import Flask, request, jsonify, render_template_string

# ── Config ────────────────────────────────────────────────────────────────────
MODEL_ID       = "google/siglip2-base-patch16-256"   # backbone architecture
BASE_DIR       = Path(__file__).resolve().parent     # run from anywhere
WEIGHTS_PATH   = str(BASE_DIR / "best_model.pt")      # fine-tuned weights
CLASSES_PATH   = str(BASE_DIR / "classes.json")
METADATA_PATH  = str(BASE_DIR / "metadata.json")
IMG_SIZE       = 256
CONFIDENCE_THRESHOLD = 0.70   # below this → human review queue
DEVICE         = "cuda" if torch.cuda.is_available() else "cpu"

# ── Same classifier head used during training ─────────────────────────────────
class SiglipClassifier(nn.Module):
    def __init__(self, base_model, num_classes: int = 4, dropout: float = 0.3):
        super().__init__()
        self.encoder = base_model.vision_model
        hidden = self.encoder.config.hidden_size   # 768 for ViT-B
        self.head = nn.Sequential(
            nn.LayerNorm(hidden),
            nn.Dropout(dropout),
            nn.Linear(hidden, 256),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(256, num_classes),
        )

    def _pool(self, encoder_output):
        if hasattr(encoder_output, "pooler_output") and \
                encoder_output.pooler_output is not None:
            return encoder_output.pooler_output
        return encoder_output.last_hidden_state[:, 0, :]   # CLS token

    def forward(self, pixel_values):
        out    = self.encoder(pixel_values=pixel_values)
        pooled = self._pool(out)
        return self.head(pooled)


# ── Val transform — same as finetune.py VAL_TRANSFORM ─────────────────────────
TRANSFORM = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),
])

# ── Category metadata (order must match CLASSES list) ─────────────────────────
CAT_META = {
    "accident":   {"label": "Accident",           "color": "#c0392b",
                   "dept": "Emergency Response (Police / Ambulance)",
                   "action": "Dispatch emergency units immediately"},
    "irrelevant": {"label": "Not Relevant",        "color": "#7f8c8d",
                   "dept": "—",
                   "action": "Notify user: image does not show a road issue"},
    "pothole":    {"label": "Pothole",             "color": "#e67e22",
                   "dept": "Roads & PWD Department",
                   "action": "Schedule repair crew within 48 hours"},
    "traffic":    {"label": "Traffic Congestion",  "color": "#2980b9",
                   "dept": "Traffic Management Centre",
                   "action": "Alert traffic control for signal adjustment"},
}

# ── Load model ─────────────────────────────────────────────────────────────────
def load_model():
    if not Path(WEIGHTS_PATH).exists():
        raise FileNotFoundError(
            f"Weights not found at {WEIGHTS_PATH}.\n"
            "Place best_model.pt in the same folder as app.py."
        )
    if not Path(CLASSES_PATH).exists():
        raise FileNotFoundError(f"classes.json not found at {CLASSES_PATH}.")

    with open(CLASSES_PATH) as f:
        classes = json.load(f)

    print(f"  Loading SigLIP2 backbone ({MODEL_ID}) …")
    base  = SiglipModel.from_pretrained(MODEL_ID)
    model = SiglipClassifier(base, num_classes=len(classes))

    print(f"  Loading fine-tuned weights from {WEIGHTS_PATH} …")
    state = torch.load(WEIGHTS_PATH, map_location=DEVICE)
    model.load_state_dict(state)
    model.to(DEVICE).eval()

    # load optional metadata
    meta = {}
    if Path(METADATA_PATH).exists():
        with open(METADATA_PATH) as f:
            meta = json.load(f)

    print(f"  Model ready on {DEVICE}.")
    return model, classes, meta


print("\n  Road Incident Classifier — Fine-tuned Inference")
print(f"  Device : {DEVICE}")
model, CLASSES, TRAIN_META = load_model()

# build ordered category list matching the CLASSES order
CATEGORIES = [
    {**CAT_META.get(cls, {"label": cls, "color": "#555", "dept": "—", "action": "—"}),
     "key": cls}
    for cls in CLASSES
]

# ── Inference ──────────────────────────────────────────────────────────────────
def classify(image: Image.Image) -> dict:
    tensor = TRANSFORM(image).unsqueeze(0).to(DEVICE)   # (1, 3, 256, 256)
    with torch.no_grad():
        logits = model(tensor)[0]                        # (num_classes,)
    probs  = torch.softmax(logits, dim=0).cpu().tolist()
    best   = int(torch.argmax(torch.tensor(probs)))
    return {
        "category_index": best,
        "category":       CATEGORIES[best],
        "confidence":     round(probs[best] * 100, 1),
        "all_scores":     [round(p * 100, 1) for p in probs],
        "needs_review":   probs[best] < CONFIDENCE_THRESHOLD,
    }


# ── Flask app ──────────────────────────────────────────────────────────────────
app = Flask(__name__)

# pass training metadata into the template
CV_ACC  = TRAIN_META.get("cv_mean_acc", "—")
CV_STD  = TRAIN_META.get("cv_std_acc",  "—")
MODEL_TS = TRAIN_META.get("timestamp",  "unknown")

HTML = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Road Incident Classifier</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:      #f4f5f7;
    --surface: #ffffff;
    --border:  #e0e3e8;
    --text:    #1a1d23;
    --muted:   #6b7280;
    --accent:  #1a56db;
    --radius:  10px;
    --shadow:  0 1px 4px rgba(0,0,0,.08);
  }
  body { font-family: 'Inter', system-ui, sans-serif; background: var(--bg);
         color: var(--text); min-height: 100vh; display: flex; flex-direction: column; }

  /* header */
  header { background: var(--surface); border-bottom: 1px solid var(--border);
    padding: 0 2rem; height: 56px; display: flex; align-items: center; gap: 12px; }
  .hicon { width: 32px; height: 32px; border-radius: 8px; background: #dbeafe;
    display: flex; align-items: center; justify-content: center; font-size: 16px; }
  header h1 { font-size: 15px; font-weight: 600; }
  .badge-ft { font-size: 11px; background: #d1fae5; color: #065f46;
    padding: 2px 8px; border-radius: 10px; font-weight: 500; margin-left: 8px; }
  .meta-bar { margin-left: auto; font-size: 11px; color: var(--muted); }

  /* layout */
  main { flex: 1; max-width: 900px; width: 100%; margin: 1.75rem auto;
    padding: 0 1.25rem; display: grid; grid-template-columns: 1fr 1fr;
    gap: 1.25rem; align-items: start; }
  @media (max-width: 640px) { main { grid-template-columns: 1fr; } }

  /* cards */
  .card { background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); box-shadow: var(--shadow); padding: 1.25rem; }
  .card-title { font-size: 11px; font-weight: 600; color: var(--muted);
    text-transform: uppercase; letter-spacing: .06em; margin-bottom: 1rem; }

  /* drop zone — using label so native file picker works in all browsers */
  #drop-zone { border: 1.5px dashed var(--border); border-radius: var(--radius);
    padding: 2.5rem 1rem; text-align: center; cursor: pointer;
    transition: background .15s, border-color .15s; display: block; }
  #drop-zone:hover, #drop-zone.over { background: #f0f5ff; border-color: var(--accent); }
  #drop-zone .icon { font-size: 2rem; display: block; margin-bottom: .5rem; }
  #drop-zone p { font-size: 14px; color: var(--muted); }
  #drop-zone strong { color: var(--accent); }
  #file-input { display: none; }

  /* preview */
  #preview-wrap { display: none; margin-top: 1rem; }
  #preview { width: 100%; max-height: 280px; object-fit: cover;
    border-radius: 8px; border: 1px solid var(--border); display: block; }
  .btn-row { display: flex; gap: 8px; margin-top: .875rem; }
  button { font-size: 13px; font-weight: 500; padding: 7px 16px;
    border-radius: 7px; border: 1px solid var(--border); background: var(--surface);
    color: var(--text); cursor: pointer; transition: background .12s; }
  button:hover { background: var(--bg); }
  button.primary { background: var(--accent); color: #fff; border-color: var(--accent); }
  button.primary:hover { background: #1648c0; }
  button:disabled { opacity: .5; cursor: not-allowed; }

  /* result */
  #result-wrap { display: none; }
  .cat-badge { display: inline-flex; align-items: center; gap: 6px;
    font-size: 14px; font-weight: 600; padding: 5px 14px;
    border-radius: 20px; margin-bottom: 1rem; }
  .conf-lbl { font-size: 12px; color: var(--muted); margin-bottom: 4px; }
  .conf-track { height: 6px; background: var(--bg); border-radius: 3px;
    overflow: hidden; margin-bottom: .875rem; }
  .conf-fill { height: 100%; border-radius: 3px; transition: width .5s ease; }
  .info-row { font-size: 13px; padding: 6px 0; border-bottom: 1px solid var(--border);
    display: flex; justify-content: space-between; gap: 8px; }
  .info-row:last-child { border-bottom: none; }
  .info-row .lbl { color: var(--muted); white-space: nowrap; }
  .info-row .val { font-weight: 500; text-align: right; }
  .banner { margin-top: .875rem; padding: 8px 12px; border-radius: 7px; font-size: 12px; }
  .banner-review { background: #fffbeb; border: 1px solid #fcd34d; color: #92400e; }
  .banner-reject { background: #f9fafb; border: 1px solid var(--border); color: var(--muted); }

  /* score bars */
  .score-item { margin-bottom: .625rem; }
  .score-meta { display: flex; justify-content: space-between;
    font-size: 12px; margin-bottom: 3px; color: var(--muted); }
  .score-track { height: 4px; background: var(--bg); border-radius: 2px; }
  .score-fill  { height: 100%; border-radius: 2px; }

  /* log */
  #log-section { display: none; grid-column: 1 / -1; }
  .log-row { display: flex; justify-content: space-between; align-items: center;
    font-size: 13px; padding: 6px 0; border-bottom: 1px solid var(--border); }
  .log-row:last-child { border-bottom: none; }
  .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 6px; }
  .pill { font-size: 11px; padding: 2px 8px; border-radius: 10px; font-weight: 500; }
  .pill-ok     { background: #d1fae5; color: #065f46; }
  .pill-reject { background: #f3f4f6; color: #6b7280; }
  .pill-review { background: #fef3c7; color: #92400e; }

  /* spinner */
  .spin { width: 14px; height: 14px; border: 2px solid #c7d2fe;
    border-top-color: var(--accent); border-radius: 50%;
    animation: spin .7s linear infinite; display: inline-block; }
  @keyframes spin { to { transform: rotate(360deg); } }

  footer { text-align: center; font-size: 12px; color: var(--muted); padding: 1.5rem; }
</style>
</head>
<body>

<header>
  <div class="hicon">🛣️</div>
  <h1>Road Incident Classifier</h1>
  <span class="badge-ft">Fine-tuned</span>
  <div class="meta-bar">
    SigLIP2 ViT-B/16 &nbsp;·&nbsp;
    CV acc {{ cv_acc }}% ±{{ cv_std }}% &nbsp;·&nbsp;
    trained {{ model_ts }}
  </div>
</header>

<main>

  <div class="card">
    <div class="card-title">Upload image</div>
    <input type="file" id="file-input" accept="image/*">
    <label id="drop-zone" for="file-input"
           ondragover="onDragOver(event)" ondragleave="onDragLeave(event)"
           ondrop="onDrop(event)">
      <span class="icon">☁️</span>
      <p>Drop an image here or <strong>browse files</strong></p>
      <p style="margin-top:4px;font-size:12px;">JPG · PNG · WEBP</p>
    </label>

    <div id="preview-wrap">
      <img id="preview" alt="Preview">
      <div class="btn-row">
        <button class="primary" id="classify-btn" onclick="runClassify()">
          Classify image
        </button>
        <button onclick="resetUI()">Reset</button>
      </div>
    </div>
  </div>

  <div class="card" id="result-wrap">
    <div class="card-title">Classification result</div>
    <div id="result-body"></div>
    <div style="margin-top:1.25rem;">
      <div class="card-title">All class scores</div>
      <div id="all-scores"></div>
    </div>
  </div>

  <div class="card" id="log-section">
    <div class="card-title">Session log</div>
    <div id="log-list"></div>
  </div>

</main>

<footer>Road Incident Classifier · SigLIP2 86M Fine-tuned · {{ model_ts }}</footer>

<script>
// injected from Python — order matches CLASSES list from classes.json
const CATS = {{ cats_json|safe }};
const THRESHOLD = {{ threshold }};
const log = [];
let b64 = null, mimeType = null;

function onDragOver(e)  { e.preventDefault(); document.getElementById("drop-zone").classList.add("over"); }
function onDragLeave()  { document.getElementById("drop-zone").classList.remove("over"); }
function onDrop(e) {
  e.preventDefault();
  document.getElementById("drop-zone").classList.remove("over");
  const f = e.dataTransfer.files[0];
  if (f) onFileChosen(f);
}
function onFileChosen(file) {
  if (!file || !file.type.startsWith("image/")) return;
  mimeType = file.type;
  const reader = new FileReader();
  reader.onload = ev => {
    b64 = ev.target.result.split(",")[1];
    document.getElementById("preview").src = ev.target.result;
    document.getElementById("preview-wrap").style.display = "block";
    document.getElementById("drop-zone").style.display    = "none";
    document.getElementById("result-wrap").style.display  = "none";
  };
  reader.readAsDataURL(file);
}
function resetUI() {
  b64 = null; mimeType = null;
  document.getElementById("preview-wrap").style.display = "none";
  document.getElementById("drop-zone").style.display    = "block";
  document.getElementById("result-wrap").style.display  = "none";
  document.getElementById("file-input").value = "";
}

async function runClassify() {
  if (!b64) return;
  const btn = document.getElementById("classify-btn");
  btn.disabled = true;
  btn.innerHTML = '<span class="spin"></span> Classifying…';
  document.getElementById("result-wrap").style.display = "block";
  document.getElementById("result-body").innerHTML =
    '<p style="color:#6b7280;font-size:13px;display:flex;align-items:center;gap:8px">' +
    '<span class="spin"></span> Running fine-tuned SigLIP2…</p>';

  try {
    const res  = await fetch("/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: b64, mime_type: mimeType }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    renderResult(data);
    addLog(data);
  } catch (err) {
    document.getElementById("result-body").innerHTML =
      `<p style="color:#c0392b;font-size:13px;">Error: ${err.message}</p>`;
  }
  btn.disabled = false;
  btn.innerHTML = "Classify image";
}

function renderResult(d) {
  const cat    = CATS[d.category_index];
  const conf   = d.confidence;
  const isIrr  = cat.key === "irrelevant";
  const needsR = d.needs_review;

  let extra = "";
  if (needsR && !isIrr)
    extra = `<div class="banner banner-review">⚠️ Confidence below ${Math.round(THRESHOLD*100)}% — routed to human review queue.</div>`;
  else if (isIrr)
    extra = `<div class="banner banner-reject">🚫 Image rejected — no ticket will be created.</div>`;

  document.getElementById("result-body").innerHTML = `
    <span class="cat-badge" style="background:${cat.color}18;color:${cat.color}">
      ${catIcon(cat.key)} ${cat.label}
    </span>
    <div class="conf-lbl">Confidence — ${conf}%</div>
    <div class="conf-track">
      <div class="conf-fill" style="width:${conf}%;background:${cat.color}"></div>
    </div>
    <div class="info-row"><span class="lbl">Department</span><span class="val">${cat.dept}</span></div>
    <div class="info-row"><span class="lbl">Action</span><span class="val">${cat.action}</span></div>
    <div class="info-row"><span class="lbl">Status</span><span class="val">
      ${needsR ? "⏳ Pending review" : isIrr ? "🚫 Rejected" : "✅ Auto-filed"}
    </span></div>
    ${extra}
  `;

  document.getElementById("all-scores").innerHTML = d.all_scores.map((s, i) => `
    <div class="score-item">
      <div class="score-meta"><span>${CATS[i].label}</span><span>${s}%</span></div>
      <div class="score-track">
        <div class="score-fill" style="width:${s}%;background:${CATS[i].color}"></div>
      </div>
    </div>
  `).join("");
}

function catIcon(key) {
  return { pothole:"🕳️", traffic:"🚗", accident:"🚨", irrelevant:"🚫" }[key] || "❓";
}

function addLog(d) {
  const cat    = CATS[d.category_index];
  const isIrr  = cat.key === "irrelevant";
  const needsR = d.needs_review;
  const pc     = isIrr ? "pill-reject" : needsR ? "pill-review" : "pill-ok";
  const pt     = isIrr ? "Rejected"   : needsR ? "Review"      : "Filed";
  log.unshift({ cat, conf: d.confidence, time: new Date().toLocaleTimeString(), pc, pt });
  document.getElementById("log-section").style.display = "block";
  document.getElementById("log-list").innerHTML = log.slice(0, 8).map(l => `
    <div class="log-row">
      <span><span class="dot" style="background:${l.cat.color}"></span>${l.cat.label}</span>
      <span style="display:flex;align-items:center;gap:8px">
        <span style="font-size:12px;color:#6b7280">${l.conf}%</span>
        <span class="pill ${l.pc}">${l.pt}</span>
        <span style="font-size:12px;color:#6b7280">${l.time}</span>
      </span>
    </div>`).join("");
}

// attach file input listener to avoid relying on inline handlers
try {
  document.getElementById("file-input").addEventListener("change", (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) onFileChosen(f);
  });
} catch (e) {
  // defensive: if DOM isn't ready or script blocked, ignore silently
}
</script>
</body>
</html>"""


@app.route("/")
def index():
    import json as _json
    return render_template_string(
        HTML,
        cats_json=_json.dumps(CATEGORIES),
        threshold=CONFIDENCE_THRESHOLD,
        cv_acc=CV_ACC,
        cv_std=CV_STD,
        model_ts=MODEL_TS,
    )


@app.route("/classify", methods=["POST"])
def classify_route():
    data    = request.get_json(force=True)
    b64_str = data.get("image", "")
    try:
        img_bytes = base64.b64decode(b64_str)
        image     = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    except Exception as e:
        return jsonify({"error": f"Could not decode image: {e}"}), 400
    try:
        result = classify(image)
    except Exception as e:
        return jsonify({"error": f"Model error: {e}"}), 500
    return jsonify(result)


@app.route("/health")
def health():
    return jsonify({
        "status": "ok",
        "device": DEVICE,
        "classes": CLASSES,
        "cv_mean_acc": CV_ACC,
    })


if __name__ == "__main__":
    print(f"\n  → http://localhost:5000\n")
    app.run(host="0.0.0.0", port=5000, debug=False)