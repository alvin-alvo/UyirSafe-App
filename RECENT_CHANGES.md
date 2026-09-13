# Recent Changes — Reporting Workflows (Pilot Review Fixes)

Date: 2026-09-13
Goal: align the backend with the 4 approved workflows (Common, Pothole, Accident, Traffic) + the "Needs Review" improvement.

## TL;DR
- Duplicate check now uses the correct radius per type: pothole 20m, accident 50m (+ 30-min window), traffic 200m.
- Accidents go to authorities immediately (no support needed, no quota limit).
- Potholes need 5 supports to appear on the PWD dashboard. Traffic needs 3 supports for the police dashboard.
- Each user is limited to 5 active pothole and 3 active traffic reports. Accidents are unlimited.
- Low-confidence AI results create a "Needs Review" report instead of rejecting it. Only high-confidence "irrelevant" is rejected.
- Photos go to MinIO (`uyir-reports` bucket, defaults to `localhost:9000`), with local `uploads/` as fallback if MinIO is down. Note: reports submitted before this fix went to local `uploads/` only, because MinIO was opt-in via `MINIO_ENDPOINT` — that env is now optional.
- Fixed wrong report-type spellings that made hospital/police/PWD feeds return empty.

## What changed (by area)

### 1. Common reporting workflow
- `backend/handler/workflow.go` (new): single place for radii, thresholds, quotas, and canonical types (`accident / pothole / traffic / irrelevant`).
- `POST /similarReports`: accepts optional `type`, searches only unresolved reports (`Pending` + `Needs Review`), filters by type when given.
- `POST /reports/support` (new, `backend/handler/support.go`): "support existing instead of duplicate". One support per user (tracked in new `report_supports` table), increments `support_count`, returns whether the report is now visible to authorities.

### 2. Pothole workflow (20m, 5 supports → PWD)
- Duplicate radius fixed to 20m.
- `GET /reports/pwd` now returns only `type=pothole, status=Pending, support_count >= 5`.
- Quota: max 5 active pothole reports per user (`429` if exceeded).

### 3. Accident workflow (50m + 30 min, immediate forwarding)
- Duplicate radius fixed to 50m + only reports from the last 30 minutes count.
- `GET /reports/hospitals` and `GET /reports/police` return pending accidents immediately, regardless of support count.
- Quota: accidents are unlimited (emergency events are never blocked).
- `POST /new` returns `"forwarded": true` for pending accidents.

### 4. Traffic workflow (200m, 3 supports → Traffic Dept)
- Duplicate radius fixed to 200m.
- `GET /reports/police` includes traffic only when `support_count >= 3`.
- Quota: max 3 active traffic reports per user (`429` if exceeded).

### 5. AI "Needs Review" (confidence < 70%)
- `POST /new` now classifies server-side:
  - AI unreachable or confidence < 70% → report created with `status = "Needs Review"` (shows in `GET /reports/needs-review/`).
  - High-confidence `irrelevant` → `422`, no record created (`status = "Rejected"`).
  - Otherwise → `status = "Pending"` with the AI label.
- This matches the existing `POST /api/ai/detect` rule, so the review queue actually gets filled.

### 6. Image storage (MinIO)
- `backend/storage/minio.go` (new): uploads to MinIO bucket `uyir-reports` when `MINIO_ENDPOINT` is set; otherwise keeps local `uploads/`.
- `backend/docker-compose.yaml`: added `minio` service, removed obsolete `version` key, switched to pull-safe images (`quay.io/minio/minio:latest`, `docker.io/library/postgres:16-alpine`).

### 7. Bug fixes
- Fixed type typos: `"acccidents"` → `"accident"`, `"pothholes"` → `"pothole"`, `"traffic jam"` → `"traffic"` in role feeds. Old spellings still award points via normalization.
- `Report` model: added `support_count` (default 1, creator auto-supports) + `ReportSupport` table with auto-migration.

## New / changed API surface
| Endpoint | Change |
|---|---|
| `POST /new` | Quota check, server AI status, MinIO upload, returns `status, needs_review, support_count, visible, forwarded` |
| `POST /similarReports` | Optional `type`, per-type radius + accident time window |
| `POST /reports/support` | New — `{id}` + session cookie → increments support |
| `GET /reports/pwd` | Pothole + `support_count >= 5` only |
| `GET /reports/police` | Accidents (all) + traffic (`>= 3`) |
| `GET /reports/hospitals` | Pending accidents only |
| `GET /reports/needs-review/` | Unchanged (now actually populated by `/new`) |

## How to run (pilot, single VM)
```powershell
cd backend
podman compose up -d        # postgres :5432, minio :9000/:9001
cd ai_model
pip install -r Requirements.txt
python model.py             # -> http://localhost:5000
cd ..
go run main.go              # -> http://localhost:6969
```
Optional: `$env:MINIO_ENDPOINT="localhost:9000"` to store photos in MinIO. Without it, photos stay in `backend/uploads/`.

## Files touched
- New: `backend/handler/workflow.go`, `backend/handler/support.go`, `backend/storage/minio.go`
- Edited: `backend/model/User.go`, `backend/handler/newReport.go`, `backend/handler/SimilarReport.go`, `backend/handler/getAllReports.go`, `backend/handler/updateStatus.go`, `backend/main.go`, `backend/docker-compose.yaml`, `backend/go.mod`
