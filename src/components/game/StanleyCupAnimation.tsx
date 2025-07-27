import { useEffect, useState } from "react";
import { Trophy, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StanleyCupAnimationProps {
  onClose: () => void;
}

const StanleyCupAnimation = ({ onClose }: StanleyCupAnimationProps) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase(1), 500);
    const timer2 = setTimeout(() => setPhase(2), 2000);
    const timer3 = setTimeout(() => setPhase(3), 3500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      <div className="text-center relative">
        {/* Fireworks background */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <Sparkles
              key={i}
              className={`absolute text-gold animate-ping ${
                phase >= 1 ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
              size={16 + Math.random() * 24}
            />
          ))}
        </div>

        {/* Main trophy */}
        <div className={`transform transition-all duration-1000 ${
          phase >= 0 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}>
          <Trophy className="w-32 h-32 mx-auto mb-8 text-gold animate-bounce" />
        </div>

        {/* Title animation */}
        <div className={`transform transition-all duration-1000 delay-500 ${
          phase >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-gold via-yellow-400 to-gold bg-clip-text text-transparent">
            STANLEY CUP
          </h1>
          <h2 className="text-4xl font-bold mb-8 text-ice-blue">
            CHAMPIONS!
          </h2>
        </div>

        {/* Celebration text */}
        <div className={`transform transition-all duration-1000 delay-1000 ${
          phase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <p className="text-2xl text-muted-foreground mb-8">
            🏆 You've conquered the ultimate challenge! 🏆
          </p>
          <div className="flex justify-center space-x-4 mb-8">
            <Star className="w-8 h-8 text-gold animate-pulse" />
            <Star className="w-8 h-8 text-gold animate-pulse" style={{ animationDelay: '0.2s' }} />
            <Star className="w-8 h-8 text-gold animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>

        {/* Continue button */}
        <div className={`transform transition-all duration-1000 delay-1500 ${
          phase >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <Button
            onClick={onClose}
            className="btn-gold text-xl px-8 py-4 h-auto"
          >
            Continue Your Legacy
          </Button>
        </div>

        {/* Particle effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-gold rounded-full animate-float ${
                phase >= 1 ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StanleyCupAnimation;