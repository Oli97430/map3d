import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DEFAULT_MAP_STYLE } from "@/config/mapStyles";

interface SettingsStore {
  mapStyle: string;
  recentSearches: string[];
  showFPS: boolean;
  showCompass: boolean;
  highContrast: boolean;
  /** Hour 0-23.99 controlling sun position. */
  sunHour: number;

  setMapStyle: (id: string) => void;
  pushRecentSearch: (q: string) => void;
  clearRecentSearches: () => void;
  setShowFPS: (v: boolean) => void;
  setShowCompass: (v: boolean) => void;
  setHighContrast: (v: boolean) => void;
  setSunHour: (h: number) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      mapStyle: DEFAULT_MAP_STYLE,
      recentSearches: [],
      showFPS: false,
      showCompass: true,
      highContrast: false,
      sunHour: 13,

      setMapStyle: (id) => set({ mapStyle: id }),
      pushRecentSearch: (q) =>
        set((s) => {
          const trimmed = q.trim();
          if (!trimmed) return s;
          const filtered = s.recentSearches.filter(
            (x) => x.toLowerCase() !== trimmed.toLowerCase()
          );
          return { recentSearches: [trimmed, ...filtered].slice(0, 6) };
        }),
      clearRecentSearches: () => set({ recentSearches: [] }),
      setShowFPS: (v) => set({ showFPS: v }),
      setShowCompass: (v) => set({ showCompass: v }),
      setHighContrast: (v) => set({ highContrast: v }),
      setSunHour: (h) => set({ sunHour: h }),
    }),
    {
      name: "map3d.settings",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
