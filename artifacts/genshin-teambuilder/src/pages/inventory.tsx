import * as React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  getCharacterNames,
  getEffectiveCharacterData,
  getAllWeaponNames,
  getWeaponData,
  getCharacterIcon,
  getWeaponIcon,
  ELEMENT_COLORS,
} from "@/lib/genshin";
import {
  useInventory,
  setCharacterOwned,
  setWeaponOwned,
  setManyCharactersOwned,
  setManyWeaponsOwned,
  getCharacterConstellation,
  getWeaponRefinement,
  setCharacterConstellation,
  setWeaponRefinement,
  importGoodInventory,
} from "@/lib/inventory";

type Kind = "character" | "weapon";
const mondstadtBackground = `${import.meta.env.BASE_URL}images/mondstadt-aerial.jpg`;

type Row = {
  name: string;
  rarity: number;
  facetA: string; // element for character, weapon-type for weapon
  searchHay: string;
};

const renderStars = (rarity: number) => "★".repeat(Math.max(0, rarity));

const buildCharRow = (name: string): Row => {
  const d = getEffectiveCharacterData(name);
  const rarity = Number(d?.rarity ?? 0);
  const element = String(d?.elementText ?? "");
  return {
    name,
    rarity,
    facetA: element,
    searchHay: `${name} ${element}`.toLowerCase(),
  };
};

const buildWeapRow = (name: string): Row => {
  const d = getWeaponData(name);
  const rarity = Number(d?.rarity ?? 0);
  const wt = String(d?.weaponText ?? d?.weaponType ?? "");
  return {
    name,
    rarity,
    facetA: wt,
    searchHay: `${name} ${wt}`.toLowerCase(),
  };
};

interface InventoryGridProps {
  kind: Kind;
  rows: Row[];
  ownedSet: ReadonlySet<string>;
}

