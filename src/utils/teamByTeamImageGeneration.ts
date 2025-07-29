// Team-by-team systematic image generation for all NHL players
import { Player } from "@/data/nhlPlayerDatabase";

// All 32 NHL teams with their roster URLs and colors
export const NHL_TEAMS = {
  'Florida Panthers': {
    url: 'https://www.nhl.com/panthers/roster',
    colors: { primary: '#041E42', secondary: '#C8102E', accent: '#B9975B' },
    jerseyDesc: 'red and navy Panthers jersey'
  },
  'Tampa Bay Lightning': {
    url: 'https://www.nhl.com/lightning/roster',
    colors: { primary: '#002868', secondary: '#FFFFFF', accent: '#000000' },
    jerseyDesc: 'blue and white Lightning jersey'
  },
  'Toronto Maple Leafs': {
    url: 'https://www.nhl.com/mapleleafs/roster',
    colors: { primary: '#003E7E', secondary: '#FFFFFF', accent: '#000000' },
    jerseyDesc: 'blue and white Maple Leafs jersey'
  },
  'Boston Bruins': {
    url: 'https://www.nhl.com/bruins/roster',
    colors: { primary: '#FFB81C', secondary: '#000000', accent: '#FFFFFF' },
    jerseyDesc: 'black and gold Bruins jersey'
  },
  'New York Rangers': {
    url: 'https://www.nhl.com/rangers/roster',
    colors: { primary: '#0038A8', secondary: '#CE1126', accent: '#FFFFFF' },
    jerseyDesc: 'blue and red Rangers jersey'
  },
  'Carolina Hurricanes': {
    url: 'https://www.nhl.com/hurricanes/roster',
    colors: { primary: '#CC0000', secondary: '#000000', accent: '#A2AAAD' },
    jerseyDesc: 'red and black Hurricanes jersey'
  },
  'New Jersey Devils': {
    url: 'https://www.nhl.com/devils/roster',
    colors: { primary: '#CE1126', secondary: '#000000', accent: '#FFFFFF' },
    jerseyDesc: 'red and black Devils jersey'
  },
  'New York Islanders': {
    url: 'https://www.nhl.com/islanders/roster',
    colors: { primary: '#00539B', secondary: '#F47D30', accent: '#FFFFFF' },
    jerseyDesc: 'blue and orange Islanders jersey'
  },
  'Pittsburgh Penguins': {
    url: 'https://www.nhl.com/penguins/roster',
    colors: { primary: '#000000', secondary: '#FCB514', accent: '#FFFFFF' },
    jerseyDesc: 'black and gold Penguins jersey'
  },
  'Washington Capitals': {
    url: 'https://www.nhl.com/capitals/roster',
    colors: { primary: '#041E42', secondary: '#C8102E', accent: '#FFFFFF' },
    jerseyDesc: 'red and navy Capitals jersey'
  },
  'Philadelphia Flyers': {
    url: 'https://www.nhl.com/flyers/roster',
    colors: { primary: '#F74902', secondary: '#000000', accent: '#FFFFFF' },
    jerseyDesc: 'orange and black Flyers jersey'
  },
  'Buffalo Sabres': {
    url: 'https://www.nhl.com/sabres/roster',
    colors: { primary: '#003087', secondary: '#FFB81C', accent: '#FFFFFF' },
    jerseyDesc: 'blue and gold Sabres jersey'
  },
  'Columbus Blue Jackets': {
    url: 'https://www.nhl.com/bluejackets/roster',
    colors: { primary: '#002654', secondary: '#CE1126', accent: '#A2AAAD' },
    jerseyDesc: 'blue and red Blue Jackets jersey'
  },
  'Ottawa Senators': {
    url: 'https://www.nhl.com/senators/roster',
    colors: { primary: '#CE1126', secondary: '#C2912C', accent: '#000000' },
    jerseyDesc: 'red and gold Senators jersey'
  },
  'Detroit Red Wings': {
    url: 'https://www.nhl.com/redwings/roster',
    colors: { primary: '#CE1126', secondary: '#FFFFFF', accent: '#000000' },
    jerseyDesc: 'red and white Red Wings jersey'
  },
  'Montreal Canadiens': {
    url: 'https://www.nhl.com/canadiens/roster',
    colors: { primary: '#AF1E2D', secondary: '#192168', accent: '#FFFFFF' },
    jerseyDesc: 'red and blue Canadiens jersey'
  },
  'Edmonton Oilers': {
    url: 'https://www.nhl.com/oilers/roster',
    colors: { primary: '#041E42', secondary: '#FF4C00', accent: '#FFFFFF' },
    jerseyDesc: 'blue and orange Oilers jersey'
  },
  'Calgary Flames': {
    url: 'https://www.nhl.com/flames/roster',
    colors: { primary: '#C8102E', secondary: '#F1BE48', accent: '#000000' },
    jerseyDesc: 'red and yellow Flames jersey'
  },
  'Vancouver Canucks': {
    url: 'https://www.nhl.com/canucks/roster',
    colors: { primary: '#001F5B', secondary: '#00843D', accent: '#FFFFFF' },
    jerseyDesc: 'blue and green Canucks jersey'
  },
  'Seattle Kraken': {
    url: 'https://www.nhl.com/kraken/roster',
    colors: { primary: '#001628', secondary: '#99D9D9', accent: '#FFFFFF' },
    jerseyDesc: 'navy and teal Kraken jersey'
  },
  'Winnipeg Jets': {
    url: 'https://www.nhl.com/jets/roster',
    colors: { primary: '#041E42', secondary: '#AC162C', accent: '#FFFFFF' },
    jerseyDesc: 'navy and red Jets jersey'
  },
  'Minnesota Wild': {
    url: 'https://www.nhl.com/wild/roster',
    colors: { primary: '#154734', secondary: '#A6192E', accent: '#EAAA00' },
    jerseyDesc: 'green and red Wild jersey'
  },
  'Colorado Avalanche': {
    url: 'https://www.nhl.com/avalanche/roster',
    colors: { primary: '#6F263D', secondary: '#236192', accent: '#A2AAAD' },
    jerseyDesc: 'burgundy and blue Avalanche jersey'
  },
  'St. Louis Blues': {
    url: 'https://www.nhl.com/blues/roster',
    colors: { primary: '#002F87', secondary: '#FCB514', accent: '#FFFFFF' },
    jerseyDesc: 'blue and gold Blues jersey'
  },
  'Nashville Predators': {
    url: 'https://www.nhl.com/predators/roster',
    colors: { primary: '#FFB81C', secondary: '#041E42', accent: '#FFFFFF' },
    jerseyDesc: 'gold and navy Predators jersey'
  },
  'Dallas Stars': {
    url: 'https://www.nhl.com/stars/roster',
    colors: { primary: '#006847', secondary: '#8F8F8C', accent: '#000000' },
    jerseyDesc: 'green and silver Stars jersey'
  },
  'Chicago Blackhawks': {
    url: 'https://www.nhl.com/blackhawks/roster',
    colors: { primary: '#CF0A2C', secondary: '#000000', accent: '#FFD100' },
    jerseyDesc: 'red and black Blackhawks jersey'
  },
  'Arizona Coyotes': {
    url: 'https://www.nhl.com/coyotes/roster',
    colors: { primary: '#8C2633', secondary: '#E2D6B5', accent: '#000000' },
    jerseyDesc: 'burgundy and sand Coyotes jersey'
  },
  'Las Vegas Golden Knights': {
    url: 'https://www.nhl.com/goldenknights/roster',
    colors: { primary: '#B4975A', secondary: '#333F42', accent: '#C8102E' },
    jerseyDesc: 'gold and gray Golden Knights jersey'
  },
  'Los Angeles Kings': {
    url: 'https://www.nhl.com/kings/roster',
    colors: { primary: '#111111', secondary: '#A2AAAD', accent: '#FFFFFF' },
    jerseyDesc: 'black and silver Kings jersey'
  },
  'Anaheim Ducks': {
    url: 'https://www.nhl.com/ducks/roster',
    colors: { primary: '#F47A38', secondary: '#B09862', accent: '#000000' },
    jerseyDesc: 'orange and gold Ducks jersey'
  },
  'San Jose Sharks': {
    url: 'https://www.nhl.com/sharks/roster',
    colors: { primary: '#006D75', secondary: '#EA7200', accent: '#000000' },
    jerseyDesc: 'teal and orange Sharks jersey'
  }
};

