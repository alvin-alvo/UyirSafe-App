package handler

import "strings"

// Canonical hazard types — must match backend/ai_model/classes.json.
const (
	TypeAccident   = "accident"
	TypePothole    = "pothole"
	TypeTraffic    = "traffic"
	TypeIrrelevant = "irrelevant"
)

// Duplicate-search radii (meters) per workflow doc.
const (
	PotholeRadiusMeters  = 20.0
	AccidentRadiusMeters = 50.0
	TrafficRadiusMeters  = 200.0
	// Common reporting workflow: generic nearby search before the type is
	// known. Keeps the previous 500m behaviour.
	DefaultRadiusMeters = 500.0
)

// Accident duplicate time window (minutes) — flowchart: "Existing accident
// within 30 min?".
const AccidentTimeWindowMinutes = 30

// Support-count thresholds for government-dashboard visibility.
// Pothole >= 5 (Public Works Dept), Traffic >= 3 (Traffic Dept).
// Accidents are forwarded immediately irrespective of support count.
const (
	PotholeVisibleThreshold = 5
	TrafficVisibleThreshold = 3
)

// Per-user active-report quotas ("Recommended Limits For The User").
// Road Accident: unlimited (-1). Pothole: 5. Traffic: 3.
// Active = status Pending or Needs Review (i.e. not Resolved/Rejected).
const (
	MaxActivePothole = 5
	MaxActiveTraffic = 3
)

// NormalizeType maps legacy/frontend variants to canonical types.
func NormalizeType(t string) string {
	switch strings.ToLower(strings.TrimSpace(t)) {
	case "accident", "accidents", "acccident", "acccidents", "road accident":
		return TypeAccident
	case "pothole", "potholes", "pothhole", "pothholes":
		return TypePothole
	case "traffic", "traffic jam", "traffic congestion", "congestion":
		return TypeTraffic
	case "irrelevant", "others", "other", "unknown", "":
		if strings.TrimSpace(t) == "" {
			return ""
		}
		return TypeIrrelevant
	default:
		return strings.ToLower(strings.TrimSpace(t))
	}
}

// RadiusForType returns the duplicate-search radius for a report type.
func RadiusForType(reportType string) float64 {
	switch NormalizeType(reportType) {
	case TypePothole:
		return PotholeRadiusMeters
	case TypeAccident:
		return AccidentRadiusMeters
	case TypeTraffic:
		return TrafficRadiusMeters
	default:
		return DefaultRadiusMeters
	}
}

// MaxActiveForType returns the per-user active-report quota, or -1 for
// unlimited (accidents — emergency events must never be quota-blocked).
func MaxActiveForType(reportType string) int {
	switch NormalizeType(reportType) {
	case TypePothole:
		return MaxActivePothole
	case TypeTraffic:
		return MaxActiveTraffic
	case TypeAccident:
		return -1
	default:
		return -1
	}
}

// IsVisibleToAuthority reports whether a report has enough support to be
// shown on the government dashboard. Accidents are always visible.
func IsVisibleToAuthority(reportType string, supportCount int) bool {
	switch NormalizeType(reportType) {
	case TypeAccident:
		return true
	case TypePothole:
		return supportCount >= PotholeVisibleThreshold
	case TypeTraffic:
		return supportCount >= TrafficVisibleThreshold
	default:
		return true
	}
}
