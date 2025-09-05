export type PotentialTier = "LOW" | "MED" | "HIGH" | "ELITE";
export type Position = "F" | "D" | "G";

export interface SkaterStats {
  gp: number; goals: number; assists: number; points: number;
  plusMinus: number; pim: number; shots: number; toiPerGame: number; // minutes
}
export interface GoalieStats {
  gp: number; wins: number; losses: number; gaa: number; svPct: number; shutouts: number; toiPerGame: number;
}
export type SeasonStats = { skater?: SkaterStats; goalie?: GoalieStats };

export interface Player {
  id: string;
  name: string;
  age: number;
  position: Position;
  overall: number;           // 0–99
  potential: number;         // 60–99 hard cap
  potentialTier: PotentialTier;
  growthCurve?: "EARLY" | "STANDARD" | "LATE"; // optional flavor
  // core attributes (skaters)
  shooting?: number; passing?: number; skating?: number; defense?: number; physical?: number; iq?: number;
  // goalies
  reflexes?: number; glove?: number; blocker?: number; positioning?: number; rebound?: number; puckplay?: number;
}

export interface LeagueContext {
  eraScoringFactor?: number; // 0.8–1.2 (optional: league-wide scoring environment)
  difficulty?: "SIM" | "HARD" | "EASY"; // affects growth/decline magnitudes slightly
}

export interface ProgressionChange {
  id: string;
  name: string;
  beforeOverall: number;
  afterOverall: number;
  deltaOverall: number;
  attrChanges: Record<string, number>;
  notes: string[];
}

// ---------- helpers ----------
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const rnd = (min: number, max: number) => Math.random() * (max - min) + min;
const sign = (n: number) => (n >= 0 ? "+" : "–");

function difficultyScale(d: LeagueContext["difficulty"]) {
  if (d === "HARD") return 0.85;
  if (d === "EASY") return 1.15;
  return 1.0;
}

function baseAgeGrowth(age: number, curve: Player["growthCurve"]) {
  // returns a base growth "budget" before performance/potential caps
  // positive = growth, negative = decline
  const c = curve ?? "STANDARD";
  if (age <= 23) return c === "LATE" ? 0.6 : 1.2;     // teens/early 20s
  if (age <= 26) return c === "EARLY" ? 0.8 : 0.6;    // early-mid 20s
  if (age <= 30) return 0.2;                          // prime
  if (age <= 33) return -0.3;                         // gentle decline
  if (age <= 36) return -0.8;                         // faster decline
  return -1.4;                                        // late decline
}

function potentialTierBonus(tier: PotentialTier) {
  switch (tier) {
    case "ELITE": return 1.2;
    case "HIGH":  return 0.8;
    case "MED":   return 0.4;
    case "LOW":   return 0.15;
  }
}

function breakoutOrBust(overall: number, potential: number) {
  // small chance of a breakout or bust each season
  // bigger chance if far from potential (for breakout) or very old (for bust)
  const gap = potential - overall;
  const breakoutChance = clamp(0.02 + gap * 0.004, 0.02, 0.12); // 2–12%
  const bustChance = 0.04; // ~4%
  let mod = 0;
  if (Math.random() < breakoutChance) mod += rnd(0.5, 2.0);
  if (Math.random() < bustChance) mod -= rnd(0.5, 1.5);
  return mod;
}

function expectedSkaterPoints(age: number, toi: number) {
  // crude expectation by age & ice-time; you can refine by line/role later
  const agePeak = age >= 23 && age <= 28 ? 1.0 : age < 23 ? 0.85 : 0.9;
  return (toi * 82 * 0.55) * agePeak; // 0.55 pts per minute per 82 as a baseline scaler
}

function expectedGoalieSvPct(age: number) {
  // mild curve: young/old slightly worse
  if (age <= 23) return 0.905;
  if (age <= 28) return 0.910;
  if (age <= 33) return 0.909;
  if (age <= 36) return 0.906;
  return 0.900;
}

function skaterPerformanceScore(stats: SkaterStats, age: number, era = 1.0) {
  const expPts = expectedSkaterPoints(age, stats.toiPerGame / 20) * era; // normalize toi scale a bit
  const ptsOverExp = stats.points - expPts;
  const plusMinusTerm = stats.plusMinus * 0.3;
  const usage = clamp(stats.gp / 82, 0, 1);
  // normalize to a compact score band roughly -3..+3
  return clamp((ptsOverExp / 15) + (plusMinusTerm / 10) + (usage - 0.5), -3, +3);
}

