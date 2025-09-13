import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Coins, Package, ArrowLeft, Star, Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface UltimateModeHeaderProps {
  playerData: {
    coins: number;
    packs: number;
    level: number;
    experience: number;
    experienceToNext: number;
    team: any[];
  };
  onBack: () => void;
  onCoinsClick: () => void;
  onPacksClick: () => void;
  activeTab: string;
  title: string;
}

const UltimateModeHeader = ({ 
  playerData, 
  onBack, 
  onCoinsClick, 
  onPacksClick, 
  activeTab,
  title 
}: UltimateModeHeaderProps) => {
  const experiencePercent = (playerData.experience / playerData.experienceToNext) * 100;

  return (
    <motion.div 
      className="bg-gradient-to-r from-card via-card/95 to-card p-4 border-b border-border sticky top-0 z-10 backdrop-blur-sm"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left side - Back button and title */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Menu
          </Button>
          <div className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-gold" />
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
          </div>
        </div>

        {/* Center - Player level and experience */}
        <div className="hidden md:flex items-center space-x-4">
          <Card className="px-4 py-2 bg-card/80">
            <div className="flex items-center space-x-3">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Level</div>
                <div className="text-lg font-bold text-primary">{playerData.level}</div>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="min-w-[120px]">
                <div className="text-xs text-muted-foreground mb-1">Experience</div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-primary to-gold"
                    initial={{ width: 0 }}
                    animate={{ width: `${experiencePercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {playerData.experience} / {playerData.experienceToNext}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right side - Stats and actions */}
        <div className="flex items-center space-x-3">
          {/* Team size */}
          <div className="hidden sm:flex items-center space-x-2 text-sm">
            <Star className="w-4 h-4 text-ice-blue" />
            <span className="font-medium">{playerData.team.length}</span>
            <span className="text-muted-foreground">Players</span>
          </div>

          {/* Coins */}
          <motion.button
            onClick={onCoinsClick}
            className="flex items-center space-x-2 bg-gold/20 hover:bg-gold/30 px-3 py-2 rounded-lg border border-gold/30 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Coins className="w-4 h-4 text-gold" />
            <span className="font-bold text-gold">{playerData.coins.toLocaleString()}</span>
          </motion.button>

          {/* Packs */}
          <motion.button
            onClick={onPacksClick}
            className="flex items-center space-x-2 bg-primary/20 hover:bg-primary/30 px-3 py-2 rounded-lg border border-primary/30 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Package className="w-4 h-4 text-primary" />
            <span className="font-bold text-primary">{playerData.packs}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default UltimateModeHeader;