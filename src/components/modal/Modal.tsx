import { useEffect, useRef, useState } from "react";
import { css, keyframes } from "@emotion/react";
import { X } from "lucide-react";
import { BORDER_COLOR, DESC_COLOR } from "@/theme/color";
import { useFocusTrap } from "@/hooks/useFocusTrap";

type ModalType = {
  children?: React.ReactNode;
  onClose?: () => void;
  isOpen?: boolean;
  isScroll?: boolean;
  labelledBy?: string;
};

const fadeInBg = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;
const fadeOutBg = keyframes`
  from { opacity: 1; }
  to   { opacity: 0; }
`;
const fadeInContent = keyframes`
  from { transform: translateY(-12px) scale(0.97); opacity: 0; }
  to   { transform: translateY(0)     scale(1);    opacity: 1; }
`;
const fadeOutContent = keyframes`
  from { transform: translateY(0)     scale(1);    opacity: 1; }
  to   { transform: translateY(-12px) scale(0.97); opacity: 0; }
`;

function Modal({
  children,
  onClose,
  isOpen,
  isScroll = false,
  labelledBy,
}: ModalType) {
  const [open, setOpen] = useState(false);
  const [contentAnim, setContentAnim] = useState(
    `${fadeInContent} 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`
  );
  const [bgAnim, setBgAnim] = useState(`${fadeInBg} 0.25s forwards`);
  const contentRef = useRef<HTMLDivElement>(null);

  useFocusTrap(open ? contentRef.current : null, open);

  const close = () => {
    setContentAnim(`${fadeOutContent} 0.22s ease forwards`);
    setBgAnim(`${fadeOutBg} 0.22s forwards`);
    setTimeout(() => {
      onClose?.();
      setOpen(false);
    }, 200);
  };

  const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) close();
  };

  useEffect(() => {
    if (isOpen) {
      setOpen(true);
      setContentAnim(
        `${fadeInContent} 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`
      );
      setBgAnim(`${fadeInBg} 0.25s forwards`);
    } else if (open) {
      close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Lock body scroll while modal open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={onBackdropClick}
      role="presentation"
      css={css({
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
        position: "fixed",
        top: 0,
        left: 0,
        background: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        animation: bgAnim,
        zIndex: 3000,
      })}
    >
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        css={css({
          position: "relative",
          width: "calc(100% - 2rem)",
          maxWidth: "440px",
          maxHeight: isScroll ? "85vh" : "auto",
          "@media (min-width: 1000px)": { maxWidth: "480px" },
          padding: "1.6rem 1.7rem",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          border: `1px solid ${BORDER_COLOR}`,
          boxShadow:
            "0 24px 64px rgba(15, 23, 42, 0.25), 0 8px 16px rgba(15, 23, 42, 0.08)",
          overflow: "auto",
          wordBreak: "break-word",
          animation: contentAnim,
        })}
      >
        <button
          aria-label="Close"
          onClick={close}
          css={css({
            position: "absolute",
            top: "0.8rem",
            right: "0.8rem",
            background: "transparent",
            border: "none",
            borderRadius: "8px",
            width: "30px",
            height: "30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: DESC_COLOR,
            cursor: "pointer",
            transition: "all 0.18s ease",
            ":hover": {
              background: "rgba(15, 23, 42, 0.06)",
              color: "#0f172a",
            },
          })}
        >
          <X size={16} />
        </button>
        {children}
      </div>
    </div>
  );
}

export { Modal };
