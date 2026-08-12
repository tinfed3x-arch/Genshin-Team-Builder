---
name: Manual genshin-db overlay
description: Pattern for adding new game content before the genshin-db npm package updates
---
- New characters/weapons released before genshin-db catches up go in `artifacts/genshin-teambuilder/src/data/manual-additions.ts` in genshin-db entry format. `applyManualAdditions` is a non-mutating add-if-absent merge applied in `src/lib/genshin.ts` both at module init (bundled data) and inside `setGenshinData` (server/cache snapshots).
- **Why:** merging at read time covers all three data sources (bundled JSON, localStorage cache, api-server fetch) without touching the api-server or bumping cache keys; once genshin-db ships the real entries the overlay is skipped by name and the file can be deleted.
- **How to apply:** percent substats use decimal fractions (22.1% → `maxSubstatValue: 0.221`) — the UI multiplies by 100. Icons can be direct fandom static URLs in `images.mihoyo_icon`; the enka rewrite only triggers for broken mihoyo hosts. New reactions go in `REACTION_ELEMENTS` in `RichPickerDialog.tsx`.
