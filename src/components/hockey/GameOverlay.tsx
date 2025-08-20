interface GameOverlayProps {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  period: string;
  timeRemaining: string;
  onPause: () => void;
}

export const GameOverlay = ({ 
  homeTeam, 
  awayTeam, 
  homeScore, 
  awayScore, 
  period, 
  timeRemaining,
  onPause 
}: GameOverlayProps) => {
  return (
    <div className="flex justify-between items-center p-4 bg-card/90 border-b border-border">
      {/* Home Team */}
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <div className="text-sm font-medium text-muted-foreground">{homeTeam}</div>
          <div className="text-3xl font-bold text-home-team">{homeScore}</div>
        </div>
      </div>

      {/* Game Info */}
      <div className="text-center cursor-pointer" onClick={onPause}>
        <div className="text-lg font-bold text-foreground">{period}</div>
        <div className="text-xl font-mono text-primary">{timeRemaining}</div>
      </div>

      {/* Away Team */}
      <div className="flex items-center space-x-4">
        <div className="text-left">
          <div className="text-sm font-medium text-muted-foreground">{awayTeam}</div>
          <div className="text-3xl font-bold text-away-team">{awayScore}</div>
        </div>
      </div>
    </div>
  );
};