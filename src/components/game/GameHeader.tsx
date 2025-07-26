import { Button } from "@/components/ui/button";
import { Coins, Package, User, Home, ArrowLeft } from "lucide-react";

interface GameHeaderProps {
  playerData?: {
    coins: number;
    packs: number;
    level: number;
  };
  showBackButton?: boolean;
  onBack?: () => void;
  title?: string;
}

const GameHeader = ({ playerData, showBackButton = false, onBack, title }: GameHeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {showBackButton && onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-primary hover:text-primary/80"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            <div className="flex items-center space-x-2">
              <Home className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">
                {title || "NHL Ultimate"}
              </h1>
            </div>
          </div>
          
          {playerData && (
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Coins className="w-5 h-5 text-gold" />
                <span className="font-semibold text-gold">
                  {playerData.coins.toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-primary" />
                <span className="font-semibold text-primary">
                  {playerData.packs}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-ice-blue" />
                <span className="font-semibold text-ice-blue">
                  Lvl {playerData.level}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default GameHeader;