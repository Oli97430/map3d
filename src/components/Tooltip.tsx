import { css, keyframes } from "@emotion/react";
import { cloneElement, isValidElement, ReactElement, useState } from "react";

const fadeIn = keyframes`
  from { opacity: 0; transform: translate(-50%, 4px); }
  to   { opacity: 1; transform: translate(-50%, 0); }
`;

interface TooltipProps {
  label: string;
  children: ReactElement<any>;
  side?: "top" | "bottom";
  delay?: number;
}

export function Tooltip({
  label,
  children,
  side = "bottom",
  delay = 350,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(
    null
  );

  if (!isValidElement(children)) return children;

  const show = () => {
    const t = setTimeout(() => setOpen(true), delay);
    setTimer(t);
  };
  const hide = () => {
    if (timer) clearTimeout(timer);
    setOpen(false);
  };

  // Compose wrapper that forwards refs/listeners via cloneElement
  const trigger = cloneElement(children as ReactElement<any>, {
    onMouseEnter: show,
    onMouseLeave: hide,
    onFocus: show,
    onBlur: hide,
  });

  return (
    <span
      css={css({
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
      })}
    >
      {trigger}
      {open && (
        <span
          role="tooltip"
          css={css({
            position: "absolute",
            [side === "top" ? "bottom" : "top"]: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#0f172a",
            color: "#fff",
            padding: "5px 9px",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: 500,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 99999,
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            animation: `${fadeIn} 0.18s ease`,
          })}
        >
          {label}
        </span>
      )}
    </span>
  );
}
