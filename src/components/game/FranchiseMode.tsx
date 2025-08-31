// File: FranchiseMode.tsx
// Single-file Franchise Mode: 82-game season, sim engine, box scores, standings, player stats.
// Integrated with Ultimate Team NHL database

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import GameHeader from "./GameHeader";
import TeamCoachSelection from "./TeamCoachSelection";
import { Trophy, Users, Calendar, Star, Settings, TrendingUp, Building2, Target, Crown, Play, SkipForward, FastForward } from "lucide-react";
import { nhlPlayerDatabase, Player as NHLPlayer } from "@/data/nhlPlayerDatabase";
import TradeCenter from './TradeCenter';
import TeamManager from "./TeamManager";
import MyTeamStatsPanel from "./MyTeamStatsPanel";

// -------------------------- TEAM META --------------------------
const TEAM_META: Array<{ id: ID; name: string; abbrev: string; conf: Team["conference"]; div: Team["division"]; }> = [
  { id: "BOS", name: "Boston Bruins", abbrev: "BOS", conf: "East", div: "Atlantic" },
  { id: "BUF", name: "Buffalo Sabres", abbrev: "BUF", conf: "East", div: "Atlantic" },
  { id: "DET", name: "Detroit Red Wings", abbrev: "DET", conf: "East", div: "Atlantic" },
  { id: "FLA", name: "Florida Panthers", abbrev: "FLA", conf: "East", div: "Atlantic" },
  { id: "MTL", name: "Montréal Canadiens", abbrev: "MTL", conf: "East", div: "Atlantic" },
  { id: "OTT", name: "Ottawa Senators", abbrev: "OTT", conf: "East", div: "Atlantic" },
  { id: "TBL", name: "Tampa Bay Lightning", abbrev: "TBL", conf: "East", div: "Atlantic" },
  { id: "TOR", name: "Toronto Maple Leafs", abbrev: "TOR", conf: "East", div: "Atlantic" },
  { id: "CAR", name: "Carolina Hurricanes", abbrev: "CAR", conf: "East", div: "Metropolitan" },
  { id: "CBJ", name: "Columbus Blue Jackets", abbrev: "CBJ", conf: "East", div: "Metropolitan" },
  { id: "NJD", name: "New Jersey Devils", abbrev: "NJD", conf: "East", div: "Metropolitan" },
  { id: "NYI", name: "New York Islanders", abbrev: "NYI", conf: "East", div: "Metropolitan" },
  { id: "NYR", name: "New York Rangers", abbrev: "NYR", conf: "East", div: "Metropolitan" },
  { id: "PHI", name: "Philadelphia Flyers", abbrev: "PHI", conf: "East", div: "Metropolitan" },
  { id: "PIT", name: "Pittsburgh Penguins", abbrev: "PIT", conf: "East", div: "Metropolitan" },
  { id: "WSH", name: "Washington Capitals", abbrev: "WSH", conf: "East", div: "Metropolitan" },
  { id: "ARI", name: "Arizona Coyotes", abbrev: "ARI", conf: "West", div: "Central" },
  { id: "CHI", name: "Chicago Blackhawks", abbrev: "CHI", conf: "West", div: "Central" },
  { id: "COL", name: "Colorado Avalanche", abbrev: "COL", conf: "West", div: "Central" },
  { id: "DAL", name: "Dallas Stars", abbrev: "DAL", conf: "West", div: "Central" },
  { id: "MIN", name: "Minnesota Wild", abbrev: "MIN", conf: "West", div: "Central" },
  { id: "NSH", name: "Nashville Predators", abbrev: "NSH", conf: "West", div: "Central" },
  { id: "STL", name: "St. Louis Blues", abbrev: "STL", conf: "West", div: "Central" },
  { id: "WPG", name: "Winnipeg Jets", abbrev: "WPG", conf: "West", div: "Central" },
  { id: "ANA", name: "Anaheim Ducks", abbrev: "ANA", conf: "West", div: "Pacific" },
  { id: "CGY", name: "Calgary Flames", abbrev: "CGY", conf: "West", div: "Pacific" },
  { id: "EDM", name: "Edmonton Oilers", abbrev: "EDM", conf: "West", div: "Pacific" },
  { id: "LAK", name: "Los Angeles Kings", abbrev: "LAK", conf: "West", div: "Pacific" },
  { id: "SEA", name: "Seattle Kraken", abbrev: "SEA", conf: "West", div: "Pacific" },
  { id: "SJS", name: "San Jose Sharks", abbrev: "SJS", conf: "West", div: "Pacific" },
  { id: "VAN", name: "Vancouver Canucks", abbrev: "VAN", conf: "West", div: "Pacific" },
  { id: "VGK", name: "Vegas Golden Knights", abbrev: "VGK", conf: "West", div: "Pacific" },
];

// -------------------------- FAKE ROSTER GENERATOR (FALLBACK) --------------------------
const FIRST = ["Alex","Chris","Jordan","Taylor","Jamie","Pat","Devin","Riley","Sam","Casey","Robin","Corey","Drew","Avery","Shawn","Logan","Carter","Noah","Mason","Liam","Ethan","Lucas","Henry","Owen","Jack","Leo","Miles","Nate","Cole","Evan"];
const LAST = ["Smith","Johnson","Williams","Jones","Brown","Miller","Davis","Wilson","Taylor","Clark","Hall","Young","King","Wright","Lopez","Hill","Scott","Green","Adams","Baker","Ward","Turner","Carter","Phillips","Campbell","Parker","Evans","Edwards","Collins","Stewart"];
function genName() { return `${choice(FIRST)} ${choice(LAST)}`; }

