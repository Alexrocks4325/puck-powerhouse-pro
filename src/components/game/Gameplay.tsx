import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HockeyRink } from '@/components/hockey/HockeyRink';
import { ControlButtons } from '@/components/hockey/ControlButtons';
import { EventOverlay } from '@/components/hockey/EventOverlay';
import { PauseMenu } from '@/components/hockey/PauseMenu';
import { GameStats } from '@/components/hockey/GameStats';
import { OnIceDisplay } from '@/components/hockey/OnIceDisplay';
import { GameOverlay } from '@/components/hockey/GameOverlay';
import { useGameClock } from '@/hooks/useGameClock';
import { GameEngine, Player, GameStats as GameStatsType } from '@/utils/gameEngine';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

interface GameEvent {
  type: string;
  player: string;
  team: string;
  time: string;
  message: string;
}

interface GameData {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  period: string;
  timeRemaining: string;
  events: GameEvent[];
}

export default function Gameplay() {
  const navigate = useNavigate();
  const location = useLocation();
  const gameEngine = GameEngine.getInstance();

  // Get game setup from location state
  const { homeTeam = 'TOR', awayTeam = 'MTL', isSeasonMode = false } = location.state || {};

  // Set teams in game engine
  useEffect(() => {
    gameEngine.setTeams(homeTeam, awayTeam);
  }, [homeTeam, awayTeam]);

  // Game State
  const [isGameActive, setIsGameActive] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [showEventOverlay, setShowEventOverlay] = useState(false);
  const [showQuitDialog, setShowQuitDialog] = useState(false);

  // Game Data
  const [gameData, setGameData] = useState<GameData>({
    homeTeam: gameEngine.getTeamName(homeTeam),
    awayTeam: gameEngine.getTeamName(awayTeam),
    homeScore: 0,
    awayScore: 0,
    period: "1st Period",
    timeRemaining: "20:00",
    events: []
  });

  // Game Statistics
  const [gameStats, setGameStats] = useState<GameStatsType>({
    homeShots: 0,
    awayShots: 0,
    homeFaceoffWins: 0,
    awayFaceoffWins: 0,
    homePenalties: 0,
    awayPenalties: 0,
    homeHits: 0,
    awayHits: 0,
  });

  // Player lineups
  const [homeLineup, setHomeLineup] = useState<Player[]>([]);
  const [awayLineup, setAwayLineup] = useState<Player[]>([]);

  const [currentEvent, setCurrentEvent] = useState<{ type: string | null, message: string | null, player: string | null }>({
    type: null,
    message: null,
    player: null
  });

  // Game Clock
  const { gameClock, pauseClock, resumeClock } = useGameClock(() => {
    setIsGameActive(false);
    // Game ended - navigate back to season mode with results
    setTimeout(() => {
      if (isSeasonMode) {
        navigate('/season', { 
          state: { 
            gameResult: {
              homeScore: gameData.homeScore,
              awayScore: gameData.awayScore,
              isWin: gameData.homeScore > gameData.awayScore
            }
          }
        });
      } else {
        navigate('/');
      }
    }, 3000);
  });

  // Initialize lineups
  useEffect(() => {
    setHomeLineup(gameEngine.getCurrentLineup('home'));
    setAwayLineup(gameEngine.getCurrentLineup('away'));
  }, [gameEngine]);

  // Update game clock display
  useEffect(() => {
    const periodText =
      gameClock.period === 1 ? "1st Period" :
      gameClock.period === 2 ? "2nd Period" : "3rd Period";

    setGameData(prev => ({
      ...prev,
      period: periodText,
      timeRemaining: gameEngine.formatTime(gameClock.minutes, gameClock.seconds)
    }));
  }, [gameClock, gameEngine]);

  // Random events during gameplay
  useEffect(() => {
    if (!isGameActive || isPaused || showEventOverlay) return;

    const eventTimer = setTimeout(() => {
      triggerRandomEvent();
    }, Math.random() * (11000 - 8000) + 8000); // Random between 8–11 seconds

    return () => clearTimeout(eventTimer);
  }, [isGameActive, isPaused, showEventOverlay]);

  const triggerRandomEvent = useCallback(() => {
    if (showEventOverlay) return;

    const actions = ['SHOT', 'PASS', 'CHECK', 'SPECIAL_MOVE'];
    const randomAction = actions[Math.floor(Math.random() * actions.length)] as 'SHOT' | 'PASS' | 'CHECK' | 'SPECIAL_MOVE';
    const randomTeam = Math.random() < 0.5 ? 'home' : 'away';
    const player = gameEngine.getRandomPlayer(randomTeam);

    const outcome = gameEngine.generateOutcome(randomAction);
    const message = gameEngine.getRandomEventMessage(outcome, player);

    setCurrentEvent({
      type: outcome,
      message,
      player: player.name
    });

    setShowEventOverlay(true);

    // Update game stats and score
    if (outcome === 'Goal') {
      setGameData(prev => ({
        ...prev,
        [randomTeam === 'home' ? 'homeScore' : 'awayScore']: prev[randomTeam === 'home' ? 'homeScore' : 'awayScore'] + 1
      }));
    }

    setGameStats(prev => ({
      ...prev,
      ...(randomAction === 'SHOT' && {
        [randomTeam === 'home' ? 'homeShots' : 'awayShots']:
          prev[randomTeam === 'home' ? 'homeShots' : 'awayShots'] + 1
      }),
      ...(outcome === 'Hit' && {
        [randomTeam === 'home' ? 'homeHits' : 'awayHits']:
          prev[randomTeam === 'home' ? 'homeHits' : 'awayHits'] + 1
      })
    }));
  }, [gameEngine, showEventOverlay]);

  // Handle user actions
  const handleUserAction = useCallback((action: 'SHOT' | 'PASS' | 'CHECK' | 'SPECIAL_MOVE') => {
    if (!isGameActive || isPaused || showEventOverlay) return;

    const player = gameEngine.getRandomPlayer('home');
    const outcome = gameEngine.generateOutcome(action);
    const message = gameEngine.getRandomEventMessage(outcome, player);

    setCurrentEvent({
      type: outcome,
      message,
      player: player.name
    });

    setShowEventOverlay(true);

    // Update game stats and score
    if (outcome === 'Goal') {
      setGameData(prev => ({
        ...prev,
        homeScore: prev.homeScore + 1
      }));
    }

    setGameStats(prev => ({
      ...prev,
      ...(action === 'SHOT' && {
        homeShots: prev.homeShots + 1
      }),
      ...(outcome === 'Hit' && {
        homeHits: prev.homeHits + 1
      })
    }));
  }, [gameEngine, isGameActive, isPaused, showEventOverlay]);

  // Handlers
  const handlePause = useCallback(() => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      pauseClock();
    } else {
      resumeClock();
    }
  }, [isPaused, pauseClock, resumeClock]);

  const handleResume = useCallback(() => {
    setIsPaused(false);
    resumeClock();
  }, [resumeClock]);

  const handleSettings = useCallback(() => console.log("Settings clicked"), []);
  const handleQuit = useCallback(() => setShowQuitDialog(true), []);
  const confirmQuit = useCallback(() => { 
    navigate(isSeasonMode ? '/season' : '/'); 
  }, [navigate, isSeasonMode]);

  const handleEventComplete = useCallback(() => {
    setShowEventOverlay(false);
    setCurrentEvent({ type: null, message: null, player: null });
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Game Overlay */}
      <GameOverlay
        homeTeam={gameData.homeTeam}
        awayTeam={gameData.awayTeam}
        homeScore={gameData.homeScore}
        awayScore={gameData.awayScore}
        period={gameData.period}
        timeRemaining={gameData.timeRemaining}
        onPause={handlePause}
      />

      {/* Hockey Rink */}
      <div className="flex-1 flex items-center justify-center p-4">
        <HockeyRink
          onRinkTap={() => console.log("Rink tapped")}
          isGameActive={isGameActive && !isPaused}
        />
      </div>

      {/* Stats + On Ice */}
      <div className="flex w-full gap-4 px-4">
        <div className="flex-1">
          <GameStats stats={gameStats} />
        </div>
        <div className="flex-1">
          <OnIceDisplay homeLineup={homeLineup} awayLineup={awayLineup} />
        </div>
      </div>

      {/* Controls */}
      <ControlButtons
        onPass={() => handleUserAction('PASS')}
        onShoot={() => handleUserAction('SHOT')}
        onCheck={() => handleUserAction('CHECK')}
        onSpecialMove={() => handleUserAction('SPECIAL_MOVE')}
        isGameActive={isGameActive && !isPaused}
      />

      {/* Event Overlay */}
      {showEventOverlay && (
        <EventOverlay
          eventType={currentEvent.type || ""}
          eventMessage={currentEvent.message || ""}
          playerName={currentEvent.player || ""}
          onEventComplete={handleEventComplete}
        />
      )}

      {/* Pause Menu */}
      <PauseMenu
        isVisible={isPaused}
        onResume={handleResume}
        onSettings={handleSettings}
        onQuit={handleQuit}
      />

      {/* Quit Confirmation */}
      <AlertDialog open={showQuitDialog} onOpenChange={setShowQuitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quit Game?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to quit the current game? Your progress will be saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmQuit} className="bg-destructive hover:bg-destructive/80">
              Quit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}