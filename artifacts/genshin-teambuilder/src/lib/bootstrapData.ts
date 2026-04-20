import { setGenshinData, type GenshinData } from "./genshin";

// Bump this when the data shape or URL-rewriting rules change so existing
// users discard their stale cache instead of being stuck with old icon URLs.
const STORAGE_KEY = "genshin-teambuilder.dataCache.v2";
const FETCH_TIMEOUT_MS = 4000;

type CachedEntry = {
  fetchedAt: number;
  data: GenshinData;
};

const apiUrl = (): string => {
  // Same-origin path-routed API. Works in dev (proxied) and production.
  return `${window.location.origin}/api/genshin-data`;
};

const readCache = (): CachedEntry | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedEntry;
    if (!parsed?.data?.characterNames) return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeCache = (data: GenshinData): void => {
  try {
    const entry: CachedEntry = { fetchedAt: Date.now(), data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // Quota exceeded or storage disabled — non-fatal, in-memory data still works.
  }
};

const fetchFresh = async (): Promise<GenshinData | null> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(apiUrl(), { signal: controller.signal });
    if (!res.ok) return null;
    const json = (await res.json()) as GenshinData;
    if (!json?.characterNames?.length) return null;
    return json;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
};

// Bootstrap order:
//   1. If a cached snapshot exists in localStorage, hydrate immediately for fast first paint.
//   2. Always try to fetch the latest snapshot in the background and update the cache.
//   3. If no cache and the network fetch beats our timeout, hydrate from it before mounting.
//   4. Otherwise the bundled snapshot already loaded into the module is used as fallback.
//
// Returns once the app has its best-available data ready to mount.
export const bootstrapGenshinData = async (): Promise<void> => {
  const cached = readCache();
  if (cached) {
    setGenshinData(cached.data);
    // Refresh in background; takes effect on next page load
    fetchFresh().then((fresh) => {
      if (fresh && fresh.version !== cached.data.version) {
        writeCache(fresh);
      }
    });
    return;
  }

  const fresh = await fetchFresh();
  if (fresh) {
    setGenshinData(fresh);
    writeCache(fresh);
  }
  // else: bundled fallback already in place
};
