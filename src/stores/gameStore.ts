import { defineStore } from 'pinia';
import { ref, computed, watch, nextTick } from 'vue';
import type { Player, MatchFormat, GamePhase, MatchSetup, GameResult } from '../types';
import { BanService } from '../services/BanService';
import { StageService } from '../services/StageService';

export const useGameStore = defineStore('game', () => {
  // State
  const players = ref<[Player, Player]>([
    { id: 0, name: 'Player 1', score: 0 },
    { id: 1, name: 'Player 2', score: 0 },
  ]);

  const matchFormat = ref<MatchFormat>('BO3');
  const currentGame = ref(1);
  const currentPhase = ref<GamePhase>('setup');
  const banOrder = ref<number[]>([]);
  const currentBanIndex = ref(0);
  const stageBans = ref<Map<string, number>>(new Map());
  const selectedStage = ref<string | null>(null);
  const gentlemansAgreement = ref(false);
  const gameHistory = ref<GameResult[]>([]);

  // Ensure stageBans is properly restored after persistence
  watch(stageBans, (newStageBans) => {
    // If stageBans is somehow not a Map after restoration, fix it
    if (!(newStageBans instanceof Map)) {
      console.warn('stageBans was not a Map, fixing...');
      if (Array.isArray(newStageBans)) {
        stageBans.value = new Map(newStageBans);
      } else {
        stageBans.value = new Map();
      }
    }
  }, { immediate: true });

  // Getters
  const currentPlayer = computed(() => {
    if (currentPhase.value !== 'banning') return null;
    if (currentBanIndex.value >= banOrder.value.length) return null;
    return players.value[banOrder.value[currentBanIndex.value]];
  });

  const isSetComplete = computed(() => {
    const winThreshold = matchFormat.value === 'BO3' ? 2 : 3;
    return players.value.some(player => player.score >= winThreshold);
  });

  const setWinner = computed(() => {
    if (!isSetComplete.value) return null;
    return players.value.find(player => {
      const winThreshold = matchFormat.value === 'BO3' ? 2 : 3;
      return player.score >= winThreshold;
    }) || null;
  });

  const remainingStages = computed(() => {
    const bannedStageIds = Array.from(stageBans.value.keys());
    return StageService.getAvailableStages(bannedStageIds);
  });

  const bannedStages = computed(() => {
    const bannedStageIds = Array.from(stageBans.value.keys());
    return StageService.getBannedStages(bannedStageIds);
  });

  const currentBanPhase = computed(() => {
    return BanService.getCurrentBanPhase({
      players: players.value,
      matchFormat: matchFormat.value,
      currentGame: currentGame.value,
      currentPhase: currentPhase.value,
      banOrder: banOrder.value,
      currentBanIndex: currentBanIndex.value,
      stageBans: stageBans.value,
      selectedStage: selectedStage.value,
      gentlemansAgreement: gentlemansAgreement.value,
      gameHistory: gameHistory.value,
    });
  });

  const isReadyForSelection = computed(() => {
    return BanService.isReadyForSelection({
      players: players.value,
      matchFormat: matchFormat.value,
      currentGame: currentGame.value,
      currentPhase: currentPhase.value,
      banOrder: banOrder.value,
      currentBanIndex: currentBanIndex.value,
      stageBans: stageBans.value,
      selectedStage: selectedStage.value,
      gentlemansAgreement: gentlemansAgreement.value,
      gameHistory: gameHistory.value,
    });
  });

  // Actions
  function setupMatch(setup: MatchSetup) {
    players.value = [
      { id: 0, name: setup.player1Name, score: 0 },
      { id: 1, name: setup.player2Name, score: 0 },
    ];
    
    matchFormat.value = setup.matchFormat;
    currentGame.value = 1;
    gentlemansAgreement.value = setup.gentlemansAgreement;
    
    if (setup.gentlemansAgreement) {
      // Skip banning, go straight to selection
      currentPhase.value = 'selecting';
      banOrder.value = [];
      currentBanIndex.value = 0;
    } else {
      // Setup normal ban order
      currentPhase.value = 'banning';
      banOrder.value = BanService.calculateGame1BanOrder(setup.firstBan);
      currentBanIndex.value = 0;
    }
    
    // Reset stage state
    stageBans.value.clear();
    selectedStage.value = null;
    gameHistory.value = [];
  }

  function banStage(stageId: string) {
    if (!BanService.canBanStage({
      players: players.value,
      matchFormat: matchFormat.value,
      currentGame: currentGame.value,
      currentPhase: currentPhase.value,
      banOrder: banOrder.value,
      currentBanIndex: currentBanIndex.value,
      stageBans: stageBans.value,
      selectedStage: selectedStage.value,
      gentlemansAgreement: gentlemansAgreement.value,
      gameHistory: gameHistory.value,
    }, stageId)) {
      throw new Error(`Cannot ban stage ${stageId} at this time`);
    }

    const currentPlayerIndex = banOrder.value[currentBanIndex.value];
    stageBans.value.set(stageId, currentPlayerIndex);
    currentBanIndex.value++;

    // Check if we should move to selection phase
    const totalBans = currentGame.value === 1 
      ? StageService.getGame1BanCount() 
      : StageService.getGames2PlusBanCount();
    
    if (stageBans.value.size >= totalBans) {
      currentPhase.value = 'selecting';
    }
  }

  function selectStage(stageId: string) {
    if (!BanService.canSelectStage({
      players: players.value,
      matchFormat: matchFormat.value,
      currentGame: currentGame.value,
      currentPhase: currentPhase.value,
      banOrder: banOrder.value,
      currentBanIndex: currentBanIndex.value,
      stageBans: stageBans.value,
      selectedStage: selectedStage.value,
      gentlemansAgreement: gentlemansAgreement.value,
      gameHistory: gameHistory.value,
    }, stageId)) {
      throw new Error(`Cannot select stage ${stageId} at this time`);
    }

    selectedStage.value = stageId;
    currentPhase.value = 'winner-select';
  }

  function declareWinner(playerIndex: number) {
    // Increment winner's score
    players.value[playerIndex].score++;

    // Record game result
    const gameResult: GameResult = {
      gameNumber: currentGame.value,
      winner: playerIndex,
      selectedStage: selectedStage.value!,
      stageBans: Array.from(stageBans.value.entries()).map(([stageId, playerIndex]) => ({
        stageId,
        playerIndex,
      })),
    };
    gameHistory.value.push(gameResult);

    // Check if set is complete
    if (isSetComplete.value) {
      currentPhase.value = 'set-complete';
      return;
    }

    // Prepare for next game
    currentGame.value++;
    
    // Reset stage state
    stageBans.value.clear();
    selectedStage.value = null;
    currentBanIndex.value = 0;

    if (gentlemansAgreement.value) {
      // Skip banning for next game too
      currentPhase.value = 'selecting';
      banOrder.value = [];
    } else {
      // Setup ban order for next game
      const winner = playerIndex;
      banOrder.value = BanService.calculateGames2PlusBanOrder(winner);
      currentPhase.value = 'banning';
    }
  }

  function resetMatch() {
    players.value = [
      { id: 0, name: players.value[0].name, score: 0 },
      { id: 1, name: players.value[1].name, score: 0 },
    ];
    currentGame.value = 1;
    currentPhase.value = 'setup';
    banOrder.value = [];
    currentBanIndex.value = 0;
    stageBans.value.clear();
    selectedStage.value = null;
    gameHistory.value = [];
  }

  function resetToSetup() {
    currentPhase.value = 'setup';
    banOrder.value = [];
    currentBanIndex.value = 0;
    stageBans.value.clear();
    selectedStage.value = null;
  }

  function updatePlayerName(playerIndex: number, name: string) {
    if (playerIndex >= 0 && playerIndex < players.value.length) {
      players.value[playerIndex].name = name;
    }
  }

  function updatePlayerScore(playerIndex: number, score: number) {
    if (playerIndex >= 0 && playerIndex < players.value.length) {
      players.value[playerIndex].score = Math.max(0, score);
    }
  }

  function enableGentlemansAgreement() {
    gentlemansAgreement.value = true;
    currentPhase.value = 'selecting';
    stageBans.value.clear(); // Clear any existing bans
    banOrder.value = [];
    currentBanIndex.value = 0;
  }

  function disableGentlemansAgreement() {
    gentlemansAgreement.value = false;
    // Reset to appropriate phase based on current game
    currentPhase.value = 'banning';
    stageBans.value.clear();
    
    if (currentGame.value === 1) {
      // For game 1, we need to set up the initial ban order
      // Default to player 1 first, but this could be made configurable
      banOrder.value = BanService.calculateGame1BanOrder(0);
    } else {
      // For games 2+, we need to determine who won the previous game
      // This is a bit complex, so let's use the last game result
      if (gameHistory.value.length > 0) {
        const lastGame = gameHistory.value[gameHistory.value.length - 1];
        banOrder.value = BanService.calculateGames2PlusBanOrder(lastGame.winner);
      } else {
        // Fallback: default to player 1 first
        banOrder.value = [0, 1];
      }
    }
    currentBanIndex.value = 0;
  }

  function clearBans() {
    stageBans.value.clear();
    currentBanIndex.value = 0;
    // Reset to banning phase if we were in selection phase
    if (currentPhase.value === 'selecting') {
      currentPhase.value = 'banning';
    }
  }

  function validateRestoredState() {
    // Ensure stageBans is a Map
    if (!(stageBans.value instanceof Map)) {
      console.warn('stageBans was not a Map after restoration, fixing...');
      if (Array.isArray(stageBans.value)) {
        stageBans.value = new Map(stageBans.value);
      } else {
        stageBans.value = new Map();
      }
    }
    
    // Ensure banOrder is an array
    if (!Array.isArray(banOrder.value)) {
      console.warn('banOrder was not an array after restoration, fixing...');
      banOrder.value = [];
    }
    
    // Ensure currentBanIndex is a number
    if (typeof currentBanIndex.value !== 'number') {
      console.warn('currentBanIndex was not a number after restoration, fixing...');
      currentBanIndex.value = 0;
    }
    
    // Ensure currentPhase is valid
    const validPhases: GamePhase[] = ['setup', 'banning', 'selecting', 'winner-select', 'set-complete'];
    if (!validPhases.includes(currentPhase.value)) {
      console.warn('currentPhase was invalid after restoration, fixing...');
      currentPhase.value = 'setup';
    }
    
    // Ensure currentGame is a number
    if (typeof currentGame.value !== 'number') {
      console.warn('currentGame was not a number after restoration, fixing...');
      currentGame.value = 1;
    }
    
    // Ensure players array is valid
    if (!Array.isArray(players.value) || players.value.length !== 2) {
      console.warn('players array was invalid after restoration, fixing...');
      players.value = [
        { id: 0, name: 'Player 1', score: 0 },
        { id: 1, name: 'Player 2', score: 0 },
      ];
    }
    
    // Ensure gameHistory is an array
    if (!Array.isArray(gameHistory.value)) {
      console.warn('gameHistory was not an array after restoration, fixing...');
      gameHistory.value = [];
    }
    
    // Ensure gentlemansAgreement is a boolean
    if (typeof gentlemansAgreement.value !== 'boolean') {
      console.warn('gentlemansAgreement was not a boolean after restoration, fixing...');
      gentlemansAgreement.value = false;
    }
    
    // Ensure matchFormat is valid
    const validFormats: MatchFormat[] = ['BO3', 'BO5'];
    if (!validFormats.includes(matchFormat.value)) {
      console.warn('matchFormat was invalid after restoration, fixing...');
      matchFormat.value = 'BO3';
    }
    
    // Ensure selectedStage is either null or a string
    if (selectedStage.value !== null && typeof selectedStage.value !== 'string') {
      console.warn('selectedStage was invalid after restoration, fixing...');
      selectedStage.value = null;
    }
    
    console.log('Store state validated and fixed after restoration:', {
      currentPhase: currentPhase.value,
      currentGame: currentGame.value,
      currentBanIndex: currentBanIndex.value,
      banOrder: banOrder.value,
      stageBansSize: stageBans.value.size,
      players: players.value,
      gentlemansAgreement: gentlemansAgreement.value
    });
  }

  return {
    // State
    players,
    matchFormat,
    currentGame,
    currentPhase,
    banOrder,
    currentBanIndex,
    stageBans,
    selectedStage,
    gentlemansAgreement,
    gameHistory,
    
    // Getters
    currentPlayer,
    isSetComplete,
    setWinner,
    remainingStages,
    bannedStages,
    currentBanPhase,
    isReadyForSelection,
    
    // Actions
    setupMatch,
    banStage,
    selectStage,
    declareWinner,
    resetMatch,
    resetToSetup,
    updatePlayerName,
    updatePlayerScore,
    enableGentlemansAgreement,
    disableGentlemansAgreement,
    clearBans,
    validateRestoredState,
  };
}, {
  persist: {
    key: 'smash-eu-game-state',
    storage: localStorage,
    // Custom serialization to handle Map objects
    serializer: {
      serialize: (value: any) => {
        // Convert Map to array for serialization
        const serialized = { ...value };
        if (serialized.stageBans instanceof Map) {
          serialized.stageBans = Array.from(serialized.stageBans.entries());
        }
        return JSON.stringify(serialized);
      },
      deserialize: (value: string) => {
        const parsed = JSON.parse(value);
        // Convert array back to Map
        if (parsed.stageBans && Array.isArray(parsed.stageBans)) {
          parsed.stageBans = new Map(parsed.stageBans);
        }
        return parsed;
      }
    }
  }
});
