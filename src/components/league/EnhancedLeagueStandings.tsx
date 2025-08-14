import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamStandings } from "@/utils/leagueSimulation";

interface EnhancedLeagueStandingsProps {
  standings: TeamStandings[];
}

const EnhancedLeagueStandings = ({ standings }: EnhancedLeagueStandingsProps) => {
  // NHL Divisions and Conferences
  const divisions = {
    atlantic: ['BOS', 'TOR', 'FLA', 'TBL', 'BUF', 'OTT', 'DET', 'MTL'],
    metropolitan: ['NYR', 'CAR', 'NJD', 'WSH', 'PHI', 'PIT', 'NYI', 'CBJ'],
    central: ['DAL', 'COL', 'WIN', 'NSH', 'MIN', 'STL', 'CHI', 'ARI'],
    pacific: ['VGK', 'LAK', 'SEA', 'VAN', 'CGY', 'EDM', 'SJS', 'ANA']
  };

  const getDivisionStandings = (divisionTeams: string[]) => {
    return standings
      .filter(team => divisionTeams.includes(team.team))
      .sort((a, b) => b.points - a.points || (b.wins - a.wins));
  };

  const getConferenceStandings = (isEastern: boolean) => {
    const easternDivisions = [...divisions.atlantic, ...divisions.metropolitan];
    const westernDivisions = [...divisions.central, ...divisions.pacific];
    const conferenceTeams = isEastern ? easternDivisions : westernDivisions;
    
    return standings
      .filter(team => conferenceTeams.includes(team.team))
      .sort((a, b) => b.points - a.points || (b.wins - a.wins));
  };

  const StandingsTable = ({ teams, showRank = true }: { teams: TeamStandings[]; showRank?: boolean }) => (
    <div className="space-y-2">
      {/* Header */}
      <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-4 py-2 border-b">
        {showRank && <div className="col-span-1">RK</div>}
        <div className={showRank ? "col-span-2" : "col-span-3"}>TEAM</div>
        <div className="col-span-1">GP</div>
        <div className="col-span-2">W-L-OT</div>
        <div className="col-span-1">PTS</div>
        <div className="col-span-1">GF</div>
        <div className="col-span-1">GA</div>
        <div className="col-span-1">DIFF</div>
        <div className="col-span-2">LAST 10</div>
      </div>

      {/* Team Rows */}
      {teams.map((team, index) => (
        <Card key={team.team} className="grid grid-cols-12 gap-2 items-center p-4 hover:shadow-sm transition-shadow">
          {showRank && (
            <div className="col-span-1">
              <Badge variant={index < 8 ? "default" : "outline"} className="w-6 h-6 text-xs flex items-center justify-center">
                {index + 1}
              </Badge>
            </div>
          )}
          
          <div className={showRank ? "col-span-2" : "col-span-3"}>
            <div className="font-medium">{team.team}</div>
            <div className="text-xs text-muted-foreground flex items-center space-x-1">
              <span className={`w-2 h-2 rounded-full ${team.streak.type === 'W' ? 'bg-green-500' : team.streak.type === 'L' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
              <span>{team.streak.type}{team.streak.count}</span>
            </div>
          </div>
          
          <div className="col-span-1 text-sm">{team.gamesPlayed}</div>
          
          <div className="col-span-2 text-sm">
            <div>{team.wins}-{team.losses}-{team.otLosses}</div>
            <div className="text-xs text-muted-foreground">
              {team.homeRecord.wins}-{team.homeRecord.losses}-{team.homeRecord.ot} / {team.awayRecord.wins}-{team.awayRecord.losses}-{team.awayRecord.ot}
            </div>
          </div>
          
          <div className="col-span-1">
            <span className="font-semibold">{team.points}</span>
          </div>
          
          <div className="col-span-1 text-sm">{team.goalsFor}</div>
          <div className="col-span-1 text-sm">{team.goalsAgainst}</div>
          
          <div className="col-span-1">
            <span className={`text-sm ${team.goalDifferential > 0 ? 'text-green-600' : team.goalDifferential < 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {team.goalDifferential > 0 ? '+' : ''}{team.goalDifferential}
            </span>
          </div>
          
          <div className="col-span-2 text-sm">
            <div>{team.lastTenRecord.wins}-{team.lastTenRecord.losses}-{team.lastTenRecord.ot}</div>
            <div className="text-xs text-muted-foreground">
              PP: {(team.powerPlayPercentage * 100).toFixed(1)}% | PK: {(team.penaltyKillPercentage * 100).toFixed(1)}%
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overall" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overall">League</TabsTrigger>
          <TabsTrigger value="eastern">Eastern</TabsTrigger>
          <TabsTrigger value="western">Western</TabsTrigger>
          <TabsTrigger value="divisions">Divisions</TabsTrigger>
        </TabsList>

        <TabsContent value="overall" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">NHL Standings</h3>
            <StandingsTable teams={standings.slice(0, 16)} />
            
            {standings.length > 16 && (
              <>
                <div className="my-4 border-t"></div>
                <StandingsTable teams={standings.slice(16)} showRank={false} />
              </>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="eastern" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Eastern Conference</h3>
            <StandingsTable teams={getConferenceStandings(true)} />
          </Card>
        </TabsContent>

        <TabsContent value="western" className="mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Western Conference</h3>
            <StandingsTable teams={getConferenceStandings(false)} />
          </Card>
        </TabsContent>

        <TabsContent value="divisions" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Atlantic Division</h3>
              <StandingsTable teams={getDivisionStandings(divisions.atlantic)} />
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Metropolitan Division</h3>
              <StandingsTable teams={getDivisionStandings(divisions.metropolitan)} />
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Central Division</h3>
              <StandingsTable teams={getDivisionStandings(divisions.central)} />
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Pacific Division</h3>
              <StandingsTable teams={getDivisionStandings(divisions.pacific)} />
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedLeagueStandings;