import { useEffect, useRef, useState } from "react";

/**
 * Animated count-up from 0 (or previous value) to `target` over `duration` ms.
 * Respects `prefers-reduced-motion`.
 */
export function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(target);
  const start = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setValue(target);
      return;
    }
    const from = start.current;
    const to = target;
    if (from === to) return;
    const startTime = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const v = from + (to - from) * eased;
      setValue(Math.round(v));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        start.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return value;
}
