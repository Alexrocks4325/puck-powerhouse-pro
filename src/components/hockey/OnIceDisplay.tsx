import { Player } from '@/utils/gameEngine';
import { PlayerAvatars } from './PlayerAvatars';

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
    <div className="bg-card/90 border border-border rounded-lg p-4">
      <h3 className="text-lg font-bold text-foreground mb-4 text-center">ON ICE</h3>

      <div className="grid grid-cols-2 gap-6">
        <PlayerAvatars 
          players={awayLineup.slice(0, 6)} 
          team="away" 
          title="AWAY TEAM"
          maxPlayers={6}
        />
        
        <PlayerAvatars 
          players={homeLineup.slice(0, 6)} 
          team="home" 
          title="HOME TEAM"
          maxPlayers={6}
        />
      </div>
    </div>
  );
};