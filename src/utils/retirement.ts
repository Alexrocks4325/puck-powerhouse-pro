// Retirement and Hall of Fame Engine
// Converted from Dart to TypeScript for NHL simulation

export interface Retiree {
  id: string;
  name: string;
  position: 'C' | 'LW' | 'RW' | 'D' | 'G';
  age: number;
  seasonsPlayed: number;
  gamesLastSeason: number;
  majorInjuries: number;
  overall: number;
  potential: number;
  careerGoals: number;
  careerPoints: number;
  cups: number;
  awardsScore: number;
  milestonesPending: number;
  isLegend: boolean;
  contractYearsRemaining: number;
}

export interface RetirementDecision {
  playerId: string;
  playerName: string;
  retires: boolean;
  probability: number;
  reason: string;
  hofScore: number;
  hofRecommend: boolean;
}

export interface HallOfFameInductee {
  playerId: string;
  playerName: string;
  hofScore: number;
  classYear: number;
}

export interface RetirementResult {
  retirements: RetirementDecision[];
  hallOfFame: HallOfFameInductee[];
  newsEvents: string[];
}

export class AwardsWeights {
  static readonly hart = 5;
  static readonly artRoss = 4;
  static readonly rocketRichard = 4;
  static readonly norris = 4;
  static readonly vezina = 4;
  static readonly selke = 3;
  static readonly calder = 3;
  static readonly connSmythe = 5;
  static readonly allStar = 1;
}

export function computeAwardsScore({
  hart = 0,
  artRoss = 0,
  rocketRichard = 0,
  norris = 0,
  vezina = 0,
  selke = 0,
  calder = 0,
  connSmythe = 0,
  allStar = 0,
}: {
  hart?: number;
  artRoss?: number;
  rocketRichard?: number;
  norris?: number;
  vezina?: number;
  selke?: number;
  calder?: number;
  connSmythe?: number;
  allStar?: number;
} = {}): number {
  return (
    hart * AwardsWeights.hart +
    artRoss * AwardsWeights.artRoss +
    rocketRichard * AwardsWeights.rocketRichard +
    norris * AwardsWeights.norris +
    vezina * AwardsWeights.vezina +
    selke * AwardsWeights.selke +
    calder * AwardsWeights.calder +
    connSmythe * AwardsWeights.connSmythe +
    allStar * AwardsWeights.allStar
  );
}

export class RetirementEngine {
  constructor(
    public seasonYear: number,
    public maxHofPerYear: number = 4,
    public tooOldAge: number = 42,
    public finalYearThreshold: number = 1,
    public requireFinalYearGate: boolean = true,
    public immediateHof: boolean = true,
    public hofWaitYears: number = 3,
    public randomSalt: number = 777
  ) {}

  run(pool: Retiree[]): RetirementResult {
    const rng = this.createSeededRandom(this.seedForSeason());
    const decisions: RetirementDecision[] = [];
    const news: string[] = [];

    for (const r of pool) {
      const eligible = this.isEligible(r);
      let p: number;

      if (!eligible) {
        p = 0.0;
      } else if (r.age >= 44) {
        p = 1.0; // hard cap: very old always retire
      } else {
        p = this.retirementProbabilityConstrained(r);
      }

      const roll = rng();
      const retires = roll < p;

      const reason = this.retireReason(r, eligible, p, roll);
      const hofScore = this.hofScore(r);
      const hofRecommend = retires && hofScore >= 3.0;

      decisions.push({
        playerId: r.id,
        playerName: r.name,
        retires,
        probability: p,
        reason,
        hofScore,
        hofRecommend,
      });

      if (retires) {
        news.push(this.newsRetires(r));
        if (hofRecommend && this.immediateHof) {
          news.push(`Hall of Fame Watch: ${r.name} is a first-ballot lock.`);
        }
      }
    }

    const hofClass = decisions
      .filter((d) => d.retires && d.hofRecommend)
      .sort((a, b) => b.hofScore - a.hofScore);

    const inductees: HallOfFameInductee[] = [];
    for (let i = 0; i < hofClass.length && i < this.maxHofPerYear; i++) {
      const d = hofClass[i];
      inductees.push({
        playerId: d.playerId,
        playerName: d.playerName,
        hofScore: d.hofScore,
        classYear: this.seasonYear,
      });
      news.push(`Hall of Fame Class of ${this.seasonYear}: ${d.playerName} inducted.`);
    }

    return {
      retirements: decisions,
      hallOfFame: inductees,
      newsEvents: news,
    };
  }

