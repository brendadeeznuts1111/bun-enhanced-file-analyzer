// Service Worker for Bun File Analyzer
// Provides offline functionality and caching

const CACHE_NAME = 'bun-file-analyzer-v2';
const urlsToCache = [
  '/',
  '/index.js',
  '/react-refresh.js',
  '/favicon.ico'
];

// Install Service Worker
self.addEventListener('install', event => {
  console.log('📡 Service Worker: Installing');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📡 Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', event => {
  console.log('📡 Service Worker: Activating');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('📡 Service Worker: Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch with network-first strategy for development
self.addEventListener('fetch', event => {
  console.log('📡 Service Worker: Fetching', event.request.url);
  
  // For development, always try network first
  if (self.location.hostname === 'localhost') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request);
        })
    );
  } else {
    // Production: cache-first strategy
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Return cached version or fetch from network
          return response || fetch(event.request);
        })
    );
  }
});

// Message handling for cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('📡 Service Worker: Loaded');
