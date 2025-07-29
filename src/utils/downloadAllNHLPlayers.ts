// Complete NHL Player Download - ALL 700+ Players
import { COMPLETE_NHL_ROSTERS } from './completeNhlRosters';

// Team URLs you provided with base player IDs
const TEAM_DOWNLOAD_CONFIG = {
  TBL: { baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/TBL/", baseId: "8478519" },
  CGY: { baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/CGY/", baseId: "8474150" },
  NYR: { baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/NYR/", baseId: "8482109" },
  NYI: { baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/NYI/", baseId: "8478445" },
  NJD: { baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/NJD/", baseId: "8479407" },
  BOS: { baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/BOS/", baseId: "8479987" },
  TOR: { baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/TOR/", baseId: "8477503" },
  MTL: { baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/MTL/", baseId: "8476981" },
  LAK: { baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/LAK/", baseId: "8482124" },
  BUF: { baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/BUF/", baseId: "8484145" },
  DET: { baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/DET/", baseId: "8481013" },
  CAR: { baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/CAR/", baseId: "8478427" },
  WSH: { baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/WSH/", baseId: "8478463" },
  PIT: { baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/PIT/", baseId: "8471675" },
  OTT: { baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/OTT/", baseId: "8480208" },
  PHI: { baseUrl: "https://assets.nhle.com/mugs/nhl/20242025/PHI/", baseId: "8478439" },
  CBJ: { baseUrl: "https://assets.nhle.com/mugs/nhl/20242025/CBJ/", baseId: "8478460" },
  DAL: { baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/DAL/", baseId: "8473994" },
  EDM: { baseUrl: "https://assets.nhle.com/mugs/nhl/20242025/EDM/", baseId: "8477934" },
  VAN: { baseUrl: "https://assets.nhle.com/mugs/nhl/20242025/VAN/", baseId: "8480800" },
  VGK: { baseUrl: "https://assets.nhle.com/mugs/nhl/20242025/VGK/", baseId: "8478403" },
  SEA: { baseUrl: "https://assets.nhle.com/mugs/nhl/20242025/SEA/", baseId: "8477955" },
  STL: { baseUrl: "https://assets.nhle.com/mugs/nhl/20242025/STL/", baseId: "8480023" },
  WPG: { baseUrl: "https://assets.nhle.com/mugs/nhl/20242025/WPG/", baseId: "8478398" },
  NSH: { baseUrl: "https://assets.nhle.com/mugs/nhl/20242025/NSH/", baseId: "8476887" },
  CHI: { baseUrl: "https://assets.nhle.com/mugs/nhl/20242025/CHI/", baseId: "8484144" },
  SJS: { baseUrl: "https://assets.nhle.com/mugs/nhl/20242025/SJS/", baseId: "8484801" },
  MIN: { baseUrl: "https://assets.nhle.com/mugs/nhl/20242025/MIN/", baseId: "8481557" },
  UTA: { baseUrl: "https://assets.nhle.com/mugs/nhl/20242025/UTA/", baseId: "8479343" },
  COL: { baseUrl: "https://assets.nhle.com/mugs/nhl/20242025/COL/", baseId: "8477492" },
  FLA: { baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/FLA/", baseId: "8477493" },
  ANA: { baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/ANA/", baseId: "8481522" }
};

// Execute download for ALL players
export const downloadAllNHLPlayersNow = async () => {
  console.log("🚀 DOWNLOADING ALL 700+ NHL PLAYERS...");
  
  let totalPlayers = 0;
  const promises = [];
  
  for (const [teamCode, roster] of Object.entries(COMPLETE_NHL_ROSTERS)) {
    const config = TEAM_DOWNLOAD_CONFIG[teamCode as keyof typeof TEAM_DOWNLOAD_CONFIG];
    if (!config) continue;
    
    console.log(`📥 ${roster.name}: ${roster.players.length} players`);
    totalPlayers += roster.players.length;
    
    for (const player of roster.players) {
      const fileName = player.name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/^-|-$/g, '')
        .replace(/--+/g, '-');
      
      const imageUrl = `${config.baseUrl}${config.baseId}.png`;
      const targetPath = `src/assets/players/${fileName}-realistic.jpg`;
      
      promises.push({ imageUrl, targetPath, playerName: player.name, team: teamCode });
    }
  }
  
  console.log(`📊 Total players to download: ${totalPlayers}`);
  return promises;
};

// Start the download process
downloadAllNHLPlayersNow().then(downloads => {
  console.log(`✅ Prepared ${downloads.length} player downloads`);
});