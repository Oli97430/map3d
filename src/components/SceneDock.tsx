import { css, keyframes } from "@emotion/react";
import { Sun, Moon, Camera, Eye, Layers, ZapOff, Zap } from "lucide-react";
import { useSceneStore, CameraPreset } from "@/state/sceneStore";
import { useActionStore } from "@/state/exportStore";
import { useSettingsStore } from "@/state/settingsStore";
import { Tooltip } from "@/components/Tooltip";
import {
  BORDER_COLOR,
  BRAND_GRADIENT,
  SHADOW_LG,
  SURFACE_GLASS,
  SURFACE_GLASS_HOVER,
} from "@/theme/color";

const slideUp = keyframes`
  from { opacity: 0; transform: translate(-50%, 12px); }
  to   { opacity: 1; transform: translate(-50%, 0); }
`;

const CAMERA_LABELS: Record<CameraPreset, { label: string; icon: string }> = {
  orbit: { label: "Orbit", icon: "🌐" },
  top: { label: "Top", icon: "⬇" },
  isometric: { label: "Iso", icon: "📐" },
  "first-person": { label: "FPV", icon: "👁" },
};

function DockButton({
  active,
  onClick,
  children,
  label,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <Tooltip label={label} side="top">
      <button
        onClick={onClick}
        aria-label={label}
        aria-pressed={active}
        css={css({
          width: "34px",
          height: "34px",
          border: "none",
          borderRadius: "8px",
          background: active ? BRAND_GRADIENT : "transparent",
          color: active ? "#fff" : "#0f172a",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.18s ease",
          boxShadow: active ? "0 2px 8px rgba(99,102,241,0.3)" : "none",
          ":hover": {
            background: active ? undefined : "rgba(15,23,42,0.06)",
            transform: "translateY(-1px)",
          },
        })}
      >
        {children}
      </button>
    </Tooltip>
  );
}

function Divider() {
  return (
    <span
      css={css({
        width: "1px",
        height: "20px",
        background: BORDER_COLOR,
        margin: "0 0.25rem",
      })}
    />
  );
}

export function SceneDock() {
  const timeOfDay = useSceneStore((s) => s.timeOfDay);
  const setTimeOfDay = useSceneStore((s) => s.setTimeOfDay);
  const cameraPreset = useSceneStore((s) => s.cameraPreset);
  const setCameraPreset = useSceneStore((s) => s.setCameraPreset);
  const shadows = useSceneStore((s) => s.shadowsEnabled);
  const setShadows = useSceneStore((s) => s.setShadowsEnabled);
  const showRoads = useSceneStore((s) => s.showRoads);
  const setShowRoads = useSceneStore((s) => s.setShowRoads);
  const setScreenshot = useActionStore((s) => s.setScreenshotRequest);
  const showFPS = useSettingsStore((s) => s.showFPS);
  const setShowFPS = useSettingsStore((s) => s.setShowFPS);

  const presets: CameraPreset[] = ["orbit", "top", "isometric", "first-person"];

  return (
    <div
      role="toolbar"
      aria-label="3D scene quick controls"
      css={css({
        position: "fixed",
        bottom: "1.75rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 999,
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
        padding: "0.4rem 0.55rem",
        background: SURFACE_GLASS,
        backdropFilter: "blur(16px) saturate(180%)",
        border: `1px solid ${BORDER_COLOR}`,
        borderRadius: "14px",
        boxShadow: SHADOW_LG,
        animation: `${slideUp} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)`,
        "@media (max-width: 640px)": {
          bottom: "5.5rem",
          maxWidth: "calc(100% - 2rem)",
          overflowX: "auto",
        },
        ":hover": {
          background: SURFACE_GLASS_HOVER,
        },
      })}
    >
      {/* Day/Night */}
      <DockButton
        active={timeOfDay === "day"}
        onClick={() => setTimeOfDay("day")}
        label="Day"
      >
        <Sun size={15} />
      </DockButton>
      <DockButton
        active={timeOfDay === "night"}
        onClick={() => setTimeOfDay("night")}
        label="Night (N)"
      >
        <Moon size={15} />
      </DockButton>

      <Divider />

      {/* Camera presets */}
      {presets.map((p) => (
        <DockButton
          key={p}
          active={cameraPreset === p}
          onClick={() => setCameraPreset(p)}
          label={CAMERA_LABELS[p].label}
        >
          <span style={{ fontSize: "13px" }}>{CAMERA_LABELS[p].icon}</span>
        </DockButton>
      ))}

      <Divider />

      {/* Toggles */}
      <DockButton
        active={shadows}
        onClick={() => setShadows(!shadows)}
        label={shadows ? "Shadows on" : "Shadows off"}
      >
        {shadows ? <Zap size={14} /> : <ZapOff size={14} />}
      </DockButton>
      <DockButton
        active={showRoads}
        onClick={() => setShowRoads(!showRoads)}
        label={showRoads ? "Hide roads" : "Show roads"}
      >
        <Layers size={14} />
      </DockButton>
      <DockButton
        active={showFPS}
        onClick={() => setShowFPS(!showFPS)}
        label={showFPS ? "Hide FPS" : "Show FPS"}
      >
        <Eye size={14} />
      </DockButton>

      <Divider />

      {/* Screenshot */}
      <DockButton onClick={() => setScreenshot(true)} label="Screenshot (P)">
        <Camera size={15} />
      </DockButton>
    </div>
  );
}
