<template>
  <div class="stage-grid-container">
    <div class="stage-grid">
      <div
        v-for="stage in stages"
        :key="stage.id"
        class="stage-item"
        :class="{
          'banned': isBanned(stage.id),
          'banned-by-player-1': isBannedByPlayer(stage.id, 0),
          'banned-by-player-2': isBannedByPlayer(stage.id, 1),
          'selected': isSelected(stage.id),
          'interactive': canInteractWithStage(stage.id),
          'current-turn': isCurrentPlayerTurn(stage.id)
        }"
        @click="handleStageClick(stage.id)"
        @keydown.enter="handleStageClick(stage.id)"
        @keydown.space="handleStageClick(stage.id)"
        role="button"
        :tabindex="canInteractWithStage(stage.id) ? 0 : -1"
        :aria-label="getStageAriaLabel(stage)"
        :aria-disabled="!canInteractWithStage(stage.id)"
      >
        <div class="stage-image-container">
          <img 
            :src="stage.imageUrl" 
            :alt="stage.name"
            class="stage-image"
            @error="handleImageError"
          />
          <div class="stage-overlay">
            <div v-if="isBanned(stage.id)" class="ban-indicator">
              <span class="ban-text">BANNED</span>
              <span class="ban-player">{{ getBanningPlayerName(stage.id) }}</span>
            </div>
            <div v-else-if="isSelected(stage.id)" class="selection-indicator">
              <span class="selection-text">SELECTED</span>
            </div>
            <div v-else-if="canInteractWithStage(stage.id)" class="action-hint">
              <span v-if="currentPhase === 'banning'" class="hint-text">Click to Ban</span>
              <span v-else-if="currentPhase === 'selecting'" class="hint-text">Click to Select</span>
            </div>
          </div>
        </div>
        <div class="stage-name">{{ stage.name }}</div>
      </div>
    </div>
    
    <!-- Game Status Display -->
    <div v-if="currentPhase !== 'setup'" class="game-status">
      <div v-if="currentPhase === 'banning'" class="status-message">
        <span class="player-name" :class="{ 'player-1': isPlayer1Turn, 'player-2': !isPlayer1Turn }">
          {{ currentPlayerName }}
        </span>
        <span class="status-text"> is banning</span>
        <span class="ban-count">({{ remainingBans }} remaining)</span>
      </div>
      <div v-else-if="currentPhase === 'selecting'" class="status-message">
        <div v-if="gameStore.gentlemansAgreement" class="gentlemans-status">
          <span class="status-text">Gentleman's Agreement: Select any stage</span>
        </div>
        <div v-else>
          <span class="player-name" :class="{ 'player-1': isLoserPlayer1, 'player-2': !isLoserPlayer1 }">
            {{ loserName }}
          </span>
          <span class="status-text"> is selecting a stage</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '../stores/gameStore';
import { StageService } from '../services/StageService';
import type { Stage } from '../types';

const gameStore = useGameStore();

// Get all stages from the service
const stages = computed(() => StageService.getAllStages());

// Computed properties for game state
const currentPhase = computed(() => gameStore.currentPhase);
const currentPlayer = computed(() => gameStore.currentPlayer);
const stageBans = computed(() => gameStore.stageBans);
const selectedStage = computed(() => gameStore.selectedStage);
const currentBanPhase = computed(() => gameStore.currentBanPhase);

// Player turn information
const isPlayer1Turn = computed(() => {
  if (currentPhase.value !== 'banning') return false;
  return currentPlayer.value?.id === 0;
});

const currentPlayerName = computed(() => {
  return currentPlayer.value?.name || 'Unknown Player';
});

const remainingBans = computed(() => {
  return currentBanPhase.value?.remainingBans || 0;
});

