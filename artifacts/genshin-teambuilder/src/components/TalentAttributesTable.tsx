import * as React from "react";

// genshin-db talent attributes have the shape:
//   labels:     ["Slashing DMG|{param1:P}", "CD|{param4:F1}s", ...]
//   parameters: { param1: number[15], param2: number[15], ... }
// Each parameter array has 15 entries — talent levels 1..15. We render a
// compact table at the most useful level breakpoints (1, 6, 9, 13) so users
// can compare base vs leveled vs constellation-boosted output without us
// needing to track per-talent integer levels in team state.

type TalentAttributes = {
  labels?: string[];
  parameters?: Record<string, number[]>;
};

interface TalentAttributesTableProps {
  attributes: TalentAttributes | undefined;
  testId?: string;
}

// Levels at the array index (0-indexed) we want to surface as columns.
// Lv 1 = base, Lv 6 = mid-game, Lv 9 = standard end-game cap (10 - 1
// because 0-indexed → array[8]), Lv 13 = max with C3+C5 boosts.
const LEVEL_COLUMNS: Array<{ label: string; index: number }> = [
  { label: "Lv 1", index: 0 },
  { label: "Lv 6", index: 5 },
  { label: "Lv 9", index: 8 },
  { label: "Lv 13", index: 12 },
];

const PARAM_TOKEN = /\{(param\d+):([^}]*)\}/g;

// Format a single numeric parameter according to genshin-db's spec syntax.
// Known specs observed in the data:
//   P            -> percent, 0 decimals  (multiply by 100, append %)
//   P1, P2       -> percent, N decimals
//   F1, F2       -> fixed decimal
//   F1P, F2P     -> percent with N decimals (compound spec)
//   I            -> integer (rounded)
//   (empty)      -> raw value
function formatTalentValue(raw: number, spec: string): string {
  if (raw == null || Number.isNaN(raw)) return "—";
  if (!spec) return String(raw);
  if (spec === "I") return Math.round(raw).toString();
  const isPercent = spec.includes("P");
  const fMatch = spec.match(/F(\d+)/);
  const pMatch = spec.match(/P(\d+)/);
  const decimals = pMatch
    ? parseInt(pMatch[1], 10)
    : fMatch
      ? parseInt(fMatch[1], 10)
      : isPercent
        ? 0
        : 1;
  if (isPercent) return `${(raw * 100).toFixed(decimals)}%`;
  return raw.toFixed(decimals);
}

// Substitute every {paramN:spec} token in `tail` with its formatted value
// at the given level index. Tokens that point at missing parameters render
// as "?" so a malformed label is visible rather than silently empty.
function renderTail(
  tail: string,
  parameters: Record<string, number[]>,
  levelIdx: number,
): string {
  return tail.replace(PARAM_TOKEN, (_match, key: string, spec: string) => {
    const arr = parameters[key];
    if (!arr || arr.length === 0) return "?";
    const v = arr[Math.min(levelIdx, arr.length - 1)];
    if (v == null) return "?";
    return formatTalentValue(v, spec);
  });
}

type ParsedRow = { name: string; tail: string };

// Split "Slashing DMG|{param1:P}" into { name: "Slashing DMG", tail: "{param1:P}" }.
// Labels without a "|" (rare; usually in passives) are rendered name-only.
function parseLabels(labels: string[]): ParsedRow[] {
  return labels.map((label) => {
    const pipe = label.indexOf("|");
    if (pipe === -1) return { name: label, tail: "" };
    return { name: label.slice(0, pipe), tail: label.slice(pipe + 1) };
  });
}

export default function TalentAttributesTable({
  attributes,
  testId,
}: TalentAttributesTableProps) {
  const labels = attributes?.labels;
  const parameters = attributes?.parameters;
  if (!labels || labels.length === 0 || !parameters) return null;

  const rows = parseLabels(labels);

  return (
    <div className="mt-3 overflow-x-auto" data-testid={testId}>
      <table className="w-full text-[11px] border-collapse">
        <thead>
          <tr className="text-muted-foreground">
            <th className="text-left font-medium pr-2 pb-1 border-b border-border/50">
              Attribute
            </th>
            {LEVEL_COLUMNS.map((col) => (
              <th
                key={col.label}
                className="text-right font-medium px-2 pb-1 border-b border-border/50"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="text-foreground/90">
              <td className="text-left pr-2 py-1 border-b border-border/30 align-top">
                {row.name}
              </td>
              {LEVEL_COLUMNS.map((col) => (
                <td
                  key={col.label}
                  className="text-right px-2 py-1 border-b border-border/30 tabular-nums whitespace-nowrap"
                >
                  {row.tail
                    ? renderTail(row.tail, parameters, col.index)
                    : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[10px] text-muted-foreground mt-1">
        Lv 13 is reachable with constellation boosts (C3 / C5 +3 levels).
      </p>
    </div>
  );
}
