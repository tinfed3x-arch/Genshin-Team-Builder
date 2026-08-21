import bundledData from "../data/genshin-data.json";

export type GenshinData = {
  version?: string;
  generatedAt?: string;
  characterNames: string[];
  travelerForms: string[];
  weaponNamesByType: Record<string, string[]>;
  allWeaponNames: string[];
  artifactNames: string[];
  characters: Record<string, any>;
  talents: Record<string, any>;
  constellations: Record<string, any>;
  weapons: Record<string, any>;
  artifacts: Record<string, any>;
};

// Live data snapshot — starts as the bundled fallback; can be swapped at
// runtime via setGenshinData() to reflect the latest genshin-db release
// fetched from the api-server.
let data: GenshinData = bundledData as unknown as GenshinData;

export const setGenshinData = (next: GenshinData): void => {
  data = next;
  ARTIFACT_NAMES = buildArtifactNames();
};

export const getGenshinDataVersion = (): string =>
  data.version ?? "bundled";

// Traveler elemental forms (fixed list, independent of data version)
export const TRAVELER_FORMS = [
  "Traveler (Anemo)",
  "Traveler (Geo)",
  "Traveler (Electro)",
  "Traveler (Dendro)",
  "Traveler (Hydro)",
  "Traveler (Pyro)",
  "Traveler (Cryo)",
];

export const isTravelerForm = (name: string) =>
  name.startsWith("Traveler (") && name.endsWith(")");

export const getTravelerElement = (name: string): string | null => {
  const match = name.match(/^Traveler \((\w+)\)$/);
  return match ? match[1] : null;
};

export const getCharacterNames = (): string[] => {
  const nameSet = new Set<string>(data.characterNames);
  TRAVELER_FORMS.forEach((f) => nameSet.add(f));
  return [...nameSet].sort();
};

export const getCharacterData = (name: string) => {
  return data.characters[name] ?? null;
};

// Returns character-like data for any name, handling Traveler forms by
// using Aether's base stats and overriding the element with the form's element.
export const getEffectiveCharacterData = (name: string) => {
  if (isTravelerForm(name)) {
    const element = getTravelerElement(name);
    const base = getCharacterData("Aether");
    if (!base) return null;
    return {
      ...base,
      name,
      elementText: element ?? "None",
      elementType: element ? `ELEMENT_${element.toUpperCase()}` : "ELEMENT_NONE",
    };
  }
  return getCharacterData(name);
};

export const getTalentData = (name: string) => {
  return data.talents[name] ?? null;
};

export const getConstellationData = (name: string) => {
  return data.constellations[name] ?? null;
};

const isSelectableWeapon = (name: string): boolean =>
  Number(data.weapons[name]?.rarity ?? 0) >= 3;

export const getWeaponNamesByType = (weaponType: string): string[] => {
  return [...(data.weaponNamesByType[weaponType] ?? [])]
    .filter(isSelectableWeapon)
    .sort();
};

export const getAllWeaponNames = (): string[] => {
  return [...data.allWeaponNames].filter(isSelectableWeapon).sort();
};

export const getWeaponData = (name: string) => {
  return data.weapons[name] ?? null;
};

// All selectable artifact sets, derived from the data: multi-piece sets only
// (1-piece "Prayers" sets are excluded) with a max rarity of at least 4 stars.
const buildArtifactNames = (): string[] =>
  Object.values(data.artifacts as Record<string, { name?: string; rarityList?: number[]; effect2Pc?: string }>)
    .filter(
      (a) =>
        typeof a?.name === "string" &&
        typeof a?.effect2Pc === "string" &&
        Math.max(...(a?.rarityList ?? [0])) >= 4,
    )
    .map((a) => a.name as string)
    .sort((x, y) => x.localeCompare(y));

export let ARTIFACT_NAMES = buildArtifactNames();

export const getArtifactData = (name: string) => {
  return data.artifacts[name] ?? null;
};

/**
 * Format a weapon's max-level substat value (decimal fraction) into a human-
 * readable string that matches the in-game display.
 */
