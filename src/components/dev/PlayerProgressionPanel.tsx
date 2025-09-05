import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { updatePlayerDevelopmentForSeason, Player, SeasonStats, LeagueContext, ProgressionChange } from "@/lib/playerDevelopment";

type Props = {
  players: Player[];
  statsById: Record<string, SeasonStats>;
  context?: LeagueContext;
  onApply?: (updated: Player[], changes: ProgressionChange[]) => void;
};

const Delta = ({ n }: { n: number }) => (
  <span className={n >= 0 ? "text-emerald-600 font-semibold" : "text-red-500 font-semibold"}>
    {n >= 0 ? `+${n}` : `${n}`}
  </span>
);

export default function PlayerProgressionPanel({ players, statsById, context, onApply }: Props) {
  const [changes, setChanges] = React.useState<ProgressionChange[] | null>(null);

  const run = () => {
    // deep copy so preview doesn't mutate if user cancels
    const clone: Player[] = JSON.parse(JSON.stringify(players));
    const res = updatePlayerDevelopmentForSeason(clone, statsById, context);
    setChanges(res);
  };

  const commit = () => {
    if (!changes) return;
    // If you keep players in higher-level state/store, call onApply with mutated roster
    const mutated = JSON.parse(JSON.stringify(players)) as Player[];
    updatePlayerDevelopmentForSeason(mutated, statsById, context);
    onApply?.(mutated, changes);
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Season Progression</h2>
        <div className="space-x-2">
          <Button variant="outline" onClick={run}>Preview Changes</Button>
          <Button onClick={commit} disabled={!changes}>Apply Progression</Button>
        </div>
      </div>

      {!changes && (
        <p className="text-sm text-muted-foreground">
          Click <strong>Preview Changes</strong> to see player growth/decline before applying.
        </p>
      )}

      {changes && (
        <div className="max-h-96 overflow-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-muted sticky top-0">
              <tr>
                <th className="text-left p-3 font-medium">Player</th>
                <th className="text-left p-3 font-medium">Before</th>
                <th className="text-left p-3 font-medium">After</th>
                <th className="text-left p-3 font-medium">Change</th>
                <th className="text-left p-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {changes
                .sort((a, b) => b.deltaOverall - a.deltaOverall)
                .map((c) => (
                  <tr key={c.id} className="border-t hover:bg-muted/50">
                    <td className="p-3 font-medium">{c.name}</td>
                    <td className="p-3">{c.beforeOverall}</td>
                    <td className="p-3">{c.afterOverall}</td>
                    <td className="p-3"><Delta n={c.deltaOverall} /></td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {c.notes.join(", ") || "—"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
