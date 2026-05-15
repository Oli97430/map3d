import { css, keyframes } from "@emotion/react";
import { Loader2, Building2, Layers, Ruler, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCountUp } from "@/hooks/useCountUp";
import {
  BORDER_COLOR,
  BRAND_GRADIENT,
  DESC_COLOR,
  SHADOW_MD,
  SUBTITLE_COLOR,
  SURFACE_SOLID,
  TITLE_COLOR,
} from "@/theme/color";
import type { Building } from "@/types/overpass";

// Re-export so existing imports keep working
export type { Building } from "@/types/overpass";

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  const animated = useCountUp(value, 700);
  return (
    <div
      css={css({
        flex: "1 1 0",
        minWidth: "160px",
        background: SURFACE_SOLID,
        border: `1px solid ${BORDER_COLOR}`,
        borderRadius: "12px",
        padding: "1rem 1.1rem",
        boxShadow: SHADOW_MD,
        display: "flex",
        alignItems: "center",
        gap: "0.85rem",
      })}
    >
      <div
        css={css({
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          background: BRAND_GRADIENT,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        })}
      >
        {icon}
      </div>
      <div>
        <div
          css={css({
            fontSize: "11px",
            color: DESC_COLOR,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          })}
        >
          {label}
        </div>
        <div
          css={css({
            fontSize: "18px",
            fontWeight: 700,
            color: TITLE_COLOR,
            letterSpacing: "-0.02em",
            fontVariantNumeric: "tabular-nums",
          })}
        >
          {animated.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

function BuildingCard({ b, index }: { b: Building; index: number }) {
  const name = b.tags.name || `Building #${b.id}`;
  const type =
    b.tags.building && b.tags.building !== "yes" ? b.tags.building : null;
  const height = b.tags.height;
  const levels = b.tags["building:levels"];
  const points = b.geometry?.length || 0;

  return (
    <div
      css={css({
        background: SURFACE_SOLID,
        border: `1px solid ${BORDER_COLOR}`,
        borderRadius: "12px",
        padding: "0.85rem 1rem",
        boxShadow: SHADOW_MD,
        animation: `${fadeUp} 0.4s ease ${Math.min(index, 20) * 0.02}s backwards`,
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        ":hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 20px rgba(15, 23, 42, 0.10)",
        },
      })}
    >
      <div
        css={css({
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "0.5rem",
        })}
      >
        <div
          css={css({
            display: "flex",
            alignItems: "center",
            gap: "0.55rem",
            minWidth: 0,
          })}
        >
          <Building2 size={15} color="#6366f1" />
          <span
            css={css({
              fontWeight: 600,
              fontSize: "13px",
              color: SUBTITLE_COLOR,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            })}
          >
            {name}
          </span>
        </div>
        {type && (
          <span
            css={css({
              fontSize: "10px",
              fontWeight: 600,
              color: "#6366f1",
              background: "rgba(99, 102, 241, 0.1)",
              padding: "2px 8px",
              borderRadius: "999px",
              textTransform: "capitalize",
              flexShrink: 0,
            })}
          >
            {type}
          </span>
        )}
      </div>

      <div
        css={css({
          display: "flex",
          gap: "0.85rem",
          marginTop: "0.5rem",
          fontSize: "11px",
          color: DESC_COLOR,
        })}
      >
        {height && (
          <span
            css={css({
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
            })}
          >
            <Ruler size={11} /> {height}m
          </span>
        )}
        {levels && (
          <span
            css={css({
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
            })}
          >
            <Layers size={11} /> {levels} levels
          </span>
        )}
        {points > 0 && (
          <span
            css={css({
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
            })}
          >
            <MapPin size={11} /> {points} pts
          </span>
        )}
      </div>
    </div>
  );
}

export function BuildingHeights({
  buildings,
  loading,
}: {
  buildings: Building[];
  loading: boolean;
}) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        css={css({
          marginTop: "1rem",
          background: SURFACE_SOLID,
          border: `1px solid ${BORDER_COLOR}`,
          borderRadius: "12px",
          padding: "2rem",
          boxShadow: SHADOW_MD,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "0.85rem",
        })}
      >
        <Loader2
          css={css({
            animation: `${spin} 1s linear infinite`,
            color: "#6366f1",
          })}
          size={28}
        />
        <div
          css={css({
            color: SUBTITLE_COLOR,
            fontWeight: 600,
            fontSize: "14px",
            animation: `${pulse} 1.5s ease infinite`,
          })}
        >
          {t("processing.loading")}
        </div>
        <div css={css({ color: DESC_COLOR, fontSize: "12px" })}>
          {t("processing.loadingHint")}
        </div>
      </div>
    );
  }

  if (buildings.length === 0) {
    return (
      <div
        css={css({
          marginTop: "1rem",
          background: SURFACE_SOLID,
          border: `1px dashed ${BORDER_COLOR}`,
          borderRadius: "12px",
          padding: "2rem",
          color: DESC_COLOR,
          fontSize: "13px",
          textAlign: "center",
        })}
        dangerouslySetInnerHTML={{ __html: t("processing.empty") }}
      />
    );
  }

  const withHeight = buildings.filter((b) => b.tags.height).length;
  const withLevels = buildings.filter((b) => b.tags["building:levels"]).length;

  return (
    <div
      css={css({
        marginTop: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      })}
    >
      <div
        css={css({
          display: "flex",
          gap: "0.85rem",
          flexWrap: "wrap",
        })}
      >
        <Stat
          icon={<Building2 size={18} />}
          label={t("processing.stats.buildings")}
          value={buildings.length}
        />
        <Stat
          icon={<Ruler size={18} />}
          label={t("processing.stats.withHeight")}
          value={withHeight}
        />
        <Stat
          icon={<Layers size={18} />}
          label={t("processing.stats.withLevels")}
          value={withLevels}
        />
      </div>

      <div
        css={css({
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "0.7rem",
          maxHeight: "55vh",
          overflowY: "auto",
          paddingRight: "0.25rem",
          paddingBottom: "0.25rem",
        })}
      >
        {buildings.map((b, i) => (
          <BuildingCard key={b.id} b={b} index={i} />
        ))}
      </div>
    </div>
  );
}
