// Builds a trimmed snapshot of genshin-db for the team-builder frontend.
// Computed once at server startup and cached in memory. To pick up newly
// released genshin-db data, redeploy the api-server (the package is pinned
// to "latest" so each fresh build installs the newest version).

// @ts-expect-error - genshin-db has no types in this workspace
import GenshinDb from "genshin-db";
import { createRequire } from "node:module";

const ELEMENT_CATEGORIES = [
  "ELEMENT_PYRO",
  "ELEMENT_HYDRO",
  "ELEMENT_ANEMO",
  "ELEMENT_ELECTRO",
  "ELEMENT_CRYO",
  "ELEMENT_GEO",
  "ELEMENT_DENDRO",
];

const WEAPON_TYPE_CATEGORIES = [
  "WEAPON_SWORD_ONE_HAND",
  "WEAPON_CLAYMORE",
  "WEAPON_POLE",
  "WEAPON_BOW",
  "WEAPON_CATALYST",
];

const TRAVELER_FORMS = [
  "Traveler (Anemo)",
  "Traveler (Geo)",
  "Traveler (Electro)",
  "Traveler (Dendro)",
  "Traveler (Hydro)",
  "Traveler (Pyro)",
  "Traveler (Cryo)",
];

const ARTIFACT_NAMES = [
  "A Day Carved From Rising Winds",
  "Adventurer",
  "Archaic Petra",
  "Aubade of Morningstar and Moon",
  "Berserker",
  "Blizzard Strayer",
  "Bloodstained Chivalry",
  "Brave Heart",
  "Crimson Witch of Flames",
  "Deepwood Memories",
  "Defender's Will",
  "Desert Pavilion Chronicle",
  "Echoes of an Offering",
  "Emblem of Severed Fate",
  "Finale of the Deep Galleries",
  "Flower of Paradise Lost",
  "Fragment of Harmonic Whimsy",
  "Gambler",
  "Gilded Dreams",
  "Gladiator's Finale",
  "Golden Troupe",
  "Heart of Depth",
  "Husk of Opulent Dreams",
  "Instructor",
  "Lavawalker",
  "Long Night's Oath",
  "Lucky Dog",
  "Maiden Beloved",
  "Marechaussee Hunter",
  "Martial Artist",
  "Night of the Sky's Unveiling",
  "Nighttime Whispers in the Echoing Woods",
  "Noblesse Oblige",
  "Nymph's Dream",
  "Obsidian Codex",
  "Ocean-Hued Clam",
  "Pale Flame",
  "Resolution of Sojourner",
  "Retracing Bolide",
  "Scholar",
  "Scroll of the Hero of Cinder City",
  "Shimenawa's Reminiscence",
  "Silken Moon's Serenade",
  "Song of Days Past",
  "Tenacity of the Millelith",
  "The Exile",
  "Thundering Fury",
  "Thundersoother",
  "Tiny Miracle",
  "Traveling Doctor",
  "Unfinished Reverie",
  "Vermillion Hereafter",
  "Viridescent Venerer",
  "Vourukasha's Glow",
  "Wanderer's Troupe",
];

export type GenshinDataSnapshot = {
  version: string;
  generatedAt: string;
  characterNames: string[];
  travelerForms: string[];
  weaponNamesByType: Record<string, string[]>;
  allWeaponNames: string[];
  artifactNames: string[];
  characters: Record<string, unknown>;
  talents: Record<string, unknown>;
  constellations: Record<string, unknown>;
  weapons: Record<string, unknown>;
  artifacts: Record<string, unknown>;
};

const collectNames = (
  categories: string[],
  fn: (c: string, opts: { matchCategories: true }) => unknown,
): string[] => {
  const set = new Set<string>();
  for (const c of categories) {
    try {
      const list = fn(c, { matchCategories: true });
      if (Array.isArray(list)) list.forEach((n: string) => set.add(n));
    } catch {
      // skip
    }
  }
  return [...set].sort();
};

const getInstalledVersion = (): string => {
  try {
    const require = createRequire(import.meta.url);
    const pkg = require("genshin-db/package.json") as { version: string };
    return pkg.version;
  } catch {
    return "unknown";
  }
};

