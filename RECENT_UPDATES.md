# Recent Updates — SigLIP2 migration + Needs Review flow

Date: 2026-09-12
Scope: backend migration + frontend alignment (see section 4).

## 1. What changed (backend)

### 1.1 AI model migrated: Teachable/MobileNetV2 → SigLIP2 (`backend/ai_model/`)
- New current service: `backend/ai_model/model.py` — fine-tuned
  `google/siglip2-base-patch16-256` + `best_model.pt` (Flask on `:5000`).
- Classes are now `accident / irrelevant / pothole / traffic`
  (`backend/ai_model/classes.json`). Note the renames vs the old model:
  `others` → `irrelevant`, `potholes` (plural) → `pothole` (singular).
- Confidence threshold `0.70` lives in the model service
  (`model.py: CONFIDENCE_THRESHOLD`). Below it the model returns
  `needs_review: true` instead of auto-rejecting `irrelevant`.
- `POST /classify` takes JSON `{"image": "<base64>"}` and returns
  `{category_index, category{key,label,dept,action}, confidence (0-100),
  all_scores (0-100), needs_review}`. `GET /health` for checks.
- Hardening: `model.py` paths now resolve from `Path(__file__).parent`,
  so the service can start from any cwd. `Requirements.txt` now includes
  the missing `torchvision` dependency.
- Docs: `backend/ai_model/README.md` (run + API contract).

### 1.2 Go backend calls SigLIP2, Teachable removed
- New: `backend/AI/siglip.go` — `ClassifyWithSigLIP()` base64-encodes the
  upload and POSTs to `http://localhost:5000/classify`
  (override with `AI_MODEL_URL` / `AI_CLASSIFY_URL`). Normalizes confidence
  0–100 → 0–1 to keep the old API contract.
- `backend/AI/aiHandler.go` — `POST /api/ai/detect` (route unchanged)
  now uses SigLIP2. Response keeps old fields and adds new ones:
  `{message, hazardType, confidence (0-1), status, threshold,
  needs_review, all_scores, department, action}`.
  Status rule: `needs_review` → `"Needs Review"`;
  else high-confidence `irrelevant` → `"Rejected"`; else `"Accepted"`.
  Temp uploads are now cleaned up (`CleanUpTempFile`).
- Deleted: `backend/AI/teachable.go` (external TeachableMachine URL,
  `ClassifyWithTeachableMachine`). No functional Teachable references
  remain in `backend/`.

### 1.3 Old `backend/imageclass/` deprecated
- Added `backend/imageclass/DEPRECATED.md`. That folder (MobileNetV2 +
  `uyir.pth`, Gradio `:7860` `/classify_image`, interim `app.py` Flask
  `:7861` `/predict`) is legacy — do not build on it.
- Note: `app.py` / `gui.py` threshold helpers from the previous step are
  still there for reference but are superseded by `ai_model`.

### 1.4 New route for the review queue
- `GET /reports/needs-review/` → `GetNeedsReviewReports`
  (`backend/handler/getAllReports.go`, registered in `backend/main.go`).
  Returns `{data: [...]}` with full `Report` rows
  (`id, uid, latitude, longitude, location, date, status, file, type`)
  where `status = "Needs Review"` — same shape as `/reports/pending/`.
- `/reports/pending/` intentionally still returns only `Pending`.
- `POST /reports/updateStatus` already works for both (sets `Resolved`
  regardless of prior status).

### 1.5 Run instructions (current stack)
```powershell
cd backend/ai_model
pip install -r Requirements.txt
python model.py          # -> http://localhost:5000

cd backend
go run main.go           # -> http://localhost:6969
```
Optional: `$env:AI_MODEL_URL="http://localhost:5000/classify"` before `go run`.

## 2. What the frontend must update

1. **Stop calling Gradio `:7860` directly** (`uyir/src/pages/NewReport.jsx:77,144`).
   `Client.connect("http://127.0.0.1:7860")` + `predict("/classify_image")`
   hits the deprecated `imageclass` service. Call instead:
   - Option A (recommended): `POST http://localhost:6969/api/ai/detect`
     (multipart `image`) → `{hazardType, confidence (0-1), status,
     needs_review, all_scores, department, action}`.
   - Option B: `POST http://localhost:5000/classify`
     (JSON `{"image": base64}`) → `{category.key, confidence (0-100),
     needs_review, ...}`.
2. **Rename report types** (`NewReport.jsx:38,442`).
   Old list `["accident","others","potholes","traffic"]` must become
   `["accident","irrelevant","pothole","traffic"]` to match `classes.json`
   and the `type` values the backend now stores/queries.
3. **Remove TeachableMachine client code**
   (`uyir/src/components/ReportTypeSelection.jsx:2,12-15,26`).
   It loads `tm-model/8N2NXMoJ8` from Google storage — dead path since
   `teachable.go` was deleted. Replace with the backend API above, then
   drop the `@teachablemachine/image` dependency (`package.json`) and the
   `@gradio/client` dependency if nothing else uses it.
4. **Fix `AIDetector.jsx:19`.** It posts to
   `http://localhost:8080/api/ai/detect` — wrong port (backend is `:6969`).
   Point to `:6969` and render the new fields: `status`, `needs_review`,
   `department`, `action` (currently only shows `hazardType/confidence`).
5. **Add a "Needs Review" section in the admin UI.**
   Fetch `GET http://localhost:6969/reports/needs-review/` and render it
   separately from `GET /reports/pending/` (same `{data:[...]}` shape,
   each row has `latitude/longitude/location/type/date/status`).
   `ReportsPage.jsx` already sorts/filters `"Needs Review"` — reuse that.
6. **Allow resolving from the review queue** (`UpdateCard.jsx:8,50`).
   The Resolve button only renders for `status === "Pending"`. Extend it to
   `"Needs Review"` (backend `updateStatus` already accepts it).

## 4. Frontend alignment (done 2026-09-12)

- `uyir/src/pages/NewReport.jsx` — removed `@gradio/client` import and the
  `:7860` `/classify_image` call; file uploads now classify via
  `POST http://localhost:6969/api/ai/detect` (multipart `image`).
  `reportTypes` renamed to `["accident","irrelevant","pothole","traffic"]`.
- `uyir/src/components/ReportTypeSelection.jsx` — TeachableMachine client
  (`tmImage.load` from Google storage) replaced with the same
  `/api/ai/detect` call; type list aligned to canonical classes.
- `uyir/src/components/AIDetector.jsx` — endpoint fixed
  `:8080` → `:6969`; result view now also renders `status`, `department`,
  `action`.
- `uyir/src/pages/AdminPage.jsx` — new full-width **Needs Review** section
  fed by `GET /reports/needs-review/` (own loading/empty states, review
  count in header, Refresh reloads both queues).
- `uyir/src/pages/UpdateCard.jsx` — Resolve button now shows for both
  `Pending` and `Needs Review` (was `Pending` only).
- `uyir/package.json` (+ lockfile) — dropped `@teachablemachine/image`
  and `@gradio/client`. `npm run build` passes.

## 5. Known issues left for follow-up (not changed)
- Role feeds still use old type strings with typos:
  `getAllReports.go` queries `"acccidents"` / `"pothholes"` /
  `"traffic jam"`, and `updateStatus.go` points map uses the same keys —
  so `/reports/hospitals`, `/police`, `/pwd` return empty and
  accident/pothole resolutions award 0 points. Needs a decision on
  canonical type strings (`accident/pothole/traffic`) before fixing.
- No auth on `/reports/*` routes (`User.Role` unused); `uploads/` is not
  statically served (stored `file` paths aren't viewable via API);
  `Report.Level` is never set.
