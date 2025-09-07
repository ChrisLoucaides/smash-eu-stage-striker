// Service Worker for caching static assets and API responses
const CACHE_NAME = 'smash-eu-stage-striker-v1';
const STATIC_CACHE_NAME = 'smash-eu-static-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/smash-eu-stage-striker/',
  '/smash-eu-stage-striker/index.html',
  '/smash-eu-stage-striker/assets/stages/battlefield.webp',
  '/smash-eu-stage-striker/assets/stages/final-destination.webp',
  '/smash-eu-stage-striker/assets/stages/small-battlefield.webp',
  '/smash-eu-stage-striker/assets/stages/pokemon-stadium-2.webp',
  '/smash-eu-stage-striker/assets/stages/smashville.webp',
  '/smash-eu-stage-striker/assets/stages/town-and-city.webp',
  '/smash-eu-stage-striker/assets/stages/kalos-pokemon-league.webp',
  '/smash-eu-stage-striker/assets/stages/hollow-bastion.webp',
  '/smash-eu-stage-striker/assets/stages/yoshis-story.webp',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(
    handleFetch(request)
  );
});

async function handleFetch(request) {
  const url = new URL(request.url);
  
  // Strategy 1: Cache First for static assets
  if (isStaticAsset(url)) {
    return cacheFirst(request, STATIC_CACHE_NAME);
  }
  
  // Strategy 2: Network First for API calls
  if (isApiRequest(url)) {
    return networkFirst(request, CACHE_NAME);
  }
  
  // Strategy 3: Stale While Revalidate for HTML pages
  if (isHtmlRequest(request)) {
    return staleWhileRevalidate(request, CACHE_NAME);
  }
  
  // Strategy 4: Network First for everything else
  return networkFirst(request, CACHE_NAME);
}

function isStaticAsset(url) {
  return url.pathname.includes('/assets/') || 
         url.pathname.endsWith('.webp') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.jpeg') ||
         url.pathname.endsWith('.svg') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.js');
}

function isApiRequest(url) {
  return url.pathname.startsWith('/api/') || 
         url.hostname.includes('api.');
}

function isHtmlRequest(request) {
  return request.headers.get('accept')?.includes('text/html');
}

// Cache First Strategy
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network First Strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Offline', { status: 503 });
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Network failed, return cached response if available
    return cachedResponse || new Response('Offline', { status: 503 });
  });
  
  return cachedResponse || fetchPromise;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Handle any pending offline actions
    console.log('Performing background sync...');
    // Add your offline action handling logic here
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notifications (if needed in the future)
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/smash-eu-stage-striker/favicon.svg',
    badge: '/smash-eu-stage-striker/favicon.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/smash-eu-stage-striker/favicon.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/smash-eu-stage-striker/favicon.svg'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Smash EU Stage Striker', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/smash-eu-stage-striker/')
    );
  }
});
