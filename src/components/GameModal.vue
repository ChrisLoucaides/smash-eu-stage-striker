<template>
  <Transition name="modal">
    <div v-if="isOpen" class="modal is-active">
      <div class="modal-background" @click="closeModal"></div>
      <div class="modal-content">
        <div class="modal-box glass-card">
          <div class="modal-header">
            <h2 class="modal-title">Game {{ currentGame }} Result</h2>
            <div class="game-number-badge">{{ currentGame }}</div>
          </div>
          
          <div v-if="selectedStageInfo" class="selected-stage">
            <div class="stage-image-container">
              <img 
                :src="selectedStageInfo.imageUrl" 
                :alt="selectedStageInfo.name"
                class="stage-image"
                @error="handleImageError"
              />
              <div class="stage-overlay">
                <div class="stage-selected-badge">
                  <span class="badge-icon">🎯</span>
                  <span class="badge-text">SELECTED</span>
                </div>
              </div>
            </div>
            <h3 class="stage-name">{{ selectedStageInfo.name }}</h3>
          </div>
          
          <div class="winner-selection">
            <div class="selection-header">
              <div class="selection-icon">🏆</div>
              <h3 class="modal-title">Select Winner</h3>
            </div>
            <div class="player-buttons">
              <button 
                class="player-button player-1-button" 
                @click="confirmWinner(0)"
              >
                <div class="player-avatar">👤</div>
                <span class="player-name">{{ players[0].name }}</span>
                <div class="button-arrow">→</div>
              </button>
              <button 
                class="player-button player-2-button" 
                @click="confirmWinner(1)"
              >
                <div class="player-avatar">👤</div>
                <span class="player-name">{{ players[1].name }}</span>
                <div class="button-arrow">→</div>
              </button>
            </div>
          </div>
        </div>
      </div>
      <button class="modal-close" @click="closeModal">
        <span class="close-icon">×</span>
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { StageService } from '../services/StageService'
import type { Stage } from '../types'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['close'])

const gameStore = useGameStore()

const players = computed(() => gameStore.players)
const currentGame = computed(() => gameStore.currentGame)
const selectedStage = computed(() => gameStore.selectedStage)

// Get the full stage information including image
const selectedStageInfo = computed((): Stage | null => {
  if (!selectedStage.value) return null
  return StageService.getStageById(selectedStage.value) || null
})

function closeModal() {
  emit('close')
}

function confirmWinner(playerIndex: number) {
  gameStore.declareWinner(playerIndex)
  closeModal()
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  // Fallback to a placeholder or hide the image if it fails to load
  img.style.display = 'none'
}
</script>

<style scoped>
.modal {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  align-items: center;
  justify-content: center;
}

.modal-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 1000;
}

.modal-content {
  position: relative;
  z-index: 1001;
  width: 90%;
  max-height: 100vh;
  overflow-y: auto;
  max-width: 600px;
  margin: 0 auto;
  padding: var(--spacing-md);
}

.modal-box {
  padding: var(--spacing-2xl);
  position: relative;
  overflow: visible;
}

.modal-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-success) 50%, var(--color-warning) 100%);
  border-radius: var(--border-radius) var(--border-radius) 0 0;
}

.modal-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
  position: relative;
}

