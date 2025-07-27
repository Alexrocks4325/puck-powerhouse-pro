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
    const playStyleGroups = {};
    
    playerData.team.forEach(player => {
      // Count players by team
      teamGroups[player.team] = (teamGroups[player.team] || 0) + 1;
      
      // Count players by play style
      if (player.playStyle) {
        playStyleGroups[player.playStyle] = (playStyleGroups[player.playStyle] || 0) + 1;
      }
    });
    
    // Much harder chemistry calculation
    let chemistryScore = 0;
    
    // Same team bonuses (much smaller)
    Object.values(teamGroups).forEach((count: number) => {
      if (count >= 3) chemistryScore += (count - 2) * 3; // Need 3+ for small bonus
      if (count >= 5) chemistryScore += (count - 4) * 2; // Bigger bonus for 5+
    });
    
    // Play style bonuses (also smaller)
    Object.values(playStyleGroups).forEach((count: number) => {
      if (count >= 4) chemistryScore += (count - 3) * 2; // Need 4+ similar styles
    });
    
    // Base chemistry penalty for mixed teams
    const uniqueTeams = Object.keys(teamGroups).length;
    if (uniqueTeams > 8) chemistryScore -= (uniqueTeams - 8) * 3;
    
    return Math.max(0, Math.min(75, chemistryScore)); // Max 75 instead of 100
  };

  const teamChemistry = calculateTeamChemistry();
  const teamOverall = playerData.team.length > 0 
    ? Math.round(playerData.team.reduce((sum, player) => sum + player.overall, 0) / playerData.team.length)
    : 0;

  const getLineup = () => {
    const lineup = {
      // 4 Forward Lines
      LW1: null, C1: null, RW1: null,  // Line 1
      LW2: null, C2: null, RW2: null,  // Line 2  
      LW3: null, C3: null, RW3: null,  // Line 3
      LW4: null, C4: null, RW4: null,  // Line 4
      // 3 Defense Pairs
      LD1: null, RD1: null,  // Pair 1
      LD2: null, RD2: null,  // Pair 2
      LD3: null, RD3: null,  // Pair 3
      // 2 Goalies
      G1: null,   // Starter
      G2: null    // Backup
    };
    
    // Auto-fill with best players by position
    const playersByPosition = {
      C: playerData.team.filter(p => p.position === 'C').sort((a, b) => b.overall - a.overall),
      LW: playerData.team.filter(p => p.position === 'LW').sort((a, b) => b.overall - a.overall),
      RW: playerData.team.filter(p => p.position === 'RW').sort((a, b) => b.overall - a.overall),
      D: playerData.team.filter(p => p.position === 'D').sort((a, b) => b.overall - a.overall),
      G: playerData.team.filter(p => p.position === 'G').sort((a, b) => b.overall - a.overall)
    };

    // Fill forward positions
    lineup.C1 = playersByPosition.C[0] || null;
    lineup.C2 = playersByPosition.C[1] || null;
    lineup.C3 = playersByPosition.C[2] || null;
    lineup.C4 = playersByPosition.C[3] || null;
    
    lineup.LW1 = playersByPosition.LW[0] || null;
    lineup.LW2 = playersByPosition.LW[1] || null;
    lineup.LW3 = playersByPosition.LW[2] || null;
    lineup.LW4 = playersByPosition.LW[3] || null;
    
    lineup.RW1 = playersByPosition.RW[0] || null;
    lineup.RW2 = playersByPosition.RW[1] || null;
    lineup.RW3 = playersByPosition.RW[2] || null;
    lineup.RW4 = playersByPosition.RW[3] || null;
    
    // Fill defense positions
    lineup.LD1 = playersByPosition.D[0] || null;
    lineup.RD1 = playersByPosition.D[1] || null;
    lineup.LD2 = playersByPosition.D[2] || null;
    lineup.RD2 = playersByPosition.D[3] || null;
    lineup.LD3 = playersByPosition.D[4] || null;
    lineup.RD3 = playersByPosition.D[5] || null;
    
    // Fill goalie positions
    lineup.G1 = playersByPosition.G[0] || null;
    lineup.G2 = playersByPosition.G[1] || null;
    
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
              
              {/* Full Roster Layout */}
              <div className="space-y-8">
                {/* Forward Lines */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-foreground">Forward Lines</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Line 1 */}
                    <Card className="game-card p-4">
                      <h5 className="text-sm font-semibold mb-3 text-center text-primary">Line 1</h5>
                      <div className="space-y-2">
                        <div className="text-center">
                          {lineup.LW1 ? (
                            <PlayerCard player={lineup.LW1} size="small" />
                          ) : (
                            <div className="w-16 h-20 bg-muted/30 rounded border border-dashed border-muted mx-auto flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">LW</span>
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          {lineup.C1 ? (
                            <PlayerCard player={lineup.C1} size="small" />
                          ) : (
                            <div className="w-16 h-20 bg-muted/30 rounded border border-dashed border-muted mx-auto flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">C</span>
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          {lineup.RW1 ? (
                            <PlayerCard player={lineup.RW1} size="small" />
                          ) : (
                            <div className="w-16 h-20 bg-muted/30 rounded border border-dashed border-muted mx-auto flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">RW</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>

                    {/* Line 2 */}
                    <Card className="game-card p-4">
                      <h5 className="text-sm font-semibold mb-3 text-center text-primary">Line 2</h5>
                      <div className="space-y-2">
                        <div className="text-center">
                          {lineup.LW2 ? (
                            <PlayerCard player={lineup.LW2} size="small" />
                          ) : (
                            <div className="w-16 h-20 bg-muted/30 rounded border border-dashed border-muted mx-auto flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">LW</span>
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          {lineup.C2 ? (
                            <PlayerCard player={lineup.C2} size="small" />
                          ) : (
                            <div className="w-16 h-20 bg-muted/30 rounded border border-dashed border-muted mx-auto flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">C</span>
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          {lineup.RW2 ? (
                            <PlayerCard player={lineup.RW2} size="small" />
                          ) : (
                            <div className="w-16 h-20 bg-muted/30 rounded border border-dashed border-muted mx-auto flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">RW</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>

                    {/* Line 3 */}
                    <Card className="game-card p-4">
                      <h5 className="text-sm font-semibold mb-3 text-center text-primary">Line 3</h5>
                      <div className="space-y-2">
                        <div className="text-center">
                          {lineup.LW3 ? (
                            <PlayerCard player={lineup.LW3} size="small" />
                          ) : (
                            <div className="w-16 h-20 bg-muted/30 rounded border border-dashed border-muted mx-auto flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">LW</span>
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          {lineup.C3 ? (
                            <PlayerCard player={lineup.C3} size="small" />
                          ) : (
                            <div className="w-16 h-20 bg-muted/30 rounded border border-dashed border-muted mx-auto flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">C</span>
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          {lineup.RW3 ? (
                            <PlayerCard player={lineup.RW3} size="small" />
                          ) : (
                            <div className="w-16 h-20 bg-muted/30 rounded border border-dashed border-muted mx-auto flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">RW</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>

                    {/* Line 4 */}
                    <Card className="game-card p-4">
                      <h5 className="text-sm font-semibold mb-3 text-center text-primary">Line 4</h5>
                      <div className="space-y-2">
                        <div className="text-center">
                          {lineup.LW4 ? (
                            <PlayerCard player={lineup.LW4} size="small" />
                          ) : (
                            <div className="w-16 h-20 bg-muted/30 rounded border border-dashed border-muted mx-auto flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">LW</span>
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          {lineup.C4 ? (
                            <PlayerCard player={lineup.C4} size="small" />
                          ) : (
                            <div className="w-16 h-20 bg-muted/30 rounded border border-dashed border-muted mx-auto flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">C</span>
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          {lineup.RW4 ? (
                            <PlayerCard player={lineup.RW4} size="small" />
                          ) : (
                            <div className="w-16 h-20 bg-muted/30 rounded border border-dashed border-muted mx-auto flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">RW</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Defense Pairs */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-foreground">Defense Pairs</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Pair 1 */}
                    <Card className="game-card p-4">
                      <h5 className="text-sm font-semibold mb-3 text-center text-primary">Pair 1</h5>
                      <div className="flex justify-center space-x-4">
                        <div className="text-center">
                          {lineup.LD1 ? (
                            <PlayerCard player={lineup.LD1} size="small" />
                          ) : (
                            <div className="w-16 h-20 bg-muted/30 rounded border border-dashed border-muted flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">LD</span>
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          {lineup.RD1 ? (
                            <PlayerCard player={lineup.RD1} size="small" />
                          ) : (
                            <div className="w-16 h-20 bg-muted/30 rounded border border-dashed border-muted flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">RD</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>

                    {/* Pair 2 */}
                    <Card className="game-card p-4">
                      <h5 className="text-sm font-semibold mb-3 text-center text-primary">Pair 2</h5>
                      <div className="flex justify-center space-x-4">
                        <div className="text-center">
                          {lineup.LD2 ? (
                            <PlayerCard player={lineup.LD2} size="small" />
                          ) : (
                            <div className="w-16 h-20 bg-muted/30 rounded border border-dashed border-muted flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">LD</span>
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          {lineup.RD2 ? (
                            <PlayerCard player={lineup.RD2} size="small" />
                          ) : (
                            <div className="w-16 h-20 bg-muted/30 rounded border border-dashed border-muted flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">RD</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>

                    {/* Pair 3 */}
                    <Card className="game-card p-4">
                      <h5 className="text-sm font-semibold mb-3 text-center text-primary">Pair 3</h5>
                      <div className="flex justify-center space-x-4">
                        <div className="text-center">
                          {lineup.LD3 ? (
                            <PlayerCard player={lineup.LD3} size="small" />
                          ) : (
                            <div className="w-16 h-20 bg-muted/30 rounded border border-dashed border-muted flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">LD</span>
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          {lineup.RD3 ? (
                            <PlayerCard player={lineup.RD3} size="small" />
                          ) : (
                            <div className="w-16 h-20 bg-muted/30 rounded border border-dashed border-muted flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">RD</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Goalies */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-foreground">Goalies</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-md mx-auto">
                    <Card className="game-card p-4">
                      <h5 className="text-sm font-semibold mb-3 text-center text-primary">Starter</h5>
                      <div className="text-center">
                        {lineup.G1 ? (
                          <PlayerCard player={lineup.G1} size="small" />
                        ) : (
                          <div className="w-16 h-20 bg-muted/30 rounded border border-dashed border-muted mx-auto flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">G</span>
                          </div>
                        )}
                      </div>
                    </Card>

                    <Card className="game-card p-4">
                      <h5 className="text-sm font-semibold mb-3 text-center text-primary">Backup</h5>
                      <div className="text-center">
                        {lineup.G2 ? (
                          <PlayerCard player={lineup.G2} size="small" />
                        ) : (
                          <div className="w-16 h-20 bg-muted/30 rounded border border-dashed border-muted mx-auto flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">G</span>
                          </div>
                        )}
                      </div>
                    </Card>
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
                     Play Styles
                   </h4>
                   <div className="space-y-2">
                      {Object.entries(
                        playerData.team.reduce((acc: Record<string, number>, player) => {
                          if (player.playStyle) {
                            acc[player.playStyle] = (acc[player.playStyle] || 0) + 1;
                          }
                          return acc;
                        }, {})
                      ).map(([playStyle, count]) => (
                        <div key={playStyle} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                          <span className="font-medium">{playStyle}</span>
                          <Badge variant={(count as number) >= 4 ? "default" : "outline"}>
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
                   <li>• Need 3+ players from same team for synergy bonus</li>
                   <li>• Matching play styles boost team performance</li>
                   <li>• Too many different teams hurts chemistry</li>
                   <li>• Maximum chemistry is now 75 - much harder to achieve!</li>
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