import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Check, X, Filter, DollarSign, Timer, Shield } from "lucide-react";

import type { LeagueState, UID } from "../../lib/salary-cap";
import { fmtMoney, CapManager } from "../../lib/salary-cap";
import type { FreeAgencyState, FreeAgencyEngine } from "./FreeAgencyEngine";

// --------------------- Root Hub ---------------------

type Props = {
  league: LeagueState;
  state: FreeAgencyState;
  engine: FreeAgencyEngine;
  onSignUFA: (playerId: UID, years: number, aav: number, teamId: UID) => Promise<{ ok: boolean; errors?: string[] }> | { ok: boolean; errors?: string[] };
  onTenderQO?: (playerIds?: UID[]) => void;
  onOfferSheet?: (playerId: UID, years: number, aav: number, fromTeamId: UID) => void;
  onMatchOffer?: (playerId: UID, match: boolean) => void;
  myTeamId: UID;
};

export default function FreeAgencyHub({ league, state, engine, onSignUFA, onTenderQO, onOfferSheet, onMatchOffer, myTeamId }: Props) {
  const [search, setSearch] = useState("");
  const cap = useMemo(() => new CapManager(league), [league]);

  return (
    <Tabs defaultValue="ufa" className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xl font-semibold">Free Agency</div>
        <div className="flex items-center gap-2">
          <Input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search players…" className="w-64 rounded-xl"/>
        </div>
      </div>
      <TabsList className="rounded-2xl">
        <TabsTrigger value="ufa">UFA Board</TabsTrigger>
        <TabsTrigger value="rfa">RFA Rights</TabsTrigger>
      </TabsList>

      <TabsContent value="ufa" className="mt-4">
        <UFABoard league={league} fa={state} search={search} myTeamId={myTeamId} onSign={onSignUFA} cap={cap}/>
      </TabsContent>

      <TabsContent value="rfa" className="mt-4">
        <RFARights
          league={league}
          fa={state}
          myTeamId={myTeamId}
          onTenderQO={onTenderQO}
          onOfferSheet={onOfferSheet}
          onMatchOffer={onMatchOffer}
        />
      </TabsContent>
    </Tabs>
  );
}

// --------------------- UFA Board ---------------------

function UFABoard({ league, fa, search, myTeamId, onSign, cap }: { league: LeagueState; fa: FreeAgencyState; search: string; myTeamId: UID; onSign: Props["onSignUFA"]; cap: CapManager; }) {
  const list: UID[] = fa.ufaPool || [];
  const filtered = list.filter((id: UID) => {
    const p = league.players[id];
    return !search || p?.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <ScrollArea className="h-[65vh] pr-2">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((pid) => <UFAItem key={pid} league={league} playerId={pid} myTeamId={myTeamId} onSign={onSign} cap={cap}/>) }
        {filtered.length === 0 && <div className="opacity-70 text-sm">No UFAs found.</div>}
      </div>
    </ScrollArea>
  );
}

