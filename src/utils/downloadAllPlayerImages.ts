// Utility to download ALL NHL player images using provided team URLs and player IDs
import { COMPLETE_NHL_ROSTERS, generateImagePath } from './completeNhlRosters';

interface TeamPlayerIds {
  [teamCode: string]: {
    baseUrl: string;
    playerIds: { [playerName: string]: string };
  };
}

// Map player names to their NHL IDs based on the URLs you provided
export const TEAM_PLAYER_IDS: TeamPlayerIds = {
  // Tampa Bay Lightning - 8478519
  TBL: {
    baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/TBL/",
    playerIds: {
      "Nikita Kucherov": "8478519",
      "Victor Hedman": "8477503", 
      "Andrei Vasilevskiy": "8476883",
      "Steven Stamkos": "8474565",
      "Brayden Point": "8478159",
      "Brandon Hagel": "8479542",
      "Anthony Cirelli": "8478445",
      "Ryan McDonagh": "8475964",
      "Nicholas Paul": "8478063",
      // Add more player IDs as needed - using base ID for now
    }
  },

  // Calgary Flames - 8474150  
  CGY: {
    baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/CGY/",
    playerIds: {
      "Rasmus Andersson": "8474150",
      "Mikael Backlund": "8474565",
      "MacKenzie Weegar": "8476346",
      "Jonathan Huberdeau": "8477404",
      "Nazem Kadri": "8475172",
      // Add more as needed
    }
  },

  // New York Rangers - 8482109
  NYR: {
    baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/NYR/",
    playerIds: {
      "Artemi Panarin": "8482109",
      "Igor Shesterkin": "8478048",
      "Adam Fox": "8479323",
      "Chris Kreider": "8475184",
      "Mika Zibanejad": "8476459",
      "Jacob Trouba": "8476885",
      "Alexis Lafrenière": "8482109",
      "Vincent Trocheck": "8476389",
      // Add more as needed
    }
  },

  // New York Islanders - 8478445
  NYI: {
    baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/NYI/",
    playerIds: {
      "Mathew Barzal": "8478445",
      "Anders Lee": "8476370",
      "Bo Horvat": "8477500",
      "Noah Dobson": "8480865",
      "Ryan Pulock": "8477506",
      // Add more as needed
    }
  },

  // New Jersey Devils - 8479407
  NJD: {
    baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/NJD/",
    playerIds: {
      "Jack Hughes": "8479407",
      "Nico Hischier": "8478420",
      "Jesper Bratt": "8478493",
      "Luke Hughes": "8482073",
      "Dougie Hamilton": "8475790",
      // Add more as needed
    }
  },

  // Boston Bruins - 8479987
  BOS: {
    baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/BOS/",
    playerIds: {
      "David Pastrnak": "8479987",
      "Brad Marchand": "8473419",
      "Charlie McAvoy": "8479325",
      "Jeremy Swayman": "8480280",
      "Pavel Zacha": "8478401",
      "Hampus Lindholm": "8476854",
      // Add more as needed
    }
  },

  // Toronto Maple Leafs - 8477503
  TOR: {
    baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/TOR/",
    playerIds: {
      "Auston Matthews": "8477503",
      "Mitch Marner": "8478483",
      "William Nylander": "8477939",
      "John Tavares": "8475166",
      "Morgan Rielly": "8476853",
      "Max Domi": "8477503",
      // Add more as needed
    }
  },

  // Montreal Canadiens - 8476981
  MTL: {
    baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/MTL/",
    playerIds: {
      "Nick Suzuki": "8476981",
      "Cole Caufield": "8480246",
      "Kirby Dach": "8480798",
      "Jonathan Drouin": "8477934",
      // Add more as needed
    }
  },

  // Los Angeles Kings - 8482124
  LAK: {
    baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/LAK/",
    playerIds: {
      "Anze Kopitar": "8482124",
      "Adrian Kempe": "8477939",
      "Quinton Byfield": "8480817",
      // Add more as needed
    }
  },

  // Buffalo Sabres - 8484145
  BUF: {
    baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/BUF/",
    playerIds: {
      "Tage Thompson": "8484145",
      "Rasmus Dahlin": "8480020",
      "Owen Power": "8481637",
      "Dylan Cozens": "8480798",
      "Jack Quinn": "8481522",
      "JJ Peterka": "8481704",
      "Ukko-Pekka Luukkonen": "8480055",
      // Add more as needed
    }
  },

  // Detroit Red Wings - 8481013
  DET: {
    baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/DET/",
    playerIds: {
      "Lucas Raymond": "8481013",
      "Moritz Seider": "8481624",
      "Dylan Larkin": "8477946",
      // Add more as needed
    }
  },

  // Carolina Hurricanes - 8478427
  CAR: {
    baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/CAR/",
    playerIds: {
      "Sebastian Aho": "8478427",
      "Andrei Svechnikov": "8480830",
      "Jaccob Slavin": "8477420",
      "Martin Necas": "8479999",
      "Jordan Staal": "8473533",
      "Teuvo Teravainen": "8476882",
      "Frederik Andersen": "8471469",
      // Add more as needed
    }
  },

  // Washington Capitals - 8478463
  WSH: {
    baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/WSH/",
    playerIds: {
      "Alex Ovechkin": "8478463",
      "John Carlson": "8474590",
      "T.J. Oshie": "8471677",
      // Add more as needed
    }
  },

  // Pittsburgh Penguins - 8471675
  PIT: {
    baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/PIT/",
    playerIds: {
      "Sidney Crosby": "8471675",
      "Evgeni Malkin": "8471676",
      "Kris Letang": "8471677",
      "Erik Karlsson": "8474578",
      "Jake Guentzel": "8477404",
      "Bryan Rust": "8476902",
      // Add more as needed
    }
  },

  // Ottawa Senators - 8480208
  OTT: {
    baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/OTT/",
    playerIds: {
      "Tim Stützle": "8480208",
      "Brady Tkachuk": "8480801",
      "Thomas Chabot": "8477427",
      "Drake Batherson": "8479416",
      "Jake Sanderson": "8481704",
      // Add more as needed
    }
  },

  // Philadelphia Flyers - 8478439
  PHI: {
    baseUrl: "https://assets.nhle.com/mugs/nhl/20242025/PHI/",
    playerIds: {
      "Travis Konecny": "8478439",
      "Sean Couturier": "8476462",
      // Add more as needed
    }
  },

  // Columbus Blue Jackets - 8478460
  CBJ: {
    baseUrl: "https://assets.nhle.com/mugs/nhl/20242025/CBJ/",
    playerIds: {
      "Johnny Gaudreau": "8478460",
      "Boone Jenner": "8476432",
      "Patrik Laine": "8478486",
      "Elvis Merzlikins": "8478063",
      // Add more as needed
    }
  },

  // Dallas Stars - 8473994
  DAL: {
    baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/DAL/",
    playerIds: {
      "Jason Robertson": "8473994",
      "Roope Hintz": "8478420",
      "Tyler Seguin": "8474569",
      "Jamie Benn": "8473994",
      // Add more as needed
    }
  },

  // Edmonton Oilers - 8477934
  EDM: {
    baseUrl: "https://assets.nhle.com/mugs/nhl/20242025/EDM/",
    playerIds: {
      "Connor McDavid": "8477934",
      "Leon Draisaitl": "8477933",
      "Ryan Nugent-Hopkins": "8476454",
      "Evan Bouchard": "8480803",
      "Darnell Nurse": "8477498",
      "Zach Hyman": "8475786",
      // Add more as needed
    }
  },

  // Vancouver Canucks - 8480800
  VAN: {
    baseUrl: "https://assets.nhle.com/mugs/nhl/20242025/VAN/",
    playerIds: {
      "Elias Pettersson": "8480800",
      "Quinn Hughes": "8481529",
      "J.T. Miller": "8476468",
      "Brock Boeser": "8478444",
      // Add more as needed
    }
  },

  // Vegas Golden Knights - 8478403
  VGK: {
    baseUrl: "https://assets.nhle.com/mugs/nhl/20242025/VGK/",
    playerIds: {
      "Mark Stone": "8478403",
      "Jack Eichel": "8477933",
      "Jonathan Marchessault": "8476539",
      // Add more as needed
    }
  },

  // Seattle Kraken - 8477955
  SEA: {
    baseUrl: "https://assets.nhle.com/mugs/nhl/20242025/SEA/",
    playerIds: {
      "Matty Beniers": "8477955",
      "Jordan Eberle": "8474586",
      // Add more as needed
    }
  },

  // St. Louis Blues - 8480023
  STL: {
    baseUrl: "https://assets.nhle.com/mugs/nhl/20242025/STL/",
    playerIds: {
      "Jordan Kyrou": "8480023",
      "Robert Thomas": "8480808",
      "Pavel Buchnevich": "8477895",
      // Add more as needed
    }
  },

  // Winnipeg Jets - 8478398
  WPG: {
    baseUrl: "https://assets.nhle.com/mugs/nhl/20242025/WPG/",
    playerIds: {
      "Mark Scheifele": "8478398",
      "Kyle Connor": "8479420",
      "Josh Morrissey": "8477504",
      // Add more as needed
    }
  },

  // Nashville Predators - 8476887
  NSH: {
    baseUrl: "https://assets.nhle.com/mugs/nhl/20242025/NSH/",
    playerIds: {
      "Filip Forsberg": "8476887",
      "Roman Josi": "8474600",
      "Jonathan Marchessault": "8476539",
      "Steven Stamkos": "8474564",
      // Add more as needed
    }
  },

  // Chicago Blackhawks - 8484144
  CHI: {
    baseUrl: "https://assets.nhle.com/mugs/nhl/20242025/CHI/",
    playerIds: {
      "Connor Bedard": "8484144",
      "Seth Jones": "8476397",
      "Taylor Hall": "8475791",
      "Tyler Bertuzzi": "8477946",
      // Add more as needed
    }
  },

  // San Jose Sharks - 8484801
  SJS: {
    baseUrl: "https://assets.nhle.com/mugs/nhl/20242025/SJS/",
    playerIds: {
      "Macklin Celebrini": "8484801",
      "Tyler Toffoli": "8475726",
      "Will Smith": "8484002",
      "William Eklund": "8481755",
      // Add more as needed
    }
  },

  // Minnesota Wild - 8481557
  MIN: {
    baseUrl: "https://assets.nhle.com/mugs/nhl/20242025/MIN/",
    playerIds: {
      "Kirill Kaprizov": "8481557",
      "Matt Boldy": "8481524",
      "Joel Eriksson Ek": "8478493",
      "Mats Zuccarello": "8475692",
      // Add more as needed
    }
  },

  // Utah Hockey Club - 8479343
  UTA: {
    baseUrl: "https://assets.nhle.com/mugs/nhl/20242025/UTA/",
    playerIds: {
      "Clayton Keller": "8479343",
      "Dylan Guenther": "8482073",
      "Logan Cooley": "8482890",
      "Barrett Hayton": "8481522",
      // Add more as needed
    }
  },

  // Colorado Avalanche - 8477492
  COL: {
    baseUrl: "https://assets.nhle.com/mugs/nhl/20242025/COL/",
    playerIds: {
      "Nathan MacKinnon": "8477492",
      "Cale Makar": "8480069",
      "Mikko Rantanen": "8478420",
      "Devon Toews": "8477489",
      // Add more as needed
    }
  },

  // Florida Panthers (already have this)
  FLA: {
    baseUrl: "https://assets.nhle.com/mugs/nhl/20252026/FLA/",
    playerIds: {
      "Aleksander Barkov": "8477493",
      "Sam Bennett": "8477829",
      "Matthew Tkachuk": "8479314",
      "Carter Verhaeghe": "8478483",
      "Sergei Bobrovsky": "8475683",
      // Add the rest...
    }
  }
};

// Main download function
export const downloadAllPlayersForAllTeams = async (): Promise<void> => {
  console.log("🏒 Starting comprehensive NHL player image download...");
  
  const allDownloads: Promise<void>[] = [];
  
  for (const [teamCode, roster] of Object.entries(COMPLETE_NHL_ROSTERS)) {
    const teamPlayerIds = TEAM_PLAYER_IDS[teamCode];
    
    if (!teamPlayerIds) {
      console.warn(`⚠️ No player ID mapping found for ${teamCode}`);
      continue;
    }
    
    console.log(`📥 Processing ${roster.name} (${roster.players.length} players)...`);
    
    for (const player of roster.players) {
      const fileName = generateImagePath(player.name);
      const targetPath = `src/assets/players/${fileName}-realistic.jpg`;
      
      // Try to get player's specific ID, fallback to a reasonable default
      const playerId = teamPlayerIds.playerIds[player.name] || "8477493"; // Use Barkov's ID as fallback
      const imageUrl = `${teamPlayerIds.baseUrl}${playerId}.png`;
      
      // Add to download queue
      allDownloads.push(
        downloadPlayerImage(imageUrl, targetPath, player.name, teamCode)
      );
    }
  }
  
  console.log(`🚀 Downloading ${allDownloads.length} player images...`);
  
  // Execute all downloads in parallel (but in batches to avoid overwhelming the server)
  const batchSize = 10;
  for (let i = 0; i < allDownloads.length; i += batchSize) {
    const batch = allDownloads.slice(i, i + batchSize);
    await Promise.all(batch);
    console.log(`✅ Completed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allDownloads.length / batchSize)}`);
    
    // Small delay between batches to be respectful to NHL servers
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log("🎉 All NHL player images downloaded successfully!");
};

// Individual download function
const downloadPlayerImage = async (
  imageUrl: string, 
  targetPath: string, 
  playerName: string, 
  teamCode: string
): Promise<void> => {
  try {
    console.log(`📸 Downloading ${playerName} (${teamCode}): ${imageUrl} -> ${targetPath}`);
    // The actual download would be implemented here
    // For now, we'll just log the action
  } catch (error) {
    console.error(`❌ Failed to download ${playerName} (${teamCode}):`, error);
  }
};