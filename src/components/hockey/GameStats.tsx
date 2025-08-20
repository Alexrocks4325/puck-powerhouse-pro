import { GameStats as GameStatsType } from '@/utils/gameEngine';

interface GameStatsProps {
  stats: GameStatsType;
}

export const GameStats = ({ stats }: GameStatsProps) => {
  return (
    <div className="bg-card/90 border border-border rounded-lg p-3 text-xs">
      <h3 className="text-sm font-bold text-foreground mb-2 text-center">GAME STATS</h3>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="text-muted-foreground font-medium">
          HOME
        </div>
        <div className="text-muted-foreground font-medium">
          STAT
        </div>
        <div className="text-muted-foreground font-medium">
          AWAY
        </div>

        <div className="text-home-team font-bold">{stats.homeShots}</div>
        <div className="text-muted-foreground">Shots</div>
        <div className="text-away-team font-bold">{stats.awayShots}</div>

        <div className="text-home-team font-bold">{stats.homeHits}</div>
        <div className="text-muted-foreground">Hits</div>
        <div className="text-away-team font-bold">{stats.awayHits}</div>

        <div className="text-home-team font-bold">{stats.homeFaceoffWins}</div>
        <div className="text-muted-foreground">FO</div>
        <div className="text-away-team font-bold">{stats.awayFaceoffWins}</div>
      </div>
    </div>
  );
};