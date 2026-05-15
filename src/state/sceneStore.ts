import { create } from "zustand";
import type { BuildingCategory } from "@/types/overpass";

export type CameraPreset = "orbit" | "top" | "isometric" | "first-person";
export type TimeOfDay = "day" | "night";
export type ColorGrade =
  | "none"
  | "sunset"
  | "blueHour"
  | "cyberpunk"
  | "noir"
  | "vibrant";

export type WeatherKind = "clear" | "rain" | "snow" | "fog";

interface SceneState {
  // Visual
  timeOfDay: TimeOfDay;
  cameraPreset: CameraPreset;
  colorGrade: ColorGrade;
  weather: WeatherKind;
  showRoads: boolean;
  showWater: boolean;
  showParks: boolean;
  showGround: boolean;
  showClouds: boolean;
  showTerrain: boolean;
  shadowsEnabled: boolean;

  // Filters
  enabledCategories: Set<BuildingCategory>;
  minHeight: number;
  maxHeight: number;

  // Setters
  setTimeOfDay: (t: TimeOfDay) => void;
  toggleTimeOfDay: () => void;
  setCameraPreset: (p: CameraPreset) => void;
  setColorGrade: (g: ColorGrade) => void;
  setWeather: (w: WeatherKind) => void;
  setShowRoads: (v: boolean) => void;
  setShowWater: (v: boolean) => void;
  setShowParks: (v: boolean) => void;
  setShowGround: (v: boolean) => void;
  setShowClouds: (v: boolean) => void;
  setShowTerrain: (v: boolean) => void;
  setShadowsEnabled: (v: boolean) => void;

  toggleCategory: (c: BuildingCategory) => void;
  setHeightRange: (min: number, max: number) => void;
  resetFilters: () => void;
}

const allCategories: BuildingCategory[] = [
  "residential",
  "commercial",
  "industrial",
  "religious",
  "education",
  "civic",
  "other",
];

export const useSceneStore = create<SceneState>((set) => ({
  timeOfDay: "day",
  cameraPreset: "orbit",
  colorGrade: "none",
  weather: "clear",
  showRoads: true,
  showWater: true,
  showParks: true,
  showGround: true,
  showClouds: true,
  showTerrain: true,
  shadowsEnabled: false,

  enabledCategories: new Set(allCategories),
  minHeight: 0,
  maxHeight: 500,

  setTimeOfDay: (t) => set({ timeOfDay: t }),
  toggleTimeOfDay: () =>
    set((s) => ({ timeOfDay: s.timeOfDay === "day" ? "night" : "day" })),
  setCameraPreset: (p) => set({ cameraPreset: p }),
  setColorGrade: (g) => set({ colorGrade: g }),
  setWeather: (w) => set({ weather: w }),
  setShowRoads: (v) => set({ showRoads: v }),
  setShowWater: (v) => set({ showWater: v }),
  setShowParks: (v) => set({ showParks: v }),
  setShowGround: (v) => set({ showGround: v }),
  setShowClouds: (v) => set({ showClouds: v }),
  setShowTerrain: (v) => set({ showTerrain: v }),
  setShadowsEnabled: (v) => set({ shadowsEnabled: v }),

  toggleCategory: (c) =>
    set((s) => {
      const next = new Set(s.enabledCategories);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return { enabledCategories: next };
    }),
  setHeightRange: (min, max) => set({ minHeight: min, maxHeight: max }),
  resetFilters: () =>
    set({
      enabledCategories: new Set(allCategories),
      minHeight: 0,
      maxHeight: 500,
    }),
}));
