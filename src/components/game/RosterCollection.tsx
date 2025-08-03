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
  Gem
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
  const [selectedTeam, setSelectedTeam] = useState<string>('all');

  // Get unique teams from the database
  const teams = useMemo(() => {
    const uniqueTeams = [...new Set(nhlPlayerDatabase.map(player => player.team))].sort();
    return uniqueTeams;
  }, []);

  // Organize teams by division
  const divisions = {
    atlantic: ['FLA', 'TBL', 'TOR', 'MTL', 'DET', 'BOS', 'BUF', 'OTT'],
    metropolitan: ['WSH', 'PIT', 'PHI', 'NYR', 'NJD', 'NYI', 'CAR', 'CBJ'],
    central: ['WPG', 'DAL', 'COL', 'STL', 'MIN', 'NSH', 'CHI', 'ARI'],
    pacific: ['VGK', 'LAK', 'EDM', 'VAN', 'SEA', 'CGY', 'SJS', 'ANA']
  };

  // Get all teams in selected division
  const getTeamsInDivision = (division: string) => {
    if (division === 'all') return teams;
    return divisions[division as keyof typeof divisions] || [];
  };

  // Filter players based on selections
  const filteredPlayers = useMemo(() => {
    let filtered = nhlPlayerDatabase;

    // Filter by division/team
    if (selectedDivision !== 'all') {
      const divisionTeams = getTeamsInDivision(selectedDivision);
      filtered = filtered.filter(player => divisionTeams.includes(player.team));
    }

    if (selectedTeam !== 'all') {
      filtered = filtered.filter(player => player.team === selectedTeam);
    }

    // Filter by rarity
    if (selectedRarity !== 'all') {
      filtered = filtered.filter(player => player.rarity === selectedRarity);
    }

    return filtered;
  }, [selectedDivision, selectedTeam, selectedRarity]);

  // Check if player is owned
  const isPlayerOwned = (playerId: number) => {
    return playerData.team.some(p => p.id === playerId);
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

  // Get rarity color and icon
  const getRarityInfo = (rarity: string) => {
    switch (rarity) {
      case 'legend':
        return { color: 'text-purple-400', icon: Crown, bgColor: 'bg-purple-500/10' };
      case 'elite':
        return { color: 'text-gold', icon: Award, bgColor: 'bg-yellow-500/10' };
      case 'gold':
        return { color: 'text-yellow-500', icon: Medal, bgColor: 'bg-yellow-400/10' };
      case 'silver':
        return { color: 'text-gray-400', icon: Gem, bgColor: 'bg-gray-400/10' };
      case 'bronze':
        return { color: 'text-amber-600', icon: Star, bgColor: 'bg-amber-600/10' };
      default:
        return { color: 'text-gray-400', icon: Star, bgColor: 'bg-gray-400/10' };
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
          <Tabs value={selectedDivision} onValueChange={(value) => {
            setSelectedDivision(value as any);
            setSelectedTeam('all');
          }}>
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

          {selectedDivision !== 'all' && (
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={selectedTeam === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTeam('all')}
              >
                All Teams
              </Button>
              {getTeamsInDivision(selectedDivision).map(team => {
                const teamPlayers = nhlPlayerDatabase.filter(p => p.team === team);
                const ownedInTeam = teamPlayers.filter(p => isPlayerOwned(p.id)).length;
                return (
                  <Button 
                    key={team}
                    variant={selectedTeam === team ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTeam(team)}
                  >
                    {team}
                    <Badge variant="secondary" className="ml-2">
                      {ownedInTeam}/{teamPlayers.length}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Player Grid */}
      <Card className="game-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-6 h-6" />
              {selectedTeam !== 'all' ? `${selectedTeam} Roster` : 
               selectedDivision !== 'all' ? `${selectedDivision.charAt(0).toUpperCase() + selectedDivision.slice(1)} Division` :
               'All Players'}
            </span>
            <Badge variant="outline">
              {filteredPlayers.length} Players
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPlayers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {filteredPlayers.map(player => {
                const owned = isPlayerOwned(player.id);
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
                      <div className={`text-xs capitalize ${getRarityInfo(player.rarity).color}`}>
                        {player.rarity}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No players found with current filters</p>
              <Button onClick={() => {
                setSelectedDivision('all');
                setSelectedTeam('all');
                setSelectedRarity('all');
              }}>
                Clear Filters
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