import { css, keyframes } from "@emotion/react";
import React from "react";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export function FullscreenModal({
  children,
  isOpen = false,
}: {
  children: React.ReactNode;
  isOpen?: boolean;
}) {
  if (!isOpen) return null;
  return (
    <div
      css={css({
        width: "100%",
        height: "100%",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 999,
        background:
          "radial-gradient(1200px 600px at 20% 0%, rgba(99,102,241,0.10), transparent 60%), radial-gradient(1000px 500px at 90% 100%, rgba(139,92,246,0.08), transparent 60%), rgba(248, 250, 252, 0.85)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        display: "flex",
        justifyContent: "center",
        animation: `${fadeIn} 0.35s cubic-bezier(0.4, 0, 0.2, 1)`,
        overflow: "auto",
      })}
    >
      <div
        css={css({
          padding: "2rem",
          paddingTop: "5rem",
          paddingBottom: "6rem",
          width: "100%",
          maxWidth: "1200px",
        })}
      >
        {children}
      </div>
    </div>
  );
}
