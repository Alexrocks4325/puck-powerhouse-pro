import React from "react";
import { cn } from "@/lib/utils";
import PlayerAvatar from "./PlayerAvatar";

export interface MiniRinkPlayer {
  id: string;
  x: number; // 0-100
  y: number; // 0-100
  variant: "home" | "away";
  label: string | number;
  name?: string;
  isGoalie?: boolean;
  hasPuck?: boolean;
}

interface MiniRinkProps {
  players: MiniRinkPlayer[];
  puck: { x: number; y: number };
  goalSide?: "home" | "away" | null;
  className?: string;
}

// A responsive 2:1 rink with basic lines; players & puck are absolutely positioned
export default function MiniRink({ players, puck, className, goalSide }: MiniRinkProps) {
  return (
    <div
      className={cn(
        "relative w-full aspect-[2/1] rounded-md border overflow-hidden bg-gradient-to-b from-background/70 to-muted/40",
        className
      )}
      role="img"
      aria-label="Mini hockey rink with players and puck"
    >
      {/* Rink markings */}
      {/* Boards */}
      <div className="absolute inset-2 rounded-[20px] border border-primary/20 pointer-events-none" />
      {/* Center line */}
      <div className="absolute inset-y-0 left-1/2 w-0.5 bg-primary/40" />
      {/* Blue lines */}
      <div className="absolute inset-y-0 left-[25%] w-0.5 bg-primary/20" />
      <div className="absolute inset-y-0 left-[75%] w-0.5 bg-primary/20" />
      {/* Goal creases (simplified) */}
      <div className="absolute top-1/2 -translate-y-1/2 left-3 w-6 h-16 rounded-full border border-primary/30" />
      <div className="absolute top-1/2 -translate-y-1/2 right-3 w-6 h-16 rounded-full border border-primary/30" />
      {/* Faceoff circles (simplified dots) */}
      {[25, 75].map((lx) => (
        <div key={lx} className="absolute inset-y-0" style={{ left: `${lx}%` }}>
          <div className="absolute top-[25%] -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary/40" />
          <div className="absolute top-[75%] -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary/40" />
        </div>
      ))}
      {/* Goal celebration overlay */}
      {goalSide && (
        <div
          className={cn(
            "absolute inset-0 rounded-md pointer-events-none animate-[pulse_1.2s_cubic-bezier(0.4,0,0.6,1)_infinite]",
            goalSide === "home" ? "bg-primary/10" : "bg-secondary/10"
          )}
          aria-hidden
        />
      )}

      {/* Puck */}
      <div
        className="absolute w-2.5 h-2.5 rounded-full bg-foreground shadow"
        style={{ left: `${puck.x}%`, top: `${puck.y}%`, transform: "translate(-50%, -50%)" }}
        aria-label="Puck"
      />

      {/* Players */}
      {players.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, -50%)" }}
        >
          {p.name && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-medium text-foreground/90">
              {p.name}
            </div>
          )}
          <PlayerAvatar label={p.label} variant={p.variant} isGoalie={p.isGoalie} hasPuck={p.hasPuck} />
        </div>
      ))}
    </div>
  );
}
