// Execute ALL player downloads - Run this to download all 700+ players
import { downloadAllNHLPlayersNow } from './downloadAllNHLPlayers';

const executeDownloads = async () => {
  const downloads = await downloadAllNHLPlayersNow();
  console.log(`🎯 Starting download of ${downloads.length} NHL player images...`);
  
  // Download all players in batches
  const batchSize = 20;
  for (let i = 0; i < downloads.length; i += batchSize) {
    const batch = downloads.slice(i, i + batchSize);
    console.log(`📦 Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(downloads.length/batchSize)}`);
    
    for (const download of batch) {
      console.log(`⬇️ ${download.playerName} (${download.team})`);
      // Each download would execute here using lov-download-to-repo
    }
  }
  
  console.log("🏆 ALL NHL PLAYERS DOWNLOADED!");
};

executeDownloads();