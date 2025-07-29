// Progression System utilities and functions

export const LEVEL_REQUIREMENTS = {
  1: 0,
  2: 100,
  3: 250,
  4: 450,
  5: 700,
  6: 1000,
  7: 1350,
  8: 1750,
  9: 2200,
  10: 2700,
  11: 3250,
  12: 3850,
  13: 4500,
  14: 5200,
  15: 5950,
  16: 6750,
  17: 7600,
  18: 8500,
  19: 9450,
  20: 10450,
  // Continue progression...
};

export const EXPERIENCE_REWARDS = {
  GAME_WIN: 50,
  GAME_LOSS: 15,
  TASK_COMPLETE: 25,
  PACK_OPEN: 10,
  DAILY_LOGIN: 20,
  SEASON_COMPLETE: 200,
  CHAMPIONSHIP_WIN: 500,
};

export const LEVEL_REWARDS = {
  5: { coins: 500, packs: 1, type: 'standard' },
  10: { coins: 1000, packs: 2, type: 'premium' },
  15: { coins: 1500, packs: 1, type: 'elite' },
  20: { coins: 2500, packs: 3, type: 'premium' },
  25: { coins: 3000, packs: 1, type: 'elite' },
  30: { coins: 5000, packs: 2, type: 'elite' },
};

export const calculateLevel = (experience: number): number => {
  let level = 1;
  for (const [lvl, req] of Object.entries(LEVEL_REQUIREMENTS)) {
    if (experience >= req) {
      level = parseInt(lvl);
    } else {
      break;
    }
  }
  return level;
};

export const getExperienceToNextLevel = (experience: number): number => {
  const currentLevel = calculateLevel(experience);
  const nextLevel = currentLevel + 1;
  const nextLevelRequirement = LEVEL_REQUIREMENTS[nextLevel as keyof typeof LEVEL_REQUIREMENTS];
  
  if (!nextLevelRequirement) return 0; // Max level reached
  
  return nextLevelRequirement - experience;
};

export const addExperience = (
  playerData: any, 
  amount: number, 
  reason: string = 'Unknown'
): { newPlayerData: any; leveledUp: boolean; rewards?: any } => {
  const oldLevel = playerData.level || 1;
  const newExperience = (playerData.experience || 0) + amount;
  const newLevel = calculateLevel(newExperience);
  const leveledUp = newLevel > oldLevel;
  
  let rewards = null;
  if (leveledUp && LEVEL_REWARDS[newLevel as keyof typeof LEVEL_REWARDS]) {
    rewards = LEVEL_REWARDS[newLevel as keyof typeof LEVEL_REWARDS];
  }

  const newPlayerData = {
    ...playerData,
    experience: newExperience,
    level: newLevel,
    experienceToNext: getExperienceToNextLevel(newExperience),
    ...(rewards ? {
      coins: playerData.coins + rewards.coins,
      packs: playerData.packs + rewards.packs
    } : {})
  };

  return { newPlayerData, leveledUp, rewards };
};

export const showLevelUpNotification = (newLevel: number, rewards?: any) => {
  let message = `🎉 Level Up! You reached level ${newLevel}!`;
  
  if (rewards) {
    message += `\n\nRewards:\n`;
    if (rewards.coins) message += `• ${rewards.coins} coins\n`;
    if (rewards.packs) message += `• ${rewards.packs} ${rewards.type} pack(s)\n`;
  }
  
  alert(message);
};