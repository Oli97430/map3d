/** Use Web Share API if available, otherwise fall back to clipboard. */
export async function shareOrCopy(data: {
  title: string;
  text?: string;
  url: string;
}): Promise<"shared" | "copied" | "error"> {
  if (typeof navigator === "undefined") return "error";
  const nav = navigator as Navigator & {
    share?: (data: {
      title?: string;
      text?: string;
      url?: string;
    }) => Promise<void>;
  };
  if (typeof nav.share === "function") {
    try {
      await nav.share(data);
      return "shared";
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return "error";
    }
  }
  try {
    await navigator.clipboard.writeText(data.url);
    return "copied";
  } catch {
    return "error";
  }
}