// enka.network mirrors all in-game UI icons (old + newly released sets) at
// /ui/{filename}.png. Used as a fallback because mihoyo's own CDN omits icons
// for newer artifact sets even though genshin-db generates URLs pointing to it.
const ENKA_CDN = "https://enka.network/ui";

const isHttpUrl = (v: unknown): v is string =>
  typeof v === "string" && v.startsWith("http");

const fillImageFromFilename = (
  entry: unknown,
  mappings: Array<{ url: string; filename: string }>,
): void => {
  if (!entry || typeof entry !== "object") return;
  const obj = entry as { images?: Record<string, unknown> };
  const images = obj.images;
  if (!images || typeof images !== "object") return;
  for (const { url, filename } of mappings) {
    const fname = images[filename];
    if (typeof fname !== "string" || fname.length === 0) continue;
    const enkaUrl = `${ENKA_CDN}/${fname}.png`;
    // Always overwrite with enka.network: it serves all icons reliably,
    // whereas the mihoyo URLs already in the data 404 for newer content.
    if (!isHttpUrl(images[url]) || (images[url] as string).includes("upload-os-bbs.mihoyo.com")) {
      images[url] = enkaUrl;
    }
  }
};

let cached: GenshinDataSnapshot | null = null;

export const buildGenshinSnapshot = (): GenshinDataSnapshot => {
  if (cached) return cached;

  const characterNames = collectNames(ELEMENT_CATEGORIES, GenshinDb.characters);
  const weaponNamesByType: Record<string, string[]> = {};
  for (const type of WEAPON_TYPE_CATEGORIES) {
    weaponNamesByType[type] = collectNames([type], GenshinDb.weapons);
  }
  const allWeaponNames = [
    ...new Set(Object.values(weaponNamesByType).flat()),
  ].sort();

  const CHAR_MAP = [{ url: "mihoyo_icon", filename: "filename_icon" }];
  const WEAPON_MAP = [
    { url: "icon", filename: "filename_icon" },
    { url: "mihoyo_icon", filename: "filename_icon" },
  ];
  const ART_PIECES = ["flower", "plume", "sands", "goblet", "circlet"] as const;
  const ART_MAP = ART_PIECES.flatMap((p) => [
    { url: p, filename: `filename_${p}` },
    { url: `mihoyo_${p}`, filename: `filename_${p}` },
  ]);

  const characters: Record<string, unknown> = {};
  const talents: Record<string, unknown> = {};
  const constellations: Record<string, unknown> = {};

  for (const name of characterNames) {
    const c = GenshinDb.characters(name);
    if (c && !Array.isArray(c)) {
      fillImageFromFilename(c, CHAR_MAP);
      characters[name] = c;
    }
    const t = GenshinDb.talents(name);
    if (t && !Array.isArray(t)) talents[name] = t;
    const k = GenshinDb.constellations(name);
    if (k && !Array.isArray(k)) constellations[name] = k;
  }

  const aether = GenshinDb.characters("Aether");
  if (aether && !Array.isArray(aether)) {
    fillImageFromFilename(aether, CHAR_MAP);
    characters["Aether"] = aether;
  }

  for (const form of TRAVELER_FORMS) {
    const t = GenshinDb.talents(form);
    if (t && !Array.isArray(t)) talents[form] = t;
    const k = GenshinDb.constellations(form);
    if (k && !Array.isArray(k)) constellations[form] = k;
  }

  const weapons: Record<string, unknown> = {};
  for (const name of allWeaponNames) {
    const w = GenshinDb.weapons(name);
    if (w && !Array.isArray(w)) {
      fillImageFromFilename(w, WEAPON_MAP);
      weapons[name] = w;
    }
  }

  const artifacts: Record<string, unknown> = {};
  for (const name of ARTIFACT_NAMES) {
    const a = GenshinDb.artifacts(name);
    if (a && !Array.isArray(a)) {
      fillImageFromFilename(a, ART_MAP);
      artifacts[name] = a;
    }
  }

  cached = {
    version: getInstalledVersion(),
    generatedAt: new Date().toISOString(),
    characterNames,
    travelerForms: TRAVELER_FORMS,
    weaponNamesByType,
    allWeaponNames,
    artifactNames: ARTIFACT_NAMES,
    characters,
    talents,
    constellations,
    weapons,
    artifacts,
  };

  return cached;
};
