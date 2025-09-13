import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UltimateModeHeader from './UltimateModeHeader';
import UltimateModeTabs from './UltimateModeTabs';
import PackOpening from './PackOpening';
import TasksAndChallenges from './TasksAndChallenges';
import RosterCollection from './RosterCollection';
import PackManager from './PackManager';
import CoinShop from './CoinShop';

interface UltimateModeProps {
  playerData: {
    coins: number;
    packs: number;
    level: number;
    experience: number;
    experienceToNext: number;
    team: any[];
    completedTutorial: boolean;
    seasonProgress: number;
    leaguePoints: number;
    selectedTeam: string;
    coachName: string;
    completedIntro: boolean;
  };
  setPlayerData: (data: any) => void;
  onNavigate: (screen: 'menu' | 'franchise' | 'live-events') => void;
  initialTab?: 'packs' | 'tasks' | 'collection';
}

const UltimateMode = ({ playerData, setPlayerData, onNavigate, initialTab = 'packs' }: UltimateModeProps) => {
  const [activeTab, setActiveTab] = useState<'packs' | 'tasks' | 'collection'>(initialTab);
  const [showPackManager, setShowPackManager] = useState(false);
  const [showCoinShop, setShowCoinShop] = useState(false);

  const handleNavigateInternal = (screen: any) => {
    // Handle internal navigation within ultimate mode components
    if (screen === 'menu') {
      onNavigate('menu');
    }
    // Other navigation requests are handled internally
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'packs': return 'Pack Opening';
      case 'tasks': return 'Tasks & Challenges';
      case 'collection': return 'Player Collection';
      default: return 'Ultimate Mode';
    }
  };

  const renderActiveTab = () => {
    const commonProps = {
      playerData,
      setPlayerData,
      onNavigate: handleNavigateInternal
    };

    switch (activeTab) {
      case 'packs':
        return <PackOpening {...commonProps} />;
      case 'tasks':
        return <TasksAndChallenges {...commonProps} />;
      case 'collection':
        return <RosterCollection {...commonProps} />;
      default:
        return <PackOpening {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen ice-surface">
      {/* Header */}
      <UltimateModeHeader
        playerData={playerData}
        onBack={() => onNavigate('menu')}
        onCoinsClick={() => setShowCoinShop(true)}
        onPacksClick={() => setShowPackManager(true)}
        activeTab={activeTab}
        title={getTabTitle()}
      />

      {/* Tabs */}
      <UltimateModeTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Content */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            {renderActiveTab()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modals */}
      <PackManager 
        isOpen={showPackManager}
        onClose={() => setShowPackManager(false)}
        playerData={playerData}
        setPlayerData={setPlayerData}
      />
      
      <CoinShop 
        isOpen={showCoinShop}
        onClose={() => setShowCoinShop(false)}
        playerData={playerData}
        setPlayerData={setPlayerData}
      />
    </div>
  );
};

export default UltimateMode;
