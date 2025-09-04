// CalendarSimHub_fix.tsx
// Fix for: "After I simulate, results don't show in the Season Calendar."
// Root cause: state was being mutated in-place (nested objects), so React didn't detect changes.
// This version makes **immutable** updates to schedule + teams + boxScores so the calendar re-renders.

// Drop-in replacement for your CalendarSimHub. It includes:
// - Immutable state updates when simming to day or live sim finish
// - Safe team/player stat application without mutating the previous state
// - Calendar will immediately reflect Played/Final

import React, { useMemo, useState, useEffect, useRef } from "react";
import { RetirementEngine, type Retiree, computeAwardsScore } from "../../utils/retirement";
import { playerAges } from '../../utils/playerAgeUpdater';
import { 
  LeagueState, 
  CapManager, 
  TradeEngine
} from "@/lib/salary-cap";
import DraftRoom from "./DraftRoom";
import FreeAgencyHub from "./FreeAgencyHub";
import FreeAgencySimControls from "./FreeAgencySimControls";
import { DraftEngine, DraftState } from "./DraftEngine";
import { FreeAgencyEngine, FreeAgencyState, startFreeAgency } from "./FreeAgencyEngine";

type ID = string;

// ─── Types (match your project) ──────────────────────────────────────────────
export type Skater = {
  id: ID; name: string; position: "C"|"LW"|"RW"|"D";
  overall: number; shooting: number; passing: number; defense: number; stamina: number;
  gp: number; g: number; a: number; p: number; pim: number; shots: number; plusMinus: number;
  ppG?: number; shG?: number;
  playoffGP?: number; playoffG?: number; playoffA?: number; playoffP?: number;
  age?: number; contractYears?: number; contractValue?: number; image?: string;
};
export type Goalie = {
  id: ID; name: string; position: "G";
  overall: number; reflexes: number; positioning: number; reboundControl: number; stamina: number;
  gp: number; gs: number; w: number; l: number; otl: number; so: number;
  shotsAgainst: number; saves: number; gaa: number; svpct: number;
  age?: number; contractYears?: number; contractValue?: number; image?: string;
};
export type Team = {
  id: ID; name: string; abbrev: string; conference: "East"|"West"; 
  division: "Atlantic" | "Metropolitan" | "Central" | "Pacific";
  skaters: Skater[]; goalies: Goalie[];
  w: number; l: number; otl: number; gf: number; ga: number; shotsFor: number; shotsAgainst: number;
  ppAttempts?: number; ppGoals?: number; foWon?: number; foLost?: number;
  pts: number; capSpace: number; // Required for compatibility
  contractExpiring?: string[]; // player IDs with expiring contracts
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
  // Salary Cap System
  capLeague: LeagueState;
  capManager: CapManager;
  tradeEngine: TradeEngine;
  isRegularSeasonComplete?: boolean;
  playoffSeries?: PlayoffSeries[];
  currentPlayoffRound?: number;
  // Offseason phases
  offseasonPhase?: 'retirement' | 'hof' | 'lottery' | 'draft' | 'resigning' | 'freeagency' | 'arbitration' | 'complete';
  retiredPlayers?: RetiredPlayer[];
  hofInductees?: HofInductee[];
  draftLottery?: DraftLotteryResult[];
  draftPicks?: DraftPick[];
  resignings?: ResigningResult[];
  freeAgency?: FAOutcome;
  arbitrationAwards?: ArbitrationAward[];
};

export type RetiredPlayer = {
  id: string;
  name: string;
  position: string;
  age: number;
  careerStats: {
    games: number;
    goals: number;
    assists: number;
    points: number;
    cups: number;
  };
  retirementReason: string;
};

export type HofInductee = {
  id: string;
  name: string;
  position: string;
  hofScore: number;
  classYear: number;
  careerHighlights: string;
};

export type DraftLotteryResult = {
  teamId: string;
  position: number;
  probability: number;
  moved: boolean;
};

export type DraftPick = {
  overall: number;
  round: number;
  pick: number;
  teamId: string;
  playerId: string;
  playerName: string;
  position: string;
  potential: number;
};

export type ResigningResult = {
  playerId: string;
  playerName: string;
  teamId: string;
  resigned: boolean;
  contractYears: number;
  contractValue: number;
  reason: string;
};

// Free Agency Types
export type MarketFreeAgent = {
  playerId: string;
  name: string;
  position: string; // 'F','D','G'
  age: number;
  overall: number;       // 0-100 current talent
  potential: number;     // 0-100 upside (or =overall if unknown)
  lastSeasonPoints: number; // for skaters (G can be 0)
  lastSeasonWAR: number; // optional; 0 if not tracked
  rfa: boolean;             // RFAs require offer sheets or rights
  rightsTeamId?: string; // if RFA: the team holding rights (qualifying team)
  starPower: boolean;       // brand/market draw
  injuries: number;         // notable injuries last season
  image?: string;
};

export type TeamFAContext = {
  teamId: string;
  teamName: string;
  capSpace: number;                  // remaining cap space in $M
  isContender: boolean;
  needs: Record<string, number>;     // 'F','D','G' -> magnitude need 0..5
  marketAttractiveness: number;   // 0..100
  coachPreferenceSkill: number;   // 0..100 (fit to system)
  developmentTrack: number;       // 0..100 (for young players)
  rebuilding: boolean;            // teams rebuilding value potential/term
};

export type FAOffer = {
  teamId: string;
  teamName: string;
  aav: number; // $M
  years: number;
  clause: string; // None/NTC/NMC
  totalValue: number;
};

export type FAAgreement = {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  aav: number;
  years: number;
  clause: string;
  matchedByRightsTeam: boolean; // for RFA offers matched by original team
  note: string; // e.g., "Offer sheet matched", "Signed UFA deal"
};

export type FAOutcome = {
  signings: FAAgreement[];
  news: string[];
  remaining: string[]; // playerIds still unsigned
};