export const formatWeaponSubstat = (
  mainStatText: string | undefined,
  value: number | null | undefined,
): string => {
  if (value == null || !mainStatText) return "—";
  // Weapon substats: only Elemental Mastery is a flat numeric value.
  // ATK / DEF / HP / CRIT Rate / CRIT DMG / Energy Recharge / Physical DMG Bonus
  // are all percentage-based (stored as a decimal fraction, e.g. 0.331 = 33.1%).
  const isFlat = mainStatText === "Elemental Mastery";
  if (isFlat) return `${Math.round(value)}`;
  return `${(value * 100).toFixed(1).replace(/\.0$/, "")}%`;
};

export const stripHtml = (text: string): string => {
  return (text ?? "").replace(/<[^>]*>?/gm, "");
};

// enka.network mirrors all in-game UI icons reliably; mihoyo's own CDN
// returns 404s for newer artifact sets and some weapons. We rewrite at read
// time as a safety net so stale caches / stale API responses still render.
const ENKA_CDN = "https://enka.network/ui";
const BROKEN_HOSTS = ["upload-os-bbs.mihoyo.com"];

const isBrokenUrl = (u: string): boolean =>
  BROKEN_HOSTS.some((host) => u.includes(host));

// Picks the best available square icon URL from a genshin-db images object.
// If the chosen URL points at a known-broken CDN, transparently rewrite it
// to enka.network using the matching `filename_*` field on the same entry.
const pickImage = (
  images: Record<string, unknown> | undefined,
  keys: string[],
  filenameKeys: string[],
): string | null => {
  if (!images) return null;
  // Find the best filename to use as an enka fallback.
  let enkaUrl: string | null = null;
  for (const fk of filenameKeys) {
    const fname = images[fk];
    if (typeof fname === "string" && fname.length > 0) {
      enkaUrl = `${ENKA_CDN}/${fname}.png`;
      break;
    }
  }
  for (const key of keys) {
    const v = images[key];
    if (typeof v === "string" && v.startsWith("http")) {
      return isBrokenUrl(v) && enkaUrl ? enkaUrl : v;
    }
  }
  // No usable URL in the requested keys — fall back to enka if we have a filename.
  return enkaUrl;
};

export const getCharacterIcon = (name: string): string | null => {
  // Travelers reuse Aether's icon since per-form icons aren't shipped.
  const baseName = isTravelerForm(name) ? "Aether" : name;
  const c = data.characters[baseName] as { images?: Record<string, unknown> } | undefined;
  return pickImage(
    c?.images,
    ["mihoyo_icon", "hoyolab-avatar", "hoyowiki_icon"],
    ["filename_icon"],
  );
};

export const getWeaponIcon = (name: string): string | null => {
  const w = data.weapons[name] as { images?: Record<string, unknown> } | undefined;
  return pickImage(w?.images, ["icon", "mihoyo_icon"], ["filename_icon"]);
};

export type ArtifactPiece = "flower" | "plume" | "sands" | "goblet" | "circlet";

export const getArtifactIcon = (
  name: string,
  piece: ArtifactPiece = "flower",
): string | null => {
  const a = data.artifacts[name] as { images?: Record<string, unknown> } | undefined;
  return pickImage(
    a?.images,
    [piece, `mihoyo_${piece}`, "flower", "mihoyo_flower"],
    [`filename_${piece}`, "filename_flower"],
  );
};

export const ELEMENT_COLORS: Record<string, string> = {
  Pyro: "#E8612B",
  Hydro: "#1C72D1",
  Anemo: "#35C5A0",
  Electro: "#A855B5",
  Cryo: "#7EC8E3",
  Geo: "#F0A02E",
  Dendro: "#7CBF3F",
};

export const MAIN_STATS = {
  Sands: ["HP%", "DEF%", "ATK%", "Energy Recharge%", "Elemental Mastery"],
  Goblet: [
    "HP%",
    "DEF%",
    "ATK%",
    "Elemental Mastery",
    "Pyro DMG Bonus%",
    "Hydro DMG Bonus%",
    "Anemo DMG Bonus%",
    "Electro DMG Bonus%",
    "Cryo DMG Bonus%",
    "Geo DMG Bonus%",
    "Dendro DMG Bonus%",
    "Physical DMG Bonus%",
  ],
  Circlet: [
    "HP%",
    "DEF%",
    "ATK%",
    "Elemental Mastery",
    "CRIT Rate%",
    "CRIT DMG%",
    "Healing Bonus%",
  ],
};
