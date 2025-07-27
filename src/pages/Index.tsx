import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import GameHeader from "@/components/game/GameHeader";
import Tutorial from "@/components/game/Tutorial";
import PackOpening from "@/components/game/PackOpening";
import TeamManagement from "@/components/game/TeamManagement";
import SeasonMode from "@/components/game/SeasonMode";
import TasksAndChallenges from "@/components/game/TasksAndChallenges";
import LeaguesMode from "@/components/game/LeaguesMode";
import { Trophy, Star, Coins, Users, Target, Award, Calendar, Package } from "lucide-react";
import nhlLogo from "@/assets/nhl-ultimate-logo.png";
import { getStarterTeam } from "@/data/nhlPlayerDatabase";

const Index = () => {
  const [gameState, setGameState] = useState<'menu' | 'tutorial' | 'packs' | 'team' | 'season' | 'tasks' | 'leagues'>('menu');

  const handleNavigate = (screen: 'menu' | 'tutorial' | 'packs' | 'team' | 'season' | 'tasks' | 'leagues') => {
    setGameState(screen);
  };

  const [playerData, setPlayerData] = useState({
    coins: 2000,
    packs: 3,
    level: 1,
    team: [],
    completedTutorial: false,
    seasonProgress: 0,
    leaguePoints: 0
  });

  const handleStartGame = () => {
    if (!playerData.completedTutorial) {
      setGameState('tutorial');
    } else {
      setGameState('team');
    }
  };

  const handleTutorialComplete = () => {
    setPlayerData(prev => ({ 
      ...prev, 
      completedTutorial: true,
      coins: prev.coins + 500, // Tutorial bonus
      packs: prev.packs + 2, // Starter packs
      team: getStarterTeam() // Give starter team with all positions
    }));
    setGameState('packs');
  };

  // Route to appropriate component
  if (gameState === 'tutorial') {
    return <Tutorial onComplete={handleTutorialComplete} />;
  }

  if (gameState === 'packs') {
    return (
      <PackOpening 
        playerData={playerData}
        setPlayerData={setPlayerData}
        onNavigate={handleNavigate}
      />
    );
  }

  if (gameState === 'team') {
    return (
      <TeamManagement 
        playerData={playerData}
        setPlayerData={setPlayerData}
        onNavigate={handleNavigate}
      />
    );
  }

  if (gameState === 'season') {
    return (
      <SeasonMode 
        playerData={playerData}
        setPlayerData={setPlayerData}
        onNavigate={handleNavigate}
      />
    );
  }

  if (gameState === 'tasks') {
    return (
      <TasksAndChallenges 
        playerData={playerData}
        setPlayerData={setPlayerData}
        onNavigate={handleNavigate}
      />
    );
  }

  if (gameState === 'leagues') {
    return (
      <LeaguesMode 
        playerData={playerData}
        setPlayerData={setPlayerData}
        onNavigate={handleNavigate}
      />
    );
  }

  // Main Menu
  return (
    <div className="min-h-screen ice-surface">
      <GameHeader />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-12 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <img src={nhlLogo} alt="NHL Ultimate Mobile" className="w-32 h-32 animate-ice-glimmer" />
          </div>
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-ice-blue via-primary to-gold bg-clip-text text-transparent">
            NHL ULTIMATE
          </h1>
          <h2 className="text-3xl md:text-4xl font-semibold mb-8 text-foreground">
            MOBILE
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Build your ultimate hockey team. Master team chemistry. Dominate seasons. 
            Compete worldwide. Claim the Stanley Cup.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <Button 
              onClick={handleStartGame}
              className="btn-primary text-xl px-8 py-4 h-auto shadow-lg hover:shadow-xl"
            >
              {!playerData.completedTutorial ? "START TUTORIAL" : "CONTINUE JOURNEY"}
            </Button>
            <Button 
              variant="outline" 
              className="text-xl px-8 py-4 h-auto border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={() => setGameState('team')}
            >
              QUICK PLAY
            </Button>
          </div>

          {/* Progress Indicator for returning players */}
          {playerData.completedTutorial && (
            <div className="max-w-md mx-auto p-4 bg-card/50 backdrop-blur-sm rounded-lg border">
              <div className="text-sm text-muted-foreground mb-2">Your Progress</div>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="font-semibold text-gold">{playerData.coins.toLocaleString()}</div>
                  <div className="text-muted-foreground">Coins</div>
                </div>
                <div>
                  <div className="font-semibold text-ice-blue">{playerData.team.length}</div>
                  <div className="text-muted-foreground">Players</div>
                </div>
                <div>
                  <div className="font-semibold text-primary">Lvl {playerData.level}</div>
                  <div className="text-muted-foreground">Team Level</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Game Features */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12 text-foreground">Game Modes</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card 
            className="game-card p-6 text-center cursor-pointer hover:scale-105 transition-transform"
            onClick={() => {
              if (!playerData.completedTutorial) {
                handleStartGame();
              } else {
                setGameState('team');
              }
            }}
          >
            <Trophy className="w-12 h-12 mx-auto mb-4 text-gold" />
            <h3 className="text-xl font-bold mb-2">Ultimate Team</h3>
            <p className="text-muted-foreground mb-4">
              Collect NHL superstars and build your dream lineup with perfect chemistry
            </p>
            <div className="flex justify-center space-x-2">
              <Star className="w-4 h-4 text-gold" />
              <Star className="w-4 h-4 text-gold" />
              <Star className="w-4 h-4 text-gold" />
            </div>
          </Card>

          <Card 
            className="game-card p-6 text-center cursor-pointer hover:scale-105 transition-transform"
            onClick={() => {
              if (!playerData.completedTutorial) {
                handleStartGame();
              } else {
                setGameState('season');
              }
            }}
          >
            <Calendar className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-bold mb-2">Season & Playoffs</h3>
            <p className="text-muted-foreground mb-4">
              Play through NHL seasons with dynamic difficulty and compete for the Stanley Cup
            </p>
            <div className="flex justify-center space-x-2">
              <Star className="w-4 h-4 text-primary" />
              <Star className="w-4 h-4 text-primary" />
              <Star className="w-4 h-4 text-muted-foreground" />
            </div>
          </Card>

          <Card 
            className="game-card p-6 text-center cursor-pointer hover:scale-105 transition-transform"
            onClick={() => {
              if (!playerData.completedTutorial) {
                handleStartGame();
              } else {
                setGameState('packs');
              }
            }}
          >
            <Package className="w-12 h-12 mx-auto mb-4 text-gold" />
            <h3 className="text-xl font-bold mb-2">Pack Opening</h3>
            <p className="text-muted-foreground mb-4">
              Open packs to discover new players with unique chemistry synergies
            </p>
            <div className="flex justify-center space-x-2">
              <Star className="w-4 h-4 text-gold" />
              <Star className="w-4 h-4 text-gold" />
              <Star className="w-4 h-4 text-muted-foreground" />
            </div>
          </Card>

          <Card 
            className="game-card p-6 text-center cursor-pointer hover:scale-105 transition-transform"
            onClick={() => {
              if (!playerData.completedTutorial) {
                handleStartGame();
              } else {
                setGameState('tasks');
              }
            }}
          >
            <Target className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-xl font-bold mb-2">Tasks & Challenges</h3>
            <p className="text-muted-foreground mb-4">
              Complete daily and weekly challenges for exclusive rewards and bonuses
            </p>
            <div className="flex justify-center space-x-2">
              <Star className="w-4 h-4 text-green-500" />
              <Star className="w-4 h-4 text-green-500" />
              <Star className="w-4 h-4 text-green-500" />
            </div>
          </Card>

          <Card 
            className="game-card p-6 text-center cursor-pointer hover:scale-105 transition-transform"
            onClick={() => {
              if (!playerData.completedTutorial) {
                handleStartGame();
              } else {
                setGameState('leagues');
              }
            }}
          >
            <Award className="w-12 h-12 mx-auto mb-4 text-purple-500" />
            <h3 className="text-xl font-bold mb-2">Global Leagues</h3>
            <p className="text-muted-foreground mb-4">
              Compete with players worldwide in ranked leagues for ultimate bragging rights
            </p>
            <div className="flex justify-center space-x-2">
              <Star className="w-4 h-4 text-purple-500" />
              <Star className="w-4 h-4 text-purple-500" />
              <Star className="w-4 h-4 text-purple-500" />
            </div>
          </Card>

          <Card className="game-card p-6 text-center cursor-pointer hover:scale-105 transition-transform">
            <Users className="w-12 h-12 mx-auto mb-4 text-ice-blue" />
            <h3 className="text-xl font-bold mb-2">Team Chemistry</h3>
            <p className="text-muted-foreground mb-4">
              Master team synergies and chemistry combinations for maximum performance
            </p>
            <div className="flex justify-center space-x-2">
              <Star className="w-4 h-4 text-ice-blue" />
              <Star className="w-4 h-4 text-ice-blue" />
              <Star className="w-4 h-4 text-muted-foreground" />
            </div>
          </Card>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="container mx-auto px-4 py-16 bg-card/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-foreground">Why NHL Ultimate Mobile?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Dynamic Difficulty</h4>
              <p className="text-sm text-muted-foreground">
                Game difficulty adapts to your team strength for balanced, challenging gameplay
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gold" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Team Chemistry System</h4>
              <p className="text-sm text-muted-foreground">
                Strategic team building with real NHL player synergies and chemistry bonuses
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-ice-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-ice-blue" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Progressive Rewards</h4>
              <p className="text-sm text-muted-foreground">
                Earn more coins and better packs as you improve your team and skills
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-ice-dark/50 border-t border-border/30 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground mb-4">
            © 2024 NHL Ultimate Mobile. All rights reserved.
          </p>
          <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
            <span>Easy to learn, challenging to master</span>
            <span>•</span>
            <span>Accessible gameplay for all skill levels</span>
            <span>•</span>
            <span>Constantly updated content</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;