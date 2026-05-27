import { useEffect, useState } from "react";
import CharacterSlot from "@/components/CharacterSlot";
import TeamToolbar from "@/components/TeamToolbar";
import {
  type TeamState,
  type SlotState,
  defaultTeam,
  decodeTeam,
} from "@/lib/teamState";

export default function Home() {
  const [team, setTeam] = useState<TeamState>(defaultTeam);

  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/^#team=(.+)$/);
    if (match) {
      const decoded = decodeTeam(match[1]);
      if (decoded) setTeam(decoded);
    }
  }, []);

  const updateSlot = (index: number, updater: (prev: SlotState) => SlotState) => {
    setTeam((prev) => {
      const next = [...prev] as TeamState;
      next[index] = updater(prev[index]);
      return next;
    });
  };

  return (
    <div className="min-h-[100dvh] w-full bg-background p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        <header className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2 tracking-tight">
              Genshin Team Builder
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Plan your ultimate party. Select characters, weapons, and artifacts.
            </p>
          </div>
          <TeamToolbar team={team} onLoad={setTeam} />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {team.map((slot, i) => (
            <CharacterSlot
              key={i}
              slotIndex={i + 1}
              state={slot}
              onChange={(updater) => updateSlot(i, updater)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
