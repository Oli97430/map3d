import * as THREE from "three";
import { SCENE_SCALE } from "@/config/constants";
import type { LatLng } from "@/types/overpass";

/**
 * Equirectangular projection of (lat, lng) onto a local 2D plane centered
 * on (refLat, refLng), scaled by `SCENE_SCALE`.
 *
 * X grows east, Y grows north. Caller is responsible for the Y → Z swap
 * if exporting to a Y-up scene.
 */
export function project(
  lat: number,
  lng: number,
  refLat: number,
  refLng: number
): THREE.Vector2 {
  const x = (lng - refLng) * SCENE_SCALE * Math.cos((refLat * Math.PI) / 180);
  const y = (lat - refLat) * SCENE_SCALE;
  return new THREE.Vector2(x, y);
}

/** Mean of two corner LatLngs. */
export function midPoint(a: LatLng, b: LatLng): LatLng {
  return { lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2 };
}

/** Approximate area of a rectangle in km². */
export function rectangleAreaKm2(northEast: LatLng, southWest: LatLng): number {
  const dLat = Math.abs(northEast.lat - southWest.lat);
  const dLng = Math.abs(northEast.lng - southWest.lng);
  const meanLat = (northEast.lat + southWest.lat) / 2;
  return dLat * dLng * 111 * 111 * Math.cos((meanLat * Math.PI) / 180);
}

/** Returns true when the bbox spans more than `threshold` degrees in lat+lng. */
export function isLargeArea(
  northEast: LatLng,
  southWest: LatLng,
  threshold = 0.1
): boolean {
  return (
    Math.abs(northEast.lat - southWest.lat) +
      Math.abs(northEast.lng - southWest.lng) >
    threshold
  );
}