const loserName = computed(() => {
  if (gameStore.currentGame === 1) {
    // For Game 1, the first player in the ban order gets to select
    return gameStore.players[gameStore.banOrder[0] || 0]?.name || 'Unknown Player';
  } else {
    // For Games 2+, the loser gets to select
    const winner = gameStore.players[0].score > gameStore.players[1].score ? 0 : 1;
    const loser = 1 - winner;
    return gameStore.players[loser]?.name || 'Unknown Player';
  }
});

const isLoserPlayer1 = computed(() => {
  if (gameStore.currentGame === 1) {
    return gameStore.banOrder[0] === 0;
  } else {
    const winner = gameStore.players[0].score > gameStore.players[1].score ? 0 : 1;
    return winner !== 0;
  }
});

// Stage state checks
const isBanned = (stageId: string): boolean => {
  return stageBans.value.has(stageId);
};

const isBannedByPlayer = (stageId: string, playerIndex: number): boolean => {
  return stageBans.value.get(stageId) === playerIndex;
};

const isSelected = (stageId: string): boolean => {
  return selectedStage.value === stageId;
};

const canInteractWithStage = (stageId: string): boolean => {
  if (currentPhase.value === 'setup') return false;
  if (isSelected(stageId)) return false;
  
  // In gentleman's agreement mode, any stage can be selected (even banned ones)
  if (gameStore.gentlemansAgreement && currentPhase.value === 'selecting') {
    return true;
  }
  
  if (isBanned(stageId)) return false;
  
  if (currentPhase.value === 'banning') {
    return gameStore.currentBanPhase?.phase === 'banning';
  }
  
  if (currentPhase.value === 'selecting') {
    return gameStore.currentBanPhase?.phase === 'selecting';
  }
  
  return false;
};

const isCurrentPlayerTurn = (stageId: string): boolean => {
  if (!canInteractWithStage(stageId)) return false;
  return currentPhase.value === 'banning' || currentPhase.value === 'selecting';
};

const getBanningPlayerName = (stageId: string): string => {
  const playerIndex = stageBans.value.get(stageId);
  if (playerIndex !== undefined) {
    return gameStore.players[playerIndex]?.name || 'Unknown Player';
  }
  return 'Unknown Player';
};

const getStageAriaLabel = (stage: Stage): string => {
  if (isBanned(stage.id)) {
    const playerName = getBanningPlayerName(stage.id);
    return `${stage.name}, banned by ${playerName}`;
  }
  
  if (isSelected(stage.id)) {
    return `${stage.name}, selected stage`;
  }
  
  if (currentPhase.value === 'banning') {
    return `${stage.name}, click to ban`;
  }
  
  if (currentPhase.value === 'selecting') {
    return `${stage.name}, click to select`;
  }
  
  return stage.name;
};

// Event handlers
const handleStageClick = (stageId: string) => {
  if (!canInteractWithStage(stageId)) {
    return;
  }
  
  try {
    if (currentPhase.value === 'banning') {
      gameStore.banStage(stageId);
    } else if (currentPhase.value === 'selecting') {
      // In gentleman's agreement mode, any stage can be selected
      if (gameStore.gentlemansAgreement) {
        gameStore.selectStage(stageId);
      } else {
        // Normal selection mode - only non-banned stages
        if (!isBanned(stageId)) {
          gameStore.selectStage(stageId);
        }
      }
    }
  } catch (error) {
    console.error('Error handling stage interaction:', error);
    // You could add a toast notification here for user feedback
  }
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  // Fallback to a placeholder image or show stage name prominently
  img.style.display = 'none';
  const container = img.parentElement;
  if (container) {
    container.classList.add('image-error');
  }
};
</script>

<style scoped>
.stage-grid-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.stage-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: var(--spacing-sm);
  width: 100%;
  aspect-ratio: 1;
}

.stage-item {
  position: relative;
  border-radius: var(--border-radius);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 3px solid transparent;
  background: var(--color-light);
  box-shadow: var(--box-shadow);
  touch-action: manipulation; /* Improve touch experience */
}

.stage-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stage-item.interactive {
  cursor: pointer;
}

