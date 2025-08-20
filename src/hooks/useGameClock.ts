import { useState, useEffect, useCallback } from 'react';
import { GameClock } from '@/utils/gameEngine';

export const useGameClock = (onPeriodEnd?: () => void) => {
  const [gameClock, setGameClock] = useState<GameClock>({
    period: 1,
    minutes: 20,
    seconds: 0,
    isRunning: true
  });

  const [gameSpeed] = useState(60); // 60x speed (1 real second = 1 game minute)

  useEffect(() => {
    if (!gameClock.isRunning) return;

    const interval = setInterval(() => {
      setGameClock(prev => {
        let { minutes, seconds, period } = prev;

        // Countdown the clock
        seconds -= 1;
        if (seconds < 0) {
          seconds = 59;
          minutes -= 1;
        }

        // Check for period end
        if (minutes < 0) {
          if (period < 3) {
            // Start next period
            return {
              period: period + 1,
              minutes: 20,
              seconds: 0,
              isRunning: true
            };
          } else {
            // Game over
            onPeriodEnd?.();
            return {
              period,
              minutes: 0,
              seconds: 0,
              isRunning: false
            };
          }
        }

        return {
          ...prev,
          minutes,
          seconds
        };
      });
    }, 1000 / gameSpeed);

    return () => clearInterval(interval);
  }, [gameClock.isRunning, gameSpeed, onPeriodEnd]);

  const pauseClock = useCallback(() => {
    setGameClock(prev => ({ ...prev, isRunning: false }));
  }, []);

  const resumeClock = useCallback(() => {
    setGameClock(prev => ({ ...prev, isRunning: true }));
  }, []);

  const resetClock = useCallback(() => {
    setGameClock({
      period: 1,
      minutes: 20,
      seconds: 0,
      isRunning: true
    });
  }, []);

  return {
    gameClock,
    pauseClock,
    resumeClock,
    resetClock
  };
};