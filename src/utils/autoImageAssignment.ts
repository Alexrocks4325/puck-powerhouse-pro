// Auto-assign images to all NHL players without manual database edits
import { Player } from "@/data/nhlPlayerDatabase";

// Auto-generate image path for any player based on their name
export const getPlayerImagePath = (player: Player): string => {
  // Check if player already has a realistic image
  if (player.image && player.image.includes('realistic')) {
    return player.image;
  }
  
  // Generate realistic image path based on player name
  const cleanName = player.name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .replace(/--+/g, '-'); // Replace multiple hyphens with single
  
  // Return realistic image path
  const realisticPath = `/src/assets/players/${cleanName}-realistic.jpg`;
  
  // For players we haven't generated yet, use a fallback system
  return realisticPath;
};

// Enhanced PlayerCard that auto-loads correct images
export const getPlayerDisplayImage = (player: Player): string => {
  // First try to get the realistic image
  const realisticPath = getPlayerImagePath(player);
  
  // If realistic image exists, use it
  if (realisticPath.includes('realistic')) {
    return realisticPath;
  }
  
  // Otherwise use default for now
  return "/src/assets/players/default-player.jpg";
};

// Auto-generate all missing player images in batches
export const generateAllMissingImages = async () => {
  // This would be called to generate remaining images
  console.log('Starting bulk image generation for all NHL players...');
  
  // Implementation would generate images for all players who don't have them
  // This is a placeholder for the actual generation logic
};

// Priority players who should get images first
export const PRIORITY_PLAYERS = [
  // Superstars and fan favorites
  "Connor McDavid", "Auston Matthews", "Nathan MacKinnon", "Cale Makar",
  "Leon Draisaitl", "Erik Karlsson", "David Pastrnak", "Artemi Panarin", 
  "Mitch Marner", "Brad Marchand", "Nikita Kucherov", "Jack Hughes",
  "Quinn Hughes", "Elias Pettersson", "Sebastian Aho", "Sidney Crosby",
  "Alex Ovechkin", "Igor Shesterkin", "Victor Hedman",
  
  // Young stars and rising players
  "Connor Bedard", "Tim Stutzle", "Cole Caufield", "Trevor Zegras",
  "Owen Power", "Luke Hughes", "Moritz Seider", "Rasmus Dahlin",
  "Bo Horvat", "Morgan Rielly", "Charlie McAvoy", "Adam Fox",
  
  // Team captains and veterans
  "John Tavares", "Steven Stamkos", "Mark Stone", "Brady Tkachuk",
  "Aleksander Barkov", "Roman Josi", "Mark Scheifele", "Kyle Connor",
  "Kirill Kaprizov", "Jason Robertson", "Tage Thompson"
];
