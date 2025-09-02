// Utility to update NHL player database with real ages
import { Player } from '@/data/nhlPlayerDatabase';

// Age data from user provided CSV
const playerAges: Record<string, number> = {
  // Boston Bruins
  "Alex Steeves": 25, "Andrew Peeke": 27, "Casey Mittelstadt": 26, "Charlie McAvoy": 27, "David Pastrnak": 29,
  "Elias Lindholm": 30, "Hampus Lindholm": 31, "Henri Jokiharju": 26, "Jeremy Swayman": 26, "John Beecher": 24,
  "Joonas Korpisalo": 31, "Jordan Harris": 25, "Marat Khusnutdinov": 23, "Mark Kastelic": 26, "Mason Lohrei": 24,
  "Mikey Eyssimont": 28, "Morgan Geekie": 27, "Nikita Zadorov": 30, "Pavel Zacha": 28, "Sean Kuraly": 32,
  "Tanner Jeannot": 28, "Viktor Arvidsson": 32,

  // Buffalo Sabres
  "Alex Lyon": 32, "Alex Tuch": 29, "Beck Malenstyn": 27, "Bowen Byram": 24, "Conor Timmins": 26,
  "Devon Levi": 23, "Jack Quinn": 23, "Jacob Bryson": 27, "Jason Zucker": 33, "Jiri Kulich": 21,
  "Jordan Greenway": 28, "Josh Doan": 23, "Josh Norris": 26, "Justin Danforth": 32, "Mattias Samuelsson": 25,
  "Michael Kesselring": 25, "Owen Power": 22, "Peyton Krebs": 24, "Rasmus Dahlin": 25, "Ryan McLeod": 25,
  "Tage Thompson": 27, "Tyson Kozak": 22, "Ukko-Pekka Luukkonen": 26, "Zac Jones": 24, "Zach Benson": 20,

  // Detroit Red Wings
  "Albert Johansson": 24, "Alex DeBrincat": 27, "Andrew Copp": 31, "Ben Chiarot": 34, "Cam Talbot": 38,
  "Carter Mazur": 23, "Dylan Larkin": 29, "Elmer Soderblom": 24, "Erik Gustafsson": 33, "Ian Mitchell": 26,
  "J. T. Compher": 30, "Jacob Bernard-Docker": 25, "James van Riemsdyk": 36, "John Gibson": 32, "Jonatan Berggren": 25,
  "Justin Holl": 33, "Lucas Raymond": 23, "Marco Kasper": 21, "Mason Appleton": 29, "Michael Rasmussen": 26,
  "Moritz Seider": 24, "Patrick Kane": 36, "Simon Edvinsson": 22, "Travis Hamonic": 35, "William Lagesson": 29,

  // Florida Panthers
  "A. J. Greer": 28, "Aaron Ekblad": 29, "Aleksander Barkov": 29, "Anton Lundell": 23, "Brad Marchand": 37,
  "Carter Verhaeghe": 30, "Daniil Tarasov": 26, "Dmitry Kulikov": 34, "Eetu Luostarinen": 26, "Evan Rodrigues": 32,
  "Gustav Forsling": 29, "Jack Studnicka": 26, "Jeff Petry": 37, "Jesper Boqvist": 26, "Jonah Gadjovich": 26,
  "Luke Kunin": 27, "MacKenzie Entwistle": 26, "Mackie Samoskevich": 22, "Matthew Tkachuk": 27, "Michael Benning": 23,
  "Niko Mikkola": 29, "Sam Bennett": 29, "Sam Reinhart": 29, "Sandis Vilmanis": 21, "Sergei Bobrovsky": 36,
  "Seth Jones": 30, "Tobias Bjornfot": 24, "Tomas Nosek": 32, "Uvis Balinskis": 29,

  // Montreal Canadiens
  "Alex Newhook": 24, "Alexandre Carrier": 28, "Brendan Gallagher": 33, "Cole Caufield": 24, "Ivan Demidov": 19,
  "Jake Evans": 29, "Jakub Dobes": 24, "Josh Anderson": 31, "Kaapo Kahkonen": 29, "Kaiden Guhle": 23,
  "Kirby Dach": 24, "Lane Hutson": 21, "Mike Matheson": 31, "Noah Dobson": 25, "Oliver Kapanen": 22,
  "Patrik Laine": 27, "Sam Montembeault": 28, "Sammy Blais": 29, "Zachary Bolduc": 22,

  // Ottawa Senators
  "Arthur Kaliyev": 24, "Artyom Zub": 29, "Brady Tkachuk": 25, "Claude Giroux": 37, "David Perron": 37,
  "Drake Batherson": 27, "Dylan Cozens": 24, "Fabian Zetterlund": 26, "Garrett Pilon": 27, "Hayden Hodgson": 29,
  "Hunter Shepard": 29, "Jake Sanderson": 23, "Jan Jenik": 24, "Lars Eller": 36,
  "Leevi Merilainen": 23, "Linus Ullmark": 32, "Michael Amadio": 29, "Nick Cousins": 32, "Nick Jensen": 34,
  "Nikolas Matinpalo": 26, "Ridly Greig": 23, "Shane Pinto": 24, "Stephen Halliday": 23, "Thomas Chabot": 28,
  "Tim Stutzle": 23, "Tyler Boucher": 22, "Tyler Kleven": 23, "Wyatt Bongiovanni": 26, "Zack MacEwen": 29,

  // Tampa Bay Lightning
  "Andrei Vasilevskiy": 30, "Anthony Cirelli": 28, "Brandon Hagel": 27, "Brayden Point": 29, "Darren Raddysh": 29,
  "Emil Lilleberg": 24, "Erik Cernak": 28, "Gage Goncalves": 24, "J.J. Moser": 25, "Jake Guentzel": 30,
  "Jakob Pelletier": 24, "Jonas Johansson": 29, "Mitchell Chaffee": 27, "Nick Abruzzese": 26, "Nick Paul": 30,
  "Nikita Kucherov": 32, "Oliver Bjorkstrand": 30, "Pontus Holmberg": 26, "Ryan McDonagh": 36, "Victor Hedman": 34,
  "Yanni Gourde": 33, "Zemgus Girgensons": 31,

  // Toronto Maple Leafs
  "Anthony Stolarz": 31, "Artur Akhtyamov": 23, "Auston Matthews": 27, "Bobby McMann": 29, "Brandon Carlo": 28,
  "Cade Webber": 24, "Calle Jarnkrok": 33, "Christopher Tanev": 35, "Dakota Joshua": 29, "Dakota Mermis": 31,
  "David Kampf": 30, "Dennis Hildeby": 24, "Henry Thrun": 24, "Jacob Quillan": 23, "Jake McCabe": 31,
  "John Tavares": 34, "Joseph Woll": 27, "Marshall Rifai": 27, "Matias Maccelli": 24, "Matt Benning": 31,
  "Matthew Knies": 22, "Max Domi": 30, "Michael Pezzetta": 27, "Morgan Rielly": 31, "Nicholas Robertson": 23,
  "Nicolas Roy": 28, "Oliver Ekman-Larsson": 34, "Philippe Myers": 28, "Scott Laughton": 31, "Simon Benoit": 26,
  "Steven Lorentz": 29, "Travis Boyd": 31, "William Nylander": 29, "William Villeneuve": 23,

  // Carolina Hurricanes
  "Andrei Svechnikov": 25, "Brady Skjei": 31, "Brent Burns": 40, "Frederik Andersen": 35, "Jaccob Slavin": 31,
  "Jesperi Kotkaniemi": 25, "Jordan Staal": 36, "Martin Necas": 26, "Michael Bunting": 30, "Pyotr Kochetkov": 26,
  "Sebastian Aho": 28, "Seth Jarvis": 23, "Teuvo Teravainen": 31,

  // Columbus Blue Jackets
  "Adam Fantilli": 21, "Alexandre Texier": 26, "Cole Sillinger": 22, "Damon Severson": 31, "Elvis Merzlikins": 31,
  "Johnny Gaudreau": 32, "Kent Johnson": 23, "Kirill Marchenko": 25, "Zach Werenski": 28,

  // New Jersey Devils
  "Dougie Hamilton": 32, "Jack Hughes": 24, "Jesper Bratt": 27, "Luke Hughes": 21, "Nico Hischier": 26,
  "Ondrej Palat": 34, "Simon Nemec": 21, "Timo Meier": 29, "Tyler Toffoli": 33, "Vitek Vanecek": 29,

  // New York Islanders
  "Alexander Romanov": 26, "Anders Lee": 35, "Bo Horvat": 30, "Brock Nelson": 33, "Ilya Sorokin": 30,
  "Kyle Palmieri": 34, "Mathew Barzal": 28, "Ryan Pulock": 30, "Semyon Varlamov": 37,

  // New York Rangers
  "Adam Fox": 27, "Alexis Lafreniere": 23, "Artemi Panarin": 33, "Chris Kreider": 34, "Filip Chytil": 26,
  "Igor Shesterkin": 29, "Jacob Trouba": 31, "Kaapo Kakko": 24, "Mika Zibanejad": 32, "Vincent Trocheck": 32,

  // Philadelphia Flyers
  "Cam York": 24, "Carter Hart": 27, "Jamie Drysdale": 23, "Joel Farabee": 25, "Morgan Frost": 26,
  "Owen Tippett": 26, "Sean Couturier": 32, "Travis Konecny": 28,

  // Pittsburgh Penguins
  "Bryan Rust": 33, "Evgeni Malkin": 39, "Kris Letang": 38, "Noel Acciari": 34, "Reilly Smith": 34,
  "Rickard Rakell": 32, "Ryan Graves": 30, "Sidney Crosby": 38, "Tristan Jarry": 30,

  // Washington Capitals
  "Alex Ovechkin": 39, "Charlie Lindgren": 31, "Connor McMichael": 24, "Darcy Kuemper": 35, "Dylan Strome": 28,
  "Evgeny Kuznetsov": 33, "John Carlson": 35, "Nicklas Backstrom": 37, "Rasmus Sandin": 25, "Tom Wilson": 31,

  // Chicago Blackhawks
  "Connor Bedard": 20, "Tyler Bertuzzi": 30, "Laurent Brossoit": 32, "Andre Burakovsky": 30, "Louis Crevier": 24,
  "Jason Dickinson": 30, "Ryan Donato": 29, "Nick Foligno": 37, "Ryan Greene": 21, "Wyatt Kaiser": 23,
  "Spencer Knight": 24, "Sam Lafferty": 30, "Artyom Levshunov": 19, "Ilya Mikheyev": 30, "Oliver Moore": 20,
  "Connor Murphy": 32, "Frank Nazar": 21, "Lukas Reichel": 23, "Sam Rinzel": 21, "Landon Slaggert": 23,
  "Arvid Soderblom": 26, "Dominic Toninato": 31, "Alex Vlasic": 24,

  // Colorado Avalanche
  "Mackenzie Blackwood": 28, "Ross Colton": 28, "Jack Drury": 25, "Sam Girard": 27, "Ivan Ivan": 23,
  "Parker Kelly": 26, "Joel Kiviranta": 29, "Gabriel Landeskog": 32, "Artturi Lehkonen": 30, "Nathan MacKinnon": 29,
  "Cale Makar": 26, "Sam Malinski": 27, "Josh Manson": 33, "Keaton Middleton": 27, "Logan O'Connor": 29,
  "Victor Olofsson": 30, "Devon Toews": 31, "Scott Wedgewood": 33, "Valeri Nichushkin": 30,

  // Dallas Stars
  "Francesco Arcuri": 22, "Oskar Back": 25, "Colin Blackwell": 32, "Mavrik Bourque": 23, "Matt Duchene": 34,
  "Radek Faksa": 31, "Roope Hintz": 28, "Justin Hryckowian": 24, "Cameron Hughes": 28, "Wyatt Johnston": 22,
  "Tyler Seguin": 33, "Sam Steel": 27, "Chase Wheatcroft": 23, "Jamie Benn": 36, "Justin Ertel": 22,
  "Jason Robertson": 26, "Antonio Stranges": 23, "Nathan Bastian": 27, "Emil Hemming": 19, "Arttu Hyry": 24,
  "Kole Lind": 26, "Kyle McDonald": 23, "Matthew Seminoff": 21, "Tristan Bertucci": 20, "Lian Bichsel": 21,
  "Kyle Capobianco": 28, "Thomas Harley": 24, "Miro Heiskanen": 26, "Vladislav Kolyachonok": 24, "Luke Krys": 24,
  "Christian Kyrou": 21, "Esa Lindell": 31, "Nils Lundkvist": 25, "Ilya Lyubushkin": 31, "Alexander Petrovic": 33,
  "Connor Punnett": 22, "Brendan Smith": 36, "Gavin White": 22, "Casey DeSmith": 34, "Ben Kraws": 25,
  "Jake Oettinger": 26, "Remi Poirier": 23,

  // Minnesota Wild
  "Nicolas Aube-Kubel": 29, "Zach Bogosian": 35, "Matt Boldy": 24, "Jonas Brodin": 32, "Zeev Buium": 19,
  "Joel Eriksson Ek": 28, "Brock Faber": 23, "Marcus Foligno": 34, "Filip Gustavsson": 27, "Hunter Haight": 21,
  "Ryan Hartman": 30, "Vinnie Hinostroza": 31, "Marcus Johansson": 34, "Ben Jones": 26, "Kirill Kaprizov": 28,
  "Carson Lambos": 22, "Jon Merrill": 33, "Jacob Middleton": 29, "Liam Ohgren": 21, "Marco Rossi": 23,
  "Jared Spurgeon": 35, "Nico Sturm": 30, "Vladimir Tarasenko": 33, "Yakov Trenin": 28, "Jesper Wallstedt": 22,
  "Mats Zuccarello": 37,

  // Nashville Predators
  "David Edstrom": 20, "Jake Lucchini": 30, "Brady Martin": 18, "Ryan O'Reilly": 34, "Steven Stamkos": 35,
  "Fedor Svechkov": 22, "Ozzy Wiesblatt": 23, "Joey Willis": 20, "Filip Forsberg": 31, "Erik Haula": 34,
  "Zachary L'Heureux": 22, "Kalan Lind": 20, "Navrin Mutter": 24, "Reid Schaefer": 21, "Jakub Vrana": 29,
  "Luke Evangelista": 23, "Hiroki Gojsic": 19, "Joakim Kemell": 21, "Jonathan Marchessault": 34, "Michael McCarron": 30,
  "Cole O'Hara": 23, "Austin Roest": 21, "Ryder Rolston": 23, "Cole Smith": 29, "Matthew Wood": 20,
  "Justin Barron": 23, "Nick Blankenburg": 27, "Andreas Englund": 29, "Andrew Gibson": 20, "Kevin Gravel": 33,
  "Nicolas Hague": 26, "Roman Josi": 35, "Jack Matier": 22, "Tanner Molendyk": 20, "Jordan Oesterle": 33,
  "Nick Perbix": 27, "Spencer Stastney": 25, "Ryan Ufko": 22, "Adam Wilsby": 25, "Justus Annunen": 25,
  "Magnus Chrona": 25, "Matt Murray": 27, "Juuse Saros": 30,

  // St. Louis Blues
  "Nikita Alexandrov": 24, "Jordan Binnington": 32, "Nick Bjugstad": 33, "Philip Broberg": 24, "Pavel Buchnevich": 30,
  "Colten Ellis": 24, "Justin Faulk": 33, "Cam Fowler": 33, "Dylan Holloway": 23, "Joel Hofer": 25,
  "Mathieu Joseph": 28, "Matthew Kessel": 25, "Torey Krug": 34, "Jordan Kyrou": 27, "Jake Neighbours": 23,
  "Colton Parayko": 32, "Brayden Schenn": 34, "Corey Schueneman": 29, "Jimmy Snuggerud": 21, "Oskar Sundqvist": 31,
  "Pius Suter": 29, "Robert Thomas": 26, "Alexey Toropchenko": 26, "Tyler Tucker": 25, "Nathan Walker": 31,

  // Winnipeg Jets
  "Jaret Anderson-Dolan": 25, "Morgan Barron": 26, "Eric Comrie": 30, "Kyle Connor": 28, "Dylan DeMelo": 32,
  "Haydn Fleury": 29, "David Gustafsson": 25, "Ville Heinola": 24, "Connor Hellebuyck": 32, "Alex Iafallo": 31,
  "Cole Koepke": 27, "Adam Lowry": 32, "Colin Miller": 32, "Josh Morrissey": 30, "Vladislav Namestnikov": 32,
  "Nino Niederreiter": 32, "Gustav Nyquist": 35, "Tanner Pearson": 33, "Cole Perfetti": 23, "Isaak Phillips": 23,
  "Neal Pionk": 30, "Dylan Samberg": 26, "Mark Scheifele": 32, "Luke Schenn": 35, "Logan Stanley": 27,
  "Jonathan Toews": 37, "Gabriel Vilardi": 26, "Brayden Yager": 20,

  // Utah Mammoth
  "Michael Carcone": 29, "Ian Cole": 36, "Logan Cooley": 21, "Lawson Crouse": 28, "Nick DeSimone": 30,
  "Sean Durzi": 26, "Dylan Guenther": 22, "Barrett Hayton": 25, "Connor Ingram": 28, "Clayton Keller": 27,
  "Alexander Kerfoot": 31, "Olli Maatta": 31, "John Marino": 28, "Jack McBain": 25, "Liam O'Brien": 31,
  "Scott Perunovich": 27, "JJ Peterka": 23, "Mikhail Sergachev": 27, "Nick Schmaltz": 29, "Nate Schmidt": 34,
  "Kevin Stenlund": 28, "Brandon Tanev": 33, "Karel Vejmelka": 29,

  // Anaheim Ducks
  "Trevor Zegras": 24, "Mason McTavish": 22, "Leo Carlsson": 20, "Frank Vatrano": 31, "Alex Killorn": 36,
  "Adam Henrique": 35, "Troy Terry": 28, "Isac Lundestrom": 25, "Jakob Silfverberg": 34, "Radko Gudas": 35,
  "Pavel Mintyukov": 21, "Olen Zellweger": 22, "Lukas Dostal": 25,

  // Calgary Flames
  "Nazem Kadri": 34, "Jonathan Huberdeau": 32, "Andrew Mangiapane": 29, "Connor Zary": 23, "Dillon Dube": 27,
  "Blake Coleman": 33, "Yegor Sharangovich": 27, "Andrei Kuzmenko": 29, "Mikael Backlund": 36, "Rasmus Andersson": 29,
  "Noah Hanifin": 28, "MacKenzie Weegar": 31, "Oliver Kylington": 28, "Jacob Markstrom": 35, "Dan Vladar": 28,

  // Edmonton Oilers
  "Connor McDavid": 28, "Leon Draisaitl": 29, "Ryan Nugent-Hopkins": 32, "Evander Kane": 34, "Zach Hyman": 33,
  "Corey Perry": 40, "Mattias Ekholm": 35, "Darnell Nurse": 30, "Evan Bouchard": 26, "Stuart Skinner": 27,
  "Jack Campbell": 33,

  // Los Angeles Kings
  "Anze Kopitar": 38, "Quinton Byfield": 23, "Pierre-Luc Dubois": 27, "Adrian Kempe": 29, "Kevin Fiala": 29,
  "Trevor Moore": 30, "Jordan Spence": 24, "Drew Doughty": 35, "Mikey Anderson": 26, "Brandt Clarke": 22,
  "David Rittich": 33,

  // San Jose Sharks
  "Logan Couture": 36, "Tomas Hertl": 32, "Anthony Duclair": 30, "Alexander Barabanov": 31, "William Eklund": 23,
  "Mario Ferraro": 27, "Marc-Edouard Vlasic": 38, "Filip Zadina": 25,

  // Seattle Kraken
  "Matty Beniers": 22, "Shane Wright": 21, "Jordan Eberle": 35, "Jared McCann": 29, "Jaden Schwartz": 33,
  "Vince Dunn": 29, "Adam Larsson": 32, "Philipp Grubauer": 34, "Joey Daccord": 29,

  // Vancouver Canucks
  "Elias Pettersson": 26, "J.T. Miller": 32, "Brock Boeser": 28, "Conor Garland": 29, "Nils Hoglander": 25,
  "Quinn Hughes": 25, "Filip Hronek": 27, "Tyler Myers": 35, "Thatcher Demko": 29, "Arturs Silovs": 24,

  // Vegas Golden Knights
  "Jack Eichel": 28, "Mark Stone": 33, "William Karlsson": 32, "Chandler Stephenson": 31, "Ivan Barbashev": 29,
  "Brett Howden": 27, "Brayden McNabb": 34, "Alex Pietrangelo": 35, "Shea Theodore": 30, "Logan Thompson": 28,
  "Adin Hill": 29,
};

export function updatePlayersWithAges(players: Player[]): Player[] {
  return players.map(player => {
    const age = playerAges[player.name];
    return {
      ...player,
      age: age || undefined // Only add age if we have data for this player
    };
  });
}

export { playerAges };