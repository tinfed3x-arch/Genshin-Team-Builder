// Combat-talent keys eligible to be marked as "level priorities".
// Passive talents don't get leveled, so they're excluded.
export type LevelableTalentKey = "combat1" | "combat2" | "combat3";
export const LEVELABLE_TALENT_KEYS: readonly LevelableTalentKey[] = [
  "combat1",
  "combat2",
  "combat3",
];

export type SlotState = {
  characterName: string | null;
  constellation: number;
  weaponName: string | null;
  artifactMode: "4pc" | "2pc";
  artifactSet1: string | null;
  artifactSet2: string | null;
  sandsMain: string;
  gobletMain: string;
  circletMain: string;
  leveledTalents: LevelableTalentKey[];
};

export type TeamState = [SlotState, SlotState, SlotState, SlotState];

export const defaultSlot = (): SlotState => ({
  characterName: null,
  constellation: 0,
  weaponName: null,
  artifactMode: "4pc",
  artifactSet1: null,
  artifactSet2: null,
  sandsMain: "",
  gobletMain: "",
  circletMain: "",
  leveledTalents: [],
});

const normalizeLeveled = (raw: unknown): LevelableTalentKey[] => {
  if (!Array.isArray(raw)) return [];
  const out = new Set<LevelableTalentKey>();
  for (const v of raw) {
    if (
      v === "combat1" ||
      v === "combat2" ||
      v === "combat3"
    ) {
      out.add(v);
    }
  }
  return [...out];
};

export const defaultTeam = (): TeamState => [
  defaultSlot(),
  defaultSlot(),
  defaultSlot(),
  defaultSlot(),
];

export const isSlotEmpty = (s: SlotState): boolean =>
  !s.characterName &&
  !s.weaponName &&
  !s.artifactSet1 &&
  !s.artifactSet2 &&
  s.constellation === 0 &&
  !s.sandsMain &&
  !s.gobletMain &&
  !s.circletMain;

