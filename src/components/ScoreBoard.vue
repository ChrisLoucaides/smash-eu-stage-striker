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
          -
        </button>
        <div class="score">{{ players[0].score }}</div>
        <button 
          class="score-btn increase" 
          @click="increaseScore(0)" 
          :disabled="isScoreMaxReached(0)"
          aria-label="Increase score for Player 1"
        >
          +
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
          -
        </button>
        <div class="score">{{ players[1].score }}</div>
        <button 
          class="score-btn increase" 
          @click="increaseScore(1)" 
          :disabled="isScoreMaxReached(1)"
          aria-label="Increase score for Player 2"
        >
          +
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
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.player-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  min-width: 120px;
}

.player-score.is-active {
  background-color: rgba(0, 209, 178, 0.2);
  border: 2px solid #00d1b2;
}

.player-name {
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-align: center;
  color: #363636;
}

.score-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.score {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 0.5rem;
  min-width: 2rem;
  text-align: center;
  color: #363636;
}

.score-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.2rem;
  transition: all 0.2s ease;
}

.score-btn.decrease {
  background-color: #ff3860;
  color: white;
}

.score-btn.decrease:hover:not(:disabled) {
  background-color: #e02e4f;
  transform: scale(1.05);
}

.score-btn.increase {
  background-color: #23d160;
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
  font-size: 1.2rem;
  color: #363636;
  margin-bottom: 0.25rem;
}

.match-format {
  font-size: 0.9rem;
  color: #7a7a7a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Responsive design for mobile and tablet */
@media (max-width: 768px) {
  .scoreboard {
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
  }
  
  .player-score {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    min-width: auto;
  }
  
  .score-controls {
    gap: 0.75rem;
  }
  
  .score {
    font-size: 1.75rem;
    min-width: 2.5rem;
  }
  
  .score-btn {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.4rem;
  }
  
  .match-info {
    order: -1;
    min-width: auto;
    width: 100%;
    padding: 0.5rem;
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 4px;
  }
}

@media (max-width: 480px) {
  .scoreboard {
    padding: 1rem;
  }
  
  .player-score {
    padding: 0.75rem;
  }
  
  .score {
    font-size: 1.5rem;
    min-width: 2rem;
  }
  
  .score-btn {
    width: 2.25rem;
    height: 2.25rem;
    font-size: 1.3rem;
  }
}
</style>
