import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { project } from "@/utils/geo";
import {
  fetchCrosswalks,
  fetchPower,
  fetchRoads,
  fetchTreePoints,
  fetchWater,
  isBridge,
  isTunnel,
  type CrosswalkPoint,
  type PowerLine,
  type PowerTower,
  type TreePoint,
} from "@/api/overpass";
import type { LatLng, RoadFeature, WaterFeature } from "@/types/overpass";
import { useSceneStore } from "@/state/sceneStore";

// ─── Helper ───────────────────────────────────────────────────────────
function projectAll(
  pts: LatLng[],
  ref: { lat: number; lng: number }
): THREE.Vector2[] {
  return pts.map((p) => project(p.lat, p.lng, ref.lat, ref.lng));
}

// ═══════════════════════════════════════════════════════════════════════
// 1) OSM TREES (natural=tree nodes)
// ═══════════════════════════════════════════════════════════════════════

export function OSMTrees({
  corners,
  ref,
}: {
  corners: LatLng[] | undefined;
  ref: { lat: number; lng: number };
}) {
  const show = useSceneStore((s) => s.showParks);
  const isNight = useSceneStore((s) => s.timeOfDay) === "night";
  const [trees, setTrees] = useState<TreePoint[]>([]);
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const leafRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!show || !corners || corners.length < 2) return;
    const ctrl = new AbortController();
    fetchTreePoints(corners[0], corners[1], ctrl.signal)
      .then(setTrees)
      .catch((e) => {
        if (e?.name !== "AbortError")
          // eslint-disable-next-line no-console
          console.warn("Tree points fetch failed:", e);
      });
    return () => ctrl.abort();
  }, [show, corners]);

  const projected = useMemo(
    () =>
      trees.map((t) => {
        const v = project(t.lat, t.lng, ref.lat, ref.lng);
        const scale = 0.85 + (Math.abs(Math.sin(t.id)) * 0.5);
        return { x: v.x, z: -v.y, scale };
      }),
    [trees, ref.lat, ref.lng]
  );

  useEffect(() => {
    if (!trunkRef.current || !leafRef.current) return;
    const tmp = new THREE.Object3D();
    projected.forEach((p, i) => {
      tmp.position.set(p.x, 1.2 * p.scale, p.z);
      tmp.rotation.set(0, 0, 0);
      tmp.scale.set(p.scale * 0.35, p.scale * 1.2, p.scale * 0.35);
      tmp.updateMatrix();
      trunkRef.current!.setMatrixAt(i, tmp.matrix);
      tmp.position.set(p.x, 2.4 * p.scale + 1.3, p.z);
      tmp.scale.set(p.scale * 1.6, p.scale * 2.5, p.scale * 1.6);
      tmp.updateMatrix();
      leafRef.current!.setMatrixAt(i, tmp.matrix);
    });
    trunkRef.current.instanceMatrix.needsUpdate = true;
    leafRef.current.instanceMatrix.needsUpdate = true;
  }, [projected]);

  if (!show || projected.length === 0) return null;

  return (
    <group userData={{ exportToGLB: true }}>
      <instancedMesh
        ref={trunkRef}
        args={[undefined, undefined, projected.length]}
        castShadow
        userData={{ exportToGLB: true }}
      >
        <cylinderGeometry args={[0.16, 0.2, 1, 6]} />
        <meshStandardMaterial color={isNight ? "#2a1a10" : "#5a3a22"} roughness={1} />
      </instancedMesh>
      <instancedMesh
        ref={leafRef}
        args={[undefined, undefined, projected.length]}
        castShadow
        userData={{ exportToGLB: true }}
      >
        <coneGeometry args={[0.7, 1, 7]} />
        <meshStandardMaterial
          color={isNight ? "#1a2e1a" : "#3f8a3f"}
          roughness={0.95}
          emissive={isNight ? "#0a1a0a" : "#000000"}
        />
      </instancedMesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 2) CROSSWALKS (highway=crossing nodes)
// ═══════════════════════════════════════════════════════════════════════

