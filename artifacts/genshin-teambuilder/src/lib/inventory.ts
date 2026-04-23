import * as React from "react";

const CHAR_KEY = "gtb:owned-characters";
const WEAP_KEY = "gtb:owned-weapons";
const FLAG_KEY = "gtb:owned-only";
const EVENT = "gtb:inventory-changed";

const EMPTY_SET: ReadonlySet<string> = new Set();

type Listener = () => void;

const safeParse = (raw: string | null): string[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
};

// Cached snapshots — required for useSyncExternalStore stability.
// Each cache holds the last-read raw string and the parsed Set, so repeated
// getter calls return the same Set reference until localStorage changes.
type SetCache = { raw: string | null; value: ReadonlySet<string> };
const charCache: SetCache = { raw: "__init__", value: EMPTY_SET };
const weapCache: SetCache = { raw: "__init__", value: EMPTY_SET };
let flagCache: { raw: string | null; value: boolean } = {
  raw: "__init__",
  value: false,
};

const readCachedSet = (key: string, cache: SetCache): ReadonlySet<string> => {
  if (typeof window === "undefined") return EMPTY_SET;
  const raw = window.localStorage.getItem(key);
  if (raw === cache.raw) return cache.value;
  cache.raw = raw;
  cache.value = new Set(safeParse(raw));
  return cache.value;
};

const invalidateCaches = (): void => {
  charCache.raw = "__init__";
  weapCache.raw = "__init__";
  flagCache.raw = "__init__";
};

const notify = (): void => {
  if (typeof window === "undefined") return;
  invalidateCaches();
  window.dispatchEvent(new Event(EVENT));
};

const writeSet = (key: string, value: Set<string>): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify([...value]));
  notify();
};

export const getOwnedCharacters = (): ReadonlySet<string> =>
  readCachedSet(CHAR_KEY, charCache);

export const getOwnedWeapons = (): ReadonlySet<string> =>
  readCachedSet(WEAP_KEY, weapCache);

export const getOwnedOnly = (): boolean => {
  if (typeof window === "undefined") return false;
  const raw = window.localStorage.getItem(FLAG_KEY);
  if (raw === flagCache.raw) return flagCache.value;
  flagCache = { raw, value: raw === "1" };
  return flagCache.value;
};

export const setCharacterOwned = (name: string, owned: boolean): void => {
  const cur = new Set(getOwnedCharacters());
  if (owned) cur.add(name);
  else cur.delete(name);
  writeSet(CHAR_KEY, cur);
};

export const setWeaponOwned = (name: string, owned: boolean): void => {
  const cur = new Set(getOwnedWeapons());
  if (owned) cur.add(name);
  else cur.delete(name);
  writeSet(WEAP_KEY, cur);
};

export const setManyCharactersOwned = (names: string[], owned: boolean): void => {
  const cur = new Set(getOwnedCharacters());
  for (const n of names) {
    if (owned) cur.add(n);
    else cur.delete(n);
  }
  writeSet(CHAR_KEY, cur);
};

export const setManyWeaponsOwned = (names: string[], owned: boolean): void => {
  const cur = new Set(getOwnedWeapons());
  for (const n of names) {
    if (owned) cur.add(n);
    else cur.delete(n);
  }
  writeSet(WEAP_KEY, cur);
};

export const setOwnedOnly = (value: boolean): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FLAG_KEY, value ? "1" : "0");
  notify();
};

const subscribe = (listener: Listener): (() => void) => {
  const handler = () => {
    invalidateCaches();
    listener();
  };
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
};

const getServerEmptySet = (): ReadonlySet<string> => EMPTY_SET;
const getServerFalse = (): boolean => false;

export const useInventory = () => {
  const ownedChars = React.useSyncExternalStore(
    subscribe,
    getOwnedCharacters,
    getServerEmptySet
  );
  const ownedWeapons = React.useSyncExternalStore(
    subscribe,
    getOwnedWeapons,
    getServerEmptySet
  );
  const ownedOnly = React.useSyncExternalStore(
    subscribe,
    getOwnedOnly,
    getServerFalse
  );
  return { ownedChars, ownedWeapons, ownedOnly };
};