function genSkater(pos: Skater["position"]): Skater {
  const overall = rnd(55, 94);
  return {
    id: makeId("P"), name: genName(), position: pos, overall,
    shooting: rnd(50, 95), passing: rnd(50, 95), defense: rnd(50, 95), stamina: rnd(55, 95),
    gp: 0, g: 0, a: 0, p: 0, pim: 0, shots: 0, plusMinus: 0
  };
}
function genGoalie(): Goalie {
  const overall = rnd(55, 95);
  return {
    id: makeId("G"), name: genName(), position: "G", overall,
    reflexes: rnd(55, 96), positioning: rnd(55, 96), reboundControl: rnd(55, 96), stamina: rnd(60, 96),
    gp: 0, gs: 0, w: 0, l: 0, otl: 0, so: 0, shotsAgainst: 0, saves: 0, gaa: 0, svpct: 0
  };
}
function genTeam(meta: (typeof TEAM_META)[number]): Team {
  const centers = Array.from({ length: 4 }, () => genSkater("C"));
  const wings = Array.from({ length: 8 }, (_, i) => genSkater(i % 2 === 0 ? "LW" : "RW"));
  const defense = Array.from({ length: 6 }, () => genSkater("D"));
  const goalies = [genGoalie(), genGoalie()];
  return {
    id: meta.id, name: meta.name, abbrev: meta.abbrev, conference: meta.conf, division: meta.div,
    capSpace: rnd(0, 15000000), skaters: [...centers, ...wings, ...defense], goalies,
    w: 0, l: 0, otl: 0, gf: 0, ga: 0, pts: 0, shotsFor: 0, shotsAgainst: 0
  };
}

// -------------------------- TYPES & MODELS --------------------------
type ID = string;

export type Skater = {
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
};

export type Goalie = {
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
  gaa: number;
  svpct: number;
};

export type Player = Skater | Goalie;

export type Team = {
  id: ID;
  name: string;
  abbrev: string;
  conference: "East" | "West";
  division: "Atlantic" | "Metropolitan" | "Central" | "Pacific";
  capSpace: number;
  skaters: Skater[];
  goalies: Goalie[];
  // team season stats
  w: number;
  l: number;
  otl: number;
  gf: number;
  ga: number;
  pts: number;
  shotsFor: number;
  shotsAgainst: number;
};

export type GameId = string;

export type Game = {
  id: GameId;
  day: number;
  homeId: ID;
  awayId: ID;
  played: boolean;
  final?: {
    homeGoals: number;
    awayGoals: number;
    ot: boolean;
  };
};

export type GoalEvent = {
  minute: number;
  teamId: ID;
  scorerId: ID;
  assist1Id?: ID;
  assist2Id?: ID;
};

export type BoxScore = {
  gameId: GameId;
  homeId: ID;
  awayId: ID;
  goals: GoalEvent[];
  shots: Record<ID, number>;
  goalieShots: Record<ID, number>;
  goalieSaves: Record<ID, number>;
  homeGoalieId: ID;
  awayGoalieId: ID;
  ot: boolean;
};

export type SeasonState = {
  seasonYear: string;
  currentDay: number;
  totalDays: number;
  schedule: Game[];
  boxScores: Record<GameId, BoxScore>;
  teams: Record<ID, Team>;
  teamOrder: ID[];
};

// -------------------------- HELPERS --------------------------
const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const choice = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
function makeId(prefix: string = "id"): ID { return `${prefix}_${Math.random().toString(36).slice(2, 10)}`; }
function avg(nums: number[]) { return nums.reduce((a,b)=>a+b,0) / (nums.length || 1); }

// -------------------------- NHL DATABASE INTEGRATION --------------------------
function convertNHLPlayerToSkater(player: NHLPlayer): Skater {
  return {
    id: String(player.id),
    name: player.name,
    position: player.position as "C" | "LW" | "RW" | "D",
    overall: player.overall,
    shooting: Math.floor(player.overall * 0.9),
    passing: Math.floor(player.overall * 0.85),
    defense: Math.floor(player.overall * 0.8),
    stamina: 70,
    gp: 0, g: 0, a: 0, p: 0, pim: 0, shots: 0, plusMinus: 0
  };
}

function convertNHLPlayerToGoalie(player: NHLPlayer): Goalie {
  return {
    id: String(player.id),
    name: player.name,
    position: "G",
    overall: player.overall,
    reflexes: Math.floor(player.overall * 1.05),
    positioning: Math.floor(player.overall * 1.02),
    reboundControl: Math.floor(player.overall * 0.95),
    stamina: 70,
    gp: 0, gs: 0, w: 0, l: 0, otl: 0, so: 0, shotsAgainst: 0, saves: 0, gaa: 0, svpct: 0
  };
}

function loadNHLLeague(): Record<ID, Team> {
  const teams: Record<ID, Team> = {};
  
  // Create teams from metadata first
  for (const meta of TEAM_META) {
    teams[meta.id] = {
      id: meta.id,
      name: meta.name,
      abbrev: meta.abbrev,
      conference: meta.conf,
      division: meta.div,
      capSpace: rnd(0, 15000000),
      skaters: [],
      goalies: [],
      w: 0, l: 0, otl: 0, gf: 0, ga: 0, pts: 0, shotsFor: 0, shotsAgainst: 0
    };
  }

  // Use the imported NHL player database directly
  console.log('Loading NHL teams with real rosters...');
  console.log('Total NHL players in database:', nhlPlayerDatabase.length);
  
  const playersByTeam: Record<string, NHLPlayer[]> = {};
  
  // Group players by team
  for (const player of nhlPlayerDatabase) {
    if (!playersByTeam[player.team]) {
      playersByTeam[player.team] = [];
    }
    playersByTeam[player.team].push(player);
  }

  console.log('Teams found in database:', Object.keys(playersByTeam));

  // Convert NHL players to our format and assign to teams
  for (const [teamAbbrev, players] of Object.entries(playersByTeam)) {
    const team = teams[teamAbbrev];
    if (!team) {
      console.warn(`Team ${teamAbbrev} not found in TEAM_META`);
      continue;
    }

    console.log(`Loading ${players.length} players for ${teamAbbrev}`);

    for (const player of players) {
      if (player.position === "G") {
        const goalie: Goalie = {
          id: player.id.toString(),
          name: player.name,
          position: "G",
          overall: player.overall,
          reflexes: Math.max(50, Math.min(99, player.overall + rnd(-3, 5))),
          positioning: Math.max(50, Math.min(99, player.overall + rnd(-3, 5))),
          reboundControl: Math.max(50, Math.min(99, player.overall + rnd(-3, 5))),
          stamina: rnd(65, 90),
          gp: 0, gs: 0, w: 0, l: 0, otl: 0, so: 0, 
          shotsAgainst: 0, saves: 0, gaa: 0, svpct: 0
        };
        team.goalies.push(goalie);
      } else {
        const skater: Skater = {
          id: player.id.toString(),
          name: player.name,
          position: player.position as Skater["position"],
          overall: player.overall,
          shooting: Math.max(45, Math.min(99, player.overall + rnd(-5, 8))),
          passing: Math.max(45, Math.min(99, player.overall + rnd(-5, 8))),
          defense: Math.max(45, Math.min(99, player.overall + rnd(-5, 8))),
          stamina: rnd(65, 90),
          gp: 0, g: 0, a: 0, p: 0, pim: 0, shots: 0, plusMinus: 0
        };
        team.skaters.push(skater);
      }
    }

    console.log(`${teamAbbrev}: ${team.skaters.length} skaters, ${team.goalies.length} goalies`);
  }

  // Verify all teams have players, fallback if needed
  let teamsWithPlayers = 0;
  for (const [teamId, team] of Object.entries(teams)) {
    if (team.skaters.length > 0 || team.goalies.length > 0) {
      teamsWithPlayers++;
    } else {
      console.warn(`Team ${teamId} has no players, using fallback`);
      teams[teamId] = genTeam(TEAM_META.find(t => t.id === teamId)!);
    }
  }

  console.log(`Successfully loaded ${teamsWithPlayers} teams with real NHL rosters`);
  return teams;
}

