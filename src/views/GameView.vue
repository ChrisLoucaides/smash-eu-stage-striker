<template>
  <div class="game-view">
    <div class="game-section">
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
    
    <!-- Game Modal -->
    <GameModal 
      :is-open="showGameModal" 
      @close="closeGameModal" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import ScoreBoard from '../components/ScoreBoard.vue'
import StageGrid from '../components/StageGrid.vue'
import GameModal from '../components/GameModal.vue'
import GentlemansAgreementToggle from '../components/GentlemansAgreementToggle.vue'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()
const router = useRouter()
const showGameModal = ref(false)

const showGentlemansToggle = computed(() => {
  return ['banning', 'selecting'].includes(gameStore.currentPhase)
})

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
  router.push('/')
}

// Watch for phase changes to show game modal
watch(() => gameStore.currentPhase, (newPhase) => {
  if (newPhase === 'winner-select') {
    openGameModal()
  }
  
  // Navigate to set-complete when set is finished
  if (newPhase === 'set-complete') {
    router.push('/set-complete')
  }
})
</script>

<style scoped>
.game-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
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
  .game-view {
    padding: 15px;
  }
  
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
  .game-section {
    padding: 15px;
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
