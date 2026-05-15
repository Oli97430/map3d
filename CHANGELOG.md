# Changelog

All notable changes to **Map3D** are documented in this file. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-05-14

### Added

#### 3D scene
- **Lit windows at night** — per-building shader that renders an emissive grid of windows with random on/off pattern and gentle flicker.
- **Trees in parks** rendered as `InstancedMesh` (trunk + foliage) sampled inside each park polygon. Up to 400 trees per park at a single draw call.
- **Streetlamps at night** — emissive points placed every ~18 m along major roads (`InstancedMesh`).
- **Bloom + tone mapping + vignette** via `@react-three/postprocessing`.
- **Distance fog** for cinematic depth.
- **Roof variation** — flat / gabled / hipped chosen deterministically per building.
- **Building tooltip → OpenStreetMap link** to edit data upstream.
- **In-scene annotations** (Shift-click to drop a pin, persisted to `localStorage`).
- **Mini-map overlay** in the bottom-left of the 3D view.
- **Compass HUD** + FPS counter (toggleable).

#### Features
- **6 city presets** (Paris, NYC, Tokyo, London, Barcelona, Sydney) one-click.
- **Address search** with Nominatim, autocomplete, recent searches.
- **4 map tile styles** (Standard, Light, Dark, Satellite).
- **Export GLB / OBJ / STL** + PNG screenshot.
- **GeoJSON export** of the bounding box.
- **Drag-and-drop GLB / glTF preview** anywhere on the page.
- **Web Share API** (with clipboard fallback).
- **PWA install button** when prompt is available.
- **URL state sharing** — view encoded in `#lat=…&lng=…&z=…`.

#### UX & A11y
- **Splash screen** before React mounts.
- **Aurora-animated Hero**.
- **Keyboard shortcuts** (`?`, `←/→`, `Esc`, `N`, `P`, WASD).
- **Skip link** wired in JSX.
- **High contrast** toggle in Options.
- **Focus trap** in all modals.
- `prefers-reduced-motion` respected globally.
- **i18n**: EN / FR / ES / JA, auto-detect + persist.

#### Performance
- **Aggressive code-splitting** — Three.js loads only on entering 3D step.
- **Three.js prefetch** while on step 1.
- **Web Worker** parses Overpass responses off the main thread.
- **PWA service worker** caches OSM tiles, Overpass responses, and Google Fonts.

#### DX
- **TypeScript strict** throughout; `any` eliminated from app code.
- **Vitest** unit tests for geo, classifier, stores.
- **Playwright** E2E happy path.
- **rollup-plugin-visualizer** to inspect bundle.
- **Sentry** SDK wired (no DSN by default).
- **Husky** + **commitlint** enforcing Conventional Commits.
- **Prettier** formatting, **ESLint** linting in CI.
- **GitHub Actions** CI on push/PR (typecheck, lint, format, test, build).
- **Vercel** zero-config deploy.

### Changed

- Full UI refresh: glass morphism, indigo→violet gradient, premium typography (Inter).
- Zustand stores split by domain (`area`, `scene`, `settings`, `car`, `export`, `toast`, `heading`, `annotation`, `draw`).
- Map3D internals rewritten in modular files: `Buildings`, `Roads`, `Ground`, `WaterAndParks`, `Trees`, `StreetLamps`, `Annotations`, `SunRig`, `CameraRig`, `PostFX`.

### Security

- Reduced npm-audit advisories from 63 → 28 via `npm audit fix`.

---

## [0.0.0] — Initial fork

Original code by [cartesiancs/map3d](https://github.com/cartesiancs/map3d).
