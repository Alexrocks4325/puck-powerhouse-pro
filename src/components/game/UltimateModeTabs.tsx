import { motion } from 'framer-motion';
import { Package, Target, Library, Trophy } from 'lucide-react';

interface UltimateModeTabsProps {
  activeTab: 'packs' | 'tasks' | 'collection';
  onTabChange: (tab: 'packs' | 'tasks' | 'collection') => void;
}

const UltimateModeTabs = ({ activeTab, onTabChange }: UltimateModeTabsProps) => {
  const tabs = [
    {
      id: 'packs' as const,
      name: 'Pack Opening',
      icon: Package,
      description: 'Open packs & collect players',
      color: 'text-gold'
    },
    {
      id: 'tasks' as const,
      name: 'Tasks & Challenges',
      icon: Target,
      description: 'Complete challenges for rewards',
      color: 'text-green-500'
    },
    {
      id: 'collection' as const,
      name: 'Player Collection',
      icon: Library,
      description: 'View your complete roster',
      color: 'text-orange-500'
    }
  ];

  return (
    <div className="bg-card/50 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex-1 px-6 py-4 text-left transition-colors ${
                  isActive 
                    ? 'text-foreground bg-background border-t-2 border-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-6 h-6 ${isActive ? tab.color : 'text-muted-foreground'}`} />
                  <div>
                    <div className={`font-semibold ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {tab.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {tab.description}
                    </div>
                  </div>
                </div>
                
                {/* Active tab indicator */}
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"
                    layoutId="activeTab"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UltimateModeTabs;