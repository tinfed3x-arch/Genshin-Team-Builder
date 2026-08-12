---
name: Genshin wiki data fetching
description: How to reliably pull character/weapon data from the Genshin Impact fandom wiki
---
- `webFetch` on genshin-impact.fandom.com pages intermittently fails (402/502). Use the MediaWiki API via raw `fetch` inside a `"use impure"` function with a browser User-Agent: `https://genshin-impact.fandom.com/api.php?action=parse&page=X&prop=text&format=json`.
- **Why:** Fandom blocks the default fetcher; the API endpoint does not.
- **How to apply:** Character pages store talents/stats in transcluded templates — raw wikitext (`prop=wikitext`) only shows stubs like `{{Talent Table}}`. Fetch rendered HTML (`prop=text`) and strip tags instead. Icon URLs: `action=query&titles=File:X.png&prop=imageinfo&iiprop=url` gives the static.wikia.nocookie.net URL directly.
- Brand-new characters' pages may be "Upcoming Content" stubs missing skill/burst descriptions; Gachabase and games.gg articles are useful fallbacks.
- Gachabase (`gi.gachabase.net/characters/<id>/<slug>/beta`, `/weapons/beta` for listing) has full beta/day-one data including official talent descriptions and complete 15-level scaling. The scaling is embedded in React flight data as minified var assignments (`X[0]=5.16;` next to `levels:[{level:1,descriptions:a,parameters:b,...}]`) — parse assignments in the ~60k chars before each `levels:[` block and map desc/param vars per level to rebuild genshin-db-style `attributes` (labels + param1..N arrays).
