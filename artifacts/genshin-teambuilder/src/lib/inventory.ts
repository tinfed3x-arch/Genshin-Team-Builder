import * as React from "react";
import { getAllWeaponNames, getCharacterNames } from "./genshin";

const CHAR_KEY = "gtb:owned-characters";
const WEAP_KEY = "gtb:owned-weapons";
const FLAG_CHAR_KEY = "gtb:owned-only-characters";
const FLAG_WEAP_KEY = "gtb:owned-only-weapons";
// Legacy single-toggle key from the previous version. Read once to migrate
// users who already enabled "Owned only" before the split.
const LEGACY_FLAG_KEY = "gtb:owned-only";
const EVENT = "gtb:inventory-changed";
const CHAR_CONSTELLATION_KEY = "gtb:character-constellations";
const WEAP_REFINEMENT_KEY = "gtb:weapon-refinements";

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

const safeParseNumberMap = (raw: string | null): Record<string, number> => {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(
        ([, value]) => typeof value === "number" && Number.isFinite(value),
      ),
    ) as Record<string, number>;
  } catch {
    return {};
  }
};

const normalizeKey = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

const resolveNames = (available: string[]): Map<string, string> =>
  new Map(available.map((name) => [normalizeKey(name), name]));

const resolveGoodName = (
  raw: unknown,
  available: Map<string, string>,
): string | null => {
  if (typeof raw !== "string") return null;
  const direct = available.get(normalizeKey(raw));
  if (direct) return direct;
  return null;
};

const validConstellation = (value: unknown): number | null =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= 0 &&
  value <= 6
    ? value
    : null;

const validRefinement = (value: unknown): number | null =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= 1 &&
  value <= 5
    ? value
    : null;

export type GoodImportResult = {
  charactersImported: number;
  weaponsImported: number;
  unknownCharacters: string[];
  unknownWeapons: string[];
};

export const importGoodInventory = (raw: string): GoodImportResult => {
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("The file does not contain a GOOD JSON object.");
  }
  const source = parsed as { characters?: unknown; weapons?: unknown };
  if (!Array.isArray(source.characters) && !Array.isArray(source.weapons)) {
    throw new Error("This file does not contain GOOD character or weapon data.");
  }

  const characterNames = resolveNames(getCharacterNames());
  const weaponNames = resolveNames(getAllWeaponNames());
  const importedCharacters = new Set(getOwnedCharacters());
  const importedWeapons = new Set(getOwnedWeapons());
  const characterConstellations = safeParseNumberMap(
    window.localStorage.getItem(CHAR_CONSTELLATION_KEY),
  );
  const weaponRefinements = safeParseNumberMap(
    window.localStorage.getItem(WEAP_REFINEMENT_KEY),
  );
  const unknownCharacters: string[] = [];
  const unknownWeapons: string[] = [];
  let charactersImported = 0;
  let weaponsImported = 0;

  const characterEntries = Array.isArray(source.characters)
    ? source.characters
    : [];
  const weaponEntries = Array.isArray(source.weapons) ? source.weapons : [];

  for (const entry of characterEntries) {
    if (!entry || typeof entry !== "object") continue;
    const item = entry as Record<string, unknown>;
    const rawName = item.key ?? item.name;
    const name = resolveGoodName(rawName, characterNames);
    // GOOD commonly uses "Traveler" for the account's Traveler entry.
    const traveler =
      typeof rawName === "string" &&
      normalizeKey(rawName) === "traveler";
    if (!name && !traveler) {
      if (typeof rawName === "string") unknownCharacters.push(rawName);
      continue;
    }
    const targetNames = traveler
      ? getCharacterNames().filter((n) => n.startsWith("Traveler ("))
      : [name as string];
    for (const target of targetNames) importedCharacters.add(target);
    const constellation = validConstellation(item.constellation);
    if (constellation !== null) {
      for (const target of targetNames) {
        characterConstellations[target] = constellation;
      }
    }
    charactersImported++;
  }

  for (const entry of weaponEntries) {
    if (!entry || typeof entry !== "object") continue;
    const item = entry as Record<string, unknown>;
    const rawName = item.key ?? item.name;
    const name = resolveGoodName(rawName, weaponNames);
    if (!name) {
      if (typeof rawName === "string") unknownWeapons.push(rawName);
      continue;
    }
    importedWeapons.add(name);
    const refinement = validRefinement(item.refinement);
    if (refinement !== null) {
      weaponRefinements[name] = Math.max(
        weaponRefinements[name] ?? 1,
        refinement,
      );
    }
    weaponsImported++;
  }

  window.localStorage.setItem(CHAR_KEY, JSON.stringify([...importedCharacters]));
  window.localStorage.setItem(WEAP_KEY, JSON.stringify([...importedWeapons]));
  window.localStorage.setItem(
    CHAR_CONSTELLATION_KEY,
    JSON.stringify(characterConstellations),
  );
  window.localStorage.setItem(WEAP_REFINEMENT_KEY, JSON.stringify(weaponRefinements));
  notify();

  return {
    charactersImported,
    weaponsImported,
    unknownCharacters: [...new Set(unknownCharacters)],
    unknownWeapons: [...new Set(unknownWeapons)],
  };
};

export const getCharacterConstellation = (name: string): number | null => {
  if (typeof window === "undefined") return null;
  if (!getOwnedCharacters().has(name)) return null;
  return (
    safeParseNumberMap(window.localStorage.getItem(CHAR_CONSTELLATION_KEY))[name] ??
    null
  );
};

export const getWeaponRefinement = (name: string): number => {
  if (typeof window === "undefined") return 1;
  if (!getOwnedWeapons().has(name)) return 1;
  return safeParseNumberMap(window.localStorage.getItem(WEAP_REFINEMENT_KEY))[name] ?? 1;
};

