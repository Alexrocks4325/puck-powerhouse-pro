import { motion } from 'framer-motion';
import { GameHeader } from './GameHeader';
import { StatsDisplay } from './StatsDisplay';
import { HockeyRink } from './HockeyRink';
import { OnIceDisplay } from './OnIceDisplay';
import { EventOverlay } from './EventOverlay';

interface VisualGameHubProps {
  gameState: {
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    period: number;
    timeRemaining: string;
    isActive: boolean;
  };
  gameStats: any;
  homeLineup: any[];
  awayLineup: any[];
  onRinkTap: () => void;
  currentEvent?: {
    type: string;
    message: string;
    playerName: string;
  } | null;
  onEventComplete?: () => void;
  isPlayoffs?: boolean;
}

export const VisualGameHub = ({ 
  gameState, 
  gameStats, 
  homeLineup, 
  awayLineup, 
  onRinkTap,
  currentEvent,
  onEventComplete,
  isPlayoffs = false
}: VisualGameHubProps) => {
  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-background via-background to-card/20 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Game Header */}
        <GameHeader
          homeTeam={gameState.homeTeam}
          awayTeam={gameState.awayTeam}
          homeScore={gameState.homeScore}
          awayScore={gameState.awayScore}
          period={gameState.period}
          timeRemaining={gameState.timeRemaining}
          isPlayoffs={isPlayoffs}
        />

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Away Team Stats */}
          <motion.div 
            className="lg:col-span-1 space-y-4"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-4">
              <h3 className="text-lg font-bold text-away-team mb-4">{gameState.awayTeam} Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shots:</span>
                  <span className="font-semibold">{gameStats.awayShots || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saves:</span>
                  <span className="font-semibold">{gameStats.awaySaves || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hits:</span>
                  <span className="font-semibold">{gameStats.awayHits || 0}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Center - Hockey Rink */}
          <motion.div 
            className="lg:col-span-2 flex flex-col items-center space-y-4"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <HockeyRink
              onRinkTap={onRinkTap}
              isGameActive={gameState.isActive}
              homeLineup={homeLineup}
              awayLineup={awayLineup}
              gameStats={gameStats}
            />
            
            <OnIceDisplay
              homeLineup={homeLineup}
              awayLineup={awayLineup}
            />
          </motion.div>

          {/* Right Sidebar - Home Team Stats */}
          <motion.div 
            className="lg:col-span-1 space-y-4"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-4">
              <h3 className="text-lg font-bold text-home-team mb-4">{gameState.homeTeam} Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shots:</span>
                  <span className="font-semibold">{gameStats.homeShots || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saves:</span>
                  <span className="font-semibold">{gameStats.homeSaves || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hits:</span>
                  <span className="font-semibold">{gameStats.homeHits || 0}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Stats Display */}
        <motion.div 
          className="mt-6"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-4">
            <StatsDisplay 
              stats={gameStats} 
              homeTeam={gameState.homeTeam}
              awayTeam={gameState.awayTeam}
            />
          </div>
        </motion.div>
      </div>

      {/* Event Overlay */}
      {currentEvent && onEventComplete && (
        <EventOverlay
          eventType={currentEvent.type}
          eventMessage={currentEvent.message}
          playerName={currentEvent.playerName}
          onEventComplete={onEventComplete}
        />
      )}
    </motion.div>
  );
};