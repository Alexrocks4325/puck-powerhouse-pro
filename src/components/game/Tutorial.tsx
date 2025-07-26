import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import GameHeader from "./GameHeader";
import { ArrowRight, Package, Trophy, Star, Users, Target, Award } from "lucide-react";

interface TutorialProps {
  onComplete: () => void;
}

const Tutorial = ({ onComplete }: TutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: "Welcome to NHL Ultimate Mobile!",
      icon: <Trophy className="w-16 h-16 text-gold" />,
      content: "Build your ultimate hockey team with NHL superstars and compete in various game modes.",
      tips: ["Collect players through packs", "Build team chemistry", "Compete in seasons and leagues"]
    },
    {
      title: "Open Packs to Get Players",
      icon: <Package className="w-16 h-16 text-primary" />,
      content: "Packs contain random players of different rarities. Higher rarity players have better stats.",
      tips: ["Standard packs cost 500 coins", "Premium packs guarantee better players", "Save coins for premium packs when possible"]
    },
    {
      title: "Build Your Team",
      icon: <Users className="w-16 h-16 text-ice-blue" />,
      content: "Arrange your players in different positions. Team chemistry affects performance in games.",
      tips: ["Match players from same teams", "Balance offensive and defensive players", "Upgrade players to improve stats"]
    },
    {
      title: "Play Season Mode",
      icon: <Star className="w-16 h-16 text-hockey-red" />,
      content: "Compete against NHL teams to earn coins and packs. Difficulty increases based on your team strength.",
      tips: ["Win games to earn coins", "Complete seasons for bonus rewards", "Unlock Stanley Cup playoffs"]
    },
    {
      title: "Complete Tasks & Challenges",
      icon: <Target className="w-16 h-16 text-green-500" />,
      content: "Daily and weekly tasks provide additional rewards and help you progress faster.",
      tips: ["Check tasks daily", "Some tasks unlock special players", "Complete all weekly tasks for bonus packs"]
    },
    {
      title: "Compete in Leagues",
      icon: <Award className="w-16 h-16 text-purple-500" />,
      content: "Join leagues to compete with other players worldwide and earn exclusive rewards.",
      tips: ["Higher leagues offer better rewards", "Team chemistry is crucial", "Season rankings reset monthly"]
    }
  ];

  const currentTutorial = tutorialSteps[currentStep];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen ice-surface">
      <GameHeader title="Tutorial" />
      
      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-2">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          <Card className="game-card p-8 text-center">
            <div className="flex justify-center mb-6">
              {currentTutorial.icon}
            </div>
            
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              {currentTutorial.title}
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {currentTutorial.content}
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {currentTutorial.tips.map((tip, index) => (
                <Card key={index} className="p-4 bg-primary/5 border-primary/20">
                  <Badge variant="outline" className="mb-2">
                    Tip {index + 1}
                  </Badge>
                  <p className="text-sm text-muted-foreground">{tip}</p>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline" 
                onClick={handleSkip}
                className="border-muted text-muted-foreground"
              >
                Skip Tutorial
              </Button>
              
              <Button 
                onClick={handleNext}
                className="btn-primary px-8"
              >
                {currentStep < tutorialSteps.length - 1 ? (
                  <>
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  "Start Playing!"
                )}
              </Button>
            </div>
          </Card>
          
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {tutorialSteps.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;