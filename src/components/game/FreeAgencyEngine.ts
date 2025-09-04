// FreeAgencyEngine.ts
// ----------------------------------------------------------------------------
// Post‑re‑signings free agency system for Franchise Mode
// - Builds UFA/RFA pools after teams finish re-sign decisions
// - RFA: qualifying offers, offer sheets, match/compensation flow (simplified)
// - UFA: open market signings with cap/roster checks
// - Time-based resolution (advance day)
// - Hooks into CapManager for legality
//
// Assumptions / Simplifications
// 1) RFA eligibility: player has an expiring contract AND (age < 27 OR proYears < 7) AND rightsTeamId is set.
// 2) Qualifying Offer (QO) tiers (based on previous AAV-cap hit):
//    - <$1.5M → 120%  | $1.5M–$4.238M → 110% | ≥$4.238M → 105%
//    (Numbers chosen to be realistic but simplified; tweak in QO_TABLE)
// 3) Offer sheet match window = 7 sim days. Compensation tiers optional (stub provided).
// 4) UFA = expiring contract and NOT RFA eligible.
// 5) Contracts use the same structures from FranchiseCapSystem.

import type { UID, LeagueState, Contract, ContractYear } from "../../lib/salary-cap";
import { CapManager, getCapHitForSeason, isSeasonWithin } from "../../lib/salary-cap";

// --------------------------- Types -------------------------------------------

export type FAType = 'UFA' | 'RFA';

export interface FAListing {
  playerId: UID;
  type: FAType;
  lastCapHit: number; // previous season AAV used for QO/market
  rightsTeamId?: UID; // for RFAs
}

export interface QualifyingOffer {
  playerId: UID;
  teamId: UID;            // rights-holding team making the QO
  amount: number;         // 1-year base AAV offered
  season: string;         // e.g., "2025-26"
  expiresOnDay: number;   // league.dayIndex + window
  accepted?: boolean;
}

export interface OfferSheet {
  playerId: UID;
  fromTeamId: UID;
  toTeamId: UID;          // rights team
  years: number;
  aav: number;            // AAV being offered
  season: string;         // first season of the deal
  filedOnDay: number;
  matchDeadlineDay: number; // filedOnDay + 7 (default)
  matched?: boolean;
  compensation?: DraftCompensation;
}

export interface DraftCompensation {
  // Provide your own mapping by AAV to picks owed; here we just carry a label
  label: string; // e.g., "1st + 3rd"
}

export interface FreeAgencyState {
  // Indexed by player
  pendingQO: Record<UID, QualifyingOffer>;
  offerSheets: OfferSheet[];
  ufaPool: UID[];
  rfaPool: UID[];
}

// ---------------------- Configuration knobs ---------------------------------

const MATCH_WINDOW_DAYS = 7;

// Adjust these tiers to your preferred realism values
const QO_TABLE: { maxCapHit: number; multiplier: number }[] = [
  { maxCapHit: 1_500_000, multiplier: 1.20 },
  { maxCapHit: 4_238_000, multiplier: 1.10 },
  { maxCapHit: Number.POSITIVE_INFINITY, multiplier: 1.05 },
];

function qualifyingOfferAmount(lastCapHit: number): number {
  const tier = QO_TABLE.find(t => lastCapHit <= t.maxCapHit)!;
  return Math.round(lastCapHit * tier.multiplier);
}

// Example placeholder compensation mapping by AAV; tune as desired
function computeCompensation(aav: number): DraftCompensation | undefined {
  if (aav >= 10_000_000) return { label: 'Two 1sts + 2nd + 3rd' };
  if (aav >= 6_000_000) return { label: '1st + 2nd + 3rd' };
  if (aav >= 4_200_000) return { label: '2nd' };
  return undefined;
}

// ------------------------- Core Engine ---------------------------------------

export class FreeAgencyEngine {
  constructor(private league: LeagueState) {}

