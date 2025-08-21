<template>
  <div class="home-view">
    <div class="setup-section">
      <h2>Match Setup</h2>
      <p>Configure your match settings to get started with stage banning.</p>
      <button @click="openSetupModal" class="setup-button">
        Configure Match
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
  padding: 20px;
}

.setup-section {
  text-align: center;
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.setup-section h2 {
  color: #333;
  margin-bottom: 20px;
}

.setup-section p {
  color: #666;
  margin-bottom: 30px;
  font-size: 1.1rem;
}

.setup-button {
  background: #28a745;
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 1.1rem;
  border-radius: 8px;
  cursor: pointer;
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
    padding: 15px;
  }
  
  .setup-section {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .setup-section {
    padding: 15px;
  }
  
  .setup-button {
    padding: 12px 24px;
    font-size: 1rem;
  }
}
</style>
