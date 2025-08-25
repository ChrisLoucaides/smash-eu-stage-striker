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
              <span class="ban-player">{{ getBanningPlayerName(stage.id) }}</span>
              <div class="ban-icon">🚫</div>
<!--              <span class="ban-text">BANNED</span>-->
              <span v-if="canUnbanStage(stage.id)" class="unban-hint">Click to Unban</span>
            </div>
            <div v-else-if="isSelected(stage.id)" class="selection-indicator">
              <div class="selection-icon">✅</div>
              <span class="selection-text">SELECTED</span>
            </div>
            <div v-else-if="canInteractWithStage(stage.id)" class="action-hint">
              <div class="hint-icon">
                <span v-if="currentPhase === 'banning'">🚫</span>
                <span v-else-if="currentPhase === 'selecting'">🎯</span>
              </div>
              <span v-if="currentPhase === 'banning'" class="hint-text">Click to Ban</span>
              <span v-else-if="currentPhase === 'selecting'" class="hint-text">Click to Select</span>
            </div>
          </div>
        </div>
        <div class="stage-name">{{ stage.name }}</div>
      </div>
    </div>
    
    <!-- Game Status Display -->
    <div v-if="currentPhase !== 'setup'" class="game-status glass-card">
      <div v-if="currentPhase === 'banning'" class="status-message">
        <div class="status-header">
          <div class="status-content">
            <span class="player-name" :class="{ 'player-1': isPlayer1Turn, 'player-2': !isPlayer1Turn }">
              {{ currentPlayerName }}
            </span>
            <span class="status-text"> is banning</span>
            <span class="ban-count">({{ remainingBans }} remaining)</span>
            <div class="status-icon banning-icon">🚫</div>
          </div>
        </div>
      </div>
      <div v-else-if="currentPhase === 'selecting'" class="status-message">
        <div v-if="gameStore.gentlemansAgreement" class="gentlemans-status">
          <div class="status-icon gentlemans-icon">🤝</div>
          <span class="status-text">Gentleman's Agreement: Select any stage</span>
        </div>
        <div v-else class="status-header">
          <div class="status-content">
            <span class="player-name" :class="{ 'player-1': isLoserPlayer1, 'player-2': !isLoserPlayer1 }">
              {{ loserName }}
            </span>
            <span class="status-text"> is selecting a stage</span>
            <div class="status-icon selecting-icon">🎯</div>
          </div>
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
  
  // Allow interaction with banned stages to revert bans
  if (isBanned(stageId)) {
    return currentPhase.value === 'banning' && gameStore.currentBanPhase?.phase === 'banning';
  }
  
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

const canUnbanStage = (stageId: string): boolean => {
  if (currentPhase.value !== 'banning') return false;
  if (!isBanned(stageId)) return false;
  
  // Check if the current player is the one who banned this stage
  const currentPlayerIndex = currentPlayer.value?.id;
  if (currentPlayerIndex === undefined) return false;
  
  const banningPlayerIndex = stageBans.value.get(stageId);
  return banningPlayerIndex === currentPlayerIndex;
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
    if (canUnbanStage(stage.id)) {
      return `${stage.name}, banned by ${playerName}, click to unban`;
    }
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
      if (isBanned(stageId)) {
        // Revert the ban if the stage is already banned
        gameStore.unbanStage(stageId);
      } else {
        // Ban the stage if it's not banned
        gameStore.banStage(stageId);
      }
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
  font-size: 0.92em;
  gap: var(--spacing-xl);
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  animation: fade-in-up 0.8s ease-out;
}

.stage-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: var(--spacing-md);
  width: 100%;
  aspect-ratio: 1;
  max-width: 600px;
}

.stage-item {
  position: relative;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 3px solid transparent;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  box-shadow: var(--box-shadow);
  touch-action: manipulation;
  animation: scale-in 0.6s ease-out;
}

.stage-item:nth-child(1) { animation-delay: 0.1s; }
.stage-item:nth-child(2) { animation-delay: 0.2s; }
.stage-item:nth-child(3) { animation-delay: 0.3s; }
.stage-item:nth-child(4) { animation-delay: 0.4s; }
.stage-item:nth-child(5) { animation-delay: 0.5s; }
.stage-item:nth-child(6) { animation-delay: 0.6s; }
.stage-item:nth-child(7) { animation-delay: 0.7s; }
.stage-item:nth-child(8) { animation-delay: 0.8s; }
.stage-item:nth-child(9) { animation-delay: 0.9s; }

.stage-item:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: var(--box-shadow-xl);
  border-color: rgba(255, 255, 255, 0.3);
}

.stage-item.interactive {
  cursor: pointer;
  border-color: rgba(255, 255, 255, 0.2);
}

.stage-item:not(.interactive) {
  cursor: default;
  opacity: 0.7;
}

.stage-item.current-turn {
  border-color: var(--selected-color);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.4), var(--box-shadow-lg);
  animation: pulse-glow 2s infinite;
}

.stage-item.banned {
  opacity: 0.6;
  cursor: pointer;
  filter: grayscale(0.3);
}

