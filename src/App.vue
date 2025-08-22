<script setup lang="ts">
import { RouterView } from 'vue-router'
import SessionRecoveryNotification from './components/SessionRecoveryNotification.vue'
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>SmashEU Ruleset Stage Striker (Beta)</h1>
      <p>Tournament Stage Ban Tool</p>
    </header>
    
    <SessionRecoveryNotification />
    <RouterView />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  /*background: linear-gradient(135deg, #ffffff 0%, #c7dcfa 100%);*/
  padding: var(--spacing-lg);
}

.app-header {
  text-align: center;
  color: white;
  margin-bottom: var(--spacing-xl);
}

.app-header h1 {
  font-size: var(--font-size-xl);
  color: #1a1a1a;
  margin: 0 0 var(--spacing-sm) 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.app-header p {
  font-size: var(--font-size-lg);
  color: #1a1a1a;
  margin: 0;
  opacity: 0.9;
}

/* Responsive Design */
@media (max-width: 768px) {
  .app {
    padding: var(--spacing-md);
  }
  
  .app-header h1 {
    font-size: var(--font-size-lg);
  }
  
  .app-header p {
    font-size: var(--font-size-md);
  }
}

@media (max-width: 480px) {
  .app {
    padding: var(--spacing-sm);
  }
  
  .app-header h1 {
    font-size: var(--font-size-md);
  }
  
  .app-header p {
    font-size: var(--font-size-sm);
  }
}
</style>
