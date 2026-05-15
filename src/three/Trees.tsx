import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { project } from "@/utils/geo";
import { fetchParks } from "@/api/overpass";
import type { LatLng, ParkFeature } from "@/types/overpass";
import { useSceneStore } from "@/state/sceneStore";

/**
 * Renders one InstancedMesh of trunks + one InstancedMesh of foliage,
 * scattered inside park polygons using rejection sampling.
 */
export function Trees({
  corners,
  ref,
}: {
  corners: LatLng[] | undefined;
  ref: { lat: number; lng: number };
}) {
  const show = useSceneStore((s) => s.showParks);
  const timeOfDay = useSceneStore((s) => s.timeOfDay);
  const isNight = timeOfDay === "night";

  const [parks, setParks] = useState<ParkFeature[]>([]);
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const leafRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!show || !corners || corners.length < 2) return;
    const ctrl = new AbortController();
    fetchParks(corners[0], corners[1], ctrl.signal)
      .then(setParks)
      .catch((e) => {
        if (e?.name !== "AbortError")
          // eslint-disable-next-line no-console
          console.warn("Trees fetch failed:", e);
      });
    return () => ctrl.abort();
  }, [show, corners]);

  // Compute tree positions inside park polygons
  const positions = useMemo(() => {
    if (!show) return [];
    const out: { x: number; z: number; scale: number; rot: number }[] = [];
    parks.forEach((park) => {
      if (!park.geometry || park.geometry.length < 3) return;
      const pts = park.geometry.map((p) =>
        project(p.lat, p.lng, ref.lat, ref.lng)
      );
      // bbox
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;
      pts.forEach((p) => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });
      const w = maxX - minX;
      const h = maxY - minY;
      const area = w * h;
      // Density: ~1 tree per 200 m²
      const target = Math.min(400, Math.max(8, Math.floor(area / 200)));
      let attempts = 0;
      let placed = 0;
      while (placed < target && attempts < target * 8) {
        attempts++;
        const px = minX + Math.random() * w;
        const py = minY + Math.random() * h;
        if (pointInPolygon(px, py, pts)) {
          out.push({
            x: px,
            z: -py,
            scale: 0.85 + Math.random() * 0.6,
            rot: Math.random() * Math.PI * 2,
          });
          placed++;
        }
      }
    });
    return out;
  }, [parks, ref.lat, ref.lng, show]);

  // Set instance matrices
  useEffect(() => {
    if (!trunkRef.current || !leafRef.current) return;
    const tmp = new THREE.Object3D();
    positions.forEach((p, i) => {
      // trunk
      tmp.position.set(p.x, 1.2 * p.scale, p.z);
      tmp.rotation.set(0, p.rot, 0);
      tmp.scale.set(p.scale * 0.4, p.scale * 1.2, p.scale * 0.4);
      tmp.updateMatrix();
      trunkRef.current!.setMatrixAt(i, tmp.matrix);
      // leaf (cone on top)
      tmp.position.set(p.x, 2.4 * p.scale + 1.3, p.z);
      tmp.rotation.set(0, p.rot, 0);
      tmp.scale.set(p.scale * 1.8, p.scale * 2.8, p.scale * 1.8);
      tmp.updateMatrix();
      leafRef.current!.setMatrixAt(i, tmp.matrix);
    });
    trunkRef.current.instanceMatrix.needsUpdate = true;
    leafRef.current.instanceMatrix.needsUpdate = true;
  }, [positions]);

  if (!show || positions.length === 0) return null;

  return (
    <group userData={{ exportToGLB: true }}>
      <instancedMesh
        ref={trunkRef}
        args={[undefined, undefined, positions.length]}
        castShadow
        userData={{ exportToGLB: true }}
      >
        <cylinderGeometry args={[0.18, 0.22, 1, 6]} />
        <meshStandardMaterial
          color={isNight ? "#2a1a10" : "#5a3a22"}
          roughness={1}
        />
      </instancedMesh>
      <instancedMesh
        ref={leafRef}
        args={[undefined, undefined, positions.length]}
        castShadow
        userData={{ exportToGLB: true }}
      >
        <coneGeometry args={[0.7, 1, 8]} />
        <meshStandardMaterial
          color={isNight ? "#1a2e1a" : "#3a7a3a"}
          roughness={0.95}
          emissive={isNight ? "#0a1a0a" : "#000000"}
        />
      </instancedMesh>
    </group>
  );
}

function pointInPolygon(
  x: number,
  y: number,
  polygon: THREE.Vector2[]
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
