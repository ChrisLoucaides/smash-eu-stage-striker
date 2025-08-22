<template>
  <div v-if="showNotification" class="session-recovery-notification">
    <div class="notification is-info">
      <button class="delete" @click="dismissNotification"></button>
      <p>Previous session recovered. Would you like to continue or start a new match?</p>
      <div class="buttons">
        <button class="button is-primary" @click="continueSession">Continue</button>
        <button class="button is-danger" @click="startNewSession">New Match</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useRouter } from 'vue-router'

const gameStore = useGameStore()
const router = useRouter()
const showNotification = ref(false)

onMounted(() => {
  // Check if there's a saved session that's not in setup phase
  console.log('SessionRecoveryNotification mounted, currentPhase:', gameStore.currentPhase);
  if (gameStore.currentPhase !== 'setup') {
    console.log('Showing session recovery notification');
    showNotification.value = true
    // Auto-navigate to the appropriate view after a short delay
    setTimeout(() => {
      console.log('Auto-navigating to appropriate view, currentPhase:', gameStore.currentPhase);
      if (gameStore.currentPhase === 'set-complete') {
        router.push('/set-complete')
      } else if (gameStore.currentPhase !== 'setup') {
        router.push('/game')
      }
    }, 100)
  }
})

// Watch for phase changes to auto-navigate
watch(() => gameStore.currentPhase, (newPhase) => {
  if (newPhase !== 'setup' && showNotification.value) {
    if (newPhase === 'set-complete') {
      router.push('/set-complete')
    } else {
      router.push('/game')
    }
  }
})

function dismissNotification() {
  showNotification.value = false
}

function continueSession() {
  dismissNotification()
  // Navigate to the appropriate view based on current phase
  if (gameStore.currentPhase === 'set-complete') {
    router.push('/set-complete')
  } else {
    router.push('/game')
  }
}

function startNewSession() {
  gameStore.resetMatch()
  dismissNotification()
  router.push('/')
}
</script>

<style scoped>
.session-recovery-notification {
  position: fixed;
  top: var(--spacing-md);
  right: var(--spacing-md);
  z-index: 100;
  max-width: 400px;
}

.notification {
  background: #f0f8ff;
  border: 1px solid #b3d9ff;
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  box-shadow: var(--box-shadow);
}

.notification.is-info {
  background: #f0f8ff;
  border-color: #b3d9ff;
  color: #004085;
}

.notification p {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-sm);
}

.delete {
  background: none;
  border: none;
  float: right;
  cursor: pointer;
  font-size: var(--font-size-lg);
  color: #666;
  margin-top: calc(-1 * var(--spacing-sm));
}

.delete:hover {
  color: var(--color-dark);
}

.buttons {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
}

.button {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.button.is-primary {
  background-color: var(--color-primary);
  color: white;
}

.button.is-primary:hover {
  background-color: #2366d1;
}

.button.is-danger {
  background-color: var(--color-danger);
  color: white;
}

.button.is-danger:hover {
  background-color: #e02e4f;
}

/* Responsive Design */
@media (max-width: 768px) {
  .session-recovery-notification {
    left: var(--spacing-md);
    right: var(--spacing-md);
    max-width: none;
  }
  
  .buttons {
    flex-direction: column;
  }
  
  .button {
    width: 100%;
  }
}

/* Touch device optimizations */
@media (hover: none) {
  .button:active {
    transform: scale(0.98);
  }
  
  .delete:active {
    color: var(--color-dark);
  }
}
</style>
