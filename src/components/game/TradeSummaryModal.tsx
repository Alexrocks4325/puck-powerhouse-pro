import React, { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, ArrowRightLeft, Shield, AlertTriangle } from "lucide-react";

import type { LeagueState, UID, TradeProposal, TradePiece } from "@/lib/salary-cap";
import { CapManager, getCapHitForSeason, isSeasonWithin, prorateByDays, fmtMoney } from "@/lib/salary-cap";

// -----------------------------------------------------------------------------
// TradeSummaryModal
// - One-click summary showing: assets moving, retained salary, pick details
// - Before/After cap spend & space for both teams (season-to-date proration)
// - Roster counts + retained slots count after trade
// -----------------------------------------------------------------------------

type Props = {
  league: LeagueState;
  proposal: TradeProposal;
  trigger?: React.ReactNode; // custom trigger, else a default button appears
  onConfirm?: () => void;
};

export default function TradeSummaryModal({ league, proposal, trigger, onConfirm }: Props) {
  const cap = useMemo(() => new CapManager(league), [league]);
  const summary = useMemo(() => buildTradeSummary(league, cap, proposal), [league, cap, proposal]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ? trigger : (
          <Button className="gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            Review Trade Summary
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Trade Summary
          </DialogTitle>
          <DialogDescription>
            Review all assets, contract clauses, and salary cap impact before confirming
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TeamBeforeAfter title={summary.left.name} data={summary.left} />
          <TeamBeforeAfter title={summary.right.name} data={summary.right} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AssetList title={`${summary.left.name} Sends`} items={summary.left.assetsOut} />
          <AssetList title={`${summary.right.name} Sends`} items={summary.right.assetsOut} />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => {}}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className="gap-2">
            <Check className="h-4 w-4" />
            Confirm Trade
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// -- UI bits -------------------------------------------------------------------

function TeamBeforeAfter({ title, data }: { title: string; data: TeamSummarySide }) {
  const isCompliant = data.after.space >= 0 && 
                     data.after.roster >= data.rules.minRoster && 
                     data.after.roster <= data.rules.maxRoster && 
                     data.after.retainedSlots <= 3 && 
                     data.after.spc <= data.rules.maxSPCs;

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">{title}</div>
          <Badge variant={isCompliant ? "default" : "destructive"} className="gap-1">
            {isCompliant ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            {isCompliant ? 'Compliant' : 'Issues'}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          <KV 
            label="Cap Used →" 
            value={`${fmtMoney(data.before.used)} → ${fmtMoney(data.after.used)}`} 
            highlight={data.before.used !== data.after.used}
          />
          <KV 
            label="Cap Space →" 
            value={`${fmtMoney(data.before.space)} → ${fmtMoney(data.after.space)}`} 
            highlight={data.before.space !== data.after.space}
          />
          <KV 
            label="Roster Size →" 
            value={`${data.before.roster} → ${data.after.roster}`} 
            highlight={data.before.roster !== data.after.roster}
          />
          <KV 
            label="Retained Slots →" 
            value={`${data.before.retainedSlots} → ${data.after.retainedSlots}`} 
            highlight={data.before.retainedSlots !== data.after.retainedSlots}
          />
          <KV 
            label="SPCs →" 
            value={`${data.before.spc} → ${data.after.spc}`} 
            highlight={data.before.spc !== data.after.spc}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function KV({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`p-3 rounded-lg flex items-center justify-between ${highlight ? 'bg-primary/5 border border-primary/20' : 'bg-muted/50'}`}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function AssetList({ title, items }: { title: string; items: AssetRow[] }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="font-semibold mb-3 text-lg">{title}</div>
        <ScrollArea className="max-h-[40vh] pr-2">
          <div className="space-y-3">
            {items.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                No assets in this trade
              </div>
            )}
            {items.map((item, i) => (
              <div key={i} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    {item.sub && (
                      <div className="text-sm text-muted-foreground mt-1">{item.sub}</div>
                    )}
                  </div>
                  {item.badges && item.badges.length > 0 && (
                    <div className="flex gap-1 ml-3">
                      {item.badges.map((badge, j) => (
                        <Badge 
                          key={j} 
                          variant={badge.variant as any} 
                          className="gap-1"
                        >
                          {badge.variant === 'destructive' && <Shield className="h-3 w-3" />}
                          {badge.variant === 'secondary' && <Shield className="h-3 w-3" />}
                          {badge.text}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// -- Summary builder -----------------------------------------------------------

type TeamSummarySide = {
  id: UID;
  name: string;
  rules: { minRoster: number; maxRoster: number; maxSPCs: number };
  before: { used: number; space: number; roster: number; retainedSlots: number; spc: number };
  after: { used: number; space: number; roster: number; retainedSlots: number; spc: number };
  assetsOut: AssetRow[];
};

type AssetRow = { 
  label: string; 
  sub?: string; 
  badges?: { text: string; variant?: "secondary" | "destructive" | "outline" }[] 
};

export function buildTradeSummary(league: LeagueState, cap: CapManager, proposal: TradeProposal) {
  const { season, dayIndex } = league;
  const upper = prorateByDays(season.capUpperLimit, season.seasonDays, dayIndex + 1);

  const mkSide = (teamId: UID) => ({
    id: teamId,
    name: league.teams[teamId].name,
    rules: { 
      minRoster: season.minRoster, 
      maxRoster: season.maxRoster, 
      maxSPCs: season.maxSPCs 
    },
    before: {
      used: cap.teamCapHit(teamId),
      space: 0, 
      roster: league.teams[teamId].activeRoster.length,
      retainedSlots: league.teams[teamId].retained.length,
      spc: league.teams[teamId].spcCount,
    },
    after: { used: 0, space: 0, roster: 0, retainedSlots: 0, spc: 0 },
    assetsOut: [] as AssetRow[],
  });

  const left = mkSide(proposal.fromTeamId);
  const right = mkSide(proposal.toTeamId);
  left.before.space = Math.max(0, upper - left.before.used);
  right.before.space = Math.max(0, upper - right.before.used);

  // Sandbox: clone league and apply the trade moves
  const sandbox: LeagueState = JSON.parse(JSON.stringify(league));
  const sCap = new CapManager(sandbox);

  const apply = (giver: UID, receiver: UID, pieces: TradePiece[], collect: AssetRow[]) => {
    const g = sandbox.teams[giver];
    const r = sandbox.teams[receiver];

    for (const piece of pieces) {
      if (piece.playerId) {
        const p = sandbox.players[piece.playerId];
        const c = p?.contractId ? sandbox.contracts[p.contractId] : undefined;
        
        // Move player between rosters
        [g.activeRoster, g.irList, g.ltirList, g.nonRoster].forEach(list => {
          const i = list.indexOf(p.id); 
          if (i !== -1) list.splice(i, 1);
        });
        r.activeRoster.push(p.id);
        if (g.spcCount > 0) g.spcCount -= 1;
        r.spcCount += 1;

        const capHit = c && isSeasonWithin(c, sandbox.season.season) 
          ? getCapHitForSeason(c, sandbox.season.season) 
          : 0;
          
        const badges = [] as AssetRow["badges"];
        if (c?.nmc) badges?.push({ text: "NMC", variant: "destructive" });
        if (c?.ntc) badges?.push({ text: "NTC", variant: "secondary" });
        
        collect.push({ 
          label: `${p.name} (${p.position})`, 
          sub: `${fmtMoney(capHit)} cap hit`, 
          badges 
        });
      }
      
      if (piece.pick) {
        const fromTeam = piece.pick.fromTeamId ? sandbox.teams[piece.pick.fromTeamId]?.name : null;
        const sub = fromTeam ? `Originally from ${fromTeam}` : undefined;
        collect.push({ 
          label: `${piece.pick.year} Draft Pick - Round ${piece.pick.round}`, 
          sub 
        });
      }
      
      if (piece.retain) {
        const p = sandbox.players[piece.retain.playerId];
        const c = p?.contractId ? sandbox.contracts[p.contractId] : undefined;
        if (c && isSeasonWithin(c, sandbox.season.season)) {
          const capHit = getCapHitForSeason(c, sandbox.season.season);
          const savings = Math.round(capHit * piece.retain.percent);
          sandbox.teams[giver].retained.push({ 
            fromPlayerId: p.id, 
            percent: piece.retain.percent, 
            remainingSeasons: 1, 
            capHitSavings: savings 
          });
          collect.push({ 
            label: `Retained Salary - ${p.name}`, 
            sub: `${Math.round(piece.retain.percent * 100)}% retention = ${fmtMoney(savings)} against cap` 
          });
        }
      }
    }
  };

  apply(proposal.fromTeamId, proposal.toTeamId, proposal.fromPieces, left.assetsOut);
  apply(proposal.toTeamId, proposal.fromTeamId, proposal.toPieces, right.assetsOut);

  // Calculate after-trade numbers
  left.after.used = sCap.teamCapHit(left.id);
  right.after.used = sCap.teamCapHit(right.id);
  left.after.space = Math.max(0, upper - left.after.used);
  right.after.space = Math.max(0, upper - right.after.used);
  left.after.roster = sandbox.teams[left.id].activeRoster.length;
  right.after.roster = sandbox.teams[right.id].activeRoster.length;
  left.after.retainedSlots = sandbox.teams[left.id].retained.length;
  right.after.retainedSlots = sandbox.teams[right.id].retained.length;
  left.after.spc = sandbox.teams[left.id].spcCount;
  right.after.spc = sandbox.teams[right.id].spcCount;

  return { left, right } as const;
}