const toBase64Url = (str: string): string => {
  const b64 = btoa(unescape(encodeURIComponent(str)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const fromBase64Url = (str: string): string => {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  return decodeURIComponent(escape(atob(b64 + pad)));
};

// Normalize an unknown value into a valid SlotState, falling back to defaults
// for missing or wrongly-typed fields. Prevents corrupt data from breaking the UI.
const normalizeSlot = (raw: unknown): SlotState => {
  const base = defaultSlot();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown>;
  return {
    characterName: typeof r.characterName === "string" ? r.characterName : base.characterName,
    constellation:
      typeof r.constellation === "number" && r.constellation >= 0 && r.constellation <= 6
        ? Math.floor(r.constellation)
        : base.constellation,
    weaponName: typeof r.weaponName === "string" ? r.weaponName : base.weaponName,
    artifactMode: r.artifactMode === "2pc" ? "2pc" : "4pc",
    artifactSet1: typeof r.artifactSet1 === "string" ? r.artifactSet1 : base.artifactSet1,
    artifactSet2: typeof r.artifactSet2 === "string" ? r.artifactSet2 : base.artifactSet2,
    sandsMain: typeof r.sandsMain === "string" ? r.sandsMain : base.sandsMain,
    gobletMain: typeof r.gobletMain === "string" ? r.gobletMain : base.gobletMain,
    circletMain: typeof r.circletMain === "string" ? r.circletMain : base.circletMain,
    leveledTalents: normalizeLeveled(r.leveledTalents),
  };
};

const normalizeTeam = (raw: unknown): TeamState | null => {
  if (!Array.isArray(raw)) return null;
  const slots: SlotState[] = [];
  for (let i = 0; i < 4; i++) {
    slots.push(normalizeSlot(raw[i]));
  }
  return slots as TeamState;
};

// --- Compact share-link encoding ---
//
// A team becomes a JSON array of 4 slots. Each slot is either `0` (empty) or
// a positional array:
//   [character, constellation, weapon, mode, set1, set2, sands, goblet, circlet, leveledMask]
// where mode = 1 for "4pc" (default) and 0 for "2pc", and leveledMask is a
// 3-bit mask (combat1=1, combat2=2, combat3=4). Trailing default values are
// stripped from each slot's array to shorten the payload further.
//
// The decoder also accepts the legacy v1 format (array of full objects with
// named keys) for backward compatibility with old shared links.

const TALENT_BITS: Record<LevelableTalentKey, number> = {
  combat1: 1,
  combat2: 2,
  combat3: 4,
};

const talentsToMask = (lv: LevelableTalentKey[]): number => {
  let m = 0;
  for (const k of lv) m |= TALENT_BITS[k];
  return m;
};

const maskToTalents = (m: unknown): LevelableTalentKey[] => {
  if (typeof m !== "number" || !Number.isFinite(m)) return [];
  const out: LevelableTalentKey[] = [];
  if (m & 1) out.push("combat1");
  if (m & 2) out.push("combat2");
  if (m & 4) out.push("combat3");
  return out;
};

type CompactSlot = [
  string, // character ("" = null)
  number, // constellation
  string, // weapon ("" = null)
  number, // mode: 1 = 4pc, 0 = 2pc
  string, // artifact set 1 ("" = null)
  string, // artifact set 2 ("" = null)
  string, // sands mainstat
  string, // goblet mainstat
  string, // circlet mainstat
  number, // leveled-talent bitmask
];

const slotToCompact = (s: SlotState): CompactSlot | 0 => {
  if (isSlotEmpty(s) && s.leveledTalents.length === 0) return 0;
  const arr: CompactSlot = [
    s.characterName ?? "",
    s.constellation,
    s.weaponName ?? "",
    s.artifactMode === "2pc" ? 0 : 1,
    s.artifactSet1 ?? "",
    s.artifactSet2 ?? "",
    s.sandsMain,
    s.gobletMain,
    s.circletMain,
    talentsToMask(s.leveledTalents),
  ];
  // Strip trailing defaults (0 / "") to shorten the JSON payload.
  let end = arr.length;
  const defaults: (string | number)[] = ["", 0, "", 1, "", "", "", "", "", 0];
  while (end > 1 && arr[end - 1] === defaults[end - 1]) end--;
  return arr.slice(0, end) as CompactSlot;
};

const compactToSlot = (raw: unknown): SlotState => {
  if (raw === 0 || raw === null) return defaultSlot();
  if (!Array.isArray(raw)) return defaultSlot();
  const get = <T,>(i: number, fallback: T): T =>
    raw[i] === undefined ? fallback : (raw[i] as T);
  const character = get<string>(0, "");
  const cons = get<number>(1, 0);
  const weapon = get<string>(2, "");
  const mode = get<number>(3, 1);
  const set1 = get<string>(4, "");
  const set2 = get<string>(5, "");
  const sands = get<string>(6, "");
  const goblet = get<string>(7, "");
  const circlet = get<string>(8, "");
  const lvMask = get<number>(9, 0);
  return normalizeSlot({
    characterName: character || null,
    constellation: typeof cons === "number" ? cons : 0,
    weaponName: weapon || null,
    artifactMode: mode === 0 ? "2pc" : "4pc",
    artifactSet1: set1 || null,
    artifactSet2: set2 || null,
    sandsMain: typeof sands === "string" ? sands : "",
    gobletMain: typeof goblet === "string" ? goblet : "",
    circletMain: typeof circlet === "string" ? circlet : "",
    leveledTalents: maskToTalents(lvMask),
  });
};

const isCompactTeam = (raw: unknown): boolean =>
  Array.isArray(raw) &&
  raw.every((s) => s === 0 || s === null || Array.isArray(s));

export const encodeTeam = (team: TeamState): string => {
  const compact = team.map(slotToCompact);
  return toBase64Url(JSON.stringify(compact));
};

export const decodeTeam = (encoded: string): TeamState | null => {
  try {
    const parsed = JSON.parse(fromBase64Url(encoded));
    if (isCompactTeam(parsed)) {
      const slots: SlotState[] = [];
      for (let i = 0; i < 4; i++) slots.push(compactToSlot(parsed[i]));
      return slots as TeamState;
    }
    // Legacy v1 format: array of full slot objects with named keys.
    return normalizeTeam(parsed);
  } catch {
    return null;
  }
};

const STORAGE_KEY = "genshin-teambuilder.savedTeams";

type SavedTeams = Record<string, TeamState>;

const readSaved = (): SavedTeams => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const writeSaved = (saved: SavedTeams): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // ignore quota errors
  }
};

export const saveTeam = (name: string, team: TeamState): void => {
  const saved = readSaved();
  saved[name] = team;
  writeSaved(saved);
};

export const loadTeam = (name: string): TeamState | null => {
  const saved = readSaved();
  const raw = saved[name];
  if (!raw) return null;
  return normalizeTeam(raw);
};

export const teamExists = (name: string): boolean => {
  return name in readSaved();
};

export const deleteTeam = (name: string): void => {
  const saved = readSaved();
  delete saved[name];
  writeSaved(saved);
};

export const getSavedTeamNames = (): string[] => {
  return Object.keys(readSaved()).sort();
};
