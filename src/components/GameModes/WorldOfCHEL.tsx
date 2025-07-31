import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Gamepad2, Users, Trophy, ArrowLeft, Sparkles } from "lucide-react";

interface WorldOfCHELProps {
  onBack: () => void;
}

export const WorldOfCHEL = ({ onBack }: WorldOfCHELProps) => {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  const arcadeModes = [
    {
      id: "threes",
      title: "NHL Threes",
      description: "Fast-paced 3-on-3 arcade hockey with power-ups and special abilities",
      icon: Zap,
      difficulty: "Arcade",
      players: "3v3",
      powerUps: true
    },
    {
      id: "ones",
      title: "NHL Ones",
      description: "1-on-1 pond hockey in outdoor rinks around the world",
      icon: Gamepad2,
      difficulty: "Competitive",
      players: "1v1",
      powerUps: false
    },
    {
      id: "eliminator",
      title: "Eliminator",
      description: "Battle royale hockey where last team standing wins",
      icon: Trophy,
      difficulty: "Intense",
      players: "Multiple Teams",
      powerUps: true
    },
    {
      id: "pond",
      title: "Pond Hockey",
      description: "Classic outdoor hockey experience with friends",
      icon: Users,
      difficulty: "Casual",
      players: "4v4",
      powerUps: false
    }
  ];

  const powerUps = [
    { name: "Lightning Speed", effect: "Increased skating speed for 30 seconds", color: "text-primary" },
    { name: "Fire Shot", effect: "Super powerful shot that's hard to save", color: "text-destructive" },
    { name: "Freeze Goalie", effect: "Temporarily slow down opponent's goalie", color: "text-accent" },
    { name: "Big Hit", effect: "Massive body check that sends players flying", color: "text-destructive" },
    { name: "Sticky Puck", effect: "Perfect puck control for amazing dekes", color: "text-secondary" }
  ];

  if (selectedMode) {
    const mode = arcadeModes.find(m => m.id === selectedMode)!;
    
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-background via-background/95 to-primary/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <Button variant="outline" onClick={() => setSelectedMode(null)} className="absolute top-6 left-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              BACK TO MODES
            </Button>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {mode.title}
            </h1>
            <p className="text-muted-foreground text-lg">
              {mode.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-center">GAME SETUP</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-2">{mode.players}</Badge>
                    <p className="text-sm text-muted-foreground">Players</p>
                  </div>
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-2">{mode.difficulty}</Badge>
                    <p className="text-sm text-muted-foreground">Difficulty</p>
                  </div>
                </div>
                
                {mode.powerUps && (
                  <div className="space-y-3">
                    <h3 className="font-bold text-center">Available Power-Ups</h3>
                    {powerUps.slice(0, 3).map((powerUp, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-muted/20 rounded">
                        <Sparkles className={`w-5 h-5 ${powerUp.color}`} />
                        <div>
                          <p className="font-bold text-sm">{powerUp.name}</p>
                          <p className="text-xs text-muted-foreground">{powerUp.effect}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Button size="lg" className="w-full">
                  START MATCH
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-center">ARCADE FEATURES</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-primary" />
                    <span>Faster-paced gameplay</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Sparkles className="w-5 h-5 text-secondary" />
                    <span>Special celebrations</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Trophy className="w-5 h-5 text-accent" />
                    <span>Unique scoring system</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-secondary" />
                    <span>Custom team uniforms</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground text-center">
                    Experience hockey like never before with arcade-style action, 
                    special effects, and game-changing power-ups!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8 shadow-lg">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">ONLINE MULTIPLAYER</h3>
              <p className="text-muted-foreground mb-6">
                Connect with players worldwide in the World of CHEL. Create your club, 
                customize your player, and compete in seasonal events.
              </p>
              <Badge variant="secondary">
                FULL ONLINE FEATURES COMING SOON
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-background via-background/95 to-primary/10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Button variant="outline" onClick={onBack} className="absolute top-6 left-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            BACK TO MENU
          </Button>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            WORLD OF CHEL
          </h1>
          <p className="text-muted-foreground text-lg">
            Arcade hockey modes with power-ups and special abilities
          </p>
          <Badge variant="secondary" className="mt-2">
            🎮 ARCADE HOCKEY EXPERIENCE
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {arcadeModes.map((mode) => (
            <Card 
              key={mode.id}
              className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group"
              onClick={() => setSelectedMode(mode.id)}
            >
              <CardHeader className="text-center">
                <mode.icon className="w-12 h-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
                <CardTitle className="text-xl">{mode.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-center">{mode.description}</p>
                
                <div className="flex justify-center gap-2">
                  <Badge variant="secondary">{mode.players}</Badge>
                  <Badge variant="secondary">{mode.difficulty}</Badge>
                  {mode.powerUps && <Badge variant="secondary">Power-Ups</Badge>}
                </div>
                
                <Button className="w-full">
                  PLAY MODE
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">ARCADE POWER-UPS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {powerUps.map((powerUp, index) => (
                <div key={index} className="p-4 bg-muted/10 rounded border">
                  <div className="flex items-center space-x-3 mb-2">
                    <Sparkles className={`w-5 h-5 ${powerUp.color}`} />
                    <h3 className="font-bold">{powerUp.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{powerUp.effect}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};