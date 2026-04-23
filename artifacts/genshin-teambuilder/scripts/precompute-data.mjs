// Pre-extracts only the genshin-db data the frontend needs into a single
// small JSON file. This avoids bundling the 166MB genshin-db package into
// the Vite production build (which OOMs).
import GenshinDb from "genshin-db";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, "..", "src", "data", "genshin-data.json");

const ELEMENT_CATEGORIES = [
  "ELEMENT_PYRO",
  "ELEMENT_HYDRO",
  "ELEMENT_ANEMO",
  "ELEMENT_ELECTRO",
  "ELEMENT_CRYO",
  "ELEMENT_GEO",
  "ELEMENT_DENDRO",
];

// Special-event / elementless playable units (Manekin, Manekina, etc.) live
// under QUALITY_ORANGE_SP and have elementType=ELEMENT_NONE, so the element
// queries above miss them. Including this category catches them while still
// deduping via Set — Aloy is also ORANGE_SP but already covered by ELEMENT_CRYO.
const EXTRA_CHARACTER_CATEGORIES = ["QUALITY_ORANGE_SP"];

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

const characterNames = collectNames(
  [...ELEMENT_CATEGORIES, ...EXTRA_CHARACTER_CATEGORIES],
  GenshinDb.characters,
);
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

const weapons = {};
for (const name of allWeaponNames) {
  const w = GenshinDb.weapons(name);
  if (w && !Array.isArray(w)) {
    fillImageFromFilename(w, WEAPON_MAP);
    weapons[name] = w;
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
