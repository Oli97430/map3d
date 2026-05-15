/**
 * Encode/decode the current map view into the URL hash so users can share links.
 * Format: #lat=40.8&lng=-73.95&z=13
 */

export interface ViewState {
  lat: number;
  lng: number;
  zoom: number;
}

export function readViewState(): ViewState | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  const lat = parseFloat(params.get("lat") ?? "");
  const lng = parseFloat(params.get("lng") ?? "");
  const zoom = parseFloat(params.get("z") ?? "");
  if (Number.isFinite(lat) && Number.isFinite(lng) && Number.isFinite(zoom)) {
    return { lat, lng, zoom };
  }
  return null;
}

export function writeViewState(state: ViewState): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams();
  params.set("lat", state.lat.toFixed(4));
  params.set("lng", state.lng.toFixed(4));
  params.set("z", String(Math.round(state.zoom)));
  // Replace without scrolling
  const newUrl = `${window.location.pathname}${window.location.search}#${params.toString()}`;
  window.history.replaceState(null, "", newUrl);
}
