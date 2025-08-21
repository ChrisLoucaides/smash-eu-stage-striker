<script setup lang="ts">
import { RouterView } from 'vue-router'
import SessionRecoveryNotification from './components/SessionRecoveryNotification.vue'
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>Smash Stage Striker</h1>
      <p>Tournament Stage Ban Tool</p>
    </header>
    
    <SessionRecoveryNotification />
    <RouterView />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.app-header {
  text-align: center;
  color: white;
  margin-bottom: 30px;
}

.app-header h1 {
  font-size: 2.5rem;
  margin: 0 0 10px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.app-header p {
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.9;
}

/* Responsive Design */
@media (max-width: 768px) {
  .app {
    padding: 15px;
  }
  
  .app-header h1 {
    font-size: 2rem;
  }
  
  .app-header p {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .app-header h1 {
    font-size: 1.8rem;
  }
}
</style>
