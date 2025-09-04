// Franchise Cap System – drop-in TypeScript module for your NHL game
// -----------------------------------------------------------------
// What this gives you
// 1) Data models for Contracts, Players, Teams, and Seasons
// 2) Cap math (cap hits, retained salary, buried contracts, LTIR relief, bonuses)
// 3) Roster and SPC limits (active roster 20–23, maximum 50 SPCs)
// 4) Trade validation that blocks illegal deals (over the cap, too many retained, etc.)
// 5) Simple buyout + termination helpers (approximate CBA rules)
// 6) Hooks to load real contract data later without changing logic
//
// How to use
// - Import this file anywhere you manage rosters, trades, and season-day simulation
// - Initialize a SeasonFinance object with league caps for the current season
// - Keep TeamState up-to-date (roster, LTIR list, retainers)
// - Call CapManager.validateAll(team) to check compliance
// - Call TradeEngine.validateTrade(...) before executing a trade
//
// Notes
// - Dollar figures are in whole dollars (integer). Use helper fmtMoney to present
// - Day-based proration uses seasonDays and daysElapsed for accuracy
// - LTIR handling is simplified but realistic enough for franchise mode
// - If you don't want CBA-deep rules, flip strict flags to false below

// -------------------- Types & Interfaces --------------------

export type UID = string;

export interface ContractYear {
  season: string; // e.g., "2025-26"
  baseSalary: number; // full-season base salary in dollars
  signingBonus?: number; // full-season signing bonus (counts toward cap)
  performanceBonus?: number; // potential bonuses (can create overage)
  twoWay?: boolean; // true = different minors salary (ignored for cap hit here)
}

export interface RetainedSlice {
  fromPlayerId: UID;
  percent: number; // 0 to 0.5 (NHL max 50%)
  remainingSeasons: number; // how many seasons left of retention obligation (including this one)
  capHitSavings: number; // cached absolute dollar savings for current season
}

export interface Contract {
  id: UID;
  playerId: UID;
  startSeason: string; // e.g., "2023-24"
  endSeason: string;   // inclusive
  years: ContractYear[]; // length must cover start..end
  ntc?: boolean; // no-trade
  partialNTCList?: string[]; // list of blocked teams ids (optional)
  nmc?: boolean; // no-move (blocks waivers, demotion)
  isELC?: boolean; // entry-level contract (can have bonuses)
  buyoutEligible?: boolean; // default true unless last year, etc.
}

export interface Player {
  id: UID;
  name: string;
  position: 'F' | 'D' | 'G';
  age: number;
  shoots?: 'L' | 'R';
  contractId?: UID;
  rightsTeamId?: UID; // for RFAs
  overall?: number;   // for AI decisions
}

export interface TeamState {
  id: UID;
  name: string;
  conference: 'East' | 'West';
  division: string;
  // Roster buckets
  activeRoster: UID[]; // player IDs on NHL roster (aim 20–23)
  irList: UID[];       // short-term IR (counts against cap)
  ltirList: UID[];     // LTIR (creates relief below)
  nonRoster: UID[];    // AHL/Juniors/Rights

  // Finance
  retained: RetainedSlice[]; // retained salary obligations
  buriedContracts: UID[];    // players in minors with buried cap
  spcCount: number;          // total SPCs signed (<= 50)
}

export interface SeasonFinance {
  season: string; // "2025-26"
  capUpperLimit: number; // e.g., 88000000
  capLowerLimit?: number; // optionally model floor
  minRoster: number; // usually 20
  maxRoster: number; // 23
  maxSPCs: number;   // 50
  seasonDays: number; // e.g., 186 regular season days for proration
}

export interface LeagueState {
  season: SeasonFinance;
  teams: Record<UID, TeamState>;
  players: Record<UID, Player>;
  contracts: Record<UID, Contract>;
  dayIndex: number; // 0..season.seasonDays-1
}

// -------------------- Utilities --------------------

export const fmtMoney = (n: number) => `$${(n/1_000_000).toFixed(2)}M`;
export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export const seasonIndex = (contract: Contract, season: string) =>
  contract.years.findIndex(y => y.season === season);

export const isSeasonWithin = (contract: Contract, season: string) =>
  seasonIndex(contract, season) !== -1;