function InventoryGrid({ kind, rows, ownedSet }: InventoryGridProps) {
  const [search, setSearch] = React.useState("");
  const [rarity, setRarity] = React.useState<string>("all");
  const [facet, setFacet] = React.useState<string>("all");
  const [showing, setShowing] = React.useState<"all" | "owned" | "missing">(
    "all"
  );

  const facetLabel = kind === "character" ? "Element" : "Type";

  const facetOptions = React.useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => {
      if (r.facetA) set.add(r.facetA);
    });
    return [...set].sort();
  }, [rows]);

  const rarityOptions = React.useMemo(() => {
    const set = new Set<number>();
    rows.forEach((r) => {
      if (r.rarity > 0) set.add(r.rarity);
    });
    return [...set].sort((a, b) => b - a);
  }, [rows]);

  const filtered = React.useMemo(() => {
    const s = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (s && !r.searchHay.includes(s)) return false;
      if (rarity !== "all" && r.rarity !== Number(rarity)) return false;
      if (facet !== "all" && r.facetA !== facet) return false;
      const isOwned = ownedSet.has(r.name);
      if (showing === "owned" && !isOwned) return false;
      if (showing === "missing" && isOwned) return false;
      return true;
    });
  }, [rows, search, rarity, facet, showing, ownedSet]);

  const visibleNames = React.useMemo(() => filtered.map((r) => r.name), [
    filtered,
  ]);

  const allVisibleOwned =
    visibleNames.length > 0 && visibleNames.every((n) => ownedSet.has(n));

  const toggleOne = (name: string, owned: boolean) => {
    if (kind === "character") setCharacterOwned(name, owned);
    else setWeaponOwned(name, owned);
  };

  const updateLevel = (name: string, value: string) => {
    const level = Number(value);
    if (kind === "character") setCharacterConstellation(name, level);
    else setWeaponRefinement(name, level);
  };

  const setAllVisible = (owned: boolean) => {
    if (kind === "character") setManyCharactersOwned(visibleNames, owned);
    else setManyWeaponsOwned(visibleNames, owned);
  };

  const ownedVisibleCount = visibleNames.filter((n) => ownedSet.has(n)).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[220px]">
          <label className="text-xs text-muted-foreground mb-1 block">
            Search
          </label>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${kind === "character" ? "characters" : "weapons"}...`}
            data-testid={`inventory-${kind}-search`}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            Rarity
          </label>
          <Select value={rarity} onValueChange={setRarity}>
            <SelectTrigger className="w-[120px]" data-testid={`inventory-${kind}-rarity`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {rarityOptions.map((r) => (
                <SelectItem key={r} value={String(r)}>
                  {renderStars(r)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            {facetLabel}
          </label>
          <Select value={facet} onValueChange={setFacet}>
            <SelectTrigger className="w-[140px]" data-testid={`inventory-${kind}-facet`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {facetOptions.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            Showing
          </label>
          <Select
            value={showing}
            onValueChange={(v) => setShowing(v as typeof showing)}
          >
            <SelectTrigger className="w-[140px]" data-testid={`inventory-${kind}-showing`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="owned">Owned</SelectItem>
              <SelectItem value="missing">Not owned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="text-muted-foreground">
          {ownedVisibleCount} / {visibleNames.length} shown owned · {ownedSet.size} total
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAllVisible(true)}
            disabled={visibleNames.length === 0 || allVisibleOwned}
            data-testid={`inventory-${kind}-mark-all`}
          >
            Mark all shown as owned
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAllVisible(false)}
            disabled={ownedVisibleCount === 0}
            data-testid={`inventory-${kind}-unmark-all`}
          >
            Unmark all shown
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center text-muted-foreground text-sm">
          No matches.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {filtered.map((row) => {
            const owned = ownedSet.has(row.name);
            const icon =
              kind === "character"
                ? getCharacterIcon(row.name)
                : getWeaponIcon(row.name);
            const elementColor =
              kind === "character"
                ? ELEMENT_COLORS[row.facetA] ?? "#888"
                : "#888";
            const constellation =
              kind === "character" ? getCharacterConstellation(row.name) : null;
            const refinement =
              kind === "weapon" ? getWeaponRefinement(row.name) : null;
            return (
              <div
                key={row.name}
                data-testid={`inventory-${kind}-card-${row.name.toLowerCase().replace(/\s+/g, "-")}`}
                className={cn(
                  "group relative flex flex-col items-center gap-2 rounded-lg border p-2 text-left transition-all",
                  owned
                    ? "border-primary bg-primary/10 hover:bg-primary/15"
                    : "border-border bg-card/50 opacity-70 hover:opacity-100 hover:border-border/80"
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleOne(row.name, !owned)}
                  aria-pressed={owned}
                  className="w-full text-left"
                >
                  <div className="relative w-full aspect-square rounded-md overflow-hidden bg-secondary/30">
                    {icon ? (
                      <img
                        src={icon}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                        }}
                      />
                    ) : null}
                    {!owned && (
                      <div className="absolute inset-0 bg-background/40" aria-hidden />
                    )}
                  </div>
                </button>
                <div className="w-full min-w-0">
                  <div className="text-xs font-medium truncate" title={row.name}>
                    {row.name}
                  </div>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <span className="text-[10px] text-amber-400 leading-none">
                      {renderStars(row.rarity)}
                    </span>
                    {row.facetA && (
                      <Badge
                        variant="outline"
                        className="px-1.5 py-0 text-[10px] leading-none border-border/60"
                        style={
                          kind === "character"
                            ? { color: elementColor, borderColor: elementColor + "55" }
                            : undefined
                        }
                      >
                        {row.facetA}
                      </Badge>
                    )}
                    {owned && kind === "character" && (
                      <Badge
                        variant="outline"
                        className="px-1.5 py-0 text-[10px] leading-none border-primary/40 text-primary"
                      >
                        C{constellation}
                      </Badge>
                    )}
                    {owned && kind === "weapon" && refinement !== null && (
                      <Badge
                        variant="outline"
                        className="px-1.5 py-0 text-[10px] leading-none border-primary/40 text-primary"
                      >
                        R{refinement}
                      </Badge>
                    )}
                  </div>
                  {owned && (
                    <Select
                      value={String(kind === "character" ? constellation ?? 0 : refinement ?? 1)}
                      onValueChange={(value) => updateLevel(row.name, value)}
                    >
                      <SelectTrigger
                        className="mt-2 h-7 w-full text-[11px]"
                        aria-label={`${row.name} ${kind === "character" ? "constellation" : "refinement"} level`}
                        data-testid={`inventory-${kind}-level-${row.name.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(kind === "character"
                          ? [0, 1, 2, 3, 4, 5, 6]
                          : [1, 2, 3, 4, 5]
                        ).map((level) => (
                          <SelectItem key={level} value={String(level)}>
                            {kind === "character" ? `C${level}` : `R${level}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function InventoryPage() {
  const { ownedChars, ownedWeapons } = useInventory();
  const { toast } = useToast();
  const importInputRef = React.useRef<HTMLInputElement>(null);

  const charRows = React.useMemo(
    () => getCharacterNames().map(buildCharRow),
    []
  );
  const weapRows = React.useMemo(
    () => getAllWeaponNames().map(buildWeapRow),
    []
  );

  const handleGoodImport = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const result = importGoodInventory(await file.text());
      const unknown =
        result.unknownCharacters.length + result.unknownWeapons.length;
      toast({
        title: "GOOD inventory imported",
        description: `${result.charactersImported} characters and ${result.weaponsImported} weapons added${unknown ? `; ${unknown} entries were not recognized` : ""}.`,
      });
    } catch (error) {
      toast({
        title: "Import failed",
        description:
          error instanceof Error ? error.message : "The selected file could not be read.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative isolate min-h-[100dvh] w-full overflow-hidden p-4 md:p-8">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(8, 12, 24, 0.82) 0%, rgba(8, 12, 24, 0.92) 46%, rgba(8, 12, 24, 0.97) 100%), url(${mondstadtBackground})`,
        }}
      />
      <div className="relative z-0 max-w-[1600px] mx-auto">
        <header className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2 tracking-tight">
              My Inventory
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Mark the characters and weapons you own. Use the "Owned only" filter in a character or weapon browser to view your collection.
            </p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-2">
            <input
              ref={importInputRef}
              type="file"
              accept=".json,.good,application/json"
              className="hidden"
              onChange={handleGoodImport}
              data-testid="good-import-input"
            />
            <Button
              variant="default"
              onClick={() => importInputRef.current?.click()}
              data-testid="import-good"
            >
              Import GOOD
            </Button>
            <Link href="/">
              <Button variant="outline" data-testid="link-back-to-builder">
                Back to Builder
              </Button>
            </Link>
          </div>
        </header>

        <Card className="bg-card border-card-border shadow-lg">
          <CardHeader>
            <CardTitle>Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="characters">
              <TabsList>
                <TabsTrigger value="characters" data-testid="tab-inventory-characters">
                  Characters ({ownedChars.size})
                </TabsTrigger>
                <TabsTrigger value="weapons" data-testid="tab-inventory-weapons">
                  Weapons ({ownedWeapons.size})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="characters" className="mt-4">
                <InventoryGrid
                  kind="character"
                  rows={charRows}
                  ownedSet={ownedChars}
                />
              </TabsContent>
              <TabsContent value="weapons" className="mt-4">
                <InventoryGrid
                  kind="weapon"
                  rows={weapRows}
                  ownedSet={ownedWeapons}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
