import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building, Users, Trophy, DollarSign, ArrowLeft } from "lucide-react";

interface FranchiseModeProps {
  onBack: () => void;
}

export const FranchiseMode = ({ onBack }: FranchiseModeProps) => {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [season, setSeason] = useState(1);

  const franchiseTeams = [
    { name: "Arctic Ice Wolves", city: "Arctic", budget: 85000000, overall: 87, fans: 92 },
    { name: "Inferno Fire Hawks", city: "Inferno", budget: 78000000, overall: 84, fans: 88 },
    { name: "Metro Titans", city: "Metro", budget: 95000000, overall: 91, fans: 95 },
    { name: "Storm Lightning", city: "Storm", budget: 82000000, overall: 86, fans: 85 }
  ];

  const managementAreas = [
    { title: "Team Management", icon: Users, description: "Manage roster, lineups, and player development" },
    { title: "Scouting Network", icon: Building, description: "Advanced scouting with smarter AI recommendations" },
    { title: "Negotiations", icon: DollarSign, description: "Player contracts and trade negotiations" },
    { title: "Season Goals", icon: Trophy, description: "Set objectives and track progress" }
  ];

  if (!selectedTeam) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-background via-background/95 to-primary/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <Button variant="outline" onClick={onBack} className="absolute top-6 left-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              BACK TO MENU
            </Button>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              FRANCHISE MODE
            </h1>
            <p className="text-muted-foreground text-lg">
              Build your dynasty with enhanced management tools and smarter AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {franchiseTeams.map((team) => (
              <Card 
                key={team.name}
                className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl"
                onClick={() => setSelectedTeam(team.name)}
              >
                <CardHeader>
                  <CardTitle className="text-xl text-center">
                    {team.city} {team.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Overall Rating</span>
                    <Badge variant="secondary">{team.overall}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fan Support</span>
                      <span>{team.fans}%</span>
                    </div>
                    <Progress value={team.fans} className="h-2" />
                  </div>
                  <div className="text-center text-sm text-muted-foreground">
                    Budget: ${(team.budget / 1000000).toFixed(1)}M
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-background via-background/95 to-primary/10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Button variant="outline" onClick={() => setSelectedTeam(null)} className="absolute top-6 left-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            TEAM SELECT
          </Button>
          <h1 className="text-3xl font-bold mb-2">{selectedTeam}</h1>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Season {season} • General Manager
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {managementAreas.map((area) => (
            <Card key={area.title} className="shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <CardHeader className="text-center">
                <area.icon className="w-12 h-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
                <CardTitle className="text-xl">{area.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center mb-4">{area.description}</p>
                <Button className="w-full">
                  MANAGE
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">FRANCHISE OVERVIEW</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Enhanced franchise experience with deeper team management, smarter scouting network, 
              and improved player negotiations. Build your dynasty with strategic decisions.
            </p>
            <Badge variant="secondary">
              COMING IN FULL RELEASE
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};