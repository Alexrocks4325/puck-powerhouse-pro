import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Check, X, Info, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import type { LeagueState, UID, TeamState, TradeProposal, TradePiece } from "@/lib/salary-cap";
import { CapManager, TradeEngine, fmtMoney, getCapHitForSeason, isSeasonWithin, prorateByDays } from "@/lib/salary-cap";

// -----------------------------------------------------------------------------
// TradeScreenCapPanel
// Live cap space + compliance panel for trade screen
// Shows before/after cap space and blocks illegal trades with detailed reasons
// -----------------------------------------------------------------------------

type Props = {
  league: LeagueState;
  cap: CapManager;
  trades: TradeEngine;
  leftTeamId: UID;   // team proposing the trade
  rightTeamId: UID;  // counterparty
  proposal: TradeProposal; // maintained by parent screen
  onConfirm: () => void;   // parent applies trade when called
};

export default function TradeScreenCapPanel({ league, cap, trades, leftTeamId, rightTeamId, proposal, onConfirm }: Props) {
  const { season, dayIndex } = league;

  // Helper: compute current (season-to-date prorated) cap usage and available space
  const computeCap = (teamId: UID) => {
    const upper = prorateByDays(season.capUpperLimit, season.seasonDays, dayIndex + 1);
    const used = cap.teamCapHit(teamId);
    const space = Math.max(0, upper - used);
    return { upper, used, space };
  };

  const leftNow = useMemo(() => computeCap(leftTeamId), [league, leftTeamId]);
  const rightNow = useMemo(() => computeCap(rightTeamId), [league, rightTeamId]);

  // Validate proposed trade using engine (builds snapshots internally)
  const validation = useMemo(() => trades.validateTrade(proposal), [proposal, trades]);

  const canConfirm = validation.ok;

  return (
    <Card className="w-full shadow-lg border-border">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Salary Cap Analysis
          </h3>
          <Badge variant={canConfirm ? "default" : "destructive"} className="text-sm px-3 py-1">
            {canConfirm ? "✓ Trade Legal" : "✗ Blocked"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TeamCapSummary 
            title="Current Cap Status" 
            teamId={leftTeamId} 
            teamName={league.teams[leftTeamId].name}
            {...leftNow} 
          />
          <TeamCapSummary 
            title="Current Cap Status" 
            teamId={rightTeamId} 
            teamName={league.teams[rightTeamId].name}
            {...rightNow} 
          />
        </div>

        <AfterTradeDeltas 
          league={league} 
          cap={cap} 
          leftTeamId={leftTeamId} 
          rightTeamId={rightTeamId} 
          proposal={proposal} 
        />

        {!validation.ok && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Trade Blocked - CBA Violations</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                {validation.errors.map((e, i) => (
                  <li key={i} className="text-sm">{e}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {validation.ok && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
            <Check className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-700 dark:text-green-300">Trade Approved</AlertTitle>
            <AlertDescription className="text-green-600 dark:text-green-400">
              This trade complies with all CBA rules including roster limits, salary cap, retained salary restrictions, and contract clauses.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end">
          <Button 
            onClick={onConfirm} 
            disabled={!canConfirm} 
            className="px-6"
            size="lg"
          >
            {canConfirm ? "Confirm Trade" : "Fix Issues to Proceed"}
          </Button>
        </div>

        <MiniLegend />
      </CardContent>
    </Card>
  );
}

// -----------------------------------------------------------------------------
// TeamCapSummary – shows a compact bar with used vs upper & numeric details
// -----------------------------------------------------------------------------

type TeamCapSummaryProps = { 
  title: string; 
  teamId: UID; 
  teamName: string;
  upper: number; 
  used: number; 
  space: number; 
};

function TeamCapSummary({ title, teamId, teamName, upper, used, space }: TeamCapSummaryProps) {
  const pct = Math.min(100, Math.round((used / Math.max(upper, 1)) * 100));
  const isOverCap = used > upper;
  
  return (
    <div className="p-4 bg-muted/50 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="text-sm font-medium">{teamName}</div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Cap Usage</span>
          <span>{pct}%</span>
        </div>
        <Progress value={pct} className="h-2" />
      </div>
      
      <div className="grid grid-cols-3 text-xs gap-2">
        <div className="p-2 bg-background rounded">
          <div className="text-muted-foreground">Used</div>
          <div className="font-medium">{fmtMoney(used)}</div>
        </div>
        <div className="p-2 bg-background rounded">
          <div className="text-muted-foreground">Ceiling</div>
          <div className="font-medium">{fmtMoney(upper)}</div>
        </div>
        <div className="p-2 bg-background rounded">
          <div className="text-muted-foreground">Space</div>
          <div className={`font-medium ${isOverCap ? 'text-red-600' : 'text-green-600'}`}>
            {fmtMoney(space)}
          </div>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// AfterTradeDeltas – compute and show before/after cap space for both teams
// -----------------------------------------------------------------------------

type AfterProps = { 
  league: LeagueState; 
  cap: CapManager; 
  leftTeamId: UID; 
  rightTeamId: UID; 
  proposal: TradeProposal; 
};

function AfterTradeDeltas({ league, cap, leftTeamId, rightTeamId, proposal }: AfterProps) {
  const deltas = useMemo(() => computeAfterDeltas(league, cap, leftTeamId, rightTeamId, proposal), [league, cap, leftTeamId, rightTeamId, proposal]);
  
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-medium">Post-Trade Impact</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DeltaCard {...deltas.left} teamId={leftTeamId} teamName={league.teams[leftTeamId].name} />
        <DeltaCard {...deltas.right} teamId={rightTeamId} teamName={league.teams[rightTeamId].name} />
      </div>
    </div>
  );
}

type Delta = { 
  beforeUsed: number; 
  beforeSpace: number; 
  afterUsed: number; 
  afterSpace: number; 
};

function DeltaCard({ teamId, teamName, beforeUsed, beforeSpace, afterUsed, afterSpace }: Delta & { teamId: UID; teamName: string }) {
  const usedChange = afterUsed - beforeUsed;
  const spaceChange = afterSpace - beforeSpace;
  
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-muted-foreground">After Trade</div>
        <div className="text-sm font-medium">{teamName}</div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-muted/50 rounded">
          <div className="text-muted-foreground mb-1">Cap Used</div>
          <div className="font-medium">
            {fmtMoney(beforeUsed)} → {fmtMoney(afterUsed)}
          </div>
          <ChangePill value={usedChange} inverse />
        </div>
        <div className="p-3 bg-muted/50 rounded">
          <div className="text-muted-foreground mb-1">Cap Space</div>
          <div className="font-medium">
            {fmtMoney(beforeSpace)} → {fmtMoney(afterSpace)}
          </div>
          <ChangePill value={spaceChange} positiveIsGood />
        </div>
      </div>
    </div>
  );
}

function ChangePill({ value, positiveIsGood, inverse }: { value: number; positiveIsGood?: boolean; inverse?: boolean }) {
  const val = Math.round(value / 1000) * 1000; // cleanup small numbers
  const isGood = inverse ? value <= 0 : value >= 0;
  const Icon = value >= 0 ? TrendingUp : TrendingDown;
  const colorClass = isGood ? "text-green-600" : "text-red-600";
  
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 mt-1 rounded-full bg-background ${colorClass}`}>
      <Icon className="h-3 w-3" />
      {value >= 0 ? "+" : ""}{fmtMoney(Math.abs(val))}
    </span>
  );
}

function MiniLegend() {
  return (
    <div className="flex items-start gap-2 text-xs text-muted-foreground p-3 bg-muted/30 rounded">
      <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
      <div>
        <strong>Cap Calculation:</strong> Season-to-date prorated amounts including IR, buried contracts, retained salary, and LTIR relief. 
        All trades must comply with CBA roster limits, salary retention rules, and no-trade/no-move clauses.
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Compute after-trade deltas by manually applying the proposal to team snapshots
// Uses the same proration logic from the finance module for consistency
// -----------------------------------------------------------------------------

function computeAfterDeltas(league: LeagueState, cap: CapManager, leftId: UID, rightId: UID, proposal: TradeProposal) {
  const beforeLeft = cap.teamCapHit(leftId);
  const beforeRight = cap.teamCapHit(rightId);

  const before = {
    left: { used: beforeLeft },
    right: { used: beforeRight },
  } as const;

  // clone league to sandbox changes without touching real state
  const sandbox: LeagueState = JSON.parse(JSON.stringify(league));
  const sandCap = new CapManager(sandbox);

  const apply = (giver: UID, receiver: UID, pieces: TradePiece[]) => {
    const g = sandbox.teams[giver];
    const r = sandbox.teams[receiver];

    for (const piece of pieces) {
      if (piece.playerId) {
        const pid = piece.playerId;
        [g.activeRoster, g.irList, g.ltirList, g.nonRoster].forEach(list => {
          const i = list.indexOf(pid); if (i !== -1) list.splice(i, 1);
        });
        r.activeRoster.push(pid);
        if (g.spcCount > 0) g.spcCount -= 1;
        r.spcCount += 1;
      }
      if (piece.retain) {
        const { playerId, percent } = piece.retain;
        const p = sandbox.players[playerId];
        const c = p?.contractId ? sandbox.contracts[p.contractId] : undefined;
        if (c && isSeasonWithin(c, sandbox.season.season)) {
          const capHit = getCapHitForSeason(c, sandbox.season.season);
          const savings = Math.round(capHit * percent);
          sandbox.teams[giver].retained.push({ 
            fromPlayerId: playerId, 
            percent, 
            remainingSeasons: 1, 
            capHitSavings: savings 
          });
        }
      }
    }
  };

  apply(proposal.fromTeamId, proposal.toTeamId, proposal.fromPieces);
  apply(proposal.toTeamId, proposal.fromTeamId, proposal.toPieces);

  const afterLeft = sandCap.teamCapHit(leftId);
  const afterRight = sandCap.teamCapHit(rightId);

  const { season, dayIndex } = sandbox;
  const upper = prorateByDays(season.capUpperLimit, season.seasonDays, dayIndex + 1);

  return {
    left: {
      beforeUsed: before.left.used,
      beforeSpace: Math.max(0, upper - before.left.used),
      afterUsed: afterLeft,
      afterSpace: Math.max(0, upper - afterLeft),
    },
    right: {
      beforeUsed: before.right.used,
      beforeSpace: Math.max(0, upper - before.right.used),
      afterUsed: afterRight,
      afterSpace: Math.max(0, upper - afterRight),
    }
  } as const;
}