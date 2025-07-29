import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GameHeader from "./GameHeader";

// Import all team logos
import bruinsLogo from "@/assets/teams/boston-bruins.png";
import oilersLogo from "@/assets/teams/edmonton-oilers.png";
import avalancheLogo from "@/assets/teams/colorado-avalanche.png";
import mapleLeavesLogo from "@/assets/teams/toronto-maple-leafs.png";
import lightningLogo from "@/assets/teams/tampa-bay-lightning.png";
import panthersLogo from "@/assets/teams/florida-panthers.png";
import sabresLogo from "@/assets/teams/buffalo-sabres.png";
import senatorsLogo from "@/assets/teams/ottawa-senators.png";
import redWingsLogo from "@/assets/teams/detroit-red-wings.png";
import canadiensLogo from "@/assets/teams/montreal-canadiens.png";
import rangersLogo from "@/assets/teams/new-york-rangers.png";
import devilsLogo from "@/assets/teams/new-jersey-devils.png";
import hurricanesLogo from "@/assets/teams/carolina-hurricanes.png";
import islandersLogo from "@/assets/teams/new-york-islanders.png";
import capitalsLogo from "@/assets/teams/washington-capitals.png";
import penguinsLogo from "@/assets/teams/pittsburgh-penguins.png";
import flyersLogo from "@/assets/teams/philadelphia-flyers.png";
import blueJacketsLogo from "@/assets/teams/columbus-blue-jackets.png";
import starsLogo from "@/assets/teams/dallas-stars.png";
import wildLogo from "@/assets/teams/minnesota-wild.png";
import jetsLogo from "@/assets/teams/winnipeg-jets.png";
import predatorsLogo from "@/assets/teams/nashville-predators.png";
import bluesLogo from "@/assets/teams/st-louis-blues.png";
import coyotesLogo from "@/assets/teams/arizona-coyotes.png";
import blackhawksLogo from "@/assets/teams/chicago-blackhawks.png";
import goldenKnightsLogo from "@/assets/teams/vegas-golden-knights.png";
import kingsLogo from "@/assets/teams/los-angeles-kings.png";
import krakenLogo from "@/assets/teams/seattle-kraken.png";
import canucksLogo from "@/assets/teams/vancouver-canucks.png";
import flamesLogo from "@/assets/teams/calgary-flames.png";
import ducksLogo from "@/assets/teams/anaheim-ducks.png";
import sharksLogo from "@/assets/teams/san-jose-sharks.png";

interface TeamCoachSelectionProps {
  onComplete: (selectedTeam: string, coachName: string) => void;
}

