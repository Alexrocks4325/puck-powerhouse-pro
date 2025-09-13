import { motion } from 'framer-motion';
import { Target, Shield, Zap, TrendingUp } from 'lucide-react';

interface GameStats {
  homeShots?: number;
  awayShots?: number;
  homeSaves?: number;
  awaySaves?: number;
  homeHits?: number;
  awayHits?: number;
  homePowerPlay?: string;
  awayPowerPlay?: string;
}

interface StatsDisplayProps {
  stats: GameStats;
  homeTeam: string;
  awayTeam: string;
}

export const StatsDisplay = ({ stats, homeTeam, awayTeam }: StatsDisplayProps) => {
  const StatItem = ({ 
    icon: Icon, 
    label, 
    homeValue, 
    awayValue, 
    color = "text-primary" 
  }: { 
    icon: any, 
    label: string, 
    homeValue: string | number, 
    awayValue: string | number,
    color?: string 
  }) => (
    <motion.div 
      className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border"
      whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
    >
      <div className="flex items-center space-x-2 text-away-team">
        <span className="font-semibold">{awayValue}</span>
        <span className="text-xs text-muted-foreground">{awayTeam}</span>
      </div>
      
      <div className="flex flex-col items-center space-y-1">
        <Icon className={`w-5 h-5 ${color}`} />
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      
      <div className="flex items-center space-x-2 text-home-team">
        <span className="text-xs text-muted-foreground">{homeTeam}</span>
        <span className="font-semibold">{homeValue}</span>
      </div>
    </motion.div>
  );

  return (
    <motion.div 
      className="space-y-3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, staggerChildren: 0.1 }}
    >
      <h3 className="text-lg font-bold text-foreground mb-4 text-center">Game Statistics</h3>
      
      <StatItem
        icon={Target}
        label="SHOTS"
        homeValue={stats.homeShots || 0}
        awayValue={stats.awayShots || 0}
        color="text-power-red"
      />
      
      <StatItem
        icon={Shield}
        label="SAVES"
        homeValue={stats.homeSaves || 0}
        awayValue={stats.awaySaves || 0}
        color="text-ice-blue"
      />
      
      <StatItem
        icon={Zap}
        label="HITS"
        homeValue={stats.homeHits || 0}
        awayValue={stats.awayHits || 0}
        color="text-power-yellow"
      />
      
      {(stats.homePowerPlay || stats.awayPowerPlay) && (
        <StatItem
          icon={TrendingUp}
          label="POWER PLAY"
          homeValue={stats.homePowerPlay || "0/0"}
          awayValue={stats.awayPowerPlay || "0/0"}
          color="text-gold"
        />
      )}
    </motion.div>
  );
};