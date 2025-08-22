<template>
  <div v-if="isOpen" class="modal is-active">
    <div class="modal-background" @click="closeModal"></div>
    <div class="modal-content">
      <div class="box">
        <h2 class="title">Game {{ currentGame }} Result</h2>
        
        <div v-if="selectedStageInfo" class="selected-stage">
          <div class="stage-image-container">
            <img 
              :src="selectedStageInfo.imageUrl" 
              :alt="selectedStageInfo.name"
              class="stage-image"
              @error="handleImageError"
            />
          </div>
          <p class="stage-name">{{ selectedStageInfo.name }}</p>
        </div>
        
        <div class="winner-selection">
          <p>Select Winner:</p>
          <div class="buttons">
            <button 
              class="button is-primary" 
              @click="confirmWinner(0)"
            >
              {{ players[0].name }}
            </button>
            <button 
              class="button is-info" 
              @click="confirmWinner(1)"
            >
              {{ players[1].name }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <button class="modal-close is-large" @click="closeModal"><span>x</span></button>
  </div>
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
  z-index: 40;
}

.modal-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(10, 10, 10, 0.86);
  z-index: 40;
}

.modal-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 50;
  width: 90%;
  max-width: 500px;
}

.box {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #363636;
  margin-bottom: 1.5rem;
  text-align: center;
}

.selected-stage {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  text-align: center;
}

.stage-image-container {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

.stage-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  max-height: 200px;
  object-fit: cover;
}

.stage-name {
  margin: 0;
  font-size: 1.1rem;
  color: #363636;
  font-weight: 500;
}

.winner-selection {
  text-align: center;
}

.winner-selection p {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #7a7a7a;
}

.buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.button.is-primary {
  background-color: #3273dc;
  color: white;
}

.button.is-primary:hover {
  background-color: #2366d1;
  transform: translateY(-1px);
}

.button.is-info {
  background-color: #209cee;
  color: white;
}

.button.is-info:hover {
  background-color: #1a8fd8;
  transform: translateY(-1px);
}

.modal-close {
  position: fixed;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 60;
  width: 2rem;
  height: 3.4rem;
  border-radius: 50%;
  background-color: #e84f4f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #7a7a7a;
  transition: all 0.2s ease;
}

.modal-close span {
  color: #1a1a1a;
  margin-bottom: 5px;
}

.modal-close:hover {
  background-color: #731717;
  transform: scale(1.1);
}

.modal-close:hover span{
  color: #b0aeae;
}

/* Responsive design */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .box {
    padding: 1.5rem;
  }
  
  .buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .button {
    width: 100%;
    max-width: 200px;
  }
  
  .stage-image {
    max-height: 150px;
  }
}

@media (max-width: 480px) {
  .box {
    padding: 1rem;
  }
  
  .title {
    font-size: 1.3rem;
  }
  
  .selected-stage {
    padding: 0.75rem;
  }
  
  .winner-selection p {
    font-size: 1rem;
  }
  
  .stage-image {
    max-height: 120px;
  }
}
</style>
