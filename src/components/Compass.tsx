import { css } from "@emotion/react";
import { useHeadingStore } from "@/state/headingStore";
import { useSettingsStore } from "@/state/settingsStore";
import { BORDER_COLOR, SHADOW_MD, SURFACE_GLASS } from "@/theme/color";

export function Compass() {
  const heading = useHeadingStore((s) => s.heading);
  const show = useSettingsStore((s) => s.showCompass);

  if (!show) return null;

  // Rotate the rose so the N marker points to where the user is looking-from
  // (i.e. rose rotates -heading)
  const rotation = -heading;

  return (
    <div
      role="img"
      aria-label={`Compass heading: ${Math.round(heading)} degrees`}
      css={css({
        position: "fixed",
        top: "4.25rem",
        right: "1rem",
        zIndex: 1000,
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        background: SURFACE_GLASS,
        backdropFilter: "blur(12px) saturate(180%)",
        border: `1px solid ${BORDER_COLOR}`,
        boxShadow: SHADOW_MD,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        pointerEvents: "none",
      })}
    >
      <svg
        viewBox="0 0 100 100"
        width="56"
        height="56"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: "transform 0.08s linear",
        }}
      >
        {/* Outer ring */}
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="rgba(15,23,42,0.12)"
          strokeWidth="1.5"
        />
        {/* Tick marks for cardinal points */}
        <line
          x1="50"
          y1="6"
          x2="50"
          y2="14"
          stroke="#0f172a"
          strokeWidth="1.5"
        />
        <line
          x1="50"
          y1="86"
          x2="50"
          y2="94"
          stroke="rgba(15,23,42,0.4)"
          strokeWidth="1.5"
        />
        <line
          x1="6"
          y1="50"
          x2="14"
          y2="50"
          stroke="rgba(15,23,42,0.4)"
          strokeWidth="1.5"
        />
        <line
          x1="86"
          y1="50"
          x2="94"
          y2="50"
          stroke="rgba(15,23,42,0.4)"
          strokeWidth="1.5"
        />

        {/* Needle pointing north */}
        <polygon points="50,18 56,52 50,46 44,52" fill="#ef4444" />
        <polygon points="50,82 56,48 50,54 44,48" fill="#94a3b8" />

        {/* N label */}
        <text
          x="50"
          y="32"
          textAnchor="middle"
          fontSize="9"
          fontWeight="700"
          fill="#fff"
          fontFamily="Inter, sans-serif"
        >
          N
        </text>
      </svg>
    </div>
  );
}
