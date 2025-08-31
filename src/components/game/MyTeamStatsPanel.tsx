// MyTeamStatsPanel.tsx
// ONE FILE: Plug-and-play panel that shows ONLY your team's season stats
// (record, GF/GA, PP%, FO%), skater + goalie tables, AND a post-game popup.
// It includes an adapter that reads directly from your existing SeasonState.

// ──────────────────────────────────────────────────────────────────────────────
// USAGE
// import MyTeamStatsPanel from "./MyTeamStatsPanel";
// ...
// <MyTeamStatsPanel state={state} myTeamId={userTeamId} lastGame={optionalLastGameBox} />
// where `state` is your Franchise/Season state, and `myTeamId` is the team you control.
// `lastGame` is optional; pass it right after a sim to auto-open the post-game modal.
// ──────────────────────────────────────────────────────────────────────────────

import React, { useMemo, useState } from "react";

type ID = string;

// === These types mirror the ones used in your franchise system ===
type Skater = {
  id: ID;
  name: string;
  position: "C" | "LW" | "RW" | "D";
  overall: number;
  shooting: number;
  passing: number;
  defense: number;
  stamina: number;
  // season stats
  gp: number;
  g: number;
  a: number;
  p: number;
  pim: number;
  shots: number;
  plusMinus: number;
  // optional: power play / short-handed goals (if you track them; else we show 0)
  ppG?: number;
  shG?: number;
};

type Goalie = {
  id: ID;
  name: string;
  position: "G";
  overall: number;
  reflexes: number;
  positioning: number;
  reboundControl: number;
  stamina: number;
  // season stats
  gp: number;
  gs: number;
  w: number;
  l: number;
  otl: number;
  so: number;
  shotsAgainst: number;
  saves: number;
  gaa: number;   // Goals Against Average (float)
  svpct: number; // Save % as decimal (e.g., 0.915)
};

type Team = {
  id: ID;
  name: string;
  abbrev: string;
  conference: "East" | "West";
  division?: string;
  // team season totals (kept up to date by your sim)
  w: number; l: number; otl: number;
  gf: number; ga: number;
  shotsFor: number; shotsAgainst: number;
  // optional special teams & faceoffs (if tracked; else leave undefined)
  ppAttempts?: number; ppGoals?: number;
  foWon?: number; foLost?: number;
  // rosters (used to gather player stats)
  skaters: Skater[];
  goalies: Goalie[];
};

type Game = {
  id: string;
  day: number;
  homeId: ID;
  awayId: ID;
  played: boolean;
  final?: { homeGoals: number; awayGoals: number; ot: boolean };
};

type BoxScore = any;

export type SeasonState = {
  seasonYear: string;
  currentDay: number;
  totalDays: number;
  schedule: Game[];
  boxScores: Record<string, BoxScore>;
  teams: Record<ID, Team>;
  teamOrder: ID[];
};

// === League adapter output (internal to this file) ===
type SkaterStats = {
  id: ID; name: string; teamId: ID; position: "C"|"LW"|"RW"|"D";
  gp: number; g: number; a: number; p: number; plusMinus: number; pim: number; shots: number; ppG: number; shG: number;
};
type GoalieStats = {
  id: ID; name: string; teamId: ID;
  gp: number; gs: number; w: number; l: number; otl: number; so: number; shotsAgainst: number; saves: number; gaa: number; svpct: number;
};
type TeamRow = Omit<Team, "skaters" | "goalies">;

type LeagueView = {
  teams: Record<ID, TeamRow>;
  skaterStats: SkaterStats[];
  goalieStats: GoalieStats[];
};

// === Optional "lastGame" payload to power the post-game popup ===
type LastGameBox = {
  opponentName: string;
  isHome: boolean;
  myGoals: number;
  oppGoals: number;
  dateLabel?: string;
  myPPG?: number; myPPA?: number; // power-play goals/attempts
  myShots?: number; oppShots?: number;
  threeStars?: { name: string; teamAbbrev: string; line: string }[];
};

