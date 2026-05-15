import { css, keyframes } from "@emotion/react";
import { Sparkles, Globe2, Download, Boxes } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Column } from "./flex/Column";
import { Title } from "./text/Title";
import { Description } from "./text/Description";
import { BRAND_GRADIENT, DESC_COLOR, SUBTITLE_COLOR } from "@/theme/color";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const drift = keyframes`
  0%   { transform: translate(0, 0); }
  50%  { transform: translate(20px, -15px); }
  100% { transform: translate(0, 0); }
`;

function FeaturePill({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      css={css({
        display: "inline-flex",
        alignItems: "center",
        gap: "0.45rem",
        padding: "0.3rem 0.7rem",
        background: "rgba(99,102,241,0.08)",
        border: "1px solid rgba(99,102,241,0.18)",
        color: "#4f46e5",
        fontSize: "11.5px",
        fontWeight: 600,
        borderRadius: "999px",
      })}
    >
      {icon}
      {children}
    </div>
  );
}

export function Hero() {
  const { t } = useTranslation();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      setParallax({ x: dx, y: dy });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div
      ref={wrapRef}
      css={css({
        position: "relative",
        overflow: "hidden",
        animation: `${fadeIn} 0.5s ease`,
        // Reserve space so absolute blobs don't shrink the layout
        minHeight: "180px",
      })}
    >
      {/* Aurora blobs with mouse parallax */}
      <div
        aria-hidden
        css={css({
          position: "absolute",
          top: "-60px",
          left: "-80px",
          width: "320px",
          height: "320px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.22), transparent 70%)",
          filter: "blur(10px)",
          animation: `${drift} 14s ease-in-out infinite`,
          willChange: "transform",
          pointerEvents: "none",
          zIndex: 0,
          transform: `translate(${parallax.x * 30}px, ${parallax.y * 24}px)`,
          transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        })}
      />
      <div
        aria-hidden
        css={css({
          position: "absolute",
          top: "10px",
          right: "-100px",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139,92,246,0.2), transparent 70%)",
          filter: "blur(10px)",
          animation: `${drift} 16s ease-in-out infinite reverse`,
          willChange: "transform",
          pointerEvents: "none",
          zIndex: 0,
          transform: `translate(${-parallax.x * 36}px, ${-parallax.y * 28}px)`,
          transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        })}
      />
      <div
        aria-hidden
        css={css({
          position: "absolute",
          top: "-20px",
          left: "40%",
          width: "260px",
          height: "260px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(236,72,153,0.14), transparent 70%)",
          filter: "blur(14px)",
          animation: `${drift} 19s ease-in-out infinite`,
          willChange: "transform",
          pointerEvents: "none",
          zIndex: 0,
          transform: `translate(${parallax.x * 18}px, ${parallax.y * 30}px)`,
          transition: "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
        })}
      />

      <Column gap="0.6rem">
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
            position: "relative",
            zIndex: 1,
          })}
        >
          <Sparkles size={12} />
          {t("steps.step", { n: 1 })}
        </div>
        <Title>
          <span
            css={css({
              background: BRAND_GRADIENT,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            })}
          >
            {t("front.title")}
          </span>
        </Title>
        <Description>{t("front.desc")}</Description>
        <div
          css={css({
            display: "flex",
            flexWrap: "wrap",
            gap: "0.4rem",
            marginTop: "0.35rem",
            position: "relative",
            zIndex: 1,
          })}
        >
          <FeaturePill icon={<Globe2 size={11} />}>OpenStreetMap</FeaturePill>
          <FeaturePill icon={<Boxes size={11} />}>3D Buildings</FeaturePill>
          <FeaturePill icon={<Download size={11} />}>GLB / OBJ / STL</FeaturePill>
          <FeaturePill icon={<Sparkles size={11} />}>Day / Night</FeaturePill>
        </div>
        <div
          css={css({
            marginTop: "0.4rem",
            fontSize: "11px",
            color: DESC_COLOR,
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            position: "relative",
            zIndex: 1,
          })}
        >
          <kbd
            css={css({
              padding: "1px 6px",
              background: "#f1f5f9",
              border: "1px solid rgba(15,23,42,0.08)",
              borderRadius: "4px",
              fontSize: "10px",
              fontWeight: 600,
              color: SUBTITLE_COLOR,
              fontFamily: "ui-monospace, Menlo, Consolas, monospace",
            })}
          >
            ?
          </kbd>{" "}
          for keyboard shortcuts
        </div>
      </Column>
    </div>
  );
}
