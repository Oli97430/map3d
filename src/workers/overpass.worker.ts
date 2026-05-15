/// <reference lib="webworker" />

import type {
  OverpassResponse,
  Building,
  RoadFeature,
  WaterFeature,
  ParkFeature,
} from "@/types/overpass";

type Kind = "buildings" | "roads" | "water" | "parks";

interface WorkerMessage {
  kind: Kind;
  payload: OverpassResponse;
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { kind, payload } = e.data;
  const elementToLatLng = (geom?: { lat: number; lon: number }[]) =>
    geom?.map((p) => ({ lat: p.lat, lng: p.lon })) ?? [];

  switch (kind) {
    case "buildings": {
      const result: Building[] = payload.elements
        .filter((e) => e.tags?.building)
        .map((e) => ({
          id: e.id,
          tags: e.tags,
          geometry: elementToLatLng(e.geometry),
        }));
      postMessage(result);
      break;
    }
    case "roads": {
      const result: RoadFeature[] = payload.elements
        .filter((e) => e.geometry && e.geometry.length >= 2)
        .map((e) => ({
          id: e.id,
          tags: e.tags ?? {},
          geometry: elementToLatLng(e.geometry),
        }));
      postMessage(result);
      break;
    }
    case "water": {
      const result: WaterFeature[] = payload.elements
        .filter((e) => e.geometry && e.geometry.length >= 3)
        .map((e) => ({
          id: e.id,
          tags: e.tags ?? {},
          geometry: elementToLatLng(e.geometry),
        }));
      postMessage(result);
      break;
    }
    case "parks": {
      const result: ParkFeature[] = payload.elements
        .filter((e) => e.geometry && e.geometry.length >= 3)
        .map((e) => ({
          id: e.id,
          tags: e.tags ?? {},
          geometry: elementToLatLng(e.geometry),
        }));
      postMessage(result);
      break;
    }
  }
};

export {}; // make it a module
