import { Button } from '@/components/ui/button';

interface ControlButtonsProps {
  onPass: () => void;
  onShoot: () => void;
  onCheck: () => void;
  onSpecialMove: () => void;
  isGameActive: boolean;
}

export const ControlButtons = ({ onPass, onShoot, onCheck, onSpecialMove, isGameActive }: ControlButtonsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-card/80 rounded-t-2xl">
      <Button
        onClick={onPass}
        disabled={!isGameActive}
        className="btn-secondary h-16 text-lg font-bold"
      >
        PASS
      </Button>
      <Button
        onClick={onShoot}
        disabled={!isGameActive}
        className="btn-primary h-16 text-lg font-bold"
      >
        SHOOT
      </Button>
      <Button
        onClick={onCheck}
        disabled={!isGameActive}
        className="btn-accent h-16 text-lg font-bold"
      >
        CHECK
      </Button>
      <Button
        onClick={onSpecialMove}
        disabled={!isGameActive}
        className="btn-gold h-16 text-lg font-bold"
      >
        SPECIAL
      </Button>
    </div>
  );
};