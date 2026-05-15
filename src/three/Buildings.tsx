import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { Select } from "@react-three/postprocessing";
import { useFrame, useThree } from "@react-three/fiber";
import { project } from "@/utils/geo";
import { DEFAULT_BUILDING_HEIGHT, METERS_PER_LEVEL } from "@/config/constants";
import {
  classifyBuilding,
  type Building as BuildingT,
  type BuildingCategory,
} from "@/types/overpass";
import { useSceneStore } from "@/state/sceneStore";

// ─── Palettes ───────────────────────────────────────────────────────────
const COLORS_DAY: Record<BuildingCategory, string> = {
  residential: "#a3b8d8",
  commercial: "#dbb98c",
  industrial: "#8b8e94",
  religious: "#c9a55c",
  education: "#9fc59f",
  civic: "#c79bd8",
  other: "#b0b4b8",
};
const COLORS_NIGHT: Record<BuildingCategory, string> = {
  residential: "#2c3548",
  commercial: "#42342a",
  industrial: "#2c2d31",
  religious: "#4a3b22",
  education: "#2f4232",
  civic: "#3e2f48",
  other: "#2c2e32",
};

type RoofKind = "flat" | "gabled" | "hipped" | "pyramidal" | "dome" | "skillion" | "onion";

function parseOSMRoofShape(s?: string): RoofKind | null {
  if (!s) return null;
  const v = s.toLowerCase();
  if (v === "flat") return "flat";
  if (v === "gabled" || v === "gable") return "gabled";
  if (v === "hipped" || v === "half-hipped") return "hipped";
  if (v === "pyramidal") return "pyramidal";
  if (v === "dome") return "dome";
  if (v === "skillion") return "skillion";
  if (v === "onion") return "onion";
  return null;
}

function parseOSMColor(s?: string): THREE.Color | null {
  if (!s) return null;
  try {
    const c = new THREE.Color(s.trim());
    if (Number.isFinite(c.r)) return c;
  } catch {
    /* invalid */
  }
  return null;
}

// Cheap deterministic PRNG by id
function seedRand(id: number) {
  let x = (id * 9301 + 49297) % 233280;
  return () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
}

interface PreparedBuilding {
  id: number;
  shape: THREE.Shape;
  depth: number;
  tags: BuildingT["tags"];
  category: BuildingCategory;
  centerX: number;
  centerY: number;
  approxFootprint: number;
  roofKind: RoofKind;
  osmColor: THREE.Color | null;
}

function computeShape(
  pts: { lat: number; lng: number }[],
  ref: { lat: number; lng: number }
): { shape: THREE.Shape; cx: number; cy: number; area: number } {
  const v2 = pts.map((p) => project(p.lat, p.lng, ref.lat, ref.lng));
  if (!v2[0].equals(v2[v2.length - 1])) v2.push(v2[0]);
  const shape = new THREE.Shape(v2);
  let cx = 0;
  let cy = 0;
  let area = 0;
  for (let i = 0; i < v2.length - 1; i++) {
    const a = v2[i];
    const b = v2[i + 1];
    const cross = a.x * b.y - b.x * a.y;
    area += cross;
    cx += (a.x + b.x) * cross;
    cy += (a.y + b.y) * cross;
  }
  area = Math.abs(area) / 2;
  if (area !== 0) {
    cx /= 6 * area;
    cy /= 6 * area;
  } else {
    cx = v2[0].x;
    cy = v2[0].y;
  }
  return { shape, cx, cy, area };
}

