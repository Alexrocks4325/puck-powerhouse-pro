import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LeagueStats, GoalieLeagueStats } from "@/utils/leagueSimulation";
import { Player } from "@/data/nhlPlayerDatabase";

interface PlayerLeaderboardsProps {
  playerLeaders: Array<{ player: Player; stats: LeagueStats }>;
  goalieLeaders: Array<{ player: Player; stats: GoalieLeagueStats }>;
}

const PlayerLeaderboards = ({ playerLeaders, goalieLeaders }: PlayerLeaderboardsProps) => {
  const PlayerRow = ({ 
    player, 
    stats, 
    rank, 
    statType 
  }: { 
    player: Player; 
    stats: LeagueStats; 
    rank: number; 
    statType: 'points' | 'goals' | 'assists' 
  }) => (
    <div className="grid grid-cols-12 gap-2 items-center p-3 hover:bg-muted/50 rounded-lg transition-colors">
      <div className="col-span-1">
        <Badge variant={rank <= 3 ? "default" : "outline"} className="w-6 h-6 text-xs flex items-center justify-center">
          {rank}
        </Badge>
      </div>
      
      <div className="col-span-1">
        <Avatar className="w-8 h-8">
          <AvatarImage src={player.image} alt={player.name} />
          <AvatarFallback className="text-xs">{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
      </div>
      
      <div className="col-span-4">
        <div className="font-medium text-sm">{player.name}</div>
        <div className="text-xs text-muted-foreground">{player.position} • {player.team}</div>
      </div>
      
      <div className="col-span-1 text-sm font-semibold">
        {statType === 'points' ? stats.points : statType === 'goals' ? stats.goals : stats.assists}
      </div>
      
      <div className="col-span-2 text-sm text-center">
        {stats.goals}-{stats.assists}
      </div>
      
      <div className="col-span-1 text-sm text-center">{stats.gamesPlayed}</div>
      
      <div className="col-span-2 text-sm text-center">
        {stats.shots > 0 ? ((stats.goals / stats.shots) * 100).toFixed(1) : '0.0'}%
      </div>
    </div>
  );

  const GoalieRow = ({ 
    player, 
    stats, 
    rank 
  }: { 
    player: Player; 
    stats: GoalieLeagueStats; 
    rank: number 
  }) => (
    <div className="grid grid-cols-12 gap-2 items-center p-3 hover:bg-muted/50 rounded-lg transition-colors">
      <div className="col-span-1">
        <Badge variant={rank <= 3 ? "default" : "outline"} className="w-6 h-6 text-xs flex items-center justify-center">
          {rank}
        </Badge>
      </div>
      
      <div className="col-span-1">
        <Avatar className="w-8 h-8">
          <AvatarImage src={player.image} alt={player.name} />
          <AvatarFallback className="text-xs">{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
      </div>
      
      <div className="col-span-4">
        <div className="font-medium text-sm">{player.name}</div>
        <div className="text-xs text-muted-foreground">{player.team}</div>
      </div>
      
      <div className="col-span-1 text-sm font-semibold">{stats.wins}</div>
      
      <div className="col-span-2 text-sm text-center">
        {stats.wins}-{stats.losses}-{stats.otLosses}
      </div>
      
      <div className="col-span-1 text-sm text-center">{stats.gamesPlayed}</div>
      
      <div className="col-span-1 text-sm text-center">
        {(stats.savePercentage * 100).toFixed(1)}%
      </div>
      
      <div className="col-span-1 text-sm text-center">{stats.gaa.toFixed(2)}</div>
    </div>
  );

  const getLeadersByCategory = (category: 'goals' | 'assists' | 'points') => {
    return [...playerLeaders]
      .sort((a, b) => {
        if (category === 'goals') return b.stats.goals - a.stats.goals;
        if (category === 'assists') return b.stats.assists - a.stats.assists;
        return b.stats.points - a.stats.points;
      })
      .slice(0, 50);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="points" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="points">Points</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="assists">Assists</TabsTrigger>
          <TabsTrigger value="goalies">Goalies</TabsTrigger>
        </TabsList>

        <TabsContent value="points" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Scoring Leaders</h3>
            
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-3 py-2 border-b mb-2">
              <div className="col-span-1">RK</div>
              <div className="col-span-1"></div>
              <div className="col-span-4">PLAYER</div>
              <div className="col-span-1">PTS</div>
              <div className="col-span-2">G-A</div>
              <div className="col-span-1">GP</div>
              <div className="col-span-2">S%</div>
            </div>

            <div className="space-y-1">
              {getLeadersByCategory('points').map((entry, index) => (
                <PlayerRow
                  key={`${entry.player.id}-points`}
                  player={entry.player}
                  stats={entry.stats}
                  rank={index + 1}
                  statType="points"
                />
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Goal Leaders</h3>
            
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-3 py-2 border-b mb-2">
              <div className="col-span-1">RK</div>
              <div className="col-span-1"></div>
              <div className="col-span-4">PLAYER</div>
              <div className="col-span-1">G</div>
              <div className="col-span-2">G-A</div>
              <div className="col-span-1">GP</div>
              <div className="col-span-2">S%</div>
            </div>

            <div className="space-y-1">
              {getLeadersByCategory('goals').map((entry, index) => (
                <PlayerRow
                  key={`${entry.player.id}-goals`}
                  player={entry.player}
                  stats={entry.stats}
                  rank={index + 1}
                  statType="goals"
                />
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="assists" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Assist Leaders</h3>
            
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-3 py-2 border-b mb-2">
              <div className="col-span-1">RK</div>
              <div className="col-span-1"></div>
              <div className="col-span-4">PLAYER</div>
              <div className="col-span-1">A</div>
              <div className="col-span-2">G-A</div>
              <div className="col-span-1">GP</div>
              <div className="col-span-2">S%</div>
            </div>

            <div className="space-y-1">
              {getLeadersByCategory('assists').map((entry, index) => (
                <PlayerRow
                  key={`${entry.player.id}-assists`}
                  player={entry.player}
                  stats={entry.stats}
                  rank={index + 1}
                  statType="assists"
                />
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="goalies" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Goalie Leaders</h3>
            
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-3 py-2 border-b mb-2">
              <div className="col-span-1">RK</div>
              <div className="col-span-1"></div>
              <div className="col-span-4">GOALIE</div>
              <div className="col-span-1">W</div>
              <div className="col-span-2">W-L-OT</div>
              <div className="col-span-1">GP</div>
              <div className="col-span-1">SV%</div>
              <div className="col-span-1">GAA</div>
            </div>

            <div className="space-y-1">
              {goalieLeaders.slice(0, 50).map((entry, index) => (
                <GoalieRow
                  key={`${entry.player.id}-goalie`}
                  player={entry.player}
                  stats={entry.stats}
                  rank={index + 1}
                />
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlayerLeaderboards;