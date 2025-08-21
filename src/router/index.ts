import { createRouter, createWebHistory } from 'vue-router'
import { useGameStore } from '../stores/gameStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/game',
      name: 'game',
      component: () => import('../views/GameView.vue')
    },
    {
      path: '/set-complete',
      name: 'set-complete',
      component: () => import('../views/SetCompleteView.vue'),
      beforeEnter: (to, from, next) => {
        const gameStore = useGameStore()
        if (gameStore.currentPhase !== 'set-complete') {
          next('/')
        } else {
          next()
        }
      }
    }
  ]
})

export default router