// ─── LOD-aware building body ─────────────────────────────────────────
function BuildingBody({ b }: { b: PreparedBuilding }) {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [hoverPos, setHoverPos] = useState<THREE.Vector3 | null>(null);
  const [farLOD, setFarLOD] = useState(false);
  const timeOfDay = useSceneStore((s) => s.timeOfDay);
  const isNight = timeOfDay === "night";
  const { camera } = useThree();

  const rand = useMemo(() => seedRand(b.id), [b.id]);
  const tintFactor = useMemo(() => 0.85 + rand() * 0.3, [rand]);

  const baseColor = useMemo(() => {
    // 1) If OSM provides building:colour, respect it (with day/night tweak)
    if (b.osmColor) {
      const c = b.osmColor.clone();
      if (isNight) c.multiplyScalar(0.35).lerp(new THREE.Color("#1a1f2e"), 0.4);
      return c;
    }
    const palette = isNight ? COLORS_NIGHT : COLORS_DAY;
    const base = new THREE.Color(palette[b.category]);
    const heightFactor = Math.min(1, b.depth / 80);
    base.lerp(
      new THREE.Color(isNight ? "#202840" : "#cfdce8"),
      heightFactor * 0.35
    );
    base.multiplyScalar(tintFactor);
    return base;
  }, [b.osmColor, b.category, b.depth, tintFactor, isNight]);

  const highlight = hovered || clicked;
  const color = highlight ? new THREE.Color("#6366f1") : baseColor;
  const extrudeSettings = useMemo(
    () => ({ steps: 1, depth: b.depth, bevelEnabled: false }),
    [b.depth]
  );
  const emissiveIntensity = useMemo(
    () => (isNight ? 0.05 + rand() * 0.25 : 0),
    [isNight, rand]
  );

  // LOD switching — compute camera distance every frame and gate detail
  const groupRef = useRef<THREE.Group>(null);
  const tmpPos = new THREE.Vector3();
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    // smooth hover scale
    const target = highlight ? 1.025 : 1.0;
    groupRef.current.scale.lerp(
      new THREE.Vector3(target, target, target),
      Math.min(1, delta * 8)
    );

    // LOD: check distance to building center every frame (cheap)
    tmpPos.set(b.centerX, b.depth / 2, -b.centerY);
    const d = camera.position.distanceTo(tmpPos);
    const shouldFar = d > 350;
    if (shouldFar !== farLOD) setFarLOD(shouldFar);
  });

  return (
    <group ref={groupRef}>
      <Select enabled={clicked}>
        <mesh
          onPointerOver={(e) => {
            setHovered(true);
            e.stopPropagation();
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e) => {
            setHovered(false);
            e.stopPropagation();
            document.body.style.cursor = "";
          }}
          onPointerMove={(e) => {
            setHoverPos(e.point.clone());
            e.stopPropagation();
          }}
          onClick={(e) => {
            setClicked((c) => !c);
            e.stopPropagation();
          }}
          rotation={[-Math.PI / 2, 0, 0]}
          userData={{ exportToGLB: true }}
          castShadow={!farLOD}
          receiveShadow
        >
          <extrudeGeometry args={[b.shape, extrudeSettings]} />
          <meshStandardMaterial
            color={color}
            emissive={highlight ? "#6366f1" : isNight ? "#ffd270" : "#000000"}
            emissiveIntensity={highlight ? 0.4 : emissiveIntensity}
            roughness={0.82}
            metalness={0.06}
          />
        </mesh>
      </Select>

      {/* Window pattern — skipped at far LOD */}
      {!farLOD && isNight && b.depth > 6 && <BuildingWindows b={b} />}

      {/* Roof cap — only on small buildings, skipped at far LOD */}
      {!farLOD &&
        b.roofKind !== "flat" &&
        b.approxFootprint < 250 && (
          <RoofCap b={b} color={color} isNight={isNight} />
        )}

      {(hovered || clicked) && hoverPos && (
        <Html
          position={[hoverPos.x, hoverPos.y + b.depth + 0.6, hoverPos.z]}
          center
          distanceFactor={50}
        >
          <BuildingTooltip
            id={b.id}
            tags={b.tags}
            category={b.category}
            footprint={b.approxFootprint}
            depth={b.depth}
          />
        </Html>
      )}
    </group>
  );
}

