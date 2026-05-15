// ─── Map / geo constants ────────────────────────────────────────────────

/** Scale factor for projecting lat/lng to scene units. */
export const SCENE_SCALE = 51000;

/** Default map center (NYC). */
export const DEFAULT_CENTER: [number, number] = [40.8, -73.95];

/** Default zoom level. */
export const DEFAULT_ZOOM = 13;

/** Large area threshold in degrees (lat+lng sum). Above this, warn the user. */
export const LARGE_AREA_THRESHOLD = 0.1;

// ─── API endpoints ──────────────────────────────────────────────────────

export const OVERPASS_API = "https://overpass-api.de/api/interpreter";
export const NOMINATIM_API = "https://nominatim.openstreetmap.org/search";

/** Request timeouts (ms). */
export const OVERPASS_TIMEOUT_MS = 30_000;
export const NOMINATIM_TIMEOUT_MS = 10_000;

/** Max retry attempts on network failure. */
export const MAX_RETRY = 2;

// ─── 3D scene defaults ──────────────────────────────────────────────────

/** Default building height when OSM data missing. */
export const DEFAULT_BUILDING_HEIGHT = 10;
/** Approx meters per OSM "level". */
export const METERS_PER_LEVEL = 3.0;

/** Vertical scale tweak applied to all extrusions. */
export const HEIGHT_SCALE = 1;

// ─── UI ─────────────────────────────────────────────────────────────────

export const TOP_NAV_HEIGHT_REM = 3.25;

/** Toast auto-dismiss (ms). */
export const TOAST_DURATION_MS = 3500;
