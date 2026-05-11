# Agent Instructions

## Project Overview

Offline-first gym tracking PWA built with **SolidJS**. All data lives in the browser's **Origin Private File System (OPFS)** — there is no backend. UI language is **German**.

## Commands

| Task | Command |
|------|---------|
| Dev server | `pnpm dev` (port 3000) |
| Build | `pnpm build` |
| Test | `pnpm test` |
| Test (watch) | `pnpm test:watch` |
| Typecheck | `pnpm typecheck` |
| Format | `pnpm format` |
| Lint | `pnpm lint` |
| Deploy | `pnpm gh:deploy` |

## Tech Stack

- **SolidJS** with `@solidjs/router` (HashRouter, lazy-loaded pages)
- **TanStack Solid Query** for async state (`staleTime: Infinity`, manual invalidation)
- **Tailwind CSS 4** + **DaisyUI 5** for styling
- **Vite** + **vite-plugin-pwa** for build and offline support
- **Vitest** (node environment — no DOM testing)
- **Biome** for formatting (tabs, double quotes) and linting

## Architecture

### Data Flow

```
UI components → TanStack Query → OPFS read/write utilities
```

No global stores. State is either TanStack Query cache or local `createSignal`.

### OPFS File Structure

```
root/workouts/
  {workoutId}.json              ← workout metadata (Workout type)
  {workoutId}/{sessionId}.json  ← session data with exercises (SessionData type)
```

Core types: `Workout` in [src/api/types.ts](src/api/types.ts), `SessionData`/`ExerciseData`/`SetData` in [src/features/session/utils/types.ts](src/features/session/utils/types.ts).

### Project Structure

```
src/
  pages/           ← route components (lazy-loaded)
  features/
    {feature}/
      components/  ← feature-specific components
      utils/       ← logic, data fetching, types
        index.ts   ← barrel export
  ui/              ← shared UI components (Button, Input, ListItem, etc.)
  api/types.ts     ← shared API types
```

## Conventions

- **Kebab-case** filenames everywhere
- **Co-located tests**: `foo.ts` → `foo.test.ts` in the same directory
- **Relative imports** only — no path aliases
- **`import type`** for type-only imports
- **`splitProps()`** in components to separate local vs forwarded props
- **Barrel exports** (`index.ts`) in each feature's utils folder
- Buttons must have explicit `type="button"`
- Session edits are **debounced** (500ms) before persisting to OPFS

## Testing

Tests run in **node** environment (no jsdom). OPFS APIs are mocked by stubbing `navigator.storage.getDirectory` via `vi.stubGlobal()`. Tests focus on data/logic utilities, not component rendering.

## Gotchas

- Base path is `/gym-app/` (GitHub Pages deployment)
- `__APP_VERSION__` is injected at build time as the git commit hash
- Query cache is pre-seeded when listing child workouts to enable instant navigation
- OPFS is not available in all browsers — the app shows an Apple device warning banner
