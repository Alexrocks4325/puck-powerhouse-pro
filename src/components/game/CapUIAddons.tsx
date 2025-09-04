import React, { useMemo, useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Plus, Users, ShieldAlert, Gauge, XCircle, Shield, AlertTriangle } from "lucide-react";

import type { UID, LeagueState, Player, TeamState, TradeProposal, TradePiece } from "@/lib/salary-cap";
import { CapManager, getCapHitForSeason, isSeasonWithin, prorateByDays, fmtMoney } from "@/lib/salary-cap";

// -----------------------------------------------------------------------------
// PlayerPickerDrawer
// - Lets the GM search by name/position
// - Filter by team
// - Add players to the pending trade (supports retained % on your own outgoing players)
// -----------------------------------------------------------------------------

type PickerSide = "from" | "to"; // whose assets we are picking (left or right side of trade)

interface PlayerPickerDrawerProps {
  league: LeagueState;
  teamId: UID;             // whose roster to show in the list
  side: PickerSide;        // which side of the proposal to append to
  proposal: TradeProposal; 
  onChange: (p: TradeProposal) => void;
}

export function PlayerPickerDrawer({ league, teamId, side, proposal, onChange }: PlayerPickerDrawerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const rosterIds = useMemo(() => {
    const t = league.teams[teamId];
    return [...t.activeRoster, ...t.irList, ...t.ltirList];
  }, [league, teamId]);

  const players = useMemo(() => 
    rosterIds.map(id => league.players[id]).filter(Boolean) as Player[], 
    [rosterIds, league.players]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return players;
    return players.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.position.toLowerCase().includes(q)
    );
  }, [players, query]);

  const listKey = side === "from" ? "fromPieces" : "toPieces";

  const addPlayer = (pid: UID) => {
    const next = { 
      ...proposal, 
      [listKey]: [...(proposal as any)[listKey], { playerId: pid } as TradePiece] 
    } as TradeProposal;
    onChange(next);
    setOpen(false);
  };

  const teamName = league.teams[teamId].name;

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Player
        </Button>
      </DrawerTrigger>
      <DrawerContent className="p-4">
        <DrawerHeader>
          <DrawerTitle>Select Player from {teamName}</DrawerTitle>
          <DrawerDescription>
            Choose a player to add to the trade proposal
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="flex gap-2 mb-4">
          <Input 
            placeholder="Search by name or position..." 
            value={query} 
            onChange={e => setQuery(e.target.value)}
            className="flex-1"
          />
        </div>
        
        <ScrollArea className="h-[60vh] pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(p => (
              <PlayerCard 
                key={p.id} 
                player={p} 
                league={league} 
                teamId={teamId} 
                onAdd={() => addPlayer(p.id)} 
              />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {query ? `No players found matching "${query}"` : "No players available"}
            </div>
          )}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}

function PlayerCard({ player, league, teamId, onAdd }: { 
  player: Player; 
  league: LeagueState; 
  teamId: UID; 
  onAdd: () => void 
}) {
  const { season, dayIndex, contracts } = league;
  const contract = player.contractId ? contracts[player.contractId] : undefined;
  const capHit = contract && isSeasonWithin(contract, season.season) 
    ? getCapHitForSeason(contract, season.season) 
    : 0;
    
  const hasNMC = !!contract?.nmc;
  const hasNTC = !!contract?.ntc;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-medium">{player.name}</div>
            <div className="text-sm text-muted-foreground">{player.position}</div>
          </div>
          <div className="text-right">
            <Badge variant="secondary">{fmtMoney(capHit)}</Badge>
            {(hasNMC || hasNTC) && (
              <div className="flex gap-1 mt-1">
                {hasNMC && <Badge variant="destructive" className="text-xs"><Shield className="h-3 w-3" /></Badge>}
                {hasNTC && <Badge variant="outline" className="text-xs"><Shield className="h-3 w-3" /></Badge>}
              </div>
            )}
          </div>
        </div>
        
        {(hasNMC || hasNTC) && (
          <div className="text-xs text-amber-600 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {hasNMC ? "No-Move Clause" : "No-Trade Clause"}
          </div>
        )}
        
        <Button onClick={onAdd} className="w-full" size="sm">
          Add to Trade
        </Button>
      </CardContent>
    </Card>
  );
}

// -----------------------------------------------------------------------------
// RetainedSalaryRow – attach a retention % to a player you are sending out
// - Use this on your trade builder list for the FROM side
// -----------------------------------------------------------------------------

