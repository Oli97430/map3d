import { css } from "@emotion/react";
import { useAreaStore } from "@/state/areaStore";
import { BORDER_COLOR, SHADOW_LG, SURFACE_GLASS } from "@/theme/color";
import { useSettingsStore } from "@/state/settingsStore";
import { MAP_STYLES } from "@/config/mapStyles";

/**
 * Static OSM static tile of the current bounding box, shown in the 3D view.
 * Uses the standard OSM tile (not bound to mapStyleId since static map providers
 * aren't always available).
 */
export function MiniMap() {
  const center = useAreaStore((s) => s.center);
  const mapStyleId = useSettingsStore((s) => s.mapStyle);
  if (!center || center.length < 2) return null;

  const ne = center[0];
  const sw = center[1];
  const lat = (ne.lat + sw.lat) / 2;
  const lng = (ne.lng + sw.lng) / 2;

  // pick a single tile at zoom 13 around center
  const zoom = 13;
  const tileX = Math.floor(((lng + 180) / 360) * Math.pow(2, zoom));
  const tileY = Math.floor(
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
      Math.pow(2, zoom)
  );
  const style = MAP_STYLES.find((s) => s.id === mapStyleId) || MAP_STYLES[0];
  const tileUrl = style.url
    .replace("{s}", "a")
    .replace("{z}", String(zoom))
    .replace("{x}", String(tileX))
    .replace("{y}", String(tileY));

  return (
    <div
      role="img"
      aria-label="Mini-map of selected area"
      css={css({
        position: "fixed",
        bottom: "5.5rem",
        left: "1rem",
        zIndex: 1000,
        width: "140px",
        height: "140px",
        borderRadius: "12px",
        overflow: "hidden",
        background: SURFACE_GLASS,
        border: `1px solid ${BORDER_COLOR}`,
        boxShadow: SHADOW_LG,
        backdropFilter: "blur(8px)",
        "@media (max-width: 768px)": { display: "none" },
      })}
    >
      <img
        src={tileUrl}
        alt=""
        loading="lazy"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
      {/* Overlay bbox */}
      <div
        css={css({
          position: "absolute",
          inset: "30%",
          border: "2px solid #6366f1",
          borderRadius: "3px",
          boxShadow: "0 0 0 9999px rgba(15,23,42,0.25)",
          pointerEvents: "none",
        })}
      />
    </div>
  );
}
