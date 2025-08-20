import { Player } from '@/utils/gameEngine';

interface OnIceDisplayProps {
  homeLineup: Player[];
  awayLineup: Player[];
}

export const OnIceDisplay = ({ homeLineup, awayLineup }: OnIceDisplayProps) => {
  const getPositionColor = (position: Player['position']) => {
    switch (position) {
      case 'G': return 'text-power-yellow';
      case 'C': return 'text-power-red';
      case 'D': return 'text-ice-blue';
      default: return 'text-foreground';
    }
  };

  return (
    <div className="bg-card/90 border border-border rounded-lg p-3">
      <h3 className="text-sm font-bold text-foreground mb-2 text-center">ON ICE</h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <h4 className="text-xs font-bold text-home-team mb-1">HOME</h4>
          {homeLineup.slice(0, 6).map((player) => (
            <div key={player.id} className="flex justify-between items-center text-xs mb-1">
              <span className="text-foreground truncate flex-1">{player.name}</span>
              <span className={`font-bold ml-1 ${getPositionColor(player.position)}`}>
                {player.position}
              </span>
            </div>
          ))}
        </div>

        <div>
          <h4 className="text-xs font-bold text-away-team mb-1">AWAY</h4>
          {awayLineup.slice(0, 6).map((player) => (
            <div key={player.id} className="flex justify-between items-center text-xs mb-1">
              <span className="text-foreground truncate flex-1">{player.name}</span>
              <span className={`font-bold ml-1 ${getPositionColor(player.position)}`}>
                {player.position}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};