import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import nhlLogo from "@/assets/nhl-ultimate-logo.png";

interface IntroductionScreenProps {
  onComplete: () => void;
}

const IntroductionScreen = ({ onComplete }: IntroductionScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center ice-surface">
      <div className="text-center space-y-8 max-w-md mx-auto px-4">
        <div className="flex justify-center mb-8">
          <img 
            src={nhlLogo} 
            alt="NHL Ultimate Mobile" 
            className="w-32 h-32 animate-ice-glimmer" 
          />
        </div>
        
        <h1 className="text-5xl font-bold bg-gradient-to-r from-ice-blue via-primary to-gold bg-clip-text text-transparent">
          NHL ULTIMATE
        </h1>
        
        <h2 className="text-2xl font-semibold text-foreground">
          MOBILE
        </h2>
        
        <div className="space-y-4">
          <div className="text-lg text-muted-foreground">
            Loading your hockey experience...
          </div>
          
          <Progress value={progress} className="h-4 bg-muted/30" />
          
          <div className="text-sm text-muted-foreground">
            {progress}%
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground animate-pulse">
          Preparing the ice...
        </div>
      </div>
    </div>
  );
};

export default IntroductionScreen;