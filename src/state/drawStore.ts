import { create } from "zustand";

export type DrawMode = "rectangle" | "polygon";

interface DrawStore {
  mode: DrawMode;
  setMode: (m: DrawMode) => void;
}

export const useDrawStore = create<DrawStore>((set) => ({
  mode: "rectangle",
  setMode: (m) => set({ mode: m }),
}));
