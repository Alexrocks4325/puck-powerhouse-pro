import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TeamSelectionCardProps {
  team: {
    id?: number;
    name: string;
    city?: string;
    abbreviation?: string;
    logo?: string;
    wins?: number;
    losses?: number;
    otLosses?: number;
    difficulty?: number;
  };
  isSelected: boolean;
  onTap: () => void;
  position: "HOME" | "AWAY";
}

export default function TeamSelectionCard({
  team,
  isSelected,
  onTap,
  position
}: TeamSelectionCardProps) {
  const isPlaceholder = !team.id;
  
  return (
    <Card
      className={cn(
        "team-card transition-all duration-200 hover-scale cursor-pointer h-48 w-40",
        isSelected && !isPlaceholder
          ? "ring-2 ring-primary bg-primary/5 border-primary shadow-lg" 
          : "hover:shadow-md",
        isPlaceholder && "border-dashed border-2 hover:border-primary/50"
      )}
      onClick={onTap}
    >
      <div className="p-4 h-full flex flex-col items-center justify-center">
        {/* Position Label */}
        <Badge 
          variant="secondary" 
          className="mb-3 text-xs font-medium"
        >
          {position}
        </Badge>

        {/* Team Logo */}
        <div className="mb-3 flex-shrink-0">
          <img
            src={team.logo || "https://via.placeholder.com/80x80/1B365D/FFFFFF?text=TEAM"}
            alt={`${team.name} logo`}
            className="w-16 h-16 object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://via.placeholder.com/80x80/1B365D/FFFFFF?text=TEAM";
            }}
          />
        </div>

        {/* Team Name */}
        <h4 className={cn(
          "font-semibold text-center leading-tight mb-2",
          isSelected && !isPlaceholder ? "text-primary" : "text-foreground",
          isPlaceholder && "text-muted-foreground"
        )}>
          {team.name}
        </h4>

        {/* Team Record */}
        {!isPlaceholder && (
          <div className="text-xs text-muted-foreground text-center">
            {team.wins || 0}-{team.losses || 0}-{team.otLosses || 0}
          </div>
        )}

        {/* Difficulty Rating */}
        {team.difficulty && (
          <div className="mt-2 text-center">
            <span className="text-xs font-bold text-primary">
              {Math.round(team.difficulty)}/100
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}