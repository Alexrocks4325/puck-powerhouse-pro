import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, SkipForward, ArrowLeft } from "lucide-react";
import MiniRink from "./MiniRink";

interface SkaterLine {
  name: string;
  position: string;
  g: number;
  a: number;
  sog: number;
  hits: number;
  toi?: number;
}

interface GoalieLine {
  name: string;
  sa: number;
  sv: number;
  ga: number;
  svPct: number;
}

interface ResultPayload {
  opponentName: string;
  isWin: boolean;
  scoreHome: number;
  scoreAway: number;
  teamA: { goals: number; sog: number; hits: number; pp: string; foPct: number };
  teamB: { goals: number; sog: number; hits: number; pp: string; foPct: number };
  skatersA: SkaterLine[];
  skatersB: SkaterLine[];
  goalies: { home: GoalieLine; away: GoalieLine };
}

interface RealTimeSimProps {
  homeName: string;
  homeAbbr: string;
  awayName: string;
  awayAbbr: string;
  periodLength: number; // minutes
  mode: "realtime" | "period";
  homeRoster: any[]; // expects { name, position, overall }
  awayRoster: any[];
  onExit: () => void;
  onFinish: (result: ResultPayload) => void;
}

export default function RealTimeSim({ homeName, homeAbbr, awayName, awayAbbr, periodLength, mode, homeRoster, awayRoster, onExit, onFinish }: RealTimeSimProps) {
  const totalSeconds = periodLength * 60;
  const [period, setPeriod] = useState(1);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);
  const [home, setHome] = useState({ goals: 0, sog: 0, hits: 0, pp: 0, fo: 50 });
  const [away, setAway] = useState({ goals: 0, sog: 0, hits: 0, pp: 0, fo: 50 });
  const [events, setEvents] = useState<string[]>([]);
  const [puck, setPuck] = useState({ x: 50, y: 50, owner: homeAbbr as string | null });

  // Simple "around the league" ticker
  const [ticker, setTicker] = useState(
    () => [
      { id: 1, a: "TOR", b: "MTL", as: 0, bs: 0, time: "1st 08:12" },
      { id: 2, a: "BOS", b: "NYR", as: 0, bs: 0, time: "1st 05:41" },
      { id: 3, a: "EDM", b: "CGY", as: 0, bs: 0, time: "1st 03:29" },
    ]
  );

  // Visual player sim (5v5 + G each side)
  type SimPlayer = { id: string; team: 'home' | 'away'; x: number; y: number; role: 'F' | 'D' | 'G'; label: string | number; name: string };
  const [players, setPlayers] = useState<SimPlayer[]>([]);
  const [possessorId, setPossessorId] = useState<string | null>(null);
  const [goalSide, setGoalSide] = useState<'home'|'away'|null>(null);
  const [shotAnim, setShotAnim] = useState<{active:boolean; sx:number; sy:number; ex:number; ey:number; goal:boolean; side:'home'|'away'|null; shooterName?:string}>({active:false, sx:50, sy:50, ex:50, ey:50, goal:false, side:null});
  const audioCtxRef = useRef<AudioContext | null>(null);
  const playersRef = useRef<SimPlayer[]>([]);
  useEffect(() => { playersRef.current = players; }, [players]);

  const buildInitialPlayers = (): SimPlayer[] => {
    const mk = (team: 'home' | 'away', role: SimPlayer['role'], idx: number, x: number, y: number, label: string | number, name: string): SimPlayer => ({ id: `${team}-${role}-${idx}` , team, role, x, y, label, name });
    
    const pickNames = (roster: any[]) => {
      const nameOf = (p: any, fallback: string) => (p?.name as string) || fallback;
      const g = roster.find((p: any) => p.position === 'G');
      const ds = roster.filter((p: any) => p.position === 'D');
      const fs = roster.filter((p: any) => ['C','LW','RW','F'].includes(p.position));
      const others = roster.filter((p: any) => !['G','D','C','LW','RW','F'].includes(p.position));
      const take = <T,>(arr: T[], n: number, fb: T[]): T[] => {
        const out = arr.slice(0, n);
        if (out.length < n) out.push(...fb.slice(0, n - out.length));
        return out;
      };
      const twoD = take(ds, 2, fs.length ? fs : others);
      const threeF = take(fs, 3, ds.length ? ds : others);
      return {
        gName: nameOf(g, 'Goalie'),
        dNames: [nameOf(twoD[0], 'D1'), nameOf(twoD[1], 'D2')],
        fNames: [nameOf(threeF[0], 'F1'), nameOf(threeF[1], 'F2'), nameOf(threeF[2], 'F3')],
      };
    };

    const h = pickNames(homeRoster);
    const a = pickNames(awayRoster);

    // Faceoff formation
    const homeLine: SimPlayer[] = [
      mk('home','G',1, 6, 50, 'G', h.gName),
      mk('home','D',1, 20, 40, 2, h.dNames[0]),
      mk('home','D',2, 20, 60, 3, h.dNames[1]),
      mk('home','F',1, 35, 35, 9, h.fNames[0]),
      mk('home','F',2, 50, 50, 19, h.fNames[1]), // C at dot
      mk('home','F',3, 35, 65, 13, h.fNames[2]),
    ];
    const awayLine: SimPlayer[] = [
      mk('away','G',1, 94, 50, 'G', a.gName),
      mk('away','D',1, 80, 40, 2, a.dNames[0]),
      mk('away','D',2, 80, 60, 3, a.dNames[1]),
      mk('away','F',1, 65, 35, 9, a.fNames[0]),
      mk('away','F',2, 50, 50, 19, a.fNames[1]), // C at dot
      mk('away','F',3, 65, 65, 13, a.fNames[2]),
    ];
    return [...homeLine, ...awayLine];
  };

  const resetToFaceoff = () => {
    setPlayers(buildInitialPlayers());
    setPuck((p) => ({ ...p, x: 50, y: 50 }));
  };

  useEffect(() => {
    // initialize
    resetToFaceoff();
  }, []);
  // Build skater stat maps to accumulate game stats
  const makeSkaterMap = (roster: any[]) => {
    const map = new Map<string, SkaterLine>();
    roster.filter(p => p.position !== 'G').slice(0, 18).forEach((p: any) => {
      map.set(p.name, { name: p.name, position: p.position || 'F', g: 0, a: 0, sog: 0, hits: 0, toi: 10 + Math.round(Math.random() * 10) });
    });
    return map;
  };
  const homeSkaters = useRef(makeSkaterMap(homeRoster));
  const awaySkaters = useRef(makeSkaterMap(awayRoster));

  const formatClock = (s: number) => {
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const pushEvent = (text: string) => {
    setEvents((prev) => [text, ...prev].slice(0, 80));
  };

  // Core sim loop
  useEffect(() => {
    if (!running) return;
    const tickMs = 900; // visual pace
    const iv = setInterval(() => {
      setSeconds((s) => {
        const next = s + 5; // 5s per tick

        // Random events (shots/goals/hits/penalties)
        const shotChance = 0.40; // per tick
        if (Math.random() < shotChance && !shotAnim.active) {
          // Determine shooter (prefer current possessor)
          let shooter: SimPlayer | undefined = playersRef.current.find(p => p.id === possessorId && p.role !== 'G');
          const fallbackTeam: 'home' | 'away' = shooter?.team ?? (Math.random() < 0.52 ? 'home' : 'away');
          if (!shooter) {
            const pool = playersRef.current.filter(p => p.team === fallbackTeam && p.role !== 'G');
            shooter = pool[Math.floor(Math.random() * Math.max(1, pool.length))];
          }
          if (shooter) {
            const isHome = shooter.team === 'home';
            const shooterMap = isHome ? homeSkaters.current : awaySkaters.current;
            const assistMap = isHome ? homeSkaters.current : awaySkaters.current;
            const stat = shooterMap.get(shooter.name) ?? (() => { const s = { name: shooter.name, position: shooter.role, g:0, a:0, sog:0, hits:0, toi: 10 + Math.round(Math.random()*10)} as SkaterLine; shooterMap.set(shooter.name, s); return s; })();
            stat.sog += 1;

            // Increment team SOG
            if (isHome) setHome(h => ({ ...h, sog: h.sog + 1 }));
            else setAway(a => ({ ...a, sog: a.sog + 1 }));

            const isGoal = Math.random() < 0.18; // 18% of shots go in
            if (isGoal) {
              stat.g += 1;
              const mates = Array.from(assistMap.values()).filter(p => p.name !== shooter!.name);
              if (mates.length) mates[Math.floor(Math.random() * mates.length)].a += 1;
              if (Math.random() < 0.45 && mates.length > 1) mates[Math.floor(Math.random() * mates.length)].a += 1;
            }

            // Animate puck toward goalie/net
            const goalie = playersRef.current.find(p => p.team !== shooter!.team && p.role === 'G');
            const ex = shooter.team === 'home' ? 96 : 4;
            const ey = goalie ? goalie.y : shooter.y;
            setShotAnim({ active: true, sx: shooter.x, sy: shooter.y, ex, ey, goal: isGoal, side: shooter.team, shooterName: shooter.name });

            // Live feed entry
            pushEvent(`${isGoal ? (isHome ? homeAbbr : awayAbbr) + ' GOAL — ' : (isHome ? homeAbbr : awayAbbr) + ' shot — '}${shooter.name}`);
          }
        }

        if (Math.random() < 0.15) {
          // random hit
          const isHome = Math.random() < 0.5;
          const targetMap = isHome ? homeSkaters.current : awaySkaters.current;
          const pArr = Array.from(targetMap.values());
          const guy = pArr[Math.floor(Math.random() * Math.max(1, pArr.length))];
          if (guy) guy.hits += 1;
        }

        // Around-the-league update occasionally
        if (Math.random() < 0.25) {
          setTicker((t) => t.map(g => {
            if (Math.random() < 0.25) {
              const scoringHome = Math.random() < 0.5;
              return {
                ...g,
                as: g.as + (scoringHome ? 1 : 0),
                bs: g.bs + (scoringHome ? 0 : 1),
                time: `1st ${String(Math.max(0, Math.floor(Math.random()*20)) ).padStart(2,'0')}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}`
              };
            }
            return g;
          }));
        }

        if (next >= totalSeconds) {
          // End of period
          if (period < 3) {
            setPeriod((p) => p + 1);
            pushEvent(`End of ${period === 1 ? '1st' : '2nd'} period`);
            return 0;
          } else {
            // End of game
            finishGame();
            clearInterval(iv);
            return s;
          }
        }
        return next;
      });
    }, tickMs);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, period, possessorId, shotAnim.active]);

  // Line change bucket (every ~45s)
  const [lineBucket, setLineBucket] = useState(0);
  useEffect(() => {
    setLineBucket(Math.floor(seconds / 45));
  }, [seconds]);

  // Reset to faceoff on new period or goal
  const lastState = useRef({ h: 0, a: 0, p: 1 });
  useEffect(() => {
    if (home.goals !== lastState.current.h || away.goals !== lastState.current.a || period !== lastState.current.p) {
      lastState.current = { h: home.goals, a: away.goals, p: period };
      resetToFaceoff();
    }
  }, [home.goals, away.goals, period]);

  // Movement/positioning tick
  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => {
      // Determine nearest player to puck (possession)
      const list = playersRef.current;
      if (list.length) {
        let nearest: SimPlayer | undefined = undefined;
        let minD = Infinity;
        for (const pl of list) {
          const d = Math.hypot(pl.x - puck.x, pl.y - puck.y);
          if (d < minD) { minD = d; nearest = pl; }
        }
        if (nearest && minD < 8 && possessorId !== nearest.id) {
          setPossessorId(nearest.id);
        }
      }

      const possTeam: 'home' | 'away' | undefined = playersRef.current.find(p => p.id === possessorId)?.team;

      setPlayers((prev) => {
        return prev.map((pl) => {
          const isG = pl.role === 'G';
          const base = { x: pl.x, y: pl.y };
          // Target anchoring by role/team
          let targetX = base.x;
          let targetY = base.y;

          if (isG) {
            targetX = pl.team === 'home' ? 8 : 92;
            // Track puck vertically a bit
            targetY = puck.y + (pl.team === 'home' ? -2 : 2);
          } else {
            // Skaters gravitate to puck with slight formation offset
            const towardPuckX = puck.x + (pl.team === 'home' ? -2 : 2);
            const towardPuckY = puck.y + (pl.role === 'D' ? (pl.team === 'home' ? -6 : 6) : 0);
            const anchorX = pl.team === 'home' ? 30 : 70;
            const anchorY = 30 + (pl.role === 'D' ? 40 : 0);
            const phase = (pl.id.charCodeAt(0) + lineBucket * 13) % 10;
            const jitterX = (phase - 5) * 0.6;
            const jitterY = ((phase * 3) % 10 - 5) * 0.6;

            const offense = possTeam === pl.team;
            targetX = offense ? (towardPuckX * 0.7 + anchorX * 0.3) : (towardPuckX * 0.4 + anchorX * 0.6);
            targetY = offense ? (towardPuckY * 0.7 + anchorY * 0.3) : (towardPuckY * 0.4 + anchorY * 0.6);

            targetX += jitterX;
            targetY += jitterY;
          }

          // Move a small step toward target
          const dx = targetX - base.x;
          const dy = targetY - base.y;
          const dist = Math.hypot(dx, dy) || 1;
          const maxStep = isG ? 0.6 : 1.6; // px in percentage space
          const step = Math.min(maxStep, dist);
          const nx = base.x + (dx / dist) * step;
          const ny = base.y + (dy / dist) * step;

          return {
            ...pl,
            x: Math.min(96, Math.max(4, nx)),
            y: Math.min(90, Math.max(10, ny)),
          };
        });
      });
    }, 250);
    return () => clearInterval(iv);
  }, [running, puck.x, puck.y, lineBucket, possessorId]);

  // Sync puck to current possessor (when not shooting)
  useEffect(() => {
    if (shotAnim.active) return;
    if (!possessorId) return;
    const pl = players.find(p => p.id === possessorId);
    if (pl) {
      setPuck((prev) => ({
        ...prev,
        x: Math.min(96, Math.max(4, pl.x + (pl.team === 'home' ? 1.2 : -1.2))),
        y: Math.min(90, Math.max(10, pl.y)),
        owner: pl.team === 'home' ? homeAbbr : awayAbbr,
      }));
    }
  }, [players, possessorId, shotAnim.active]);

  // Shot animation effect
  useEffect(() => {
    if (!shotAnim.active) return;
    let raf: number;
    const start = performance.now();
    const duration = 700;

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const ease = t * t * (3 - 2 * t);
      const x = shotAnim.sx + (shotAnim.ex - shotAnim.sx) * ease;
      const y = shotAnim.sy + (shotAnim.ey - shotAnim.sy) * ease;
      setPuck((p) => ({ ...p, x, y, owner: null }));
      if (t < 1) {
        raf = requestAnimationFrame(step);
      } else {
        if (shotAnim.goal && shotAnim.side) {
          if (shotAnim.side === 'home') setHome(h => ({ ...h, goals: h.goals + 1 }));
          else setAway(a => ({ ...a, goals: a.goals + 1 }));

          // Celebration overlay and horn
          setGoalSide(shotAnim.side);
          try {
            const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
            if (Ctx) {
              if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
              const ctx = audioCtxRef.current!;
              const o1 = ctx.createOscillator();
              const o2 = ctx.createOscillator();
              const g = ctx.createGain();
              o1.type = 'square'; o2.type = 'sawtooth';
              o1.frequency.value = 220; o2.frequency.value = 110;
              g.gain.value = 0.0001;
              o1.connect(g); o2.connect(g); g.connect(ctx.destination);
              const nowt = ctx.currentTime;
              g.gain.exponentialRampToValueAtTime(0.6, nowt + 0.05);
              o1.frequency.exponentialRampToValueAtTime(180, nowt + 0.6);
              o2.frequency.exponentialRampToValueAtTime(90, nowt + 0.6);
              o1.start(); o2.start();
              g.gain.exponentialRampToValueAtTime(0.0001, nowt + 1.0);
              o1.stop(nowt + 1.05); o2.stop(nowt + 1.05);
            }
          } catch {}

          setTimeout(() => setGoalSide(null), 1200);
          setRunning(false);
          setTimeout(() => {
            resetToFaceoff();
            setPossessorId(null);
            setRunning(true);
          }, 1100);
        } else {
          // No goal: drop possession for a beat
          setTimeout(() => setPossessorId(null), 100);
        }
        setShotAnim((s) => ({ ...s, active: false }));
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [shotAnim.active]);

  const finishGame = () => {
    const toArray = (map: Map<string, SkaterLine>) => Array.from(map.values()).sort((a, b) => (b.g + b.a) - (a.g + a.a));
    const teamA = { goals: home.goals, sog: home.sog, hits: home.hits, pp: `${Math.floor(Math.random()*2)}/${1+Math.floor(Math.random()*3)}`, foPct: 45 + Math.random()*10 };
    const teamB = { goals: away.goals, sog: away.sog, hits: away.hits, pp: `${Math.floor(Math.random()*2)}/${1+Math.floor(Math.random()*3)}`, foPct: 45 + Math.random()*10 };
    const goalieA: GoalieLine = { name: `${homeAbbr} G1`, sa: away.sog, ga: away.goals, sv: Math.max(0, away.sog - away.goals), svPct: away.sog ? ((away.sog - away.goals)/away.sog)*100 : 100 };
    const goalieB: GoalieLine = { name: `${awayAbbr} G1`, sa: home.sog, ga: home.goals, sv: Math.max(0, home.sog - home.goals), svPct: home.sog ? ((home.sog - home.goals)/home.sog)*100 : 100 };

    onFinish({
      opponentName: awayName,
      isWin: home.goals > away.goals,
      scoreHome: home.goals,
      scoreAway: away.goals,
      teamA,
      teamB,
      skatersA: toArray(homeSkaters.current),
      skatersB: toArray(awaySkaters.current),
      goalies: { home: goalieA, away: goalieB },
    });
  };

  const percent = Math.min(100, Math.round(((period - 1) * totalSeconds + seconds) / (totalSeconds * 3) * 100));
  const nearestId = useMemo(() => {
    if (possessorId) return possessorId;
    if (!players.length) return undefined;
    let minId: string | undefined = undefined;
    let minD = Infinity;
    for (const pl of players) {
      const d = Math.hypot(pl.x - puck.x, pl.y - puck.y);
      if (d < minD) { minD = d; minId = pl.id; }
    }
    return minId;
  }, [players, puck.x, puck.y, possessorId]);

  return (
    <div className="container mx-auto px-4 pt-20 pb-8">
      <div className="mb-4 flex items-center gap-3">
        <Button variant="outline" onClick={onExit}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Live Game Simulation</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4 md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-semibold text-foreground">{homeName} vs {awayName}</div>
            <div className="flex items-center gap-2">
              <Badge>{period === 1 ? '1st' : period === 2 ? '2nd' : '3rd'}</Badge>
              <div className="font-mono">{formatClock(seconds)}</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 text-4xl font-bold mb-4">
            <span>{home.goals}</span>
            <span className="text-muted-foreground">-</span>
            <span>{away.goals}</span>
          </div>

          {/* Rink + Players + Puck */}
          <MiniRink
            players={players.map((p) => ({
              id: p.id,
              x: p.x,
              y: p.y,
              variant: p.team === 'home' ? 'home' : 'away',
              label: p.label,
              name: p.name,
              isGoalie: p.role === 'G',
              hasPuck: !shotAnim.active && p.id === possessorId,
            }))}
            puck={{ x: puck.x, y: puck.y }}
            goalSide={goalSide}
          />

          <div className="mt-4 flex items-center gap-2">
            <Button size="sm" onClick={() => setRunning((r) => !r)}>
              {running ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />} {running ? 'Pause' : 'Resume'}
            </Button>
            <Button size="sm" variant="secondary" onClick={finishGame}>
              <SkipForward className="w-4 h-4 mr-2" /> Skip to Final
            </Button>
            <div className="text-sm text-muted-foreground ml-auto">Progress {percent}%</div>
          </div>

          <Separator className="my-4" />

          {/* Live Feed */}
          <div>
            <div className="text-sm font-semibold mb-2">Live Feed</div>
            <div className="h-40 overflow-auto rounded-md border p-2 text-sm bg-muted/30">
              {events.length === 0 ? (
                <div className="text-muted-foreground">Waiting for first event…</div>
              ) : (
                events.map((e, i) => (
                  <div key={i} className="py-0.5">{e}</div>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* Sidebar: Team stats + Around the League */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="font-semibold mb-2">Team Stats</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="space-y-1">
                <div className="text-muted-foreground">{homeName}</div>
                <div className="flex justify-between"><span>SOG</span><span>{home.sog}</span></div>
                <div className="flex justify-between"><span>Hits</span><span>{home.hits}</span></div>
                <div className="flex justify-between"><span>PP</span><span>{home.pp}/ {Math.max(1, Math.floor(home.pp + Math.random()*2))}</span></div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground">{awayName}</div>
                <div className="flex justify-between"><span>SOG</span><span>{away.sog}</span></div>
                <div className="flex justify-between"><span>Hits</span><span>{away.hits}</span></div>
                <div className="flex justify-between"><span>PP</span><span>{away.pp}/ {Math.max(1, Math.floor(away.pp + Math.random()*2))}</span></div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="font-semibold mb-2">Around the League</div>
            <div className="space-y-2 text-sm">
              {ticker.map(g => (
                <div key={g.id} className="flex items-center justify-between rounded-md border px-2 py-1">
                  <div className="font-mono">{g.a} {g.as} - {g.bs} {g.b}</div>
                  <div className="text-muted-foreground">{g.time}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