.modal-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-dark);
  margin: 0 0 var(--spacing-md) 0;
  background: linear-gradient(135deg, var(--color-light) 0%, var(--color-light-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.game-number-badge {
  display: inline-block;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  color: white;
  font-size: var(--font-size-lg);
  font-weight: 700;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: 25px;
  box-shadow: 0 4px 16px rgba(79, 70, 229, 0.3);
  animation: bounce-in 0.6s ease-out 0.2s both;
}

.selected-stage {
  background: rgba(255, 255, 255, 0.8);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--spacing-2xl);
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  animation: slide-in-up 0.6s ease-out 0.3s both;
}

.stage-image-container {
  margin-bottom: var(--spacing-lg);
  display: flex;
  justify-content: center;
  position: relative;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.stage-image {
  max-width: 100%;
  height: auto;
  border-radius: var(--border-radius-lg);
  max-height: 250px;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.stage-image:hover {
  transform: scale(1.02);
}

.stage-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(52, 211, 153, 0.9) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.stage-image-container:hover .stage-overlay {
  opacity: 1;
}

.stage-selected-badge {
  text-align: center;
  color: white;
}

.badge-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: var(--spacing-xs);
}

.badge-text {
  font-size: var(--font-size-sm);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stage-name {
  margin: 0;
  font-size: var(--font-size-xl);
  color: var(--color-dark);
  font-weight: 600;
}

.winner-selection {
  text-align: center;
}

.selection-header {
  margin-bottom: var(--spacing-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
}

.selection-icon {
  font-size: 2rem;
  animation: bounce-in 0.6s ease-out 0.4s both;
}

.selection-header h3 {
  margin: 0;
  font-size: var(--font-size-xl);
  color: var(--color-dark);
  font-weight: 600;
}

.player-buttons {
  display: flex;
  gap: var(--spacing-lg);
  justify-content: center;
  flex-wrap: wrap;
}

.player-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xl);
  border: none;
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-lg);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  min-width: 180px;
  position: relative;
  overflow: hidden;
  box-shadow: var(--box-shadow);
}

.player-button::before {
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

.player-button:active::before {
  width: 300px;
  height: 300px;
}

.player-1-button {
  background: linear-gradient(135deg, var(--player1-color) 0%, var(--player1-color-light) 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
}

.player-1-button:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
}

.player-2-button {
  background: linear-gradient(135deg, var(--player2-color) 0%, var(--player2-color-light) 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
}

.player-2-button:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
}

.player-avatar {
  font-size: 2.5rem;
  margin-bottom: var(--spacing-xs);
}

.player-name {
  font-size: var(--font-size-lg);
  font-weight: 700;
  margin-bottom: var(--spacing-xs);
}

.button-arrow {
  font-size: var(--font-size-xl);
  font-weight: 700;
  opacity: 0.8;
  transition: transform var(--transition-normal);
}

.player-button:hover .button-arrow {
  transform: translateX(4px);
}

.modal-close {
  position: fixed;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  background: linear-gradient(135deg, var(--color-danger) 0%, var(--color-danger-light) 100%);
  border: none;
  cursor: pointer;
  z-index: 1002;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
  transition: all var(--transition-normal);
  animation: bounce-in 0.6s ease-out 0.5s both;
}

.close-icon {
  color: white;
  margin-bottom: 0.1em;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.modal-close:hover {
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
}

/* Modal Transition Animations */
.modal-enter-active,
.modal-leave-active {
  transition: all var(--transition-slow);
}

.modal-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.modal-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

/* Animations */
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

@keyframes slide-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: var(--spacing-md);
  }

  .modal-close {
    display: none;
  }
  
  .modal-box {
    padding: var(--spacing-xl);
  }
  
  .player-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .player-button {
    width: 100%;
    max-width: 250px;
  }
  
  .stage-image {
    max-height: 200px;
  }
  
  .modal-close {
    top: var(--spacing-md);
    right: var(--spacing-md);
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .close-icon {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .modal-box {
    padding: var(--spacing-lg);
  }
  
  .modal-title {
    font-size: var(--font-size-xl);
  }
  
  .selected-stage {
    padding: var(--spacing-lg);
  }
  
  .stage-name {
    font-size: var(--font-size-lg);
  }
  
  .selection-header h3 {
    font-size: var(--font-size-lg);
  }
  
  .player-button {
    padding: var(--spacing-lg);
    min-width: 160px;
  }
  
  .stage-image {
    max-height: 180px;
  }
}

/* Focus styles for accessibility */
.player-button:focus-visible,
.modal-close:focus-visible {
  outline: 3px solid var(--color-info);
  outline-offset: 2px;
}

/* Touch device optimizations */
@media (hover: none) {
  .player-button:active {
    transform: scale(0.98);
  }
  
  .modal-close:active {
    transform: scale(0.95);
  }
  
  .stage-image-container:active .stage-overlay {
    opacity: 1;
  }
}
</style>
