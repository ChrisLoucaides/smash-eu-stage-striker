<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import StageGrid from './components/StageGrid.vue'
import SetupModal from './components/SetupModal.vue'
import ScoreBoard from './components/ScoreBoard.vue'
import GameModal from './components/GameModal.vue'
import SetCompleteView from './components/SetCompleteView.vue'
import GentlemansAgreementToggle from './components/GentlemansAgreementToggle.vue'
import { useGameStore } from './stores/gameStore'

const gameStore = useGameStore()
const showSetupModal = ref(false)
const showGameModal = ref(false)

const showGentlemansToggle = computed(() => {
  return ['banning', 'selecting'].includes(gameStore.currentPhase)
})

// Show setup modal when in setup phase
const openSetupModal = () => {
  showSetupModal.value = true
}

const closeSetupModal = () => {
  showSetupModal.value = false
}

// Show game modal when in winner-select phase
const openGameModal = () => {
  showGameModal.value = true
}

const closeGameModal = () => {
  showGameModal.value = false
}

// Reset to setup phase
const resetToSetup = () => {
  gameStore.resetToSetup()
}

// Watch for phase changes to show game modal
watch(() => gameStore.currentPhase, (newPhase) => {
  if (newPhase === 'winner-select') {
    openGameModal()
  }
})
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
        <p>Configure your match settings to get started with stage banning.</p>
        <button @click="openSetupModal" class="setup-button">
          Configure Match
        </button>
      </div>
      
      <div v-else-if="gameStore.currentPhase === 'set-complete'" class="set-complete-section">
        <SetCompleteView />
      </div>
      
      <div v-else class="game-section">
        <ScoreBoard />
        
        <!-- Gentleman's Agreement Toggle -->
        <GentlemansAgreementToggle v-if="showGentlemansToggle" />
        
        <StageGrid />
        
        <!-- Winner Selection Prompt -->
        <div v-if="gameStore.currentPhase === 'winner-select' && !showGameModal" class="winner-prompt">
          <div class="winner-prompt-content">
            <h3>Stage Selected: {{ gameStore.selectedStage }}</h3>
            <p>Ready to declare the winner for Game {{ gameStore.currentGame }}?</p>
            <button @click="openGameModal" class="declare-winner-button">
              Declare Winner
            </button>
          </div>
        </div>
        
        <div class="game-controls">
          <button @click="resetToSetup" class="reset-button">
            Back to Setup
          </button>
        </div>
      </div>
    </main>
    
    <!-- Setup Modal -->
    <SetupModal 
      :is-open="showSetupModal" 
      @close="closeSetupModal" 
    />
    
    <!-- Game Modal -->
    <GameModal 
      :is-open="showGameModal" 
      @close="closeGameModal" 
    />
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

.winner-prompt {
  margin: 2rem 0;
  text-align: center;
}

.winner-prompt-content {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
  border: 3px solid rgba(255, 255, 255, 0.2);
}

.winner-prompt-content h3 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.winner-prompt-content p {
  margin: 0 0 1.5rem 0;
  font-size: 1.1rem;
  opacity: 0.95;
}

.declare-winner-button {
  background: white;
  color: #28a745;
  border: none;
  padding: 12px 30px;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.declare-winner-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  background: #f8f9fa;
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
  
  .winner-prompt-content {
    padding: 1.5rem;
  }
  
  .winner-prompt-content h3 {
    font-size: 1.3rem;
  }
  
  .winner-prompt-content p {
    font-size: 1rem;
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
  
  .winner-prompt-content {
    padding: 1rem;
  }
  
  .winner-prompt-content h3 {
    font-size: 1.2rem;
  }
  
  .declare-winner-button {
    padding: 10px 20px;
    font-size: 1rem;
  }
}
</style>
