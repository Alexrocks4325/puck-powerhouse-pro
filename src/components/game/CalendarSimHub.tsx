// CalendarSimHub_fix.tsx
// Fix for: "After I simulate, results don't show in the Season Calendar."
// Root cause: state was being mutated in-place (nested objects), so React didn't detect changes.
// This version makes **immutable** updates to schedule + teams + boxScores so the calendar re-renders.

// Drop-in replacement for your CalendarSimHub. It includes:
// - Immutable state updates when simming to day or live sim finish
// - Safe team/player stat application without mutating the previous state
// - Calendar will immediately reflect Played/Final

import React, { useMemo, useState, useEffect, useRef } from "react";

type ID = string;

// ─── Types (match your project) ──────────────────────────────────────────────
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
  id: ID; name: string; abbrev: string; conference: "East"|"West"; 
  division: "Atlantic" | "Metropolitan" | "Central" | "Pacific";
  skaters: Skater[]; goalies: Goalie[];
  w: number; l: number; otl: number; gf: number; ga: number; shotsFor: number; shotsAgainst: number;
  ppAttempts?: number; ppGoals?: number; foWon?: number; foLost?: number;
  pts: number; capSpace: number; // Required for compatibility
};
export type Game = {
  id: string; day: number; homeId: ID; awayId: ID; played: boolean;
  final?: { homeGoals: number; awayGoals: number; ot: boolean };
};
export type GoalEvent = { minute:number; teamId:ID; scorerId:ID; assist1Id?:ID; assist2Id?:ID; };
export type BoxScore = {
  gameId: string; homeId: ID; awayId: ID; goals: GoalEvent[]; shots: Record<ID, number>;
  goalieShots: Record<ID, number>; goalieSaves: Record<ID, number>; homeGoalieId: ID; awayGoalieId: ID; ot: boolean;
};
export type PlayoffSeries = {
  id: string;
  round: number;
  homeId: ID;
  awayId: ID;
  homeWins: number;
  awayWins: number;
  completed: boolean;
  winnerId?: ID;
};

export type SeasonState = {
  seasonYear: string;
  currentDay: number;            // today (0-based from season start)
  totalDays: number;
  schedule: Game[];
  boxScores: Record<string, BoxScore>;
  teams: Record<ID, Team>;
  teamOrder: ID[];
  isRegularSeasonComplete?: boolean;
  playoffSeries?: PlayoffSeries[];
  currentPlayoffRound?: number;
};

// ─── Utilities ───────────────────────────────────────────────────────────────
const sum = (xs:number[]) => xs.reduce((a,b)=>a+b,0);
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
function buildMonthMatrix(viewYear: number, viewMonth0: number) {
  const first = new Date(viewYear, viewMonth0, 1);
  const startWeekday = first.getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth0+1, 0).getDate();
  const cells: Date[] = [];
  for (let i=startWeekday; i>0; i--) cells.push(new Date(viewYear, viewMonth0, 1-i));
  for (let d=1; d<=daysInMonth; d++) cells.push(new Date(viewYear, viewMonth0, d));
  while (cells.length < 42) cells.push(new Date(viewYear, viewMonth0+1, cells.length - (startWeekday + daysInMonth) + 1));
  return cells;
}
function teamLabel(state: SeasonState, tid: ID) {
  const t = state.teams[tid]; return t ? t.abbrev : tid.slice(0,3).toUpperCase();
}
function findMyGamesOnDay(state: SeasonState, myTeamId: ID, dayIndex: number): Game[] {
  return state.schedule.filter(g => g.day === dayIndex && (g.homeId === myTeamId || g.awayId === myTeamId));
}
function findFirstUnplayedMyGameFromTo(state: SeasonState, myTeamId: ID, fromDay: number, toDay: number): Game[] {
  const [a,b] = fromDay <= toDay ? [fromDay,toDay] : [toDay,fromDay];
  return state.schedule
    .filter(g => g.day >= a && g.day <= b && (g.homeId === myTeamId || g.awayId === myTeamId) && !g.played)
    .sort((x,y) => x.day - y.day);
}
function findNextUnplayedGame(state: SeasonState, myTeamId: ID): Game | null {
  return state.schedule
    .filter(g => (g.homeId === myTeamId || g.awayId === myTeamId) && !g.played && g.day >= state.currentDay)
    .sort((x,y) => x.day - y.day)[0] || null;
}

