import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Timer, Check, X } from "lucide-react";

import type { LeagueState, UID } from "../../lib/salary-cap";
import { CapManager, fmtMoney } from "../../lib/salary-cap";
import type { FreeAgencyState, FreeAgencyEngine } from "./FreeAgencyEngine";

// -----------------------------------------------------------------------------
// FreeAgencySimControls
// - One-click "Sim One FA Day"
// - Resolves offer-sheet deadlines
// - Auto-signs depth UFAs on minimum deals for teams that need bodies
// - Shows a tiny log of what happened
// -----------------------------------------------------------------------------

type Props = {
  league: LeagueState;
  state: FreeAgencyState;
  engine: FreeAgencyEngine;
  minRosterTarget?: number;  // default 20
  maxDepthSigningsPerTeam?: number; // default 2 per sim day
  leagueMinAAV?: number; // default 775_000
};

export default function FreeAgencySimControls({ league, state, engine, minRosterTarget = 20, maxDepthSigningsPerTeam = 2, leagueMinAAV = 775_000 }: Props) {
  const [log, setLog] = useState<string[]>([]);
  const cap = useMemo(() => new CapManager(league), [league]);

  const simOneDay = () => {
    const events: string[] = [];

    // 1) Advance FA deadlines (QOs + offer sheets)
    engine.advanceDay(state);
    events.push("Advanced FA day: processed QOs & offer sheets.");

    // 2) Auto-sign depth UFAs at minimum for teams that are under roster target
    const ufaList: UID[] = state.ufaPool.slice();
    const byNeed = Object.values(league.teams)
      .map((t: any) => ({ t, need: Math.max(0, minRosterTarget - t.activeRoster.length) }))
      .filter(x => x.need > 0)
      .sort((a,b)=> b.need - a.need);

    for (const entry of byNeed) {
      let signed = 0;
      const teamId = entry.t.id;
      for (const pid of ufaList) {
        if (signed >= maxDepthSigningsPerTeam) break;
        const p = league.players[pid];
        const ok = trySignUFA_MinDeal(league, state, teamId, pid, leagueMinAAV, cap, engine);
        if (ok) {
          events.push(`${league.teams[teamId].name} signed ${p.name} (min ${fmtMoney(leagueMinAAV)}).`);
          const idx = ufaList.indexOf(pid);
          if (idx !== -1) ufaList.splice(idx,1);
          signed++;
        }
      }
    }

    setLog(prev => [...events, ...prev].slice(0, 30));
  };

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold flex items-center gap-2"><Timer className="h-4 w-4"/>Sim Free Agency</div>
          <Badge variant="secondary">Day {league.dayIndex + 1}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button className="rounded-xl" onClick={simOneDay}>Sim One FA Day</Button>
        </div>
        {log.length > 0 && (
          <Alert className="rounded-xl">
            <AlertTitle>Events</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {log.map((l,i)=>(<li key={i}>{l}</li>))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

// -----------------------------------------------------------------------------
// Helper: try to sign a UFA to a minimum deal, applying cap/roster rules
// -----------------------------------------------------------------------------

function trySignUFA_MinDeal(league: LeagueState, state: FreeAgencyState, teamId: UID, playerId: UID, aav: number, cap: CapManager, engine: FreeAgencyEngine): boolean {
  const result = engine.signUFA(state, teamId, playerId, 1, aav);
  return result.ok;
}