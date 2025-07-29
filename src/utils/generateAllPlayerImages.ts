// Utility to systematically generate images for all NHL players
import { nhlPlayerDatabase, Player } from "@/data/nhlPlayerDatabase";

// List of all players who need images generated
export const getPlayersWithoutImages = (): Player[] => {
  return nhlPlayerDatabase.filter(player => !player.image || player.image.includes('default-player'));
};

// Team-based image generation data
export const teamImagePrompts = {
  ANA: "Anaheim Ducks orange and black uniform",
  ARI: "Arizona Coyotes red and desert themed uniform", 
  BOS: "Boston Bruins black and gold uniform",
  BUF: "Buffalo Sabres blue and gold uniform",
  CGY: "Calgary Flames red and yellow uniform",
  CAR: "Carolina Hurricanes red and black uniform",
  CHI: "Chicago Blackhawks red and black uniform",
  COL: "Colorado Avalanche burgundy and blue uniform",
  CBJ: "Columbus Blue Jackets blue and red uniform",
  DAL: "Dallas Stars green and black uniform",
  DET: "Detroit Red Wings red and white uniform",
  EDM: "Edmonton Oilers blue and orange uniform",
  FLA: "Florida Panthers red and blue uniform",
  LAK: "Los Angeles Kings black and silver uniform",
  MIN: "Minnesota Wild green and red uniform",
  MTL: "Montreal Canadiens red and blue uniform",
  NSH: "Nashville Predators gold and blue uniform",
  NJD: "New Jersey Devils red and black uniform",
  NYI: "New York Islanders blue and orange uniform",
  NYR: "New York Rangers blue and red uniform",
  OTT: "Ottawa Senators red and black uniform",
  PHI: "Philadelphia Flyers orange and black uniform",
  PIT: "Pittsburgh Penguins black and gold uniform",
  SJS: "San Jose Sharks teal and black uniform",
  SEA: "Seattle Kraken blue and teal uniform",
  STL: "St. Louis Blues blue and gold uniform",
  TBL: "Tampa Bay Lightning blue and white uniform",
  TOR: "Toronto Maple Leafs blue and white uniform",
  VAN: "Vancouver Canucks blue and green uniform",
  VGK: "Vegas Golden Knights gold and black uniform",
  WSH: "Washington Capitals red and blue uniform",
  WPG: "Winnipeg Jets blue and white uniform"
};

// Generate professional prompt for any player
export const generatePlayerPrompt = (player: Player): string => {
  const teamUniform = teamImagePrompts[player.team as keyof typeof teamImagePrompts] || `${player.team} uniform`;
  const position = player.position === 'G' ? 'goalie' : 'hockey player';
  
  return `Professional NHL ${position} headshot - realistic ${player.name} face, ${teamUniform}, studio lighting, high-definition sports photography style, clean professional background, ultra realistic human face details`;
};

// Generate image filename for any player
export const generatePlayerImagePath = (player: Player): string => {
  const cleanName = player.name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  
  return `src/assets/players/${cleanName}-realistic.jpg`;
};

// Batch players by team for systematic generation
export const getPlayersBatchedByTeam = (): Record<string, Player[]> => {
  const playersWithoutImages = getPlayersWithoutImages();
  const batched: Record<string, Player[]> = {};
  
  playersWithoutImages.forEach(player => {
    if (!batched[player.team]) {
      batched[player.team] = [];
    }
    batched[player.team].push(player);
  });
  
  return batched;
};

// Priority order for generating images (stars first, then role players)
export const getPlayersByPriority = (): Player[] => {
  const playersWithoutImages = getPlayersWithoutImages();
  
  return playersWithoutImages.sort((a, b) => {
    // Sort by overall rating (highest first)
    if (b.overall !== a.overall) {
      return b.overall - a.overall;
    }
    // Then by rarity
    const rarityOrder = { legend: 5, elite: 4, gold: 3, silver: 2, bronze: 1 };
    return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
  });
};

// Get total count of players needing images
export const getImageGenerationStats = () => {
  const total = nhlPlayerDatabase.length;
  const withImages = nhlPlayerDatabase.filter(p => p.image && !p.image.includes('default-player')).length;
  const needImages = total - withImages;
  
  return {
    total,
    withImages,
    needImages,
    percentComplete: Math.round((withImages / total) * 100)
  };
};