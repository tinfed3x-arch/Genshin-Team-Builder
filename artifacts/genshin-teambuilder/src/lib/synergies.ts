import type { TeamState } from "./teamState";
import { getEffectiveCharacterData } from "./genshin";

// Color tokens reused for badges in the synergy panel. Mirrors ELEMENT_COLORS
// from genshin.ts but is repeated here so this module has zero UI imports.
const ELEMENT_COLORS: Record<string, string> = {
  Pyro: "#E8612B",
  Hydro: "#1C72D1",
  Anemo: "#35C5A0",
  Electro: "#A855B5",
  Cryo: "#7EC8E3",
  Geo: "#F0A02E",
  Dendro: "#7CBF3F",
};

const ELEMENTS_ORDERED = [
  "Pyro",
  "Hydro",
  "Anemo",
  "Electro",
  "Cryo",
  "Geo",
  "Dendro",
] as const;

export type SynergyKind = "elemental" | "named";

export type SynergyMatch = {
  contributingCharacters: string[];
};

export type SynergyRule = {
  id: string;
  name: string;
  kind: SynergyKind;
  // Element badges shown next to the synergy name. Empty for named synergies
  // that aren't tied to a single element (e.g. Protective Canopy lists all
  // elements present, Moonsign uses none).
  elements: string[];
  description: string;
  // Returns null when the rule isn't triggered by the current team. When
  // triggered, returns the slotted character names that contribute.
  match: (team: TeamState) => SynergyMatch | null;
};

// --- Element extraction ---------------------------------------------------
//
// We resolve each non-empty slot to its element via getEffectiveCharacterData
// (which already handles Traveler forms by overriding the element). Slots
// with elementText "None" (Manekin/Manekina) are *excluded* from elemental
// resonance counts but can still participate in named synergies.

type SlottedCharacter = {
  name: string;
  element: string | null; // null when elementless or unknown
};

const slottedCharacters = (team: TeamState): SlottedCharacter[] => {
  const out: SlottedCharacter[] = [];
  for (const slot of team) {
    if (!slot.characterName) continue;
    const data = getEffectiveCharacterData(slot.characterName);
    if (!data) {
      out.push({ name: slot.characterName, element: null });
      continue;
    }
    const el = typeof data.elementText === "string" ? data.elementText : null;
    out.push({
      name: slot.characterName,
      element: el && el !== "None" ? el : null,
    });
  }
  return out;
};

// --- Elemental resonance rules -------------------------------------------
//
// Each two-of-the-same-element resonance and the four-distinct-element
// Protective Canopy. Effect text matches the in-game description as closely
// as possible without quoting verbatim; if HoYoverse rebalances a number,
// these strings are the only thing to update.

type ResonanceSpec = {
  id: string;
  element: (typeof ELEMENTS_ORDERED)[number];
  name: string;
  description: string;
};

const RESONANCES: ResonanceSpec[] = [
  {
    id: "res-pyro",
    element: "Pyro",
    name: "Fervent Flames",
    description:
      "Affected by Cryo for 40% less time. Increases ATK by 25%.",
  },
  {
    id: "res-hydro",
    element: "Hydro",
    name: "Soothing Water",
    description:
      "Affected by Pyro for 40% less time. Increases incoming Healing Bonus by 30% and Max HP by 25%.",
  },
  {
    id: "res-anemo",
    element: "Anemo",
    name: "Impetuous Winds",
    description:
      "Decreases Stamina Consumption by 15%. Increases Movement SPD by 10% and reduces Skill CD by 5%.",
  },
  {
    id: "res-electro",
    element: "Electro",
    name: "High Voltage",
    description:
      "Affected by Hydro for 40% less time. Superconduct, Overloaded, Electro-Charged, Hyperbloom, Aggravate and Quicken generate an Electro Particle (CD: 5s).",
  },
  {
    id: "res-cryo",
    element: "Cryo",
    name: "Shattering Ice",
    description:
      "Affected by Electro for 40% less time. Increases CRIT Rate against enemies that are Frozen or affected by Cryo by 15%.",
  },
  {
    id: "res-geo",
    element: "Geo",
    name: "Enduring Rock",
    description:
      "Increases shield strength by 15%. Characters protected by a shield deal 15% increased DMG and decrease enemy Geo RES by 20% for 15s when hitting an enemy.",
  },
  {
    id: "res-dendro",
    element: "Dendro",
    name: "Sprawling Greenery",
    description:
      "Increases Elemental Mastery by 50. Triggering Burning, Quicken or Bloom further grants party members additional EM for 6s (stacks per reaction).",
  },
];

const buildElementalRule = (spec: ResonanceSpec): SynergyRule => ({
  id: spec.id,
  name: spec.name,
  kind: "elemental",
  elements: [spec.element],
  description: spec.description,
  match: (team) => {
    const matchers = slottedCharacters(team).filter(
      (s) => s.element === spec.element,
    );
    if (matchers.length < 2) return null;
    return { contributingCharacters: matchers.map((m) => m.name) };
  },
});

const PROTECTIVE_CANOPY: SynergyRule = {
  id: "res-canopy",
  name: "Protective Canopy",
  kind: "elemental",
  elements: [...ELEMENTS_ORDERED],
  description:
    "All Elemental and Physical RES increased by 15%.",
  match: (team) => {
    const slotted = slottedCharacters(team).filter((s) => s.element);
    const distinctElements = new Set(slotted.map((s) => s.element as string));
    // Triggers only when all four elemented slots are different elements.
    if (slotted.length < 4) return null;
    if (distinctElements.size < 4) return null;
    return { contributingCharacters: slotted.map((s) => s.name) };
  },
};

