import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { project } from "@/utils/geo";
import { fetchRoads } from "@/api/overpass";
import { useSceneStore } from "@/state/sceneStore";
import type { LatLng, RoadFeature } from "@/types/overpass";

// Width per highway type (meters)
const ROAD_WIDTH: Record<string, number> = {
  motorway: 12,
  trunk: 10,
  primary: 8,
  secondary: 6.5,
  tertiary: 5.5,
  residential: 4.5,
  living_street: 4,
  service: 3.5,
  unclassified: 4,
  footway: 1.6,
  path: 1.2,
  cycleway: 1.6,
  pedestrian: 4,
  default: 4,
};

function widthFor(type?: string): number {
  if (!type) return ROAD_WIDTH.default;
  return ROAD_WIDTH[type] ?? ROAD_WIDTH.default;
}

function buildRibbonGeometry(
  points: THREE.Vector2[],
  width: number
): THREE.BufferGeometry {
  // Build a 2D ribbon (triangle strip) along the polyline, lifted slightly above ground
  const verts: number[] = [];
  const indices: number[] = [];
  const half = width / 2;
  const y = 0.05;

  for (let i = 0; i < points.length; i++) {
    const cur = points[i];
    const prev = points[i - 1] ?? cur;
    const next = points[i + 1] ?? cur;
    const dir = new THREE.Vector2().subVectors(next, prev);
    if (dir.lengthSq() === 0) dir.set(1, 0);
    dir.normalize();
    const normal = new THREE.Vector2(-dir.y, dir.x);
    const left = new THREE.Vector2().addVectors(
      cur,
      normal.clone().multiplyScalar(half)
    );
    const right = new THREE.Vector2().addVectors(
      cur,
      normal.clone().multiplyScalar(-half)
    );
    verts.push(left.x, y, -left.y, right.x, y, -right.y);
    if (i < points.length - 1) {
      const base = i * 2;
      indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export function Roads({
  corners,
  ref,
}: {
  corners: LatLng[] | undefined;
  ref: { lat: number; lng: number };
}) {
  const show = useSceneStore((s) => s.showRoads);
  const timeOfDay = useSceneStore((s) => s.timeOfDay);
  const isNight = timeOfDay === "night";
  const [roads, setRoads] = useState<RoadFeature[]>([]);

  useEffect(() => {
    if (!show || !corners || corners.length < 2) return;
    const ctrl = new AbortController();
    fetchRoads(corners[0], corners[1], ctrl.signal)
      .then((data) => setRoads(data))
      .catch((e) => {
        if (e?.name !== "AbortError")
          // eslint-disable-next-line no-console
          console.warn("Roads fetch failed:", e);
      });
    return () => ctrl.abort();
  }, [show, corners]);

  const geometries = useMemo(() => {
    return roads
      .map((road) => {
        const pts = road.geometry.map((p) =>
          project(p.lat, p.lng, ref.lat, ref.lng)
        );
        if (pts.length < 2) return null;
        const width = widthFor(road.tags.highway);
        return {
          id: road.id,
          geometry: buildRibbonGeometry(pts, width),
        };
      })
      .filter((x): x is { id: number; geometry: THREE.BufferGeometry } => !!x);
  }, [roads, ref.lat, ref.lng]);

  if (!show) return null;

  return (
    <group userData={{ exportToGLB: true }}>
      {geometries.map((g) => (
        <mesh
          key={g.id}
          geometry={g.geometry}
          userData={{ exportToGLB: true }}
          receiveShadow
        >
          <meshStandardMaterial
            color={isNight ? "#1a1d23" : "#3a3d43"}
            roughness={0.9}
            metalness={0.0}
            emissive={isNight ? "#101218" : "#000000"}
          />
        </mesh>
      ))}
    </group>
  );
}
