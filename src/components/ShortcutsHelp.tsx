import { css } from "@emotion/react";
import { useTranslation } from "react-i18next";
import { Modal } from "./modal/Modal";
import { Column } from "./flex/Column";
import { Title } from "./text/Title";
import { BORDER_COLOR, DESC_COLOR, SUBTITLE_COLOR } from "@/theme/color";

const SHORTCUTS = [
  { keys: ["?"], labelKey: "shortcuts.toggleHelp" },
  { keys: ["→"], labelKey: "shortcuts.nextStep" },
  { keys: ["←"], labelKey: "shortcuts.prevStep" },
  { keys: ["Esc"], labelKey: "shortcuts.escape" },
  { keys: ["N"], labelKey: "shortcuts.toggleNight" },
  { keys: ["P"], labelKey: "shortcuts.screenshot" },
  { keys: ["W", "A", "S", "D"], labelKey: "shortcuts.carWASD" },
];

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      css={css({
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "26px",
        padding: "2px 8px",
        fontSize: "11px",
        fontWeight: 600,
        background: "#f1f5f9",
        border: `1px solid ${BORDER_COLOR}`,
        borderRadius: "6px",
        color: SUBTITLE_COLOR,
        fontFamily: "ui-monospace, Menlo, Consolas, monospace",
      })}
    >
      {children}
    </kbd>
  );
}

export function ShortcutsHelp({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Column gap="0.85rem">
        <Title>{t("shortcuts.title")}</Title>
        <ul
          css={css({
            margin: 0,
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
          })}
        >
          {SHORTCUTS.map((s) => (
            <li
              key={s.labelKey}
              css={css({
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.55rem 0.7rem",
                background: "#fafbfc",
                borderRadius: "8px",
                border: `1px solid ${BORDER_COLOR}`,
              })}
            >
              <span css={css({ fontSize: "13px", color: SUBTITLE_COLOR })}>
                {t(s.labelKey)}
              </span>
              <span css={css({ display: "flex", gap: "0.25rem" })}>
                {s.keys.map((k) => (
                  <Kbd key={k}>{k}</Kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
        <div
          css={css({
            fontSize: "11px",
            color: DESC_COLOR,
            textAlign: "center",
          })}
        >
          Press <Kbd>?</Kbd> anytime to toggle this panel.
        </div>
      </Column>
    </Modal>
  );
}
