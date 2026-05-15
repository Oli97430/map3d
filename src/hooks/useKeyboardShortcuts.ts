import { useEffect } from "react";

export interface Shortcut {
  /** Lower-case key (e.g. "?", "n", "arrowright"). */
  key: string;
  /** Whether to require Shift / Ctrl / Alt / Meta. */
  shift?: boolean;
  ctrl?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: (e: KeyboardEvent) => void;
  /** Default true. Set false to ignore when typing in inputs/textareas. */
  whenTyping?: boolean;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      for (const s of shortcuts) {
        if (isTyping && s.whenTyping === false) continue;
        if (e.key.toLowerCase() !== s.key.toLowerCase()) continue;
        if ((s.shift ?? false) !== e.shiftKey) continue;
        if ((s.ctrl ?? false) !== e.ctrlKey) continue;
        if ((s.alt ?? false) !== e.altKey) continue;
        if ((s.meta ?? false) !== e.metaKey) continue;
        s.handler(e);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcuts]);
}
