import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Users, Shield, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import type { LeagueState, UID } from "@/lib/salary-cap";
import { CapManager, fmtMoney, getCapHitForSeason, isSeasonWithin, prorateByDays } from "@/lib/salary-cap";

// Import types from FranchiseMode for compatibility
type ID = string;
export type SeasonState = {
  seasonYear: string;
  currentDay: number;
  totalDays: number;
  schedule: any[];
  boxScores: Record<string, any>;
  teams: Record<ID, any>;
  teamOrder: ID[];
  // Salary Cap System
  capLeague: LeagueState;
  capManager: CapManager;
  tradeEngine: any;
};

interface MyTeamCapOverviewProps {
  state: SeasonState;
  myTeamId: ID;
}

export default function MyTeamCapOverview({ state, myTeamId }: MyTeamCapOverviewProps) {
  const league = state.capLeague;
  const cap = state.capManager;
  const { season, dayIndex } = league;
  
  const myTeam = league.teams[myTeamId];
  const myCapTeam = state.teams[myTeamId];
  
  // Calculate cap numbers
  const upperLimit = prorateByDays(season.capUpperLimit, season.seasonDays, dayIndex + 1);
  const currentUsage = cap.teamCapHit(myTeamId);
  const capSpace = Math.max(0, upperLimit - currentUsage);
  const capPercentage = Math.min(100, Math.round((currentUsage / upperLimit) * 100));
  const isOverCap = currentUsage > upperLimit;
  
  // Get roster breakdown
  const activeRoster = myTeam?.activeRoster || [];
  const irList = myTeam?.irList || [];
  const ltirList = myTeam?.ltirList || [];
  const retainedContracts = myTeam?.retained || [];
  
  // Calculate LTIR relief
  const ltirRelief = cap.ltirRelief(myTeamId);
  
  // Get player contracts for breakdown
  const playerContracts = useMemo(() => {
    const contracts = [];
    const allPlayerIds = [...activeRoster, ...irList, ...ltirList];
    
    for (const playerId of allPlayerIds) {
      const player = league.players[playerId];
      const contract = player?.contractId ? league.contracts[player.contractId] : undefined;
      
      if (player && contract && isSeasonWithin(contract, season.season)) {
        const capHit = getCapHitForSeason(contract, season.season);
        const dailyHit = prorateByDays(capHit, season.seasonDays, dayIndex + 1);
        
        contracts.push({
          player,
          contract,
          capHit,
          dailyHit,
          isIR: irList.includes(playerId),
          isLTIR: ltirList.includes(playerId),
        });
      }
    }
    
    return contracts.sort((a, b) => b.capHit - a.capHit);
  }, [league, activeRoster, irList, ltirList, season, dayIndex]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <DollarSign className="h-8 w-8 text-primary" />
          Salary Cap Management
        </h1>
        <p className="text-muted-foreground mt-2">
          {myCapTeam?.name} - {season.season} Season
        </p>
      </div>

      {/* Cap Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cap Used</p>
                <p className="text-2xl font-bold">{fmtMoney(currentUsage)}</p>
                <p className="text-xs text-muted-foreground">{capPercentage}% of ceiling</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cap Space</p>
                <p className={`text-2xl font-bold ${isOverCap ? 'text-red-600' : 'text-green-600'}`}>
                  {fmtMoney(capSpace)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isOverCap ? 'Over cap!' : 'Available'}
                </p>
              </div>
              {isOverCap ? (
                <TrendingDown className="h-8 w-8 text-red-600" />
              ) : (
                <TrendingUp className="h-8 w-8 text-green-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Roster Size</p>
                <p className="text-2xl font-bold">{activeRoster.length}</p>
                <p className="text-xs text-muted-foreground">
                  {season.minRoster}-{season.maxRoster} allowed
                </p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Retained Salary</p>
                <p className="text-2xl font-bold">{retainedContracts.length}/3</p>
                <p className="text-xs text-muted-foreground">
                  {fmtMoney(retainedContracts.reduce((sum, r) => sum + r.capHitSavings, 0))}
                </p>
              </div>
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cap Usage Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Salary Cap Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Cap Usage</span>
              <span>{capPercentage}%</span>
            </div>
            <Progress value={capPercentage} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{fmtMoney(currentUsage)}</span>
              <span>{fmtMoney(upperLimit)} ceiling</span>
            </div>
          </div>
          
          {ltirRelief > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Shield className="h-4 w-4" />
                <span className="font-medium">LTIR Relief Available</span>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                {fmtMoney(ltirRelief)} additional cap space from {ltirList.length} LTIR player{ltirList.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Player Contracts */}
      <Tabs defaultValue="contracts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contracts">Player Contracts</TabsTrigger>
          <TabsTrigger value="roster">Roster Breakdown</TabsTrigger>
          <TabsTrigger value="retained">Retained Salary</TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Contracts ({playerContracts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {playerContracts.map(({ player, contract, capHit, isIR, isLTIR }) => (
                  <div key={player.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium">{player.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {player.position} • Age {player.age || 'N/A'}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {contract.nmc && (
                          <Badge variant="destructive" className="text-xs">NMC</Badge>
                        )}
                        {contract.ntc && (
                          <Badge variant="outline" className="text-xs">NTC</Badge>
                        )}
                        {contract.isELC && (
                          <Badge variant="secondary" className="text-xs">ELC</Badge>
                        )}
                        {isLTIR && (
                          <Badge variant="outline" className="text-xs">LTIR</Badge>
                        )}
                        {isIR && !isLTIR && (
                          <Badge variant="outline" className="text-xs">IR</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{fmtMoney(capHit)}</div>
                      <div className="text-xs text-muted-foreground">
                        {contract.startSeason} - {contract.endSeason}
                      </div>
                    </div>
                  </div>
                ))}
                {playerContracts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No contracted players found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roster" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Roster</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeRoster.length}</div>
                <p className="text-sm text-muted-foreground">
                  NHL players (limit: {season.minRoster}-{season.maxRoster})
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Injured Reserve</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{irList.length}</div>
                <p className="text-sm text-muted-foreground">
                  Still count against cap
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">LTIR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ltirList.length}</div>
                <p className="text-sm text-muted-foreground">
                  Provides cap relief
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="retained" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Retained Salary Obligations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {retainedContracts.map((retained, index) => {
                  const player = league.players[retained.fromPlayerId];
                  return (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{player?.name || 'Unknown Player'}</div>
                        <div className="text-sm text-muted-foreground">
                          {Math.round(retained.percent * 100)}% retention • {retained.remainingSeasons} season{retained.remainingSeasons !== 1 ? 's' : ''} remaining
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-red-600">{fmtMoney(retained.capHitSavings)}</div>
                        <div className="text-xs text-muted-foreground">Against cap</div>
                      </div>
                    </div>
                  );
                })}
                {retainedContracts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No retained salary obligations
                  </div>
                )}
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Maximum 3 retained salary contracts per team as per CBA rules
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compliance Status */}
      {(isOverCap || activeRoster.length < season.minRoster || activeRoster.length > season.maxRoster) && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">CBA Compliance Issues</span>
            </div>
            <div className="mt-2 space-y-1">
              {isOverCap && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  • Team is {fmtMoney(currentUsage - upperLimit)} over the salary cap
                </p>
              )}
              {activeRoster.length < season.minRoster && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  • Roster below minimum size ({activeRoster.length}/{season.minRoster})
                </p>
              )}
              {activeRoster.length > season.maxRoster && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  • Roster above maximum size ({activeRoster.length}/{season.maxRoster})
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}