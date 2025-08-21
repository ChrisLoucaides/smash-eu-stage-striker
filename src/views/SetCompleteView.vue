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
        <div class="games-played">Games Played: {{ currentGame - 1 }}</div>
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
  padding: 20px;
}

.set-complete-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 2rem;
}

.winner-announcement {
  margin: 2rem 0;
  padding: 2rem;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.subtitle {
  font-size: 1.5rem;
  color: #666;
  margin-bottom: 1rem;
}

.winner-name {
  font-size: 2rem;
  font-weight: bold;
  color: #23d160;
  margin-bottom: 1rem;
}

.final-score {
  font-size: 1.2rem;
  color: #333;
}

.match-summary {
  margin-bottom: 2rem;
}

.match-summary h3 {
  color: #333;
  margin-bottom: 1rem;
}

.match-format,
.games-played {
  color: #666;
  margin-bottom: 0.5rem;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.button {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.button.is-primary {
  background-color: #3273dc;
  color: white;
}

.button.is-primary:hover {
  background-color: #2366d1;
}

.button.is-info {
  background-color: #209cee;
  color: white;
}

.button.is-info:hover {
  background-color: #1a7bb8;
}

/* Responsive Design */
@media (max-width: 768px) {
  .set-complete-view {
    padding: 15px;
  }
  
  .set-complete-container {
    padding: 1.5rem;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .winner-name {
    font-size: 1.5rem;
  }
  
  .actions {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .set-complete-container {
    padding: 1rem;
  }
  
  .title {
    font-size: 1.8rem;
  }
  
  .winner-announcement {
    padding: 1.5rem;
  }
  
  .winner-name {
    font-size: 1.3rem;
  }
}
</style>
