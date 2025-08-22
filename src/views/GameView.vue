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
        <button @click="clearBans" class="clear-bans-button" v-if="showClearBansButton">
          Clear Bans
        </button>
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
import { ref, computed, watch, nextTick } from 'vue'
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

const showClearBansButton = computed(() => {
  return gameStore.currentPhase === 'banning' && gameStore.stageBans.size > 0
})

// Show game modal when in winner-select phase
const openGameModal = () => {
  showGameModal.value = true
}

const closeGameModal = () => {
  showGameModal.value = false
}

// Clear all bans for the current game
const clearBans = () => {
  if (confirm('Are you sure you want to clear all bans for this game? This will reset the ban phase.')) {
    gameStore.clearBans()
  }
}

// Reset to setup phase
const resetToSetup = () => {
  gameStore.resetToSetup()
  router.push('/')
}

// Watch for phase changes to show game modal
watch(() => gameStore.currentPhase, (newPhase, oldPhase) => {
  console.log(`Phase changed: ${oldPhase} → ${newPhase}`);
  
  if (newPhase === 'winner-select') {
    openGameModal()
  }
  
  // Navigate to set-complete when set is finished
  if (newPhase === 'set-complete') {
    console.log('Navigating to set-complete page');
    nextTick(() => {
      // Check if we're already on the set-complete page
      if (router.currentRoute.value.name !== 'set-complete') {
        router.push('/set-complete').catch(error => {
          console.error('Navigation failed:', error);
        })
      } else {
        console.log('Already on set-complete page');
      }
    })
  }
})

// Also watch for match completion to ensure navigation
watch(() => gameStore.isSetComplete, (isComplete) => {
  console.log(`Match completion status: ${isComplete}, current phase: ${gameStore.currentPhase}`);
  if (isComplete && gameStore.currentPhase !== 'set-complete') {
    console.log('Match complete detected, navigating to set-complete page');
    nextTick(() => {
      console.log('Executing navigation to set-complete');
      // Check if we're already on the set-complete page
      if (router.currentRoute.value.name !== 'set-complete') {
        router.push('/set-complete').catch(error => {
          console.error('Navigation failed:', error);
        })
      } else {
        console.log('Already on set-complete page');
      }
    })
  }
})
</script>

<style scoped>
.game-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.game-section {
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

.winner-prompt {
  margin: var(--spacing-xl) 0;
  text-align: center;
}

.winner-prompt-content {
  background: linear-gradient(135deg, var(--color-success) 0%, #20c997 100%);
  color: white;
  padding: var(--spacing-xl);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
  border: 3px solid rgba(255, 255, 255, 0.2);
}

.winner-prompt-content h3 {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-xl);
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.winner-prompt-content p {
  margin: 0 0 var(--spacing-lg) 0;
  font-size: var(--font-size-lg);
  opacity: 0.95;
}

.declare-winner-button {
  background: white;
  color: var(--color-success);
  border: none;
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-lg);
  font-weight: bold;
  border-radius: var(--border-radius);
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
  margin-top: var(--spacing-xl);
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
}

.clear-bans-button {
  background: var(--color-warning);
  color: white;
  border: none;
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-md);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-bans-button:hover {
  background: #e6c200;
  transform: translateY(-1px);
}

.reset-button {
  background: #6c757d;
  color: white;
  border: none;
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-md);
  border-radius: var(--border-radius);
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
    padding: var(--spacing-md);
  }
  
  .game-section {
    padding: var(--spacing-lg);
  }
  
  .winner-prompt-content {
    padding: var(--spacing-lg);
  }
  
  .winner-prompt-content h3 {
    font-size: var(--font-size-lg);
  }
  
  .winner-prompt-content p {
    font-size: var(--font-size-md);
  }
}

@media (max-width: 480px) {
  .game-section {
    padding: var(--spacing-md);
  }
  
  .winner-prompt-content {
    padding: var(--spacing-md);
  }
  
  .winner-prompt-content h3 {
    font-size: var(--font-size-md);
  }
  
  .declare-winner-button {
    padding: var(--spacing-sm) var(--spacing-lg);
    font-size: var(--font-size-md);
  }
}
</style>
