import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Trophy, Clock, Users, Target, Search } from "lucide-react";

import type { UID, LeagueState } from "../../lib/salary-cap";
import { DraftEngine, DraftState, DraftProspect, DraftPick } from "./DraftEngine";

// -----------------------------------------------------------------------------
// DraftRoom - Complete NHL Draft Experience
// Shows draft board, your picks, prospect rankings, and draft history
// -----------------------------------------------------------------------------

type Props = {
  league: LeagueState;
  draftState: DraftState;
  draftEngine: DraftEngine;
  onMakePick: (prospectId: UID) => void;
  onSimToMyPick: () => void;
  onAutoCompleteRound?: () => void;
};

export default function DraftRoom({ league, draftState, draftEngine, onMakePick, onSimToMyPick, onAutoCompleteRound }: Props) {
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState<"ALL" | "F" | "D" | "G">("ALL");

  const currentPick = draftState.picks[draftState.currentPick];
  const isMyPick = currentPick?.currentTeamId === draftState.userTeamId;
  const myUpcomingPicks = draftEngine.getTeamPicks(draftState, draftState.userTeamId);

  const filteredProspects = useMemo(() => {
    return draftState.prospects
      .filter(p => !p.picked)
      .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
      .filter(p => positionFilter === "ALL" || p.position === positionFilter)
      .sort((a, b) => a.draftRank - b.draftRank);
  }, [draftState.prospects, search, positionFilter]);

  if (!draftState.isActive) {
    return <DraftComplete draftState={draftState} league={league} />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
      {/* Draft Info Sidebar */}
      <div className="space-y-4">
        <DraftStatus currentPick={currentPick} league={league} isMyPick={isMyPick} />
        <MyUpcomingPicks picks={myUpcomingPicks.slice(0, 5)} />
        {!isMyPick && (
          <Button onClick={onSimToMyPick} className="w-full rounded-2xl">
            Sim to My Pick
          </Button>
        )}
        {currentPick && currentPick.round >= 3 && onAutoCompleteRound && (
          <Button onClick={onAutoCompleteRound} variant="secondary" className="w-full rounded-2xl">
            Auto-Complete Remaining Rounds
          </Button>
        )}
      </div>

      {/* Main Draft Board */}
      <div className="space-y-4">
        <Tabs defaultValue="board" className="w-full">
          <TabsList className="rounded-2xl">
            <TabsTrigger value="board">Draft Board</TabsTrigger>
            <TabsTrigger value="history">Draft History</TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="mt-4">
            <DraftBoard
              prospects={filteredProspects}
              search={search}
              onSearchChange={setSearch}
              positionFilter={positionFilter}
              onPositionChange={setPositionFilter}
              isMyPick={isMyPick}
              onMakePick={onMakePick}
            />
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <DraftHistory draftState={draftState} league={league} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Draft Status Card
// -----------------------------------------------------------------------------

function DraftStatus({ currentPick, league, isMyPick }: { currentPick?: DraftPick; league: LeagueState; isMyPick: boolean }) {
  if (!currentPick) return null;

  const team = league.teams[currentPick.currentTeamId];
  
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span className="font-semibold">On the Clock</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="opacity-70">Pick #{currentPick.pick}</span>
            <Badge>Round {currentPick.round}</Badge>
          </div>
          
          <div className="flex justify-between">
            <span className="opacity-70">Round Progress:</span>
            <span className="text-sm">{((currentPick.pick - 1) % 32) + 1} of 32</span>
          </div>
          
          <div className="text-lg font-medium">{team?.name || "Unknown"}</div>
          
          {isMyPick && (
            <Alert className="rounded-xl">
              <Target className="h-4 w-4" />
              <AlertTitle>Your Pick!</AlertTitle>
              <AlertDescription className="text-sm">
                Select a prospect from the board below.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// -----------------------------------------------------------------------------
// My Upcoming Picks
// -----------------------------------------------------------------------------

function MyUpcomingPicks({ picks }: { picks: DraftPick[] }) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          <span className="font-semibold">Your Next Picks</span>
        </div>
        
        <div className="space-y-2">
          {picks.length === 0 && (
            <div className="text-sm opacity-70">No more picks this draft</div>
          )}
          {picks.map(pick => (
            <div key={pick.id} className="flex justify-between text-sm">
              <span>Round {pick.round}</span>
              <span className="font-medium">#{pick.pick}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// -----------------------------------------------------------------------------
// Draft Board
// -----------------------------------------------------------------------------

function DraftBoard({ 
  prospects, 
  search, 
  onSearchChange, 
  positionFilter, 
  onPositionChange, 
  isMyPick, 
  onMakePick 
}: {
  prospects: DraftProspect[];
  search: string;
  onSearchChange: (s: string) => void;
  positionFilter: "ALL" | "F" | "D" | "G";
  onPositionChange: (p: "ALL" | "F" | "D" | "G") => void;
  isMyPick: boolean;
  onMakePick: (id: UID) => void;
}) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 flex-1">
            <Search className="h-4 w-4 opacity-70" />
            <Input
              placeholder="Search prospects..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="rounded-xl"
            />
          </div>
          
          <Select value={positionFilter} onValueChange={onPositionChange as any}>
            <SelectTrigger className="w-24 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="F">F</SelectItem>
              <SelectItem value="D">D</SelectItem>
              <SelectItem value="G">G</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="h-[60vh] pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {prospects.map(prospect => (
              <ProspectCard
                key={prospect.id}
                prospect={prospect}
                canPick={isMyPick}
                onPick={() => onMakePick(prospect.id)}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// -----------------------------------------------------------------------------
// Prospect Card
// -----------------------------------------------------------------------------

function ProspectCard({ prospect, canPick, onPick }: { prospect: DraftProspect; canPick: boolean; onPick: () => void }) {
  const getOverallColor = (overall: number) => {
    if (overall >= 70) return "text-green-600";
    if (overall >= 60) return "text-blue-600";
    if (overall >= 50) return "text-yellow-600";
    return "text-gray-600";
  };

  return (
    <Card className="rounded-2xl border">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-medium text-sm">{prospect.name}</div>
            <div className="text-xs opacity-70">{prospect.nationality}</div>
          </div>
          <Badge variant="outline">#{prospect.draftRank}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-muted rounded-xl">
            <div className="opacity-70">Position</div>
            <div className="font-medium">{prospect.position}</div>
          </div>
          <div className="p-2 bg-muted rounded-xl">
            <div className="opacity-70">Age</div>
            <div className="font-medium">{prospect.age}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-muted rounded-xl">
            <div className="opacity-70">Overall</div>
            <div className={`font-medium ${getOverallColor(prospect.overall)}`}>
              {prospect.overall}
            </div>
          </div>
          <div className="p-2 bg-muted rounded-xl">
            <div className="opacity-70">Potential</div>
            <div className={`font-medium ${getOverallColor(prospect.potential)}`}>
              {prospect.potential}
            </div>
          </div>
        </div>

        <div className="text-xs opacity-70">
          {prospect.heightInches}"  •  {prospect.weightLbs} lbs
        </div>

        {canPick && (
          <Button onClick={onPick} className="w-full rounded-xl">
            Draft {prospect.name}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// -----------------------------------------------------------------------------
// Draft History
// -----------------------------------------------------------------------------

function DraftHistory({ draftState, league }: { draftState: DraftState; league: LeagueState }) {
  const completedPicks = draftState.picks.slice(0, draftState.currentPick);

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4" />
          <span className="font-semibold">Draft History</span>
          <Badge variant="secondary">{completedPicks.length} picks made</Badge>
        </div>

        <ScrollArea className="h-[60vh] pr-2">
          <div className="space-y-2">
            {completedPicks.length === 0 && (
              <div className="text-sm opacity-70">No picks made yet</div>
            )}
            {completedPicks.reverse().map(pick => {
              const prospect = draftState.prospects.find(p => p.id === pick.playerId?.replace('player_', ''));
              const team = league.teams[pick.currentTeamId];
              
              return (
                <div key={pick.id} className="p-3 rounded-xl border flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">
                      #{pick.pick} - {prospect?.name || "Unknown"}
                    </div>
                    <div className="text-xs opacity-70">
                      {prospect?.position} • {team?.name || "Unknown"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs opacity-70">Round {pick.round}</div>
                    {prospect && (
                      <div className="text-xs font-medium">OVR {prospect.overall}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// -----------------------------------------------------------------------------
// Draft Complete
// -----------------------------------------------------------------------------

function DraftComplete({ draftState, league }: { draftState: DraftState; league: LeagueState }) {
  const myPicks = draftState.picks
    .filter(p => p.currentTeamId === draftState.userTeamId && p.playerId)
    .map(pick => {
      const prospect = draftState.prospects.find(p => p.id === pick.playerId?.replace('player_', ''));
      return { pick, prospect };
    });

  return (
    <Card className="rounded-2xl">
      <CardContent className="p-6 text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Trophy className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Draft Complete!</h2>
        </div>
        
        <p className="opacity-70">The {draftState.year} NHL Draft has concluded.</p>
        
        <div className="space-y-3">
          <h3 className="font-semibold">Your Selections:</h3>
          {myPicks.map(({ pick, prospect }) => (
            <div key={pick.id} className="p-3 rounded-xl border">
              <div className="font-medium">
                #{pick.pick} - {prospect?.name || "Unknown"}
              </div>
              <div className="text-sm opacity-70">
                Round {pick.round} • {prospect?.position} • OVR {prospect?.overall}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}