import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Team {
  name: string;
  seed: number;
  wins: number;
  eliminated?: boolean;
}

interface PlayoffBracketProps {
  currentRound: number;
  bracketData: {
    round1: Team[][];
    round2: Team[][];
    round3: Team[][];
    finals: Team[][];
  };
}

const PlayoffBracket = ({ currentRound, bracketData }: PlayoffBracketProps) => {
  const getRoundName = (round: number) => {
    switch (round) {
      case 1: return "First Round";
      case 2: return "Second Round";
      case 3: return "Conference Finals";
      case 4: return "Stanley Cup Finals";
      default: return "Playoffs";
    }
  };

  const SeriesCard = ({ series, round }: { series: Team[]; round: number }) => {
    const [team1, team2] = series;
    const isCompleted = (team1?.wins >= 4 || team2?.wins >= 4);
    const winner = team1?.wins >= 4 ? team1 : team2?.wins >= 4 ? team2 : null;

    return (
      <Card className="p-3 bg-card/80 backdrop-blur-sm border border-border/50">
        <div className="space-y-2">
          <div className={`flex justify-between items-center p-2 rounded ${team1?.eliminated ? 'opacity-50' : winner === team1 ? 'bg-gold/20' : 'bg-muted/50'}`}>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="w-6 h-6 p-0 text-xs">{team1?.seed}</Badge>
              <span className="font-medium text-sm">{team1?.name}</span>
            </div>
            <span className="font-bold text-lg">{team1?.wins || 0}</span>
          </div>
          
          <div className={`flex justify-between items-center p-2 rounded ${team2?.eliminated ? 'opacity-50' : winner === team2 ? 'bg-gold/20' : 'bg-muted/50'}`}>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="w-6 h-6 p-0 text-xs">{team2?.seed}</Badge>
              <span className="font-medium text-sm">{team2?.name}</span>
            </div>
            <span className="font-bold text-lg">{team2?.wins || 0}</span>
          </div>
          
          {isCompleted && (
            <div className="text-center">
              <Badge className="bg-gold text-black">
                {winner?.name} Advances
              </Badge>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <Card className="p-6 nhl-gradient-bg border-primary/30">
      <h3 className="text-xl font-bold text-foreground mb-4">Stanley Cup Playoffs</h3>
      
      <div className="space-y-6">
        {/* Current Round */}
        <div>
          <h4 className="text-lg font-semibold text-gold mb-3">{getRoundName(currentRound)}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentRound === 1 && bracketData.round1.map((series, index) => (
              <SeriesCard key={index} series={series} round={1} />
            ))}
            {currentRound === 2 && bracketData.round2.map((series, index) => (
              <SeriesCard key={index} series={series} round={2} />
            ))}
            {currentRound === 3 && bracketData.round3.map((series, index) => (
              <SeriesCard key={index} series={series} round={3} />
            ))}
            {currentRound === 4 && bracketData.finals.map((series, index) => (
              <SeriesCard key={index} series={series} round={4} />
            ))}
          </div>
        </div>

        {/* Previous Rounds Summary */}
        {currentRound > 1 && (
          <div>
            <h4 className="text-md font-semibold text-muted-foreground mb-2">Previous Rounds</h4>
            <div className="space-y-2">
              {currentRound > 1 && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">First Round: </span>
                  Completed ({bracketData.round1.filter(series => series[0]?.wins >= 4 || series[1]?.wins >= 4).length}/{bracketData.round1.length} series)
                </div>
              )}
              {currentRound > 2 && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Second Round: </span>
                  Completed ({bracketData.round2.filter(series => series[0]?.wins >= 4 || series[1]?.wins >= 4).length}/{bracketData.round2.length} series)
                </div>
              )}
              {currentRound > 3 && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Conference Finals: </span>
                  Completed ({bracketData.round3.filter(series => series[0]?.wins >= 4 || series[1]?.wins >= 4).length}/{bracketData.round3.length} series)
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PlayoffBracket;