function UFAItem({ league, playerId, myTeamId, onSign, cap }: { league: LeagueState; playerId: UID; myTeamId: UID; onSign: Props["onSignUFA"]; cap: CapManager; }) {
  const p = league.players[playerId];
  const overall = p.overall ?? 70;
  const suggestedAAV = Math.max(750_000, Math.round((overall / 100) * 9_000_000));
  const [years, setYears] = useState(3);
  const [aav, setAav] = useState<number>(suggestedAAV);
  const used = cap.teamCapHit(myTeamId);
  const upper = league.season.capUpperLimit;
  const space = Math.max(0, upper - used);

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">{p.name}</div>
            <div className="text-xs opacity-70">{p.position}</div>
          </div>
          <Badge variant="secondary">OVR {overall}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-muted rounded-xl flex items-center gap-1"><DollarSign className="h-3.5 w-3.5"/>AAV
            <Input type="number" value={aav} onChange={(e)=>setAav(Number(e.target.value || 0))} className="h-7 rounded-lg ml-2" />
          </div>
          <div className="p-2 bg-muted rounded-xl">Years
            <Select value={String(years)} onValueChange={(v)=>setYears(Number(v))}>
              <SelectTrigger className="h-7 rounded-lg ml-2 w-20"><SelectValue /></SelectTrigger>
              <SelectContent>{[1,2,3,4,5,6,7,8].map(y=> <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="opacity-70">Your Cap Space:</div>
          <div className="font-medium">{fmtMoney(space)}</div>
        </div>
        <SignButton onClick={async ()=>{
          const res = await onSign(playerId, years, aav, myTeamId);
          if (!res.ok) alert(res.errors?.join("\n"));
        }} label="Sign UFA" />
      </CardContent>
    </Card>
  );
}

function SignButton({ onClick, label }: { onClick: ()=>void | Promise<void>; label: string }) {
  return <Button onClick={onClick} className="w-full rounded-xl">{label}</Button>;
}

// --------------------- RFA Rights ---------------------

function RFARights({ league, fa, myTeamId, onTenderQO, onOfferSheet, onMatchOffer }: { league: LeagueState; fa: FreeAgencyState; myTeamId: UID; onTenderQO?: Props["onTenderQO"]; onOfferSheet?: Props["onOfferSheet"]; onMatchOffer?: Props["onMatchOffer"]; }) {
  const list = fa.rfaPool.map((id: UID) => ({ playerId: id, teamId: league.players[id].rightsTeamId!, qOwed: true }));
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {list.map((row) => <RFARow key={row.playerId} league={league} row={row} myTeamId={myTeamId} onTenderQO={onTenderQO} onOfferSheet={onOfferSheet} onMatchOffer={onMatchOffer} />)}
      {list.length === 0 && <div className="opacity-70 text-sm">No RFAs found.</div>}
    </div>
  );
}

function RFARow({ league, row, myTeamId, onTenderQO, onOfferSheet, onMatchOffer }: { league: LeagueState; row: any; myTeamId: UID; onTenderQO?: Props["onTenderQO"]; onOfferSheet?: Props["onOfferSheet"]; onMatchOffer?: Props["onMatchOffer"]; }) {
  const p = league.players[row.playerId];
  const rightsTeam = league.teams[row.teamId]?.name || "Unknown";
  const ovr = p.overall ?? 70;
  const suggested = Math.max(750_000, Math.round((ovr/100) * 6_000_000));
  const [years, setYears] = useState(3);
  const [aav, setAav] = useState<number>(suggested);

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">{p.name}</div>
            <div className="text-xs opacity-70">RFA • Rights: {rightsTeam}</div>
          </div>
          <Badge variant="outline" className="gap-1"><Shield className="h-3 w-3"/>Rights</Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-muted rounded-xl">Years
            <Select value={String(years)} onValueChange={(v)=>setYears(Number(v))}>
              <SelectTrigger className="h-7 rounded-lg ml-2 w-20"><SelectValue /></SelectTrigger>
              <SelectContent>{[1,2,3,4,5,6,7,8].map(y=> <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="p-2 bg-muted rounded-xl flex items-center gap-1"><DollarSign className="h-3.5 w-3.5"/>AAV
            <Input type="number" value={aav} onChange={(e)=>setAav(Number(e.target.value || 0))} className="h-7 rounded-lg ml-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button className="rounded-xl" variant="secondary" disabled={!onTenderQO || row.teamId !== myTeamId} onClick={()=>onTenderQO && onTenderQO([row.playerId])}>Tender QO</Button>
          <OfferSheetDialog onOffer={()=>onOfferSheet && onOfferSheet(row.playerId, years, aav, myTeamId)} />
        </div>

        {onMatchOffer && row.teamId === myTeamId && (
          <Alert className="rounded-xl mt-2">
            <AlertTitle>Offer Sheet Filed?</AlertTitle>
            <AlertDescription className="text-xs">If an opponent files an offer sheet on this RFA, you will see a prompt to match or let them walk for compensation.</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

function OfferSheetDialog({ onOffer }: { onOffer?: ()=>void }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="rounded-xl">Offer Sheet</Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Confirm Offer Sheet</DialogTitle>
        </DialogHeader>
        <div className="text-sm opacity-80 mb-3">You are about to file an offer sheet. The rights team will have 7 days to match.</div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" className="rounded-xl">Cancel</Button>
          <Button className="rounded-xl" onClick={onOffer}>File Offer Sheet</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}