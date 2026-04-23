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
} from "@/lib/inventory";

type Kind = "character" | "weapon";

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
            return (
              <button
                key={row.name}
                type="button"
                onClick={() => toggleOne(row.name, !owned)}
                aria-pressed={owned}
                data-testid={`inventory-${kind}-card-${row.name.toLowerCase().replace(/\s+/g, "-")}`}
                className={cn(
                  "group relative flex flex-col items-center gap-2 rounded-lg border p-2 text-left transition-all",
                  owned
                    ? "border-primary bg-primary/10 hover:bg-primary/15"
                    : "border-border bg-card/50 opacity-70 hover:opacity-100 hover:border-border/80"
                )}
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
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function InventoryPage() {
  const { ownedChars, ownedWeapons } = useInventory();

  const charRows = React.useMemo(
    () => getCharacterNames().map(buildCharRow),
    []
  );
  const weapRows = React.useMemo(
    () => getAllWeaponNames().map(buildWeapRow),
    []
  );

  return (
    <div className="min-h-[100dvh] w-full bg-background p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        <header className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2 tracking-tight">
              My Inventory
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Mark the characters and weapons you own. Use the "Owned only" toggle on the builder to filter pickers to your collection.
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" data-testid="link-back-to-builder">
              Back to Builder
            </Button>
          </Link>
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
