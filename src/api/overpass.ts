import { OVERPASS_API, OVERPASS_TIMEOUT_MS } from "@/config/constants";
import { fetchWithRetry } from "@/utils/fetchWithRetry";
import type {
  Building,
  LatLng,
  OverpassElement,
  OverpassResponse,
  ParkFeature,
  RoadFeature,
  WaterFeature,
} from "@/types/overpass";

export interface BBox {
  south: number;
  west: number;
  north: number;
  east: number;
}

function bboxFromCorners(ne: LatLng, sw: LatLng): BBox {
  return { south: sw.lat, west: sw.lng, north: ne.lat, east: ne.lng };
}

function elementToLatLng(e: OverpassElement): LatLng[] {
  return e.geometry?.map((pt) => ({ lat: pt.lat, lng: pt.lon })) ?? [];
}

async function queryOverpass(
  query: string,
  signal?: AbortSignal
): Promise<OverpassResponse> {
  const res = await fetchWithRetry(OVERPASS_API, {
    method: "POST",
    body: query,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    timeout: OVERPASS_TIMEOUT_MS,
    signal,
  });
  if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);
  return res.json();
}

// ─── Public queries ─────────────────────────────────────────────────────

export async function fetchBuildings(
  ne: LatLng,
  sw: LatLng,
  signal?: AbortSignal
): Promise<Building[]> {
  const { south, west, north, east } = bboxFromCorners(ne, sw);
  const query =
    `[out:json][timeout:25];` +
    `(way["building"](${south},${west},${north},${east});` +
    `relation["building"](${south},${west},${north},${east}););` +
    `out body geom;`;
  const data = await queryOverpass(query, signal);
  return data.elements
    .filter((e) => e.tags?.building)
    .map((e) => ({
      id: e.id,
      tags: e.tags,
      geometry: elementToLatLng(e),
    }));
}

export async function fetchRoads(
  ne: LatLng,
  sw: LatLng,
  signal?: AbortSignal
): Promise<RoadFeature[]> {
  const { south, west, north, east } = bboxFromCorners(ne, sw);
  const query =
    `[out:json][timeout:25];` +
    `(way["highway"](${south},${west},${north},${east}););out body geom;`;
  const data = await queryOverpass(query, signal);
  return data.elements
    .filter((e) => e.geometry && e.geometry.length >= 2)
    .map((e) => ({
      id: e.id,
      tags: e.tags ?? {},
      geometry: elementToLatLng(e),
    }));
}

export async function fetchWater(
  ne: LatLng,
  sw: LatLng,
  signal?: AbortSignal
): Promise<WaterFeature[]> {
  const { south, west, north, east } = bboxFromCorners(ne, sw);
  const query =
    `[out:json][timeout:25];` +
    `(way["natural"="water"](${south},${west},${north},${east});` +
    `relation["natural"="water"](${south},${west},${north},${east});` +
    `way["waterway"](${south},${west},${north},${east}););` +
    `out body geom;`;
  const data = await queryOverpass(query, signal);
  return data.elements
    .filter((e) => e.geometry && e.geometry.length >= 3)
    .map((e) => ({
      id: e.id,
      tags: e.tags ?? {},
      geometry: elementToLatLng(e),
    }));
}

export async function fetchParks(
  ne: LatLng,
  sw: LatLng,
  signal?: AbortSignal
): Promise<ParkFeature[]> {
  const { south, west, north, east } = bboxFromCorners(ne, sw);
  const query =
    `[out:json][timeout:25];` +
    `(way["leisure"="park"](${south},${west},${north},${east});` +
    `way["leisure"="garden"](${south},${west},${north},${east});` +
    `way["landuse"="grass"](${south},${west},${north},${east});` +
    `way["landuse"="forest"](${south},${west},${north},${east}););` +
    `out body geom;`;
  const data = await queryOverpass(query, signal);
  return data.elements
    .filter((e) => e.geometry && e.geometry.length >= 3)
    .map((e) => ({
      id: e.id,
      tags: e.tags ?? {},
      geometry: elementToLatLng(e),
    }));
}

// ─── NEW: trees (natural=tree nodes) ──────────────────────────────────
export interface TreePoint {
  id: number;
  lat: number;
  lng: number;
}
export async function fetchTreePoints(
  ne: LatLng,
  sw: LatLng,
  signal?: AbortSignal
): Promise<TreePoint[]> {
  const { south, west, north, east } = bboxFromCorners(ne, sw);
  const query =
    `[out:json][timeout:25];` +
    `(node["natural"="tree"](${south},${west},${north},${east}););` +
    `out body;`;
  const data = await queryOverpass(query, signal);
  return data.elements
    .filter((e) => typeof (e as any).lat === "number")
    .map((e) => ({
      id: e.id,
      lat: (e as any).lat,
      lng: (e as any).lon,
    }));
}

// ─── NEW: crosswalks (highway=crossing nodes) ─────────────────────────
export interface CrosswalkPoint {
  id: number;
  lat: number;
  lng: number;
}
export async function fetchCrosswalks(
  ne: LatLng,
  sw: LatLng,
  signal?: AbortSignal
): Promise<CrosswalkPoint[]> {
  const { south, west, north, east } = bboxFromCorners(ne, sw);
  const query =
    `[out:json][timeout:25];` +
    `(node["highway"="crossing"](${south},${west},${north},${east}););` +
    `out body;`;
  const data = await queryOverpass(query, signal);
  return data.elements
    .filter((e) => typeof (e as any).lat === "number")
    .map((e) => ({
      id: e.id,
      lat: (e as any).lat,
      lng: (e as any).lon,
    }));
}

// ─── NEW: power lines + pylons ────────────────────────────────────────
export interface PowerLine {
  id: number;
  geometry: LatLng[];
}
export interface PowerTower {
  id: number;
  lat: number;
  lng: number;
}
export async function fetchPower(
  ne: LatLng,
  sw: LatLng,
  signal?: AbortSignal
): Promise<{ lines: PowerLine[]; towers: PowerTower[] }> {
  const { south, west, north, east } = bboxFromCorners(ne, sw);
  const query =
    `[out:json][timeout:25];` +
    `(way["power"="line"](${south},${west},${north},${east});` +
    `node["power"="tower"](${south},${west},${north},${east});` +
    `node["power"="pole"](${south},${west},${north},${east}););` +
    `out body geom;`;
  const data = await queryOverpass(query, signal);
  const lines: PowerLine[] = [];
  const towers: PowerTower[] = [];
  data.elements.forEach((e) => {
    if (e.type === "way" && e.geometry) {
      lines.push({ id: e.id, geometry: elementToLatLng(e) });
    } else if (e.type === "node" && typeof (e as any).lat === "number") {
      towers.push({ id: e.id, lat: (e as any).lat, lng: (e as any).lon });
    }
  });
  return { lines, towers };
}

// ─── Helper: identify if road is a bridge / tunnel ────────────────────
export function isBridge(road: RoadFeature): boolean {
  return road.tags.bridge === "yes" || (road.tags as any).bridge === "viaduct";
}
export function isTunnel(road: RoadFeature): boolean {
  return road.tags.tunnel === "yes";
}
