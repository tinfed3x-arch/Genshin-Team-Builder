// Manual data overlay for Version 7.0 content (released 2026-08-12) that the
// genshin-db package does not yet include: Odette, Alyosha, and Whitelake
// Frostfeather. Sourced from the Genshin Impact Wiki (fandom) on 2026-08-12.
//
// Entries mirror the genshin-db format used in genshin-data.json. Each entry
// is only added when the loaded data snapshot does NOT already contain it, so
// once genshin-db ships official data this overlay silently steps aside and
// can then be deleted.
import type { GenshinData } from "../lib/genshin";

const ODETTE_CHARACTER = {
  id: 10000150,
  name: "Odette",
  title: "Swirling Snow",
  description:
    "A famed Snezhnayan ballerina of the Korolevskiy Troupe who blossoms against the frozen landscape with a beauty as sharp as frost.",
  weaponType: "WEAPON_SWORD_ONE_HAND",
  weaponText: "Sword",
  bodyType: "BODY_LADY",
  gender: "Female",
  qualityType: "QUALITY_ORANGE",
  rarity: 5,
  birthdaymmdd: "2/20",
  birthday: "February 20",
  elementType: "ELEMENT_CRYO",
  elementText: "Cryo",
  affiliation: "Korolevskiy Troupe",
  associationType: "ASSOC_SNEZHNAYA",
  region: "Snezhnaya",
  substatType: "FIGHT_PROP_CRITICAL_HURT",
  substatText: "CRIT DMG",
  constellation: "Cygnus Olor",
  images: {
    filename_icon: "UI_AvatarIcon_Odette",
    mihoyo_icon:
      "https://static.wikia.nocookie.net/gensin-impact/images/8/87/Odette_Icon.png/revision/latest?cb=20260812035719",
  },
  url: { fandom: "https://genshin-impact.fandom.com/wiki/Odette" },
  version: "7.0",
};

const ODETTE_TALENTS = {
  id: 10150,
  name: "Odette",
  combat1: {
    name: "Snow Swan Variation",
    description:
      "Normal Attack\nUnleashes a sword attack of up to 5 consecutive strikes.\n\nCharged Attack\nConsumes a certain amount of Stamina to unleash a dazzling slash on opponents in front of her.\n\nPlunging Attack\nAttacks opponents in her path while plunging from mid-air, then deals AoE DMG upon landing.",
  },
  combat2: {
    name: "Adagio: Phantom Night Dancers",
    description:
      "With slow, graceful dance steps, Odette deals AoE Cryo DMG to the opponent, and also summons her Solo Dance Double to the field.\nIf a Dance Double summoned by Odette is already on the field, this will re-summon the Dance Double and reset its duration.\n\nSolo Dance Double\nAlternates between the Plume and Wing dance moves, periodically attacking nearby opponents and dealing to them AoE Cryo DMG.\nAdditionally, for 6s after unleashing the Elemental Skill, it becomes the special Elemental Skill Adagio: Coda at Dawn's Tolling instead, where a dance duet deals AoE Cryo DMG to nearby opponents over time. When the duet ends, she deals another instance of AoE Cryo DMG that is considered Stellar-Conduct or Stellar Swirl DMG.",
  },
  combat3: {
    name: "Presto: Bluebird Finale",
    description:
      "With quick, lively dance steps, Odette deals multiple instances of AoE Cryo DMG, and summons her Solo Dance Double. She also gains Snow Swan's Dream, which increases the Stellar Glimmer reaction DMG Odette deals.\nAdditionally, for 6s after unleashing the Elemental Burst, Odette's Elemental Skill will be replaced with the special Elemental Skill Adagio: Coda at Dawn's Tolling.\n\nIf there is a Solo Dance Double summoned by Odette on the field, it will be summoned to her side with its duration refreshed.",
  },
  passive1: {
    name: "Spring Rite of the Chosen One",
    description:
      "When Odette summons her Solo Dance Double, she also obtains 4 stacks of Marvelous Splendor.",
  },
  passive2: {
    name: "Pathetique of Pateticheskaya",
    description:
      "For every 100 ATK Odette has over 1,000, her Stellar Glimmer DMG is additionally increased by 1.5% of the original DMG. She can deal up to 30% more additional DMG in this way.",
  },
  passive3: {
    name: "Stellar Jubilee: Dance of Aurore",
    description:
      "Odette will enter the Radiance: Stellar-Conduct state when she is inside a Polestar Field, or the Radiance: Stellar Swirl state for 8s after a nearby party member triggers a Stellar Swirl reaction.\nWhen a party member triggers a Superconduct or Cryo Swirl reaction, it becomes a Stellar-Conduct or Stellar Swirl reaction instead, and the Base DMG of said reaction is also increased by 0.7% for every 100 points of Odette's ATK. A maximum increase of 14% can be obtained in this way.",
  },
  version: "7.0",
};