const TeamCoachSelection = ({ onComplete }: TeamCoachSelectionProps) => {
  const [selectedTeam, setSelectedTeam] = useState("");
  const [coachName, setCoachName] = useState("");

  const nhlTeams = [
    { id: 'ANA', name: 'Anaheim Ducks', colors: 'from-orange-600 to-black', logo: ducksLogo },
    { id: 'ARI', name: 'Arizona Coyotes', colors: 'from-red-800 to-yellow-600', logo: coyotesLogo },
    { id: 'BOS', name: 'Boston Bruins', colors: 'from-yellow-400 to-black', logo: bruinsLogo },
    { id: 'BUF', name: 'Buffalo Sabres', colors: 'from-blue-600 to-yellow-400', logo: sabresLogo },
    { id: 'CGY', name: 'Calgary Flames', colors: 'from-red-600 to-yellow-500', logo: flamesLogo },
    { id: 'CAR', name: 'Carolina Hurricanes', colors: 'from-red-600 to-black', logo: hurricanesLogo },
    { id: 'CHI', name: 'Chicago Blackhawks', colors: 'from-red-600 to-black', logo: blackhawksLogo },
    { id: 'COL', name: 'Colorado Avalanche', colors: 'from-blue-800 to-red-600', logo: avalancheLogo },
    { id: 'CBJ', name: 'Columbus Blue Jackets', colors: 'from-blue-700 to-red-600', logo: blueJacketsLogo },
    { id: 'DAL', name: 'Dallas Stars', colors: 'from-green-600 to-black', logo: starsLogo },
    { id: 'DET', name: 'Detroit Red Wings', colors: 'from-red-600 to-white', logo: redWingsLogo },
    { id: 'EDM', name: 'Edmonton Oilers', colors: 'from-blue-600 to-orange-500', logo: oilersLogo },
    { id: 'FLA', name: 'Florida Panthers', colors: 'from-red-600 to-blue-700', logo: panthersLogo },
    { id: 'LAK', name: 'Los Angeles Kings', colors: 'from-black to-gray-400', logo: kingsLogo },
    { id: 'MIN', name: 'Minnesota Wild', colors: 'from-green-700 to-red-600', logo: wildLogo },
    { id: 'MTL', name: 'Montreal Canadiens', colors: 'from-red-600 to-blue-700', logo: canadiensLogo },
    { id: 'NSH', name: 'Nashville Predators', colors: 'from-yellow-400 to-blue-700', logo: predatorsLogo },
    { id: 'NJD', name: 'New Jersey Devils', colors: 'from-red-600 to-black', logo: devilsLogo },
    { id: 'NYI', name: 'New York Islanders', colors: 'from-blue-600 to-orange-500', logo: islandersLogo },
    { id: 'NYR', name: 'New York Rangers', colors: 'from-blue-700 to-red-600', logo: rangersLogo },
    { id: 'OTT', name: 'Ottawa Senators', colors: 'from-red-600 to-black', logo: senatorsLogo },
    { id: 'PHI', name: 'Philadelphia Flyers', colors: 'from-orange-500 to-black', logo: flyersLogo },
    { id: 'PIT', name: 'Pittsburgh Penguins', colors: 'from-black to-yellow-400', logo: penguinsLogo },
    { id: 'SJS', name: 'San Jose Sharks', colors: 'from-teal-600 to-black', logo: sharksLogo },
    { id: 'SEA', name: 'Seattle Kraken', colors: 'from-blue-800 to-teal-400', logo: krakenLogo },
    { id: 'STL', name: 'St. Louis Blues', colors: 'from-blue-700 to-yellow-400', logo: bluesLogo },
    { id: 'TBL', name: 'Tampa Bay Lightning', colors: 'from-blue-600 to-white', logo: lightningLogo },
    { id: 'TOR', name: 'Toronto Maple Leafs', colors: 'from-blue-600 to-white', logo: mapleLeavesLogo },
    { id: 'VAN', name: 'Vancouver Canucks', colors: 'from-blue-600 to-green-600', logo: canucksLogo },
    { id: 'VGK', name: 'Vegas Golden Knights', colors: 'from-yellow-500 to-black', logo: goldenKnightsLogo },
    { id: 'WSH', name: 'Washington Capitals', colors: 'from-red-600 to-blue-700', logo: capitalsLogo },
    { id: 'WPG', name: 'Winnipeg Jets', colors: 'from-blue-700 to-white', logo: jetsLogo }
  ];

  const handleSubmit = () => {
    if (selectedTeam && coachName.trim()) {
      onComplete(selectedTeam, coachName.trim());
    }
  };

  return (
    <div className="min-h-screen ice-surface">
      <GameHeader title="Welcome to NHL Ultimate Mobile" />
      
      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            Welcome to NHL Ultimate Mobile
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Choose your favorite NHL team and enter your coach name to begin your journey
          </p>

          <div className="space-y-8">
            {/* Coach Name Input */}
            <Card className="game-card p-6">
              <Label htmlFor="coachName" className="text-lg font-semibold">
                What's your name, Coach?
              </Label>
              <Input
                id="coachName"
                value={coachName}
                onChange={(e) => setCoachName(e.target.value)}
                placeholder="Enter your coach name"
                className="mt-2 text-center text-lg"
                maxLength={20}
              />
            </Card>

            {/* Team Selection */}
            <Card className="game-card p-6">
              <h3 className="text-lg font-semibold mb-4">Select Your Favorite NHL Team</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                {nhlTeams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeam(team.id)}
                    className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedTeam === team.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="w-full h-16 flex items-center justify-center mb-2 bg-white/10 rounded">
                      <img 
                        src={team.logo} 
                        alt={team.name} 
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                    <div className="text-xs font-semibold text-center">{team.id}</div>
                    <div className="text-xs text-muted-foreground text-center">{team.name}</div>
                  </button>
                ))}
              </div>
            </Card>

            <Button
              onClick={handleSubmit}
              disabled={!selectedTeam || !coachName.trim()}
              className="btn-primary text-xl px-8 py-4 h-auto"
            >
              Start My NHL Journey
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCoachSelection;