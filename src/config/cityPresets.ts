export interface CityPreset {
  id: string;
  name: string;
  flag: string;
  center: [number, number];
  zoom: number;
  /** Suggested bbox NE/SW corners. */
  bbox: { ne: { lat: number; lng: number }; sw: { lat: number; lng: number } };
}

export const CITY_PRESETS: CityPreset[] = [
  {
    id: "paris",
    name: "Paris",
    flag: "🇫🇷",
    center: [48.8566, 2.3522],
    zoom: 14,
    bbox: {
      ne: { lat: 48.866, lng: 2.365 },
      sw: { lat: 48.85, lng: 2.34 },
    },
  },
  {
    id: "nyc",
    name: "New York",
    flag: "🇺🇸",
    center: [40.7549, -73.984],
    zoom: 14,
    bbox: {
      ne: { lat: 40.764, lng: -73.972 },
      sw: { lat: 40.745, lng: -73.996 },
    },
  },
  {
    id: "tokyo",
    name: "Tokyo",
    flag: "🇯🇵",
    center: [35.6762, 139.6503],
    zoom: 14,
    bbox: {
      ne: { lat: 35.685, lng: 139.661 },
      sw: { lat: 35.667, lng: 139.639 },
    },
  },
  {
    id: "london",
    name: "London",
    flag: "🇬🇧",
    center: [51.5074, -0.1278],
    zoom: 14,
    bbox: {
      ne: { lat: 51.515, lng: -0.116 },
      sw: { lat: 51.499, lng: -0.139 },
    },
  },
  {
    id: "barcelona",
    name: "Barcelona",
    flag: "🇪🇸",
    center: [41.3884, 2.1741],
    zoom: 14,
    bbox: {
      ne: { lat: 41.397, lng: 2.187 },
      sw: { lat: 41.38, lng: 2.162 },
    },
  },
  {
    id: "sydney",
    name: "Sydney",
    flag: "🇦🇺",
    center: [-33.8688, 151.2093],
    zoom: 14,
    bbox: {
      ne: { lat: -33.86, lng: 151.222 },
      sw: { lat: -33.877, lng: 151.197 },
    },
  },
];