.stage-item.banned-by-player-1 {
  border-color: var(--player1-color);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.4), var(--box-shadow-lg);
}

.stage-item.banned-by-player-2 {
  border-color: var(--player2-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4), var(--box-shadow-lg);
}

.stage-item.selected {
  border-color: var(--selected-color);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.6), var(--box-shadow-xl);
  transform: scale(1.05);
  animation: selected-bounce 0.6s ease-out;
}

.stage-image-container {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 75%;
  overflow: hidden;
}

.stage-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all var(--transition-normal);
}

.stage-item:hover .stage-image {
  transform: scale(1.1);
}

.stage-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: all var(--transition-normal);
  backdrop-filter: blur(4px);
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.ban-icon,
.selection-icon,
.hint-icon {
  font-size: 2rem;
  margin-bottom: var(--spacing-xs);
  animation: bounce-in 0.6s ease-out;
}

.ban-text,
.selection-text {
  display: block;
  font-weight: 700;
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-xs);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ban-player {
  display: block;
  font-size: var(--font-size-sm);
  opacity: 0.9;
  font-weight: 500;
}

.unban-hint {
  display: block;
  font-size: var(--font-size-sm);
  opacity: 0.8;
  color: #fbbf24;
  font-style: italic;
  margin-top: var(--spacing-xs);
  animation: pulse 2s infinite;
}

.hint-text {
  font-size: var(--font-size-sm);
  opacity: 0.9;
  font-weight: 500;
}

.stage-name {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
  color: white;
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: 0.8em;
  font-weight: 600;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
  letter-spacing: 0.5px;
}

.game-status {
  text-align: center;
  padding: var(--spacing-lg) var(--spacing-xl);
  min-width: 350px;
  animation: slide-in-up 0.8s ease-out 1s both;
}

.status-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.status-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.status-icon {
  font-size: 2rem;
  animation: bounce-in 0.6s ease-out;
}

.banning-icon {
  color: var(--color-danger);
}

.selecting-icon {
  color: var(--color-success);
}

.gentlemans-icon {
  color: var(--color-warning);
}

.status-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.player-name {
  font-weight: 700;
  font-size: var(--font-size-lg);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: 25px;
  color: white;
  box-shadow: var(--box-shadow);
  transition: all var(--transition-normal);
}

.player-name.player-1 {
  background: linear-gradient(135deg, var(--player1-color) 0%, var(--player1-color-light) 100%);
}

.player-name.player-2 {
  background: linear-gradient(135deg, var(--player2-color) 0%, var(--player2-color-light) 100%);
}

.status-text {
  font-size: var(--font-size-md);
  color: var(--color-dark-secondary);
  font-weight: 500;
}

.ban-count {
  font-size: var(--font-size-sm);
  color: var(--color-dark-secondary);
  font-style: italic;
  opacity: 0.8;
}

.gentlemans-status {
  background: linear-gradient(135deg, var(--selected-color) 0%, var(--selected-color-light) 100%);
  color: white;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: 25px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.gentlemans-status .status-text {
  color: white;
  font-weight: 600;
  font-size: var(--font-size-md);
}

.image-error {
  background: linear-gradient(135deg, var(--color-light-secondary) 0%, var(--color-light) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-dark);
  font-weight: 700;
  font-size: var(--font-size-lg);
}

/* Animations */
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-in-up {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce-in {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes selected-bounce {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1.05);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.4), var(--box-shadow-lg);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0.6), var(--box-shadow-lg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .stage-grid {
    gap: var(--spacing-sm);
    max-width: 500px;
  }

  .stage-grid-container {
    font-size: 0.8em;
  }

  .stage-image-container {
    padding-bottom: 83%;
  }
  
  .stage-name {
    font-size: 0.7em;
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .game-status {
    padding: var(--spacing-md);
    min-width: 300px;
  }
  
  .status-message {
    gap: var(--spacing-sm);
  }
  
  .player-name {
    font-size: var(--font-size-md);
    padding: var(--spacing-xs) var(--spacing-md);
  }
  
  .status-text {
    font-size: var(--font-size-sm);
  }
  
  .status-icon {
    font-size: 1.5rem;
  }
}

@media (max-width: 572px) {
  .stage-image-container {
    padding-bottom: 100%;
  }

}

@media (max-width: 480px) {
  .stage-grid {
    gap: var(--spacing-xs);
    max-width: 400px;
  }

  .stage-image-container {
    padding-bottom: 100%;
  }


  .stage-name {
    padding: var(--spacing-xs);
    font-size: 0.65em;
  }
  
  .game-status {
    padding: var(--spacing-sm);
    min-width: 280px;
  }
  
  .player-name {
    font-size: var(--font-size-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  
  .status-text {
    font-size: var(--font-size-sm);
  }

  .ban-player {
    margin-top: -10px;
    font-size: var(--font-size-xs);
  }

  .ban-icon {
    margin-top: -13px;
  }
  
  .status-icon {
    font-size: 1.25rem;
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
  
  .stage-item.interactive:active {
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
    background-color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
  }
}
</style>
