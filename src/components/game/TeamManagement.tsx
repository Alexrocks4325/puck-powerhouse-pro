import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GameHeader from "./GameHeader";
import PlayerCard from "./PlayerCard";
import { Users, TrendingUp, Calendar, Package, Target, Award, Zap, Star } from "lucide-react";

interface TeamManagementProps {
  playerData: {
    coins: number;
    level: number;
    team: any[];
    packs: number;
  };
  setPlayerData: (data: any) => void;
  onNavigate: (screen: 'menu' | 'tutorial' | 'packs' | 'team' | 'season' | 'tasks' | 'leagues') => void;
}

const TeamManagement = ({ playerData, setPlayerData, onNavigate }: TeamManagementProps) => {
  // Calculate team chemistry
  const calculateTeamChemistry = () => {
    if (playerData.team.length === 0) return 0;
    
    const teamGroups = {};
    const chemistryTypes = {};
    
    playerData.team.forEach(player => {
      // Count players by team
      teamGroups[player.team] = (teamGroups[player.team] || 0) + 1;
      
      // Count chemistry types
      if (player.chemistry) {
        player.chemistry.forEach(chem => {
          chemistryTypes[chem] = (chemistryTypes[chem] || 0) + 1;
        });
      }
    });
    
    // Calculate chemistry score
    let chemistryScore = 0;
    Object.values(teamGroups).forEach((count: number) => {
      if (count >= 2) chemistryScore += count * 10; // Same team bonus
    });
    
    Object.values(chemistryTypes).forEach((count: number) => {
      if (count >= 2) chemistryScore += count * 5; // Same chemistry bonus
    });
    
    return Math.min(100, chemistryScore);
  };

  const teamChemistry = calculateTeamChemistry();
  const teamOverall = playerData.team.length > 0 
    ? Math.round(playerData.team.reduce((sum, player) => sum + player.overall, 0) / playerData.team.length)
    : 0;

  const getLineup = () => {
    const lineup = {
      LW: null,
      C: null,
      RW: null,
      LD: null,
      RD: null,
      G: null
    };
    
    // Auto-fill with best players by position
    playerData.team.forEach(player => {
      if (!lineup[player.position] || player.overall > (lineup[player.position]?.overall || 0)) {
        lineup[player.position] = player;
      }
    });
    
    return lineup;
  };

  const lineup = getLineup();

  const handleAutoFill = () => {
    alert("Lineup auto-filled with your best players!");
  };

  return (
    <div className="min-h-screen ice-surface">
      <GameHeader 
        playerData={playerData}
        showBackButton 
        onBack={() => onNavigate('menu')}
        title="Team HQ"
      />
      
      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Team Headquarters</h1>
          <p className="text-xl text-muted-foreground">Manage your team, improve chemistry, and dominate the ice</p>
        </div>

        {/* Team Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="game-card p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">{teamOverall}</div>
            <div className="text-sm text-muted-foreground">Team Overall</div>
          </Card>
          
          <Card className="game-card p-4 text-center">
            <div className="flex items-center justify-center mb-1">
              <Zap className="w-5 h-5 text-gold mr-1" />
              <span className="text-2xl font-bold text-gold">{teamChemistry}</span>
            </div>
            <div className="text-sm text-muted-foreground">Team Chemistry</div>
          </Card>
          
          <Card className="game-card p-4 text-center">
            <div className="text-2xl font-bold text-ice-blue mb-1">{playerData.team.length}</div>
            <div className="text-sm text-muted-foreground">Players</div>
          </Card>
          
          <Card className="game-card p-4 text-center">
            <div className="text-2xl font-bold text-foreground mb-1">{playerData.level}</div>
            <div className="text-sm text-muted-foreground">Team Level</div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card 
            className="game-card p-4 text-center cursor-pointer hover:scale-105 transition-transform" 
            onClick={() => onNavigate('season')}
          >
            <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
            <span className="text-sm font-semibold">Season Mode</span>
            <p className="text-xs text-muted-foreground mt-1">Play & earn rewards</p>
          </Card>

          <Card 
            className="game-card p-4 text-center cursor-pointer hover:scale-105 transition-transform" 
            onClick={() => onNavigate('packs')}
          >
            <Package className="w-8 h-8 mx-auto mb-2 text-gold" />
            <span className="text-sm font-semibold">Open Packs</span>
            <p className="text-xs text-muted-foreground mt-1">Get new players</p>
          </Card>

          <Card 
            className="game-card p-4 text-center cursor-pointer hover:scale-105 transition-transform"
            onClick={() => onNavigate('tasks')}
          >
            <Target className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <span className="text-sm font-semibold">Tasks</span>
            <p className="text-xs text-muted-foreground mt-1">Complete challenges</p>
          </Card>

          <Card 
            className="game-card p-4 text-center cursor-pointer hover:scale-105 transition-transform"
            onClick={() => onNavigate('leagues')}
          >
            <Award className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <span className="text-sm font-semibold">Leagues</span>
            <p className="text-xs text-muted-foreground mt-1">Compete online</p>
          </Card>
        </div>

        <Tabs defaultValue="lineup" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="lineup">Lineup</TabsTrigger>
            <TabsTrigger value="collection">Collection</TabsTrigger>
            <TabsTrigger value="chemistry">Chemistry</TabsTrigger>
            <TabsTrigger value="upgrades">Upgrades</TabsTrigger>
          </TabsList>

          <TabsContent value="lineup" className="space-y-6">
            <Card className="game-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-foreground">Starting Lineup</h3>
                <Button onClick={handleAutoFill} className="btn-primary">
                  Auto-Fill Best Players
                </Button>
              </div>
              
              {/* Hockey Formation */}
              <div className="relative bg-ice-dark/30 rounded-lg p-8 min-h-96">
                {/* Ice rink outline */}
                <div className="absolute inset-4 border-2 border-primary/30 rounded-lg">
                  {/* Center ice */}
                  <div className="absolute top-1/2 left-1/2 w-16 h-16 border-2 border-primary/30 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
                </div>

                {/* Player positions */}
                <div className="relative h-full">
                  {/* Forward line */}
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex space-x-8">
                    {/* Left Wing */}
                    <div className="text-center">
                      {lineup.LW ? (
                        <PlayerCard player={lineup.LW} size="small" />
                      ) : (
                        <div className="w-20 h-28 bg-muted/30 rounded border border-dashed border-muted mb-2 flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">LW</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Center */}
                    <div className="text-center">
                      {lineup.C ? (
                        <PlayerCard player={lineup.C} size="small" />
                      ) : (
                        <div className="w-20 h-28 bg-muted/30 rounded border border-dashed border-muted mb-2 flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">C</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Right Wing */}
                    <div className="text-center">
                      {lineup.RW ? (
                        <PlayerCard player={lineup.RW} size="small" />
                      ) : (
                        <div className="w-20 h-28 bg-muted/30 rounded border border-dashed border-muted mb-2 flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">RW</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Defense line */}
                  <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-12">
                    {/* Left Defense */}
                    <div className="text-center">
                      {lineup.LD ? (
                        <PlayerCard player={lineup.LD} size="small" />
                      ) : (
                        <div className="w-20 h-28 bg-muted/30 rounded border border-dashed border-muted mb-2 flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">LD</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Right Defense */}
                    <div className="text-center">
                      {lineup.RD ? (
                        <PlayerCard player={lineup.RD} size="small" />
                      ) : (
                        <div className="w-20 h-28 bg-muted/30 rounded border border-dashed border-muted mb-2 flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">RD</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Goalie */}
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                    <div className="text-center">
                      {lineup.G ? (
                        <PlayerCard player={lineup.G} size="small" />
                      ) : (
                        <div className="w-20 h-28 bg-muted/30 rounded border border-dashed border-muted mb-2 flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">G</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="collection" className="space-y-6">
            <Card className="game-card p-6">
              <h3 className="text-2xl font-bold mb-4 text-foreground">Player Collection</h3>
              
              {playerData.team.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {playerData.team.map((player, index) => (
                    <PlayerCard key={`${player.id}-${index}`} player={player} size="small" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">Your collection is empty</p>
                  <Button 
                    className="btn-primary"
                    onClick={() => onNavigate('packs')}
                  >
                    Open Your First Pack
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="chemistry" className="space-y-6">
            <Card className="game-card p-6">
              <h3 className="text-2xl font-bold mb-4 text-foreground">Team Chemistry</h3>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-semibold">Overall Chemistry</span>
                  <span className="text-2xl font-bold text-gold">{teamChemistry}/100</span>
                </div>
                <div className="w-full bg-muted/30 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-gold to-yellow-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${teamChemistry}%` }}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold mb-3 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-primary" />
                    Team Synergies
                  </h4>
                  <div className="space-y-2">
                     {Object.entries(
                       playerData.team.reduce((acc: Record<string, number>, player) => {
                         acc[player.team] = (acc[player.team] || 0) + 1;
                         return acc;
                       }, {})
                     ).map(([team, count]) => (
                       <div key={team} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                         <span className="font-medium">{team}</span>
                         <Badge variant={(count as number) >= 2 ? "default" : "outline"}>
                           {count as number} player{(count as number) !== 1 ? 's' : ''}
                         </Badge>
                       </div>
                     ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-gold" />
                    Chemistry Types
                  </h4>
                  <div className="space-y-2">
                     {Object.entries(
                       playerData.team.reduce((acc: Record<string, number>, player) => {
                         if (player.chemistry) {
                           player.chemistry.forEach((chem: string) => {
                             acc[chem] = (acc[chem] || 0) + 1;
                           });
                         }
                         return acc;
                       }, {})
                     ).map(([chemistry, count]) => (
                       <div key={chemistry} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                         <span className="font-medium">{chemistry}</span>
                         <Badge variant={(count as number) >= 2 ? "default" : "outline"}>
                           {count as number} player{(count as number) !== 1 ? 's' : ''}
                         </Badge>
                       </div>
                     ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gold/10 border border-gold/30 rounded-lg">
                <h5 className="font-semibold text-gold mb-2">Chemistry Tips</h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Players from the same NHL team get synergy bonuses</li>
                  <li>• Matching chemistry types boost performance</li>
                  <li>• Higher chemistry improves win chances in games</li>
                  <li>• Aim for 2+ players with matching attributes</li>
                </ul>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="upgrades" className="space-y-6">
            <Card className="game-card p-6">
              <h3 className="text-2xl font-bold mb-4 text-foreground">Player Upgrades</h3>
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">Upgrade your players to improve their stats</p>
                <p className="text-sm text-muted-foreground">Coming soon: Use duplicate players and coins to upgrade your team!</p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeamManagement;