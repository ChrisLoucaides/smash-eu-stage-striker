<template>
  <div class="home-view">
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">EU Ruleset Ban App (Beta)</h1>
        <p class="hero-subtitle">Ban stage selection for Super Smash Bros. Ultimate by <a href="https://x.com/ChrisLoucaides" target="_blank">Afro</a></p>
      </div>
    </div>

    <div class="setup-section glass-card">
      <div class="section-header">
        <h2 class="section-heading">Tournament Ruleset</h2>
        <p class="section-description">Official SmashEU competitive format</p>
      </div>

      <div class="rules-grid">
        <div class="rule-card">
          <div class="rule-icon">⚔️</div>
          <h3>3 Stocks</h3>
          <p>Standard competitive format</p>
        </div>
        <div class="rule-card">
          <div class="rule-icon">⏱️</div>
          <h3>7 Minutes</h3>
          <p>Time limit per match</p>
        </div>
        <div class="rule-card">
          <div class="rule-icon">🎭</div>
          <h3>Characters First</h3>
          <p>Select characters before stages</p>
        </div>
        <div class="rule-card">
          <div class="rule-icon">✂️</div>
          <h3>RPS to Ban</h3>
          <p>Rock, Paper, Scissors for first ban</p>
        </div>
        <div class="rule-card">
          <div class="rule-icon">🎮</div>
          <h3>Game 1: 3-4-1</h3>
          <p>3 bans, 4 bans, 1 pick</p>
        </div>
        <div class="rule-card">
          <div class="rule-icon">🏆</div>
          <h3>Game 2+: Winner bans 3</h3>
          <p>Loser picks from remaining stages</p>
        </div>
      </div>

      <div class="setup-actions">
        <button @click="openSetupModal" class="setup-button primary-button">
          <span class="button-icon">🎯</span>
          Start Match Setup
        </button>
        <a href="https://www.ssbwiki.com/Tournament_rulesets_(SSBU)#Unified_European_Ruleset" target="_blank">
          <button class="rules-button secondary-button">
            <span class="button-icon">📖</span>
            View Full Rules
          </button>
        </a>
      </div>
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
  padding: var(--spacing-lg);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
  overflow-x: hidden; /* Prevent horizontal scroll */
  width: 100%;
  max-width: 100vw;
  box-sizing: border-box;
}

/* Hero Section */
.hero-section {
  text-align: center;
  padding: var(--spacing-2xl) 1;
  margin-top: -4em;
  animation: fade-in-up 1s ease-out;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
  margin-bottom: var(--spacing-lg);
  background: linear-gradient(135deg, #f5f0f0 0%, #c3bfc7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-top: 1em;
}

.hero-subtitle {
  font-size: clamp(1.1rem, 2.5vw, 1.5rem);
  color: var(--color-light);
  margin-bottom: -1em;
  opacity: 0.9;
  font-weight: 400;
}

.hero-subtitle a {
  color: var(--color-light);
  text-decoration: underline;
}

/* Setup Section */
.setup-section {
  padding: var(--spacing-2xl);
  animation: slide-in-up 0.8s ease-out 0.2s both;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

.section-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.section-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: var(--spacing-sm);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-heading {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: var(--spacing-sm);
  background: linear-gradient(135deg, var(--color-light) 0%, var(--color-light-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}


.section-description {
  font-size: var(--font-size-lg);
  color: var(--color-light-secondary);
  margin: 0;
  font-weight: 400;
}

/* Rules Grid */
.rules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

.rule-card {
  background: rgba(255, 255, 255, 0.8);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  text-align: center;
  transition: all var(--transition-normal);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
}

.rule-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.95);
}

.rule-icon {
  font-size: 2.5rem;
  margin-bottom: var(--spacing-md);
  display: block;
}

.rule-card h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-dark);
  margin: 0 0 var(--spacing-sm) 0;
}

.rule-card p {
  font-size: var(--font-size-md);
  color: var(--color-dark-secondary);
  margin: 0;
  line-height: 1.5;
}

/* Setup Actions */
.setup-actions {
  display: flex;
  gap: var(--spacing-lg);
  justify-content: center;
  flex-wrap: wrap;
}

.setup-button,
.rules-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg) var(--spacing-xl);
  font-size: var(--font-size-lg);
  font-weight: 600;
  border: none;
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
  min-width: 200px;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
}

.setup-button {
  background: linear-gradient(135deg, var(--color-success) 0%, var(--color-success-light) 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
}

.setup-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
}

.rules-button {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(79, 70, 229, 0.3);
}

.rules-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.4);
}

.button-icon {
  font-size: 1.2em;
}

/* Button ripple effect */
.setup-button::before,
.rules-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.setup-button:active::before,
.rules-button:active::before {
  width: 300px;
  height: 300px;
}

/* Animations */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-in-up {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Stagger animation for rule cards */
.rule-card:nth-child(1) { animation: fade-in-up 0.6s ease-out 0.4s both; }
.rule-card:nth-child(2) { animation: fade-in-up 0.6s ease-out 0.5s both; }
.rule-card:nth-child(3) { animation: fade-in-up 0.6s ease-out 0.6s both; }
.rule-card:nth-child(4) { animation: fade-in-up 0.6s ease-out 0.7s both; }
.rule-card:nth-child(5) { animation: fade-in-up 0.6s ease-out 0.8s both; }
.rule-card:nth-child(6) { animation: fade-in-up 0.6s ease-out 0.9s both; }

/* Responsive Design */
@media (max-width: 768px) {
  .home-view {
    padding: var(--spacing-md);
    gap: var(--spacing-xl);
    overflow-x: hidden; /* Prevent horizontal scroll */
    width: 100%;
    max-width: 100vw;
  }

  .setup-section {
    padding: var(--spacing-xl);
    overflow-x: hidden; /* Prevent horizontal scroll */
  }

  .rules-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-md);
    overflow-x: hidden; /* Prevent horizontal scroll */
  }

  .setup-actions {
    flex-direction: column;
    align-items: center;
    overflow-x: hidden; /* Prevent horizontal scroll */
  }

  .setup-button,
  .rules-button {
    width: 100%;
    max-width: 300px;
  }
}

@media (max-width: 480px) {
  .home-view {
    padding: var(--spacing-lg);
    overflow-x: hidden; /* Prevent horizontal scroll */
    width: 100%;
    max-width: 100vw;
  }

  .hero-section {
    padding: var(--spacing-xl) 0;
    overflow-x: hidden; /* Prevent horizontal scroll */
  }

  .setup-section {
    padding: var(--spacing-lg);
    overflow-x: hidden; /* Prevent horizontal scroll */
  }

  .rules-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
    overflow-x: hidden; /* Prevent horizontal scroll */
  }

  .rule-card {
    padding: var(--spacing-md);
  }

  .setup-button,
  .rules-button {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: var(--font-size-md);
  }
}

.rules-button a {
  color: white;
}

/* Focus styles for accessibility */
.setup-button:focus-visible,
.rules-button:focus-visible {
  outline: 3px solid var(--color-info);
  outline-offset: 2px;
}

/* Touch device optimizations */
@media (hover: none) {
  .rule-card:active {
    transform: scale(0.98);
  }

  .setup-button:active,
  .rules-button:active {
    transform: scale(0.98);
  }
}
</style>
