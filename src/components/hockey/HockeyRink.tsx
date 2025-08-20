interface HockeyRinkProps {
  onRinkTap: () => void;
  isGameActive: boolean;
}

export const HockeyRink = ({ onRinkTap, isGameActive }: HockeyRinkProps) => {
  return (
    <div 
      className="relative w-full max-w-4xl h-96 bg-gradient-to-b from-ice-blue/30 to-ice-blue/50 rounded-2xl border-4 border-ice-blue cursor-pointer transition-all duration-300 hover:shadow-xl"
      onClick={onRinkTap}
    >
      {/* Center Line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-power-red transform -translate-x-1/2" />
      
      {/* Face-off Circles */}
      <div className="absolute left-1/4 top-1/2 w-16 h-16 rounded-full border-2 border-power-red transform -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute right-1/4 top-1/2 w-16 h-16 rounded-full border-2 border-power-red transform translate-x-1/2 -translate-y-1/2" />
      
      {/* Goal Creases */}
      <div className="absolute left-4 top-1/2 w-12 h-20 rounded-full border-2 border-ice-blue bg-ice-blue/20 transform -translate-y-1/2" />
      <div className="absolute right-4 top-1/2 w-12 h-20 rounded-full border-2 border-ice-blue bg-ice-blue/20 transform -translate-y-1/2" />
      
      {/* Goals */}
      <div className="absolute left-2 top-1/2 w-2 h-12 bg-power-red transform -translate-y-1/2" />
      <div className="absolute right-2 top-1/2 w-2 h-12 bg-power-red transform -translate-y-1/2" />
      
      {/* Game Status Indicator */}
      {!isGameActive && (
        <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center">
          <div className="text-white text-2xl font-bold">PAUSED</div>
        </div>
      )}
    </div>
  );
};