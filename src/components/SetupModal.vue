<template>
  <Transition name="modal">
    <div class="modal" :class="{ 'is-active': isOpen }">
      <div class="modal-background" @click="closeModal"></div>
      <div class="modal-content">
        <div class="modal-box glass-card">
          <div class="modal-header">
            <h2 class="modal-title">Match Setup</h2>
            <div class="setup-icon">⚔️</div>
          </div>
          
          <form @submit.prevent="submitForm" class="setup-form">
            <div class="form-section">
              <h3 class="section-title">Player Information</h3>
              <div class="player-fields">
                <div class="field">
                  <label class="label">
                    <span class="label-icon">👤</span>
                    Player 1 Name
                  </label>
                  <div class="control">
                    <input 
                      class="input" 
                      type="text" 
                      v-model="player1Name" 
                      required
                      maxlength="20"
                      @input="validatePlayerNames"
                      @focus="clearOnFocus"
                      @blur="restoreDefaultOnBlur"
                      data-player="1"
                      placeholder="Enter Player 1 name"
                    >
                  </div>
                  <p v-if="nameError" class="help is-danger">{{ nameError }}</p>
                </div>
                
                <div class="field">
                  <label class="label">
                    <span class="label-icon">👤</span>
                    Player 2 Name
                  </label>
                  <div class="control">
                    <input 
                      class="input" 
                      type="text" 
                      v-model="player2Name" 
                      required
                      maxlength="20"
                      @input="validatePlayerNames"
                      @focus="clearOnFocus"
                      @blur="restoreDefaultOnBlur"
                      data-player="2"
                      placeholder="Enter Player 2 name"
                    >
                  </div>
                </div>
              </div>
            </div>
            
            <div class="form-section">
              <h3 class="section-title">Match Configuration</h3>
              <div class="config-fields">
                <div class="field">
                  <label class="label">
                    <span class="label-icon">🏆</span>
                    Match Format
                  </label>
                  <div class="radio-group">
                    <label class="radio-option">
                      <input type="radio" v-model="matchFormat" value="BO3">
                      <span class="radio-custom"></span>
                      <span class="radio-text">Best of 3</span>
                    </label>
                    <label class="radio-option">
                      <input type="radio" v-model="matchFormat" value="BO5">
                      <span class="radio-custom"></span>
                      <span class="radio-text">Best of 5</span>
                    </label>
                  </div>
                </div>
                
                <div class="field">
                  <label class="label">
                    <span class="label-icon">✂️</span>
                    First Ban
                  </label>
                  <div class="radio-group">
                    <label class="radio-option">
                      <input type="radio" v-model="firstBan" :value="0">
                      <span class="radio-custom"></span>
                      <span class="radio-text">{{ player1Name || 'Player 1' }}</span>
                    </label>
                    <label class="radio-option">
                      <input type="radio" v-model="firstBan" :value="1">
                      <span class="radio-custom"></span>
                      <span class="radio-text">{{ player2Name || 'Player 2' }}</span>
                    </label>
                  </div>
                  <p class="help">The first player to ban stages in Game 1</p>
                </div>
                
                <div class="field">
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      v-model="gentlemansAgreement"
                      class="checkbox"
                    >
                    <span class="checkbox-custom"></span>
                    <span class="checkbox-text">
                      <span class="label-icon">🤝</span>
                      Gentleman's Agreement
                    </span>
                  </label>
                  <p class="help">Skip the ban phase and allow direct stage selection by mutual agreement</p>
                </div>
              </div>
            </div>
            
            <div class="form-actions">
              <button 
                class="action-button primary-button" 
                type="submit"
                :disabled="!isFormValid"
              >
                <span class="button-icon">🚀</span>
                Start Match
              </button>
              <button 
                type="button" 
                class="action-button secondary-button" 
                @click="closeModal"
              >
                <span class="button-icon">❌</span>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
      <button class="modal-close" @click="closeModal">
        <span class="close-icon">×</span>
      </button>
    </div>
  </Transition>
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

function clearOnFocus(event: Event) {
  const input = event.target as HTMLInputElement
  const playerNum = input.dataset.player
  
  // Only clear if the current value is the default
  if (playerNum === '1' && player1Name.value === 'Player 1') {
    player1Name.value = ''
  } else if (playerNum === '2' && player2Name.value === 'Player 2') {
    player2Name.value = ''
  }
}

function restoreDefaultOnBlur(event: Event) {
  const input = event.target as HTMLInputElement
  const playerNum = input.dataset.player
  
  // Restore default if field is empty
  if (playerNum === '1' && player1Name.value.trim() === '') {
    player1Name.value = 'Player 1'
  } else if (playerNum === '2' && player2Name.value.trim() === '') {
    player2Name.value = 'Player 2'
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
  align-items: center;
  justify-content: center;
}

.modal.is-active {
  display: flex;
}

.modal-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  cursor: pointer;
}

.modal-content {
  position: relative;
  width: 95%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  z-index: 1001;
  margin: 0 auto;
  padding: var(--spacing-md);
}