// -------------------------- SCHEDULE GENERATION (82) --------------------------
type PairKey = `${ID}_${ID}`;
type PairMeetings = { a: ID; b: ID; meetings: number; };
function keyPair(a: ID, b: ID): PairKey { return [a,b].sort().join("_") as PairKey; }
function getDivision(id: ID) { 
  return TEAM_META.find(t => t.id === id)?.div ?? "Atlantic"; 
}
function getConference(id: ID) { 
  return TEAM_META.find(t => t.id === id)?.conf ?? "East"; 
}

function buildPairMatrix(teamIds: ID[]): PairMeetings[] {
  const pairs = new Map<PairKey, PairMeetings>();
  for (let i=0;i<teamIds.length;i++){
    for (let j=i+1;j<teamIds.length;j++){
      const a = teamIds[i]; const b = teamIds[j];
      pairs.set(keyPair(a,b), { a, b, meetings: 2 }); // base 2 (home+away)
    }
  }
  const targetExtraPerTeam = 20;
  const extraCount: Record<ID, number> = Object.fromEntries(teamIds.map(id=>[id,0] as const));
  function canAdd(a: ID, b: ID) { return extraCount[a] < targetExtraPerTeam && extraCount[b] < targetExtraPerTeam; }

  const byDivision: Record<Team["division"], ID[]> = { Atlantic: [], Metropolitan: [], Central: [], Pacific: [] };
  for (const id of teamIds) byDivision[getDivision(id)].push(id);

  for (const div of Object.keys(byDivision) as Team["division"][]) {
    const list = byDivision[div]; let safety = 20000;
    while(safety-- > 0) {
      const a = choice(list), b = choice(list); if (a===b) continue;
      if (!canAdd(a,b)) continue;
      const k = keyPair(a,b); const rec = pairs.get(k)!; rec.meetings += 2;
      pairs.set(k, rec); extraCount[a]+=2; extraCount[b]+=2;
      if (list.every(id=>extraCount[id]>=12)) break;
    }
  }

  const byConf: Record<Team["conference"], ID[]> = { East: [], West: [] };
  for (const id of teamIds) byConf[getConference(id)].push(id);
  for (const conf of Object.keys(byConf) as Team["conference"][]) {
    const list = byConf[conf]; let safety = 30000;
    while(safety-- > 0) {
      const a = choice(list), b = choice(list); if (a===b) continue;
      if (!canAdd(a,b)) { if (list.every(t=>extraCount[t]>=targetExtraPerTeam)) break; else continue; }
      const k = keyPair(a,b); const rec = pairs.get(k)!; rec.meetings += 1;
      pairs.set(k, rec); extraCount[a]+=1; extraCount[b]+=1;
      if (list.every(id=>extraCount[id]>=targetExtraPerTeam)) break;
    }
  }

  return Array.from(pairs.values());
}

function expandPairsToGames(pairs: PairMeetings[]): Array<{ homeId: ID; awayId: ID; }> {
  const games: Array<{ homeId: ID; awayId: ID; }> = [];
  for (const p of pairs) {
    let homeFlip = Math.random() < 0.5;
    for (let m=0; m<p.meetings; m++) {
      const homeId = homeFlip ? p.a : p.b;
      const awayId = homeFlip ? p.b : p.a;
      games.push({ homeId, awayId });
      homeFlip = !homeFlip;
    }
  }
  return games;
}

function assignGamesToDays(games: Array<{ homeId: ID; awayId: ID; }>, maxDays: number): Game[] {
  const dayBusy: Record<number, Set<ID>> = {};
  for (let d=1; d<=maxDays; d++) dayBusy[d] = new Set();
  const scheduled: Game[] = []; let gidCounter = 1;
  for (const g of games) {
    let placed = false;
    for (let d=1; d<=maxDays; d++){
      const set = dayBusy[d];
      if (!set.has(g.homeId) && !set.has(g.awayId)) {
        set.add(g.homeId); set.add(g.awayId);
        scheduled.push({ id: `G${gidCounter++}`, day: d, homeId: g.homeId, awayId: g.awayId, played: false });
        placed = true; break;
      }
    }
    if (!placed) {
      const d = maxDays;
      dayBusy[d].add(g.homeId); dayBusy[d].add(g.awayId);
      scheduled.push({ id: `G${gidCounter++}`, day: d, homeId: g.homeId, awayId: g.awayId, played: false });
    }
  }
  scheduled.sort((a,b)=> a.day - b.day || a.id.localeCompare(b.id));
  return scheduled;
}

function generateFullSeasonSchedule(teamIds: ID[], totalDays = 190): Game[] {
  const pairs = buildPairMatrix(teamIds);
  const games = expandPairsToGames(pairs);
  return assignGamesToDays(games, totalDays);
}

// -------------------------- SIM ENGINE --------------------------
type Tactics = "Balanced" | "Aggressive" | "Defensive";

