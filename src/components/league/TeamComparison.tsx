import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TeamStandings } from "@/utils/leagueSimulation";
import { TrendingUp, TrendingDown, Minus, Trophy, Target, Shield } from "lucide-react";

interface TeamComparisonProps {
  userTeam: TeamStandings;
  leagueAverage: {
    points: number;
    goalsFor: number;
    goalsAgainst: number;
    powerPlayPercentage: number;
    penaltyKillPercentage: number;
    wins: number;
  };
  leagueRank: number;
  totalTeams: number;
}

const TeamComparison = ({ userTeam, leagueAverage, leagueRank, totalTeams }: TeamComparisonProps) => {
  const getComparisonIcon = (userValue: number, leagueValue: number) => {
    if (userValue > leagueValue * 1.05) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (userValue < leagueValue * 0.95) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-yellow-500" />;
  };

  const getPercentile = (rank: number) => {
    return Math.round((1 - (rank - 1) / (totalTeams - 1)) * 100);
  };

  const ComparisonCard = ({ 
    title, 
    userValue, 
    leagueValue, 
    format = 'number',
    icon,
    inverse = false 
  }: {
    title: string;
    userValue: number;
    leagueValue: number;
    format?: 'number' | 'percentage';
    icon: React.ReactNode;
    inverse?: boolean;
  }) => {
    const isAbove = inverse ? userValue < leagueValue : userValue > leagueValue;
    const difference = userValue - leagueValue;
    const percentageDiff = ((difference / leagueValue) * 100);
    
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {icon}
            <h4 className="font-medium">{title}</h4>
          </div>
          {getComparisonIcon(userValue, leagueValue)}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Your Team</span>
            <span className="font-semibold">
              {format === 'percentage' ? `${(userValue * 100).toFixed(1)}%` : userValue.toFixed(1)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">League Avg</span>
            <span className="text-sm">
              {format === 'percentage' ? `${(leagueValue * 100).toFixed(1)}%` : leagueValue.toFixed(1)}
            </span>
          </div>
          
          <div className="pt-2">
            <Progress 
              value={Math.max(0, Math.min(100, 50 + (percentageDiff / 2)))} 
              className="h-2" 
            />
            <div className="flex justify-between items-center mt-1">
              <span className={`text-xs ${isAbove ? 'text-green-600' : 'text-red-600'}`}>
                {difference > 0 ? '+' : ''}{format === 'percentage' ? 
                  `${(difference * 100).toFixed(1)}%` : 
                  difference.toFixed(1)
                } vs avg
              </span>
              <span className="text-xs text-muted-foreground">
                {getPercentile(leagueRank)}th percentile
              </span>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overall Performance Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Team Performance Overview</h3>
          <Badge variant={leagueRank <= totalTeams / 3 ? "default" : leagueRank <= 2 * totalTeams / 3 ? "secondary" : "outline"}>
            #{leagueRank} of {totalTeams}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{userTeam.points}</div>
            <div className="text-sm text-muted-foreground">Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{userTeam.wins}</div>
            <div className="text-sm text-muted-foreground">Wins</div>
          </div>
          <div className="text-2xl font-bold text-center">
            <div className={userTeam.goalDifferential >= 0 ? 'text-green-600' : 'text-red-600'}>
              {userTeam.goalDifferential > 0 ? '+' : ''}{userTeam.goalDifferential}
            </div>
            <div className="text-sm text-muted-foreground">Goal Diff</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{userTeam.gamesPlayed}</div>
            <div className="text-sm text-muted-foreground">Games</div>
          </div>
        </div>
      </Card>

      {/* Detailed Comparisons */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ComparisonCard
          title="Offensive Rating"
          userValue={userTeam.goalsFor / userTeam.gamesPlayed}
          leagueValue={leagueAverage.goalsFor}
          icon={<Target className="w-4 h-4" />}
        />
        
        <ComparisonCard
          title="Defensive Rating"
          userValue={userTeam.goalsAgainst / userTeam.gamesPlayed}
          leagueValue={leagueAverage.goalsAgainst}
          icon={<Shield className="w-4 h-4" />}
          inverse={true}
        />
        
        <ComparisonCard
          title="Power Play %"
          userValue={userTeam.powerPlayPercentage}
          leagueValue={leagueAverage.powerPlayPercentage}
          format="percentage"
          icon={<TrendingUp className="w-4 h-4" />}
        />
        
        <ComparisonCard
          title="Penalty Kill %"
          userValue={userTeam.penaltyKillPercentage}
          leagueValue={leagueAverage.penaltyKillPercentage}
          format="percentage"
          icon={<Shield className="w-4 h-4" />}
        />
        
        <ComparisonCard
          title="Win Rate"
          userValue={userTeam.wins / userTeam.gamesPlayed}
          leagueValue={leagueAverage.wins / 82} // Assuming 82 game season
          format="percentage"
          icon={<Trophy className="w-4 h-4" />}
        />
        
        <ComparisonCard
          title="Points Pace"
          userValue={(userTeam.points / userTeam.gamesPlayed) * 82}
          leagueValue={leagueAverage.points * 82 / 82}
          icon={<TrendingUp className="w-4 h-4" />}
        />
      </div>

      {/* Record Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Home vs Away Performance</h4>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Home Record</span>
                <span className="text-sm">{userTeam.homeRecord.wins}-{userTeam.homeRecord.losses}-{userTeam.homeRecord.ot}</span>
              </div>
              <Progress 
                value={(userTeam.homeRecord.wins / (userTeam.homeRecord.wins + userTeam.homeRecord.losses + userTeam.homeRecord.ot)) * 100} 
                className="h-2"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Away Record</span>
                <span className="text-sm">{userTeam.awayRecord.wins}-{userTeam.awayRecord.losses}-{userTeam.awayRecord.ot}</span>
              </div>
              <Progress 
                value={(userTeam.awayRecord.wins / (userTeam.awayRecord.wins + userTeam.awayRecord.losses + userTeam.awayRecord.ot)) * 100} 
                className="h-2"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold mb-4">Recent Form</h4>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Last 10 Games</span>
                <span className="text-sm">{userTeam.lastTenRecord.wins}-{userTeam.lastTenRecord.losses}-{userTeam.lastTenRecord.ot}</span>
              </div>
              <Progress 
                value={(userTeam.lastTenRecord.wins / 10) * 100} 
                className="h-2"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Current Streak:</span>
              <Badge variant={userTeam.streak.type === 'W' ? "default" : "destructive"}>
                {userTeam.streak.type === 'W' ? 'Won' : userTeam.streak.type === 'L' ? 'Lost' : 'OT Loss'} {userTeam.streak.count}
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TeamComparison;