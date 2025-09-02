// TeamManager.tsx
// Team manager UI: view roster, build lines, do substitutions, save/load lineups.
// Expects the same SeasonState type as FranchiseMode.tsx (teams keyed by ID).
// Tailwind classes used (swap if you don't use Tailwind).

import React, { useEffect, useMemo, useState } from "react";

type ID = string;

export type Skater = {
  id: ID;
  name: string;
  position: "C"|"LW"|"RW"|"D";
  overall: number;
  shooting: number;
  passing: number;
  defense: number;
  stamina: number;
  gp: number; g:number; a:number; p:number; pim:number; shots:number; plusMinus:number;
  // optional runtime helpers - not persisted by type, but stored on team.lineups in state
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
  gp:number; gs:number; w:number; l:number; otl:number; so:number; shotsAgainst:number; saves:number; gaa:number; svpct:number;
};

export type Team = {
  id: ID;
  name: string;
  abbrev: string;
  conference: "East"|"West";
  division?: string;
  capSpace?: number;
  skaters: Skater[];
  goalies: Goalie[];
  // NOTE: this component will add/consume `lineups` property on team object in season state.
  // Team shape in your state doesn't need to declare it, we store it in the SeasonState teams map.
  w?: number; l?: number; otl?: number; gf?: number; ga?: number; pts?: number; shotsFor?: number; shotsAgainst?: number;
};

export type SeasonState = {
  seasonYear: string;
  currentDay: number;
  totalDays: number;
  schedule: any[];
  boxScores: Record<string, any>;
  teams: Record<ID, Team>;
  teamOrder: ID[];
};

// --------------------- LINEUP TYPES ---------------------
type Lineup = {
  forwards: ID[][]; // 4 arrays of 3 IDs
  defense: ID[][];  // 3 arrays of 2 IDs
  goalieStart: ID | null;
  goalieBackup: ID | null;
  createdAt?: number;
  name?: string;
};

// localStorage key
const LS_KEY_PREFIX = "franchise_lineup_v1_";

// --------------------- HELPERS ---------------------
const clamp = (n:number, a:number, b:number) => Math.max(a, Math.min(b, n));
const avg = (arr:number[]) => arr.reduce((s,x)=>s+x,0)/(arr.length||1);

function defaultLineupFromTeam(team: Team): Lineup {
  // pick top 12 forwards by overall, top 6 D by overall, top 2 goalies
  const forwards = team.skaters.filter(s => s.position !== "D").sort((a,b)=>b.overall - a.overall).slice(0,12);
  const defense = team.skaters.filter(s => s.position === "D").sort((a,b)=>b.overall - a.overall).slice(0,6);
  const g = [...team.goalies].sort((a,b)=>b.overall - a.overall);
  const fLines: ID[][] = [];
  for (let i=0;i<4;i++){
    fLines.push(forwards.slice(i*3, i*3+3).map(x=>x?.id).filter(Boolean) as ID[]);
  }
  const dPairs: ID[][] = [];
  for (let i=0;i<3;i++){
    dPairs.push(defense.slice(i*2, i*2+2).map(x=>x?.id).filter(Boolean) as ID[]);
  }
  const goalieStart = g[0]?.id ?? null;
  const goalieBackup = g[1]?.id ?? g[0]?.id ?? null;
  return { forwards: fLines, defense: dPairs, goalieStart, goalieBackup, createdAt: Date.now(), name: "Auto" };
}

function lineupStorageKey(teamId: ID) {
  return `${LS_KEY_PREFIX}${teamId}`;
}

