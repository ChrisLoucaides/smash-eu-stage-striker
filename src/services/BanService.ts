import type { GameState, GamePhase, BanPhase } from '../types';
import { StageService } from './StageService';

export class BanService {
  /**
   * Calculate the ban order for Game 1 (3-4-1 striking)
   * @param firstBan - Player index who goes first (0 or 1)
   * @returns Array of player indices representing the ban order
   */
  static calculateGame1BanOrder(firstBan: number): number[] {
    const secondBan = 1 - firstBan;
    
    // Game 1: 3-4-1 striking
    // First player bans 3, second player bans 4, first player selects from remaining 2
    return [
      firstBan,   // Ban 1
      firstBan,   // Ban 2
      firstBan,   // Ban 3
      secondBan,  // Ban 4
      secondBan,  // Ban 5
      secondBan,  // Ban 6
      secondBan,  // Ban 7
    ];
  }

  /**
   * Calculate the ban order for Games 2+ (winner bans 3, loser picks)
   * @param winner - Player index of the winner
   * @returns Array of player indices representing the ban order
   */
  static calculateGames2PlusBanOrder(winner: number): number[] {
    // Games 2+: Winner bans 3 stages, loser picks from remaining 6
    return [winner, winner, winner];
  }

  /**
   * Get current ban phase information
   * @param gameState - Current game state
   * @returns BanPhase object with current information
   */
  static getCurrentBanPhase(gameState: GameState): BanPhase {
    const totalBans = gameState.currentGame === 1 
      ? StageService.getGame1BanCount() 
      : StageService.getGames2PlusBanCount();
    
    const currentBanIndex = gameState.currentBanIndex;
    const remainingBans = totalBans - currentBanIndex;
    
    let phase: 'banning' | 'selecting';
    if (currentBanIndex < totalBans) {
      phase = 'banning';
    } else {
      phase = 'selecting';
    }
    
    return {
      currentPlayer: gameState.banOrder[currentBanIndex] || 0,
      remainingBans,
      totalBans,
      phase,
    };
  }

  /**
   * Check if a stage can be banned by the current player
   * @param gameState - Current game state
   * @param stageId - Stage ID to check
   * @returns True if the stage can be banned
   */
  static canBanStage(gameState: GameState, stageId: string): boolean {
    // Must be in banning phase
    if (gameState.currentPhase !== 'banning') {
      return false;
    }
    
    // Stage must not already be banned
    if (gameState.stageBans.has(stageId)) {
      return false;
    }
    
    // Must be current player's turn
    const currentBanIndex = gameState.currentBanIndex;
    if (currentBanIndex >= gameState.banOrder.length) {
      return false;
    }
    
    const currentPlayer = gameState.banOrder[currentBanIndex];
    return currentPlayer === gameState.banOrder[currentBanIndex];
  }

  /**
   * Check if a stage can be selected
   * @param gameState - Current game state
   * @param stageId - Stage ID to check
   * @returns True if the stage can be selected
   */
  static canSelectStage(gameState: GameState, stageId: string): boolean {
    // Must be in selecting phase
    if (gameState.currentPhase !== 'selecting') {
      return false;
    }
    
    // Stage must not be banned
    if (gameState.stageBans.has(stageId)) {
      return false;
    }
    
    // Stage must not already be selected
    if (gameState.selectedStage === stageId) {
      return false;
    }
    
    return true;
  }

  /**
   * Ban a stage
   * @param gameState - Current game state
   * @param stageId - Stage ID to ban
   * @returns Updated game state
   */
  static banStage(gameState: GameState, stageId: string): GameState {
    if (!this.canBanStage(gameState, stageId)) {
      throw new Error(`Cannot ban stage ${stageId} at this time`);
    }
    
    const currentBanIndex = gameState.currentBanIndex;
    const currentPlayer = gameState.banOrder[currentBanIndex];
    
    // Create new stage bans map
    const newStageBans = new Map(gameState.stageBans);
    newStageBans.set(stageId, currentPlayer);
    
    // Check if we should move to selection phase
    const totalBans = gameState.currentGame === 1 
      ? StageService.getGame1BanCount() 
      : StageService.getGames2PlusBanCount();
    
    let newPhase: GamePhase = gameState.currentPhase;
    if (newStageBans.size >= totalBans) {
      newPhase = 'selecting';
    }
    
    return {
      ...gameState,
      stageBans: newStageBans,
      currentBanIndex: currentBanIndex + 1,
      currentPhase: newPhase,
    };
  }

  /**
   * Select a stage
   * @param gameState - Current game state
   * @param stageId - Stage ID to select
   * @returns Updated game state
   */
  static selectStage(gameState: GameState, stageId: string): GameState {
    if (!this.canSelectStage(gameState, stageId)) {
      throw new Error(`Cannot select stage ${stageId} at this time`);
    }
    
    return {
      ...gameState,
      selectedStage: stageId,
      currentPhase: 'winner-select',
    };
  }

  /**
   * Get available stages for selection
   * @param gameState - Current game state
   * @returns Array of available stages
   */
  static getAvailableStagesForSelection(gameState: GameState): string[] {
    const bannedStageIds = Array.from(gameState.stageBans.keys());
    return StageService.getAvailableStages(bannedStageIds).map(stage => stage.id);
  }

  /**
   * Check if the current game is ready for stage selection
   * @param gameState - Current game state
   * @returns True if ready for selection
   */
  static isReadyForSelection(gameState: GameState): boolean {
    const totalBans = gameState.currentGame === 1 
      ? StageService.getGame1BanCount() 
      : StageService.getGames2PlusBanCount();
    
    return gameState.stageBans.size >= totalBans;
  }

  /**
   * Get the player who should be selecting a stage
   * @param gameState - Current game state
   * @returns Player index who should select
   */
  static getStageSelector(gameState: GameState): number {
    if (gameState.currentGame === 1) {
      // For Game 1, the first player in the ban order gets to select
      return gameState.banOrder[0];
    } else {
      // For Games 2+, the loser of the previous game gets to select
      const winner = gameState.players[0].score > gameState.players[1].score ? 0 : 1;
      return 1 - winner;
    }
  }
}
