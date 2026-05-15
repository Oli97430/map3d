import { create } from "zustand";

interface HeadingStore {
  /** Degrees, 0 = North, increases clockwise. */
  heading: number;
  setHeading: (deg: number) => void;
}

export const useHeadingStore = create<HeadingStore>((set) => ({
  heading: 0,
  setHeading: (deg) => set({ heading: deg }),
}));
