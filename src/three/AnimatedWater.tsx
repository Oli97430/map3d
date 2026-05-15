import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { project } from "@/utils/geo";
import { fetchWater } from "@/api/overpass";
import { useSceneStore } from "@/state/sceneStore";
import type { LatLng, WaterFeature } from "@/types/overpass";

/**
 * Animated water surface — uses a custom shader on flat polygon geometry
 * to fake wave displacement and shimmer.
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

export function AnimatedWater({
  corners,
  ref,
}: {
  corners: LatLng[] | undefined;
  ref: { lat: number; lng: number };
}) {
  const show = useSceneStore((s) => s.showWater);
  const isNight = useSceneStore((s) => s.timeOfDay) === "night";
  const [water, setWater] = useState<WaterFeature[]>([]);

  useEffect(() => {
    if (!show || !corners || corners.length < 2) return;
    const ctrl = new AbortController();
    fetchWater(corners[0], corners[1], ctrl.signal)
      .then(setWater)
      .catch((e) => {
        if (e?.name !== "AbortError")
          // eslint-disable-next-line no-console
          console.warn("Water fetch failed:", e);
      });
    return () => ctrl.abort();
  }, [show, corners]);

  const shapes = useMemo(
    () =>
      water
        .map((w) => ({ id: w.id, shape: buildShape(w.geometry, ref) }))
        .filter((x): x is { id: number; shape: THREE.Shape } => !!x.shape),
    [water, ref.lat, ref.lng]
  );

  if (!show || shapes.length === 0) return null;
  return (
    <group>
      {shapes.map((w) => (
        <WaterPolygon key={w.id} shape={w.shape} isNight={isNight} />
      ))}
    </group>
  );
}

function WaterPolygon({
  shape,
  isNight,
}: {
  shape: THREE.Shape;
  isNight: boolean;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((_, dt) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value += dt;
    }
  });

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.06, 0]}
      userData={{ exportToGLB: true }}
    >
      <shapeGeometry args={[shape, 24]} />
      <shaderMaterial
        ref={matRef}
        transparent
        uniforms={{
          uTime: { value: 0 },
          uColorDeep: { value: new THREE.Color(isNight ? "#0a1a30" : "#3b7fb8") },
          uColorShallow: {
            value: new THREE.Color(isNight ? "#1c3a60" : "#7bb8df"),
          },
          uNight: { value: isNight ? 1 : 0 },
        }}
        vertexShader={`
          varying vec2 vUv;
          varying vec3 vWorldPos;
          uniform float uTime;

          // Simple gerstner-ish wave displacement on a flat plane.
          // Since shapeGeometry is flat, we modulate the alpha/color via UV+time
          // — actual mesh stays flat (perf cheap) but normals are computed in fragment.

          void main() {
            vUv = uv;
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vWorldPos = wp.xyz;
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uColorDeep;
          uniform vec3 uColorShallow;
          uniform float uNight;
          varying vec3 vWorldPos;
          varying vec2 vUv;

          // 2D hash for cheap noise
          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
          }
          float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
          }

          void main() {
            // Animated ripple pattern via two layered waves
            vec2 p = vWorldPos.xz * 0.18;
            float n1 = noise(p + uTime * 0.4);
            float n2 = noise(p * 1.8 - uTime * 0.25);
            float w = smoothstep(0.35, 0.85, n1 * 0.7 + n2 * 0.3);

            // Specular hotspots
            float spec = pow(w, 6.0);

            vec3 col = mix(uColorDeep, uColorShallow, w);
            col += spec * (uNight > 0.5 ? vec3(0.45, 0.55, 0.95) : vec3(1.0));

            // Edge fade
            gl_FragColor = vec4(col, 0.92);
          }
        `}
      />
    </mesh>
  );
}
