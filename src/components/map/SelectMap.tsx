import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  Rectangle,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L, { LatLng, LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";
import { css } from "@emotion/react";
import { CircleMinus, MousePointerClick, Info, Layers } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { rectangleAreaKm2 } from "@/utils/geo";
import { AddressSearch } from "./AddressSearch";
import { MapStyleSwitcher } from "./MapStyleSwitcher";
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "@/config/constants";
import { MAP_STYLES } from "@/config/mapStyles";
import { useSettingsStore } from "@/state/settingsStore";
import { readViewState, writeViewState } from "@/utils/urlState";
import {
  BORDER_COLOR,
  BRAND_GRADIENT,
  BRAND_GRADIENT_HOVER,
  DANGER_COLOR,
  DANGER_HOVER,
  DESC_COLOR,
  SHADOW_LG,
  SHADOW_MD,
  SURFACE_GLASS,
  SURFACE_GLASS_HOVER,
} from "@/theme/color";

const IconSize = css({ width: "14px", height: "14px" });

function RectangleSelector({
  isDrag,
  drawBounds,
  onChange,
  onDrawChange,
}: {
  isDrag: boolean;
  bounds: LatLngBounds | null;
  drawBounds: LatLngBounds | null;
  onChange: (bounds: LatLngBounds) => void;
  onDrawChange: (bounds: LatLngBounds) => void;
}) {
  const [firstPoint, setFirstPoint] = useState<LatLng | null>(null);
  const lastLatlngRef = useRef<LatLng | null>(null);

  const adjustLng = (latlng: LatLng): LatLng => {
    const adjustedLng = ((((latlng.lng + 180) % 360) + 360) % 360) - 180;
    return new L.LatLng(latlng.lat, adjustedLng);
  };

  const map = useMapEvents({
    mousedown(e) {
      if (!isDrag) setFirstPoint(e.latlng);
    },
    mousemove(e) {
      if (firstPoint) {
        lastLatlngRef.current = adjustLng(e.latlng);
        onDrawChange(new L.LatLngBounds(firstPoint, e.latlng));
        onChange(
          new L.LatLngBounds(adjustLng(firstPoint), adjustLng(e.latlng))
        );
      }
    },
    mouseup(e) {
      if (firstPoint) {
        onDrawChange(new L.LatLngBounds(firstPoint, e.latlng));
        onChange(
          new L.LatLngBounds(adjustLng(firstPoint), adjustLng(e.latlng))
        );
        setFirstPoint(null);
      }
    },
    moveend() {
      const c = map.getCenter();
      writeViewState({ lat: c.lat, lng: c.lng, zoom: map.getZoom() });
    },
    zoomend() {
      const c = map.getCenter();
      writeViewState({ lat: c.lat, lng: c.lng, zoom: map.getZoom() });
    },
  });

  useEffect(() => {
    const container = map.getContainer();
    const handleTouchStart = (e: TouchEvent) => {
      if (!isDrag && e.touches.length > 0) {
        const latlng = map.mouseEventToLatLng(
          e.touches[0] as unknown as MouseEvent
        );
        setFirstPoint(latlng);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (firstPoint && e.touches.length > 0) {
        const latlng = map.mouseEventToLatLng(
          e.touches[0] as unknown as MouseEvent
        );
        lastLatlngRef.current = latlng;
        onDrawChange(new L.LatLngBounds(firstPoint, latlng));
        onChange(new L.LatLngBounds(adjustLng(firstPoint), adjustLng(latlng)));
      }
    };
    const handleTouchEnd = () => {
      if (firstPoint) {
        const latlng = lastLatlngRef.current || firstPoint;
        onDrawChange(new L.LatLngBounds(firstPoint, latlng));
        onChange(new L.LatLngBounds(adjustLng(firstPoint), adjustLng(latlng)));
        setFirstPoint(null);
      }
    };
    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleTouchEnd);
    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [map, isDrag, firstPoint, onChange, onDrawChange]);

  useEffect(() => {
    if (map) {
      if (isDrag) map.dragging.enable();
      else map.dragging.disable();
    }
  }, [isDrag, map]);

  return drawBounds ? (
    <Rectangle
      bounds={drawBounds}
      pathOptions={{
        color: "#6366f1",
        fillColor: "#6366f1",
        fillOpacity: 0.18,
        weight: 2,
      }}
    />
  ) : null;
}

/** Programmatic pan/zoom (called from search results). */
function MapController({
  target,
}: {
  target: { lat: number; lng: number; zoom?: number } | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (target)
      map.flyTo([target.lat, target.lng], target.zoom ?? 14, { duration: 0.8 });
  }, [target, map]);
  return null;
}

export function MapComponent({
  onDone,
  onRemove,
  flyTarget: externalFlyTarget,
}: {
  onDone: (corners: { lat: number; lng: number }[]) => void;
  onRemove: () => void;
  flyTarget?: { lat: number; lng: number; zoom?: number } | null;
}) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const mapStyleId = useSettingsStore((s) => s.mapStyle);
  const mapStyle = MAP_STYLES.find((m) => m.id === mapStyleId) || MAP_STYLES[0];

  const [isDrag, setIsDrag] = useState(true);
  const [bounds, setBounds] = useState<LatLngBounds | null>(null);
  const [drawBounds, setDrawBounds] = useState<LatLngBounds | null>(null);
  const [internalFlyTarget, setFlyTarget] = useState<{
    lat: number;
    lng: number;
    zoom?: number;
  } | null>(null);
  const flyTarget = externalFlyTarget ?? internalFlyTarget;
  const [stylePickerOpen, setStylePickerOpen] = useState(false);

  // Read URL state once
  const initialView = readViewState();
  const startCenter: [number, number] = initialView
    ? [initialView.lat, initialView.lng]
    : DEFAULT_CENTER;
  const startZoom = initialView?.zoom ?? DEFAULT_ZOOM;

  const handleClickSwitchDrag = () => setIsDrag(!isDrag);

  const handleClickRemoveBox = () => {
    onRemove();
    setBounds(null);
    setDrawBounds(null);
    setIsDrag(true);
  };

  const handleChangeDone = (e: LatLngBounds) => {
    setBounds(e);
    const ne = e.getNorthEast();
    const sw = e.getSouthWest();
    onDone([
      { lat: ne.lat, lng: ne.lng },
      { lat: sw.lat, lng: sw.lng },
    ]);
  };

  const handleChangeDraw = (e: LatLngBounds) => {
    setDrawBounds(e);
    const ne = e.getNorthEast();
    const sw = e.getSouthWest();
    onDone([
      { lat: ne.lat, lng: ne.lng },
      { lat: sw.lat, lng: sw.lng },
    ]);
  };

  const areaKm2 = bounds
    ? rectangleAreaKm2(
        { lat: bounds.getNorth(), lng: bounds.getEast() },
        { lat: bounds.getSouth(), lng: bounds.getWest() }
      )
    : 0;

  return (
    <div
      css={css({
        position: "relative",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: SHADOW_LG,
        border: `1px solid ${BORDER_COLOR}`,
      })}
    >
      <AddressSearch
        onSelect={(r) =>
          setFlyTarget({
            lat: parseFloat(r.lat),
            lng: parseFloat(r.lon),
            zoom: 15,
          })
        }
      />

      <div
        css={css({
          position: "absolute",
          zIndex: 9999,
          right: "1rem",
          top: "1rem",
          display: "flex",
          gap: "0.5rem",
          alignItems: "flex-start",
        })}
      >
        <button
          aria-label="Map style"
          title="Map style"
          onClick={() => setStylePickerOpen((v) => !v)}
          css={css({
            background: SURFACE_GLASS,
            backdropFilter: "blur(12px) saturate(180%)",
            border: `1px solid ${BORDER_COLOR}`,
            padding: "0.55rem",
            borderRadius: "10px",
            cursor: "pointer",
            color: "#0f172a",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "13px",
            fontWeight: 600,
            boxShadow: SHADOW_MD,
            transition: "all 0.2s ease",
            ":hover": {
              background: SURFACE_GLASS_HOVER,
              transform: "translateY(-1px)",
            },
          })}
        >
          <Layers size={14} />
        </button>

        <button
          aria-label={t("map.remove")}
          css={css({
            display: bounds == null || isDrag ? "none" : "inline-flex",
            color: "#ffffff",
            background: `linear-gradient(135deg, ${DANGER_COLOR} 0%, ${DANGER_HOVER} 100%)`,
            border: "none",
            padding: "0.55rem 0.95rem",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            alignItems: "center",
            gap: "0.45rem",
            boxShadow: "0 4px 12px rgba(239,68,68,0.35)",
            transition: "all 0.2s ease",
            ":hover": {
              transform: "translateY(-1px)",
              boxShadow: "0 8px 20px rgba(239,68,68,0.5)",
            },
          })}
          onClick={handleClickRemoveBox}
        >
          <CircleMinus css={IconSize} /> {t("map.remove")}
        </button>

        <button
          aria-pressed={!isDrag}
          aria-label={isDrag ? t("map.selectArea") : t("map.backToDrag")}
          css={css({
            color: isDrag ? "#fff" : "#0f172a",
            background: isDrag ? BRAND_GRADIENT : SURFACE_GLASS,
            backdropFilter: "blur(12px) saturate(180%)",
            border: isDrag ? "none" : `1px solid ${BORDER_COLOR}`,
            padding: "0.55rem 0.95rem",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            boxShadow: isDrag ? "0 4px 12px rgba(99,102,241,0.35)" : SHADOW_MD,
            transition: "all 0.2s ease",
            ":hover": {
              background: isDrag ? BRAND_GRADIENT_HOVER : SURFACE_GLASS_HOVER,
              transform: "translateY(-1px)",
            },
          })}
          onClick={handleClickSwitchDrag}
        >
          {isDrag ? (
            <>
              <MousePointerClick css={IconSize} />
              <span>{t("map.selectArea")}</span>
            </>
          ) : (
            <span>{t("map.backToDrag")}</span>
          )}
        </button>
      </div>

      <MapStyleSwitcher
        isOpen={stylePickerOpen}
        onClose={() => setStylePickerOpen(false)}
      />

      {bounds && (
        <div
          aria-live="polite"
          css={css({
            position: "absolute",
            zIndex: 9999,
            left: "1rem",
            bottom: "1rem",
            background: SURFACE_GLASS,
            backdropFilter: "blur(12px) saturate(180%)",
            border: `1px solid ${BORDER_COLOR}`,
            borderRadius: "10px",
            padding: "0.6rem 0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.55rem",
            boxShadow: SHADOW_MD,
            fontSize: "12px",
            color: DESC_COLOR,
          })}
        >
          <Info size={14} color="#6366f1" />
          <span>
            {t("map.area")}:{" "}
            <strong css={css({ color: "#0f172a" })}>
              {areaKm2.toFixed(2)} km²
            </strong>
          </span>
        </div>
      )}

      {!isDrag && !bounds && (
        <div
          role="status"
          aria-live="polite"
          css={css({
            position: "absolute",
            zIndex: 9999,
            left: "50%",
            top: "1rem",
            transform: "translateX(-50%)",
            background: BRAND_GRADIENT,
            color: "#fff",
            borderRadius: "10px",
            padding: "0.55rem 1rem",
            fontSize: "12px",
            fontWeight: 500,
            boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            "@media (max-width: 640px)": { top: "4rem" },
          })}
        >
          <MousePointerClick size={13} /> {t("map.drawHint")}
        </div>
      )}

      <MapContainer
        center={startCenter}
        zoom={startZoom}
        style={{
          height: isMobile ? "55vh" : "70vh",
          width: "100%",
        }}
        attributionControl={!isMobile}
      >
        <TileLayer
          key={mapStyle.id}
          attribution={mapStyle.attribution}
          url={mapStyle.url}
          maxZoom={mapStyle.maxZoom ?? 19}
        />
        <RectangleSelector
          bounds={bounds}
          drawBounds={drawBounds}
          isDrag={isDrag}
          onChange={handleChangeDone}
          onDrawChange={handleChangeDraw}
        />
        <MapController target={flyTarget} />
      </MapContainer>
    </div>
  );
}
