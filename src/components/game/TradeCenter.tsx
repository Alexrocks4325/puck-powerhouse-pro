// TradeCenter.tsx
// Trade center + prospects + draft + simple development system for FranchiseMode
// Expects SeasonState and setter compatible with FranchiseMode.tsx types.

import React, { useEffect, useMemo, useState } from "react";
type ID = string;

export type Skater = {
  id: ID; name: string; position: "C"|"LW"|"RW"|"D"; overall: number;
  shooting: number; passing: number; defense: number; stamina: number;
  gp: number; g:number; a:number; p:number; pim:number; shots:number; plusMinus:number;
};
export type Goalie = {
  id: ID; name: string; position: "G"; overall:number;
  reflexes:number; positioning:number; reboundControl:number; stamina:number;
  gp:number; gs:number; w:number; l:number; otl:number; so:number; shotsAgainst:number; saves:number; gaa:number; svpct:number;
};
export type Team = {
  id: ID; name: string; abbrev: string; conference: "East"|"West"; division: string; capSpace:number;
  skaters: Skater[]; goalies: Goalie[]; w:number; l:number; otl:number; gf:number; ga:number; pts:number; shotsFor:number; shotsAgainst:number;
};
export type Game = { id:string; day:number; homeId:ID; awayId:ID; played:boolean; final?:{homeGoals:number;awayGoals:number;ot:boolean;} };
export type GoalEvent = { minute:number; teamId:ID; scorerId:ID; assist1Id?:ID; assist2Id?:ID; };
export type BoxScore = { gameId:string; homeId:ID; awayId:ID; goals:GoalEvent[]; shots:Record<ID,number>; goalieShots:Record<ID,number>; goalieSaves:Record<ID,number>; homeGoalieId:ID; awayGoalieId:ID; ot:boolean; };

export type SeasonState = {
  seasonYear: string; currentDay:number; totalDays:number; schedule:Game[]; boxScores:Record<string,BoxScore>;
  teams: Record<ID,Team>; teamOrder: ID[];
};

const rnd = (min:number, max:number) => Math.floor(Math.random()*(max-min+1))+min;
const choice = <T,>(arr:T[]) => arr[Math.floor(Math.random()*arr.length)];
function makeId(prefix = "id"): ID { return `${prefix}_${Math.random().toString(36).slice(2,9)}`; }

// ---------------------- UTIL: evaluate trade fairness ----------------------
// Simple scoring: team value = sum(playerValue) + prospect bonus - cap penalty
// Player value roughly maps to overall; goalies slightly weighted; prospects have potential multiplier.
function playerValue(player: Skater|Goalie) {
  if ((player as any).position === "G") {
    const g = player as Goalie;
    return g.overall * 1.05 + (g.svpct? g.svpct*100 : 0) * 0.4;
  } else {
    const s = player as Skater;
    return s.overall + (s.g + s.a) * 0.5 + s.shots * 0.02;
  }
}

function evaluateTrade(teamAPlayers:(Skater|Goalie)[], teamBPlayers:(Skater|Goalie)[], teamACap:number, teamBCap:number, prospectsValueA=0, prospectsValueB=0) {
  const aVal = teamAPlayers.reduce((s,p)=>s+playerValue(p),0) + prospectsValueA - Math.max(0, teamAPlayers.reduce((s,p)=>s+0,0))*0;
  const bVal = teamBPlayers.reduce((s,p)=>s+playerValue(p),0) + prospectsValueB - Math.max(0, teamBPlayers.reduce((s,p)=>s+0,0))*0;
  // simple fairness: difference
  const diff = aVal - bVal;
  // incorporate cap spaces — deals that break cap balance are penalized
  const capPenalty = (Math.abs(teamACap - teamBCap) / 1000000) * 1.0; // modest
  return { aVal, bVal, diff, capPenalty, score: diff - capPenalty };
}

// ---------------------- PROSPECT GENERATOR ----------------------
type Prospect = {
  id: ID; name: string; position: "C"|"LW"|"RW"|"D"|"G"; age:number; potential:number; current:number; scoutingText?:string;
};

const FIRST = ["Aiden","Blake","Cody","Dylan","Evan","Finn","Gabe","Hayden","Isaac","Jaxon","Kai","Liam","Mason","Noah","Owen","Parker","Quinn","Riley","Sawyer","Tyler","Zane"];
const LAST = ["Bennett","Carter","Dawson","Ellis","Foster","Griffin","Harrison","Iverson","James","King","Lawson","Miller","Nolan","Owens","Preston","Quinn","Ramsey","Sawyer","Turner","Vance"];

