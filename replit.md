# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Deploying the Genshin Team Builder to GitHub Pages

The team builder works as a fully static site (it ships with a precomputed
JSON snapshot of `genshin-db`, and the runtime API fetch falls back to that
bundled data when no api-server is reachable).

A workflow at `.github/workflows/deploy-gh-pages.yml` handles the deploy
automatically:

1. Push the repo to GitHub.
2. In the repo's **Settings → Pages**, set "Build and deployment" → "Source"
   to **GitHub Actions**.
3. Push to `main` (or trigger the "Deploy Genshin Team Builder to GitHub
   Pages" workflow manually). The action runs `pnpm install`, builds with
   `BASE_PATH=/<repo-name>/`, copies `index.html` → `404.html` (SPA
   fallback), drops in `.nojekyll`, and deploys `dist/public/` via the
   official Pages action.

The site will be live at `https://<user>.github.io/<repo>/`.

To build for a static host manually:

```
BASE_PATH=/<sub-path>/ pnpm --filter @workspace/genshin-teambuilder run build:gh-pages
```

The `BASE_PATH` env var must include leading and trailing slashes. For
custom domains (apex / `CNAME`) use `BASE_PATH=/`.
