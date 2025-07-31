import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { User, Star, Target, ArrowLeft } from "lucide-react";

interface BeAProModeProps {
  onBack: () => void;
}

export const BeAProMode = ({ onBack }: BeAProModeProps) => {
  const [step, setStep] = useState<'create' | 'career'>('create');
  const [playerData, setPlayerData] = useState({
    name: "",
    gender: "male",
    position: "center",
    playStyle: "balanced"
  });

  const positions = [
    { id: "center", name: "Center", description: "Playmaker and face-off specialist" },
    { id: "wing", name: "Winger", description: "Speed and scoring from the sides" },
    { id: "defense", name: "Defenseman", description: "Defensive anchor and puck mover" },
    { id: "goalie", name: "Goaltender", description: "Last line of defense" }
  ];

  const playStyles = [
    { id: "sniper", name: "Sniper", description: "Elite goal scorer with deadly accuracy" },
    { id: "playmaker", name: "Playmaker", description: "Vision and passing to set up teammates" },
    { id: "power", name: "Power Forward", description: "Physical presence with scoring touch" },
    { id: "twoWay", name: "Two-Way", description: "Balanced offensive and defensive play" },
    { id: "enforcer", name: "Enforcer", description: "Physical intimidation and team protection" }
  ];

  const careerPaths = [
    { title: "Junior Hockey", description: "Start in junior leagues and work your way up", difficulty: "Rookie" },
    { title: "College Hockey", description: "Develop skills while getting education", difficulty: "Pro" },
    { title: "European League", description: "Gain experience in international hockey", difficulty: "All-Star" },
    { title: "NHL Draft", description: "Go straight to the big leagues", difficulty: "Superstar" }
  ];

  if (step === 'create') {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-background via-background/95 to-primary/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Button variant="outline" onClick={onBack} className="absolute top-6 left-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              BACK TO MENU
            </Button>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              BE A PRO
            </h1>
            <p className="text-muted-foreground text-lg">
              Create your player and choose your path to hockey greatness
            </p>
            <Badge variant="secondary" className="mt-2">
              🌟 NOW FEATURING FEMALE PLAYERS
            </Badge>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center">CREATE YOUR PLAYER</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Player Name */}
              <div className="space-y-2">
                <Label htmlFor="playerName" className="text-lg">Player Name</Label>
                <Input 
                  id="playerName"
                  placeholder="Enter your player's name"
                  value={playerData.name}
                  onChange={(e) => setPlayerData(prev => ({ ...prev, name: e.target.value }))}
                  className="text-lg"
                />
              </div>

              {/* Gender Selection */}
              <div className="space-y-4">
                <Label className="text-lg">Gender</Label>
                <RadioGroup 
                  value={playerData.gender} 
                  onValueChange={(value) => setPlayerData(prev => ({ ...prev, gender: value }))}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2 p-4 rounded border hover:bg-muted/20">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 rounded border hover:bg-muted/20">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female • PWHL</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Position Selection */}
              <div className="space-y-4">
                <Label className="text-lg">Position</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {positions.map((pos) => (
                    <Card 
                      key={pos.id}
                      className={`cursor-pointer transition-all duration-300 ${
                        playerData.position === pos.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                      }`}
                      onClick={() => setPlayerData(prev => ({ ...prev, position: pos.id }))}
                    >
                      <CardContent className="p-4 text-center">
                        <h3 className="font-bold mb-2">{pos.name}</h3>
                        <p className="text-sm text-muted-foreground">{pos.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Play Style */}
              <div className="space-y-4">
                <Label className="text-lg">Play Style</Label>
                <div className="grid grid-cols-1 gap-3">
                  {playStyles.map((style) => (
                    <Card 
                      key={style.id}
                      className={`cursor-pointer transition-all duration-300 ${
                        playerData.playStyle === style.id ? 'ring-2 ring-secondary' : 'hover:shadow-md'
                      }`}
                      onClick={() => setPlayerData(prev => ({ ...prev, playStyle: style.id }))}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-bold">{style.name}</h3>
                            <p className="text-sm text-muted-foreground">{style.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="text-center pt-6">
                <Button 
                  size="lg" 
                  onClick={() => setStep('career')}
                  disabled={!playerData.name}
                  className="px-12 py-4 text-xl"
                >
                  CHOOSE YOUR PATH
                </Button>
              </div>
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
          <Button variant="outline" onClick={() => setStep('create')} className="absolute top-6 left-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            EDIT PLAYER
          </Button>
          <h1 className="text-3xl font-bold mb-2">{playerData.name}</h1>
          <div className="flex justify-center gap-4">
            <Badge variant="secondary">{positions.find(p => p.id === playerData.position)?.name}</Badge>
            <Badge variant="secondary">{playStyles.find(s => s.id === playerData.playStyle)?.name}</Badge>
            <Badge variant="secondary">{playerData.gender === 'female' ? 'PWHL' : 'NHL'}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {careerPaths.map((path) => (
            <Card key={path.title} className="shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <CardHeader className="text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
                <CardTitle className="text-xl">{path.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">{path.description}</p>
                <Badge variant="secondary" className="mb-4">{path.difficulty}</Badge>
                <Button className="w-full">
                  START CAREER
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">CAREER DEVELOPMENT</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <User className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h3 className="font-bold mb-2">Skill Progression</h3>
                <Progress value={75} className="mb-2" />
                <p className="text-sm text-muted-foreground">Develop your abilities through training and games</p>
              </div>
              <div className="text-center">
                <Star className="w-8 h-8 mx-auto mb-2 text-secondary" />
                <h3 className="font-bold mb-2">Reputation</h3>
                <Progress value={60} className="mb-2" />
                <p className="text-sm text-muted-foreground">Build your reputation with performances and choices</p>
              </div>
              <div className="text-center">
                <Target className="w-8 h-8 mx-auto mb-2 text-accent" />
                <h3 className="font-bold mb-2">Goals</h3>
                <Progress value={40} className="mb-2" />
                <p className="text-sm text-muted-foreground">Complete objectives to advance your career</p>
              </div>
            </div>
            <div className="text-center">
              <Badge variant="secondary">
                FULL CAREER MODE COMING IN RELEASE
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};