// Panthers roster from the fetched data
export const PANTHERS_ROSTER = [
  // Forwards
  { name: 'Aleksander Barkov', position: 'C', number: '16' },
  { name: 'Sam Bennett', position: 'C', number: '9' },
  { name: 'Jesper Boqvist', position: 'C', number: '70' },
  { name: 'Nolan Foote', position: 'LW', number: '--' },
  { name: 'Jonah Gadjovich', position: 'LW', number: '12' },
  { name: 'A.J. Greer', position: 'LW', number: '10' },
  { name: 'Anton Lundell', position: 'C', number: '15' },
  { name: 'Eetu Luostarinen', position: 'C', number: '27' },
  { name: 'Brad Marchand', position: 'C', number: '63' },
  { name: 'Tomas Nosek', position: 'LW', number: '92' },
  { name: 'Sam Reinhart', position: 'C', number: '13' },
  { name: 'Evan Rodrigues', position: 'C', number: '17' },
  { name: 'Mackie Samoskevich', position: 'RW', number: '25' },
  { name: 'Jack Studnicka', position: 'C', number: '--' },
  { name: 'Matthew Tkachuk', position: 'LW', number: '19' },
  { name: 'Carter Verhaeghe', position: 'C', number: '23' },
  
  // Defensemen
  { name: 'Uvis Balinskis', position: 'D', number: '26' },
  { name: 'Tobias Bjornfot', position: 'D', number: '2' },
  { name: 'Aaron Ekblad', position: 'D', number: '5' },
  { name: 'Gustav Forsling', position: 'D', number: '42' },
  { name: 'Seth Jones', position: 'D', number: '3' },
  { name: 'Dmitry Kulikov', position: 'D', number: '7' },
  { name: 'Niko Mikkola', position: 'D', number: '77' },
  { name: 'Jeff Petry', position: 'D', number: '--' },
  
  // Goalies
  { name: 'Sergei Bobrovsky', position: 'G', number: '72' },
  { name: 'Daniil Tarasov', position: 'G', number: '--' }
];

