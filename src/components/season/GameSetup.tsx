import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import PlayerCard from "@/components/game/PlayerCard";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Play, Zap } from "lucide-react";

interface GameSetupProps {
  roster: any[];
  opponent: { name: string; difficulty: number } | null;
  onBack: () => void;
  onSimulateFull: (opts: { difficulty: string; periodLength: number; venue: string; jerseys: string }) => void;
  onSimulateInteractive?: () => void; // placeholder for future step
}

const difficulties = ["Rookie", "Pro", "All-Star", "Superstar"] as const;

export default function GameSetup({ roster, opponent, onBack, onSimulateFull, onSimulateInteractive }: GameSetupProps) {
  const { toast } = useToast();
  const [difficulty, setDifficulty] = useState<(typeof difficulties)[number]>("Pro");
  const [periodLength, setPeriodLength] = useState<number>(5);
  const [venue, setVenue] = useState<string>("Home Arena");
  const [jerseys, setJerseys] = useState<string>("Home");

  const hasGoalie = useMemo(() => roster?.some((p) => p.position === "G"), [roster]);
  const isLegal = useMemo(() => (roster?.length ?? 0) >= 6 && hasGoalie, [roster, hasGoalie]);

  const bestSix = useMemo(() => {
    return (roster || [])
      .slice()
      .sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))
      .slice(0, 6);
  }, [roster]);

  const handleFull = () => {
    if (!isLegal) {
      toast({ title: "Invalid lineup", description: "Need at least 1 G and 5 skaters.", variant: "destructive" });
      return;
    }
    onSimulateFull({ difficulty, periodLength, venue, jerseys });
  };

  return (
    <div className="container mx-auto px-4 pt-20 pb-8">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="outline" onClick={onBack} className="hover-scale">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Game Setup</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Lineup */}
        <Card className="p-4 md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-foreground">Starting Lineup</h2>
            <Badge variant={isLegal ? "default" : "destructive"}>{isLegal ? "Valid" : "Invalid"}</Badge>
          </div>
          <Separator className="my-2" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {bestSix.map((p) => (
              <div key={p.id} className="animate-fade-in">
                <PlayerCard player={p} size="small" />
              </div>
            ))}
          </div>
          {!hasGoalie && (
            <p className="mt-3 text-sm text-destructive">Add at least one goalie to start.</p>
          )}
        </Card>

        {/* Opponent & options */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold text-foreground mb-2">Opponent</h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-foreground font-medium">{opponent?.name ?? "TBD"}</div>
              <div className="text-muted-foreground text-sm">Projected difficulty</div>
            </div>
            <div className="flex items-center text-primary font-bold">
              <Zap className="w-4 h-4 mr-1" /> {Math.round(opponent?.difficulty ?? 80)}
            </div>
          </div>
          <Separator className="my-2" />

          <div className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Difficulty</div>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">Period length (min)</div>
              <Select value={String(periodLength)} onValueChange={(v) => setPeriodLength(Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent>
                  {[5, 7, 10, 20].map((m) => (
                    <SelectItem key={m} value={String(m)}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">Venue</div>
              <Select value={venue} onValueChange={setVenue}>
                <SelectTrigger>
                  <SelectValue placeholder="Select venue" />
                </SelectTrigger>
                <SelectContent>
                  {["Home Arena", "Away Arena"].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">Jerseys</div>
              <Select value={jerseys} onValueChange={setJerseys}>
                <SelectTrigger>
                  <SelectValue placeholder="Select jerseys" />
                </SelectTrigger>
                <SelectContent>
                  {["Home", "Away", "Alternate"].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-5 grid gap-2">
            <Button onClick={handleFull} className="btn-primary">
              <Play className="w-4 h-4 mr-2" /> Full Game Simulation
            </Button>
            <Button variant="secondary" onClick={onSimulateInteractive} disabled>
              Interactive Period Simulation (soon)
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
