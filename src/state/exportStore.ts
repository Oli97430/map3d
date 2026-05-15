import { create } from "zustand";

export type ExportType = "glb" | "fleet";
export type ExportFormat = "glb" | "gltf" | "obj" | "stl";

interface ActionStore {
  // Export trigger
  action: boolean;
  exportType: ExportType;
  exportFormat: ExportFormat;
  fleetSpaceId: string;

  // Screenshot
  screenshotRequest: boolean;

  setAction: (action: boolean) => void;
  setFleet: (fleetSpaceId: string, exportType: ExportType) => void;
  setExportFormat: (format: ExportFormat) => void;
  setScreenshotRequest: (v: boolean) => void;
}

export const useActionStore = create<ActionStore>((set) => ({
  action: false,
  exportType: "glb",
  exportFormat: "glb",
  fleetSpaceId: "",
  screenshotRequest: false,
  setAction: (action) => set({ action }),
  setFleet: (fleetSpaceId, exportType) => set({ fleetSpaceId, exportType }),
  setExportFormat: (exportFormat) => set({ exportFormat }),
  setScreenshotRequest: (v) => set({ screenshotRequest: v }),
}));
