import { useSceneStore } from "@/state/sceneStore";

/**
 * Flat ground fallback — only used when terrain elevation is disabled.
 */
export function Ground({ ref: _ref }: { ref: { lat: number; lng: number } }) {
  const show = useSceneStore((s) => s.showGround);
  const terrainOn = useSceneStore((s) => s.showTerrain);
  const isNight = useSceneStore((s) => s.timeOfDay) === "night";

  if (!show || terrainOn) return null;

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      receiveShadow
      userData={{ exportToGLB: true }}
    >
      <planeGeometry args={[4000, 4000]} />
      <meshStandardMaterial
        color={isNight ? "#0f172a" : "#c8d4c4"}
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}