// ─── Playoff System ──────────────────────────────────────────────────────────
function generatePlayoffSeries(teams: Record<ID, Team>): PlayoffSeries[] {
  // Get all teams and sort by points for seeding
  const allTeams = Object.values(teams);
  const eastTeams = allTeams.filter(t => t.conference === "East").sort((a, b) => (b.pts || 0) - (a.pts || 0)).slice(0, 8);
  const westTeams = allTeams.filter(t => t.conference === "West").sort((a, b) => (b.pts || 0) - (a.pts || 0)).slice(0, 8);
  
  const series: PlayoffSeries[] = [];
  
  // Round 1 - Wild Card Round (8 series total)
  for (let i = 0; i < 4; i++) {
    // Eastern Conference
    series.push({
      id: `R1_E${i + 1}`,
      round: 1,
      homeId: eastTeams[i].id,
      awayId: eastTeams[7 - i].id,
      homeWins: 0,
      awayWins: 0,
      completed: false
    });
    
    // Western Conference  
    series.push({
      id: `R1_W${i + 1}`,
      round: 1,
      homeId: westTeams[i].id,
      awayId: westTeams[7 - i].id,
      homeWins: 0,
      awayWins: 0,
      completed: false
    });
  }
  
  return series;
}

function simulatePlayoffSeries(series: PlayoffSeries, teams: Record<ID, Team>): PlayoffSeries {
  const home = teams[series.homeId];
  const away = teams[series.awayId];
  
  let homeWins = series.homeWins;
  let awayWins = series.awayWins;
  
  // Simulate games until one team gets 4 wins
  while (homeWins < 4 && awayWins < 4) {
    const totals = quickSimTotals(home, away);
    if (totals.hGoals > totals.aGoals) {
      homeWins++;
    } else {
      awayWins++;
    }
  }
  
  return {
    ...series,
    homeWins,
    awayWins,
    completed: true,
    winnerId: homeWins === 4 ? series.homeId : series.awayId
  };
}

// ─── Minimal Sim (replace with your AccurateSim if you want) ─────────────────
type SimTotals = { hShots:number; aShots:number; hGoals:number; aGoals:number; goals:GoalEvent[]; ot:boolean };
function quickSimTotals(home: Team, away: Team): SimTotals {
  const avgOVR = (ts:Team) => ts.skaters.length ? (sum(ts.skaters.map(s=>s.overall))/ts.skaters.length) : 75;
  const hS = 26 + Math.floor(Math.random()*12);
  const aS = 26 + Math.floor(Math.random()*12);
  const hQ = 0.09 + (avgOVR(home)-80)*0.0015;
  const aQ = 0.09 + (avgOVR(away)-80)*0.0015;
  let hG = Math.max(0, Math.round(hS * hQ));
  let aG = Math.max(0, Math.round(aS * aQ));
  let ot = false;
  if (hG===aG) { ot = true; Math.random()<0.5 ? hG++ : aG++; }
  return { hShots: hS, aShots: aS, hGoals: hG, aGoals: aG, goals: [], ot };
}

