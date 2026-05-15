import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useHeadingStore } from "@/state/headingStore";

/**
 * Track the camera's forward direction every frame and publish heading
 * (in degrees, 0 = North, 90 = East) to the headingStore.
 */
export function useCameraHeading() {
  const { camera } = useThree();
  const setHeading = useHeadingStore((s) => s.setHeading);
  const dir = new THREE.Vector3();

  useFrame(() => {
    camera.getWorldDirection(dir);
    // dir.x = east, dir.z = -north (Three.js Y-up). Compute heading.
    const headingRad = Math.atan2(dir.x, -dir.z);
    let deg = (headingRad * 180) / Math.PI;
    if (deg < 0) deg += 360;
    setHeading(deg);
  });
}
