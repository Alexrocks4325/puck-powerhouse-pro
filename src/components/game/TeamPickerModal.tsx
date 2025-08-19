import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Trophy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TeamPickerModalProps {
  teams: any[];
  selectedTeam: any;
  onTeamSelected: (team: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function TeamPickerModal({
  teams,
  selectedTeam,
  onTeamSelected,
  isOpen,
  onClose
}: TeamPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.abbreviation?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort teams by points/wins
  const sortedTeams = filteredTeams.sort((a, b) => {
    const aPoints = (a.wins * 2) + a.otLosses;
    const bPoints = (b.wins * 2) + b.otLosses;
    return bPoints - aPoints;
  });

  const handleTeamSelect = (team: any) => {
    onTeamSelected(team);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Select Team
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Teams List */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-2">
            {sortedTeams.map((team, index) => {
              const isSelected = selectedTeam?.id === team.id;
              const points = (team.wins * 2) + team.otLosses;
              
              return (
                <div
                  key={team.id}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all duration-200",
                    isSelected
                      ? "bg-primary/5 border-primary ring-1 ring-primary"
                      : "hover:bg-muted/50 hover:border-muted-foreground/30"
                  )}
                  onClick={() => handleTeamSelect(team)}
                >
                  {/* Ranking */}
                  <div className="text-sm text-muted-foreground font-medium w-6">
                    {index + 1}
                  </div>

                  {/* Team Logo */}
                  <img
                    src={team.logo}
                    alt={`${team.name} logo`}
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://via.placeholder.com/40x40/1B365D/FFFFFF?text=NHL";
                    }}
                  />

                  {/* Team Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={cn(
                        "font-semibold text-sm",
                        isSelected ? "text-primary" : "text-foreground"
                      )}>
                        {team.name}
                      </h4>
                      {team.abbreviation && (
                        <Badge variant="secondary" className="text-xs">
                          {team.abbreviation}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span>{team.conference || "NHL"}</span>
                      <span>{team.wins}-{team.losses}-{team.otLosses}</span>
                      <span>{points} pts</span>
                    </div>
                  </div>

                  {/* Difficulty */}
                  {team.difficulty && (
                    <div className="text-right">
                      <div className="text-sm font-bold text-primary">
                        {Math.round(team.difficulty)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Difficulty
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}