// Lightning roster from the fetched data
export const LIGHTNING_ROSTER = [
  // Forwards
  { name: 'Nick Abruzzese', position: 'C', number: '6' },
  { name: 'Oliver Bjorkstrand', position: 'RW', number: '22' },
  { name: 'Mitchell Chaffee', position: 'RW', number: '41' },
  { name: 'Anthony Cirelli', position: 'C', number: '71' },
  { name: 'Zemgus Girgensons', position: 'C', number: '28' },
  { name: 'Gage Goncalves', position: 'C', number: '93' },
  { name: 'Yanni Gourde', position: 'C', number: '37' },
  { name: 'Jake Guentzel', position: 'C', number: '59' },
  { name: 'Brandon Hagel', position: 'LW', number: '38' },
  { name: 'Pontus Holmberg', position: 'RW', number: '29' },
  { name: 'Nikita Kucherov', position: 'RW', number: '86' },
  { name: 'Nick Paul', position: 'LW', number: '20' },
  { name: 'Jakob Pelletier', position: 'LW', number: '12' },
  { name: 'Brayden Point', position: 'C', number: '21' },
  
  // Defensemen
  { name: 'Erik Cernak', position: 'D', number: '81' },
  { name: 'Victor Hedman', position: 'D', number: '77' },
  { name: 'Emil Lilleberg', position: 'D', number: '78' },
  { name: 'Ryan McDonagh', position: 'D', number: '27' },
  { name: 'J.J. Moser', position: 'D', number: '90' },
  { name: 'Darren Raddysh', position: 'D', number: '43' },
  
  // Goalies
  { name: 'Jonas Johansson', position: 'G', number: '31' },
  { name: 'Andrei Vasilevskiy', position: 'G', number: '88' }
];

// Generate professional NHL player image prompt
export const generatePlayerPrompt = (playerName: string, position: string, team: string): string => {
  const teamInfo = NHL_TEAMS[team as keyof typeof NHL_TEAMS];
  const jerseyDesc = teamInfo?.jerseyDesc || 'team jersey';
  
  const positionDetails = {
    'C': 'center',
    'LW': 'left winger', 
    'RW': 'right winger',
    'D': 'defenseman',
    'G': 'goaltender'
  };
  
  const positionDesc = positionDetails[position as keyof typeof positionDetails] || 'player';
  
  return `Professional NHL hockey player headshot photo of ${playerName}, ${positionDesc} for ${team}. Clean hockey helmet-free portrait, professional lighting, realistic photography style, wearing ${jerseyDesc}, confident athletic expression, high quality sports photography, studio lighting setup. Ultra high resolution, non-AI generated appearance.`;
};

// Clean player name for file naming
export const cleanPlayerName = (name: string): string => {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/--+/g, '-');
};

// Priority teams to process first (popular/high-visibility teams)
export const PRIORITY_TEAMS = [
  'Toronto Maple Leafs',
  'Boston Bruins', 
  'New York Rangers',
  'Florida Panthers',
  'Tampa Bay Lightning',
  'Edmonton Oilers',
  'Colorado Avalanche',
  'Vegas Golden Knights',
  'Pittsburgh Penguins',
  'Washington Capitals'
];

export const generateTeamImages = async (teamName: string, roster: any[]) => {
  console.log(`Starting image generation for ${teamName}...`);
  
  for (const player of roster) {
    const cleanName = cleanPlayerName(player.name);
    const imagePath = `src/assets/players/${cleanName}-realistic.jpg`;
    const prompt = generatePlayerPrompt(player.name, player.position, teamName);
    
    console.log(`Generating image for ${player.name} (${player.position}) - ${imagePath}`);
    // This would trigger the actual image generation
    // The implementation would call the generate_image function here
  }
};