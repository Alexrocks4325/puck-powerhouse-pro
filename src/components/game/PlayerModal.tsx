import React from 'react';
import { X, User, Calendar, DollarSign, TrendingUp, Trophy, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { playerAges } from '../../utils/playerAgeUpdater';

type Skater = {
  id: string;
  name: string;
  position: "C" | "LW" | "RW" | "D";
  overall: number;
  shooting: number;
  passing: number;
  defense: number;
  stamina: number;
  gp: number;
  g: number;
  a: number;
  p: number;
  pim: number;
  shots: number;
  plusMinus: number;
  ppG?: number;
  shG?: number;
  playoffGP?: number;
  playoffG?: number;
  playoffA?: number;
  playoffP?: number;
  image?: string;
};

type Goalie = {
  id: string;
  name: string;
  position: "G";
  overall: number;
  reflexes: number;
  positioning: number;
  reboundControl: number;
  stamina: number;
  gp: number;
  gs: number;
  w: number;
  l: number;
  otl: number;
  so: number;
  shotsAgainst: number;
  saves: number;
  gaa: number;
  svpct: number;
  image?: string;
};

type Player = Skater | Goalie;

interface PlayerModalProps {
  player: Player;
  teamName: string;
  onClose: () => void;
  seasonYear: string;
}

export default function PlayerModal({ player, teamName, onClose, seasonYear }: PlayerModalProps) {
  const age = playerAges[player.name] || 25;
  const isGoalie = player.position === 'G';
  
  // Generate realistic contract info
  const contractYears = Math.floor(Math.random() * 5) + 1;
  const contractValue = Math.floor(player.overall * 100000 + Math.random() * 2000000);
  
  // Generate historical seasons (mock data)
  const historicalSeasons = Array.from({ length: Math.min(age - 18, 8) }, (_, i) => {
    const seasonAge = age - i;
    const year = parseInt(seasonYear) - i;
    if (isGoalie) {
      return {
        season: `${year - 1}-${year.toString().slice(-2)}`,
        team: i < 2 ? teamName : Math.random() > 0.7 ? 'Previous Team' : teamName,
        gp: Math.floor(Math.random() * 60) + 20,
        w: Math.floor(Math.random() * 30) + 10,
        l: Math.floor(Math.random() * 20) + 5,
        gaa: (2.0 + Math.random() * 2).toFixed(2),
        svpct: (0.900 + Math.random() * 0.040).toFixed(3),
        so: Math.floor(Math.random() * 5)
      };
    } else {
      return {
        season: `${year - 1}-${year.toString().slice(-2)}`,
        team: i < 2 ? teamName : Math.random() > 0.7 ? 'Previous Team' : teamName,
        gp: Math.floor(Math.random() * 70) + 20,
        g: Math.floor(Math.random() * 30) + 5,
        a: Math.floor(Math.random() * 40) + 10,
        p: 0, // Will be calculated
        pim: Math.floor(Math.random() * 60) + 10
      };
    }
  });

  // Calculate points for skaters
  if (!isGoalie) {
    historicalSeasons.forEach(season => {
      season.p = season.g + season.a;
    });
  }

  const getPositionColor = (pos: string) => {
    switch (pos) {
      case 'C': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LW': case 'RW': return 'bg-red-100 text-red-800 border-red-200';
      case 'D': return 'bg-green-100 text-green-800 border-green-200';
      case 'G': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOverallColor = (overall: number) => {
    if (overall >= 90) return 'text-yellow-600 font-bold';
    if (overall >= 85) return 'text-blue-600 font-semibold';
    if (overall >= 80) return 'text-green-600 font-medium';
    if (overall >= 75) return 'text-orange-600';
    return 'text-gray-600';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center overflow-hidden">
                {player.image ? (
                  <img 
                    src={player.image} 
                    alt={`${player.name} headshot`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to icon if image fails to load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
                    }}
                  />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{player.name}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <Badge className={getPositionColor(player.position)}>
                    {player.position}
                  </Badge>
                  <span className="text-muted-foreground">{teamName}</span>
                  <span className={getOverallColor(player.overall)}>
                    {player.overall} OVR
                  </span>
                </div>
              </div>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Player Info */}
            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Player Info
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Age:</span>
                    <span className="font-medium">{age}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Position:</span>
                    <span className="font-medium">{player.position}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Overall:</span>
                    <span className={getOverallColor(player.overall)}>{player.overall}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Contract
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Length:</span>
                    <span className="font-medium">{contractYears} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">AAV:</span>
                    <span className="font-medium">${(contractValue / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-medium">${(contractValue * contractYears / 1000000).toFixed(1)}M</span>
                  </div>
                </div>
              </Card>

              {/* Attributes */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Attributes
                </h3>
                <div className="space-y-3">
                  {isGoalie ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Reflexes:</span>
                        <span className="text-sm font-medium">{(player as Goalie).reflexes}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Positioning:</span>
                        <span className="text-sm font-medium">{(player as Goalie).positioning}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Rebound Control:</span>
                        <span className="text-sm font-medium">{(player as Goalie).reboundControl}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Shooting:</span>
                        <span className="text-sm font-medium">{(player as Skater).shooting}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Passing:</span>
                        <span className="text-sm font-medium">{(player as Skater).passing}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Defense:</span>
                        <span className="text-sm font-medium">{(player as Skater).defense}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Stamina:</span>
                    <span className="text-sm font-medium">{player.stamina}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Current Season Stats */}
            <div>
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  {seasonYear} Season
                </h3>
                {isGoalie ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Games:</span>
                      <span className="font-medium">{player.gp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Starts:</span>
                      <span className="font-medium">{(player as Goalie).gs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Record:</span>
                      <span className="font-medium">{(player as Goalie).w}-{(player as Goalie).l}-{(player as Goalie).otl}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GAA:</span>
                      <span className="font-medium">{(player as Goalie).gaa.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Save %:</span>
                      <span className="font-medium">{(player as Goalie).svpct.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shutouts:</span>
                      <span className="font-medium">{(player as Goalie).so}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Games:</span>
                      <span className="font-medium">{player.gp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Goals:</span>
                      <span className="font-medium">{(player as Skater).g}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Assists:</span>
                      <span className="font-medium">{(player as Skater).a}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Points:</span>
                      <span className="font-medium">{(player as Skater).p}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">+/-:</span>
                      <span className="font-medium">{(player as Skater).plusMinus > 0 ? '+' : ''}{(player as Skater).plusMinus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">PIM:</span>
                      <span className="font-medium">{(player as Skater).pim}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shots:</span>
                      <span className="font-medium">{(player as Skater).shots}</span>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Career History */}
            <div>
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Career History
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {historicalSeasons.map((season, index) => (
                    <div key={index} className="border-l-2 border-muted pl-3 pb-2">
                      <div className="font-medium text-sm">{season.season}</div>
                      <div className="text-xs text-muted-foreground mb-1">{season.team}</div>
                      {isGoalie ? (
                        <div className="text-xs space-y-1">
                          <div>{season.gp} GP, {season.w}-{season.l} Record</div>
                          <div>{season.gaa} GAA, {season.svpct} SV%, {season.so} SO</div>
                        </div>
                      ) : (
                        <div className="text-xs">
                          {season.gp} GP, {season.g}G {season.a}A {season.p}P, {season.pim} PIM
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}