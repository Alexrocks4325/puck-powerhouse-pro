import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GameHeader from "./GameHeader";
import StanleyCupAnimation from "./StanleyCupAnimation";
import { Trophy, Star, Coins, Calendar, Play, Crown, Target, Zap, ArrowLeft, BarChart3 } from "lucide-react";

interface EnhancedSeasonModeProps {
  playerData: {
    coins: number;
    level: number;
    team: any[];
    packs: number;
    playerStats?: any;
    seasonData?: any;
  };
  setPlayerData: (data: any) => void;
  onNavigate: (screen: 'menu' | 'tutorial' | 'packs' | 'team' | 'season' | 'tasks' | 'leagues') => void;
}

const EnhancedSeasonMode = ({ playerData, setPlayerData, onNavigate }: EnhancedSeasonModeProps) => {
  const [seasonProgress, setSeasonProgress] = useState(0);
  const [playoffProgress, setPlayoffProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMode, setCurrentMode] = useState<'season' | 'playoffs'>('season');
  const [stanleyCupWins, setStanleyCupWins] = useState(0);
  const [showStanleyCupAnimation, setShowStanleyCupAnimation] = useState(false);
  const [playoffSeries, setPlayoffSeries] = useState({ round: 1, wins: 0, losses: 0, games: [] });
  const [gameStats, setGameStats] = useState([]);

  // Calculate team strength for dynamic difficulty  
  const calculateTeamStrength = () => {
    if (playerData.team.length === 0) return 65; // Start lower

    const averageOverall = playerData.team.reduce((sum, player) => sum + player.overall, 0) / playerData.team.length;
    
    // Much harder team chemistry calculation
    const teamGroups: Record<string, number> = {};
    const playStyleGroups: Record<string, number> = {};
    
    playerData.team.forEach(player => {
      teamGroups[player.team] = (teamGroups[player.team] || 0) + 1;
      if (player.playStyle) {
        playStyleGroups[player.playStyle] = (playStyleGroups[player.playStyle] || 0) + 1;
      }
    });
    
    let chemistryBonus = 0;
    // Need 3+ players from same team for bonus
    Object.values(teamGroups).forEach((count: number) => {
      if (count >= 3) chemistryBonus += (count - 2) * 0.5;
    });
    
    // Need 4+ players with same play style
    Object.values(playStyleGroups).forEach((count: number) => {
      if (count >= 4) chemistryBonus += (count - 3) * 0.3;
    });
    
    return Math.min(85, Math.max(65, averageOverall + chemistryBonus)); // Cap at 85, min 65
  };

  const teamStrength = calculateTeamStrength();

  // Season teams with progressive difficulty
  const getSeasonTeams = () => {
    const baseTeams = [
      { name: "Montreal Canadiens", abbreviation: "MTL", baseDifficulty: 72 },
      { name: "Ottawa Senators", abbreviation: "OTT", baseDifficulty: 74 },
      { name: "Buffalo Sabres", abbreviation: "BUF", baseDifficulty: 76 },
      { name: "Detroit Red Wings", abbreviation: "DET", baseDifficulty: 77 },
      { name: "Columbus Blue Jackets", abbreviation: "CBJ", baseDifficulty: 78 },
      { name: "Philadelphia Flyers", abbreviation: "PHI", baseDifficulty: 79 },
      { name: "New York Islanders", abbreviation: "NYI", baseDifficulty: 81 },
      { name: "Washington Capitals", abbreviation: "WSH", baseDifficulty: 82 },
      { name: "New Jersey Devils", abbreviation: "NJD", baseDifficulty: 83 },
      { name: "Pittsburgh Penguins", abbreviation: "PIT", baseDifficulty: 84 },
      { name: "Carolina Hurricanes", abbreviation: "CAR", baseDifficulty: 85 },
      { name: "New York Rangers", abbreviation: "NYR", baseDifficulty: 86 },
      { name: "Florida Panthers", abbreviation: "FLA", baseDifficulty: 87 },
      { name: "Toronto Maple Leafs", abbreviation: "TOR", baseDifficulty: 88 },
      { name: "Boston Bruins", abbreviation: "BOS", baseDifficulty: 89 },
      { name: "Tampa Bay Lightning", abbreviation: "TBL", baseDifficulty: 90 }
    ];

    return baseTeams.map(team => ({
      ...team,
      difficulty: Math.max(70, Math.min(95, team.baseDifficulty + (teamStrength - 75) * 0.2))
    }));
  };

  const seasonTeams = getSeasonTeams();
  const playoffTeams = [
    { name: "Wild Card Round", round: 1, difficulty: 88 },
    { name: "Conference Quarterfinals", round: 2, difficulty: 90 },
    { name: "Conference Semifinals", round: 3, difficulty: 92 },
    { name: "Stanley Cup Finals", round: 4, difficulty: 95 }
  ];

  const simulatePlayoffGame = (opponent: any) => {
    setIsPlaying(true);
    
    setTimeout(() => {
      const strengthDiff = teamStrength - opponent.difficulty;
      const baseWinChance = 0.4 + (strengthDiff * 0.01); // Much harder
      const winChance = Math.max(0.1, Math.min(0.7, baseWinChance));
      const isWin = Math.random() < winChance;
      
      // Generate player stats
      const topPlayers = playerData.team.slice(0, 12); // Top 12 players
      const playerGameStats = topPlayers.map(player => ({
        ...player,
        goals: Math.floor(Math.random() * 3),
        assists: Math.floor(Math.random() * 4),
        hits: Math.floor(Math.random() * 8) + 1,
        saves: player.position === 'G' ? Math.floor(Math.random() * 30) + 15 : 0,
        goalsAgainst: player.position === 'G' ? Math.floor(Math.random() * 4) + 1 : 0
      }));

      setGameStats(prev => [...prev, {
        opponent: opponent.name,
        result: isWin ? 'W' : 'L',
        players: playerGameStats,
        date: new Date().toLocaleDateString()
      }]);

      if (isWin) {
        setPlayoffSeries(prev => ({ 
          ...prev, 
          wins: prev.wins + 1,
          games: [...prev.games, { result: 'W', opponent: opponent.name }]
        }));
        
        // Check if series won (4 wins)
        if (playoffSeries.wins + 1 >= 4) {
          if (opponent.round === 4) {
            // Stanley Cup won!
            setShowStanleyCupAnimation(true);
            setStanleyCupWins(prev => prev + 1);
            setPlayerData(prev => ({
              ...prev,
              coins: prev.coins + 5000,
              packs: prev.packs + 10
            }));
          } else {
            // Advance to next round
            setPlayoffProgress(prev => prev + 25);
            setPlayoffSeries({ round: opponent.round + 1, wins: 0, losses: 0, games: [] });
          }
        }
      } else {
        setPlayoffSeries(prev => ({ 
          ...prev, 
          losses: prev.losses + 1,
          games: [...prev.games, { result: 'L', opponent: opponent.name }]
        }));
        
        // Check if series lost (4 losses)
        if (playoffSeries.losses + 1 >= 4) {
          alert(`Series Lost! Better luck next season. You'll need to improve your team to advance further.`);
          setCurrentMode('season');
          setPlayoffProgress(0);
          setPlayoffSeries({ round: 1, wins: 0, losses: 0, games: [] });
        }
      }

      const coinsEarned = 150 + (opponent.difficulty * 2) + (isWin ? 200 : 50);
      setPlayerData(prev => ({
        ...prev,
        coins: prev.coins + coinsEarned
      }));

      setIsPlaying(false);
      
      const gameResult = `${isWin ? '🏆 WIN' : '💔 LOSS'} vs ${opponent.name}\n💰 Earned ${coinsEarned} coins\nSeries: ${playoffSeries.wins + (isWin ? 1 : 0)}-${playoffSeries.losses + (isWin ? 0 : 1)}`;
      alert(gameResult);
    }, 3000);
  };

  const simulateGame = (opponentDifficulty: number, teamName: string) => {
    setIsPlaying(true);
    
    setTimeout(() => {
      const strengthDiff = teamStrength - opponentDifficulty;
      const baseWinChance = 0.45 + (strengthDiff * 0.012); // Harder than before
      const winChance = Math.max(0.15, Math.min(0.75, baseWinChance));
      const isWin = Math.random() < winChance;
      
      const coinsEarned = 80 + Math.floor(opponentDifficulty / 2) + (isWin ? 80 : 20);
      let packReward = 0;
      
      if (isWin && Math.random() < 0.2) { // 20% chance for pack
        packReward = 1;
      }
      
      setPlayerData(prev => ({
        ...prev,
        coins: prev.coins + coinsEarned,
        packs: prev.packs + packReward
      }));
      
      setSeasonProgress(prev => Math.min(100, prev + (100 / seasonTeams.length)));
      setIsPlaying(false);
      
      const resultMessage = `${isWin ? '🏆 WIN' : '💔 LOSS'} vs ${teamName}\n💰 Earned ${coinsEarned} coins${packReward ? '\n🎁 Bonus pack!' : ''}`;
      alert(resultMessage);
    }, 3000);
  };

  return (
    <div className="min-h-screen ice-surface">
      {showStanleyCupAnimation && (
        <StanleyCupAnimation onClose={() => setShowStanleyCupAnimation(false)} />
      )}
      
      <GameHeader 
        playerData={playerData}
        showBackButton 
        onBack={() => onNavigate('team')}
        title="Season & Playoffs"
      />
      
      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="flex items-center mb-8">
          <Button 
            variant="outline" 
            onClick={() => onNavigate('team')}
            className="mr-4 border-primary text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Team HQ
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-foreground">Enhanced Season Mode</h1>
            <p className="text-xl text-muted-foreground">Compete for the Stanley Cup with best-of-7 playoffs</p>
          </div>
        </div>

        {/* Team Overview */}
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
              <div className="text-sm text-muted-foreground">Stanley Cups Won</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="w-6 h-6 text-ice-blue mr-2" />
                <span className="text-2xl font-bold text-ice-blue">{Math.round(seasonProgress)}%</span>
              </div>
              <div className="text-sm text-muted-foreground">Season Complete</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Crown className="w-6 h-6 text-purple-500 mr-2" />
                <span className="text-2xl font-bold text-purple-500">Round {playoffSeries.round}</span>
              </div>
              <div className="text-sm text-muted-foreground">Playoff Round</div>
            </div>
          </div>
        </Card>

        <Tabs value={currentMode} onValueChange={(value) => setCurrentMode(value as 'season' | 'playoffs')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="season">Regular Season</TabsTrigger>
            <TabsTrigger value="playoffs" disabled={seasonProgress < 75}>
              Stanley Cup Playoffs {seasonProgress < 75 && <Badge className="ml-2 text-xs">Locked</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="season" className="space-y-6">
            <Card className="game-card p-6">
              <h3 className="text-2xl font-bold mb-4 text-foreground">Regular Season Games</h3>
              <Progress value={seasonProgress} className="h-3 mb-4" />
              <p className="text-sm text-muted-foreground mb-6">
                Complete 75% of season to unlock playoffs. Games get progressively harder!
              </p>
              
              <div className="grid gap-4">
                {seasonTeams.slice(Math.floor(seasonProgress / (100 / seasonTeams.length)), Math.floor(seasonProgress / (100 / seasonTeams.length)) + 4).map((team, index) => {
                  const gameIndex = Math.floor(seasonProgress / (100 / seasonTeams.length)) + index;
                  const isNext = index === 0;
                  
                  return (
                    <div
                      key={team.abbreviation}
                      className={`p-4 rounded-lg border transition-all ${
                        isNext ? 'bg-primary/10 border-primary/30' : 'bg-muted/10 border-muted/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="font-semibold text-foreground">Game {gameIndex + 1}</span>
                          <div className="text-lg font-bold text-foreground">vs {team.name}</div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">Difficulty</div>
                            <div className="font-semibold text-foreground">{Math.round(team.difficulty)}</div>
                          </div>
                          
                          {isNext && (
                            <Button 
                              onClick={() => simulateGame(team.difficulty, team.name)}
                              disabled={isPlaying}
                              className="btn-primary"
                            >
                              {isPlaying ? "Playing..." : "Play Game"}
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
            <Card className="game-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-foreground flex items-center">
                  <Crown className="w-8 h-8 mr-3 text-gold" />
                  Stanley Cup Playoffs
                </h3>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Current Series</div>
                  <div className="text-lg font-semibold text-gold">{playoffSeries.wins}-{playoffSeries.losses}</div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-6">
                Best of 7 series! Win 4 games to advance. Lose 4 and you're eliminated!
              </p>

              {playoffTeams.filter(round => round.round === playoffSeries.round).map(round => (
                <div key={round.round} className="p-4 bg-gold/10 border border-gold/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-foreground">{round.name}</h4>
                      <p className="text-sm text-muted-foreground">Difficulty: {round.difficulty}</p>
                    </div>
                    
                    <Button 
                      onClick={() => simulatePlayoffGame(round)}
                      disabled={isPlaying || playoffSeries.wins >= 4 || playoffSeries.losses >= 4}
                      className="btn-gold"
                    >
                      {isPlaying ? "Playing..." : `Play Game ${playoffSeries.wins + playoffSeries.losses + 1}`}
                    </Button>
                  </div>
                </div>
              ))}

              {gameStats.length > 0 && (
                <Card className="game-card p-6 mt-6">
                  <h4 className="text-lg font-bold mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Recent Game Stats
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {gameStats.slice(-3).map((game, index) => (
                      <div key={index} className="text-sm p-2 bg-muted/20 rounded">
                        <div className="font-semibold">{game.result} vs {game.opponent}</div>
                        <div className="text-xs text-muted-foreground">
                          Top scorers: {game.players.filter(p => p.goals > 0).slice(0, 3).map(p => `${p.name} (${p.goals}G ${p.assists}A)`).join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedSeasonMode;