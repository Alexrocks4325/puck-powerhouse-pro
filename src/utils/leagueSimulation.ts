// Comprehensive NHL League Simulation System
import { nhlPlayerDatabase, Player } from "@/data/nhlPlayerDatabase";

export interface LeagueStats {
  goals: number;
  assists: number;
  points: number;
  gamesPlayed: number;
  plusMinus: number;
  pim: number;
  shots: number;
  hits: number;
  blockedShots: number;
  faceoffWins: number;
  faceoffAttempts: number;
  powerPlayGoals: number;
  shorthandedGoals: number;
  gameWinningGoals: number;
}

export interface GoalieLeagueStats {
  wins: number;
  losses: number;
  otLosses: number;
  saves: number;
  goalsAgainst: number;
  shotsAgainst: number;
  shutouts: number;
  gamesPlayed: number;
  savePercentage: number;
  gaa: number;
}

export interface TeamStandings {
  team: string;
  wins: number;
  losses: number;
  otLosses: number;
  points: number;
  gamesPlayed: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifferential: number;
  powerPlayPercentage: number;
  penaltyKillPercentage: number;
  homeRecord: { wins: number; losses: number; ot: number };
  awayRecord: { wins: number; losses: number; ot: number };
  streak: { type: 'W' | 'L' | 'OT'; count: number };
  lastTenRecord: { wins: number; losses: number; ot: number };
  divisionRank: number;
  conferenceRank: number;
}

export interface GameResult {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  gameType: 'regulation' | 'overtime' | 'shootout';
  homePlayers: Array<{ player: Player; stats: LeagueStats }>;
  awayPlayers: Array<{ player: Player; stats: LeagueStats }>;
  homeGoalie: { player: Player; stats: GoalieLeagueStats };
  awayGoalie: { player: Player; stats: GoalieLeagueStats };
}

export class LeagueSimulation {
  private playerStats: Map<number, LeagueStats> = new Map();
  private goalieStats: Map<number, GoalieLeagueStats> = new Map();
  private teamStandings: Map<string, TeamStandings> = new Map();
  private gameResults: GameResult[] = [];

  constructor() {
    this.initializeStats();
  }

  private initializeStats() {
    // Initialize all players with zero stats
    nhlPlayerDatabase.forEach(player => {
      if (player.position === 'G') {
        this.goalieStats.set(player.id, {
          wins: 0,
          losses: 0,
          otLosses: 0,
          saves: 0,
          goalsAgainst: 0,
          shotsAgainst: 0,
          shutouts: 0,
          gamesPlayed: 0,
          savePercentage: 0.900,
          gaa: 2.50
        });
      } else {
        this.playerStats.set(player.id, {
          goals: 0,
          assists: 0,
          points: 0,
          gamesPlayed: 0,
          plusMinus: 0,
          pim: 0,
          shots: 0,
          hits: 0,
          blockedShots: 0,
          faceoffWins: 0,
          faceoffAttempts: 0,
          powerPlayGoals: 0,
          shorthandedGoals: 0,
          gameWinningGoals: 0
        });
      }
    });

    // Initialize team standings
    const teams = [...new Set(nhlPlayerDatabase.map(p => p.team))];
    teams.forEach(team => {
      this.teamStandings.set(team, {
        team,
        wins: 0,
        losses: 0,
        otLosses: 0,
        points: 0,
        gamesPlayed: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifferential: 0,
        powerPlayPercentage: 0.20,
        penaltyKillPercentage: 0.82,
        homeRecord: { wins: 0, losses: 0, ot: 0 },
        awayRecord: { wins: 0, losses: 0, ot: 0 },
        streak: { type: 'W', count: 0 },
        lastTenRecord: { wins: 0, losses: 0, ot: 0 },
        divisionRank: 0,
        conferenceRank: 0
      });
    });
  }

  // Simulate a single game between two teams
  simulateGame(homeTeam: string, awayTeam: string): GameResult {
    const homePlayers = nhlPlayerDatabase.filter(p => p.team === homeTeam && p.position !== 'G');
    const awayPlayers = nhlPlayerDatabase.filter(p => p.team === awayTeam && p.position !== 'G');
    const homeGoalies = nhlPlayerDatabase.filter(p => p.team === homeTeam && p.position === 'G');
    const awayGoalies = nhlPlayerDatabase.filter(p => p.team === awayTeam && p.position === 'G');

    // Get team overall ratings
    const homeRating = homePlayers.reduce((sum, p) => sum + p.overall, 0) / homePlayers.length;
    const awayRating = awayPlayers.reduce((sum, p) => sum + p.overall, 0) / awayPlayers.length;

    // Home ice advantage
    const homeAdvantage = 2;
    const adjustedHomeRating = homeRating + homeAdvantage;

    // Determine winner and score
    const homeWinProb = adjustedHomeRating / (adjustedHomeRating + awayRating);
    const homeWins = Math.random() < homeWinProb;

    // Generate realistic scores (2-5 goals typical)
    let homeScore, awayScore;
    const baseGoals = 2 + Math.random() * 3; // 2-5 goals average
    
    if (homeWins) {
      homeScore = Math.ceil(baseGoals + Math.random() * 2);
      awayScore = Math.max(0, Math.ceil(baseGoals - 1 - Math.random() * 2));
    } else {
      awayScore = Math.ceil(baseGoals + Math.random() * 2);
      homeScore = Math.max(0, Math.ceil(baseGoals - 1 - Math.random() * 2));
    }

    // Determine game type
    let gameType: 'regulation' | 'overtime' | 'shootout' = 'regulation';
    if (Math.abs(homeScore - awayScore) === 1 && Math.random() < 0.15) {
      gameType = Math.random() < 0.6 ? 'overtime' : 'shootout';
    }

    // Generate player stats for this game
    const homePlayerStats = this.generateGameStats(homePlayers, homeScore, true);
    const awayPlayerStats = this.generateGameStats(awayPlayers, awayScore, false);
    
    // Generate goalie stats
    const homeGoalie = homeGoalies[Math.floor(Math.random() * homeGoalies.length)];
    const awayGoalie = awayGoalies[Math.floor(Math.random() * awayGoalies.length)];
    
    const homeGoalieStats = this.generateGoalieGameStats(homeGoalie, awayScore, homeWins, gameType);
    const awayGoalieStats = this.generateGoalieGameStats(awayGoalie, homeScore, !homeWins, gameType);

    const gameResult: GameResult = {
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      gameType,
      homePlayers: homePlayerStats,
      awayPlayers: awayPlayerStats,
      homeGoalie: { player: homeGoalie, stats: homeGoalieStats },
      awayGoalie: { player: awayGoalie, stats: awayGoalieStats }
    };

    // Update league stats
    this.updateLeagueStats(gameResult);
    this.gameResults.push(gameResult);

    return gameResult;
  }

  private generateGameStats(players: Player[], teamGoals: number, isHome: boolean): Array<{ player: Player; stats: LeagueStats }> {
    const results: Array<{ player: Player; stats: LeagueStats }> = [];
    let goalsLeft = teamGoals;
    let assistsLeft = teamGoals * 1.6; // Average assists per goal

    // Sort players by skill for realistic distribution
    const sortedPlayers = [...players].sort((a, b) => b.overall - a.overall);

    sortedPlayers.forEach(player => {
      const skillFactor = player.overall / 90; // Normalize to 0-1
      const positionFactor = player.position === 'D' ? 0.3 : 1.0; // Defensemen score less
      
      // Goals (higher skill = more goals)
      const goalChance = skillFactor * positionFactor * 0.15;
      const goals = goalsLeft > 0 && Math.random() < goalChance ? 1 : 0;
      goalsLeft = Math.max(0, goalsLeft - goals);

      // Assists (higher skill = more assists)
      const assistChance = skillFactor * 0.25;
      const assists = Math.random() < assistChance && assistsLeft > 0 ? 
        (Math.random() < 0.3 ? 2 : 1) : 0;
      assistsLeft = Math.max(0, assistsLeft - assists);

      // Other stats based on position and skill
      const shots = Math.floor(Math.random() * 6) + (player.position !== 'D' ? 2 : 1);
      const hits = player.position === 'D' ? Math.floor(Math.random() * 4) + 1 : Math.floor(Math.random() * 3);
      const blocks = player.position === 'D' ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 2);
      
      results.push({
        player,
        stats: {
          goals,
          assists,
          points: goals + assists,
          gamesPlayed: 1,
          plusMinus: Math.floor(Math.random() * 7) - 3, // -3 to +3
          pim: Math.random() < 0.3 ? Math.floor(Math.random() * 4) * 2 : 0,
          shots,
          hits,
          blockedShots: blocks,
          faceoffWins: player.position === 'C' ? Math.floor(Math.random() * 20) : 0,
          faceoffAttempts: player.position === 'C' ? Math.floor(Math.random() * 25) + 5 : 0,
          powerPlayGoals: goals > 0 && Math.random() < 0.3 ? 1 : 0,
          shorthandedGoals: goals > 0 && Math.random() < 0.1 ? 1 : 0,
          gameWinningGoals: 0 // Will be set for winner
        }
      });
    });

