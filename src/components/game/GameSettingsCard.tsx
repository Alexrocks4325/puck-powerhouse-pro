import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings, Zap, Clock, Shield, Timer } from "lucide-react";

interface GameSettingsCardProps {
  difficulty: number;
  onDifficultyChanged: (value: number) => void;
  gameLength: number;
  onGameLengthChanged: (value: number) => void;
  penaltiesEnabled: boolean;
  onPenaltiesChanged: (value: boolean) => void;
  overtimeEnabled: boolean;
  onOvertimeChanged: (value: boolean) => void;
}

const DIFFICULTY_LABELS = ["Rookie", "Pro", "All-Star", "Superstar"];
const GAME_LENGTHS = [5, 10, 15, 20];

export default function GameSettingsCard({
  difficulty,
  onDifficultyChanged,
  gameLength,
  onGameLengthChanged,
  penaltiesEnabled,
  onPenaltiesChanged,
  overtimeEnabled,
  onOvertimeChanged,
}: GameSettingsCardProps) {
  return (
    <Card className="game-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-semibold text-foreground">Game Settings</h3>
      </div>

      <div className="space-y-6">
        {/* Difficulty Slider */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Difficulty</span>
            </div>
            <span className="text-sm font-bold text-primary">
              {DIFFICULTY_LABELS[difficulty]}
            </span>
          </div>
          <Slider
            value={[difficulty]}
            onValueChange={(value) => onDifficultyChanged(value[0])}
            min={0}
            max={3}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            {DIFFICULTY_LABELS.map((label, index) => (
              <span key={index} className={difficulty === index ? "text-primary font-medium" : ""}>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Game Length Selection */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Period Length</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {GAME_LENGTHS.map((length) => (
              <Button
                key={length}
                variant={gameLength === length ? "default" : "outline"}
                size="sm"
                onClick={() => onGameLengthChanged(length)}
                className="h-10"
              >
                {length}m
              </Button>
            ))}
          </div>
        </div>

        {/* Special Rules Switches */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Penalties</span>
            </div>
            <Switch
              checked={penaltiesEnabled}
              onCheckedChange={onPenaltiesChanged}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Overtime</span>
            </div>
            <Switch
              checked={overtimeEnabled}
              onCheckedChange={onOvertimeChanged}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}