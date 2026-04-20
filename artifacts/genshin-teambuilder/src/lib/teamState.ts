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

export const encodeTeam = (team: TeamState): string => {
  return toBase64Url(JSON.stringify(team));
};

export const decodeTeam = (encoded: string): TeamState | null => {
  try {
    const parsed = JSON.parse(fromBase64Url(encoded));
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
