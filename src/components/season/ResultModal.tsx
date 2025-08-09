import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface TeamStats {
  goals: number;
  sog: number;
  hits: number;
  pp: string; // e.g., 1/3
  foPct: number; // 0-100
}

interface SkaterStats {
  id?: string | number;
  name: string;
  position: string;
  g: number;
  a: number;
  sog: number;
  hits: number;
  pim?: number;
  toi?: number; // minutes
}

interface GoalieLine {
  name: string;
  sa: number; // shots against
  sv: number; // saves
  ga: number; // goals against
  svPct: number; // 0-100
}

interface ResultData {
  opponentName: string;
  isWin: boolean;
  scoreHome: number;
  scoreAway: number;
  teamA: TeamStats;
  teamB: TeamStats;
  skatersA?: SkaterStats[];
  skatersB?: SkaterStats[];
  goalies?: { home?: GoalieLine; away?: GoalieLine };
}

interface ResultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ResultData | null;
}

export default function ResultModal({ open, onOpenChange, data }: ResultModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="result-desc">
        <DialogHeader>
          <DialogTitle>Game Result</DialogTitle>
          <DialogDescription id="result-desc">
            Final score, box score and key team statistics from your simulation.
          </DialogDescription>
        </DialogHeader>

        {data && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-foreground font-medium">You</div>
              <div className="text-2xl font-bold text-foreground">
                {data.scoreHome} - {data.scoreAway}
              </div>
              <div className="text-right text-foreground font-medium">{data.opponentName}</div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-2">
                <div className="font-semibold">Your Team</div>
                <div className="flex justify-between"><span className="text-muted-foreground">SOG</span><span>{data.teamA.sog}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Hits</span><span>{data.teamA.hits}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">PP</span><span>{data.teamA.pp}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">FO%</span><span>{Math.round(data.teamA.foPct)}%</span></div>
              </div>
              <div className="space-y-2">
                <div className="font-semibold">Opponent</div>
                <div className="flex justify-between"><span className="text-muted-foreground">SOG</span><span>{data.teamB.sog}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Hits</span><span>{data.teamB.hits}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">PP</span><span>{data.teamB.pp}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">FO%</span><span>{Math.round(data.teamB.foPct)}%</span></div>
              </div>
            </div>

            {data.skatersA && data.skatersB && (
              <div className="space-y-3">
                <Separator />
                <div>
                  <div className="text-lg font-semibold mb-2">Box Score</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-semibold mb-1">Your Team</div>
                      <div className="rounded-md border">
                        <div className="grid grid-cols-6 gap-2 px-2 py-1 text-muted-foreground">
                          <div className="col-span-2">Player</div>
                          <div className="text-center">G</div>
                          <div className="text-center">A</div>
                          <div className="text-center">SOG</div>
                          <div className="text-center">TOI</div>
                        </div>
                        <Separator />
                        <div className="max-h-60 overflow-auto">
                          {data.skatersA.map((p, idx) => (
                            <div key={idx} className="grid grid-cols-6 gap-2 px-2 py-1">
                              <div className="col-span-2 truncate">{p.name} <span className="text-muted-foreground">({p.position})</span></div>
                              <div className="text-center">{p.g}</div>
                              <div className="text-center">{p.a}</div>
                              <div className="text-center">{p.sog}</div>
                              <div className="text-center">{p.toi ?? '-'}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {data.goalies?.home && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          G: {data.goalies.home.name} — SA {data.goalies.home.sa}, SV {data.goalies.home.sv}, GA {data.goalies.home.ga}, SV% {Math.round(data.goalies.home.svPct)}%
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold mb-1">{data.opponentName}</div>
                      <div className="rounded-md border">
                        <div className="grid grid-cols-6 gap-2 px-2 py-1 text-muted-foreground">
                          <div className="col-span-2">Player</div>
                          <div className="text-center">G</div>
                          <div className="text-center">A</div>
                          <div className="text-center">SOG</div>
                          <div className="text-center">TOI</div>
                        </div>
                        <Separator />
                        <div className="max-h-60 overflow-auto">
                          {data.skatersB.map((p, idx) => (
                            <div key={idx} className="grid grid-cols-6 gap-2 px-2 py-1">
                              <div className="col-span-2 truncate">{p.name} <span className="text-muted-foreground">({p.position})</span></div>
                              <div className="text-center">{p.g}</div>
                              <div className="text-center">{p.a}</div>
                              <div className="text-center">{p.sog}</div>
                              <div className="text-center">{p.toi ?? '-'}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {data.goalies?.away && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          G: {data.goalies.away.name} — SA {data.goalies.away.sa}, SV {data.goalies.away.sv}, GA {data.goalies.away.ga}, SV% {Math.round(data.goalies.away.svPct)}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
