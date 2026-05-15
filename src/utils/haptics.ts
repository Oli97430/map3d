type Pattern = "tap" | "double" | "warning" | "success";

const PATTERNS: Record<Pattern, number | number[]> = {
  tap: 12,
  double: [10, 35, 10],
  warning: [25, 50, 25],
  success: [8, 30, 8],
};

/** Soft haptic feedback when supported. No-op otherwise. */
export function haptic(pattern: Pattern = "tap"): void {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  try {
    navigator.vibrate(PATTERNS[pattern]);
  } catch {
    /* no-op */
  }
}
