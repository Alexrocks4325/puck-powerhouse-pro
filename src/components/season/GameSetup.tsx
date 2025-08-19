import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Play, Zap, Users, Target, Clock } from "lucide-react";
import GameSettingsCard from "@/components/game/GameSettingsCard";
import PlayerLineupCard from "@/components/game/PlayerLineupCard";
import TeamSelectionCard from "@/components/game/TeamSelectionCard";
import PlayerStatsModal from "@/components/game/PlayerStatsModal";
import TeamPickerModal from "@/components/game/TeamPickerModal";

interface GameSetupProps {
  roster: any[];
  opponent: { name: string; difficulty: number; abbreviation?: string; logo?: string } | null;
  onBack: () => void;
  onSimulateFull: (opts: { 
    difficulty: number; 
    gameLength: number; 
    penaltiesEnabled: boolean; 
    overtimeEnabled: boolean;
    selectedPlayers: any[];
    homeTeam?: any;
    awayTeam?: any;
  }) => void;
  onSimulateInteractive?: () => void;
  availableTeams?: any[];
}

// Enhanced NHL teams data
const NHL_TEAMS = [
  // Eastern Conference - Atlantic Division
  { id: 1, name: "Florida Panthers", city: "Florida", abbreviation: "FLA", logo: "https://via.placeholder.com/80x80/C8102E/FFFFFF?text=FLA", conference: "Eastern", wins: 42, losses: 18, otLosses: 5, baseDifficulty: 88 },
  { id: 2, name: "Tampa Bay Lightning", city: "Tampa Bay", abbreviation: "TBL", logo: "https://via.placeholder.com/80x80/002868/FFFFFF?text=TBL", conference: "Eastern", wins: 40, losses: 22, otLosses: 3, baseDifficulty: 87 },
  { id: 3, name: "Toronto Maple Leafs", city: "Toronto", abbreviation: "TOR", logo: "https://via.placeholder.com/80x80/003E7E/FFFFFF?text=TOR", conference: "Eastern", wins: 38, losses: 20, otLosses: 7, baseDifficulty: 86 },
  { id: 4, name: "Boston Bruins", city: "Boston", abbreviation: "BOS", logo: "https://via.placeholder.com/80x80/FFB81C/000000?text=BOS", conference: "Eastern", wins: 35, losses: 25, otLosses: 5, baseDifficulty: 85 },
  { id: 5, name: "Ottawa Senators", city: "Ottawa", abbreviation: "OTT", logo: "https://via.placeholder.com/80x80/C8102E/FFFFFF?text=OTT", conference: "Eastern", wins: 28, losses: 32, otLosses: 7, baseDifficulty: 78 },
  { id: 6, name: "Detroit Red Wings", city: "Detroit", abbreviation: "DET", logo: "https://via.placeholder.com/80x80/CE1126/FFFFFF?text=DET", conference: "Eastern", wins: 27, losses: 33, otLosses: 7, baseDifficulty: 77 },
  
  // Western Conference - Central Division  
  { id: 7, name: "Winnipeg Jets", city: "Winnipeg", abbreviation: "WPG", logo: "https://via.placeholder.com/80x80/041E42/FFFFFF?text=WPG", conference: "Western", wins: 46, losses: 15, otLosses: 4, baseDifficulty: 86 },
  { id: 8, name: "Colorado Avalanche", city: "Colorado", abbreviation: "COL", logo: "https://via.placeholder.com/80x80/6F263D/FFFFFF?text=COL", conference: "Western", wins: 45, losses: 18, otLosses: 2, baseDifficulty: 85 },
  { id: 9, name: "Dallas Stars", city: "Dallas", abbreviation: "DAL", logo: "https://via.placeholder.com/80x80/006341/FFFFFF?text=DAL", conference: "Western", wins: 42, losses: 20, otLosses: 3, baseDifficulty: 84 },
  { id: 10, name: "Nashville Predators", city: "Nashville", abbreviation: "NSH", logo: "https://via.placeholder.com/80x80/FFB81C/000000?text=NSH", conference: "Western", wins: 38, losses: 22, otLosses: 5, baseDifficulty: 82 },
  
  // Western Conference - Pacific Division
  { id: 11, name: "Vegas Golden Knights", city: "Las Vegas", abbreviation: "VGK", logo: "https://via.placeholder.com/80x80/B4975A/000000?text=VGK", conference: "Western", wins: 41, losses: 19, otLosses: 5, baseDifficulty: 87 },
  { id: 12, name: "Edmonton Oilers", city: "Edmonton", abbreviation: "EDM", logo: "https://via.placeholder.com/80x80/041E42/FFFFFF?text=EDM", conference: "Western", wins: 39, losses: 21, otLosses: 5, baseDifficulty: 86 },
  { id: 13, name: "Los Angeles Kings", city: "Los Angeles", abbreviation: "LAK", logo: "https://via.placeholder.com/80x80/111111/FFFFFF?text=LAK", conference: "Western", wins: 36, losses: 24, otLosses: 5, baseDifficulty: 83 },
  { id: 14, name: "Vancouver Canucks", city: "Vancouver", abbreviation: "VAN", logo: "https://via.placeholder.com/80x80/00205B/FFFFFF?text=VAN", conference: "Western", wins: 35, losses: 25, otLosses: 5, baseDifficulty: 82 },
  { id: 15, name: "San Jose Sharks", city: "San Jose", abbreviation: "SJS", logo: "https://via.placeholder.com/80x80/006D75/FFFFFF?text=SJS", conference: "Western", wins: 22, losses: 38, otLosses: 7, baseDifficulty: 71 }
];

