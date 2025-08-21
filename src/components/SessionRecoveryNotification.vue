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
import { ref, onMounted } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useRouter } from 'vue-router'

const gameStore = useGameStore()
const router = useRouter()
const showNotification = ref(false)

onMounted(() => {
  // Check if there's a saved session that's not in setup phase
  if (gameStore.currentPhase !== 'setup') {
    showNotification.value = true
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
  top: 1rem;
  right: 1rem;
  z-index: 100;
  max-width: 400px;
}

.notification {
  background: #f0f8ff;
  border: 1px solid #b3d9ff;
  border-radius: 6px;
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.notification.is-info {
  background: #f0f8ff;
  border-color: #b3d9ff;
  color: #004085;
}

.notification p {
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
}

.delete {
  background: none;
  border: none;
  float: right;
  cursor: pointer;
  font-size: 1.2rem;
  color: #666;
  margin-top: -0.5rem;
}

.delete:hover {
  color: #333;
}

.buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button.is-primary {
  background-color: #3273dc;
  color: white;
}

.button.is-primary:hover {
  background-color: #2366d1;
}

.button.is-danger {
  background-color: #ff3860;
  color: white;
}

.button.is-danger:hover {
  background-color: #e02e4f;
}

/* Responsive Design */
@media (max-width: 768px) {
  .session-recovery-notification {
    left: 1rem;
    right: 1rem;
    max-width: none;
  }
  
  .buttons {
    flex-direction: column;
  }
  
  .button {
    width: 100%;
  }
}
</style>
