import { useMemo } from "react";
import * as THREE from "three";
import { useSceneStore } from "@/state/sceneStore";

/**
 * Procedural terrain — uses layered value noise to fake gentle topography.
 * Real DEM (Mapzen/SRTM) would require an external tile service and a few MB
 * per fetch; this gives a believable hilly base for free.
 */

function hash(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function vnoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
}

/** Public elevation sampler used by other modules to "drape" features. */
export function sampleTerrainHeight(x: number, z: number, refLat: number): number {
  // Scale noise frequencies to scene units
  const s = 0.004;
  const n =
    vnoise(x * s, z * s) * 1.0 +
    vnoise(x * s * 2.3, z * s * 2.3) * 0.45 +
    vnoise(x * s * 5.1, z * s * 5.1) * 0.15;
  // Make terrain a bit more pronounced at higher latitudes (no real reason — looks cool)
  const lat = Math.min(1, Math.abs(refLat) / 60);
  const amplitude = 6 + lat * 4;
  return (n - 0.5) * amplitude;
}

interface Props {
  ref: { lat: number; lng: number };
}

export function Terrain({ ref }: Props) {
  const show = useSceneStore((s) => s.showTerrain);
  const showGround = useSceneStore((s) => s.showGround);
  const isNight = useSceneStore((s) => s.timeOfDay) === "night";

  const geometry = useMemo(() => {
    const size = 1600;
    const segs = 96;
    const g = new THREE.PlaneGeometry(size, size, segs, segs);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i); // y in plane = z in world after rotation
      const h = sampleTerrainHeight(x, -y, ref.lat);
      pos.setZ(i, h);
    }
    g.computeVertexNormals();
    return g;
  }, [ref.lat]);

  if (!show || !showGround) return null;

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.02, 0]}
      receiveShadow
      userData={{ exportToGLB: true }}
    >
      <meshStandardMaterial
        color={isNight ? "#0e1729" : "#c0d0b8"}
        roughness={1}
        metalness={0}
        flatShading={false}
      />
    </mesh>
  );
}
