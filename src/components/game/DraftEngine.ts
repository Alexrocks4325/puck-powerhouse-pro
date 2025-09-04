import type { UID, LeagueState, Player } from "../../lib/salary-cap";

// -----------------------------------------------------------------------------
// DraftEngine.ts
// Realistic NHL Draft System - 7 rounds, 32 teams, prospects get progressively worse
// -----------------------------------------------------------------------------

export interface DraftPick {
  id: UID;
  round: number;
  pick: number; // overall pick number (1-224)
  originalTeamId: UID;
  currentTeamId: UID; // can be different due to trades
  year: string;
  playerId?: UID; // filled when pick is made
}

export interface DraftProspect {
  id: UID;
  name: string;
  position: "F" | "D" | "G";
  overall: number;
  potential: number; // ceiling they could reach
  age: number;
  heightInches: number;
  weightLbs: number;
  nationality: string;
  draftRank: number; // scout ranking 1-224
  picked?: boolean;
}

export interface DraftState {
  year: string;
  picks: DraftPick[];
  prospects: DraftProspect[];
  currentPick: number; // 0-based index into picks array
  userTeamId: UID;
  isActive: boolean;
}

export class DraftEngine {
  constructor(private league: LeagueState) {}

  /**
   * Generate draft order and prospects for a new draft year
   */
  createDraft(year: string, userTeamId: UID): DraftState {
    const teams = Object.values(this.league.teams);
    const picks = this.generateDraftOrder(teams.map((t: any) => t.id), year);
    const prospects = this.generateProspects();
    
    return {
      year,
      picks,
      prospects,
      currentPick: 0,
      userTeamId,
      isActive: true
    };
  }

  /**
   * Generate 7 rounds of picks (224 total picks for 32 teams)
   */
  private generateDraftOrder(teamIds: UID[], year: string): DraftPick[] {
    const picks: DraftPick[] = [];
    let overallPick = 1;

    // For simplicity, use reverse standings order (worst team picks first)
    // In a real system, you'd use actual standings/lottery results
    const draftOrder = [...teamIds].sort(); // Alphabetical for now

    for (let round = 1; round <= 7; round++) {
      for (let teamIndex = 0; teamIndex < draftOrder.length; teamIndex++) {
        const teamId = draftOrder[teamIndex];
        picks.push({
          id: `pick_${year}_${round}_${teamIndex + 1}`,
          round,
          pick: overallPick,
          originalTeamId: teamId,
          currentTeamId: teamId,
          year
        });
        overallPick++;
      }
    }

    return picks;
  }

