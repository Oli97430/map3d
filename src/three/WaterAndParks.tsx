import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { project } from "@/utils/geo";
import { fetchParks } from "@/api/overpass";
import { useSceneStore } from "@/state/sceneStore";
import type { LatLng, ParkFeature } from "@/types/overpass";

/**
 * Park polygons only — water is now handled by AnimatedWater.
 */

function buildShape(
  geometry: LatLng[],
  ref: { lat: number; lng: number }
): THREE.Shape | null {
  if (geometry.length < 3) return null;
  const pts = geometry.map((p) => project(p.lat, p.lng, ref.lat, ref.lng));
  if (!pts[0].equals(pts[pts.length - 1])) pts.push(pts[0]);
  return new THREE.Shape(pts);
}

export function WaterAndParks({
  corners,
  ref,
}: {
  corners: LatLng[] | undefined;
  ref: { lat: number; lng: number };
}) {
  const showParks = useSceneStore((s) => s.showParks);
  const isNight = useSceneStore((s) => s.timeOfDay) === "night";
  const [parks, setParks] = useState<ParkFeature[]>([]);

  useEffect(() => {
    if (!corners || corners.length < 2) return;
    const ctrl = new AbortController();
    if (showParks) {
      fetchParks(corners[0], corners[1], ctrl.signal)
        .then(setParks)
        .catch((e) => {
          if (e?.name !== "AbortError")
            // eslint-disable-next-line no-console
            console.warn("Parks fetch failed:", e);
        });
    }
    return () => ctrl.abort();
  }, [corners, showParks]);

  const parkShapes = useMemo(
    () =>
      parks
        .map((p) => ({ id: p.id, shape: buildShape(p.geometry, ref) }))
        .filter((x): x is { id: number; shape: THREE.Shape } => !!x.shape),
    [parks, ref.lat, ref.lng]
  );

  return (
    <group>
      {showParks &&
        parkShapes.map((p) => (
          <mesh
            key={`park-${p.id}`}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.04, 0]}
            userData={{ exportToGLB: true }}
            receiveShadow
          >
            <shapeGeometry args={[p.shape]} />
            <meshStandardMaterial
              color={isNight ? "#1e3a26" : "#7fb069"}
              roughness={1}
              metalness={0}
            />
          </mesh>
        ))}
    </group>
  );
}
