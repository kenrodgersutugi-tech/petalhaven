// Service Worker for Divine Beauty Hub PWA
// Cache Name with versioning
const CACHE_NAME = 'divine-beauty-pwa-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/icon-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-512x512.png'
];

// Helper: Determine if URL is a Supabase authentication or session route
function isSupabaseAuthRoute(url) {
  const lowercaseUrl = url.toLowerCase();
  return (
    lowercaseUrl.includes('supabase.co/auth') ||
    lowercaseUrl.includes('/auth/v1') ||
    lowercaseUrl.includes('/api/auth') ||
    lowercaseUrl.includes('auth/session') ||
    lowercaseUrl.includes('auth/callback') ||
    lowercaseUrl.includes('auth/token') ||
    lowercaseUrl.includes('auth/user') ||
    lowercaseUrl.includes('access_token') ||
    lowercaseUrl.includes('refresh_token')
  );
}

// Helper: Determine if URL is an M-Pesa payment confirmation or transaction route
function isMpesaOrPaymentRoute(url) {
  const lowercaseUrl = url.toLowerCase();
  return (
    lowercaseUrl.includes('mpesa') ||
    lowercaseUrl.includes('m-pesa') ||
    lowercaseUrl.includes('daraja') ||
    lowercaseUrl.includes('stkpush') ||
    lowercaseUrl.includes('payment') ||
    lowercaseUrl.includes('checkout/confirmation') ||
    lowercaseUrl.includes('order-confirmation') ||
    lowercaseUrl.includes('/api/mpesa')
  );
}

// Install Event: Cache essential app shell and assets, and skip waiting
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Gracefully attempt caching static assets
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[PWA SW] Pre-caching partial failure, will cache on demand:', err);
      });
    }).then(() => {
      // skipWaiting: true as required
      return self.skipWaiting();
    })
  );
});

// Activate Event: Clean up legacy caches and immediately claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch Event: Network-only routing for M-Pesa & Supabase Auth, caching for app assets
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = request.url;

  // 1. STRICT REQUIREMENT: Never cache M-Pesa payment confirmation pages or callbacks
  // Must always fetch fresh directly from the network
  if (isMpesaOrPaymentRoute(url)) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ 
            error: 'Network connection required for live M-Pesa payment processing' 
          }), 
          { 
            status: 503, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      })
    );
    return;
  }

  // 2. STRICT REQUIREMENT: Never cache Supabase auth or session verification routes
  // Must always fetch fresh directly from the network
  if (isSupabaseAuthRoute(url)) {
    event.respondWith(fetch(request));
    return;
  }

  // 3. Only handle GET requests for caching
  if (request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }

  // 4. For Navigation requests (HTML pages): Network-First, with cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          const fallback = await caches.match('/index.html');
          return fallback || new Response('Offline - Please reconnect to the internet', {
            status: 503,
            headers: { 'Content-Type': 'text/html' }
          });
        })
    );
    return;
  }

  // 5. For static assets (images, scripts, styles): Cache-First with background revalidation
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache (stale-while-revalidate for local assets)
        if (url.startsWith(self.location.origin)) {
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, networkResponse);
              });
            }
          }).catch(() => {/* ignore background update error */});
        }
        return cachedResponse;
      }

      // If not in cache, fetch from network and store in cache
      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // Return empty or fallback if unavailable
        return new Response('', { status: 408 });
      });
    })
  );
});
