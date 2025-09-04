import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Plus, Shield, AlertTriangle, Trash2, ArrowRightLeft } from "lucide-react";

import type { UID, LeagueState, TradeProposal, TradePiece } from "@/lib/salary-cap";
import { CapManager, TradeEngine, getCapHitForSeason, isSeasonWithin, fmtMoney } from "@/lib/salary-cap";
import { PlayerPickerDrawer, RetainedSalaryRow } from "./CapUIAddons";
import TradeScreenCapPanel from "./TradeScreenCapPanel";

// -----------------------------------------------------------------------------
// TradeBuilderList
// - Unifies pick adding, player adding, retained-salary sliders, and NMC/NTC warnings
// - Shows both sides (left/right) with sortable, removable rows
// -----------------------------------------------------------------------------

type Props = {
  league: LeagueState;
  leftTeamId: UID;
  rightTeamId: UID;
  proposal: TradeProposal;
  onChange: (p: TradeProposal) => void;
  onConfirm: () => void;
};

export default function TradeBuilderList({ league, leftTeamId, rightTeamId, proposal, onChange, onConfirm }: Props) {
  const cap = useMemo(() => new CapManager(league), [league]);
  const trades = useMemo(() => new TradeEngine(league, cap), [league, cap]);
  const result = trades.validateTrade(proposal);

  const leftTeamName = league.teams[leftTeamId].name;
  const rightTeamName = league.teams[rightTeamId].name;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <ArrowRightLeft className="h-6 w-6" />
          Trade Builder
        </h2>
        <p className="text-muted-foreground mt-1">
          {leftTeamName} ↔ {rightTeamName}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SideList
          title={`${leftTeamName} Sends →`}
          sideKey="fromPieces"
          teamId={leftTeamId}
          counterpartyId={rightTeamId}
          league={league}
          proposal={proposal}
          onChange={onChange}
        />
        <SideList
          title={`← ${rightTeamName} Sends`}
          sideKey="toPieces"
          teamId={rightTeamId}
          counterpartyId={leftTeamId}
          league={league}
          proposal={proposal}
          onChange={onChange}
        />
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <PlayerPickerDrawer 
          league={league} 
          teamId={leftTeamId} 
          side="from" 
          proposal={proposal} 
          onChange={onChange} 
        />
        <PlayerPickerDrawer 
          league={league} 
          teamId={rightTeamId} 
          side="to" 
          proposal={proposal} 
          onChange={onChange} 
        />
        <PickAdder 
          league={league} 
          teamId={leftTeamId} 
          side="from" 
          proposal={proposal} 
          onChange={onChange} 
        />
        <PickAdder 
          league={league} 
          teamId={rightTeamId} 
          side="to" 
          proposal={proposal} 
          onChange={onChange} 
        />
      </div>

      <TradeScreenCapPanel 
        league={league} 
        cap={cap} 
        trades={trades} 
        leftTeamId={leftTeamId} 
        rightTeamId={rightTeamId} 
        proposal={proposal} 
        onConfirm={onConfirm} 
      />

      {!result.ok && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Trade Issues</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              {result.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// SideList – renders one side of the trade (players + picks). Supports retained salary.
// -----------------------------------------------------------------------------

type SideKey = "fromPieces" | "toPieces";

type SideProps = {
  title: string;
  sideKey: SideKey;
  teamId: UID;
  counterpartyId: UID;
  league: LeagueState;
  proposal: TradeProposal;
  onChange: (p: TradeProposal) => void;
};

function SideList({ title, sideKey, teamId, counterpartyId, league, proposal, onChange }: SideProps) {
  const pieces = proposal[sideKey];

  const removeAt = (i: number) => {
    const nextList = pieces.slice();
    nextList.splice(i, 1);
    onChange({ ...proposal, [sideKey]: nextList });
  };

  const editRetain = (playerId: UID, percent: number) => {
    const nextList = pieces.map(p => {
      if (p.playerId === playerId) {
        return { 
          ...p, 
          retain: percent > 0 ? { 
            playerId, 
            percent: Math.min(0.5, Math.max(0, percent)) 
          } : undefined 
        } as TradePiece;
      }
      return p;
    });
    onChange({ ...proposal, [sideKey]: nextList });
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Badge variant="secondary">{pieces.length} asset{pieces.length !== 1 ? 's' : ''}</Badge>
        </div>
        
        <ScrollArea className="max-h-[50vh] pr-2">
          <div className="space-y-3">
            {pieces.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No assets selected yet
              </div>
            )}
            {pieces.map((piece, i) => (
              <TradePieceRow 
                key={i} 
                i={i} 
                piece={piece} 
                league={league} 
                teamId={teamId} 
                sideKey={sideKey} 
                onRemove={() => removeAt(i)} 
                onEditRetain={editRetain} 
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// -----------------------------------------------------------------------------
// TradePieceRow – shows player rows with NMC/NTC warnings, or pick rows
// -----------------------------------------------------------------------------

function TradePieceRow({ 
  i, 
  piece, 
  league, 
  teamId, 
  sideKey, 
  onRemove, 
  onEditRetain 
}: { 
  i: number; 
  piece: TradePiece; 
  league: LeagueState; 
  teamId: UID; 
  sideKey: SideKey; 
  onRemove: () => void; 
  onEditRetain: (playerId: UID, percent: number) => void; 
}) {
  if (piece.playerId) {
    const player = league.players[piece.playerId];
    const contract = player?.contractId ? league.contracts[player.contractId] : undefined;
    const hasNMC = !!contract?.nmc;
    const hasNTC = !!contract?.ntc;
    const blocked = hasNMC || (hasNTC && contract?.partialNTCList?.includes(teamId));
    const capHit = contract && isSeasonWithin(contract, league.season.season) 
      ? getCapHitForSeason(contract, league.season.season) 
      : 0;

    return (
      <div className="p-3 border rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">{player?.name}</div>
            <div className="text-sm text-muted-foreground">
              {player?.position} • {fmtMoney(capHit)} cap hit
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasNMC && (
              <Badge variant="destructive" className="gap-1">
                <Shield className="h-3 w-3" />
                NMC
              </Badge>
            )}
            {hasNTC && (
              <Badge variant="outline" className="gap-1">
                <Shield className="h-3 w-3" />
                NTC
              </Badge>
            )}
            <Button size="icon" variant="ghost" onClick={onRemove}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {blocked && (
          <div className="text-sm text-amber-700 flex items-center gap-2 p-2 bg-amber-50 rounded">
            <AlertTriangle className="h-4 w-4" />
            Player has {hasNMC ? 'No-Move Clause (NMC)' : 'No-Trade Clause (NTC)'} - may refuse trade
          </div>
        )}
        
        {/* Only allow retention on your OWN outgoing players */}
        {sideKey === 'fromPieces' && (
          <RetainedSalaryRow 
            league={league} 
            playerId={piece.playerId} 
            percent={piece.retain?.percent ?? 0} 
            onChangePercent={(v) => onEditRetain(piece.playerId!, v)} 
          />
        )}
      </div>
    );
  }
  
  if (piece.pick) {
    const fromTeam = piece.pick.fromTeamId ? league.teams[piece.pick.fromTeamId]?.name : null;
    const label = `${piece.pick.year} Round ${piece.pick.round}${fromTeam ? ` (via ${fromTeam})` : ''}`;
    
    return (
      <div className="p-3 border rounded-lg flex items-center justify-between">
        <div>
          <div className="font-medium">Draft Pick</div>
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
        <Button size="icon" variant="ghost" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }
  
  return null;
}

// -----------------------------------------------------------------------------
// PickAdder – small control to add a pick to the trade
// -----------------------------------------------------------------------------

type PickerSide = "from" | "to";

function PickAdder({ 
  league, 
  teamId, 
  side, 
  proposal, 
  onChange 
}: { 
  league: LeagueState; 
  teamId: UID; 
  side: PickerSide; 
  proposal: TradeProposal; 
  onChange: (p: TradeProposal) => void 
}) {
  const [year, setYear] = useState<string>(nextDraftYear(league));
  const [round, setRound] = useState<number>(1);
  const listKey = side === 'from' ? 'fromPieces' : 'toPieces';

  const add = () => {
    const piece: TradePiece = { 
      pick: { 
        year, 
        round, 
        fromTeamId: teamId 
      } 
    };
    const next = { 
      ...proposal, 
      [listKey]: [...(proposal as any)[listKey], piece] 
    } as TradeProposal;
    onChange(next);
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={year} onValueChange={setYear}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {draftYearOptions(league).map(y => (
            <SelectItem key={y} value={y}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={String(round)} onValueChange={(v) => setRound(Number(v))}>
        <SelectTrigger className="w-[90px]">
          <SelectValue placeholder="Round" />
        </SelectTrigger>
        <SelectContent>
          {[1, 2, 3, 4, 5, 6, 7].map(r => (
            <SelectItem key={r} value={String(r)}>Round {r}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button onClick={add} variant="outline" className="gap-1">
        <Plus className="h-4 w-4" />
        Add Pick
      </Button>
    </div>
  );
}

function nextDraftYear(league: LeagueState): string {
  // Basic: use current season end + 1, e.g., 2025-26 -> 2026
  const s = league.season.season; // "2025-26"
  const endYear = Number(s.split('-')[1]) + 2000; // 26 -> 2026
  return String(endYear);
}

function draftYearOptions(league: LeagueState): string[] {
  const start = Number(nextDraftYear(league));
  return [start, start + 1, start + 2].map(String);
}