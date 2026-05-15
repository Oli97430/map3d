// ─── OpenStreetMap / Overpass types ─────────────────────────────────────

export interface OverpassGeometry {
  lat: number;
  lon: number;
}

export interface OverpassTags {
  [key: string]: string | undefined;
  building?: string;
  height?: string;
  "building:levels"?: string;
  name?: string;
  highway?: string;
  natural?: string;
  leisure?: string;
  waterway?: string;
  amenity?: string;
  denomination?: string;
  "addr:street"?: string;
  "addr:housenumber"?: string;
  "addr:district"?: string;
  "addr:city"?: string;
  "addr:postcode"?: string;
}

export interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  tags: OverpassTags;
  geometry?: OverpassGeometry[];
  nodes?: number[];
}

export interface OverpassResponse {
  version: number;
  generator: string;
  elements: OverpassElement[];
}

// ─── App-level types ────────────────────────────────────────────────────

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Building {
  id: number;
  tags: OverpassTags;
  geometry?: LatLng[];
}

export interface RoadFeature {
  id: number;
  tags: OverpassTags;
  geometry: LatLng[];
}

export interface WaterFeature {
  id: number;
  tags: OverpassTags;
  geometry: LatLng[];
}

export interface ParkFeature {
  id: number;
  tags: OverpassTags;
  geometry: LatLng[];
}

// ─── Building type classification ───────────────────────────────────────

export type BuildingCategory =
  | "residential"
  | "commercial"
  | "industrial"
  | "religious"
  | "education"
  | "civic"
  | "other";

export function classifyBuilding(tags: OverpassTags): BuildingCategory {
  const t = tags.building?.toLowerCase() || "";
  if (
    [
      "residential",
      "house",
      "apartments",
      "detached",
      "terrace",
      "dormitory",
      "bungalow",
    ].includes(t)
  )
    return "residential";
  if (
    [
      "commercial",
      "retail",
      "office",
      "supermarket",
      "hotel",
      "shop",
      "kiosk",
      "warehouse",
    ].includes(t)
  )
    return "commercial";
  if (["industrial", "factory", "manufacture"].includes(t)) return "industrial";
  if (
    [
      "church",
      "mosque",
      "synagogue",
      "temple",
      "cathedral",
      "chapel",
      "religious",
    ].includes(t)
  )
    return "religious";
  if (["school", "university", "college", "kindergarten"].includes(t))
    return "education";
  if (
    [
      "civic",
      "government",
      "public",
      "hospital",
      "fire_station",
      "train_station",
    ].includes(t)
  )
    return "civic";
  return "other";
}
