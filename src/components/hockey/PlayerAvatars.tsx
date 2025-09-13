import { motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import defaultPlayerImg from '@/assets/players/default-player.jpg';
import connorMcDavidImg from '@/assets/players/connor-mcdavid-realistic.jpg';
import leonDraisaitlImg from '@/assets/players/leon-draisaitl-realistic.jpg';
import sidneyCrosbyImg from '@/assets/players/sidney-crosby-realistic.jpg';
import nathanMacKinnonImg from '@/assets/players/nathan-mackinnon-realistic.jpg';
import austonMatthewsImg from '@/assets/players/auston-matthews-realistic.jpg';
import connorBedardImg from '@/assets/players/connor-bedard-realistic.jpg';

interface Player {
  id: string | number;
  name: string;
  position: string;
  overall: number;
  image?: string;
}

interface PlayerAvatarsProps {
  players: Player[];
  team: string;
  title: string;
  maxPlayers?: number;
}

export const PlayerAvatars = ({ players, team, title, maxPlayers = 6 }: PlayerAvatarsProps) => {
  const getPlayerImage = (player: Player): string => {
    if (player.image?.includes('@/assets/players/')) {
      const imageMap: Record<string, string> = {
        '@/assets/players/connor-mcdavid-realistic.jpg': connorMcDavidImg,
        '@/assets/players/leon-draisaitl-realistic.jpg': leonDraisaitlImg,
        '@/assets/players/sidney-crosby-realistic.jpg': sidneyCrosbyImg,
        '@/assets/players/nathan-mackinnon-realistic.jpg': nathanMacKinnonImg,
        '@/assets/players/auston-matthews-realistic.jpg': austonMatthewsImg,
        '@/assets/players/connor-bedard-realistic.jpg': connorBedardImg,
      };
      return imageMap[player.image] || defaultPlayerImg;
    }
    return player.image || defaultPlayerImg;
  };

  const getOverallColor = (overall: number) => {
    if (overall >= 95) return 'text-purple-400';
    if (overall >= 90) return 'text-gold';
    if (overall >= 85) return 'text-yellow-500';
    if (overall >= 80) return 'text-blue-400';
    return 'text-gray-400';
  };

  const displayPlayers = players.slice(0, maxPlayers);

  return (
    <motion.div 
      className="space-y-3"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h4 className={`text-sm font-bold ${team === 'home' ? 'text-home-team' : 'text-away-team'} text-center`}>
        {title}
      </h4>
      
      <div className="grid grid-cols-3 gap-2">
        {displayPlayers.map((player, index) => (
          <motion.div
            key={player.id}
            className="flex flex-col items-center space-y-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="relative">
              <Avatar className="w-12 h-12 border-2 border-border">
                <AvatarImage 
                  src={getPlayerImage(player)} 
                  alt={player.name}
                  className="object-cover"
                />
                <AvatarFallback className="text-xs">
                  {player.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              {/* Overall rating badge */}
              <motion.div 
                className={`absolute -top-1 -right-1 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center ${getOverallColor(player.overall)}`}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
              >
                <span className="text-xs font-bold">{player.overall}</span>
              </motion.div>
              
              {/* Position badge */}
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 px-1 py-0.5 rounded text-xs font-bold bg-primary text-primary-foreground">
                {player.position}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-xs font-medium text-foreground leading-tight">
                {player.name.split(' ').pop()}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};