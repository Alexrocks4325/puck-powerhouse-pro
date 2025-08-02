import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Trophy, Users, Settings, Building, Gamepad2, User, Zap, Star, Eye } from "lucide-react";
import heroImage from "@/assets/nhl25-hero.jpg";
import hughesCover from "@/assets/hughes-brothers-cover.jpg";
import pwhlLogo from "@/assets/pwhl-logo.jpg";
import { FranchiseMode } from "@/components/GameModes/FranchiseMode";
import { BeAProMode } from "@/components/GameModes/BeAProMode";
import { WorldOfCHEL } from "@/components/GameModes/WorldOfCHEL";

const Index = () => {
  const [currentMode, setCurrentMode] = useState<'menu' | 'play-now' | 'franchise' | 'be-a-pro' | 'world-chel'>('menu');

  // Handle mode selection
  const handleModeSelect = (mode: typeof currentMode) => {
    setCurrentMode(mode);
  };

  // Render current mode
  if (currentMode === 'franchise') {
    return <FranchiseMode onBack={() => setCurrentMode('menu')} />;
  }
  
  if (currentMode === 'be-a-pro') {
    return <BeAProMode onBack={() => setCurrentMode('menu')} />;
  }
  
  if (currentMode === 'world-chel') {
    return <WorldOfCHEL onBack={() => setCurrentMode('menu')} />;
  }
  
  if (currentMode === 'play-now') {
    return <GameInterface onBack={() => setCurrentMode('menu')} />;
  }

  // Main Menu
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hughes Brothers Cover Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${hughesCover})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-arena-dark/60 via-arena-dark/80 to-arena-dark/95" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        {/* NHL 25 Logo with Hughes Brothers */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="nhl-text-logo text-7xl md:text-8xl mb-4 text-transparent bg-gradient-to-r from-hockey-red via-ice-blue to-hockey-red bg-clip-text animate-glow-pulse">
            NHL 25
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-display tracking-wide mb-2">
            FEATURING THE HUGHES BROTHERS
          </p>
          <div className="flex justify-center gap-4 mb-4">
            <Badge variant="secondary" className="text-sm font-display">JACK • QUINN • LUKE</Badge>
            <Badge variant="secondary" className="text-sm font-display">ICE-Q ENGINE</Badge>
            <Badge variant="secondary" className="text-sm font-display">FROSTBITE</Badge>
          </div>
          <p className="text-lg text-muted-foreground">
            First NHL game featuring PWHL • Enhanced with Vision Control
          </p>
        </div>

        {/* Main Game Modes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full animate-fade-in">
          {/* Play Now */}
          <Card className="nhl-shadow-arena bg-card/20 backdrop-blur-sm border-border/50 hover:bg-card/30 transition-all duration-300 group">
            <CardHeader className="text-center">
              <Play className="w-12 h-12 mx-auto mb-4 text-ice-blue group-hover:text-ice-blue-light transition-colors" />
              <CardTitle className="nhl-text-display text-xl">PLAY NOW</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4 text-sm">
                Jump into a quick match with ICE-Q engine and Vision Control
              </p>
              <Button variant="default" size="lg" onClick={() => handleModeSelect('play-now')} className="w-full">
                START GAME
              </Button>
            </CardContent>
          </Card>

          {/* Franchise Mode */}
          <Card className="nhl-shadow-arena bg-card/20 backdrop-blur-sm border-border/50 hover:bg-card/30 transition-all duration-300 group">
            <CardHeader className="text-center">
              <Building className="w-12 h-12 mx-auto mb-4 text-hockey-red group-hover:text-hockey-red-light transition-colors" />
              <CardTitle className="nhl-text-display text-xl">FRANCHISE</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4 text-sm">
                Enhanced team management with smarter AI and deeper tools
              </p>
              <Button variant="destructive" size="lg" onClick={() => handleModeSelect('franchise')} className="w-full">
                MANAGE TEAM
              </Button>
            </CardContent>
          </Card>

          {/* Be A Pro */}
          <Card className="nhl-shadow-arena bg-card/20 backdrop-blur-sm border-border/50 hover:bg-card/30 transition-all duration-300 group">
            <CardHeader className="text-center">
              <User className="w-12 h-12 mx-auto mb-4 text-accent group-hover:text-accent/80 transition-colors" />
              <CardTitle className="nhl-text-display text-xl">BE A PRO</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4 text-sm">
                Create your career • Now featuring female players & PWHL
              </p>
              <Button variant="secondary" size="lg" onClick={() => handleModeSelect('be-a-pro')} className="w-full">
                CREATE PLAYER
              </Button>
            </CardContent>
          </Card>

          {/* World of CHEL */}
          <Card className="nhl-shadow-arena bg-card/20 backdrop-blur-sm border-border/50 hover:bg-card/30 transition-all duration-300 group">
            <CardHeader className="text-center">
              <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-destructive group-hover:text-destructive/80 transition-colors" />
              <CardTitle className="nhl-text-display text-xl">WORLD OF CHEL</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4 text-sm">
                Arcade hockey with power-ups • 3v3, 1v1, and more
              </p>
              <Button variant="outline" size="lg" onClick={() => handleModeSelect('world-chel')} className="w-full">
                ARCADE MODES
              </Button>
            </CardContent>
          </Card>

          {/* Ultimate Team */}
          <Card className="nhl-shadow-arena bg-card/20 backdrop-blur-sm border-border/50 hover:bg-card/30 transition-all duration-300 group opacity-75">
            <CardHeader className="text-center">
              <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <CardTitle className="nhl-text-display text-xl">ULTIMATE TEAM</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4 text-sm">
                Build your dream team with player cards
              </p>
              <Button variant="ghost" size="lg" disabled className="w-full">
                POST-MVP
              </Button>
            </CardContent>
          </Card>

          {/* Online Multiplayer */}
          <Card className="nhl-shadow-arena bg-card/20 backdrop-blur-sm border-border/50 hover:bg-card/30 transition-all duration-300 group opacity-75">
            <CardHeader className="text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <CardTitle className="nhl-text-display text-xl">MULTIPLAYER</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4 text-sm">
                Challenge players worldwide online
              </p>
              <Button variant="ghost" size="lg" disabled className="w-full">
                COMING SOON
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* NHL 25 Key Features */}
        <Card className="mt-12 max-w-5xl w-full nhl-shadow-ice bg-card/10 backdrop-blur-sm border-border/30">
          <CardHeader>
            <CardTitle className="nhl-text-display text-2xl text-center mb-4">NHL 25 KEY FEATURES</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <Zap className="w-8 h-8 mx-auto mb-2 text-ice-blue" />
                <h3 className="font-display font-bold mb-2">ICE-Q Engine</h3>
                <p className="text-sm text-muted-foreground">Smarter AI and realistic player movement</p>
              </div>
              <div className="text-center">
                <Eye className="w-8 h-8 mx-auto mb-2 text-hockey-red" />
                <h3 className="font-display font-bold mb-2">Vision Control</h3>
                <p className="text-sm text-muted-foreground">Face the net or puck for better positioning</p>
              </div>
              <div className="text-center">
                <img src={pwhlLogo} alt="PWHL" className="w-8 h-8 mx-auto mb-2 rounded" />
                <h3 className="font-display font-bold mb-2">PWHL Support</h3>
                <p className="text-sm text-muted-foreground">First NHL game featuring women's professional hockey</p>
              </div>
              <div className="text-center">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-accent" />
                <h3 className="font-display font-bold mb-2">Frostbite Engine</h3>
                <p className="text-sm text-muted-foreground">Enhanced graphics and crowd reactions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-muted-foreground">
          <p className="text-sm font-display tracking-wide">
            NEXT-GEN EXCLUSIVE • PS5 & XBOX SERIES X|S • MVP BUILD v1.0
          </p>
        </div>
      </div>
    </div>
  );
};

