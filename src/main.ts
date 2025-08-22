import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)

app.mount('#app')

// Validate restored store state after app is mounted
import('./stores/gameStore').then(({ useGameStore }) => {
  const gameStore = useGameStore()
  // Wait for store to be fully restored
  setTimeout(() => {
    gameStore.validateRestoredState()
  }, 100)
}).catch(() => {
  // If store import fails, just continue
  console.warn('Could not validate store state')
})
