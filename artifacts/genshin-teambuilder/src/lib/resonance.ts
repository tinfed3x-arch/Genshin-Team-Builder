// Elemental Resonance logic based on Genshin Impact in-game rules.
// Descriptions sourced from the Genshin Impact Fandom wiki Team Bonus page
// (https://genshin-impact.fandom.com/wiki/Team_Bonus).

import { getEffectiveCharacterData } from "./genshin";
import type { TeamState } from "./teamState";

export type Resonance = {
  id: string;
  name: string;
  elements: string[]; // e.g. ["Pyro", "Pyro"]
  description: string;
  iconColor: string;
};

export const RESONANCES: Resonance[] = [
  {
    id: "pyro",
    name: "Fervent Flames",
    elements: ["Pyro", "Pyro"],
    description: "Affected by Cryo for 40% less time. Increases ATK by 25%.",
    iconColor: "#E8612B",
  },
  {
    id: "hydro",
    name: "Soothing Water",
    elements: ["Hydro", "Hydro"],
    description: "Affected by Pyro for 40% less time. Increases Max HP by 25%.",
    iconColor: "#1C72D1",
  },
  {
    id: "electro",
    name: "High Voltage",
    elements: ["Electro", "Electro"],
    description:
      "Affected by Hydro for 40% less time. Superconduct, Stellar-Conduct, Overloaded, Electro-Charged, Lunar-Charged, Quicken, Aggravate, or Hyperbloom have a 100% chance to generate an Electro Elemental Particle (CD: 5s).",
    iconColor: "#A855B5",
  },
  {
    id: "cryo",
    name: "Shattering Ice",
    elements: ["Cryo", "Cryo"],
    description:
      "Affected by Electro for 40% less time. Increases CRIT Rate against enemies that are Frozen or affected by Cryo by 15%.",
    iconColor: "#7EC8E3",
  },
  {
    id: "anemo",
    name: "Impetuous Winds",
    elements: ["Anemo", "Anemo"],
    description:
      "Decreases Stamina Consumption by 15%. Increases Movement SPD by 10%. Shortens Skill CD by 5%.",
    iconColor: "#35C5A0",
  },
  {
    id: "geo",
    name: "Enduring Rock",
    elements: ["Geo", "Geo"],
    description:
      "Increases shield strength by 15%. Additionally, when characters protected by a shield or when Moondrifts formed by Lunar-Crystallize reactions are nearby, the following special characteristics will take effect: DMG dealt increased by 15%, dealing DMG to enemies will decrease their Geo RES by 20% for 15s.",
    iconColor: "#FAB632",
  },
  {
    id: "dendro",
    name: "Sprawling Greenery",
    elements: ["Dendro", "Dendro"],
    description:
      "Elemental Mastery increased by 50. After triggering Burning, Quicken, Bloom, or Lunar-Bloom reactions, all nearby party members gain 30 Elemental Mastery for 6s. After triggering Aggravate, Spread, Hyperbloom, or Burgeon reactions, all nearby party members gain 20 Elemental Mastery for 6s. The durations of the aforementioned effects will be counted independently.",
    iconColor: "#A5C23B",
  },
  {
    id: "protective",
    name: "Protective Canopy",
    elements: ["Pyro", "Hydro", "Electro", "Cryo"],
    description: "All Elemental RES +15%, Physical RES +15%.",
    iconColor: "#888888",
  },
];

function getTeamElements(team: TeamState): string[] {
  const elements: string[] = [];
  for (const slot of team) {
    if (!slot.characterName) continue;
    const data = getEffectiveCharacterData(slot.characterName);
    const el = data?.elementText;
    if (el && el !== "None") elements.push(el);
  }
  return elements;
}

function countElements(elements: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const el of elements) {
    counts.set(el, (counts.get(el) ?? 0) + 1);
  }
  return counts;
}

export function getActiveResonances(team: TeamState): Resonance[] {
  const elements = getTeamElements(team);
  if (elements.length === 0) return [];

  const counts = countElements(elements);
  const active: Resonance[] = [];

  // Dual-element resonances
  for (const res of RESONANCES) {
    if (res.id === "protective") continue;
    const [el1, el2] = res.elements;
    if (el1 === el2) {
      // Need 2+ of same element
      if ((counts.get(el1) ?? 0) >= 2) active.push(res);
    }
  }

  // Protective Canopy: 4 unique elements (any 4 different)
  const unique = new Set(elements);
  if (unique.size >= 4) {
    active.push(RESONANCES.find((r) => r.id === "protective")!);
  }

  return active;
}
