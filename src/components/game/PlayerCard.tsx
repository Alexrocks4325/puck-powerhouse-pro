import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import defaultPlayerImg from "@/assets/players/default-player.jpg";

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

  // Get player image using NHL profile ID or fallback
  const getPlayerImage = (player: Player): string => {
    // If player has a specific image path with NHL ID, use it directly
    if (player.image) {
      return player.image;
    }
    
    // Fallback to default if no image specified
    return defaultPlayerImg;
  };

  return (
    <Card 
      className={`${sizeClasses[size]} ${getRarityClass(player.rarity)} cursor-pointer hover:scale-105 transition-transform duration-200 flex flex-col relative overflow-hidden`}
      onClick={onClick}
    >
      {/* Player Image as Main Focus */}
      <div className="relative flex-1 flex flex-col justify-between p-1">
        {/* Overall Rating Badge */}
        <div className="absolute top-1 left-1 z-20">
          <div className={`font-bold ${getOverallColor(player.overall)} ${size === 'small' ? 'text-lg' : 'text-2xl'} bg-black/70 rounded px-2 py-1`}>
            {player.overall}
          </div>
        </div>

        {/* Position Badge */}
        <div className="absolute top-1 right-1 z-20">
          <Badge variant="outline" className={`${textSizeClasses[size]} bg-black/70 border-white/50 text-white`}>
            {player.position}
          </Badge>
        </div>

        {/* Main Player Image */}
        <div className="flex-1 flex items-center justify-center my-2">
          <div className={`relative ${size === 'small' ? 'w-16 h-16' : size === 'medium' ? 'w-20 h-20' : 'w-24 h-24'} rounded-full overflow-hidden border-2 border-primary/50 bg-black/20`}>
            <img 
              src={getPlayerImage(player)} 
              alt={player.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // If realistic image fails, try original image path
                if (player.image && e.currentTarget.src !== player.image) {
                  e.currentTarget.src = player.image;
                } else {
                  // Finally fallback to default
                  e.currentTarget.src = defaultPlayerImg;
                }
              }}
            />
          </div>
        </div>
        
        {/* Player Info */}
        <div className="text-center space-y-1">
          <div className={`font-semibold ${textSizeClasses[size]} text-foreground leading-tight`}>
            {player.name}
          </div>
          <div className={`${textSizeClasses[size]} text-muted-foreground`}>
            {player.team}
          </div>
        </div>
        
        {/* Rarity Indicator */}
        <div className="flex items-center justify-center mt-1">
          <Star className={`w-3 h-3 ${getRarityColor(player.rarity)} mr-1`} />
          <span className={`${textSizeClasses[size]} ${getRarityColor(player.rarity)} capitalize font-medium`}>
            {player.rarity}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default PlayerCard;