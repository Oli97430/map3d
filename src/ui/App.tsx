import { css, keyframes } from "@emotion/react";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Sparkles,
  FileJson,
  Box,
  Cuboid,
  Smartphone,
} from "lucide-react";

import { FullscreenModal } from "@/components/FullscreenModal";
import { Title } from "@/components/text/Title";
import { Description } from "@/components/text/Description";
import { Column } from "@/components/flex/Column";
import { Row } from "@/components/flex/Row";
import { MapComponent } from "@/components/map/SelectMap";
import {
  Button,
  NextButton,
  PrevButton,
} from "@/components/button/BottomButton";
import { BuildingHeights } from "@/components/map/Processing";
import { Modal } from "@/components/modal/Modal";
import { TopNav } from "@/components/nav/TopNav";
import { ToastContainer } from "@/components/Toast";
import { OptionsPanel } from "@/components/OptionsPanel";
import { ShortcutsHelp } from "@/components/ShortcutsHelp";
import { Hero } from "@/components/Hero";
import { Compass } from "@/components/Compass";
import { MiniMap } from "@/components/MiniMap";
import { GLBDropPreview } from "@/components/GLBDropPreview";
import { SkipLink } from "@/components/SkipLink";
import { AriaAnnouncer, announce } from "@/components/AriaAnnouncer";
import { CityPresets } from "@/components/map/CityPresets";
import { SceneDock } from "@/components/SceneDock";
import { Footer } from "@/components/Footer";

import { useAreaStore } from "@/state/areaStore";
import { useActionStore } from "@/state/exportStore";
import { useSceneStore } from "@/state/sceneStore";
import { useSettingsStore } from "@/state/settingsStore";
import { toast } from "@/state/toastStore";

import { fetchBuildings } from "@/api/overpass";
import { isLargeArea } from "@/utils/geo";
import { LARGE_AREA_THRESHOLD } from "@/config/constants";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { downloadGeoJSON } from "@/utils/geojson";
import { haptic } from "@/utils/haptics";
import { initSentry } from "@/monitoring/sentry";

import type { Building, LatLng } from "@/types/overpass";
import { BRAND_GRADIENT, DESC_COLOR, WARNING_COLOR } from "@/theme/color";

// Lazy load 3D scene
const Space = lazy(() =>
  import("@/three/Space").then((m) => ({ default: m.Space }))
);

const IconSize = css({ width: "14px", height: "14px" });

const spinAnimation = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

function StepBadge({ n }: { n: number }) {
  const { t } = useTranslation();
  return (
    <div
      css={css({
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.3rem 0.7rem",
        background: "rgba(99, 102, 241, 0.1)",
        color: "#6366f1",
        fontSize: "12px",
        fontWeight: 600,
        borderRadius: "999px",
        width: "fit-content",
        marginBottom: "0.25rem",
      })}
    >
      <Sparkles size={12} />
      {t("steps.step", { n })}
    </div>
  );
}

function ThreeDFallback() {
  return (
    <div
      css={css({
        position: "fixed",
        inset: 0,
        background: "#0b1220",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "1rem",
        color: "#94a3b8",
        zIndex: 1,
      })}
    >
      <Loader2
        size={32}
        css={css({
          color: "#6366f1",
          animation: `${spinAnimation} 1s linear infinite`,
        })}
      />
      <div css={css({ fontSize: "13px", fontWeight: 500 })}>
        Loading 3D engine…
      </div>
    </div>
  );
}

function App() {
  const { t } = useTranslation();

  const [isNextButtonDisabled, setIsNextButtonDisabled] = useState(true);
  const [areaData, setAreaData] = useState<LatLng[]>([]);
  const [steps] = useState(["front", "processing", "scene"]);
  const [step, setStep] = useState(0);
  const [isWarnModal, setIsWarnModal] = useState(false);
  const [isExportModal, setIsExportModal] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isFetchingBuildings, setIsFetchingBuildings] = useState(false);
  const [hasFetchedBuildings, setHasFetchedBuildings] = useState(false);
  const [flyTarget, setFlyTarget] = useState<{
    lat: number;
    lng: number;
    zoom?: number;
  } | null>(null);

  const setCenter = useAreaStore((s) => s.setCenter);
  const appendAreas = useAreaStore((s) => s.appendAreas);
  const center = useAreaStore((s) => s.center);
  const setAction = useActionStore((s) => s.setAction);
  const setExportFormat = useActionStore((s) => s.setExportFormat);
  const setScreenshot = useActionStore((s) => s.setScreenshotRequest);
  const toggleTimeOfDay = useSceneStore((s) => s.toggleTimeOfDay);
  const highContrast = useSettingsStore((s) => s.highContrast);
  const { canInstall, promptInstall } = usePWAInstall();

  // Sentry init (no-op without DSN)
  useEffect(() => initSentry(), []);

  // Apply high-contrast class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", highContrast);
  }, [highContrast]);

  // Announce step changes
  useEffect(() => {
    const names = [
      t("steps.selectArea"),
      t("steps.buildings"),
      t("steps.scene"),
    ];
    announce(`${t("steps.step", { n: step + 1 })} — ${names[step]}`);
  }, [step, t]);

  // Prefetch Three.js bundle once we hit step 1 (processing) so step 2 feels instant
  useEffect(() => {
    if (step === 1) {
      void import("@/three/Space");
    }
  }, [step]);

  // ─── Handlers ────────────────────────────────────────────────
  const handleExport = (format: "glb" | "obj" | "stl") => {
    setExportFormat(format);
    setAction(true);
    setIsExportModal(false);
    haptic("success");
    toast.success(t("export.success"));
  };

  const handleDone = (data: LatLng[]) => {
    setAreaData(data);
    setCenter(data);
    setIsNextButtonDisabled(false);
    setBuildings([]);
    setHasFetchedBuildings(false);
    haptic("tap");
  };

  const handleRemove = () => {
    setAreaData([]);
    setIsNextButtonDisabled(true);
    setBuildings([]);
    setHasFetchedBuildings(false);
  };

  const requestBuildings = async () => {
    if (areaData.length < 2) return;
    setIsFetchingBuildings(true);
    const ctrl = new AbortController();
    try {
      const blds = await fetchBuildings(areaData[0], areaData[1], ctrl.signal);
      setBuildings(blds);
      appendAreas(blds);
      setHasFetchedBuildings(true);
      announce(`${blds.length} buildings loaded`);
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        toast.error(t("errors.buildingsFetch"));
        // eslint-disable-next-line no-console
        console.error("Buildings fetch failed:", err);
      }
    } finally {
      setIsFetchingBuildings(false);
    }
  };

  const handleClickNextStep = async () => {
    if (
      step === 0 &&
      areaData.length === 2 &&
      isLargeArea(areaData[0], areaData[1], LARGE_AREA_THRESHOLD)
    ) {
      setIsWarnModal(true);
      return;
    }
    if (step === 1 && !hasFetchedBuildings) {
      await requestBuildings();
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const handleClickPrevStep = () => setStep((s) => Math.max(s - 1, 0));
  const handleClickExport = () => setIsExportModal(true);

  const handleExportGeoJSON = () => {
    if (center.length < 2) return;
    downloadGeoJSON(center[0], center[1]);
    toast.success("GeoJSON downloaded");
  };

  // ─── Keyboard shortcuts ──────────────────────────────────────
  const shortcuts = useMemo(
    () => [
      { key: "?", shift: true, handler: () => setIsShortcutsOpen((v) => !v) },
      {
        key: "arrowright",
        handler: () => {
          if (!isNextButtonDisabled && !isFetchingBuildings)
            handleClickNextStep();
        },
        whenTyping: false,
      },
      {
        key: "arrowleft",
        handler: () => {
          if (step > 0) handleClickPrevStep();
        },
        whenTyping: false,
      },
      { key: "n", handler: () => toggleTimeOfDay(), whenTyping: false },
      {
        key: "p",
        handler: () => {
          if (step === 2) setScreenshot(true);
        },
        whenTyping: false,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      isNextButtonDisabled,
      isFetchingBuildings,
      step,
      toggleTimeOfDay,
      setScreenshot,
    ]
  );
  useKeyboardShortcuts(shortcuts);

  return (
    <div css={css({ height: "100%", width: "100%" })}>
      <SkipLink />
      <AriaAnnouncer />
      <TopNav
        step={step}
        onOpenOptions={() => setIsOptionsOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      <main
        id="main"
        tabIndex={-1}
        css={css({
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          outline: "none",
        })}
      >
        {/* ─── STEP 0: SELECT AREA ─────────────────────────────── */}
        <FullscreenModal isOpen={steps[step] === "front"}>
          <Column gap="1.5rem">
            <Hero />
            <CityPresets
              onPick={(c) =>
                setFlyTarget({
                  lat: c.center[0],
                  lng: c.center[1],
                  zoom: c.zoom,
                })
              }
            />
            <MapComponent
              onRemove={handleRemove}
              onDone={handleDone}
              flyTarget={flyTarget}
            />
            {canInstall && (
              <div
                css={css({
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  alignSelf: "flex-start",
                  marginTop: "0.5rem",
                })}
              >
                <Button
                  isShow
                  variant="secondary"
                  onClick={() => promptInstall()}
                >
                  <Smartphone css={IconSize} /> Install Map3D
                </Button>
              </div>
            )}
          </Column>
        </FullscreenModal>

        {/* ─── STEP 1: PROCESSING ──────────────────────────────── */}
        <FullscreenModal isOpen={steps[step] === "processing"}>
          <Column gap="1.25rem">
            <Column gap="0.5rem">
              <StepBadge n={2} />
              <Title>{t("processing.title")}</Title>
              <Description>
                <span
                  dangerouslySetInnerHTML={{ __html: t("processing.desc") }}
                />
              </Description>
              <BuildingHeights
                buildings={buildings}
                loading={isFetchingBuildings}
              />
            </Column>
          </Column>
        </FullscreenModal>

        {/* ─── 3D SCENE (lazy) ─────────────────────────────────── */}
        {steps[step] === "scene" && (
          <>
            <Suspense fallback={<ThreeDFallback />}>
              <Space />
            </Suspense>
            <Compass />
            <MiniMap />
            <SceneDock />
          </>
        )}

        {/* ─── NAV BUTTONS ─────────────────────────────────────── */}
        <PrevButton isShow={step !== 0} onClick={handleClickPrevStep}>
          <ChevronLeft css={IconSize} /> {t("buttons.prev")}
        </PrevButton>

        <NextButton
          isShow={step !== 2}
          disabled={isNextButtonDisabled || isFetchingBuildings}
          onClick={handleClickNextStep}
        >
          {isFetchingBuildings ? (
            <>
              <Loader2
                css={[
                  IconSize,
                  css({ animation: `${spinAnimation} 1s linear infinite` }),
                ]}
              />
              {t("buttons.fetching")}
            </>
          ) : (
            <>
              {t("buttons.next")} <ChevronRight css={IconSize} />
            </>
          )}
        </NextButton>

        <NextButton isShow={step === 2} onClick={handleClickExport}>
          {t("buttons.exportGLB")} <Download css={IconSize} />
        </NextButton>

        {/* ─── WARN MODAL ──────────────────────────────────────── */}
        <Modal isOpen={isWarnModal} onClose={() => setIsWarnModal(false)}>
          <Column gap="0.85rem">
            <div
              css={css({
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: `${WARNING_COLOR}22`,
                color: WARNING_COLOR,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              })}
            >
              <AlertTriangle size={22} />
            </div>
            <Title>{t("warn.title")}</Title>
            <Description>{t("warn.desc")}</Description>
            <Row gap="0.5rem" justify="flex-end">
              <Button
                isShow
                variant="secondary"
                onClick={() => setIsWarnModal(false)}
              >
                {t("buttons.cancel")}
              </Button>
              <Button
                isShow
                onClick={() => {
                  setStep((s) => Math.min(s + 1, steps.length - 1));
                  setIsWarnModal(false);
                }}
              >
                {t("buttons.continue")} <ChevronRight css={IconSize} />
              </Button>
            </Row>
          </Column>
        </Modal>

        {/* ─── EXPORT MODAL ────────────────────────────────────── */}
        <Modal isOpen={isExportModal} onClose={() => setIsExportModal(false)}>
          <Column gap="0.85rem">
            <div
              css={css({
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: BRAND_GRADIENT,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              })}
            >
              <Download size={20} />
            </div>
            <Title>{t("export.title")}</Title>
            <Description>{t("export.desc")}</Description>
            <Row gap="0.5rem">
              <Button isShow onClick={() => handleExport("glb")}>
                <Download css={IconSize} /> GLB
              </Button>
              <Button
                isShow
                variant="secondary"
                onClick={() => handleExport("obj")}
              >
                <Cuboid css={IconSize} /> OBJ
              </Button>
              <Button
                isShow
                variant="secondary"
                onClick={() => handleExport("stl")}
              >
                <Box css={IconSize} /> STL
              </Button>
            </Row>
            <Row gap="0.5rem">
              <Button
                isShow
                variant="secondary"
                onClick={() => {
                  setIsExportModal(false);
                  setScreenshot(true);
                }}
              >
                {t("export.screenshot")}
              </Button>
              <Button isShow variant="secondary" onClick={handleExportGeoJSON}>
                <FileJson css={IconSize} /> GeoJSON
              </Button>
            </Row>
            <div
              css={css({
                fontSize: "11px",
                color: DESC_COLOR,
                marginTop: "0.25rem",
              })}
            >
              {t("export.tip")}
            </div>
          </Column>
        </Modal>

        {/* ─── OPTIONS PANEL ───────────────────────────────────── */}
        <OptionsPanel
          isOpen={isOptionsOpen}
          onClose={() => setIsOptionsOpen(false)}
        />

        {/* ─── SHORTCUTS HELP ──────────────────────────────────── */}
        <ShortcutsHelp
          isOpen={isShortcutsOpen}
          onClose={() => setIsShortcutsOpen(false)}
        />

        {/* ─── TOAST CONTAINER ─────────────────────────────────── */}
        <ToastContainer />

        {/* ─── GLB DROP PREVIEW (always on) ────────────────────── */}
        <GLBDropPreview />

        {/* ─── FOOTER ──────────────────────────────────────────── */}
        {step !== 2 && <Footer />}
      </main>
    </div>
  );
}

export default App;
