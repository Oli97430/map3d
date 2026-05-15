import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { project } from "@/utils/geo";
import { fetchRoads } from "@/api/overpass";
import type { LatLng, RoadFeature } from "@/types/overpass";
import { useSceneStore } from "@/state/sceneStore";

/**
 * Places small emissive spheres along major roads (lit at night).
 * Uses InstancedMesh so even hundreds of lamps stay at 1 draw call.
 */
export function StreetLamps({
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
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!show || !isNight || !corners || corners.length < 2) return;
    const ctrl = new AbortController();
    fetchRoads(corners[0], corners[1], ctrl.signal)
      .then((r) =>
        setRoads(
          r.filter((rd) =>
            [
              "motorway",
              "trunk",
              "primary",
              "secondary",
              "tertiary",
              "residential",
            ].includes(rd.tags.highway || "")
          )
        )
      )
      .catch((e) => {
        if (e?.name !== "AbortError")
          // eslint-disable-next-line no-console
          console.warn("StreetLamps fetch failed:", e);
      });
    return () => ctrl.abort();
  }, [show, isNight, corners]);

  const positions = useMemo(() => {
    if (!isNight) return [];
    const out: { x: number; z: number }[] = [];
    const STEP = 18; // meters between lamps
    roads.forEach((road) => {
      const pts = road.geometry.map((p) =>
        project(p.lat, p.lng, ref.lat, ref.lng)
      );
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy);
        if (len < 4) continue;
        const steps = Math.max(1, Math.floor(len / STEP));
        for (let s = 1; s < steps; s++) {
          const t = s / steps;
          out.push({ x: a.x + dx * t, z: -(a.y + dy * t) });
        }
      }
    });
    return out;
  }, [roads, ref.lat, ref.lng, isNight]);

  useEffect(() => {
    if (!meshRef.current) return;
    const tmp = new THREE.Object3D();
    positions.forEach((p, i) => {
      tmp.position.set(p.x, 4.5, p.z);
      tmp.updateMatrix();
      meshRef.current!.setMatrixAt(i, tmp.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions]);

  if (!show || !isNight || positions.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, positions.length]}
      userData={{ exportToGLB: true }}
    >
      <sphereGeometry args={[0.4, 8, 8]} />
      <meshBasicMaterial color="#fff2a0" />
    </instancedMesh>
  );
}
