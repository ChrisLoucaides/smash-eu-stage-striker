<template>
  <div class="set-complete-view">
    <div class="set-complete-container">
      <h1 class="title">Set Complete!</h1>
      
      <div class="winner-announcement">
        <h2 class="subtitle">Winner</h2>
        <div class="winner-name">{{ winnerName }}</div>
        <div class="final-score">{{ players[0].name }}: {{ players[0].score }} - {{ players[1].name }}: {{ players[1].score }}</div>
      </div>
      
      <div class="match-summary">
        <h3>Match Summary</h3>
        <div class="match-format">{{ matchFormat }}</div>
        <div class="games-played">Games Played: {{ gameHistory.length }}</div>
      </div>
      
      <div class="actions">
        <button class="button is-primary" @click="startNewMatch">New Match</button>
        <button class="button is-info" @click="rematch">Rematch (Same Players)</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()
const router = useRouter()

const players = computed(() => gameStore.players)
const currentGame = computed(() => gameStore.currentGame)
const matchFormat = computed(() => gameStore.matchFormat === 'BO3' ? 'Best of 3' : 'Best of 5')
const gameHistory = computed(() => gameStore.gameHistory)

const winnerIndex = computed(() => {
  if (players.value[0].score > players.value[1].score) return 0
  return 1
})

const winnerName = computed(() => players.value[winnerIndex.value].name)

function startNewMatch() {
  gameStore.resetMatch()
  router.push('/')
}

function rematch() {
  // Keep player names but reset scores and game state
  const player1Name = players.value[0].name
  const player2Name = players.value[1].name
  const format = gameStore.matchFormat
  
  gameStore.resetMatch()
  gameStore.setupMatch({
    player1Name,
    player2Name,
    matchFormat: format,
    firstBan: 0,
    gentlemansAgreement: false
  })
  router.push('/game')
}
</script>

<style scoped>
.set-complete-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.set-complete-container {
  max-width: 600px;
  margin: 0 auto;
  padding: var(--spacing-xl);
  text-align: center;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

.title {
  font-size: var(--font-size-xl);
  color: var(--color-dark);
  margin-bottom: var(--spacing-xl);
}

.winner-announcement {
  margin: var(--spacing-xl) 0;
  padding: var(--spacing-xl);
  background-color: var(--color-light);
  border-radius: var(--border-radius);
}

.subtitle {
  font-size: var(--font-size-lg);
  color: #666;
  margin-bottom: var(--spacing-md);
}

.winner-name {
  font-size: var(--font-size-xl);
  font-weight: bold;
  color: var(--selected-color);
  margin-bottom: var(--spacing-md);
}

.final-score {
  font-size: var(--font-size-lg);
  color: var(--color-dark);
}

.match-summary {
  margin-bottom: var(--spacing-xl);
}

.match-summary h3 {
  color: var(--color-dark);
  margin-bottom: var(--spacing-md);
}

.match-format,
.games-played {
  color: #666;
  margin-bottom: var(--spacing-sm);
}

.actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

.button {
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  border-radius: var(--border-radius);
  font-size: var(--font-size-md);
  cursor: pointer;
  transition: all 0.3s ease;
}

.button.is-primary {
  background-color: var(--color-primary);
  color: white;
}

.button.is-primary:hover {
  background-color: #2366d1;
}

.button.is-info {
  background-color: var(--color-info);
  color: white;
}

.button.is-info:hover {
  background-color: #1a7bb8;
}

/* Responsive Design */
@media (max-width: 768px) {
  .set-complete-view {
    padding: var(--spacing-md);
  }
  
  .set-complete-container {
    padding: var(--spacing-lg);
  }
  
  .title {
    font-size: var(--font-size-lg);
  }
  
  .winner-name {
    font-size: var(--font-size-lg);
  }
  
  .actions {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .set-complete-container {
    padding: var(--spacing-md);
  }
  
  .title {
    font-size: var(--font-size-md);
  }
  
  .winner-announcement {
    padding: var(--spacing-lg);
  }
  
  .winner-name {
    font-size: var(--font-size-md);
  }
}
</style>