function genProspect(position?: Prospect["position"]): Prospect {
  const pos = position ?? (Math.random() < 0.12 ? "G" : Math.random() < 0.6 ? (Math.random() < 0.5 ? "C" : "RW") : "D");
  const age = rnd(17, 20);
  const potential = rnd(65, 95); // future ceiling
  const current = Math.max(45, Math.floor(potential * (0.35 + Math.random()*0.5)));
  const name = `${choice(FIRST)} ${choice(LAST)}`;
  const scoutingText = `Age ${age} prospect — ${pos}. Potential: ${potential}.`;
  return { id: makeId("PROS"), name, position: pos as any, age, potential, current, scoutingText };
}

function seedProspects(count = 30) {
  const out: Prospect[] = [];
  for (let i=0;i<count;i++) out.push(genProspect());
  return out;
}

// ---------------------- FREE AGENTS ----------------------
function retireOrReleasePlayers(state:SeasonState) {
  // create a small FA pool from players with low games / older ages (we don't track ages here),
  // so we take some random skaters/goalies across league and put them in FA pool (for simplicity)
  const pool: (Skater|Goalie)[] = [];
  const teamIds = Object.keys(state.teams);
  for (const id of teamIds) {
    const t = state.teams[id];
    // 1 in 8 chance to release a role player
    if (t.skaters.length > 0 && Math.random() < 0.125) {
      const p = t.skaters.splice(Math.floor(Math.random()*t.skaters.length),1)[0];
      pool.push(p);
    }
    if (t.goalies.length > 1 && Math.random() < 0.07) {
      const g = t.goalies.splice(Math.floor(Math.random()*t.goalies.length),1)[0];
      pool.push(g);
    }
  }
  return pool;
}

