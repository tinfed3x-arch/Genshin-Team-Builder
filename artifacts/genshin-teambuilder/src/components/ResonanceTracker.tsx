import type { TeamState } from "@/lib/teamState";
import { getActiveResonances, type Resonance } from "@/lib/resonance";
import { Zap } from "lucide-react";

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

export default function ResonanceTracker({ team }: ResonanceTrackerProps) {
  const resonances = getActiveResonances(team);

  if (resonances.length === 0) {
    return (
      <div className="rounded-lg border border-border/40 bg-secondary/20 px-4 py-3">
        <p className="text-sm text-muted-foreground">
          Select at least 2 characters with matching elements to see active resonances.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <Zap className="h-4 w-4 text-yellow-500" />
        <span className="text-sm font-semibold text-foreground">
          Active Resonances ({resonances.length})
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {resonances.map((r) => (
          <ResonanceBadge key={r.id} resonance={r} />
        ))}
      </div>
    </div>
  );
}
