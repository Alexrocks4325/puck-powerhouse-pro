import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface PauseMenuProps {
  isVisible: boolean;
  onResume: () => void;
  onSettings: () => void;
  onQuit: () => void;
}

export const PauseMenu = ({ isVisible, onResume, onSettings, onQuit }: PauseMenuProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            className="bg-card p-8 rounded-2xl max-w-sm w-full mx-4 border border-border"
          >
            <h2 className="text-2xl font-bold text-center mb-6 text-foreground">Game Paused</h2>
            
            <div className="space-y-4">
              <Button 
                onClick={onResume} 
                className="w-full btn-primary h-12 text-lg font-semibold"
              >
                Resume Game
              </Button>
              
              <Button 
                onClick={onSettings} 
                variant="outline" 
                className="w-full h-12 text-lg"
              >
                Settings
              </Button>
              
              <Button 
                onClick={onQuit} 
                variant="destructive" 
                className="w-full h-12 text-lg"
              >
                Quit Game
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};