export function Crosswalks({
  corners,
  ref,
}: {
  corners: LatLng[] | undefined;
  ref: { lat: number; lng: number };
}) {
  const show = useSceneStore((s) => s.showRoads);
  const [pts, setPts] = useState<CrosswalkPoint[]>([]);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!show || !corners || corners.length < 2) return;
    const ctrl = new AbortController();
    fetchCrosswalks(corners[0], corners[1], ctrl.signal)
      .then(setPts)
      .catch((e) => {
        if (e?.name !== "AbortError")
          // eslint-disable-next-line no-console
          console.warn("Crosswalk fetch failed:", e);
      });
    return () => ctrl.abort();
  }, [show, corners]);

  const projected = useMemo(
    () =>
      pts.map((p) => {
        const v = project(p.lat, p.lng, ref.lat, ref.lng);
        return { x: v.x, z: -v.y, rot: ((p.id * 47) % 360) * (Math.PI / 180) };
      }),
    [pts, ref.lat, ref.lng]
  );

  useEffect(() => {
    if (!meshRef.current) return;
    const tmp = new THREE.Object3D();
    projected.forEach((p, i) => {
      tmp.position.set(p.x, 0.07, p.z);
      tmp.rotation.set(-Math.PI / 2, 0, p.rot);
      tmp.scale.set(1, 1, 1);
      tmp.updateMatrix();
      meshRef.current!.setMatrixAt(i, tmp.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [projected]);

  if (!show || projected.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, projected.length]}
      userData={{ exportToGLB: true }}
    >
      {/* 4 stripes via single textured plane — cheap "striped" pattern */}
      <planeGeometry args={[4.5, 3]} />
      <shaderMaterial
        transparent
        uniforms={{ uColor: { value: new THREE.Color("#f5f5f5") } }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          varying vec2 vUv;
          void main() {
            float stripes = step(0.5, fract(vUv.y * 6.0));
            gl_FragColor = vec4(uColor, stripes * 0.85);
          }
        `}
      />
    </instancedMesh>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 3) BRIDGES — overlay on RoadFeatures with bridge=yes
// ═══════════════════════════════════════════════════════════════════════

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
  default: 4,
};

function widthFor(type?: string): number {
  if (!type) return ROAD_WIDTH.default;
  return ROAD_WIDTH[type] ?? ROAD_WIDTH.default;
}

function buildRibbonGeometry(
  points: THREE.Vector2[],
  width: number,
  y: number
): THREE.BufferGeometry {
  const verts: number[] = [];
  const indices: number[] = [];
  const half = width / 2;
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

export function Bridges({
  corners,
  ref,
}: {
  corners: LatLng[] | undefined;
  ref: { lat: number; lng: number };
}) {
  const show = useSceneStore((s) => s.showRoads);
  const [roads, setRoads] = useState<RoadFeature[]>([]);

  useEffect(() => {
    if (!show || !corners || corners.length < 2) return;
    const ctrl = new AbortController();
    fetchRoads(corners[0], corners[1], ctrl.signal)
      .then((r) => setRoads(r.filter((rd) => isBridge(rd) || isTunnel(rd))))
      .catch((e) => {
        if (e?.name !== "AbortError")
          // eslint-disable-next-line no-console
          console.warn("Bridges fetch failed:", e);
      });
    return () => ctrl.abort();
  }, [show, corners]);

  const bridgeGeos = useMemo(() => {
    return roads
      .filter((r) => isBridge(r))
      .map((road) => {
        const pts = projectAll(road.geometry, ref);
        if (pts.length < 2) return null;
        return {
          id: road.id,
          geometry: buildRibbonGeometry(pts, widthFor(road.tags.highway) + 1.5, 5),
        };
      })
      .filter(
        (x): x is { id: number; geometry: THREE.BufferGeometry } => !!x
      );
  }, [roads, ref.lat, ref.lng]);

  if (!show || bridgeGeos.length === 0) return null;
  return (
    <group userData={{ exportToGLB: true }}>
      {bridgeGeos.map((g) => (
        <mesh
          key={g.id}
          geometry={g.geometry}
          userData={{ exportToGLB: true }}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color="#4a4d54"
            roughness={0.9}
            metalness={0.05}
          />
        </mesh>
      ))}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 4) POWER LINES + PYLONS
// ═══════════════════════════════════════════════════════════════════════

export function PowerInfra({
  corners,
  ref,
}: {
  corners: LatLng[] | undefined;
  ref: { lat: number; lng: number };
}) {
  const [lines, setLines] = useState<PowerLine[]>([]);
  const [towers, setTowers] = useState<PowerTower[]>([]);

  useEffect(() => {
    if (!corners || corners.length < 2) return;
    const ctrl = new AbortController();
    fetchPower(corners[0], corners[1], ctrl.signal)
      .then(({ lines, towers }) => {
        setLines(lines);
        setTowers(towers);
      })
      .catch((e) => {
        if (e?.name !== "AbortError")
          // eslint-disable-next-line no-console
          console.warn("Power fetch failed:", e);
      });
    return () => ctrl.abort();
  }, [corners]);

  const towerMeshRef = useRef<THREE.InstancedMesh>(null);
  const projectedTowers = useMemo(
    () =>
      towers.map((t) => {
        const v = project(t.lat, t.lng, ref.lat, ref.lng);
        return { x: v.x, z: -v.y };
      }),
    [towers, ref.lat, ref.lng]
  );

  useEffect(() => {
    if (!towerMeshRef.current) return;
    const tmp = new THREE.Object3D();
    projectedTowers.forEach((p, i) => {
      tmp.position.set(p.x, 8, p.z);
      tmp.updateMatrix();
      towerMeshRef.current!.setMatrixAt(i, tmp.matrix);
    });
    towerMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [projectedTowers]);

  // Lines as thin cylinders/cables
  const lineSegments = useMemo(() => {
    return lines.flatMap((line) => {
      const pts = projectAll(line.geometry, ref);
      const out: { from: THREE.Vector3; to: THREE.Vector3 }[] = [];
      for (let i = 0; i < pts.length - 1; i++) {
        out.push({
          from: new THREE.Vector3(pts[i].x, 14, -pts[i].y),
          to: new THREE.Vector3(pts[i + 1].x, 14, -pts[i + 1].y),
        });
      }
      return out;
    });
  }, [lines, ref.lat, ref.lng]);

  if (projectedTowers.length === 0 && lineSegments.length === 0) return null;

  return (
    <group>
      {projectedTowers.length > 0 && (
        <instancedMesh
          ref={towerMeshRef}
          args={[undefined, undefined, projectedTowers.length]}
          userData={{ exportToGLB: true }}
        >
          <boxGeometry args={[0.5, 16, 0.5]} />
          <meshStandardMaterial color="#5a5e66" />
        </instancedMesh>
      )}
      {lineSegments.map((seg, i) => {
        const dir = new THREE.Vector3().subVectors(seg.to, seg.from);
        const len = dir.length();
        const mid = seg.from.clone().add(seg.to).multiplyScalar(0.5);
        const quat = new THREE.Quaternion();
        quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
        return (
          <mesh
            key={i}
            position={mid}
            quaternion={quat}
            userData={{ exportToGLB: true }}
          >
            <cylinderGeometry args={[0.04, 0.04, len, 4]} />
            <meshBasicMaterial color="#1f2937" />
          </mesh>
        );
      })}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 5) BOATS — scattered on water polygons, gently bobbing
// ═══════════════════════════════════════════════════════════════════════

function pointInPolygon(x: number, y: number, polygon: THREE.Vector2[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function Boats({
  corners,
  ref,
}: {
  corners: LatLng[] | undefined;
  ref: { lat: number; lng: number };
}) {
  const show = useSceneStore((s) => s.showWater);
  const isNight = useSceneStore((s) => s.timeOfDay) === "night";
  const [water, setWater] = useState<WaterFeature[]>([]);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!show || !corners || corners.length < 2) return;
    const ctrl = new AbortController();
    fetchWater(corners[0], corners[1], ctrl.signal)
      .then(setWater)
      .catch((e) => {
        if (e?.name !== "AbortError")
          // eslint-disable-next-line no-console
          console.warn("Water fetch (boats) failed:", e);
      });
    return () => ctrl.abort();
  }, [show, corners]);

  const positions = useMemo(() => {
    const out: { x: number; z: number; rot: number; phase: number }[] = [];
    water.forEach((w) => {
      const pts = projectAll(w.geometry, ref);
      if (pts.length < 3) return;
      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
      pts.forEach((p) => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });
      const area = (maxX - minX) * (maxY - minY);
      const target = Math.min(8, Math.max(0, Math.floor(area / 8000)));
      let attempts = 0;
      let placed = 0;
      while (placed < target && attempts < target * 12) {
        attempts++;
        const px = minX + Math.random() * (maxX - minX);
        const py = minY + Math.random() * (maxY - minY);
        if (pointInPolygon(px, py, pts)) {
          out.push({
            x: px,
            z: -py,
            rot: Math.random() * Math.PI * 2,
            phase: Math.random() * Math.PI * 2,
          });
          placed++;
        }
      }
    });
    return out;
  }, [water, ref.lat, ref.lng]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const tmp = new THREE.Object3D();
    positions.forEach((p, i) => {
      const t = state.clock.elapsedTime;
      const y = 0.25 + Math.sin(t * 0.8 + p.phase) * 0.06;
      tmp.position.set(p.x, y, p.z);
      tmp.rotation.set(
        Math.sin(t * 0.5 + p.phase) * 0.05,
        p.rot + t * 0.05,
        Math.cos(t * 0.6 + p.phase) * 0.04
      );
      tmp.scale.set(1, 1, 1);
      tmp.updateMatrix();
      meshRef.current!.setMatrixAt(i, tmp.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!show || positions.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, positions.length]}
      userData={{ exportToGLB: true }}
      castShadow
    >
      <boxGeometry args={[1.4, 0.5, 4]} />
      <meshStandardMaterial
        color={isNight ? "#cbd5e1" : "#f8fafc"}
        roughness={0.7}
        emissive={isNight ? "#ffe28a" : "#000000"}
        emissiveIntensity={isNight ? 0.3 : 0}
      />
    </instancedMesh>
  );
}
