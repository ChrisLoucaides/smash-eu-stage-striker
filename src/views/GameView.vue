<template>
  <div class="game-view">
    <div class="game-section glass-card">
      <ScoreBoard />
      
      <!-- Gentleman's Agreement Toggle -->
      <GentlemansAgreementToggle v-if="showGentlemansToggle" />
      
      <StageGrid />
      
      <!-- Winner Selection Prompt -->
      <Transition name="slide-fade">
        <div v-if="gameStore.currentPhase === 'winner-select' && !showGameModal" class="winner-prompt">
          <div class="winner-prompt-content">
            <div class="prompt-header">
              <div class="prompt-icon">🎯</div>
              <h3>Stage Selected!</h3>
            </div>
            <p class="prompt-message">Ready to declare the winner for Game {{ gameStore.currentGame }}?</p>
            <button @click="openGameModal" class="declare-winner-button">
              <span class="button-icon">🏆</span>
              Declare Winner
            </button>
          </div>
        </div>
      </Transition>
      
      <div class="game-controls">
        <button @click="clearBans" class="control-button clear-bans-button" v-if="showClearBansButton">
          <span class="button-icon">🗑️</span>
          Clear Bans
        </button>
        <button @click="resetToSetup" class="control-button reset-button">
          <span class="button-icon">↩️</span>
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
  min-height: 100vh;
  animation: fade-in-up 0.8s ease-out;
}

.game-section {
  padding: var(--spacing-2xl);
  position: relative;
  overflow: hidden;
}

.game-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-success) 50%, var(--color-warning) 100%);
  border-radius: var(--border-radius) var(--border-radius) 0 0;
}

.winner-prompt {
  margin: var(--spacing-2xl) 0;
  text-align: center;
  animation: slide-in-up 0.6s ease-out;
}

.winner-prompt-content {
  background: linear-gradient(135deg, var(--color-success) 0%, var(--color-success-light) 100%);
  color: white;
  padding: var(--spacing-2xl);
  border-radius: var(--border-radius-xl);
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.4);
  border: 3px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.winner-prompt-content::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
}

.prompt-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  position: relative;
  z-index: 1;
}

.prompt-icon {
  font-size: 2.5rem;
  animation: bounce-in 0.6s ease-out 0.2s both;
}

.prompt-header h3 {
  margin: 0;
  font-size: var(--font-size-2xl);
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.prompt-message {
  margin: 0 0 var(--spacing-xl) 0;
  font-size: var(--font-size-lg);
  opacity: 0.95;
  position: relative;
  z-index: 1;
}

.declare-winner-button {
  background: white;
  color: var(--color-success);
  border: none;
  padding: var(--spacing-lg) var(--spacing-2xl);
  font-size: var(--font-size-lg);
  font-weight: 700;
  border-radius: var(--border-radius-xl);
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  gap: var(--spacing-sm);
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.declare-winner-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.1);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.declare-winner-button:active::before {
  width: 300px;
  height: 300px;
}

.declare-winner-button:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  background: #f8f9fa;
}

.button-icon {
  font-size: 1.2em;
}

.game-controls {
  text-align: center;
  margin-top: var(--spacing-2xl);
  display: flex;
  gap: var(--spacing-lg);
  justify-content: center;
  flex-wrap: wrap;
  animation: slide-in-up 0.8s ease-out 0.4s both;
}

.control-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg) var(--spacing-xl);
  font-size: var(--font-size-md);
  font-weight: 600;
  border: none;
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.control-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.control-button:active::before {
  width: 300px;
  height: 300px;
}

.clear-bans-button {
  background: linear-gradient(135deg, var(--color-warning) 0%, var(--color-warning-light) 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.3);
}

.clear-bans-button:hover {
  background: linear-gradient(135deg, #e6c200 0%, #fbbf24 100%);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.4);
}

.reset-button {
  background: linear-gradient(135deg, var(--color-dark-secondary) 0%, var(--color-dark) 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(108, 117, 125, 0.3);
}

.reset-button:hover {
  background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(108, 117, 125, 0.4);
}

/* Slide-fade transition for winner prompt */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all var(--transition-normal);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

/* Animations */
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

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .game-view {
    padding: var(--spacing-md);
  }
  
  .game-section {
    padding: var(--spacing-xl);
  }
  
  .winner-prompt-content {
    padding: var(--spacing-xl);
  }
  
  .prompt-header h3 {
    font-size: var(--font-size-xl);
  }
  
  .prompt-message {
    font-size: var(--font-size-md);
  }
  
  .declare-winner-button {
    padding: var(--spacing-md) var(--spacing-xl);
    font-size: var(--font-size-md);
  }
  
  .game-controls {
    flex-direction: column;
    align-items: center;
  }
  
  .control-button {
    width: 100%;
    max-width: 300px;
  }
}

@media (max-width: 480px) {
  .game-section {
    padding: var(--spacing-lg);
  }
  
  .winner-prompt-content {
    padding: var(--spacing-lg);
  }
  
  .prompt-header h3 {
    font-size: var(--font-size-lg);
  }
  
  .prompt-message {
    font-size: var(--font-size-sm);
  }
  
  .declare-winner-button {
    padding: var(--spacing-sm) var(--spacing-lg);
    font-size: var(--font-size-sm);
  }
  
  .control-button {
    padding: var(--spacing-md) var(--spacing-lg);
  }
}

/* Focus styles for accessibility */
.declare-winner-button:focus-visible,
.control-button:focus-visible {
  outline: 3px solid var(--color-info);
  outline-offset: 2px;
}

/* Touch device optimizations */
@media (hover: none) {
  .declare-winner-button:active {
    transform: scale(0.98);
  }
  
  .control-button:active {
    transform: scale(0.98);
  }
}
</style>
