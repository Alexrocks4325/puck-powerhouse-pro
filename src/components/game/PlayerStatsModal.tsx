import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trophy, Target, Clock, Zap } from "lucide-react";

interface PlayerStatsModalProps {
  player: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function PlayerStatsModal({ player, isOpen, onClose }: PlayerStatsModalProps) {
  if (!player) return null;

  const isGoalie = player.position === 'G';

  const getPositionColor = (position: string) => {
    const pos = position.toUpperCase();
    switch (pos) {
      case 'C':
      case 'LW':
      case 'RW':
        return 'bg-orange-600';
      case 'LD':
      case 'RD':
      case 'D':
        return 'bg-blue-900';
      case 'G':
        return 'bg-red-700';
      default:
        return 'bg-primary';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <img
              src={player.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`}
              alt={player.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <div className="text-xl font-bold text-foreground">{player.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`text-white ${getPositionColor(player.position)}`}>
                  {player.position}
                </Badge>
                {player.number && (
                  <span className="text-sm text-muted-foreground">#{player.number}</span>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{player.age || 25}</div>
              <div className="text-xs text-muted-foreground">Age</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{player.overall || 85}</div>
              <div className="text-xs text-muted-foreground">Overall</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{player.gamesPlayed || 0}</div>
              <div className="text-xs text-muted-foreground">GP</div>
            </div>
          </div>

          <Separator />

          {/* Key Stats */}
          {!isGoalie ? (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Target className="w-4 h-4 text-primary mr-1" />
                  </div>
                  <div className="text-xl font-bold text-foreground">{player.goals || 0}</div>
                  <div className="text-xs text-muted-foreground">Goals</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Zap className="w-4 h-4 text-primary mr-1" />
                  </div>
                  <div className="text-xl font-bold text-foreground">{player.assists || 0}</div>
                  <div className="text-xs text-muted-foreground">Assists</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Trophy className="w-4 h-4 text-primary mr-1" />
                  </div>
                  <div className="text-xl font-bold text-foreground">{(player.goals || 0) + (player.assists || 0)}</div>
                  <div className="text-xs text-muted-foreground">Points</div>
                </div>
              </div>

              <Separator />

              {/* Detailed Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">+/-</span>
                  <span className="font-semibold">{player.plusMinus || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PIM</span>
                  <span className="font-semibold">{player.penaltyMinutes || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shots</span>
                  <span className="font-semibold">{player.shots || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">S%</span>
                  <span className="font-semibold">{player.shootingPercentage || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hits</span>
                  <span className="font-semibold">{player.hits || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Blocks</span>
                  <span className="font-semibold">{player.blocks || 0}</span>
                </div>
              </div>

              {/* Time on Ice */}
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Avg TOI:</span>
                <span className="font-semibold">{player.timeOnIce || "00:00"}</span>
              </div>
            </>
          ) : (
            <>
              {/* Goalie Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-foreground">{player.wins || 0}</div>
                  <div className="text-xs text-muted-foreground">Wins</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-foreground">{player.losses || 0}</div>
                  <div className="text-xs text-muted-foreground">Losses</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GAA</span>
                  <span className="font-semibold">{player.gaa || "0.00"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SV%</span>
                  <span className="font-semibold">{player.savePercentage || "0.000"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SO</span>
                  <span className="font-semibold">{player.shutouts || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saves</span>
                  <span className="font-semibold">{player.saves || 0}</span>
                </div>
              </div>
            </>
          )}

          {/* Achievements */}
          {player.achievements && player.achievements.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-primary" />
                  Achievements
                </h4>
                <div className="space-y-1">
                  {player.achievements.map((achievement: string, index: number) => (
                    <div key={index} className="text-xs text-muted-foreground">
                      • {achievement}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}