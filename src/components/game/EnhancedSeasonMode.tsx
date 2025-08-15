import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import GameHeader from "./GameHeader";
import { Trophy, Star, Coins, Calendar, Play, Crown, Target, Zap, TrendingUp, Users, Award, BarChart3 } from "lucide-react";
import { globalLeague } from "@/utils/leagueSimulation";
import { useToast } from "@/hooks/use-toast";
import LeagueScoreboard from "@/components/league/LeagueScoreboard";
import EnhancedLeagueStandings from "@/components/league/EnhancedLeagueStandings";
import PlayerLeaderboards from "@/components/league/PlayerLeaderboards";
import TeamComparison from "@/components/league/TeamComparison";
import GameSetup from "@/components/season/GameSetup";
import ResultModal from "@/components/season/ResultModal";

interface EnhancedSeasonModeProps {
  playerData: {
    coins: number;
    level: number;
    team: any[];
    packs: number;
  };
  setPlayerData: (data: any) => void;
  onNavigate: (screen: 'menu' | 'tutorial' | 'packs' | 'team' | 'season' | 'tasks' | 'leagues') => void;
}

export default function EnhancedSeasonMode({ playerData, setPlayerData, onNavigate }: EnhancedSeasonModeProps) {
  const [seasonProgress, setSeasonProgress] = useState(0);
  const [playoffProgress, setPlayoffProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMode, setCurrentMode] = useState<'season' | 'playoffs'>('season');
  const [stanleyCupWins, setStanleyCupWins] = useState(0);
  const [view, setView] = useState<'hub' | 'setup' | 'live'>("hub");
  const [selectedOpponent, setSelectedOpponent] = useState<any | null>(null);
  const [resultData, setResultData] = useState<any | null>(null);
  const { toast } = useToast();

  const [leagueData, setLeagueData] = useState({
    standings: globalLeague.getStandings(),
    leaders: globalLeague.getLeagueLeaders(),
    recentGames: globalLeague.getRecentGames(10),
    todaysGames: globalLeague.simulateGameDay(6)
  });

  // Simulate league games periodically
  const simulateLeagueGames = (count: number) => {
    const newGames = globalLeague.simulateGameDay(count);
    setLeagueData({
      standings: globalLeague.getStandings(),
      leaders: globalLeague.getLeagueLeaders(),
      recentGames: globalLeague.getRecentGames(10),
      todaysGames: newGames
    });
  };

  // Calculate team strength for dynamic difficulty
  const calculateTeamStrength = () => {
    if (playerData.team.length === 0) return 75;
    
    const averageOverall = playerData.team.reduce((sum, player) => sum + player.overall, 0) / playerData.team.length;
    
    // Factor in team chemistry
    const teamGroups: Record<string, number> = {};
    const chemistryTypes: Record<string, number> = {};
    
    playerData.team.forEach(player => {
      teamGroups[player.team] = (teamGroups[player.team] || 0) + 1;
      if (player.chemistry) {
        player.chemistry.forEach((chem: string) => {
          chemistryTypes[chem] = (chemistryTypes[chem] || 0) + 1;
        });
      }
    });
    
    let chemistryBonus = 0;
    Object.values(teamGroups).forEach((count: number) => {
      if (count >= 2) chemistryBonus += count;
    });
    Object.values(chemistryTypes).forEach((count: number) => {
      if (count >= 2) chemistryBonus += count * 0.5;
    });
    
    return Math.min(99, averageOverall + chemistryBonus);
  };

  const teamStrength = calculateTeamStrength();

  // Season teams with dynamic difficulty based on team strength
  const getSeasonTeams = () => {
    const baseTeams = [
      // Eastern Conference - Atlantic Division
      { name: "Florida Panthers", abbreviation: "FLA", baseDifficulty: 88 },
      { name: "Tampa Bay Lightning", abbreviation: "TBL", baseDifficulty: 87 },
      { name: "Toronto Maple Leafs", abbreviation: "TOR", baseDifficulty: 86 },
      { name: "Boston Bruins", abbreviation: "BOS", baseDifficulty: 85 },
      { name: "Ottawa Senators", abbreviation: "OTT", baseDifficulty: 78 },
      { name: "Detroit Red Wings", abbreviation: "DET", baseDifficulty: 77 },
      { name: "Buffalo Sabres", abbreviation: "BUF", baseDifficulty: 76 },
      { name: "Montreal Canadiens", abbreviation: "MTL", baseDifficulty: 74 },
      
      // Eastern Conference - Metropolitan Division
      { name: "Carolina Hurricanes", abbreviation: "CAR", baseDifficulty: 84 },
      { name: "New York Rangers", abbreviation: "NYR", baseDifficulty: 83 },
      { name: "New Jersey Devils", abbreviation: "NJD", baseDifficulty: 82 },
      { name: "Washington Capitals", abbreviation: "WSH", baseDifficulty: 81 },
      { name: "Pittsburgh Penguins", abbreviation: "PIT", baseDifficulty: 80 },
      { name: "Philadelphia Flyers", abbreviation: "PHI", baseDifficulty: 79 },
      { name: "New York Islanders", abbreviation: "NYI", baseDifficulty: 78 },
      { name: "Columbus Blue Jackets", abbreviation: "CBJ", baseDifficulty: 73 },
      
      // Western Conference - Central Division
      { name: "Winnipeg Jets", abbreviation: "WPG", baseDifficulty: 86 },
      { name: "Colorado Avalanche", abbreviation: "COL", baseDifficulty: 85 },
      { name: "Dallas Stars", abbreviation: "DAL", baseDifficulty: 84 },
      { name: "Nashville Predators", abbreviation: "NSH", baseDifficulty: 82 },
      { name: "Minnesota Wild", abbreviation: "MIN", baseDifficulty: 80 },
      { name: "St. Louis Blues", abbreviation: "STL", baseDifficulty: 78 },
      { name: "Utah Mammoths", abbreviation: "UTA", baseDifficulty: 76 },
      { name: "Chicago Blackhawks", abbreviation: "CHI", baseDifficulty: 72 },
      
      // Western Conference - Pacific Division
      { name: "Vegas Golden Knights", abbreviation: "VGK", baseDifficulty: 87 },
      { name: "Edmonton Oilers", abbreviation: "EDM", baseDifficulty: 86 },
      { name: "Los Angeles Kings", abbreviation: "LAK", baseDifficulty: 83 },
      { name: "Vancouver Canucks", abbreviation: "VAN", baseDifficulty: 82 },
      { name: "Calgary Flames", abbreviation: "CGY", baseDifficulty: 79 },
      { name: "Seattle Kraken", abbreviation: "SEA", baseDifficulty: 78 },
      { name: "Anaheim Ducks", abbreviation: "ANA", baseDifficulty: 75 },
      { name: "San Jose Sharks", abbreviation: "SJS", baseDifficulty: 71 }
    ];

    // Adjust difficulty based on team strength
    return baseTeams.map(team => ({
      ...team,
      difficulty: Math.max(70, Math.min(95, team.baseDifficulty + (teamStrength - 80) * 0.3))
    }));
  };

  const seasonTeams = getSeasonTeams();
  const nextIndex = Math.floor(seasonProgress / (100 / seasonTeams.length));
  const nextOpponent = seasonTeams[nextIndex];
  const playoffTeams = [
    { name: "Conference Quarterfinals", round: 1, opponents: ["Tampa Bay Lightning", "Boston Bruins", "Toronto Maple Leafs"] },
    { name: "Conference Semifinals", round: 2, opponents: ["Carolina Hurricanes", "New York Rangers"] },
    { name: "Conference Finals", round: 3, opponents: ["Florida Panthers"] },
    { name: "Stanley Cup Finals", round: 4, opponents: ["Colorado Avalanche"] }
  ];

  const simulatePlayoffGame = (opponent: any) => {
    setIsPlaying(true);
    setTimeout(() => {
      const strengthDiff = teamStrength - 90; // Playoff difficulty
      const baseWinChance = 0.5 + (strengthDiff * 0.015);
      const winChance = Math.max(0.15, Math.min(0.85, baseWinChance));
      const isWin = Math.random() < winChance;

      const coinsEarned = 300 + Math.floor(90 / 3) + (isWin ? 300 : 0);
      const packReward = isWin && Math.random() < 0.5 ? 1 : 0;

      setPlayerData(prev => ({
        ...prev,
        coins: prev.coins + coinsEarned,
        packs: prev.packs + packReward
      }));

      setPlayoffProgress(prev => Math.min(100, prev + 25));
      setIsPlaying(false);

      if (playoffProgress >= 75 && isWin) {
        setStanleyCupWins(prev => prev + 1);
        setPlayerData(prev => ({ ...prev, coins: prev.coins + 2000, packs: prev.packs + 5 }));
        toast({ title: "Stanley Cup Champions!", description: "Bonus 2000 coins + 5 packs awarded." });
      }

      toast({
        title: isWin ? "Series Victory!" : "Series Defeat",
        description: `${isWin ? "Won" : "Lost"} vs ${opponent.name}. Earned ${coinsEarned} coins${packReward ? " + 1 pack" : ""}.`,
      });
    }, 2000);
  };

  const simulateGame = (opponentDifficulty: number, teamName: string, isPlayoff = false) => {
    setIsPlaying(true);
    setTimeout(() => {
      const strengthDiff = teamStrength - opponentDifficulty;
      const baseWinChance = 0.5 + (strengthDiff * 0.015);
      const winChance = Math.max(0.15, Math.min(0.85, baseWinChance));
      const isWin = Math.random() < winChance;

      const baseCoins = isPlayoff ? 200 : 120;
      const difficultyBonus = Math.floor(opponentDifficulty / 3);
      const winBonus = isWin ? (isPlayoff ? 200 : 120) : 0;
      const strengthBonus = Math.floor(teamStrength / 10);
      const randomBonus = Math.floor(Math.random() * (isPlayoff ? 100 : 50));
      const coinsEarned = baseCoins + difficultyBonus + winBonus + strengthBonus + randomBonus;

      let packReward = 0;
      if (isWin) {
        packReward = Math.random() < (isPlayoff ? 0.5 : 0.25) ? 1 : 0;
      }

      setPlayerData(prev => ({
        ...prev,
        coins: prev.coins + coinsEarned,
        packs: prev.packs + packReward
      }));

      if (currentMode === 'season') {
        setSeasonProgress(prev => Math.min(100, prev + (100 / seasonTeams.length)));
      } else {
        setPlayoffProgress(prev => Math.min(100, prev + 25));
      }

      setIsPlaying(false);

      // Build detailed result for modal + box score
      const yourGoals = Math.max(1, Math.round(2 + Math.random() * 3) + (isWin ? 1 : 0));
      const oppGoals = Math.max(0, yourGoals - (isWin ? Math.round(1 + Math.random() * 2) : -Math.round(Math.random() * 2)));
      const makeTeamStats = () => ({
        goals: 0,
        sog: 20 + Math.round(Math.random() * 20),
        hits: 10 + Math.round(Math.random() * 20),
        pp: `${Math.round(Math.random()*2)}/${1+Math.round(Math.random()*3)}`,
        foPct: 40 + Math.random() * 20
      });
      const teamA = makeTeamStats();
      const teamB = makeTeamStats();
      teamA.goals = yourGoals;
      teamB.goals = oppGoals;

      // Build detailed per-player box score
      const roster = playerData.team || [];
      const skatersA = roster.filter((p:any) => p.position !== 'G').slice().sort((a:any,b:any)=> (b.overall??0)-(a.overall??0)).slice(0,12)
        .map((p:any) => ({ id: p.id, name: p.name, position: p.position || 'F', g: 0, a: 0, sog: 1 + Math.round(Math.random()*4), hits: Math.round(Math.random()*3), toi: 10 + Math.round(Math.random()*10) }));
      // distribute goals and assists
      for (let i=0;i<yourGoals;i++) {
        if (skatersA.length) {
          const sIdx = Math.floor(Math.random()*skatersA.length);
          skatersA[sIdx].g += 1;
          const assistPool = skatersA.filter((_,idx)=> idx !== sIdx);
          if (assistPool.length) assistPool[Math.floor(Math.random()*assistPool.length)].a += 1;
          if (Math.random() < 0.5 && assistPool.length > 1) assistPool[Math.floor(Math.random()*assistPool.length)].a += 1;
        }
      }

      const goalieAPlayer = roster.filter((p:any)=> p.position === 'G').slice().sort((a:any,b:any)=> (b.overall??0)-(a.overall??0))[0];
      const goalieA = { name: goalieAPlayer?.name || 'Your Goalie', sa: teamB.sog, ga: oppGoals, sv: Math.max(0, teamB.sog - oppGoals), svPct: teamB.sog ? ((teamB.sog - oppGoals) / teamB.sog) * 100 : 100 };

      // Opponent mock skaters
      const abbr = (selectedOpponent?.abbreviation || (teamName.split(' ').map(w=>w[0]).join('').toUpperCase()) || 'OPP');
      const skatersB = Array.from({length:12}).map((_,i)=> ({ name: `${abbr} P${i+1}`, position: i%6<3 ? 'F' : 'D', g: 0, a: 0, sog: 1 + Math.round(Math.random()*4), hits: Math.round(Math.random()*3), toi: 10 + Math.round(Math.random()*10) }));
      for (let i=0;i<oppGoals;i++) {
        if (skatersB.length) {
          const sIdx = Math.floor(Math.random()*skatersB.length);
          skatersB[sIdx].g += 1;
          const assistPool = skatersB.filter((_,idx)=> idx !== sIdx);
          if (assistPool.length) assistPool[Math.floor(Math.random()*assistPool.length)].a += 1;
          if (Math.random() < 0.5 && assistPool.length > 1) assistPool[Math.floor(Math.random()*assistPool.length)].a += 1;
        }
      }
      const goalieB = { name: `${abbr} G1`, sa: teamA.sog, ga: yourGoals, sv: Math.max(0, teamA.sog - yourGoals), svPct: teamA.sog ? ((teamA.sog - yourGoals) / teamA.sog) * 100 : 100 };

      setResultData({
        opponentName: teamName,
        isWin,
        scoreHome: yourGoals,
        scoreAway: oppGoals,
        teamA,
        teamB,
        skatersA,
        skatersB,
        goalies: { home: goalieA, away: goalieB }
      });

      // Update league stats with this game
      const gameResult = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        homeTeam: "Your Team",
        awayTeam: teamName,
        homeScore: yourGoals,
        awayScore: oppGoals,
        homeStats: { sog: teamA.sog, hits: teamA.hits, blocks: 10 + Math.floor(Math.random() * 15) },
        awayStats: { sog: teamB.sog, hits: teamB.hits, blocks: 8 + Math.floor(Math.random() * 12) },
        homeTopPerformer: { name: skatersA.find(p => p.g > 0)?.name || skatersA[0]?.name || "Player 1", points: Math.max(1, skatersA.reduce((max, p) => Math.max(max, p.g + p.a), 0)) },
        awayTopPerformer: { name: skatersB.find(p => p.g > 0)?.name || skatersB[0]?.name || "Opponent Player", points: Math.max(1, skatersB.reduce((max, p) => Math.max(max, p.g + p.a), 0)) },
        isCompleted: true,
        playerStats: [...skatersA.map(p => ({ ...p, id: p.id || 1, team: "Your Team" })), ...skatersB.map(p => ({ ...p, id: Math.random(), team: teamName }))],
        goalieStats: [
          { ...goalieA, team: "Your Team" },
          { ...goalieB, team: teamName }
        ]
      };

      // Skip league stats update for now - just update display data

      if (isPlayoff && playoffProgress >= 75 && isWin) {
        setStanleyCupWins(prev => prev + 1);
        setPlayerData(prev => ({ ...prev, coins: prev.coins + 2000, packs: prev.packs + 5 }));
        toast({ title: "Stanley Cup Champions!", description: "Bonus 2000 coins + 5 packs awarded." });
      }

      // Simulate other league games every few user games
      if (seasonProgress % 15 === 0) {
        simulateLeagueGames(5);
      }

      // Update league data after every game
      setLeagueData({
        standings: globalLeague.getStandings(),
        leaders: globalLeague.getLeagueLeaders(),
        recentGames: globalLeague.getRecentGames(10),
        todaysGames: leagueData.todaysGames
      });
    }, 1200);
  };

  // Get team comparison data
  const userTeam = leagueData.standings.find(team => team.team === "Your Team") || leagueData.standings[0];
  const leagueAverage = {
    points: leagueData.standings.reduce((sum, team) => sum + team.points, 0) / leagueData.standings.length,
    wins: leagueData.standings.reduce((sum, team) => sum + team.wins, 0) / leagueData.standings.length,
    goalsFor: leagueData.standings.reduce((sum, team) => sum + team.goalsFor, 0) / leagueData.standings.length,
    goalsAgainst: leagueData.standings.reduce((sum, team) => sum + team.goalsAgainst, 0) / leagueData.standings.length,
    powerPlayPercentage: leagueData.standings.reduce((sum, team) => sum + team.powerPlayPercentage, 0) / leagueData.standings.length,
    penaltyKillPercentage: leagueData.standings.reduce((sum, team) => sum + team.penaltyKillPercentage, 0) / leagueData.standings.length
  };

  const leagueRank = leagueData.standings.findIndex(team => team.team === "Your Team") + 1;

  return (
    <div className="min-h-screen ice-surface">
      <GameHeader 
        playerData={playerData}
        showBackButton 
        onBack={() => onNavigate('team')}
        title="Enhanced Season Mode"
      />
      
      <div className="container mx-auto px-4 pt-20 pb-8">
        {view === 'hub' ? (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground">Enhanced Season & Playoffs</h1>
              <p className="text-xl text-muted-foreground">Complete season with full league simulation and statistics</p>
            </div>

            <div className="flex justify-end mb-6">
              <Button
                className="btn-primary"
                disabled={!nextOpponent || isPlaying}
                onClick={() => {
                  if (!nextOpponent) return;
                  setSelectedOpponent(nextOpponent);
                  setView('setup');
                }}
              >
                <Play className="w-4 h-4 mr-2" /> Play Next Game
              </Button>
            </div>

            {/* Team Strength Overview */}
            <Card className="game-card p-6 mb-8">
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="w-6 h-6 text-primary mr-2" />
                    <span className="text-2xl font-bold text-primary">{Math.round(teamStrength)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Team Strength</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Trophy className="w-6 h-6 text-gold mr-2" />
                    <span className="text-2xl font-bold text-gold">{stanleyCupWins}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Stanley Cups</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Star className="w-6 h-6 text-ice-blue mr-2" />
                    <span className="text-2xl font-bold text-ice-blue">{Math.round(seasonProgress)}%</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Season Progress</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Crown className="w-6 h-6 text-purple-500 mr-2" />
                    <span className="text-2xl font-bold text-purple-500">{Math.round(playoffProgress)}%</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Playoff Progress</div>
                </div>
              </div>
            </Card>

            <Tabs value={currentMode} onValueChange={(value) => setCurrentMode(value as 'season' | 'playoffs')} className="w-full">
              <TabsList className="grid w-full grid-cols-6 mb-6">
                <TabsTrigger value="season">Season</TabsTrigger>
                <TabsTrigger value="playoffs" disabled={seasonProgress < 80}>
                  Playoffs {seasonProgress < 80 && <Badge className="ml-2">Locked</Badge>}
                </TabsTrigger>
                <TabsTrigger value="league-stats" onClick={() => setCurrentMode('season')}>
                  <Users className="w-4 h-4 mr-2" />League Stats
                </TabsTrigger>
                <TabsTrigger value="standings" onClick={() => setCurrentMode('season')}>
                  <BarChart3 className="w-4 h-4 mr-2" />Standings
                </TabsTrigger>
                <TabsTrigger value="scoreboard" onClick={() => setCurrentMode('season')}>
                  <Calendar className="w-4 h-4 mr-2" />Scoreboard
                </TabsTrigger>
                <TabsTrigger value="my-team" onClick={() => setCurrentMode('season')}>
                  <Target className="w-4 h-4 mr-2" />My Team
                </TabsTrigger>
              </TabsList>

              <TabsContent value="season" className="space-y-6">
                {/* Season Progress */}
                <Card className="game-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-foreground">Regular Season</h3>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-primary">
                        {Math.floor(seasonProgress / (100 / seasonTeams.length))} / {seasonTeams.length} Games
                      </div>
                    </div>
                  </div>
                  <Progress value={seasonProgress} className="h-3 mb-4" />
                  <p className="text-sm text-muted-foreground">Complete 80% of season games to unlock Stanley Cup Playoffs</p>
                </Card>

                {/* Game Schedule */}
                <Card className="game-card p-6">
                  <h3 className="text-2xl font-bold mb-6 text-foreground">Upcoming Games</h3>
                  <div className="grid gap-4">
                    {seasonTeams
                      .slice(nextIndex, nextIndex + 5)
                      .map((team, index) => {
                        const gameIndex = nextIndex + index;
                        const isNext = index === 0;
                        return (
                          <div key={team.abbreviation} className={`p-4 rounded-lg border transition-all ${isNext ? 'bg-primary/10 border-primary/30' : 'bg-muted/10 border-muted/30'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-3">
                                  <Calendar className="w-5 h-5 text-muted-foreground" />
                                  <span className="font-semibold text-foreground">Game {gameIndex + 1}</span>
                                </div>
                                <div className="text-lg font-bold text-foreground">vs {team.name}</div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="text-right">
                                  <div className="text-sm text-muted-foreground">Difficulty</div>
                                  <div className="font-semibold text-foreground">{Math.round(team.difficulty)}/100</div>
                                </div>
                                {isNext && (
                                  <Button onClick={() => { setSelectedOpponent(team); setView('setup'); }} disabled={isPlaying} className="btn-primary">
                                    <Play className="w-4 h-4 mr-2" /> Setup Game
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </Card>

                {/* Nested Tabs for League Features */}
                <Tabs defaultValue="league-stats" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="league-stats">League Stats</TabsTrigger>
                    <TabsTrigger value="standings">Standings</TabsTrigger>
                    <TabsTrigger value="scoreboard">Scoreboard</TabsTrigger>
                    <TabsTrigger value="my-team">My Team</TabsTrigger>
                  </TabsList>

                  <TabsContent value="league-stats" className="space-y-6">
                    <PlayerLeaderboards 
                      playerLeaders={leagueData.leaders.playerLeaders} 
                      goalieLeaders={leagueData.leaders.goalieLeaders} 
                    />
                  </TabsContent>

                  <TabsContent value="standings" className="space-y-6">
                    <EnhancedLeagueStandings standings={leagueData.standings} userTeam="Your Team" />
                  </TabsContent>

                  <TabsContent value="scoreboard" className="space-y-6">
                    <LeagueScoreboard 
                      recentGames={leagueData.recentGames} 
                      todaysGames={leagueData.todaysGames} 
                    />
                  </TabsContent>

                  <TabsContent value="my-team" className="space-y-6">
                    <TeamComparison
                      userTeam={userTeam}
                      leagueAverage={leagueAverage}
                      leagueRank={leagueRank}
                      totalTeams={leagueData.standings.length}
                    />
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="playoffs" className="space-y-6">
                {/* Stanley Cup Playoffs */}
                <Card className="game-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-foreground flex items-center">
                      <Crown className="w-8 h-8 mr-3 text-gold" /> Stanley Cup Playoffs
                    </h3>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gold">Round {Math.floor(playoffProgress / 25) + 1} of 4</div>
                    </div>
                  </div>
                  <Progress value={playoffProgress} className="h-4 mb-4" />
                  <p className="text-sm text-muted-foreground">Win 4 rounds to claim the Stanley Cup! Higher rewards and tougher competition.</p>
                </Card>

                {/* Playoff Bracket */}
                <Card className="game-card p-6">
                  <h3 className="text-2xl font-bold mb-6 text-foreground">Playoff Bracket</h3>
                  <div className="space-y-6">
                    {playoffTeams.map((round, index) => {
                      const isUnlocked = index <= Math.floor(playoffProgress / 25);
                      const isActive = index === Math.floor(playoffProgress / 25) && playoffProgress < 100;
                      const isCompleted = index < Math.floor(playoffProgress / 25);

                      return (
                        <div key={round.name} className={`p-4 rounded-lg border ${
                          isCompleted ? 'bg-primary/20 border-primary/50' : 
                          isActive ? 'bg-accent/10 border-accent/30' : 
                          'bg-muted/5 border-muted/20'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                isCompleted ? 'bg-primary text-primary-foreground' :
                                isActive ? 'bg-accent text-accent-foreground' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {isCompleted ? <Crown className="w-4 h-4" /> : round.round}
                              </div>
                              <div>
                                <div className="font-semibold text-foreground">{round.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  Round {round.round} of 4 • Best of 7 Series
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              {isActive && (
                                <Button
                                  onClick={() => { setSelectedOpponent(round); setView('setup'); }}
                                  disabled={isPlaying}
                                  className="btn-primary"
                                >
                                  <Play className="w-4 h-4 mr-2" /> Setup Series
                                </Button>
                              )}
                              {isCompleted && (
                                <Badge className="bg-primary/20 text-primary">Won</Badge>
                              )}
                              {!isUnlocked && (
                                <Badge variant="secondary">Locked</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : view === 'setup' ? (
          <GameSetup
            roster={playerData.team}
            opponent={selectedOpponent}
            onBack={() => setView('hub')}
            onSimulateFull={(opts) => {
              if (selectedOpponent) {
                const isPlayoffMode = currentMode === 'playoffs';
                simulateGame(selectedOpponent.difficulty || selectedOpponent.baseDifficulty, selectedOpponent.name, isPlayoffMode);
                setView('hub');
              }
            }}
          />
        ) : null}

        <ResultModal
          open={!!resultData}
          onOpenChange={(open) => !open && setResultData(null)}
          data={resultData}
        />
      </div>
    </div>
  );
}