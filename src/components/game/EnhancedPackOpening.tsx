import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PlayerCard from './PlayerCard';
import { Player } from '@/data/nhlPlayerDatabase';

interface EnhancedPackOpeningProps {
  pack: {
    id: string;
    name: string;
    cost: number;
    description: string;
    cardCount: number;
  };
  onOpenPack: () => Player[];
  onClose: () => void;
}

export const EnhancedPackOpening = ({ pack, onOpenPack, onClose }: EnhancedPackOpeningProps) => {
  const [isOpening, setIsOpening] = useState(false);
  const [openedCards, setOpenedCards] = useState<Player[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const handleOpenPack = () => {
    setIsOpening(true);
    const cards = onOpenPack();
    
    // Animate pack opening
    setTimeout(() => {
      setOpenedCards(cards);
      setShowResults(true);
      setIsOpening(false);
      
      // Reveal cards one by one
      cards.forEach((_, index) => {
        setTimeout(() => {
          setCurrentCardIndex(index + 1);
        }, index * 500);
      });
    }, 2000);
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'legend': return 'shadow-2xl shadow-purple-500/50';
      case 'elite': return 'shadow-2xl shadow-gold/50';
      case 'gold': return 'shadow-xl shadow-yellow-500/40';
      case 'silver': return 'shadow-lg shadow-gray-400/30';
      default: return 'shadow-md shadow-amber-600/20';
    }
  };

  const getBackgroundGradient = () => {
    if (!showResults || openedCards.length === 0) return 'from-background to-card/20';
    
    const bestRarity = openedCards.reduce((best, card) => {
      const rarityValues = { legend: 5, elite: 4, gold: 3, silver: 2, bronze: 1 };
      return (rarityValues[card.rarity as keyof typeof rarityValues] || 0) > 
             (rarityValues[best as keyof typeof rarityValues] || 0) ? card.rarity : best;
    }, 'bronze');

    switch (bestRarity) {
      case 'legend': return 'from-purple-900/20 via-background to-purple-900/20';
      case 'elite': return 'from-yellow-900/20 via-background to-yellow-900/20';
      case 'gold': return 'from-yellow-800/20 via-background to-yellow-800/20';
      case 'silver': return 'from-gray-700/20 via-background to-gray-700/20';
      default: return 'from-amber-800/20 via-background to-amber-800/20';
    }
  };

  return (
    <motion.div 
      className={`fixed inset-0 bg-gradient-to-br ${getBackgroundGradient()} flex items-center justify-center z-50 p-4`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="wait">
        {!showResults ? (
          <motion.div
            key="pack-preview"
            className="text-center space-y-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
          >
            {/* Pack Display */}
            <motion.div
              className="relative"
              animate={isOpening ? {
                rotateY: [0, 180, 360],
                scale: [1, 1.2, 0.8],
              } : {}}
              transition={{ duration: 2 }}
            >
              <Card className="w-64 h-80 p-6 bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary flex flex-col items-center justify-center relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                
                <Trophy className="w-16 h-16 text-primary mb-4" />
                <h2 className="text-2xl font-bold text-primary mb-2">{pack.name}</h2>
                <p className="text-sm text-muted-foreground mb-4 text-center">{pack.description}</p>
                <div className="flex items-center space-x-2 text-gold">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-bold">{pack.cardCount} Cards</span>
                  <Sparkles className="w-5 h-5" />
                </div>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            {!isOpening && (
              <motion.div 
                className="space-y-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button 
                  onClick={handleOpenPack}
                  size="lg"
                  className="text-lg px-8 py-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  <Sparkles className="w-6 h-6 mr-2" />
                  Open Pack
                </Button>
                <Button 
                  onClick={onClose}
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4"
                >
                  Cancel
                </Button>
              </motion.div>
            )}

            {isOpening && (
              <motion.div
                className="text-xl font-bold text-primary"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                Opening Pack...
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="results"
            className="w-full max-w-6xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="text-center mb-8">
              <motion.h2 
                className="text-4xl font-bold text-primary mb-4"
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Pack Opened!
              </motion.h2>
              
              {/* Rarity Distribution */}
              <motion.div 
                className="flex justify-center space-x-4 mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {(['legend', 'elite', 'gold', 'silver', 'bronze'] as const).map(rarity => {
                  const count = openedCards.filter(card => card.rarity === rarity).length;
                  if (count === 0) return null;
                  
                  return (
                    <div key={rarity} className="flex items-center space-x-1">
                      <Star className={`w-4 h-4 ${
                        rarity === 'legend' ? 'text-purple-400' :
                        rarity === 'elite' ? 'text-gold' :
                        rarity === 'gold' ? 'text-yellow-500' :
                        rarity === 'silver' ? 'text-gray-400' : 'text-amber-600'
                      }`} />
                      <span className="text-sm font-medium">{count}x {rarity}</span>
                    </div>
                  );
                })}
              </motion.div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {openedCards.map((card, index) => (
                <motion.div
                  key={card.id}
                  className={getRarityGlow(card.rarity)}
                  initial={{ 
                    scale: 0,
                    rotateY: 180,
                    opacity: 0
                  }}
                  animate={currentCardIndex > index ? {
                    scale: 1,
                    rotateY: 0,
                    opacity: 1
                  } : {}}
                  transition={{ 
                    delay: index * 0.1,
                    duration: 0.6,
                    type: "spring",
                    bounce: 0.4
                  }}
                >
                  <PlayerCard player={card} size="medium" />
                </motion.div>
              ))}
            </div>

            {/* Close Button */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: currentCardIndex >= openedCards.length ? 1 : 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button 
                onClick={onClose}
                size="lg"
                className="text-lg px-8 py-4"
              >
                Continue
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};