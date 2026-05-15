import { useEffect, useRef, useState } from "react";
import { css } from "@emotion/react";
import { Upload, X } from "lucide-react";
import { BORDER_COLOR, DESC_COLOR, SHADOW_LG } from "@/theme/color";

/**
 * A drag-and-drop overlay that previews any .glb / .gltf file dropped into the
 * window. Uses @google/model-viewer via a CDN <script> for zero-cost preview.
 *
 * The preview is rendered with a native <model-viewer> custom element if
 * available — otherwise a fallback message is shown. We attempt to inject the
 * script on demand.
 */
export function GLBDropPreview() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const scriptInjected = useRef(false);

  useEffect(() => {
    const onDragEnter = (e: DragEvent) => {
      const dt = e.dataTransfer;
      if (dt && dt.types.includes("Files")) {
        e.preventDefault();
        setDragOver(true);
      }
    };
    const onDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes("Files")) {
        e.preventDefault();
      }
    };
    const onDragLeave = (e: DragEvent) => {
      if ((e as any).fromElement === null) setDragOver(false);
    };
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer?.files?.[0];
      if (!f) return;
      if (/\.(glb|gltf)$/i.test(f.name)) {
        if (url) URL.revokeObjectURL(url);
        setFile(f);
        setUrl(URL.createObjectURL(f));
        if (!scriptInjected.current) {
          const s = document.createElement("script");
          s.type = "module";
          s.src =
            "https://cdn.jsdelivr.net/npm/@google/model-viewer/dist/model-viewer.min.js";
          document.head.appendChild(s);
          scriptInjected.current = true;
        }
      }
    };
    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, [url]);

  const close = () => {
    if (url) URL.revokeObjectURL(url);
    setFile(null);
    setUrl(null);
  };

  return (
    <>
      {/* Drag-over overlay */}
      {dragOver && !url && (
        <div
          role="status"
          css={css({
            position: "fixed",
            inset: 0,
            zIndex: 10001,
            background: "rgba(99, 102, 241, 0.15)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          })}
        >
          <div
            css={css({
              background: "#fff",
              border: "2px dashed #6366f1",
              borderRadius: "16px",
              padding: "2rem 3rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.75rem",
              boxShadow: SHADOW_LG,
            })}
          >
            <Upload size={32} color="#6366f1" />
            <strong css={css({ fontSize: "15px" })}>
              Drop .glb / .gltf to preview
            </strong>
          </div>
        </div>
      )}

      {/* Preview panel */}
      {url && (
        <div
          css={css({
            position: "fixed",
            zIndex: 10002,
            bottom: "1rem",
            left: "1rem",
            width: "min(380px, calc(100% - 2rem))",
            height: "320px",
            background: "#0b1220",
            border: `1px solid ${BORDER_COLOR}`,
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow: SHADOW_LG,
          })}
        >
          <div
            css={css({
              position: "absolute",
              top: "0.5rem",
              left: "0.6rem",
              right: "0.6rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "12px",
              color: "#fff",
              zIndex: 2,
              pointerEvents: "none",
            })}
          >
            <span
              css={css({
                background: "rgba(0,0,0,0.45)",
                padding: "3px 8px",
                borderRadius: "999px",
                fontWeight: 600,
              })}
            >
              {file?.name}
            </span>
            <button
              onClick={close}
              aria-label="Close preview"
              css={css({
                width: "26px",
                height: "26px",
                background: "rgba(0,0,0,0.55)",
                border: "none",
                borderRadius: "50%",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "auto",
              })}
            >
              <X size={14} />
            </button>
          </div>
          <ModelViewerFallback url={url} />
          <div
            css={css({
              position: "absolute",
              bottom: "0.5rem",
              left: 0,
              right: 0,
              textAlign: "center",
              fontSize: "10px",
              color: "rgba(255,255,255,0.5)",
            })}
          >
            Tip: drag a different file to replace
          </div>
        </div>
      )}
    </>
  );
}

function ModelViewerFallback({ url }: { url: string }) {
  return (
    // @ts-expect-error - custom element <model-viewer> from the injected script
    <model-viewer
      src={url}
      alt="GLB preview"
      camera-controls=""
      auto-rotate=""
      shadow-intensity="0.6"
      exposure="0.9"
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#0b1220",
      }}
    >
      <div
        slot="poster"
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
          fontSize: "12px",
        }}
      >
        Loading preview…
      </div>
      {/* @ts-expect-error */}
    </model-viewer>
  );
}
