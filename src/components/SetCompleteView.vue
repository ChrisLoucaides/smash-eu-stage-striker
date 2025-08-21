<template>
  <div class="set-complete-container">
    <div class="set-complete-content">
      <h1 class="title">Set Complete!</h1>
      
      <div class="winner-announcement">
        <h2 class="subtitle">Winner</h2>
        <div class="winner-name">{{ winnerName }}</div>
        <div class="final-score">
          {{ players[0].name }}: {{ players[0].score }} - {{ players[1].name }}: {{ players[1].score }}
        </div>
      </div>
      
      <div class="match-summary">
        <h3>Match Summary</h3>
        <div class="match-format">{{ matchFormat }}</div>
        <div class="games-played">Games Played: {{ gamesPlayed }}</div>
        <div class="total-bans">Total Stage Bans: {{ totalBans }}</div>
      </div>
      
      <div class="actions">
        <button class="button is-primary" @click="startNewMatch">
          New Match
        </button>
        <button class="button is-info" @click="rematch">
          Rematch (Same Players)
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
const gameHistory = computed(() => gameStore.gameHistory)

const winnerIndex = computed(() => {
  if (players.value[0].score > players.value[1].score) return 0
  return 1
})

const winnerName = computed(() => players.value[winnerIndex.value].name)

const gamesPlayed = computed(() => currentGame.value - 1)

const totalBans = computed(() => {
  return gameHistory.value.reduce((total, game) => {
    return total + game.stageBans.length
  }, 0)
})

function startNewMatch() {
  gameStore.resetMatch()
}

function rematch() {
  // Keep player names but reset scores and game state
  const player1Name = players.value[0].name
  const player2Name = players.value[1].name
  const format = gameStore.matchFormat
  
  gameStore.resetMatch()
  
  // Set up a new match with the same players
  gameStore.setupMatch({
    player1Name,
    player2Name,
    matchFormat: format,
    firstBan: 0, // Default to player 1 first
    gentlemansAgreement: false
  })
}
</script>

<style scoped>
.set-complete-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.set-complete-content {
  background: white;
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  text-align: center;
  max-width: 600px;
  width: 100%;
}

.title {
  font-size: 3rem;
  font-weight: bold;
  color: #28a745;
  margin: 0 0 2rem 0;
  text-shadow: 0 2px 4px rgba(40, 167, 69, 0.3);
}

.winner-announcement {
  margin: 2rem 0;
  padding: 2rem;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
}

.subtitle {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  opacity: 0.9;
}

.winner-name {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.final-score {
  font-size: 1.3rem;
  opacity: 0.95;
  font-weight: 500;
}

.match-summary {
  margin: 2rem 0;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #28a745;
}

.match-summary h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.3rem;
}

.match-format,
.games-played,
.total-bans {
  margin: 0.5rem 0;
  color: #666;
  font-size: 1.1rem;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.button {
  padding: 12px 30px;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;
}

.button.is-primary {
  background: #28a745;
  color: white;
}

.button.is-primary:hover {
  background: #218838;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.button.is-info {
  background: #17a2b8;
  color: white;
}

.button.is-info:hover {
  background: #138496;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(23, 162, 184, 0.3);
}

/* Responsive Design */
@media (max-width: 768px) {
  .set-complete-container {
    padding: 15px;
  }
  
  .set-complete-content {
    padding: 2rem;
  }
  
  .title {
    font-size: 2.5rem;
  }
  
  .winner-name {
    font-size: 2rem;
  }
  
  .actions {
    flex-direction: column;
    align-items: center;
  }
  
  .button {
    width: 100%;
    max-width: 300px;
  }
}

@media (max-width: 480px) {
  .set-complete-content {
    padding: 1.5rem;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .winner-announcement {
    padding: 1.5rem;
  }
  
  .winner-name {
    font-size: 1.8rem;
  }
  
  .final-score {
    font-size: 1.1rem;
  }
}
</style>

