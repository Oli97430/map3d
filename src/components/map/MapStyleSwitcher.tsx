import { css, keyframes } from "@emotion/react";
import { Check } from "lucide-react";
import { useEffect, useRef } from "react";
import { MAP_STYLES } from "@/config/mapStyles";
import { useSettingsStore } from "@/state/settingsStore";
import {
  BORDER_COLOR,
  SHADOW_LG,
  SURFACE_SOLID,
  TITLE_COLOR,
} from "@/theme/color";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export function MapStyleSwitcher({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const mapStyleId = useSettingsStore((s) => s.mapStyle);
  const setMapStyle = useSettingsStore((s) => s.setMapStyle);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    setTimeout(() => window.addEventListener("mousedown", onClick), 0);
    return () => window.removeEventListener("mousedown", onClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      role="menu"
      css={css({
        position: "absolute",
        zIndex: 10000,
        right: "1rem",
        top: "3.6rem",
        background: SURFACE_SOLID,
        border: `1px solid ${BORDER_COLOR}`,
        borderRadius: "12px",
        padding: "0.5rem",
        boxShadow: SHADOW_LG,
        animation: `${fadeIn} 0.18s ease`,
        minWidth: "180px",
      })}
    >
      {MAP_STYLES.map((s) => {
        const active = s.id === mapStyleId;
        return (
          <button
            key={s.id}
            role="menuitemradio"
            aria-checked={active}
            onClick={() => {
              setMapStyle(s.id);
              onClose();
            }}
            css={css({
              display: "flex",
              width: "100%",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.45rem 0.55rem",
              borderRadius: "8px",
              border: "none",
              background: active ? "rgba(99, 102, 241, 0.1)" : "transparent",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 500,
              color: TITLE_COLOR,
              textAlign: "left",
              transition: "background 0.15s ease",
              ":hover": {
                background: active
                  ? "rgba(99, 102, 241, 0.15)"
                  : "rgba(15, 23, 42, 0.04)",
              },
            })}
          >
            <span
              css={css({
                width: "28px",
                height: "20px",
                borderRadius: "5px",
                background: s.preview,
                border: `1px solid ${BORDER_COLOR}`,
                flexShrink: 0,
              })}
            />
            <span css={css({ flex: 1 })}>{s.label}</span>
            {active && <Check size={14} color="#6366f1" />}
          </button>
        );
      })}
    </div>
  );
}