function teamStrength(team: Team) {
  const topForwards = [...team.skaters.filter(s=>s.position!=="D")].sort((a,b)=>b.overall-a.overall).slice(0,9);
  const topDefense = [...team.skaters.filter(s=>s.position==="D")].sort((a,b)=>b.overall-a.overall).slice(0,6);
  const starter = [...team.goalies].sort((a,b)=>b.overall-b.overall)[0] ?? team.goalies[0];
  const off = avg([...topForwards.map(f=> (f.shooting + f.passing)/2), ...topDefense.map(d=> d.passing*0.6 + d.shooting*0.4)]);
  const def = avg([...topDefense.map(d=> d.defense), ...topForwards.map(f=> f.defense*0.7)]);
  const goa = (starter?.reflexes ?? 60 + starter?.positioning ?? 60 + starter?.reboundControl ?? 60) / 3;
  return { off, def, goa };
}

function poisson(lambda: number) {
  let L = Math.exp(-lambda);
  let k = 0; let p = 1;
  do { k++; p *= Math.random(); } while(p > L);
  return k - 1;
}

function pickGoalie(team: Team, fatigueBias = 0.2): Goalie {
  const [g1, g2] = [...team.goalies].sort((a,b)=>b.overall - a.overall);
  if (Math.random() < (0.75 - fatigueBias)) return g1;
  return g2 ?? g1;
}

function selectLineForEvent(team: Team): Skater[] {
  const forwards = team.skaters.filter(s => s.position !== "D");
  const defense = team.skaters.filter(s => s.position === "D");
  const fw = weightedSample(forwards, 3, s => s.overall);
  const df = weightedSample(defense, 2, s => s.overall);
  return [...fw, ...df];
}

function weightedSample<T>(pool: T[], count: number, weight: (t: T) => number): T[] {
  const out: T[] = []; const copy = [...pool];
  for (let i=0;i<count && copy.length;i++){
    const sum = copy.reduce((a,x)=>a + Math.max(1, weight(x)), 0);
    let r = Math.random() * sum; let idx = 0;
    for (; idx < copy.length; idx++) {
      r -= Math.max(1, weight(copy[idx]));
      if (r <= 0) break;
    }
    out.push(copy[idx]); copy.splice(idx, 1);
  }
  return out;
}

function simulateQuickGame(home: Team, away: Team): { box: BoxScore; winnerHome: boolean; ot: boolean } {
  const hs = teamStrength(home); const as = teamStrength(away);
  const hExp = Math.max(1.6, (hs.off / (as.def + as.goa*0.65)) * 2.7);
  const aExp = Math.max(1.4, (as.off / (hs.def + hs.goa*0.65)) * 2.5);

  let hGoals = poisson(hExp); let aGoals = poisson(aExp);
  let ot = false;
  if (hGoals === aGoals) {
    ot = true;
    const homeWin = Math.random() < 0.55;
    if (homeWin) hGoals += 1; else aGoals += 1;
  }

  const hShots = Math.max(hGoals + rnd(20, 38), rnd(22, 42));
  const aShots = Math.max(aGoals + rnd(18, 36), rnd(20, 40));

  const hGoalie = pickGoalie(home);
  const aGoalie = pickGoalie(away);

  const events: GoalEvent[] = [];
  const distribute = (team: Team, teamId: ID, goals: number) => {
    for (let i=0;i<goals;i++){
      const line = selectLineForEvent(team);
      const minute = rnd(0, ot ? 64 : 59);
      const scorer = choice(line);
      const assisters = line.filter(p=>p.id!==scorer.id).sort(()=>Math.random()-0.5).slice(0, rnd(0,2));
      events.push({ minute, teamId, scorerId: scorer.id, assist1Id: assisters[0]?.id, assist2Id: assisters[1]?.id });
    }
  };
  distribute(home, home.id, hGoals);
  distribute(away, away.id, aGoals);
  events.sort((a,b)=>a.minute - b.minute);

  const box: BoxScore = {
    gameId: "",
    homeId: home.id,
    awayId: away.id,
    goals: events,
    shots: { [home.id]: hShots, [away.id]: aShots },
    goalieShots: { [home.id]: aShots, [away.id]: hShots },
    goalieSaves: { [home.id]: aShots - aGoals, [away.id]: hShots - hGoals },
    homeGoalieId: hGoalie.id,
    awayGoalieId: aGoalie.id,
    ot,
  };

  return { box, winnerHome: hGoals > aGoals, ot };
}

// -------------------------- STATE & UPDATERS --------------------------
function newSeason(seasonYear = "2025-26"): SeasonState {
  const teams = loadNHLLeague();
  const teamOrder = TEAM_META.map(t => t.id);
  const schedule = generateFullSeasonSchedule(teamOrder, 190);
  return {
    seasonYear,
    currentDay: 1,
    totalDays: Math.max(...schedule.map(g=>g.day)),
    schedule,
    boxScores: {},
    teams,
    teamOrder,
  };
}

