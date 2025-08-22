import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import GameView from '../views/GameView.vue'
import SetCompleteView from '../views/SetCompleteView.vue'
import { useGameStore } from '../stores/gameStore'

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
  const gameStore = useGameStore()
  
  if (gameStore.currentPhase === 'set-complete' && to.name !== 'set-complete') {
    next({ name: 'set-complete' })
  } else {
    next()
  }
})

export default router
