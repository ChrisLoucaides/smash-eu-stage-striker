import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import GameView from '../views/GameView.vue'
import SetCompleteView from '../views/SetCompleteView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/game',
      name: 'game',
      component: GameView
    },
    {
      path: '/set-complete',
      name: 'set-complete',
      component: SetCompleteView
    }
  ]
})

// Navigation guard to check game state
router.beforeEach((to, from, next) => {
  // Import the store inside the guard to ensure it's initialized
  import('../stores/gameStore').then(({ useGameStore }) => {
    const gameStore = useGameStore()
    
    // Check if we're trying to access the home page but have an active game
    if (to.name === 'home' && gameStore.currentPhase !== 'setup') {
      // Redirect to the appropriate game view
      if (gameStore.currentPhase === 'set-complete') {
        next({ name: 'set-complete' })
      } else {
        next({ name: 'game' })
      }
    } else if (gameStore.currentPhase === 'set-complete' && to.name !== 'set-complete') {
      // Always redirect to set-complete if the set is complete
      next({ name: 'set-complete' })
    } else {
      next()
    }
  }).catch(() => {
    // If store import fails, just continue
    next()
  })
})

export default router
