# Genshin Impact Team Builder

A static, install-as-PWA web app for planning Genshin Impact teams: pick four
characters, set their constellations, weapons, artifact sets, mainstats, and
talent priorities, and share the resulting team via a compact URL.

Live site: <https://tinfed3x-arch.github.io/Genshin-Team-Builder/>

## Features

- Four character slots with element, weapon, rarity, ascension stat, talents,
  and constellation details.
- Valid artifact mainstats per slot (sands / goblet / circlet).
- 4-piece or 2 × 2-piece set bonus configuration with the right bonus text
  shown for each mode.
- Weapon picker filtered by the selected character's weapon type.
- Save teams locally and share them via a short URL.
- Direct link out to the matching [KeqingMains](https://keqingmains.com/)
  community guide for each character.
- Installable as a PWA, works offline after first load.
- Game data updates automatically: a precomputed snapshot ships with each
  build, and the app falls back to that snapshot when no API is reachable
  (so the static GitHub Pages deploy works fully offline).

## Credits & data sources

- Character, weapon, and artifact data: the
  [`genshin-db`](https://www.npmjs.com/package/genshin-db) npm package.
- Character icons: the [Enka.Network](https://enka.network/) static asset CDN.
- Build / playstyle reference links: the
  [KeqingMains](https://keqingmains.com/) community wiki.
- Genshin Impact and all related assets are © COGNOSPHERE PTE. LTD. /
  HoYoverse. This project is a fan-made build planner with no official
  affiliation.

## Tech stack

- React + Vite, TypeScript, Tailwind CSS, shadcn/ui, Radix Collapsible.
- Workspace managed with pnpm; deployed to GitHub Pages via the workflow at
  `.github/workflows/deploy-gh-pages.yml`.

## Local development

```bash
pnpm install
pnpm --filter @workspace/genshin-teambuilder run dev
```

## Deploying

The site is fully static. To build a deployable bundle for any sub-path:

```bash
BASE_PATH=/<sub-path>/ pnpm --filter @workspace/genshin-teambuilder run build:gh-pages
```

The output lands in `artifacts/genshin-teambuilder/dist/public/` and includes
a `404.html` SPA fallback and a `.nojekyll` marker. For GitHub Pages, the
bundled workflow handles `BASE_PATH` automatically from the repo name — just
enable Pages with "Source: GitHub Actions" in the repo settings and push to
`main`.

## License

[MIT](./LICENSE)
