import { nhlPlayerDatabase, Player as DatabasePlayer } from '@/data/nhlPlayerDatabase';

export interface Player {
  id: string;
  name: string;
  position: 'C' | 'LW' | 'RW' | 'D' | 'G';
  team: 'home' | 'away';
  stats: {
    goals: number;
    assists: number;
    shots: number;
    hits: number;
    saves?: number;
  };
  overall: number;
}

export interface GameStats {
  homeShots: number;
  awayShots: number;
  homeFaceoffWins: number;
  awayFaceoffWins: number;
  homePenalties: number;
  awayPenalties: number;
  homeHits: number;
  awayHits: number;
}

export interface GameClock {
  period: number;
  minutes: number;
  seconds: number;
  isRunning: boolean;
}

// Team abbreviations to full names mapping
const TEAM_NAMES: { [key: string]: string } = {
  'CBJ': 'Columbus Blue Jackets',
  'NYI': 'New York Islanders',
  'SJS': 'San Jose Sharks',
  'ANA': 'Anaheim Ducks',
  'SEA': 'Seattle Kraken',
  'CGY': 'Calgary Flames',
  'VAN': 'Vancouver Canucks',
  'EDM': 'Edmonton Oilers',
  'LAK': 'Los Angeles Kings',
  'VGK': 'Vegas Golden Knights',
  'COL': 'Colorado Avalanche',
  'DAL': 'Dallas Stars',
  'MIN': 'Minnesota Wild',
  'NSH': 'Nashville Predators',
  'STL': 'St. Louis Blues',
  'WPG': 'Winnipeg Jets',
  'CHI': 'Chicago Blackhawks',
  'UTA': 'Utah Hockey Club',
  'BOS': 'Boston Bruins',
  'BUF': 'Buffalo Sabres',
  'DET': 'Detroit Red Wings',
  'FLA': 'Florida Panthers',
  'MTL': 'Montreal Canadiens',
  'OTT': 'Ottawa Senators',
  'TBL': 'Tampa Bay Lightning',
  'TOR': 'Toronto Maple Leafs',
  'CAR': 'Carolina Hurricanes',
  'NJD': 'New Jersey Devils',
  'NYR': 'New York Rangers',
  'PHI': 'Philadelphia Flyers',
  'PIT': 'Pittsburgh Penguins',
  'WSH': 'Washington Capitals'
};

export class GameEngine {
  private static instance: GameEngine;
  private homeTeamCode: string = 'TOR';
  private awayTeamCode: string = 'MTL';

  static getInstance(): GameEngine {
    if (!GameEngine.instance) {
      GameEngine.instance = new GameEngine();
    }
    return GameEngine.instance;
  }

  // Action probabilities (percentages)
  private readonly PROBABILITIES = {
    SHOT: {
      GOAL: 12, // 12% chance of goal
      SAVE: 73, // 73% chance of save
      MISS: 15  // 15% chance of miss
    },
    PASS: {
      SUCCESS: 85, // 85% success rate
      TURNOVER: 15 // 15% turnover rate
    },
    CHECK: {
      SUCCESS: 70,  // 70% successful hit
      PENALTY: 20,  // 20% chance of penalty
      MISS: 10      // 10% chance of miss
    },
    SPECIAL_MOVE: {
      SUCCESS: 45,  // 45% success rate
      FAIL: 55      // 55% failure rate
    }
  };

  setTeams(homeTeam: string, awayTeam: string) {
    this.homeTeamCode = homeTeam;
    this.awayTeamCode = awayTeam;
  }

  private convertDatabasePlayerToGamePlayer(dbPlayer: DatabasePlayer, team: 'home' | 'away'): Player {
    return {
      id: dbPlayer.id.toString(),
      name: dbPlayer.name,
      position: dbPlayer.position,
      team,
      overall: dbPlayer.overall,
      stats: {
        goals: 0,
        assists: 0,
        shots: 0,
        hits: 0,
        ...(dbPlayer.position === 'G' && { saves: 0 })
      }
    };
  }

