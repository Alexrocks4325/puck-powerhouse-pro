// AccurateSim.ts
// Drop-in, accuracy-focused game simulation that:
// - Rewards higher OVR players with more shots/points
// - Boosts production by line usage (L1 > L2 > L3 > L4) and TOI
// - Factors goalie OVR, defense strength, home-ice, fatigue, and chemistry
// - Works with your existing SeasonState + optional TeamManager lineup
//
// USAGE:
// import { simulateGameAccurate } from "./AccurateSim";
// const result = simulateGameAccurate(state, homeTeamId, awayTeamId, { wentToOT: false });
// -> result.boxScore (detailed), and it MUTATES `state` to update players/teams stats safely.
//
// Assumptions (adjust in CONFIG below):
// - Team.skaters / Team.goalies contain season stat fields like gp,g,a,p,shots,plusMinus etc.
// - Team may have (team as any).lineup from TeamManager; if absent, we auto-build lines by OVR.
// - Goalie OVR influences save%; defense overall influences opponent's shot quality.
// - Passing/shooting/defense attributes exist on skaters (fallback to OVR if missing).

// ---------------------- Types ----------------------
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
  // Team totals
  w: number; l: number; otl: number; gf: number; ga: number; shotsFor: number; shotsAgainst: number;
  ppAttempts?: number; ppGoals?: number; foWon?: number; foLost?: number;
};
export type Game = { id: string; day: number; homeId: ID; awayId: ID; played: boolean; final?: {homeGoals:number; awayGoals:number; ot:boolean}; };
export type GoalEvent = { minute:number; teamId:ID; scorerId:ID; assist1Id?:ID; assist2Id?:ID; };
export type BoxScore = {
  gameId: string; homeId: ID; awayId: ID; goals: GoalEvent[]; shots: Record<ID, number>;
  goalieShots: Record<ID, number>; goalieSaves: Record<ID, number>; homeGoalieId: ID; awayGoalieId: ID; ot: boolean;
};
export type SeasonState = {
  seasonYear: string; currentDay: number; totalDays: number;
  schedule: Game[]; boxScores: Record<string, BoxScore>; teams: Record<ID, Team>; teamOrder: ID[];
};

// ---------------------- Config knobs ----------------------
const CONFIG = {
  baseShotsRange: [26, 36],            // baseline team shots range
  homeIceShotBoost: 1.05,              // ~5% more shots for home
  offenseVsDefenseScalar: 0.12,        // shots mod by (O_off - O_def) * scalar
  goalieOVRtoSVPCT: (ovr:number) => 0.880 + (ovr/100)*0.07,   // 88% + up to ~7% from OVR
  lineSharesForwards: [0.36, 0.30, 0.20, 0.14], // L1..L4 TOI share
  lineSharesDefense:  [0.36, 0.33, 0.31],       // D1..D3 TOI share
  eventMinutes: 60,
  goalAssistProb: 0.85,                // chance of at least 1 assist
  secondAssistProb: 0.45,              // chance of second assist if first awarded
  alphaOVRShotWeight: 1.20,            // higher => more OVR skew in shot allocation
  alphaSkillWeight: 0.35,              // blend skill (shooting/passing) with OVR
  fatiguePenaltyPerGame: 0.002,        // tiny penalty based on gp for usage
  chemistryBoostSameLine: 1.06,        // slight boost to on-line assists/scoring
  ppChancePerGame: 3.6,                // average PP opportunities per team
  ppConversionBase: 0.185,             // base PP goal rate (~18.5%)
  ppWeightBoost: 1.18,                 // PP increases shot->goal odds
};

