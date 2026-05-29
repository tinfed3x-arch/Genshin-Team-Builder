// Witch's Eve Rite / Hexerei passive data for Hexerei characters.
// This is a new in-game feature not yet captured by genshin-db.

export const HEXEREI_CHARACTERS = new Set([
  "Albedo",
  "Durin",
  "Fischl",
  "Klee",
  "Mona",
  "Nicole",
  "Prune",
  "Razor",
  "Sucrose",
  "Varka",
  "Venti",
]);

export const isHexerei = (name: string | null): boolean =>
  name != null && HEXEREI_CHARACTERS.has(name);

export type HexereiData = {
  name: string;
  description: string;
};

export const HEXEREI_DATA: Record<string, HexereiData> = {
  Albedo: {
    name: "Witch's Eve Rite Passive",
    description:
      'After completing Witch\'s Homework: Of Wonderland Flowers, Albedo will become a Hexerei character. When the party includes at least 2 Hexerei characters, you will gain the Hexerei: Secret Rite effect, which enhances Hexerei characters.\n\nHexerei: Secret Rite\nAfter creating a Solar Isotoma, nearby party members\' Normal Attack, Charged Attack, Plunging Attack, Elemental Skill, and Elemental Burst DMG are increased by 5.71428% for 15s.\nAfter creating a Fatal Blossoms, nearby Hexerei party members\' Normal Attack, Charged Attack, Plunging Attack, Elemental Skill, and Elemental Burst DMG are increased by 7.14285% for 20s.',
  },
  Durin: {
    name: "Witch's Eve Rite Passive",
    description:
      'After completing Witch\'s Homework: Of Wonderland Flowers, Durin will become a Hexerei character. When the party includes at least 2 Hexerei characters, you will gain the Hexerei: Secret Rite effect, which enhances Hexerei characters.\n\nHexerei: Secret Rite\nAfter unleashing a Darkfire Surge, nearby party members\' Normal Attack, Charged Attack, Plunging Attack, Elemental Skill, and Elemental Burst DMG are increased by 5.71428% for 15s.\nAfter unleashing a Darkfire Tempest, nearby Hexerei party members\' Normal Attack, Charged Attack, Plunging Attack, Elemental Skill, and Elemental Burst DMG are increased by 7.14285% for 20s.',
  },
  Fischl: {
    name: "Witch's Eve Rite Passive",
    description:
      'After completing Witch\'s Homework: Of Wonderland Flowers, Fischl will become a Hexerei character. When the party includes at least 2 Hexerei characters, you will gain the Hexerei: Secret Rite effect, which enhances Hexerei characters.\n\nHexerei: Secret Rite\nAfter summoning Oz, nearby party members\' Normal Attack, Charged Attack, Plunging Attack, Elemental Skill, and Elemental Burst DMG are increased by 5.71428% for 15s.\nAfter summoning Oz\'s true form, nearby Hexerei party members\' Normal Attack, Charged Attack, Plunging Attack, Elemental Skill, and Elemental Burst DMG are increased by 7.14285% for 20s.',
  },
  Klee: {
    name: "Witch's Eve Rite Passive",
    description:
      'After completing Witch\'s Homework: Of Wonderland Flowers, Klee will become a Hexerei character. When the party includes at least 2 Hexerei characters, you will gain the Hexerei: Secret Rite effect, which enhances Hexerei characters.\n\nHexerei: Secret Rite\nAfter throwing a Jumpy Dumpty, nearby party members\' Normal Attack, Charged Attack, Plunging Attack, Elemental Skill, and Elemental Burst DMG are increased by 5.71428% for 15s.\nAfter detonating a Sparks \'n\' Splash, nearby Hexerei party members\' Normal Attack, Charged Attack, Plunging Attack, Elemental Skill, and Elemental Burst DMG are increased by 7.14285% for 20s.',
  },
  Mona: {
    name: "Witch's Eve Rite Passive",
    description:
      'After completing Witch\'s Homework: Of Wonderland Flowers, Mona will become a Hexerei character. When the party includes at least 2 Hexerei characters, you will gain the Hexerei: Secret Rite effect, which enhances Hexerei characters.\n\nHexerei: Secret Rite\nAfter creating a Reflection of Fate, nearby party members\' Normal Attack, Charged Attack, Plunging Attack, Elemental Skill, and Elemental Burst DMG are increased by 5.71428% for 15s.\nAfter casting a Stellaris Phantasm, nearby Hexerei party members\' Normal Attack, Charged Attack, Plunging Attack, Elemental Skill, and Elemental Burst DMG are increased by 7.14285% for 20s.',
  },
  Nicole: {
    name: "Witch's Eve Rite Passive",
    description:
      'After completing Witch\'s Homework: Of Wonderland Flowers, Nicole will become a Hexerei character. When the party includes at least 2 Hexerei characters, you will gain the Hexerei: Secret Rite effect, which enhances Hexerei characters.\n\nHexerei: Secret Rite\nAfter unleashing a Hexerei technique, nearby party members\' Normal Attack, Charged Attack, Plunging Attack, Elemental Skill, and Elemental Burst DMG are increased by 5.71428% for 15s.\nAfter unleashing a stronger Hexerei technique, nearby Hexerei party members\' Normal Attack, Charged Attack, Plunging Attack, Elemental Skill, and Elemental Burst DMG are increased by 7.14285% for 20s.',
  },
  Prune: {
    name: "Witch's Eve Rite Passive",
    description:
      'After completing Witch\'s Homework: Of Wonderland Flowers, Prune will become a Hexerei character. When the party includes at least 2 Hexerei characters, you will gain the Hexerei: Secret Rite effect, which enhances Hexerei characters.\n\nHexerei: Secret Rite\nAfter unleashing a Hexerei technique, nearby party members\' Normal Attack, Charged Attack, Plunging Attack, Elemental Skill, and Elemental Burst DMG are increased by 5.71428% for 15s.\nAfter unleashing a stronger Hexerei technique, nearby Hexerei party members\' Normal Attack, Charged Attack, Plunging Attack, Elemental Skill, and Elemental Burst DMG are increased by 7.14285% for 20s.',
  },
  Razor: {
    name: "Witch's Eve Rite Passive",
    description:
      'After completing Witch\'s Homework: Of Wonderland Flowers, Razor will become a Hexerei character. When the party includes at least 2 Hexerei characters, you will gain the Hexerei: Secret Rite effect, which enhances Hexerei characters.\n\nHexerei: Secret Rite\nAfter summoning a Lightning Claw, nearby party members\' Normal Attack, Charged Attack, Plunging Attack, Elemental Skill, and Elemental Burst DMG are increased by 5.71428% for 15s.\nAfter summoning a Lightning Fang, nearby Hexerei party members\' Normal Attack, Charged Attack, Plunging Attack, Elemental Skill, and Elemental Burst DMG are increased by 7.14285% for 20s.',
  },
  Sucrose: {
    name: "Witch's Eve Rite Passive",
    description:
      'After completing Witch\'s Homework: Of Wonderland Flowers, Sucrose will become a Hexerei character. When the party includes at least 2 Hexerei characters, you will gain the Hexerei: Secret Rite effect, which enhances Hexerei characters.\n\nHexerei: Secret Rite\nAfter creating a Small Wind Spirit, nearby party members\' Normal Attack, Charged Attack, Plunging Attack, Elemental Skill, and Elemental Burst DMG are increased by 5.71428% for 15s.\nAfter creating a Large Wind Spirit, nearby Hexerei party members\' Normal Attack, Charged Attack, Plunging Attack, Elemental Skill, and Elemental Burst DMG are increased by 7.14285% for 20s.',
  },
  Varka: {
    name: "Witch's Eve Rite Passive",
    description:
      'After completing Witch\'s Homework: Of Wonderland Flowers, Varka will become a Hexerei character. When the party includes at least 2 Hexerei characters, you will gain the Hexerei: Secret Rite effect, which enhances Hexerei characters.\n\nHexerei: Secret Rite\nAfter unleashing a Hexerei technique, nearby party members\' Normal Attack, Charged Attack, Plunging Attack, Elemental Skill, and Elemental Burst DMG are increased by 5.71428% for 15s.\nAfter unleashing a stronger Hexerei technique, nearby Hexerei party members\' Normal Attack, Charged Attack, Plunging Attack, Elemental Skill, and Elemental Burst DMG are increased by 7.14285% for 20s.',
  },
  Venti: {
    name: "Witch's Eve Rite Passive",
    description:
      'After completing Witch\'s Homework: Of Wonderland Flowers, Venti will become a Hexerei character. When the party includes at least 2 Hexerei characters, you will gain the Hexerei: Secret Rite effect, which enhances Hexerei characters.\n\nHexerei: Secret Rite\nAfter unleashing a Hexerei technique, nearby party members\' Normal Attack, Charged Attack, Plunging Attack, Elemental Skill, and Elemental Burst DMG are increased by 5.71428% for 15s.\nAfter unleashing a stronger Hexerei technique, nearby Hexerei party members\' Normal Attack, Charged Attack, Plunging Attack, Elemental Skill, and Elemental Burst DMG are increased by 7.14285% for 20s.',
  },
};

export const getHexereiData = (name: string | null): HexereiData | null => {
  if (!name) return null;
  return HEXEREI_DATA[name] ?? null;
};
