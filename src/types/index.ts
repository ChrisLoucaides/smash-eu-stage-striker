// Core player interface
export interface Player {
  id: number;
  name: string;
  score: number;
}

// Stage information interface
export interface Stage {
  id: string;
  name: string;
  imageUrl: string;
  isLegal: boolean;
}

// Match format types
export type MatchFormat = 'BO3' | 'BO5';

// Game phase types
export type GamePhase = 'setup' | 'banning' | 'selecting' | 'winner-select' | 'set-complete';

// Ban order configuration
export interface BanOrder {
  playerIndex: number;
  phase: 'banning' | 'selecting';
}

// Main game state interface
export interface GameState {
  // Player information
  players: [Player, Player];
  
  // Match configuration
  matchFormat: MatchFormat;
  currentGame: number;
  
  // Game flow
  currentPhase: GamePhase;
  banOrder: number[];
  currentBanIndex: number;
  
  // Stage management
  stageBans: Map<string, number>; // stageId -> playerIndex
  selectedStage: string | null;
  
  // Special rules
  gentlemansAgreement: boolean;
  
  // Match history
  gameHistory: GameResult[];
}

// Game result interface
export interface GameResult {
  gameNumber: number;
  winner: number; // player index
  selectedStage: string;
  stageBans: Array<{ stageId: string; playerIndex: number }>;
}

// Setup configuration interface
export interface MatchSetup {
  player1Name: string;
  player2Name: string;
  matchFormat: MatchFormat;
  firstBan: number; // 0 for player 1, 1 for player 2
  gentlemansAgreement: boolean;
}

// Ban phase information
export interface BanPhase {
  currentPlayer: number;
  remainingBans: number;
  totalBans: number;
  phase: 'banning' | 'selecting';
}

// Stage selection result
export interface StageSelection {
  stageId: string;
  playerIndex: number;
  action: 'ban' | 'select';
}
