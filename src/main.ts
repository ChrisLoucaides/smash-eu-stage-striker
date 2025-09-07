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

// Initialize performance monitoring
import('./services/PerformanceMonitor').then(({ PerformanceMonitor }) => {
  PerformanceMonitor.init();
  
  // Log performance score after 5 seconds
  setTimeout(() => {
    const score = PerformanceMonitor.getPerformanceScore();
    console.log('Performance Score:', score);
    
    // Log device capabilities
    const capabilities = PerformanceMonitor.getDeviceCapabilities();
    console.log('Device Capabilities:', capabilities);
  }, 5000);
}).catch(() => {
  console.warn('Could not initialize performance monitoring');
});

// Register service worker for caching and offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/smash-eu-stage-striker/'
      });
      
      console.log('Service Worker registered successfully:', registration);
      
      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is available
              console.log('New service worker available. Refresh to update.');
              // You could show a notification to the user here
            }
          });
        }
      });
      
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  });
}
