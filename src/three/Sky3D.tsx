import { useMemo } from "react";
import { Cloud, Clouds } from "@react-three/drei";
import * as THREE from "three";
import { useSceneStore } from "@/state/sceneStore";

/**
 * Drei <Clouds> wrapper — drops a handful of volumetric cloud sprites
 * across the sky. Only renders in daytime (would be lost at night).
 */
export function Sky3D() {
  const show = useSceneStore((s) => s.showClouds);
  const isNight = useSceneStore((s) => s.timeOfDay) === "night";
  const weather = useSceneStore((s) => s.weather);

  // Density scales with weather
  const positions = useMemo(() => {
    const count =
      weather === "fog" ? 16 : weather === "rain" || weather === "snow" ? 12 : 7;
    const out: { x: number; y: number; z: number; scale: number; seed: number }[] =
      [];
    for (let i = 0; i < count; i++) {
      out.push({
        x: (Math.random() - 0.5) * 800,
        y: 80 + Math.random() * 40,
        z: (Math.random() - 0.5) * 800,
        scale: 0.7 + Math.random() * 1.0,
        seed: Math.random() * 100,
      });
    }
    return out;
  }, [weather]);

  if (!show || isNight) return null;

  const cloudColor =
    weather === "rain" ? "#9aa4b2" : weather === "fog" ? "#c8d0d8" : "#ffffff";

  return (
    <Clouds material={THREE.MeshBasicMaterial}>
      {positions.map((p, i) => (
        <Cloud
          key={i}
          seed={p.seed}
          segments={20}
          bounds={[24, 4, 12]}
          volume={9 * p.scale}
          color={cloudColor}
          fade={120}
          speed={0.18}
          opacity={weather === "rain" ? 0.7 : 0.55}
          position={[p.x, p.y, p.z]}
        />
      ))}
    </Clouds>
  );
}
