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
    public immediateHof: boolean = true,
    public hofWaitYears: number = 3,
    public randomSalt: number = 777
  ) {}

  run(pool: Retiree[]): RetirementResult {
    const rng = this.createSeededRandom(this.seedForSeason());
    const decisions: RetirementDecision[] = [];
    const news: string[] = [];

    for (const r of pool) {
      const p = this.retirementProbability(r);
      const roll = rng();
      const retires = roll < p;

      const reason = this.retireReason(r, p, roll);
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

  private retirementProbability(r: Retiree): number {
    let base: number;
    const pos = r.position.toUpperCase();
    
    if (pos === 'G') {
      base = this.logistic(r.age, 38.5, 0.55);
    } else if (pos === 'D') {
      base = this.logistic(r.age, 37.0, 0.60);
    } else {
      base = this.logistic(r.age, 36.0, 0.65);
    }

    if (r.age <= 30) base *= 0.10;
    if (r.age >= 40) base = Math.max(base, 0.70);
    if (r.age >= 44) base = 1.0;

    if (r.overall < 74 && r.age >= 33) base += 0.10;
    if (r.overall < 70 && r.age >= 30) base += 0.12;
    if (r.overall >= 85 && r.age <= 38) base -= 0.08;
    if (r.potential >= 88 && r.age <= 36) base -= 0.05;

    if (r.gamesLastSeason < 20 && r.age >= 32) base += 0.10;
    if (r.majorInjuries >= 2) base += 0.12;
    if (r.majorInjuries >= 4) base += 0.10;

    if (r.contractYearsRemaining >= 2) base -= 0.04;
    if (r.contractYearsRemaining === 0 && r.age >= 34) base += 0.04;

    if (r.milestonesPending > 0 && r.milestonesPending <= 5) base -= 0.08;
    if (r.cups === 0 && r.age >= 33 && r.age <= 38) base -= 0.03;
    if (r.cups >= 3 && r.age >= 35) base += 0.05;

    if (r.isLegend && r.age < 40) base -= 0.06;
    if (r.isLegend && r.age >= 41) base += 0.08;

    return Math.max(0.0, Math.min(1.0, base));
  }

  private retireReason(r: Retiree, p: number, roll: number): string {
    if (r.age >= 44) return 'Age 44+: automatic retirement.';
    if (r.majorInjuries >= 4) return 'Multiple major injuries.';
    if (r.gamesLastSeason < 20 && r.age >= 32) return 'Limited usage.';
    if (r.overall < 70 && r.age >= 30) return 'Performance decline.';
    if (r.isLegend && r.age >= 41) return 'Legendary career end.';
    return `Stochastic (p=${p.toFixed(2)}, roll=${roll.toFixed(2)}).`;
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