const ODETTE_CONSTELLATIONS = {
  id: 10150,
  name: "Odette",
  c1: {
    name: '"On This Danceless Morn, She Gazes at Her Reflection"',
    description:
      "After unleashing the special Elemental Skill Adagio: Coda at Dawn's Tolling, at the dance duet's end Odette will deal an additional instance of Cryo AoE DMG to nearby opponents that is considered Stellar-Conduct reaction DMG at 300% of Odette's ATK, or Stellar Swirl reaction DMG at 450% of her ATK while in the Radiance: Stellar Swirl state.\nAdditionally, when the Solo Dance Double is summoned, Odette also gains 2 extra stacks of Marvelous Splendor. When Odette is off-field, the rate at which Marvelous Splendor is removed is sped up to 2 stacks per second.",
  },
  c2: {
    name: '"I Must See the Snow Swan\'s Unseen Dream for Myself, She Thought"',
    description:
      "Every stack of Marvelous Splendor active also increases the character's ATK by 7%.\nAdditionally, if Odette is in the Radiance: Stellar Glimmer state when there is a Solo Dance Double on the field, opponents near the Dance Double will also have their corresponding Elemental RES lowered by 20% (Stellar-Conduct: Cryo and Electro; Stellar Swirl: Cryo and Anemo).",
  },
  c3: {
    name: "\"I'll Chase the Shouting Wind Along, Climbing Alone As I Go\"",
    description:
      "Increases the Level of Adagio: Phantom Night Dancers by 3.\nMaximum upgrade level is 15.",
  },
  c4: {
    name: '"Up, Up the Long, Delirious, Burning Blue"',
    description:
      "When Odette obtains Snow Swan's Dream, Stellar Glimmer reaction DMG dealt by other nearby party members is increased by 50% of Snow Swan Dream's effects.\nAdditionally, when a party member deals Stellar Glimmer reaction DMG to an opponent, Odette will join in with a coordinated attack, dealing an instance of AoE Cryo DMG once every 3.5s (Stellar-Conduct reaction DMG at 66% of her ATK, or Stellar Swirl reaction DMG at 99%).",
  },
  c5: {
    name: '"Oh! I Have Slipped the Surly Bonds of Earth"',
    description:
      "Increases the Level of Presto: Bluebird Finale by 3.\nMaximum upgrade level is 15.",
  },
  c6: {
    name: '"Put Out My Hand, and Touched the Face of the Divine"',
    description:
      "When all nearby party members have been granted Marvelous Splendor by Odette, her own Marvelous Splendor stacks will no longer decrease.\nAdditionally, characters affected by Marvelous Splendor have their Stellar Glimmer reaction DMG dealt to opponents elevated by 25%, and Stellar Glimmer reaction DMG dealt by Odette is elevated by an additional 20%.",
  },
  version: "7.0",
};

const ALYOSHA_CHARACTER = {
  id: 10000148,
  name: "Alyosha",
  title: "Swift-Striding Hound",
  description:
    "An exceptional Snezhnayan hunter of Rokot who takes on odd jobs to help those who are struggling, accompanied by his hound Tugarin.",
  weaponType: "WEAPON_POLE",
  weaponText: "Polearm",
  bodyType: "BODY_BOY",
  gender: "Male",
  qualityType: "QUALITY_PURPLE",
  rarity: 4,
  birthdaymmdd: "2/9",
  birthday: "February 9",
  elementType: "ELEMENT_ELECTRO",
  elementText: "Electro",
  affiliation: "Rokot",
  associationType: "ASSOC_SNEZHNAYA",
  region: "Snezhnaya",
  substatType: "FIGHT_PROP_CHARGE_EFFICIENCY",
  substatText: "Energy Recharge",
  constellation: "Canis Borzoides",
  images: {
    filename_icon: "UI_AvatarIcon_Alyosha",
    mihoyo_icon:
      "https://static.wikia.nocookie.net/gensin-impact/images/1/1d/Alyosha_Icon.png/revision/latest?cb=20260812035756",
  },
  url: { fandom: "https://genshin-impact.fandom.com/wiki/Alyosha" },
  version: "7.0",
};

