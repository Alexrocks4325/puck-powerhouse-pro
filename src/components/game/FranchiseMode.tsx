import React, { createContext, useContext, useMemo, useReducer, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import GameHeader from "./GameHeader";
import { Trophy, Users, Calendar, Star, Settings, TrendingUp, Building2, Target, Crown } from "lucide-react";
import { nhlPlayerDatabase, Player } from "@/data/nhlPlayerDatabase";
import TradeCenter from './TradeCenter';

// =============================================================
// Types
// =============================================================
export type Position = "LW" | "C" | "RW" | "D" | "G";

export interface FranchisePlayer extends Player {
  contract?: {
    capHit: number;
    yearsLeft: number;
    twoWay?: boolean;
    noTrade?: boolean;
  };
  morale?: number;
  age?: number;
}

export interface FranchiseTeam {
  id: string;
  name: string;
  abbreviation: string;
  conference: "East" | "West";
  division: string;
  roster: FranchisePlayer[];
  ahlRoster: FranchisePlayer[];
  echlRoster: FranchisePlayer[];
  captains?: { c?: string; a1?: string; a2?: string };
  capSpace: number;
}

export interface GameResult {
  date: string;
  homeId: string;
  awayId: string;
  homeGoals: number;
  awayGoals: number;
  winnerId: string;
  shootout?: boolean;
  overtime?: boolean;
}

export interface StandingsRow {
  teamId: string;
  gp: number;
  w: number;
  l: number;
  otl: number;
  pts: number;
  gf: number;
  ga: number;
  diff: number;
  streak: string;
}

export interface FranchiseState {
  year: number;
  teams: FranchiseTeam[];
  schedule: { date: string; games: { homeId: string; awayId: string }[] }[];
  results: GameResult[];
  standings: Record<string, StandingsRow>;
  userTeamId: string;
  currentDate: string;
  freeAgents: FranchisePlayer[];
  news: { id: string; date: string; title: string; body: string }[];
}

// =============================================================
// NHL Teams Database
// =============================================================
const NHL_TEAMS = [
  // Eastern Conference - Atlantic
  { id: "FLA", name: "Florida Panthers", abbreviation: "FLA", conference: "East" as const, division: "Atlantic" },
  { id: "TBL", name: "Tampa Bay Lightning", abbreviation: "TBL", conference: "East" as const, division: "Atlantic" },
  { id: "TOR", name: "Toronto Maple Leafs", abbreviation: "TOR", conference: "East" as const, division: "Atlantic" },
  { id: "BOS", name: "Boston Bruins", abbreviation: "BOS", conference: "East" as const, division: "Atlantic" },
  { id: "BUF", name: "Buffalo Sabres", abbreviation: "BUF", conference: "East" as const, division: "Atlantic" },
  { id: "OTT", name: "Ottawa Senators", abbreviation: "OTT", conference: "East" as const, division: "Atlantic" },
  { id: "MTL", name: "Montreal Canadiens", abbreviation: "MTL", conference: "East" as const, division: "Atlantic" },
  { id: "DET", name: "Detroit Red Wings", abbreviation: "DET", conference: "East" as const, division: "Atlantic" },

  // Eastern Conference - Metropolitan
  { id: "NYR", name: "New York Rangers", abbreviation: "NYR", conference: "East" as const, division: "Metropolitan" },
  { id: "CAR", name: "Carolina Hurricanes", abbreviation: "CAR", conference: "East" as const, division: "Metropolitan" },
  { id: "NJD", name: "New Jersey Devils", abbreviation: "NJD", conference: "East" as const, division: "Metropolitan" },
  { id: "WSH", name: "Washington Capitals", abbreviation: "WSH", conference: "East" as const, division: "Metropolitan" },
  { id: "PHI", name: "Philadelphia Flyers", abbreviation: "PHI", conference: "East" as const, division: "Metropolitan" },
  { id: "PIT", name: "Pittsburgh Penguins", abbreviation: "PIT", conference: "East" as const, division: "Metropolitan" },
  { id: "NYI", name: "New York Islanders", abbreviation: "NYI", conference: "East" as const, division: "Metropolitan" },
  { id: "CBJ", name: "Columbus Blue Jackets", abbreviation: "CBJ", conference: "East" as const, division: "Metropolitan" },

  // Western Conference - Central
  { id: "DAL", name: "Dallas Stars", abbreviation: "DAL", conference: "West" as const, division: "Central" },
  { id: "COL", name: "Colorado Avalanche", abbreviation: "COL", conference: "West" as const, division: "Central" },
  { id: "WPG", name: "Winnipeg Jets", abbreviation: "WPG", conference: "West" as const, division: "Central" },
  { id: "MIN", name: "Minnesota Wild", abbreviation: "MIN", conference: "West" as const, division: "Central" },
  { id: "STL", name: "St. Louis Blues", abbreviation: "STL", conference: "West" as const, division: "Central" },
  { id: "NSH", name: "Nashville Predators", abbreviation: "NSH", conference: "West" as const, division: "Central" },
  { id: "CHI", name: "Chicago Blackhawks", abbreviation: "CHI", conference: "West" as const, division: "Central" },
  { id: "ARI", name: "Utah Hockey Club", abbreviation: "UTA", conference: "West" as const, division: "Central" },

  // Western Conference - Pacific
  { id: "VGK", name: "Vegas Golden Knights", abbreviation: "VGK", conference: "West" as const, division: "Pacific" },
  { id: "EDM", name: "Edmonton Oilers", abbreviation: "EDM", conference: "West" as const, division: "Pacific" },
  { id: "VAN", name: "Vancouver Canucks", abbreviation: "VAN", conference: "West" as const, division: "Pacific" },
  { id: "LAK", name: "Los Angeles Kings", abbreviation: "LAK", conference: "West" as const, division: "Pacific" },
  { id: "CGY", name: "Calgary Flames", abbreviation: "CGY", conference: "West" as const, division: "Pacific" },
  { id: "SEA", name: "Seattle Kraken", abbreviation: "SEA", conference: "West" as const, division: "Pacific" },
  { id: "ANA", name: "Anaheim Ducks", abbreviation: "ANA", conference: "West" as const, division: "Pacific" },
  { id: "SJS", name: "San Jose Sharks", abbreviation: "SJS", conference: "West" as const, division: "Pacific" },
];

// =============================================================
// Utils
// =============================================================
const NHL_SALARY_CAP = 88_000_000;

function generateSchedule(teams: string[], startDate: string) {
  const dates: string[] = [];
  const start = new Date(startDate);
  for (let i = 0; i < 180; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }

  const matchups: { homeId: string; awayId: string }[] = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matchups.push({ homeId: teams[i], awayId: teams[j] });
      matchups.push({ homeId: teams[j], awayId: teams[i] });
    }
  }

  const schedule: FranchiseState["schedule"] = [];
  let idx = 0;
  for (const date of dates) {
    const games: { homeId: string; awayId: string }[] = [];
    for (let k = 0; k < 8 && idx < matchups.length; k++) {
      games.push(matchups[idx++]);
    }
    if (games.length) schedule.push({ date, games });
    if (idx >= matchups.length) break;
  }
  return schedule;
}

