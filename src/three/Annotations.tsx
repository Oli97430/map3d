import { Html } from "@react-three/drei";
import { useAnnotationStore } from "@/state/annotationStore";
import { X } from "lucide-react";

export function Annotations() {
  const items = useAnnotationStore((s) => s.items);
  const remove = useAnnotationStore((s) => s.remove);

  return (
    <group>
      {items.map((a) => (
        <Html
          key={a.id}
          position={[a.worldX, a.worldY + 8, a.worldZ]}
          center
          distanceFactor={60}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff",
              fontSize: "11px",
              fontWeight: 600,
              padding: "4px 10px 4px 12px",
              borderRadius: "999px",
              boxShadow: "0 6px 18px rgba(99,102,241,0.45)",
              fontFamily: "Inter, system-ui, sans-serif",
              border: "1px solid rgba(255,255,255,0.2)",
              userSelect: "none",
            }}
          >
            <span>📍 {a.label}</span>
            <button
              onClick={() => remove(a.id)}
              aria-label="Remove pin"
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(255,255,255,0.7)",
                cursor: "pointer",
                padding: "0",
                display: "flex",
                alignItems: "center",
              }}
            >
              <X size={11} />
            </button>
          </div>
        </Html>
      ))}
    </group>
  );
}
