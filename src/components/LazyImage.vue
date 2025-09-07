<template>
  <div 
    class="lazy-image-container"
    :class="{ 'loaded': isLoaded, 'error': hasError }"
  >
    <!-- Placeholder while loading -->
    <div v-if="!isLoaded && !hasError" class="image-placeholder">
      <div class="placeholder-content">
        <div class="placeholder-icon">🎮</div>
        <div class="placeholder-text">{{ placeholderText }}</div>
      </div>
    </div>
    
    <!-- Error state -->
    <div v-if="hasError" class="image-error">
      <div class="error-content">
        <div class="error-icon">⚠️</div>
        <div class="error-text">{{ errorText }}</div>
      </div>
    </div>
    
    <!-- Actual image -->
    <img
      :src="src"
      :alt="alt"
      :class="['lazy-image', { 'fade-in': isLoaded }]"
      @load="handleLoad"
      @error="handleError"
      :loading="lazy ? 'lazy' : 'eager'"
      :decoding="decoding"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  src: string;
  alt: string;
  placeholderText?: string;
  errorText?: string;
  lazy?: boolean;
  quality?: number;
  width?: number;
  decoding?: 'sync' | 'async' | 'auto';
}

const props = withDefaults(defineProps<Props>(), {
  placeholderText: 'Loading...',
  errorText: 'Failed to load',
  lazy: true,
  quality: 80,
  decoding: 'async'
});

const emit = defineEmits<{
  load: [event: Event];
  error: [event: Event];
}>();

const isLoaded = ref(false);
const hasError = ref(false);

const handleLoad = (event: Event) => {
  isLoaded.value = true;
  hasError.value = false;
  emit('load', event);
};

const handleError = (event: Event) => {
  hasError.value = true;
  isLoaded.value = false;
  emit('error', event);
};
</script>

<style scoped>
.lazy-image-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--glass-bg);
}


.image-placeholder,
.image-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-light-secondary) 0%, var(--color-light) 100%);
}

.placeholder-content,
.error-content {
  text-align: center;
  color: var(--color-dark-secondary);
}

.placeholder-icon,
.error-icon {
  font-size: 2rem;
  margin-bottom: var(--spacing-sm);
  opacity: 0.7;
}

.placeholder-text,
.error-text {
  font-size: var(--font-size-sm);
  font-weight: 500;
  opacity: 0.8;
}

.lazy-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.lazy-image.fade-in {
  opacity: 1;
}

/* Optimize for mobile */
@media (max-width: 768px) {
  .placeholder-icon,
  .error-icon {
    font-size: 1.5rem;
  }
  
  .placeholder-text,
  .error-text {
    font-size: var(--font-size-xs);
  }
}

/* Reduce animations on mobile for better performance */
@media (prefers-reduced-motion: reduce) {
  .lazy-image {
    transition: none;
  }
}
</style>