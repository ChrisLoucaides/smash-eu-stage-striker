<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import SessionRecoveryNotification from './components/SessionRecoveryNotification.vue'

const route = useRoute()

const getTransitionName = (routeName: string): string => {
  switch (routeName) {
    case 'home':
      return 'page'
    case 'game':
      return 'slide'
    case 'set-complete':
      return 'fade'
    default:
      return 'fade'
  }
}
</script>

<template>
  <div id="app">
    <!-- Dust Particles Background -->
    <div class="dust-particles">
      <div class="dust-particle"></div>
      <div class="dust-particle"></div>
      <div class="dust-particle"></div>
      <div class="dust-particle"></div>
      <div class="dust-particle"></div>
      <div class="dust-particle"></div>
      <div class="dust-particle"></div>
      <div class="dust-particle"></div>
      <div class="dust-particle"></div>
      <div class="dust-particle"></div>
      <div class="dust-particle"></div>
      <div class="dust-particle"></div>
      <div class="dust-particle"></div>
      <div class="dust-particle"></div>
      <div class="dust-particle"></div>
      <div class="dust-particle"></div>
      <div class="dust-particle"></div>
      <div class="dust-particle"></div>
      <div class="dust-particle"></div>
      <div class="dust-particle"></div>
      <div class="dust-particle"></div>
      <div class="dust-particle"></div>
      <div class="dust-particle"></div>
      <div class="dust-particle"></div>
      <div class="dust-particle"></div>
    </div>
    
    <SessionRecoveryNotification />
    
    <RouterView v-slot="{ Component, route }">
      <Transition 
        :name="getTransitionName(route.name as string)"
        mode="out-in"
      >
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </div>
</template>

<style>
#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  width: 100%;
}

/* Page Transitions */
.page-enter-active,
.page-leave-active {
  transition: all var(--transition-slow);
}

.page-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-enter-active,
.slide-leave-active {
  transition: all var(--transition-normal);
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-normal);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  #app {
    padding: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  #app {
    padding: var(--spacing-sm);
  }
}
</style>
