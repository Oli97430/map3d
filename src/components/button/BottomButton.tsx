import { css } from "@emotion/react";
import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import {
  BORDER_COLOR,
  BRAND_GRADIENT,
  BRAND_GRADIENT_HOVER,
  SHADOW_BRAND,
  SHADOW_MD,
  SURFACE_GLASS,
  SURFACE_GLASS_HOVER,
} from "@/theme/color";

interface ButtonProps extends DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> {
  isShow?: boolean;
  variant?: "primary" | "secondary";
}

const baseButton = css({
  border: "none",
  padding: "0.75rem 1.4rem",
  borderRadius: "10px",
  fontWeight: 600,
  fontSize: "13px",
  letterSpacing: "0.01em",
  cursor: "pointer",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  alignItems: "center",
  gap: "0.5rem",
  willChange: "transform, box-shadow",
});

const primaryStyle = css({
  color: "#ffffff",
  background: BRAND_GRADIENT,
  boxShadow: SHADOW_BRAND,
  ":hover:not(:disabled)": {
    background: BRAND_GRADIENT_HOVER,
    transform: "translateY(-2px)",
    boxShadow: "0 12px 28px rgba(99, 102, 241, 0.45)",
  },
  ":active:not(:disabled)": {
    transform: "translateY(0)",
  },
  ":disabled": {
    background: "linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)",
    boxShadow: "none",
    cursor: "not-allowed",
    opacity: 0.7,
  },
});

const secondaryStyle = css({
  color: "#0f172a",
  background: SURFACE_GLASS,
  backdropFilter: "blur(12px) saturate(180%)",
  border: `1px solid ${BORDER_COLOR}`,
  boxShadow: SHADOW_MD,
  ":hover:not(:disabled)": {
    background: SURFACE_GLASS_HOVER,
    transform: "translateY(-2px)",
    boxShadow: "0 12px 28px rgba(15, 23, 42, 0.12)",
  },
  ":active:not(:disabled)": {
    transform: "translateY(0)",
  },
  ":disabled": {
    opacity: 0.5,
    cursor: "not-allowed",
  },
});

export function NextButton(props: ButtonProps) {
  return (
    <button
      css={[
        baseButton,
        primaryStyle,
        css({
          position: "absolute",
          zIndex: 9999,
          right: "1.75rem",
          bottom: "1.75rem",
          display: props.isShow ? "inline-flex" : "none",
        }),
      ]}
      {...props}
    >
      {props.children}
    </button>
  );
}

export function PrevButton(props: ButtonProps) {
  return (
    <button
      css={[
        baseButton,
        secondaryStyle,
        css({
          position: "absolute",
          zIndex: 9999,
          left: "1.75rem",
          bottom: "1.75rem",
          display: props.isShow ? "inline-flex" : "none",
        }),
      ]}
      {...props}
    >
      {props.children}
    </button>
  );
}

export function Button({ variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      css={[
        baseButton,
        variant === "primary" ? primaryStyle : secondaryStyle,
        css({
          zIndex: 9999,
          display: props.isShow === false ? "none" : "inline-flex",
          justifyContent: "center",
        }),
      ]}
      {...props}
    >
      {props.children}
    </button>
  );
}
