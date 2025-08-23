<template>
  <div class="home-view">
    <div class="setup-section">
      <h2>Ruleset</h2>
      <p>This app allows for stage bans using the SmashEU rulest</p>
      <ul>
        <li>3 Stocks</li>
        <li>7 Minutes</li>
        <li>Characters First</li>
        <li>RPS to ban 1st</li>
        <li>Game 1: 3-4-1 Bans</li>
        <li>Game 2+: Winner Bans 3, loser picks</li>
      </ul>
      <button @click="openSetupModal" class="setup-button">
        Player/Match Setup
      </button>
    </div>

    <!-- Setup Modal -->
    <SetupModal
      :is-open="showSetupModal"
      @close="closeSetupModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SetupModal from '../components/SetupModal.vue'

const showSetupModal = ref(false)

const openSetupModal = () => {
  showSetupModal.value = true
}

const closeSetupModal = () => {
  showSetupModal.value = false
}
</script>

<style scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.setup-section {
  text-align: center;
  background: linear-gradient(135deg, #ffffff 0%, #d0deef 100%);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.6);
}

.setup-section h2 {
  color: var(--color-dark);
  margin-bottom: var(--spacing-lg);
}

.setup-section p{
  color: #666;
  margin-bottom: var(--spacing-xl);
  font-size: var(--font-size-lg);
}

li{
  color: #666;
  font-size: var(--font-size-lg);
  text-align: left;
}

.setup-button {
  background: var(--color-success);
  color: white;
  border: none;
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-lg);
  border-radius: var(--border-radius);
  cursor: pointer;
  box-shadow: var(--box-shadow);
  transition: all 0.3s ease;
}

.setup-button:hover {
  background: #218838;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

/* Responsive Design */
@media (max-width: 768px) {
  .home-view {
    padding: var(--spacing-md);
  }

  .setup-section {
    padding: var(--spacing-lg);
  }
}

@media (max-width: 480px) {
  .setup-section {
    padding: var(--spacing-md);
  }

  .setup-button {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: var(--font-size-md);
  }
}
</style>