// ──────────────────────────────────────────────────────────────────────────────
// ADAPTER: build a LeagueView from your SeasonState (no extra wiring required)
// ──────────────────────────────────────────────────────────────────────────────
function buildLeagueViewFromState(state: SeasonState): LeagueView {
  const teams: Record<ID, TeamRow> = {};
  const skaterStats: SkaterStats[] = [];
  const goalieStats: GoalieStats[] = [];

  for (const tid of Object.keys(state.teams)) {
    const t = state.teams[tid];

    // copy team row without rosters
    teams[tid] = {
      id: t.id,
      name: t.name,
      abbrev: t.abbrev,
      conference: t.conference,
      division: t.division,
      w: t.w ?? 0,
      l: t.l ?? 0,
      otl: t.otl ?? 0,
      gf: t.gf ?? 0,
      ga: t.ga ?? 0,
      shotsFor: t.shotsFor ?? 0,
      shotsAgainst: t.shotsAgainst ?? 0,
      ppAttempts: t.ppAttempts ?? 0,
      ppGoals: t.ppGoals ?? 0,
      foWon: t.foWon ?? 0,
      foLost: t.foLost ?? 0
    };

    // gather skaters
    for (const s of t.skaters) {
      skaterStats.push({
        id: s.id,
        name: s.name,
        teamId: t.id,
        position: s.position,
        gp: s.gp ?? 0,
        g: s.g ?? 0,
        a: s.a ?? 0,
        p: s.p ?? ((s.g ?? 0) + (s.a ?? 0)),
        plusMinus: s.plusMinus ?? 0,
        pim: s.pim ?? 0,
        shots: s.shots ?? 0,
        ppG: s.ppG ?? 0,
        shG: s.shG ?? 0
      });
    }

    // gather goalies
    for (const g of t.goalies) {
      goalieStats.push({
        id: g.id,
        name: g.name,
        teamId: t.id,
        gp: g.gp ?? 0,
        gs: g.gs ?? 0,
        w: g.w ?? 0,
        l: g.l ?? 0,
        otl: g.otl ?? 0,
        so: g.so ?? 0,
        shotsAgainst: g.shotsAgainst ?? 0,
        saves: g.saves ?? 0,
        gaa: isFinite(g.gaa) ? g.gaa : 0,
        svpct: isFinite(g.svpct) ? g.svpct : 0
      });
    }
  }

  return { teams, skaterStats, goalieStats };
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────────────────────
export default function MyTeamStatsPanel({
  state,
  myTeamId,
  lastGame
}: {
  state: SeasonState;
  myTeamId: ID;
  lastGame?: LastGameBox;
}) {
  // Build league view on the fly (keeps this component 100% self-contained)
  const league = useMemo(() => buildLeagueViewFromState(state), [state]);
  const team = league.teams[myTeamId];
  const [showPost, setShowPost] = useState<boolean>(!!lastGame);

  const skaters = useMemo(
    () => league.skaterStats.filter(s => s.teamId === myTeamId).sort((a,b)=> b.p - a.p),
    [league, myTeamId]
  );
  const goalies = useMemo(
    () => league.goalieStats.filter(g => g.teamId === myTeamId).sort((a,b)=> b.w - a.w),
    [league, myTeamId]
  );

  if (!team) return <div className="p-4">Team not found.</div>;

  const gpTeam = (team.w ?? 0) + (team.l ?? 0) + (team.otl ?? 0);
  const points = (team.w ?? 0) * 2 + (team.otl ?? 0);
  const pPct = gpTeam ? ((points / (gpTeam * 2)) * 100).toFixed(1) : "0.0";
  const gfPer = gpTeam ? (team.gf / gpTeam).toFixed(2) : "0.00";
  const gaPer = gpTeam ? (team.ga / gpTeam).toFixed(2) : "0.00";
  const sfPer = gpTeam ? (team.shotsFor / gpTeam).toFixed(1) : "0.0";
  const saPer = gpTeam ? (team.shotsAgainst / gpTeam).toFixed(1) : "0.0";
  const ppPct = (team.ppAttempts ?? 0) > 0 ? (((team.ppGoals ?? 0) / (team.ppAttempts ?? 1)) * 100).toFixed(1) : "—";
  const foTotal = (team.foWon ?? 0) + (team.foLost ?? 0);
  const foPct = foTotal > 0 ? (((team.foWon ?? 0) / foTotal) * 100).toFixed(1) : "—";

  return (
    <div className="p-4 space-y-4 bg-white rounded-2xl shadow">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{team.name} ({team.abbrev})</h2>
          <div className="text-sm text-slate-600">
            Record: <b>{team.w}-{team.l}-{team.otl}</b> · Pts: <b>{points}</b> · P%: <b>{pPct}%</b>
          </div>
        </div>
        <button className="px-3 py-1 rounded bg-slate-800 text-white" onClick={() => setShowPost(true)}>
          Show Post-Game
        </button>
      </div>

      {/* Team summary tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <Tile label="Goals For / G" value={`${team.gf} / ${gfPer}`} />
        <Tile label="Goals Against / G" value={`${team.ga} / ${gaPer}`} />
        <Tile label="Shots For / G" value={`${team.shotsFor} / ${sfPer}`} />
        <Tile label="Shots Against / G" value={`${team.shotsAgainst} / ${saPer}`} />
        <Tile label="Power Play" value={ppPct === "—" ? "—" : `${ppPct}%`} />
        <Tile label="Faceoff %" value={foPct === "—" ? "—" : `${foPct}%`} />
      </div>

      {/* Skaters table */}
      <section>
        <h3 className="font-semibold mb-2">Skaters</h3>
        <div className="overflow-auto max-h-96 border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 sticky top-0">
              <tr>
                <Th>Name</Th><Th>Pos</Th><Th>GP</Th><Th>G</Th><Th>A</Th><Th>Pts</Th><Th>+/-</Th><Th>PIM</Th><Th>SOG</Th><Th>PPG</Th><Th>SHG</Th>
              </tr>
            </thead>
            <tbody>
              {skaters.map(s => (
                <tr key={s.id} className="border-t">
                  <Td left>{s.name}</Td>
                  <Td>{s.position}</Td>
                  <Td>{s.gp}</Td>
                  <Td>{s.g}</Td>
                  <Td>{s.a}</Td>
                  <Td><b>{s.p}</b></Td>
                  <Td>{s.plusMinus}</Td>
                  <Td>{s.pim}</Td>
                  <Td>{s.shots}</Td>
                  <Td>{s.ppG}</Td>
                  <Td>{s.shG}</Td>
                </tr>
              ))}
              {!skaters.length && (
                <tr><td className="p-3 text-center text-slate-500" colSpan={11}>No skater stats yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Goalies table */}
      <section>
        <h3 className="font-semibold mb-2">Goalies</h3>
        <div className="overflow-auto max-h-72 border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 sticky top-0">
              <tr>
                <Th>Name</Th><Th>GP</Th><Th>GS</Th><Th>W</Th><Th>L</Th><Th>OTL</Th><Th>SO</Th>
                <Th>SA</Th><Th>SV</Th><Th>GAA</Th><Th>SV%</Th>
              </tr>
            </thead>
            <tbody>
              {goalies.map(g => (
                <tr key={g.id} className="border-t">
                  <Td left>{g.name}</Td>
                  <Td>{g.gp}</Td>
                  <Td>{g.gs}</Td>
                  <Td>{g.w}</Td>
                  <Td>{g.l}</Td>
                  <Td>{g.otl}</Td>
                  <Td>{g.so}</Td>
                  <Td>{g.shotsAgainst}</Td>
                  <Td>{g.saves}</Td>
                  <Td>{g.gaa.toFixed(2)}</Td>
                  <Td>{g.svpct.toFixed(3)}</Td>
                </tr>
              ))}
              {!goalies.length && (
                <tr><td className="p-3 text-center text-slate-500" colSpan={11}>No goalie stats yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Post-game modal (optional) */}
      {showPost && lastGame && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-4 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-semibold">Post-Game Summary</h4>
              <button
                className="px-2 py-1 text-sm rounded bg-slate-800 text-white"
                onClick={() => setShowPost(false)}
              >
                Close
              </button>
            </div>
            <div className="text-sm">
              <div className="mb-2">
                <b>{team.abbrev}</b> {lastGame.isHome ? "vs" : "@"} {lastGame.opponentName}
                {" · "}
                {lastGame.dateLabel ?? "Today"} — <b>{lastGame.myGoals}-{lastGame.oppGoals}</b>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Tile label="PP" value={lastGame.myPPA ? `${lastGame.myPPG ?? 0}/${lastGame.myPPA}` : "—"} />
                <Tile label="Shots" value={typeof lastGame.myShots === "number" ? String(lastGame.myShots) : "—"} />
                <Tile label="Opp Shots" value={typeof lastGame.oppShots === "number" ? String(lastGame.oppShots) : "—"} />
                <Tile label="New Record" value={`${team.w}-${team.l}-${team.otl}`} />
              </div>
              {lastGame.threeStars?.length ? (
                <div className="mt-3">
                  <div className="font-medium mb-1">Three Stars</div>
                  <ol className="list-decimal pl-5">
                    {lastGame.threeStars.map((s, i) => (
                      <li key={i}><b>{s.name}</b> ({s.teamAbbrev}) — {s.line}</li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Tiny presentational helpers
// ──────────────────────────────────────────────────────────────────────────────
function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border rounded-lg p-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-base font-semibold">{value}</div>
    </div>
  );
}
function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-2 py-1 text-left whitespace-nowrap">{children}</th>;
}
function Td({ children, left = false }: { children: React.ReactNode; left?: boolean }) {
  return <td className={`px-2 py-1 ${left ? "text-left" : "text-center"} whitespace-nowrap`}>{children}</td>;
}
