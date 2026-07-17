// Elemental Resonance logic based on Genshin Impact in-game rules.
// Computes active resonances from a team's 4 characters.

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
    description:
      "ATK increased by 25%. Affected by Cryo for 40% less time.",
    iconColor: "#E8612B",
  },
  {
    id: "hydro",
    name: "Soothing Water",
    elements: ["Hydro", "Hydro"],
    description:
      "Incoming healing increased by 30%. Affected by Pyro for 40% less time.",
    iconColor: "#1C72D1",
  },
  {
    id: "anemo",
    name: "Impetuous Winds",
    elements: ["Anemo", "Anemo"],
    description:
      "Stamina Consumption decreased by 15%. Movement SPD increased by 10%. Skill CD decreased by 5%.",
    iconColor: "#35C5A0",
  },
  {
    id: "electro",
    name: "High Voltage",
    elements: ["Electro", "Electro"],
    description:
      "Affected by Hydro for 40% less time. Superconduct, Overloaded, and Electro-Charged have a 100% chance to generate an Electro Elemental Particle (CD: 5s).",
    iconColor: "#A855B5",
  },
  {
    id: "cryo",
    name: "Shattering Ice",
    elements: ["Cryo", "Cryo"],
    description:
      "Affected by Electro for 40% less time. CRIT Rate against enemies affected by Cryo increased by 15%.",
    iconColor: "#7EC8E3",
  },
  {
    id: "geo",
    name: "Enduring Rock",
    elements: ["Geo", "Geo"],
    description:
      "Shield strength increased by 15%. Characters protected by a shield have DMG dealt increased by 15%.",
    iconColor: "#FAB632",
  },
  {
    id: "dendro",
    name: "Sprawling Greenery",
    elements: ["Dendro", "Dendro"],
    description:
      "Elemental Mastery increased by 50. After triggering Burning, Quicken, Aggravate, or Spread, all nearby party members gain 30 Elemental Mastery for 6s.",
    iconColor: "#A5C23B",
  },
  {
    id: "protective",
    name: "Protective Canopy",
    elements: ["Pyro", "Hydro", "Electro", "Cryo"],
    description:
      "All Elemental RES increased by 15%. Physical RES increased by 15%.",
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
