import type { TeamState } from "@/lib/teamState";
import {
  getActiveResonances,
  getHexereiStatus,
  getMoonsignStatus,
  type Resonance,
  type TeamBonusStatus,
} from "@/lib/resonance";
import { Moon, Sparkles, Zap } from "lucide-react";

interface ResonanceTrackerProps {
  team: TeamState;
}

function ResonanceBadge({ resonance }: { resonance: Resonance }) {
  return (
    <div
      className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-secondary/40 px-3 py-2.5"
      style={{ borderLeftColor: resonance.iconColor, borderLeftWidth: "3px" }}
    >
      <Zap
        className="mt-0.5 h-4 w-4 shrink-0"
        style={{ color: resonance.iconColor }}
      />
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground leading-tight">
          {resonance.name}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
          {resonance.description}
        </p>
      </div>
    </div>
  );
}

function TeamBonusBadge({
  bonus,
  icon: Icon,
}: {
  bonus: TeamBonusStatus;
  icon: typeof Moon;
}) {
  return (
    <div
      className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 ${
        bonus.active
          ? "border-border/60 bg-secondary/40"
          : "border-border/40 bg-secondary/20 opacity-80"
      }`}
      style={{ borderLeftColor: bonus.iconColor, borderLeftWidth: "3px" }}
    >
      <Icon
        className="mt-0.5 h-4 w-4 shrink-0"
        style={{ color: bonus.iconColor }}
      />
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground leading-tight">
            {bonus.name}
          </p>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {bonus.count}/2
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
          {bonus.description}
        </p>
        {bonus.members.length > 0 && (
          <p className="text-[10px] text-muted-foreground/80 leading-relaxed mt-1">
            {bonus.active ? "Contributing: " : "Detected: "}
            {bonus.members.join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ResonanceTracker({ team }: ResonanceTrackerProps) {
  const resonances = getActiveResonances(team);
  const moonsign = getMoonsignStatus(team);
  const hexerei = getHexereiStatus(team);
  const hasTeamBonuses = moonsign.count > 0 || hexerei.count > 0;

  if (resonances.length === 0 && !hasTeamBonuses) {
    return (
      <div className="rounded-lg border border-border/40 bg-secondary/20 px-4 py-3">
        <p className="text-sm text-muted-foreground">
          Select at least 2 characters with matching elements to see active resonances.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Zap className="h-4 w-4 text-yellow-500" />
        <span className="text-sm font-semibold text-foreground">
          Team Bonuses
        </span>
      </div>
      {hasTeamBonuses && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {moonsign.count > 0 && (
            <TeamBonusBadge bonus={moonsign} icon={Moon} />
          )}
          {hexerei.count > 0 && (
            <TeamBonusBadge bonus={hexerei} icon={Sparkles} />
          )}
        </div>
      )}
      {resonances.length > 0 && (
        <div className="text-xs font-semibold text-muted-foreground">
          Elemental Resonances ({resonances.length})
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {resonances.map((r) => (
          <ResonanceBadge key={r.id} resonance={r} />
        ))}
      </div>
    </div>
  );
}
