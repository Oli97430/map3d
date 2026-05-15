import type { LatLng } from "@/types/overpass";

/**
 * Build a GeoJSON FeatureCollection describing the current bounding box.
 */
export function bboxToGeoJSON(
  ne: LatLng,
  sw: LatLng,
  metadata: Record<string, unknown> = {}
) {
  const ring = [
    [sw.lng, sw.lat],
    [ne.lng, sw.lat],
    [ne.lng, ne.lat],
    [sw.lng, ne.lat],
    [sw.lng, sw.lat],
  ];
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Polygon", coordinates: [ring] },
        properties: { source: "map3d", ...metadata },
      },
    ],
  };
}

export function downloadGeoJSON(
  ne: LatLng,
  sw: LatLng,
  filename = "map3d-bbox.geojson"
) {
  const json = JSON.stringify(bboxToGeoJSON(ne, sw), null, 2);
  const blob = new Blob([json], { type: "application/geo+json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
