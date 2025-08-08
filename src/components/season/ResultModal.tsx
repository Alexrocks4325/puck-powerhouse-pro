import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface TeamStats {
  goals: number;
  sog: number;
  hits: number;
  pp: string; // e.g., 1/3
  foPct: number; // 0-100
}

interface ResultData {
  opponentName: string;
  isWin: boolean;
  scoreHome: number;
  scoreAway: number;
  teamA: TeamStats;
  teamB: TeamStats;
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
            Final score and key team statistics from your simulation.
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