  /** Build UFA/RFA pools from all players with expiring contracts at the end of `seasonKey` */
  buildPoolsForOffseason(seasonKey: string): FreeAgencyState {
    const { contracts, players } = this.league;
    const ufa: UID[] = [];
    const rfa: UID[] = [];
    const pendingQO: Record<UID, QualifyingOffer> = {};

    // Determine who expires at end of seasonKey
    for (const c of Object.values(contracts)) {
      if (c.endSeason !== seasonKey) continue;
      const p = players[c.playerId];
      if (!p) continue;

      const lastCapHit = getCapHitForSeason(c, seasonKey);
      if (this.isRFAEligible(p.id, seasonKey)) {
        rfa.push(p.id);
        // auto-create QO record (team still needs to tender to keep rights)
        const qoAmt = qualifyingOfferAmount(lastCapHit);
        pendingQO[p.id] = {
          playerId: p.id,
          teamId: p.rightsTeamId!,
          amount: qoAmt,
          season: this.nextSeasonKey(seasonKey),
          expiresOnDay: this.league.dayIndex + MATCH_WINDOW_DAYS,
        };
      } else {
        ufa.push(p.id);
      }
    }

    return { pendingQO, offerSheets: [], ufaPool: ufa, rfaPool: rfa };
  }

  /** Team tenders their RFAs; returns list of players whose rights were kept */
  tenderQualifyingOffers(state: FreeAgencyState, teamId: UID, playerIds?: UID[]): UID[] {
    const kept: UID[] = [];
    for (const pid of state.rfaPool) {
      const qo = state.pendingQO[pid];
      if (!qo || qo.teamId !== teamId) continue;
      if (playerIds && !playerIds.includes(pid)) continue; // selective tendering
      // Mark as tendered by setting expiresOnDay relative to NOW
      qo.expiresOnDay = this.league.dayIndex + MATCH_WINDOW_DAYS;
      kept.push(pid);
    }
    return kept;
  }

  /** UFA signing: creates a new contract if cap/roster rules allow */
  signUFA(state: FreeAgencyState, teamId: UID, playerId: UID, years: number, aav: number): { ok: boolean; errors?: string[] } {
    if (!state.ufaPool.includes(playerId)) return { ok: false, errors: ['Player is not a UFA.'] };

    const c = this.createNewContract(playerId, years, aav);
    this.attachContract(teamId, playerId, c);

    // Cap/roster validation
    const cap = new CapManager(this.league);
    const errs = cap.validateAll(teamId);
    if (errs.length) {
      // rollback
      this.detachContract(playerId, c.id);
      return { ok: false, errors: errs };
    }

    // Success → remove from pool
    state.ufaPool = state.ufaPool.filter(id => id !== playerId);
    return { ok: true };
  }

  /** File an offer sheet on another team's RFA */
  fileOfferSheet(state: FreeAgencyState, fromTeamId: UID, playerId: UID, years: number, aav: number): { ok: boolean; errors?: string[] } {
    if (!state.rfaPool.includes(playerId)) return { ok: false, errors: ['Player is not an RFA.'] };
    const p = this.league.players[playerId];
    if (!p?.rightsTeamId || p.rightsTeamId === fromTeamId) return { ok: false, errors: ['Invalid rights team.'] };

    const filedOn = this.league.dayIndex;
    const deadline = filedOn + MATCH_WINDOW_DAYS;
    state.offerSheets.push({
      playerId,
      fromTeamId,
      toTeamId: p.rightsTeamId,
      years,
      aav,
      season: this.league.season.season,
      filedOnDay: filedOn,
      matchDeadlineDay: deadline,
      compensation: computeCompensation(aav),
    });

    return { ok: true };
  }

  /** Rights team response: match (keeps player with same terms) or decline (player joins offer sheet team). */
  resolveOfferSheet(state: FreeAgencyState, playerId: UID, match: boolean): { ok: boolean; errors?: string[] } {
    const os = state.offerSheets.find(o => o.playerId === playerId && !('resolved' as any in o));
    if (!os) return { ok: false, errors: ['No active offer sheet.'] };
    const p = this.league.players[playerId];
    if (!p?.rightsTeamId) return { ok: false, errors: ['No rights team.'] };

    const cap = new CapManager(this.league);

    if (match) {
      // Contract goes to rights team with same terms
      const c = this.createNewContract(playerId, os.years, os.aav);
      this.attachContract(p.rightsTeamId, playerId, c);
      const errs = cap.validateAll(p.rightsTeamId);
      if (errs.length) { this.detachContract(playerId, c.id); return { ok: false, errors: errs }; }
      os.matched = true;
    } else {
      // Player signs with offering team; compensation stub
      const c = this.createNewContract(playerId, os.years, os.aav);
      this.attachContract(os.fromTeamId, playerId, c);
      const errs = cap.validateAll(os.fromTeamId);
      if (errs.length) { this.detachContract(playerId, c.id); return { ok: false, errors: errs }; }
      // TODO: transfer draft picks per os.compensation
      os.matched = false;
    }

    // Remove from RFA pool on success
    if (!cap.validateAll(p.rightsTeamId).length) {
      // Either matched or declined successfully
      state.rfaPool = state.rfaPool.filter(id => id !== playerId);
      delete state.pendingQO[playerId];
    }

    return { ok: true };
  }