export const getCapHitForSeason = (contract: Contract, season: string): number => {
  const idx = seasonIndex(contract, season);
  if (idx === -1) return 0;
  const y = contract.years[idx];
  const base = y.baseSalary + (y.signingBonus || 0);
  return Math.round(base); // simplified: AAV == current-year comp; change to true AAV if desired
};

export const calcDailyCapCharge = (fullSeasonCapHit: number, seasonDays: number) =>
  Math.floor(fullSeasonCapHit / seasonDays);

export const prorateByDays = (fullSeasonCapHit: number, seasonDays: number, daysElapsed: number) =>
  calcDailyCapCharge(fullSeasonCapHit, seasonDays) * daysElapsed;

// -------------------- Cap Math & Compliance --------------------

export class CapManager {
  constructor(private league: LeagueState) {}

  // Sum cap charges for all players on a team for the current day, with proration
  teamCapHit(teamId: UID): number {
    const { season, dayIndex, contracts, players } = this.league;
    const t = this.league.teams[teamId];
    const ids = [...t.activeRoster, ...t.irList]; // IR counts; LTIR handled via relief

    let total = 0;

    for (const pid of ids) {
      const p = players[pid];
      if (!p?.contractId) continue;
      const c = contracts[p.contractId];
      if (!c || !isSeasonWithin(c, season.season)) continue;
      const capHit = getCapHitForSeason(c, season.season);
      total += prorateByDays(capHit, season.seasonDays, dayIndex + 1);
    }

    // Buried contracts: only a portion counts in minors
    // Simplified: count min(buriedCap, capHit) with buriedCap set below (e.g., $1.15M)
    const BURIED_THRESHOLD = 1_150_000; // tweakable realism setting
    for (const pid of t.buriedContracts) {
      const p = players[pid];
      if (!p?.contractId) continue;
      const c = contracts[p.contractId];
      if (!c || !isSeasonWithin(c, season.season)) continue;
      const capHit = getCapHitForSeason(c, season.season);
      const buriedCount = Math.max(0, capHit - BURIED_THRESHOLD);
      total += prorateByDays(buriedCount, season.seasonDays, dayIndex + 1);
    }

    // Retained salary obligations (increase our cap charges)
    for (const r of t.retained) {
      const added = prorateByDays(r.capHitSavings, season.seasonDays, dayIndex + 1);
      total += added;
    }

    // LTIR relief
    const ltirRelief = this.ltirRelief(teamId);
    total = Math.max(0, total - ltirRelief);

    return total;
  }

  // LTIR relief: roughly (current cap overage beyond upper limit up to player's LTIR cap hit)
  ltirRelief(teamId: UID): number {
    const { season, dayIndex, contracts, players } = this.league;
    const t = this.league.teams[teamId];
    if (!t.ltirList.length) return 0;

    // Sum LTIR players' cap hits
    let ltirPool = 0;
    for (const pid of t.ltirList) {
      const p = players[pid];
      if (!p?.contractId) continue;
      const c = contracts[p.contractId];
      if (!c || !isSeasonWithin(c, season.season)) continue;
      const capHit = getCapHitForSeason(c, season.season);
      ltirPool += prorateByDays(capHit, season.seasonDays, dayIndex + 1);
    }

    // Team base charges before LTIR relief
    const base = (() => {
      const clone: TeamState = JSON.parse(JSON.stringify(this.league.teams[teamId]));
      const keep = new Set([...clone.activeRoster, ...clone.irList]);
      // don’t double count LTIR in active/IR (assume engine removes them from active)
      for (const pid of clone.ltirList) keep.delete(pid);
      clone.activeRoster = [...keep];
      return this.teamCapHitSansLTIR(teamId, clone);
    })();

    const upper = prorateByDays(season.capUpperLimit, season.seasonDays, dayIndex + 1);
    const overage = Math.max(0, base - upper);
    return Math.min(ltirPool, overage);
  }

