import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PlayerPosition {
  id: string;
  name: string;
  x: number;
  y: number;
  team: 'home' | 'away';
  position: string;
  hasPuck: boolean;
}

interface HockeyRinkProps {
  onRinkTap: () => void;
  isGameActive: boolean;
  homeLineup: any[];
  awayLineup: any[];
  gameStats: any;
}

export const HockeyRink = ({ onRinkTap, isGameActive, homeLineup, awayLineup, gameStats }: HockeyRinkProps) => {
  const [playerPositions, setPlayerPositions] = useState<PlayerPosition[]>([]);
  const [puckPosition, setPuckPosition] = useState({ x: 50, y: 50 });
  const [lastEventTime, setLastEventTime] = useState(0);

  // Initialize player positions
  useEffect(() => {
    const homePositions: PlayerPosition[] = homeLineup.slice(0, 6).map((player, index) => ({
      id: player.id,
      name: player.name,
      x: 20 + (index % 3) * 15, // Left side formations
      y: 30 + (Math.floor(index / 3)) * 40,
      team: 'home',
      position: player.position,
      hasPuck: false
    }));

    const awayPositions: PlayerPosition[] = awayLineup.slice(0, 6).map((player, index) => ({
      id: player.id,
      name: player.name,
      x: 65 + (index % 3) * 15, // Right side formations
      y: 30 + (Math.floor(index / 3)) * 40,
      team: 'away',
      position: player.position,
      hasPuck: false
    }));

    setPlayerPositions([...homePositions, ...awayPositions]);
  }, [homeLineup, awayLineup]);

  // Simulate player movement and puck possession
  useEffect(() => {
    if (!isGameActive) return;

    const interval = setInterval(() => {
      setPlayerPositions(prev => prev.map(player => {
        // Random movement within team zones
        const baseX = player.team === 'home' ? 30 : 70;
        const variance = Math.random() * 20 - 10;
        
        return {
          ...player,
          x: Math.max(10, Math.min(90, baseX + variance)),
          y: Math.max(10, Math.min(90, player.y + (Math.random() * 10 - 5)))
        };
      }));

      // Move puck randomly
      setPuckPosition(prev => ({
        x: Math.max(5, Math.min(95, prev.x + (Math.random() * 20 - 10))),
        y: Math.max(5, Math.min(95, prev.y + (Math.random() * 20 - 10)))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isGameActive]);

  // React to game events
  useEffect(() => {
    const currentTime = Date.now();
    if (currentTime - lastEventTime > 1000) {
      // Animate players toward puck on events
      if (gameStats.homeShots !== undefined || gameStats.awayShots !== undefined) {
        setLastEventTime(currentTime);
        // Move puck toward goal on shots
        setPuckPosition({ x: Math.random() > 0.5 ? 85 : 15, y: 45 + Math.random() * 10 });
      }
    }
  }, [gameStats, lastEventTime]);

  return (
    <div 
      className="relative w-full max-w-4xl h-96 bg-gradient-to-b from-ice-blue/30 to-ice-blue/50 rounded-2xl border-4 border-ice-blue cursor-pointer transition-all duration-300 hover:shadow-xl overflow-hidden"
      onClick={onRinkTap}
    >
      {/* Center Line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-power-red transform -translate-x-1/2" />
      
      {/* Face-off Circles */}
      <div className="absolute left-1/4 top-1/2 w-16 h-16 rounded-full border-2 border-power-red transform -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute right-1/4 top-1/2 w-16 h-16 rounded-full border-2 border-power-red transform translate-x-1/2 -translate-y-1/2" />
      
      {/* Goal Creases */}
      <div className="absolute left-4 top-1/2 w-12 h-20 rounded-full border-2 border-ice-blue bg-ice-blue/20 transform -translate-y-1/2" />
      <div className="absolute right-4 top-1/2 w-12 h-20 rounded-full border-2 border-ice-blue bg-ice-blue/20 transform -translate-y-1/2" />
      
      {/* Goal Nets */}
      <div className="absolute left-0 top-1/2 w-4 h-16 transform -translate-y-1/2">
        <div className="w-full h-full border-2 border-power-red bg-power-red/10 rounded-r-lg relative">
          <div className="absolute inset-1 grid grid-cols-3 grid-rows-3 gap-0.5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="border border-power-red/50"></div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute right-0 top-1/2 w-4 h-16 transform -translate-y-1/2">
        <div className="w-full h-full border-2 border-power-red bg-power-red/10 rounded-l-lg relative">
          <div className="absolute inset-1 grid grid-cols-3 grid-rows-3 gap-0.5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="border border-power-red/50"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Player Benches */}
      <div className="absolute top-2 left-1/4 w-32 h-8 bg-card border border-border rounded-lg flex items-center justify-center">
        <span className="text-xs font-bold text-home-team">HOME BENCH</span>
      </div>
      <div className="absolute bottom-2 right-1/4 w-32 h-8 bg-card border border-border rounded-lg flex items-center justify-center">
        <span className="text-xs font-bold text-away-team">AWAY BENCH</span>
      </div>

      {/* Puck */}
      <motion.div
        className="absolute w-2 h-2 bg-muted-foreground rounded-full border border-foreground"
        style={{
          left: `${puckPosition.x}%`,
          top: `${puckPosition.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          x: [0, 2, -2, 0],
          y: [0, -1, 1, 0],
        }}
        transition={{
          duration: 0.5,
          repeat: isGameActive ? Infinity : 0,
          ease: "easeInOut"
        }}
      />

      {/* Players */}
      {playerPositions.map((player) => (
        <motion.div
          key={player.id}
          className={`absolute w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
            player.team === 'home' 
              ? 'bg-home-team border-home-team text-white' 
              : 'bg-away-team border-away-team text-white'
          }`}
          style={{
            left: `${player.x}%`,
            top: `${player.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            scale: player.hasPuck ? 1.2 : 1,
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut"
          }}
          title={`${player.name} (${player.position})`}
        >
          {player.position}
        </motion.div>
      ))}

      {/* Game Status Indicator */}
      {!isGameActive && (
        <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center">
          <div className="text-white text-2xl font-bold">PAUSED</div>
        </div>
      )}
    </div>
  );
};