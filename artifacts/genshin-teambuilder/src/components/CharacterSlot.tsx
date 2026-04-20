import { useMemo } from "react";
import { Star, ExternalLink } from "lucide-react";
import type { SlotState, LevelableTalentKey } from "@/lib/teamState";
import { LEVELABLE_TALENT_KEYS, defaultSlot } from "@/lib/teamState";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchableSelect } from "@/components/SearchableSelect";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getCharacterNames,
  getEffectiveCharacterData,
  getTalentData,
  getConstellationData,
  getWeaponNamesByType,
  getAllWeaponNames,
  getWeaponData,
  getArtifactData,
  getCharacterIcon,
  getWeaponIcon,
  getArtifactIcon,
  ARTIFACT_NAMES,
  ELEMENT_COLORS,
  MAIN_STATS,
  stripHtml,
} from "@/lib/genshin";

interface CharacterSlotProps {
  slotIndex: number;
  state: SlotState;
  onChange: (updater: (prev: SlotState) => SlotState) => void;
}

const TALENT_KEYS = ["combat1", "combat2", "combat3", "passive1", "passive2", "passive3"] as const;
const CONST_KEYS = ["c1", "c2", "c3", "c4", "c5", "c6"] as const;

export default function CharacterSlot({ slotIndex, state, onChange }: CharacterSlotProps) {
  const {
    characterName,
    constellation,
    weaponName,
    artifactMode,
    artifactSet1,
    artifactSet2,
    sandsMain,
    gobletMain,
    circletMain,
    leveledTalents,
  } = state;

  // Always use functional updates so multiple setters in one event don't clobber each other.
  const update = (patch: Partial<SlotState>) => onChange((prev) => ({ ...prev, ...patch }));
  const setCharacterName = (v: string | null) => update({ characterName: v });
  const setConstellation = (v: number) => update({ constellation: v });
  const setWeaponName = (v: string | null) => update({ weaponName: v });
  const setArtifactMode = (v: "4pc" | "2pc") => update({ artifactMode: v });
  const setArtifactSet1 = (v: string | null) => update({ artifactSet1: v });
  const setArtifactSet2 = (v: string | null) => update({ artifactSet2: v });
  const setSandsMain = (v: string) => update({ sandsMain: v });
  const setGobletMain = (v: string) => update({ gobletMain: v });
  const setCircletMain = (v: string) => update({ circletMain: v });
  const toggleLeveledTalent = (key: LevelableTalentKey) =>
    onChange((prev) => {
      const has = prev.leveledTalents.includes(key);
      return {
        ...prev,
        leveledTalents: has
          ? prev.leveledTalents.filter((k) => k !== key)
          : [...prev.leveledTalents, key],
      };
    });

  const characterOptions = useMemo(() => getCharacterNames(), []);

  const charData = useMemo(
    () => (characterName ? getEffectiveCharacterData(characterName) : null),
    [characterName]
  );

  const talentData = useMemo(
    () => (characterName ? getTalentData(characterName) : null),
    [characterName]
  );

  const constellationData = useMemo(
    () => (characterName ? getConstellationData(characterName) : null),
    [characterName]
  );

  const weaponOptions = useMemo(() => {
    if (!charData) return getAllWeaponNames();
    return getWeaponNamesByType(charData.weaponType);
  }, [charData]);

  const weaponData = useMemo(
    () => (weaponName ? getWeaponData(weaponName) : null),
    [weaponName]
  );

  const artSet1Data = useMemo(
    () => (artifactSet1 ? getArtifactData(artifactSet1) : null),
    [artifactSet1]
  );

  const artSet2Data = useMemo(
    () => (artifactSet2 ? getArtifactData(artifactSet2) : null),
    [artifactSet2]
  );

  const handleCharacterChange = (name: string) => {
    // Selecting a different character resets every other field on this slot
    // (weapon, constellation, artifacts, mainstats, talent stars). Same
    // character re-selected is a no-op so we don't wipe accidental clicks.
    if (name === characterName) return;
    onChange(() => ({ ...defaultSlot(), characterName: name }));
  };

  const renderStars = (rarity: number) =>
    Array.from({ length: rarity }, () => "★").join("");

  const elementColor = charData ? (ELEMENT_COLORS[charData.elementText] ?? "#888") : "hsl(var(--muted))";

  return (
    <Card
      className="h-full flex flex-col bg-card border-card-border overflow-hidden shadow-lg"
      data-testid={`character-slot-${slotIndex}`}
    >
      <div className="h-2 w-full" style={{ backgroundColor: elementColor }} />

      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center justify-between">
          <span>Slot {slotIndex}</span>
          {charData && (
            <Badge
              variant="outline"
              style={{ borderColor: elementColor, color: elementColor }}
            >
              {charData.elementText}
            </Badge>
          )}
        </CardTitle>
        <SearchableSelect
          options={characterOptions}
          value={characterName}
          onChange={handleCharacterChange}
          placeholder="Select Character..."
          testId={`select-character-${slotIndex}`}
          getIcon={getCharacterIcon}
        />
      </CardHeader>

      <ScrollArea className="flex-1 px-6 pb-6">
        {charData ? (
          <div className="space-y-6">
            {/* Character Portrait */}
            {characterName && getCharacterIcon(characterName) && (
              <div className="flex items-center gap-3">
                <img
                  src={getCharacterIcon(characterName) ?? ""}
                  alt={characterName}
                  className="h-16 w-16 rounded-md object-cover bg-secondary/30 border border-border/50"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="min-w-0">
                  <div className="font-semibold text-foreground truncate">
                    {charData.name}
                  </div>
                  <div className="text-xs text-yellow-500">
                    {renderStars(charData.rarity)}
                  </div>
                  {(() => {
                    // KQM quick-guide URLs follow `/q/<slug>-quickguide/`,
                    // e.g. Aino → /q/aino-quickguide/. Slugify on the full
                    // character name; if KQM doesn't have that exact page
                    // their 404 surfaces a search box for easy navigation.
                    const slug = charData.name
                      .toLowerCase()
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-+|-+$/g, "");
                    const href = `https://keqingmains.com/q/${slug}-quickguide/`;
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary hover:underline transition-colors"
                        title="Open KeqingMains quick guide in a new tab"
                        data-testid={`link-kqm-${slotIndex}`}
                      >
                        KQM guide
                        <ExternalLink className="h-3 w-3" aria-hidden />
                      </a>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Character Info */}
            <CollapsibleSection
              id={`slot-${slotIndex}-character-info`}
              title="Character Info"
              defaultOpen
              testId={`section-character-info-${slotIndex}`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Weapon Type</span>
                  <span className="font-medium text-foreground">{charData.weaponText}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Rarity</span>
                  <span className="font-medium text-yellow-500">{renderStars(charData.rarity)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Ascension Stat</span>
                  <span className="font-medium text-foreground">
                    {charData.substatText ?? "HP"}
                  </span>
                </div>
              </div>
            </CollapsibleSection>

            <Separator className="bg-border/50" />

            {/* Constellations */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-primary">Constellation</h3>
                <Badge variant="secondary" className="bg-secondary/50">
                  C{constellation}
                </Badge>
              </div>
              <Slider
                value={[constellation]}
                max={6}
                step={1}
                onValueChange={(vals) => setConstellation(vals[0])}
                className="py-2"
                data-testid={`slider-constellation-${slotIndex}`}
              />
              {constellation > 0 && constellationData && (
                <CollapsibleSection
                  id={`slot-${slotIndex}-constellation-details`}
                  title="Constellation Details"
                  testId={`section-constellation-details-${slotIndex}`}
                >
                  <div className="text-sm space-y-2 bg-secondary/30 p-3 rounded-md border border-border/50">
                    {CONST_KEYS.slice(0, constellation).map((key, i) => {
                      const cData = constellationData[key] as { name?: string; description?: string } | undefined;
                      if (!cData) return null;
                      return (
                        <div key={key}>
                          <span className="font-semibold text-foreground mr-2">C{i + 1}: {cData.name}</span>
                          <span className="text-muted-foreground text-xs leading-relaxed block mt-1">
                            {stripHtml(cData.description ?? "")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleSection>
              )}
            </div>

            <Separator className="bg-border/50" />

            {/* Talents */}
            <CollapsibleSection
              id={`slot-${slotIndex}-talents`}
              title="Talents"
              testId={`section-talents-${slotIndex}`}
            >
              {talentData ? (
                <Accordion type="multiple" className="w-full text-sm">
                  {TALENT_KEYS.map((talentKey) => {
                    const tData = talentData[talentKey] as { name?: string; description?: string } | undefined;
                    if (!tData || !tData.name) return null;
                    const isLevelable = (LEVELABLE_TALENT_KEYS as readonly string[]).includes(talentKey);
                    const isLeveled =
                      isLevelable &&
                      leveledTalents.includes(talentKey as LevelableTalentKey);
                    return (
                      <AccordionItem value={talentKey} key={talentKey} className="border-border/50">
                        <div className="flex items-center gap-1">
                          {isLevelable ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleLeveledTalent(talentKey as LevelableTalentKey);
                              }}
                              aria-pressed={isLeveled}
                              aria-label={
                                isLeveled
                                  ? `Unmark ${tData.name} as a level priority`
                                  : `Mark ${tData.name} as a level priority`
                              }
                              title={
                                isLeveled
                                  ? "Marked to level — click to unmark"
                                  : "Mark this talent to level"
                              }
                              className={cn(
                                "shrink-0 p-1 rounded hover:bg-secondary/50 transition-colors",
                                isLeveled
                                  ? "text-yellow-500"
                                  : "text-muted-foreground/40 hover:text-yellow-500/70",
                              )}
                              data-testid={`talent-star-${slotIndex}-${talentKey}`}
                            >
                              <Star
                                className="h-4 w-4"
                                fill={isLeveled ? "currentColor" : "none"}
                                aria-hidden
                              />
                            </button>
                          ) : (
                            <span className="w-6 shrink-0" aria-hidden />
                          )}
                          <AccordionTrigger className="hover:no-underline py-2 text-muted-foreground hover:text-foreground transition-colors flex-1">
                            <span className="truncate pr-4 text-left">{tData.name}</span>
                          </AccordionTrigger>
                        </div>
                        <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                          {stripHtml(tData.description ?? "")}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              ) : (
                <p className="text-xs text-muted-foreground">No talent data available.</p>
              )}
            </CollapsibleSection>

            <Separator className="bg-border/50" />

            {/* Weapons */}
            <div className="space-y-4">
              <h3 className="font-semibold text-primary">Weapon</h3>
              <SearchableSelect
                options={weaponOptions}
                value={weaponName}
                onChange={setWeaponName}
                placeholder="Select Weapon..."
                testId={`select-weapon-${slotIndex}`}
                getIcon={getWeaponIcon}
              />
              {weaponData && (
                <CollapsibleSection
                  id={`slot-${slotIndex}-weapon-details`}
                  title="Weapon Details"
                  testId={`section-weapon-details-${slotIndex}`}
                >
                  <div className="text-sm space-y-2 bg-secondary/30 p-3 rounded-md border border-border/50">
                    <div className="flex items-center gap-3">
                      {getWeaponIcon(weaponData.name) && (
                        <img
                          src={getWeaponIcon(weaponData.name) ?? ""}
                          alt={weaponData.name}
                          className="h-12 w-12 rounded object-cover bg-secondary/30 shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0 flex justify-between items-center">
                        <span className="font-medium text-foreground truncate">{weaponData.name}</span>
                        <span className="text-yellow-500 ml-2">{renderStars(weaponData.rarity)}</span>
                      </div>
                    </div>
                    {weaponData.mainStatText && (
                      <div className="text-xs text-muted-foreground">
                        <span>{weaponData.mainStatText}</span>
                      </div>
                    )}
                    {weaponData.effectName && weaponData.r1 && (
                      <div className="pt-2 mt-2 border-t border-border/50">
                        <span className="font-semibold text-foreground text-xs block mb-1">
                          {weaponData.effectName}
                        </span>
                        <span className="text-xs text-muted-foreground block leading-relaxed">
                          {stripHtml((weaponData.r1 as { description?: string }).description ?? "")}
                        </span>
                      </div>
                    )}
                  </div>
                </CollapsibleSection>
              )}
            </div>

            <Separator className="bg-border/50" />

            {/* Artifact Mainstats */}
            <div className="space-y-4">
              <h3 className="font-semibold text-primary">Artifact Mainstats</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                  <Label className="text-xs text-muted-foreground text-right">Sands</Label>
                  <Select value={sandsMain} onValueChange={setSandsMain}>
                    <SelectTrigger className="h-8 text-xs bg-card" data-testid={`select-sands-${slotIndex}`}>
                      <SelectValue placeholder="Select Stat" />
                    </SelectTrigger>
                    <SelectContent>
                      {MAIN_STATS.Sands.map((stat) => (
                        <SelectItem key={stat} value={stat}>{stat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                  <Label className="text-xs text-muted-foreground text-right">Goblet</Label>
                  <Select value={gobletMain} onValueChange={setGobletMain}>
                    <SelectTrigger className="h-8 text-xs bg-card" data-testid={`select-goblet-${slotIndex}`}>
                      <SelectValue placeholder="Select Stat" />
                    </SelectTrigger>
                    <SelectContent>
                      {MAIN_STATS.Goblet.map((stat) => (
                        <SelectItem key={stat} value={stat}>{stat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                  <Label className="text-xs text-muted-foreground text-right">Circlet</Label>
                  <Select value={circletMain} onValueChange={setCircletMain}>
                    <SelectTrigger className="h-8 text-xs bg-card" data-testid={`select-circlet-${slotIndex}`}>
                      <SelectValue placeholder="Select Stat" />
                    </SelectTrigger>
                    <SelectContent>
                      {MAIN_STATS.Circlet.map((stat) => (
                        <SelectItem key={stat} value={stat}>{stat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Artifact Sets */}
            <div className="space-y-4">
              <h3 className="font-semibold text-primary">Artifact Sets</h3>
              <RadioGroup
                value={artifactMode}
                onValueChange={(val) => {
                  setArtifactMode(val as "4pc" | "2pc");
                  if (val === "4pc") setArtifactSet2(null);
                }}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="4pc" id={`r1-${slotIndex}`} data-testid={`radio-4pc-${slotIndex}`} />
                  <Label htmlFor={`r1-${slotIndex}`} className="text-sm">4-Piece</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2pc" id={`r2-${slotIndex}`} data-testid={`radio-2pc-${slotIndex}`} />
                  <Label htmlFor={`r2-${slotIndex}`} className="text-sm">2x 2-Piece</Label>
                </div>
              </RadioGroup>

              <div className="space-y-3">
                <SearchableSelect
                  options={ARTIFACT_NAMES}
                  value={artifactSet1}
                  onChange={setArtifactSet1}
                  placeholder={
                    artifactMode === "4pc" ? "Select 4-Piece Set..." : "Select 1st 2-Piece Set..."
                  }
                  testId={`select-art1-${slotIndex}`}
                  getIcon={(n) => getArtifactIcon(n)}
                />
                {artifactMode === "2pc" && (
                  <SearchableSelect
                    options={ARTIFACT_NAMES}
                    value={artifactSet2}
                    onChange={setArtifactSet2}
                    placeholder="Select 2nd 2-Piece Set..."
                    testId={`select-art2-${slotIndex}`}
                    getIcon={(n) => getArtifactIcon(n)}
                  />
                )}
              </div>

              {(artSet1Data || artSet2Data) && (
                <CollapsibleSection
                  id={`slot-${slotIndex}-set-bonuses`}
                  title="Set Bonuses"
                  testId={`section-set-bonuses-${slotIndex}`}
                >
                  <div className="text-sm space-y-2 bg-secondary/30 p-3 rounded-md border border-border/50">
                    {artifactMode === "4pc" && artSet1Data && (
                      <>
                        {artSet1Data.effect2Pc && (
                          <div>
                            <span className="font-semibold text-foreground text-xs">2-Piece:</span>
                            <span className="text-xs text-muted-foreground block leading-relaxed">
                              {artSet1Data.effect2Pc}
                            </span>
                          </div>
                        )}
                        {artSet1Data.effect4Pc && (
                          <div className="mt-2">
                            <span className="font-semibold text-foreground text-xs">4-Piece:</span>
                            <span className="text-xs text-muted-foreground block leading-relaxed">
                              {artSet1Data.effect4Pc}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    {artifactMode === "2pc" && (
                      <>
                        {artSet1Data?.effect2Pc && (
                          <div>
                            <span className="font-semibold text-foreground text-xs">
                              2-Piece ({artSet1Data.name}):
                            </span>
                            <span className="text-xs text-muted-foreground block leading-relaxed">
                              {artSet1Data.effect2Pc}
                            </span>
                          </div>
                        )}
                        {artSet2Data?.effect2Pc && (
                          <div className="mt-2">
                            <span className="font-semibold text-foreground text-xs">
                              2-Piece ({artSet2Data.name}):
                            </span>
                            <span className="text-xs text-muted-foreground block leading-relaxed">
                              {artSet2Data.effect2Pc}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CollapsibleSection>
              )}
            </div>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed border-border rounded-lg mt-4">
            Select a character to view details
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
