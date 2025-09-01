// CalendarSimHub.tsx (Mobile-Style Live Sim Upgrade)
// One file to replace your previous CalendarSimHub with a mobile-game style Live Sim screen:
// - Monthly calendar of ONLY your team's games
// - "Sim To Day" + per-game Live Sim
// - Live Sim shows scrolling play-by-play: GOALS (scorer + assists), SHOTS, SAVES, PENALTIES
// - Sim controls: Sim Entire Game OR Sim by Period, speed (1x/2x/4x), Skip to End
// - Final screen shows a compact box score; all results are applied into SeasonState (teams/players/boxScores)
//
// USAGE:
// <CalendarSimHub
//   state={state}
//   setState={setState}
//   myTeamId={userTeamId}
//   seasonStartDate="2025-10-01"
//   // simulateGame?: you can omit; this file has its own mobile live-sim engine.
// />
//
// NOTE: This file contains its own live-sim engine that yields events during the game,
// using player OVR, line usage, goalie strength, and small randomness. It updates your
// SeasonState at the end (teams/players + boxScores). If you already use AccurateSim.ts,
// you can keep it for league-wide batch simulations; this live sim focuses on the UX.

// ─────────────────────────────────────────────────────────────────────────────
// Types (align these with your app; adjust names if needed)
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useMemo, useRef, useState } from "react";

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
  id: ID; name: string; abbrev: string; conference: "East"|"West"; 
  division: "Atlantic" | "Metropolitan" | "Central" | "Pacific";
  skaters: Skater[]; goalies: Goalie[];
  w: number; l: number; otl: number; gf: number; ga: number; shotsFor: number; shotsAgainst: number;
  ppAttempts?: number; ppGoals?: number; foWon?: number; foLost?: number;
  capSpace: number; pts: number; // Make required to match FranchiseMode
};

export type Game = {
  id: string;
  day: number;        // index from season start (0-based)
  homeId: ID; awayId: ID;
  played: boolean;
  final?: { homeGoals: number; awayGoals: number; ot: boolean };
};

export type GoalEvent = { minute: number; teamId: ID; scorerId: ID; assist1Id?: ID; assist2Id?: ID; };

export type BoxScore = {
  gameId: string; homeId: ID; awayId: ID; goals: GoalEvent[]; shots: Record<ID, number>;
  goalieShots: Record<ID, number>; goalieSaves: Record<ID, number>; homeGoalieId: ID; awayGoalieId: ID; ot: boolean;
};

export type SeasonState = {
  seasonYear: string;
  currentDay: number;                 // today (0-based from season start)
  totalDays: number;
  schedule: Game[];
  boxScores: Record<string, BoxScore>;
  teams: Record<ID, Team>;
  teamOrder: ID[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Date helpers & calendar building
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

// ─────────────────────────────────────────────────────────────────────────────
// Mobile Live Sim Engine (in-file)
// - Tick-based sim across 3 periods (OT if tied)
// - Events: SHOT, SAVE, GOAL, PENALTY
// - Uses OVRs, line usage, goalie strength; heavier weights to L1/L2 and high-OVR
// ─────────────────────────────────────────────────────────────────────────────
type LiveEvent =
  | { t: "TIME"; clock: string; period: number }
  | { t: "SHOT"; by: ID; against: ID; shooter: ID; saved: boolean }
  | { t: "GOAL"; by: ID; scorer: ID; a1?: ID; a2?: ID }
  | { t: "PENALTY"; on: ID; minutes: number; by: ID; type: string };

const CFG = {
  tickSeconds: 8,                         // simulation time per tick
  periodSeconds: 20*60,                   // 20 minutes per period
  lineSharesF: [0.36, 0.30, 0.20, 0.14],  // TOI weights for forward lines
  lineSharesD: [0.36, 0.33, 0.31],
  baseShotsPerGame: 31,                   // target baseline shots/team
  homeShotBoost: 1.05,                    // home bump
  goalieOVRtoSVPCT: (ovr: number) => 0.880 + (ovr/100)*0.07, // ~0.88–0.95
  shotToGoalBase: 0.095,                  // baseline chance a shot becomes a goal (modulated)
  ovrShotWeight: 1.2,                     // higher => stars shoot more
  passAssistWeight: 0.35,                 // pass skill influence
  ppChancePerGame: 3.4,                   // PP opportunities
  ppConvRate: 0.19,                       // 19% base
};

const sum = (xs:number[]) => xs.reduce((a,b)=>a+b,0);
const clamp = (n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const fmtClock = (sec:number) => {
  const m = Math.floor(sec/60), s = sec%60; return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
};

function lineupOrAuto(team: Team) {
  const lu = (team as any).lineup as undefined | { forwards: ID[][]; defense: ID[][]; goalieStart?:ID; goalieBackup?:ID };
  if (lu && lu.forwards?.length && lu.defense?.length) {
    return {
      fLines: lu.forwards.map(line => line.map(id => team.skaters.find(s=>s.id===id)).filter(Boolean) as Skater[]),
      dPairs: lu.defense.map(pair => pair.map(id => team.skaters.find(s=>s.id===id)).filter(Boolean) as Skater[]),
      starter: team.goalies.find(g=>g.id===lu.goalieStart) ?? team.goalies.sort((a,b)=>b.overall-a.overall)[0],
    };
  }
  const f = team.skaters.filter(s=>s.position!=="D").sort((a,b)=>b.overall-a.overall).slice(0,12);
  const d = team.skaters.filter(s=>s.position==="D").sort((a,b)=>b.overall-a.overall).slice(0,6);
  return {
    fLines: [f.slice(0,3), f.slice(3,6), f.slice(6,9), f.slice(9,12)],
    dPairs: [d.slice(0,2), d.slice(2,4), d.slice(4,6)],
    starter: [...team.goalies].sort((a,b)=>b.overall-a.overall)[0],
  };
}
function lineIndexByMinute(periodSecond:number, shares:number[]) {
  const minute = Math.floor(periodSecond/60) % 20;
  const slots = shares.map(s=>Math.round(s*20));
  const edges = slots.map((_,i)=>sum(slots.slice(0,i+1)));
  const r = minute % 20;
  for (let i=0;i<edges.length;i++){
    const start = i===0?0:edges[i-1];
    if (r >= start && r < edges[i]) return i;
  }
  return 0;
}
function pickWeighted<T>(arr:T[], weights:number[]) {
  const total = sum(weights)||1; let r = Math.random()*total;
  for (let i=0;i<arr.length;i++){ r -= weights[i]; if (r<=0) return arr[i]; }
  return arr[arr.length-1];
}
function skaterShotWeight(p: Skater){ return Math.max(1, Math.pow(p.overall, CFG.ovrShotWeight)); }
function skaterPassWeight(p: Skater){ return Math.max(1, Math.pow(p.overall, CFG.passAssistWeight)); }

function teamAttackFactor(team: Team) {
  const o = team.skaters.filter(s=>s.position!=="D").map(s=>s.overall);
  return (sum(o)/(o.length||1))/85; // ~0.7–1.3
}
function teamDefenseFactor(team: Team) {
  const d = team.skaters.filter(s=>s.position==="D").map(s=>s.defense||s.overall);
  return (sum(d)/(d.length||1))/85; // ~0.7–1.3
}

function* liveSimGenerator(home: Team, away: Team, opts?: { homeFav?: boolean }) {
  // Pre-calc strengths
  const H = lineupOrAuto(home), A = lineupOrAuto(away);
  const gHomeSV = clamp(CFG.goalieOVRtoSVPCT(H.starter?.overall ?? 70), 0.88, 0.95);
  const gAwaySV = clamp(CFG.goalieOVRtoSVPCT(A.starter?.overall ?? 70), 0.88, 0.95);
  const homeAtk = teamAttackFactor(home);
  const awayAtk = teamAttackFactor(away);
  const homeDef = teamDefenseFactor(home);
  const awayDef = teamDefenseFactor(away);

  const homeShotRate = CFG.baseShotsPerGame * CFG.homeShotBoost * (homeAtk/awayDef);
  const awayShotRate = CFG.baseShotsPerGame * (awayAtk/homeDef);

  const ppEventsHomeTarget = Math.round(CFG.ppChancePerGame);
  const ppEventsAwayTarget = Math.round(CFG.ppChancePerGame);

  const totals = { hShots: 0, aShots: 0, hGoals: 0, aGoals: 0, events: [] as LiveEvent[], goals: [] as GoalEvent[] };

  // PERIODS 1..3 (then OT if tie)
  let homePPLeft = 0, awayPPLeft = 0; // seconds of power play remaining
  
  // 3 periods
  for (let p=1; p<=3; p++) {
    for (let sec=0; sec<CFG.periodSeconds; sec+=CFG.tickSeconds) {
      const clock = fmtClock(CFG.periodSeconds - sec);
      // line selection
      const fIdxH = lineIndexByMinute(sec, CFG.lineSharesF);
      const fIdxA = lineIndexByMinute(sec, CFG.lineSharesF);
      const dIdxH = lineIndexByMinute(sec, CFG.lineSharesD)%3;
      const dIdxA = lineIndexByMinute(sec, CFG.lineSharesD)%3;
      const onIceH = [...(H.fLines[fIdxH]||[]), ...(H.dPairs[dIdxH]||[])];
      const onIceA = [...(A.fLines[fIdxA]||[]), ...(A.dPairs[dIdxA]||[])];

      // Penalty random (very light): try to hit target counts across game
      if (Math.random()<0.004 && (homePPLeft<=0 && awayPPLeft<=0)) {
        const onHome = Math.random()<0.5;
        if (onHome) { homePPLeft = 120; totals.events.push({ t:"PENALTY", on: home.id, minutes: 2, by: away.id, type: "Minor" }); }
        else { awayPPLeft = 120; totals.events.push({ t:"PENALTY", on: away.id, minutes: 2, by: home.id, type: "Minor" }); }
      }

      // Shots this tick: Poisson-ish using per-game rates across 60 minutes
      const homeTickShotProb = (homeShotRate/60) * (CFG.tickSeconds/60) * (homePPLeft>0 ? 1.25 : 1);
      const awayTickShotProb = (awayShotRate/60) * (CFG.tickSeconds/60) * (awayPPLeft>0 ? 1.25 : 1);

      const homeShoots = Math.random() < homeTickShotProb;
      const awayShoots = Math.random() < awayTickShotProb;

      totals.events.push({ t:"TIME", clock, period: p });

      // HOME shot
      if (homeShoots) {
        const shooter = pickWeighted(onIceH, onIceH.map(skaterShotWeight))?.id;
        totals.hShots++;
        const shotQ = CFG.shotToGoalBase * (homeAtk/awayDef) * (homePPLeft>0?1.18:1) * (1 - (gAwaySV - 0.9)); // mod by goalie
        const goal = Math.random() < shotQ;
        totals.events.push({ t:"SHOT", by: home.id, against: away.id, shooter: shooter ?? "", saved: !goal });
        if (goal) {
          totals.hGoals++;
          const candidates = onIceH.filter(p=>p.id!==shooter);
          const a1 = candidates.length ? pickWeighted(candidates, candidates.map(skaterPassWeight)).id : undefined;
          const a2Cand = candidates.filter(p=>p.id!==a1);
          const a2 = (a2Cand.length && Math.random()<0.45) ? pickWeighted(a2Cand, a2Cand.map(skaterPassWeight)).id : undefined;
          totals.events.push({ t:"GOAL", by: home.id, scorer: shooter ?? "", a1, a2 });
          totals.goals.push({ minute: (p-1)*20 + Math.floor(sec/60), teamId: home.id, scorerId: shooter ?? "", assist1Id: a1, assist2Id: a2 });
        }
      }

      // AWAY shot
      if (awayShoots) {
        const shooter = pickWeighted(onIceA, onIceA.map(skaterShotWeight))?.id;
        totals.aShots++;
        const shotQ = CFG.shotToGoalBase * (awayAtk/homeDef) * (awayPPLeft>0?1.18:1) * (1 - (gHomeSV - 0.9));
        const goal = Math.random() < shotQ;
        totals.events.push({ t:"SHOT", by: away.id, against: home.id, shooter: shooter ?? "", saved: !goal });
        if (goal) {
          totals.aGoals++;
          const candidates = onIceA.filter(p=>p.id!==shooter);
          const a1 = candidates.length ? pickWeighted(candidates, candidates.map(skaterPassWeight)).id : undefined;
          const a2Cand = candidates.filter(p=>p.id!==a1);
          const a2 = (a2Cand.length && Math.random()<0.45) ? pickWeighted(a2Cand, a2Cand.map(skaterPassWeight)).id : undefined;
          totals.events.push({ t:"GOAL", by: away.id, scorer: shooter ?? "", a1, a2 });
          totals.goals.push({ minute: (p-1)*20 + Math.floor(sec/60), teamId: away.id, scorerId: shooter ?? "", assist1Id: a1, assist2Id: a2 });
        }
      }

      // decrement PP
      homePPLeft = Math.max(0, homePPLeft - CFG.tickSeconds);
      awayPPLeft = Math.max(0, awayPPLeft - CFG.tickSeconds);

      yield { period: p, sec, totals };
    }
  }

  // OT if tied
  let ot = false;
  if (totals.hGoals === totals.aGoals) {
    ot = true;
    for (let sec=0; sec<5*60; sec+=CFG.tickSeconds) {
      const clock = fmtClock(5*60 - sec);
      const fIdxH = lineIndexByMinute(sec, CFG.lineSharesF);
      const fIdxA = lineIndexByMinute(sec, CFG.lineSharesF);
      const dIdxH = lineIndexByMinute(sec, CFG.lineSharesD)%3;
      const dIdxA = lineIndexByMinute(sec, CFG.lineSharesD)%3;
      const onIceH = [...(H.fLines[fIdxH]||[]), ...(H.dPairs[dIdxH]||[])];
      const onIceA = [...(A.fLines[fIdxA]||[]), ...(A.dPairs[dIdxA]||[])];
      totals.events.push({ t:"TIME", clock, period: 4 });

      // single shot chance each side (reduced)
      const homeTickShotProb = (homeShotRate/60) * (CFG.tickSeconds/90);
      const awayTickShotProb = (awayShotRate/60) * (CFG.tickSeconds/90);

      const tryGoal = (isHome:boolean) => {
        const shooters = isHome ? onIceH : onIceA;
        if (!shooters.length) return false;
        if (Math.random() < (isHome?homeTickShotProb:awayTickShotProb)) {
          const shooter = pickWeighted(shooters, shooters.map(skaterShotWeight)).id;
          const q = CFG.shotToGoalBase * (isHome ? (homeAtk/awayDef) : (awayAtk/homeDef)) * 1.1 * (1 - ((isHome?gAwaySV:gHomeSV) - 0.9));
          const goal = Math.random() < q;
          const by = isHome ? home.id : away.id;
          const against = isHome ? away.id : home.id;
          totals.events.push({ t:"SHOT", by, against, shooter, saved: !goal });
          if (goal) {
            const candidates = shooters.filter(p=>p.id!==shooter);
            const a1 = candidates.length ? pickWeighted(candidates, candidates.map(skaterPassWeight)).id : undefined;
            const a2Cand = candidates.filter(p=>p.id!==a1);
            const a2 = (a2Cand.length && Math.random()<0.45) ? pickWeighted(a2Cand, a2Cand.map(skaterPassWeight)).id : undefined;
            totals.events.push({ t:"GOAL", by, scorer: shooter, a1, a2 });
            totals.goals.push({ minute: 60 + Math.floor(sec/60), teamId: by, scorerId: shooter, assist1Id: a1, assist2Id: a2 });
            if (isHome) totals.hGoals++; else totals.aGoals++;
            return true;
          }
        }
        return false;
      };

      if (tryGoal(true) || tryGoal(false)) break; // sudden death
      yield { period: 4, sec, totals };
    }
  }

  return { ...totals, ot };
}

// Apply stats (teams + players) and produce a BoxScore
function applyMobileResult(state: SeasonState, home: Team, away: Team, totals: {hShots:number;aShots:number;hGoals:number;aGoals:number;goals:GoalEvent[]; ot:boolean}): BoxScore {
  // update team totals
  const applyTeam = (mine: Team, opp: Team, myShots:number, oppShots:number, myGoals:number, oppGoals:number, ot:boolean) => {
    mine.gf += myGoals; mine.ga += oppGoals;
    mine.shotsFor += myShots; mine.shotsAgainst += oppShots;
    if (myGoals > oppGoals) {
      mine.w++;
      mine.pts += 2; // Win = 2 points
    } else if (myGoals < oppGoals) {
      if (ot) {
        mine.otl++;
        mine.pts += 1; // OT/SO loss = 1 point
      } else {
        mine.l++;
        // Regulation loss = 0 points
      }
    }
  };
  applyTeam(home, away, totals.hShots, totals.aShots, totals.hGoals, totals.aGoals, totals.ot);
  applyTeam(away, home, totals.aShots, totals.hShots, totals.aGoals, totals.hGoals, totals.ot);

  // player stat bumps (very light model; your sim may already track per-game)
  const skById: Record<string, Skater> = {};
  [...home.skaters, ...away.skaters].forEach(s=> (skById[s.id]=s));
  const touch = (kind:"G"|"A"|"SHOT", id?:ID) => {
    if (!id) return;
    const p = skById[id]; if (!p) return;
    if (kind==="G") { p.g=(p.g||0)+1; p.p=(p.p||0)+1; }
    if (kind==="A") { p.a=(p.a||0)+1; p.p=(p.p||0)+1; }
    if (kind==="SHOT") { p.shots=(p.shots||0)+1; }
    p.gp = (p.gp||0)+0; // keep per-game increment if done elsewhere
  };

  // distribute shots roughly by OVR to record some SOG
  const distShots = (team:Team, shots:number) => {
    const weights = team.skaters.map(p => Math.max(1, Math.pow(p.overall, 1.1)));
    const total = sum(weights)||1;
    const alloc = team.skaters.map((_,i)=>Math.floor(shots*(weights[i]/total)));
    let rem = shots - sum(alloc);
    while(rem-->0){ const i = Math.floor(Math.random()*alloc.length); alloc[i]++; }
    team.skaters.forEach((p, i)=> { p.shots=(p.shots||0)+alloc[i]; });
  };
  distShots(home, totals.hShots);
  distShots(away, totals.aShots);

  // goals/assists
  for (const g of totals.goals) {
    touch("G", g.scorerId);
    if (g.assist1Id) touch("A", g.assist1Id);
    if (g.assist2Id) touch("A", g.assist2Id);
  }

  // goalies — credit starts to #1
  const hG = [...home.goalies].sort((a,b)=>b.overall-a.overall)[0];
  const aG = [...away.goalies].sort((a,b)=>b.overall-a.overall)[0];
  if (hG) {
    hG.gs=(hG.gs||0)+1;
    hG.shotsAgainst += totals.aShots;
    const saves = Math.max(0, totals.aShots - totals.aGoals);
    hG.saves += saves;
    if (totals.aGoals===0) hG.so++;
    if (totals.hGoals>totals.aGoals) hG.w++; else if (totals.hGoals<totals.aGoals) (totals.ot? hG.otl++ : hG.l++);
    hG.gp = (hG.gp||0)+1;
    hG.svpct = hG.shotsAgainst ? (hG.saves/hG.shotsAgainst) : hG.svpct;
    // naive GAA adjustment (per-game blend)
    const games = Math.max(1, hG.gp);
    const thisGA = totals.aGoals;
    const thisGAA = thisGA; // 1 game baseline
    hG.gaa = ((hG.gaa*(games-1)) + thisGAA) / games;
  }
  if (aG) {
    aG.gs=(aG.gs||0)+1;
    aG.shotsAgainst += totals.hShots;
    const saves = Math.max(0, totals.hShots - totals.hGoals);
    aG.saves += saves;
    if (totals.hGoals===0) aG.so++;
    if (totals.aGoals>totals.hGoals) aG.w++; else if (totals.aGoals<totals.hGoals) (totals.ot? aG.otl++ : aG.l++);
    aG.gp = (aG.gp||0)+1;
    aG.svpct = aG.shotsAgainst ? (aG.saves/aG.shotsAgainst) : aG.svpct;
    const games = Math.max(1, aG.gp);
    const thisGA = totals.hGoals;
    const thisGAA = thisGA;
    aG.gaa = ((aG.gaa*(games-1)) + thisGAA) / games;
  }

  const gameId = `BOX_${home.id}_${away.id}_${Date.now().toString(36).slice(4)}`;
  const box: BoxScore = {
    gameId,
    homeId: home.id,
    awayId: away.id,
    goals: totals.goals,
    shots: { [home.id]: totals.hShots, [away.id]: totals.aShots },
    goalieShots: { [home.id]: totals.aShots, [away.id]: totals.hShots },
    goalieSaves: { [home.id]: Math.max(0, totals.aShots - totals.aGoals), [away.id]: Math.max(0, totals.hShots - totals.hGoals) },
    homeGoalieId: hG?.id ?? "",
    awayGoalieId: aG?.id ?? "",
    ot: totals.ot
  };
  return box;
}

// ─────────────────────────────────────────────────────────────────────────────
// Calendar utilities
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

function findNextUnplayedGame(state: SeasonState, myTeamId: ID): Game | null {
  return state.schedule
    .filter(g => (g.homeId === myTeamId || g.awayId === myTeamId) && !g.played && g.day >= state.currentDay)
    .sort((x,y) => x.day - y.day)[0] || null;
}

function teamLabel(state: SeasonState, tid: ID) {
  const t = state.teams[tid]; return t ? t.abbrev : tid.slice(0,3).toUpperCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function CalendarSimHub({
  state, setState, myTeamId, seasonStartDate
}: {
  state: SeasonState;
  setState: (updater: (s: SeasonState) => SeasonState) => void;
  myTeamId: ID;
  seasonStartDate: string;
}) {
  const todayDate = getDateFromIndex(seasonStartDate, state.currentDay);
  const seasonStartDateObj = toDate(seasonStartDate);
  const [viewMonth, setViewMonth] = useState<number>(seasonStartDateObj.getMonth());
  const [viewYear, setViewYear] = useState<number>(seasonStartDateObj.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date>(seasonStartDateObj);
  const [liveModal, setLiveModal] = useState<{ game: Game } | null>(null);
  const [lastBox, setLastBox] = useState<BoxScore | null>(null);

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

  function simToNextGame() {
    if (!nextGame) return;
      setState(prev => {
        const s = structuredClone(prev) as SeasonState;
        const home = s.teams[nextGame.homeId]; const away = s.teams[nextGame.awayId];
        // run silent mobile engine (no UI)
        const gen = liveSimGenerator(home, away);
        let step = gen.next();
        while(!step.done){ step = gen.next(); }
        const result = step.value;
        const box = applyMobileResult(s, home, away, { 
          hShots: result.hShots, aShots: result.aShots, 
          hGoals: result.hGoals, aGoals: result.aGoals, 
          goals: result.goals, ot: result.ot 
        });
        nextGame.played = true;
        nextGame.final = { homeGoals: result.hGoals, awayGoals: result.aGoals, ot: result.ot };
        s.boxScores[box.gameId] = box;
        // Auto-advance to the next day after this game
        s.currentDay = nextGame.day + 1;
        setLastBox(box);
        return s;
      });
  }

  function simToEndOfSeason() {
    // Get ALL games (not just my team's) that need to be played
    const allGames = state.schedule.filter(g => 
      !g.played && g.day >= state.currentDay
    ).sort((x,y) => x.day - y.day);
    
    if (!allGames.length) return;

    setState(prev => {
      const s = structuredClone(prev) as SeasonState;
      let lastGameDay = s.currentDay;
      
      for (const g of allGames) {
        const home = s.teams[g.homeId]; const away = s.teams[g.awayId];
        // run silent mobile engine (no UI)
        const gen = liveSimGenerator(home, away);
        let step = gen.next();
        while(!step.done){ step = gen.next(); }
        const result = step.value;
        const box = applyMobileResult(s, home, away, { 
          hShots: result.hShots, aShots: result.aShots, 
          hGoals: result.hGoals, aGoals: result.aGoals, 
          goals: result.goals, ot: result.ot 
        });
        g.played = true;
        g.final = { homeGoals: result.hGoals, awayGoals: result.aGoals, ot: result.ot };
        s.boxScores[box.gameId] = box;
        lastGameDay = Math.max(lastGameDay, g.day);
        
        // Only set lastBox for my team's games
        if (g.homeId === myTeamId || g.awayId === myTeamId) {
          setLastBox(box);
        }
      }
      // Advance to day after last game
      s.currentDay = lastGameDay + 1;
      return s;
    });
  }

  function simToEndOfMonth() {
    const endOfMonth = new Date(viewYear, viewMonth + 1, 0);
    const endDayIndex = getDayIndex(seasonStartDate, endOfMonth);
    
    // Get ALL games (not just my team's) that need to be played up to end of month
    const allGames = state.schedule.filter(g => 
      !g.played && g.day >= state.currentDay && g.day <= endDayIndex
    ).sort((x,y) => x.day - y.day);
    
    if (!allGames.length) return;

    setState(prev => {
      const s = structuredClone(prev) as SeasonState;
      let lastGameDay = s.currentDay;
      
      for (const g of allGames) {
        const home = s.teams[g.homeId]; const away = s.teams[g.awayId];
        // run silent mobile engine (no UI)
        const gen = liveSimGenerator(home, away);
        let step = gen.next();
        while(!step.done){ step = gen.next(); }
        const result = step.value;
        const box = applyMobileResult(s, home, away, { 
          hShots: result.hShots, aShots: result.aShots, 
          hGoals: result.hGoals, aGoals: result.aGoals, 
          goals: result.goals, ot: result.ot 
        });
        g.played = true;
        g.final = { homeGoals: result.hGoals, awayGoals: result.aGoals, ot: result.ot };
        s.boxScores[box.gameId] = box;
        lastGameDay = Math.max(lastGameDay, g.day);
        
        // Only set lastBox for my team's games
        if (g.homeId === myTeamId || g.awayId === myTeamId) {
          setLastBox(box);
        }
      }
      // Advance to day after last game or end of month, whichever is later
      s.currentDay = Math.max(lastGameDay + 1, endDayIndex + 1);
      return s;
    });
  }

  function openLiveSim(game: Game) {
    setLiveModal({ game });
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
            <button 
              className="px-3 py-1 rounded bg-accent text-accent-foreground hover:bg-accent/80" 
              onClick={simToEndOfMonth}
            >
              Sim to Month End
            </button>
            <button 
              className="px-3 py-1 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80" 
              onClick={simToEndOfSeason}
            >
              Sim to Season End
            </button>
            {myGamesThatDay.map(g => (
              <button key={g.id} disabled={g.played} className={`px-3 py-1 rounded ${g.played? "bg-muted text-muted-foreground":"bg-destructive text-destructive-foreground hover:bg-destructive/80"}`}
                onClick={()=>openLiveSim(g)}>
                {g.played ? "Played" : "Live Sim"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Latest box score (if any) */}
      {lastBox && (
        <div className="mt-4">
          <BoxScoreCard box={lastBox} state={state} />
        </div>
      )}

      {/* Live Sim Modal (mobile-style) */}
      {liveModal && (
        <LiveSimModal
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

// ─────────────────────────────────────────────────────────────────────────────
// LiveSimModal — mobile-game style stream with scorer & assists
// ─────────────────────────────────────────────────────────────────────────────
function LiveSimModal({
  state, setState, game, onClose, onFinished
}: {
  state: SeasonState;
  setState: (updater: (s: SeasonState) => SeasonState) => void;
  game: Game;
  onClose: () => void;
  onFinished: (box: BoxScore)=>void;
}) {
  const home = state.teams[game.homeId], away = state.teams[game.awayId];
  const [period, setPeriod] = useState(1);
  const [clock, setClock] = useState("20:00");
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState<1|2|4>(2); // playback speed
  const [score, setScore] = useState({ home: 0, away: 0, shotsH: 0, shotsA: 0 });
  const genRef = useRef<Generator<any, any, any> | null>(null);
  const doneRef = useRef(false);
  const [lastBox, setLastBox] = useState<BoxScore | null>(null);

  useEffect(() => {
    // init generator
    genRef.current = liveSimGenerator(home, away);
    setEvents([{ t:"TIME", clock: "20:00", period: 1 }]);
    setPeriod(1); setClock("20:00");
    setScore({ home: 0, away: 0, shotsH: 0, shotsA: 0 });
    doneRef.current = false;
    setLastBox(null);
    // auto-start
    setRunning(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.id]);

  useEffect(() => {
    if (!running || !genRef.current) return;
    const interval = setInterval(() => {
      const step = genRef.current!.next();
      if (step.done) {
        // finalize, apply result to state
        const result = step.value ?? { hShots:0, aShots:0, hGoals:0, aGoals:0, goals:[], ot:false };
        const box = applyMobileResult(state, home, away, { 
          hShots: result.hShots, aShots: result.aShots, 
          hGoals: result.hGoals, aGoals: result.aGoals, 
          goals: result.goals, ot: result.ot 
        });
        setState(prev => {
          const s = structuredClone(prev) as SeasonState;
          const g = s.schedule.find(x => x.id === game.id)!;
          g.played = true;
          g.final = { homeGoals: result.hGoals, awayGoals: result.aGoals, ot: result.ot };
          s.currentDay = Math.max(s.currentDay, g.day);
          s.boxScores[box.gameId] = box;
          return s;
        });
        doneRef.current = true;
        setLastBox(box);
        onFinished(box);
        setRunning(false);
      } else {
        const t = step.value;
        // Pull the last few raw events created since previous tick
        const evs: LiveEvent[] = t.events.slice(-3); // take last few to avoid flooding
        const timeEv = evs.find(e=>e.t==="TIME") as any;
        if (timeEv) { 
          setClock(timeEv.clock); 
          setPeriod(timeEv.period); 
        }
        const goalEvs = evs.filter(e=>e.t==="GOAL") as any[];
        const shotEvs = evs.filter(e=>e.t==="SHOT") as any[];
        if (goalEvs.length || shotEvs.length || evs.some(e=>e.t==="PENALTY")) {
          setEvents(prev => [...prev, ...evs]);
        }
        setScore({ home: t.hGoals, away: t.aGoals, shotsH: t.hShots, shotsA: t.aShots });
      }
    }, 450 / speed); // UI playback speed
    return () => clearInterval(interval);
  }, [running, speed, setState, onFinished, state, home, away, game.id]);

  function skipToEnd() {
    if (!genRef.current) return;
    let step = genRef.current.next();
    while(!step.done) step = genRef.current.next();
    const result = step.value ?? { hShots:0, aShots:0, hGoals:0, aGoals:0, goals:[], ot:false };
    const box = applyMobileResult(state, home, away, { 
      hShots: result.hShots, aShots: result.aShots, 
      hGoals: result.hGoals, aGoals: result.aGoals, 
      goals: result.goals, ot: result.ot 
    });
    setState(prev => {
      const s = structuredClone(prev) as SeasonState;
      const g = s.schedule.find(x => x.id === game.id)!;
      g.played = true;
      g.final = { homeGoals: result.hGoals, awayGoals: result.aGoals, ot: result.ot };
      s.currentDay = Math.max(s.currentDay, g.day);
      s.boxScores[box.gameId] = box;
      return s;
    });
    doneRef.current = true;
    setLastBox(box);
    onFinished(box);
    setRunning(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm">
            <div className="font-semibold">{away.abbrev} @ {home.abbrev}</div>
            <div className="text-muted-foreground">Period {period} — {clock}</div>
          </div>
          <div className="flex items-center gap-2">
            <button className={`px-2 py-1 rounded ${running?"bg-muted":"bg-primary text-primary-foreground"}`} onClick={()=>setRunning(!running)}>
              {running? "Pause":"Resume"}
            </button>
            <div className="flex items-center gap-1 text-sm">
              Speed:
              {[1,2,4].map(v=>(
                <button key={v} className={`px-2 py-1 rounded border ${speed===v?"bg-primary text-primary-foreground":"bg-background"}`} onClick={()=>setSpeed(v as 1|2|4)}>{v}x</button>
              ))}
            </div>
            <button className="px-2 py-1 rounded bg-accent text-accent-foreground" onClick={skipToEnd}>Skip to End</button>
            <button className="px-2 py-1 rounded bg-muted text-muted-foreground" onClick={onClose}>Close</button>
          </div>
        </div>

        {/* Scoreboard */}
        <div className="border rounded-lg p-3 flex items-center justify-between mb-3">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">AWAY</div>
            <div className="text-lg font-bold">{away.abbrev}</div>
            <div className="text-sm">Shots: {score.shotsA}</div>
          </div>
          <div className="text-2xl font-extrabold">{score.away} : {score.home}</div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">HOME</div>
            <div className="text-lg font-bold">{home.abbrev}</div>
            <div className="text-sm">Shots: {score.shotsH}</div>
          </div>
        </div>

        {/* Play-by-Play Feed */}
        <div className="border rounded-lg p-3 h-80 overflow-auto bg-muted/10">
          {events.length===0 && <div className="text-sm text-muted-foreground">Waiting for action…</div>}
          {events.map((ev, i) => (
            <PlayRow key={i} ev={ev} state={state} />
          ))}
        </div>

        {/* Game completed - show final box score */}
        {doneRef.current && lastBox && (
          <div className="mt-4 p-4 border rounded-lg bg-muted/10">
            <div className="font-semibold mb-2 text-center">Game Complete!</div>
            <BoxScoreCard box={lastBox} state={state} />
          </div>
        )}

        {/* Footer note */}
        <div className="text-xs text-muted-foreground mt-2">
          Goals show scorer + up to two assists. Stats are automatically saved to your season when the game ends.
        </div>
      </div>
    </div>
  );
}

function PlayRow({ ev, state }: { ev: LiveEvent; state: SeasonState }) {
  if (ev.t==="TIME") return <div className="text-[11px] text-muted-foreground">— {ev.clock} (P{ev.period}) —</div>;
  if (ev.t==="PENALTY") {
    const by = state.teams[ev.by]?.abbrev ?? "???";
    const on = state.teams[ev.on]?.abbrev ?? "???";
    return <div className="text-sm"><span className="font-semibold text-accent">PENALTY</span>: {by} draws a call on {on} ({ev.type}, {ev.minutes}m)</div>;
  }
  if (ev.t==="SHOT") {
    const by = state.teams[ev.by]?.abbrev ?? "???";
    const shooterName = findPlayerName(state, ev.shooter) ?? "Shot";
    return <div className="text-sm"><b>{by}</b> — {shooterName} fires… {ev.saved? "Saved!" : "Rebound…"}</div>;
  }
  if (ev.t==="GOAL") {
    const by = state.teams[ev.by]?.abbrev ?? "???";
    const s = findPlayerName(state, ev.scorer) ?? "Goal Scorer";
    const a1 = ev.a1 ? findPlayerName(state, ev.a1) : undefined;
    const a2 = ev.a2 ? findPlayerName(state, ev.a2) : undefined;
    return (
      <div className="text-sm">
        <span className="font-semibold text-primary">GOAL — {by}!</span> {s}
        {a1 || a2 ? <span className="text-muted-foreground"> (assists: {a1 ?? "—"}{a2? `, ${a2}`:""})</span> : null}
      </div>
    );
  }
  return null;
}

function findPlayerName(state: SeasonState, playerId: ID): string | undefined {
  for (const tid of Object.keys(state.teams)) {
    const t = state.teams[tid];
    const s = t.skaters.find(p=>p.id===playerId); if (s) return s.name;
    const g = t.goalies.find(p=>p.id===playerId); if (g) return g.name;
  }
  return undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Compact Box Score Card
// ─────────────────────────────────────────────────────────────────────────────
function BoxScoreCard({ box, state }: { box: BoxScore; state: SeasonState }) {
  const home = state.teams[box.homeId], away = state.teams[box.awayId];
  const hGoals = (box.shots[box.homeId] ?? 0) - (box.goalieSaves[box.awayId] ?? 0);
  const aGoals = (box.shots[box.awayId] ?? 0) - (box.goalieSaves[box.homeId] ?? 0);

  return (
    <div className="border rounded-xl p-3 bg-background shadow">
      <div className="font-semibold mb-2">Final {box.ot ? "(OT)" : ""}</div>
      <div className="flex items-center justify-between">
        <div><b>{away?.abbrev ?? box.awayId}</b> — Shots: {box.shots[box.awayId] ?? 0}</div>
        <div className="text-lg font-bold">{aGoals} : {hGoals}</div>
        <div><b>{home?.abbrev ?? box.homeId}</b> — Shots: {box.shots[box.homeId] ?? 0}</div>
      </div>
      {/* Goal list */}
      <div className="mt-2 text-sm">
        {box.goals.length ? (
          <div className="space-y-1">
            {box.goals.map((g, i) => {
              const by = state.teams[g.teamId]?.abbrev ?? "???";
              const s = findPlayerName(state, g.scorerId) ?? "Goal";
              const a1 = g.assist1Id ? findPlayerName(state, g.assist1Id) : undefined;
              const a2 = g.assist2Id ? findPlayerName(state, g.assist2Id) : undefined;
              const mm = Math.floor(g.minute), period = mm < 20 ? 1 : (mm < 40 ? 2 : (mm < 60 ? 3 : 4));
              return <div key={i}>P{period} — {by}: <b>{s}</b>{a1||a2? <> (A: {a1 ?? "—"}{a2? `, ${a2}`:""})</> : null}</div>;
            })}
          </div>
        ) : <div className="text-muted-foreground">No goal details recorded.</div>}
      </div>
    </div>
  );
}
