import * as Sentry from "@sentry/react";

/**
 * Initialize Sentry only when a DSN is provided via build-time env var.
 * Set `VITE_SENTRY_DSN` in `.env.production` (or in your hosting provider).
 *
 * Without a DSN, this is a no-op — no network calls, no console noise.
 */
export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_RELEASE,
  });
}
