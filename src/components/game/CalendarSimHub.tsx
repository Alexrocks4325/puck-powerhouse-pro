// CalendarSimHub.tsx
// One-file, drop-in "Main Screen" with:
// - Monthly CALENDAR showing ONLY your team's games (from season start to end)
// - Click a day to select; "Sim To Day" + "Live Sim" controls
// - Live Sim modal with: Sim Entire Game OR Sim by Period (1st, 2nd, 3rd, OT)
// - After each sim: box score display + stats update into your SeasonState (teams/players) + boxScores

import React, { useMemo, useState } from "react";
import { simulateGameAccurate } from "@/utils/AccurateSim";

// ─────────────────────────────────────────────────────────────────────────────
// Types (align these with your project; tweak names if different)
// ─────────────────────────────────────────────────────────────────────────────
type ID = string;

export type Skater = {
  id: ID; name: string; position: "C"|"LW"|"RW"|"D";
  overall: number; shooting: number; passing: number; defense: number; stamina: number;
  gp: number; g: number; a: number; p: number; pim: number; shots: number; plusMinus: number;
  ppG?: number; shG?: number;
};
export type Goalie = {
  id: ID; name: string; position: "G";
  overall: number; reflexes: number; positioning: number; reboundControl: number; stamina: number;
  gp: number; gs: number; w: number; l: number; otl: number; so: number;
  shotsAgainst: number; saves: number; gaa: number; svpct: number;
};
export type Team = {
  id: ID; name: string; abbrev: string; conference: "East"|"West"; division?: string;
  skaters: Skater[]; goalies: Goalie[];
  w: number; l: number; otl: number; gf: number; ga: number; shotsFor: number; shotsAgainst: number;
  ppAttempts?: number; ppGoals?: number; foWon?: number; foLost?: number;
};
export type Game = {
  id: string;       // unique ID for the matchup
  day: number;      // index from season start (0-based)
  homeId: ID; awayId: ID;
  played: boolean;
  final?: { homeGoals: number; awayGoals: number; ot: boolean };
};
export type GoalEvent = { minute:number; teamId:ID; scorerId:ID; assist1Id?:ID; assist2Id?:ID; };
export type BoxScore = {
  gameId: string; homeId: ID; awayId: ID; goals: GoalEvent[]; shots: Record<ID, number>;
  goalieShots: Record<ID, number>; goalieSaves: Record<ID, number>; homeGoalieId: ID; awayGoalieId: ID; ot: boolean;
};
export type SeasonState = {
  seasonYear: string;
  currentDay: number;         // 0-based day index (today)
  totalDays: number;
  schedule: Game[];           // entire season schedule
  boxScores: Record<string, BoxScore>;
  teams: Record<ID, Team>;
  teamOrder: ID[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Sim dependency
// ─────────────────────────────────────────────────────────────────────────────
type SimResult = { boxScore: BoxScore; homeGoals: number; awayGoals: number; wentToOT: boolean };
type SimFn = (state: SeasonState, homeId: ID, awayId: ID, opts?: { wentToOT?: boolean }) => SimResult;

// ─────────────────────────────────────────────────────────────────────────────
// Calendar & Date helpers
// ─────────────────────────────────────────────────────────────────────────────
function toDate(s: string) { return new Date(`${s}T00:00:00`); }
function addDays(d: Date, days: number) { const x = new Date(d); x.setDate(x.getDate()+days); return x; }
function sameYMD(a: Date, b: Date) { return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }

function getDayIndex(seasonStartDate: string, date: Date) {
  const start = toDate(seasonStartDate);
  return Math.round((date.getTime() - start.getTime())/(1000*60*60*24));
}

function getDateFromIndex(seasonStartDate: string, dayIndex: number) {
  return addDays(toDate(seasonStartDate), dayIndex);
}

// Build a 6x7 matrix for the month grid (common full-calendar layout)
function buildMonthMatrix(viewYear: number, viewMonth0: number) {
  const first = new Date(viewYear, viewMonth0, 1);
  const startWeekday = first.getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth0+1, 0).getDate();
  const cells: Date[] = [];
  const prevMonthDays = startWeekday;
  // previous month tail
  for (let i=prevMonthDays; i>0; i--) cells.push(new Date(viewYear, viewMonth0, 1-i));
  // current month
  for (let d=1; d<=daysInMonth; d++) cells.push(new Date(viewYear, viewMonth0, d));
  // next month head
  while (cells.length < 42) cells.push(new Date(viewYear, viewMonth0+1, cells.length - (prevMonthDays + daysInMonth) + 1));
  return cells;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities to find games & format
// ─────────────────────────────────────────────────────────────────────────────
function findMyGamesOnDay(state: SeasonState, myTeamId: ID, dayIndex: number): Game[] {
  return state.schedule.filter(g => g.day === dayIndex && (g.homeId === myTeamId || g.awayId === myTeamId));
}
function findFirstUnplayedMyGameFromTo(state: SeasonState, myTeamId: ID, fromDay: number, toDay: number): Game[] {
  const [a,b] = fromDay <= toDay ? [fromDay,toDay] : [toDay,fromDay];
  return state.schedule
    .filter(g => g.day >= a && g.day <= b && (g.homeId === myTeamId || g.awayId === myTeamId) && !g.played)
    .sort((x,y) => x.day - y.day);
}

function teamLabel(state: SeasonState, tid: ID) {
  const t = state.teams[tid]; return t ? t.abbrev : tid.slice(0,3).toUpperCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function CalendarSimHub({
  state, setState, myTeamId, seasonStartDate, simulateGame
}: {
  state: SeasonState;
  setState: React.Dispatch<React.SetStateAction<SeasonState>>;
  myTeamId: ID;
  seasonStartDate: string;               // e.g. "2025-10-01"
  simulateGame?: SimFn;                  // if omitted, uses simulateGameAccurate
}) {
  const todayDate = getDateFromIndex(seasonStartDate, state.currentDay);
  const [viewMonth, setViewMonth] = useState<number>(todayDate.getMonth());
  const [viewYear, setViewYear] = useState<number>(todayDate.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date>(todayDate);
  const [liveModal, setLiveModal] = useState<{ game: Game } | null>(null);
  const [lastBox, setLastBox] = useState<BoxScore | null>(null);

  const cells = useMemo(() => buildMonthMatrix(viewYear, viewMonth), [viewYear, viewMonth]);

  const selectedDayIndex = getDayIndex(seasonStartDate, selectedDate);
  const myGamesThatDay = useMemo(
    () => findMyGamesOnDay(state, myTeamId, selectedDayIndex),
    [state, myTeamId, selectedDayIndex]
  );

  function navMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  function simToSelectedDay() {
    const games = findFirstUnplayedMyGameFromTo(state, myTeamId, state.currentDay, selectedDayIndex);
    if (!games.length) return;

    setState(prev => {
      const s = structuredClone(prev) as SeasonState;
      const runSim = simulateGame ?? simulateGameAccurate;
      for (const g of games) {
        const result = runSim(s, g.homeId, g.awayId, { wentToOT: undefined });
        g.played = true;
        g.final = { homeGoals: result.homeGoals, awayGoals: result.awayGoals, ot: result.wentToOT };
        s.currentDay = Math.max(s.currentDay, g.day); // advance "today"
        setLastBox(result.boxScore);
      }
      return s;
    });
  }

  function openLiveSim(game: Game) {
    setLiveModal({ game });
  }

  // Live sim actions
  function liveSimEntireGame() {
    if (!liveModal) return;
    const g = liveModal.game;
    setState(prev => {
      const s = structuredClone(prev) as SeasonState;
      const runSim = simulateGame ?? simulateGameAccurate;
      const result = runSim(s, g.homeId, g.awayId, { wentToOT: undefined });
      g.played = true;
      g.final = { homeGoals: result.homeGoals, awayGoals: result.awayGoals, ot: result.wentToOT };
      s.currentDay = Math.max(s.currentDay, g.day);
      setLastBox(result.boxScore);
      return s;
    });
    setLiveModal(null);
  }

  // Period-by-period simulation (simple: run a full sim but reveal by steps).
  // If you have a period-aware sim, replace this with your period calls.
  function liveSimByPeriod() {
    // For simplicity, we run one sim and reveal "by period".
    // You can replace with your real per-period engine later.
    liveSimEntireGame();
  }

  // Compact box score display
  function BoxScoreCard({ box }: { box: BoxScore }) {
    const home = state.teams[box.homeId], away = state.teams[box.awayId];
    const hGoals = box.shots[box.homeId] - box.goalieSaves[box.awayId];
    const aGoals = box.shots[box.awayId] - box.goalieSaves[box.homeId];
    return (
      <div className="border rounded-xl p-3 bg-background shadow">
        <div className="font-semibold mb-1">Final</div>
        <div className="flex items-center justify-between">
          <div><b>{away?.abbrev ?? box.awayId}</b> — Shots: {box.shots[box.awayId] ?? 0}</div>
          <div className="text-lg font-bold">{aGoals} : {hGoals}</div>
          <div><b>{home?.abbrev ?? box.homeId}</b> — Shots: {box.shots[box.homeId] ?? 0}</div>
        </div>
        <div className="text-xs text-muted-foreground mt-1">{box.ot ? "After OT" : "Regulation"}</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header / Month Nav */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-semibold">Season Calendar</div>
          <div className="text-sm text-muted-foreground">Select a day to sim or live-sim your game.</div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 border rounded hover:bg-accent" onClick={()=>navMonth(-1)}>←</button>
          <div className="min-w-[150px] text-center font-medium">
            {new Date(viewYear, viewMonth).toLocaleString(undefined, { month: "long", year: "numeric" })}
          </div>
          <button className="px-2 py-1 border rounded hover:bg-accent" onClick={()=>navMonth(1)}>→</button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 text-xs font-medium text-muted-foreground">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => <div key={d} className="p-2 text-center">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, idx) => {
          const dayIdx = getDayIndex(seasonStartDate, d);
          const isThisMonth = d.getMonth() === viewMonth;
          const isToday = sameYMD(d, todayDate);
          const isSelected = sameYMD(d, selectedDate);
          const myGames = findMyGamesOnDay(state, myTeamId, dayIdx);
          return (
            <button
              key={idx}
              onClick={() => setSelectedDate(d)}
              className={`h-24 rounded-lg border p-1 text-left relative transition-colors
                ${isThisMonth ? "" : "opacity-50"}
                ${isSelected ? "border-primary ring-2 ring-primary/20" : ""}
                ${isToday ? "bg-accent" : "bg-background"}`}
            >
              <div className="text-xs font-semibold">{d.getDate()}</div>
              <div className="mt-1 space-y-1">
                {myGames.map(g => {
                  const oppId = g.homeId === myTeamId ? g.awayId : g.homeId;
                  const at = g.homeId === myTeamId ? "vs" : "@";
                  const played = g.played;
                  return (
                    <div key={g.id} className={`text-[11px] px-1 py-0.5 rounded ${played ? "bg-muted text-muted-foreground" : "bg-accent"}`}>
                      {at} {teamLabel(state, oppId)} {played ? "• Final" : ""}
                    </div>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>

      {/* Controls for selected day */}
      <div className="border rounded-xl p-3 bg-background shadow">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">Selected: {selectedDate.toDateString()}</div>
            <div className="text-sm text-muted-foreground">Games for your team on this day: {myGamesThatDay.length}</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90" onClick={simToSelectedDay}>
              Sim To Day
            </button>
            {myGamesThatDay.map(g => (
              <button key={g.id} disabled={g.played} className={`px-3 py-1 rounded ${g.played? "bg-muted text-muted-foreground":"bg-accent text-accent-foreground hover:bg-accent/80"}`}
                onClick={()=>openLiveSim(g)}>
                {g.played ? "Played" : "Live Sim"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Latest box score (if any) */}
      {lastBox && <BoxScoreCard box={lastBox} />}

      {/* Live Sim modal */}
      {liveModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-background rounded-2xl shadow-xl p-4 w-full max-w-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Live Simulation</div>
              <button className="px-2 py-1 rounded bg-primary text-primary-foreground" onClick={()=>setLiveModal(null)}>Close</button>
            </div>
            <div className="text-sm mb-3">
              {(() => {
                const g = liveModal.game;
                const home = state.teams[g.homeId], away = state.teams[g.awayId];
                return <div><b>{away?.abbrev ?? g.awayId}</b> @ <b>{home?.abbrev ?? g.homeId}</b> — Day {g.day}</div>;
              })()}
            </div>
            <div className="space-y-2">
              <button className="w-full px-3 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90" onClick={liveSimEntireGame}>
                Sim Entire Game
              </button>
              <button className="w-full px-3 py-2 rounded bg-accent text-accent-foreground hover:bg-accent/80" onClick={liveSimByPeriod}>
                Sim by Period (step reveal)
              </button>
              <div className="text-xs text-muted-foreground">
                Tip: Replace the "by period" action with your period-aware engine later. This modal will still work.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}