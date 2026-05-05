import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import type { TeamState } from "@/lib/teamState";
import {
  computeNearMissHints,
  elementColor,
  evaluateSynergies,
  type EvaluatedSynergy,
} from "@/lib/synergies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CollapsibleSection } from "@/components/CollapsibleSection";

interface TeamSynergyPanelProps {
  team: TeamState;
}

const ElementBadge = ({ element }: { element: string }) => {
  const color = elementColor(element);
  return (
    <Badge
      variant="outline"
      style={{ borderColor: color, color }}
      className="text-[10px] px-1.5 py-0 h-5"
    >
      {element}
    </Badge>
  );
};

const SynergyCard = ({ entry }: { entry: EvaluatedSynergy }) => {
  const { rule, match } = entry;
  return (
    <div
      className="bg-secondary/30 border border-border/50 rounded-md p-3 space-y-2"
      data-testid={`synergy-card-${rule.id}`}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="font-semibold text-foreground">{rule.name}</span>
          {rule.elements.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {rule.elements.map((el) => (
                <ElementBadge key={el} element={el} />
              ))}
            </div>
          )}
          {rule.kind === "named" && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-5 bg-secondary/60"
              title="Community-curated cross-character synergy"
            >
              Synergy
            </Badge>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {rule.description}
      </p>
      <div className="flex flex-wrap gap-1 pt-1">
        {match.contributingCharacters.map((name) => (
          <span
            key={name}
            className="text-[10px] px-1.5 py-0.5 rounded bg-card border border-border/50 text-muted-foreground"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
};

export default function TeamSynergyPanel({ team }: TeamSynergyPanelProps) {
  const triggered = useMemo(() => evaluateSynergies(team), [team]);
  const hints = useMemo(() => computeNearMissHints(team), [team]);
  const anyCharactersPicked = team.some((s) => s.characterName);

  // Order: elemental resonances first, then named synergies, preserving the
  // registry order within each group so the layout is predictable.
  const elemental = triggered.filter((t) => t.rule.kind === "elemental");
  const named = triggered.filter((t) => t.rule.kind === "named");

  return (
    <Card
      className="mb-6 bg-card border-card-border shadow-lg"
      data-testid="team-synergy-panel"
    >
      <CardHeader className="pb-3">
        <CollapsibleSection
          id="team-synergies"
          title={
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden />
              Team Synergies
              {triggered.length > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-secondary/60 text-[10px] px-1.5 py-0 h-5"
                >
                  {triggered.length}
                </Badge>
              )}
            </span>
          }
          defaultOpen
          testId="section-team-synergies"
        >
          <CardTitle className="sr-only">Team Synergies</CardTitle>
          <CardContent className="px-0 pt-3 pb-0">
            {!anyCharactersPicked ? (
              <p className="text-sm text-muted-foreground">
                Pick characters to see team synergies.
              </p>
            ) : triggered.length === 0 && hints.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No party-wide synergies triggered yet.
              </p>
            ) : (
              <div className="space-y-3">
                {elemental.length > 0 && (
                  <div className="space-y-2">
                    {elemental.map((entry) => (
                      <SynergyCard key={entry.rule.id} entry={entry} />
                    ))}
                  </div>
                )}
                {named.length > 0 && (
                  <div className="space-y-2">
                    {named.map((entry) => (
                      <SynergyCard key={entry.rule.id} entry={entry} />
                    ))}
                  </div>
                )}
                {hints.length > 0 && (
                  <p
                    className="text-xs text-muted-foreground italic pt-1"
                    data-testid="team-synergy-hints"
                  >
                    {hints.map((h) => h.message).join(" · ")}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleSection>
      </CardHeader>
    </Card>
  );
}
