import { Component, ErrorInfo, ReactNode } from "react";
import { css } from "@emotion/react";
import { AlertOctagon, RefreshCw } from "lucide-react";
import {
  BRAND_GRADIENT,
  DESC_COLOR,
  SUBTITLE_COLOR,
  TITLE_COLOR,
} from "@/theme/color";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error("ErrorBoundary caught:", error, info);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          css={css({
            height: "100vh",
            width: "100vw",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "radial-gradient(1000px 500px at 50% 0%, rgba(239,68,68,0.06), transparent 60%), #f8fafc",
            padding: "2rem",
          })}
        >
          <div
            css={css({
              maxWidth: "440px",
              background: "#fff",
              borderRadius: "16px",
              padding: "2rem",
              boxShadow: "0 10px 32px rgba(15,23,42,0.10)",
              textAlign: "center",
            })}
          >
            <div
              css={css({
                width: "56px",
                height: "56px",
                margin: "0 auto 1rem",
                borderRadius: "16px",
                background: "rgba(239, 68, 68, 0.12)",
                color: "#ef4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              })}
            >
              <AlertOctagon size={28} />
            </div>
            <h2
              css={css({
                margin: 0,
                fontSize: "1.4rem",
                fontWeight: 700,
                color: TITLE_COLOR,
                letterSpacing: "-0.02em",
              })}
            >
              Something went wrong
            </h2>
            <p
              css={css({
                marginTop: "0.5rem",
                color: DESC_COLOR,
                fontSize: "0.9rem",
                lineHeight: 1.55,
              })}
            >
              The app hit an unexpected error. You can try reloading to recover.
            </p>
            {this.state.error && (
              <pre
                css={css({
                  marginTop: "1rem",
                  padding: "0.75rem",
                  background: "#f1f5f9",
                  color: SUBTITLE_COLOR,
                  fontSize: "11px",
                  borderRadius: "8px",
                  textAlign: "left",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  maxHeight: "120px",
                  overflow: "auto",
                })}
              >
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReload}
              css={css({
                marginTop: "1.25rem",
                padding: "0.7rem 1.4rem",
                background: BRAND_GRADIENT,
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                transition: "transform 0.18s ease, box-shadow 0.18s ease",
                boxShadow: "0 6px 16px rgba(99,102,241,0.35)",
                ":hover": {
                  transform: "translateY(-1px)",
                  boxShadow: "0 8px 20px rgba(99,102,241,0.45)",
                },
              })}
            >
              <RefreshCw size={14} /> Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
