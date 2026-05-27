import { readFileSync } from "node:fs";
const data = JSON.parse(readFileSync("src/data/genshin-data.json", "utf8"));
const knownSets = new Set([
  "A Day Carved From Rising Winds","Adventurer","Archaic Petra","Aubade of Morningstar and Moon","Berserker","Blizzard Strayer","Bloodstained Chivalry","Brave Heart","Crimson Witch of Flames","Deepwood Memories","Defender's Will","Desert Pavilion Chronicle","Echoes of an Offering","Emblem of Severed Fate","Finale of the Deep Galleries","Flower of Paradise Lost","Fragment of Harmonic Whimsy","Gambler","Gilded Dreams","Gladiator's Finale","Golden Troupe","Heart of Depth","Husk of Opulent Dreams","Instructor","Lavawalker","Long Night's Oath","Lucky Dog","Maiden Beloved","Marechaussee Hunter","Martial Artist","Night of the Sky's Unveiling","Nighttime Whispers in the Echoing Woods","Noblesse Oblige","Nymph's Dream","Obsidian Codex","Ocean-Hued Clam","Pale Flame","Resolution of Sojourner","Retracing Bolide","Scholar","Scroll of the Hero of Cinder City","Shimenawa's Reminiscence","Silken Moon's Serenade","Song of Days Past","Tenacity of the Millelith","The Exile","Thundering Fury","Thundersoother","Tiny Miracle","Traveling Doctor","Unfinished Reverie","Vermillion Hereafter","Viridescent Venerer","Vourukasha's Glow","Wanderer's Troupe",
]);
const newSets = data.artifactNames.filter(n => !knownSets.has(n));
console.log("New artifact sets:", newSets.length ? newSets.join(", ") : "None");
const oldNames = new Set(["Aino","Albedo","Alhaitham","Aloy","Amber","Arataki Itto","Arlecchino","Aventurine","Baizhu","Barbara","Beidou","Bennett","Candace","Charlotte","Chasca","Chevreuse","Chiori","Chongyun","Citlali","Clorinde","Collei","Cyno","Dehya","Diluc","Diona","Dori","Emilie","Eula","Faruzan","Fischl","Freminet","Furina","Gaming","Ganyu","Gorou","Hu Tao","Iansan","Ifa","Jean","Kaedehara Kazuha","Kaeya","Kamisato Ayaka","Kamisato Ayato","Kaveh","Keqing","Kirara","Klee","Kujou Sara","Kuki Shinobu","Lan Yan","Layla","Lisa","Lynette","Lyney","Mavuika","Mika","Mona","Mualani","Nahida","Navia","Neuvillette","Nilou","Ningguang","Noelle","Ororon","Qiqi","Raiden Shogun","Razor","Rosaria","Sangonomiya Kokomi","Sayu","Sethos","Shenhe","Shikanoin Heizou","Sucrose","Tartaglia","Thoma","Tighnari","Varesa","Venti","Wanderer","Wriothesley","Xiangling","Xianyun","Xiao","Xilonen","Xingqiu","Xinyan","Yae Miko","Yanfei","Yaoyao","Yelan","Yoimiya","Yun Jin","Zhongli","Aether","Lumine","Skirk","Zibai","Columbina","Flins","Illuga","Ineffa","Jahoda","Lauma","Linnea","Nefer","Manekin","Manekina"]);
for (const f of data.travelerForms) oldNames.add(f);
const newChars = data.characterNames.filter(n => !oldNames.has(n));
console.log("New characters:", newChars.length ? newChars.join(", ") : "None");
console.log("Character count:", data.characterNames.length, "was 117");
const chars = Object.values(data.characters);
const nodkrai = [];
const assocTypes = new Set();
for (const c of chars) {
  if (c.associationType) assocTypes.add(c.associationType);
  if (c.association) assocTypes.add(c.association);
  const at = c.associationType || "";
  if (at.includes("NODKRAI") || at.includes("OMNI_SCOURGE")) nodkrai.push(c.name);
}
console.log("Nod-Krai chars in snapshot:", nodkrai.sort().join(", "));