function applyGameResult(state: SeasonState, game: Game, box: BoxScore, winnerHome: boolean, ot: boolean) {
  box.gameId = game.id;
  state.boxScores[game.id] = box;
  const home = state.teams[game.homeId]; const away = state.teams[game.awayId];
  const homeGoals = box.goals.filter(g=>g.teamId===home.id).length;
  const awayGoals = box.goals.filter(g=>g.teamId===away.id).length;

  home.gf += homeGoals; home.ga += awayGoals; home.shotsFor += box.shots[home.id]; home.shotsAgainst += box.shots[away.id];
  away.gf += awayGoals; away.ga += homeGoals; away.shotsFor += box.shots[away.id]; away.shotsAgainst += box.shots[home.id];

  if (homeGoals > awayGoals) {
    if (ot) { home.w += 1; home.pts += 2; away.otl += 1; away.pts += 1; } else { home.w += 1; home.pts += 2; away.l += 1; }
  } else {
    if (ot) { away.w += 1; away.pts += 2; home.otl += 1; home.pts += 1; } else { away.w += 1; away.pts += 2; home.l += 1; }
  }

  const allPlayers: Record<ID, Player> = {};
  for (const p of home.skaters) allPlayers[p.id] = p;
  for (const p of away.skaters) allPlayers[p.id] = p;
  for (const g of home.goalies) allPlayers[g.id] = g;
  for (const g of away.goalies) allPlayers[g.id] = g;

  for (const ev of box.goals) {
    const s = allPlayers[ev.scorerId] as Skater | undefined; if (s && (s as Skater).position) { (s as Skater).g += 1; (s as Skater).p += 1; (s as Skater).shots += 1; }
    if (ev.assist1Id) { const a = allPlayers[ev.assist1Id] as Skater | undefined; if (a && (a as Skater).position) { (a as Skater).a += 1; (a as Skater).p += 1; } }
    if (ev.assist2Id) { const a2 = allPlayers[ev.assist2Id] as Skater | undefined; if (a2 && (a2 as Skater).position) { (a2 as Skater).a += 1; (a2 as Skater).p += 1; } }
  }

  for (const s of home.skaters) { s.gp += 1; s.plusMinus += (homeGoals - awayGoals); }
  for (const s of away.skaters) { s.gp += 1; s.plusMinus += (awayGoals - homeGoals); }

  const hGoalie = home.goalies.find(g => g.id === box.homeGoalieId)!;
  const aGoalie = away.goalies.find(g => g.id === box.awayGoalieId)!;
  for (const g of [hGoalie, aGoalie]) { g.gp += 1; g.gs += 1; }

  const homeWon = homeGoals > awayGoals;
  if (homeWon) { hGoalie.w += 1; aGoalie.l += ot ? 0 : 1; aGoalie.otl += ot ? 1 : 0; }
  else { aGoalie.w += 1; hGoalie.l += ot ? 0 : 1; hGoalie.otl += ot ? 1 : 0; }

  hGoalie.shotsAgainst += box.goalieShots[home.id]; hGoalie.saves += box.goalieSaves[home.id];
  aGoalie.shotsAgainst += box.goalieShots[away.id]; aGoalie.saves += box.goalieSaves[away.id];

  if (awayGoals === 0) hGoalie.so += 1;
  if (homeGoals === 0) aGoalie.so += 1;

  for (const g of [hGoalie, aGoalie]) {
    const goalsAgainst = g.shotsAgainst - g.saves;
    const minutes = g.gs * 60;
    g.gaa = minutes > 0 ? (goalsAgainst * 60) / minutes : 0;
    g.svpct = g.shotsAgainst > 0 ? g.saves / g.shotsAgainst : 0;
  }
}

function simGame(state: SeasonState, gameId: GameId): void {
  const game = state.schedule.find(g => g.id === gameId);
  if (!game || game.played) return;
  const home = state.teams[game.homeId];
  const away = state.teams[game.awayId];
  const { box, winnerHome, ot } = simulateQuickGame(home, away);
  applyGameResult(state, game, box, winnerHome, ot);
  game.played = true;
}

function simDay(state: SeasonState): void {
  const todays = state.schedule.filter(g => g.day === state.currentDay && !g.played);
  for (const g of todays) simGame(state, g.id);
  state.currentDay = Math.min(state.currentDay + 1, state.totalDays);
}

function simToEnd(state: SeasonState): void {
  while (state.schedule.some(g => !g.played)) { simDay(state); }
}

// Live-sim: minute-by-minute (fast but chunked)
function liveSim(state: SeasonState, game: Game, setBox: (b: BoxScore)=>void, getTactics: ()=>{home:Tactics,away:Tactics}) {
  const home = state.teams[game.homeId]; const away = state.teams[game.awayId];
  const hs = teamStrength(home); const as = teamStrength(away);
  const hGoalie = pickGoalie(home); const aGoalie = pickGoalie(away);
  const box: BoxScore = {
    gameId: game.id, homeId: home.id, awayId: away.id, goals: [], shots: { [home.id]: 0, [away.id]: 0 },
    goalieShots: { [home.id]: 0, [away.id]: 0 }, goalieSaves: { [home.id]: 0, [away.id]: 0 },
    homeGoalieId: hGoalie.id, awayGoalieId: aGoalie.id, ot: false
  };

  for (let minute=0; minute<60; minute++) {
    const { home: ht, away: at } = getTactics();
    const hRate = Math.max(0.15, (hs.off / (as.def + as.goa*0.65)) * (ht === "Aggressive" ? 1.15 : ht === "Defensive" ? 0.9 : 1.0));
    const aRate = Math.max(0.14, (as.off / (hs.def + hs.goa*0.65)) * (at === "Aggressive" ? 1.15 : at === "Defensive" ? 0.9 : 1.0));

    const hShotsThisMin = Math.random() < 0.55 ? rnd(0,2) : rnd(0,1);
    const aShotsThisMin = Math.random() < 0.55 ? rnd(0,2) : rnd(0,1);
    box.shots[home.id] += hShotsThisMin; box.shots[away.id] += aShotsThisMin;
    box.goalieShots[home.id] += aShotsThisMin; box.goalieShots[away.id] += hShotsThisMin;

    for (let s=0; s<hShotsThisMin; s++){
      const pGoal = Math.min(0.16, hRate / 12);
      if (Math.random() < pGoal) {
        const line = selectLineForEvent(home);
        const scorer = choice(line);
        const assisters = line.filter(p=>p.id!==scorer.id).sort(()=>Math.random()-0.5).slice(0, rnd(0,2));
        box.goals.push({ minute, teamId: home.id, scorerId: scorer.id, assist1Id: assisters[0]?.id, assist2Id: assisters[1]?.id });
      }
    }
    for (let s=0; s<aShotsThisMin; s++){
      const pGoal = Math.min(0.16, aRate / 12);
      if (Math.random() < pGoal) {
        const line = selectLineForEvent(away);
        const scorer = choice(line);
        const assisters = line.filter(p=>p.id!==scorer.id).sort(()=>Math.random()-0.5).slice(0, rnd(0,2));
        box.goals.push({ minute, teamId: away.id, scorerId: scorer.id, assist1Id: assisters[0]?.id, assist2Id: assisters[1]?.id });
      }
    }

    if (minute % 5 === 0) setBox({...box});
  }

  const hGoals = box.goals.filter(g=>g.teamId === home.id).length;
  const aGoals = box.goals.filter(g=>g.teamId === away.id).length;
  if (hGoals === aGoals) {
    box.ot = true; const otMinute = 60 + rnd(1,5); const homeWin = Math.random() < 0.52;
    if (homeWin) {
      const line = selectLineForEvent(home); const scorer = choice(line); const assisters = line.filter(p=>p.id!==scorer.id).slice(0, rnd(0,2));
      box.goals.push({ minute: otMinute, teamId: home.id, scorerId: scorer.id, assist1Id: assisters[0]?.id, assist2Id: assisters[1]?.id });
    } else {
      const line = selectLineForEvent(away); const scorer = choice(line); const assisters = line.filter(p=>p.id!==scorer.id).slice(0, rnd(0,2));
      box.goals.push({ minute: otMinute, teamId: away.id, scorerId: scorer.id, assist1Id: assisters[0]?.id, assist2Id: assisters[1]?.id });
    }
  }

  const finalH = box.goals.filter(g=>g.teamId === home.id).length;
  const finalA = box.goals.filter(g=>g.teamId === away.id).length;
  box.goalieSaves[home.id] = box.goalieShots[home.id] - finalA;
  box.goalieSaves[away.id] = box.goalieShots[away.id] - finalH;

  setBox({...box});
}

