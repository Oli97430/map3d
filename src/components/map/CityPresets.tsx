import { css } from "@emotion/react";
import { CITY_PRESETS, CityPreset } from "@/config/cityPresets";
import { BORDER_COLOR, DESC_COLOR } from "@/theme/color";

export function CityPresets({
  onPick,
}: {
  onPick: (preset: CityPreset) => void;
}) {
  return (
    <div
      css={css({
        display: "flex",
        gap: "0.45rem",
        flexWrap: "wrap",
        marginTop: "0.5rem",
      })}
    >
      <span
        css={css({
          fontSize: "11px",
          color: DESC_COLOR,
          fontWeight: 500,
          marginRight: "0.3rem",
          alignSelf: "center",
        })}
      >
        Quick pick:
      </span>
      {CITY_PRESETS.map((c) => (
        <button
          key={c.id}
          onClick={() => onPick(c)}
          css={css({
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            padding: "0.3rem 0.65rem",
            fontSize: "12px",
            fontWeight: 600,
            background: "#ffffff",
            border: `1px solid ${BORDER_COLOR}`,
            borderRadius: "999px",
            cursor: "pointer",
            transition: "all 0.18s ease",
            ":hover": {
              borderColor: "#6366f1",
              transform: "translateY(-1px)",
              boxShadow: "0 4px 8px rgba(99,102,241,0.15)",
            },
          })}
        >
          <span>{c.flag}</span>
          <span>{c.name}</span>
        </button>
      ))}
    </div>
  );
}
