import { css } from "@emotion/react";
import { DetailedHTMLProps, ButtonHTMLAttributes } from "react";
import { useTranslation } from "react-i18next";
import {
  Github,
  Settings,
  Car as CarIcon,
  MapPinned,
  Keyboard,
  Camera,
  Share2,
} from "lucide-react";
import { useCarStore } from "@/state/carStore";
import { useActionStore } from "@/state/exportStore";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { toast } from "@/state/toastStore";
import { Tooltip } from "@/components/Tooltip";
import {
  BORDER_COLOR,
  BRAND_GRADIENT,
  SHADOW_SM,
  SUBTITLE_COLOR,
  SURFACE_GLASS,
  SURFACE_GLASS_HOVER,
} from "@/theme/color";

const TOP_PANEL_HEIGHT = "3.25rem";
const breakpoints = [768];
const mq = breakpoints.map((bp) => `@media (max-width: ${bp}px)`);

interface ButtonProps extends DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> {
  isShow?: boolean;
  isActive?: boolean;
}

function Stepper({ step }: { step: number }) {
  const { t } = useTranslation();
  const labels = [
    t("steps.selectArea"),
    t("steps.buildings"),
    t("steps.scene"),
  ];
  return (
    <div
      css={css({
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        [mq[0]]: { display: "none" },
      })}
    >
      {labels.map((label, idx) => {
        const isActive = idx === step;
        const isDone = idx < step;
        return (
          <div
            key={label}
            css={css({
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            })}
          >
            <div
              css={css({
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.3rem 0.7rem",
                borderRadius: "999px",
                fontSize: "12px",
                fontWeight: 500,
                transition: "all 0.2s ease",
                background: isActive
                  ? BRAND_GRADIENT
                  : isDone
                    ? "rgba(99, 102, 241, 0.1)"
                    : "transparent",
                color: isActive ? "#ffffff" : isDone ? "#6366f1" : "#94a3b8",
              })}
            >
              <span
                css={css({
                  display: "inline-flex",
                  width: "16px",
                  height: "16px",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: 700,
                  borderRadius: "50%",
                  background: isActive
                    ? "rgba(255,255,255,0.25)"
                    : isDone
                      ? "#6366f1"
                      : "rgba(148, 163, 184, 0.2)",
                  color: isActive || isDone ? "#ffffff" : "#94a3b8",
                })}
              >
                {idx + 1}
              </span>
              {label}
            </div>
            {idx < labels.length - 1 && (
              <span
                css={css({
                  width: "14px",
                  height: "1px",
                  background:
                    idx < step ? "#6366f1" : "rgba(148, 163, 184, 0.4)",
                })}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

async function copyShareLink() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  } catch {
    toast.error("Could not copy link");
  }
}

export function TopNav({
  step,
  onOpenOptions,
  onOpenShortcuts,
}: {
  step: number;
  onOpenOptions: () => void;
  onOpenShortcuts: () => void;
}) {
  const { t } = useTranslation();
  const setThirdMode = useCarStore((s) => s.setThirdMode);
  const thirdMode = useCarStore((s) => s.thirdMode);
  const setScreenshot = useActionStore((s) => s.setScreenshotRequest);
  const isMobile = useIsMobile();

  return (
    <div
      css={css({
        display: "flex",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: TOP_PANEL_HEIGHT,
        backgroundColor: SURFACE_GLASS,
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        borderBottom: `1px solid ${BORDER_COLOR}`,
        boxShadow: SHADOW_SM,
        zIndex: 9999,
        justifyContent: "space-between",
        alignItems: "center",
        transition: "all 0.3s ease",
      })}
    >
      <div
        css={css({
          paddingLeft: "1.5rem",
          alignItems: "center",
          display: "flex",
          gap: "0.6rem",
        })}
      >
        <div
          css={css({
            width: "26px",
            height: "26px",
            borderRadius: "8px",
            background: BRAND_GRADIENT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(99, 102, 241, 0.35)",
          })}
        >
          <MapPinned size={15} color="#fff" strokeWidth={2.5} />
        </div>
        <span
          css={css({
            fontSize: "15px",
            fontWeight: 700,
            color: SUBTITLE_COLOR,
            letterSpacing: "-0.01em",
          })}
        >
          {t("app.title")}
        </span>
      </div>

      <Stepper step={step} />

      <div
        css={css({
          paddingRight: "1.5rem",
          display: "flex",
          flexDirection: "row",
          gap: "0.5rem",
          alignItems: "center",
        })}
      >
        {step === 0 && (
          <Tooltip label="Share map link">
            <NavButton
              isShow
              onClick={copyShareLink}
              aria-label="Share map link"
            >
              <Share2 size={13} strokeWidth={2} />
            </NavButton>
          </Tooltip>
        )}
        {step === 2 && (
          <Tooltip label="Screenshot (P)">
            <NavButton
              isShow
              onClick={() => setScreenshot(true)}
              aria-label="Take screenshot"
            >
              <Camera size={13} strokeWidth={2} />
              <span css={css({ [mq[0]]: { display: "none" } })}>
                Screenshot
              </span>
            </NavButton>
          </Tooltip>
        )}
        <Tooltip label={t("nav.options")}>
          <NavButton
            isShow={step >= 1}
            onClick={onOpenOptions}
            aria-label={t("nav.options")}
          >
            <Settings size={13} strokeWidth={2} />
            <span css={css({ [mq[0]]: { display: "none" } })}>
              {t("nav.options")}
            </span>
          </NavButton>
        </Tooltip>
        <Tooltip label={`${t("shortcuts.title")} (?)`}>
          <NavButton
            isShow
            onClick={onOpenShortcuts}
            aria-label={t("shortcuts.title")}
          >
            <Keyboard size={13} strokeWidth={2} />
          </NavButton>
        </Tooltip>
        <Tooltip label={t("nav.github")}>
          <NavButton
            isShow
            onClick={() => window.open("https://github.com/cartesiancs/map3d")}
            aria-label={t("nav.github")}
          >
            <Github size={13} strokeWidth={2} />
            <span css={css({ [mq[0]]: { display: "none" } })}>
              {t("nav.github")}
            </span>
          </NavButton>
        </Tooltip>

        {!isMobile && step === 2 && (
          <NavButton
            isShow
            isActive={thirdMode}
            onClick={() => setThirdMode(!thirdMode)}
          >
            <CarIcon size={13} strokeWidth={2} />
            {thirdMode ? t("nav.exitCar") : t("nav.carMode")}
          </NavButton>
        )}
      </div>
    </div>
  );
}

export function NavButton({ isActive, isShow, ...props }: ButtonProps) {
  if (isShow === false) return null;
  return (
    <button
      css={css({
        color: isActive ? "#ffffff" : "#0f172a",
        background: isActive ? BRAND_GRADIENT : SURFACE_GLASS,
        backdropFilter: "blur(8px)",
        border: `1px solid ${isActive ? "transparent" : BORDER_COLOR}`,
        padding: "0.4rem 0.85rem",
        borderRadius: "8px",
        fontWeight: 500,
        fontSize: "12px",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        cursor: "pointer",
        transition: "all 0.18s ease",
        boxShadow: isActive ? "0 2px 8px rgba(99,102,241,0.3)" : "none",
        ":hover": {
          backgroundColor: isActive ? undefined : SURFACE_GLASS_HOVER,
          transform: "translateY(-1px)",
          boxShadow: isActive
            ? "0 4px 12px rgba(99,102,241,0.4)"
            : "0 2px 6px rgba(15,23,42,0.08)",
        },
        ":active": { transform: "translateY(0)" },
      })}
      {...props}
    >
      {props.children}
    </button>
  );
}