function computeCapSpace(team: FranchiseTeam): number {
  const committed = team.roster.reduce((sum, p) => sum + (p.contract?.capHit ?? 0), 0);
  return Math.max(0, NHL_SALARY_CAP - committed);
}

function simulateGame(homeTeam: FranchiseTeam, awayTeam: FranchiseTeam): GameResult {
  const homeStrength = homeTeam.roster.reduce((sum, p) => sum + p.overall, 0) / homeTeam.roster.length;
  const awayStrength = awayTeam.roster.reduce((sum, p) => sum + p.overall, 0) / awayTeam.roster.length;
  
  const homeAdvantage = 3;
  const strengthDiff = (homeStrength + homeAdvantage) - awayStrength;
  
  let homeGoals = Math.floor(Math.random() * 6) + 1;
  let awayGoals = Math.floor(Math.random() * 6) + 1;
  
  if (strengthDiff > 5) {
    homeGoals += Math.floor(Math.random() * 2);
  } else if (strengthDiff < -5) {
    awayGoals += Math.floor(Math.random() * 2);
  }
  
  let overtime = false;
  let shootout = false;
  
  if (homeGoals === awayGoals) {
    overtime = true;
    if (Math.random() < 0.7) {
      if (Math.random() < 0.5) homeGoals++; else awayGoals++;
    } else {
      shootout = true;
      if (Math.random() < 0.5) homeGoals++; else awayGoals++;
    }
  }
  
  return {
    date: new Date().toISOString().slice(0, 10),
    homeId: homeTeam.id,
    awayId: awayTeam.id,
    homeGoals,
    awayGoals,
    winnerId: homeGoals > awayGoals ? homeTeam.id : awayTeam.id,
    overtime,
    shootout
  };
}

