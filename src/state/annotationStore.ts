import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Annotation {
  id: string;
  worldX: number;
  worldY: number;
  worldZ: number;
  label: string;
}

interface AnnotationStore {
  items: Annotation[];
  add: (a: Omit<Annotation, "id">) => void;
  remove: (id: string) => void;
  rename: (id: string, label: string) => void;
  clear: () => void;
}

export const useAnnotationStore = create<AnnotationStore>()(
  persist(
    (set) => ({
      items: [],
      add: (a) =>
        set((s) => ({
          items: [...s.items, { ...a, id: crypto.randomUUID() }],
        })),
      remove: (id) =>
        set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
      rename: (id, label) =>
        set((s) => ({
          items: s.items.map((x) => (x.id === id ? { ...x, label } : x)),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "map3d.annotations",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
