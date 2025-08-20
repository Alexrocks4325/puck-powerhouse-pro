import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface EventOverlayProps {
  eventType: string;
  eventMessage: string;
  playerName: string;
  onEventComplete: () => void;
}

export const EventOverlay = ({ eventType, eventMessage, playerName, onEventComplete }: EventOverlayProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onEventComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onEventComplete]);

  const getEventColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'goal': return 'text-power-red';
      case 'save': return 'text-ice-blue';
      case 'hit': return 'text-power-yellow';
      case 'penalty': return 'text-power-red';
      default: return 'text-foreground';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="bg-card p-8 rounded-2xl max-w-md mx-4 text-center border border-border"
      >
        <div className={`text-4xl font-bold mb-4 ${getEventColor(eventType)}`}>
          {eventType.toUpperCase()}!
        </div>
        <div className="text-lg text-foreground mb-2">
          {playerName}
        </div>
        <div className="text-muted-foreground">
          {eventMessage}
        </div>
      </motion.div>
    </motion.div>
  );
};