.modal-box {
  padding: var(--spacing-2xl);
  position: relative;
  overflow: hidden;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.modal-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-dark);
  margin: 0;
  background: linear-gradient(135deg, var(--color-light) 0%, var(--color-light-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.setup-icon {
  font-size: 3rem;
  animation: bounce-in 0.6s ease-out 0.2s both;
}

.setup-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
}

.form-section {
  background: rgba(255, 255, 255, 0.8);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  animation: slide-in-up 0.6s ease-out 0.3s both;
}

.form-section:nth-child(2) {
  animation-delay: 0.4s;
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-dark);
  margin: 0 0 var(--spacing-lg) 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.section-title::before {
  content: '';
  width: 4px;
  height: 20px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  border-radius: 2px;
}

.player-fields,
.config-fields {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.field {
  margin-bottom: var(--spacing-lg);
}

.field:last-child {
  margin-bottom: 0;
}

.label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 600;
  color: var(--color-dark);
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-md);
}

.label-icon {
  font-size: 1.2em;
}

.control {
  margin-bottom: var(--spacing-sm);
}

.input {
  background: rgba(255, 255, 255, 0.9);
  text-align: center;
  font-weight: 600;
  color: var(--color-dark);
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-md);
  transition: all var(--transition-normal);
  box-sizing: border-box;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  transform: translateY(-2px);
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.radio-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--border-radius);
  transition: background-color var(--transition-normal);
}

.radio-option:hover {
  background: rgba(79, 70, 229, 0.05);
}

.radio-option input[type="radio"] {
  display: none;
}

.radio-custom {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-primary);
  border-radius: 50%;
  position: relative;
  transition: all var(--transition-normal);
}

.radio-option input[type="radio"]:checked + .radio-custom::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  background: var(--color-primary);
  border-radius: 50%;
}

.radio-text {
  font-weight: 500;
  color: var(--color-dark);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--border-radius);
  transition: background-color var(--transition-normal);
}

.checkbox-label:hover {
  background: rgba(79, 70, 229, 0.05);
}

.checkbox {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-primary);
  border-radius: 4px;
  position: relative;
  transition: all var(--transition-normal);
}

.checkbox:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--color-primary);
  font-weight: 700;
  font-size: 14px;
}

.checkbox-text {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 500;
  color: var(--color-dark);
}

.help {
  font-size: var(--font-size-sm);
  color: var(--color-dark-secondary);
  margin-top: var(--spacing-xs);
  font-style: italic;
}

.help.is-danger {
  color: var(--color-danger);
  font-weight: 500;
}

.form-actions {
  display: flex;
  gap: var(--spacing-lg);
  justify-content: center;
  flex-wrap: wrap;
  margin-top: var(--spacing-xl);
}

.action-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg) var(--spacing-xl);
  font-size: var(--font-size-lg);
  font-weight: 600;
  border: none;
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
  min-width: 160px;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.action-button::before {
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

.action-button:active::before {
  width: 300px;
  height: 300px;
}

.primary-button {
  background: linear-gradient(135deg, var(--color-success) 0%, var(--color-success-light) 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
}

.primary-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
}

.primary-button:disabled {
  background: var(--color-light-secondary);
  color: var(--color-dark-secondary);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.secondary-button {
  background: linear-gradient(135deg, var(--color-light-secondary) 0%, var(--color-light) 100%);
  color: var(--color-dark);
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.secondary-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.button-icon {
  font-size: 1.2em;
}

.modal-close {
  z-index: 999;
  position: absolute;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  background: linear-gradient(135deg, var(--color-danger) 0%, var(--color-danger-light) 100%);
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: white;
  width: 3rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all var(--transition-normal);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
  animation: bounce-in 0.6s ease-out 0.5s both;
}

.close-icon {
  margin-bottom: 0.2em;
  font-size: 2.5rem;
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
@media (max-width: 850px) {
  .modal-close {
    display: none
  }
}

@media (min-width: 768px) {
  .modal-content {
    width: 80%;
    max-width: 600px;
  }
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: var(--spacing-md);
  }
  
  .modal-box {
    padding: var(--spacing-xl);
  }
  
  .form-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .action-button {
    width: 100%;
    max-width: 250px;
  }
  
  .player-fields,
  .config-fields {
    gap: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .modal-box {
    padding: var(--spacing-lg);
  }
  
  .modal-title {
    font-size: var(--font-size-xl);
  }
  
  .form-section {
    padding: var(--spacing-lg);
  }
  
  .input {
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .action-button {
    padding: var(--spacing-md) var(--spacing-lg);
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

/* Focus styles for accessibility */
.input:focus,
.radio-option input:focus + .radio-custom,
.checkbox:focus + .checkbox-custom,
.action-button:focus-visible,
.modal-close:focus-visible {
  outline: 3px solid var(--color-info);
  outline-offset: 2px;
}

/* Touch device optimizations */
@media (hover: none) {
  .action-button:active {
    transform: scale(0.98);
  }
  
  .modal-close:active {
    transform: scale(0.95);
  }
  
  .radio-option:active,
  .checkbox-label:active {
    background: rgba(79, 70, 229, 0.1);
  }
}
</style>