export default function GameSetup({ roster, opponent, onBack, onSimulateFull, onSimulateInteractive, availableTeams }: GameSetupProps) {
  const { toast } = useToast();
  
  // Enhanced game settings
  const [difficulty, setDifficulty] = useState<number>(1); // 0-3 for Rookie to Superstar
  const [gameLength, setGameLength] = useState<number>(10);
  const [penaltiesEnabled, setPenaltiesEnabled] = useState<boolean>(true);
  const [overtimeEnabled, setOvertimeEnabled] = useState<boolean>(true);
  
  // Team selection
  const [homeTeam, setHomeTeam] = useState<any>(null);
  const [awayTeam, setAwayTeam] = useState<any>(opponent ? { 
    id: -1, 
    name: opponent.name, 
    abbreviation: opponent.abbreviation || "OPP", 
    logo: opponent.logo || "https://via.placeholder.com/80x80/1B365D/FFFFFF?text=OPP",
    difficulty: opponent.difficulty 
  } : null);
  
  // Player lineup management
  const [selectedPlayers, setSelectedPlayers] = useState<Set<number>>(new Set());
  const [showPlayerStats, setShowPlayerStats] = useState<any>(null);
  const [showTeamPicker, setShowTeamPicker] = useState<{ isOpen: boolean; isHome: boolean }>({ 
    isOpen: false, 
    isHome: false 
  });

  const hasGoalie = useMemo(() => roster?.some((p) => p.position === "G"), [roster]);
  const selectedPlayersList = useMemo(() => 
    roster.filter((_, index) => selectedPlayers.has(index)), 
    [roster, selectedPlayers]
  );
  const hasSelectedGoalie = useMemo(() => 
    selectedPlayersList.some((p) => p.position === "G"), 
    [selectedPlayersList]
  );
  const isLegal = useMemo(() => 
    selectedPlayersList.length >= 6 && hasSelectedGoalie, 
    [selectedPlayersList, hasSelectedGoalie]
  );

  // Initialize with opponent if provided
  useMemo(() => {
    if (opponent && !awayTeam) {
      setAwayTeam({
        id: -1,
        name: opponent.name,
        abbreviation: opponent.abbreviation || "OPP",
        logo: opponent.logo || "https://via.placeholder.com/80x80/1B365D/FFFFFF?text=OPP",
        difficulty: opponent.difficulty
      });
    }
  }, [opponent, awayTeam]);

  // Auto-select best players initially
  useMemo(() => {
    if (roster.length > 0 && selectedPlayers.size === 0) {
      const sortedRoster = roster
        .map((player, index) => ({ ...player, originalIndex: index }))
        .sort((a, b) => (b.overall || 75) - (a.overall || 75));
      
      const goalie = sortedRoster.find(p => p.position === 'G');
      const skaters = sortedRoster.filter(p => p.position !== 'G').slice(0, 5);
      
      const initialSelection = new Set<number>();
      if (goalie) initialSelection.add(goalie.originalIndex);
      skaters.forEach(p => initialSelection.add(p.originalIndex));
      
      setSelectedPlayers(initialSelection);
    }
  }, [roster]);

  const sortedRoster = useMemo(() => {
    return (roster || [])
      .slice()
      .sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0));
  }, [roster]);

  const togglePlayerSelection = (index: number) => {
    setSelectedPlayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleStartGame = () => {
    if (!isLegal) {
      toast({ 
        title: "Invalid lineup", 
        description: "Need at least 1 goalie and 5 skaters selected.", 
        variant: "destructive" 
      });
      return;
    }
    
    if (!awayTeam) {
      toast({
        title: "No opponent selected",
        description: "Please select an opponent team.",
        variant: "destructive"
      });
      return;
    }

    onSimulateFull({ 
      difficulty, 
      gameLength, 
      penaltiesEnabled, 
      overtimeEnabled,
      selectedPlayers: selectedPlayersList,
      homeTeam: homeTeam || { name: "Your Team", abbreviation: "YOU" },
      awayTeam 
    });
  };

  const availableNHLTeams = availableTeams || NHL_TEAMS.map(team => ({
    ...team,
    difficulty: team.baseDifficulty
  }));

  return (
    <div className="container mx-auto px-4 pt-20 pb-8">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="outline" onClick={onBack} className="hover-scale">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Enhanced Game Setup</h1>
      </div>

      <div className="space-y-6">
        {/* Team Selection */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-semibold text-foreground">Team Selection</h2>
          </div>
          
          <div className="flex items-center justify-center gap-8">
            <TeamSelectionCard
              team={homeTeam || {
                name: "Select Home Team",
                logo: "https://via.placeholder.com/80x80/1B365D/FFFFFF?text=HOME"
              }}
              isSelected={!!homeTeam}
              position="HOME"
              onTap={() => setShowTeamPicker({ isOpen: true, isHome: true })}
            />
            
            <div className="text-2xl font-bold text-muted-foreground">VS</div>
            
            <TeamSelectionCard
              team={awayTeam || {
                name: "Select Away Team", 
                logo: "https://via.placeholder.com/80x80/C8102E/FFFFFF?text=AWAY"
              }}
              isSelected={!!awayTeam}
              position="AWAY"
              onTap={() => setShowTeamPicker({ isOpen: true, isHome: false })}
            />
          </div>
        </div>

        {/* Game Settings */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-semibold text-foreground">Game Settings</h2>
          </div>
          
          <GameSettingsCard
            difficulty={difficulty}
            onDifficultyChanged={setDifficulty}
            gameLength={gameLength}
            onGameLengthChanged={setGameLength}
            penaltiesEnabled={penaltiesEnabled}
            onPenaltiesChanged={setPenaltiesEnabled}
            overtimeEnabled={overtimeEnabled}
            onOvertimeChanged={setOvertimeEnabled}
          />
        </div>

        {/* Player Lineup */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Starting Lineup</h2>
            </div>
            <Badge variant={isLegal ? "default" : "destructive"}>
              {isLegal ? `${selectedPlayersList.length} Players Selected` : "Invalid Lineup"}
            </Badge>
          </div>

          <Card className="game-card p-6">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Select at least 1 goalie and 5 skaters. Click players to select/deselect. Long press for detailed stats.
              </p>
            </div>

            <ScrollArea className="h-64">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {sortedRoster.map((player, index) => (
                  <PlayerLineupCard
                    key={player.id}
                    player={player}
                    isSelected={selectedPlayers.has(index)}
                    onTap={() => togglePlayerSelection(index)}
                    onLongPress={() => setShowPlayerStats(player)}
                    size="small"
                  />
                ))}
              </div>
            </ScrollArea>

            {!hasSelectedGoalie && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  ⚠️ You must select at least one goalie to start the game
                </p>
              </div>
            )}

            {selectedPlayersList.length < 6 && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  ⚠️ You need at least 6 players total (1 goalie + 5 skaters)
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Start Game Button */}
        <div className="flex justify-center pt-6">
          <Button 
            onClick={handleStartGame}
            disabled={!isLegal || !awayTeam}
            size="lg"
            className="btn-primary px-8"
          >
            <Play className="w-5 h-5 mr-3" />
            Start Game
          </Button>
        </div>
      </div>

      {/* Modals */}
      <TeamPickerModal
        teams={availableNHLTeams}
        selectedTeam={showTeamPicker.isHome ? homeTeam : awayTeam}
        onTeamSelected={(team) => {
          if (showTeamPicker.isHome) {
            setHomeTeam(team);
          } else {
            setAwayTeam(team);
          }
        }}
        isOpen={showTeamPicker.isOpen}
        onClose={() => setShowTeamPicker({ isOpen: false, isHome: false })}
      />

      <PlayerStatsModal
        player={showPlayerStats}
        isOpen={!!showPlayerStats}
        onClose={() => setShowPlayerStats(null)}
      />
    </div>
  );
}
