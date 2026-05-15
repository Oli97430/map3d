import { create } from "zustand";
import type { Building, LatLng } from "@/types/overpass";

interface AreaStore {
  areas: Building[];
  center: LatLng[];
  appendAreas: (areas: Building[]) => void;
  setCenter: (center: LatLng[]) => void;
  reset: () => void;
}

const DEFAULT_CENTER: LatLng[] = [
  { lat: 40.8, lng: -73.95 },
  { lat: 40.83, lng: -73.88 },
];

export const useAreaStore = create<AreaStore>((set) => ({
  areas: [],
  center: DEFAULT_CENTER,
  appendAreas: (areas) => set({ areas: [...areas] }),
  setCenter: (center) => set({ center: [...center] }),
  reset: () => set({ areas: [], center: DEFAULT_CENTER }),
}));
