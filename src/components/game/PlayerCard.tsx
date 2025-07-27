import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface Player {
  id: number;
  name: string;
  team: string;
  position: string;
  overall: number;
  rarity: 'elite' | 'gold' | 'silver' | 'bronze' | 'legend';
  image?: string;
}

interface PlayerCardProps {
  player: Player;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
}

const PlayerCard = ({ player, size = 'medium', onClick }: PlayerCardProps) => {
  const sizeClasses = {
    small: 'w-24 h-32 p-2',
    medium: 'w-32 h-44 p-3',
    large: 'w-40 h-56 p-4'
  };

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  const getRarityClass = (rarity: string) => {
    switch (rarity) {
      case 'legend':
        return 'player-card-legend';
      case 'elite':
        return 'player-card-elite';
      case 'gold':
        return 'player-card-gold';
      case 'silver':
        return 'player-card-silver';
      case 'bronze':
        return 'player-card-bronze';
      default:
        return 'player-card-bronze';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legend':
        return 'text-purple-400';
      case 'elite':
        return 'text-gold';
      case 'gold':
        return 'text-yellow-500';
      case 'silver':
        return 'text-gray-400';
      case 'bronze':
        return 'text-amber-600';
      default:
        return 'text-amber-600';
    }
  };

  const getOverallColor = (overall: number) => {
    if (overall >= 90) return 'text-gold';
    if (overall >= 85) return 'text-yellow-500';
    if (overall >= 80) return 'text-blue-400';
    return 'text-gray-400';
  };

  return (
    <Card 
      className={`${sizeClasses[size]} ${getRarityClass(player.rarity)} cursor-pointer hover:scale-105 transition-transform duration-200 flex flex-col relative overflow-hidden`}
      onClick={onClick}
    >
      {/* Player Image Background */}
      {player.image && (
        <div className="absolute inset-0 opacity-20">
          <img 
            src={player.image} 
            alt={player.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
      
      {/* Card Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-between p-1">
        <div className="text-center">
          <div className={`font-bold ${getOverallColor(player.overall)} ${size === 'small' ? 'text-lg' : 'text-2xl'} mb-1`}>
            {player.overall}
          </div>
          <Badge variant="outline" className={`${textSizeClasses[size]} mb-2`}>
            {player.position}
          </Badge>
        </div>
        
        {/* Player Image Circle (for main display) */}
        {player.image && size !== 'small' && (
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/30">
              <img 
                src={player.image} 
                alt={player.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/src/assets/players/default-player.jpg';
                }}
              />
            </div>
          </div>
        )}
        
        <div className="text-center flex-1 flex flex-col justify-center">
          <div className={`font-semibold ${textSizeClasses[size]} text-foreground leading-tight mb-1`}>
            {player.name}
          </div>
          <div className={`${textSizeClasses[size]} text-muted-foreground`}>
            {player.team}
          </div>
        </div>
        
        <div className="flex items-center justify-center">
          <Star className={`w-3 h-3 ${getRarityColor(player.rarity)} mr-1`} />
          <span className={`${textSizeClasses[size]} ${getRarityColor(player.rarity)} capitalize`}>
            {player.rarity}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default PlayerCard;