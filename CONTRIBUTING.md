# Contributing to Map3D

Thanks for taking the time to contribute! This document explains how to set up a local environment and the conventions the project follows.

## Getting started

```bash
git clone https://github.com/cartesiancs/map3d
cd map3d
npm install
npm run dev
```

## Branching

- `main` is always deployable.
- Feature branches: `feat/<short-description>` (e.g. `feat/sun-slider`).
- Bug-fix branches: `fix/<short-description>`.
- Open a PR against `main` once your branch is ready.

## Code style

- **TypeScript** strict mode. Avoid `any`; prefer concrete types.
- **Prettier** runs on save (config: `.prettierrc.json`). Run `npm run format` before pushing.
- **ESLint** rules are enforced in CI. Run `npm run lint` locally.
- Component file names use PascalCase (`MyComponent.tsx`); utility files use camelCase (`myUtil.ts`).
- No CSS files for components — use **Emotion** `css` prop. Colors come from `src/theme/color.ts`.

## State

We use **Zustand** with one store per domain. To add a new piece of state:
1. Create a new store under `src/state/`.
2. If the data should persist, wrap it with `persist(createJSONStorage(() => localStorage))`.
3. Use small selectors in components (`useStore((s) => s.field)`) to keep re-renders local.

## Tests

- Unit tests live in `src/test/*.test.ts` and run with `npm test`.
- Add a test for any new utility function or store reducer.
- E2E tests use Playwright (`tests/e2e/`). Run with `npx playwright test`.

## Commits

We use **Conventional Commits** (enforced by commitlint). Examples:

- `feat: add city presets`
- `fix(map): clear bounds on unmount`
- `chore(deps): bump react-leaflet to 5.0.1`
- `docs: update README screenshots`
- `refactor(three): extract SunRig into its own module`
- `test: cover overpass classifier edge cases`

## Pull requests

1. Run `npm run typecheck && npm test && npm run format` before opening the PR.
2. Provide a short description of the change and link any related issue.
3. Screenshots / GIFs are appreciated for visual changes.
4. PRs that touch CI, security, or licensing should be flagged in the PR title.

## Questions?

Open an issue with the **question** label.
