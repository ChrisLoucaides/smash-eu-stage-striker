<template>
  <div class="scoreboard">
    <div class="player-score" :class="{ 'is-active': isPlayerActive(0) }">
      <div class="player-name">{{ players[0].name }}</div>
      <div class="score-controls">
        <button 
          class="score-btn decrease" 
          @click="decreaseScore(0)" 
          :disabled="players[0].score <= 0"
          aria-label="Decrease score for Player 1"
        >
          <span>-</span>
        </button>
        <div class="score">{{ players[0].score }}</div>
        <button 
          class="score-btn increase" 
          @click="increaseScore(0)" 
          :disabled="isScoreMaxReached(0)"
          aria-label="Increase score for Player 1"
        >
          <span>+</span>
        </button>
      </div>
    </div>
    
    <div class="match-info">
      <div class="game-number">Game {{ currentGame }}</div>
      <div class="match-format">{{ matchFormat }}</div>
    </div>
    
    <div class="player-score" :class="{ 'is-active': isPlayerActive(1) }">
      <div class="player-name">{{ players[1].name }}</div>
      <div class="score-controls">
        <button 
          class="score-btn decrease" 
          @click="decreaseScore(1)" 
          :disabled="players[1].score <= 0"
          aria-label="Decrease score for Player 2"
        >
          <span>-</span>
        </button>
        <div class="score">{{ players[1].score }}</div>
        <button 
          class="score-btn increase" 
          @click="increaseScore(1)" 
          :disabled="isScoreMaxReached(1)"
          aria-label="Increase score for Player 2"
        >
          <span>+</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()

const players = computed(() => gameStore.players)
const currentGame = computed(() => gameStore.currentGame)
const matchFormat = computed(() => gameStore.matchFormat === 'BO3' ? 'Best of 3' : 'Best of 5')
const currentPhase = computed(() => gameStore.currentPhase)
const currentPlayer = computed(() => gameStore.currentPlayer)

function isPlayerActive(playerIndex: number) {
  return currentPhase.value === 'banning' && currentPlayer.value?.id === playerIndex
}

function decreaseScore(playerIndex: number) {
  if (players.value[playerIndex].score > 0) {
    // Create a confirmation dialog for score changes
    if (confirm(`Decrease ${players.value[playerIndex].name}'s score?`)) {
      gameStore.updatePlayerScore(playerIndex, players.value[playerIndex].score - 1)
    }
  }
}

function increaseScore(playerIndex: number) {
  const maxScore = gameStore.matchFormat === 'BO3' ? 2 : 3
  if (players.value[playerIndex].score < maxScore) {
    // Create a confirmation dialog for score changes
    if (confirm(`Increase ${players.value[playerIndex].name}'s score?`)) {
      gameStore.updatePlayerScore(playerIndex, players.value[playerIndex].score + 1)
    }
  }
}

function isScoreMaxReached(playerIndex: number) {
  const maxScore = gameStore.matchFormat === 'BO3' ? 2 : 3
  return players.value[playerIndex].score >= maxScore
}
</script>

<style scoped>
.scoreboard {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--color-light);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--box-shadow);
}

.player-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  transition: background-color 0.2s ease;
  min-width: 120px;
}

.player-score.is-active {
  background-color: rgba(0, 209, 178, 0.2);
  border: 2px solid #00d1b2;
}

.player-name {
  font-weight: bold;
  margin-bottom: var(--spacing-sm);
  text-align: center;
  color: var(--color-dark);
}

.score-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.score {
  font-size: var(--font-size-xl);
  font-weight: bold;
  margin: 0 var(--spacing-sm);
  min-width: 2rem;
  text-align: center;
  color: var(--color-dark);
}

.score-btn {
  width: 2.5rem; /* Larger touch target */
  height: 3.2rem;
  border-radius: 100%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  font-size: var(--font-size-lg);
  transition: all 0.2s ease;
  touch-action: manipulation; /* Improve touch experience */
}

.score-btn span{
  margin-bottom: 0.3em
}

.score-btn.decrease {
  background-color: var(--color-danger);
  color: white;
}

.score-btn.decrease:hover:not(:disabled) {
  background-color: #e02e4f;
  transform: scale(1.05);
}

.score-btn.increase {
  background-color: var(--color-success);
  color: white;
}

.score-btn.increase:hover:not(:disabled) {
  background-color: #1ea952;
  transform: scale(1.05);
}

.score-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.match-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 120px;
}

.game-number {
  font-weight: bold;
  font-size: var(--font-size-lg);
  color: var(--color-dark);
  margin-bottom: var(--spacing-xs);
}

.match-format {
  font-size: var(--font-size-sm);
  color: #7a7a7a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Responsive design for mobile and tablet */
@media (max-width: 768px) {
  .scoreboard {
    flex-direction: column;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
  }
  
  .player-score {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    min-width: auto;
  }
  
  .score-controls {
    gap: var(--spacing-md);
  }
  
  .score {
    font-size: var(--font-size-xl);
    min-width: 2.5rem;
  }
  
  .score-btn {
    width: 2.5rem;
    height: 2.5em;
    font-size: var(--font-size-lg);
  }
  
  .match-info {
    order: -1;
    min-width: auto;
    width: 100%;
    padding: var(--spacing-sm);
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: var(--border-radius);
  }
}

@media (max-width: 480px) {
  .scoreboard {
    padding: var(--spacing-md);
  }
  
  .player-score {
    padding: var(--spacing-md);
  }
  
  .score {
    font-size: var(--font-size-lg);
    min-width: 2rem;
  }
  
  .score-btn {
    width: 2.25rem;
    height: 2.25rem;
    font-size: var(--font-size-md);
  }
}

/* Touch device optimizations */
@media (hover: none) {
  .score-btn:active {
    transform: scale(0.95);
  }
}

/* Landscape orientation on mobile */
@media (max-height: 500px) and (orientation: landscape) {
  .scoreboard {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10;
    background-color: rgba(245, 245, 245, 0.95);
    backdrop-filter: blur(5px);
  }
}
</style>