// ---------------------- Helpers ----------------------
const clamp = (n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const choice = <T,>(arr:T[]) => arr[Math.floor(Math.random()*arr.length)];
const randN = (min:number,max:number)=> Math.floor(Math.random()*(max-min+1))+min;
const sum = (xs:number[]) => xs.reduce((a,b)=>a+b,0);

function getSkaterSkillShot(s:Skater){ return (s.shooting ?? s.overall)*0.7 + s.overall*0.3; }
function getSkaterSkillPass(s:Skater){ return (s.passing ?? s.overall)*0.7 + s.overall*0.3; }
function getSkaterSkillDef (s:Skater){ return (s.defense ?? s.overall)*0.7 + s.overall*0.3; }

function meanOverall(skaters:Skater[], filter?:(s:Skater)=>boolean){
  const pool = filter? skaters.filter(filter): skaters;
  if(!pool.length) return 60;
  return pool.map(x=>x.overall).reduce((a,b)=>a+b,0)/pool.length;
}

function lineupOrAuto(team:Team){
  // If TeamManager saved a lineup, use it; else auto by OVR
  const lu = (team as any).lineup as undefined | {forwards: ID[][]; defense: ID[][]; goalieStart?:ID; goalieBackup?:ID};
  if (lu && lu.forwards?.length && lu.defense?.length) {
    return {
      fLines: lu.forwards.map(arr => arr.map(id => team.skaters.find(s=>s.id===id)).filter(Boolean) as Skater[]),
      dPairs: lu.defense.map(arr => arr.map(id => team.skaters.find(s=>s.id===id)).filter(Boolean) as Skater[]),
      starter: team.goalies.find(g=>g.id===lu.goalieStart) ?? team.goalies.sort((a,b)=>b.overall-a.overall)[0],
      backup: team.goalies.find(g=>g.id===lu.goalieBackup) ?? team.goalies.sort((a,b)=>b.overall-a.overall)[1] ?? null,
    };
  }
  // Auto: Top-12 Fs by OVR split 3/line, top-6 D by OVR split pairs, best goalie start
  const forwards = team.skaters.filter(s=>s.position!=="D").sort((a,b)=>b.overall-a.overall).slice(0,12);
  const defense  = team.skaters.filter(s=>s.position==="D").sort((a,b)=>b.overall-a.overall).slice(0,6);
  const fLines:Skater[][] = [forwards.slice(0,3), forwards.slice(3,6), forwards.slice(6,9), forwards.slice(9,12)];
  const dPairs:Skater[][] = [defense.slice(0,2), defense.slice(2,4), defense.slice(4,6)];
  const gs = [...team.goalies].sort((a,b)=>b.overall-a.overall);
  return { fLines, dPairs, starter: gs[0], backup: gs[1] ?? null };
}

function weightByOVR(players:Skater[], alpha:number){
  const weights = players.map(p => Math.max(1, Math.pow(p.overall, alpha)));
  const total = sum(weights);
  return players.map((p,i)=>({p, w: weights[i]/(total||1)}));
}

function teamChemistryFactor(line:Skater[]){
  // modest bump if all players are >= the line's avg overall or same handed positions etc.
  const avg = line.reduce((s,x)=>s+x.overall,0)/(line.length||1);
  const above = line.filter(p=>p.overall>=avg).length;
  return 1 + (above/line.length)*0.04; // up to +4%
}

function teamDefenseStrength(dPairs:Skater[][]){
  const dDef = dPairs.flat().map(getSkaterSkillDef);
  return (sum(dDef)/(dDef.length||1))/100; // ~0.5–1.0
}

// ---------------------- Core Simulation ----------------------
export function simulateGameAccurate(
  state: SeasonState,
  homeId: ID,
  awayId: ID,
  opts?: { wentToOT?: boolean; seed?: number }
){
  if (opts?.seed !== undefined) { seededRandom(opts.seed); }

  const home = state.teams[homeId]; const away = state.teams[awayId];
  if (!home || !away) throw new Error("Team not found");

  const H = lineupOrAuto(home);
  const A = lineupOrAuto(away);

  // Offense/Defense/Goalie strength
  const homeOff = meanOverall(home.skaters, s=>s.position!=="D");
  const awayOff = meanOverall(away.skaters, s=>s.position!=="D");
  const homeDef = meanOverall(home.skaters, s=>s.position==="D");
  const awayDef = meanOverall(away.skaters, s=>s.position==="D");
  const gHome   = H.starter?.overall ?? 70;
  const gAway   = A.starter?.overall ?? 70;

  // Base shots
  const baseHomeShots = randN(CONFIG.baseShotsRange[0], CONFIG.baseShotsRange[1]);
  const baseAwayShots = randN(CONFIG.baseShotsRange[0], CONFIG.baseShotsRange[1]);
  const homeShotsAdj = baseHomeShots * CONFIG.homeIceShotBoost * (1 + ( (homeOff - awayDef)/100 )*CONFIG.offenseVsDefenseScalar);
  const awayShotsAdj = baseAwayShots * (1 + ( (awayOff - homeDef)/100 )*CONFIG.offenseVsDefenseScalar);

  // Penalties & PP (optional light model)
  const homePPA = Math.max(0, Math.round(normalLike(CONFIG.ppChancePerGame, 1)));
  const awayPPA = Math.max(0, Math.round(normalLike(CONFIG.ppChancePerGame, 1)));
  const homePPG = Math.round(homePPA * CONFIG.ppConversionBase * (homeOff/90)); // better OVR slightly boosts
  const awayPPG = Math.round(awayPPA * CONFIG.ppConversionBase * (awayOff/90));

  // Convert shots to goals with goalie model
  const svHome = clamp(CONFIG.goalieOVRtoSVPCT(gHome), 0.880, 0.950);
  const svAway = clamp(CONFIG.goalieOVRtoSVPCT(gAway), 0.880, 0.950);

  const homeShots = Math.max(10, Math.round(homeShotsAdj));
  const awayShots = Math.max(10, Math.round(awayShotsAdj));

  // Expected goals (EV) from shots vs goalie, then add PP influence
  const awayGoalsEV = Math.max(0, Math.round(awayShots * (1 - svHome) + awayPPG * (CONFIG.ppWeightBoost - 1)));
  const homeGoalsEV = Math.max(0, Math.round(homeShots * (1 - svAway) + homePPG * (CONFIG.ppWeightBoost - 1)));

  // Add small randomness and chemistry
  const homeChem = avgChem(H.fLines);
  const awayChem = avgChem(A.fLines);
  let homeGoals = clamp(Math.round(normalLike(homeGoalsEV * homeChem, 1)), 0, 12);
  let awayGoals = clamp(Math.round(normalLike(awayGoalsEV * awayChem, 1)), 0, 12);

  const wentToOT = opts?.wentToOT ?? (homeGoals === awayGoals ? Math.random()<0.35 : false);
  if (wentToOT && homeGoals===awayGoals) {
    // decide OT winner
    if (Math.random()<0.5) homeGoals += 1; else awayGoals += 1;
  }

  // Distribute shots/goals across lines by TOI shares and OVR weights
  const homeShotDist = distributeShotsAcrossLines(homeShots, H.fLines, H.dPairs, CONFIG.lineSharesForwards, CONFIG.lineSharesDefense);
  const awayShotDist = distributeShotsAcrossLines(awayShots, A.fLines, A.dPairs, CONFIG.lineSharesForwards, CONFIG.lineSharesDefense);

  const events: GoalEvent[] = [];
  const minuteCap = CONFIG.eventMinutes + (wentToOT ? 5 : 0);

  // Assign HOME goals
  assignGoalsToOnIce(homeGoals, events, home.id, H, homeShotDist.onIceByMinute, minuteCap);
  // Assign AWAY goals
  assignGoalsToOnIce(awayGoals, events, away.id, A, awayShotDist.onIceByMinute, minuteCap);

  // Update player & team stats safely
  applyStatsForTeam(state, home, away, {
    myShots: homeShots, oppShots: awayShots, myGoals: homeGoals, oppGoals: awayGoals,
    myEvents: events.filter(e=>e.teamId===home.id), oppEvents: events.filter(e=>e.teamId===away.id),
    starter: H.starter, oppStarter: A.starter, wentToOT
  });
  applyStatsForTeam(state, away, home, {
    myShots: awayShots, oppShots: homeShots, myGoals: awayGoals, oppGoals: homeGoals,
    myEvents: events.filter(e=>e.teamId===away.id), oppEvents: events.filter(e=>e.teamId===home.id),
    starter: A.starter, oppStarter: H.starter, wentToOT
  });

  // Build box score
  const gameId = `G_${homeId}_${awayId}_${state.currentDay}_${Math.random().toString(36).slice(2,8)}`;
  const box: BoxScore = {
    gameId, homeId, awayId,
    goals: events.sort((a,b)=>a.minute-b.minute),
    shots: {[home.id]: homeShots, [away.id]: awayShots},
    goalieShots: {[home.id]: awayShots, [away.id]: homeShots},
    goalieSaves: {
      [home.id]: Math.max(0, awayShots - awayGoals),
      [away.id]: Math.max(0, homeShots - homeGoals)
    },
    homeGoalieId: H.starter?.id ?? "",
    awayGoalieId: A.starter?.id ?? "",
    ot: wentToOT
  };
  state.boxScores[gameId] = box;

  return { boxScore: box, homeGoals, awayGoals, wentToOT };
}

// ---------------------- Distribution & Assignment ----------------------
function distributeShotsAcrossLines(
  totalShots:number,
  fLines:Skater[][],
  dPairs:Skater[][],
  fShares:number[],
  dShares:number[]
){
  // Build on-ice groups per minute (simple rotation)
  const minutes = CONFIG.eventMinutes;
  const onIceByMinute: {F:Skater[]; D:Skater[]}[] = [];
  for (let m=0;m<minutes;m++){
    const fIdx = selectIndexByShare(fShares, m);
    const dIdx = selectIndexByShare(dShares, m);
    const F = fLines[fIdx].filter(Boolean);
    const D = dPairs[dIdx].filter(Boolean);
    onIceByMinute.push({F, D});
  }
  // Shots weighting by line OVR weights
  const fWeights = fLines.map(line => sum(line.map(x=>Math.pow(x.overall, CONFIG.alphaOVRShotWeight))));
  const dWeights = dPairs.map(pair => sum(pair.map(x=>Math.pow(x.overall, CONFIG.alphaOVRShotWeight*0.6))));
  const lineWeights = fWeights.map((fw,i)=> fw + (dWeights[i% dWeights.length]??0));
  const lineWeightSum = sum(lineWeights) || 1;

  const shotsPerLine = lineWeights.map(w => Math.round(totalShots * (w/lineWeightSum)));
  return { shotsPerLine, onIceByMinute };
}

function selectIndexByShare(shares:number[], minute:number){
  // Rotate lines in proportion to shares over 60 minutes
  const span = Math.round(shares.map(s=>s*60).reduce((a,b)=>a+b,0));
  const cum = shares.map((s,i)=>Math.round(s*60) + (i? Math.round(shares.slice(0,i).reduce((a,b)=>a+b,0)*60):0));
  const t = minute % 60;
  for (let i=0;i<shares.length;i++){
    const start = i===0?0:cum[i-1];
    const end = cum[i];
    if (t >= start && t < end) return i;
  }
  // fallback
  return Math.floor((minute/60)*shares.length) % shares.length;
}

function assignGoalsToOnIce(
  goals:number,
  events:GoalEvent[],
  teamId:ID,
  lineup: { fLines:Skater[][]; dPairs:Skater[][]; starter:Goalie|null; backup:Goalie|null },
  onIceByMinute: {F:Skater[]; D:Skater[]}[],
  minuteCap:number
){
  for (let i=0;i<goals;i++){
    const minute = randN(0, minuteCap-1);
    const grp = onIceByMinute[Math.min(minute, onIceByMinute.length-1)];
    const onIce = [...grp.F, ...grp.D];
    if (!onIce.length) continue;

    // scorer weighted by shooting & OVR and tiny fatigue penalty
    const weights = onIce.map(p=>{
      const base = (Math.pow(p.overall, CONFIG.alphaOVRShotWeight) * (getSkaterSkillShot(p)/100));
      const fatigue = (1 - (p.gp ?? 0)*CONFIG.fatiguePenaltyPerGame);
      return Math.max(0.01, base * fatigue);
    });
    const scorer = weightedPick(onIce, weights);

    // assists from same line to promote chemistry & TOI effects
    const cand = onIce.filter(p=>p.id!==scorer.id);
    let a1:Skater|undefined; let a2:Skater|undefined;
    if (Math.random() < CONFIG.goalAssistProb && cand.length){
      a1 = weightedPick(cand, cand.map(p=> (getSkaterSkillPass(p)/100) * Math.pow(p.overall, CONFIG.alphaSkillWeight) ))!;
      if (Math.random() < CONFIG.secondAssistProb) {
        const cand2 = cand.filter(p=>p.id!==a1!.id);
        if (cand2.length) {
          a2 = weightedPick(cand2, cand2.map(p=> (getSkaterSkillPass(p)/100) * Math.pow(p.overall, CONFIG.alphaSkillWeight) ));
        }
      }
    }

    // chemistry multiplier
    const lineChem = teamChemistryFactor(grp.F) * CONFIG.chemistryBoostSameLine;

    // record event
    events.push({ minute, teamId, scorerId: scorer.id, assist1Id: a1?.id, assist2Id: a2?.id });

    // Update temporary in-memory tallies? We finalize in applyStatsForTeam; here we just mark events.
    // (No direct mutation needed at this step.)
  }
}

function weightedPick<T>(items:T[], weights:number[]): T {
  const total = sum(weights) || 1;
  let r = Math.random()*total;
  for (let i=0;i<items.length;i++){
    r -= weights[i];
    if (r<=0) return items[i];
  }
  return items[items.length-1];
}

function avgChem(lines:Skater[][]){
  if (!lines.length) return 1;
  const mults = lines.map(l=>teamChemistryFactor(l));
  return (sum(mults)/mults.length);
}

// ---------------------- Apply Stats ----------------------
function applyStatsForTeam(
  state: SeasonState,
  myTeam: Team,
  oppTeam: Team,
  ctx: {
    myShots:number; oppShots:number; myGoals:number; oppGoals:number;
    myEvents: GoalEvent[]; oppEvents: GoalEvent[];
    starter: Goalie|null; oppStarter: Goalie|null;
    wentToOT: boolean;
  }
){
  // Team totals
  myTeam.gf += ctx.myGoals;
  myTeam.ga += ctx.oppGoals;
  myTeam.shotsFor += ctx.myShots;
  myTeam.shotsAgainst += ctx.oppShots;

  // Record (W-L-OT)
  if (ctx.myGoals > ctx.oppGoals) myTeam.w++;
  else if (ctx.myGoals < ctx.oppGoals) myTeam.l++;
  else { /* shouldn't happen with OT rule */ }
  if (ctx.wentToOT && ctx.myGoals < ctx.oppGoals) myTeam.otl++;

  // Player skater stats
  const byId: Record<string, Skater> = {};
  for (const s of myTeam.skaters) byId[s.id]=s;
  const goalieById: Record<string, Goalie> = {};
  for (const g of myTeam.goalies) goalieById[g.id]=g;

  // Everyone who appeared gets GP increment:
  for (const s of myTeam.skaters){ s.gp = (s.gp||0)+1; }
  for (const g of myTeam.goalies){ g.gp = (g.gp||0)+1; }

  // Attribute shots (simple proportional): top forwards get more shots
  // We'll use OVR^alpha as weights to spread shots
  const skatersWeights = myTeam.skaters.map(s=>Math.max(1, Math.pow(s.overall, CONFIG.alphaOVRShotWeight)));
  distributeInteger(ctx.myShots, myTeam.skaters, skatersWeights, (p,shots)=>{ p.shots=(p.shots||0)+shots; });

  // Goals/Assists from events
  for (const ev of ctx.myEvents){
    const s = byId[ev.scorerId]; if (s){ s.g=(s.g||0)+1; s.p=(s.p||0)+1; }
    if (ev.assist1Id){ const a=byId[ev.assist1Id]; if(a){ a.a=(a.a||0)+1; a.p=(a.p||0)+1; } }
    if (ev.assist2Id){ const b=byId[ev.assist2Id]; if(b){ b.a=(b.a||0)+1; b.p=(b.p||0)+1; } }
  }

  // Goalie stats
  const starter = ctx.starter ?? myTeam.goalies.sort((a,b)=>b.overall-a.overall)[0];
  if (starter){
    starter.gs = (starter.gs||0)+1;
    starter.shotsAgainst += ctx.oppShots;
    const saves = Math.max(0, ctx.oppShots - ctx.oppGoals);
    starter.saves += saves;
    // running GAA/SV%
    const totalGA = (starter.shotsAgainst - starter.saves);
    // approximate minutes: 60 + 5 if OT and started
    const minutes = 60 + (ctx.wentToOT?5:0);
    // recompute from season aggregates (simple)
    const gamesPlayed = Math.max(1, starter.gp);
    starter.gaa = (starter.gaa && isFinite(starter.gaa))
      ? ( (starter.gaa*(gamesPlayed-1)) + (totalGA * 60/minutes) ) / (gamesPlayed)
      : (totalGA * 60/minutes);
    starter.svpct = (starter.saves) / (starter.shotsAgainst || 1);
    // W/L/OT to starter
    if (ctx.myGoals > ctx.oppGoals) starter.w++; else if (ctx.myGoals < ctx.oppGoals){
      if (ctx.wentToOT) starter.otl++; else starter.l++;
    }
    if (ctx.oppGoals===0) starter.so++;
  }
}

// Integer distribution helper
function distributeInteger<T>(total:number, items:T[], weights:number[], apply:(item:any,val:number)=>void){
  const wsum = sum(weights)||1;
  const raw = weights.map(w => total*(w/wsum));
  let ints = raw.map(x=>Math.floor(x));
  let remain = total - sum(ints);
  // allocate remaining to largest fractional parts
  const fracs = raw.map((x,i)=>({i, f:x-ints[i]})).sort((a,b)=>b.f-a.f);
  for (let k=0;k<remain;k++){ ints[fracs[k%fracs.length].i]++; }
  items.forEach((it,idx)=> apply(it, ints[idx]));
}

// Small normal-like noise
function normalLike(mean:number, spread:number){
  // Box–Muller-ish: average of uniforms
  const n = 6; let s=0; for(let i=0;i<n;i++) s+=Math.random();
  const u = (s/n - 0.5)*2; // ~[-1,1]
  return mean + u*spread;
}

// Optional seeding (basic)
let _seed:number|undefined;
function seededRandom(seed:number){
  _seed = seed>>>0;
  // override Math.random
  const rnd = () => {
    // xorshift32
    let x = (_seed as number);
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    _seed = x>>>0;
    return ((_seed as number) / 0xFFFFFFFF);
  };
  (Math as any)._origRandom = Math.random;
  Math.random = rnd as any;
}

// If you ever want to restore Math.random:
// if ((Math as any)._origRandom) Math.random = (Math as any)._origRandom;