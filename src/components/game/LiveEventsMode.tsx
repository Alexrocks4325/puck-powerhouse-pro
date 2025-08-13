import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import GameHeader from "./GameHeader";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Target, 
  Zap, 
  Shield, 
  Clock, 
  Trophy,
  Activity,
  Users,
  Timer,
  Circle,
  ArrowUp,
  ArrowDown,
  ArrowRight
} from "lucide-react";

// Import hockey rink image
import hockeyRinkImg from "@/assets/hockey-rink.png";

interface LiveEventsModeProps {
  playerData: {
    coins: number;
    level: number;
    team: any[];
    packs: number;
  };
  setPlayerData: (data: any) => void;
  onNavigate: (screen: 'menu' | 'tutorial' | 'packs' | 'team' | 'season' | 'tasks' | 'leagues') => void;
}

const LiveEventsMode = ({ playerData, setPlayerData, onNavigate }: LiveEventsModeProps) => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'finished'>('menu');
  const [period, setPeriod] = useState(1);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes in seconds
  const [score, setScore] = useState({ player: 0, opponent: 2 });
  const [possession, setPossession] = useState<'player' | 'opponent'>('player');
  const [shots, setShots] = useState({ player: 0, opponent: 0 });
  const [powerPlay, setPowerPlay] = useState(false);
  const [powerPlayTime, setPowerPlayTime] = useState(0);
  const [gameEvents, setGameEvents] = useState<string[]>([]);
  const [puckPosition, setPuckPosition] = useState({ x: 50, y: 50 }); // Center of rink
  const [players, setPlayers] = useState({
    yourTeam: [
      { id: 1, x: 45, y: 45, name: "Player 1" },
      { id: 2, x: 40, y: 55, name: "Player 2" },
      { id: 3, x: 35, y: 50, name: "Player 3" },
      { id: 4, x: 25, y: 40, name: "Defense 1" },
      { id: 5, x: 25, y: 60, name: "Defense 2" },
      { id: 6, x: 15, y: 50, name: "Goalie" }
    ],
    opponent: [
      { id: 7, x: 55, y: 55, name: "Opp 1" },
      { id: 8, x: 60, y: 45, name: "Opp 2" },
      { id: 9, x: 65, y: 50, name: "Opp 3" },
      { id: 10, x: 75, y: 40, name: "Opp D1" },
      { id: 11, x: 75, y: 60, name: "Opp D2" },
      { id: 12, x: 85, y: 50, name: "Opp G" }
    ]
  });

  // Jump-In and simulation state
  const [jumpIn, setJumpIn] = useState(false);
  const [controls, setControls] = useState({ up: false, down: false, left: false, right: false });
  const [puckTrail, setPuckTrail] = useState<{ x: number; y: number }[]>([]);
  const [puckCarrier, setPuckCarrier] = useState<{ team: 'player' | 'opponent'; id: number } | null>(null);

  // Game timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (period < 3) {
              setPeriod(p => p + 1);
              return 1200; // Reset to 20 minutes
            } else {
              setGameState('finished');
              return 0;
            }
          }
          return prev - 1;
        });
        
        if (powerPlayTime > 0) {
          setPowerPlayTime(prev => prev - 1);
          if (powerPlayTime === 1) {
            setPowerPlay(false);
          }
        }
      }, 100); // Faster game time
    }
    
    return () => clearInterval(interval);
  }, [gameState, timeLeft, period, powerPlayTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleShoot = () => {
    if (possession !== 'player') return;
    // Only allow quality shots from the slot/in-close
    const inClose = puckPosition.x > 80 && Math.abs(puckPosition.y - 50) < 12;
    if (!inClose) {
      addGameEvent('📍 Too far out — drive the net for a better look.');
      return;
    }

    const playerSkill = playerData.team.length > 0 ? 
      playerData.team.reduce((sum, p) => sum + p.overall, 0) / playerData.team.length / 100 : 0.7;

    setShots(prev => ({ ...prev, player: prev.player + 1 }));

    // Quick shot animation: puck darts to goal mouth
    setPuckPosition(prev => ({ x: Math.min(96, prev.x + 8), y: prev.y + (Math.random() - 0.5) * 6 }));

    const goalChance = Math.min(0.55, 0.25 + playerSkill * 0.35); // better in-tight
    if (Math.random() < goalChance) {
      setScore(prev => ({ ...prev, player: prev.player + 1 }));
      setPossession('opponent');
      addGameEvent('⚡ GOAL! Quick release beats the goalie!');
      setPlayerData(prev => ({ ...prev, coins: prev.coins + 50 }));
      const carrier = players.opponent[0];
      setPuckCarrier({ team: 'opponent', id: carrier.id });
    } else {
      addGameEvent('🥅 Goalie gets a piece of it!');
      setPossession('opponent');
      const carrier = players.opponent[0];
      setPuckCarrier({ team: 'opponent', id: carrier.id });
    }
  };

  const handlePass = () => {
    if (possession !== 'player') return;
    // Mostly successful passes with rare interceptions
    const success = Math.random() < 0.85;
    if (success) {
      const team = players.yourTeam;
      const currentId = puckCarrier?.id ?? -1;
      const options = team.filter(p => p.id !== currentId);
      const receiver = options[Math.floor(Math.random() * options.length)] ?? team[0];
      addGameEvent("✅ Tape-to-tape pass! You keep possession.");
      setPuckCarrier({ team: 'player', id: receiver.id });
      setPossession('player');
    } else {
      addGameEvent("❌ Picked off! Turnover at the blue line.");
      setPossession('opponent');
      // Give the puck to the nearest opponent
      const opp = players.opponent.reduce((best, p) => {
        const bd = Math.hypot(p.x - puckPosition.x, p.y - puckPosition.y);
        if (!best) return { p, d: bd };
        return bd < best.d ? { p, d: bd } : best;
      }, null as null | { p: typeof players.opponent[number]; d: number });
      if (opp) setPuckCarrier({ team: 'opponent', id: opp.p.id });
    }
  };

  const handleDefend = () => {
    if (possession === 'opponent') {
      const success = Math.random() < 0.6;
      if (success) {
        addGameEvent("🛡️ Great defensive play! You take the puck.");
        setPossession('player');
        const nearest = players.yourTeam.reduce((best, p) => {
          const d = Math.hypot(p.x - puckPosition.x, p.y - puckPosition.y);
          if (!best) return { p, d };
          return d < best.d ? { p, d } : best;
        }, null as null | { p: typeof players.yourTeam[number]; d: number });
        if (nearest) setPuckCarrier({ team: 'player', id: nearest.p.id });
      } else {
        addGameEvent("⚠️ Couldn’t strip it. Stay tight!");
      }
    }
  };

  const addGameEvent = (event: string) => {
    setGameEvents(prev => [event, ...prev.slice(0, 4)]);
  };

  // AI opponent actions (only shoot when in-close)
  useEffect(() => {
    if (gameState === 'playing' && possession === 'opponent') {
      const timer = setTimeout(() => {
        const inClose = puckPosition.x < 20 && Math.abs(puckPosition.y - 50) < 12;
        if (inClose && Math.random() < 0.45) { // Attempt a quality chance
          setShots(prev => ({ ...prev, opponent: prev.opponent + 1 }));
          const goalChance = 0.28; // Realistic but dangerous in-tight
          if (Math.random() < goalChance) {
            setScore(prev => ({ ...prev, opponent: prev.opponent + 1 }));
            addGameEvent("🔥 Opponent buries it in-tight!");
            setPossession('player');
            const carrier = players.yourTeam[0];
            setPuckCarrier({ team: 'player', id: carrier.id });
          } else {
            addGameEvent("🥅 Big save by your goalie!");
            setPossession('player');
            const carrier = players.yourTeam[0];
            setPuckCarrier({ team: 'player', id: carrier.id });
          }
        } else {
          // Cycle/pass to another opponent skater to get closer
          const options = players.opponent.slice(0, 5); // exclude goalie
          const receiver = options[Math.floor(Math.random() * options.length)];
          setPuckCarrier({ team: 'opponent', id: receiver.id });
          if (puckPosition.x > 18) {
            // Nudge puck toward your net
            setPuckPosition(prev => ({ x: Math.max(prev.x - 6, 8), y: prev.y + (Math.random() - 0.5) * 6 }));
          }
        }
      }, 900 + Math.random() * 800);

      return () => clearTimeout(timer);
    }
  }, [gameState, possession, puckPosition, players]);

  // Keyboard controls for Jump-In
  useEffect(() => {
    if (!jumpIn) return;
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowup' || k === 'w') setControls(c => ({ ...c, up: true }));
      if (k === 'arrowdown' || k === 's') setControls(c => ({ ...c, down: true }));
      if (k === 'arrowleft' || k === 'a') setControls(c => ({ ...c, left: true }));
      if (k === 'arrowright' || k === 'd') setControls(c => ({ ...c, right: true }));
      if (k === 'x') handlePass();
      if (k === 'c' || k === ' ') handleShoot();
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowup' || k === 'w') setControls(c => ({ ...c, up: false }));
      if (k === 'arrowdown' || k === 's') setControls(c => ({ ...c, down: false }));
      if (k === 'arrowleft' || k === 'a') setControls(c => ({ ...c, left: false }));
      if (k === 'arrowright' || k === 'd') setControls(c => ({ ...c, right: false }));
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [jumpIn]);

  // Skating, spacing, and pace simulation
  useEffect(() => {
    if (gameState !== 'playing') return;
    const id = setInterval(() => {
      setPlayers(prev => {
        const next = {
          yourTeam: prev.yourTeam.map(p => ({ ...p })),
          opponent: prev.opponent.map(p => ({ ...p }))
        };

        const stepTeam = (teamKey: 'yourTeam' | 'opponent', attackDir: number) => {
          const team = next[teamKey];
          const laneYs = [35, 50, 65, 42, 58, 50];
          team.forEach((p, idx) => {
            const isGoalie = idx === 5;
            const targetY = laneYs[idx] ?? 50;
            let targetX = isGoalie
              ? (teamKey === 'yourTeam' ? 12 : 88)
              : Math.max(10, Math.min(90, puckPosition.x + attackDir * (idx < 3 ? (10 + idx * 3) : -10 + (idx - 3) * 2)));

            // Jump-In: control the puck carrier on your team
            if (
              jumpIn &&
              teamKey === 'yourTeam' &&
              puckCarrier?.team === 'player' &&
              puckCarrier.id === p.id
            ) {
              const speed = 1.6;
              const dx = (controls.right ? 1 : 0) - (controls.left ? 1 : 0);
              const dy = (controls.down ? 1 : 0) - (controls.up ? 1 : 0);
              p.x = Math.max(5, Math.min(95, p.x + dx * speed));
              p.y = Math.max(5, Math.min(95, p.y + dy * speed));
            } else {
              // Separation to reduce clustering
              let sepX = 0, sepY = 0;
              team.forEach(o => {
                if (o.id === p.id) return;
                const dx = p.x - o.x;
                const dy = p.y - o.y;
                const d = Math.hypot(dx, dy);
                if (d < 6) {
                  const f = (6 - d) / 6;
                  sepX += (dx / (d || 1)) * f * 2.5;
                  sepY += (dy / (d || 1)) * f * 2.5;
                }
              });
              p.x = Math.max(5, Math.min(95, p.x + (targetX - p.x) * 0.06 + sepX));
              p.y = Math.max(5, Math.min(95, p.y + (targetY - p.y) * 0.06 + sepY));
            }
          });
        };

        stepTeam('yourTeam', +1);
        stepTeam('opponent', -1);
        return next;
      });
    }, 50); // faster, smoother pace

    return () => clearInterval(id);
  }, [gameState, jumpIn, controls, puckPosition, puckCarrier]);

  // Keep puck attached to carrier for clarity
  useEffect(() => {
    if (!puckCarrier) return;
    const teamArr = puckCarrier.team === 'player' ? players.yourTeam : players.opponent;
    const carrier = teamArr.find(p => p.id === puckCarrier.id);
    if (carrier) {
      setPuckPosition({ x: carrier.x, y: carrier.y });
    }
  }, [players, puckCarrier]);

  // Trail for puck visibility
  useEffect(() => {
    setPuckTrail(t => [{ ...puckPosition }, ...t].slice(0, 8));
  }, [puckPosition]);

  const startGame = () => {
    setGameState('playing');
    setPeriod(1);
    setTimeLeft(1200);
    setScore({ player: 0, opponent: 0 });
    setShots({ player: 0, opponent: 0 });
    setPossession('player');
    setGameEvents([]);
    setPuckTrail([]);
    const carrier = players.yourTeam[0];
    setPuckCarrier({ team: 'player', id: carrier.id });
    setPuckPosition({ x: carrier.x, y: carrier.y });
    addGameEvent("🏒 Game begins! You have possession!");
  };

  const pauseGame = () => {
    setGameState(gameState === 'playing' ? 'paused' : 'playing');
  };

  const endGame = () => {
    setGameState('finished');
    
    // Calculate rewards
    let coinsEarned = score.player * 25; // 25 coins per goal
    if (score.player > score.opponent) {
      coinsEarned += 100; // Win bonus
    }
    
    setPlayerData(prev => ({ 
      ...prev, 
      coins: prev.coins + coinsEarned 
    }));
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen nhl-gradient-bg">
        <GameHeader 
          playerData={playerData}
        />
        
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('menu')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>
            <h1 className="text-3xl font-bold text-foreground flex items-center">
              <Activity className="w-8 h-8 mr-2 text-hockey-red" />
              Live Events
            </h1>
          </div>

          <div className="grid gap-6">
            <Card className="p-6 nhl-gradient-bg border-primary/30">
              <div className="text-center">
                <Trophy className="w-16 h-16 text-gold mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Quick Match
                </h2>
                <p className="text-muted-foreground mb-6">
                  Play a fast-paced hockey game with real-time controls
                </p>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <Target className="w-8 h-8 text-hockey-red mx-auto mb-2" />
                    <div className="text-sm text-muted-foreground">Shooting</div>
                  </div>
                  <div className="text-center">
                    <Users className="w-8 h-8 text-ice-blue mx-auto mb-2" />
                    <div className="text-sm text-muted-foreground">Passing</div>
                  </div>
                  <div className="text-center">
                    <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="text-sm text-muted-foreground">Defense</div>
                  </div>
                </div>
                
                <Button 
                  onClick={startGame}
                  size="lg"
                  className="bg-hockey-red hover:bg-hockey-red/80 text-white"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Game
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen nhl-gradient-bg">
      <GameHeader 
        playerData={playerData}
      />
      
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        {/* Game HUD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Scoreboard */}
          <Card className="p-4 nhl-gradient-bg border-primary/30">
            <div className="text-center">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-muted-foreground">YOU</div>
                <div className="text-sm text-muted-foreground">OPP</div>
              </div>
              <div className="flex justify-between items-center text-3xl font-bold">
                <span className="text-hockey-red">{score.player}</span>
                <span className="text-xs text-muted-foreground">-</span>
                <span className="text-ice-blue">{score.opponent}</span>
              </div>
            </div>
          </Card>

          {/* Game Clock */}
          <Card className="p-4 nhl-gradient-bg border-primary/30">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">
                Period {period}
              </div>
              <div className="text-2xl font-mono text-gold">
                {formatTime(timeLeft)}
              </div>
              {powerPlay && (
                <Badge variant="destructive" className="mt-1">
                  Power Play {formatTime(powerPlayTime)}
                </Badge>
              )}
            </div>
          </Card>

          {/* Shots */}
          <Card className="p-4 nhl-gradient-bg border-primary/30">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Shots on Goal</div>
              <div className="flex justify-between text-lg font-semibold">
                <span>{shots.player}</span>
                <span className="text-muted-foreground">-</span>
                <span>{shots.opponent}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Hockey Rink Visualization */}
          <div className="lg:col-span-2">
            <Card className="p-4 nhl-gradient-bg border-primary/30">
              <h3 className="font-bold text-foreground mb-3 flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                Game Action
              </h3>
              
              {/* Hockey Rink */}
              <div className="relative w-full h-64 bg-white rounded-lg border-2 border-gray-300 overflow-hidden">
                <img 
                  src={hockeyRinkImg} 
                  alt="Hockey Rink" 
                  className="w-full h-full object-cover opacity-90"
                />
                
                {/* Your Team Players (Blue) */}
                {players.yourTeam.map((player) => (
                  <div
                    key={player.id}
                    className="absolute w-3 h-3 bg-hockey-red rounded-full border border-white transform -translate-x-1/2 -translate-y-1/2 shadow-lg"
                    style={{
                      left: `${player.x}%`,
                      top: `${player.y}%`,
                    }}
                    title={player.name}
                  />
                ))}
                
                {/* Opponent Players (Red) */}
                {players.opponent.map((player) => (
                  <div
                    key={player.id}
                    className="absolute w-3 h-3 bg-ice-blue rounded-full border border-white transform -translate-x-1/2 -translate-y-1/2 shadow-lg"
                    style={{
                      left: `${player.x}%`,
                      top: `${player.y}%`,
                    }}
                    title={player.name}
                  />
                ))}
                
                {/* Puck trail for visibility */}
                {puckTrail.map((p, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-black/60 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, opacity: Math.max(0.15, 0.6 - i * 0.07) }}
                  />
                ))}

                {/* Puck */}
                <div
                  className="absolute w-4 h-4 bg-black rounded-full border-2 border-white ring-2 ring-yellow-300 transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_12px_rgba(255,215,0,0.9)]"
                  style={{
                    left: `${puckPosition.x}%`,
                    top: `${puckPosition.y}%`,
                  }}
                />
                
                {/* Goal Areas */}
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-16 border-2 border-hockey-red rounded opacity-60" />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-16 border-2 border-ice-blue rounded opacity-60" />

                {/* Jump-In on-screen controls */}
                {jumpIn && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute bottom-2 left-2 flex gap-2 pointer-events-auto">
                      <Button size="icon" variant="outline"
                        onMouseDown={() => setControls(c => ({ ...c, left: true }))}
                        onMouseUp={() => setControls(c => ({ ...c, left: false }))}
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <div className="flex flex-col gap-2">
                        <Button size="icon" variant="outline"
                          onMouseDown={() => setControls(c => ({ ...c, up: true }))}
                          onMouseUp={() => setControls(c => ({ ...c, up: false }))}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="outline"
                          onMouseDown={() => setControls(c => ({ ...c, down: true }))}
                          onMouseUp={() => setControls(c => ({ ...c, down: false }))}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button size="icon" variant="outline"
                        onMouseDown={() => setControls(c => ({ ...c, right: true }))}
                        onMouseUp={() => setControls(c => ({ ...c, right: false }))}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="absolute bottom-2 right-2 flex gap-2 pointer-events-auto">
                      <Button onClick={handlePass} variant="outline">Pass (X)</Button>
                      <Button onClick={handleShoot} className="bg-hockey-red hover:bg-hockey-red/80 text-white">Shoot (C/Space)</Button>
                    </div>

                    <div className="absolute bottom-20 right-2 text-xs text-foreground/80 pointer-events-none">
                      WASD/Arrows to move
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {possession === 'player' ? (
                  <>
                    <Button 
                      onClick={() => {
                        // Move puck towards goal
                        setPuckPosition(prev => ({ 
                          x: Math.min(prev.x + 10, 85), 
                          y: prev.y + (Math.random() - 0.5) * 10 
                        }));
                        handleShoot();
                      }}
                      className="bg-hockey-red hover:bg-hockey-red/80 text-white"
                      disabled={gameState !== 'playing'}
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Shoot to Goal
                    </Button>
                    
                    <Button 
                      onClick={() => {
                        // Move puck to teammate
                        setPuckPosition(prev => ({ 
                          x: prev.x + (Math.random() - 0.5) * 15, 
                          y: prev.y + (Math.random() - 0.5) * 15 
                        }));
                        handlePass();
                      }}
                      variant="outline"
                      disabled={gameState !== 'playing'}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Pass
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => {
                      // Move puck towards your team
                      setPuckPosition(prev => ({ 
                        x: Math.max(prev.x - 10, 15), 
                        y: prev.y + (Math.random() - 0.5) * 10 
                      }));
                      handleDefend();
                    }}
                    className="col-span-2 bg-green-500 hover:bg-green-600 text-white"
                    disabled={gameState !== 'playing'}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Steal the Puck
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Game Events */}
          <Card className="p-4 nhl-gradient-bg border-primary/30">
            <h3 className="font-bold text-foreground mb-3 flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Game Events
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {gameEvents.map((event, index) => (
                <div 
                  key={index}
                  className="text-sm p-2 rounded bg-muted/20 text-foreground"
                >
                  {event}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Game Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <Card className="p-6 nhl-gradient-bg border-primary/30">
            <h3 className="font-bold text-foreground mb-4 text-center">Advanced Controls</h3>
            
            <div className="space-y-4">
              {possession === 'player' ? (
                <div className="space-y-3">
                  <Badge className="w-full justify-center bg-hockey-red text-white">
                    YOU HAVE POSSESSION
                  </Badge>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={() => {
                        // Deke move
                        setPuckPosition(prev => ({ 
                          x: prev.x + 5, 
                          y: prev.y + (Math.random() - 0.5) * 20 
                        }));
                        addGameEvent("🎯 Nice deke move!");
                      }}
                      variant="outline"
                      className="text-xs"
                      disabled={gameState !== 'playing'}
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Deke
                    </Button>
                    
                    <Button 
                      onClick={() => {
                        // Body check
                        const success = Math.random() < 0.7;
                        if (success) {
                          addGameEvent("💥 Big hit! Clear the zone!");
                          setPossession('player');
                        } else {
                          addGameEvent("⚠️ Missed check, opponent keeps possession");
                        }
                      }}
                      variant="outline"
                      className="text-xs"
                      disabled={gameState !== 'playing'}
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      Check
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Badge className="w-full justify-center bg-ice-blue text-white">
                    OPPONENT HAS POSSESSION
                  </Badge>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    Defend your zone and try to steal the puck!
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => setJumpIn(j => !j)}
                  className="flex-1"
                >
                  {jumpIn ? 'Exit Jump-In' : 'Jump-In'}
                </Button>
                <Button 
                  onClick={pauseGame}
                  variant="outline"
                  className="flex-1"
                >
                  {gameState === 'playing' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                
                <Button 
                  onClick={endGame}
                  variant="destructive"
                  className="flex-1"
                >
                  End Game
                </Button>
              </div>
            </div>
          </Card>

          {/* Game Status */}
          <Card className="p-4 nhl-gradient-bg border-primary/30">
            <h3 className="font-bold text-foreground mb-3">Game Status</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">State:</span>
                <Badge variant={gameState === 'playing' ? 'default' : 'secondary'}>
                  {gameState.toUpperCase()}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Possession:</span>
                <span className={possession === 'player' ? 'text-hockey-red font-semibold' : 'text-ice-blue font-semibold'}>
                  {possession === 'player' ? 'YOU' : 'OPPONENT'}
                </span>
              </div>
              
              {gameState === 'finished' && (
                <div className="text-center pt-4 border-t">
                  <div className="text-lg font-bold mb-2">
                    {score.player > score.opponent ? '🏆 YOU WIN!' : 
                     score.player < score.opponent ? '😔 YOU LOSE' : '🤝 TIE GAME'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Coins earned: +{score.player * 25 + (score.player > score.opponent ? 100 : 0)}
                  </div>
                  <Button 
                    onClick={() => setGameState('menu')}
                    className="mt-3 w-full"
                  >
                    Play Again
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LiveEventsMode;