const CACHE_NAME = 'ncvet-ai-pathfinder-v2'; // Increment version to ensure updates
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/components/App.tsx',
  '/types.ts',
  '/services/geminiService.ts',
  '/services/errors.ts',
  '/components/Header.tsx',
  '/components/Footer.tsx',
  '/components/LearnerProfileForm.tsx',
  '/components/PathwayDisplay.tsx',
  '/components/LoadingSpinner.tsx',
  '/components/IconComponents.tsx',
  // External assets
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://aistudiocdn.com/react@^19.1.1',
  'https://aistudiocdn.com/react-dom@^19.1.1/client.js',
  'https://aistudiocdn.com/@google/genai@^1.21.0'
];

// Install step: Open a cache and add all the app shell files to it
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(URLS_TO_CACHE);
      })
      .catch(error => {
        console.error('Failed to cache app shell:', error);
      })
  );
});

// Activate step: Clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch step: Intercept network requests and serve from cache if available
self.addEventListener('fetch', (event) => {
  // Always go to the network for API calls
  if (event.request.url.includes('generativelanguage.googleapis.com')) {
    // We don't cache API responses.
    return; 
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache - fetch from network
        return fetch(event.request).then(
          (response) => {
            // We don't want to cache error responses.
            if (!response || response.status !== 200) {
              return response;
            }
            
            // Only cache GET requests.
            if(event.request.method === 'GET') {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseToCache);
                  });
            }

            return response;
          }
        );
      }
    )
  );
});