const ALYOSHA_TALENTS = {
  id: 10148,
  name: "Alyosha",
  combat1: {
    name: "Skirmishing Spear",
    description:
      "Normal Attack\nPerforms up to 4 consecutive spear strikes and applies the Hunter's Mark to the opponent hit by the final strike.\n\nCharged Attack\nConsumes a certain amount of Stamina to lunge forward, dealing damage to opponents in his path.\n\nPlunging Attack\nPlunges from mid-air to strike the ground below, damaging opponents along the path and dealing AoE DMG upon impact.",
  },
  combat2: {
    name: "Thunderbolt Strike",
    description:
      "Alyosha's Elemental Skill. Deals Electro DMG and works together with his hound Tugarin and the Hunter's Mark mechanic. (Full official description not yet published on the Genshin Wiki.)",
  },
  combat3: {
    name: "Hunter's Advance",
    description:
      "Alyosha's Elemental Burst. Summons his hound Tugarin to fight alongside the party, dealing Electro DMG; Tugarin's attacks also heal nearby active characters via Alyosha's Ascension Passive. (Full official description not yet published on the Genshin Wiki.)",
  },
  passive1: {
    name: "Awakened By the Baying Hounds",
    description:
      "When Tugarin attacks, it will also restore HP to nearby active characters at 120% of Alyosha's ATK.",
  },
  passive2: {
    name: "Suffer the Winter Wheat Will",
    description:
      "Increases the DMG Alyosha deals with his Elemental Skill and Elemental Burst by 0.35% for every 1% of his Energy Recharge. Up to a 70% increase can be obtained in this way.",
  },
  passive3: {
    name: "Into the Fray",
    description:
      "Alyosha will enter the Radiance: Stellar-Conduct state when inside a Polestar Field.\nRadiance: Stellar-Conduct: The Hunter's Precision effect obtained when the Hunter's Mark is activated will also increase Stellar-Conduct DMG dealt by all currently active party members by 20%.",
  },
  version: "7.0",
};

const ALYOSHA_CONSTELLATIONS = {
  id: 10148,
  name: "Alyosha",
  c1: {
    name: "Frostvale Thunderclap",
    description:
      "Alyosha regenerates 15 Elemental Energy when nearby party members trigger an Electro-related reaction on an opponent. This effect can trigger once every 18s.",
  },
  c2: {
    name: "Howl From Afar",
    description:
      "The duration of the Elemental Burst Hunter's Advance is extended by 6s.\nAdditionally, each time Tugarin attacks the opponent, he will also apply the Hunter's Mark to a target. This effect does not activate existing Hunter's Marks.",
  },
  c3: {
    name: "Friendly Call",
    description:
      "Increases the Level of the Elemental Skill Thunderbolt Strike by 3.\nMaximum upgrade level is 15.",
  },
  c4: {
    name: "Harvest the Spoils",
    description:
      "When Tugarin attacks, he will also restore 60% of Alyosha's ATK as HP to the nearby party member with the lowest HP by percentage.",
  },
  c5: {
    name: "When the Nightbird Falls Silent",
    description:
      "Increases the Level of the Elemental Burst Hunter's Advance by 3.\nMaximum upgrade level is 15.",
  },
  c6: {
    name: "Standard Reclaimed",
    description:
      "The Hunter's Precision effect obtained from activating a Hunter's Mark can now stack, max 2 stacks. When the stack count reaches 2, currently active party members will also have their Elemental Mastery increased by 100.",
  },
  version: "7.0",
};

const WHITELAKE_FROSTFEATHER_EFFECT = (
  atk: string,
  critDmg: string,
  energy: string,
) =>
  `When the equipping character hits an opponent with their Elemental Skill, they gain "Lake-Hued Lament": ATK increases by ${atk} for 8s. This effect can trigger once every 0.1s. Max 3 stacks, and each stack's duration is independent.\nAt 3 stacks, the CRIT DMG of any Stellar Glimmer reaction DMG caused by the equipping character is increased by ${critDmg}, and triggering Stellar Glimmer reactions or Stellar Glimmer reaction DMG will also restore ${energy} Elemental Energy to the character. This Energy recovery effect can trigger once every 3.5s.\nThis effect can be triggered even when the equipping character is off-field.`;

const WHITELAKE_FROSTFEATHER = {
  id: 11517,
  name: "Whitelake Frostfeather",
  description:
    "A slim sword said to evoke the image of a swan's feather drifting over a frozen lake. Odette's signature weapon.",
  weaponType: "WEAPON_SWORD_ONE_HAND",
  weaponText: "Sword",
  rarity: 5,
  baseAtkValue: 48,
  mainStatType: "FIGHT_PROP_CRITICAL",
  mainStatText: "CRIT Rate",
  baseStatText: "4.8%",
  effectName: "Snow Swan's Finale",
  r1: { description: WHITELAKE_FROSTFEATHER_EFFECT("8%", "50%", "4") },
  r2: { description: WHITELAKE_FROSTFEATHER_EFFECT("10%", "65%", "4.5") },
  r3: { description: WHITELAKE_FROSTFEATHER_EFFECT("12%", "80%", "5") },
  r4: { description: WHITELAKE_FROSTFEATHER_EFFECT("14%", "95%", "5.5") },
  r5: { description: WHITELAKE_FROSTFEATHER_EFFECT("16%", "110%", "6") },
  images: {
    icon: "https://static.wikia.nocookie.net/gensin-impact/images/e/ec/Weapon_Whitelake_Frostfeather.png/revision/latest?cb=20260812163243",
    mihoyo_icon:
      "https://static.wikia.nocookie.net/gensin-impact/images/e/ec/Weapon_Whitelake_Frostfeather.png/revision/latest?cb=20260812163243",
  },
  version: "7.0",
  maxAtk: 674,
  // genshin-db stores percent substats as decimal fractions (22.1% -> 0.221)
  maxSubstatValue: 0.221,
};

const MANUAL_CHARACTERS = [
  {
    character: ODETTE_CHARACTER,
    talents: ODETTE_TALENTS,
    constellations: ODETTE_CONSTELLATIONS,
  },
  {
    character: ALYOSHA_CHARACTER,
    talents: ALYOSHA_TALENTS,
    constellations: ALYOSHA_CONSTELLATIONS,
  },
];

const MANUAL_WEAPONS = [WHITELAKE_FROSTFEATHER];

// Returns a shallow-cloned snapshot with any manual entries the input does
// not already contain. The input object (bundled JSON module or a cached
// snapshot from localStorage / the api-server) is never mutated. Each
// collection is repaired independently so partially populated snapshots
// still end up consistent.
export function applyManualAdditions(input: GenshinData): GenshinData {
  const data: GenshinData = {
    ...input,
    characterNames: [...input.characterNames],
    characters: { ...input.characters },
    talents: { ...input.talents },
    constellations: { ...input.constellations },
    weaponNamesByType: Object.fromEntries(
      Object.entries(input.weaponNamesByType).map(([k, v]) => [k, [...v]]),
    ),
    allWeaponNames: [...input.allWeaponNames],
    weapons: { ...input.weapons },
  };
  for (const { character, talents, constellations } of MANUAL_CHARACTERS) {
    const name = character.name;
    if (!data.characters[name]) data.characters[name] = character;
    if (!data.talents[name]) data.talents[name] = talents;
    if (!data.constellations[name]) data.constellations[name] = constellations;
    if (!data.characterNames.includes(name)) data.characterNames.push(name);
  }
  for (const weapon of MANUAL_WEAPONS) {
    if (!data.weapons[weapon.name]) data.weapons[weapon.name] = weapon;
    const byType = (data.weaponNamesByType[weapon.weaponType] ??= []);
    if (!byType.includes(weapon.name)) byType.push(weapon.name);
    if (!data.allWeaponNames.includes(weapon.name)) {
      data.allWeaponNames.push(weapon.name);
    }
  }
  return data;
}