// ─── IMMUTABLE APPLY: Build new state with copied teams/schedule ─────────────
function applyResultImmutable(prev: SeasonState, gameId: string, homeId: ID, awayId: ID, totals: SimTotals) {
  // 1) Clone teams deeply enough (team + skaters + goalies arrays) so mutations don't touch prev
  const newTeams: Record<ID, Team> = { ...prev.teams };
  const cloneTeam = (t: Team): Team => ({
    ...t,
    skaters: t.skaters.map(s => ({ ...s })),
    goalies: t.goalies.map(g => ({ ...g })),
  });

  const homePrev = newTeams[homeId];
  const awayPrev = newTeams[awayId];
  const home = cloneTeam(homePrev);
  const away = cloneTeam(awayPrev);

  // 2) Update team aggregates (hockey points calculation)
  const updTeam = (mine: Team, opp: Team, myGoals:number, oppGoals:number, myShots:number, oppShots:number, ot:boolean) => {
    mine.gf += myGoals; mine.ga += oppGoals;
    mine.shotsFor += myShots; mine.shotsAgainst += oppShots;
    
    // Hockey points: Win = 2pts, OT/SO Loss = 1pt, Regulation Loss = 0pts
    if (myGoals > oppGoals) {
      mine.w++;
      mine.pts = (mine.pts || 0) + 2;
    } else if (myGoals < oppGoals) {
      if (ot) {
        mine.otl++;
        mine.pts = (mine.pts || 0) + 1;
      } else {
        mine.l++;
      }
    }
  };
  updTeam(home, away, totals.hGoals, totals.aGoals, totals.hShots, totals.aShots, totals.ot);
  updTeam(away, home, totals.aGoals, totals.hGoals, totals.aShots, totals.hShots, totals.ot);

  // 3) Put updated teams back (new object identity)
  newTeams[homeId] = home;
  newTeams[awayId] = away;

  // 4) Create box score (new identity)
  const boxId = `BOX_${homeId}_${awayId}_${Date.now().toString(36).slice(4)}`;
  const box: BoxScore = {
    gameId: boxId,
    homeId, awayId,
    goals: totals.goals,
    shots: { [homeId]: totals.hShots, [awayId]: totals.aShots },
    goalieShots: { [homeId]: totals.aShots, [awayId]: totals.hShots },
    goalieSaves: { [homeId]: Math.max(0, totals.aShots - totals.hGoals), [awayId]: Math.max(0, totals.hShots - totals.aGoals) },
    homeGoalieId: home.goalies[0]?.id ?? "",
    awayGoalieId: away.goalies[0]?.id ?? "",
    ot: totals.ot
  };

  // 5) Update schedule immutably (map returning **new game objects**)
  const newSchedule = prev.schedule.map(g => {
    if (g.id !== gameId) return g;
    return {
      ...g,
      played: true,
      final: { homeGoals: totals.hGoals, awayGoals: totals.aGoals, ot: totals.ot }
    };
  });

  // 6) Bump currentDay if needed
  const playedGame = prev.schedule.find(g => g.id === gameId)!;
  const newCurrentDay = Math.max(prev.currentDay, playedGame.day + 1);

  // 7) Return the fully new state (new object identities for teams/schedule/boxScores)
  const newBoxScores = { ...prev.boxScores, [boxId]: box };

  const next: SeasonState = {
    ...prev,
    currentDay: newCurrentDay,
    teams: newTeams,
    schedule: newSchedule,
    boxScores: newBoxScores
  };

  return { next, box };
}

