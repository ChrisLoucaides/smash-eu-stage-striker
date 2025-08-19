<template>
  <div class="gentlemans-agreement">
    <label class="checkbox">
      <input 
        type="checkbox" 
        :checked="isEnabled" 
        @change="toggleGentlemansAgreement"
        :disabled="!canToggle"
      >
      <span class="checkbox-label">Gentleman's Agreement (Skip Bans)</span>
    </label>
    
    <div v-if="isEnabled" class="agreement-info">
      <p>Ban sequence bypassed. Select any stage by mutual agreement.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../stores/gameStore'

const gameStore = useGameStore()

const isEnabled = computed(() => gameStore.gentlemansAgreement)

const canToggle = computed(() => {
  // Only allow toggling during banning or selecting phases
  return ['banning', 'selecting'].includes(gameStore.currentPhase)
})

function toggleGentlemansAgreement(event: Event) {
  const isChecked = (event.target as HTMLInputElement).checked
  
  if (isChecked) {
    if (confirm('Enable Gentleman\'s Agreement? This will clear all current bans and allow direct stage selection.')) {
      gameStore.enableGentlemansAgreement()
    } else {
      // Reset checkbox if user cancels
      (event.target as HTMLInputElement).checked = false
    }
  } else {
    if (confirm('Disable Gentleman\'s Agreement? This will restart the ban phase.')) {
      gameStore.disableGentlemansAgreement()
    } else {
      // Reset checkbox if user cancels
      (event.target as HTMLInputElement).checked = true
    }
  }
}
</script>

<style scoped>
.gentlemans-agreement {
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 8px;
  background-color: #f8f9fa;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}

.gentlemans-agreement:hover {
  border-color: #17a2b8;
  background-color: #f1f8ff;
}

.checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
  color: #495057;
}

.checkbox input[type="checkbox"] {
  margin-right: 0.75rem;
  width: 1.2rem;
  height: 1.2rem;
  cursor: pointer;
}

.checkbox input[type="checkbox"]:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.checkbox-label {
  cursor: pointer;
}

.agreement-info {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background-color: #d1ecf1;
  border: 1px solid #bee5eb;
  border-radius: 6px;
  color: #0c5460;
  font-style: italic;
  font-size: 0.9rem;
}

.agreement-info p {
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .gentlemans-agreement {
    margin: 0.75rem 0;
    padding: 0.75rem;
  }
  
  .checkbox {
    font-size: 0.9rem;
  }
  
  .agreement-info {
    font-size: 0.85rem;
    padding: 0.5rem;
  }
}
</style>