// -------------------------- HOOK: useSeason --------------------------
function useSeason() {
  const [state, setState] = useState<SeasonState>(() => newSeason());
  const reset = () => setState(newSeason());
  const simToday = () => setState(prev => { const s = structuredClone(prev) as SeasonState; simDay(s); return s; });
  const simAll = () => setState(prev => { const s = structuredClone(prev) as SeasonState; simToEnd(s); return s; });
  const simToDate = (day: number) => setState(prev => { const s = structuredClone(prev) as SeasonState; while (s.currentDay <= day) simDay(s); return s; });
  const simOne = (id: GameId) => setState(prev => { const s = structuredClone(prev) as SeasonState; simGame(s, id); return s; });
  return { state, setState, reset, simToday, simAll, simToDate, simOne } as const;
}

// -------------------------- UI COMPONENTS --------------------------
function TeamBadge({ team }: { team: Team }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-bold">{team.abbrev}</span>
      <span className="font-medium text-foreground">{team.name}</span>
    </div>
  );
}

function Standings({ state }: { state: SeasonState }) {
  const teams = state.teamOrder.map(id => state.teams[id]);
  const byConf: Record<Team["conference"], Team[]> = { East: [], West: [] };
  for (const t of teams) byConf[t.conference].push(t);
  for (const k of Object.keys(byConf) as Team["conference"][]) {
    byConf[k].sort((a,b) => b.pts - a.pts || (b.w - a.w) || (a.ga - b.ga));
  }
  const Row = ({ t }: { t: Team }) => (
    <tr className="odd:bg-muted/50">
      <td className="px-2 py-1 text-foreground">{t.abbrev}</td>
      <td className="px-2 py-1 text-right text-foreground">{t.w}-{t.l}-{t.otl}</td>
      <td className="px-2 py-1 text-right font-semibold text-foreground">{t.pts}</td>
      <td className="px-2 py-1 text-right text-muted-foreground">{t.gf}</td>
      <td className="px-2 py-1 text-right text-muted-foreground">{t.ga}</td>
      <td className="px-2 py-1 text-right text-muted-foreground">{t.shotsFor}</td>
      <td className="px-2 py-1 text-right text-muted-foreground">{t.shotsAgainst}</td>
    </tr>
  );
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {(["East","West"] as Team["conference"][]).map(conf => (
        <Card key={conf} className="p-4">
          <h3 className="text-lg font-semibold mb-2 text-foreground">{conf} Standings</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="px-2 py-1">Team</th>
                <th className="px-2 py-1 text-right">W-L-OTL</th>
                <th className="px-2 py-1 text-right">PTS</th>
                <th className="px-2 py-1 text-right">GF</th>
                <th className="px-2 py-1 text-right">GA</th>
                <th className="px-2 py-1 text-right">SF</th>
                <th className="px-2 py-1 text-right">SA</th>
              </tr>
            </thead>
            <tbody>
              {byConf[conf].map(t => <Row key={t.id} t={t} />)}
            </tbody>
          </table>
        </Card>
      ))}
    </div>
  );
}