  private teamCapHitSansLTIR(teamId: UID, snapshot: TeamState): number {
    const { season, dayIndex, contracts, players } = this.league;
    const ids = [...snapshot.activeRoster, ...snapshot.irList];
    let total = 0;

    const BURIED_THRESHOLD = 1_150_000;

    for (const pid of ids) {
      const p = players[pid];
      if (!p?.contractId) continue;
      const c = contracts[p.contractId];
      if (!c || !isSeasonWithin(c, season.season)) continue;
      const capHit = getCapHitForSeason(c, season.season);
      total += prorateByDays(capHit, season.seasonDays, dayIndex + 1);
    }

    // Buried
    const t = this.league.teams[teamId];
    for (const pid of t.buriedContracts) {
      const p = players[pid];
      if (!p?.contractId) continue;
      const c = contracts[p.contractId];
      if (!c || !isSeasonWithin(c, season.season)) continue;
      const capHit = getCapHitForSeason(c, season.season);
      const buriedCount = Math.max(0, capHit - BURIED_THRESHOLD);
      total += prorateByDays(buriedCount, season.seasonDays, dayIndex + 1);
    }

    // Retained obligations
    for (const r of t.retained) {
      const added = prorateByDays(r.capHitSavings, season.seasonDays, dayIndex + 1);
      total += added;
    }

    return total;
  }

  // Quick checks used across UI
  isAtOrUnderCap(teamId: UID): boolean {
    const { season, dayIndex } = this.league;
    const upper = prorateByDays(season.capUpperLimit, season.seasonDays, dayIndex + 1);
    return this.teamCapHit(teamId) <= upper;
  }

  getCapSpace(teamId: UID): number {
    const { season, dayIndex } = this.league;
    const upper = prorateByDays(season.capUpperLimit, season.seasonDays, dayIndex + 1);
    return Math.max(0, upper - this.teamCapHit(teamId));
  }

  validateAll(teamId: UID): string[] {
    const { season } = this.league;
    const t = this.league.teams[teamId];
    const errors: string[] = [];

    if (t.activeRoster.length < season.minRoster) errors.push(`Active roster below minimum (${t.activeRoster.length}/${season.minRoster}).`);
    if (t.activeRoster.length > season.maxRoster) errors.push(`Active roster above maximum (${t.activeRoster.length}/${season.maxRoster}).`);
    if (t.spcCount > season.maxSPCs) errors.push(`Too many SPCs (${t.spcCount}/${season.maxSPCs}).`);

    // Retained salary NHL realism limits
    const MAX_RETAINED_PER_CONTRACT = 0.5; // 50%
    const MAX_RETAINED_SLOTS = 3;          // per team
    const MAX_TOTAL_RETAINED_PCT = 0.15;   // 15% of cap upper limit

    if (t.retained.length > MAX_RETAINED_SLOTS) errors.push(`Too many retained salary slots (${t.retained.length}/${MAX_RETAINED_SLOTS}).`);

    // Per-contract retained limit checked during trade

    // Total retained cap vs upper limit
    const totalRetained = t.retained.reduce((sum, r) => sum + r.capHitSavings, 0);
    if (totalRetained > season.capUpperLimit * MAX_TOTAL_RETAINED_PCT) {
      errors.push(`Total retained salary ${fmtMoney(totalRetained)} exceeds ${Math.round(MAX_TOTAL_RETAINED_PCT*100)}% of cap.`);
    }

    if (!this.isAtOrUnderCap(teamId)) {
      const spent = this.teamCapHit(teamId);
      const { season, dayIndex } = this.league;
      const upper = prorateByDays(season.capUpperLimit, season.seasonDays, dayIndex + 1);
      errors.push(`Over the cap: spending ${fmtMoney(spent)} vs upper ${fmtMoney(upper)} (season to date).`);
    }

    return errors;
  }
}

// -------------------- Trade Engine --------------------

export interface TradePiece {
  playerId?: UID;
  pick?: { year: string; round: number; fromTeamId?: UID };
  retain?: { playerId: UID; percent: number }; // team A retains % on outgoing player
}

export interface TradeProposal {
  fromTeamId: UID;
  toTeamId: UID;
  fromPieces: TradePiece[]; // assets leaving fromTeam
  toPieces: TradePiece[];   // assets leaving toTeam
}

export class TradeEngine {
  constructor(private league: LeagueState, private cap: CapManager) {}