const writeNumberMapValue = (
  key: string,
  name: string,
  value: number | null,
): void => {
  if (typeof window === "undefined") return;
  const values = safeParseNumberMap(window.localStorage.getItem(key));
  if (value === null) delete values[name];
  else values[name] = value;
  window.localStorage.setItem(key, JSON.stringify(values));
  notify();
};

export const setCharacterConstellation = (
  name: string,
  constellation: number,
): void => {
  const value = validConstellation(constellation);
  if (value === null || !getOwnedCharacters().has(name)) return;
  writeNumberMapValue(CHAR_CONSTELLATION_KEY, name, value);
};

export const setWeaponRefinement = (name: string, refinement: number): void => {
  const value = validRefinement(refinement);
  if (value === null || !getOwnedWeapons().has(name)) return;
  writeNumberMapValue(WEAP_REFINEMENT_KEY, name, value);
};

// Cached snapshots — required for useSyncExternalStore stability.
// Each cache holds the last-read raw string and the parsed Set, so repeated
// getter calls return the same Set reference until localStorage changes.
type SetCache = { raw: string | null; value: ReadonlySet<string> };
const charCache: SetCache = { raw: "__init__", value: EMPTY_SET };
const weapCache: SetCache = { raw: "__init__", value: EMPTY_SET };
type FlagCache = { raw: string | null; value: boolean };
let flagCharCache: FlagCache = { raw: "__init__", value: false };
let flagWeapCache: FlagCache = { raw: "__init__", value: false };
let legacyMigrated = false;

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
  flagCharCache.raw = "__init__";
  flagWeapCache.raw = "__init__";
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

// One-time migration: if the user previously enabled the single combined
// "Owned only" toggle, carry that intent forward to BOTH new toggles so the
// UI doesn't silently change behavior on upgrade.
const migrateLegacyFlag = (): void => {
  if (legacyMigrated) return;
  if (typeof window === "undefined") return;
  legacyMigrated = true;
  const legacy = window.localStorage.getItem(LEGACY_FLAG_KEY);
  if (legacy === null) return;
  // Seed each new key independently if absent so partial-migration states
  // (e.g. one new key already written) still inherit the legacy preference.
  if (window.localStorage.getItem(FLAG_CHAR_KEY) === null) {
    window.localStorage.setItem(FLAG_CHAR_KEY, legacy);
  }
  if (window.localStorage.getItem(FLAG_WEAP_KEY) === null) {
    window.localStorage.setItem(FLAG_WEAP_KEY, legacy);
  }
  window.localStorage.removeItem(LEGACY_FLAG_KEY);
};

const readCachedFlag = (key: string, cache: FlagCache): boolean => {
  if (typeof window === "undefined") return false;
  migrateLegacyFlag();
  const raw = window.localStorage.getItem(key);
  if (raw === cache.raw) return cache.value;
  cache.raw = raw;
  cache.value = raw === "1";
  return cache.value;
};

export const getOwnedOnlyCharacters = (): boolean =>
  readCachedFlag(FLAG_CHAR_KEY, flagCharCache);

export const getOwnedOnlyWeapons = (): boolean =>
  readCachedFlag(FLAG_WEAP_KEY, flagWeapCache);

export const setCharacterOwned = (name: string, owned: boolean): void => {
  const cur = new Set(getOwnedCharacters());
  if (owned) {
    cur.add(name);
    const constellations = safeParseNumberMap(
      window.localStorage.getItem(CHAR_CONSTELLATION_KEY),
    );
    if (constellations[name] === undefined) {
      constellations[name] = 0;
      window.localStorage.setItem(
        CHAR_CONSTELLATION_KEY,
        JSON.stringify(constellations),
      );
    }
  }
  else {
    cur.delete(name);
    writeNumberMapValue(CHAR_CONSTELLATION_KEY, name, null);
  }
  writeSet(CHAR_KEY, cur);
};

export const setWeaponOwned = (name: string, owned: boolean): void => {
  const cur = new Set(getOwnedWeapons());
  if (owned) cur.add(name);
  else {
    cur.delete(name);
    writeNumberMapValue(WEAP_REFINEMENT_KEY, name, null);
  }
  writeSet(WEAP_KEY, cur);
};

export const setManyCharactersOwned = (names: string[], owned: boolean): void => {
  const cur = new Set(getOwnedCharacters());
  for (const n of names) {
    if (owned) cur.add(n);
    else {
      cur.delete(n);
      writeNumberMapValue(CHAR_CONSTELLATION_KEY, n, null);
    }
  }
  writeSet(CHAR_KEY, cur);
};

export const setManyWeaponsOwned = (names: string[], owned: boolean): void => {
  const cur = new Set(getOwnedWeapons());
  for (const n of names) {
    if (owned) cur.add(n);
    else {
      cur.delete(n);
      writeNumberMapValue(WEAP_REFINEMENT_KEY, n, null);
    }
  }
  writeSet(WEAP_KEY, cur);
};

export const setOwnedOnlyCharacters = (value: boolean): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FLAG_CHAR_KEY, value ? "1" : "0");
  notify();
};

export const setOwnedOnlyWeapons = (value: boolean): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FLAG_WEAP_KEY, value ? "1" : "0");
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
  const ownedOnlyCharacters = React.useSyncExternalStore(
    subscribe,
    getOwnedOnlyCharacters,
    getServerFalse
  );
  const ownedOnlyWeapons = React.useSyncExternalStore(
    subscribe,
    getOwnedOnlyWeapons,
    getServerFalse
  );
  return {
    ownedChars,
    ownedWeapons,
    ownedOnlyCharacters,
    ownedOnlyWeapons,
  };
};