  private getTeamRoster(teamCode: string): DatabasePlayer[] {
    return nhlPlayerDatabase.filter(player => player.team === teamCode);
  }

  getCurrentLineup(team: 'home' | 'away'): Player[] {
    const teamCode = team === 'home' ? this.homeTeamCode : this.awayTeamCode;
    const roster = this.getTeamRoster(teamCode);
    
    // Get top players by position for starting lineup
    const centers = roster.filter(p => p.position === 'C').sort((a, b) => b.overall - a.overall).slice(0, 2);
    const wingers = roster.filter(p => p.position === 'LW' || p.position === 'RW').sort((a, b) => b.overall - a.overall).slice(0, 2);
    const defensemen = roster.filter(p => p.position === 'D').sort((a, b) => b.overall - a.overall).slice(0, 2);
    const goalies = roster.filter(p => p.position === 'G').sort((a, b) => b.overall - a.overall).slice(0, 1);

    const lineup = [...centers, ...wingers, ...defensemen, ...goalies];
    return lineup.map(player => this.convertDatabasePlayerToGamePlayer(player, team));
  }

  generateOutcome(action: 'SHOT' | 'PASS' | 'CHECK' | 'SPECIAL_MOVE'): string {
    const random = Math.random() * 100;

    switch (action) {
      case 'SHOT':
        const shotProbs = this.PROBABILITIES.SHOT;
        if (random < shotProbs.GOAL) return 'Goal';
        if (random < shotProbs.GOAL + shotProbs.SAVE) return 'Save';
        return 'Miss';

      case 'PASS':
        const passProbs = this.PROBABILITIES.PASS;
        return random < passProbs.SUCCESS ? 'Success' : 'Turnover';

      case 'CHECK':
        const checkProbs = this.PROBABILITIES.CHECK;
        if (random < checkProbs.SUCCESS) return 'Hit';
        if (random < checkProbs.SUCCESS + checkProbs.PENALTY) return 'Penalty';
        return 'Miss';

      case 'SPECIAL_MOVE':
        const specialProbs = this.PROBABILITIES.SPECIAL_MOVE;
        return random < specialProbs.SUCCESS ? 'Success' : 'Fail';

      default:
        return 'Unknown';
    }
  }

  getRandomPlayer(team: 'home' | 'away', position?: Player['position']): Player {
    const lineup = this.getCurrentLineup(team);
    const filteredLineup = position ? lineup.filter(p => p.position === position) : lineup;
    return filteredLineup[Math.floor(Math.random() * filteredLineup.length)];
  }

  formatTime(minutes: number, seconds: number): string {
    const mins = Math.floor(minutes);
    const secs = Math.floor(seconds);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getRandomEventMessage(eventType: string, player: Player): string {
    const messages = {
      'Goal': [
        `${player.name} finds the back of the net!`,
        `What a shot by ${player.name}!`,
        `${player.name} scores a beauty!`,
        `Absolute snipe by ${player.name}!`
      ],
      'Save': [
        `Outstanding save by the goaltender!`,
        `What a glove save!`,
        `Spectacular stop!`,
        `Robbery! The goalie says no!`
      ],
      'Miss': [
        `Shot goes wide of the net`,
        `Just over the crossbar!`,
        `Close but no cigar!`,
        `Inches away from a goal!`
      ],
      'Hit': [
        `Thunderous body check by ${player.name}!`,
        `${player.name} delivers a crushing hit!`,
        `What a hit along the boards!`,
        `${player.name} throws the body!`
      ],
      'Success': [
        `Beautiful play by ${player.name}!`,
        `${player.name} makes it happen!`,
        `Skillful move by ${player.name}!`,
        `${player.name} with the dazzling play!`
      ],
      'Turnover': [
        `Turnover! Puck stripped away!`,
        `Pass intercepted!`,
        `Loose puck battle!`,
        `Change of possession!`
      ]
    };

    const eventMessages = messages[eventType] || [`${eventType} by ${player.name}`];
    return eventMessages[Math.floor(Math.random() * eventMessages.length)];
  }

  getTeamName(teamCode: string): string {
    return TEAM_NAMES[teamCode] || teamCode;
  }
}