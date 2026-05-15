import { useEffect, useRef, useState } from "react";
import { css } from "@emotion/react";
import { Search, X, Loader2, MapPin, Clock, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { searchAddress, NominatimResult } from "@/api/nominatim";
import { useSettingsStore } from "@/state/settingsStore";
import {
  BORDER_COLOR,
  DESC_COLOR,
  SHADOW_LG,
  SURFACE_SOLID,
  TITLE_COLOR,
} from "@/theme/color";

export function AddressSearch({
  onSelect,
}: {
  onSelect: (result: NominatimResult) => void;
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ctrlRef = useRef<AbortController | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const recent = useSettingsStore((s) => s.recentSearches);
  const pushRecent = useSettingsStore((s) => s.pushRecentSearch);
  const clearRecent = useSettingsStore((s) => s.clearRecentSearches);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      ctrlRef.current?.abort();
      const ctrl = new AbortController();
      ctrlRef.current = ctrl;
      setLoading(true);
      searchAddress(query, ctrl.signal)
        .then((r) => {
          setResults(r);
          setOpen(true);
        })
        .catch((e) => {
          if (e?.name !== "AbortError") setResults([]);
        })
        .finally(() => setLoading(false));
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  const handleSelect = (r: NominatimResult) => {
    onSelect(r);
    const label = r.display_name.split(",")[0];
    pushRecent(label);
    setOpen(false);
    setQuery(label);
  };

  const handleSelectRecent = (q: string) => {
    setQuery(q);
    setOpen(true);
  };

  const showRecent = !query.trim() && recent.length > 0 && open;

  return (
    <div
      ref={wrapperRef}
      css={css({
        position: "absolute",
        zIndex: 9999,
        top: "1rem",
        left: "1rem",
        width: "min(360px, calc(100% - 2rem))",
      })}
    >
      <div
        css={css({
          display: "flex",
          alignItems: "center",
          background: SURFACE_SOLID,
          border: `1px solid ${BORDER_COLOR}`,
          borderRadius: "10px",
          padding: "0.4rem 0.55rem",
          boxShadow: SHADOW_LG,
          gap: "0.45rem",
        })}
      >
        <Search size={15} color={DESC_COLOR} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={t("map.searchPlaceholder")}
          aria-label={t("map.searchPlaceholder")}
          css={css({
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: "13px",
            color: TITLE_COLOR,
            padding: "0.15rem 0",
            "::placeholder": { color: DESC_COLOR },
          })}
        />
        {loading && (
          <Loader2
            size={14}
            color="#6366f1"
            css={css({
              animation: "spin 1s linear infinite",
              "@keyframes spin": {
                from: { transform: "rotate(0deg)" },
                to: { transform: "rotate(360deg)" },
              },
            })}
          />
        )}
        {!loading && query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setOpen(false);
            }}
            aria-label="Clear"
            css={css({
              border: "none",
              background: "transparent",
              padding: "0.15rem",
              cursor: "pointer",
              color: DESC_COLOR,
              display: "flex",
            })}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Recent searches dropdown */}
      {showRecent && (
        <ul
          css={css({
            margin: "0.4rem 0 0",
            padding: 0,
            listStyle: "none",
            background: SURFACE_SOLID,
            border: `1px solid ${BORDER_COLOR}`,
            borderRadius: "10px",
            boxShadow: SHADOW_LG,
            overflow: "hidden",
          })}
        >
          <li
            css={css({
              padding: "0.5rem 0.75rem",
              fontSize: "10px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: DESC_COLOR,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: `1px solid ${BORDER_COLOR}`,
            })}
          >
            <span
              css={css({
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
              })}
            >
              <Clock size={11} /> Recent
            </span>
            <button
              onClick={clearRecent}
              aria-label="Clear recent searches"
              css={css({
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: DESC_COLOR,
                padding: "2px 4px",
                borderRadius: "4px",
                display: "flex",
                ":hover": { color: "#ef4444" },
              })}
            >
              <Trash2 size={11} />
            </button>
          </li>
          {recent.map((q, i) => (
            <li
              key={`${q}-${i}`}
              role="option"
              onClick={() => handleSelectRecent(q)}
              css={css({
                padding: "0.5rem 0.75rem",
                fontSize: "12.5px",
                cursor: "pointer",
                display: "flex",
                gap: "0.55rem",
                alignItems: "center",
                color: TITLE_COLOR,
                borderTop: `1px solid ${BORDER_COLOR}`,
                ":first-of-type": { borderTop: "none" },
                ":hover": { background: "rgba(99,102,241,0.08)" },
              })}
            >
              <Clock size={12} color={DESC_COLOR} />
              <span>{q}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Results */}
      {open && results.length > 0 && (
        <ul
          css={css({
            margin: "0.4rem 0 0",
            padding: 0,
            listStyle: "none",
            background: SURFACE_SOLID,
            border: `1px solid ${BORDER_COLOR}`,
            borderRadius: "10px",
            boxShadow: SHADOW_LG,
            overflow: "hidden",
            maxHeight: "240px",
            overflowY: "auto",
          })}
        >
          {results.map((r) => (
            <li
              key={r.place_id}
              role="option"
              onClick={() => handleSelect(r)}
              css={css({
                padding: "0.55rem 0.75rem",
                fontSize: "12.5px",
                cursor: "pointer",
                display: "flex",
                gap: "0.55rem",
                alignItems: "flex-start",
                color: TITLE_COLOR,
                borderTop: `1px solid ${BORDER_COLOR}`,
                ":first-of-type": { borderTop: "none" },
                ":hover": { background: "rgba(99,102,241,0.08)" },
              })}
            >
              <MapPin
                size={13}
                color="#6366f1"
                style={{ marginTop: "2px", flexShrink: 0 }}
              />
              <span css={css({ flex: 1 })}>{r.display_name}</span>
            </li>
          ))}
        </ul>
      )}
      {open && !loading && query && results.length === 0 && (
        <div
          css={css({
            marginTop: "0.4rem",
            padding: "0.7rem",
            fontSize: "12px",
            color: DESC_COLOR,
            background: SURFACE_SOLID,
            border: `1px solid ${BORDER_COLOR}`,
            borderRadius: "10px",
            boxShadow: SHADOW_LG,
          })}
        >
          {t("map.searchEmpty")}
        </div>
      )}
    </div>
  );
}