function goaliePerformanceScore(stats: GoalieStats, age: number) {
  const expSv = expectedGoalieSvPct(age);
  const svDelta = (stats.svPct ?? 0.9) - expSv; // e.g., +0.010 is good
  const usage = clamp(stats.gp / 60, 0, 1);     // 60gp ~ full starter
  const gaaTerm = clamp((2.9 - (stats.gaa ?? 3.1)) / 0.6, -1.5, 1.5);
  return clamp((svDelta / 0.006) + (gaaTerm) + (usage - 0.4), -3, +3);
}

// ---------- main entry ----------
export function updatePlayerDevelopmentForSeason(
  players: Player[],
  statsById: Record<string, SeasonStats>,
  ctx: LeagueContext = {}
): ProgressionChange[] {
  const diff = difficultyScale(ctx.difficulty);
  const era = ctx.eraScoringFactor ?? 1.0;

  return players.map((p) => {
    const before = p.overall;
    const st = statsById[p.id];
    const notes: string[] = [];
    let growthBudget = baseAgeGrowth(p.age, p.growthCurve) * diff; // age curve
    growthBudget += potentialTierBonus(p.potentialTier) * 0.35 * diff;

    // Performance influence
    if (p.position === "G" && st?.goalie) {
      const perf = goaliePerformanceScore(st.goalie, p.age);
      growthBudget += perf * 0.8;
      if (perf >= 1.0) notes.push("Outperformed expectations (G)");
      if (perf <= -1.0) notes.push("Underperformed (G)");
    } else if (st?.skater) {
      const perf = skaterPerformanceScore(st.skater, p.age, era);
      growthBudget += perf * 0.8;
      if (perf >= 1.0) notes.push("Outperformed expectations");
      if (perf <= -1.0) notes.push("Underperformed");
    } else {
      notes.push("Limited usage / no stats");
      growthBudget -= 0.2;
    }

    // Breakout / bust randomness
    const swing = breakoutOrBust(p.overall, p.potential) * diff;
    if (swing > 0.5) notes.push("Breakout!");
    if (swing < -0.5) notes.push("Bust risk");
    growthBudget += swing;

    // Apply attribute-level changes (position-aware)
    const attrChanges: Record<string, number> = {};
    const apply = (key: keyof Player, amt: number) => {
      if (typeof p[key] !== "number") return;
      // @ts-ignore
      p[key] = clamp((p[key] as number) + amt, 40, 99);
      attrChanges[key as string] = (attrChanges[key as string] ?? 0) + amt;
    };

    const spread = (total: number, weights: [string, number][]) => {
      const wsum = weights.reduce((a, [, w]) => a + w, 0);
      weights.forEach(([k, w]) => apply(k as keyof Player, (total * (w / wsum))));
    };

    // translate growth budget (~ -3..+4) into overall + attribute deltas
    const maxRoom = clamp(p.potential - p.overall, -10, 30); // how far from cap
    let overallDelta = clamp(growthBudget, -3.5, 4.0);
    if (overallDelta > 0) overallDelta = Math.min(overallDelta, maxRoom / 5); // slow near cap

    // Position-specific distribution
    if (p.position === "G") {
      spread(overallDelta * 2.2, [
        ["reflexes", 3], ["positioning", 3], ["glove", 2], ["blocker", 2], ["rebound", 1], ["puckplay", 1],
      ]);
    } else if (p.position === "D") {
      spread(overallDelta * 2.2, [
        ["defense", 3], ["iq", 2], ["skating", 2], ["passing", 2], ["physical", 1], ["shooting", 1],
      ]);
    } else { // Forward
      spread(overallDelta * 2.2, [
        ["shooting", 3], ["skating", 2], ["passing", 2], ["iq", 2], ["physical", 1], ["defense", 1],
      ]);
    }

    // Final overall recompute: blend towards attribute mean while respecting cap/decline
    const attrList =
      p.position === "G"
        ? [p.reflexes, p.positioning, p.glove, p.blocker, p.rebound, p.puckplay]
        : [p.shooting, p.passing, p.skating, p.defense, p.physical, p.iq];
    const attrMean = attrList.filter((x) => typeof x === "number") as number[];
    const targetOverall = attrMean.length ? attrMean.reduce((a, b) => a + b, 0) / attrMean.length : p.overall;

    const afterRaw = clamp(Math.round((p.overall + overallDelta * 2 + targetOverall) / 3), 40, 99);
    const capped = overallDelta >= 0 ? Math.min(afterRaw, p.potential) : afterRaw;

    // Late-age forced decline floor
    const ageDecline = p.age >= 34 ? rnd(0.2, 1.2) : 0;
    const after = clamp(Math.round(capped - ageDecline), 40, 99);
    if (ageDecline > 0.4) notes.push("Age decline");

    const result: ProgressionChange = {
      id: p.id,
      name: p.name,
      beforeOverall: before,
      afterOverall: after,
      deltaOverall: after - before,
      attrChanges,
      notes,
    };

    p.overall = after; // mutate roster
    return result;
  });
}