import { useEffect, useState } from "react";
import { css } from "@emotion/react";

/** Visually hidden aria-live region. Updated by `announce()`. */
let externalSet: ((msg: string) => void) | null = null;

export function announce(msg: string) {
  externalSet?.(msg);
}

export function AriaAnnouncer() {
  const [msg, setMsg] = useState("");
  useEffect(() => {
    externalSet = (m: string) => {
      // Clear first so identical successive messages still announce
      setMsg("");
      setTimeout(() => setMsg(m), 30);
    };
    return () => {
      externalSet = null;
    };
  }, []);
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      css={css({
        position: "absolute",
        left: "-9999px",
        width: "1px",
        height: "1px",
        overflow: "hidden",
      })}
    >
      {msg}
    </div>
  );
}