.stage-item:not(.interactive) {
  cursor: default;
}

.stage-item.current-turn {
  border-color: var(--selected-color);
  box-shadow: 0 0 0 3px rgba(35, 209, 96, 0.3);
}

.stage-item.banned {
  opacity: 0.6;
  cursor: not-allowed;
}

.stage-item.banned-by-player-1 {
  border-color: var(--player1-color);
  box-shadow: 0 0 0 3px rgba(255, 56, 96, 0.3);
}

.stage-item.banned-by-player-2 {
  border-color: var(--player2-color);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.3);
}

.stage-item.selected {
  border-color: var(--selected-color);
  box-shadow: 0 0 0 3px rgba(35, 209, 96, 0.5);
  transform: scale(1.05);
}

.stage-image-container {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  overflow: hidden;
}

.stage-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.stage-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stage-item:hover .stage-overlay {
  opacity: 1;
}

.stage-item.banned .stage-overlay,
.stage-item.selected .stage-overlay {
  opacity: 1;
}

.ban-indicator,
.selection-indicator,
.action-hint {
  text-align: center;
  color: white;
}

.ban-text,
.selection-text {
  display: block;
  font-weight: bold;
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-xs);
}

.ban-player {
  display: block;
  font-size: var(--font-size-sm);
  opacity: 0.9;
}

.hint-text {
  font-size: var(--font-size-sm);
  opacity: 0.9;
}

.stage-name {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  text-align: center;
}

.game-status {
  text-align: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-light);
  border-radius: var(--border-radius);
  border: 1px solid #dee2e6;
  min-width: 300px;
}

.status-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.player-name {
  font-weight: bold;
  font-size: var(--font-size-lg);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: 20px;
  color: white;
}

.player-name.player-1 {
  background-color: var(--player1-color);
}

.player-name.player-2 {
  background-color: var(--player2-color);
}

.status-text {
  font-size: var(--font-size-md);
  color: #6c757d;
}

.ban-count {
  font-size: var(--font-size-sm);
  color: #6c757d;
  font-style: italic;
}

.gentlemans-status {
  background: linear-gradient(135deg, var(--selected-color) 0%, #20c997 100%);
  color: white;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
}

.gentlemans-status .status-text {
  color: white;
  font-weight: 600;
  font-size: var(--font-size-md);
}

.image-error {
  background: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

/* Responsive Design */
@media (max-width: 768px) {
  .stage-grid {
    gap: var(--spacing-sm);
  }
  
  .stage-name {
    font-size: var(--font-size-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  
  .game-status {
    padding: var(--spacing-md);
    min-width: 250px;
  }
  
  .status-message {
    gap: var(--spacing-xs);
  }
  
  .player-name {
    font-size: var(--font-size-md);
    padding: var(--spacing-xs) var(--spacing-md);
  }
  
  .status-text {
    font-size: var(--font-size-sm);
  }
}

@media (max-width: 480px) {
  .stage-grid {
    gap: var(--spacing-xs);
  }
  
  .stage-name {
    font-size: var(--font-size-sm);
    padding: var(--spacing-xs);
  }
  
  .game-status {
    padding: var(--spacing-sm);
    min-width: 200px;
  }
  
  .player-name {
    font-size: var(--font-size-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  
  .status-text {
    font-size: var(--font-size-sm);
  }
}

/* Focus styles for accessibility */
.stage-item:focus-visible {
  outline: 3px solid var(--color-info);
  outline-offset: 2px;
}

/* Touch device optimizations */
@media (hover: none) {
  .stage-item {
    min-height: 80px;
  }
  
  .stage-item:active {
    transform: scale(0.95);
  }
}

/* Landscape orientation on mobile */
@media (max-height: 500px) and (orientation: landscape) {
  .stage-grid {
    grid-template-columns: repeat(3, 1fr);
    max-width: 80%;
  }
  
  .game-status {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10;
    background-color: rgba(255, 255, 255, 0.9);
  }
}
</style>
