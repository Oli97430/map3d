<div align="center">

# 🗺️ Map3D

**Generate stunning 3D maps from real-world OpenStreetMap data — and export them as GLB files ready for Blender, Three.js, Unity, or any 3D engine.**

[![CI](https://github.com/cartesiancs/map3d/actions/workflows/ci.yml/badge.svg)](https://github.com/cartesiancs/map3d/actions/workflows/ci.yml)
![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![React 19](https://img.shields.io/badge/React-19-61dafb.svg)
![Three.js](https://img.shields.io/badge/Three.js-r173-000000.svg)
![Vite](https://img.shields.io/badge/Vite-6-646cff.svg)

[Visit Website](https://map.fleet.im/) · [Report Bugs](https://github.com/cartesiancs/map3d/issues)

</div>

---

## ✨ Features

### 🗺 Map selection
- 📍 **Address search** with [Nominatim](https://nominatim.org/) autocomplete & recent searches
- 🎨 **4 map styles**: Standard, Light, Dark, Satellite
- 🟦 **Draw any rectangular area** by click-and-drag (touch supported)
- 📏 Real-time km² indicator + large-area warning
- 🔗 **Shareable URLs** — view state encoded in URL hash

### 🏙 3D scene
- 🏢 Real-world **buildings** with heights from OSM tags or estimated from levels
- 🏛️ **OSM-aware roof shapes** — gabled, hipped, pyramidal, dome, onion, skillion (from `roof:shape` tag)
- 🎨 **Categorical coloring** + respect for OSM `building:colour` when provided
- 💡 **Lit windows at night** via per-building shader (random pattern + flicker)
- 🛣 **Roads** rendered as proper asphalt ribbons (width depends on highway type)
- 🌉 **Bridges & tunnels** (`bridge=yes` / `tunnel=yes`)
- 🦓 **Crosswalks** (`highway=crossing`)
- ⚡ **Power lines + pylons** (`power=line` / `power=tower`)
- 🌊 **Animated water** (custom shader: layered noise + specular hotspots)
- ⛵ **Boats** that bob on water (instanced, with night lights)
- 🌳 **Trees** sampled inside parks **+** real OSM tree points (`natural=tree`)
- 🌲 **Streetlamps** along major roads (lit at night)
- ☁️ **Volumetric clouds** (drei `<Clouds>`) — density reacts to weather
- 🌦 **Weather modes**: clear / rain / snow / fog
- 🏔️ **Procedural terrain** (DEM-style elevation via layered value noise)
- 🌅 **Sun position slider** (0–24h) with realistic dawn/dusk colors
- 🌙 **Night mode** with 6 000 stars
- 🎨 **Color grading LUTs**: Sunset · Blue hour · Cyberpunk · Noir · Vibrant
- ✨ **Selection outline** post-process on clicked building
- 📐 **4 smooth-animated camera presets**: Orbit, Top-down, Isometric, First-person
- 🚗 **Car mode** — drive through your own 3D city with WASD
- 🧭 **Compass HUD** + optional FPS counter + mini-map
- 📌 **3D pins / annotations** (Shift-click to drop, persisted to localStorage)
- 🌑 **Real-time shadows** (toggleable)
- 🚀 **Bloom + tone mapping + vignette** post-processing

### 🎚 Filters
- Toggle layers: roads / water / parks / ground / clouds / terrain
- Filter buildings by category and height range
- Switch color grading + weather independently

### 📤 Export
- 🎁 **GLB** (binary glTF) — one-click download
- 🧊 **OBJ** + **STL** — engine-agnostic export
- 🌐 **GeoJSON** export of the bounding box
- 📸 **PNG screenshot** of the 3D viewport
- 🪟 **Drag & drop GLB / glTF** to preview any external model in-app
- ☁️ Optional **Fleet** upload integration

### ⚡ Tech & UX
- ⌨️ **Keyboard shortcuts** (`?` for help, `←/→` to navigate, `N` for night, `P` for screenshot)
- 🎚️ **Floating scene dock** for quick day/night, camera, screenshot
- 🏙 **6 city presets** (Paris · NYC · Tokyo · London · Barcelona · Sydney)
- 🌍 **i18n**: English, French, Spanish, Japanese (auto-detect + persist)
- ♿ **A11y**: skip link, focus trap in modals, ARIA roles, `prefers-reduced-motion`, high-contrast mode, ARIA-live announcer
- 📱 **Mobile-friendly** with touch-drawing, haptic feedback, responsive layout
- 📲 **Web Share API** with clipboard fallback
- 📥 **PWA installable** with offline tile caching for OSM tiles and Overpass
- 💨 **Aggressive code-splitting** — Three.js loads only when entering the 3D scene
- 🧵 **Web Worker** parses heavy Overpass responses off the main thread
- 🛡 **Error boundary** with friendly fallback UI
- ✨ **Hero with mouse-parallax aurora** + animated count-up stats

---

## 🚀 Quick start

```bash
git clone https://github.com/cartesiancs/map3d
cd map3d
npm install
npm run dev        # http://localhost:5173
```

Or on Windows, double-click **`start.bat`**.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | TypeScript + production build to `dist/` |
| `npm run preview` | Preview built bundle |
| `npm test` | Run all Vitest tests |
| `npm run test:watch` | Watch mode |
| `npm run test:ui` | Vitest UI dashboard |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier (write) |
| `npm run format:check` | Prettier (check only) |

---

## 🏗 Architecture

```
src/
├── api/                  # Overpass + Nominatim service clients (typed)
├── components/
│   ├── flex/             # Column / Row primitives
│   ├── map/              # SelectMap, AddressSearch, MapStyleSwitcher, Processing
│   ├── nav/              # TopNav with stepper
│   ├── text/             # Title / Description
│   ├── modal/            # Focus-trapped Modal
│   ├── button/           # NextButton / PrevButton / Button
│   ├── Hero.tsx          # Landing hero with aurora animations
│   ├── Compass.tsx       # 3D heading HUD
│   ├── OptionsPanel.tsx  # All visual controls
│   ├── ShortcutsHelp.tsx # Keyboard cheat-sheet modal
│   ├── Toast.tsx         # Stacked notifications
│   ├── Tooltip.tsx       # Hover tooltip
│   └── ErrorBoundary.tsx # React error boundary
├── config/               # Constants & tile providers
├── hooks/                # useMediaQuery, useKeyboardShortcuts, useFocusTrap
├── i18n/                 # en / fr / es / ja locales
├── state/                # Zustand stores (area, car, export, scene, settings, toast, heading)
├── three/                # R3F scene: Space, Buildings, Roads, Ground, WaterAndParks, SunRig, CameraRig, Car
├── types/                # Overpass + classify
├── utils/                # geo (projection), fetchWithRetry, urlState, cookie
└── ui/App.tsx            # Top-level shell, lazy-loaded 3D
```

### Data flow

1. **Step 0** — User selects a bounding box on Leaflet → `areaStore.center`
2. **Step 1** — `fetchBuildings()` queries Overpass → `areaStore.areas`
3. **Step 2** — Three.js scene mounts, projects lat/lng into local meters (`utils/geo`), extrudes each polygon, fetches roads/water/parks in parallel
4. **Export** — `GLTFExporter` walks the scene, collects everything with `userData.exportToGLB = true`, and downloads a single GLB

### State management

Zustand stores are split by domain to keep re-renders localized:

| Store | Persisted | Purpose |
|---|---|---|
| `areaStore` | ❌ | Current bbox & buildings |
| `sceneStore` | ❌ | Visual flags (day/night, layers, filters, camera preset) |
| `settingsStore` | ✅ localStorage | Map style, recent searches, sun hour, HUD prefs |
| `carStore` | ❌ | First-person driving toggle |
| `exportStore` | ❌ | Export & screenshot triggers |
| `toastStore` | ❌ | Notifications queue |
| `headingStore` | ❌ | Live camera heading for compass |

---

## ⌨️ Keyboard shortcuts

| Key | Action |
|---|---|
| `?` | Open shortcuts help |
| `←` / `→` | Previous / next step |
| `Esc` | Close modal |
| `N` | Toggle day/night |
| `P` | Take screenshot (step 3 only) |
| `W` `A` `S` `D` | Drive car (Car Mode) |

---

## 🌐 i18n

The app auto-detects browser language and persists the choice in `localStorage`.
Supported: **English**, **French**, **Spanish**, **Japanese**.

To add a new locale, drop a file in `src/i18n/` mirroring `en.ts` and register it in `src/i18n/index.ts`.

---

## 📦 Bundle composition

Code-splitting strategy (after `npm run build`):

| Chunk | Size (raw / gzip) | Loaded when |
|---|---|---|
| `index` (app shell) | ~137 KB / 45 KB | Always |
| `map-leaflet` | ~166 KB / 49 KB | Step 0–1 (map) |
| `three-core` | ~690 KB / 177 KB | Step 2 only (lazy) |
| `three-r3f` | ~412 KB / 133 KB | Step 2 only (lazy) |
| `Space` (3D scene) | ~91 KB / 32 KB | Step 2 only (lazy) |

Three.js + drei (~1.1 MB raw) is only fetched when the user actually enters the 3D scene — initial paint is **~300 KB raw / ~94 KB gzipped**.

---

## 🧪 Testing

Vitest + Testing Library + jsdom.

```bash
npm test           # one-shot
npm run test:ui    # interactive UI
```

Covered:
- `utils/geo` (projection, area, large-area heuristic)
- `types/overpass` building classifier
- Zustand stores (toast push/remove, scene toggles)

---

## 🎨 Customizing

### Add a new map style

Edit `src/config/mapStyles.ts` and add an entry:

```ts
{
  id: "watercolor",
  label: "Watercolor",
  url: "https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg",
  attribution: "&copy; Stamen Design",
  preview: "linear-gradient(135deg, #fdf6e3 0%, #d2b48c 100%)",
}
```

### Change building height heuristics

In `src/three/Buildings.tsx`, see the `useMemo` block. Default fallback uses
`DEFAULT_BUILDING_HEIGHT` and `METERS_PER_LEVEL` from `src/config/constants.ts`.

### Tweak the color palette

`src/theme/color.ts` — single source of truth for brand, surfaces, borders, shadows, gradients.

---

## 🤝 Contributing

PRs welcome! Please:
1. Run `npm run typecheck && npm test && npm run format` before submitting.
2. Follow the existing Zustand/typed-store pattern; avoid `any`.
3. Add a test for any new utility.

---

## 📜 License

[MIT](LICENSE) © Original work by [cartesiancs](https://github.com/cartesiancs).

---

<div align="center">

Made with React, Three.js, OpenStreetMap, and Vite.

</div>