// ─── Window light pattern ─────────────────────────────────────────────
function BuildingWindows({ b }: { b: PreparedBuilding }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const geometry = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(b.shape, {
      steps: 1,
      depth: b.depth,
      bevelEnabled: false,
    });
    return g;
  }, [b.shape, b.depth]);

  const seed = (b.id % 1000) / 1000;

  useFrame((_, dt) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value += dt;
    }
  });

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      userData={{ exportToGLB: false }}
      renderOrder={1}
    >
      <shaderMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        uniforms={{
          uSeed: { value: seed },
          uTime: { value: 0 },
          uHeight: { value: b.depth },
        }}
        vertexShader={`
          varying vec3 vWorldPos;
          varying vec3 vNormal;
          void main() {
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vWorldPos = wp.xyz;
            vNormal = normalize(mat3(modelMatrix) * normal);
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `}
        fragmentShader={`
          uniform float uSeed;
          uniform float uTime;
          uniform float uHeight;
          varying vec3 vWorldPos;
          varying vec3 vNormal;

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
          }

          void main() {
            if (abs(vNormal.y) > 0.7) discard;
            float u = (abs(vNormal.x) > abs(vNormal.z)) ? vWorldPos.z : vWorldPos.x;
            float v = vWorldPos.y;
            float cellU = 1.6;
            float cellV = 2.4;
            float winU = 0.7;
            float winV = 1.2;
            float cu = floor(u / cellU);
            float cv = floor(v / cellV);
            float fu = mod(u, cellU);
            float fv = mod(v, cellV);
            float inWin = step(0.0, fu - (cellU - winU) * 0.5)
                        * step(fu, (cellU + winU) * 0.5)
                        * step(0.0, fv - (cellV - winV) * 0.5)
                        * step(fv, (cellV + winV) * 0.5);
            float seed = uSeed * 13.0 + cu * 1.7 + cv * 0.31;
            float on = step(0.35, hash(vec2(cu + uSeed * 91.0, cv + uSeed * 73.0)));
            float flicker = 0.85 + 0.15 * sin(uTime * 3.0 + seed * 31.0);
            on *= flicker;
            if (inWin < 0.5 || on < 0.5) discard;
            vec3 warm = mix(vec3(1.0, 0.85, 0.55), vec3(1.0, 0.95, 0.78), hash(vec2(cu, cv)));
            gl_FragColor = vec4(warm, 0.95);
          }
        `}
      />
    </mesh>
  );
}