// ---------------------- COMPONENT ----------------------
export default function TradeCenter({ state, setState } : { state: SeasonState; setState: (s:SeasonState|((p:SeasonState)=>SeasonState))=>void; }) {
  // local UI state
  const teams = Object.values(state.teams);
  const [leftTeamId, setLeftTeamId] = useState<Team["id"]>(teams[0]?.id ?? "");
  const [rightTeamId, setRightTeamId] = useState<Team["id"]>(teams[1]?.id ?? teams[0]?.id ?? "");
  const [leftSelected, setLeftSelected] = useState<string[]>([]);
  const [rightSelected, setRightSelected] = useState<string[]>([]);
  const [prospects, setProspects] = useState<ReturnType<typeof seedProspects>>(()=>seedProspects(24));
  const [faPool, setFaPool] = useState<(Skater|Goalie)[]>(() => []);
  const [history, setHistory] = useState<string[]>(() => {
    try { const raw = localStorage.getItem("trade_history_v1"); return raw ? JSON.parse(raw) : []; } catch { return []; }
  });

  // persist history
  useEffect(()=> localStorage.setItem("trade_history_v1", JSON.stringify(history)), [history]);

  useEffect(()=> {
    if (!leftTeamId && teams[0]) setLeftTeamId(teams[0].id);
    if (!rightTeamId && teams[1]) setRightTeamId(teams[1].id);
  }, [teams]);

  // derived
  const leftTeam = state.teams[leftTeamId];
  const rightTeam = state.teams[rightTeamId];

  function allPlayersOf(team: Team) {
    return [...team.skaters as (Skater|Goalie)[], ...team.goalies];
  }

  // toggle selection helpers
  function toggleSelect(listSetter: (fn:(s:ID[])=>ID[])=>void, setStateList:(n:ID[])=>void, id: ID) {
    setStateList(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  }

  // ------------------ Trade actions ------------------
  function proposeTrade() {
    if (!leftTeam || !rightTeam) return;
    const leftOffer = [...leftTeam.skaters, ...leftTeam.goalies].filter(p => leftSelected.includes(p.id));
    const rightOffer = [...rightTeam.skaters, ...rightTeam.goalies].filter(p => rightSelected.includes(p.id));
    // evaluate trade
    const leftCap = leftTeam.capSpace;
    const rightCap = rightTeam.capSpace;
    const { aVal, bVal, diff, score } = evaluateTrade(leftOffer, rightOffer, leftCap, rightCap);
    // apply if acceptable (here we let user accept manually) - we store analyzed result in ui state
    const msg = `Proposed: ${leftTeam.abbrev} -> ${rightTeam.abbrev} | ValueL ${Math.round(aVal)} vs ValueR ${Math.round(bVal)} | Diff ${Math.round(diff)} | Score ${Math.round(score)}`;
    setHistory(h=>{
      const next = [msg, ...h].slice(0,100);
      localStorage.setItem("trade_history_v1", JSON.stringify(next));
      return next;
    });
    alert(msg + "\n\nReview and click 'Execute Trade' to finalize.");
  }

  function executeTrade() {
    if (!leftTeam || !rightTeam) return;
    // move players
    setState(prev => {
      const s = structuredClone(prev) as SeasonState;
      const LT = s.teams[leftTeamId];
      const RT = s.teams[rightTeamId];
      // remove selected from LT and add to RT
      const leftOut: (Skater|Goalie)[] = [];
      LT.skaters = LT.skaters.filter(p => {
        if (leftSelected.includes(p.id)) { leftOut.push(p); return false; } return true;
      });
      LT.goalies = LT.goalies.filter(p => {
        if (leftSelected.includes(p.id)) { leftOut.push(p); return false; } return true;
      });
      const rightOut: (Skater|Goalie)[] = [];
      RT.skaters = RT.skaters.filter(p => {
        if (rightSelected.includes(p.id)) { rightOut.push(p); return false; } return true;
      });
      RT.goalies = RT.goalies.filter(p => {
        if (rightSelected.includes(p.id)) { rightOut.push(p); return false; } return true;
      });

      // add to rosters (naive: push to skaters/goalies depending on type)
      for (const p of leftOut) {
        if ((p as any).position === "G") RT.goalies.push(p as Goalie);
        else RT.skaters.push(p as Skater);
      }
      for (const p of rightOut) {
        if ((p as any).position === "G") LT.goalies.push(p as Goalie);
        else LT.skaters.push(p as Skater);
      }

      // small cap adjustments: swap small sums to keep cap somewhat balanced
      const capShift = Math.round((leftOut.reduce((a:any,p)=>a + ((p as any).overall||60),0) - rightOut.reduce((a:any,p)=>a + ((p as any).overall||60),0)) * 1000);
      LT.capSpace = Math.max(0, LT.capSpace - capShift);
      RT.capSpace = Math.max(0, RT.capSpace + capShift);

      // log history
      const msg = `Executed trade: ${LT.abbrev} <-> ${RT.abbrev} | ${leftOut.map(p=> (p as any).name).join(", ")} ⟷ ${rightOut.map(p=> (p as any).name).join(", ")}`;
      setHistory(h => { const next = [msg, ...h].slice(0,100); localStorage.setItem("trade_history_v1", JSON.stringify(next)); return next; });

      return s;
    });

    // clear selections
    setLeftSelected([]); setRightSelected([]);
    alert("Trade executed — rosters updated.");
  }

  // ------------------ Auto-propose trade (AI) ------------------
  function autoProposeTrade() {
    if (!leftTeam || !rightTeam) return;
    // pick a random top player from each side and balance with prospect(s)
    const pickOffer = (t:Team) => {
      const pool = allPlayersOf(t);
      // pick 1–2 players weighted to higher overall
      pool.sort((a,b)=> (b as any).overall - (a as any).overall);
      const offer = pool.slice(0, rnd(1,2));
      return offer;
    };
    const leftOffer = pickOffer(leftTeam);
    const rightOffer = pickOffer(rightTeam);

    // compute values and then maybe add a prospect to weaker side
    const leftVal = leftOffer.reduce((s,p)=>s+playerValue(p),0);
    const rightVal = rightOffer.reduce((s,p)=>s+playerValue(p),0);

    let prospectsAddedLeft: Prospect[] = [];
    let prospectsAddedRight: Prospect[] = [];

    if (leftVal > rightVal + 10) {
      // add a prospect to right to sweeten
      const p = genProspect();
      prospectsAddedRight.push(p);
    } else if (rightVal > leftVal + 10) {
      const p = genProspect();
      prospectsAddedLeft.push(p);
    }

    // set selection arrays
    setLeftSelected(leftOffer.map(p=>p.id));
    setRightSelected(rightOffer.map(p=>p.id));

    // push prospect(s) into UI pool so user can include them if accepted
    if (prospectsAddedLeft.length || prospectsAddedRight.length) {
      setProspects(prev => [...prospectsAddedLeft, ...prospectsAddedRight, ...prev].slice(0,80));
    }
    const msg = `Auto-proposed: ${leftTeam.abbrev} offers ${leftOffer.map(p=> (p as any).name).join(", ")} — ${rightTeam.abbrev} offers ${rightOffer.map(p=> (p as any).name).join(", ")}`;
    setHistory(h => { const next = [msg, ...h].slice(0,100); localStorage.setItem("trade_history_v1", JSON.stringify(next)); return next; });
    alert(msg + "\nSelections populated — tweak or Execute Trade.");
  }

  // ------------------ Draft / Sign ------------------
  function draftProspect(teamId: ID, prospectId: ID) {
    setState(prev => {
      const s = structuredClone(prev) as SeasonState;
      const prospect = prospects.find(p=>p.id===prospectId);
      if (!prospect) { alert("Prospect not found"); return prev; }
      const team = s.teams[teamId];
      // convert prospect to skater/goalie shallow
      if (prospect.position === "G") {
        const g: Goalie = {
          id: makeId("G"), name: prospect.name, position: "G", overall: Math.max(40, prospect.current),
          reflexes: Math.min(99, Math.round(prospect.current*1.05)), positioning: Math.min(99,Math.round(prospect.current*1.02)),
          reboundControl: Math.min(99, Math.round(prospect.current*0.95)), stamina: 70,
          gp:0, gs:0, w:0, l:0, otl:0, so:0, shotsAgainst:0, saves:0, gaa:0, svpct:0
        };
        team.goalies.push(g);
      } else {
        const sPlayer: Skater = {
          id: makeId("P"), name: prospect.name, position: prospect.position as any,
          overall: Math.max(40, prospect.current), shooting: Math.round(prospect.current*0.9), passing: Math.round(prospect.current*0.85),
          defense: Math.round(prospect.current*0.8), stamina: 70, gp:0, g:0, a:0, p:0, pim:0, shots:0, plusMinus:0
        };
        team.skaters.push(sPlayer);
      }
      // remove prospect from pool
      setProspects(prevPros=> prevPros.filter(p=>p.id!==prospectId));
      const msg = `Draft: ${team.abbrev} drafted ${prospect.name} (${prospect.position})`;
      setHistory(h=>{ const next=[msg,...h].slice(0,100); localStorage.setItem("trade_history_v1", JSON.stringify(next)); return next;});
      return s;
    });
  }

  function signFreeAgent(teamId: ID, playerId: ID) {
    const player = faPool.find(p=>p.id===playerId);
    if (!player) { alert("Free agent not found"); return; }
    setState(prev => {
      const s = structuredClone(prev) as SeasonState;
      const team = s.teams[teamId];
      if ((player as any).position === "G") team.goalies.push(player as Goalie);
      else team.skaters.push(player as Skater);
      // cap check naive: cost ~ overall * 1000
      const cost = (player as any).overall * 1000;
      team.capSpace = Math.max(0, team.capSpace - cost);
      return s;
    });
    setFaPool(prev => prev.filter(p=>p.id!==playerId));
    setHistory(h=> { const msg=`Signed FA: ${player && (player as any).name} to ${state.teams[teamId].abbrev}`; const next=[msg,...h].slice(0,100); localStorage.setItem("trade_history_v1", JSON.stringify(next)); return next; });
    alert("Player signed (cap adjusted).");
  }

  // ------------------ Development tick (age prospects, promote, injuries) ------------------
  function developmentTick() {
    // promote some prospects (raise current towards potential), random injuries, small overall drift
    setState(prev => {
      const s = structuredClone(prev) as SeasonState;
      // prospects improve
      setProspects(prevPros => {
        const next = prevPros.map(p => {
          // 60% chance to improve a bit, up to potential
          const improve = Math.random() < 0.6;
          if (improve) {
            const delta = rnd(0, Math.max(1, Math.floor((p.potential - p.current)/6)));
            p.current = Math.min(p.potential, p.current + delta);
          }
          p.age += 1;
          return p;
        }).filter(p=>p.age < 24); // cull old prospects
        return next;
      });

      // small chance for random injury: pick a random team and player
      if (Math.random() < 0.25) {
        const t = choice(Object.values(s.teams));
        const plPool = [...t.skaters, ...t.goalies];
        if (plPool.length) {
          const p = choice(plPool);
          // apply small penalty to overall for some turns by reducing overall (simulate injury)
          (p as any).overall = Math.max(1, (p as any).overall - rnd(1,4));
        }
      }

      // minor development: top prospects convert to roster slowly (auto-sign to bottom teams)
      if (Math.random() < 0.15) {
        const strong = prospects.filter(pr => pr.current > 75);
        if (strong.length) {
          const pr = choice(strong);
          // sign to team with worst record
          const worstTeam = Object.values(s.teams).sort((a,b)=> a.pts - b.pts)[0];
          if (worstTeam) {
            // convert and push
            if (pr.position === "G") {
              const g: Goalie = {
                id: makeId("G"), name: pr.name, position: "G", overall: Math.max(45, pr.current),
                reflexes: Math.round(pr.current*1.05), positioning: Math.round(pr.current*0.9), reboundControl: Math.round(pr.current*0.85), stamina: 70,
                gp:0, gs:0, w:0, l:0, otl:0, so:0, shotsAgainst:0, saves:0, gaa:0, svpct:0
              };
              worstTeam.goalies.push(g);
            } else {
              const sPlayer: Skater = {
                id: makeId("P"), name: pr.name, position: pr.position as any, overall: Math.max(45, pr.current),
                shooting: Math.round(pr.current*0.9), passing: Math.round(pr.current*0.8), defense: Math.round(pr.current*0.8), stamina:70,
                gp:0,g:0,a:0,p:0,pim:0,shots:0,plusMinus:0
              };
              worstTeam.skaters.push(sPlayer);
            }
            // remove prospect
            setProspects(prevPros => prevPros.filter(x=>x.id!==pr.id));
            setHistory(h=>{ const msg=`Auto-signed prospect ${pr.name} to ${worstTeam.abbrev}`; const next=[msg,...h].slice(0,100); localStorage.setItem("trade_history_v1", JSON.stringify(next)); return next; });
          }
        }
      }

      return s;
    });

    alert("Development tick complete — prospects aged/improved, small injuries/auto-signs may have occurred.");
  }

  // ------------------ Undo last trade ------------------
  // For simplicity we don't store full snapshots — we provide a simple "undo" stub by reloading from localStorage or prompting user to revert.
  function undoLastHistory() {
    const h = [...history];
    if (!h.length) { alert("No history to undo."); return; }
    const popped = h.shift()!;
    setHistory(h);
    alert("Removed last history entry: " + popped + "\n\nNOTE: This does not revert roster changes automatically. Use this to clean history when needed.");
  }

  // ------------------ UI ------------------
  return (
    <div className="bg-background rounded-2xl border border-border p-6 space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Trade Center & Prospect Lab</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2 grid grid-cols-2 gap-3">
          <div className="border border-border rounded-xl bg-card p-4">
            <h3 className="font-semibold mb-3 text-card-foreground">Trade Builder</h3>
            <div className="flex gap-2 mb-3">
              <select value={leftTeamId} onChange={e=>setLeftTeamId(e.target.value)} className="flex-1 border border-border rounded-lg px-3 py-2 bg-background text-foreground">
                {teams.map(t=> <option key={t.id} value={t.id}>{t.abbrev} — {t.name}</option>)}
              </select>
              <select value={rightTeamId} onChange={e=>setRightTeamId(e.target.value)} className="flex-1 border border-border rounded-lg px-3 py-2 bg-background text-foreground">
                {teams.map(t=> <option key={t.id} value={t.id}>{t.abbrev} — {t.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-sm font-medium mb-2 text-muted-foreground">{leftTeam?.abbrev} (Cap: ${leftTeam?.capSpace?.toLocaleString()})</div>
                <div className="max-h-48 overflow-auto border border-border rounded-lg p-2 bg-muted/50">
                  {leftTeam ? (
                    <>
                      <div className="text-xs text-muted-foreground mb-1 font-medium">Skaters</div>
                      {leftTeam.skaters.map(p=>(
                        <div key={p.id} className="flex items-center justify-between text-sm mb-1">
                          <label className="flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={leftSelected.includes(p.id)} 
                              onChange={()=> setLeftSelected(prev => prev.includes(p.id) ? prev.filter(x=>x!==p.id) : [...prev, p.id])} 
                              className="mr-2"
                            />
                            <span>{p.name} ({p.position}) OVR:{p.overall}</span>
                          </label>
                        </div>
                      ))}
                      <div className="text-xs text-muted-foreground mt-3 mb-1 font-medium">Goalies</div>
                      {leftTeam.goalies.map(p=>(
                        <div key={p.id} className="flex items-center justify-between text-sm mb-1">
                          <label className="flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={leftSelected.includes(p.id)} 
                              onChange={()=> setLeftSelected(prev => prev.includes(p.id) ? prev.filter(x=>x!==p.id) : [...prev, p.id])} 
                              className="mr-2"
                            />
                            <span>{p.name} (G) OVR:{p.overall}</span>
                          </label>
                        </div>
                      ))}
                    </>
                  ) : <div className="text-muted-foreground">No team</div>}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2 text-muted-foreground">{rightTeam?.abbrev} (Cap: ${rightTeam?.capSpace?.toLocaleString()})</div>
                <div className="max-h-48 overflow-auto border border-border rounded-lg p-2 bg-muted/50">
                  {rightTeam ? (
                    <>
                      <div className="text-xs text-muted-foreground mb-1 font-medium">Skaters</div>
                      {rightTeam.skaters.map(p=>(
                        <div key={p.id} className="flex items-center justify-between text-sm mb-1">
                          <label className="flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={rightSelected.includes(p.id)} 
                              onChange={()=> setRightSelected(prev => prev.includes(p.id) ? prev.filter(x=>x!==p.id) : [...prev, p.id])} 
                              className="mr-2"
                            />
                            <span>{p.name} ({p.position}) OVR:{p.overall}</span>
                          </label>
                        </div>
                      ))}
                      <div className="text-xs text-muted-foreground mt-3 mb-1 font-medium">Goalies</div>
                      {rightTeam.goalies.map(p=>(
                        <div key={p.id} className="flex items-center justify-between text-sm mb-1">
                          <label className="flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={rightSelected.includes(p.id)} 
                              onChange={()=> setRightSelected(prev => prev.includes(p.id) ? prev.filter(x=>x!==p.id) : [...prev, p.id])} 
                              className="mr-2"
                            />
                            <span>{p.name} (G) OVR:{p.overall}</span>
                          </label>
                        </div>
                      ))}
                    </>
                  ) : <div className="text-muted-foreground">No team</div>}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={proposeTrade} className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80">
                Analyze Offer
              </button>
              <button onClick={executeTrade} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                Execute Trade
              </button>
              <button onClick={autoProposeTrade} className="px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/80">
                Auto-Propose
              </button>
            </div>
          </div>

          <div className="border border-border rounded-xl bg-card p-4">
            <h3 className="font-semibold mb-3 text-card-foreground">Prospect Lab</h3>
            <div className="text-xs text-muted-foreground mb-3">Generate prospects and draft/sign them to teams.</div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {prospects.slice(0,8).map(p=>(
                <div key={p.id} className="border border-border rounded-lg p-3 text-sm bg-muted/30">
                  <div className="font-medium text-card-foreground">{p.name} <span className="text-xs text-muted-foreground">({p.position})</span></div>
                  <div className="text-xs text-muted-foreground">Age {p.age} • Current {p.current} • Pot {p.potential}</div>
                  <div className="flex gap-1 mt-2">
                    <select id={`draft_to_${p.id}`} defaultValue={teams[0]?.id} className="flex-1 border border-border rounded px-2 py-1 text-xs bg-background">
                      {teams.map(t=> <option key={t.id} value={t.id}>{t.abbrev}</option>)}
                    </select>
                    <button onClick={()=>{
                      const sel = (document.getElementById(`draft_to_${p.id}`) as HTMLSelectElement).value;
                      draftProspect(sel, p.id);
                    }} className="px-2 py-1 text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                      Draft
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={()=> setProspects(prev => [...prev, genProspect()].slice(0,120))} className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80">
                Generate Prospect
              </button>
              <button onClick={()=> setProspects(seedProspects(24))} className="px-3 py-2 rounded-lg bg-muted text-muted-foreground text-sm hover:bg-muted/80">
                Seed New Pool
              </button>
            </div>
          </div>
        </div>

        <div className="border border-border rounded-xl bg-card p-4">
          <h3 className="font-semibold mb-3 text-card-foreground">Free Agents & Actions</h3>
          <div className="mb-3 space-y-2">
            <button onClick={()=>{
              // rebuild FA pool from random released players
              const pool = retireOrReleasePlayers(state);
              setFaPool(prev=> [...prev, ...pool].slice(0,80));
              alert(`${pool.length} free agents added to pool.`);
            }} className="w-full px-3 py-2 rounded-lg bg-yellow-500 text-black hover:bg-yellow-400">
              Seed FA Pool
            </button>

            <button onClick={developmentTick} className="w-full px-3 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/80">
              Development Tick
            </button>
          </div>

          <div className="max-h-48 overflow-auto border border-border rounded-lg p-2 bg-muted/50">
            {faPool.length ? faPool.map(p=>(
              <div key={(p as any).id} className="flex items-center justify-between text-sm mb-2">
                <div className="text-card-foreground">{(p as any).name} {(p as any).position==="G"?"(G)":""} OVR:{(p as any).overall}</div>
                <div className="flex gap-1">
                  <select id={`sign_to_${(p as any).id}`} defaultValue={teams[0]?.id} className="text-xs border border-border rounded px-1 bg-background">
                    {teams.map(t=> <option key={t.id} value={t.id}>{t.abbrev}</option>)}
                  </select>
                  <button onClick={()=>{
                    const teamId = (document.getElementById(`sign_to_${(p as any).id}`) as HTMLSelectElement).value;
                    signFreeAgent(teamId, (p as any).id);
                  }} className="px-2 py-1 rounded-lg bg-primary text-primary-foreground text-xs hover:bg-primary/90">
                    Sign
                  </button>
                </div>
              </div>
            )) : <div className="text-xs text-muted-foreground">No free agents seeded.</div>}
          </div>

          <div className="mt-3 text-xs text-muted-foreground">Tip: Use Development Tick regularly to progress prospects and create trade sweeteners.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-border rounded-xl bg-card p-4">
          <h4 className="font-semibold mb-3 text-card-foreground">Trade History</h4>
          <div className="max-h-56 overflow-auto text-sm space-y-1">
            {history.map((h,i)=>(<div key={i} className="text-xs border-b border-border pb-1 text-muted-foreground">{h}</div>))}
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={()=> { localStorage.removeItem("trade_history_v1"); setHistory([]);} } className="px-3 py-1 rounded-lg bg-destructive text-destructive-foreground text-xs hover:bg-destructive/90">
              Clear
            </button>
            <button onClick={undoLastHistory} className="px-3 py-1 rounded-lg bg-secondary text-secondary-foreground text-xs hover:bg-secondary/80">
              Undo Last Entry
            </button>
          </div>
        </div>

        <div className="border border-border rounded-xl bg-card p-4">
          <h4 className="font-semibold mb-3 text-card-foreground">Quick Stats</h4>
          <div className="text-sm space-y-1 text-muted-foreground">
            <div>Teams: {Object.keys(state.teams).length}</div>
            <div>Prospects pool: {prospects.length}</div>
            <div>Free agents: {faPool.length}</div>
            <div>Season day: {state.currentDay} / {state.totalDays}</div>
          </div>
        </div>

        <div className="border border-border rounded-xl bg-card p-4">
          <h4 className="font-semibold mb-3 text-card-foreground">Shortcuts</h4>
          <div className="flex flex-col gap-2">
            <button className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80" onClick={()=>{
              // quick balance cap across league (demo)
              setState(prev => {
                const s = structuredClone(prev) as SeasonState;
                for (const id of Object.keys(s.teams)) {
                  s.teams[id].capSpace = Math.max(0, s.teams[id].capSpace + rnd(-500000, 500000));
                }
                return s;
              });
              alert("Randomized small cap changes for demo.");
            }}>Randomize Caps</button>

            <button className="px-3 py-2 rounded-lg bg-muted text-muted-foreground text-sm hover:bg-muted/80" onClick={()=>{
              // quick free-agent dump (demo)
              const pool = retireOrReleasePlayers(state);
              setFaPool(prev=> [...prev, ...pool].slice(0,120));
              alert("Seeded free agents from rosters for demo.");
            }}>Seed FA from Rosters</button>
          </div>
        </div>
      </div>
    </div>
  );
}
