import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import './style.css'
import App from './App.vue'
import router from './router'
import { useGameStore } from './stores/gameStore'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)

// Navigation guard to check game state
router.beforeEach((to, from, next) => {
  const gameStore = useGameStore()
  
  if (gameStore.currentPhase === 'set-complete' && to.name !== 'set-complete') {
    next({ name: 'set-complete' })
  } else {
    next()
  }
})

app.mount('#app')