  private seedForSeason(): number {
    return this.seasonYear ^ this.randomSalt;
  }

  private createSeededRandom(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 1664525 + 1013904223) % 2**32;
      return state / 2**32;
    };
  }

  private isEligible(r: Retiree): boolean {
    if (r.age >= this.tooOldAge) return true; // "way too old" bypass
    if (!this.requireFinalYearGate) return true;
    // Only allow if at/entering final year of contract (or UFA)
    return r.contractYearsRemaining <= this.finalYearThreshold;
  }

  private retirementProbabilityConstrained(r: Retiree): number {
    // This is a *toned-down* curve applied ONLY to eligible players.
    // Start from a conservative base:
    let base: number;

    // Position-dependent age inflection — but lower steepness:
    const pos = r.position.toUpperCase();
    if (pos === 'G') {
      base = this.logistic(r.age, 39.0, 0.40);
    } else if (pos === 'D') {
      base = this.logistic(r.age, 37.5, 0.45);
    } else {
      base = this.logistic(r.age, 36.5, 0.48);
    }

    // Cap at modest levels unless truly old
    base = Math.max(0.0, Math.min(base, r.age >= (this.tooOldAge - 1) ? 0.85 : 0.55));

    // Small nudges (kept mild):
    if (r.overall < 72 && r.age >= 32) base += 0.08;
    if (r.overall >= 85 && r.age <= 38) base -= 0.08;
    if (r.gamesLastSeason < 15 && r.age >= 31) base += 0.08;
    if (r.majorInjuries >= 3) base += 0.10;

    // Milestone chase reduces odds (eligible but sticking around)
    if (r.milestonesPending > 0 && r.milestonesPending <= 5) base -= 0.10;

    // Legends linger a bit
    if (r.isLegend && r.age < 40) base -= 0.06;

    // Contract context — already gated to final year, but tiny effect:
    if (r.contractYearsRemaining > 0) base -= 0.03; // one more year tends to stay
    if (r.contractYearsRemaining === 0) base += 0.03; // UFA status nudges toward retirement

    return Math.max(0.0, Math.min(1.0, base));
  }

  private retireReason(r: Retiree, eligible: boolean, p: number, roll: number): string {
    if (!eligible) return 'Not in final contract year and not too old.';
    if (r.age >= 44) return 'Age 44+: automatic retirement.';
    if (r.age >= this.tooOldAge) return 'Beyond configured tooOldAge threshold.';
    if (r.majorInjuries >= 4) return 'Multiple major injuries.';
    if (r.gamesLastSeason < 15 && r.age >= 31) return 'Limited usage.';
    if (r.overall < 72 && r.age >= 32) return 'Performance decline.';
    return `Eligible (final contract year). Stochastic (p=${p.toFixed(2)}, roll=${roll.toFixed(2)}).`;
  }

  private hofScore(r: Retiree): number {
    const pointsPart = r.careerPoints * 0.002;
    const goalsPart = r.careerGoals * 0.003;
    const cupsPart = r.cups * 0.50;
    const awardsPart = r.awardsScore * 0.30;
    const seasonsPart = r.seasonsPlayed * 0.05;
    const legendBonus = r.isLegend ? 0.6 : 0.0;

    let score = pointsPart + goalsPart + cupsPart + awardsPart + seasonsPart + legendBonus;

    if (r.overall >= 88 && r.age >= 35) score += 0.25;

    return score;
  }

  private logistic(x: number, mid: number, steep: number): number {
    return 1.0 / (1.0 + Math.exp(-steep * (x - mid)));
  }

  private newsRetires(r: Retiree): string {
    const role = r.isLegend 
      ? 'Legend' 
      : (r.overall >= 80 ? 'Veteran star' : 'Veteran');
    
    const career = (r.careerPoints > 0 || r.careerGoals > 0)
      ? ` Career: ${r.careerGoals} G, ${r.careerPoints} P, ${r.cups} Cups.`
      : ` Career: ${r.cups} Cups.`;
    
    return `${role} ${r.name} retires at age ${r.age} after ${r.seasonsPlayed} seasons.${career}`;
  }
}