import { NOMINATIM_API, NOMINATIM_TIMEOUT_MS } from "@/config/constants";
import { fetchWithRetry } from "@/utils/fetchWithRetry";

export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  boundingbox: [string, string, string, string]; // [south, north, west, east]
  type?: string;
  importance?: number;
}

/**
 * Geocoding search via OpenStreetMap Nominatim.
 * Public usage requires a descriptive User-Agent: we rely on Referer being sent by the browser.
 */
export async function searchAddress(
  query: string,
  signal?: AbortSignal,
  limit = 5
): Promise<NominatimResult[]> {
  if (!query.trim()) return [];
  const url = new URL(NOMINATIM_API);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("addressdetails", "0");
  const res = await fetchWithRetry(url.toString(), {
    timeout: NOMINATIM_TIMEOUT_MS,
    signal,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);
  return res.json();
}