    return results;
  }

  private generateGoalieGameStats(goalie: Player, goalsAgainst: number, won: boolean, gameType: string): GoalieLeagueStats {
    const shotsAgainst = 25 + Math.floor(Math.random() * 15); // 25-40 shots
    const saves = shotsAgainst - goalsAgainst;
    
    return {
      wins: won ? 1 : 0,
      losses: !won && gameType === 'regulation' ? 1 : 0,
      otLosses: !won && gameType !== 'regulation' ? 1 : 0,
      saves,
      goalsAgainst,
      shotsAgainst,
      shutouts: goalsAgainst === 0 ? 1 : 0,
      gamesPlayed: 1,
      savePercentage: saves / shotsAgainst,
      gaa: goalsAgainst
    };
  }

  // Make this public so user games can update league stats
  updateLeagueStats(game: GameResult) {
    // Update player stats
    [...game.homePlayers, ...game.awayPlayers].forEach(({ player, stats }) => {
      const currentStats = this.playerStats.get(player.id)!;
      this.playerStats.set(player.id, {
        goals: currentStats.goals + stats.goals,
        assists: currentStats.assists + stats.assists,
        points: currentStats.points + stats.points,
        gamesPlayed: currentStats.gamesPlayed + 1,
        plusMinus: currentStats.plusMinus + stats.plusMinus,
        pim: currentStats.pim + stats.pim,
        shots: currentStats.shots + stats.shots,
        hits: currentStats.hits + stats.hits,
        blockedShots: currentStats.blockedShots + stats.blockedShots,
        faceoffWins: currentStats.faceoffWins + stats.faceoffWins,
        faceoffAttempts: currentStats.faceoffAttempts + stats.faceoffAttempts,
        powerPlayGoals: currentStats.powerPlayGoals + stats.powerPlayGoals,
        shorthandedGoals: currentStats.shorthandedGoals + stats.shorthandedGoals,
        gameWinningGoals: currentStats.gameWinningGoals + stats.gameWinningGoals
      });
    });

    // Update goalie stats
    [game.homeGoalie, game.awayGoalie].forEach(({ player, stats }) => {
      const currentStats = this.goalieStats.get(player.id)!;
      this.goalieStats.set(player.id, {
        wins: currentStats.wins + stats.wins,
        losses: currentStats.losses + stats.losses,
        otLosses: currentStats.otLosses + stats.otLosses,
        saves: currentStats.saves + stats.saves,
        goalsAgainst: currentStats.goalsAgainst + stats.goalsAgainst,
        shotsAgainst: currentStats.shotsAgainst + stats.shotsAgainst,
        shutouts: currentStats.shutouts + stats.shutouts,
        gamesPlayed: currentStats.gamesPlayed + 1,
        savePercentage: (currentStats.saves + stats.saves) / (currentStats.shotsAgainst + stats.shotsAgainst),
        gaa: (currentStats.goalsAgainst + stats.goalsAgainst) / (currentStats.gamesPlayed + 1)
      });
    });

    // Update team standings
    const homeStandings = this.teamStandings.get(game.homeTeam)!;
    const awayStandings = this.teamStandings.get(game.awayTeam)!;

    const homeWon = game.homeScore > game.awayScore;
    const isOT = game.gameType !== 'regulation';

    // Update wins/losses/points
    if (homeWon) {
      homeStandings.wins++;
      homeStandings.points += 2;
      homeStandings.homeRecord.wins++;
      
      if (isOT) {
        awayStandings.otLosses++;
        awayStandings.points += 1;
        awayStandings.awayRecord.ot++;
      } else {
        awayStandings.losses++;
        awayStandings.awayRecord.losses++;
      }
    } else {
      awayStandings.wins++;
      awayStandings.points += 2;
      awayStandings.awayRecord.wins++;
      
      if (isOT) {
        homeStandings.otLosses++;
        homeStandings.points += 1;
        homeStandings.homeRecord.ot++;
      } else {
        homeStandings.losses++;
        homeStandings.homeRecord.losses++;
      }
    }

    // Update games played and goals
    homeStandings.gamesPlayed++;
    awayStandings.gamesPlayed++;
    homeStandings.goalsFor += game.homeScore;
    homeStandings.goalsAgainst += game.awayScore;
    awayStandings.goalsFor += game.awayScore;
    awayStandings.goalsAgainst += game.homeScore;
    
    // Update goal differential
    homeStandings.goalDifferential = homeStandings.goalsFor - homeStandings.goalsAgainst;
    awayStandings.goalDifferential = awayStandings.goalsFor - awayStandings.goalsAgainst;

    this.teamStandings.set(game.homeTeam, homeStandings);
    this.teamStandings.set(game.awayTeam, awayStandings);
  }

  // Simulate multiple games for league progression
  simulateGameDay(gamesToSimulate: number = 8): GameResult[] {
    const teams = Array.from(this.teamStandings.keys());
    const results: GameResult[] = [];
    
    // Create realistic matchups
    for (let i = 0; i < gamesToSimulate; i++) {
      const homeTeam = teams[Math.floor(Math.random() * teams.length)];
      let awayTeam;
      do {
        awayTeam = teams[Math.floor(Math.random() * teams.length)];
      } while (awayTeam === homeTeam);
      
      results.push(this.simulateGame(homeTeam, awayTeam));
    }
    
    return results;
  }

  // Get current league leaders
  getLeagueLeaders() {
    const playerLeaders = Array.from(this.playerStats.entries())
      .map(([id, stats]) => ({
        player: nhlPlayerDatabase.find(p => p.id === id)!,
        stats
      }))
      .filter(entry => entry.stats.gamesPlayed > 0)
      .sort((a, b) => b.stats.points - a.stats.points);

    const goalieLeaders = Array.from(this.goalieStats.entries())
      .map(([id, stats]) => ({
        player: nhlPlayerDatabase.find(p => p.id === id)!,
        stats
      }))
      .filter(entry => entry.stats.gamesPlayed > 0)
      .sort((a, b) => b.stats.wins - a.stats.wins);

    return { playerLeaders, goalieLeaders };
  }

  // Get current standings
  getStandings() {
    return Array.from(this.teamStandings.values())
      .sort((a, b) => b.points - a.points || (b.wins - a.wins));
  }

  // Get team comparison
  getTeamComparison(teamName: string) {
    const team = this.teamStandings.get(teamName);
    if (!team) return null;

    const allTeams = this.getStandings();
    const teamRank = allTeams.findIndex(t => t.team === teamName) + 1;
    
    return {
      team,
      leagueRank: teamRank,
      totalTeams: allTeams.length
    };
  }

  // Add a game result directly (for user games)
  addGameResult(game: GameResult) {
    this.gameResults.push(game);
    
    // Ensure "Your Team" exists in standings
    if (!this.teamStandings.has("Your Team")) {
      this.teamStandings.set("Your Team", {
        team: "Your Team",
        wins: 0,
        losses: 0,
        otLosses: 0,
        points: 0,
        gamesPlayed: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifferential: 0,
        powerPlayPercentage: 0.20,
        penaltyKillPercentage: 0.82,
        homeRecord: { wins: 0, losses: 0, ot: 0 },
        awayRecord: { wins: 0, losses: 0, ot: 0 },
        streak: { type: 'W', count: 0 },
        lastTenRecord: { wins: 0, losses: 0, ot: 0 },
        divisionRank: 0,
        conferenceRank: 0
      });
    }
  }

  // Get recent games
  getRecentGames(count: number = 10) {
    return this.gameResults.slice(-count);
  }

  // Get specific team's recent games
  getTeamRecentGames(teamName: string, count: number = 5) {
    return this.gameResults
      .filter(game => game.homeTeam === teamName || game.awayTeam === teamName)
      .slice(-count);
  }
}

// Create global league instance
export const globalLeague = new LeagueSimulation();
