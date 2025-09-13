import { motion } from 'framer-motion';
import { Clock, Star, Trophy } from 'lucide-react';
import stanleyCupImg from '@/assets/stanley-cup.jpg';

interface GameHeaderProps {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  period: number;
  timeRemaining: string;
  isPlayoffs?: boolean;
}

export const GameHeader = ({ 
  homeTeam, 
  awayTeam, 
  homeScore, 
  awayScore, 
  period, 
  timeRemaining,
  isPlayoffs = false 
}: GameHeaderProps) => {
  return (
    <motion.div 
      className="relative bg-gradient-to-r from-card via-card/95 to-card p-6 rounded-2xl border border-border shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Playoff Stanley Cup Background */}
      {isPlayoffs && (
        <div 
          className="absolute right-4 top-0 bottom-0 w-32 opacity-10"
          style={{
            backgroundImage: `url(${stanleyCupImg})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
        />
      )}

      <div className="relative z-10 flex items-center justify-between">
        {/* Away Team */}
        <motion.div 
          className="flex items-center space-x-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-away-team mb-1">{awayTeam}</div>
            <div className="text-sm text-muted-foreground">AWAY</div>
          </div>
          <motion.div 
            className="text-4xl font-bold text-away-team bg-away-team/10 px-4 py-2 rounded-lg border border-away-team/30"
            animate={{ 
              scale: [1, 1.05, 1],
              boxShadow: ["0 0 0 0 rgba(59, 130, 246, 0)", "0 0 0 8px rgba(59, 130, 246, 0.1)", "0 0 0 0 rgba(59, 130, 246, 0)"]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {awayScore}
          </motion.div>
        </motion.div>

        {/* Game Info */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Clock className="w-5 h-5 text-primary" />
            <span className="text-lg font-semibold text-foreground">{timeRemaining}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {period === 1 ? '1st' : period === 2 ? '2nd' : period === 3 ? '3rd' : 'OT'} Period
          </div>
          {isPlayoffs && (
            <motion.div 
              className="flex items-center justify-center space-x-1 text-gold"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Trophy className="w-4 h-4" />
              <span className="text-xs font-bold">STANLEY CUP PLAYOFFS</span>
              <Trophy className="w-4 h-4" />
            </motion.div>
          )}
        </div>

        {/* Home Team */}
        <motion.div 
          className="flex items-center space-x-4"
          whileHover={{ scale: 1.02 }}
        >
          <motion.div 
            className="text-4xl font-bold text-home-team bg-home-team/10 px-4 py-2 rounded-lg border border-home-team/30"
            animate={{ 
              scale: [1, 1.05, 1],
              boxShadow: ["0 0 0 0 rgba(239, 68, 68, 0)", "0 0 0 8px rgba(239, 68, 68, 0.1)", "0 0 0 0 rgba(239, 68, 68, 0)"]
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          >
            {homeScore}
          </motion.div>
          <div className="text-center">
            <div className="text-2xl font-bold text-home-team mb-1">{homeTeam}</div>
            <div className="text-sm text-muted-foreground">HOME</div>
          </div>
        </motion.div>
      </div>

      {/* Score difference indicator */}
      {Math.abs(homeScore - awayScore) >= 2 && (
        <motion.div 
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Star className="w-3 h-3" />
            <span>{Math.abs(homeScore - awayScore)} goal lead</span>
            <Star className="w-3 h-3" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};