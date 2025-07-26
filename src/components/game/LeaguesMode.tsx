import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GameHeader from "./GameHeader";
import { Users, Trophy, Star, Coins, Crown, Sword, Shield, Target } from "lucide-react";

interface LeaguesModeProps {
  playerData: {
    coins: number;
    level: number;
    team: any[];
    packs: number;
  };
  setPlayerData: (data: any) => void;
  onNavigate: (screen: 'menu' | 'tutorial' | 'packs' | 'team' | 'season' | 'tasks' | 'leagues') => void;
}

const LeaguesMode = ({ playerData, setPlayerData, onNavigate }: LeaguesModeProps) => {
  const [currentLeague, setCurrentLeague] = useState('bronze');
  const [leaguePoints, setLeaguePoints] = useState(245);

  const leagues = [
    {
      id: 'bronze',
      name: 'Bronze League',
      icon: <Shield className="w-8 h-8 text-amber-600" />,
      minPoints: 0,
      maxPoints: 500,
      rewards: { coins: 100, packs: 1 },
      unlocked: true
    },
    {
      id: 'silver',
      name: 'Silver League',
      icon: <Shield className="w-8 h-8 text-gray-400" />,
      minPoints: 500,
      maxPoints: 1000,
      rewards: { coins: 200, packs: 2 },
      unlocked: leaguePoints >= 500
    },
    {
      id: 'gold',
      name: 'Gold League',
      icon: <Shield className="w-8 h-8 text-yellow-500" />,
      minPoints: 1000,
      maxPoints: 2000,
      rewards: { coins: 400, packs: 3 },
      unlocked: leaguePoints >= 1000
    },
    {
      id: 'elite',
      name: 'Elite League',
      icon: <Crown className="w-8 h-8 text-purple-500" />,
      minPoints: 2000,
      maxPoints: 4000,
      rewards: { coins: 800, packs: 5 },
      unlocked: leaguePoints >= 2000
    },
    {
      id: 'masters',
      name: 'Masters League',
      icon: <Crown className="w-8 h-8 text-gold" />,
      minPoints: 4000,
      maxPoints: -1,
      rewards: { coins: 1500, packs: 10 },
      unlocked: leaguePoints >= 4000
    }
  ];

  const currentLeagueData = leagues.find(l => l.id === currentLeague);
  const currentProgress = currentLeagueData ? 
    ((leaguePoints - currentLeagueData.minPoints) / (currentLeagueData.maxPoints - currentLeagueData.minPoints)) * 100 : 0;

  // Sample leaderboard data
  const leaderboard = [
    { rank: 1, name: "IceKing97", points: 2847, team: "TOR", wins: 156 },
    { rank: 2, name: "PuckMaster", points: 2745, team: "BOS", wins: 149 },
    { rank: 3, name: "HockeyLegend", points: 2698, team: "TBL", wins: 145 },
    { rank: 4, name: "SlapShotPro", points: 2654, team: "COL", wins: 142 },
    { rank: 5, name: "GoalieKnight", points: 2612, team: "NYR", wins: 138 },
    { rank: 12, name: "You", points: leaguePoints, team: "EDM", wins: 89, isPlayer: true }
  ];

  const upcomingMatches = [
    { opponent: "HockeyFan23", team: "MTL", points: 267, difficulty: 85 },
    { opponent: "PuckChaser", team: "DET", points: 289, difficulty: 88 },
    { opponent: "IceBreaker99", team: "CAR", points: 234, difficulty: 82 }
  ];

  const playMatch = (opponent: any) => {
    // Simple match simulation
    const teamStrength = Math.max(75, Math.min(95, 
      playerData.team.length > 0 
        ? playerData.team.reduce((sum, player) => sum + player.overall, 0) / playerData.team.length
        : 80
    ));
    
    const winChance = Math.max(0.3, Math.min(0.8, 
      0.5 + ((teamStrength - opponent.difficulty) * 0.02)
    ));
    
    const isWin = Math.random() < winChance;
    const pointsGained = isWin ? Math.floor(15 + Math.random() * 15) : Math.floor(5 + Math.random() * 10);
    const coinsEarned = isWin ? Math.floor(50 + Math.random() * 100) : Math.floor(20 + Math.random() * 50);
    
    setLeaguePoints(prev => prev + pointsGained);
    setPlayerData(prev => ({
      ...prev,
      coins: prev.coins + coinsEarned
    }));
    
    alert(`${isWin ? 'Victory!' : 'Defeat!'}\n+${pointsGained} League Points\n+${coinsEarned} Coins`);
  };

  return (
    <div className="min-h-screen ice-surface">
      <GameHeader 
        playerData={playerData} 
        showBackButton 
        onBack={() => onNavigate('team')}
        title="Leagues"
      />
      
      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">League Competition</h1>
          <p className="text-xl text-muted-foreground">Compete with players worldwide for exclusive rewards</p>
        </div>

        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="current">Current League</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="rewards">Leagues & Rewards</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-6">
            {/* Current League Status */}
            <Card className="game-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  {currentLeagueData?.icon}
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{currentLeagueData?.name}</h3>
                    <p className="text-muted-foreground">Your current league</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{leaguePoints}</div>
                  <div className="text-sm text-muted-foreground">League Points</div>
                </div>
              </div>

              {currentLeagueData && currentLeagueData.maxPoints > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress to next league</span>
                    <span>{Math.round(currentProgress)}%</span>
                  </div>
                  <Progress value={currentProgress} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{currentLeagueData.minPoints} pts</span>
                    <span>{currentLeagueData.maxPoints} pts needed</span>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Sword className="w-5 h-5 text-hockey-red" />
                  <span className="text-sm">Matches Won: 89</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="text-sm">Current Rank: #12</span>
                </div>
              </div>
            </Card>

            {/* Upcoming Matches */}
            <Card className="game-card p-6">
              <h3 className="text-2xl font-bold mb-4 text-foreground">Available Matches</h3>
              <div className="space-y-4">
                {upcomingMatches.map((match, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{match.opponent}</div>
                        <div className="text-sm text-muted-foreground">
                          {match.team} • {match.points} League Points
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge variant={match.difficulty > 85 ? 'destructive' : match.difficulty > 80 ? 'default' : 'secondary'}>
                          {match.difficulty > 85 ? 'Hard' : match.difficulty > 80 ? 'Medium' : 'Easy'}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          Difficulty: {match.difficulty}
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => playMatch(match)}
                        className="btn-primary"
                      >
                        Challenge
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card className="game-card p-6">
              <h3 className="text-2xl font-bold mb-4 text-foreground">League Leaderboard</h3>
              <div className="space-y-2">
                {leaderboard.map((player, index) => (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      player.isPlayer ? 'bg-primary/10 border border-primary/30' : 'bg-muted/10'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        player.rank === 1 ? 'bg-gold text-black' :
                        player.rank === 2 ? 'bg-gray-400 text-black' :
                        player.rank === 3 ? 'bg-amber-600 text-white' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {player.rank <= 3 ? <Crown className="w-4 h-4" /> : player.rank}
                      </div>
                      <div>
                        <div className={`font-semibold ${player.isPlayer ? 'text-primary' : 'text-foreground'}`}>
                          {player.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {player.team} • {player.wins} wins
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold text-foreground">{player.points}</div>
                      <div className="text-xs text-muted-foreground">points</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6">
            <div className="grid gap-4">
              {leagues.map((league) => (
                <Card 
                  key={league.id}
                  className={`game-card p-6 ${
                    league.id === currentLeague ? 'border-primary bg-primary/5' : 
                    !league.unlocked ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {league.icon}
                      <div>
                        <h4 className="text-xl font-bold text-foreground">{league.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {league.minPoints} - {league.maxPoints > 0 ? `${league.maxPoints} points` : '∞ points'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="flex items-center space-x-1">
                          <Coins className="w-4 h-4 text-gold" />
                          <span className="font-semibold">{league.rewards.coins}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Trophy className="w-4 h-4 text-primary" />
                          <span className="font-semibold">{league.rewards.packs}</span>
                        </div>
                      </div>
                      
                      {league.id === currentLeague ? (
                        <Badge variant="default">Current League</Badge>
                      ) : league.unlocked ? (
                        <Badge variant="outline">Available</Badge>
                      ) : (
                        <Badge variant="secondary">Locked</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LeaguesMode;