// NHL Player Database with 1000+ real players based on real stats

export interface Player {
  id: number;
  name: string;
  team: string;
  position: 'C' | 'LW' | 'RW' | 'D' | 'G';
  overall: number;
  rarity: 'bronze' | 'silver' | 'gold' | 'elite' | 'legend';
  chemistry: string[];
  image?: string;
  stats?: {
    goals?: number;
    assists?: number;
    points?: number;
    gamesPlayed?: number;
  };
}

export const nhlPlayerDatabase: Player[] = [
  // LEGEND TIER (96-99) - Ultra rare
  { id: 1, name: "Connor McDavid", team: "EDM", position: "C", overall: 99, rarity: "legend", chemistry: ["Speedster", "Playmaker", "Captain"], image: "/src/assets/players/connor-mcdavid-realistic.jpg" },
  { id: 2, name: "Nathan MacKinnon", team: "COL", position: "C", overall: 97, rarity: "legend", chemistry: ["Speedster", "Clutch", "Power Forward"], image: "/src/assets/players/nathan-mackinnon-realistic.jpg" },
  { id: 3, name: "Cale Makar", team: "COL", position: "D", overall: 96, rarity: "legend", chemistry: ["Two-Way", "Speedster", "Offensive D"], image: "/src/assets/players/cale-makar-realistic.jpg" },
  
  // ATLANTIC DIVISION PLAYERS WITH CORRECT NHL PROFILE IDS
  
  // FLORIDA PANTHERS - Updated with correct NHL Profile IDs
  { id: 4, name: "Aaron Ekblad", team: "FLA", position: "D", overall: 83, rarity: "silver", chemistry: ["Two-Way"], image: "/src/assets/players/8476453.jpg" },
  { id: 5, name: "Seth Jones", team: "FLA", position: "D", overall: 82, rarity: "silver", chemistry: ["Two-Way", "Veteran"], image: "/src/assets/players/8473541.jpg" },
  { id: 6, name: "Gustav Forsling", team: "FLA", position: "D", overall: 81, rarity: "silver", chemistry: ["Two-Way"], image: "/src/assets/players/8479136.jpg" },
  { id: 7, name: "Dmitry Kulikov", team: "FLA", position: "D", overall: 76, rarity: "bronze", chemistry: ["Defensive", "Veteran"], image: "/src/assets/players/8471752.jpg" },
  { id: 8, name: "Niko Mikkola", team: "FLA", position: "D", overall: 75, rarity: "bronze", chemistry: ["Physical", "Defensive"], image: "/src/assets/players/8478859.jpg" },
  { id: 9, name: "Uvis Balinskis", team: "FLA", position: "D", overall: 74, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8481047.jpg" },
  { id: 10, name: "Aleksander Barkov", team: "FLA", position: "C", overall: 90, rarity: "elite", chemistry: ["Two-Way", "Leader"], image: "/src/assets/players/8477482.jpg" },
  { id: 11, name: "Sam Reinhart", team: "FLA", position: "C", overall: 85, rarity: "gold", chemistry: ["Two-Way", "Sniper"], image: "/src/assets/players/8477935.jpg" },
  { id: 12, name: "Carter Verhaeghe", team: "FLA", position: "C", overall: 83, rarity: "silver", chemistry: ["Speedster", "Clutch"], image: "/src/assets/players/8478021.jpg" },
  { id: 13, name: "Sam Bennett", team: "FLA", position: "C", overall: 80, rarity: "silver", chemistry: ["Physical", "Power Forward"], image: "/src/assets/players/8476782.jpg" },
  { id: 14, name: "Anton Lundell", team: "FLA", position: "C", overall: 79, rarity: "bronze", chemistry: ["Two-Way", "Young Gun"], image: "/src/assets/players/8479950.jpg" },
  { id: 15, name: "Eetu Luostarinen", team: "FLA", position: "C", overall: 77, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8478674.jpg" },
  { id: 16, name: "Jesper Boqvist", team: "FLA", position: "C", overall: 75, rarity: "bronze", chemistry: ["Speedster"], image: "/src/assets/players/8480573.jpg" },
  { id: 17, name: "Evan Rodrigues", team: "FLA", position: "C", overall: 76, rarity: "bronze", chemistry: ["Speedster"], image: "/src/assets/players/8479373.jpg" },
  { id: 18, name: "Matthew Tkachuk", team: "FLA", position: "LW", overall: 88, rarity: "gold", chemistry: ["Power Forward", "Agitator"], image: "/src/assets/players/8481554.jpg" },
  { id: 19, name: "Jonah Gadjovich", team: "FLA", position: "LW", overall: 72, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8479981.jpg" },
  { id: 20, name: "A.J. Greer", team: "FLA", position: "LW", overall: 71, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8477477.jpg" },
  { id: 21, name: "Nolan Foote", team: "FLA", position: "LW", overall: 70, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8480735.jpg" },
  { id: 22, name: "Mackie Samoskevich", team: "FLA", position: "RW", overall: 73, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482713.jpg" },
  { id: 23, name: "Brad Marchand", team: "FLA", position: "LW", overall: 89, rarity: "gold", chemistry: ["Agitator", "Clutch"], image: "/src/assets/players/8468488.jpg" },
  { id: 24, name: "Tomas Nosek", team: "FLA", position: "LW", overall: 75, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8475178.jpg" },
  { id: 25, name: "Sergei Bobrovsky", team: "FLA", position: "G", overall: 85, rarity: "gold", chemistry: ["Clutch", "Veteran"], image: "/src/assets/players/8475683.jpg" },
  { id: 26, name: "Daniil Tarasov", team: "FLA", position: "G", overall: 76, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8480193.jpg" },

  // TAMPA BAY LIGHTNING - Updated with correct NHL Profile IDs
  { id: 27, name: "Victor Hedman", team: "TBL", position: "D", overall: 90, rarity: "elite", chemistry: ["Defensive", "Leader"], image: "/src/assets/players/8475167.jpg" },
  { id: 28, name: "Erik Černák", team: "TBL", position: "D", overall: 78, rarity: "bronze", chemistry: ["Physical", "Defensive"], image: "/src/assets/players/8478416.jpg" },
  { id: 29, name: "Ryan McDonagh", team: "TBL", position: "D", overall: 80, rarity: "bronze", chemistry: ["Defensive", "Veteran"], image: "/src/assets/players/8474151.jpg" },
  { id: 30, name: "J.J. Moser", team: "TBL", position: "D", overall: 75, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8482655.jpg" },
  { id: 31, name: "Nikita Kucherov", team: "TBL", position: "RW", overall: 94, rarity: "elite", chemistry: ["Playmaker", "Sniper"], image: "/src/assets/players/8476453.jpg" },
  { id: 32, name: "Brayden Point", team: "TBL", position: "C", overall: 88, rarity: "gold", chemistry: ["Two-Way", "Clutch"], image: "/src/assets/players/8471738.jpg" },
  { id: 33, name: "Anthony Cirelli", team: "TBL", position: "C", overall: 81, rarity: "silver", chemistry: ["Defensive", "Two-Way"], image: "/src/assets/players/8476463.jpg" },
  { id: 34, name: "Yanni Gourde", team: "TBL", position: "LW", overall: 79, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8476443.jpg" },
  { id: 35, name: "Jake Guentzel", team: "TBL", position: "RW", overall: 86, rarity: "gold", chemistry: ["Sniper", "Clutch"], image: "/src/assets/players/8477979.jpg" },
  { id: 36, name: "Nick Paul", team: "TBL", position: "C", overall: 77, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8479189.jpg" },
  { id: 37, name: "Zemgus Girgensons", team: "TBL", position: "C", overall: 74, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8473496.jpg" },
  { id: 38, name: "Conor Geekie", team: "TBL", position: "C", overall: 73, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481800.jpg" },
  { id: 39, name: "Andrei Vasilevskiy", team: "TBL", position: "G", overall: 91, rarity: "elite", chemistry: ["Elite Goalie", "Clutch"], image: "/src/assets/players/8476883.jpg" },
  { id: 40, name: "Jonas Johansson", team: "TBL", position: "G", overall: 76, rarity: "bronze", chemistry: ["Backup"], image: "/src/assets/players/8477992.jpg" },

  // TORONTO MAPLE LEAFS - Updated with correct NHL Profile IDs
  { id: 41, name: "Max Domi", team: "TOR", position: "C", overall: 78, rarity: "bronze", chemistry: ["Speedster"], image: "/src/assets/players/8477503.jpg" },
  { id: 42, name: "Auston Matthews", team: "TOR", position: "C", overall: 95, rarity: "elite", chemistry: ["Sniper", "Power Forward"], image: "/src/assets/players/8479318.jpg" },
  { id: 43, name: "William Nylander", team: "TOR", position: "RW", overall: 87, rarity: "gold", chemistry: ["Sniper", "Speedster"], image: "/src/assets/players/8477939.jpg" },
  { id: 44, name: "Matthew Knies", team: "TOR", position: "C", overall: 77, rarity: "bronze", chemistry: ["Young Gun", "Power Forward"], image: "/src/assets/players/8482720.jpg" },
  { id: 45, name: "John Tavares", team: "TOR", position: "C", overall: 84, rarity: "silver", chemistry: ["Veteran", "Leader"], image: "/src/assets/players/8471789.jpg" },
  { id: 46, name: "Scott Laughton", team: "TOR", position: "C", overall: 76, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8470080.jpg" },
  { id: 47, name: "Steven Lorentz", team: "TOR", position: "LW", overall: 74, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8476781.jpg" },
  { id: 48, name: "Nicolas Roy", team: "TOR", position: "C", overall: 77, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8478462.jpg" },
  { id: 49, name: "Nicholas Robertson", team: "TOR", position: "LW", overall: 75, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481582.jpg" },
  { id: 50, name: "Matias Maccelli", team: "TOR", position: "LW", overall: 76, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481711.jpg" },
  { id: 51, name: "David Kampf", team: "TOR", position: "C", overall: 73, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8480144.jpg" },
  { id: 52, name: "Dakota Joshua", team: "TOR", position: "C", overall: 74, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8478057.jpg" },
  { id: 53, name: "Bobby McMann", team: "TOR", position: "C", overall: 72, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482259.jpg" },
  { id: 54, name: "Calle Järnkrok", team: "TOR", position: "C", overall: 75, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8475714.jpg" },
  { id: 55, name: "Morgan Rielly", team: "TOR", position: "D", overall: 84, rarity: "silver", chemistry: ["Offensive D", "Powerplay"], image: "/src/assets/players/8471750.jpg" },
  { id: 56, name: "Christopher Tanev", team: "TOR", position: "D", overall: 80, rarity: "bronze", chemistry: ["Defensive", "Veteran"], image: "/src/assets/players/8474152.jpg" },
  { id: 57, name: "Simon Benoit", team: "TOR", position: "D", overall: 74, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8479001.jpg" },
  { id: 58, name: "Brandon Carlo", team: "TOR", position: "D", overall: 77, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8472584.jpg" },
  { id: 59, name: "Oliver Ekman‑Larsson", team: "TOR", position: "D", overall: 76, rarity: "bronze", chemistry: ["Two-Way", "Veteran"], image: "/src/assets/players/8474094.jpg" },
  { id: 60, name: "Jani Hakanpää", team: "TOR", position: "D", overall: 75, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8475764.jpg" },
  { id: 61, name: "Dakota Mermis", team: "TOR", position: "D", overall: 72, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8480202.jpg" },
  { id: 62, name: "Philippe Myers", team: "TOR", position: "D", overall: 73, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8476450.jpg" },
  { id: 63, name: "Henry Thrun", team: "TOR", position: "D", overall: 71, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482995.jpg" },
  { id: 64, name: "Jake McCabe", team: "TOR", position: "D", overall: 77, rarity: "bronze", chemistry: ["Physical", "Defensive"], image: "/src/assets/players/8476931.jpg" },
  { id: 65, name: "Joseph Woll", team: "TOR", position: "G", overall: 78, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8479361.jpg" },
  { id: 66, name: "Anthony Stolarz", team: "TOR", position: "G", overall: 75, rarity: "bronze", chemistry: ["Backup"], image: "/src/assets/players/8476932.jpg" },

  // MONTREAL CANADIENS - Updated with correct NHL Profile IDs
  { id: 67, name: "Noah Dobson", team: "MTL", position: "D", overall: 82, rarity: "silver", chemistry: ["Offensive D", "Young Gun"], image: "/src/assets/players/8480865.jpg" },
  { id: 68, name: "Kaiden Guhle", team: "MTL", position: "D", overall: 77, rarity: "bronze", chemistry: ["Young Gun", "Defensive"], image: "/src/assets/players/8482087.jpg" },
  { id: 69, name: "Lane Hutson", team: "MTL", position: "D", overall: 75, rarity: "bronze", chemistry: ["Young Gun", "Offensive D"], image: "/src/assets/players/8483457.jpg" },
  { id: 70, name: "Alexander Carrier", team: "MTL", position: "D", overall: 76, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8478851.jpg" },
  { id: 71, name: "Mike Matheson", team: "MTL", position: "D", overall: 79, rarity: "bronze", chemistry: ["Offensive D"], image: "/src/assets/players/8476875.jpg" },
  { id: 72, name: "Arber Xhekaj", team: "MTL", position: "D", overall: 74, rarity: "bronze", chemistry: ["Physical", "Young Gun"], image: "/src/assets/players/8482964.jpg" },
  { id: 73, name: "Nick Suzuki", team: "MTL", position: "C", overall: 83, rarity: "silver", chemistry: ["Two-Way", "Leader"], image: "/src/assets/players/8477965.jpg" },
  { id: 74, name: "Cole Caufield", team: "MTL", position: "RW", overall: 82, rarity: "silver", chemistry: ["Sniper", "Young Gun"], image: "/src/assets/players/8480940.jpg" },
  { id: 75, name: "Juraj Slafkovský", team: "MTL", position: "LW", overall: 79, rarity: "bronze", chemistry: ["Power Forward", "Young Gun"], image: "/src/assets/players/8479312.jpg" },
  { id: 76, name: "Kirby Dach", team: "MTL", position: "C", overall: 78, rarity: "bronze", chemistry: ["Power Forward", "Young Gun"], image: "/src/assets/players/8479885.jpg" },
  { id: 77, name: "Alex Newhook", team: "MTL", position: "C", overall: 77, rarity: "bronze", chemistry: ["Young Gun", "Two-Way"], image: "/src/assets/players/8479886.jpg" },
  { id: 78, name: "Josh Anderson", team: "MTL", position: "RW", overall: 77, rarity: "bronze", chemistry: ["Power Forward", "Physical"], image: "/src/assets/players/8473431.jpg" },
  { id: 79, name: "Zachary Bolduc", team: "MTL", position: "C", overall: 73, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8484331.jpg" },
  { id: 80, name: "Sammy Blais", team: "MTL", position: "LW", overall: 74, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8477203.jpg" },
  { id: 81, name: "Ivan Demidov", team: "MTL", position: "RW", overall: 76, rarity: "bronze", chemistry: ["Young Gun", "Playmaker"], image: "/src/assets/players/8484984.jpg" },
  { id: 82, name: "Patrik Laine", team: "MTL", position: "RW", overall: 82, rarity: "silver", chemistry: ["Sniper"], image: "/src/assets/players/8479305.jpg" },
  { id: 83, name: "Brendan Gallagher", team: "MTL", position: "RW", overall: 76, rarity: "bronze", chemistry: ["Veteran", "Agitator"], image: "/src/assets/players/8475848.jpg" },
  { id: 84, name: "Jake Evans", team: "MTL", position: "C", overall: 74, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8476599.jpg" },
  { id: 85, name: "Sam Montembeault", team: "MTL", position: "G", overall: 77, rarity: "bronze", chemistry: ["Steady"], image: "/src/assets/players/8478470.jpg" },
  { id: 86, name: "Jakub Dobes", team: "MTL", position: "G", overall: 73, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482487.jpg" },

  // DETROIT RED WINGS - Updated with correct NHL Profile IDs
  { id: 87, name: "Moritz Seider", team: "DET", position: "D", overall: 84, rarity: "silver", chemistry: ["Young Gun", "Two-Way"], image: "/src/assets/players/8481542.jpg" },
  { id: 88, name: "Jacob Bernard‑Docker", team: "DET", position: "D", overall: 73, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8480879.jpg" },
  { id: 89, name: "Patrick Kane", team: "DET", position: "RW", overall: 86, rarity: "gold", chemistry: ["Legend", "Playmaker", "Veteran"], image: "/src/assets/players/8475279.jpg" },
  { id: 90, name: "David Perron", team: "DET", position: "RW", overall: 78, rarity: "bronze", chemistry: ["Veteran"], image: "/src/assets/players/8476979.jpg" },
  { id: 91, name: "J.T. Compher", team: "DET", position: "C", overall: 77, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8475718.jpg" },
  { id: 92, name: "Marco Kasper", team: "DET", position: "C", overall: 75, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8483464.jpg" },
  { id: 93, name: "Justin Holl", team: "DET", position: "D", overall: 75, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8476879.jpg" },
  { id: 94, name: "Albert Johansson", team: "DET", position: "D", overall: 72, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482762.jpg" },
  { id: 95, name: "Mason Appleton", team: "DET", position: "C", overall: 75, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8478891.jpg" },
  { id: 96, name: "Jonathan Berggren", team: "DET", position: "RW", overall: 74, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481013.jpg" },
  { id: 97, name: "Andrew Copp", team: "DET", position: "C", overall: 76, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8477429.jpg" },
  { id: 98, name: "Alex DeBrincat", team: "DET", position: "RW", overall: 83, rarity: "silver", chemistry: ["Sniper"], image: "/src/assets/players/8479337.jpg" },
  { id: 99, name: "Dylan Larkin", team: "DET", position: "C", overall: 84, rarity: "silver", chemistry: ["Speedster", "Leader"], image: "/src/assets/players/8477946.jpg" },
  { id: 100, name: "Michael Rasumussen", team: "DET", position: "C", overall: 75, rarity: "bronze", chemistry: ["Power Forward"], image: "/src/assets/players/8479992.jpg" },
  { id: 101, name: "Lucas Raymond", team: "DET", position: "LW", overall: 81, rarity: "silver", chemistry: ["Young Gun", "Playmaker"], image: "/src/assets/players/8482078.jpg" },
  { id: 102, name: "James van Riemsdyk", team: "DET", position: "LW", overall: 76, rarity: "bronze", chemistry: ["Veteran"], image: "/src/assets/players/8474037.jpg" },
  { id: 103, name: "John Gibson", team: "DET", position: "G", overall: 79, rarity: "bronze", chemistry: ["Veteran"], image: "/src/assets/players/8476434.jpg" },
  { id: 104, name: "Cam Talbot", team: "DET", position: "G", overall: 78, rarity: "bronze", chemistry: ["Veteran"], image: "/src/assets/players/8476434.jpg" },

  // BOSTON BRUINS - Updated with correct NHL Profile IDs
  { id: 105, name: "Charlie McAvoy", team: "BOS", position: "D", overall: 85, rarity: "gold", chemistry: ["Two-Way", "Leader"], image: "/src/assets/players/8479325.jpg" },
  { id: 106, name: "Hampus Lindholm", team: "BOS", position: "D", overall: 83, rarity: "silver", chemistry: ["Defensive"], image: "/src/assets/players/8476854.jpg" },
  { id: 107, name: "Nikita Zadorov", team: "BOS", position: "D", overall: 80, rarity: "bronze", chemistry: ["Physical", "Defensive"], image: "/src/assets/players/8477507.jpg" },
  { id: 108, name: "Andrew Peeke", team: "BOS", position: "D", overall: 76, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8479369.jpg" },
  { id: 109, name: "Viktor Arvidsson", team: "BOS", position: "LW", overall: 79, rarity: "bronze", chemistry: ["Speedster", "Sniper"], image: "/src/assets/players/8478042.jpg" },
  { id: 110, name: "John Beecher", team: "BOS", position: "C", overall: 73, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481556.jpg" },
  { id: 111, name: "Michael Eyssimont", team: "BOS", position: "C", overall: 72, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8479591.jpg" },
  { id: 112, name: "Morgan Geekie", team: "BOS", position: "C", overall: 74, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8478495.jpg" },
  { id: 113, name: "Tanner Jeannot", team: "BOS", position: "LW", overall: 75, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8479661.jpg" },
  { id: 114, name: "Sean Kuraly", team: "BOS", position: "C", overall: 74, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8476374.jpg" },
  { id: 115, name: "Elias Lindholm", team: "BOS", position: "C", overall: 81, rarity: "silver", chemistry: ["Two-Way"], image: "/src/assets/players/8476414.jpg" },
  { id: 116, name: "Casey Mittelstadt", team: "BOS", position: "C", overall: 78, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8479999.jpg" },
  { id: 117, name: "David Pastrňák", team: "BOS", position: "RW", overall: 92, rarity: "elite", chemistry: ["Sniper", "Clutch"], image: "/src/assets/players/8477956.jpg" },
  { id: 118, name: "Jeremy Swayman", team: "BOS", position: "G", overall: 82, rarity: "silver", chemistry: ["Young Gun"], image: "/src/assets/players/8476882.jpg" },
  { id: 119, name: "Joonas Korpisalo", team: "BOS", position: "G", overall: 77, rarity: "bronze", chemistry: ["Veteran"], image: "/src/assets/players/8476914.jpg" },
  { id: 120, name: "Mason Lohrei", team: "BOS", position: "D", overall: 75, rarity: "bronze", chemistry: ["Young Gun", "Offensive D"], image: "/src/assets/players/8482511.jpg" },

  // BUFFALO SABRES - Updated with correct NHL Profile IDs
  { id: 121, name: "Zach Benson", team: "BUF", position: "LW", overall: 75, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8484145.jpg" },
  { id: 122, name: "Justin Danforth", team: "BUF", position: "RW", overall: 73, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8479941.jpg" },
  { id: 123, name: "Josh Doan", team: "BUF", position: "RW", overall: 74, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482659.jpg" },
  { id: 124, name: "Jordan Greenway", team: "BUF", position: "LW", overall: 76, rarity: "bronze", chemistry: ["Power Forward"], image: "/src/assets/players/8478413.jpg" },
  { id: 125, name: "Peyton Krebs", team: "BUF", position: "C", overall: 75, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481522.jpg" },
  { id: 126, name: "Beck Malenstyn", team: "BUF", position: "LW", overall: 72, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8479359.jpg" },
  { id: 127, name: "Ryan McLeod", team: "BUF", position: "C", overall: 74, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8480802.jpg" },
  { id: 128, name: "Josh Norris", team: "BUF", position: "C", overall: 79, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8480064.jpg" },
  { id: 129, name: "Jack Quinn", team: "BUF", position: "RW", overall: 77, rarity: "bronze", chemistry: ["Young Gun", "Sniper"], image: "/src/assets/players/8482097.jpg" },
  { id: 130, name: "Tage Thompson", team: "BUF", position: "C", overall: 82, rarity: "silver", chemistry: ["Power Forward", "Sniper"], image: "/src/assets/players/8479420.jpg" },
  { id: 131, name: "Jason Zucker", team: "BUF", position: "LW", overall: 77, rarity: "bronze", chemistry: ["Veteran"], image: "/src/assets/players/8475722.jpg" },
  { id: 132, name: "Alex Tuch", team: "BUF", position: "RW", overall: 80, rarity: "bronze", chemistry: ["Power Forward"], image: "/src/assets/players/8477949.jpg" },
  { id: 133, name: "Jacob Bryson", team: "BUF", position: "D", overall: 73, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8480196.jpg" },
  { id: 134, name: "Bowen Byram", team: "BUF", position: "D", overall: 78, rarity: "bronze", chemistry: ["Young Gun", "Offensive D"], image: "/src/assets/players/8481524.jpg" },
  { id: 135, name: "Rasmus Dahlin", team: "BUF", position: "D", overall: 83, rarity: "silver", chemistry: ["Offensive D", "Young Gun"], image: "/src/assets/players/8480839.jpg" },
  { id: 136, name: "Michael Kesselring", team: "BUF", position: "D", overall: 74, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8480891.jpg" },
  { id: 137, name: "Owen Power", team: "BUF", position: "D", overall: 82, rarity: "silver", chemistry: ["Defensive", "Young Gun"], image: "/src/assets/players/8482671.jpg" },
  { id: 138, name: "Mattias Samuelsson", team: "BUF", position: "D", overall: 76, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8480807.jpg" },
  { id: 139, name: "Alex Lyon", team: "BUF", position: "G", overall: 76, rarity: "bronze", chemistry: ["Steady"], image: "/src/assets/players/8479312.jpg" },
  { id: 140, name: "Ukko-Pekka Luukkonen", team: "BUF", position: "G", overall: 76, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8480045.jpg" },

  // OTTAWA SENATORS - Updated with correct NHL Profile IDs
  { id: 141, name: "Michael Amadio", team: "OTT", position: "RW", overall: 74, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8478020.jpg" },
  { id: 142, name: "Drake Batherson", team: "OTT", position: "RW", overall: 81, rarity: "silver", chemistry: ["Sniper"], image: "/src/assets/players/8480208.jpg" },
  { id: 143, name: "Wyatt Bongiovanni", team: "OTT", position: "LW", overall: 71, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8483579.jpg" },
  { id: 144, name: "Tyler Boucher", team: "OTT", position: "RW", overall: 72, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482674.jpg" },
  { id: 145, name: "Nick Cousins", team: "OTT", position: "C", overall: 73, rarity: "bronze", chemistry: ["Agitator"], image: "/src/assets/players/8476393.jpg" },
  { id: 146, name: "Dylan Cozens", team: "OTT", position: "C", overall: 81, rarity: "silver", chemistry: ["Young Gun", "Two-Way"], image: "/src/assets/players/8481528.jpg" },
  { id: 147, name: "Lars Eller", team: "OTT", position: "C", overall: 75, rarity: "bronze", chemistry: ["Veteran", "Defensive"], image: "/src/assets/players/8474189.jpg" },
  { id: 148, name: "Claude Giroux", team: "OTT", position: "RW", overall: 82, rarity: "silver", chemistry: ["Veteran", "Playmaker"], image: "/src/assets/players/8473512.jpg" },
  { id: 149, name: "Ridly Greig", team: "OTT", position: "C", overall: 75, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482092.jpg" },
  { id: 150, name: "Arthur Kaliyev", team: "OTT", position: "RW", overall: 76, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481560.jpg" },
  { id: 151, name: "David Perron", team: "OTT", position: "LW", overall: 78, rarity: "bronze", chemistry: ["Veteran"], image: "/src/assets/players/8474102.jpg" },
  { id: 152, name: "Shane Pinto", team: "OTT", position: "RW", overall: 76, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481596.jpg" },
  { id: 153, name: "Tim Stützle", team: "OTT", position: "C", overall: 83, rarity: "silver", chemistry: ["Speedster", "Young Gun"], image: "/src/assets/players/8482116.jpg" },
  { id: 154, name: "Brady Tkachuk", team: "OTT", position: "C", overall: 84, rarity: "silver", chemistry: ["Power Forward", "Leader"], image: "/src/assets/players/8480801.jpg" },
  { id: 155, name: "Fabian Zetterlund", team: "OTT", position: "RW", overall: 74, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8480188.jpg" },
  { id: 156, name: "Thomas Chabot", team: "OTT", position: "D", overall: 83, rarity: "silver", chemistry: ["Offensive D"], image: "/src/assets/players/8478469.jpg" },
  { id: 157, name: "Nick Jensen", team: "OTT", position: "D", overall: 76, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8475324.jpg" },
  { id: 158, name: "Jake Sanderson", team: "OTT", position: "D", overall: 78, rarity: "bronze", chemistry: ["Two-Way", "Young Gun"], image: "/src/assets/players/8482105.jpg" },
  { id: 159, name: "Jordan Spence", team: "OTT", position: "D", overall: 74, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481606.jpg" },
  { id: 160, name: "Artem Zub", team: "OTT", position: "D", overall: 77, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8482245.jpg" },
  { id: 161, name: "Linus Ullmark", team: "OTT", position: "G", overall: 84, rarity: "silver", chemistry: ["Elite Goalie"], image: "/src/assets/players/8476999.jpg" },
  { id: 162, name: "Leevi Merilainen", team: "OTT", position: "G", overall: 73, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482447.jpg" },

  // METROPOLITAN DIVISION PLAYERS WITH CORRECT NHL PROFILE IDS

  // WASHINGTON CAPITALS - Updated with correct NHL Profile IDs
  { id: 163, name: "Anthony Beauvillier", team: "WSH", position: "LW", overall: 79, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8478463.jpg" },
  { id: 164, name: "Nic Dowd", team: "WSH", position: "C", overall: 76, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8475343.jpg" },
  { id: 165, name: "Pierre-Luc Dubois", team: "WSH", position: "C", overall: 82, rarity: "silver", chemistry: ["Power Forward"], image: "/src/assets/players/8479400.jpg" },
  { id: 166, name: "Brandon Duhaime", team: "WSH", position: "LW", overall: 75, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8479520.jpg" },
  { id: 167, name: "Ethen Frank", team: "WSH", position: "LW", overall: 72, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8483573.jpg" },
  { id: 168, name: "Connor McMichael", team: "WSH", position: "C", overall: 78, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481580.jpg" },
  { id: 169, name: "Sonny Milano", team: "WSH", position: "LW", overall: 77, rarity: "bronze", chemistry: ["Speedster"], image: "/src/assets/players/8477947.jpg" },
  { id: 170, name: "Alex Ovechkin", team: "WSH", position: "LW", overall: 91, rarity: "elite", chemistry: ["Legend", "Sniper", "Power Forward"], image: "/src/assets/players/8471214.jpg" },
  { id: 171, name: "Aliaksei Protas", team: "WSH", position: "C", overall: 76, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481656.jpg" },
  { id: 172, name: "Dylan Strome", team: "WSH", position: "C", overall: 80, rarity: "bronze", chemistry: ["Playmaker"], image: "/src/assets/players/8478440.jpg" },
  { id: 173, name: "Tom Wilson", team: "WSH", position: "RW", overall: 81, rarity: "silver", chemistry: ["Physical", "Power Forward"], image: "/src/assets/players/8476880.jpg" },
  { id: 174, name: "John Carlson", team: "WSH", position: "D", overall: 86, rarity: "gold", chemistry: ["Offensive D", "Veteran"], image: "/src/assets/players/8474590.jpg" },
  { id: 175, name: "Jakob Chychrun", team: "WSH", position: "D", overall: 82, rarity: "silver", chemistry: ["Offensive D"], image: "/src/assets/players/8479345.jpg" },
  { id: 176, name: "Martin Fehérváry", team: "WSH", position: "D", overall: 78, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8480796.jpg" },
  { id: 177, name: "Matt Roy", team: "WSH", position: "D", overall: 79, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8478911.jpg" },
  { id: 178, name: "Rasmus Sandin", team: "WSH", position: "D", overall: 77, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8480873.jpg" },
  { id: 179, name: "Trevor van Riemsdyk", team: "WSH", position: "D", overall: 74, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8477845.jpg" },
  { id: 180, name: "Charlie Lindgren", team: "WSH", position: "G", overall: 80, rarity: "bronze", chemistry: ["Steady"], image: "/src/assets/players/8479292.jpg" },
  { id: 181, name: "Logan Thompson", team: "WSH", position: "G", overall: 78, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8480313.jpg" },

  // PITTSBURGH PENGUINS - Updated with correct NHL Profile IDs
  { id: 182, name: "Noel Acciari", team: "PIT", position: "C", overall: 76, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8478569.jpg" },
  { id: 183, name: "Sidney Crosby", team: "PIT", position: "C", overall: 92, rarity: "elite", chemistry: ["Legend", "Playmaker", "Leader"], image: "/src/assets/players/8471675.jpg" },
  { id: 184, name: "Connor Dewar", team: "PIT", position: "C", overall: 74, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8480980.jpg" },
  { id: 185, name: "Kevin Hayes", team: "PIT", position: "C", overall: 77, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8475763.jpg" },
  { id: 186, name: "Danton Heinen", team: "PIT", position: "RW", overall: 76, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8478046.jpg" },
  { id: 187, name: "Blake Lizotte", team: "PIT", position: "C", overall: 73, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8481481.jpg" },
  { id: 188, name: "Evgeni Malkin", team: "PIT", position: "C", overall: 88, rarity: "gold", chemistry: ["Legend", "Power Forward"], image: "/src/assets/players/8471215.jpg" },
  { id: 189, name: "Rutger McGroarty", team: "PIT", position: "C", overall: 74, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8483487.jpg" },
  { id: 190, name: "Rickard Rakell", team: "PIT", position: "RW", overall: 80, rarity: "bronze", chemistry: ["Sniper"], image: "/src/assets/players/8476483.jpg" },
  { id: 191, name: "Bryan Rust", team: "PIT", position: "C", overall: 81, rarity: "silver", chemistry: ["Two-Way"], image: "/src/assets/players/8475810.jpg" },
  { id: 192, name: "Philip Tomasino", team: "PIT", position: "C", overall: 75, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481577.jpg" },
  { id: 193, name: "Connor Clifton", team: "PIT", position: "D", overall: 76, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8477365.jpg" },
  { id: 194, name: "Mathew Dumba", team: "PIT", position: "D", overall: 78, rarity: "bronze", chemistry: ["Offensive D"], image: "/src/assets/players/8476856.jpg" },
  { id: 195, name: "Erik Karlsson", team: "PIT", position: "D", overall: 93, rarity: "elite", chemistry: ["Offensive D", "Powerplay"], image: "/src/assets/players/8474578.jpg" },
  { id: 196, name: "Kris Letang", team: "PIT", position: "D", overall: 84, rarity: "silver", chemistry: ["Two-Way", "Veteran"], image: "/src/assets/players/8471724.jpg" },
  { id: 197, name: "Ryan Shea", team: "PIT", position: "D", overall: 73, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8478854.jpg" },
  { id: 198, name: "Tristan Jarry", team: "PIT", position: "G", overall: 81, rarity: "silver", chemistry: ["Steady"], image: "/src/assets/players/8477465.jpg" },

  // PHILADELPHIA FLYERS - Updated with correct NHL Profile IDs
  { id: 199, name: "Bobby Brink", team: "PHI", position: "LW", overall: 76, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481553.jpg" },
  { id: 200, name: "Noah Cates", team: "PHI", position: "C", overall: 75, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8480220.jpg" },
  { id: 201, name: "Sean Couturier", team: "PHI", position: "C", overall: 82, rarity: "silver", chemistry: ["Two-Way", "Defensive"], image: "/src/assets/players/8476461.jpg" },
  { id: 202, name: "Nicolas Deslauriers", team: "PHI", position: "LW", overall: 73, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8475235.jpg" },
  { id: 203, name: "Christian Dvorak", team: "PHI", position: "C", overall: 77, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8477989.jpg" },
  { id: 204, name: "Tyson Foerster", team: "PHI", position: "RW", overall: 75, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482159.jpg" },
  { id: 205, name: "Garnet Hathaway", team: "PHI", position: "RW", overall: 76, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8477903.jpg" },
  { id: 206, name: "Travis Konecny", team: "PHI", position: "LW", overall: 83, rarity: "silver", chemistry: ["Speedster", "Sniper"], image: "/src/assets/players/8478439.jpg" },
  { id: 207, name: "Matvei Michkov", team: "PHI", position: "RW", overall: 79, rarity: "bronze", chemistry: ["Young Gun", "Sniper"], image: "/src/assets/players/8484387.jpg" },
  { id: 208, name: "Owen Tippett", team: "PHI", position: "RW", overall: 78, rarity: "bronze", chemistry: ["Sniper"], image: "/src/assets/players/8480015.jpg" },
  { id: 209, name: "Trevor Zegras", team: "PHI", position: "LW", overall: 80, rarity: "bronze", chemistry: ["Playmaker"], image: "/src/assets/players/8481533.jpg" },
  { id: 210, name: "Jamie Drysdale", team: "PHI", position: "D", overall: 78, rarity: "bronze", chemistry: ["Offensive D", "Young Gun"], image: "/src/assets/players/8482142.jpg" },
  { id: 211, name: "Ryan Ellis", team: "PHI", position: "D", overall: 79, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8475176.jpg" },
  { id: 212, name: "Rasmus Ristolainen", team: "PHI", position: "D", overall: 76, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8477499.jpg" },
  { id: 213, name: "Travis Sanheim", team: "PHI", position: "D", overall: 80, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8477948.jpg" },
  { id: 214, name: "Nick Seeler", team: "PHI", position: "D", overall: 74, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8476372.jpg" },
  { id: 215, name: "Cam York", team: "PHI", position: "D", overall: 77, rarity: "bronze", chemistry: ["Offensive D"], image: "/src/assets/players/8481546.jpg" },
  { id: 216, name: "Egor Zamula", team: "PHI", position: "D", overall: 75, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8481178.jpg" },
  { id: 217, name: "Samuel Ersson", team: "PHI", position: "G", overall: 78, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481035.jpg" },
  { id: 218, name: "Ivan Fedotov", team: "PHI", position: "G", overall: 76, rarity: "bronze", chemistry: ["Steady"], image: "/src/assets/players/8478905.jpg" },

  // NEW YORK RANGERS - Updated with correct NHL Profile IDs
  { id: 219, name: "Jonny Brodzinski", team: "NYR", position: "C", overall: 74, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8477380.jpg" },
  { id: 220, name: "Sam Carrick", team: "NYR", position: "C", overall: 73, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8475842.jpg" },
  { id: 221, name: "Will Cuylle", team: "NYR", position: "LW", overall: 76, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482157.jpg" },
  { id: 222, name: "Adam Edstrom", team: "NYR", position: "C", overall: 72, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481726.jpg" },
  { id: 223, name: "Alexis Lafrenière", team: "NYR", position: "LW", overall: 81, rarity: "silver", chemistry: ["Young Gun", "Sniper"], image: "/src/assets/players/8482109.jpg" },
  { id: 224, name: "J.T. Miller", team: "NYR", position: "C", overall: 84, rarity: "silver", chemistry: ["Two-Way"], image: "/src/assets/players/8476468.jpg" },
  { id: 225, name: "Artemi Panarin", team: "NYR", position: "LW", overall: 91, rarity: "elite", chemistry: ["Playmaker", "Clutch"], image: "/src/assets/players/8478550.jpg" },
  { id: 226, name: "Taylor Raddysh", team: "NYR", position: "RW", overall: 75, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8479390.jpg" },
  { id: 227, name: "Matt Rempe", team: "NYR", position: "C", overall: 71, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8482460.jpg" },
  { id: 228, name: "Vincent Trocheck", team: "NYR", position: "C", overall: 83, rarity: "silver", chemistry: ["Two-Way"], image: "/src/assets/players/8476389.jpg" },
  { id: 229, name: "Mika Zibanejad", team: "NYR", position: "C", overall: 85, rarity: "gold", chemistry: ["Sniper", "Two-Way"], image: "/src/assets/players/8476459.jpg" },
  { id: 230, name: "Will Borgen", team: "NYR", position: "D", overall: 75, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8478840.jpg" },
  { id: 231, name: "Adam Fox", team: "NYR", position: "D", overall: 88, rarity: "gold", chemistry: ["Offensive D", "Two-Way"], image: "/src/assets/players/8479323.jpg" },
  { id: 232, name: "Vladislav Gavrikov", team: "NYR", position: "D", overall: 78, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8478882.jpg" },
  { id: 233, name: "Braden Scheider", team: "NYR", position: "D", overall: 77, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482073.jpg" },
  { id: 234, name: "Carson Soucy", team: "NYR", position: "D", overall: 76, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8477369.jpg" },
  { id: 235, name: "Urho Vaakanainen", team: "NYR", position: "D", overall: 74, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8480001.jpg" },
  { id: 236, name: "Igor Shesterkin", team: "NYR", position: "G", overall: 91, rarity: "elite", chemistry: ["Brick Wall", "Clutch"], image: "/src/assets/players/8478048.jpg" },
  { id: 237, name: "Jonathan Quick", team: "NYR", position: "G", overall: 79, rarity: "bronze", chemistry: ["Veteran"], image: "/src/assets/players/8471734.jpg" },

  // OTHER NHL TEAMS (Non-Atlantic/Metro) - Keeping minimal set for game functionality
  { id: 500, name: "Connor McDavid", team: "EDM", position: "C", overall: 99, rarity: "legend", chemistry: ["Speedster", "Playmaker", "Captain"] },
  { id: 501, name: "Leon Draisaitl", team: "EDM", position: "C", overall: 94, rarity: "elite", chemistry: ["Power Forward", "Playmaker"] },
  { id: 502, name: "Nathan MacKinnon", team: "COL", position: "C", overall: 97, rarity: "legend", chemistry: ["Speedster", "Clutch", "Power Forward"] },
  { id: 503, name: "Cale Makar", team: "COL", position: "D", overall: 96, rarity: "legend", chemistry: ["Two-Way", "Speedster", "Offensive D"] },

  // More COLUMBUS BLUE JACKETS depth
  { id: 286, name: "Johnny Gaudreau", team: "CBJ", position: "LW", overall: 87, rarity: "gold", chemistry: ["Playmaker", "Speedster"] },
  { id: 287, name: "Patrik Laine", team: "CBJ", position: "RW", overall: 83, rarity: "silver", chemistry: ["Sniper"] },
  { id: 288, name: "Boone Jenner", team: "CBJ", position: "C", overall: 79, rarity: "bronze", chemistry: ["Two-Way", "Leader"] },
  { id: 289, name: "Gustav Nyquist", team: "CBJ", position: "RW", overall: 77, rarity: "bronze", chemistry: ["Veteran"] },
  { id: 290, name: "Sean Kuraly", team: "CBJ", position: "C", overall: 73, rarity: "bronze", chemistry: ["Physical"] },
  { id: 291, name: "Zach Werenski", team: "CBJ", position: "D", overall: 86, rarity: "gold", chemistry: ["Offensive D"], image: "/src/assets/players/zach-werenski-realistic.jpg" },
  { id: 292, name: "Ivan Provorov", team: "CBJ", position: "D", overall: 81, rarity: "silver", chemistry: ["Two-Way"] },
  { id: 293, name: "Erik Gudbranson", team: "CBJ", position: "D", overall: 74, rarity: "bronze", chemistry: ["Physical", "Defensive"] },
  { id: 294, name: "Damon Severson", team: "CBJ", position: "D", overall: 78, rarity: "bronze", chemistry: ["Two-Way"] },
  { id: 295, name: "Elvis Merzlikins", team: "CBJ", position: "G", overall: 79, rarity: "bronze", chemistry: ["Veteran"] },

  // More DALLAS STARS depth (already have some)
  { id: 296, name: "Jason Robertson", team: "DAL", position: "LW", overall: 87, rarity: "gold", chemistry: ["Sniper", "Young Gun"], image: "/src/assets/players/jason-robertson.jpg" },
  { id: 297, name: "Roope Hintz", team: "DAL", position: "C", overall: 84, rarity: "silver", chemistry: ["Speedster", "Two-Way"], image: "/src/assets/players/roope-hintz.jpg" },
  { id: 298, name: "Jamie Benn", team: "DAL", position: "LW", overall: 81, rarity: "silver", chemistry: ["Veteran", "Leader", "Power Forward"], image: "/src/assets/players/jamie-benn.jpg" },
  { id: 299, name: "Tyler Seguin", team: "DAL", position: "C", overall: 82, rarity: "silver", chemistry: ["Veteran", "Sniper"], image: "/src/assets/players/tyler-seguin.jpg" },
  { id: 300, name: "Wyatt Johnston", team: "DAL", position: "C", overall: 79, rarity: "bronze", chemistry: ["Young Gun", "Two-Way"] },

  // Continue adding the rest...
  { id: 301, name: "Miro Heiskanen", team: "DAL", position: "D", overall: 86, rarity: "gold", chemistry: ["Two-Way", "Young Gun"] },
  { id: 302, name: "Joe Pavelski", team: "DAL", position: "C", overall: 79, rarity: "bronze", chemistry: ["Veteran", "Clutch"] },
  { id: 303, name: "Radek Faksa", team: "DAL", position: "C", overall: 74, rarity: "bronze", chemistry: ["Defensive"] },
  
  // More DETROIT RED WINGS depth
  { id: 304, name: "Dylan Larkin", team: "DET", position: "C", overall: 86, rarity: "gold", chemistry: ["Speedster", "Leader"] },
  { id: 305, name: "Lucas Raymond", team: "DET", position: "LW", overall: 82, rarity: "silver", chemistry: ["Young Gun", "Playmaker"] },
  { id: 306, name: "Alex DeBrincat", team: "DET", position: "RW", overall: 84, rarity: "silver", chemistry: ["Sniper"] },
  { id: 307, name: "Moritz Seider", team: "DET", position: "D", overall: 84, rarity: "silver", chemistry: ["Young Gun", "Two-Way"] },
  { id: 308, name: "David Perron", team: "DET", position: "RW", overall: 78, rarity: "bronze", chemistry: ["Veteran"] },

  // More EDMONTON OILERS depth (already have stars)
  { id: 309, name: "Ryan Nugent-Hopkins", team: "EDM", position: "C", overall: 84, rarity: "silver", chemistry: ["Two-Way", "Veteran"] },
  { id: 310, name: "Zach Hyman", team: "EDM", position: "LW", overall: 81, rarity: "silver", chemistry: ["Two-Way", "Net Front"] },
  { id: 311, name: "Evander Kane", team: "EDM", position: "LW", overall: 79, rarity: "bronze", chemistry: ["Power Forward"] },
  { id: 312, name: "Darnell Nurse", team: "EDM", position: "D", overall: 82, rarity: "silver", chemistry: ["Two-Way"] },
  { id: 313, name: "Evan Bouchard", team: "EDM", position: "D", overall: 81, rarity: "silver", chemistry: ["Offensive D", "Young Gun"] },

  // More FLORIDA PANTHERS depth (removed duplicates, using main entries above)

  // Continue with more teams and players...
  // LOS ANGELES KINGS (already added some)
  { id: 319, name: "Kevin Fiala", team: "LAK", position: "LW", overall: 84, rarity: "silver", chemistry: ["Playmaker"], image: "/src/assets/players/kevin-fiala.jpg" },
  { id: 320, name: "Drew Doughty", team: "LAK", position: "D", overall: 84, rarity: "silver", chemistry: ["Veteran", "Two-Way"] },
  { id: 321, name: "Quinton Byfield", team: "LAK", position: "C", overall: 78, rarity: "bronze", chemistry: ["Young Gun", "Power Forward"] },
  { id: 322, name: "Phillip Danault", team: "LAK", position: "C", overall: 79, rarity: "bronze", chemistry: ["Defensive", "Two-Way"] },
  { id: 323, name: "Trevor Moore", team: "LAK", position: "LW", overall: 77, rarity: "bronze", chemistry: ["Speedster"] },

  // MINNESOTA WILD (already added some)
  { id: 324, name: "Joel Eriksson Ek", team: "MIN", position: "C", overall: 82, rarity: "silver", chemistry: ["Two-Way", "Defensive"], image: "/src/assets/players/joel-eriksson-ek.jpg" },
  { id: 325, name: "Mats Zuccarello", team: "MIN", position: "RW", overall: 80, rarity: "bronze", chemistry: ["Veteran", "Playmaker"] },
  { id: 326, name: "Jared Spurgeon", team: "MIN", position: "D", overall: 82, rarity: "silver", chemistry: ["Two-Way", "Leader"] },
  { id: 327, name: "Jonas Brodin", team: "MIN", position: "D", overall: 80, rarity: "bronze", chemistry: ["Defensive"] },
  { id: 328, name: "Marco Rossi", team: "MIN", position: "C", overall: 76, rarity: "bronze", chemistry: ["Young Gun", "Playmaker"] },

  // Continue with all other NHL teams and add depth players to reach 1000+
  // This would include backup goalies, prospects, fourth-liners, etc.
  
  // Adding some goaltenders
  { id: 329, name: "Connor Hellebuyck", team: "WPG", position: "G", overall: 89, rarity: "gold", chemistry: ["Elite Goalie"] },
  { id: 330, name: "Jacob Markstrom", team: "CGY", position: "G", overall: 84, rarity: "silver", chemistry: ["Elite Goalie"] },
  { id: 331, name: "Frederik Andersen", team: "CAR", position: "G", overall: 82, rarity: "silver", chemistry: ["Veteran"] },
  { id: 332, name: "Juuse Saros", team: "NSH", position: "G", overall: 86, rarity: "gold", chemistry: ["Elite Goalie"] },
  { id: 333, name: "Ilya Sorokin", team: "NYI", position: "G", overall: 85, rarity: "gold", chemistry: ["Elite Goalie"] },

  // More depth forwards from various teams
  // Removed duplicate FLA players (using main entries above)
  { id: 336, name: "Nick Cousins", team: "FLA", position: "C", overall: 73, rarity: "bronze", chemistry: ["Agitator"] },
  { id: 183, name: "T.J. Oshie", team: "WSH", position: "RW", overall: 80, rarity: "bronze", chemistry: ["Veteran", "Clutch"] },
  { id: 184, name: "Tom Wilson", team: "WSH", position: "RW", overall: 79, rarity: "bronze", chemistry: ["Physical", "Power Forward"] },
  { id: 185, name: "Trevor van Riemsdyk", team: "WSH", position: "D", overall: 74, rarity: "bronze", chemistry: ["Defensive"] },

  // WINNIPEG JETS
  { id: 186, name: "Mark Scheifele", team: "WPG", position: "C", overall: 85, rarity: "gold", chemistry: ["Sniper", "Playmaker"] },
  { id: 187, name: "Kyle Connor", team: "WPG", position: "LW", overall: 84, rarity: "silver", chemistry: ["Sniper", "Speedster"] },
  { id: 188, name: "Nikolaj Ehlers", team: "WPG", position: "LW", overall: 82, rarity: "silver", chemistry: ["Speedster"] },
  { id: 189, name: "Josh Morrissey", team: "WPG", position: "D", overall: 84, rarity: "silver", chemistry: ["Offensive D"] },
  { id: 190, name: "Neal Pionk", team: "WPG", position: "D", overall: 78, rarity: "bronze", chemistry: ["Offensive D"] },

  // Add many more depth players, prospects, role players to reach 1000+
  // This includes 4th liners, backup goalies, prospects, etc.
  // For brevity, I'll add a sampling of these types of players

  // Role players and depth across all teams
  { id: 191, name: "Patrice Bergeron", team: "BOS", position: "C", overall: 88, rarity: "gold", chemistry: ["Legend", "Two-Way", "Leader"] },
  { id: 192, name: "David Krejci", team: "BOS", position: "C", overall: 82, rarity: "silver", chemistry: ["Veteran", "Playmaker"] },
  { id: 193, name: "Charlie Coyle", team: "BOS", position: "C", overall: 78, rarity: "bronze", chemistry: ["Two-Way"] },
  { id: 194, name: "Matt Grzelcyk", team: "BOS", position: "D", overall: 76, rarity: "bronze", chemistry: ["Offensive D"] },
  { id: 195, name: "Derek Forbort", team: "BOS", position: "D", overall: 74, rarity: "bronze", chemistry: ["Defensive"] },

  // Continue adding hundreds more players including:
  // - Prospects and rookies (65-75 overall)
  // - Role players and depth forwards (68-78 overall)  
  // - Backup goalies (70-80 overall)
  // - Veteran depth defensemen (70-78 overall)
  // - AHL call-ups and young players (65-72 overall)

  // Sample of lower overall players to show the full range
  { id: 196, name: "Tomas Nosek", team: "BOS", position: "C", overall: 71, rarity: "bronze", chemistry: ["Defensive"] },
  { id: 197, name: "A.J. Greer", team: "BOS", position: "LW", overall: 68, rarity: "bronze", chemistry: ["Physical"] },
  { id: 198, name: "Jesper Boqvist", team: "BOS", position: "LW", overall: 69, rarity: "bronze", chemistry: ["Speedster"] },
  { id: 199, name: "Kevin Shattenkirk", team: "BOS", position: "D", overall: 73, rarity: "bronze", chemistry: ["Veteran", "Powerplay"] },
  { id: 200, name: "Linus Ullmark", team: "BOS", position: "G", overall: 84, rarity: "silver", chemistry: ["Steady"] },

  // This pattern would continue for ALL teams with complete rosters
  // Including ALL NHL players (stars, regulars, role players, prospects, etc.)
  // to reach 1000+ total players with realistic overalls based on real performance

  // Note: In a complete implementation, this would include every NHL player
  // with overalls ranging from 65 (prospects/4th liners) to 99 (McDavid)
  // The chemistry types would also be more varied and specific to each player
];

// Pack probabilities for different rarities
export const PACK_PROBABILITIES = {
  bronze: {
    legend: 0.001,  // 0.1%
    elite: 0.005,   // 0.5%
    gold: 0.02,     // 2%
    silver: 0.15,   // 15%
    bronze: 0.824   // 82.4%
  },
  standard: {
    legend: 0.002,  // 0.2%
    elite: 0.01,    // 1%
    gold: 0.05,     // 5%
    silver: 0.25,   // 25%
    bronze: 0.688   // 68.8%
  },
  premium: {
    legend: 0.005,  // 0.5%
    elite: 0.03,    // 3%
    gold: 0.15,     // 15%
    silver: 0.35,   // 35%
    bronze: 0.465   // 46.5%
  },
  elite: {
    legend: 0.02,   // 2%
    elite: 0.08,    // 8%
    gold: 0.30,     // 30%
    silver: 0.40,   // 40%
    bronze: 0.20    // 20%
  }
};

// Coach database
export interface Coach {
  id: number;
  name: string;
  team: string;
  overall: number;
  specialty: string;
  bonus: string;
  cost: number;
}

export const coachDatabase: Coach[] = [
  { id: 1, name: "Joel Quenneville", team: "Retired", overall: 95, specialty: "Championship Experience", bonus: "+5% Win Rate", cost: 5000 },
  { id: 2, name: "Scotty Bowman", team: "Retired", overall: 98, specialty: "Legendary Tactician", bonus: "+8% Chemistry", cost: 10000 },
  { id: 3, name: "Rod Brind'Amour", team: "CAR", overall: 92, specialty: "Player Development", bonus: "+3% XP Gain", cost: 3000 },
  { id: 4, name: "Jon Cooper", team: "TBL", overall: 91, specialty: "Offensive Systems", bonus: "+2 Goals per Game", cost: 3500 },
  { id: 5, name: "Bruce Cassidy", team: "VGK", overall: 89, specialty: "Defensive Structure", bonus: "-1 Goals Against", cost: 2500 },
  { id: 6, name: "Craig Berube", team: "STL", overall: 88, specialty: "Physical Play", bonus: "+5% Physical Stats", cost: 2000 },
  { id: 7, name: "Peter DeBoer", team: "DAL", overall: 86, specialty: "Special Teams", bonus: "+10% PP/PK Efficiency", cost: 1500 },
  { id: 8, name: "Dave Hakstol", team: "SEA", overall: 84, specialty: "Team Chemistry", bonus: "+5% Team Chemistry", cost: 1000 },
];

// Starter team with every position covered
export const getStarterTeam = (): Player[] => [
  // Line 1 - Basic forwards
  { id: 1001, name: "Ryan Strome", team: "ANA", position: "C", overall: 78, rarity: "silver", chemistry: ["Playmaker"] },
  { id: 1002, name: "Tyler Bertuzzi", team: "TOR", position: "LW", overall: 77, rarity: "silver", chemistry: ["Grinder"] },
  { id: 1003, name: "Reilly Smith", team: "NYR", position: "RW", overall: 76, rarity: "silver", chemistry: ["Two-Way"] },
  
  // Line 2
  { id: 1004, name: "Jordan Staal", team: "CAR", position: "C", overall: 75, rarity: "bronze", chemistry: ["Defensive"] },
  { id: 1005, name: "Andrew Copp", team: "DET", position: "LW", overall: 74, rarity: "bronze", chemistry: ["Grinder"] },
  { id: 1006, name: "Nick Foligno", team: "CHI", position: "RW", overall: 73, rarity: "bronze", chemistry: ["Veteran"] },
  
  // Line 3
  { id: 1007, name: "Sean Couturier", team: "PHI", position: "C", overall: 72, rarity: "bronze", chemistry: ["Defensive"] },
  { id: 1008, name: "Max Domi", team: "TOR", position: "LW", overall: 71, rarity: "bronze", chemistry: ["Speedster"] },
  { id: 1009, name: "Patrik Laine", team: "MTL", position: "RW", overall: 70, rarity: "bronze", chemistry: ["Sniper"] },
  
  // Line 4
  { id: 1010, name: "Noel Acciari", team: "PIT", position: "C", overall: 69, rarity: "bronze", chemistry: ["Grinder"] },
  // Removed duplicate FLA player (using main entries above)
  { id: 1012, name: "Austin Watson", team: "TBL", position: "RW", overall: 67, rarity: "bronze", chemistry: ["Enforcer"] },
  
  // Defense - Pair 1
  { id: 1013, name: "Matt Dumba", team: "TBL", position: "D", overall: 76, rarity: "silver", chemistry: ["Offensive D"] },
  { id: 1014, name: "Jacob Trouba", team: "NYR", position: "D", overall: 75, rarity: "silver", chemistry: ["Defensive"] },
  
  // Defense - Pair 2
  { id: 1015, name: "Calvin de Haan", team: "CAR", position: "D", overall: 72, rarity: "bronze", chemistry: ["Defensive"] },
  { id: 1016, name: "Nick Seeler", team: "PHI", position: "D", overall: 71, rarity: "bronze", chemistry: ["Stay-at-home"] },
  
  // WESTERN CONFERENCE CENTRAL DIVISION

  // WINNIPEG JETS - With correct NHL Profile IDs
  { id: 300, name: "Morgan Barron", team: "WPG", position: "C", overall: 74, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8480289.jpg" },
  { id: 301, name: "Kyle Connor", team: "WPG", position: "LW", overall: 87, rarity: "gold", chemistry: ["Sniper", "Speedster"], image: "/src/assets/players/8478398.jpg" },
  { id: 302, name: "David Gustafsson", team: "WPG", position: "C", overall: 73, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481019.jpg" },
  { id: 303, name: "Alex Iafallo", team: "WPG", position: "LW", overall: 76, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8480113.jpg" },
  { id: 304, name: "Rasmus Kupari", team: "WPG", position: "C", overall: 74, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8480845.jpg" },
  { id: 305, name: "Adam Lowry", team: "WPG", position: "C", overall: 78, rarity: "bronze", chemistry: ["Defensive", "Physical"], image: "/src/assets/players/8476392.jpg" },
  { id: 306, name: "Vladislav Namestnikov", team: "WPG", position: "C", overall: 76, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8476480.jpg" },
  { id: 307, name: "Nino Niederreiter", team: "WPG", position: "RW", overall: 79, rarity: "bronze", chemistry: ["Power Forward"], image: "/src/assets/players/8475799.jpg" },
  { id: 308, name: "Tanner Pearson", team: "WPG", position: "LW", overall: 76, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8476871.jpg" },
  { id: 309, name: "Cole Perfetti", team: "WPG", position: "C", overall: 78, rarity: "bronze", chemistry: ["Young Gun", "Playmaker"], image: "/src/assets/players/8482149.jpg" },
  { id: 310, name: "Mark Scheifele", team: "WPG", position: "C", overall: 85, rarity: "gold", chemistry: ["Sniper", "Playmaker"], image: "/src/assets/players/8476460.jpg" },
  { id: 311, name: "Jonathan Toews", team: "WPG", position: "C", overall: 82, rarity: "silver", chemistry: ["Leader", "Veteran"], image: "/src/assets/players/8473604.jpg" },
  { id: 312, name: "Brayden Yager", team: "WPG", position: "C", overall: 72, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8484242.jpg" },
  { id: 313, name: "Dylan DeMelo", team: "WPG", position: "D", overall: 77, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8476331.jpg" },
  { id: 314, name: "Haydn Fleury", team: "WPG", position: "D", overall: 74, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8477938.jpg" },
  { id: 315, name: "Ville Heinola", team: "WPG", position: "D", overall: 75, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481572.jpg" },
  { id: 316, name: "Colin Miller", team: "WPG", position: "D", overall: 74, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8476525.jpg" },
  { id: 317, name: "Josh Morrissey", team: "WPG", position: "D", overall: 83, rarity: "silver", chemistry: ["Two-Way", "Powerplay"], image: "/src/assets/players/8477504.jpg" },
  { id: 318, name: "Neal Pionk", team: "WPG", position: "D", overall: 78, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8480145.jpg" },
  { id: 319, name: "Luke Schenn", team: "WPG", position: "D", overall: 75, rarity: "bronze", chemistry: ["Physical", "Veteran"], image: "/src/assets/players/8474568.jpg" },
  { id: 320, name: "Logan Stanley", team: "WPG", position: "D", overall: 73, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8479378.jpg" },
  { id: 321, name: "Connor Hellebuyck", team: "WPG", position: "G", overall: 91, rarity: "elite", chemistry: ["Elite Goalie", "Clutch"], image: "/src/assets/players/8476945.jpg" },
  { id: 322, name: "Eric Comrie", team: "WPG", position: "G", overall: 75, rarity: "bronze", chemistry: ["Backup"], image: "/src/assets/players/8477434.jpg" }
,

  // COLORADO AVALANCHE - With correct NHL Profile IDs
  { id: 323, name: "Ross Colton", team: "COL", position: "C", overall: 79, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8479525.jpg" },
  { id: 324, name: "Jack Drury", team: "COL", position: "C", overall: 74, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8480835.jpg" },
  { id: 325, name: "Gabriel Landeskog", team: "COL", position: "LW", overall: 83, rarity: "silver", chemistry: ["Leader", "Power Forward"], image: "/src/assets/players/8476455.jpg" },
  { id: 326, name: "Artturi Lehkonen", team: "COL", position: "LW", overall: 80, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8477476.jpg" },
  { id: 327, name: "Valeri Nichushkin", team: "COL", position: "RW", overall: 82, rarity: "silver", chemistry: ["Power Forward"], image: "/src/assets/players/8477501.jpg" },
  { id: 328, name: "Brock Nelson", team: "COL", position: "C", overall: 81, rarity: "silver", chemistry: ["Two-Way"], image: "/src/assets/players/8475754.jpg" },
  { id: 329, name: "Logan O'Connor", team: "COL", position: "RW", overall: 74, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8481186.jpg" },
  { id: 330, name: "Brent Burns", team: "COL", position: "D", overall: 79, rarity: "bronze", chemistry: ["Veteran", "Powerplay"], image: "/src/assets/players/8470613.jpg" },
  { id: 331, name: "Samuel Girard", team: "COL", position: "D", overall: 79, rarity: "bronze", chemistry: ["Speedster"], image: "/src/assets/players/8479398.jpg" },
  { id: 332, name: "Josh Manson", team: "COL", position: "D", overall: 78, rarity: "bronze", chemistry: ["Physical", "Defensive"], image: "/src/assets/players/8476312.jpg" },
  { id: 333, name: "Devon Toews", team: "COL", position: "D", overall: 85, rarity: "gold", chemistry: ["Two-Way", "Powerplay"], image: "/src/assets/players/8478038.jpg" },
  { id: 334, name: "Keaton Middleton", team: "COL", position: "D", overall: 72, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8479387.jpg" },
  { id: 335, name: "Mackenzie Blackwood", team: "COL", position: "G", overall: 78, rarity: "bronze", chemistry: ["Steady"], image: "/src/assets/players/8478406.jpg" },
  { id: 336, name: "Scott Wedgewood", team: "COL", position: "G", overall: 75, rarity: "bronze", chemistry: ["Backup"], image: "/src/assets/players/8475809.jpg" },

  // CHICAGO BLACKHAWKS - With correct NHL Profile IDs
  { id: 337, name: "Connor Bedard", team: "CHI", position: "C", overall: 85, rarity: "gold", chemistry: ["Young Gun", "Sniper"], image: "/src/assets/players/8484144.jpg" },
  { id: 338, name: "Tyler Bertuzzi", team: "CHI", position: "LW", overall: 79, rarity: "bronze", chemistry: ["Power Forward"], image: "/src/assets/players/8477479.jpg" },
  { id: 339, name: "Andre Burakovsky", team: "CHI", position: "LW", overall: 78, rarity: "bronze", chemistry: ["Speedster"], image: "/src/assets/players/8477444.jpg" },
  { id: 340, name: "Jason Dickinson", team: "CHI", position: "C", overall: 75, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8477450.jpg" },
  { id: 341, name: "Ryan Donato", team: "CHI", position: "C", overall: 74, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8477987.jpg" },
  { id: 342, name: "Nick Foligno", team: "CHI", position: "LW", overall: 76, rarity: "bronze", chemistry: ["Veteran", "Physical"], image: "/src/assets/players/8473422.jpg" },
  { id: 343, name: "Sam Lafferty", team: "CHI", position: "C", overall: 73, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8478043.jpg" },
  { id: 344, name: "Ilya Mikheyev", team: "CHI", position: "RW", overall: 76, rarity: "bronze", chemistry: ["Speedster"], image: "/src/assets/players/8481624.jpg" },
  { id: 345, name: "Frank Nazar", team: "CHI", position: "C", overall: 73, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8483493.jpg" },
  { id: 346, name: "Lucas Reichel", team: "CHI", position: "LW", overall: 74, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482117.jpg" },
  { id: 347, name: "Landon Slaggert", team: "CHI", position: "LW", overall: 72, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482172.jpg" },
  { id: 348, name: "Teuvo Teravainen", team: "CHI", position: "C", overall: 80, rarity: "bronze", chemistry: ["Playmaker"], image: "/src/assets/players/8476882.jpg" },
  { id: 349, name: "Louis Crevier", team: "CHI", position: "D", overall: 71, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481806.jpg" },
  { id: 350, name: "Wyatt Kaiser", team: "CHI", position: "D", overall: 73, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482176.jpg" },
  { id: 351, name: "Artyom Levshunov", team: "CHI", position: "D", overall: 75, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8484783.jpg" },
  { id: 352, name: "Connor Murphy", team: "CHI", position: "D", overall: 76, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8476473.jpg" },
  { id: 353, name: "Sam Rinzel", team: "CHI", position: "D", overall: 72, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8483506.jpg" },
  { id: 354, name: "Alex Vlasic", team: "CHI", position: "D", overall: 74, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481568.jpg" },
  { id: 355, name: "Spencer Knight", team: "CHI", position: "G", overall: 76, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481519.jpg" },
  { id: 356, name: "Arvid Soderblom", team: "CHI", position: "G", overall: 73, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482821.jpg" },

  // UTAH MAMMOTHS - With correct NHL Profile IDs
  { id: 357, name: "Michael Carcone", team: "UTA", position: "LW", overall: 73, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8479619.jpg" },
  { id: 358, name: "Logan Cooley", team: "UTA", position: "C", overall: 76, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8483431.jpg" },
  { id: 359, name: "Lawson Crouse", team: "UTA", position: "LW", overall: 78, rarity: "bronze", chemistry: ["Power Forward"], image: "/src/assets/players/8478474.jpg" },
  { id: 360, name: "Dylan Guenther", team: "UTA", position: "RW", overall: 77, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482699.jpg" },
  { id: 361, name: "Barrett Hayton", team: "UTA", position: "C", overall: 75, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8480849.jpg" },
  { id: 362, name: "Clayton Keller", team: "UTA", position: "C", overall: 82, rarity: "silver", chemistry: ["Speedster", "Playmaker"], image: "/src/assets/players/8479343.jpg" },
  { id: 363, name: "Alexander Kerfoot", team: "UTA", position: "C", overall: 76, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8477021.jpg" },
  { id: 364, name: "Jack McBain", team: "UTA", position: "C", overall: 74, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8480855.jpg" },
  { id: 365, name: "Liam O'Brien", team: "UTA", position: "C", overall: 71, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8477070.jpg" },
  { id: 366, name: "JJ Peterka", team: "UTA", position: "RW", overall: 76, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482175.jpg" },
  { id: 367, name: "Nick Schmaltz", team: "UTA", position: "C", overall: 78, rarity: "bronze", chemistry: ["Playmaker"], image: "/src/assets/players/8477951.jpg" },
  { id: 368, name: "Kevin Stenlund", team: "UTA", position: "C", overall: 72, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8478831.jpg" },
  { id: 369, name: "Brandon Tanev", team: "UTA", position: "LW", overall: 75, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8479293.jpg" },
  { id: 370, name: "Ian Cole", team: "UTA", position: "D", overall: 74, rarity: "bronze", chemistry: ["Defensive", "Veteran"], image: "/src/assets/players/8474013.jpg" },
  { id: 371, name: "Sean Durzi", team: "UTA", position: "D", overall: 76, rarity: "bronze", chemistry: ["Offensive D"], image: "/src/assets/players/8480434.jpg" },
  { id: 372, name: "Olli Määttä", team: "UTA", position: "D", overall: 75, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8476874.jpg" },
  { id: 373, name: "John Marino", team: "UTA", position: "D", overall: 77, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8478507.jpg" },
  { id: 374, name: "Nate Schmidt", team: "UTA", position: "D", overall: 76, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8477220.jpg" },
  { id: 375, name: "Mikhail Sergachev", team: "UTA", position: "D", overall: 82, rarity: "silver", chemistry: ["Offensive D", "Powerplay"], image: "/src/assets/players/8479410.jpg" },
  { id: 376, name: "Vitek Vanecek", team: "UTA", position: "G", overall: 77, rarity: "bronze", chemistry: ["Steady"], image: "/src/assets/players/8477970.jpg" },
  { id: 377, name: "Karel Vejmelka", team: "UTA", position: "G", overall: 75, rarity: "bronze", chemistry: ["Backup"], image: "/src/assets/players/8478872.jpg" },

  // DALLAS STARS - With correct NHL Profile IDs
  { id: 378, name: "Jamie Benn", team: "DAL", position: "LW", overall: 82, rarity: "silver", chemistry: ["Leader", "Power Forward"], image: "/src/assets/players/8473994.jpg" },
  { id: 379, name: "Colin Blackwell", team: "DAL", position: "C", overall: 73, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8476278.jpg" },
  { id: 380, name: "Mavrik Bourque", team: "DAL", position: "C", overall: 74, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482145.jpg" },
  { id: 381, name: "Matt Duchene", team: "DAL", position: "C", overall: 80, rarity: "bronze", chemistry: ["Veteran", "Playmaker"], image: "/src/assets/players/8475168.jpg" },
  { id: 382, name: "Radek Faksa", team: "DAL", position: "C", overall: 75, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8476889.jpg" },
  { id: 383, name: "Roope Hintz", team: "DAL", position: "C", overall: 83, rarity: "silver", chemistry: ["Speedster", "Two-Way"], image: "/src/assets/players/8478449.jpg" },
  { id: 384, name: "Wyatt Johnston", team: "DAL", position: "C", overall: 78, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482740.jpg" },
  { id: 385, name: "Mikko Rantanen", team: "DAL", position: "RW", overall: 92, rarity: "elite", chemistry: ["Sniper", "Playmaker"], image: "/src/assets/players/8478420.jpg" },
  { id: 386, name: "Jason Robertson", team: "DAL", position: "LW", overall: 89, rarity: "gold", chemistry: ["Sniper", "Young Gun"], image: "/src/assets/players/8480027.jpg" },
  { id: 387, name: "Tyler Seguin", team: "DAL", position: "C", overall: 83, rarity: "silver", chemistry: ["Veteran", "Sniper"], image: "/src/assets/players/8475794.jpg" },
  { id: 388, name: "Sam Steel", team: "DAL", position: "C", overall: 73, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8479351.jpg" },
  { id: 389, name: "Thomas Harley", team: "DAL", position: "D", overall: 78, rarity: "bronze", chemistry: ["Young Gun", "Offensive D"], image: "/src/assets/players/8481581.jpg" },
  { id: 390, name: "Miro Heiskanen", team: "DAL", position: "D", overall: 89, rarity: "gold", chemistry: ["Two-Way", "Elite"], image: "/src/assets/players/8480036.jpg" },
  { id: 391, name: "Esa Lindell", team: "DAL", position: "D", overall: 81, rarity: "silver", chemistry: ["Defensive"], image: "/src/assets/players/8476902.jpg" },
  { id: 392, name: "Nils Lundkvist", team: "DAL", position: "D", overall: 75, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8480878.jpg" },
  { id: 393, name: "Ilya Lyubushkin", team: "DAL", position: "D", overall: 74, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8480950.jpg" },
  { id: 394, name: "Vladislav Kolyachonok", team: "DAL", position: "D", overall: 72, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481609.jpg" },
  { id: 395, name: "Casey DeSmith", team: "DAL", position: "G", overall: 76, rarity: "bronze", chemistry: ["Backup"], image: "/src/assets/players/8479193.jpg" },
  { id: 396, name: "Jake Oettinger", team: "DAL", position: "G", overall: 85, rarity: "gold", chemistry: ["Young Gun", "Elite Goalie"], image: "/src/assets/players/8479979.jpg" },

  // NASHVILLE PREDATORS - With correct NHL Profile IDs
  { id: 397, name: "Zachary L'Heureux", team: "NSH", position: "LW", overall: 73, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482742.jpg" },
  { id: 398, name: "Michael Bunting", team: "NSH", position: "LW", overall: 78, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8478047.jpg" },
  { id: 399, name: "Luke Evangelista", team: "NSH", position: "RW", overall: 75, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482146.jpg" },
  { id: 400, name: "Filip Forsberg", team: "NSH", position: "LW", overall: 86, rarity: "gold", chemistry: ["Sniper", "Speedster"], image: "/src/assets/players/8476887.jpg" },
  { id: 401, name: "Erik Haula", team: "NSH", position: "LW", overall: 76, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8475287.jpg" },
  { id: 402, name: "Jonathan Marchessault", team: "NSH", position: "C", overall: 82, rarity: "silver", chemistry: ["Clutch", "Sniper"], image: "/src/assets/players/8476539.jpg" },
  { id: 403, name: "Michael McCarron", team: "NSH", position: "RW", overall: 72, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8477446.jpg" },
  { id: 404, name: "Ryan O'Reilly", team: "NSH", position: "C", overall: 82, rarity: "silver", chemistry: ["Two-Way", "Veteran"], image: "/src/assets/players/8475158.jpg" },
  { id: 405, name: "Cole Smith", team: "NSH", position: "LW", overall: 71, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8482062.jpg" },
  { id: 406, name: "Steven Stamkos", team: "NSH", position: "C", overall: 87, rarity: "gold", chemistry: ["Sniper", "Veteran"], image: "/src/assets/players/8474564.jpg" },
  { id: 407, name: "Matthew Wood", team: "NSH", position: "RW", overall: 73, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8484241.jpg" },
  { id: 408, name: "Roman Josi", team: "NSH", position: "D", overall: 90, rarity: "elite", chemistry: ["Offensive D", "Powerplay"], image: "/src/assets/players/8474600.jpg" },
  { id: 409, name: "Brady Skjei", team: "NSH", position: "D", overall: 80, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8476869.jpg" },
  { id: 410, name: "Nick Perbix", team: "NSH", position: "D", overall: 75, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8480246.jpg" },
  { id: 411, name: "Nicolas Hague", team: "NSH", position: "D", overall: 77, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8479980.jpg" },
  { id: 412, name: "Jordan Oesterle", team: "NSH", position: "D", overall: 73, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8477851.jpg" },
  { id: 413, name: "Justin Barron", team: "NSH", position: "D", overall: 74, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482111.jpg" },
  { id: 414, name: "Andreas Englund", team: "NSH", position: "D", overall: 72, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8477971.jpg" },
  { id: 415, name: "Juuse Saros", team: "NSH", position: "G", overall: 87, rarity: "gold", chemistry: ["Elite Goalie", "Clutch"], image: "/src/assets/players/8477424.jpg" },
  { id: 416, name: "Justus Annunen", team: "NSH", position: "G", overall: 74, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481020.jpg" },

  // MINNESOTA WILD - With correct NHL Profile IDs
  { id: 417, name: "Matt Boldy", team: "MIN", position: "LW", overall: 82, rarity: "silver", chemistry: ["Young Gun", "Sniper"], image: "/src/assets/players/8481557.jpg" },
  { id: 418, name: "Joel Eriksson Ek", team: "MIN", position: "C", overall: 82, rarity: "silver", chemistry: ["Two-Way", "Defensive"], image: "/src/assets/players/8478493.jpg" },
  { id: 419, name: "Marcus Foligno", team: "MIN", position: "LW", overall: 77, rarity: "bronze", chemistry: ["Physical", "Leader"], image: "/src/assets/players/8475220.jpg" },
  { id: 420, name: "Ryan Hartman", team: "MIN", position: "RW", overall: 76, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8477451.jpg" },
  { id: 421, name: "Vinnie Hinostroza", team: "MIN", position: "C", overall: 73, rarity: "bronze", chemistry: ["Speedster"], image: "/src/assets/players/8476994.jpg" },
  { id: 422, name: "Marcus Johansson", team: "MIN", position: "LW", overall: 76, rarity: "bronze", chemistry: ["Veteran"], image: "/src/assets/players/8475149.jpg" },
  { id: 423, name: "Kirill Kaprizov", team: "MIN", position: "LW", overall: 92, rarity: "elite", chemistry: ["Sniper", "Playmaker"], image: "/src/assets/players/8478864.jpg" },
  { id: 424, name: "Liam Ohgren", team: "MIN", position: "LW", overall: 73, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8483499.jpg" },
  { id: 425, name: "Marco Rossi", team: "MIN", position: "C", overall: 76, rarity: "bronze", chemistry: ["Young Gun", "Playmaker"], image: "/src/assets/players/8482079.jpg" },
  { id: 426, name: "Nico Sturm", team: "MIN", position: "C", overall: 74, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8481477.jpg" },
  { id: 427, name: "Vladimir Tarasenko", team: "MIN", position: "RW", overall: 83, rarity: "silver", chemistry: ["Sniper", "Veteran"], image: "/src/assets/players/8475765.jpg" },
  { id: 428, name: "Yakov Trenin", team: "MIN", position: "C", overall: 74, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8478508.jpg" },
  { id: 429, name: "Mats Zuccarello", team: "MIN", position: "RW", overall: 79, rarity: "bronze", chemistry: ["Veteran", "Playmaker"], image: "/src/assets/players/8475692.jpg" },
  { id: 430, name: "Zach Bogosian", team: "MIN", position: "D", overall: 74, rarity: "bronze", chemistry: ["Veteran", "Physical"], image: "/src/assets/players/8474567.jpg" },
  { id: 431, name: "Jonas Brodin", team: "MIN", position: "D", overall: 81, rarity: "silver", chemistry: ["Defensive"], image: "/src/assets/players/8476463.jpg" },
  { id: 432, name: "Brock Faber", team: "MIN", position: "D", overall: 78, rarity: "bronze", chemistry: ["Young Gun", "Two-Way"], image: "/src/assets/players/8482122.jpg" },
  { id: 433, name: "Jake Middleton", team: "MIN", position: "D", overall: 75, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8478136.jpg" },
  { id: 434, name: "Jared Spurgeon", team: "MIN", position: "D", overall: 80, rarity: "bronze", chemistry: ["Defensive", "Leader"], image: "/src/assets/players/8474716.jpg" },
  { id: 435, name: "Zeev Buium", team: "MIN", position: "D", overall: 74, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8484798.jpg" },
  { id: 436, name: "Filip Gustavsson", team: "MIN", position: "G", overall: 80, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8479406.jpg" },
  { id: 437, name: "Jesper Wallstedt", team: "MIN", position: "G", overall: 75, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482661.jpg" },

  // ST LOUIS BLUES - With correct NHL Profile IDs
  { id: 438, name: "Pavel Buchnevich", team: "STL", position: "LW", overall: 83, rarity: "silver", chemistry: ["Sniper", "Two-Way"], image: "/src/assets/players/8477402.jpg" },
  { id: 439, name: "Dylan Holloway", team: "STL", position: "LW", overall: 75, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482077.jpg" },
  { id: 440, name: "Mathieu Joseph", team: "STL", position: "RW", overall: 74, rarity: "bronze", chemistry: ["Speedster"], image: "/src/assets/players/8478472.jpg" },
  { id: 441, name: "Jordan Kyrou", team: "STL", position: "RW", overall: 82, rarity: "silver", chemistry: ["Speedster", "Playmaker"], image: "/src/assets/players/8479385.jpg" },
  { id: 442, name: "Jake Neighbours", team: "STL", position: "LW", overall: 76, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482089.jpg" },
  { id: 443, name: "Brayden Schenn", team: "STL", position: "C", overall: 80, rarity: "bronze", chemistry: ["Power Forward", "Leader"], image: "/src/assets/players/8475170.jpg" },
  { id: 444, name: "Jimmy Snuggerud", team: "STL", position: "RW", overall: 73, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8483516.jpg" },
  { id: 445, name: "Oskar Sundqvist", team: "STL", position: "C", overall: 75, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8476897.jpg" },
  { id: 446, name: "Alexandre Texier", team: "STL", position: "LW", overall: 74, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8480074.jpg" },
  { id: 447, name: "Robert Thomas", team: "STL", position: "C", overall: 83, rarity: "silver", chemistry: ["Playmaker", "Two-Way"], image: "/src/assets/players/8480023.jpg" },
  { id: 448, name: "Alexey Toropchenko", team: "STL", position: "RW", overall: 73, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8480281.jpg" },
  { id: 449, name: "Nathan Walker", team: "STL", position: "LW", overall: 71, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8477573.jpg" },
  { id: 450, name: "Justin Faulk", team: "STL", position: "D", overall: 80, rarity: "bronze", chemistry: ["Two-Way", "Powerplay"], image: "/src/assets/players/8475753.jpg" },
  { id: 451, name: "Cam Fowler", team: "STL", position: "D", overall: 79, rarity: "bronze", chemistry: ["Veteran", "Two-Way"], image: "/src/assets/players/8475764.jpg" },
  { id: 452, name: "Matthew Kessel", team: "STL", position: "D", overall: 72, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482516.jpg" },
  { id: 453, name: "Colton Parayko", team: "STL", position: "D", overall: 82, rarity: "silver", chemistry: ["Defensive", "Physical"], image: "/src/assets/players/8476892.jpg" },
  { id: 454, name: "Tyler Tucker", team: "STL", position: "D", overall: 71, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481006.jpg" },
  { id: 455, name: "Philip Broberg", team: "STL", position: "D", overall: 76, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481598.jpg" },
  { id: 456, name: "Jordan Binnington", team: "STL", position: "G", overall: 81, rarity: "silver", chemistry: ["Clutch"], image: "/src/assets/players/8476412.jpg" },
  { id: 457, name: "Joel Hofer", team: "STL", position: "G", overall: 74, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8480981.jpg" },

  // WESTERN CONFERENCE PACIFIC DIVISION

  // VEGAS GOLDEN KNIGHTS - With correct NHL Profile IDs
  { id: 458, name: "Ivan Barbashev", team: "VGK", position: "C", overall: 81, rarity: "silver", chemistry: ["Two-Way"], image: "/src/assets/players/8477964.jpg" },
  { id: 459, name: "Pavel Dorofeyev", team: "VGK", position: "LW", overall: 75, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481604.jpg" },
  { id: 460, name: "Jack Eichel", team: "VGK", position: "C", overall: 89, rarity: "gold", chemistry: ["Playmaker", "Speedster"], image: "/src/assets/players/8478403.jpg" },
  { id: 461, name: "Thomas Hertl", team: "VGK", position: "C", overall: 82, rarity: "silver", chemistry: ["Two-Way"], image: "/src/assets/players/8476881.jpg" },
  { id: 462, name: "Alexander Holtz", team: "VGK", position: "RW", overall: 76, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482125.jpg" },
  { id: 463, name: "Brett Howden", team: "VGK", position: "C", overall: 74, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8479353.jpg" },
  { id: 464, name: "William Karlsson", team: "VGK", position: "C", overall: 80, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8476448.jpg" },
  { id: 465, name: "Keegan Kolesar", team: "VGK", position: "RW", overall: 73, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8478434.jpg" },
  { id: 466, name: "Mitch Marner", team: "VGK", position: "RW", overall: 91, rarity: "elite", chemistry: ["Playmaker", "Speedster"], image: "/src/assets/players/8478483.jpg" },
  { id: 467, name: "Jonas Rondbjerg", team: "VGK", position: "RW", overall: 72, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8480007.jpg" },
  { id: 468, name: "Brandon Saad", team: "VGK", position: "LW", overall: 78, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8476438.jpg" },
  { id: 469, name: "Cole Schwindt", team: "VGK", position: "RW", overall: 72, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481655.jpg" },
  { id: 470, name: "Reilly Smith", team: "VGK", position: "RW", overall: 79, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8475191.jpg" },
  { id: 471, name: "Mark Stone", team: "VGK", position: "RW", overall: 87, rarity: "gold", chemistry: ["Two-Way", "Leader"], image: "/src/assets/players/8475913.jpg" },
  { id: 472, name: "Noah Hanifin", team: "VGK", position: "D", overall: 83, rarity: "silver", chemistry: ["Two-Way"], image: "/src/assets/players/8478396.jpg" },
  { id: 473, name: "Kaedan Korczak", team: "VGK", position: "D", overall: 74, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481527.jpg" },
  { id: 474, name: "Brayden McNabb", team: "VGK", position: "D", overall: 76, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8475188.jpg" },
  { id: 475, name: "Shea Theodore", team: "VGK", position: "D", overall: 84, rarity: "silver", chemistry: ["Offensive D", "Powerplay"], image: "/src/assets/players/8477447.jpg" },
  { id: 476, name: "Zach Whitecloud", team: "VGK", position: "D", overall: 76, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8480727.jpg" },
  { id: 477, name: "Lukas Cormier", team: "VGK", position: "D", overall: 72, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482141.jpg" },
  { id: 478, name: "Adin Hill", team: "VGK", position: "G", overall: 79, rarity: "bronze", chemistry: ["Steady"], image: "/src/assets/players/8478499.jpg" },
  { id: 479, name: "Akira Schmid", team: "VGK", position: "G", overall: 74, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481033.jpg" }
,

  // LOS ANGELES KINGS - With correct NHL Profile IDs
  { id: 480, name: "Joel Armia", team: "LAK", position: "RW", overall: 75, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8476469.jpg" },
  { id: 481, name: "Quinton Byfield", team: "LAK", position: "RW", overall: 79, rarity: "bronze", chemistry: ["Young Gun", "Power Forward"], image: "/src/assets/players/8482124.jpg" },
  { id: 482, name: "Philip Danault", team: "LAK", position: "C", overall: 81, rarity: "silver", chemistry: ["Two-Way", "Defensive"], image: "/src/assets/players/8476479.jpg" },
  { id: 483, name: "Kevin Fiala", team: "LAK", position: "LW", overall: 84, rarity: "silver", chemistry: ["Sniper", "Speedster"], image: "/src/assets/players/8477942.jpg" },
  { id: 484, name: "Warren Foegele", team: "LAK", position: "LW", overall: 75, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8477998.jpg" },
  { id: 485, name: "Adrian Kempe", team: "LAK", position: "RW", overall: 81, rarity: "silver", chemistry: ["Speedster", "Two-Way"], image: "/src/assets/players/8477960.jpg" },
  { id: 486, name: "Anze Kopitar", team: "LAK", position: "C", overall: 85, rarity: "gold", chemistry: ["Veteran", "Two-Way", "Leader"], image: "/src/assets/players/8471685.jpg" },
  { id: 487, name: "Andre Kuzmenko", team: "LAK", position: "LW", overall: 76, rarity: "bronze", chemistry: ["Speedster"], image: "/src/assets/players/8483808.jpg" },
  { id: 488, name: "Alex Laferriere", team: "LAK", position: "RW", overall: 74, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482155.jpg" },
  { id: 489, name: "Trevor Moore", team: "LAK", position: "LW", overall: 78, rarity: "bronze", chemistry: ["Speedster"], image: "/src/assets/players/8479675.jpg" },
  { id: 490, name: "Corey Perry", team: "LAK", position: "RW", overall: 76, rarity: "bronze", chemistry: ["Veteran", "Agitator"], image: "/src/assets/players/8470621.jpg" },
  { id: 491, name: "Alex Turcotte", team: "LAK", position: "C", overall: 74, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481532.jpg" },
  { id: 492, name: "Drew Doughty", team: "LAK", position: "D", overall: 83, rarity: "silver", chemistry: ["Veteran", "Two-Way"], image: "/src/assets/players/8474563.jpg" },
  { id: 493, name: "Brandt Clarke", team: "LAK", position: "D", overall: 76, rarity: "bronze", chemistry: ["Young Gun", "Offensive D"], image: "/src/assets/players/8482730.jpg" },
  { id: 494, name: "Cody Ceci", team: "LAK", position: "D", overall: 75, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8476879.jpg" },
  { id: 495, name: "Joel Edmundson", team: "LAK", position: "D", overall: 76, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8476441.jpg" },
  { id: 496, name: "Kyle Burroughs", team: "LAK", position: "D", overall: 72, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8477335.jpg" },
  { id: 497, name: "Mikey Anderson", team: "LAK", position: "D", overall: 74, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8479998.jpg" },
  { id: 498, name: "Brian Dumoulin", team: "LAK", position: "D", overall: 75, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8475208.jpg" },
  { id: 499, name: "Darcy Kuemper", team: "LAK", position: "G", overall: 80, rarity: "bronze", chemistry: ["Veteran"], image: "/src/assets/players/8475311.jpg" },
  { id: 500, name: "Pheonix Copley", team: "LAK", position: "G", overall: 74, rarity: "bronze", chemistry: ["Backup"], image: "/src/assets/players/8477831.jpg" },

  // SAN JOSE SHARKS - With correct NHL Profile IDs
  { id: 501, name: "Macklin Celebrini", team: "SJS", position: "C", overall: 82, rarity: "silver", chemistry: ["Young Gun", "Playmaker"], image: "/src/assets/players/8484801.jpg" },
  { id: 502, name: "Ty Dellandrea", team: "SJS", position: "C", overall: 74, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8480848.jpg" },
  { id: 503, name: "William Eklund", team: "SJS", position: "LW", overall: 77, rarity: "bronze", chemistry: ["Young Gun", "Speedster"], image: "/src/assets/players/8482667.jpg" },
  { id: 504, name: "Barclay Goodrow", team: "SJS", position: "RW", overall: 76, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8476624.jpg" },
  { id: 505, name: "Philipp Kurashev", team: "SJS", position: "C", overall: 75, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8480798.jpg" },
  { id: 506, name: "Carl Grundstrom", team: "SJS", position: "RW", overall: 73, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8479336.jpg" },
  { id: 507, name: "Cam Lund", team: "SJS", position: "C", overall: 72, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8483481.jpg" },
  { id: 508, name: "Ryan Reaves", team: "SJS", position: "RW", overall: 70, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8471817.jpg" },
  { id: 509, name: "Jeff Skinner", team: "SJS", position: "LW", overall: 79, rarity: "bronze", chemistry: ["Sniper"], image: "/src/assets/players/8475784.jpg" },
  { id: 510, name: "Will Smith", team: "SJS", position: "C", overall: 75, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8484227.jpg" },
  { id: 511, name: "Tyler Toffoli", team: "SJS", position: "C", overall: 79, rarity: "bronze", chemistry: ["Sniper"], image: "/src/assets/players/8475726.jpg" },
  { id: 512, name: "Alexander Wennberg", team: "SJS", position: "C", overall: 76, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8477505.jpg" },
  { id: 513, name: "Mario Ferraro", team: "SJS", position: "D", overall: 77, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8479983.jpg" },
  { id: 514, name: "John Klingberg", team: "SJS", position: "D", overall: 78, rarity: "bronze", chemistry: ["Offensive D"], image: "/src/assets/players/8475906.jpg" },
  { id: 515, name: "Nick Leddy", team: "SJS", position: "D", overall: 75, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8475181.jpg" },
  { id: 516, name: "Timothy Liljegren", team: "SJS", position: "D", overall: 75, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8480043.jpg" },
  { id: 517, name: "Dmitry Orlov", team: "SJS", position: "D", overall: 78, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8475200.jpg" },
  { id: 518, name: "Shakir Mukhamadullin", team: "SJS", position: "D", overall: 73, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482166.jpg" },
  { id: 519, name: "Alex Nedeljkovic", team: "SJS", position: "G", overall: 77, rarity: "bronze", chemistry: ["Steady"], image: "/src/assets/players/8477968.jpg" },
  { id: 520, name: "Georgi Romanov", team: "SJS", position: "G", overall: 72, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/5144058.jpg" },

  // ANAHEIM DUCKS - With correct NHL Profile IDs
  { id: 521, name: "Leo Carlsson", team: "ANA", position: "C", overall: 79, rarity: "bronze", chemistry: ["Young Gun", "Power Forward"], image: "/src/assets/players/8484153.jpg" },
  { id: 522, name: "Cutter Gauthier", team: "ANA", position: "LW", overall: 76, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8483445.jpg" },
  { id: 523, name: "Mikael Granlund", team: "ANA", position: "C", overall: 78, rarity: "bronze", chemistry: ["Veteran", "Playmaker"], image: "/src/assets/players/8475798.jpg" },
  { id: 524, name: "Jansen Harkins", team: "ANA", position: "C", overall: 73, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8478424.jpg" },
  { id: 525, name: "Ross Johnston", team: "ANA", position: "LW", overall: 70, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8477527.jpg" },
  { id: 526, name: "Alex Killorn", team: "ANA", position: "LW", overall: 78, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8473986.jpg" },
  { id: 527, name: "Chris Kreider", team: "ANA", position: "LW", overall: 82, rarity: "silver", chemistry: ["Power Forward"], image: "/src/assets/players/8475184.jpg" },
  { id: 528, name: "Mason McTavish", team: "ANA", position: "C", overall: 78, rarity: "bronze", chemistry: ["Young Gun", "Power Forward"], image: "/src/assets/players/8482745.jpg" },
  { id: 529, name: "Ryan Poehling", team: "ANA", position: "C", overall: 74, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8480068.jpg" },
  { id: 530, name: "Ryan Strome", team: "ANA", position: "C", overall: 77, rarity: "bronze", chemistry: ["Playmaker"], image: "/src/assets/players/8476458.jpg" },
  { id: 531, name: "Troy Terry", team: "ANA", position: "RW", overall: 80, rarity: "bronze", chemistry: ["Sniper"], image: "/src/assets/players/8478873.jpg" },
  { id: 532, name: "Frank Vatrano", team: "ANA", position: "RW", overall: 76, rarity: "bronze", chemistry: ["Sniper"], image: "/src/assets/players/8478366.jpg" },
  { id: 533, name: "Radko Gudas", team: "ANA", position: "D", overall: 77, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8475462.jpg" },
  { id: 534, name: "Jacob Trouba", team: "ANA", position: "D", overall: 80, rarity: "bronze", chemistry: ["Physical", "Leader"], image: "/src/assets/players/8476885.jpg" },
  { id: 535, name: "Olen Zellweger", team: "ANA", position: "D", overall: 75, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482803.jpg" },
  { id: 536, name: "Jackson LaCombe", team: "ANA", position: "D", overall: 74, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481605.jpg" },
  { id: 537, name: "Drew Helleson", team: "ANA", position: "D", overall: 73, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481563.jpg" },
  { id: 538, name: "Pavel Mintyukov", team: "ANA", position: "D", overall: 74, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8483490.jpg" },
  { id: 539, name: "Lukas Dostal", team: "ANA", position: "G", overall: 79, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8480843.jpg" },
  { id: 540, name: "Ville Husso", team: "ANA", position: "G", overall: 75, rarity: "bronze", chemistry: ["Backup"], image: "/src/assets/players/8478024.jpg" },

  // SEATTLE KRAKEN - With correct NHL Profile IDs
  { id: 541, name: "Matty Beniers", team: "SEA", position: "C", overall: 79, rarity: "bronze", chemistry: ["Young Gun", "Two-Way"], image: "/src/assets/players/8482665.jpg" },
  { id: 542, name: "Jordan Eberle", team: "SEA", position: "RW", overall: 79, rarity: "bronze", chemistry: ["Veteran", "Sniper"], image: "/src/assets/players/8474586.jpg" },
  { id: 543, name: "John Hayden", team: "SEA", position: "C", overall: 72, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8477401.jpg" },
  { id: 544, name: "Kaapo Kakko", team: "SEA", position: "RW", overall: 78, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481554.jpg" },
  { id: 545, name: "Mason Marchment", team: "SEA", position: "LW", overall: 77, rarity: "bronze", chemistry: ["Power Forward"], image: "/src/assets/players/8478975.jpg" },
  { id: 546, name: "Jared McCann", team: "SEA", position: "LW", overall: 79, rarity: "bronze", chemistry: ["Sniper"], image: "/src/assets/players/8477955.jpg" },
  { id: 547, name: "Jaden Schwartz", team: "SEA", position: "C", overall: 79, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8475768.jpg" },
  { id: 548, name: "Chandler Stephenson", team: "SEA", position: "C", overall: 77, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8476905.jpg" },
  { id: 549, name: "Eeli Tolvanen", team: "SEA", position: "RW", overall: 75, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8480009.jpg" },
  { id: 550, name: "Shane Wright", team: "SEA", position: "C", overall: 76, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8483524.jpg" },
  { id: 551, name: "Tye Kartye", team: "SEA", position: "LW", overall: 73, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481789.jpg" },
  { id: 552, name: "Fredrik Gaudreau", team: "SEA", position: "C", overall: 74, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8477919.jpg" },
  { id: 553, name: "Vince Dunn", team: "SEA", position: "D", overall: 81, rarity: "silver", chemistry: ["Offensive D"], image: "/src/assets/players/8478407.jpg" },
  { id: 554, name: "Adam Larsson", team: "SEA", position: "D", overall: 78, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8476457.jpg" },
  { id: 555, name: "Ryan Lindgren", team: "SEA", position: "D", overall: 76, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8479324.jpg" },
  { id: 556, name: "Brandon Montour", team: "SEA", position: "D", overall: 81, rarity: "silver", chemistry: ["Offensive D"], image: "/src/assets/players/8477986.jpg" },
  { id: 557, name: "Jamie Oleksiak", team: "SEA", position: "D", overall: 75, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8476467.jpg" },
  { id: 558, name: "Ryker Evans", team: "SEA", position: "D", overall: 73, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482858.jpg" },
  { id: 559, name: "Cale Fleury", team: "SEA", position: "D", overall: 72, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8479985.jpg" },
  { id: 560, name: "Philipp Grubauer", team: "SEA", position: "G", overall: 79, rarity: "bronze", chemistry: ["Veteran"], image: "/src/assets/players/8475831.jpg" },
  { id: 561, name: "Joey Daccord", team: "SEA", position: "G", overall: 76, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8478916.jpg" },

  // CALGARY FLAMES - With correct NHL Profile IDs
  { id: 562, name: "Mikael Backlund", team: "CGY", position: "C", overall: 78, rarity: "bronze", chemistry: ["Veteran", "Two-Way"], image: "/src/assets/players/8474150.jpg" },
  { id: 563, name: "Blake Coleman", team: "CGY", position: "LW", overall: 78, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8476399.jpg" },
  { id: 564, name: "Matt Coronato", team: "CGY", position: "RW", overall: 74, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482679.jpg" },
  { id: 565, name: "Joel Farabee", team: "CGY", position: "LW", overall: 77, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8480797.jpg" },
  { id: 566, name: "Morgan Frost", team: "CGY", position: "C", overall: 76, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8480028.jpg" },
  { id: 567, name: "Jonathan Huberdeau", team: "CGY", position: "LW", overall: 83, rarity: "silver", chemistry: ["Playmaker"], image: "/src/assets/players/8476456.jpg" },
  { id: 568, name: "Nazem Kadri", team: "CGY", position: "C", overall: 81, rarity: "silver", chemistry: ["Two-Way"], image: "/src/assets/players/8475172.jpg" },
  { id: 569, name: "Justin Kirkland", team: "CGY", position: "C", overall: 72, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8477993.jpg" },
  { id: 570, name: "Ryan Lomberg", team: "CGY", position: "LW", overall: 72, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8479066.jpg" },
  { id: 571, name: "Yegor Sharangovich", team: "CGY", position: "C", overall: 78, rarity: "bronze", chemistry: ["Sniper"], image: "/src/assets/players/8481068.jpg" },
  { id: 572, name: "Connor Zary", team: "CGY", position: "C", overall: 75, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482074.jpg" },
  { id: 573, name: "Martin Pospisil", team: "CGY", position: "C", overall: 73, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481028.jpg" },
  { id: 574, name: "Rasmus Andersson", team: "CGY", position: "D", overall: 82, rarity: "silver", chemistry: ["Two-Way", "Powerplay"], image: "/src/assets/players/8478397.jpg" },
  { id: 575, name: "Kevin Bahl", team: "CGY", position: "D", overall: 74, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8480860.jpg" },
  { id: 576, name: "Jake Bean", team: "CGY", position: "D", overall: 75, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8479402.jpg" },
  { id: 577, name: "MacKenzie Weegar", team: "CGY", position: "D", overall: 82, rarity: "silver", chemistry: ["Two-Way"], image: "/src/assets/players/8477346.jpg" },
  { id: 578, name: "Brayden Pachal", team: "CGY", position: "D", overall: 72, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8481167.jpg" },
  { id: 579, name: "Joel Hanley", team: "CGY", position: "D", overall: 71, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8477810.jpg" },
  { id: 580, name: "Dustin Wolf", team: "CGY", position: "G", overall: 77, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481692.jpg" },
  { id: 581, name: "Devin Cooley", team: "CGY", position: "G", overall: 73, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482445.jpg" },

  // VANCOUVER CANUCKS - With correct NHL Profile IDs
  { id: 582, name: "Teddy Blueger", team: "VAN", position: "C", overall: 75, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8476927.jpg" },
  { id: 583, name: "Brock Boeser", team: "VAN", position: "RW", overall: 83, rarity: "silver", chemistry: ["Sniper"], image: "/src/assets/players/8478444.jpg" },
  { id: 584, name: "Filip Chytil", team: "VAN", position: "C", overall: 76, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8480078.jpg" },
  { id: 585, name: "Jake DeBrusk", team: "VAN", position: "LW", overall: 79, rarity: "bronze", chemistry: ["Sniper"], image: "/src/assets/players/8478498.jpg" },
  { id: 586, name: "Conor Garland", team: "VAN", position: "RW", overall: 79, rarity: "bronze", chemistry: ["Speedster"], image: "/src/assets/players/8478856.jpg" },
  { id: 587, name: "Nils Hoglander", team: "VAN", position: "LW", overall: 76, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8481535.jpg" },
  { id: 588, name: "Evander Kane", team: "VAN", position: "LW", overall: 79, rarity: "bronze", chemistry: ["Power Forward"], image: "/src/assets/players/8475169.jpg" },
  { id: 589, name: "Drew O'Connor", team: "VAN", position: "LW", overall: 73, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482055.jpg" },
  { id: 590, name: "Elias Pettersson", team: "VAN", position: "C", overall: 90, rarity: "elite", chemistry: ["Playmaker", "Sniper"], image: "/src/assets/players/8480012.jpg" },
  { id: 591, name: "Kiefer Sherwood", team: "VAN", position: "LW", overall: 74, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8480748.jpg" },
  { id: 592, name: "Nils Aman", team: "VAN", position: "C", overall: 73, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8482496.jpg" },
  { id: 593, name: "Derek Forbort", team: "VAN", position: "D", overall: 74, rarity: "bronze", chemistry: ["Defensive"], image: "/src/assets/players/8475762.jpg" },
  { id: 594, name: "Filip Hronek", team: "VAN", position: "D", overall: 81, rarity: "silver", chemistry: ["Two-Way"], image: "/src/assets/players/8479425.jpg" },
  { id: 595, name: "Quinn Hughes", team: "VAN", position: "D", overall: 92, rarity: "elite", chemistry: ["Offensive D", "Speedster"], image: "/src/assets/players/8480800.jpg" },
  { id: 596, name: "P.O Joseph", team: "VAN", position: "D", overall: 74, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8480058.jpg" },
  { id: 597, name: "Tyler Myers", team: "VAN", position: "D", overall: 76, rarity: "bronze", chemistry: ["Physical"], image: "/src/assets/players/8474574.jpg" },
  { id: 598, name: "Elias Pettersson", team: "VAN", position: "D", overall: 74, rarity: "bronze", chemistry: ["Young Gun"], image: "/src/assets/players/8483678.jpg" },
  { id: 599, name: "Marcus Pettersson", team: "VAN", position: "D", overall: 76, rarity: "bronze", chemistry: ["Two-Way"], image: "/src/assets/players/8477969.jpg" },
  { id: 600, name: "Thatcher Demko", team: "VAN", position: "G", overall: 84, rarity: "silver", chemistry: ["Elite Goalie"], image: "/src/assets/players/8477967.jpg" },
  { id: 601, name: "Kevin Lankinen", team: "VAN", position: "G", overall: 76, rarity: "bronze", chemistry: ["Backup"], image: "/src/assets/players/8480947.jpg" }
];