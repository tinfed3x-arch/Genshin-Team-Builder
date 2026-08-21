---
name: genshin-db package updates
description: Release timing and snapshot regeneration considerations for genshin-db upgrades
---

Fresh genshin-db releases can be temporarily rejected by the workspace package firewall's minimum-release-age policy even when the registry reports the version as latest.

**Why:** The 5.2.13 package was published recently enough that the first normal install attempt was blocked.

**How to apply:** Confirm the package version and source first, then use the package manager's minimum-release-age override for that specific install if needed. Regenerate both the frontend bundled snapshot and API snapshot afterward.