// Enhanced Game Interface with ICE-Q and Vision Control
const GameInterface = ({ onBack }: { onBack: () => void }) => {
  const [selectedTeams, setSelectedTeams] = useState<{ home: string | null; away: string | null }>({
    home: null,
    away: null
  });
  const [gamePhase, setGamePhase] = useState<'team-select' | 'game' | 'post-game'>('team-select');

  // Enhanced team roster with NHL and PWHL teams
  const teams = [
    // NHL Teams
    { id: 1, name: "Ice Wolves", city: "Arctic", color: "ice-blue", record: "45-20-5", league: "NHL", overall: 87 },
    { id: 2, name: "Fire Hawks", city: "Inferno", color: "hockey-red", record: "42-23-7", league: "NHL", overall: 84 },
    { id: 3, name: "Steel Bears", city: "Industrial", color: "muted", record: "38-27-9", league: "NHL", overall: 86 },
    { id: 4, name: "Lightning", city: "Storm", color: "accent", record: "41-24-6", league: "NHL", overall: 88 },
    // PWHL Teams
    { id: 5, name: "Frost", city: "Toronto", color: "ice-blue", record: "18-8-2", league: "PWHL", overall: 85 },
    { id: 6, name: "Fleet", city: "Boston", color: "hockey-red", record: "16-10-2", league: "PWHL", overall: 83 }
  ];

  const handleTeamSelect = (teamId: number, position: 'home' | 'away') => {
    const team = teams.find(t => t.id === teamId);
    if (team) {
      setSelectedTeams(prev => ({ ...prev, [position]: `${team.city} ${team.name}` }));
    }
  };

  const canStartGame = selectedTeams.home && selectedTeams.away && selectedTeams.home !== selectedTeams.away;

  if (gamePhase === 'team-select') {
    return (
      <div className="min-h-screen p-6 nhl-gradient-arena">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <Button variant="outline" onClick={onBack} className="absolute top-6 left-6">
              ← BACK TO MENU
            </Button>
            <h1 className="nhl-text-display text-4xl md:text-6xl mb-4 text-transparent bg-gradient-to-r from-ice-blue to-hockey-red bg-clip-text">
              TEAM SELECTION
            </h1>
            <p className="text-muted-foreground font-display">Choose your teams • NHL & PWHL available</p>
          </div>

          {/* League Selector */}
          <div className="text-center mb-8">
            <div className="flex justify-center gap-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">NHL TEAMS</Badge>
              <Badge variant="secondary" className="text-lg px-4 py-2">PWHL TEAMS</Badge>
            </div>
          </div>

          {/* Team Selection Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Home Team */}
            <div>
              <h2 className="nhl-text-display text-2xl mb-4 text-center">HOME TEAM</h2>
              <div className="grid grid-cols-1 gap-4">
                {teams.map((team) => (
                  <Card 
                    key={`home-${team.id}`}
                    className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                      selectedTeams.home === `${team.city} ${team.name}` 
                        ? 'ring-2 ring-hockey-red nhl-shadow-fire' 
                        : 'hover:nhl-shadow-ice'
                    }`}
                    onClick={() => handleTeamSelect(team.id, 'home')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="nhl-text-display text-lg mb-1">{team.city} {team.name}</h3>
                          <div className="flex gap-2">
                            <Badge variant="secondary">{team.record}</Badge>
                            <Badge variant={team.league === 'PWHL' ? 'default' : 'secondary'}>
                              {team.league}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className={`w-12 h-12 rounded-full bg-${team.color} opacity-80 mb-2`} />
                          <Badge variant="outline">OVR {team.overall}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Away Team */}
            <div>
              <h2 className="nhl-text-display text-2xl mb-4 text-center">AWAY TEAM</h2>
              <div className="grid grid-cols-1 gap-4">
                {teams.map((team) => (
                  <Card 
                    key={`away-${team.id}`}
                    className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                      selectedTeams.away === `${team.city} ${team.name}` 
                        ? 'ring-2 ring-ice-blue nhl-shadow-ice' 
                        : 'hover:nhl-shadow-ice'
                    }`}
                    onClick={() => handleTeamSelect(team.id, 'away')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="nhl-text-display text-lg mb-1">{team.city} {team.name}</h3>
                          <div className="flex gap-2">
                            <Badge variant="secondary">{team.record}</Badge>
                            <Badge variant={team.league === 'PWHL' ? 'default' : 'secondary'}>
                              {team.league}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className={`w-12 h-12 rounded-full bg-${team.color} opacity-80 mb-2`} />
                          <Badge variant="outline">OVR {team.overall}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Start Game Button */}
          <div className="text-center">
            <Button 
              variant="default" 
              size="lg" 
              disabled={!canStartGame}
              onClick={() => setGamePhase('game')}
              className="px-12 py-4 text-xl"
            >
              START MATCH
            </Button>
            {selectedTeams.home && selectedTeams.away && (
              <p className="mt-4 text-lg font-display">
                {selectedTeams.away} vs {selectedTeams.home}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (gamePhase === 'game') {
    return <EnhancedGamePlay 
      homeTeam={selectedTeams.home!} 
      awayTeam={selectedTeams.away!} 
      onGameEnd={() => setGamePhase('post-game')}
    />;
  }

  return <PostGame onBack={onBack} onRestart={() => setGamePhase('team-select')} />;
};

// Enhanced Game Play with ICE-Q engine features
const EnhancedGamePlay = ({ homeTeam, awayTeam, onGameEnd }: { 
  homeTeam: string; 
  awayTeam: string; 
  onGameEnd: () => void;
}) => {
  const [gameState, setGameState] = useState({
    period: 1,
    time: "20:00",
    homeScore: 0,
    awayScore: 0,
    homeShots: 0,
    awayShots: 0,
    homeFaceoffWins: 0,
    awayFaceoffWins: 0,
    homeHits: 0,
    awayHits: 0,
    possession: homeTeam,
    visionControlActive: false,
    iceQEvent: null as string | null,
    gameEvents: [] as string[]
  });

  const [isPlaying, setIsPlaying] = useState(false);

  const iceQEvents = [
    "Smart AI positioning creates scoring chance",
    "Goaltender reads the play with enhanced AI",
    "Vision Control enables perfect pass",
    "ICE-Q engine calculates optimal defensive coverage",
    "Realistic player fatigue affects performance",
    "AI creates natural line chemistry"
  ];

  const startGame = () => {
    setIsPlaying(true);
    
    const gameInterval = setInterval(() => {
      setGameState(prev => {
        const newTime = decreaseTime(prev.time);
        const events = [...prev.gameEvents];
        let newState = { ...prev, time: newTime };

        // ICE-Q Engine Events
        if (Math.random() < 0.15) {
          const event = iceQEvents[Math.floor(Math.random() * iceQEvents.length)];
          newState.iceQEvent = event;
          setTimeout(() => {
            setGameState(current => ({ ...current, iceQEvent: null }));
          }, 3000);
        }

        // Vision Control activation
        if (Math.random() < 0.1) {
          newState.visionControlActive = true;
          setTimeout(() => {
            setGameState(current => ({ ...current, visionControlActive: false }));
          }, 2000);
        }

        // Enhanced game events with more detail
        if (Math.random() < 0.12) {
          const teamInAction = Math.random() < 0.5 ? homeTeam : awayTeam;
          const eventType = Math.random();
          
          if (eventType < 0.25) { // Goal
            events.push(`🚨 GOAL! ${teamInAction} scores with help from ICE-Q positioning!`);
            newState = {
              ...newState,
              homeScore: teamInAction === homeTeam ? prev.homeScore + 1 : prev.homeScore,
              awayScore: teamInAction === awayTeam ? prev.awayScore + 1 : prev.awayScore,
            };
          } else if (eventType < 0.6) { // Shot
            events.push(`🏒 Shot by ${teamInAction}`);
            newState = {
              ...newState,
              homeShots: teamInAction === homeTeam ? prev.homeShots + 1 : prev.homeShots,
              awayShots: teamInAction === awayTeam ? prev.awayShots + 1 : prev.awayShots,
            };
          } else if (eventType < 0.8) { // Faceoff
            events.push(`🔄 Faceoff won by ${teamInAction}`);
            newState = {
              ...newState,
              homeFaceoffWins: teamInAction === homeTeam ? prev.homeFaceoffWins + 1 : prev.homeFaceoffWins,
              awayFaceoffWins: teamInAction === awayTeam ? prev.awayFaceoffWins + 1 : prev.awayFaceoffWins,
            };
          } else { // Hit
            events.push(`💥 Big hit by ${teamInAction}`);
            newState = {
              ...newState,
              homeHits: teamInAction === homeTeam ? prev.homeHits + 1 : prev.homeHits,
              awayHits: teamInAction === awayTeam ? prev.awayHits + 1 : prev.awayHits,
            };
          }
        }
        
        if (newTime === "00:00" && prev.period === 3) {
          clearInterval(gameInterval);
          setTimeout(onGameEnd, 2000);
        }
        
        return {
          ...newState,
          period: newTime === "00:00" ? Math.min(prev.period + 1, 3) : prev.period,
          gameEvents: events.slice(-5)
        };
      });
    }, 800); // Slightly faster for more action

    return () => clearInterval(gameInterval);
  };

  const decreaseTime = (time: string): string => {
    const [minutes, seconds] = time.split(":").map(Number);
    if (seconds > 0) {
      return `${minutes.toString().padStart(2, '0')}:${(seconds - 1).toString().padStart(2, '0')}`;
    } else if (minutes > 0) {
      return `${(minutes - 1).toString().padStart(2, '0')}:59`;
    }
    return "00:00";
  };

  return (
    <div className="min-h-screen p-6 nhl-gradient-arena">
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Scoreboard */}
        <Card className="mb-8 nhl-shadow-arena bg-card/30 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="grid grid-cols-3 items-center text-center">
              {/* Away Team */}
              <div>
                <h2 className="nhl-text-display text-xl mb-2">{awayTeam}</h2>
                <div className="text-5xl font-black nhl-text-logo text-ice-blue animate-score-flash">
                  {gameState.awayScore}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                  <div>Shots: {gameState.awayShots}</div>
                  <div>Hits: {gameState.awayHits}</div>
                  <div>FO: {gameState.awayFaceoffWins}</div>
                </div>
              </div>
              
              {/* Game Info */}
              <div>
                <div className="text-3xl font-black nhl-text-display mb-2">{gameState.time}</div>
                <Badge variant="secondary" className="text-lg px-4 py-2 mb-4">
                  Period {gameState.period}
                </Badge>
                
                {/* ICE-Q Status */}
                <div className="space-y-2">
                  {gameState.visionControlActive && (
                    <Badge variant="default" className="animate-glow-pulse">
                      <Eye className="w-4 h-4 mr-2" />
                      VISION CONTROL
                    </Badge>
                  )}
                  {gameState.iceQEvent && (
                    <div className="text-xs text-ice-blue animate-fade-in">
                      {gameState.iceQEvent}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Home Team */}
              <div>
                <h2 className="nhl-text-display text-xl mb-2">{homeTeam}</h2>
                <div className="text-5xl font-black nhl-text-logo text-hockey-red animate-score-flash">
                  {gameState.homeScore}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                  <div>Shots: {gameState.homeShots}</div>
                  <div>Hits: {gameState.homeHits}</div>
                  <div>FO: {gameState.homeFaceoffWins}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Controls */}
        <div className="text-center mb-8">
          {!isPlaying ? (
            <Button variant="default" size="lg" onClick={startGame} className="px-12 py-4 text-xl">
              DROP THE PUCK
            </Button>
          ) : (
            <div className="space-y-2">
              <Badge variant="secondary" className="text-lg px-6 py-3 animate-glow-pulse">
                ICE-Q ENGINE ACTIVE
              </Badge>
              <p className="text-sm text-muted-foreground">
                Enhanced AI • Vision Control • Realistic Physics
              </p>
            </div>
          )}
        </div>

        {/* Game Events */}
        <Card className="nhl-shadow-ice bg-card/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="nhl-text-display text-center">LIVE PLAY-BY-PLAY</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 min-h-[200px]">
              {gameState.gameEvents.map((event, index) => (
                <div 
                  key={index}
                  className="p-3 bg-muted/20 rounded border border-border/50 animate-fade-in"
                >
                  {event}
                </div>
              ))}
              {gameState.gameEvents.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                  <p className="text-lg">ICE-Q engine analyzing gameplay...</p>
                  <p className="text-sm mt-2">Enhanced AI will create realistic hockey action</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Enhanced Post Game Component
const PostGame = ({ onBack, onRestart }: { onBack: () => void; onRestart: () => void }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 nhl-gradient-arena">
      <Card className="max-w-3xl w-full nhl-shadow-arena bg-card/30 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="nhl-text-display text-4xl mb-4">GAME COMPLETE</CardTitle>
          <p className="text-lg text-muted-foreground">
            Amazing hockey action powered by the ICE-Q engine and Vision Control!
          </p>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {/* Game Summary */}
          <div className="grid grid-cols-3 gap-6 p-6 bg-muted/10 rounded">
            <div>
              <h3 className="font-display font-bold mb-2">ICE-Q Features</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✓ Smart AI positioning</li>
                <li>✓ Realistic player movement</li>
                <li>✓ Enhanced goaltending</li>
              </ul>
            </div>
            <div>
              <h3 className="font-display font-bold mb-2">Vision Control</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✓ Face net positioning</li>
                <li>✓ Improved passing</li>
                <li>✓ Better puck control</li>
              </ul>
            </div>
            <div>
              <h3 className="font-display font-bold mb-2">Next-Gen Graphics</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✓ Frostbite engine</li>
                <li>✓ Enhanced animations</li>
                <li>✓ Realistic ice physics</li>
              </ul>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <Button variant="default" size="lg" onClick={onRestart}>
              PLAY AGAIN
            </Button>
            <Button variant="outline" size="lg" onClick={onBack}>
              MAIN MENU
            </Button>
          </div>
          
          <div className="pt-6 border-t border-border/50">
            <p className="text-sm text-muted-foreground font-display">
              NHL 25 MVP • Experience Franchise Mode, Be A Pro with female players, World of CHEL arcade modes coming in full release
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;