import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, SkipForward, ArrowLeft } from "lucide-react";

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
        // Puck drift
        setPuck((p) => ({
          x: Math.min(96, Math.max(4, p.x + (Math.random() * 16 - 8))),
          y: Math.min(90, Math.max(10, p.y + (Math.random() * 12 - 6))),
          owner: Math.random() < 0.5 ? homeAbbr : awayAbbr,
        }));

        // Random events (shots/goals/hits/penalties)
        const shotChance = 0.40; // per tick
        if (Math.random() < shotChance) {
          const isHome = Math.random() < 0.52; // slight bias to home
          const shooterMap = isHome ? homeSkaters.current : awaySkaters.current;
          const shooterArr = Array.from(shooterMap.values());
          const shooter = shooterArr[Math.floor(Math.random() * Math.max(1, shooterArr.length))];
          const assistPool = shooterArr.filter(p => p.name !== shooter?.name);
          const isGoal = Math.random() < 0.18; // 18% of shots go in
          if (isHome) {
            setHome((h) => ({ ...h, sog: h.sog + 1, goals: h.goals + (isGoal ? 1 : 0) }));
          } else {
            setAway((a) => ({ ...a, sog: a.sog + 1, goals: a.goals + (isGoal ? 1 : 0) }));
          }
          if (shooter) shooter.sog += 1;
          if (isGoal && shooter) {
            shooter.g += 1;
            if (assistPool.length) assistPool[Math.floor(Math.random() * assistPool.length)].a += 1;
            if (Math.random() < 0.45 && assistPool.length > 1) assistPool[Math.floor(Math.random() * assistPool.length)].a += 1;
            pushEvent(`${isHome ? homeAbbr : awayAbbr} GOAL — ${shooter.name}`);
          } else if (shooter) {
            pushEvent(`${isHome ? homeAbbr : awayAbbr} shot — ${shooter.name}`);
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
  }, [running, period]);

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

          {/* Rink + Puck */}
          <div className="relative w-full aspect-[2/1] rounded-md border bg-gradient-to-b from-background/70 to-muted/40 overflow-hidden">
            {/* Center line */}
            <div className="absolute inset-y-0 left-1/2 w-0.5 bg-primary/40" />
            {/* Creases */}
            <div className="absolute inset-y-6 left-4 right-4 rounded-lg border border-primary/20 pointer-events-none" />
            {/* Puck */}
            <div
              className="absolute w-3 h-3 rounded-full bg-primary shadow"
              style={{ left: `${puck.x}%`, top: `${puck.y}%`, transform: 'translate(-50%, -50%)' }}
              aria-label="puck"
            />
          </div>

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
