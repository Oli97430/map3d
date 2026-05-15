export interface MapStyle {
  id: string;
  label: string;
  url: string;
  attribution: string;
  maxZoom?: number;
  preview: string; // CSS gradient preview
}

export const MAP_STYLES: MapStyle[] = [
  {
    id: "standard",
    label: "Standard",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    maxZoom: 19,
    preview: "linear-gradient(135deg, #e3ecdc 0%, #c0d4b8 100%)",
  },
  {
    id: "dark",
    label: "Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19,
    preview: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
  },
  {
    id: "light",
    label: "Light",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19,
    preview: "linear-gradient(135deg, #fafbfc 0%, #e2e8f0 100%)",
  },
  {
    id: "satellite",
    label: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP",
    maxZoom: 19,
    preview: "linear-gradient(135deg, #4a6741 0%, #2d4a3e 50%, #5b7c5b 100%)",
  },
];

export const DEFAULT_MAP_STYLE = "standard";