// =============================================================
// Context & State Management
// =============================================================
type Action =
  | { type: "NEW_FRANCHISE"; payload: { userTeamId: string; year: number } }
  | { type: "SIMULATE_DAY"; payload: { date: string } }
  | { type: "SIMULATE_GAMES"; payload: { games: GameResult[] } };

interface State {
  franchise?: FranchiseState;
}

const FranchiseContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

function buildInitialFranchise(userTeamId: string, year: number): FranchiseState {
  const teams: FranchiseTeam[] = NHL_TEAMS.map(teamInfo => {
    const teamPlayers = nhlPlayerDatabase.filter(p => p.team === teamInfo.abbreviation);
    return {
      ...teamInfo,
      roster: teamPlayers.map(p => ({
        ...p,
        contract: {
          capHit: Math.floor(Math.random() * 10000000) + 1000000,
          yearsLeft: Math.floor(Math.random() * 7) + 1,
        },
        morale: Math.floor(Math.random() * 50) + 50,
      })),
      ahlRoster: [],
      echlRoster: [],
      capSpace: 0,
    };
  });

  teams.forEach(t => {
    t.capSpace = computeCapSpace(t);
  });

  const schedule = generateSchedule(teams.map(t => t.id), `${year}-10-01`);

  return {
    year,
    teams,
    schedule,
    results: [],
    standings: {},
    userTeamId,
    currentDate: `${year}-10-01`,
    freeAgents: [],
    news: [{
      id: "1",
      date: `${year}-10-01`,
      title: "Welcome to Your Franchise!",
      body: `You are now the General Manager of the ${teams.find(t => t.id === userTeamId)?.name}. Good luck!`
    }]
  };
}

function franchiseReducer(state: State, action: Action): State {
  switch (action.type) {
    case "NEW_FRANCHISE": {
      const franchise = buildInitialFranchise(action.payload.userTeamId, action.payload.year);
      return { franchise };
    }
    case "SIMULATE_DAY": {
      if (!state.franchise) return state;
      
      const day = state.franchise.schedule.find(d => d.date === action.payload.date);
      if (!day) return state;
      
      const newResults: GameResult[] = [];
      for (const game of day.games) {
        const homeTeam = state.franchise.teams.find(t => t.id === game.homeId)!;
        const awayTeam = state.franchise.teams.find(t => t.id === game.awayId)!;
        const result = simulateGame(homeTeam, awayTeam);
        result.date = action.payload.date;
        newResults.push(result);
      }
      
      const updatedResults = [...state.franchise.results, ...newResults];
      const standings = recalcStandings(updatedResults, state.franchise.teams);
      
      return {
        franchise: {
          ...state.franchise,
          results: updatedResults,
          standings,
          currentDate: action.payload.date
        }
      };
    }
    default:
      return state;
  }
}

function recalcStandings(results: GameResult[], teams: FranchiseTeam[]): Record<string, StandingsRow> {
  const standings: Record<string, StandingsRow> = {};
  
  teams.forEach(team => {
    standings[team.id] = {
      teamId: team.id,
      gp: 0,
      w: 0,
      l: 0,
      otl: 0,
      pts: 0,
      gf: 0,
      ga: 0,
      diff: 0,
      streak: "-"
    };
  });
  
  results.forEach(result => {
    const home = standings[result.homeId];
    const away = standings[result.awayId];
    
    home.gp++;
    away.gp++;
    home.gf += result.homeGoals;
    home.ga += result.awayGoals;
    away.gf += result.awayGoals;
    away.ga += result.homeGoals;
    
    if (result.winnerId === result.homeId) {
      home.w++;
      if (result.overtime || result.shootout) {
        away.otl++;
      } else {
        away.l++;
      }
    } else {
      away.w++;
      if (result.overtime || result.shootout) {
        home.otl++;
      } else {
        home.l++;
      }
    }
    
    home.pts = home.w * 2 + home.otl;
    away.pts = away.w * 2 + away.otl;
    home.diff = home.gf - home.ga;
    away.diff = away.gf - away.ga;
  });
  
  return standings;
}

function useFranchise() {
  const context = useContext(FranchiseContext);
  if (!context) {
    throw new Error("useFranchise must be used within FranchiseProvider");
  }
  return context;
}

// =============================================================
// Components
// =============================================================
interface FranchiseModeProps {
  playerData: any;
  updatePlayerData: (data: any) => void;
  onNavigate: (screen: string) => void;
}

function FranchiseProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(franchiseReducer, { franchise: undefined });
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return (
    <FranchiseContext.Provider value={value}>
      {children}
    </FranchiseContext.Provider>
  );
}

function TeamSelectionScreen({ onTeamSelected }: { onTeamSelected: (teamId: string) => void }) {
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  
  const conferences = {
    East: NHL_TEAMS.filter(t => t.conference === "East"),
    West: NHL_TEAMS.filter(t => t.conference === "West")
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <GameHeader title="Choose Your Franchise" />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Select Your NHL Team</h1>
          <p className="text-muted-foreground text-lg">
            Choose the team you want to manage as General Manager
          </p>
        </div>

        <Tabs defaultValue="East" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="East">Eastern Conference</TabsTrigger>
            <TabsTrigger value="West">Western Conference</TabsTrigger>
          </TabsList>

          {Object.entries(conferences).map(([conference, teams]) => (
            <TabsContent key={conference} value={conference}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {teams.map((team) => (
                  <Card
                    key={team.id}
                    className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                      selectedTeam === team.id
                        ? "ring-2 ring-primary bg-primary/10"
                        : "hover:shadow-lg"
                    }`}
                    onClick={() => setSelectedTeam(team.id)}
                  >
                    <div className="p-4 text-center">
                      <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{team.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {team.division}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {selectedTeam && (
          <div className="text-center mt-8">
            <Button
              onClick={() => onTeamSelected(selectedTeam)}
              size="lg"
              className="bg-gradient-to-r from-primary to-primary-glow"
            >
              Start Franchise with {NHL_TEAMS.find(t => t.id === selectedTeam)?.name}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function FranchiseTutorial({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const { dispatch } = useFranchise();

  const tutorialSteps = [
    {
      title: "Welcome to Franchise Mode!",
      icon: <Crown className="w-16 h-16 text-gold" />,
      content: "You are now the General Manager of an NHL franchise. Make trades, manage contracts, and lead your team to the Stanley Cup!",
      tips: ["Manage your salary cap", "Build team chemistry", "Make smart trades and signings"]
    },
    {
      title: "Your Team Hub",
      icon: <Users className="w-16 h-16 text-primary" />,
      content: "View your roster, manage lines, and track player development. Keep an eye on contracts and cap space.",
      tips: ["Check player morale regularly", "Balance your lineup", "Develop young prospects"]
    },
    {
      title: "Season Simulation",
      icon: <Calendar className="w-16 h-16 text-ice-blue" />,
      content: "Simulate games day by day or advance quickly through the season. Watch your team's progress in the standings.",
      tips: ["Track league standings", "Monitor team performance", "Plan for the playoffs"]
    },
    {
      title: "Trades & Free Agency", 
      icon: <TrendingUp className="w-16 h-16 text-green-500" />,
      content: "Make trades with other teams and sign free agents to improve your roster. Watch your salary cap!",
      tips: ["Scout other teams", "Negotiate contracts", "Build for the future"]
    }
  ];

  const currentStepData = tutorialSteps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
      <Card className="w-full max-w-2xl mx-4 p-8">
        <div className="text-center">
          <div className="mb-6">
            {currentStepData.icon}
          </div>
          
          <h2 className="text-2xl font-bold mb-4">{currentStepData.title}</h2>
          <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
            {currentStepData.content}
          </p>
          
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2 text-sm">Pro Tips:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              {currentStepData.tips.map((tip, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Star className="w-3 h-3 fill-primary text-primary flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-4 justify-center">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Previous
              </Button>
            )}
            
            {currentStep < tutorialSteps.length - 1 ? (
              <Button onClick={() => setCurrentStep(currentStep + 1)}>
                Next
              </Button>
            ) : (
              <Button 
                onClick={() => {
                  // Find selected team from parent component context
                  const parentElement = document.querySelector('[data-selected-team]');
                  const selectedTeamId = parentElement?.getAttribute('data-selected-team');
                  if (selectedTeamId) {
                    dispatch({ type: "NEW_FRANCHISE", payload: { userTeamId: selectedTeamId, year: 2024 } });
                  }
                  onComplete();
                }} 
                className="bg-gradient-to-r from-primary to-primary-glow"
              >
                Start Managing!
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

function FranchiseDashboard() {
  const { state, dispatch } = useFranchise();
  const { toast } = useToast();
  
  if (!state.franchise) return null;
  
  const userTeam = state.franchise.teams.find(t => t.id === state.franchise?.userTeamId);
  const nextDate = state.franchise.schedule.find(d => 
    !state.franchise?.results.some(r => r.date === d.date)
  )?.date;
  
  const standingsArray = Object.values(state.franchise.standings)
    .sort((a, b) => b.pts - a.pts);
  
  const userStanding = standingsArray.findIndex(s => s.teamId === state.franchise?.userTeamId) + 1;

  const simulateNextDay = () => {
    if (nextDate) {
      dispatch({ type: "SIMULATE_DAY", payload: { date: nextDate } });
      toast({
        title: "Day Simulated",
        description: `Games completed for ${nextDate}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <GameHeader title="Franchise Mode" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          
          {/* Main Content */}
          <section className="md:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{userTeam?.name}</h2>
                <p className="text-muted-foreground">
                  Season {state.franchise.year}-{state.franchise.year + 1} • Standing: #{userStanding}
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={simulateNextDay}
                  disabled={!nextDate}
                  className="bg-gradient-to-r from-primary to-primary-glow"
                >
                  Simulate Next Day
                </Button>
              </div>
            </div>

            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="roster">Roster</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="trades">Trades</TabsTrigger>
                <TabsTrigger value="prospects">Prospects</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-gold" />
                      Team Performance
                    </h3>
                    {userStanding <= 8 ? (
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                        Playoff Position (#{userStanding})
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        Out of Playoffs (#{userStanding})
                      </Badge>
                    )}
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Cap Space</span>
                        <span>${(userTeam?.capSpace ?? 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Roster Size</span>
                        <span>{userTeam?.roster.length ?? 0}/23</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Next Games
                    </h3>
                    <div className="space-y-2">
                      {state.franchise.schedule
                        .filter(d => d.games.some(g => 
                          g.homeId === state.franchise?.userTeamId || 
                          g.awayId === state.franchise?.userTeamId
                        ))
                        .slice(0, 3)
                        .map(day => {
                          const game = day.games.find(g => 
                            g.homeId === state.franchise?.userTeamId || 
                            g.awayId === state.franchise?.userTeamId
                          );
                          if (!game) return null;
                          
                          const isHome = game.homeId === state.franchise?.userTeamId;
                          const opponent = isHome ? game.awayId : game.homeId;
                          
                          return (
                            <div key={day.date} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                              <span className="text-sm">{day.date}</span>
                              <span className="text-sm font-medium">
                                {isHome ? "vs" : "@"} {opponent}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </Card>
                </div>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Recent News</h3>
                  <div className="space-y-3">
                    {state.franchise.news.slice(-5).reverse().map(news => (
                      <div key={news.id} className="border-l-2 border-primary pl-4">
                        <p className="font-medium text-sm">{news.title}</p>
                        <p className="text-xs text-muted-foreground">{news.date}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="roster">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Active Roster</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Player</th>
                          <th className="text-left p-2">Pos</th>
                          <th className="text-left p-2">OVR</th>
                          <th className="text-left p-2">Age</th>
                          <th className="text-left p-2">Cap Hit</th>
                          <th className="text-left p-2">Years Left</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userTeam?.roster.map(player => (
                          <tr key={player.id} className="border-b hover:bg-muted/50">
                            <td className="p-2 font-medium">{player.name}</td>
                            <td className="p-2">{player.position}</td>
                            <td className="p-2">{player.overall}</td>
                            <td className="p-2">{player.age ?? 25}</td>
                            <td className="p-2">${(player.contract?.capHit ?? 0).toLocaleString()}</td>
                            <td className="p-2">{player.contract?.yearsLeft ?? 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="schedule">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Season Schedule</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {state.franchise.schedule
                      .filter(d => d.games.some(g => 
                        g.homeId === state.franchise?.userTeamId || 
                        g.awayId === state.franchise?.userTeamId
                      ))
                      .map(day => {
                        const game = day.games.find(g => 
                          g.homeId === state.franchise?.userTeamId || 
                          g.awayId === state.franchise?.userTeamId
                        );
                        if (!game) return null;
                        
                        const isHome = game.homeId === state.franchise?.userTeamId;
                        const opponent = isHome ? game.awayId : game.homeId;
                        const result = state.franchise?.results.find(r => 
                          r.date === day.date && 
                          (r.homeId === game.homeId && r.awayId === game.awayId)
                        );
                        
                        return (
                          <div key={day.date} className="flex justify-between items-center p-3 bg-muted/30 rounded">
                            <span className="text-sm">{day.date}</span>
                            <span className="text-sm font-medium">
                              {isHome ? "vs" : "@"} {opponent}
                            </span>
                            {result && (
                              <Badge variant={result.winnerId === state.franchise?.userTeamId ? "default" : "destructive"}>
                                {isHome ? `${result.homeGoals}-${result.awayGoals}` : `${result.awayGoals}-${result.homeGoals}`}
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="trades">
                <TradeCenter 
                  state={{
                    seasonYear: `${state.franchise.year}-${state.franchise.year + 1}`,
                    currentDay: 1,
                    totalDays: 180,
                    schedule: [],
                    boxScores: {},
                    teams: Object.fromEntries(state.franchise.teams.map(team => [
                      team.id,
                      {
                        id: team.id,
                        name: team.name,
                        abbrev: team.abbreviation,
                        conference: team.conference,
                        division: team.division,
                        capSpace: team.capSpace,
                        skaters: team.roster.filter(p => p.position !== "G").map(p => ({
                          id: String(p.id),
                          name: p.name,
                          position: p.position as "C"|"LW"|"RW"|"D",
                          overall: p.overall,
                          shooting: Math.floor(p.overall * 0.9),
                          passing: Math.floor(p.overall * 0.85),
                          defense: Math.floor(p.overall * 0.8),
                          stamina: 70,
                          gp: 0, g: 0, a: 0, p: 0, pim: 0, shots: 0, plusMinus: 0
                        })),
                        goalies: team.roster.filter(p => p.position === "G").map(p => ({
                          id: String(p.id),
                          name: p.name,
                          position: "G" as const,
                          overall: p.overall,
                          reflexes: Math.floor(p.overall * 1.05),
                          positioning: Math.floor(p.overall * 1.02),
                          reboundControl: Math.floor(p.overall * 0.95),
                          stamina: 70,
                          gp: 0, gs: 0, w: 0, l: 0, otl: 0, so: 0, shotsAgainst: 0, saves: 0, gaa: 0, svpct: 0
                        })),
                        w: 0, l: 0, otl: 0, gf: 0, ga: 0, pts: 0, shotsFor: 0, shotsAgainst: 0
                      }
                    ])),
                    teamOrder: state.franchise.teams.map(t => t.id)
                  }}
                  setState={() => {
                    // Handle state updates for trade center
                    console.log("Trade center state update");
                  }}
                />
              </TabsContent>

              <TabsContent value="prospects">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Prospect Development</h3>
                  <p className="text-muted-foreground">
                    Manage your AHL and ECHL affiliates, develop prospects, and plan for the future.
                  </p>
                </Card>
              </TabsContent>
            </Tabs>
          </section>

          {/* Sidebar */}
          <aside className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">League Standings</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {standingsArray.slice(0, 10).map((standing, index) => (
                  <div 
                    key={standing.teamId} 
                    className={`flex justify-between items-center p-2 rounded text-sm ${
                      standing.teamId === state.franchise?.userTeamId 
                        ? "bg-primary/10 border border-primary/20" 
                        : "bg-muted/30"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-6 text-center font-medium">{index + 1}</span>
                      <span>{standing.teamId}</span>
                    </span>
                    <span className="font-medium">{standing.pts}pts</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Lines
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Team Settings
                </Button>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

function FranchiseStateProvider({ children, selectedTeam }: { children: React.ReactNode; selectedTeam: string }) {
  const { dispatch } = useFranchise();

  const handleTutorialComplete = () => {
    if (selectedTeam) {
      dispatch({ type: "NEW_FRANCHISE", payload: { userTeamId: selectedTeam, year: 2024 } });
    }
  };

  return (
    <div data-on-tutorial-complete={handleTutorialComplete}>
      {children}
    </div>
  );
}

export default function FranchiseMode({ playerData, updatePlayerData, onNavigate }: FranchiseModeProps) {
  const [step, setStep] = useState<"select" | "tutorial" | "game">("select");
  const [selectedTeam, setSelectedTeam] = useState<string>("");

  const handleTeamSelected = (teamId: string) => {
    setSelectedTeam(teamId);
    setStep("tutorial");
  };

  const handleTutorialComplete = () => {
    setStep("game");
  };

  return (
    <FranchiseProvider>
      <div data-selected-team={selectedTeam}>
        {step === "select" && (
          <TeamSelectionScreen onTeamSelected={handleTeamSelected} />
        )}
        
        {step === "tutorial" && (
          <FranchiseTutorial onComplete={handleTutorialComplete} />
        )}
        
        {step === "game" && (
          <FranchiseDashboard />
        )}
      </div>
    </FranchiseProvider>
  );
}