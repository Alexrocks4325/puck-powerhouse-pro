import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Player Images
import connorMcDavidImg from "@/assets/players/connor-mcdavid.jpg";
import nathanMacKinnonImg from "@/assets/players/nathan-mackinnon.jpg";
import caleMakarImg from "@/assets/players/cale-makar.jpg";
import igorShesterkinImg from "@/assets/players/igor-shesterkin.jpg";
import leonDraisaitlImg from "@/assets/players/leon-draisaitl.jpg";
import defaultPlayerImg from "@/assets/players/default-player.jpg";

// Team Logos
import bruinsLogo from "@/assets/teams/boston-bruins.png";
import oilersLogo from "@/assets/teams/edmonton-oilers.png";
import avalancheLogo from "@/assets/teams/colorado-avalanche.png";

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
  // Generate all 32 NHL teams with realistic standings by division
  const generateTeamStandings = () => {
    const easternConference = {
      atlantic: [
        'Boston Bruins', 'Toronto Maple Leafs', 'Tampa Bay Lightning', 'Florida Panthers',
        'Buffalo Sabres', 'Ottawa Senators', 'Detroit Red Wings', 'Montreal Canadiens'
      ],
      metropolitan: [
        'New York Rangers', 'New Jersey Devils', 'Carolina Hurricanes', 'New York Islanders',
        'Washington Capitals', 'Pittsburgh Penguins', 'Philadelphia Flyers', 'Columbus Blue Jackets'
      ]
    };
    
    const westernConference = {
      central: [
        'Colorado Avalanche', 'Dallas Stars', 'Minnesota Wild', 'Winnipeg Jets',
        'Nashville Predators', 'St. Louis Blues', 'Arizona Coyotes', 'Chicago Blackhawks'
      ],
      pacific: [
        'Vegas Golden Knights', 'Edmonton Oilers', 'Los Angeles Kings', 'Seattle Kraken',
        'Vancouver Canucks', 'Calgary Flames', 'Anaheim Ducks', 'San Jose Sharks'
      ]
    };

    const allTeams = [
      ...easternConference.atlantic,
      ...easternConference.metropolitan,
      ...westernConference.central,
      ...westernConference.pacific
    ];

    const standings = allTeams.map((team, index) => {
      const gamesPlayed = Math.min(currentGame, 82);
      const teamStrength = 0.7 - (index * 0.02) + (Math.random() * 0.15);
      const winRate = Math.max(0.25, Math.min(0.85, teamStrength));
      const wins = Math.floor(gamesPlayed * winRate);
      const otLosses = Math.floor((gamesPlayed - wins) * 0.2);
      const losses = gamesPlayed - wins - otLosses;
      const points = wins * 2 + otLosses;
      
      // Determine division and conference
      let division = '';
      let conference = '';
      if (easternConference.atlantic.includes(team)) {
        division = 'Atlantic';
        conference = 'Eastern';
      } else if (easternConference.metropolitan.includes(team)) {
        division = 'Metropolitan';
        conference = 'Eastern';
      } else if (westernConference.central.includes(team)) {
        division = 'Central';
        conference = 'Western';
      } else {
        division = 'Pacific';
        conference = 'Western';
      }
      
      return {
        rank: index + 1,
        team,
        wins,
        losses,
        otLosses,
        points,
        gf: gamesPlayed > 0 ? Math.floor(wins * 3.2 + losses * 2.1 + otLosses * 2.8 + Math.random() * 10) : 0,
        ga: gamesPlayed > 0 ? Math.floor(wins * 2.1 + losses * 3.2 + otLosses * 2.9 + Math.random() * 10) : 0,
        gp: gamesPlayed,
        division,
        conference,
        isMyTeam: team === 'Your Team' // Highlight user's team
      };
    }).sort((a, b) => b.points - a.points).map((team, index) => ({
      ...team,
      rank: index + 1
    }));

    return {
      overall: standings,
      eastern: standings.filter(team => team.conference === 'Eastern').sort((a, b) => b.points - a.points),
      western: standings.filter(team => team.conference === 'Western').sort((a, b) => b.points - a.points),
      atlantic: standings.filter(team => team.division === 'Atlantic').sort((a, b) => b.points - a.points),
      metropolitan: standings.filter(team => team.division === 'Metropolitan').sort((a, b) => b.points - a.points),
      central: standings.filter(team => team.division === 'Central').sort((a, b) => b.points - a.points),
      pacific: standings.filter(team => team.division === 'Pacific').sort((a, b) => b.points - a.points)
    };
  };

  // Player image mapping
  const getPlayerImage = (playerName: string) => {
    switch (playerName) {
      case "Connor McDavid":
        return connorMcDavidImg;
      case "Nathan MacKinnon":
        return nathanMacKinnonImg;
      case "Leon Draisaitl":
        return leonDraisaitlImg;
      case "Cale Makar":
        return caleMakarImg;
      case "Igor Shesterkin":
        return igorShesterkinImg;
      default:
        return defaultPlayerImg;
    }
  };

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
      { name: "Mats Zuccarello", team: "MIN", position: "RW" },
      { name: "Johnny Gaudreau", team: "CBJ", position: "LW" },
      { name: "Cale Makar", team: "COL", position: "D" },
      { name: "Roman Josi", team: "NSH", position: "D" },
      { name: "Elias Pettersson", team: "VAN", position: "C" },
      { name: "Sebastian Aho", team: "CAR", position: "C" },
      { name: "Mitch Marner", team: "TOR", position: "RW" },
      { name: "Brad Marchand", team: "BOS", position: "LW" },
      { name: "Jonathan Huberdeau", team: "CGY", position: "LW" },
      { name: "Kyle Connor", team: "WPG", position: "LW" },
      { name: "Jack Hughes", team: "NJD", position: "C" },
      { name: "William Nylander", team: "TOR", position: "RW" },
      { name: "Kirill Kaprizov", team: "MIN", position: "LW" },
      { name: "Sidney Crosby", team: "PIT", position: "C" },
      { name: "Alex Ovechkin", team: "WSH", position: "LW" },
      { name: "Nikita Kucherov", team: "TBL", position: "RW" },
      { name: "Alex DeBrincat", team: "DET", position: "RW" },
      { name: "Tim Stutzle", team: "OTT", position: "C" },
      { name: "Josh Morrissey", team: "WPG", position: "D" },
      { name: "Quinn Hughes", team: "VAN", position: "D" },
      { name: "Adam Fox", team: "NYR", position: "D" },
      { name: "Dougie Hamilton", team: "NJD", position: "D" }
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
      { name: "Juuse Saros", team: "NSH" },
      { name: "Jeremy Swayman", team: "BOS" },
      { name: "Alexandar Georgiev", team: "COL" },
      { name: "Sergei Bobrovsky", team: "FLA" },
      { name: "Thatcher Demko", team: "VAN" },
      { name: "Jordan Binnington", team: "STL" },
      { name: "Jake Oettinger", team: "DAL" },
      { name: "Filip Gustavsson", team: "MIN" },
      { name: "Stuart Skinner", team: "EDM" },
      { name: "Jonathan Quick", team: "NYR" },
      { name: "John Gibson", team: "ANA" },
      { name: "Carter Hart", team: "PHI" },
      { name: "Tristan Jarry", team: "PIT" },
      { name: "Elvis Merzlikins", team: "CBJ" },
      { name: "Cam Talbot", team: "DET" },
      { name: "Logan Thompson", team: "VGK" },
      { name: "Philipp Grubauer", team: "SEA" },
      { name: "Vitek Vanecek", team: "NJD" },
      { name: "Spencer Knight", team: "FLA" },
      { name: "Samuel Montembeault", team: "MTL" },
      { name: "Ukko-Pekka Luukkonen", team: "BUF" },
      { name: "Anton Forsberg", team: "OTT" },
      { name: "Pyotr Kochetkov", team: "CAR" }
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
  const teamStandings = generateTeamStandings();

  return (
    <Card className="p-6 nhl-gradient-bg border-primary/30">
      <h3 className="text-xl font-bold text-foreground mb-4">League Leaders</h3>
      
      <Tabs defaultValue="standings" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="standings">Standings</TabsTrigger>
          <TabsTrigger value="skaters">Skaters</TabsTrigger>
          <TabsTrigger value="goalies">Goalies</TabsTrigger>
        </TabsList>
        
        <TabsContent value="standings">
          <Tabs defaultValue="overall" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-4">
              <TabsTrigger value="overall">Overall</TabsTrigger>
              <TabsTrigger value="eastern">Eastern</TabsTrigger>
              <TabsTrigger value="western">Western</TabsTrigger>
              <TabsTrigger value="atlantic">Atlantic</TabsTrigger>
              <TabsTrigger value="metropolitan">Metro</TabsTrigger>
              <TabsTrigger value="central">Central</TabsTrigger>
              <TabsTrigger value="pacific">Pacific</TabsTrigger>
            </TabsList>
            
            {(['overall', 'eastern', 'western', 'atlantic', 'metropolitan', 'central', 'pacific'] as const).map((division) => (
              <TabsContent key={division} value={division}>
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-7 gap-2 text-xs font-semibold text-muted-foreground border-b pb-2 sticky top-0 bg-background">
                    <span>Rank</span>
                    <span>Team</span>
                    <span>GP</span>
                    <span>W-L-OT</span>
                    <span>PTS</span>
                    <span>GF-GA</span>
                    <span>DIFF</span>
                  </div>
                  {teamStandings[division].map((team, index) => (
                    <div key={team.rank} className={`grid grid-cols-7 gap-2 text-sm p-2 rounded hover:bg-primary/10 ${team.isMyTeam ? 'bg-hockey-red/20 border border-hockey-red/50' : 'bg-muted/20'}`}>
                      <span className="text-xs font-semibold">{division === 'overall' ? team.rank : index + 1}</span>
                      <span className="font-medium truncate">{team.team}</span>
                      <span>{team.gp}</span>
                      <span>{team.wins}-{team.losses}-{team.otLosses}</span>
                      <span className="font-semibold text-gold">{team.points}</span>
                      <span className="text-muted-foreground">{team.gf}-{team.ga}</span>
                      <span className={`font-medium ${(team.gf - team.ga) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {team.gf - team.ga > 0 ? '+' : ''}{team.gf - team.ga}
                      </span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>
        
        <TabsContent value="skaters">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-7 gap-2 text-xs font-semibold text-muted-foreground border-b pb-2 sticky top-0 bg-background">
              <span>Rank</span>
              <span>Player</span>
              <span>Team</span>
              <span>G</span>
              <span>A</span>
              <span>PTS</span>
              <span>GP</span>
            </div>
            {playerStats.slice(0, 30).map((player, index) => (
              <div key={player.name} className="grid grid-cols-7 gap-2 text-sm py-2 hover:bg-primary/10 rounded">
                <div className="flex items-center justify-center">
                  <Badge variant="outline" className="w-6 h-6 p-0 text-xs">{index + 1}</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={getPlayerImage(player.name)} alt={player.name} />
                    <AvatarFallback className="text-xs">{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium text-xs truncate">{player.name}</span>
                    <span className="text-xs text-muted-foreground">{player.position}</span>
                  </div>
                </div>
                <span className="text-muted-foreground text-xs">{player.team}</span>
                <span className="font-medium">{player.stats.goals}</span>
                <span className="font-medium">{player.stats.assists}</span>
                <span className="font-bold text-gold">{player.stats.points}</span>
                <span className="text-muted-foreground">{player.stats.games}</span>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="goalies">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-7 gap-2 text-xs font-semibold text-muted-foreground border-b pb-2 sticky top-0 bg-background">
              <span>Rank</span>
              <span>Goalie</span>
              <span>Team</span>
              <span>W</span>
              <span>SV%</span>
              <span>GAA</span>
              <span>SO</span>
            </div>
            {goalieStats.slice(0, 30).map((goalie, index) => (
              <div key={goalie.name} className="grid grid-cols-7 gap-2 text-sm py-2 hover:bg-primary/10 rounded">
                <div className="flex items-center justify-center">
                  <Badge variant="outline" className="w-6 h-6 p-0 text-xs">{index + 1}</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={getPlayerImage(goalie.name)} alt={goalie.name} />
                    <AvatarFallback className="text-xs">{goalie.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-xs truncate">{goalie.name}</span>
                </div>
                <span className="text-muted-foreground text-xs">{goalie.team}</span>
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