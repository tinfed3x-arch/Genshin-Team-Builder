import * as React from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getEffectiveCharacterData,
  getWeaponData,
  getArtifactData,
  getCharacterIcon,
  getWeaponIcon,
  getArtifactIcon,
  ELEMENT_COLORS,
  isTravelerForm,
  stripHtml,
} from "@/lib/genshin";

export type PickerKind = "character" | "weapon" | "artifact";

// Element groups for each reaction the user can filter by. Anemo and Geo are
// included in Swirl/Crystallize because those are the trigger elements; Lunar
// Crystallize uses the user-specified Hydro+Geo pair.
export const REACTION_ELEMENTS: Record<string, ReadonlyArray<string>> = {
  Vaporize: ["Hydro", "Pyro"],
  Melt: ["Cryo", "Pyro"],
  Overload: ["Pyro", "Electro"],
  Superconduct: ["Cryo", "Electro"],
  "Electro-Charged": ["Hydro", "Electro"],
  Frozen: ["Cryo", "Hydro"],
  Swirl: ["Anemo", "Pyro", "Hydro", "Cryo", "Electro"],
  Crystallize: ["Geo", "Pyro", "Hydro", "Cryo", "Electro"],
  Burning: ["Pyro", "Dendro"],
  Bloom: ["Hydro", "Dendro"],
  Hyperbloom: ["Electro", "Hydro", "Dendro"],
  Burgeon: ["Pyro", "Hydro", "Dendro"],
  Quicken: ["Electro", "Dendro"],
  Aggravate: ["Electro", "Dendro"],
  Spread: ["Electro", "Dendro"],
  "Lunar Crystallize": ["Hydro", "Geo"],
};

const REACTION_NAMES = Object.keys(REACTION_ELEMENTS);

interface RichPickerDialogProps {
  kind: PickerKind;
  options: string[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  testId?: string;
}

const renderStars = (rarity: number) => "★".repeat(Math.max(0, rarity));

function TriggerIcon({
  kind,
  name,
}: {
  kind: PickerKind;
  name: string | null;
}) {
  if (!name) {
    return (
      <div
        aria-hidden
        className="mr-2 h-6 w-6 shrink-0 rounded bg-secondary/50"
      />
    );
  }
  const src =
    kind === "character"
      ? getCharacterIcon(name)
      : kind === "weapon"
      ? getWeaponIcon(name)
      : getArtifactIcon(name);
  if (!src) {
    return (
      <div
        aria-hidden
        className="mr-2 h-6 w-6 shrink-0 rounded bg-secondary/50"
      />
    );
  }
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      loading="lazy"
      className="mr-2 h-6 w-6 shrink-0 rounded object-cover bg-secondary/30"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
      }}
    />
  );
}

// Derived per-option metadata used for filtering / sorting / display.
type CharRow = {
  name: string;
  rarity: number;
  element: string;
  weapon: string;
  ascensionStat: string;
  region: string;
  version: string;
  searchHay: string;
};
type WeapRow = {
  name: string;
  rarity: number;
  weaponType: string;
  baseAtk: number;
  mainStat: string;
  effectName: string;
  effectText: string;
  searchHay: string;
};
type ArtRow = {
  name: string;
  maxRarity: number;
  rarityList: number[];
  effect2Pc: string;
  effect4Pc: string;
  searchHay: string;
};

// Module-level row caches keyed by name. The bundled data is loaded once
// and never mutated at runtime (setGenshinData is called only at boot, before
// any picker renders), so it's safe to memoize across all 4 slots' pickers
// instead of recomputing the same ~120 character / ~200 weapon / ~55 artifact
// rows every time a dialog opens.
const charRowCache = new Map<string, CharRow>();
const weapRowCache = new Map<string, WeapRow>();
const artRowCache = new Map<string, ArtRow>();

const buildCharRow = (name: string): CharRow => {
  const cached = charRowCache.get(name);
  if (cached) return cached;
  const row = buildCharRowImpl(name);
  charRowCache.set(name, row);
  return row;
};

const buildCharRowImpl = (name: string): CharRow => {
  const c = getEffectiveCharacterData(name);
  const rarity = (c?.rarity as number | undefined) ?? 0;
  const element = (c?.elementText as string | undefined) ?? "—";
  const weapon = (c?.weaponText as string | undefined) ?? "—";
  const ascensionStat = (c?.substatText as string | undefined) ?? "—";
  const region = (c?.region as string | undefined) ?? "—";
  const version = (c?.version as string | undefined) ?? "";
  return {
    name,
    rarity,
    element,
    weapon,
    ascensionStat,
    region,
    version,
    searchHay: `${name} ${element} ${weapon} ${region}`.toLowerCase(),
  };
};

const buildWeapRow = (name: string): WeapRow => {
  const cached = weapRowCache.get(name);
  if (cached) return cached;
  const row = buildWeapRowImpl(name);
  weapRowCache.set(name, row);
  return row;
};

const buildWeapRowImpl = (name: string): WeapRow => {
  const w = getWeaponData(name) as
    | {
        rarity?: number;
        weaponText?: string;
        baseAtkValue?: number;
        mainStatText?: string;
        effectName?: string;
        r1?: { description?: string };
      }
    | null;
  const effectText = stripHtml(w?.r1?.description ?? "");
  return {
    name,
    rarity: w?.rarity ?? 0,
    weaponType: w?.weaponText ?? "—",
    baseAtk: Math.round(w?.baseAtkValue ?? 0),
    mainStat: w?.mainStatText ?? "—",
    effectName: w?.effectName ?? "",
    effectText,
    searchHay: `${name} ${w?.mainStatText ?? ""} ${
      w?.effectName ?? ""
    } ${effectText}`.toLowerCase(),
  };
};

const buildArtRow = (name: string): ArtRow => {
  const cached = artRowCache.get(name);
  if (cached) return cached;
  const row = buildArtRowImpl(name);
  artRowCache.set(name, row);
  return row;
};

const buildArtRowImpl = (name: string): ArtRow => {
  const a = getArtifactData(name) as
    | {
        rarityList?: number[];
        effect2Pc?: string;
        effect4Pc?: string;
      }
    | null;
  const rarityList = a?.rarityList ?? [];
  return {
    name,
    rarityList,
    maxRarity: rarityList.length ? Math.max(...rarityList) : 0,
    effect2Pc: a?.effect2Pc ?? "",
    effect4Pc: a?.effect4Pc ?? "",
    searchHay: `${name} ${a?.effect2Pc ?? ""} ${a?.effect4Pc ?? ""}`.toLowerCase(),
  };
};

// ---------------------------------------------------------------------------

export function RichPickerDialog({
  kind,
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  testId,
}: RichPickerDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [rarityFilter, setRarityFilter] = React.useState<string>("all");
  const [elementFilter, setElementFilter] = React.useState<string>("all");
  const [weaponTypeFilter, setWeaponTypeFilter] = React.useState<string>("all");
  const [regionFilter, setRegionFilter] = React.useState<string>("all");
  const [reactionFilter, setReactionFilter] = React.useState<string>("all");
  const [ascensionStatFilter, setAscensionStatFilter] =
    React.useState<string>("all");
  const [mainStatFilter, setMainStatFilter] = React.useState<string>("all");
  const [sort, setSort] = React.useState<string>(
    kind === "weapon" ? "atk-desc" : "rarity-desc",
  );

  const select = (name: string) => {
    onChange(name);
    setOpen(false);
  };

  // Reset transient state whenever the dialog reopens so the user always
  // starts from a clean, fully-populated list and never sees an empty
  // dialog because of a leftover filter from a previous session.
  React.useEffect(() => {
    if (open) {
      setQuery("");
      setRarityFilter("all");
      setElementFilter("all");
      setWeaponTypeFilter("all");
      setRegionFilter("all");
      setReactionFilter("all");
      setAscensionStatFilter("all");
      setMainStatFilter("all");
      setSort(kind === "weapon" ? "atk-desc" : "rarity-desc");
    }
  }, [open, kind]);

  // ----- Build typed rows once per options list -----
  const charRows = React.useMemo<CharRow[]>(
    () => (kind === "character" ? options.map(buildCharRow) : []),
    [kind, options],
  );
  const weapRows = React.useMemo<WeapRow[]>(
    () => (kind === "weapon" ? options.map(buildWeapRow) : []),
    [kind, options],
  );
  const artRows = React.useMemo<ArtRow[]>(
    () => (kind === "artifact" ? options.map(buildArtRow) : []),
    [kind, options],
  );

  // ----- Facet values for filter dropdowns -----
  const facets = React.useMemo(() => {
    if (kind === "character") {
      return {
        rarities: Array.from(new Set(charRows.map((r) => r.rarity)))
          .filter((n) => n > 0)
          .sort((a, b) => b - a),
        elements: Array.from(new Set(charRows.map((r) => r.element)))
          .filter((s) => s && s !== "—")
          .sort(),
        weaponTypes: Array.from(new Set(charRows.map((r) => r.weapon)))
          .filter((s) => s && s !== "—")
          .sort(),
        regions: Array.from(new Set(charRows.map((r) => r.region)))
          .filter((s) => s && s !== "—")
          .sort(),
        ascensionStats: Array.from(
          new Set(charRows.map((r) => r.ascensionStat)),
        )
          .filter((s) => s && s !== "—")
          .sort(),
        mainStats: [] as string[],
      };
    }
    if (kind === "weapon") {
      return {
        rarities: Array.from(new Set(weapRows.map((r) => r.rarity)))
          .filter((n) => n > 0)
          .sort((a, b) => b - a),
        elements: [] as string[],
        weaponTypes: [] as string[],
        regions: [] as string[],
        ascensionStats: [] as string[],
        mainStats: Array.from(new Set(weapRows.map((r) => r.mainStat)))
          .filter((s) => s && s !== "—")
          .sort(),
      };
    }
    return {
      rarities: Array.from(
        new Set(artRows.flatMap((r) => r.rarityList)),
      ).sort((a, b) => b - a),
      elements: [],
      weaponTypes: [],
      regions: [],
      ascensionStats: [],
      mainStats: [],
    };
  }, [kind, charRows, weapRows, artRows]);

  // ----- Filter + sort -----
  const q = query.trim().toLowerCase();

  const filteredChars = React.useMemo(() => {
    if (kind !== "character") return [] as CharRow[];
    let out = charRows;
    if (q) out = out.filter((r) => r.searchHay.includes(q));
    if (rarityFilter !== "all")
      out = out.filter((r) => r.rarity === Number(rarityFilter));
    if (elementFilter !== "all")
      out = out.filter((r) => r.element === elementFilter);
    if (weaponTypeFilter !== "all")
      out = out.filter((r) => r.weapon === weaponTypeFilter);
    if (regionFilter !== "all")
      out = out.filter((r) => r.region === regionFilter);
    if (reactionFilter !== "all") {
      const allowed = REACTION_ELEMENTS[reactionFilter];
      if (allowed) {
        const allowedSet = new Set(allowed);
        out = out.filter((r) => allowedSet.has(r.element));
      }
    }
    if (ascensionStatFilter !== "all")
      out = out.filter((r) => r.ascensionStat === ascensionStatFilter);
    return [...out].sort((a, b) => {
      switch (sort) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "rarity-asc":
          return a.rarity - b.rarity || a.name.localeCompare(b.name);
        case "element":
          return (
            a.element.localeCompare(b.element) || a.name.localeCompare(b.name)
          );
        case "rarity-desc":
        default:
          return b.rarity - a.rarity || a.name.localeCompare(b.name);
      }
    });
  }, [
    kind,
    charRows,
    q,
    rarityFilter,
    elementFilter,
    weaponTypeFilter,
    regionFilter,
    reactionFilter,
    ascensionStatFilter,
    sort,
  ]);

  const filteredWeaps = React.useMemo(() => {
    if (kind !== "weapon") return [] as WeapRow[];
    let out = weapRows;
    if (q) out = out.filter((r) => r.searchHay.includes(q));
    if (rarityFilter !== "all")
      out = out.filter((r) => r.rarity === Number(rarityFilter));
    if (mainStatFilter !== "all")
      out = out.filter((r) => r.mainStat === mainStatFilter);
    return [...out].sort((a, b) => {
      switch (sort) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "rarity-asc":
          return a.rarity - b.rarity || a.name.localeCompare(b.name);
        case "rarity-desc":
          return b.rarity - a.rarity || a.name.localeCompare(b.name);
        case "atk-asc":
          return a.baseAtk - b.baseAtk || a.name.localeCompare(b.name);
        case "atk-desc":
        default:
          return b.baseAtk - a.baseAtk || a.name.localeCompare(b.name);
      }
    });
  }, [kind, weapRows, q, rarityFilter, mainStatFilter, sort]);

  const filteredArts = React.useMemo(() => {
    if (kind !== "artifact") return [] as ArtRow[];
    let out = artRows;
    if (q) out = out.filter((r) => r.searchHay.includes(q));
    if (rarityFilter !== "all")
      out = out.filter((r) => r.rarityList.includes(Number(rarityFilter)));
    return [...out].sort((a, b) => {
      switch (sort) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "rarity-asc":
          return a.maxRarity - b.maxRarity || a.name.localeCompare(b.name);
        case "rarity-desc":
        default:
          return b.maxRarity - a.maxRarity || a.name.localeCompare(b.name);
      }
    });
  }, [kind, artRows, q, rarityFilter, sort]);

  const resultCount =
    kind === "character"
      ? filteredChars.length
      : kind === "weapon"
      ? filteredWeaps.length
      : filteredArts.length;

  const clearAllFilters = () => {
    setQuery("");
    setRarityFilter("all");
    setElementFilter("all");
    setWeaponTypeFilter("all");
    setRegionFilter("all");
    setReactionFilter("all");
    setAscensionStatFilter("all");
    setMainStatFilter("all");
  };

  const sortOptions =
    kind === "weapon"
      ? [
          { v: "atk-desc", l: "Base ATK (high → low)" },
          { v: "atk-asc", l: "Base ATK (low → high)" },
          { v: "rarity-desc", l: "Rarity (high → low)" },
          { v: "rarity-asc", l: "Rarity (low → high)" },
          { v: "name-asc", l: "Name (A → Z)" },
          { v: "name-desc", l: "Name (Z → A)" },
        ]
      : kind === "character"
      ? [
          { v: "rarity-desc", l: "Rarity (high → low)" },
          { v: "rarity-asc", l: "Rarity (low → high)" },
          { v: "element", l: "Element" },
          { v: "name-asc", l: "Name (A → Z)" },
          { v: "name-desc", l: "Name (Z → A)" },
        ]
      : [
          { v: "rarity-desc", l: "Max rarity (high → low)" },
          { v: "rarity-asc", l: "Max rarity (low → high)" },
          { v: "name-asc", l: "Name (A → Z)" },
          { v: "name-desc", l: "Name (Z → A)" },
        ];

  const titles: Record<PickerKind, string> = {
    character: "Browse Characters",
    weapon: "Browse Weapons",
    artifact: "Browse Artifact Sets",
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          aria-haspopup="dialog"
          aria-expanded={open}
          className="w-full justify-between bg-card hover:bg-accent/50"
          disabled={disabled}
          data-testid={testId}
        >
          <span className="flex items-center min-w-0 truncate">
            <TriggerIcon kind={kind} name={value} />
            <span className="truncate">{value ? value : placeholder}</span>
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-w-3xl w-[95vw] sm:w-full p-0 gap-0 max-h-[90vh] flex flex-col"
        data-testid={`${testId}-dialog`}
      >
        <DialogHeader className="px-4 sm:px-6 pt-4 pb-3 border-b border-border/50">
          <DialogTitle>{titles[kind]}</DialogTitle>
        </DialogHeader>

        {/* Controls */}
        <div className="px-4 sm:px-6 py-3 space-y-3 border-b border-border/50">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
              aria-hidden
            />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                kind === "weapon"
                  ? "Search by name, stat, or passive…"
                  : kind === "artifact"
                  ? "Search by name or set effect…"
                  : "Search by name, element, weapon, region…"
              }
              className="pl-9 pr-8"
              data-testid={`${testId}-search`}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-accent text-muted-foreground"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {facets.rarities.length > 0 && (
              <Select value={rarityFilter} onValueChange={setRarityFilter}>
                <SelectTrigger className="h-8 text-xs w-auto min-w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any rarity</SelectItem>
                  {facets.rarities.map((r) => (
                    <SelectItem key={r} value={String(r)}>
                      {r}★
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {kind === "character" && facets.elements.length > 0 && (
              <Select value={elementFilter} onValueChange={setElementFilter}>
                <SelectTrigger className="h-8 text-xs w-auto min-w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any element</SelectItem>
                  {facets.elements.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {kind === "character" && facets.weaponTypes.length > 0 && (
              <Select
                value={weaponTypeFilter}
                onValueChange={setWeaponTypeFilter}
              >
                <SelectTrigger className="h-8 text-xs w-auto min-w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any weapon</SelectItem>
                  {facets.weaponTypes.map((w) => (
                    <SelectItem key={w} value={w}>
                      {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {kind === "character" && facets.regions.length > 0 && (
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="h-8 text-xs w-auto min-w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any region</SelectItem>
                  {facets.regions.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {kind === "character" && (
              <Select value={reactionFilter} onValueChange={setReactionFilter}>
                <SelectTrigger
                  className="h-8 text-xs w-auto min-w-[140px]"
                  data-testid={`${testId}-reaction`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any reaction</SelectItem>
                  {REACTION_NAMES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {kind === "character" && facets.ascensionStats.length > 0 && (
              <Select
                value={ascensionStatFilter}
                onValueChange={setAscensionStatFilter}
              >
                <SelectTrigger
                  className="h-8 text-xs w-auto min-w-[150px]"
                  data-testid={`${testId}-ascension`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any ascension stat</SelectItem>
                  {facets.ascensionStats.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {kind === "weapon" && facets.mainStats.length > 0 && (
              <Select value={mainStatFilter} onValueChange={setMainStatFilter}>
                <SelectTrigger className="h-8 text-xs w-auto min-w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any main stat</SelectItem>
                  {facets.mainStats.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="ml-auto flex gap-2 items-center">
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="h-8 text-xs w-auto min-w-[170px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((o) => (
                    <SelectItem key={o.v} value={o.v}>
                      {o.l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={clearAllFilters}
              >
                Reset
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            {resultCount} {resultCount === 1 ? "result" : "results"}
          </div>
        </div>

        {/* Result list */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-3 sm:p-4">
            {kind === "character" && (
              <CharacterGrid
                rows={filteredChars}
                value={value}
                onSelect={select}
                testId={testId}
              />
            )}
            {kind === "weapon" && (
              <WeaponList
                rows={filteredWeaps}
                value={value}
                onSelect={select}
                testId={testId}
              />
            )}
            {kind === "artifact" && (
              <ArtifactList
                rows={filteredArts}
                value={value}
                onSelect={select}
                testId={testId}
              />
            )}
            {resultCount === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No matches. Try clearing filters or refining your search.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Per-kind result renderers

function SelectedCheck() {
  return (
    <span
      aria-label="Currently selected"
      className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow"
    >
      <Check className="h-3 w-3" aria-hidden />
    </span>
  );
}

function CharacterGrid({
  rows,
  value,
  onSelect,
  testId,
}: {
  rows: CharRow[];
  value: string | null;
  onSelect: (name: string) => void;
  testId?: string;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      {rows.map((r) => {
        const selected = r.name === value;
        const elColor = ELEMENT_COLORS[r.element] ?? "hsl(var(--muted))";
        const icon = getCharacterIcon(r.name);
        return (
          <button
            key={r.name}
            type="button"
            onClick={() => onSelect(r.name)}
            className={cn(
              "relative text-left rounded-md border bg-card p-2 hover:bg-accent/50 hover:border-primary/50 transition-colors",
              selected ? "border-primary ring-1 ring-primary/40" : "border-border/60",
            )}
            data-testid={`${testId}-card-${r.name.replace(/\s+/g, "-").toLowerCase()}`}
          >
            {selected && <SelectedCheck />}
            <div className="flex items-start gap-2">
              <div className="relative shrink-0">
                {icon ? (
                  <img
                    src={icon}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    className="h-12 w-12 rounded object-cover bg-secondary/30 border border-border/40"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                    }}
                  />
                ) : (
                  <div className="h-12 w-12 rounded bg-secondary/40 border border-border/40" />
                )}
                <div
                  className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background"
                  style={{ backgroundColor: elColor }}
                  aria-hidden
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-foreground truncate">
                  {r.name}
                </div>
                <div className="text-[10px] text-yellow-500 leading-none mt-0.5">
                  {renderStars(r.rarity)}
                </div>
                <div
                  className="text-[11px] mt-1 truncate"
                  style={{ color: elColor }}
                >
                  {r.element} · {r.weapon}
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {isTravelerForm(r.name) ? "Traveler" : r.region}
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  Asc: {r.ascensionStat}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function WeaponList({
  rows,
  value,
  onSelect,
  testId,
}: {
  rows: WeapRow[];
  value: string | null;
  onSelect: (name: string) => void;
  testId?: string;
}) {
  return (
    <div className="space-y-2">
      {rows.map((r) => {
        const selected = r.name === value;
        const icon = getWeaponIcon(r.name);
        return (
          <button
            key={r.name}
            type="button"
            onClick={() => onSelect(r.name)}
            className={cn(
              "relative w-full text-left rounded-md border bg-card p-3 hover:bg-accent/50 hover:border-primary/50 transition-colors",
              selected ? "border-primary ring-1 ring-primary/40" : "border-border/60",
            )}
            data-testid={`${testId}-card-${r.name.replace(/\s+/g, "-").toLowerCase()}`}
          >
            {selected && <SelectedCheck />}
            <div className="flex gap-3">
              {icon ? (
                <img
                  src={icon}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className="h-14 w-14 rounded object-cover bg-secondary/30 shrink-0 border border-border/40"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                  }}
                />
              ) : (
                <div className="h-14 w-14 rounded bg-secondary/40 border border-border/40 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground truncate">
                    {r.name}
                  </span>
                  <span className="text-xs text-yellow-500">
                    {renderStars(r.rarity)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <Badge
                    variant="secondary"
                    className="text-[10px] py-0 px-1.5 h-4"
                  >
                    Base ATK {r.baseAtk}
                  </Badge>
                  {r.mainStat !== "—" && (
                    <Badge
                      variant="outline"
                      className="text-[10px] py-0 px-1.5 h-4"
                    >
                      {r.mainStat}
                    </Badge>
                  )}
                </div>
                {r.effectName && (
                  <div className="mt-1.5 text-xs">
                    <span className="font-semibold text-foreground/90">
                      {r.effectName}:
                    </span>{" "}
                    <span className="text-muted-foreground line-clamp-2">
                      {r.effectText}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ArtifactList({
  rows,
  value,
  onSelect,
  testId,
}: {
  rows: ArtRow[];
  value: string | null;
  onSelect: (name: string) => void;
  testId?: string;
}) {
  return (
    <div className="space-y-2">
      {rows.map((r) => {
        const selected = r.name === value;
        const icon = getArtifactIcon(r.name);
        const rarityLabel =
          r.rarityList.length > 1
            ? `${Math.min(...r.rarityList)}–${Math.max(...r.rarityList)}★`
            : r.rarityList.length === 1
            ? `${r.rarityList[0]}★`
            : "";
        return (
          <button
            key={r.name}
            type="button"
            onClick={() => onSelect(r.name)}
            className={cn(
              "relative w-full text-left rounded-md border bg-card p-3 hover:bg-accent/50 hover:border-primary/50 transition-colors",
              selected ? "border-primary ring-1 ring-primary/40" : "border-border/60",
            )}
            data-testid={`${testId}-card-${r.name.replace(/\s+/g, "-").toLowerCase()}`}
          >
            {selected && <SelectedCheck />}
            <div className="flex gap-3">
              {icon ? (
                <img
                  src={icon}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className="h-14 w-14 rounded object-cover bg-secondary/30 shrink-0 border border-border/40"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                  }}
                />
              ) : (
                <div className="h-14 w-14 rounded bg-secondary/40 border border-border/40 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground truncate">
                    {r.name}
                  </span>
                  {rarityLabel && (
                    <span className="text-xs text-yellow-500">{rarityLabel}</span>
                  )}
                </div>
                {r.effect2Pc && (
                  <div className="mt-1 text-xs">
                    <span className="font-semibold text-foreground/90">2-pc:</span>{" "}
                    <span className="text-muted-foreground">{r.effect2Pc}</span>
                  </div>
                )}
                {r.effect4Pc && (
                  <div className="mt-1 text-xs">
                    <span className="font-semibold text-foreground/90">4-pc:</span>{" "}
                    <span className="text-muted-foreground line-clamp-3">
                      {r.effect4Pc}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