function saveLineupToStorage(teamId: ID, lineup: Lineup, name?: string) {
  try {
    const key = lineupStorageKey(teamId);
    const payload = { lineup, savedAt: Date.now(), name: name ?? lineup.name ?? "saved" };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (e) { /* ignore */ }
}

function loadLineupFromStorage(teamId: ID): { lineup: Lineup | null; meta?: any } {
  try {
    const raw = localStorage.getItem(lineupStorageKey(teamId));
    if (!raw) return { lineup: null };
    const obj = JSON.parse(raw);
    return { lineup: obj.lineup as Lineup, meta: obj };
  } catch (e) { return { lineup: null }; }
}

function computeLineRating(line: ID[], team: Team) {
  // average overall of skaters in line; heavier weight to centers (if exist)
  const players = line.map(id => team.skaters.find(s => s.id === id)).filter(Boolean) as Skater[];
  if (!players.length) return 0;
  const vals = players.map(p => p.overall);
  return Math.round(avg(vals));
}

function computeDefRating(pair: ID[], team: Team) {
  const players = pair.map(id => team.skaters.find(s => s.id === id)).filter(Boolean) as Skater[];
  if (!players.length) return 0;
  // defense value uses defense stat as well
  const vals = players.map(p => Math.round((p.overall*0.6) + (p.defense*0.4)));
  return Math.round(avg(vals));
}

function goalieRating(id: ID | null, team: Team) {
  if (!id) return 0;
  const g = team.goalies.find(x => x.id === id);
  if (!g) return 0;
  return Math.round((g.overall*0.6) + (g.reflexes + g.positioning + g.reboundControl)/3*0.4);
}

// --------------------- COMPONENT ---------------------
export default function TeamManager({ state, setState, userTeamId, onPlayerClick }:
  { state: SeasonState; setState: (s:SeasonState|((p:SeasonState)=>SeasonState))=>void; userTeamId?: ID; onPlayerClick?: (player: Skater | Goalie) => void }) {

  const teamIds = useMemo(() => state.teamOrder ?? Object.keys(state.teams), [state]);
  const defaultTeam = userTeamId ?? teamIds[0];
  const [selectedTeamId, setSelectedTeamId] = useState<ID>(defaultTeam);
  
  // Lock to userTeamId if provided
  const actualSelectedTeamId = userTeamId || selectedTeamId;
  const team = state.teams[actualSelectedTeamId];

  // local lineup state (not persisted into core team until "Apply")
  const [lineup, setLineup] = useState<Lineup>(() => team ? defaultLineupFromTeam(team) : { forwards: [[],[],[],[]], defense:[[],[],[]], goalieStart:null, goalieBackup:null });

  useEffect(() => {
    if (!team) return;
    // load saved lineup from localStorage if exists; else auto fill
    const loaded = loadLineupFromStorage(team.id);
    if (loaded.lineup) setLineup(loaded.lineup);
    else setLineup(defaultLineupFromTeam(team));
  }, [actualSelectedTeamId]); // eslint-disable-line

  // derived lists
  const bench = useMemo(() => {
    if (!team) return [];
    const starterIds = new Set([
      ...(lineup.forwards.flat()), ...(lineup.defense.flat()),
      lineup.goalieStart ?? [], lineup.goalieBackup ?? []
    ].filter(Boolean) as ID[]);
    return [...team.skaters, ...team.goalies].filter(p => !starterIds.has((p as any).id));
  }, [team, lineup]);

  if (!team) return <div className="p-4">No team selected</div>;

  // quick helpers
  function toggleForwardSlot(lineIndex: number, slotIndex: number, playerId: ID | null) {
    setLineup(prev => {
      const copy = structuredClone(prev) as Lineup;
      copy.forwards = copy.forwards.map(arr => [...arr]);
      const arr = copy.forwards[lineIndex];
      // expand if needed
      while(arr.length < 3) arr.push(null as unknown as ID);
      arr[slotIndex] = playerId as ID;
      copy.forwards[lineIndex] = arr;
      return copy;
    });
  }
  function toggleDefenseSlot(pairIndex: number, slotIndex: number, playerId: ID | null) {
    setLineup(prev => {
      const copy = structuredClone(prev) as Lineup;
      copy.defense = copy.defense.map(arr => [...arr]);
      const arr = copy.defense[pairIndex];
      while(arr.length < 2) arr.push(null as unknown as ID);
      arr[slotIndex] = playerId as ID;
      copy.defense[pairIndex] = arr;
      return copy;
    });
  }
  function setGoalie(startOrBackup: "start"|"backup", playerId: ID | null) {
    setLineup(prev => ({ ...prev, goalieStart: startOrBackup === "start" ? playerId : prev.goalieStart, goalieBackup: startOrBackup === "backup" ? playerId : prev.goalieBackup }));
  }

  function autoSetByOverall() {
    setLineup(defaultLineupFromTeam(team));
  }

  function autoSetBalanced() {
    // attempt to balance lines by distributing top 12 forwards across lines (1,2,3,4) in snake
    const forwards = team.skaters.filter(s => s.position !== "D").sort((a,b)=>b.overall - a.overall);
    const fLines: ID[][] = [[],[],[],[]];
    let idx = 0;
    while(forwards.length) {
      const p = forwards.shift()!;
      fLines[idx % 4].push(p.id);
      idx++;
    }
    // ensure each line has up to 3
    for (let i=0;i<4;i++){
      while(fLines[i].length < 3) {
        const benchPlayer = team.skaters.filter(s=> !fLines.flat().includes(s.id) && s.position !== "D")[0];
        if (!benchPlayer) break;
        fLines[i].push(benchPlayer.id);
      }
    }
    // defense pairs
    const defs = team.skaters.filter(s => s.position === "D").sort((a,b)=>b.overall - a.overall);
    const dPairs: ID[][] = [[],[],[]];
    let dIdx = 0;
    while(defs.length) {
      const p = defs.shift()!;
      dPairs[dIdx % 3].push(p.id); dIdx++;
    }
    // goalies
    const g = [...team.goalies].sort((a,b)=>b.overall - a.overall);
    setLineup({ forwards: fLines, defense: dPairs, goalieStart: g[0]?.id ?? null, goalieBackup: g[1]?.id ?? null, createdAt: Date.now(), name: "Balanced" });
  }

  function applyLineupToTeam() {
    // persist lineup into state. We'll store lineup under team.meta.lineup (team.lineup).
    setState(prev => {
      const s = structuredClone(prev) as SeasonState;
      const t = s.teams[team.id];
      if (!t) return prev;
      // attach lineup object to team: t.lineup = lineup
      // TypeScript won't know lineup prop exists — that's fine; we mutate the state object
      (t as any).lineup = structuredClone(lineup);
      return s;
    });
    // save to localStorage too
    saveLineupToStorage(team.id, lineup, lineup.name);
    alert("Lineup applied and saved locally.");
  }

  function swapPlayers(playerAId: ID, playerBId: ID) {
    // search in lineup and swap positions (if present); else swap between lineup and bench
    setLineup(prev => {
      const copy = structuredClone(prev) as Lineup;
      // helper to replace id => find location
      const findAndReplace = (id: ID, newId: ID | null) => {
        for (let li=0; li<copy.forwards.length; li++) {
          for (let si=0; si<copy.forwards[li].length; si++) {
            if (copy.forwards[li][si] === id) { copy.forwards[li][si] = newId as ID; return true; }
          }
        }
        for (let di=0; di<copy.defense.length; di++) {
          for (let si=0; si<copy.defense[di].length; si++) {
            if (copy.defense[di][si] === id) { copy.defense[di][si] = newId as ID; return true; }
          }
        }
        if (copy.goalieStart === id) { copy.goalieStart = newId; return true; }
        if (copy.goalieBackup === id) { copy.goalieBackup = newId; return true; }
        return false;
      };
      // swap
      findAndReplace(playerAId, "__TMP__" as unknown as ID);
      findAndReplace(playerBId, playerAId);
      findAndReplace("__TMP__" as unknown as ID, playerBId);
      return copy;
    });
  }

  function clearLineup() {
    setLineup({ forwards: [[],[],[],[]], defense: [[],[],[]], goalieStart: null, goalieBackup: null });
  }

  // compute per-line ratings
  const fRatings = lineup.forwards.map(line => computeLineRating(line.filter(Boolean), team));
  const dRatings = lineup.defense.map(pair => computeDefRating(pair.filter(Boolean), team));
  const gStartRating = goalieRating(lineup.goalieStart, team);
  const gBackupRating = goalieRating(lineup.goalieBackup, team);

  return (
    <div className="p-4 space-y-4 max-w-6xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {userTeamId ? `My Team — ${team.name} (${team.abbrev})` : `Team Manager — ${team.name} (${team.abbrev})`}
        </h2>
        {!userTeamId && (
          <div className="flex items-center gap-2">
            <label className="text-sm">Select Team:</label>
            <select className="border rounded px-2 py-1" value={selectedTeamId} onChange={e=>setSelectedTeamId(e.target.value)}>
              {teamIds.map(tid => <option key={tid} value={tid}>{state.teams[tid].abbrev} — {state.teams[tid].name}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2 space-y-3">
          <div className="bg-white rounded-xl p-3 border">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Lines</div>
              <div className="flex gap-2 items-center">
                <button onClick={autoSetByOverall} className="px-2 py-1 rounded bg-slate-800 text-white text-sm">Auto Set (Top)</button>
                <button onClick={autoSetBalanced} className="px-2 py-1 rounded bg-indigo-600 text-white text-sm">Auto Balanced</button>
                <button onClick={clearLineup} className="px-2 py-1 rounded bg-red-500 text-white text-sm">Clear</button>
                <button onClick={applyLineupToTeam} className="px-2 py-1 rounded bg-emerald-600 text-white text-sm">Apply & Save</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-sm font-medium mb-1">Forwards</div>
                <div className="space-y-2">
                  {lineup.forwards.map((ln, i) => (
                    <div key={i} className="border rounded p-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold">Line {i+1} — Rating: <span className="font-bold">{fRatings[i]}</span></div>
                        <div className="text-xs text-slate-500">Slots</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[0,1,2].map(slot => {
                          const pid = ln[slot];
                          return (
                            <select key={slot} value={pid ?? ""} onChange={e => toggleForwardSlot(i, slot, e.target.value || null)} className="border rounded px-2 py-1 text-sm">
                              <option value="">— empty —</option>
                              {team.skaters.filter(s => s.position !== "D").map(p => <option key={p.id} value={p.id}>{p.name} (OVR {p.overall})</option>)}
                            </select>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-1">Defense & Goalies</div>
                <div className="space-y-2">
                  {lineup.defense.map((pair, i) => (
                    <div key={i} className="border rounded p-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold">Pair {i+1} — Rating: <span className="font-bold">{dRatings[i]}</span></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[0,1].map(slot => {
                          const pid = pair[slot];
                          return (
                            <select key={slot} value={pid ?? ""} onChange={e => toggleDefenseSlot(i, slot, e.target.value || null)} className="border rounded px-2 py-1 text-sm">
                              <option value="">— empty —</option>
                              {team.skaters.filter(s => s.position === "D").map(p => <option key={p.id} value={p.id}>{p.name} (OVR {p.overall})</option>)}
                            </select>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="border rounded p-2 mt-2">
                    <div className="font-semibold mb-1">Goalies</div>
                    <div className="grid grid-cols-2 gap-2">
                      <select value={lineup.goalieStart ?? ""} onChange={e => setGoalie("start", e.target.value || null)} className="border rounded px-2 py-1">
                        <option value="">— Start —</option>
                        {team.goalies.map(g => <option key={g.id} value={g.id}>{g.name} (OVR {g.overall})</option>)}
                      </select>
                      <select value={lineup.goalieBackup ?? ""} onChange={e => setGoalie("backup", e.target.value || null)} className="border rounded px-2 py-1">
                        <option value="">— Backup —</option>
                        {team.goalies.map(g => <option key={g.id} value={g.id}>{g.name} (OVR {g.overall})</option>)}
                      </select>
                    </div>
                    <div className="mt-2 text-sm">Start: <strong>{gStartRating}</strong> — Backup: <strong>{gBackupRating}</strong></div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="bg-white rounded-xl p-3 border">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Bench — Swaps & Substitutions</div>
              <div className="text-sm text-slate-500">Pick two players and click Swap</div>
            </div>
            <BenchSwapUI team={team} lineup={lineup} onSwap={(a,b)=>swapPlayers(a,b)} onPlayerClick={onPlayerClick} />
          </div>

        </div>

        <div>
          <div className="bg-white rounded-xl p-3 border mb-3">
            <div className="font-semibold mb-2">Team Snapshot</div>
            <div className="text-sm space-y-1">
              <div>Record: {team.w ?? 0}-{team.l ?? 0}-{team.otl ?? 0}</div>
              <div>Points: {team.pts ?? 0}</div>
              <div>GF / GA: {team.gf ?? 0} / {team.ga ?? 0}</div>
              <div>Shots For / Against: {team.shotsFor ?? 0} / {team.shotsAgainst ?? 0}</div>
              <div>Bench size: {bench.length}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3 border">
            <div className="font-semibold mb-2">Line Ratings</div>
            <div className="space-y-1 text-sm">
              {lineup.forwards.map((l,i)=> <div key={i}>Line {i+1}: {fRatings[i]}</div>)}
              {lineup.defense.map((p,i)=> <div key={i}>Pair {i+1}: {dRatings[i]}</div>)}
              <div>Goalie Start: {gStartRating}</div>
            </div>
            <div className="mt-2 text-xs text-slate-500">Tip: applying lineup will store it on the team object. To have sim use it, update your sim's `selectLineForEvent` to call the helper `getActiveLine(team)` (see instructions below).</div>
          </div>
        </div>

      </div>
    </div>
  );
}

// --------------------- BenchSwapUI ---------------------
function BenchSwapUI({ team, lineup, onSwap, onPlayerClick }: { team: Team; lineup: Lineup; onSwap: (a:ID,b:ID)=>void; onPlayerClick?: (player: Skater | Goalie) => void }) {
  const allPlayers = [...team.skaters, ...team.goalies];
  const starterIds = new Set([...(lineup.forwards.flat()), ...(lineup.defense.flat()), lineup.goalieStart ?? [], lineup.goalieBackup ?? []].filter(Boolean) as ID[]);
  const benchPlayers = allPlayers.filter(p => !starterIds.has((p as any).id));
  const [selectedA, setSelectedA] = useState<ID | "">("");
  const [selectedB, setSelectedB] = useState<ID | "">("");

  return (
    <div className="text-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <div className="font-medium mb-1">Starters (click to pick)</div>
          <div className="max-h-48 overflow-auto border p-1">
            {[...starterIds].map(id => {
              const p = allPlayers.find(x => (x as any).id === id);
              if (!p) return null;
              return (
                <div 
                  key={id} 
                  className={`py-1 px-1 rounded cursor-pointer ${selectedA===id? "bg-slate-200":""}`} 
                  onClick={(e) => {
                    if (e.ctrlKey || e.metaKey) {
                      // Ctrl/Cmd + click opens player modal
                      if (onPlayerClick && p) onPlayerClick(p);
                    } else {
                      setSelectedA(id as ID);
                    }
                  }}
                >
                  {(p as any).name} {(p as any).position==="G"?"(G)":""}
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <div className="font-medium mb-1">Bench</div>
          <div className="max-h-48 overflow-auto border p-1">
            {benchPlayers.map(p => (
              <div 
                key={(p as any).id} 
                className={`py-1 px-1 rounded cursor-pointer ${selectedB===(p as any).id? "bg-slate-200":""}`} 
                onClick={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    // Ctrl/Cmd + click opens player modal
                    if (onPlayerClick) onPlayerClick(p);
                  } else {
                    setSelectedB((p as any).id);
                  }
                }}
              >
                {(p as any).name} {(p as any).position==="G"?"(G)":""}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2 flex gap-2">
        <button className="px-3 py-1 rounded bg-emerald-600 text-white" onClick={() => {
          if (!selectedA || !selectedB) { alert("Pick both a starter and a bench player to swap."); return; }
          onSwap(selectedA as ID, selectedB as ID);
          setSelectedA(""); setSelectedB("");
        }}>Swap Selected</button>
        <button className="px-3 py-1 rounded bg-slate-700 text-white" onClick={() => { setSelectedA(""); setSelectedB(""); }}>Clear Selection</button>
      </div>
    </div>
  );
}

/* ---------------------------
   Integration note for sim engine:
   ---------------------------
   To make the sim use your lineup for events, replace or augment your existing selectLineForEvent(team)
   function (in FranchiseMode.tsx) with this helper (or call it inside):

   function getActiveLine(team) {
     // prefer lines from team.lineup if present; else fallback to old selection method
     const lu = (team as any).lineup;
     if (lu) {
       // choose a line weighted by line rating (or just randomly from 4 lines)
       const weights = lu.forwards.map((l:any) => computeLineRating(l.filter(Boolean), team) + 10); // offset
       const total = weights.reduce((a,b)=>a+b,0);
       let r = Math.random() * total;
       for (let i=0;i<weights.length;i++) {
         r -= weights[i];
         if (r <= 0) {
           // build an array of 5 players (3 forwards + 2 defense from best pair)
           const f = lu.forwards[i].filter(Boolean);
           // pick the best defensive pair on average
           const bestDefIdx = lu.defense.map((p:any, idx:number) => ({ idx, val: computeDefRating(p.filter(Boolean), team) })).sort((a,b)=>b.val-a.val)[0]?.idx ?? 0;
           const d = lu.defense[bestDefIdx].filter(Boolean);
           return [...f, ...d].slice(0,5);
         }
       }
     }
     // fallback: original selection function
     return selectLineForEvent(team);
   }

   You must import or paste computeLineRating/computeDefRating from above into the file with the sim engine,
   and ensure selectLineForEvent fallback exists.

   After making that change, live sim and quick sim will source from your saved lineup; substitutions
   made in TeamManager (Apply & Save) will be used during subsequent sim runs.

--------------------------- */