import { css, keyframes } from "@emotion/react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { BORDER_COLOR, SHADOW_LG } from "@/theme/color";
import { useToastStore, ToastType } from "@/state/toastStore";

const slideIn = keyframes`
  from { transform: translateX(120%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
`;

const ICONS: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};
const ACCENTS: Record<ToastType, string> = {
  success: "#10b981",
  error: "#ef4444",
  info: "#6366f1",
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);
  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="Notifications"
      css={css({
        position: "fixed",
        bottom: "5.5rem",
        right: "1.75rem",
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        pointerEvents: "none",
        "@media (max-width: 768px)": {
          right: "1rem",
          left: "1rem",
          bottom: "5rem",
        },
      })}
    >
      {toasts.map((t) => {
        const Icon = ICONS[t.type];
        const accent = ACCENTS[t.type];
        return (
          <div
            key={t.id}
            role="status"
            css={css({
              background: "#ffffff",
              border: `1px solid ${BORDER_COLOR}`,
              borderLeft: `3px solid ${accent}`,
              borderRadius: "12px",
              padding: "0.85rem 1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.7rem",
              minWidth: "280px",
              maxWidth: "400px",
              boxShadow: SHADOW_LG,
              animation: `${slideIn} 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)`,
              pointerEvents: "auto",
            })}
          >
            <Icon size={18} color={accent} />
            <span
              css={css({
                flex: 1,
                fontSize: "13px",
                color: "#0f172a",
                fontWeight: 500,
              })}
            >
              {t.message}
            </span>
            <button
              onClick={() => remove(t.id)}
              aria-label="Dismiss notification"
              css={css({
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
                padding: "0.2rem",
                display: "flex",
                alignItems: "center",
                borderRadius: "6px",
                ":hover": {
                  background: "rgba(15, 23, 42, 0.06)",
                  color: "#0f172a",
                },
              })}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
