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

## CI / Delivery

- There is **no CI pipeline** for this project (no GitHub Actions checks).
- Quality gates run **locally** via Husky hooks:
  - `pre-commit`: `pnpm format` → `pnpm lint` → `pnpm typecheck` → `pnpm test`
  - `pre-push`: `pnpm test:e2e` → `pnpm gh:deploy`
- E2E is Playwright-based, Firefox-only (WSL-friendly), and uses real browser OPFS (no OPFS mocking in e2e tests).

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
      components/  ← feature-specific UI components
      hooks/       ← SolidJS reactive primitives: createQuery wrappers, page-state factories, resource hooks
      utils/       ← pure logic, OPFS read/write, data transforms, types
        index.ts   ← barrel export
  ui/              ← shared UI components (Button, Input, ListItem, etc.)
  api/types.ts     ← shared API types
```

## Dependency Philosophy

Keep dependencies minimal. Before reaching for a third-party package, build the solution in-house unless the library is already in use or the problem domain is genuinely complex (e.g. crypto, query caching like TanStack Query). Prefer native browser APIs and small focused utilities over large frameworks.

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

Two tiers:

| Tier | Tool | Environment | Focus |
|------|------|-------------|-------|
| Unit / logic | **Vitest** (node) | Node — no DOM | Data utilities, pure functions, OPFS mocks |
| UI / integration | **Vitest + Playwright** | Real browser | Component behaviour, user flows, OPFS in real context |

- Node tests: run in `node` environment. OPFS APIs are mocked via `vi.stubGlobal('navigator', ...)`. Co-located alongside source files (`foo.test.ts`).
- UI/integration tests: always use a real browser via Playwright. Prefer integration-level tests over unit tests for UI — test user-visible behaviour, not implementation details. Place in `e2e/` or alongside the component as `foo.browser.test.ts`.
- Structure Playwright e2e specs under `e2e/states/` and `e2e/journeys/`.
- `e2e/states/`: page-focused specs that cover a page's different states (empty, loading, populated, error, edge cases).
- `e2e/journeys/`: real user journeys spanning one or more pages, often with longer flows or complex interactions.
- In e2e tests, prefer accessible selectors (`getByRole`, `getByLabel`, `getByText`) over brittle CSS selectors whenever possible.
- Write e2e tests as real user interactions with the app, focusing on observable behaviour and outcomes.
- **Default to real-browser integration tests for anything touching the UI.** Only use node tests for pure logic and data utilities.

## Gotchas

- Base path is `/gym-app/` (GitHub Pages deployment)
- `__APP_VERSION__` is injected at build time as the git commit hash
- Query cache is pre-seeded when listing child workouts to enable instant navigation
- OPFS is not available in all browsers — the app shows an Apple device warning banner
