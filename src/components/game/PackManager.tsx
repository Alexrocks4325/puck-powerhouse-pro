import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Gift, Crown, Gem, Star } from "lucide-react";
import PlayerCard from "./PlayerCard";
import { nhlPlayerDatabase, PACK_PROBABILITIES, type Player } from "@/data/nhlPlayerDatabase";

interface PackManagerProps {
  isOpen: boolean;
  onClose: () => void;
  playerData: {
    coins: number;
    packs: number;
    team: any[];
    level: number;
  };
  setPlayerData: (data: any) => void;
}

const PackManager = ({ isOpen, onClose, playerData, setPlayerData }: PackManagerProps) => {
  const [isOpening, setIsOpening] = useState(false);
  const [revealedCards, setRevealedCards] = useState<Player[]>([]);
  const [showCards, setShowCards] = useState(false);

  const getRandomPlayers = (type: 'bronze' | 'standard' | 'premium' | 'elite' = 'standard'): Player[] => {
    const probabilities = PACK_PROBABILITIES[type];
    let selectedPlayers: Player[] = [];

    for (let i = 0; i < 5; i++) {
      const randomValue = Math.random();
      let rarity: string;
      
      if (randomValue < probabilities.legend) {
        rarity = 'legend';
      } else if (randomValue < probabilities.legend + probabilities.elite) {
        rarity = 'elite';
      } else if (randomValue < probabilities.legend + probabilities.elite + probabilities.gold) {
        rarity = 'gold';
      } else if (randomValue < probabilities.legend + probabilities.elite + probabilities.gold + probabilities.silver) {
        rarity = 'silver';
      } else {
        rarity = 'bronze';
      }
      
      const availablePlayers = nhlPlayerDatabase.filter(p => p.rarity === rarity);
      if (availablePlayers.length > 0) {
        const randomPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
        if (!selectedPlayers.find(p => p.id === randomPlayer.id)) {
          selectedPlayers.push(randomPlayer);
        } else {
          i--;
        }
      } else {
        i--;
      }
    }

    return selectedPlayers;
  };

  const handleOpenPack = () => {
    if (playerData.packs <= 0) {
      return;
    }

    setIsOpening(true);
    
    setTimeout(() => {
      const newCards = getRandomPlayers('standard');
      setRevealedCards(newCards);
      setShowCards(true);
      setIsOpening(false);
      
      setPlayerData(prev => ({
        ...prev,
        packs: prev.packs - 1,
        team: [...prev.team, ...newCards]
      }));
    }, 2000);
  };

  const handleContinue = () => {
    setShowCards(false);
    setRevealedCards([]);
  };

  if (showCards) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Pack Opened!</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-muted-foreground">Here are your new players!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {revealedCards.map((player, index) => (
                <div 
                  key={player.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <PlayerCard player={player} size="small" />
                </div>
              ))}
            </div>

            <div className="flex justify-center space-x-4">
              <Button 
                onClick={handleContinue}
                className="btn-primary"
              >
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Pack Manager</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <Package className="w-8 h-8 text-primary" />
              <span className="text-3xl font-bold text-primary">{playerData.packs}</span>
              <span className="text-lg text-muted-foreground">Packs Available</span>
            </div>
          </div>

          {playerData.packs > 0 ? (
            <Card className="p-6 text-center">
              <Package className={`w-16 h-16 mx-auto mb-4 text-primary ${isOpening ? 'animate-pulse' : ''}`} />
              <h3 className="text-xl font-bold mb-4">Standard Pack</h3>
              <p className="text-muted-foreground mb-6">
                Contains 5 random players with a chance for elite cards!
              </p>
              
              <Button 
                onClick={handleOpenPack}
                disabled={isOpening}
                className="btn-primary w-full"
                size="lg"
              >
                {isOpening ? "Opening..." : "Open Pack"}
              </Button>
            </Card>
          ) : (
            <Card className="p-6 text-center border-dashed border-2">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">No Packs Available</h3>
              <p className="text-muted-foreground mb-4">
                Complete tasks, win games, or visit the pack store to get more packs!
              </p>
              
              <Button 
                onClick={onClose}
                variant="outline"
                className="w-full"
              >
                Go to Pack Store
              </Button>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PackManager;