// ─── Roof Cap with OSM-aware shape ────────────────────────────────────
function RoofCap({
  b,
  color,
  isNight,
}: {
  b: PreparedBuilding;
  color: THREE.Color;
  isNight: boolean;
}) {
  const bbox = useMemo(() => {
    const pts = b.shape.getPoints(2);
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    pts.forEach((p) => {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    });
    return { minX, maxX, minY, maxY };
  }, [b.shape]);

  const w = bbox.maxX - bbox.minX;
  const d = bbox.maxY - bbox.minY;
  const cx = (bbox.minX + bbox.maxX) / 2;
  const cy = (bbox.minY + bbox.maxY) / 2;
  const roofH = Math.min(3.5, Math.max(1.5, Math.min(w, d) * 0.18));

  const roofColor = useMemo(() => {
    if (b.category === "residential") {
      return isNight ? new THREE.Color("#3a1f1f") : new THREE.Color("#8d3f2c");
    }
    return color.clone().multiplyScalar(0.9);
  }, [b.category, color, isNight]);

  // dome
  if (b.roofKind === "dome" || b.roofKind === "onion") {
    const r = Math.min(w, d) / 2;
    const h = b.roofKind === "onion" ? r * 1.5 : r;
    return (
      <mesh
        position={[cx, b.depth + (b.roofKind === "onion" ? 0 : 0), -cy]}
        userData={{ exportToGLB: true }}
        castShadow
      >
        <sphereGeometry args={[r, 18, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={roofColor} roughness={0.85} />
        {b.roofKind === "onion" && (
          <mesh position={[0, h * 0.4, 0]}>
            <coneGeometry args={[r * 0.4, h * 0.6, 12]} />
            <meshStandardMaterial color={roofColor} roughness={0.85} />
          </mesh>
        )}
      </mesh>
    );
  }

  if (b.roofKind === "skillion") {
    const geo = new THREE.BufferGeometry();
    const v = bbox;
    const verts = new Float32Array([
      v.minX, 0, v.minY,
      v.maxX, 0, v.minY,
      v.maxX, roofH, v.maxY,
      v.minX, roofH, v.maxY,
    ]);
    geo.setAttribute("position", new THREE.BufferAttribute(verts, 3));
    geo.setIndex([0, 1, 2, 0, 2, 3]);
    geo.computeVertexNormals();
    return (
      <mesh
        geometry={geo}
        position={[0, b.depth, 0]}
        userData={{ exportToGLB: true }}
        castShadow
      >
        <meshStandardMaterial color={roofColor} roughness={0.95} />
      </mesh>
    );
  }

  if (b.roofKind === "gabled") {
    const along = w >= d ? "x" : "y";
    if (along === "x") {
      const geo = new THREE.BufferGeometry();
      const v = bbox;
      const verts = new Float32Array([
        v.minX, 0, v.minY,
        v.maxX, 0, v.minY,
        v.maxX, 0, v.maxY,
        v.minX, 0, v.maxY,
        v.minX, roofH, cy,
        v.maxX, roofH, cy,
      ]);
      geo.setAttribute("position", new THREE.BufferAttribute(verts, 3));
      geo.setIndex([
        0, 1, 5, 0, 5, 4, 3, 4, 5, 3, 5, 2, 0, 4, 3, 1, 2, 5, 5, 2, 1,
      ]);
      geo.computeVertexNormals();
      return (
        <mesh
          geometry={geo}
          position={[0, b.depth, 0]}
          userData={{ exportToGLB: true }}
          castShadow
        >
          <meshStandardMaterial color={roofColor} roughness={0.95} />
        </mesh>
      );
    } else {
      const geo = new THREE.BufferGeometry();
      const v = bbox;
      const verts = new Float32Array([
        v.minX, 0, v.minY,
        v.maxX, 0, v.minY,
        v.maxX, 0, v.maxY,
        v.minX, 0, v.maxY,
        cx, roofH, v.minY,
        cx, roofH, v.maxY,
      ]);
      geo.setAttribute("position", new THREE.BufferAttribute(verts, 3));
      geo.setIndex([
        0, 4, 1, 2, 5, 3, 0, 3, 5, 0, 5, 4, 1, 4, 5, 1, 5, 2,
      ]);
      geo.computeVertexNormals();
      return (
        <mesh
          geometry={geo}
          position={[0, b.depth, 0]}
          userData={{ exportToGLB: true }}
          castShadow
        >
          <meshStandardMaterial color={roofColor} roughness={0.95} />
        </mesh>
      );
    }
  }

  if (b.roofKind === "hipped" || b.roofKind === "pyramidal") {
    const geo = new THREE.BufferGeometry();
    const v = bbox;
    const verts = new Float32Array([
      v.minX, 0, v.minY,
      v.maxX, 0, v.minY,
      v.maxX, 0, v.maxY,
      v.minX, 0, v.maxY,
      cx, b.roofKind === "pyramidal" ? roofH * 1.6 : roofH, cy,
    ]);
    geo.setAttribute("position", new THREE.BufferAttribute(verts, 3));
    geo.setIndex([0, 1, 4, 1, 2, 4, 2, 3, 4, 3, 0, 4]);
    geo.computeVertexNormals();
    return (
      <mesh
        geometry={geo}
        position={[0, b.depth, 0]}
        userData={{ exportToGLB: true }}
        castShadow
      >
        <meshStandardMaterial color={roofColor} roughness={0.95} />
      </mesh>
    );
  }

  return null;
}

// ─── Tooltip ──────────────────────────────────────────────────────────
function BuildingTooltip({
  id,
  tags,
  category,
  footprint,
  depth,
}: {
  id: number;
  tags: BuildingT["tags"];
  category: BuildingCategory;
  footprint: number;
  depth: number;
}) {
  return (
    <div
      role="dialog"
      aria-label={tags.name || "Building"}
      style={{
        color: "#0f172a",
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(12px)",
        padding: "12px 14px",
        borderRadius: "10px",
        fontSize: "12px",
        width: "210px",
        boxShadow: "0 8px 24px rgba(15,23,42,0.18)",
        border: "1px solid rgba(15,23,42,0.08)",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "4px" }}>
        {tags.name || "Building"}
      </div>
      <div
        style={{
          display: "inline-block",
          fontSize: "10px",
          color: "#6366f1",
          background: "rgba(99,102,241,0.12)",
          padding: "1px 6px",
          borderRadius: "999px",
          textTransform: "capitalize",
          marginBottom: "6px",
        }}
      >
        {category}
      </div>
      {tags.height && <Row label="Height" value={`${tags.height} m`} />}
      {!tags.height && (
        <Row label="Height (est.)" value={`${depth.toFixed(1)} m`} />
      )}
      {tags["building:levels"] && (
        <Row label="Levels" value={tags["building:levels"]} />
      )}
      <Row label="Footprint" value={`${footprint.toFixed(0)} m²`} />
      {tags["roof:shape"] && (
        <Row label="Roof" value={tags["roof:shape"] as string} />
      )}
      {tags["addr:street"] && (
        <Row
          label="Address"
          value={[tags["addr:street"], tags["addr:housenumber"]]
            .filter(Boolean)
            .join(" ")}
        />
      )}
      <a
        href={`https://www.openstreetmap.org/way/${id}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          marginTop: "8px",
          fontSize: "11px",
          color: "#6366f1",
          fontWeight: 600,
          textDecoration: "none",
          borderBottom: "1px dotted #6366f1",
        }}
      >
        Edit on OpenStreetMap →
      </a>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: "11px",
        color: "#475569",
        margin: "3px 0",
      }}
    >
      <span style={{ fontWeight: 500 }}>{label}</span>
      <span style={{ textTransform: "capitalize" }}>{value}</span>
    </div>
  );
}

// ─── Buildings collection ───────────────────────────────────────────────
export function Buildings({
  buildings,
  ref,
}: {
  buildings: BuildingT[];
  ref: { lat: number; lng: number };
}) {
  const enabledCategories = useSceneStore((s) => s.enabledCategories);
  const minHeight = useSceneStore((s) => s.minHeight);
  const maxHeight = useSceneStore((s) => s.maxHeight);

  const data = useMemo(() => {
    const result: PreparedBuilding[] = [];
    buildings.forEach((b) => {
      if (!b.geometry || b.geometry.length < 3) return;
      const category = classifyBuilding(b.tags);
      if (!enabledCategories.has(category)) return;

      const { shape, cx, cy, area } = computeShape(b.geometry, ref);

      let height = parseFloat(b.tags.height ?? "");
      const levels = parseFloat(b.tags["building:levels"] ?? "");
      if (isNaN(height)) height = DEFAULT_BUILDING_HEIGHT;
      if (!isNaN(levels)) height = levels * METERS_PER_LEVEL;
      if (height < minHeight || height > maxHeight) return;

      // 1) prefer OSM roof:shape if specified
      const osmRoof = parseOSMRoofShape(b.tags["roof:shape"]);
      let roofKind: RoofKind = osmRoof ?? "flat";
      if (!osmRoof) {
        const r = seedRand(b.id);
        if (
          height < 14 &&
          (category === "residential" || category === "religious")
        ) {
          const dice = r();
          if (dice > 0.7) roofKind = "gabled";
          else if (dice > 0.4) roofKind = "hipped";
        }
      }

      // 2) parse OSM building:colour / roof:colour
      const osmColor =
        parseOSMColor(b.tags["building:colour"] as string) ||
        parseOSMColor(b.tags["building:color"] as string);

      result.push({
        id: b.id,
        shape,
        depth: height,
        tags: b.tags,
        category,
        centerX: cx,
        centerY: cy,
        approxFootprint: area,
        roofKind,
        osmColor,
      });
    });
    return result;
  }, [buildings, ref.lat, ref.lng, enabledCategories, minHeight, maxHeight]);

  return (
    <group>
      {data.map((d) => (
        <BuildingBody key={d.id} b={d} />
      ))}
    </group>
  );
}