  validateTrade(tp: TradeProposal): { ok: boolean; errors: string[] } {
    const errors: string[] = [];
    const { players, contracts, season } = this.league;

    const teams = [tp.fromTeamId, tp.toTeamId];
    const snapshots: Record<UID, TeamState> = Object.fromEntries(
      teams.map(id => [id, JSON.parse(JSON.stringify(this.league.teams[id]))])
    );

    // Apply assets movement to snapshots
    const applyPieces = (giverId: UID, receiverId: UID, pieces: TradePiece[]) => {
      const giver = snapshots[giverId];
      const receiver = snapshots[receiverId];

      for (const piece of pieces) {
        if (piece.playerId) {
          // move player between rosters (keep their bucket if present; active by default)
          const pid = piece.playerId;
          // remove from any bucket on giver
          [giver.activeRoster, giver.irList, giver.ltirList, giver.nonRoster].forEach(list => {
            const i = list.indexOf(pid); if (i !== -1) list.splice(i, 1);
          });
          // add to receiver active roster by default
          receiver.activeRoster.push(pid);

          // Update SPC ownership transfer
          if (giver.spcCount > 0) giver.spcCount -= 1; 
          receiver.spcCount += 1;
        }
        if (piece.retain) {
          const { playerId, percent } = piece.retain;
          const p = players[playerId];
          const c = p?.contractId ? contracts[p.contractId] : undefined;
          if (!c || !isSeasonWithin(c, season.season)) {
            errors.push(`Cannot retain: no active contract for ${p?.name ?? playerId}.`);
            continue;
          }
          if (percent <= 0 || percent > 0.5) {
            errors.push(`Retained salary must be >0% and ≤50% for ${p?.name}.`);
            continue;
          }
          const capHit = getCapHitForSeason(c, season.season);
          const savings = Math.round(capHit * percent);

          // add retained slot to giver
          giver.retained.push({ fromPlayerId: playerId, percent, remainingSeasons: 1, capHitSavings: savings });
        }
      }
    };

    applyPieces(tp.fromTeamId, tp.toTeamId, tp.fromPieces);
    applyPieces(tp.toTeamId, tp.fromTeamId, tp.toPieces);

    // Validate retained salary slots realism
    for (const tid of teams) {
      const t = snapshots[tid];
      if (t.retained.length > 3) errors.push(`${this.league.teams[tid].name}: more than 3 retained-salary contracts.`);
      const totalRetained = t.retained.reduce((s, r) => s + r.capHitSavings, 0);
      if (totalRetained > this.league.season.capUpperLimit * 0.15) {
        errors.push(`${this.league.teams[tid].name}: retained >15% of cap.`);
      }
    }

    // After movement, check roster & cap for each team
    for (const tid of teams) {
      const errs = this.validateTeamSnapshot(tid, snapshots[tid]);
      errors.push(...errs.map(e => `${this.league.teams[tid].name}: ${e}`));
    }

    return { ok: errors.length === 0, errors };
  }

  private validateTeamSnapshot(teamId: UID, snap: TeamState): string[] {
    const { season, dayIndex, players, contracts } = this.league;
    const errors: string[] = [];

    if (snap.activeRoster.length < season.minRoster) errors.push(`Active roster would be below minimum (${snap.activeRoster.length}/${season.minRoster}).`);
    if (snap.activeRoster.length > season.maxRoster) errors.push(`Active roster would exceed maximum (${snap.activeRoster.length}/${season.maxRoster}).`);
    if (snap.spcCount > season.maxSPCs) errors.push(`SPCs would exceed ${season.maxSPCs}.`);

    // Compute cap using same rules as CapManager but with snapshot
    // (re-using internal method by temporarily swapping state would be messy; do inline here)
    const BURIED_THRESHOLD = 1_150_000;
    let total = 0;

    const ids = [...snap.activeRoster, ...snap.irList];
    for (const pid of ids) {
      const p = players[pid];
      if (!p?.contractId) continue;
      const c = contracts[p.contractId];
      if (!c || !isSeasonWithin(c, season.season)) continue;
      const capHit = getCapHitForSeason(c, season.season);
      total += prorateByDays(capHit, season.seasonDays, dayIndex + 1);
    }
    for (const pid of snap.buriedContracts) {
      const p = players[pid];
      if (!p?.contractId) continue;
      const c = contracts[p.contractId];
      if (!c || !isSeasonWithin(c, season.season)) continue;
      const capHit = getCapHitForSeason(c, season.season);
      total += prorateByDays(Math.max(0, capHit - BURIED_THRESHOLD), season.seasonDays, dayIndex + 1);
    }
    for (const r of snap.retained) {
      total += prorateByDays(r.capHitSavings, season.seasonDays, dayIndex + 1);
    }

    // LTIR relief for snapshot
    const ltirPool = snap.ltirList.reduce((sum, pid) => {
      const p = players[pid];
      if (!p?.contractId) return sum;
      const c = contracts[p.contractId];
      if (!c || !isSeasonWithin(c, season.season)) return sum;
      const capHit = getCapHitForSeason(c, season.season);
      return sum + prorateByDays(capHit, season.seasonDays, dayIndex + 1);
    }, 0);

    const upper = prorateByDays(season.capUpperLimit, season.seasonDays, dayIndex + 1);
    const overage = Math.max(0, total - upper);
    const relief = Math.min(ltirPool, overage);
    const afterRelief = Math.max(0, total - relief);

    if (afterRelief > upper) {
      errors.push(`Cap would be exceeded: ${fmtMoney(afterRelief)} vs ${fmtMoney(upper)} (season-to-date).`);
    }

    return errors;
  }
}

