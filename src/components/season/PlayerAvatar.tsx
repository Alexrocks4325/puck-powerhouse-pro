import React from "react";
import { cn } from "@/lib/utils";

interface PlayerAvatarProps {
  label: string | number;
  variant: "home" | "away";
  size?: number; // px
  isGoalie?: boolean;
  hasPuck?: boolean;
  className?: string;
}

// Tiny jersey SVG using currentColor for fill; styled via Tailwind semantic tokens
export function PlayerAvatar({ label, variant, size = 20, isGoalie, hasPuck, className }: PlayerAvatarProps) {
  const colorClass = variant === "home" ? "text-primary" : "text-secondary";
  const fgClass = "text-primary-foreground";

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full",
        hasPuck ? "ring-2 ring-accent" : "ring-1 ring-border",
        "bg-background/60 backdrop-blur-sm",
        className
      )}
      style={{ width: size, height: size }}
      aria-label={`${variant} ${isGoalie ? "goalie" : "skater"}`}
      title={`${variant === "home" ? "Home" : "Away"} ${isGoalie ? "Goalie" : "Skater"}`}
    >
      {/* Jersey icon */}
      <svg
        width={size - 2}
        height={size - 2}
        viewBox="0 0 24 24"
        className={cn("absolute", colorClass)}
        aria-hidden
      >
        {/* Simple jersey shape */}
        <path
          d="M6 4l3-2h6l3 2 3 3-3 3v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V10L3 7l3-3z"
          fill="currentColor"
          fillOpacity={isGoalie ? 0.85 : 1}
        />
        {/* Sleeves accent */}
        <rect x="2" y="6" width="4" height="4" fill="currentColor" opacity="0.5" />
        <rect x="18" y="6" width="4" height="4" fill="currentColor" opacity="0.5" />
      </svg>

      {/* Label/number */}
      <span
        className={cn(
          "z-10 text-[10px] leading-none font-semibold select-none",
          fgClass,
          variant === "away" ? "text-secondary-foreground" : "text-primary-foreground"
        )}
      >
        {label}
      </span>
    </div>
  );
}

export default PlayerAvatar;
