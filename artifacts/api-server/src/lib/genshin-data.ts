// Builds a trimmed snapshot of genshin-db for the team-builder frontend.
// Computed once at server startup and cached in memory. To pick up newly
// released genshin-db data, redeploy the api-server (the package is pinned
// to "latest" so each fresh build installs the newest version).

import GenshinDb from "genshin-db";
import { createRequire } from "node:module";
const packageRequire = createRequire(import.meta.url);
const rawGenshinDb = packageRequire("genshin-db/src/min/data.min.json");

const ELEMENT_CATEGORIES = [
  "ELEMENT_PYRO",
  "ELEMENT_HYDRO",
  "ELEMENT_ANEMO",
  "ELEMENT_ELECTRO",
  "ELEMENT_CRYO",
  "ELEMENT_GEO",
  "ELEMENT_DENDRO",
];

// Special-event / elementless playable units that the element-category
// queries above miss because their elementType is ELEMENT_NONE. genshin-db's
// matchCategories doesn't support QUALITY_* categories, so we list them by
// name and union them in (Set dedupes).
const EXTRA_CHARACTER_NAMES = ["Manekin", "Manekina"];

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

// Manekin and Manekina share one element-agnostic talent kit. These special
// Wonderland characters are not yet included in genshin-db's talent records.
const MANEKIN_TALENTS = {
  combat1: {
    name: "Outlander Arts: Vigilant Watch",
    description:
      "Normal Attack\nPerforms up to 4 rapid strikes.\n\nCharged Attack\nConsumes a certain amount of Stamina to unleash 2 rapid sword strikes.\n\nPlunging Attack\nPlunges from mid-air to strike the ground below, damaging opponents along the path and dealing AoE DMG upon impact.",
  },
  combat2: {
    name: "Punishing Barrage",
    description:
      "The Manekin attacks nearby opponents once, dealing AoE DMG corresponding to their own Elemental Type before pulling back rapidly. After unleashing an Elemental Skill, the Manekin's Normal Attacks, Charged Attacks, and Plunging Attacks are converted to deal the corresponding elemental DMG, which cannot be overridden by other Elemental infusions, for a period of time. This effect will disappear when the Manekin leaves the field.\n\nHas 2 charges.\n\n\"A well-measured blow is a necessary warning.\"",
  },
  combat3: {
    name: "No Entry",
    description:
      "The Manekin summons a \"Restricted Area\" that follows them around, dealing 1 instance of DMG corresponding to the Manekin's Elemental Type to nearby opponents.\n\nAdditionally, when opponents enter the Restricted Area, they will receive 1 instance of DMG corresponding to the Manekin's Elemental Type. This effect can trigger once every 0.5s.\n\nThe Restricted Area will disappear when the Manekin leaves the field.\n\n\"Those who insist on trespassing within the restricted area will be regarded as hostile and expelled with maximum force.\"",
  },
  passive1: {
    name: "Battlelines Redrawn",
    description:
      "When the Manekin leaves the field, if a Restricted Area that they summoned is still active, it will explode, dealing AoE DMG of the Manekin's Elemental Type equal to 200% of the Manekin's ATK.",
  },
  passive2: {
    name: "Combat Readiness",
    description:
      "When the Manekin is not on the field and their Elemental Energy is below 30%, they will recover 2 Elemental Energy per second.",
  },
  passive3: {
    name: "Agile Stance",
    description:
      "When the Manekin unleashes an Elemental Skill or Burst, it will change to one of its existing Cosmetic Plans at random.",
  },
};

const LEGACY_ARTIFACT_NAMES = [
  "A Day Carved From Rising Winds",
  "Adventurer",
  "Archaic Petra",
  "Aubade of Morningstar and Moon",
  "Berserker",
  "Blizzard Strayer",
  "Bloodstained Chivalry",
  "Brave Heart",
  "Celestial Gift",
  "Crimson Witch of Flames",
  "Deepwood Memories",
  "Defender's Will",
  "Disenchantment in Deep Shadow",
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
  "Prayers for Destiny",
  "Prayers for Illumination",
  "Prayers for Wisdom",
  "Prayers to Springtime",
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

const ARTIFACT_NAMES = Object.values(
  rawGenshinDb.data.English.artifacts as Record<
    string,
    { name?: string; effect2Pc?: string; rarityList?: number[] }
  >,
)
  .filter(
    (artifact) =>
      artifact.effect2Pc &&
      (artifact.rarityList ?? []).some((rarity) => rarity >= 4),
  )
  .map((artifact) => artifact.name)
  .filter((name): name is string => Boolean(name))
  .sort();

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

  const characterNames = [
    ...new Set([
      ...collectNames(ELEMENT_CATEGORIES, GenshinDb.characters),
      ...EXTRA_CHARACTER_NAMES.filter((n) => {
        const c = GenshinDb.characters(n);
        return c && !Array.isArray(c);
      }),
    ]),
  ].sort();
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

  for (const name of ["Manekin", "Manekina"]) {
    talents[name] = MANEKIN_TALENTS;
  }

  const weapons: Record<string, unknown> = {};
  for (const name of allWeaponNames) {
    const w = GenshinDb.weapons(name);
    if (w && !Array.isArray(w)) {
      fillImageFromFilename(w, WEAPON_MAP);
      const maxStats = w.stats(90);
      weapons[name] = {
        ...w,
        maxAtk: maxStats?.attack ?? null,
        maxSubstatValue: maxStats?.specialized ?? null,
      };
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
