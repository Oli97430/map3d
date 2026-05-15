import { useEffect, useMemo, useState } from "react";
import { Canvas, useThree, type ThreeEvent } from "@react-three/fiber";
import { Environment, Stats } from "@react-three/drei";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter.js";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";

import { useAreaStore } from "@/state/areaStore";
import { useActionStore } from "@/state/exportStore";
import { useSceneStore } from "@/state/sceneStore";
import { useSettingsStore } from "@/state/settingsStore";
import { useAnnotationStore } from "@/state/annotationStore";
import { toast } from "@/state/toastStore";

import Car from "./Car";
import { Buildings } from "./Buildings";
import { Roads } from "./Roads";
import { Ground } from "./Ground";
import { Terrain } from "./Terrain";
import { WaterAndParks } from "./WaterAndParks";
import { AnimatedWater } from "./AnimatedWater";
import { Trees } from "./Trees";
import { StreetLamps } from "./StreetLamps";
import { Annotations } from "./Annotations";
import { CameraRig } from "./CameraRig";
import { SunRig } from "./SunRig";
import { PostFX } from "./PostFX";
import { Sky3D } from "./Sky3D";
import {
  Boats,
  Bridges,
  Crosswalks,
  OSMTrees,
  PowerInfra,
} from "./MapExtras";

import { project } from "@/utils/geo";
import { useCameraHeading } from "./useCameraHeading";
import instanceFleet from "@/api/axios";

// ─── Export bridge ──────────────────────────────────────────────────────
function Exporter() {
  const { scene } = useThree();
  const action = useActionStore((s) => s.action);
  const setAction = useActionStore((s) => s.setAction);
  const fleetSpaceId = useActionStore((s) => s.fleetSpaceId);
  const exportType = useActionStore((s) => s.exportType);
  const exportFormat = useActionStore((s) => s.exportFormat);

  useEffect(() => {
    if (!action) return;
    setAction(false);

    const exportRoot = new THREE.Group();
    scene.traverse((child) => {
      if (child.userData?.exportToGLB === true) {
        exportRoot.add(child.clone(true));
      }
    });

    if (exportFormat === "obj") {
      const text = new OBJExporter().parse(exportRoot);
      downloadText(text, "map3d-scene.obj", "text/plain");
      toast.success("OBJ downloaded");
      return;
    }
    if ((exportFormat as string) === "stl") {
      const text = new STLExporter().parse(exportRoot);
      downloadText(text, "map3d-scene.stl", "model/stl");
      toast.success("STL downloaded");
      return;
    }

    const exporter = new GLTFExporter();
    exporter.parse(
      exportRoot,
      (result) => {
        if (!(result instanceof ArrayBuffer)) {
          toast.error("Export failed: unexpected result");
          return;
        }
        const blob = new Blob([result], { type: "model/gltf-binary" });
        if (exportType === "glb") {
          downloadBlob(blob, "map3d-scene.glb");
          toast.success("GLB downloaded");
        } else if (exportType === "fleet") {
          uploadFleet(blob, fleetSpaceId).then(
            () => toast.success("Uploaded to Fleet"),
            () => toast.error("Fleet upload failed")
          );
        }
      },
      () => toast.error("Export failed"),
      { binary: true, embedImages: true }
    );
  }, [action, exportFormat, exportType, fleetSpaceId, scene, setAction]);

  return null;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.style.display = "none";
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function downloadText(text: string, filename: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  downloadBlob(blob, filename);
}

async function uploadFleet(blob: Blob, spaceId: string) {
  const formData = new FormData();
  formData.append("object", blob, "box3d.glb");
  formData.append("title", "New Object");
  formData.append("description", "");
  formData.append("spaceId", spaceId);
  await instanceFleet.post("space/file/mesh", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

// ─── Screenshot bridge ──────────────────────────────────────────────────
function Screenshotter() {
  const { gl, scene, camera } = useThree();
  const wantsScreenshot = useActionStore((s) => s.screenshotRequest);
  const clearScreenshot = useActionStore((s) => s.setScreenshotRequest);

  useEffect(() => {
    if (!wantsScreenshot) return;
    gl.render(scene, camera);
    const dataUrl = gl.domElement.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `map3d-${Date.now()}.png`;
    a.click();
    clearScreenshot(false);
    toast.success("Screenshot saved");
  }, [wantsScreenshot, clearScreenshot, gl, scene, camera]);

  return null;
}

function HeadingTracker() {
  useCameraHeading();
  return null;
}

function PinDropTarget() {
  const add = useAnnotationStore((s) => s.add);
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.01, 0]}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        if (!e.shiftKey) return;
        e.stopPropagation();
        const label = window.prompt("Pin label:", "Place");
        if (label) {
          add({
            worldX: e.point.x,
            worldY: e.point.y,
            worldZ: e.point.z,
            label,
          });
        }
      }}
    >
      <planeGeometry args={[4000, 4000]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  );
}

// ─── Main Space ─────────────────────────────────────────────────────────
export function Space() {
  const areas = useAreaStore((s) => s.areas);
  const center = useAreaStore((s) => s.center);
  const shadowsEnabled = useSceneStore((s) => s.shadowsEnabled);
  const timeOfDay = useSceneStore((s) => s.timeOfDay);
  const showFPS = useSettingsStore((s) => s.showFPS);

  const [areaSnapshot, setAreaSnapshot] = useState(center);
  useEffect(() => setAreaSnapshot(center), [areas, center]);

  const ref = useMemo(
    () => ({
      lat: (center[0].lat + center[1].lat) / 2,
      lng: (center[0].lng + center[1].lng) / 2,
    }),
    [center]
  );

  const isNight = timeOfDay === "night";

  return (
    <Canvas
      camera={{ fov: 75, near: 0.1, far: 7000, position: [0, 80, 120] }}
      shadows={shadowsEnabled}
      dpr={[1, 2]}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
    >
      <color attach="background" args={[isNight ? "#06081a" : "#dfe9f3"]} />
      <fog
        attach="fog"
        args={[isNight ? "#06081a" : "#cdd9e6", 250, 1800]}
      />

      <SunRig />
      <Sky3D />

      <Environment preset={isNight ? "night" : "city"} />

      <Terrain ref={ref} />
      <Ground ref={ref} />
      <WaterAndParks corners={areaSnapshot} ref={ref} />
      <AnimatedWater corners={areaSnapshot} ref={ref} />
      <Boats corners={areaSnapshot} ref={ref} />
      <Roads corners={areaSnapshot} ref={ref} />
      <Bridges corners={areaSnapshot} ref={ref} />
      <Crosswalks corners={areaSnapshot} ref={ref} />
      <PowerInfra corners={areaSnapshot} ref={ref} />
      <Buildings buildings={areas} ref={ref} />
      <Trees corners={areaSnapshot} ref={ref} />
      <OSMTrees corners={areaSnapshot} ref={ref} />
      <StreetLamps corners={areaSnapshot} ref={ref} />
      <Annotations />

      <PinDropTarget />
      <Car />
      <CameraRig />
      <HeadingTracker />

      <Exporter />
      <Screenshotter />

      <PostFX />

      {showFPS && <Stats />}
    </Canvas>
  );
}

export { project };
