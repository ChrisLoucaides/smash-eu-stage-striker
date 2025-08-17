<script setup lang="ts">
import StageGrid from './components/StageGrid.vue'
import { useGameStore } from './stores/gameStore'

const gameStore = useGameStore()

// For testing purposes, let's set up a basic match
const setupTestMatch = () => {
  gameStore.setupMatch({
    player1Name: 'Player 1',
    player2Name: 'Player 2',
    matchFormat: 'BO3',
    firstBan: 0,
    gentlemansAgreement: false,
  })
}
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>Smash Stage Striker</h1>
      <p>Tournament Stage Ban Tool</p>
    </header>
    
    <main class="app-main">
      <div v-if="gameStore.currentPhase === 'setup'" class="setup-section">
        <h2>Match Setup</h2>
        <p>Click the button below to start a test match and see the stage grid in action.</p>
        <button @click="setupTestMatch" class="setup-button">
          Start Test Match
        </button>
      </div>
      
      <div v-else class="game-section">
        <div class="game-info">
          <h3>Game {{ gameStore.currentGame }}</h3>
          <div class="player-info">
            <div class="player">
              <span class="player-name player-1">{{ gameStore.players[0].name }}</span>
              <span class="player-score">{{ gameStore.players[0].score }}</span>
            </div>
            <div class="vs">vs</div>
            <div class="player">
              <span class="player-name player-2">{{ gameStore.players[1].name }}</span>
              <span class="player-score">{{ gameStore.players[1].score }}</span>
            </div>
          </div>
        </div>
        
        <StageGrid />
        
        <div class="game-controls">
          <button @click="gameStore.resetToSetup" class="reset-button">
            Back to Setup
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.app-header {
  text-align: center;
  color: white;
  margin-bottom: 30px;
}

.app-header h1 {
  font-size: 2.5rem;
  margin: 0 0 10px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.app-header p {
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.9;
}

.app-main {
  max-width: 1200px;
  margin: 0 auto;
}

.setup-section {
  text-align: center;
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.setup-section h2 {
  color: #333;
  margin-bottom: 20px;
}

.setup-section p {
  color: #666;
  margin-bottom: 30px;
  font-size: 1.1rem;
}

.setup-button {
  background: #28a745;
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 1.1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.setup-button:hover {
  background: #218838;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.game-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.game-info {
  text-align: center;
  margin-bottom: 30px;
}

.game-info h3 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.player-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.player {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.player-name {
  padding: 8px 16px;
  border-radius: 20px;
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
}

.player-name.player-1 {
  background-color: #dc3545;
}

.player-name.player-2 {
  background-color: #007bff;
}

.player-score {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}

.vs {
  font-size: 1.5rem;
  font-weight: bold;
  color: #666;
}

.game-controls {
  text-align: center;
  margin-top: 30px;
}

.reset-button {
  background: #6c757d;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-button:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .app {
    padding: 15px;
  }
  
  .app-header h1 {
    font-size: 2rem;
  }
  
  .app-header p {
    font-size: 1rem;
  }
  
  .setup-section,
  .game-section {
    padding: 20px;
  }
  
  .player-info {
    flex-direction: column;
    gap: 15px;
  }
  
  .vs {
    transform: rotate(90deg);
  }
}

@media (max-width: 480px) {
  .app-header h1 {
    font-size: 1.8rem;
  }
  
  .setup-section,
  .game-section {
    padding: 15px;
  }
  
  .setup-button {
    padding: 12px 24px;
    font-size: 1rem;
  }
}
</style>
