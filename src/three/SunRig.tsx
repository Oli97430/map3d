import { useMemo } from "react";
import { Sky, Stars } from "@react-three/drei";
import { useSettingsStore } from "@/state/settingsStore";
import { useSceneStore } from "@/state/sceneStore";
import * as THREE from "three";

/**
 * Computes sun position and lights based on the current hour (0-24).
 * Hour 0/24 = midnight, 12 = noon, 6 = sunrise, 18 = sunset.
 */
export function SunRig() {
  const hour = useSettingsStore((s) => s.sunHour);
  const timeOfDay = useSceneStore((s) => s.timeOfDay);
  const shadows = useSceneStore((s) => s.shadowsEnabled);

  // If user picked manual day/night override, override hour
  const effHour = useMemo(() => {
    if (timeOfDay === "night") return 22; // night override
    if (timeOfDay === "day" && Math.abs(hour - 13) > 6) return 13;
    return hour;
  }, [hour, timeOfDay]);

  // Angle from -π/2 (midnight) → 0 (noon) → π/2 (next midnight)
  const sunAngle = ((effHour - 6) / 12) * Math.PI; // -π/2..3π/2
  const sunHeight = Math.sin(sunAngle); // -1..1
  const isNight = sunHeight < -0.05;

  const sunPos = new THREE.Vector3(
    Math.cos(sunAngle) * 120,
    sunHeight * 100,
    Math.sin(sunAngle - Math.PI / 4) * 60
  );

  // Lighting intensities
  const ambientI = isNight ? 0.18 : 0.35 + sunHeight * 0.4;
  const sunI = isNight ? 0.25 : 0.7 + Math.max(0, sunHeight) * 0.6;

  // Color shifts (dawn/dusk = warmer)
  const warmth = Math.max(0, 0.6 - Math.abs(sunHeight));
  const sunColor = new THREE.Color().setRGB(
    1.0,
    isNight ? 0.75 : 1 - warmth * 0.25,
    isNight ? 0.95 : 1 - warmth * 0.5
  );

  return (
    <>
      {/* Sky / stars */}
      {!isNight && (
        <Sky
          distance={450000}
          sunPosition={[
            sunPos.x / 100,
            Math.max(0.01, sunHeight),
            sunPos.z / 100,
          ]}
          inclination={0.49 + Math.max(0, sunHeight) * 0.05}
          azimuth={0.25}
          turbidity={isNight ? 20 : 8}
          rayleigh={isNight ? 0.5 : 2}
        />
      )}
      {isNight && (
        <>
          <color attach="background" args={["#06081a"]} />
          <Stars
            radius={300}
            depth={60}
            count={6000}
            factor={5}
            saturation={0.6}
            fade
            speed={0.5}
          />
        </>
      )}

      {/* Sun / moon light */}
      <directionalLight
        position={sunPos.toArray()}
        intensity={sunI}
        color={isNight ? "#7a8aff" : sunColor.getStyle()}
        castShadow={shadows}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={400}
        shadow-camera-left={-150}
        shadow-camera-right={150}
        shadow-camera-top={150}
        shadow-camera-bottom={-150}
      />
      <ambientLight intensity={ambientI} />
      {isNight && <hemisphereLight args={["#1a1f3a", "#000000", 0.35]} />}
    </>
  );
}

/** Returns whether the current effective sun position is "night". */
export function useIsNight(): boolean {
  const hour = useSettingsStore((s) => s.sunHour);
  const timeOfDay = useSceneStore((s) => s.timeOfDay);
  if (timeOfDay === "night") return true;
  if (timeOfDay === "day") return false;
  return hour < 6.2 || hour > 19.8;
}
