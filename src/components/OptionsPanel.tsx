import { css } from "@emotion/react";
import { Modal } from "./modal/Modal";
import { Column } from "./flex/Column";
import { Row } from "./flex/Row";
import { Title } from "./text/Title";
import { useSceneStore, CameraPreset } from "@/state/sceneStore";
import { useSettingsStore } from "@/state/settingsStore";
import { useAnnotationStore } from "@/state/annotationStore";
import {
  BORDER_COLOR,
  BRAND_GRADIENT,
  DESC_COLOR,
  SUBTITLE_COLOR,
  SURFACE_MUTED,
} from "@/theme/color";
import {
  Camera,
  Sun,
  Moon,
  Layers as LayersIcon,
  Sparkles,
  Compass,
  Gauge,
  MapPin,
  Trash2,
  Eye,
} from "lucide-react";
import { setLanguage } from "@/i18n";
import { useTranslation } from "react-i18next";
import type { BuildingCategory } from "@/types/overpass";

const CAMERA_PRESETS: { id: CameraPreset }[] = [
  { id: "orbit" },
  { id: "top" },
  { id: "isometric" },
  { id: "first-person" },
];

const CATEGORIES: BuildingCategory[] = [
  "residential",
  "commercial",
  "industrial",
  "religious",
  "education",
  "civic",
  "other",
];

const LANGS = ["en", "fr", "es", "ja"];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      css={css({
        fontSize: "11px",
        fontWeight: 600,
        color: DESC_COLOR,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        marginBottom: "0.25rem",
      })}
    >
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  icon,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <label
      css={css({
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "pointer",
        padding: "0.4rem 0.5rem",
        borderRadius: "8px",
        ":hover": { background: SURFACE_MUTED },
      })}
    >
      <span
        css={css({
          fontSize: "13px",
          color: SUBTITLE_COLOR,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        })}
      >
        {icon}
        {label}
      </span>
      <span
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        css={css({
          width: "34px",
          height: "20px",
          background: checked ? BRAND_GRADIENT : "rgba(15,23,42,0.12)",
          borderRadius: "999px",
          position: "relative",
          transition: "background 0.2s",
        })}
      >
        <span
          css={css({
            position: "absolute",
            top: "2px",
            left: checked ? "16px" : "2px",
            width: "16px",
            height: "16px",
            background: "#fff",
            borderRadius: "50%",
            transition: "left 0.2s cubic-bezier(0.4,0,0.2,1)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          })}
        />
      </span>
    </label>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
  getLabel,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  getLabel: (v: T) => React.ReactNode;
}) {
  return (
    <div
      role="radiogroup"
      css={css({
        display: "flex",
        background: SURFACE_MUTED,
        borderRadius: "10px",
        padding: "3px",
        gap: "2px",
      })}
    >
      {options.map((o) => {
        const active = value === o;
        return (
          <button
            key={o}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o)}
            css={css({
              flex: 1,
              padding: "0.4rem 0.5rem",
              fontSize: "12px",
              fontWeight: 600,
              border: "none",
              borderRadius: "7px",
              background: active ? "#fff" : "transparent",
              color: active ? "#0f172a" : DESC_COLOR,
              boxShadow: active ? "0 1px 3px rgba(15,23,42,0.08)" : "none",
              cursor: "pointer",
              transition: "all 0.18s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.3rem",
            })}
          >
            {getLabel(o)}
          </button>
        );
      })}
    </div>
  );
}

function formatHour(h: number): string {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
}

