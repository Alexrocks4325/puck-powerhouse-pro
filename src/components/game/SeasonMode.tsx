import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GameHeader from "./GameHeader";
import { Trophy, Star, Coins, Calendar, Play, Crown, Target, Zap } from "lucide-react";
import GameSetup from "@/components/season/GameSetup";
import ResultModal from "@/components/season/ResultModal";
import { useToast } from "@/hooks/use-toast";
interface SeasonModeProps {
  playerData: {
    coins: number;
    level: number;
    team: any[];
    packs: number;
  };
  setPlayerData: (data: any) => void;
  onNavigate: (screen: 'menu' | 'tutorial' | 'packs' | 'team' | 'season' | 'tasks' | 'leagues') => void;
}

const SeasonMode = ({ playerData, setPlayerData, onNavigate }: SeasonModeProps) => {
  const [seasonProgress, setSeasonProgress] = useState(65); // 65% through season
  const [playoffProgress, setPlayoffProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMode, setCurrentMode] = useState<'season' | 'playoffs'>('season');
  const [stanleyCupWins, setStanleyCupWins] = useState(0);
  const [view, setView] = useState<'hub' | 'setup' | 'live'>("hub");
  const [selectedOpponent, setSelectedOpponent] = useState<any | null>(null);
  const [resultData, setResultData] = useState<any | null>(null);
  const { toast } = useToast();
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

  // Season teams with dynamic difficulty based on team strength - Updated to match new player database
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
  const playoffTeams = [
    { name: "Conference Quarterfinals", round: 1, opponents: ["Tampa Bay Lightning", "Boston Bruins", "Toronto Maple Leafs"] },
    { name: "Conference Semifinals", round: 2, opponents: ["Carolina Hurricanes", "New York Rangers"] },
    { name: "Conference Finals", round: 3, opponents: ["Florida Panthers"] },
    { name: "Stanley Cup Finals", round: 4, opponents: ["Colorado Avalanche"] }
  ];

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

    // Build lightweight result for modal
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

    setResultData({
      opponentName: teamName,
      isWin,
      scoreHome: yourGoals,
      scoreAway: oppGoals,
      teamA,
      teamB
    });

    if (isPlayoff && playoffProgress >= 75 && isWin) {
      setStanleyCupWins(prev => prev + 1);
      setPlayerData(prev => ({ ...prev, coins: prev.coins + 2000, packs: prev.packs + 5 }));
      toast({ title: "Stanley Cup Champions!", description: "Bonus 2000 coins + 5 packs awarded." });
    }
  }, 1200);
};

  return (
    <div className="min-h-screen ice-surface">
      <GameHeader 
        playerData={playerData}
        showBackButton 
        onBack={() => onNavigate('team')}
        title="Season & Playoffs"
      />
      <div className="container mx-auto px-4 pt-20 pb-8">{/* Main content */}
  {view === 'hub' ? (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground">Season Mode</h1>
        <p className="text-xl text-muted-foreground">Compete for the Stanley Cup with dynamic difficulty</p>
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
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="season">Regular Season</TabsTrigger>
          <TabsTrigger value="playoffs" disabled={seasonProgress < 80}>
            Stanley Cup Playoffs {seasonProgress < 80 && <Badge className="ml-2">Locked</Badge>}
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
                .slice(Math.floor(seasonProgress / (100 / seasonTeams.length)), Math.floor(seasonProgress / (100 / seasonTeams.length)) + 5)
                .map((team, index) => {
                  const gameIndex = Math.floor(seasonProgress / (100 / seasonTeams.length)) + index;
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
                const isUnlocked = playoffProgress >= (index * 25);
                const isCurrentRound = Math.floor(playoffProgress / 25) === index;
                return (
                  <div key={round.round} className={`p-4 rounded-lg border ${isCurrentRound ? 'bg-gold/10 border-gold/30' : isUnlocked ? 'bg-green-500/10 border-green-500/30' : 'bg-muted/10 border-muted/30 opacity-60'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-foreground">{round.name}</h4>
                        <p className="text-sm text-muted-foreground">Round {round.round}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        {isCurrentRound && (
                          <Button onClick={() => simulateGame(90 + (round.round * 2), round.opponents[0], true)} disabled={isPlaying} className="btn-gold">
                            {isPlaying ? (<><div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" /> Playing...</>) : (<><Trophy className="w-4 h-4 mr-2" /> Play Round</>)}
                          </Button>
                        )}
                        {playoffProgress > (index * 25) && (<Badge variant="outline" className="text-green-500 border-green-500">✓ Complete</Badge>)}
                        {!isUnlocked && (<Badge variant="secondary">Locked</Badge>)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rewards Section */}
      <Card className="game-card p-6 mt-8">
        <h4 className="text-lg font-bold text-gold mb-4">Season Rewards</h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2"><Coins className="w-4 h-4 text-gold" /><span>Regular Season: 120-400 coins per win</span></div>
          <div className="flex items-center space-x-2"><Trophy className="w-4 h-4 text-purple-500" /><span>Playoffs: 200-600 coins per win</span></div>
          <div className="flex items-center space-x-2"><Crown className="w-4 h-4 text-gold" /><span>Stanley Cup: 2000 coins + 5 packs</span></div>
        </div>
        <div className="mt-4 p-3 bg-primary/10 rounded-lg">
          <p className="text-xs text-muted-foreground">💡 <strong>Tip:</strong> Difficulty scales with your team strength. Improve your lineup and chemistry for better rewards!</p>
        </div>
      </Card>
    </>
  ) : (
    <GameSetup
      roster={playerData.team}
      opponent={selectedOpponent}
      onBack={() => setView('hub')}
      onSimulateFull={(_opts) => {
        if (!selectedOpponent) return;
        simulateGame(selectedOpponent.difficulty, selectedOpponent.name, currentMode === 'playoffs');
        setView('hub');
      }}
    />
  )}

  <ResultModal open={!!resultData} onOpenChange={(o) => !o && setResultData(null)} data={resultData} />
</div>
    </div>
  );
};

export default SeasonMode;