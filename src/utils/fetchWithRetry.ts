import { MAX_RETRY } from "@/config/constants";

export interface FetchOpts extends RequestInit {
  /** Total timeout in ms. */
  timeout?: number;
  /** Number of retry attempts on network error / 5xx. */
  retries?: number;
}

/**
 * `fetch` with built-in timeout + retry + AbortController integration.
 *
 * - Respects an external signal: if the caller aborts, the call rejects with the
 *   external reason and does not retry.
 * - On network error or 5xx, retries up to `retries` times with exponential backoff.
 */
export async function fetchWithRetry(
  url: string,
  { timeout = 30_000, retries = MAX_RETRY, signal, ...init }: FetchOpts = {}
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(new Error("timeout")), timeout);

    // Chain external signal → internal controller
    const externalAbort = () => ctrl.abort(signal?.reason);
    if (signal) {
      if (signal.aborted) {
        clearTimeout(timer);
        throw signal.reason ?? new Error("aborted");
      }
      signal.addEventListener("abort", externalAbort, { once: true });
    }

    try {
      const res = await fetch(url, { ...init, signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok && res.status >= 500 && attempt < retries) {
        // retryable server error
        await sleep(2 ** attempt * 500);
        continue;
      }
      return res;
    } catch (err: unknown) {
      clearTimeout(timer);
      lastError = err;
      // If caller aborted, rethrow immediately (no retry).
      if (signal?.aborted) throw err;
      if (attempt === retries) throw err;
      await sleep(2 ** attempt * 500);
    } finally {
      signal?.removeEventListener("abort", externalAbort);
    }
  }

  throw lastError ?? new Error("fetchWithRetry: unknown error");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
