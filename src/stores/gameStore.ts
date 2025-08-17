import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
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
  };
});