export function RetainedSalaryRow({ 
  league, 
  playerId, 
  percent, 
  onChangePercent 
}: { 
  league: LeagueState; 
  playerId: UID; 
  percent: number; 
  onChangePercent: (v: number) => void 
}) {
  const player = league.players[playerId];
  const contract = player?.contractId ? league.contracts[player.contractId] : undefined;
  const capHit = contract && isSeasonWithin(contract, league.season.season) 
    ? getCapHitForSeason(contract, league.season.season) 
    : 0;
  const retainedCap = Math.round(capHit * percent);

  return (
    <div className="p-3 bg-muted/50 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Retained Salary - {player?.name}</div>
        <Badge variant="outline">{Math.round(percent * 100)}%</Badge>
      </div>
      
      <div className="space-y-2">
        <Slider 
          value={[Math.round(percent * 100)]} 
          onValueChange={(v) => onChangePercent((v[0] || 0) / 100)} 
          min={0} 
          max={50} 
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0%</span>
          <span>50% (Max)</span>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground">
        Retaining {fmtMoney(retainedCap)} against your salary cap this season
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// CapOverviewSidebar – per-team cap snapshot for your Franchise Hub
// Shows: Used, Space, LTIR pool, retained slots used, roster count, compliance badge
// -----------------------------------------------------------------------------

interface CapOverviewSidebarProps {
  league: LeagueState;
  sticky?: boolean;
  selectedTeamId?: UID;
}

export function CapOverviewSidebar({ league, sticky, selectedTeamId }: CapOverviewSidebarProps) {
  const cap = useMemo(() => new CapManager(league), [league]);
  const { season, dayIndex } = league;
  const upper = prorateByDays(season.capUpperLimit, season.seasonDays, dayIndex + 1);

  const items = useMemo(() => Object.values(league.teams).map((team) => {
    const used = cap.teamCapHit(team.id);
    const space = Math.max(0, upper - used);
    const ltirCount = team.ltirList.length;
    const retainedCount = team.retained.length;
    const rosterCount = team.activeRoster.length;
    const isCompliant = used <= upper && 
                       rosterCount >= season.minRoster && 
                       rosterCount <= season.maxRoster && 
                       team.spcCount <= season.maxSPCs && 
                       retainedCount <= 3;
    
    return { 
      id: team.id, 
      name: team.name, 
      used, 
      space, 
      ltirCount, 
      retainedCount, 
      rosterCount, 
      isCompliant,
      isSelected: team.id === selectedTeamId
    };
  }), [league, cap, upper, selectedTeamId]);

  return (
    <aside className={`${sticky ? "sticky top-4" : ""} w-full space-y-3`}>
      <h3 className="text-lg font-semibold mb-3">League Salary Cap Status</h3>
      
      <ScrollArea className="h-[70vh]">
        <div className="space-y-2">
          {items
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(team => (
              <Card 
                key={team.id} 
                className={`transition-colors ${team.isSelected ? 'ring-2 ring-primary' : ''}`}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium">{team.name}</div>
                    {team.isCompliant ? (
                      <Badge className="gap-1 text-xs">
                        <Check className="h-3 w-3" />
                        Compliant
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1 text-xs">
                        <XCircle className="h-3 w-3" />
                        Issues
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-muted/50 rounded flex items-center gap-2">
                      <Gauge className="h-3 w-3" />
                      <div>
                        <div className="text-muted-foreground">Used</div>
                        <div className="font-medium">{fmtMoney(team.used)}</div>
                      </div>
                    </div>
                    
                    <div className="p-2 bg-muted/50 rounded flex items-center gap-2">
                      <Gauge className="h-3 w-3" />
                      <div>
                        <div className="text-muted-foreground">Space</div>
                        <div className="font-medium">{fmtMoney(team.space)}</div>
                      </div>
                    </div>
                    
                    <div className="p-2 bg-muted/50 rounded flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      <div>
                        <div className="text-muted-foreground">Roster</div>
                        <div className="font-medium">{team.rosterCount}</div>
                      </div>
                    </div>
                    
                    <div className="p-2 bg-muted/50 rounded flex items-center gap-2">
                      <ShieldAlert className="h-3 w-3" />
                      <div>
                        <div className="text-muted-foreground">Retained</div>
                        <div className="font-medium">{team.retainedCount}/3</div>
                      </div>
                    </div>
                  </div>
                  
                  {team.ltirCount > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {team.ltirCount} player{team.ltirCount !== 1 ? 's' : ''} on LTIR
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      </ScrollArea>
    </aside>
  );
}