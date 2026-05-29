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
    name: "Witch's Eve Rite: Book of Blinding Light",
    description:
      "When Abiogenesis: Solar Isotoma hits an enemy within 20s of skill use, Albedo spawns up to two nearby Silver Isotomas that last 10s.\nIf no Solar Isotoma exists and Albedo is not downed, one Silver Isotoma will functionally replace it by generating Transient Blossoms.\nAfter creating a Solar Isotoma, nearby party members gain 4% damage to Normal, Charged, Plunging, Skill, and Burst attacks for 15s.\nAfter creating a Silver Isotoma, nearby Hexerei party members gain 7.14% damage to the same actions for 20s.",
  },
  Durin: {
    name: "Witch's Eve Rite: Ode to Ascension",
    description:
      "Increases all effects of the ascension talent Light Manifest of the Divine Calculus by 75%, except its duration.\nLight Manifest already boosts his Vaporize and Melt output and lowers enemy elemental resistance depending on Durin's form.",
  },
  Fischl: {
    name: "Witch's Eve Rite: Phantasmal Nocturne",
    description:
      "While Oz is on the field:\nWhen a nearby party member triggers Overloaded, Fischl and the current active character gain 22.5% ATK for 10s.\nWhen a nearby party member triggers Electro-Charged or Lunar-Charged, Fischl and the active character gain 90 Elemental Mastery for 10s.",
  },
  Klee: {
    name: "Witch's Eve Rite: Sparkborne Magic",
    description:
      "Whenever Klee deals damage with a Normal Attack, Elemental Skill, or Burst, she gains one Boom Badge for 20s from that attack type (each type can grant one badge).\nHaving 1 / 2 / 3 badges increases Boom-Boom Strike Charged Attack damage to 115% / 130% / 150% of its original value.",
  },
  Mona: {
    name: "Witch's Eve Rite: Genesis of Starsigns",
    description:
      "Each time Mona's Normal or Charged Attacks hit, she gains one stack of Astral Glow of Mercury for 8s (up to 3 stacks).\nWhen another party member triggers a Vaporize on an enemy, all stacks are consumed; each stack adds 5% damage to that Vaporize instance, up to 15%.\nEach Normal or Charged hit also extends Omen on that enemy by 2s, up to a total of 8 extra seconds.",
  },
  Nicole: {
    name: "Witch's Eve Rite Passive",
    description:
      "After completing Witch's Homework: Of Wonderland Flowers, Nicole will become a Hexerei character. When the party includes at least 2 Hexerei characters, you will gain the Hexerei: Secret Rite effect, which enhances Hexerei characters.\n\nHexerei: Secret Rite\nAfter unleashing a Hexerei technique, nearby party members' Normal Attack, Charged Attack, Plunging Attack, Elemental Skill, and Elemental Burst DMG are increased by 5.71428% for 15s.\nAfter unleashing a stronger Hexerei technique, nearby Hexerei party members' Normal Attack, Charged Attack, Plunging Attack, Elemental Skill, and Elemental Burst DMG are increased by 7.14285% for 20s.",
  },
  Prune: {
    name: "Witch's Eve Rite Passive",
    description:
      "After completing Witch's Homework: Of Wonderland Flowers, Prune will become a Hexerei character. When the party includes at least 2 Hexerei characters, you will gain the Hexerei: Secret Rite effect, which enhances Hexerei characters.\n\nHexerei: Secret Rite\nAfter unleashing a Hexerei technique, nearby party members' Normal Attack, Charged Attack, Plunging Attack, Elemental Skill, and Elemental Burst DMG are increased by 5.71428% for 15s.\nAfter unleashing a stronger Hexerei technique, nearby Hexerei party members' Normal Attack, Charged Attack, Plunging Attack, Elemental Skill, and Elemental Burst DMG are increased by 7.14285% for 20s.",
  },
  Razor: {
    name: "Witch's Eve Rite: Surge of Lightning",
    description:
      "Lightning Fang's wolf spirit gains bonus damage equal to 70% of Razor's ATK, permanently once the passive is unlocked.\nWhile Lightning Fang is active, if Electro Sigils from Claw and Thunder overflow, the wolf calls down a lightning strike that deals AoE Electro equal to 150% of Razor's ATK and restores 7 Energy. This can occur once per second.",
  },
  Sucrose: {
    name: "Witch's Eve Rite: Sevenfold Transmutation",
    description:
      "After creating a Small Wind Spirit with her Skill, nearby party members gain roughly 5.71% damage to Normal, Charged, Plunging, Skill, and Burst attacks for 15s.\nAfter creating a Large Wind Spirit with her Burst, nearby Hexerei party members gain about 7.14% damage to the same actions for 20s.",
  },
  Varka: {
    name: "Witch's Eve Rite Passive",
    description:
      "After completing Witch's Homework: Of Wonderland Flowers, Varka will become a Hexerei character. When the party includes at least 2 Hexerei characters, you will gain the Hexerei: Secret Rite effect, which enhances Hexerei characters.\n\nHexerei: Secret Rite\nAfter unleashing a Hexerei technique, nearby party members' Normal Attack, Charged Attack, Plunging Attack, Elemental Skill, and Elemental Burst DMG are increased by 5.71428% for 15s.\nAfter unleashing a stronger Hexerei technique, nearby Hexerei party members' Normal Attack, Charged Attack, Plunging Attack, Elemental Skill, and Elemental Burst DMG are increased by 7.14285% for 20s.",
  },
  Venti: {
    name: "Witch's Eve Rite: Temporal Wind's Eulogy",
    description:
      "While Wind's Grand Ode's Stormeye is active, any nearby active character that triggers Swirl gains a 50% damage increase for 4s, and the Stormeye itself deals 135% of its original damage.\nDuring Stormeye, his Normal Attacks convert into piercing Anemo projectiles (Windsunder Arrows). Each hit extends Stormeye's duration by 1s and lengthens its cooldown by 0.5s, up to twice per Burst.",
  },
};

export const getHexereiData = (name: string | null): HexereiData | null => {
  if (!name) return null;
  return HEXEREI_DATA[name] ?? null;
};
