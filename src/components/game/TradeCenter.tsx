// TradeCenter.tsx
// Modern salary cap-aware trade center for FranchiseMode
// Full CBA compliance with cap calculations, retained salary, contract clauses, etc.

import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRightLeft, Building2, DollarSign, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import type { LeagueState, TradeProposal, UID } from "@/lib/salary-cap";
import { CapManager, TradeEngine, fmtMoney } from "@/lib/salary-cap";
import TradeBuilderList from "./TradeBuilderList";
import TradeSummaryModal from "./TradeSummaryModal";
import { CapOverviewSidebar } from "./CapUIAddons";

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
  tradeEngine: TradeEngine;
};

// Get team list for dropdown (30 NHL teams)
const TEAM_OPTIONS = [
  { id: "BOS", name: "Boston Bruins" },
  { id: "BUF", name: "Buffalo Sabres" },
  { id: "DET", name: "Detroit Red Wings" },
  { id: "FLA", name: "Florida Panthers" },
  { id: "MTL", name: "Montréal Canadiens" },
  { id: "OTT", name: "Ottawa Senators" },
  { id: "TBL", name: "Tampa Bay Lightning" },
  { id: "TOR", name: "Toronto Maple Leafs" },
  { id: "CAR", name: "Carolina Hurricanes" },
  { id: "CBJ", name: "Columbus Blue Jackets" },
  { id: "NJD", name: "New Jersey Devils" },
  { id: "NYI", name: "New York Islanders" },
  { id: "NYR", name: "New York Rangers" },
  { id: "PHI", name: "Philadelphia Flyers" },
  { id: "PIT", name: "Pittsburgh Penguins" },
  { id: "WSH", name: "Washington Capitals" },
  { id: "ARI", name: "Arizona Coyotes" },
  { id: "CHI", name: "Chicago Blackhawks" },
  { id: "COL", name: "Colorado Avalanche" },
  { id: "DAL", name: "Dallas Stars" },
  { id: "MIN", name: "Minnesota Wild" },
  { id: "NSH", name: "Nashville Predators" },
  { id: "STL", name: "St. Louis Blues" },
  { id: "WPG", name: "Winnipeg Jets" },
  { id: "ANA", name: "Anaheim Ducks" },
  { id: "CGY", name: "Calgary Flames" },
  { id: "EDM", name: "Edmonton Oilers" },
  { id: "LAK", name: "Los Angeles Kings" },
  { id: "SEA", name: "Seattle Kraken" },
  { id: "SJS", name: "San Jose Sharks" },
  { id: "VAN", name: "Vancouver Canucks" },
  { id: "VGK", name: "Vegas Golden Knights" },
];

interface TradeCenterProps {
  state: SeasonState;
  setState: (updater: (s: SeasonState) => SeasonState) => void;
  myTeamId: ID;
}

export default function TradeCenter({ state, setState, myTeamId }: TradeCenterProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<ID>("BOS");
  const [proposal, setProposal] = useState<TradeProposal>({
    fromTeamId: myTeamId,
    toTeamId: selectedTeamId,
    fromPieces: [],
    toPieces: [],
  });

  const { toast } = useToast();
  const league = state.capLeague;
  const cap = state.capManager;
  const trades = state.tradeEngine;

  // Update proposal when team selection changes
  React.useEffect(() => {
    setProposal(prev => ({
      ...prev,
      fromTeamId: myTeamId,
      toTeamId: selectedTeamId,
    }));
  }, [myTeamId, selectedTeamId]);

  const validation = useMemo(() => trades.validateTrade(proposal), [trades, proposal]);

  const myTeam = league.teams[myTeamId];
  const counterpartyTeam = league.teams[selectedTeamId];
  const myCapSpace = cap.getCapSpace(myTeamId);
  const theirCapSpace = cap.getCapSpace(selectedTeamId);

  const handleConfirmTrade = () => {
    if (!validation.ok) {
      toast({
        title: "Trade Blocked",
        description: "This trade violates CBA rules and cannot be completed.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Trade Completed!",
      description: `Successfully completed trade between ${myTeam?.name} and ${counterpartyTeam?.name}`,
    });

    // Reset proposal
    setProposal({
      fromTeamId: myTeamId,
      toTeamId: selectedTeamId,
      fromPieces: [],
      toPieces: [],
    });
  };

  const hasAssets = proposal.fromPieces.length > 0 || proposal.toPieces.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <ArrowRightLeft className="h-8 w-8 text-primary" />
          Trade Center
        </h1>
        <p className="text-muted-foreground mt-2">
          Salary cap compliant trades with full CBA validation
        </p>
      </div>

      {/* Team Selection */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* My Team */}
            <div className="text-center">
              <div className="p-4 bg-primary/10 rounded-lg">
                <Building2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold">{myTeam?.name}</h3>
                <div className="text-sm text-muted-foreground mt-1">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  {fmtMoney(myCapSpace)} cap space
                </div>
                <div className="text-sm text-muted-foreground">
                  <Users className="h-4 w-4 inline mr-1" />
                  {myTeam?.activeRoster?.length || 0} players
                </div>
              </div>
            </div>

            {/* VS */}
            <div className="text-center">
              <ArrowRightLeft className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">Trade Partner</p>
            </div>

            {/* Counterparty Team */}
            <div className="text-center">
              <div className="space-y-3">
                <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select team..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TEAM_OPTIONS
                      .filter(team => team.id !== myTeamId)
                      .map(team => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                
                {counterpartyTeam && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold">{counterpartyTeam.name}</h3>
                    <div className="text-sm text-muted-foreground mt-1">
                      <DollarSign className="h-4 w-4 inline mr-1" />
                      {fmtMoney(theirCapSpace)} cap space
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <Users className="h-4 w-4 inline mr-1" />
                      {counterpartyTeam.activeRoster?.length || 0} players
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trade Builder */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div>
          <TradeBuilderList
            league={league}
            leftTeamId={myTeamId}
            rightTeamId={selectedTeamId}
            proposal={proposal}
            onChange={setProposal}
            onConfirm={handleConfirmTrade}
          />
        </div>
        
        {/* Salary Cap Overview Sidebar */}
        <CapOverviewSidebar 
          league={league} 
          sticky 
          selectedTeamId={myTeamId}
        />
      </div>

      {/* Trade Summary Modal */}
      {hasAssets && (
        <div className="flex justify-center">
          <TradeSummaryModal
            league={league}
            proposal={proposal}
            onConfirm={handleConfirmTrade}
            trigger={
              <Button size="lg" className="gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                Review Complete Trade
              </Button>
            }
          />
        </div>
      )}

      {/* Quick Status */}
      {!validation.ok && (
        <Alert variant="destructive">
          <AlertDescription>
            Current trade proposal violates CBA rules. Check the trade builder for details.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}