function LeagueScores({ state, onOpenGame }: { state: SeasonState; onOpenGame: (g: Game)=>void }) {
  const days = [state.currentDay - 1, state.currentDay, state.currentDay + 1].filter(d => d >= 1 && d <= state.totalDays);
  const byDay: Record<number, Game[]> = {};
  for (const d of days) byDay[d] = state.schedule.filter(g => g.day === d);
  return (
    <div className="space-y-4">
      {days.map(d => (
        <Card key={d} className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-foreground">Day {d}</h3>
            <span className="text-sm text-muted-foreground">{byDay[d].filter(g=>g.played).length}/{byDay[d].length} final</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {byDay[d].map(g => {
              const home = state.teams[g.homeId]; const away = state.teams[g.awayId];
              const bs = g.played ? state.boxScores[g.id] : undefined;
              const score = g.played ? `${bs?.goals.filter(x=>x.teamId===away.id).length} - ${bs?.goals.filter(x=>x.teamId===home.id).length}` : "vs";
              return (
                <Button key={g.id} variant="outline" onClick={()=>onOpenGame(g)} className="text-left h-auto p-3">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{away.abbrev}</span>
                      <span className="text-muted-foreground">@</span>
                      <span className="font-semibold">{home.abbrev}</span>
                    </div>
                    <div className="text-sm tabular-nums">{score}{g.played && (bs?.ot ? " (OT)" : "")}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}

function PlayerLeaders({ state }: { state: SeasonState }) {
  const players: Skater[] = [];
  for (const id of state.teamOrder) for (const s of state.teams[id].skaters) players.push(s);
  const topPts = [...players].sort((a,b)=> b.p - a.p).slice(0, 10);
  const topG = [...players].sort((a,b)=> b.g - a.g).slice(0, 10);
  const topA = [...players].sort((a,b)=> b.a - a.a).slice(0, 10);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[{title:"Points",list:topPts,val:(p:Skater)=>p.p},{title:"Goals",list:topG,val:(p:Skater)=>p.g},{title:"Assists",list:topA,val:(p:Skater)=>p.a}].map(s => (
        <Card key={s.title} className="p-4">
          <h3 className="text-lg font-semibold mb-2 text-foreground">League Leaders — {s.title}</h3>
          <ol className="text-sm space-y-1">
            {s.list.map((p,i)=> (
              <li key={p.id} className="flex justify-between">
                <span className="text-muted-foreground">{i+1}. {p.name}</span>
                <span className="font-semibold tabular-nums text-foreground">{s.val(p)}</span>
              </li>
            ))}
          </ol>
        </Card>
      ))}
    </div>
  );
}

function BoxScoreModal({ state, game, onClose }: { state: SeasonState; game: Game; onClose: ()=>void }) {
  const box = state.boxScores[game.id];
  const home = state.teams[game.homeId]; const away = state.teams[game.awayId];
  if (!box) return null;
  const h = box.goals.filter(g => g.teamId === home.id).length;
  const a = box.goals.filter(g => g.teamId === away.id).length;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl p-4">
        <div className="flex items-center justify-between border-b pb-2 mb-3">
          <h3 className="text-xl font-semibold text-foreground">{away.abbrev} {a} @ {home.abbrev} {h} {box.ot?"(OT)":""}</h3>
          <Button onClick={onClose} variant="secondary">Close</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-xl p-3">
            <h4 className="font-semibold mb-2 text-foreground">Scoring Summary</h4>
            <ul className="space-y-1 text-sm">
              {box.goals.map((g,i)=>{
                const team = g.teamId === home.id ? home : away;
                const s = [...team.skaters, ...team.goalies].find(p=>p.id===g.scorerId)?.name ?? "Unknown";
                const a1 = g.assist1Id ? [...team.skaters, ...team.goalies].find(p=>p.id===g.assist1Id)?.name : undefined;
                const a2 = g.assist2Id ? [...team.skaters, ...team.goalies].find(p=>p.id===g.assist2Id)?.name : undefined;
                return (
                  <li key={i} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{`${g.minute.toString().padStart(2,"0")}'`}</span>
                    <span className="font-medium text-foreground">{team.abbrev} — {s}{a1?` (A: ${a1}${a2?`, ${a2}`:""})`: ""}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="bg-muted/50 rounded-xl p-3">
            <h4 className="font-semibold mb-2 text-foreground">Team Stats</h4>
            <table className="w-full text-sm">
              <tbody>
                <tr><td className="py-1 text-muted-foreground">Shots</td><td className="py-1 text-right tabular-nums text-foreground">{box.shots[away.id]}</td><td className="py-1 text-right tabular-nums text-foreground">{box.shots[home.id]}</td></tr>
                <tr><td className="py-1 text-muted-foreground">Saves</td><td className="py-1 text-right tabular-nums text-foreground">{box.goalieSaves[away.id]}</td><td className="py-1 text-right tabular-nums text-foreground">{box.goalieSaves[home.id]}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}

function GameControlBar({ state, onSimToday, onSimAll, onSimToDate }: { state: SeasonState; onSimToday: ()=>void; onSimAll: ()=>void; onSimToDate: (d:number)=>void; }) {
  const [toDay, setToDay] = useState(state.currentDay);
  useEffect(()=>setToDay(state.currentDay), [state.currentDay]);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button onClick={onSimToday} className="gap-2">
        <SkipForward className="w-4 h-4" />
        Sim Today
      </Button>
      <Button onClick={()=>onSimToDate(toDay)} variant="secondary" className="gap-2">
        <Calendar className="w-4 h-4" />
        Sim to Day
      </Button>
      <input 
        type="number" 
        className="w-24 px-2 py-2 border border-border rounded-lg bg-background text-foreground" 
        value={toDay} 
        onChange={e=>setToDay(Number(e.target.value))} 
        min={1} 
        max={state.totalDays} 
      />
      <Button onClick={onSimAll} variant="destructive" className="gap-2">
        <FastForward className="w-4 h-4" />
        Sim to End of Season
      </Button>
    </div>
  );
}

function LiveSimPanel({ state, game, onFinish }: { state: SeasonState; game: Game; onFinish: ()=>void }) {
  const [tacticsHome, setTacticsHome] = useState<Tactics>("Balanced");
  const [tacticsAway, setTacticsAway] = useState<Tactics>("Balanced");
  const [box, setBox] = useState<BoxScore | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const start = () => {
    if (isRunning) return;
    setIsRunning(true);
    setTimeout(() => {
      liveSim(state, game, setBox, ()=>({home:tacticsHome, away:tacticsAway}));
      setIsRunning(false);
    }, 50);
  };

  const finish = () => {
    if (!box) return;
    const s = structuredClone(state) as SeasonState;
    applyGameResult(s, game, box, (box.goals.filter(g=>g.teamId===game.homeId).length) > (box.goals.filter(g=>g.teamId===game.awayId).length), box.ot);
    const g = s.schedule.find(x=>x.id===game.id)!; g.played = true;
    // Commit via onFinish (parent reloads state)
    onFinish();
  };

  const home = state.teams[game.homeId];
  const away = state.teams[game.awayId];
  const h = box?.goals.filter(g=>g.teamId===home.id).length ?? 0;
  const a = box?.goals.filter(g=>g.teamId===away.id).length ?? 0;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-foreground">Live Sim — {away.abbrev} @ {home.abbrev}</h3>
        <div className="text-sm text-muted-foreground">Control tactics to influence chance rates</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 border border-border rounded-2xl p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold tabular-nums text-foreground">{a} - {h}</div>
            <div className="flex gap-2">
              <Button onClick={start} disabled={isRunning} className="gap-2">
                <Play className="w-4 h-4" />
                Start
              </Button>
              <Button onClick={finish} disabled={!box} variant="secondary">
                Finalize & Save
              </Button>
            </div>
          </div>
          <div className="h-48 overflow-auto bg-muted/50 rounded-xl p-2 text-sm">
            {!box && <div className="text-muted-foreground">Press Start to begin simulation...</div>}
            {box && box.goals.map((g,i)=>{
              const team = g.teamId === home.id ? home : away;
              const s = [...team.skaters, ...team.goalies].find(p=>p.id===g.scorerId)?.name ?? "Unknown";
              return <div key={i} className="py-0.5 text-foreground">{team.abbrev} — {s} @ {g.minute}'</div>;
            })}
          </div>
        </div>
        <div className="space-y-3">
          <Card className="p-3">
            <div className="font-semibold mb-1 text-foreground">Home Tactics</div>
            <select 
              className="w-full border border-border rounded-xl px-2 py-2 bg-background text-foreground" 
              value={tacticsHome} 
              onChange={e=>setTacticsHome(e.target.value as Tactics)}
            >
              <option>Balanced</option>
              <option>Aggressive</option>
              <option>Defensive</option>
            </select>
          </Card>
          <Card className="p-3">
            <div className="font-semibold mb-1 text-foreground">Away Tactics</div>
            <select 
              className="w-full border border-border rounded-xl px-2 py-2 bg-background text-foreground" 
              value={tacticsAway} 
              onChange={e=>setTacticsAway(e.target.value as Tactics)}
            >
              <option>Balanced</option>
              <option>Aggressive</option>
              <option>Defensive</option>
            </select>
          </Card>
          {box && (
            <Card className="p-3">
              <div className="font-semibold mb-1 text-foreground">Team Stats</div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between text-foreground"><span>{away.abbrev} Shots</span><span className="tabular-nums">{box.shots[away.id]}</span></div>
                <div className="flex justify-between text-foreground"><span>{home.abbrev} Shots</span><span className="tabular-nums">{box.shots[home.id]}</span></div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Card>
  );
}

// -------------------------- MAIN EXPORT --------------------------
export default function FranchiseMode() {
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [coachName, setCoachName] = useState<string>("");
  const [franchiseStarted, setFranchiseStarted] = useState<boolean>(false);
  
  const { state, setState, reset, simToday, simAll, simToDate, simOne } = useSeason();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [view, setView] = useState<"scores"|"standings"|"leaders"|"livesim"|"trades"|"team">("scores");
  const [liveSimGame, setLiveSimGame] = useState<Game | null>(null);

  const handleTeamSelection = (team: string, coach: string) => {
    setSelectedTeam(team);
    setCoachName(coach);
    setFranchiseStarted(true);
  };

  const openGame = (g: Game) => setSelectedGame(g);
  const closeGame = () => setSelectedGame(null);

  const startLiveSim = () => {
    const g = state.schedule.find(g => g.day === state.currentDay && !g.played);
    if (g) { setLiveSimGame(g); setView("livesim"); }
  };

  const finalizeLiveSim = () => {
    setState(prev => ({...prev}));
    setLiveSimGame(null);
    setView("scores");
  };

  const resetFranchise = () => {
    setFranchiseStarted(false);
    setSelectedTeam("");
    setCoachName("");
    reset();
  };

  if (!franchiseStarted) {
    return <TeamCoachSelection onComplete={handleTeamSelection} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <GameHeader />
      <div className="p-4 max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Franchise Mode — {state.seasonYear}</h1>
            <div className="text-muted-foreground">Coach {coachName} • {selectedTeam} • Day {state.currentDay} / {state.totalDays}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={reset} variant="outline">New Season</Button>
            <Button onClick={resetFranchise} variant="outline">Change Team</Button>
            <Button onClick={startLiveSim} className="gap-2">
              <Play className="w-4 h-4" />
              Play (Live Sim)
            </Button>
          </div>
        </div>

        <GameControlBar state={state} onSimToday={simToday} onSimAll={simAll} onSimToDate={simToDate} />

        <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="scores">Scores</TabsTrigger>
            <TabsTrigger value="standings">Standings</TabsTrigger>
            <TabsTrigger value="leaders">Leaders</TabsTrigger>
            <TabsTrigger value="trades">Trades</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="mystats">My Stats</TabsTrigger>
            <TabsTrigger value="livesim" disabled={!liveSimGame}>Live Sim</TabsTrigger>
          </TabsList>

          <TabsContent value="scores">
            <LeagueScores state={state} onOpenGame={openGame} />
          </TabsContent>

          <TabsContent value="standings">
            <Standings state={state} />
          </TabsContent>

          <TabsContent value="leaders">
            <PlayerLeaders state={state} />
          </TabsContent>

          <TabsContent value="trades">
            <TradeCenter 
              state={{
                seasonYear: `${state.seasonYear}`,
                currentDay: state.currentDay,
                totalDays: state.totalDays,
                schedule: [],
                boxScores: {},
                teams: Object.fromEntries(Object.entries(state.teams).map(([id, team]) => [
                  id,
                  {
                    id: team.id,
                    name: team.name,
                    abbrev: team.abbrev,
                    conference: team.conference,
                    division: team.division,
                    capSpace: team.capSpace,
                    skaters: team.skaters,
                    goalies: team.goalies,
                    w: team.w, l: team.l, otl: team.otl, gf: team.gf, ga: team.ga, pts: team.pts, shotsFor: team.shotsFor, shotsAgainst: team.shotsAgainst
                  }
                ])),
                teamOrder: state.teamOrder
              }}
              setState={(newState) => {
                if (typeof newState === 'function') {
                  setState(prevState => {
                    const updated = newState({
                      ...prevState,
                      teams: Object.fromEntries(Object.entries(prevState.teams).map(([id, team]) => [
                        id,
                        {
                          ...team,
                          skaters: team.skaters,
                          goalies: team.goalies
                        }
                      ]))
                    });
                    return {
                      ...prevState,
                      teams: Object.fromEntries(Object.entries(updated.teams).map(([id, team]) => [
                        id,
                        {
                          ...prevState.teams[id],
                          skaters: team.skaters,
                          goalies: team.goalies,
                          capSpace: team.capSpace
                        }
                      ]))
                    };
                  });
                }
              }}
            />
          </TabsContent>

          <TabsContent value="team">
            <TeamManager state={state} setState={setState} userTeamId={selectedTeam} />
          </TabsContent>

          <TabsContent value="mystats">
            <MyTeamStatsPanel state={state} myTeamId={selectedTeam} />
          </TabsContent>

          <TabsContent value="livesim">
            {liveSimGame && (
              <LiveSimPanel state={state} game={liveSimGame} onFinish={finalizeLiveSim} />
            )}
          </TabsContent>
        </Tabs>

        {selectedGame && selectedGame.played && (
          <BoxScoreModal state={state} game={selectedGame} onClose={closeGame} />
        )}

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2 text-foreground">Quick Actions</h3>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={()=>simToday()} className="gap-2">
              <SkipForward className="w-4 h-4" />
              Sim Today
            </Button>
            <Button onClick={()=>simToDate(state.currentDay+7)} variant="secondary" className="gap-2">
              <Calendar className="w-4 h-4" />
              Advance 7 Days
            </Button>
            <Button onClick={()=>simAll()} variant="destructive" className="gap-2">
              <FastForward className="w-4 h-4" />
              Sim to End
            </Button>
          </div>
        </Card>

        <div className="text-xs text-muted-foreground pb-6">
          <p>Comprehensive franchise simulation powered by your NHL database with live stats tracking, standings, and trade functionality.</p>
        </div>
      </div>
    </div>
  );
}