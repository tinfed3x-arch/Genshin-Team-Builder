// Pre-extracts only the genshin-db data the frontend needs into a single
// small JSON file. This avoids bundling the 166MB genshin-db package into
// the Vite production build (which OOMs).
import GenshinDb from "genshin-db";
import { writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, "..", "src", "data", "genshin-data.json");
const require = createRequire(import.meta.url);
const rawGenshinDb = require("genshin-db/src/min/data.min.json");

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

// Manekin and Manekina are elementless Wonderland characters whose shared
// talent kit is not yet exposed by genshin-db. Their elemental form changes
// the damage type, not the talent descriptions.
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
  rawGenshinDb.data.English.artifacts,
)
  .filter(
    (artifact) =>
      artifact.effect2Pc &&
      (artifact.rarityList ?? []).some((rarity) => rarity >= 4),
  )
  .map((artifact) => artifact.name)
  .sort();

// enka.network mirrors all in-game UI icons (old + new) at /ui/{filename}.png.
// Mihoyo's own CDN omits icons for newer artifact sets, so we override any
// upload-os-bbs.mihoyo.com URL with the enka equivalent for reliability.
const ENKA_CDN = "https://enka.network/ui";

const fillImageFromFilename = (entry, mappings) => {
  if (!entry || typeof entry !== "object") return;
  const images = entry.images;
  if (!images || typeof images !== "object") return;
  for (const { url, filename } of mappings) {
    const fname = images[filename];
    if (typeof fname !== "string" || fname.length === 0) continue;
    const existing = images[url];
    if (
      typeof existing !== "string" ||
      !existing.startsWith("http") ||
      existing.includes("upload-os-bbs.mihoyo.com")
    ) {
      images[url] = `${ENKA_CDN}/${fname}.png`;
    }
  }
};

const CHAR_MAP = [{ url: "mihoyo_icon", filename: "filename_icon" }];
const WEAPON_MAP = [
  { url: "icon", filename: "filename_icon" },
  { url: "mihoyo_icon", filename: "filename_icon" },
];
const ART_PIECES = ["flower", "plume", "sands", "goblet", "circlet"];
const ART_MAP = ART_PIECES.flatMap((p) => [
  { url: p, filename: `filename_${p}` },
  { url: `mihoyo_${p}`, filename: `filename_${p}` },
]);

const collectNames = (categories, fn) => {
  const set = new Set();
  for (const c of categories) {
    try {
      const list = fn(c, { matchCategories: true });
      if (Array.isArray(list)) list.forEach((n) => set.add(n));
    } catch {
      // skip
    }
  }
  return [...set].sort();
};

const characterNames = [
  ...new Set([
    ...collectNames(ELEMENT_CATEGORIES, GenshinDb.characters),
    ...EXTRA_CHARACTER_NAMES.filter((n) => {
      const c = GenshinDb.characters(n);
      return c && !Array.isArray(c);
    }),
  ]),
].sort();
const weaponNamesByType = {};
for (const type of WEAPON_TYPE_CATEGORIES) {
  weaponNamesByType[type] = collectNames([type], GenshinDb.weapons);
}
const allWeaponNames = [
  ...new Set(Object.values(weaponNamesByType).flat()),
].sort();

const characters = {};
const talents = {};
const constellations = {};

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

// Aether is the base traveler; needed to synthesize traveler form characters
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

const weapons = {};
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

const artifacts = {};
for (const name of ARTIFACT_NAMES) {
  const a = GenshinDb.artifacts(name);
  if (a && !Array.isArray(a)) {
    fillImageFromFilename(a, ART_MAP);
    artifacts[name] = a;
  }
}

const data = {
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

mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, JSON.stringify(data));

const sizeKb = Math.round(JSON.stringify(data).length / 1024);
console.log(
  `Wrote ${OUT_PATH}\n  ${characterNames.length} characters, ${allWeaponNames.length} weapons, ${ARTIFACT_NAMES.length} artifact sets\n  ${sizeKb} KB`,
);