  /** Advance one FA day: expire QOs not tendered, auto-accept minimum deals, resolve expired offer sheets */
  advanceDay(state: FreeAgencyState): void {
    this.league.dayIndex += 1;

    // Expire QOs (untendered or lapsed)
    for (const [pid, qo] of Object.entries(state.pendingQO)) {
      if (this.league.dayIndex > qo.expiresOnDay && !qo.accepted) {
        // Player becomes UFA if QO was never accepted and no offer sheet
        const id = pid as UID;
        if (!state.ufaPool.includes(id)) state.ufaPool.push(id);
        state.rfaPool = state.rfaPool.filter(x => x !== id);
        delete state.pendingQO[id];
      }
    }

    // Resolve offer sheets that hit deadline with no decision → treated as declined (player joins offering team)
    for (const os of state.offerSheets) {
      if (this.league.dayIndex > os.matchDeadlineDay && os.matched === undefined) {
        // auto-decline → player signs with fromTeam
        const c = this.createNewContract(os.playerId, os.years, os.aav);
        this.attachContract(os.fromTeamId, os.playerId, c);
        // TODO: apply compensation
        os.matched = false;
        state.rfaPool = state.rfaPool.filter(id => id !== os.playerId);
        delete state.pendingQO[os.playerId];
      }
    }
  }

  // ----------------------- Helpers -----------------------------------------

  private isRFAEligible(playerId: UID, seasonKey: string): boolean {
    const p = this.league.players[playerId] as any;
    // You can store p.proYears and p.age; fallback defaults
    const proYears = typeof p.proYears === 'number' ? p.proYears : 3;
    const age = typeof p.age === 'number' ? p.age : 24;
    const rightsTeam = p.rightsTeamId;
    const c = p.contractId ? this.league.contracts[p.contractId] : undefined;
    if (!c || c.endSeason !== seasonKey) return false;
    return !!rightsTeam && (age < 27 || proYears < 7);
  }

  private nextSeasonKey(seasonKey: string): string {
    // "2025-26" -> "2026-27"
    const [a,b] = seasonKey.split('-').map(x => parseInt(x,10));
    return `${a+1}-${(b+1).toString().padStart(2,'0')}`;
  }

  private createNewContract(playerId: UID, years: number, aav: number): Contract {
    const startSeason = this.league.season.season;
    const yearsArr: ContractYear[] = [];
    let s = startSeason;
    for (let i=0;i<years;i++) {
      yearsArr.push({ season: s, baseSalary: aav });
      s = this.nextSeasonKey(s);
    }
    const id = `ctr_${playerId}_${Date.now()}`;
    return { id, playerId, startSeason: startSeason, endSeason: yearsArr[yearsArr.length-1].season, years: yearsArr };
  }

  private attachContract(teamId: UID, playerId: UID, c: Contract) {
    this.league.contracts[c.id] = c;
    const p = this.league.players[playerId];
    if (p) { p.contractId = c.id; p.rightsTeamId = teamId; }
    // if not already on roster, place in active by default and bump SPC
    const t = this.league.teams[teamId];
    if (!t.activeRoster.includes(playerId)) t.activeRoster.push(playerId);
    t.spcCount = (t.spcCount || 0) + 1;
  }

  private detachContract(playerId: UID, contractId: UID) {
    delete this.league.contracts[contractId];
    const p = this.league.players[playerId];
    if (p && p.contractId === contractId) p.contractId = undefined;
  }
}

// ----------------------- Convenience API ------------------------------------

/**
 * Run at the flip to offseason, right after you apply re-sign decisions:
 *  1) Feed in the season that just ended (e.g., "2025-26")
 *  2) Get back FA state; store it in your franchise save
 */
export function startFreeAgency(league: LeagueState, seasonJustEnded: string): FreeAgencyState {
  const eng = new FreeAgencyEngine(league);
  return eng.buildPoolsForOffseason(seasonJustEnded);
}
