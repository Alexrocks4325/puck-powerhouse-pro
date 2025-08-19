import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PlayerLineupCardProps {
  player: {
    id: number;
    name: string;
    position: string;
    number?: number;
    overall?: number;
    goals?: number;
    assists?: number;
    points?: number;
    photo?: string;
  };
  isSelected: boolean;
  onTap: () => void;
  onLongPress?: () => void;
  size?: "small" | "medium" | "large";
}

const getPositionColor = (position: string) => {
  const pos = position.toUpperCase();
  switch (pos) {
    case 'C':
    case 'LW':
    case 'RW':
      return 'bg-orange-600 hover:bg-orange-700'; // Forward - Energy orange
    case 'LD':
    case 'RD':
    case 'D':
      return 'bg-blue-900 hover:bg-blue-800'; // Defense - Deep hockey blue
    case 'G':
      return 'bg-red-700 hover:bg-red-800'; // Goalie - NHL red
    default:
      return 'bg-primary hover:bg-primary/90';
  }
};

export default function PlayerLineupCard({
  player,
  isSelected,
  onTap,
  onLongPress,
  size = "medium"
}: PlayerLineupCardProps) {
  const sizeClasses = {
    small: "w-32 h-40",
    medium: "w-36 h-44", 
    large: "w-40 h-48"
  };

  return (
    <Card
      className={cn(
        "player-card transition-all duration-200 hover-scale cursor-pointer",
        sizeClasses[size],
        isSelected 
          ? "ring-2 ring-primary bg-primary/5 border-primary shadow-lg" 
          : "hover:shadow-md"
      )}
      onClick={onTap}
      onContextMenu={(e) => {
        e.preventDefault();
        onLongPress?.();
      }}
    >
      <div className="p-3 h-full flex flex-col">
        {/* Player Photo */}
        <div className="relative mb-2">
          <div className={cn(
            "aspect-square rounded-lg overflow-hidden border-2",
            isSelected ? "border-primary" : "border-border"
          )}>
            <img
              src={player.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`}
              alt={player.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`;
              }}
            />
          </div>
        </div>

        {/* Position Badge */}
        <Badge 
          className={cn(
            "text-xs font-semibold text-white mb-2 self-start px-2 py-0.5",
            getPositionColor(player.position)
          )}
        >
          {player.position}
        </Badge>

        {/* Player Name */}
        <div className="flex-1 flex flex-col justify-center">
          <h4 className={cn(
            "font-semibold text-center leading-tight mb-1",
            isSelected ? "text-primary" : "text-foreground",
            size === "small" ? "text-xs" : "text-sm"
          )}>
            {player.name}
          </h4>

          {/* Jersey Number */}
          {player.number && (
            <p className="text-xs text-muted-foreground text-center mb-2">
              #{player.number}
            </p>
          )}

          {/* Key Stats */}
          <div className="grid grid-cols-3 gap-1 text-center">
            <div>
              <div className="text-xs font-semibold text-foreground">
                {player.goals || 0}
              </div>
              <div className="text-xs text-muted-foreground">G</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-foreground">
                {player.assists || 0}
              </div>
              <div className="text-xs text-muted-foreground">A</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-foreground">
                {(player.goals || 0) + (player.assists || 0)}
              </div>
              <div className="text-xs text-muted-foreground">P</div>
            </div>
          </div>

          {/* Overall Rating */}
          {player.overall && (
            <div className="mt-2 text-center">
              <span className="text-xs font-bold text-primary">
                {player.overall} OVR
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}