export function OptionsPanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation();
  const scene = useSceneStore();
  const settings = useSettingsStore();
  const annotations = useAnnotationStore();

  return (
    <Modal isOpen={isOpen} onClose={onClose} isScroll>
      <Column gap="1rem">
        <Title>{t("options.title")}</Title>

        {/* Sun time slider */}
        <Column gap="0.35rem">
          <SectionLabel>
            <Row gap="0.35rem">
              <Sparkles size={11} /> Time of day ·{" "}
              {formatHour(settings.sunHour)}
            </Row>
          </SectionLabel>
          <Row gap="0.5rem">
            <Sun size={14} color="#f59e0b" />
            <input
              type="range"
              min={0}
              max={23.99}
              step={0.25}
              value={settings.sunHour}
              onChange={(e) => settings.setSunHour(parseFloat(e.target.value))}
              aria-label="Sun hour"
              css={css({ flex: 1, accentColor: "#6366f1" })}
            />
            <Moon size={14} color="#6366f1" />
          </Row>
          <Segmented
            options={["day", "night"]}
            value={scene.timeOfDay}
            onChange={(v) => scene.setTimeOfDay(v)}
            getLabel={(v) =>
              v === "day" ? (
                <>
                  <Sun size={12} /> {t("options.day")}
                </>
              ) : (
                <>
                  <Moon size={12} /> {t("options.night")}
                </>
              )
            }
          />
        </Column>

        {/* Camera */}
        <Column gap="0.35rem">
          <SectionLabel>
            <Row gap="0.35rem">
              <Camera size={11} /> {t("options.camera")}
            </Row>
          </SectionLabel>
          <Segmented
            options={CAMERA_PRESETS.map((p) => p.id)}
            value={scene.cameraPreset}
            onChange={(v) => scene.setCameraPreset(v)}
            getLabel={(v) => {
              const labels: Record<CameraPreset, string> = {
                orbit: t("options.orbit"),
                top: t("options.top"),
                isometric: t("options.isometric"),
                "first-person": t("options.firstPerson"),
              };
              return labels[v];
            }}
          />
        </Column>

        {/* Color grade */}
        <Column gap="0.35rem">
          <SectionLabel>Color grade</SectionLabel>
          <Segmented
            options={["none", "sunset", "blueHour", "cyberpunk", "noir", "vibrant"]}
            value={scene.colorGrade}
            onChange={(v) => scene.setColorGrade(v)}
            getLabel={(v) =>
              v === "none"
                ? "Off"
                : v === "blueHour"
                  ? "Blue"
                  : v.charAt(0).toUpperCase() + v.slice(1)
            }
          />
        </Column>

        {/* Weather */}
        <Column gap="0.35rem">
          <SectionLabel>Weather</SectionLabel>
          <Segmented
            options={["clear", "rain", "snow", "fog"]}
            value={scene.weather}
            onChange={(v) => scene.setWeather(v)}
            getLabel={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
          />
        </Column>

        {/* Layers */}
        <Column gap="0.25rem">
          <SectionLabel>
            <Row gap="0.35rem">
              <LayersIcon size={11} /> {t("options.layers")}
            </Row>
          </SectionLabel>
          <Toggle
            label={t("options.showRoads")}
            checked={scene.showRoads}
            onChange={scene.setShowRoads}
          />
          <Toggle
            label={t("options.showWater")}
            checked={scene.showWater}
            onChange={scene.setShowWater}
          />
          <Toggle
            label={t("options.showParks")}
            checked={scene.showParks}
            onChange={scene.setShowParks}
          />
          <Toggle
            label={t("options.showGround")}
            checked={scene.showGround}
            onChange={scene.setShowGround}
          />
          <Toggle
            label="Terrain (DEM)"
            checked={scene.showTerrain}
            onChange={scene.setShowTerrain}
          />
          <Toggle
            label="Clouds"
            checked={scene.showClouds}
            onChange={scene.setShowClouds}
          />
          <Toggle
            label={t("options.shadows")}
            checked={scene.shadowsEnabled}
            onChange={scene.setShadowsEnabled}
          />
        </Column>

        {/* HUD */}
        <Column gap="0.25rem">
          <SectionLabel>HUD</SectionLabel>
          <Toggle
            label="Compass"
            icon={<Compass size={12} />}
            checked={settings.showCompass}
            onChange={settings.setShowCompass}
          />
          <Toggle
            label="FPS counter"
            icon={<Gauge size={12} />}
            checked={settings.showFPS}
            onChange={settings.setShowFPS}
          />
          <Toggle
            label="High contrast"
            icon={<Eye size={12} />}
            checked={settings.highContrast}
            onChange={settings.setHighContrast}
          />
        </Column>

        {/* Filters */}
        <Column gap="0.4rem">
          <SectionLabel>{t("options.buildingTypes")}</SectionLabel>
          <div css={css({ display: "flex", flexWrap: "wrap", gap: "0.35rem" })}>
            {CATEGORIES.map((c) => {
              const active = scene.enabledCategories.has(c);
              return (
                <button
                  key={c}
                  aria-pressed={active}
                  onClick={() => scene.toggleCategory(c)}
                  css={css({
                    padding: "0.3rem 0.6rem",
                    fontSize: "11px",
                    fontWeight: 600,
                    border: `1px solid ${active ? "transparent" : BORDER_COLOR}`,
                    borderRadius: "999px",
                    background: active ? BRAND_GRADIENT : "transparent",
                    color: active ? "#fff" : SUBTITLE_COLOR,
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                  })}
                >
                  {t(`categories.${c}`)}
                </button>
              );
            })}
          </div>
        </Column>

        {/* Height range */}
        <Column gap="0.25rem">
          <SectionLabel>
            {t("options.heightRange")}: {scene.minHeight}m – {scene.maxHeight}m
          </SectionLabel>
          <input
            type="range"
            min={0}
            max={500}
            value={scene.minHeight}
            onChange={(e) =>
              scene.setHeightRange(Number(e.target.value), scene.maxHeight)
            }
            aria-label="Min height"
            css={css({ accentColor: "#6366f1" })}
          />
          <input
            type="range"
            min={0}
            max={500}
            value={scene.maxHeight}
            onChange={(e) =>
              scene.setHeightRange(scene.minHeight, Number(e.target.value))
            }
            aria-label="Max height"
            css={css({ accentColor: "#6366f1" })}
          />
        </Column>

        {/* Annotations */}
        {annotations.items.length > 0 && (
          <Column gap="0.25rem">
            <SectionLabel>
              <Row gap="0.35rem">
                <MapPin size={11} /> Pins ({annotations.items.length})
              </Row>
            </SectionLabel>
            <div
              css={css({
                maxHeight: "120px",
                overflow: "auto",
                border: `1px solid ${BORDER_COLOR}`,
                borderRadius: "8px",
                padding: "0.25rem",
              })}
            >
              {annotations.items.map((a) => (
                <div
                  key={a.id}
                  css={css({
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.3rem 0.5rem",
                    fontSize: "12px",
                    borderRadius: "6px",
                    ":hover": { background: SURFACE_MUTED },
                  })}
                >
                  <span>📍 {a.label}</span>
                  <button
                    onClick={() => annotations.remove(a.id)}
                    aria-label={`Remove pin ${a.label}`}
                    css={css({
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: DESC_COLOR,
                      padding: "2px",
                      display: "flex",
                      ":hover": { color: "#ef4444" },
                    })}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={annotations.clear}
              css={css({
                background: "transparent",
                border: "none",
                color: DESC_COLOR,
                fontSize: "11px",
                fontWeight: 500,
                cursor: "pointer",
                padding: "0.3rem 0",
                textAlign: "left",
                ":hover": { color: "#ef4444" },
              })}
            >
              Clear all pins
            </button>
            <div
              css={css({
                fontSize: "10.5px",
                color: DESC_COLOR,
                lineHeight: 1.4,
              })}
            >
              Tip: hold{" "}
              <kbd
                css={css({
                  background: "#f1f5f9",
                  padding: "0 4px",
                  borderRadius: "3px",
                  fontSize: "10px",
                  fontFamily: "ui-monospace, monospace",
                })}
              >
                Shift
              </kbd>{" "}
              and click anywhere in the 3D scene to drop a pin.
            </div>
          </Column>
        )}

        {/* Language */}
        <Column gap="0.35rem">
          <SectionLabel>{t("options.language")}</SectionLabel>
          <Segmented
            options={LANGS}
            value={i18n.language.slice(0, 2)}
            onChange={(v) => setLanguage(v)}
            getLabel={(v) => v.toUpperCase()}
          />
        </Column>
      </Column>
    </Modal>
  );
}
