<template>
  <div class="modal" :class="{ 'is-active': isOpen }">
    <div class="modal-background" @click="closeModal"></div>
    <div class="modal-content">
      <div class="box">
        <h2 class="title">Match Setup</h2>
        <form @submit.prevent="submitForm">
          <div class="field">
            <label class="label">Player 1 Name</label>
            <div class="control">
              <input 
                class="input" 
                type="text" 
                v-model="player1Name" 
                required
                maxlength="20"
                @input="validatePlayerNames"
                placeholder="Enter Player 1 name"
              >
            </div>
            <p v-if="nameError" class="help is-danger">{{ nameError }}</p>
          </div>
          
          <div class="field">
            <label class="label">Player 2 Name</label>
            <div class="control">
              <input 
                class="input" 
                type="text" 
                v-model="player2Name" 
                required
                maxlength="20"
                @input="validatePlayerNames"
                placeholder="Enter Player 2 name"
              >
            </div>
          </div>
          
          <div class="field">
            <label class="label">Match Format</label>
            <div class="control">
              <label class="radio">
                <input type="radio" v-model="matchFormat" value="BO3">
                Best of 3
              </label>
              <label class="radio">
                <input type="radio" v-model="matchFormat" value="BO5">
                Best of 5
              </label>
            </div>
          </div>
          
          <div class="field">
            <label class="label">First Ban</label>
            <div class="control">
              <label class="radio">
                <input type="radio" v-model="firstBan" :value="0">
                {{ player1Name || 'Player 1' }}
              </label>
              <label class="radio">
                <input type="radio" v-model="firstBan" :value="1">
                {{ player2Name || 'Player 2' }}
              </label>
            </div>
            <p class="help">The first player to ban stages in Game 1</p>
          </div>
          
          <div class="field">
            <label class="label">
              <input 
                type="checkbox" 
                v-model="gentlemansAgreement"
                class="checkbox"
              >
              Gentleman's Agreement
            </label>
            <p class="help">Skip the ban phase and allow direct stage selection by mutual agreement</p>
          </div>
          
          <div class="field is-grouped">
            <div class="control">
              <button 
                class="button is-primary" 
                type="submit"
                :disabled="!isFormValid"
              >
                Start Match
              </button>
            </div>
            <div class="control">
              <button 
                type="button" 
                class="button is-light" 
                @click="closeModal"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
    <button class="modal-close is-large" @click="closeModal"></button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'
import type { MatchFormat } from '../types'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['close'])

const gameStore = useGameStore()
const router = useRouter()

// Form data
const player1Name = ref('Player 1')
const player2Name = ref('Player 2')
const matchFormat = ref<MatchFormat>('BO3')
const firstBan = ref(0)
const gentlemansAgreement = ref(false)

// Validation
const nameError = ref('')

// Form validation
const isFormValid = computed(() => {
  return player1Name.value.trim() !== '' && 
         player2Name.value.trim() !== '' && 
         player1Name.value.trim() !== player2Name.value.trim() &&
         nameError.value === ''
})

// Watch for changes to validate names
watch([player1Name, player2Name], () => {
  validatePlayerNames()
})

function validatePlayerNames() {
  const p1 = player1Name.value.trim()
  const p2 = player2Name.value.trim()
  
  if (p1 === '' || p2 === '') {
    nameError.value = ''
    return
  }
  
  if (p1 === p2) {
    nameError.value = 'Player names must be different'
  } else {
    nameError.value = ''
  }
}

function closeModal() {
  emit('close')
}

function submitForm() {
  if (!isFormValid.value) {
    return
  }
  
  try {
    gameStore.setupMatch({
      player1Name: player1Name.value.trim(),
      player2Name: player2Name.value.trim(),
      matchFormat: matchFormat.value,
      firstBan: firstBan.value,
      gentlemansAgreement: gentlemansAgreement.value,
    })
    closeModal()
    // Navigate to game view after successful setup
    router.push('/game')
  } catch (error) {
    console.error('Error setting up match:', error)
    // You could add a toast notification here for user feedback
  }
}
</script>

<style scoped>
.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
}

.modal.is-active {
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  cursor: pointer;
}

.modal-content {
  position: relative;
  width: 95%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  z-index: 1001;
  margin: 0 auto;
  padding: var(--spacing-md);
}

.box {
  background: white;
  border-radius: var(--border-radius);
  padding: var(--spacing-xl);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.title {
  text-align: center;
  color: var(--color-dark);
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-size-xl);
}

.field {
  margin-bottom: var(--spacing-lg);
}

.label {
  display: block;
  font-weight: 600;
  color: var(--color-dark);
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-md);
}

.control {
  margin-bottom: var(--spacing-sm);
}

.input {
  background-color: #d8dbe0;
  text-align: center;
  font-weight: bold;
  color: #1a1a1a;
  width: 100%;
  padding-top: 1em;
  padding-bottom: 1em;
  border: 2px solid #030303;
  border-radius: 30px;
  font-size: var(--font-size-md);
  transition: border-color 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(50, 115, 220, 0.1);
}

.radio {
  display: block;
  color: #1a1a1a;
  margin-bottom: var(--spacing-sm);
  cursor: pointer;
  font-size: var(--font-size-md);
}

.radio input[type="radio"] {
  margin-right: var(--spacing-sm);
}

.checkbox {
  margin-right: var(--spacing-sm);
}

.help {
  font-size: var(--font-size-sm);
  color: #666;
  margin-top: var(--spacing-xs);
}

.help.is-danger {
  color: var(--color-danger);
}

.field.is-grouped {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  margin-top: var(--spacing-xl);
}

.button {
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  border-radius: var(--border-radius);
  font-size: var(--font-size-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;
}

.button.is-primary {
  background-color: var(--color-primary);
  color: white;
}

.button.is-primary:hover:not(:disabled) {
  background-color: #2366d1;
  transform: translateY(-1px);
}

.button.is-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none;
}

.button.is-light {
  background-color: var(--color-light);
  color: var(--color-dark);
  border: 1px solid #ddd;
}

.button.is-light:hover {
  background-color: #e8e8e8;
}

.modal-close {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #666;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background-color: var(--color-light);
  color: var(--color-dark);
}

/* Responsive Design */
@media (min-width: 768px) {
  .modal-content {
    width: 80%;
    max-width: 500px;
  }
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: var(--spacing-md);
  }
  
  .box {
    padding: var(--spacing-lg);
  }
  
  .field.is-grouped {
    flex-direction: column;
    align-items: center;
  }
  
  .button {
    width: 100%;
    max-width: 200px;
  }
}

@media (max-width: 480px) {
  .box {
    padding: var(--spacing-md);
  }
  
  .title {
    font-size: var(--font-size-lg);
  }
  
  .input {
    padding: var(--spacing-sm);
  }
  
  .button {
    padding: var(--spacing-sm) var(--spacing-md);
  }
}

/* Focus styles for accessibility */
.input:focus,
.radio input:focus,
.checkbox:focus,
.button:focus {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

/* Animation for modal appearance */
.modal.is-active .modal-content {
  animation: modal-slide-in 0.3s ease-out;
}

@keyframes modal-slide-in {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Touch device optimizations */
@media (hover: none) {
  .button:active {
    transform: scale(0.98);
  }
  
  .modal-close:active {
    background-color: var(--color-light);
    color: var(--color-dark);
  }
}
</style>
