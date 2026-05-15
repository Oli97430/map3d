import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneStore } from "@/state/sceneStore";

/**
 * Animates the camera between presets using easing rather than teleporting.
 * Listens to `sceneStore.cameraPreset` and tweens position + lookAt target.
 */
export function CameraRig() {
  const { camera } = useThree();
  const preset = useSceneStore((s) => s.cameraPreset);

  const targetPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const tweening = useRef(false);
  const tweenStart = useRef(0);
  const TWEEN_DURATION = 0.9;

  // Source positions captured at tween start
  const fromPos = useRef(new THREE.Vector3());
  const fromLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    fromPos.current.copy(camera.position);
    fromLookAt.current.copy(currentLookAt.current);

    switch (preset) {
      case "top":
        targetPos.current.set(0, 250, 0.01);
        targetLookAt.current.set(0, 0, 0);
        break;
      case "isometric":
        targetPos.current.set(120, 120, 120);
        targetLookAt.current.set(0, 0, 0);
        break;
      case "first-person":
        targetPos.current.set(0, 1.7, 0);
        targetLookAt.current.set(0, 1.7, -10);
        break;
      case "orbit":
      default:
        targetPos.current.set(0, 80, 120);
        targetLookAt.current.set(0, 0, 0);
        break;
    }
    tweening.current = true;
    tweenStart.current = performance.now() / 1000;
  }, [preset, camera]);

  useFrame((_, delta) => {
    if (!tweening.current) return;
    const elapsed = performance.now() / 1000 - tweenStart.current;
    const t = Math.min(1, elapsed / TWEEN_DURATION);
    // ease-in-out cubic
    const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    camera.position.lerpVectors(fromPos.current, targetPos.current, e);
    currentLookAt.current.lerpVectors(
      fromLookAt.current,
      targetLookAt.current,
      e
    );
    camera.lookAt(currentLookAt.current);
    camera.updateProjectionMatrix();

    if (t >= 1) {
      tweening.current = false;
    }
    void delta;
  });

  return null;
}
