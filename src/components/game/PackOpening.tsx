import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gift, Star, ArrowRight, Coins, Package, Crown, Gem } from "lucide-react";
import PlayerCard from "./PlayerCard";
import GameHeader from "./GameHeader";
import { nhlPlayerDatabase, PACK_PROBABILITIES, coachDatabase, type Player } from "@/data/nhlPlayerDatabase";

interface PackOpeningProps {
  playerData: {
    coins: number;
    packs: number;
    team: any[];
    level: number;
  };
  setPlayerData: (data: any) => void;
  onNavigate: (screen: 'menu' | 'tutorial' | 'packs' | 'team' | 'season' | 'tasks' | 'leagues') => void;
}

const PackOpening = ({ playerData, setPlayerData, onNavigate }: PackOpeningProps) => {
  const [isOpening, setIsOpening] = useState(false);
  const [revealedCards, setRevealedCards] = useState<any[]>([]);
  const [showCards, setShowCards] = useState(false);
  const [packType, setPackType] = useState<'bronze' | 'standard' | 'premium' | 'elite'>('standard');

  // Pack costs
  const BRONZE_PACK_COST = 250;
  const STANDARD_PACK_COST = 500;
  const PREMIUM_PACK_COST = 1000;
  const ELITE_PACK_COST = 2500;

  // Enhanced player pool using the massive NHL database
  const getRandomPlayers = (type: 'starter' | 'bronze' | 'standard' | 'premium' | 'elite' = 'standard'): Player[] => {
    const probabilities = PACK_PROBABILITIES[type as keyof typeof PACK_PROBABILITIES] || PACK_PROBABILITIES.standard;
    let selectedPlayers: Player[] = [];
    
    if (type === 'starter') {
      // Guaranteed starter pack with decent players to get users started
      const starterPlayers = [
        nhlPlayerDatabase.find(p => p.name === "Connor Bedard")!,
        nhlPlayerDatabase.find(p => p.name === "Tim Stutzle")!,
        nhlPlayerDatabase.find(p => p.name === "Owen Power")!,
        nhlPlayerDatabase.find(p => p.name === "Lucas Raymond")!,
        nhlPlayerDatabase.find(p => p.name === "Moritz Seider")!,
      ];
      return starterPlayers;
    }

    // Generate 5 players based on pack probabilities
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
      
      // Get players of the selected rarity
      const availablePlayers = nhlPlayerDatabase.filter(p => p.rarity === rarity);
      if (availablePlayers.length > 0) {
        const randomPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
        // Avoid duplicates in the same pack
        if (!selectedPlayers.find(p => p.id === randomPlayer.id)) {
          selectedPlayers.push(randomPlayer);
        } else {
          i--; // Try again if duplicate
        }
      } else {
        i--; // Try again if no players available for this rarity
      }
    }

    return selectedPlayers;
  };

  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleOpenPack = (type: 'starter' | 'bronze' | 'standard' | 'premium' | 'elite' = 'standard') => {
    let cost = 0;
    switch (type) {
      case 'bronze': cost = BRONZE_PACK_COST; break;
      case 'standard': cost = STANDARD_PACK_COST; break;
      case 'premium': cost = PREMIUM_PACK_COST; break;
      case 'elite': cost = ELITE_PACK_COST; break;
      default: cost = 0;
    }
    
    if (type !== 'starter' && playerData.coins < cost) {
      alert("Not enough coins! Complete season games or tasks to earn more.");
      return;
    }

    if (type !== 'starter' && playerData.packs <= 0) {
      alert("No packs available! Buy a pack first or complete tasks to earn free packs.");
      return;
    }

    setIsOpening(true);
    if (type !== 'starter') setPackType(type as 'bronze' | 'standard' | 'premium' | 'elite');
    
    // Enhanced pack opening animation
    setTimeout(() => {
      const newCards = getRandomPlayers(type);
      setRevealedCards(newCards);
      setShowCards(true);
      setIsOpening(false);
      
      // Update player data with chemistry calculation
      setPlayerData(prev => ({
        ...prev,
        coins: type !== 'starter' ? prev.coins - cost : prev.coins,
        packs: type !== 'starter' ? prev.packs - 1 : prev.packs,
        team: [...prev.team, ...newCards]
      }));
    }, 2000);
  };

  const handleBuyPack = (type: 'bronze' | 'standard' | 'premium' | 'elite') => {
    let cost = 0;
    switch (type) {
      case 'bronze': cost = BRONZE_PACK_COST; break;
      case 'standard': cost = STANDARD_PACK_COST; break;
      case 'premium': cost = PREMIUM_PACK_COST; break;
      case 'elite': cost = ELITE_PACK_COST; break;
    }
    
    if (playerData.coins < cost) {
      alert("Not enough coins! Play season games or complete tasks to earn more.");
      return;
    }

    setPlayerData(prev => ({
      ...prev,
      coins: prev.coins - cost,
      packs: prev.packs + 1
    }));
  };

  const handleContinue = () => {
    setShowCards(false);
    setRevealedCards([]);
  };

  if (showCards) {
    return (
      <div className="min-h-screen ice-surface">
        <GameHeader 
          playerData={playerData}
          showBackButton 
          onBack={() => onNavigate('team')}
          title="Pack Opened!"
        />
        <div className="container mx-auto max-w-6xl pt-20 p-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-foreground">Congratulations!</h1>
            <p className="text-xl text-muted-foreground">Here are your new players</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
            {revealedCards.map((player, index) => (
              <div 
                key={player.id}
                className="animate-card-flip"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <PlayerCard player={player} />
              </div>
            ))}
          </div>

          <div className="text-center space-x-4">
            <Button 
              onClick={handleContinue}
              className="btn-primary text-lg px-8 py-3 h-auto"
            >
              Open Another Pack
            </Button>
            <Button 
              onClick={() => onNavigate('team')}
              variant="outline"
              className="text-lg px-8 py-3 h-auto border-primary text-primary"
            >
              View Team <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ice-surface">
      <GameHeader 
        playerData={playerData}
        showBackButton 
        onBack={() => onNavigate('team')}
        title="Pack Store"
      />
      
      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Pack Store</h1>
          <p className="text-xl text-muted-foreground">Open packs to discover new players and build team chemistry</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Standard Pack */}
          <Card className="game-card p-6 text-center">
            <Package className={`w-16 h-16 mx-auto mb-4 text-primary ${isOpening && packType === 'standard' ? 'animate-pack-open' : ''}`} />
            <h3 className="text-2xl font-bold mb-2 text-foreground">Standard Pack</h3>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Coins className="w-5 h-5 text-gold" />
              <span className="text-xl font-bold text-gold">{STANDARD_PACK_COST}</span>
            </div>
            
            <div className="bg-muted/20 rounded-lg p-3 mb-6 text-sm">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Star className="w-4 h-4 text-gold" />
                <span className="font-semibold">Contains:</span>
              </div>
              <p className="text-muted-foreground">
                • 5 Random Players<br/>
                • Chance for Elite Cards<br/>
                • Various NHL Teams<br/>
                • Chemistry Synergies
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => handleOpenPack('standard')}
                disabled={isOpening || playerData.packs <= 0}
                className="btn-primary w-full disabled:opacity-50"
              >
                {isOpening && packType === 'standard' ? "Opening..." : "Open Pack"}
              </Button>
              
              <Button 
                onClick={() => handleBuyPack('standard')}
                disabled={playerData.coins < STANDARD_PACK_COST}
                variant="outline"
                className="w-full border-primary text-primary disabled:opacity-50"
              >
                Buy Pack
              </Button>
            </div>
          </Card>

          {/* Premium Pack */}
          <Card className="game-card p-6 text-center border-gold">
            <Gift className={`w-16 h-16 mx-auto mb-4 text-gold ${isOpening && packType === 'premium' ? 'animate-pack-open' : ''}`} />
            <h3 className="text-2xl font-bold mb-2 text-foreground">Premium Pack</h3>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Coins className="w-5 h-5 text-gold" />
              <span className="text-xl font-bold text-gold">{PREMIUM_PACK_COST}</span>
            </div>
            
            <div className="bg-gold/20 rounded-lg p-3 mb-6 text-sm">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Star className="w-4 h-4 text-gold" />
                <span className="font-semibold">Guaranteed:</span>
              </div>
              <p className="text-muted-foreground">
                • 2 Elite Players (90+ OVR)<br/>
                • 2 Gold Players (85+ OVR)<br/>
                • 1 Bonus Player<br/>
                • Perfect Chemistry Match
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => handleOpenPack('premium')}
                disabled={isOpening || playerData.packs <= 0}
                className="btn-gold w-full disabled:opacity-50"
              >
                {isOpening && packType === 'premium' ? "Opening..." : "Open Premium Pack"}
              </Button>
              
              <Button 
                onClick={() => handleBuyPack('premium')}
                disabled={playerData.coins < PREMIUM_PACK_COST}
                variant="outline"
                className="w-full border-gold text-gold disabled:opacity-50"
              >
                Buy Premium Pack
              </Button>
            </div>
          </Card>

          {/* Pack Info & Quick Actions */}
          <Card className="game-card p-6">
            <h3 className="text-xl font-bold mb-4 text-foreground">Quick Actions</h3>
            <div className="space-y-4 text-sm">
              <div>
                <span className="font-semibold text-foreground">Packs Available: </span>
                <span className="text-primary">{playerData.packs}</span>
              </div>
              <div>
                <span className="font-semibold text-foreground">Current Coins: </span>
                <span className="text-gold">{playerData.coins.toLocaleString()}</span>
              </div>
              <div>
                <span className="font-semibold text-foreground">Team Size: </span>
                <span className="text-ice-blue">{playerData.team.length}</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button 
                onClick={() => onNavigate('season')}
                variant="outline"
                className="w-full border-primary text-primary"
              >
                Play Season Mode
              </Button>
              <Button 
                onClick={() => onNavigate('tasks')}
                variant="outline"
                className="w-full border-secondary text-secondary"
              >
                Complete Tasks
              </Button>
            </div>

            <div className="mt-6 p-3 bg-primary/10 rounded-lg">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Tip:</strong> Players from the same team create stronger chemistry synergies!
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PackOpening;