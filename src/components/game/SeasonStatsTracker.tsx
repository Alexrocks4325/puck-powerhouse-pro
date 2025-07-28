import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PlayerStats {
  name: string;
  team: string;
  position: string;
  stats: {
    goals: number;
    assists: number;
    points: number;
    games: number;
    plusMinus: number;
    pim: number;
  };
}

interface GoalieStats {
  name: string;
  team: string;
  stats: {
    wins: number;
    losses: number;
    saves: number;
    goalsAgainst: number;
    savePercentage: number;
    gaa: number;
    shutouts: number;
  };
}

interface SeasonStatsProps {
  currentGame: number;
}

const SeasonStatsTracker = ({ currentGame }: SeasonStatsProps) => {
  // Generate realistic stats based on current game progression
  const generatePlayerStats = (): PlayerStats[] => {
    const players = [
      { name: "Connor McDavid", team: "EDM", position: "C" },
      { name: "Leon Draisaitl", team: "EDM", position: "C" },
      { name: "Nathan MacKinnon", team: "COL", position: "C" },
      { name: "David Pastrnak", team: "BOS", position: "RW" },
      { name: "Auston Matthews", team: "TOR", position: "C" },
      { name: "Mikko Rantanen", team: "COL", position: "RW" },
      { name: "Erik Karlsson", team: "PIT", position: "D" },
      { name: "Artemi Panarin", team: "NYR", position: "LW" },
      { name: "Zuccarello", team: "MIN", position: "RW" },
      { name: "Johnny Gaudreau", team: "CBJ", position: "LW" }
    ];

    return players.map(player => {
      const gamesPlayed = Math.min(currentGame, 82);
      const baseGoals = Math.floor(Math.random() * 30 + 15) * (gamesPlayed / 82);
      const baseAssists = Math.floor(Math.random() * 40 + 20) * (gamesPlayed / 82);
      
      return {
        ...player,
        stats: {
          goals: Math.floor(baseGoals),
          assists: Math.floor(baseAssists),
          points: Math.floor(baseGoals + baseAssists),
          games: gamesPlayed,
          plusMinus: Math.floor(Math.random() * 30 - 10),
          pim: Math.floor(Math.random() * 50)
        }
      };
    }).sort((a, b) => b.stats.points - a.stats.points);
  };

  const generateGoalieStats = (): GoalieStats[] => {
    const goalies = [
      { name: "Igor Shesterkin", team: "NYR" },
      { name: "Frederik Andersen", team: "CAR" },
      { name: "Linus Ullmark", team: "BOS" },
      { name: "Connor Hellebuyck", team: "WPG" },
      { name: "Ilya Sorokin", team: "NYI" },
      { name: "Jacob Markstrom", team: "CGY" },
      { name: "Andrei Vasilevskiy", team: "TBL" },
      { name: "Juuse Saros", team: "NSH" }
    ];

    return goalies.map(goalie => {
      const gamesPlayed = Math.min(Math.floor(currentGame * 0.6), 50);
      const wins = Math.floor(gamesPlayed * (0.5 + Math.random() * 0.3));
      const saves = Math.floor(gamesPlayed * (25 + Math.random() * 10));
      const goalsAgainst = Math.floor(gamesPlayed * (2 + Math.random() * 2));
      
      return {
        ...goalie,
        stats: {
          wins,
          losses: gamesPlayed - wins,
          saves,
          goalsAgainst,
          savePercentage: Number(((saves / (saves + goalsAgainst)) * 100).toFixed(1)),
          gaa: Number((goalsAgainst / gamesPlayed * 82 / 82).toFixed(2)),
          shutouts: Math.floor(Math.random() * 8)
        }
      };
    }).sort((a, b) => b.stats.wins - a.stats.wins);
  };

  const playerStats = generatePlayerStats();
  const goalieStats = generateGoalieStats();

  return (
    <Card className="p-6 nhl-gradient-bg border-primary/30">
      <h3 className="text-xl font-bold text-foreground mb-4">League Leaders</h3>
      
      <Tabs defaultValue="skaters" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="skaters">Skaters</TabsTrigger>
          <TabsTrigger value="goalies">Goalies</TabsTrigger>
        </TabsList>
        
        <TabsContent value="skaters">
          <div className="space-y-2">
            <div className="grid grid-cols-6 gap-2 text-xs font-semibold text-muted-foreground border-b pb-2">
              <span>Player</span>
              <span>Team</span>
              <span>G</span>
              <span>A</span>
              <span>PTS</span>
              <span>GP</span>
            </div>
            {playerStats.slice(0, 10).map((player, index) => (
              <div key={player.name} className="grid grid-cols-6 gap-2 text-sm py-1 hover:bg-primary/10 rounded">
                <div className="flex items-center space-x-1">
                  <Badge variant="outline" className="w-6 h-6 p-0 text-xs">{index + 1}</Badge>
                  <span className="font-medium truncate">{player.name}</span>
                </div>
                <span className="text-muted-foreground">{player.team}</span>
                <span className="font-medium">{player.stats.goals}</span>
                <span className="font-medium">{player.stats.assists}</span>
                <span className="font-bold text-gold">{player.stats.points}</span>
                <span className="text-muted-foreground">{player.stats.games}</span>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="goalies">
          <div className="space-y-2">
            <div className="grid grid-cols-6 gap-2 text-xs font-semibold text-muted-foreground border-b pb-2">
              <span>Goalie</span>
              <span>Team</span>
              <span>W</span>
              <span>SV%</span>
              <span>GAA</span>
              <span>SO</span>
            </div>
            {goalieStats.slice(0, 8).map((goalie, index) => (
              <div key={goalie.name} className="grid grid-cols-6 gap-2 text-sm py-1 hover:bg-primary/10 rounded">
                <div className="flex items-center space-x-1">
                  <Badge variant="outline" className="w-6 h-6 p-0 text-xs">{index + 1}</Badge>
                  <span className="font-medium truncate">{goalie.name}</span>
                </div>
                <span className="text-muted-foreground">{goalie.team}</span>
                <span className="font-medium">{goalie.stats.wins}</span>
                <span className="font-medium">.{goalie.stats.savePercentage}</span>
                <span className="font-medium">{goalie.stats.gaa}</span>
                <span className="text-gold">{goalie.stats.shutouts}</span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default SeasonStatsTracker;