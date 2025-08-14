import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GameResult } from "@/utils/leagueSimulation";

interface LeagueScoreboardProps {
  recentGames: GameResult[];
  todaysGames: GameResult[];
}

const LeagueScoreboard = ({ recentGames, todaysGames }: LeagueScoreboardProps) => {
  const GameCard = ({ game, isLive = false }: { game: GameResult; isLive?: boolean }) => (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-medium">{game.awayTeam}</span>
              {isLive && <Badge variant="secondary" className="bg-red-500 text-white">FINAL</Badge>}
            </div>
            <span className="text-2xl font-bold">{game.awayScore}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-medium">{game.homeTeam}</span>
              <Badge variant="outline" className="text-xs">HOME</Badge>
            </div>
            <span className="text-2xl font-bold">{game.homeScore}</span>
          </div>
        </div>
      </div>
      
      {game.gameType !== 'regulation' && (
        <div className="mt-2 pt-2 border-t">
          <Badge variant="outline" className="text-xs">
            {game.gameType.toUpperCase()}
          </Badge>
        </div>
      )}

      {/* Game Stats Preview */}
      <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="font-medium">SOG</div>
            <div>{game.awayPlayers.reduce((sum, p) => sum + p.stats.shots, 0)} - {game.homePlayers.reduce((sum, p) => sum + p.stats.shots, 0)}</div>
          </div>
          <div>
            <div className="font-medium">Hits</div>
            <div>{game.awayPlayers.reduce((sum, p) => sum + p.stats.hits, 0)} - {game.homePlayers.reduce((sum, p) => sum + p.stats.hits, 0)}</div>
          </div>
          <div>
            <div className="font-medium">Blocks</div>
            <div>{game.awayPlayers.reduce((sum, p) => sum + p.stats.blockedShots, 0)} - {game.homePlayers.reduce((sum, p) => sum + p.stats.blockedShots, 0)}</div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="mt-3 pt-3 border-t">
        <div className="text-xs text-muted-foreground mb-1">Top Performers</div>
        <div className="space-y-1 text-sm">
          {[...game.homePlayers, ...game.awayPlayers]
            .filter(p => p.stats.points > 0)
            .sort((a, b) => b.stats.points - a.stats.points)
            .slice(0, 2)
            .map((p, i) => (
              <div key={i} className="flex justify-between">
                <span className="truncate">{p.player.name} ({p.player.team})</span>
                <span>{p.stats.goals}G {p.stats.assists}A</span>
              </div>
            ))}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="today">Today's Games</TabsTrigger>
          <TabsTrigger value="recent">Recent Results</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-6">
          {todaysGames.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-muted-foreground">No games scheduled today</div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {todaysGames.map((game, index) => (
                <GameCard key={index} game={game} isLive={true} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentGames.map((game, index) => (
              <GameCard key={index} game={game} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeagueScoreboard;