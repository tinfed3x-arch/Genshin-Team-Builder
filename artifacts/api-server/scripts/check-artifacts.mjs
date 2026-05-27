import { createRequire } from "module";
const req = createRequire(import.meta.url);
const GenshinDb = req("genshin-db");
const all = GenshinDb.artifacts("names", { matchCategories: true });
const known = new Set([
  "A Day Carved From Rising Winds", "Adventurer", "Archaic Petra",
  "Aubade of Morningstar and Moon", "Berserker", "Blizzard Strayer",
  "Bloodstained Chivalry", "Brave Heart", "Crimson Witch of Flames",
  "Deepwood Memories", "Defender's Will", "Desert Pavilion Chronicle",
  "Echoes of an Offering", "Emblem of Severed Fate", "Finale of the Deep Galleries",
  "Flower of Paradise Lost", "Fragment of Harmonic Whimsy", "Gambler",
  "Gilded Dreams", "Gladiator's Finale", "Golden Troupe", "Heart of Depth",
  "Husk of Opulent Dreams", "Instructor", "Lavawalker", "Long Night's Oath",
  "Lucky Dog", "Maiden Beloved", "Marechaussee Hunter", "Martial Artist",
  "Night of the Sky's Unveiling", "Nighttime Whispers in the Echoing Woods",
  "Noblesse Oblige", "Nymph's Dream", "Obsidian Codex", "Ocean-Hued Clam",
  "Pale Flame", "Resolution of Sojourner", "Retracing Bolide", "Scholar",
  "Scroll of the Hero of Cinder City", "Shimenawa's Reminiscence",
  "Silken Moon's Serenade", "Song of Days Past", "Tenacity of the Millelith",
  "The Exile", "Thundering Fury", "Thundersoother", "Tiny Miracle",
  "Traveling Doctor", "Unfinished Reverie", "Vermillion Hereafter",
  "Viridescent Venerer", "Vourukasha's Glow", "Wanderer's Troupe",
]);
const missing = all.filter(n => !known.has(n));
console.log("Missing artifact sets:", missing.length ? missing.join(", ") : "None");
