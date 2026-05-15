import { css } from "@emotion/react";
import { Github, Heart } from "lucide-react";
import { DESC_COLOR, SUBTITLE_COLOR } from "@/theme/color";

const VERSION = "1.0.0";

export function Footer({ onlyWhenStep }: { onlyWhenStep?: number }) {
  void onlyWhenStep;
  return (
    <footer
      css={css({
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: "0.4rem",
        zIndex: 998,
        fontSize: "10.5px",
        color: DESC_COLOR,
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        padding: "0.2rem 0.7rem",
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(8px)",
        borderRadius: "999px",
        border: "1px solid rgba(15,23,42,0.06)",
        pointerEvents: "none",
        "@media (max-width: 768px)": { display: "none" },
      })}
    >
      <span>
        Map3D <strong css={css({ color: SUBTITLE_COLOR })}>v{VERSION}</strong>
      </span>
      <span aria-hidden css={css({ opacity: 0.4 })}>·</span>
      <span css={css({ display: "inline-flex", alignItems: "center", gap: "0.3rem" })}>
        Made with <Heart size={9} fill="#ef4444" color="#ef4444" /> by{" "}
        <a
          href="https://github.com/cartesiancs"
          target="_blank"
          rel="noopener noreferrer"
          css={css({
            color: "#6366f1",
            textDecoration: "none",
            fontWeight: 600,
            pointerEvents: "auto",
            ":hover": { textDecoration: "underline" },
          })}
        >
          cartesiancs
        </a>
      </span>
      <span aria-hidden css={css({ opacity: 0.4 })}>·</span>
      <a
        href="https://github.com/cartesiancs/map3d"
        target="_blank"
        rel="noopener noreferrer"
        css={css({
          color: DESC_COLOR,
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.2rem",
          pointerEvents: "auto",
          ":hover": { color: SUBTITLE_COLOR },
        })}
      >
        <Github size={10} /> source
      </a>
    </footer>
  );
}