// --- Named synergies ------------------------------------------------------
//
// These aren't queryable from genshin-db, so they're community-curated and
// keyed on the specific character names that trigger them. Keep this list
// short, accurate, and easy to extend. Entries are grounded in the
// `associationType` field of the underlying snapshot, not invented.

// Nod-Krai roster (associationType ASSOC_NODKRAI / ASSOC_NODKRAI_ZIBAI /
// ASSOC_OMNI_SCOURGE). This is the same character set the game pulls from
// when tagging Children of the Bygone Era / Moonsign mechanics.
const NOD_KRAI_CHARACTERS = new Set<string>([
  "Aino",
  "Columbina",
  "Flins",
  "Illuga",
  "Ineffa",
  "Jahoda",
  "Lauma",
  "Linnea",
  "Nefer",
  "Skirk",
  "Zibai",
]);

const MOONSIGN_RULE: SynergyRule = {
  id: "named-moonsign",
  name: "Moonsign · Children of the Bygone Era",
  kind: "named",
  elements: [],
  description:
    "Two or more Nod-Krai characters in the party may share Moonsign-linked passives and burst interactions. Effects vary by character; check each kit for specifics.",
  match: (team) => {
    const matchers = slottedCharacters(team).filter((s) =>
      NOD_KRAI_CHARACTERS.has(s.name),
    );
    if (matchers.length < 2) return null;
    return { contributingCharacters: matchers.map((m) => m.name) };
  },
};

// Hexerei Rites — Nod-Krai's witchcraft-flavoured kit interaction. Folklore-
// adjacent Nod-Krai characters (Lauma is the Baltic forest spirit, Jahoda is
// a Slavic herbalist motif, Columbina the Fatui Harbinger of moonlit rites)
// can layer their Hexerei effects on the field. Keep this list narrow and
// extend it as new characters with Hexerei-tagged passives are released.
const HEXEREI_CHARACTERS = new Set<string>([
  "Lauma",
  "Jahoda",
  "Columbina",
  "Aino",
]);

const HEXEREI_RULE: SynergyRule = {
  id: "named-hexerei-rites",
  name: "Hexerei Rites",
  kind: "named",
  elements: [],
  description:
    "Two or more Hexerei-attuned Nod-Krai characters in the party can stack their ritual effects, extending field-time procs and reaction setup. Effects vary by character; check each kit for specifics.",
  match: (team) => {
    const matchers = slottedCharacters(team).filter((s) =>
      HEXEREI_CHARACTERS.has(s.name),
    );
    if (matchers.length < 2) return null;
    return { contributingCharacters: matchers.map((m) => m.name) };
  },
};

const MAINACTOR_RULE: SynergyRule = {
  id: "named-main-cast",
  name: "The Main Cast",
  kind: "named",
  elements: [],
  description:
    "Manekin and Manekina paired together. These elementless companions are designed to play side by side; pairing them unlocks their shared performance dynamics.",
  match: (team) => {
    const names = new Set(
      team
        .map((s) => s.characterName)
        .filter((n): n is string => typeof n === "string"),
    );
    if (!names.has("Manekin") || !names.has("Manekina")) return null;
    return { contributingCharacters: ["Manekin", "Manekina"] };
  },
};

// --- Registry -------------------------------------------------------------

export const SYNERGY_RULES: SynergyRule[] = [
  ...RESONANCES.map(buildElementalRule),
  PROTECTIVE_CANOPY,
  MOONSIGN_RULE,
  HEXEREI_RULE,
  MAINACTOR_RULE,
];

export const elementColor = (element: string): string =>
  ELEMENT_COLORS[element] ?? "#888";

export type EvaluatedSynergy = {
  rule: SynergyRule;
  match: SynergyMatch;
};

export const evaluateSynergies = (team: TeamState): EvaluatedSynergy[] => {
  const out: EvaluatedSynergy[] = [];
  for (const rule of SYNERGY_RULES) {
    const m = rule.match(team);
    if (m) out.push({ rule, match: m });
  }
  return out;
};

// --- Near-miss hints ------------------------------------------------------
//
// When the team isn't full, surface up to 2 elemental resonances that need
// exactly one more matching character to trigger. Used as a muted hint row.

export type NearMissHint = {
  ruleId: string;
  ruleName: string;
  element: string;
  message: string;
};

export const computeNearMissHints = (team: TeamState): NearMissHint[] => {
  const slotted = slottedCharacters(team);
  const filledSlots = team.filter((s) => s.characterName).length;
  if (filledSlots >= 4) return [];

  const elementCounts = new Map<string, number>();
  for (const s of slotted) {
    if (!s.element) continue;
    elementCounts.set(s.element, (elementCounts.get(s.element) ?? 0) + 1);
  }

  const hints: NearMissHint[] = [];
  for (const spec of RESONANCES) {
    const have = elementCounts.get(spec.element) ?? 0;
    // Already triggered (>=2) or completely absent (0) — not a near-miss.
    if (have === 1) {
      hints.push({
        ruleId: spec.id,
        ruleName: spec.name,
        element: spec.element,
        message: `Add 1 more ${spec.element} for ${spec.name}`,
      });
    }
  }
  return hints.slice(0, 2);
};