// ─── Component: Season Calendar with fixed updates ───────────────────────────
export default function CalendarSimHub({
  state, setState, myTeamId, seasonStartDate
}: {
  state: SeasonState;
  setState: (updater: (s: SeasonState) => SeasonState) => void;
  myTeamId: ID;
  seasonStartDate: string;
}) {
  const todayDate = getDateFromIndex(seasonStartDate, state.currentDay);
  const [viewMonth, setViewMonth] = useState<number>(todayDate.getMonth());
  const [viewYear, setViewYear] = useState<number>(todayDate.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date>(todayDate);
  const [lastBox, setLastBox] = useState<BoxScore | null>(null);
  const [liveModal, setLiveModal] = useState<{ game: Game } | null>(null);

  const cells = useMemo(() => buildMonthMatrix(viewYear, viewMonth), [viewYear, viewMonth]);
  const nextGame = useMemo(() => findNextUnplayedGame(state, myTeamId), [state, myTeamId]);
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

  // FIXED: immutable "Sim Next Game"
  function simToNextGame() {
    if (!nextGame) return;
    setState(prev => {
      const home = prev.teams[nextGame.homeId];
      const away = prev.teams[nextGame.awayId];
      const totals = quickSimTotals(home, away);
      const { next, box } = applyResultImmutable(prev, nextGame.id, nextGame.homeId, nextGame.awayId, totals);
      setLastBox(box);
      return next;
    });
  }

  // FIXED: immutable "Sim To Day"
  function simToSelectedDay() {
    const games = findFirstUnplayedMyGameFromTo(state, myTeamId, state.currentDay, selectedDayIndex);
    if (!games.length) return;

    setState(prev => {
      let working = prev;
      for (const g of games) {
        const home = working.teams[g.homeId];
        const away = working.teams[g.awayId];
        const totals = quickSimTotals(home, away);
        const { next, box } = applyResultImmutable(working, g.id, g.homeId, g.awayId, totals);
        working = next;
        setLastBox(box);
      }
      return working;
    });
  }

  // FIXED: immutable "Sim To End of Month"
  function simToEndOfMonth() {
    const endOfMonth = new Date(viewYear, viewMonth + 1, 0);
    const endDayIndex = getDayIndex(seasonStartDate, endOfMonth);
    
    // Get ALL games that need to be played up to end of month
    const allGames = state.schedule.filter(g => 
      !g.played && g.day >= state.currentDay && g.day <= endDayIndex
    ).sort((x,y) => x.day - y.day);
    
    if (!allGames.length) return;

    setState(prev => {
      let working = prev;
      for (const g of allGames) {
        const home = working.teams[g.homeId];
        const away = working.teams[g.awayId];
        const totals = quickSimTotals(home, away);
        const { next, box } = applyResultImmutable(working, g.id, g.homeId, g.awayId, totals);
        working = next;
        
        // Only set lastBox for my team's games
        if (g.homeId === myTeamId || g.awayId === myTeamId) {
          setLastBox(box);
        }
      }
      return working;
    });
  }

  // FIXED: immutable "Sim To End of Season"
  function simToEndOfSeason() {
    const allGames = state.schedule.filter(g => 
      !g.played && g.day >= state.currentDay
    ).sort((x,y) => x.day - y.day);
    
    setState(prev => {
      let working = prev;
      
      // Simulate remaining regular season games
      for (const g of allGames) {
        const home = working.teams[g.homeId];
        const away = working.teams[g.awayId];
        const totals = quickSimTotals(home, away);
        const { next, box } = applyResultImmutable(working, g.id, g.homeId, g.awayId, totals);
        working = next;
        
        // Only set lastBox for my team's games
        if (g.homeId === myTeamId || g.awayId === myTeamId) {
          setLastBox(box);
        }
      }
      
      // Mark regular season as complete and generate playoffs
      working = {
        ...working,
        isRegularSeasonComplete: true,
        playoffSeries: generatePlayoffSeries(working.teams),
        currentPlayoffRound: 1
      };
      
      return working;
    });
  }

  function openLiveSim(game: Game) {
    setLiveModal({ game });
  }

  // Check if playoffs should be available
  const allRegularSeasonGamesPlayed = state.schedule.every(g => g.played);
  const isPlayoffsActive = state.isRegularSeasonComplete || allRegularSeasonGamesPlayed;
  const myTeamInPlayoffs = state.playoffSeries?.some(s => s.homeId === myTeamId || s.awayId === myTeamId);

  function simulateMyPlayoffSeries() {
    if (!state.playoffSeries) return;
    
    setState(prev => {
      const myCurrentSeries = prev.playoffSeries?.find(s => 
        (s.homeId === myTeamId || s.awayId === myTeamId) && !s.completed
      );
      
      if (!myCurrentSeries) return prev;
      
      const simulatedSeries = simulatePlayoffSeries(myCurrentSeries, prev.teams);
      
      const newPlayoffSeries = prev.playoffSeries!.map(s => 
        s.id === myCurrentSeries.id ? simulatedSeries : s
      );
      
      return {
        ...prev,
        playoffSeries: newPlayoffSeries
      };
    });
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header / Month Nav */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-semibold">Season Calendar</div>
          <div className="text-sm text-muted-foreground">
            {nextGame ? (
              <>Next Game: <span className="font-medium text-primary">
                {nextGame.homeId === myTeamId ? "vs" : "@"} {teamLabel(state, nextGame.homeId === myTeamId ? nextGame.awayId : nextGame.homeId)} 
                (Day {nextGame.day + 1})
              </span></>
            ) : (
              "No upcoming games"
            )}
          </div>
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
          const hasNextGame = nextGame && nextGame.day === dayIdx;
          
          return (
            <button
              key={idx}
              onClick={() => setSelectedDate(d)}
              className={`h-24 rounded-lg border p-1 text-left relative transition-colors
                ${isThisMonth ? "" : "opacity-50"}
                ${isSelected ? "border-primary ring-2 ring-primary/20" : ""}
                ${isToday ? "bg-primary/10 border-primary font-semibold" : "bg-background"}
                ${hasNextGame ? "bg-accent border-accent-foreground" : ""}`}
            >
              <div className="text-xs font-semibold flex items-center justify-between">
                {d.getDate()}
                {isToday && <span className="text-[10px] text-primary">TODAY</span>}
                {hasNextGame && <span className="text-[10px] text-accent-foreground">NEXT</span>}
              </div>
              <div className="mt-1 space-y-1">
                {myGames.map(g => {
                  const oppId = g.homeId === myTeamId ? g.awayId : g.homeId;
                  const at = g.homeId === myTeamId ? "vs" : "@";
                  const played = g.played;
                  const isNext = nextGame && nextGame.id === g.id;
                  
                  // Show game result if played
                  let resultText = "";
                  if (played && g.final) {
                    const myGoals = g.homeId === myTeamId ? g.final.homeGoals : g.final.awayGoals;
                    const oppGoals = g.homeId === myTeamId ? g.final.awayGoals : g.final.homeGoals;
                    const won = myGoals > oppGoals;
                    const otText = g.final.ot ? " (OT)" : "";
                    resultText = ` ${won ? "W" : "L"} ${myGoals}-${oppGoals}${otText}`;
                  }
                  
                  return (
                    <div key={g.id} className={`text-[11px] px-1 py-0.5 rounded ${
                      played ? "bg-muted text-muted-foreground" : 
                      isNext ? "bg-primary text-primary-foreground font-medium" :
                      "bg-accent"
                    }`}>
                      {at} {teamLabel(state, oppId)}{resultText}
                    </div>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>

      {/* Simulation Controls */}
      <div className="border rounded-xl p-3 bg-background shadow">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">Simulation Controls</div>
            <div className="text-sm text-muted-foreground">
              Current Day: {state.currentDay + 1} | 
              Selected: {selectedDate.toDateString()} | 
              Games on this day: {myGamesThatDay.length}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50" 
              onClick={simToNextGame}
              disabled={!nextGame}
            >
              Sim Next Game
            </button>
            <button className="px-3 py-1 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80" onClick={simToSelectedDay}>
              Sim To Day
            </button>
            <button 
              className="px-3 py-1 rounded bg-accent text-accent-foreground hover:bg-accent/80" 
              onClick={simToEndOfMonth}
            >
              Sim to Month End
            </button>
            <button 
              className="px-3 py-1 rounded bg-destructive text-destructive-foreground hover:bg-destructive/80" 
              onClick={simToEndOfSeason}
            >
              Sim to Season End
            </button>
            {myGamesThatDay.map(g => (
              <button key={g.id} disabled={g.played} className={`px-3 py-1 rounded ${g.played? "bg-muted text-muted-foreground":"bg-indigo-600 text-white hover:bg-indigo-700"}`}
                onClick={()=>openLiveSim(g)}>
                {g.played ? "Played" : "Live Sim"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Playoffs Section */}
      {isPlayoffsActive && (
        <div className="border rounded-xl p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                🏆
              </div>
              <h3 className="text-xl font-bold text-yellow-800">Stanley Cup Playoffs</h3>
            </div>
            {myTeamInPlayoffs && (
              <button 
                className="px-4 py-2 rounded bg-yellow-600 text-white hover:bg-yellow-700 font-medium"
                onClick={simulateMyPlayoffSeries}
              >
                Simulate My Series
              </button>
            )}
          </div>
          
          {state.playoffSeries && state.playoffSeries.length > 0 ? (
            <div className="grid gap-4">
              <h4 className="font-semibold text-yellow-800">First Round</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {state.playoffSeries.filter(s => s.round === 1).map(series => {
                  const isMyGame = series.homeId === myTeamId || series.awayId === myTeamId;
                  return (
                    <div key={series.id} className={`p-3 rounded border ${
                      isMyGame ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'
                    }`}>
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">
                          {teamLabel(state, series.awayId)} @ {teamLabel(state, series.homeId)}
                        </div>
                        <div className="text-lg font-bold">
                          {series.awayWins} - {series.homeWins}
                        </div>
                      </div>
                      {series.completed && (
                        <div className="text-xs text-green-600 font-medium mt-1">
                          {teamLabel(state, series.winnerId!)} advances
                        </div>
                      )}
                      {!series.completed && (
                        <div className="text-xs text-gray-500 mt-1">
                          Best of 7 series
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-yellow-700">Playoffs will begin after the regular season ends.</p>
              <p className="text-sm text-yellow-600 mt-1">Use "Sim to Season End" to complete all games.</p>
            </div>
          )}
        </div>
      )}

      {/* Latest box score (if any) */}
      {lastBox && <BoxScoreCard box={lastBox} state={state} />}

      {/* Simple Live Sim (calls immutable apply on finish) */}
      {liveModal && (
        <LiveSimQuick
          state={state}
          setState={setState}
          game={liveModal.game}
          onClose={() => setLiveModal(null)}
          onFinished={(box)=> setLastBox(box)}
        />
      )}
    </div>
  );
}

// ─── Simple Live Sim (quick) — you can replace with your fancy one  ──────────
function LiveSimQuick({
  state, setState, game, onClose, onFinished
}: {
  state: SeasonState;
  setState: (updater: (s: SeasonState) => SeasonState) => void;
  game: Game;
  onClose: () => void;
  onFinished: (box: BoxScore)=>void;
}) {
  const home = state.teams[game.homeId], away = state.teams[game.awayId];
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState({ h:0, a:0, sH:0, sA:0 });

  function start() {
    setRunning(true);
    setTimeout(()=>{
      const totals = quickSimTotals(home, away);
      // IMMUTABLE apply
      setState(prev => {
        const { next, box } = applyResultImmutable(prev, game.id, game.homeId, game.awayId, totals);
        setScore({ h: totals.hGoals, a: totals.aGoals, sH: totals.hShots, sA: totals.aShots });
        onFinished(box);
        return next;
      });
      setRunning(false);
    }, 600);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold">{away.abbrev} @ {home.abbrev}</div>
          <button className="px-2 py-1 rounded bg-slate-800 text-white" onClick={onClose}>Close</button>
        </div>
        <div className="border rounded p-3 text-center">
          <div className="text-2xl font-bold">{score.a} : {score.h}</div>
          <div className="text-sm text-slate-600">Shots {score.sA} / {score.sH}</div>
        </div>
        <button className={`mt-3 w-full px-3 py-2 rounded ${running?"bg-slate-300":"bg-indigo-600 text-white"}`} disabled={running} onClick={start}>
          {running ? "Simulating…" : "Sim Now"}
        </button>
      </div>
    </div>
  );
}

// ─── Box Score Card ──────────────────────────────────────────────────────────
function BoxScoreCard({ box, state }: { box: BoxScore; state: SeasonState }) {
  const home = state.teams[box.homeId], away = state.teams[box.awayId];
  const hGoals = (box.shots[box.homeId] ?? 0) - (box.goalieSaves[box.awayId] ?? 0);
  const aGoals = (box.shots[box.awayId] ?? 0) - (box.goalieSaves[box.homeId] ?? 0);
  return (
    <div className="border rounded-xl p-3 bg-white shadow">
      <div className="font-semibold mb-2">Final {box.ot ? "(OT)" : ""}</div>
      <div className="flex items-center justify-between">
        <div><b>{away?.abbrev ?? box.awayId}</b> — Shots: {box.shots[box.awayId] ?? 0}</div>
        <div className="text-lg font-bold">{aGoals} : {hGoals}</div>
        <div><b>{home?.abbrev ?? box.homeId}</b> — Shots: {box.shots[box.homeId] ?? 0}</div>
      </div>
    </div>
  );
}