  /**
   * Generate realistic prospect pool - gets progressively worse through rounds
   */
  private generateProspects(): DraftProspect[] {
    const prospects: DraftProspect[] = [];
    const firstNames = ["Connor", "Alexander", "William", "Nathan", "Elias", "David", "Matthew", "Jack", "Ryan", "Luke", "Owen", "Dylan", "Carter", "Logan", "Mason"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson"];
    const positions = ["F", "F", "F", "D", "G"]; // F covers C/LW/RW
    const countries = ["Canada", "USA", "Sweden", "Finland", "Russia", "Czech Republic", "Slovakia"];

    for (let rank = 1; rank <= 224; rank++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      
      // Overall rating decreases as draft rank increases
      let overall: number;
      let potential: number;
      
      if (rank <= 10) {
        // Elite prospects (rounds 1-10)
        overall = 65 + Math.floor(Math.random() * 10); // 65-74
        potential = 80 + Math.floor(Math.random() * 15); // 80-94
      } else if (rank <= 32) {
        // First round
        overall = 55 + Math.floor(Math.random() * 15); // 55-69
        potential = 70 + Math.floor(Math.random() * 20); // 70-89
      } else if (rank <= 64) {
        // Second round
        overall = 45 + Math.floor(Math.random() * 15); // 45-59
        potential = 60 + Math.floor(Math.random() * 25); // 60-84
      } else if (rank <= 96) {
        // Third round
        overall = 40 + Math.floor(Math.random() * 12); // 40-51
        potential = 55 + Math.floor(Math.random() * 20); // 55-74
      } else if (rank <= 128) {
        // Fourth round
        overall = 35 + Math.floor(Math.random() * 12); // 35-46
        potential = 50 + Math.floor(Math.random() * 20); // 50-69
      } else if (rank <= 160) {
        // Fifth round
        overall = 30 + Math.floor(Math.random() * 12); // 30-41
        potential = 45 + Math.floor(Math.random() * 20); // 45-64
      } else if (rank <= 192) {
        // Sixth round
        overall = 25 + Math.floor(Math.random() * 12); // 25-36
        potential = 40 + Math.floor(Math.random() * 20); // 40-59
      } else {
        // Seventh round
        overall = 20 + Math.floor(Math.random() * 12); // 20-31
        potential = 35 + Math.floor(Math.random() * 20); // 35-54
      }

      // Goalies are rarer and have different distribution
      const isGoalie = Math.random() < 0.1;
      const position = isGoalie ? "G" : positions[Math.floor(Math.random() * 4)] as "F" | "D" | "G";

      prospects.push({
        id: `prospect_${rank}`,
        name: `${firstName} ${lastName}`,
        position,
        overall,
        potential,
        age: 18 + Math.floor(Math.random() * 2), // 18-19 years old
        heightInches: 66 + Math.floor(Math.random() * 12), // 5'6" to 6'6"
        weightLbs: 160 + Math.floor(Math.random() * 60), // 160-220 lbs
        nationality: countries[Math.floor(Math.random() * countries.length)],
        draftRank: rank,
        picked: false
      });
    }

    return prospects;
  }

  /**
   * Make a draft pick (user or AI)
   */
  makePick(draftState: DraftState, prospectId: UID): boolean {
    if (draftState.currentPick >= draftState.picks.length) return false;
    
    const currentPick = draftState.picks[draftState.currentPick];
    const prospect = draftState.prospects.find(p => p.id === prospectId && !p.picked);
    
    if (!prospect) return false;

    // Create player and add to league
    const player = this.createPlayerFromProspect(prospect, currentPick.currentTeamId);
    this.league.players[player.id] = player;

    // Add to team roster
    const team = this.league.teams[currentPick.currentTeamId];
    team.activeRoster.push(player.id);

    // Mark pick as used and prospect as picked
    currentPick.playerId = player.id;
    prospect.picked = true;

    // Advance to next pick
    draftState.currentPick++;

    return true;
  }

  /**
   * AI makes picks for non-user teams
   */
  simulateAIPick(draftState: DraftState): void {
    if (draftState.currentPick >= draftState.picks.length) return;
    
    const currentPick = draftState.picks[draftState.currentPick];
    
    // AI picks best available prospect with some randomness
    const availableProspects = draftState.prospects
      .filter(p => !p.picked)
      .sort((a, b) => a.draftRank - b.draftRank);

    if (availableProspects.length === 0) return;

    // AI sometimes reaches for players (more randomness in later rounds)
    const randomness = Math.min(10, Math.floor(currentPick.round * 2));
    const pickIndex = Math.floor(Math.random() * Math.min(randomness + 1, availableProspects.length));
    const selectedProspect = availableProspects[pickIndex];

    this.makePick(draftState, selectedProspect.id);
  }

  /**
   * Convert draft prospect to league player
   */
  private createPlayerFromProspect(prospect: DraftProspect, teamId: UID): Player {
    return {
      id: `player_${prospect.id}`,
      name: prospect.name,
      position: prospect.position as "F" | "D" | "G",
      age: prospect.age,
      rightsTeamId: teamId,
      overall: prospect.overall,
      // Entry level contract will be handled separately
      contractId: undefined as any
    };
  }

  /**
   * Advance draft until it's the user's turn or draft is complete
   */
  advanceToUserPick(draftState: DraftState): void {
    while (draftState.currentPick < draftState.picks.length) {
      const currentPick = draftState.picks[draftState.currentPick];
      
      if (currentPick.currentTeamId === draftState.userTeamId) {
        break; // User's turn
      }
      
      this.simulateAIPick(draftState);
    }

    if (draftState.currentPick >= draftState.picks.length) {
      draftState.isActive = false;
    }
  }

  /**
   * Get upcoming picks for a team
   */
  getTeamPicks(draftState: DraftState, teamId: UID): DraftPick[] {
    return draftState.picks
      .slice(draftState.currentPick)
      .filter(pick => pick.currentTeamId === teamId);
  }
}