export type ArbitrationAward = {
  playerId: string;
  playerName: string;
  rightsTeamId: string;
  rightsTeamName: string;
  aav: number; // $M
  years: number;
  accepted: boolean;
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

// ─── Playoff Stats Card Component ───────────────────────────────────────────
function PlayoffStatsCard({ state }: { state: SeasonState }) {
  const allSkaters = Object.values(state.teams).flatMap(t => t.skaters);
  const playoffSkaters = allSkaters.filter(s => (s.playoffGP || 0) > 0);
  
  const topScorers = playoffSkaters
    .sort((a, b) => (b.playoffP || 0) - (a.playoffP || 0))
    .slice(0, 10);
  
  const topGoalScorers = playoffSkaters
    .sort((a, b) => (b.playoffG || 0) - (a.playoffG || 0))
    .slice(0, 5);

  if (playoffSkaters.length === 0) return null;

  return (
    <div className="mt-4 p-4 bg-white rounded-lg border border-yellow-300">
      <h4 className="font-semibold text-yellow-800 mb-3">🏆 Playoff Leaders</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Points Leaders */}
        <div>
          <h5 className="font-medium text-sm text-yellow-700 mb-2">Most Points</h5>
          <div className="space-y-1">
            {topScorers.map((player, idx) => (
              <div key={player.id} className="flex justify-between text-sm">
                <span>{idx + 1}. {player.name}</span>
                <span className="font-medium">{player.playoffP || 0}pts ({player.playoffG || 0}G, {player.playoffA || 0}A)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Goal Leaders */}
        <div>
          <h5 className="font-medium text-sm text-yellow-700 mb-2">Most Goals</h5>
          <div className="space-y-1">
            {topGoalScorers.map((player, idx) => (
              <div key={player.id} className="flex justify-between text-sm">
                <span>{idx + 1}. {player.name}</span>
                <span className="font-medium">{player.playoffG || 0} goals</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Playoff System ──────────────────────────────────────────────────────────
function generatePlayoffSeries(teams: Record<ID, Team>): PlayoffSeries[] {
  // Get all teams and sort by points for seeding
  const allTeams = Object.values(teams);
  const eastTeams = allTeams.filter(t => t.conference === "East").sort((a, b) => {
    const aPts = (a.w * 2) + a.otl;
    const bPts = (b.w * 2) + b.otl;
    return bPts - aPts;
  }).slice(0, 8);
  const westTeams = allTeams.filter(t => t.conference === "West").sort((a, b) => {
    const aPts = (a.w * 2) + a.otl;
    const bPts = (b.w * 2) + b.otl;
    return bPts - aPts;
  }).slice(0, 8);
  
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

function simulatePlayoffSeries(series: PlayoffSeries, teams: Record<ID, Team>): { simulatedSeries: PlayoffSeries; updatedTeams: Record<ID, Team> } {
  let updatedTeams = { ...teams };
  const cloneTeam = (t: Team): Team => ({
    ...t,
    skaters: t.skaters.map(s => ({ ...s })),
    goalies: t.goalies.map(g => ({ ...g })),
  });

  const home = cloneTeam(updatedTeams[series.homeId]);
  const away = cloneTeam(updatedTeams[series.awayId]);
  
  let homeWins = series.homeWins;
  let awayWins = series.awayWins;
  
  // Simulate games until one team wins 4
  while (homeWins < 4 && awayWins < 4) {
    const totals = quickSimTotals(home, away);
    
    if (totals.hGoals > totals.aGoals) {
      homeWins++;
      // Enhanced playoff stat distribution for home team
      const sortedHome = [...home.skaters].sort((a, b) => b.overall - a.overall);
      
      // Goals
      for (let i = 0; i < totals.hGoals; i++) {
        const weights = sortedHome.map(s => Math.pow(s.overall / 85, 2.5));
        const totalWeight = sum(weights);
        const rand = Math.random() * totalWeight;
        let cumWeight = 0;
        for (let j = 0; j < sortedHome.length; j++) {
          cumWeight += weights[j];
          if (rand <= cumWeight) {
            sortedHome[j].playoffG = (sortedHome[j].playoffG || 0) + 1;
            sortedHome[j].playoffP = (sortedHome[j].playoffP || 0) + 1;
            break;
          }
        }
      }
      
      // Assists (2 per goal)
      for (let i = 0; i < totals.hGoals * 2; i++) {
        const weights = sortedHome.map(s => Math.pow(s.overall / 85, 2));
        const totalWeight = sum(weights);
        const rand = Math.random() * totalWeight;
        let cumWeight = 0;
        for (let j = 0; j < sortedHome.length; j++) {
          cumWeight += weights[j];
          if (rand <= cumWeight) {
            sortedHome[j].playoffA = (sortedHome[j].playoffA || 0) + 1;
            sortedHome[j].playoffP = (sortedHome[j].playoffP || 0) + 1;
            break;
          }
        }
      }
    } else {
      awayWins++;
      // Enhanced playoff stat distribution for away team
      const sortedAway = [...away.skaters].sort((a, b) => b.overall - a.overall);
      
      // Goals
      for (let i = 0; i < totals.aGoals; i++) {
        const weights = sortedAway.map(s => Math.pow(s.overall / 85, 2.5));
        const totalWeight = sum(weights);
        const rand = Math.random() * totalWeight;
        let cumWeight = 0;
        for (let j = 0; j < sortedAway.length; j++) {
          cumWeight += weights[j];
          if (rand <= cumWeight) {
            sortedAway[j].playoffG = (sortedAway[j].playoffG || 0) + 1;
            sortedAway[j].playoffP = (sortedAway[j].playoffP || 0) + 1;
            break;
          }
        }
      }
      
      // Assists (2 per goal)
      for (let i = 0; i < totals.aGoals * 2; i++) {
        const weights = sortedAway.map(s => Math.pow(s.overall / 85, 2));
        const totalWeight = sum(weights);
        const rand = Math.random() * totalWeight;
        let cumWeight = 0;
        for (let j = 0; j < sortedAway.length; j++) {
          cumWeight += weights[j];
          if (rand <= cumWeight) {
            sortedAway[j].playoffA = (sortedAway[j].playoffA || 0) + 1;
            sortedAway[j].playoffP = (sortedAway[j].playoffP || 0) + 1;
            break;
          }
        }
      }
    }
    
    // Update games played for all players
    [...home.skaters, ...away.skaters].forEach(skater => {
      skater.playoffGP = (skater.playoffGP || 0) + 1;
    });
  }
  
  // Update teams in the record
  updatedTeams[series.homeId] = home;
  updatedTeams[series.awayId] = away;
  
  return { 
    simulatedSeries: {
      ...series,
      homeWins,
      awayWins,
      completed: true,
      winnerId: homeWins === 4 ? series.homeId : series.awayId
    }, 
    updatedTeams 
  };
}

function generateNextRoundSeries(completedSeries: PlayoffSeries[], round: number, teams: Record<ID, Team>): PlayoffSeries[] {
  if (round > 4) return []; // No more rounds after Stanley Cup Finals
  
  const winners = completedSeries.filter(s => s.completed && s.winnerId).map(s => s.winnerId!);
  const newSeries: PlayoffSeries[] = [];
  
  if (round === 2) {
    // Second Round - Conference Semifinals
    const eastWinners = completedSeries
      .filter(s => s.round === 1 && s.id.includes('_E') && s.completed)
      .map(s => s.winnerId!)
      .filter(Boolean);
    const westWinners = completedSeries
      .filter(s => s.round === 1 && s.id.includes('_W') && s.completed)
      .map(s => s.winnerId!)
      .filter(Boolean);
    
    // Pair winners by original seeding (need to determine original seeds)
    for (let i = 0; i < eastWinners.length; i += 2) {
      if (eastWinners[i + 1]) {
        newSeries.push({
          id: `R2_E${Math.floor(i/2) + 1}`,
          round: 2,
          homeId: eastWinners[i],
          awayId: eastWinners[i + 1],
          homeWins: 0,
          awayWins: 0,
          completed: false
        });
      }
    }
    
    for (let i = 0; i < westWinners.length; i += 2) {
      if (westWinners[i + 1]) {
        newSeries.push({
          id: `R2_W${Math.floor(i/2) + 1}`,
          round: 2,
          homeId: westWinners[i],
          awayId: westWinners[i + 1],
          homeWins: 0,
          awayWins: 0,
          completed: false
        });
      }
    }
  } else if (round === 3) {
    // Conference Finals
    const eastWinners = completedSeries
      .filter(s => s.round === 2 && s.id.includes('_E') && s.completed)
      .map(s => s.winnerId!)
      .filter(Boolean);
    const westWinners = completedSeries
      .filter(s => s.round === 2 && s.id.includes('_W') && s.completed)
      .map(s => s.winnerId!)
      .filter(Boolean);
    
    if (eastWinners.length >= 2) {
      newSeries.push({
        id: 'R3_E1',
        round: 3,
        homeId: eastWinners[0],
        awayId: eastWinners[1],
        homeWins: 0,
        awayWins: 0,
        completed: false
      });
    }
    
    if (westWinners.length >= 2) {
      newSeries.push({
        id: 'R3_W1',
        round: 3,
        homeId: westWinners[0],
        awayId: westWinners[1],
        homeWins: 0,
        awayWins: 0,
        completed: false
      });
    }
  } else if (round === 4) {
    // Stanley Cup Finals
    const eastChamp = completedSeries.find(s => s.round === 3 && s.id.includes('_E') && s.completed)?.winnerId;
    const westChamp = completedSeries.find(s => s.round === 3 && s.id.includes('_W') && s.completed)?.winnerId;
    
    if (eastChamp && westChamp) {
      newSeries.push({
        id: 'R4_SCF',
        round: 4,
        homeId: eastChamp,
        awayId: westChamp,
        homeWins: 0,
        awayWins: 0,
        completed: false
      });
    }
  }
  
  return newSeries;
}

// ─── Offseason Functions ──────────────────────────────────────────────────────
function processRetirement(state: SeasonState): SeasonState {
  const currentYear = parseInt(state.seasonYear);
  const retirementEngine = new RetirementEngine(currentYear);
  
  // Get real NHL player ages from database
  
  // Convert all skaters to Retiree format - use real ages when available
  const allSkaters: Retiree[] = [];
  Object.values(state.teams).forEach(team => {
    team.skaters.forEach(skater => {
      // Use real age if available, otherwise generate reasonable age
      const realAge = playerAges[skater.name];
      const age = realAge || (25 + Math.floor(Math.random() * 15)); // 25-39 fallback
      const seasonsPlayed = Math.max(1, age - 18);
      const careerGoals = skater.g * seasonsPlayed + Math.floor(Math.random() * 100);
      const careerPoints = skater.p * seasonsPlayed + Math.floor(Math.random() * 200);
      const cups = team.pts > 100 ? Math.floor(Math.random() * 3) : 0;
      const isLegend = skater.overall >= 90 && careerPoints > 800;
      
      // Contract years remaining - more realistic distribution
      // Most players have 1-3 years left, some are UFA (0 years)
      const contractYearsRemaining = Math.random() < 0.2 ? 0 : Math.floor(Math.random() * 4) + 1; // 0 or 1-4 years
      
      allSkaters.push({
        id: skater.id,
        name: skater.name,
        position: skater.position,
        age,
        seasonsPlayed,
        gamesLastSeason: skater.gp,
        majorInjuries: Math.floor(Math.random() * 3),
        overall: skater.overall,
        potential: skater.overall + Math.floor(Math.random() * 10) - 5,
        careerGoals,
        careerPoints,
        cups,
        awardsScore: computeAwardsScore({
          hart: isLegend ? 1 : 0,
          allStar: Math.floor(seasonsPlayed / 3)
        }),
        milestonesPending: careerGoals > 490 ? 500 - careerGoals : 0,
        isLegend,
        contractYearsRemaining
      });
    });
  });
  
  const result = retirementEngine.run(allSkaters);
  const retiredPlayers: RetiredPlayer[] = [];
  
  // Process retirements and remove from teams
  const updatedTeams = { ...state.teams };
  result.retirements.forEach(decision => {
    if (decision.retires) {
      const retiree = allSkaters.find(p => p.id === decision.playerId)!;
      retiredPlayers.push({
        id: decision.playerId,
        name: decision.playerName,
        position: retiree.position,
        age: retiree.age,
        careerStats: {
          games: retiree.gamesLastSeason * retiree.seasonsPlayed,
          goals: retiree.careerGoals,
          assists: retiree.careerPoints - retiree.careerGoals,
          points: retiree.careerPoints,
          cups: retiree.cups
        },
        retirementReason: decision.reason
      });
      
      // Remove from teams
      Object.keys(updatedTeams).forEach(teamId => {
        updatedTeams[teamId] = {
          ...updatedTeams[teamId],
          skaters: updatedTeams[teamId].skaters.filter(s => s.id !== decision.playerId)
        };
      });
    }
  });
  
  // Process Hall of Fame
  const hofInductees: HofInductee[] = result.hallOfFame.map(inductee => {
    const retiree = allSkaters.find(p => p.id === inductee.playerId)!;
    return {
      id: inductee.playerId,
      name: inductee.playerName,
      position: retiree.position,
      hofScore: inductee.hofScore,
      classYear: inductee.classYear,
      careerHighlights: `${retiree.careerGoals} goals, ${retiree.careerPoints} points, ${retiree.cups} Stanley Cups`
    };
  });
  
  return {
    ...state,
    teams: updatedTeams,
    retiredPlayers,
    hofInductees,
    offseasonPhase: 'hof'
  };
}

function processDraftLottery(state: SeasonState): SeasonState {
  // Sort teams by points (worst to best for lottery)
  const teamsByPoints = Object.values(state.teams)
    .sort((a, b) => a.pts - b.pts)
    .slice(0, 16); // Bottom 16 teams eligible
  
  const lotteryResults: DraftLotteryResult[] = [];
  const availablePositions = Array.from({length: 16}, (_, i) => i + 1);
  
  // Simple lottery - worse teams have better odds
  teamsByPoints.forEach((team, index) => {
    const baseOdds = 16 - index; // Worst team gets 16% chance, etc.
    const roll = Math.random() * 100;
    const position = availablePositions.shift() || index + 1;
    
    lotteryResults.push({
      teamId: team.id,
      position,
      probability: baseOdds,
      moved: position !== index + 1
    });
  });
  
  return {
    ...state,
    draftLottery: lotteryResults,
    offseasonPhase: 'lottery'
  };
}

function processDraft(state: SeasonState): SeasonState {
  if (!state.draftLottery) return state;
  
  const draftPicks: DraftPick[] = [];
  const prospects = generateProspects(210); // 7 rounds × 30 teams
  
  // First round based on lottery
  state.draftLottery.forEach((lottery, index) => {
    const prospect = prospects[index];
    draftPicks.push({
      overall: index + 1,
      round: 1,
      pick: index + 1,
      teamId: lottery.teamId,
      playerId: prospect.id,
      playerName: prospect.name,
      position: prospect.position,
      potential: prospect.potential
    });
  });
  
  // Remaining rounds (2-7) in reverse order of standings
  const teamsByPoints = Object.values(state.teams).sort((a, b) => a.pts - b.pts);
  let overallPick = 31;
  
  for (let round = 2; round <= 7; round++) {
    teamsByPoints.forEach(team => {
      const prospect = prospects[overallPick - 1];
      if (prospect) {
        draftPicks.push({
          overall: overallPick,
          round,
          pick: overallPick - ((round - 1) * 30),
          teamId: team.id,
          playerId: prospect.id,
          playerName: prospect.name,
          position: prospect.position,
          potential: prospect.potential
        });
        overallPick++;
      }
    });
  }
  
  return {
    ...state,
    draftPicks,
    offseasonPhase: 'draft'
  };
}

function generateProspects(count: number) {
  const positions = ['C', 'LW', 'RW', 'D', 'G'];
  const firstNames = ['Connor', 'Nathan', 'Erik', 'Alex', 'Tyler', 'Brady', 'Dylan', 'Jack', 'Owen', 'Liam'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  
  return Array.from({length: count}, (_, i) => ({
    id: `prospect_${i + 1}`,
    name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    position: positions[Math.floor(Math.random() * positions.length)],
    potential: Math.max(60, 85 - Math.floor(i / 10)) // Early picks have higher potential
  }));
}

// ─── Free Agency Engine ──────────────────────────────────────────────────────
function createFreeAgencyMarket(state: SeasonState): MarketFreeAgent[] {
  const market: MarketFreeAgent[] = [];
  
  // Create free agents from players leaving teams
  state.resignings?.forEach(resigning => {
    if (!resigning.resigned) {
      // Find the player
      Object.values(state.teams).forEach(team => {
        const skater = team.skaters.find(s => s.id === resigning.playerId);
        const goalie = team.goalies.find(g => g.id === resigning.playerId);
        const player = skater || goalie;
        
        if (player) {
          const age = player.age || (25 + Math.floor(Math.random() * 15));
          market.push({
            playerId: player.id,
            name: player.name,
            position: skater ? (skater.position === 'D' ? 'D' : 'F') : 'G',
            age,
            overall: player.overall,
            potential: player.overall, // For existing players, potential = current overall
            lastSeasonPoints: skater ? skater.p : 0,
            lastSeasonWAR: 0, // Simplified for now
            rfa: age <= 25,
            rightsTeamId: age <= 25 ? team.id : undefined,
            starPower: player.overall >= 90,
            injuries: Math.floor(Math.random() * 4),
            image: player.image
          });
        }
      });
    }
  });
  
  // Add some additional free agents to make market more interesting
  for (let i = 0; i < 50; i++) {
    const positions = ['F', 'F', 'F', 'D', 'D', 'G'];
    const position = positions[Math.floor(Math.random() * positions.length)];
    const age = 22 + Math.floor(Math.random() * 16);
    const overall = 65 + Math.floor(Math.random() * 25);
    
    market.push({
      playerId: `fa_${i}`,
      name: `Free Agent ${i + 1}`,
      position,
      age,
      overall,
      potential: overall + (age <= 24 ? Math.floor(Math.random() * 10) : 0),
      lastSeasonPoints: position === 'G' ? 0 : Math.floor(Math.random() * 80),
      lastSeasonWAR: 0,
      rfa: age <= 25,
      starPower: overall >= 90,
      injuries: Math.floor(Math.random() * 3)
    });
  }
  
  return market;
}

function createTeamFAContexts(state: SeasonState): Record<string, TeamFAContext> {
  const contexts: Record<string, TeamFAContext> = {};
  
  Object.values(state.teams).forEach(team => {
    const teamPoints = team.pts || 0;
    const avgPoints = 82; // Rough average
    const isContender = teamPoints > avgPoints + 10;
    const rebuilding = teamPoints < avgPoints - 15;
    
    // Calculate positional needs
    const forwardCount = team.skaters.filter(s => ['C', 'LW', 'RW'].includes(s.position)).length;
    const defenseCount = team.skaters.filter(s => s.position === 'D').length;
    const goalieCount = team.goalies.length;
    
    contexts[team.id] = {
      teamId: team.id,
      teamName: team.name,
      capSpace: team.capSpace || (82 - Math.random() * 30), // $82M cap with spending
      isContender,
      needs: {
        'F': Math.max(0, 12 - forwardCount),
        'D': Math.max(0, 6 - defenseCount), 
        'G': Math.max(0, 2 - goalieCount)
      },
      marketAttractiveness: 50 + Math.floor(Math.random() * 50),
      coachPreferenceSkill: 50 + Math.floor(Math.random() * 50),
      developmentTrack: 50 + Math.floor(Math.random() * 50),
      rebuilding
    };
  });
  
  return contexts;
}

function runFreeAgency(teams: Record<string, TeamFAContext>, market: MarketFreeAgent[]): FAOutcome {
  const signings: FAAgreement[] = [];
  const news: string[] = [];
  const remaining: string[] = [];
  
  // Simple free agency simulation - each player signs with team offering best deal
  market.forEach(player => {
    const offers: FAOffer[] = [];
    
    Object.values(teams).forEach(team => {
      const need = team.needs[player.position] || 0;
      if (need <= 0 && Math.random() > 0.3) return; // Less likely to bid if no need
      
      // Calculate offer based on player rating and team cap
      let aav = Math.max(0.8, (player.overall - 60) * 0.15);
      if (player.lastSeasonPoints >= 70) aav += 1.5;
      if (player.starPower) aav += 1.0;
      if (player.injuries >= 3) aav -= 0.5;
      
      aav = Math.min(aav, team.capSpace * 0.8); // Don't spend all cap on one player
      
      if (aav < 0.8) return; // Can't afford minimum
      
      let years = 3;
      if (player.age <= 25) years = 4 + Math.floor(Math.random() * 3);
      else if (player.age <= 30) years = 3 + Math.floor(Math.random() * 3);
      else if (player.age >= 35) years = 1 + Math.floor(Math.random() * 2);
      
      let clause = 'None';
      if (player.overall >= 88 && years >= 4) clause = 'NTC';
      if (player.overall >= 92 && years >= 5) clause = 'NMC';
      
      offers.push({
        teamId: team.teamId,
        teamName: team.teamName,
        aav: Number(aav.toFixed(1)),
        years,
        clause,
        totalValue: Number((aav * years).toFixed(1))
      });
    });
    
    if (offers.length === 0) {
      remaining.push(player.playerId);
      return;
    }
    
    // Player picks best offer (prioritize total value, then terms)
    const bestOffer = offers.reduce((best, current) => {
      const bestScore = best.totalValue + (best.clause === 'NMC' ? 2 : best.clause === 'NTC' ? 1 : 0);
      const currentScore = current.totalValue + (current.clause === 'NMC' ? 2 : current.clause === 'NTC' ? 1 : 0);
      return currentScore > bestScore ? current : best;
    });
    
    // Handle RFA matching
    if (player.rfa && player.rightsTeamId) {
      const rightsTeam = teams[player.rightsTeamId];
      if (rightsTeam && rightsTeam.capSpace >= bestOffer.aav && Math.random() < 0.7) {
        // Rights team matches 70% of the time if they can afford it
        rightsTeam.capSpace -= bestOffer.aav;
        signings.push({
          playerId: player.playerId,
          playerName: player.name,
          teamId: rightsTeam.teamId,
          teamName: rightsTeam.teamName,
          aav: bestOffer.aav,
          years: bestOffer.years,
          clause: bestOffer.clause,
          matchedByRightsTeam: true,
          note: 'Offer sheet matched'
        });
        news.push(`${rightsTeam.teamName} matches offer sheet for ${player.name}`);
        return;
      }
    }
    
    // Sign with offering team
    const offeringTeam = teams[bestOffer.teamId];
    if (offeringTeam && offeringTeam.capSpace >= bestOffer.aav) {
      offeringTeam.capSpace -= bestOffer.aav;
      signings.push({
        playerId: player.playerId,
        playerName: player.name,
        teamId: bestOffer.teamId,
        teamName: bestOffer.teamName,
        aav: bestOffer.aav,
        years: bestOffer.years,
        clause: bestOffer.clause,
        matchedByRightsTeam: false,
        note: player.rfa ? 'RFA offer sheet signed' : 'UFA signing'
      });
      news.push(`${player.name} signs with ${bestOffer.teamName} for $${bestOffer.aav}M x ${bestOffer.years}`);
    } else {
      remaining.push(player.playerId);
    }
  });
  
  return { signings, news, remaining };
}

function runArbitration(teams: Record<string, TeamFAContext>, remainingRFAs: MarketFreeAgent[]): ArbitrationAward[] {
  const awards: ArbitrationAward[] = [];
  
  remainingRFAs.filter(p => p.rfa && p.rightsTeamId).forEach(player => {
    const team = teams[player.rightsTeamId!];
    if (!team) return;
    
    // Calculate arbitration award
    let aav = Math.max(0.8, (player.overall - 60) * 0.12); // Slightly lower than FA market
    if (player.lastSeasonPoints >= 50) aav += 1.0;
    if (player.injuries >= 3) aav -= 0.3;
    
    aav = Number(aav.toFixed(1));
    const years = player.age <= 24 ? 2 : 1; // Shorter terms in arbitration
    
    const canAfford = team.capSpace >= aav;
    const willAccept = canAfford && (player.overall >= 75 || Math.random() < 0.8);
    
    if (willAccept) {
      team.capSpace -= aav;
    }
    
    awards.push({
      playerId: player.playerId,
      playerName: player.name,
      rightsTeamId: team.teamId,
      rightsTeamName: team.teamName,
      aav,
      years,
      accepted: willAccept
    });
  });
  
  return awards;
}

function processResigning(state: SeasonState): SeasonState {
  console.log('Processing resigning phase...');
  const resignings: ResigningResult[] = [];
  
  // Check all players for contract status  
  Object.values(state.teams).forEach(team => {
    team.skaters.forEach(skater => {
      // Simulate contract expiry - ensure at least some players per team have expiring contracts
      const isExpiring = Math.random() < 0.25; // Increased to 25% for more activity
      
      if (isExpiring) {
        // Resign probability based on performance and team cap
        let resignChance = 0.7; // Base 70% resign rate
        
        // Better players more likely to get offers
        if (skater.overall >= 85) resignChance = 0.9;
        else if (skater.overall >= 80) resignChance = 0.8;
        else if (skater.overall <= 70) resignChance = 0.5;
        
        // Add some randomness for team cap constraints
        if (Math.random() < 0.1) resignChance -= 0.2; // 10% chance team can't afford
        
        const willResign = Math.random() < resignChance;
        
        let years = 0, value = 0;
        if (willResign) {
          // Contract length based on age and overall
          const age = skater.age || (25 + Math.floor(Math.random() * 15));
          if (age <= 25) years = 3 + Math.floor(Math.random() * 5); // Young: 3-7 years
          else if (age <= 30) years = 2 + Math.floor(Math.random() * 4); // Prime: 2-5 years  
          else if (age <= 35) years = 1 + Math.floor(Math.random() * 3); // Veteran: 1-3 years
          else years = 1; // Old: 1 year
          
          // Contract value based on overall rating
          const baseValue = Math.max(0.8, (skater.overall - 60) * 0.15); // $0.8M to $4.5M+
          value = (baseValue + Math.random() * 0.5) * 1000000; // Add randomness
        }
        
        let reason: string;
        if (willResign) {
          reason = `Re-signed for ${years} years at $${(value/1000000).toFixed(1)}M per year`;
        } else {
          const reasons = [
            'Signed with another team for more money',
            'Wanted a bigger role elsewhere', 
            'Team couldn\'t afford asking price',
            'Mutual decision to part ways',
            'Seeking new opportunity'
          ];
          reason = reasons[Math.floor(Math.random() * reasons.length)];
        }
        
        resignings.push({
          playerId: skater.id,
          playerName: skater.name,
          teamId: team.id,
          resigned: willResign,
          contractYears: years,
          contractValue: value,
          reason: reason
        });
      }
    });
    
    // Check goalies too
    team.goalies.forEach(goalie => {
      const isExpiring = Math.random() < 0.2; // 20% for goalies
      
      if (isExpiring) {
        let resignChance = 0.75; // Slightly higher for goalies
        
        if (goalie.overall >= 85) resignChance = 0.9;
        else if (goalie.overall >= 80) resignChance = 0.85;
        else if (goalie.overall <= 70) resignChance = 0.6;
        
        if (Math.random() < 0.1) resignChance -= 0.2;
        
        const willResign = Math.random() < resignChance;
        
        let years = 0, value = 0;
        if (willResign) {
          const age = goalie.age || (25 + Math.floor(Math.random() * 15));
          if (age <= 25) years = 3 + Math.floor(Math.random() * 4);
          else if (age <= 30) years = 3 + Math.floor(Math.random() * 3);
          else if (age <= 35) years = 2 + Math.floor(Math.random() * 2);
          else years = 1;
          
          const baseValue = Math.max(1.0, (goalie.overall - 65) * 0.2); // Goalies paid more
          value = (baseValue + Math.random() * 0.8) * 1000000;
        }
        
        let reason: string;
        if (willResign) {
          reason = `Re-signed for ${years} years at $${(value/1000000).toFixed(1)}M per year`;
        } else {
          const reasons = [
            'Signed with another team for more money',
            'Wanted starter role elsewhere',
            'Team couldn\'t afford asking price',
            'Mutual decision to part ways',
            'Seeking new opportunity'
          ];
          reason = reasons[Math.floor(Math.random() * reasons.length)];
        }
        
        resignings.push({
          playerId: goalie.id,
          playerName: goalie.name,
          teamId: team.id,
          resigned: willResign,
          contractYears: years,
          contractValue: value,
          reason: reason
        });
      }
    });
  });
  
  console.log(`Generated ${resignings.length} resigning decisions`);
  
  // If no resignings generated, create at least one dummy one to ensure phase works
  if (resignings.length === 0) {
    console.log('No resignings generated, creating placeholder...');
    resignings.push({
      playerId: 'placeholder',
      playerName: 'No Contract Decisions',
      teamId: 'none',
      resigned: true,
      contractYears: 0,
      contractValue: 0,
      reason: 'No players had expiring contracts this year'
    });
  }
  
  return {
    ...state,
    resignings,
    offseasonPhase: 'resigning'
  };
}

function processFreeAgency(state: SeasonState): SeasonState {
  const market = createFreeAgencyMarket(state);
  const teamContexts = createTeamFAContexts(state);
  const freeAgency = runFreeAgency(teamContexts, market);
  
  return {
    ...state,
    freeAgency,
    offseasonPhase: 'arbitration'
  };
}

function processArbitration(state: SeasonState): SeasonState {
  if (!state.freeAgency) return state;
  
  const market = createFreeAgencyMarket(state);
  const teamContexts = createTeamFAContexts(state);
  const remainingRFAs = market.filter(p => 
    state.freeAgency!.remaining.includes(p.playerId) && p.rfa
  );
  
  const arbitrationAwards = runArbitration(teamContexts, remainingRFAs);
  
  return {
    ...state,
    arbitrationAwards,
    offseasonPhase: 'complete'
  };
}

// ─── Enhanced Sim (more realistic scoring) ─────────────────────────────────
type SimTotals = { hShots:number; aShots:number; hGoals:number; aGoals:number; goals:GoalEvent[]; ot:boolean };
function quickSimTotals(home: Team, away: Team): SimTotals {
  const avgOVR = (ts:Team) => ts.skaters.length ? (sum(ts.skaters.map(s=>s.overall))/ts.skaters.length) : 75;
  
  // Higher shot totals for more realistic scoring
  const hS = 28 + Math.floor(Math.random()*16); // 28-44 shots
  const aS = 28 + Math.floor(Math.random()*16); // 28-44 shots
  
  // Better shooting percentage based on team quality (6-12% range)
  const hQ = 0.06 + (avgOVR(home)-70)*0.0008 + Math.random()*0.03;
  const aQ = 0.06 + (avgOVR(away)-70)*0.0008 + Math.random()*0.03;
  
  let hG = Math.max(1, Math.round(hS * hQ)); // At least 1 goal
  let aG = Math.max(1, Math.round(aS * aQ)); // At least 1 goal
  let ot = false;
  if (hG===aG) { ot = true; Math.random()<0.5 ? hG++ : aG++; }
  return { hShots: hS, aShots: aS, hGoals: hG, aGoals: aG, goals: [], ot };
}

// ─── IMMUTABLE APPLY: Build new state with copied teams/schedule ─────────────
function applyResultImmutable(prev: SeasonState, gameId: string, homeId: ID, awayId: ID, totals: SimTotals, isPlayoffGame = false) {
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

  // Enhanced team aggregates and player stats
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

    // Enhanced player stats distribution based on overall rating
    if (myGoals > 0) {
      // Sort skaters by overall rating for better distribution
      const sortedSkaters = [...mine.skaters].sort((a, b) => b.overall - a.overall);
      
      // Distribute goals based on player quality
      for (let i = 0; i < myGoals; i++) {
        const weights = sortedSkaters.map(s => Math.pow(s.overall / 85, 2.5)); // Heavily weight better players
        const totalWeight = sum(weights);
        const rand = Math.random() * totalWeight;
        
        let cumWeight = 0;
        for (let j = 0; j < sortedSkaters.length; j++) {
          cumWeight += weights[j];
          if (rand <= cumWeight) {
            const scorer = sortedSkaters[j];
            if (isPlayoffGame) {
              scorer.playoffG = (scorer.playoffG || 0) + 1;
              scorer.playoffP = (scorer.playoffP || 0) + 1;
            } else {
              scorer.g += 1;
              scorer.p += 1;
            }
            break;
          }
        }
      }
      
      // Distribute assists (2 per goal on average)
      const totalAssists = myGoals * 2;
      for (let i = 0; i < totalAssists; i++) {
        const weights = sortedSkaters.map(s => Math.pow(s.overall / 85, 2)); // Weight for assists
        const totalWeight = sum(weights);
        const rand = Math.random() * totalWeight;
        
        let cumWeight = 0;
        for (let j = 0; j < sortedSkaters.length; j++) {
          cumWeight += weights[j];
          if (rand <= cumWeight) {
            const assister = sortedSkaters[j];
            if (isPlayoffGame) {
              assister.playoffA = (assister.playoffA || 0) + 1;
              assister.playoffP = (assister.playoffP || 0) + 1;
            } else {
              assister.a += 1;
              assister.p += 1;
            }
            break;
          }
        }
      }
    }
    
    // Update games played for all skaters
    mine.skaters.forEach(skater => {
      if (isPlayoffGame) {
        skater.playoffGP = (skater.playoffGP || 0) + 1;
      } else {
        skater.gp += 1;
      }
    });
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

// Helper to clone season state properly including salary cap system
function cloneSeasonState(state: SeasonState): SeasonState {
  const cloned = structuredClone(state);
  // Recreate cap manager and trade engine with cloned state
  cloned.capManager = new CapManager(cloned.capLeague);
  cloned.tradeEngine = new TradeEngine(cloned.capLeague, cloned.capManager);
  return cloned;
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
        const { next, box } = applyResultImmutable(working, g.id, g.homeId, g.awayId, totals, false);
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
        const { next, box } = applyResultImmutable(working, g.id, g.homeId, g.awayId, totals, false);
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

  // UPDATED: Sim through playoffs and into offseason
  function simToOffseason() {
    setState(prev => {
      let working = prev;
      
      // First, complete regular season if not done
      if (!working.isRegularSeasonComplete) {
        const allGames = working.schedule.filter(g => !g.played).sort((x,y) => x.day - y.day);
        for (const g of allGames) {
          const home = working.teams[g.homeId];
          const away = working.teams[g.awayId];
          const totals = quickSimTotals(home, away);
          const { next } = applyResultImmutable(working, g.id, g.homeId, g.awayId, totals, false);
          working = next;
        }
        
        working = {
          ...working,
          isRegularSeasonComplete: true,
          playoffSeries: generatePlayoffSeries(working.teams),
          currentPlayoffRound: 1
        };
      }
      
      // Simulate all playoff rounds
      if (working.playoffSeries) {
        for (let round = 1; round <= 4; round++) {
          const roundSeries = working.playoffSeries.filter(s => s.round === round && !s.completed);
          
          let newTeams = { ...working.teams };
          let updatedSeries = [...working.playoffSeries];
          
          for (const series of roundSeries) {
            const { simulatedSeries, updatedTeams } = simulatePlayoffSeries(series, newTeams);
            newTeams = updatedTeams;
            const index = updatedSeries.findIndex(s => s.id === series.id);
            if (index !== -1) {
              updatedSeries[index] = simulatedSeries;
            }
          }
          
          working = {
            ...working,
            teams: newTeams,
            playoffSeries: updatedSeries,
            currentPlayoffRound: round
          };
          
          // Generate next round if current round completed
          if (round < 4) {
            const allCurrentRoundCompleted = updatedSeries
              .filter(s => s.round === round)
              .every(s => s.completed);
            
            if (allCurrentRoundCompleted) {
              const nextRoundSeries = generateNextRoundSeries(updatedSeries, round + 1, working.teams);
              working = {
                ...working,
                playoffSeries: [...updatedSeries, ...nextRoundSeries]
              };
            }
          }
        }
      }
      
      // Start offseason - move to June (around day 275)
      working = {
        ...working,
        currentDay: 275,
        offseasonPhase: 'retirement'
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

  function simulateCurrentPlayoffRound() {
    if (!state.playoffSeries) return;
    
    setState(prev => {
      const currentRound = prev.currentPlayoffRound || 1;
      const currentRoundSeries = prev.playoffSeries?.filter(s => s.round === currentRound && !s.completed) || [];
      
      if (currentRoundSeries.length === 0) return prev;
      
      // Simulate all series in current round
      let updatedSeries = [...(prev.playoffSeries || [])];
      
      let newTeams = { ...prev.teams };
      
      for (const series of currentRoundSeries) {
        const { simulatedSeries, updatedTeams } = simulatePlayoffSeries(series, newTeams);
        newTeams = updatedTeams;
        const index = updatedSeries.findIndex(s => s.id === series.id);
        if (index !== -1) {
          updatedSeries[index] = simulatedSeries;
        }
      }
      
      // Check if all series in current round are completed
      const allCurrentRoundCompleted = updatedSeries
        .filter(s => s.round === currentRound)
        .every(s => s.completed);
      
      let newCurrentRound = currentRound;
      
      // If current round is completed, generate next round
      if (allCurrentRoundCompleted && currentRound < 4) {
        const nextRoundSeries = generateNextRoundSeries(updatedSeries, currentRound + 1, prev.teams);
        updatedSeries = [...updatedSeries, ...nextRoundSeries];
        newCurrentRound = currentRound + 1;
      }
      
      return {
        ...prev,
        teams: newTeams,
        playoffSeries: updatedSeries,
        currentPlayoffRound: newCurrentRound
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
          
          // Check if this day has offseason events
          const isOffseasonDay = dayIdx >= 275 && dayIdx <= 350; // June-August offseason period
          const offseasonPhaseText = dayIdx >= 275 && dayIdx <= 285 ? "Retirement" :
                                    dayIdx >= 286 && dayIdx <= 295 ? "HOF" :
                                    dayIdx >= 296 && dayIdx <= 305 ? "Lottery" :
                                    dayIdx >= 306 && dayIdx <= 320 ? "Draft" :
                                    dayIdx >= 321 && dayIdx <= 350 ? "Free Agency" : "";
          
          return (
            <button
              key={idx}
              onClick={() => setSelectedDate(d)}
              className={`h-24 rounded-lg border p-1 text-left relative transition-colors
                ${isThisMonth ? "" : "opacity-50"}
                ${isSelected ? "border-primary ring-2 ring-primary/20" : ""}
                ${isToday ? "bg-primary/10 border-primary font-semibold" : "bg-background"}
                ${hasNextGame ? "bg-accent border-accent-foreground" : ""}
                ${isOffseasonDay ? "bg-purple-50 border-purple-200" : ""}`}
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
                
                {/* Show offseason events */}
                {isOffseasonDay && offseasonPhaseText && (
                  <div className="text-[10px] px-1 py-0.5 rounded bg-purple-100 text-purple-700 font-medium">
                    {offseasonPhaseText}
                  </div>
                )}
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
            <button 
              className="px-3 py-1 rounded bg-purple-600 text-white hover:bg-purple-700"
              onClick={simToOffseason}
            >
              Sim to Offseason
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
            <button 
              className="px-4 py-2 rounded bg-yellow-600 text-white hover:bg-yellow-700 font-medium"
              onClick={simulateCurrentPlayoffRound}
            >
              Simulate Round {state.currentPlayoffRound || 1}
            </button>
          </div>
          
          {state.playoffSeries && state.playoffSeries.length > 0 ? (
            <div className="space-y-6">
              {/* Show all rounds */}
              {[1, 2, 3, 4].map(round => {
                const roundSeries = state.playoffSeries?.filter(s => s.round === round) || [];
                if (roundSeries.length === 0) return null;
                
                const roundNames = {
                  1: "First Round",
                  2: "Second Round", 
                  3: "Conference Finals",
                  4: "Stanley Cup Finals"
                };
                
                return (
                  <div key={round} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-yellow-800">{roundNames[round as keyof typeof roundNames]}</h4>
                      {round === (state.currentPlayoffRound || 1) && (
                        <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">Current Round</span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {roundSeries.map(series => {
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
                );
              })}
              
              {/* Playoff Stats Leaders */}
              {state.playoffSeries && state.playoffSeries.some(s => s.completed) && (
                <PlayoffStatsCard state={state} />
              )}
              
              {/* Stanley Cup Winner Display */}
              {state.playoffSeries?.some(s => s.round === 4 && s.completed) && (
                <div className="mt-6 p-4 bg-gradient-to-r from-yellow-200 to-amber-200 rounded-lg border-2 border-yellow-400">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-800 mb-2">
                      🏆 STANLEY CUP CHAMPIONS 🏆
                    </div>
                    <div className="text-xl font-semibold text-yellow-900 mb-3">
                      {teamLabel(state, state.playoffSeries.find(s => s.round === 4 && s.completed)?.winnerId!)}
                    </div>
                    {(() => {
                      const championTeamId = state.playoffSeries.find(s => s.round === 4 && s.completed)?.winnerId;
                      if (!championTeamId) return null;
                      
                      const championTeam = state.teams[championTeamId];
                      if (!championTeam) return null;
                      
                      // Find player with most playoff points from the WINNING team only
                      const teamPlayoffSkaters = championTeam.skaters
                        .filter(s => (s.playoffP || 0) > 0)
                        .sort((a, b) => (b.playoffP || 0) - (a.playoffP || 0));
                      
                      const connSmytheWinner = teamPlayoffSkaters[0];
                      
                      return connSmytheWinner ? (
                        <div className="text-lg font-medium text-yellow-800">
                          Conn Smythe Winner: {connSmytheWinner.name} ({connSmytheWinner.playoffP || 0} pts)
                        </div>
                      ) : null;
                    })()}
                  </div>
                  
                  {/* Offseason Trigger */}
                  {!state.offseasonPhase && (
                    <div className="mt-4 pt-4 border-t border-yellow-300">
                      <button 
                        className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
                        onClick={() => setState(prev => {
                          const cloned = cloneSeasonState(prev);
                          cloned.offseasonPhase = 'retirement';
                          return cloned;
                        })}
                      >
                        Begin Offseason →
                      </button>
                    </div>
                  )}
                </div>
              )}
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

      {/* Offseason Phases */}
      {state.offseasonPhase && (
        <div className="space-y-6">
          {/* Retirement Phase */}
          {state.offseasonPhase === 'retirement' && (
            <div className="p-6 bg-gray-100 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">🏁 Player Retirements</h3>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => setState(processRetirement)}
                >
                  Process Retirements
                </button>
              </div>
              <p className="text-gray-600">
                Analyzing all players for potential retirements based on age, performance, and career milestones...
              </p>
            </div>
          )}

          {/* Hall of Fame Phase */}
          {state.offseasonPhase === 'hof' && state.retiredPlayers && (
            <div className="space-y-4">
              <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                <h3 className="text-xl font-bold text-yellow-800 mb-4">🏆 Hall of Fame Inductions</h3>
                
                {state.hofInductees && state.hofInductees.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-yellow-700">Class of {state.seasonYear}:</h4>
                    {state.hofInductees.map(inductee => (
                      <div key={inductee.id} className="p-3 bg-yellow-100 rounded border border-yellow-300">
                        <div className="font-medium text-yellow-900">{inductee.name} ({inductee.position})</div>
                        <div className="text-sm text-yellow-700">{inductee.careerHighlights}</div>
                        <div className="text-xs text-yellow-600">HOF Score: {inductee.hofScore.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-yellow-700">No players qualified for the Hall of Fame this year.</p>
                )}

                <div className="mt-6 pt-4 border-t border-yellow-200">
                  <h4 className="font-semibold text-yellow-700 mb-2">Retired Players ({state.retiredPlayers.length}):</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {state.retiredPlayers.map(player => (
                      <div key={player.id} className="p-2 bg-gray-100 rounded text-sm">
                        <div className="font-medium">{player.name} ({player.position})</div>
                        <div className="text-gray-600">
                          Age {player.age} • {player.careerStats.points} career points • {player.careerStats.cups} cups
                        </div>
                        <div className="text-xs text-gray-500">{player.retirementReason}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <button 
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    onClick={() => setState(processDraftLottery)}
                  >
                    Continue to Draft Lottery →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Draft Lottery Phase */}
          {state.offseasonPhase === 'lottery' && state.draftLottery && (
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-xl font-bold text-blue-800 mb-4">🎱 Draft Lottery Results</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">Top 10 Picks:</h4>
                  <div className="space-y-2">
                    {state.draftLottery.slice(0, 10).map((result, index) => (
                      <div key={result.teamId} className="flex justify-between items-center p-2 bg-blue-100 rounded">
                        <span className="font-medium">#{index + 1} {teamLabel(state, result.teamId)}</span>
                        {result.moved && <span className="text-green-600 text-sm">↑ Lottery Winner!</span>}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">Remaining Picks:</h4>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {state.draftLottery.slice(10).map((result, index) => (
                      <div key={result.teamId} className="flex justify-between p-1 bg-blue-50 rounded text-sm">
                        <span>#{index + 11} {teamLabel(state, result.teamId)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <button 
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() => setState(processDraft)}
                >
                  Continue to Draft →
                </button>
              </div>
            </div>
          )}

          {/* Draft Phase - Using Real DraftRoom */}
          {state.offseasonPhase === 'draft' && (
            <DraftPhaseInterface 
              state={state} 
              setState={setState}
              myTeamId={myTeamId}
              onComplete={() => {
                console.log('Draft completed, transitioning to resigning...');
                setState(processResigning);
              }}
            />
          )}

          {/* Resigning Phase */}
          {(() => {
            console.log('Checking resigning phase:', state.offseasonPhase, 'resignings:', state.resignings?.length);
            return state.offseasonPhase === 'resigning';
          })() && (
            <ResigningInterface 
              state={state} 
              setState={setState}
              myTeamId={myTeamId}
              onComplete={() => setState(processFreeAgency)}
            />
          )}

          {/* Free Agency Phase - Using Real FreeAgencyHub */}
          {state.offseasonPhase === 'freeagency' && (
            <FreeAgencyPhaseInterface 
              state={state} 
              setState={setState}
              myTeamId={myTeamId}
              onComplete={() => setState(processArbitration)}
            />
          )}

          {/* Arbitration Phase */}
          {state.offseasonPhase === 'arbitration' && state.arbitrationAwards && (
            <ArbitrationInterface 
              state={state} 
              setState={setState}
              myTeamId={myTeamId}
              onComplete={() => setState(prev => {
                const cloned = cloneSeasonState(prev);
                cloned.offseasonPhase = 'complete';
                return cloned;
              })}
            />
          )}

          {/* Offseason Complete */}
          {state.offseasonPhase === 'complete' && (
            <div className="p-6 bg-green-100 rounded-lg border border-green-400">
              <h3 className="text-xl font-bold text-green-800 mb-4">✅ Offseason Complete</h3>
              <p className="text-green-700 mb-4">
                All offseason activities have been completed. The league is ready for the next season!
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
                <div className="p-3 bg-white rounded border border-green-300">
                  <div className="text-2xl font-bold text-green-800">{state.retiredPlayers?.length || 0}</div>
                  <div className="text-sm text-green-600">Retirements</div>
                </div>
                <div className="p-3 bg-white rounded border border-green-300">
                  <div className="text-2xl font-bold text-green-800">{state.hofInductees?.length || 0}</div>
                  <div className="text-sm text-green-600">HOF Inductees</div>
                </div>
                <div className="p-3 bg-white rounded border border-green-300">
                  <div className="text-2xl font-bold text-green-800">{state.draftPicks?.length || 0}</div>
                  <div className="text-sm text-green-600">Draft Picks</div>
                </div>
                <div className="p-3 bg-white rounded border border-green-300">
                  <div className="text-2xl font-bold text-green-800">{state.resignings?.filter(r => r.resigned).length || 0}</div>
                  <div className="text-sm text-green-600">Re-signings</div>
                </div>
                <div className="p-3 bg-white rounded border border-green-300">
                  <div className="text-2xl font-bold text-green-800">{state.freeAgency?.signings.length || 0}</div>
                  <div className="text-sm text-green-600">FA Signings</div>
                </div>
                <div className="p-3 bg-white rounded border border-green-300">
                  <div className="text-2xl font-bold text-green-800">{state.arbitrationAwards?.filter(a => a.accepted).length || 0}</div>
                  <div className="text-sm text-green-600">Arbitrations</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
        const { next, box } = applyResultImmutable(prev, game.id, game.homeId, game.awayId, totals, false);
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

// ─── Draft Interface Component ──────────────────────────────────────────────
// ─── Resigning Interface ────────────────────────────────────────────────────
function ResigningInterface({
  state,
  setState,
  myTeamId,
  onComplete
}: {
  state: SeasonState;
  setState: (updater: (s: SeasonState) => SeasonState) => void;
  myTeamId: string;
  onComplete: () => void;
}) {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [offerYears, setOfferYears] = useState(3);
  const [offerValue, setOfferValue] = useState(2.0);
  
  const myTeam = state.teams[myTeamId];
  const myResignings = state.resignings?.filter(r => r.teamId === myTeamId) || [];
  const needsDecision = myResignings.filter(r => !r.resigned);
  
  function makeOffer() {
    if (!selectedPlayer) return;
    
    setState(prev => {
      const newResignings = [...(prev.resignings || [])];
      const resigningIndex = newResignings.findIndex(r => r.playerId === selectedPlayer);
      
      if (resigningIndex !== -1) {
        // Player decision based on offer vs market value
        const player = Object.values(prev.teams).flatMap(t => [...t.skaters, ...t.goalies])
          .find(p => p.id === selectedPlayer);
        
        if (player) {
          const fairValue = Math.max(0.8, (player.overall - 60) * 0.15);
          const acceptChance = Math.min(0.9, offerValue / fairValue);
          const willAccept = Math.random() < acceptChance;
          
          newResignings[resigningIndex] = {
            ...newResignings[resigningIndex],
            resigned: willAccept,
            contractYears: offerYears,
            contractValue: offerValue * 1000000,
            reason: willAccept 
              ? `Accepted offer: ${offerYears} years at $${offerValue}M per year`
              : `Rejected offer - wanted $${(fairValue + 0.5).toFixed(1)}M+`
          };
        }
      }
      
      return {
        ...prev,
        resignings: newResignings
      };
    });
    
    setSelectedPlayer(null);
    setOfferYears(3);
    setOfferValue(2.0);
  }
  
  return (
    <div className="p-6 bg-orange-50 rounded-lg border border-orange-200">
      <h3 className="text-xl font-bold text-orange-800 mb-4">✍️ Contract Re-signings</h3>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Players Needing Decisions */}
        <div className="xl:col-span-2">
          <h4 className="font-semibold text-orange-700 mb-3">
            Players to Re-sign ({needsDecision.length}):
          </h4>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {needsDecision.map(resigning => {
              const player = Object.values(state.teams).flatMap(t => [...t.skaters, ...t.goalies])
                .find(p => p.id === resigning.playerId);
              
              return (
                <div key={resigning.playerId} 
                     className={`p-3 rounded border cursor-pointer transition-colors ${
                       selectedPlayer === resigning.playerId 
                         ? 'border-orange-500 bg-orange-100' 
                         : 'border-orange-200 bg-white hover:bg-orange-50'
                     }`}
                     onClick={() => setSelectedPlayer(resigning.playerId)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-orange-900">{resigning.playerName}</div>
                      <div className="text-sm text-orange-700">
                        Overall: {player?.overall || 'N/A'} • 
                        Age: {player?.age || (25 + Math.floor(Math.random() * 15))} • 
                        Cap Space: ${myTeam?.capSpace?.toFixed(1) || '0.0'}M
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">
                      Suggested: ${Math.max(0.8, ((player?.overall || 75) - 60) * 0.15).toFixed(1)}M
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Contract Offer Panel */}
        <div>
          <h4 className="font-semibold text-orange-700 mb-3">Make Offer:</h4>
          
          {selectedPlayer ? (
            <div className="space-y-4 p-4 bg-white rounded border">
              <div>
                <label className="block text-sm font-medium mb-1">Contract Length:</label>
                <select 
                  value={offerYears} 
                  onChange={(e) => setOfferYears(Number(e.target.value))}
                  className="w-full p-2 border rounded"
                >
                  <option value={1}>1 Year</option>
                  <option value={2}>2 Years</option>
                  <option value={3}>3 Years</option>
                  <option value={4}>4 Years</option>
                  <option value={5}>5 Years</option>
                  <option value={6}>6 Years</option>
                  <option value={7}>7 Years</option>
                  <option value={8}>8 Years</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">AAV ($ Millions):</label>
                <input 
                  type="number" 
                  step="0.1" 
                  min="0.8" 
                  max="15" 
                  value={offerValue}
                  onChange={(e) => setOfferValue(Number(e.target.value))}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div className="text-sm text-gray-600">
                Total: ${(offerYears * offerValue).toFixed(1)}M over {offerYears} years
              </div>
              
              <button 
                onClick={makeOffer}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                Make Offer
              </button>
            </div>
          ) : (
            <div className="p-4 bg-gray-100 rounded border text-center text-gray-600">
              Select a player to make an offer
            </div>
          )}
          
          <div className="mt-6">
            <button 
              onClick={onComplete}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Complete Re-signings →
            </button>
          </div>
        </div>
      </div>
      
      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="p-3 bg-green-100 rounded">
          <div className="text-lg font-bold text-green-800">
            {myResignings.filter(r => r.resigned).length}
          </div>
          <div className="text-sm text-green-700">Players Re-signed</div>
        </div>
        <div className="p-3 bg-red-100 rounded">
          <div className="text-lg font-bold text-red-800">
            {myResignings.filter(r => !r.resigned).length}
          </div>
          <div className="text-sm text-red-700">Players Lost</div>
        </div>
      </div>
    </div>
  );
}

// ─── Free Agency Interface ──────────────────────────────────────────────────
function FreeAgencyInterface({
  state,
  setState,
  myTeamId,
  onComplete
}: {
  state: SeasonState;
  setState: (updater: (s: SeasonState) => SeasonState) => void;
  myTeamId: string;
  onComplete: () => void;
}) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [bidYears, setBidYears] = useState(3);
  const [bidValue, setBidValue] = useState(2.0);
  
  const market = useMemo(() => createFreeAgencyMarket(state), [state]);
  const myTeam = state.teams[myTeamId];
  const mySignings = state.freeAgency?.signings.filter(s => s.teamId === myTeamId) || [];
  
  function makeBid() {
    if (!selectedAgent) return;
    
    // Simulate player decision
    const agent = market.find(a => a.playerId === selectedAgent);
    if (!agent) return;
    
    setState(prev => {
      const fairValue = Math.max(0.8, (agent.overall - 60) * 0.15);
      const acceptChance = Math.min(0.8, bidValue / (fairValue + 0.5));
      const willSign = Math.random() < acceptChance;
      
      if (willSign && myTeam && myTeam.capSpace >= bidValue) {
        const newSignings = [...(prev.freeAgency?.signings || [])];
        newSignings.push({
          playerId: agent.playerId,
          playerName: agent.name,
          teamId: myTeamId,
          teamName: myTeam.name,
          aav: bidValue,
          years: bidYears,
          clause: 'None',
          matchedByRightsTeam: false,
          note: 'Player signed with your team'
        });
        
        // Update team cap space
        const updatedTeams = { ...prev.teams };
        updatedTeams[myTeamId] = {
          ...myTeam,
          capSpace: myTeam.capSpace - bidValue
        };
        
        return {
          ...prev,
          teams: updatedTeams,
          freeAgency: {
            ...prev.freeAgency!,
            signings: newSignings,
            remaining: prev.freeAgency!.remaining.filter(id => id !== agent.playerId)
          }
        };
      }
      
      return prev;
    });
    
    setSelectedAgent(null);
    setBidYears(3);
    setBidValue(2.0);
  }
  
  return (
    <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="text-xl font-bold text-blue-800 mb-4">🏒 Free Agency</h3>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Available Free Agents */}
        <div className="xl:col-span-2">
          <h4 className="font-semibold text-blue-700 mb-3">
            Available Free Agents ({market.length}):
          </h4>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {market.slice(0, 30).map(agent => {
              const isSigned = state.freeAgency?.signings.some(s => s.playerId === agent.playerId);
              
              return (
                <button
                  key={agent.playerId}
                  onClick={() => !isSigned ? setSelectedAgent(agent.playerId) : null}
                  disabled={isSigned}
                  className={`w-full p-3 text-left rounded border transition-colors ${
                    selectedAgent === agent.playerId 
                      ? 'border-blue-500 bg-blue-100' 
                      : isSigned
                      ? 'border-gray-200 bg-gray-100 text-gray-500'
                      : 'border-blue-200 bg-white hover:bg-blue-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-blue-900">{agent.name}</div>
                      <div className="text-sm text-blue-700">
                        {agent.position} • Overall: {agent.overall} • Age: {agent.age}
                        {agent.rfa && <span className="text-red-600 ml-2">(RFA)</span>}
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <div>Points: {agent.lastSeasonPoints}</div>
                      {isSigned && <div className="text-red-600">SIGNED</div>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Contract Bid Panel */}
        <div>
          <h4 className="font-semibold text-blue-700 mb-3">Make Bid:</h4>
          <div className="mb-3 text-sm text-blue-700">
            Cap Space: ${myTeam?.capSpace?.toFixed(1) || '0.0'}M
          </div>
          
          {selectedAgent ? (
            <div className="space-y-4 p-4 bg-white rounded border">
              <div>
                <label className="block text-sm font-medium mb-1">Contract Length:</label>
                <select 
                  value={bidYears} 
                  onChange={(e) => setBidYears(Number(e.target.value))}
                  className="w-full p-2 border rounded"
                >
                  <option value={1}>1 Year</option>
                  <option value={2}>2 Years</option>
                  <option value={3}>3 Years</option>
                  <option value={4}>4 Years</option>
                  <option value={5}>5 Years</option>
                  <option value={6}>6 Years</option>
                  <option value={7}>7 Years</option>
                  <option value={8}>8 Years</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">AAV ($ Millions):</label>
                <input 
                  type="number" 
                  step="0.1" 
                  min="0.8" 
                  max="15" 
                  value={bidValue}
                  onChange={(e) => setBidValue(Number(e.target.value))}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div className="text-sm text-gray-600">
                Total: ${(bidYears * bidValue).toFixed(1)}M over {bidYears} years
              </div>
              
              <button 
                onClick={makeBid}
                disabled={!myTeam || myTeam.capSpace < bidValue}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Make Bid
              </button>
            </div>
          ) : (
            <div className="p-4 bg-gray-100 rounded border text-center text-gray-600">
              Select a free agent to make a bid
            </div>
          )}
          
          <div className="mt-6">
            <button 
              onClick={onComplete}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Complete Free Agency →
            </button>
          </div>
        </div>
      </div>
      
      {/* My Signings */}
      {mySignings.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-blue-700 mb-3">Your Signings ({mySignings.length}):</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {mySignings.map(signing => (
              <div key={signing.playerId} className="p-2 bg-green-100 rounded">
                <div className="font-medium text-green-900">{signing.playerName}</div>
                <div className="text-sm text-green-700">
                  ${signing.aav}M x {signing.years} years
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* League News */}
      {state.freeAgency && state.freeAgency.news.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-blue-700 mb-3">League News:</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {state.freeAgency.news.slice(0, 10).map((news, index) => (
              <div key={index} className="text-sm text-blue-700 p-2 bg-white rounded">
                {news}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Arbitration Interface ──────────────────────────────────────────────────
function ArbitrationInterface({
  state,
  setState,
  myTeamId,
  onComplete
}: {
  state: SeasonState;
  setState: (updater: (s: SeasonState) => SeasonState) => void;
  myTeamId: string;
  onComplete: () => void;
}) {
  const myAwards = state.arbitrationAwards?.filter(a => a.rightsTeamId === myTeamId) || [];
  
  function handleAcceptDecline(awardId: string, accept: boolean) {
    setState(prev => {
      const newAwards = [...(prev.arbitrationAwards || [])];
      const awardIndex = newAwards.findIndex(a => a.playerId === awardId);
      
      if (awardIndex !== -1) {
        newAwards[awardIndex] = {
          ...newAwards[awardIndex],
          accepted: accept
        };
        
        // Update cap space if accepted
        const updatedTeams = { ...prev.teams };
        if (accept && updatedTeams[myTeamId]) {
          updatedTeams[myTeamId] = {
            ...updatedTeams[myTeamId],
            capSpace: updatedTeams[myTeamId].capSpace - newAwards[awardIndex].aav
          };
        }
        
        return {
          ...prev,
          arbitrationAwards: newAwards,
          teams: updatedTeams
        };
      }
      
      return prev;
    });
  }
  
  return (
    <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
      <h3 className="text-xl font-bold text-purple-800 mb-4">⚖️ Salary Arbitration</h3>
      
      {myAwards.length > 0 ? (
        <div className="space-y-4">
          <p className="text-purple-700 mb-4">
            The arbitrator has made contract awards for your RFA players. You can accept or decline each award.
          </p>
          
          {myAwards.map(award => (
            <div key={award.playerId} className="p-4 bg-white rounded border border-purple-200">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-purple-900">{award.playerName}</div>
                  <div className="text-purple-700">
                    Award: ${award.aav}M x {award.years} years
                  </div>
                  <div className="text-sm text-gray-600">
                    Status: {award.accepted ? 'Accepted' : 'Pending Decision'}
                  </div>
                </div>
                
                {!award.accepted && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAcceptDecline(award.playerId, true)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => handleAcceptDecline(award.playerId, false)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-purple-700 mb-4">
            No arbitration cases for your team this year.
          </div>
        </div>
      )}
      
      <div className="mt-6">
        <button 
          onClick={onComplete}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Complete Arbitration →
        </button>
      </div>
    </div>
  );
}

function DraftInterface({
  state,
  setState,
  myTeamId,
  onComplete
}: {
  state: SeasonState;
  setState: (updater: (s: SeasonState) => SeasonState) => void;
  myTeamId: string;
  onComplete: () => void;
}) {
  const [currentPick, setCurrentPick] = useState(1);
  const [selectedProspect, setSelectedProspect] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'available' | 'all' | 'drafted'>('available');
  
  // Generate prospect pool if not exists
  const prospects = useMemo(() => generateProspects(224), []);
  
  const myPicks = state.draftPicks?.filter(p => p.teamId === myTeamId) || [];
  const draftedPicks = state.draftPicks?.filter(p => p.playerId && p.overall < currentPick) || [];
  const currentPickInfo = state.draftLottery?.find((_, index) => index + 1 === currentPick);
  const isMyPick = currentPickInfo?.teamId === myTeamId;
  
  function makeSelection() {
    if (!selectedProspect || !isMyPick) return;
    
    const prospect = prospects.find(p => p.id === selectedProspect);
    if (!prospect) return;
    
    setState(prev => {
      const newPicks = [...(prev.draftPicks || [])];
      const pickIndex = newPicks.findIndex(p => p.overall === currentPick);
      
      if (pickIndex !== -1) {
        newPicks[pickIndex] = {
          ...newPicks[pickIndex],
          playerId: prospect.id,
          playerName: prospect.name,
          position: prospect.position,
          potential: prospect.potential
        };
      }
      
      // Add drafted player to my team
      const updatedTeams = { ...prev.teams };
      const myTeam = updatedTeams[myTeamId];
      if (myTeam) {
        if (prospect.position === 'G') {
          myTeam.goalies.push({
            id: prospect.id,
            name: prospect.name,
            position: "G" as const,
            overall: Math.max(55, prospect.potential - 15 + Math.floor(Math.random() * 10)),
            reflexes: Math.max(55, prospect.potential - 15 + Math.floor(Math.random() * 10)),
            positioning: Math.max(50, prospect.potential - 20 + Math.floor(Math.random() * 10)),
            reboundControl: Math.max(50, prospect.potential - 18 + Math.floor(Math.random() * 10)),
            stamina: 75,
            gp: 0, gs: 0, w: 0, l: 0, otl: 0, so: 0,
            shotsAgainst: 0, saves: 0, gaa: 0, svpct: 0
          });
        } else {
          myTeam.skaters.push({
            id: prospect.id,
            name: prospect.name,
            position: prospect.position as "C" | "LW" | "RW" | "D",
            overall: Math.max(55, prospect.potential - 15 + Math.floor(Math.random() * 10)),
            shooting: Math.max(45, prospect.potential - 23 + Math.floor(Math.random() * 10)),
            passing: Math.max(45, prospect.potential - 21 + Math.floor(Math.random() * 10)),
            defense: Math.max(45, prospect.potential - 22 + Math.floor(Math.random() * 10)),
            stamina: 80,
            gp: 0, g: 0, a: 0, p: 0, pim: 0, shots: 0, plusMinus: 0
          });
        }
      }
      
      return {
        ...prev,
        draftPicks: newPicks,
        teams: updatedTeams
      };
    });
    
    setCurrentPick(prev => prev + 1);
    setSelectedProspect(null);
  }
  
  function simNextPick() {
    if (isMyPick) return;
    
    setState(prev => {
      const newPicks = [...(prev.draftPicks || [])];
      const pickIndex = newPicks.findIndex(p => p.overall === currentPick);
      const availableProspects = prospects.filter(p => 
        !prev.draftPicks?.some(dp => dp.playerId === p.id)
      );
      
      if (pickIndex !== -1 && availableProspects.length > 0) {
        const selectedProspect = availableProspects[0]; // AI picks best available
        newPicks[pickIndex] = {
          ...newPicks[pickIndex],
          playerId: selectedProspect.id,
          playerName: selectedProspect.name,
          position: selectedProspect.position,
          potential: selectedProspect.potential
        };
      }
      
      return {
        ...prev,
        draftPicks: newPicks
      };
    });
    
    setCurrentPick(prev => prev + 1);
  }
  
  function simToMyNextPick() {
    let nextMyPick = null;
    for (let pick = currentPick + 1; pick <= 224; pick++) {
      const pickInfo = state.draftLottery?.[pick - 1];
      if (pickInfo?.teamId === myTeamId) {
        nextMyPick = pick;
        break;
      }
    }
    
    if (!nextMyPick) {
      // No more picks for me, sim to end
      simRestOfDraft();
      return;
    }
    
    setState(prev => {
      let updatedState = { ...prev };
      
      // Sim picks until my next pick
      for (let pick = currentPick; pick < nextMyPick; pick++) {
        if (pick === currentPick && isMyPick) continue; // Skip if current pick is mine
        
        const availableProspects = prospects.filter(p => 
          !updatedState.draftPicks?.some(dp => dp.playerId === p.id)
        );
        
        if (availableProspects.length === 0) break;
        
        const newPicks = [...(updatedState.draftPicks || [])];
        const pickIndex = newPicks.findIndex(p => p.overall === pick);
        
        if (pickIndex !== -1) {
          const selectedProspect = availableProspects[Math.floor(Math.random() * Math.min(5, availableProspects.length))];
          newPicks[pickIndex] = {
            ...newPicks[pickIndex],
            playerId: selectedProspect.id,
            playerName: selectedProspect.name,
            position: selectedProspect.position,
            potential: selectedProspect.potential
          };
          
          updatedState = {
            ...updatedState,
            draftPicks: newPicks
          };
        }
      }
      
      return updatedState;
    });
    
    setCurrentPick(nextMyPick);
  }

  function simRestOfDraft() {
    setState(prev => {
      let updatedState = { ...prev };
      
      // Sim remaining picks
      for (let pick = currentPick; pick <= 224; pick++) {
        const availableProspects = prospects.filter(p => 
          !updatedState.draftPicks?.some(dp => dp.playerId === p.id)
        );
        
        if (availableProspects.length === 0) break;
        
        const newPicks = [...(updatedState.draftPicks || [])];
        const pickIndex = newPicks.findIndex(p => p.overall === pick);
        
        if (pickIndex !== -1) {
          const selectedProspect = availableProspects[Math.floor(Math.random() * Math.min(5, availableProspects.length))];
          newPicks[pickIndex] = {
            ...newPicks[pickIndex],
            playerId: selectedProspect.id,
            playerName: selectedProspect.name,
            position: selectedProspect.position,
            potential: selectedProspect.potential
          };
          
          updatedState = {
            ...updatedState,
            draftPicks: newPicks
          };
        }
      }
      
      return updatedState;
    });
    
    setCurrentPick(225); // End of draft
  }
  
  const availableProspects = prospects.filter(p => 
    !state.draftPicks?.some(dp => dp.playerId === p.id)
  );
  
  const displayProspects = viewMode === 'available' 
    ? availableProspects.slice(0, 50)
    : viewMode === 'all'
    ? prospects.slice(0, 100)
    : [];
  
  return (
    <div className="p-6 bg-green-50 rounded-lg border border-green-200">
      <h3 className="text-xl font-bold text-green-800 mb-4">🎯 NHL Entry Draft</h3>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Current Pick */}
        <div className="space-y-4">
          <div className="p-4 bg-white rounded border">
            <h4 className="font-semibold text-green-700 mb-2">
              Pick #{currentPick} {currentPick <= 224 ? `of 224` : '(Complete)'}
            </h4>
            {currentPickInfo && currentPick <= 224 && (
              <div className="text-sm">
                <div>Team: {teamLabel(state, currentPickInfo.teamId)}</div>
                {isMyPick && <div className="text-green-600 font-medium text-lg">🔥 YOUR PICK!</div>}
              </div>
            )}
            
            {isMyPick && currentPick <= 224 && (
              <div className="mt-4 space-y-3">
                <div className="flex flex-col gap-2">
                  <button
                    onClick={makeSelection}
                    disabled={!selectedProspect}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Draft Selected Player
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={simToMyNextPick}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex-1"
                    >
                      Sim to My Next Pick
                    </button>
                    <button
                      onClick={simRestOfDraft}
                      className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm flex-1"
                    >
                      Sim Entire Draft
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {!isMyPick && currentPick <= 224 && (
              <div className="mt-3 space-y-2">
                <button
                  onClick={simNextPick}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Sim Next Pick →
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={simToMyNextPick}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex-1"
                  >
                    Sim to My Pick
                  </button>
                  <button
                    onClick={simRestOfDraft}
                    className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm flex-1"
                  >
                    Sim Entire Draft
                  </button>
                </div>
              </div>
            )}
            
            {currentPick > 224 && (
              <button
                onClick={onComplete}
                className="mt-4 w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                Complete Draft & Continue →
              </button>
            )}
          </div>
          
          {/* My Picks */}
          <div>
            <h4 className="font-semibold text-green-700 mb-2">
              Your Picks ({myPicks.filter(p => p.playerId).length}):
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {myPicks.filter(p => p.playerId).map(pick => (
                <div key={pick.overall} className="p-2 bg-green-100 rounded border text-sm">
                  <div className="font-medium">
                    #{pick.overall} {pick.playerName} ({pick.position})
                  </div>
                  <div className="text-xs text-green-700">
                    Round {pick.round} • Potential: {pick.potential}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Prospect Pool */}
        <div className="xl:col-span-2">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setViewMode('available')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'available' ? 'bg-green-600 text-white' : 'bg-gray-200'
              }`}
            >
              Available ({availableProspects.length})
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'all' ? 'bg-green-600 text-white' : 'bg-gray-200'
              }`}
            >
              All Prospects
            </button>
            <button
              onClick={() => setViewMode('drafted')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'drafted' ? 'bg-green-600 text-white' : 'bg-gray-200'
              }`}
            >
              Drafted ({draftedPicks.length})
            </button>
          </div>
          
          <div className="bg-white rounded border max-h-96 overflow-y-auto">
            {viewMode !== 'drafted' && (
              <div className="space-y-1 p-3">
                {displayProspects.map((prospect, index) => {
                  const isDrafted = state.draftPicks?.some(dp => dp.playerId === prospect.id);
                  return (
                    <button
                      key={prospect.id}
                      onClick={() => isMyPick && !isDrafted ? setSelectedProspect(prospect.id) : null}
                      disabled={isDrafted || !isMyPick}
                      className={`w-full p-2 text-left rounded text-sm border transition-colors ${
                        selectedProspect === prospect.id 
                          ? 'border-green-500 bg-green-100' 
                          : isDrafted
                          ? 'border-gray-200 bg-gray-100 text-gray-500'
                          : isMyPick
                          ? 'border-gray-200 hover:bg-gray-50 cursor-pointer'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">#{index + 1} {prospect.name}</span>
                          <span className="text-gray-600 ml-2">({prospect.position})</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-600">Potential: {prospect.potential}</div>
                          {isDrafted && <div className="text-xs text-red-600">DRAFTED</div>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            
            {viewMode === 'drafted' && (
              <div className="space-y-1 p-3">
                {draftedPicks.map(pick => (
                  <div key={pick.overall} className="p-2 rounded border bg-gray-50 text-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">#{pick.overall} {pick.playerName}</span>
                        <span className="text-gray-600 ml-2">({pick.position})</span>
                      </div>
                      <div className="text-right text-xs">
                        <div>{teamLabel(state, pick.teamId)}</div>
                        <div className="text-gray-600">Potential: {pick.potential}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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

// -----------------------------------------------------------------------------
// DraftPhaseInterface - Uses real DraftRoom component
// -----------------------------------------------------------------------------

function DraftPhaseInterface({
  state,
  setState,
  myTeamId,
  onComplete
}: {
  state: SeasonState;
  setState: (updater: (s: SeasonState) => SeasonState) => void;
  myTeamId: string;
  onComplete: () => void;
}) {
  const [draftState, setDraftState] = useState<DraftState | null>(null);
  const draftEngine = useMemo(() => new DraftEngine(state.capLeague), [state.capLeague]);

  useEffect(() => {
    if (!draftState) {
      const newDraft = draftEngine.createDraft("2026", myTeamId);
      setDraftState(newDraft);
    }
  }, [draftEngine, myTeamId, draftState]);

  if (!draftState) {
    return (
      <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-center">
          <h3 className="text-xl font-bold text-blue-800 mb-4">🏒 Initializing NHL Draft...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-blue-800">🏒 NHL Entry Draft</h3>
        {!draftState.isActive && (
          <button
            onClick={onComplete}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Complete Draft →
          </button>
        )}
      </div>
      
      <DraftRoom
        league={state.capLeague}
        draftState={draftState}
        draftEngine={draftEngine}
        onMakePick={(prospectId) => {
          draftEngine.makePick(draftState, prospectId);
          setDraftState({...draftState});
          
          if (!draftState.isActive) {
            setTimeout(onComplete, 1000);
          }
        }}
        onSimToMyPick={() => {
          draftEngine.advanceToUserPick(draftState);
          setDraftState({...draftState});
        }}
      />
    </div>
  );
}

// -----------------------------------------------------------------------------
// FreeAgencyPhaseInterface - Uses real FreeAgencyHub components  
// -----------------------------------------------------------------------------

function FreeAgencyPhaseInterface({
  state,
  setState,
  myTeamId,
  onComplete
}: {
  state: SeasonState;
  setState: (updater: (s: SeasonState) => SeasonState) => void;
  myTeamId: string;
  onComplete: () => void;
}) {
  const [freeAgencyState, setFreeAgencyState] = useState<FreeAgencyState | null>(null);
  const freeAgencyEngine = useMemo(() => new FreeAgencyEngine(state.capLeague), [state.capLeague]);

  useEffect(() => {
    if (!freeAgencyState) {
      const newFA = startFreeAgency(state.capLeague, "2025-26");
      setFreeAgencyState(newFA);
    }
  }, [freeAgencyEngine, state.capLeague, freeAgencyState]);

  if (!freeAgencyState) {
    return (
      <div className="p-6 bg-green-50 rounded-lg border border-green-200">
        <div className="text-center">
          <h3 className="text-xl font-bold text-green-800 mb-4">💰 Initializing Free Agency...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-green-50 rounded-lg border border-green-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-green-800">💰 Free Agency Period</h3>
        <button
          onClick={onComplete}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Complete Free Agency →
        </button>
      </div>
      
      <div className="space-y-4">
        <FreeAgencySimControls
          league={state.capLeague}
          state={freeAgencyState}
          engine={freeAgencyEngine}
        />
        <FreeAgencyHub
          league={state.capLeague}
          state={freeAgencyState}
          engine={freeAgencyEngine}
          myTeamId={myTeamId}
          onSignUFA={(playerId, years, aav, teamId) => 
            freeAgencyEngine.signUFA(freeAgencyState, teamId, playerId, years, aav)
          }
          onTenderQO={(playerIds) => 
            freeAgencyEngine.tenderQualifyingOffers(freeAgencyState, myTeamId, playerIds)
          }
          onOfferSheet={(playerId, years, aav, fromTeamId) => 
            freeAgencyEngine.fileOfferSheet(freeAgencyState, fromTeamId, playerId, years, aav)
          }
          onMatchOffer={(playerId, match) => 
            freeAgencyEngine.resolveOfferSheet(freeAgencyState, playerId, match)
          }
        />
      </div>
    </div>
  );
}
