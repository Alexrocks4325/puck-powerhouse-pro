import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PlayerCard from "./PlayerCard";
import { nhlPlayerDatabase, Player } from "@/data/nhlPlayerDatabase";
import { 
  Trophy, 
  Star, 
  Users, 
  Target,
  CheckCircle,
  Circle,
  Crown,
  Award,
  Medal,
  Gem,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface RosterCollectionProps {
  playerData: {
    team: Player[];
    coins: number;
    level: number;
    selectedTeam: string;
  };
  setPlayerData: (data: any) => void;
  onNavigate: (screen: string) => void;
}

const RosterCollection = ({ playerData, setPlayerData, onNavigate }: RosterCollectionProps) => {
  const [selectedDivision, setSelectedDivision] = useState<'all' | 'atlantic' | 'metropolitan' | 'central' | 'pacific'>('all');
  const [selectedRarity, setSelectedRarity] = useState<'all' | 'bronze' | 'silver' | 'gold' | 'elite' | 'legend'>('all');
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);

  // Get teams based on division filter
  const availableTeams = useMemo(() => {
    if (selectedDivision === 'all') {
      return [...new Set(nhlPlayerDatabase.map(player => player.team))].sort();
    }
    const divisionTeams = divisions[selectedDivision as keyof typeof divisions] || [];
    return divisionTeams.filter(team => 
      nhlPlayerDatabase.some(player => player.team === team)
    );
  }, [selectedDivision]);

  // Organize teams by division
  const divisions = {
    atlantic: ['FLA', 'TBL', 'TOR', 'MTL', 'DET', 'BOS', 'BUF', 'OTT'],
    metropolitan: ['WSH', 'PIT', 'PHI', 'NYR', 'NJD', 'NYI', 'CAR', 'CBJ'],
    central: ['WPG', 'DAL', 'COL', 'STL', 'MIN', 'NSH', 'CHI', 'ARI'],
    pacific: ['VGK', 'LAK', 'EDM', 'VAN', 'SEA', 'CGY', 'SJS', 'ANA']
  };

  // Get current team
  const currentTeam = availableTeams[currentTeamIndex] || null;

  // Navigation functions
  const goToNextTeam = () => {
    setCurrentTeamIndex((prev) => (prev + 1) % availableTeams.length);
  };

  const goToPrevTeam = () => {
    setCurrentTeamIndex((prev) => (prev - 1 + availableTeams.length) % availableTeams.length);
  };

  // Get players for current team and apply rarity filter
  const currentTeamPlayers = useMemo(() => {
    if (!currentTeam) return [];
    
    let teamPlayers = nhlPlayerDatabase.filter(player => player.team === currentTeam);
    
    // Apply rarity filter
    if (selectedRarity !== 'all') {
      teamPlayers = teamPlayers.filter(player => player.rarity === selectedRarity);
    }
    
    // Sort by overall rating (highest first)
    return teamPlayers.sort((a, b) => b.overall - a.overall);
  }, [currentTeam, selectedRarity]);

  // Check if player is owned
  const isPlayerOwned = (playerId: number) => {
    return playerData.team.some(p => p.id === playerId);
  };

  // Reset team index when division changes
  const handleDivisionChange = (newDivision: any) => {
    setSelectedDivision(newDivision);
    setCurrentTeamIndex(0);
  };

  // Get collection stats
  const collectionStats = useMemo(() => {
    const total = nhlPlayerDatabase.length;
    const owned = nhlPlayerDatabase.filter(p => isPlayerOwned(p.id)).length;
    
    const byRarity = {
      bronze: { total: 0, owned: 0 },
      silver: { total: 0, owned: 0 },
      gold: { total: 0, owned: 0 },
      elite: { total: 0, owned: 0 },
      legend: { total: 0, owned: 0 }
    };

    nhlPlayerDatabase.forEach(player => {
      byRarity[player.rarity].total++;
      if (isPlayerOwned(player.id)) {
        byRarity[player.rarity].owned++;
      }
    });

    return { total, owned, percentage: Math.round((owned / total) * 100), byRarity };
  }, [playerData.team]);

  // Get rarity color and icon with proper colors
  const getRarityInfo = (rarity: string) => {
    switch (rarity) {
      case 'legend':
        return { color: 'text-purple-400', icon: Crown, bgColor: 'bg-purple-500/10', borderColor: 'border-purple-400' };
      case 'elite':
        return { color: 'text-yellow-400', icon: Award, bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-400' };
      case 'gold':
        return { color: 'text-yellow-600', icon: Medal, bgColor: 'bg-yellow-600/10', borderColor: 'border-yellow-600' };
      case 'silver':
        return { color: 'text-gray-300', icon: Gem, bgColor: 'bg-gray-300/10', borderColor: 'border-gray-300' };
      case 'bronze':
        return { color: 'text-amber-700', icon: Star, bgColor: 'bg-amber-700/10', borderColor: 'border-amber-700' };
      default:
        return { color: 'text-gray-400', icon: Star, bgColor: 'bg-gray-400/10', borderColor: 'border-gray-400' };
    }
  };

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 text-foreground">NHL Roster Collection</h1>
        <p className="text-muted-foreground">Complete your ultimate NHL card collection</p>
      </div>

      {/* Collection Overview */}
      <Card className="game-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-gold" />
            Collection Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{collectionStats.owned}</div>
              <div className="text-sm text-muted-foreground">Total Collected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">{collectionStats.total}</div>
              <div className="text-sm text-muted-foreground">Total Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gold">{collectionStats.percentage}%</div>
              <div className="text-sm text-muted-foreground">Completion</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{collectionStats.byRarity.legend.owned}/{collectionStats.byRarity.legend.total}</div>
              <div className="text-sm text-muted-foreground">Legends</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gold">{collectionStats.byRarity.elite.owned}/{collectionStats.byRarity.elite.total}</div>
              <div className="text-sm text-muted-foreground">Elite</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{collectionStats.byRarity.gold.owned}/{collectionStats.byRarity.gold.total}</div>
              <div className="text-sm text-muted-foreground">Gold</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-primary to-gold h-3 rounded-full transition-all duration-500"
              style={{ width: `${collectionStats.percentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="game-card">
        <CardContent className="pt-6">
          <Tabs value={selectedDivision} onValueChange={handleDivisionChange}>
            <TabsList className="grid w-full grid-cols-5 mb-4">
              <TabsTrigger value="all">All Divisions</TabsTrigger>
              <TabsTrigger value="atlantic">Atlantic</TabsTrigger>
              <TabsTrigger value="metropolitan">Metropolitan</TabsTrigger>
              <TabsTrigger value="central">Central</TabsTrigger>
              <TabsTrigger value="pacific">Pacific</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap gap-2 mb-4">
            <Button 
              variant={selectedRarity === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRarity('all')}
            >
              All Rarities
            </Button>
            {(['bronze', 'silver', 'gold', 'elite', 'legend'] as const).map(rarity => {
              const rarityInfo = getRarityInfo(rarity);
              const IconComponent = rarityInfo.icon;
              return (
                <Button 
                  key={rarity}
                  variant={selectedRarity === rarity ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRarity(rarity)}
                  className={selectedRarity === rarity ? rarityInfo.bgColor : ''}
                >
                  <IconComponent className={`w-4 h-4 mr-1 ${rarityInfo.color}`} />
                  {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                  <Badge variant="secondary" className="ml-2">
                    {collectionStats.byRarity[rarity].owned}/{collectionStats.byRarity[rarity].total}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Team Navigation and Player Grid */}
      <Card className="game-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevTeam}
                disabled={availableTeams.length <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="text-center">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  {currentTeam ? `${currentTeam} Roster` : 'No Teams Available'}
                </CardTitle>
                {availableTeams.length > 1 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Team {currentTeamIndex + 1} of {availableTeams.length}
                  </p>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextTeam}
                disabled={availableTeams.length <= 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            {currentTeam && (
              <div className="text-right">
                <Badge variant="outline" className="mb-2">
                  {currentTeamPlayers.length} Players
                  {selectedRarity !== 'all' && ` (${selectedRarity})`}
                </Badge>
                <div className="text-sm text-muted-foreground">
                  {currentTeamPlayers.filter(p => isPlayerOwned(p.id)).length} Owned
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {currentTeam && currentTeamPlayers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {currentTeamPlayers.map(player => {
                const owned = isPlayerOwned(player.id);
                const rarityInfo = getRarityInfo(player.rarity);
                return (
                  <div key={player.id} className="relative group">
                    <div className={`relative ${owned ? 'animate-pulse' : 'opacity-60 grayscale'}`}>
                      <PlayerCard 
                        player={player}
                        size="small"
                      />
                      
                      {/* Ownership Indicator */}
                      <div className="absolute top-2 right-2 z-30">
                        {owned ? (
                          <div className="bg-green-500 rounded-full p-1 shadow-lg animate-glow">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="bg-gray-500/70 rounded-full p-1">
                            <Circle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Shine Effect for Owned Cards */}
                      {owned && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000 ease-in-out" />
                      )}
                    </div>

                    {/* Player Details on Hover */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-2 text-xs transform translate-y-full group-hover:translate-y-0 transition-transform duration-200 rounded-b-lg">
                      <div className="font-semibold">{player.name}</div>
                      <div className="text-gray-300">{player.team} • {player.position} • {player.overall} OVR</div>
                      <div className={`text-xs capitalize font-medium ${rarityInfo.color}`}>
                        {player.rarity}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : currentTeam ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                No {selectedRarity !== 'all' ? selectedRarity : ''} players found for {currentTeam}
              </p>
              <Button onClick={() => setSelectedRarity('all')}>
                Show All Rarities
              </Button>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No teams available</p>
              <Button onClick={() => setSelectedDivision('all')}>
                Show All Divisions
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex justify-center gap-4">
        <Button 
          onClick={() => onNavigate('packs')}
          className="btn-primary"
        >
          Open Packs to Collect More
        </Button>
        <Button 
          variant="outline"
          onClick={() => onNavigate('team')}
        >
          Manage Active Team
        </Button>
      </div>
    </div>
  );
};

export default RosterCollection;