// -------------------- Buyouts & Terminations (simplified) --------------------

export class ContractOps {
  constructor(private league: LeagueState) {}

  // Very rough buyout approximation: goalie factor 2/3 of remaining salary spread over 2x years
  // You can replace with precise CBA math if desired.
  buyoutCapHit(contractId: UID, teamId: UID): number[] {
    const c = this.league.contracts[contractId];
    const { season } = this.league;
    if (!c) return [];

    // remaining seasons including current
    const idx = seasonIndex(c, season.season);
    if (idx === -1) return [];

    const remaining = c.years.slice(idx);
    const remainingSalary = remaining.reduce((s, y) => s + y.baseSalary + (y.signingBonus || 0), 0);
    const payout = Math.round((2/3) * remainingSalary);
    const years = remaining.length * 2;
    const perYear = Math.floor(payout / years);

    return new Array(years).fill(perYear);
  }

  terminate(contractId: UID): void {
    // Assumes mutual termination with no future cap implications
    const c = this.league.contracts[contractId];
    if (!c) return;
    const p = this.league.players[c.playerId];
    if (p) p.contractId = undefined;
    delete this.league.contracts[contractId];
  }
}

// -------------------- Data Loading Hooks --------------------

export interface ExternalContractRow {
  playerName: string;
  playerId: UID;
  teamId: UID;
  pos: 'F'|'D'|'G';
  seasons: { season: string; baseSalary: number; signingBonus?: number; performanceBonus?: number }[];
  ntc?: boolean; nmc?: boolean; isELC?: boolean;
}

export function importContracts(rows: ExternalContractRow[], league: LeagueState) {
  for (const row of rows) {
    const contractId = `ctr_${row.playerId}`;
    league.contracts[contractId] = {
      id: contractId,
      playerId: row.playerId,
      startSeason: row.seasons[0].season,
      endSeason: row.seasons[row.seasons.length-1].season,
      years: row.seasons.map(s => ({ season: s.season, baseSalary: s.baseSalary, signingBonus: s.signingBonus, performanceBonus: s.performanceBonus })),
      ntc: row.ntc, nmc: row.nmc, isELC: row.isELC,
    };
    league.players[row.playerId] = {
      id: row.playerId,
      name: row.playerName,
      position: row.pos,
      age: 0,
      contractId,
      rightsTeamId: row.teamId,
    };
  }
}

// -------------------- Example Initialization --------------------

export function createLeagueState(currentSeason = '2025-26'): LeagueState {
  const season: SeasonFinance = {
    season: currentSeason,
    capUpperLimit: 88_000_000, // plug the real cap for your season here
    capLowerLimit: 65_000_000,
    minRoster: 20,
    maxRoster: 23,
    maxSPCs: 50,
    seasonDays: 186,
  };

  const league: LeagueState = {
    season,
    teams: {},
    players: {},
    contracts: {},
    dayIndex: 0,
  };

  return league;
}
