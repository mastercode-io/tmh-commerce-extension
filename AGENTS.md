# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router routes, layouts, and pages.
- `components/`: Reusable UI and feature components (notably `components/ui/` for shadcn/ui-style primitives).
- `lib/`: Shared utilities and app-level helpers (e.g., className utilities, mock/types as they’re added).
- `public/`: Static assets served at the site root.
- `docs/`: Product/dev documentation (flows, data model, user stories, dev spec).

Path aliases are configured in `tsconfig.json` (e.g., import from `@/components/...`).

## Build, Test, and Development Commands
Use npm (this repo ships a `package-lock.json`).
- `npm ci`: Clean, reproducible install (preferred in CI).
- `npm run dev`: Start local dev server (Next.js).
- `npm run build`: Production build.
- `npm run start`: Run the production server (requires `npm run build` first).
- `npm run lint`: ESLint (Next.js core-web-vitals + TypeScript config).

Formatting is via Prettier (with Tailwind class sorting):
- `npx prettier --check .`
- `npx prettier -w .`

## Coding Style & Naming Conventions
- TypeScript-first; keep code `strict`-safe.
- Prettier rules: single quotes, semicolons, and Tailwind class ordering.
- React components: `PascalCase` component names; file names typically `kebab-case.tsx` (matches existing shadcn/ui patterns).
- In the App Router, prefer Server Components by default; add `"use client"` only when required.

## Testing Guidelines
There is currently no test runner configured (no `npm test` script). Until tests are added, use `npm run lint` and `npm run build` as the primary quality gates. If you add tests, prefer `*.test.ts(x)` naming and colocate near the feature or under `__tests__/`.

## Commit & Pull Request Guidelines
- Use Conventional Commits (e.g., `feat: ...`, `fix: ...`, `chore: ...`).
- PRs should include: a concise summary, screenshots for UI changes, and notes on how to verify (commands and routes).

## Security & Configuration Tips
- Don’t commit secrets. `.env*` files are gitignored; use `.env.local` for local config.

## Agent-Specific Instructions
When using an automated agent, keep diffs focused, avoid drive-by refactors, and run `npm run lint` before handing off.
