// Custom Service Worker - Enhanced Offline Support
// This extends next-pwa's service worker with custom logic

// Cache names
const CACHE_VERSION = 'v2'
const STATIC_CACHE = `digidhoodh-static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `digidhoodh-dynamic-${CACHE_VERSION}`
const API_CACHE = `digidhoodh-api-${CACHE_VERSION}`
const IMAGE_CACHE = `digidhoodh-images-${CACHE_VERSION}`

// Assets to precache
const PRECACHE_ASSETS = [
    '/',
    '/offline',
    '/dashboard',
    '/dashboard/milk',
    '/dashboard/farmers',
    '/manifest.json',
]

// Install event - precache assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...')

    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log('[SW] Precaching static assets')
            return cache.addAll(PRECACHE_ASSETS)
        })
    )

    // Activate immediately
    self.skipWaiting()
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...')

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => {
                        return name.startsWith('digidhoodh-') &&
                            ![STATIC_CACHE, DYNAMIC_CACHE, API_CACHE, IMAGE_CACHE].includes(name)
                    })
                    .map((name) => caches.delete(name))
            )
        })
    )

    // Take control immediately
    self.clients.claim()
})

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
    const { request } = event
    const url = new URL(request.url)

    // Skip non-GET requests for caching
    if (request.method !== 'GET') {
        // For POST/PUT/DELETE - try network, queue if offline
        if (!navigator.onLine) {
            event.respondWith(handleOfflineRequest(request))
        }
        return
    }

    // Handle different types of requests
    if (url.pathname.startsWith('/api/')) {
        // API requests - Network first, fall back to cache
        event.respondWith(handleApiRequest(request))
    } else if (isImageRequest(request)) {
        // Images - Cache first
        event.respondWith(handleImageRequest(request))
    } else if (isStaticAsset(request)) {
        // Static assets - Cache first
        event.respondWith(handleStaticRequest(request))
    } else {
        // Pages - Network first, fall back to cache, then offline page
        event.respondWith(handlePageRequest(request))
    }
})

// Handle API requests - Network first
async function handleApiRequest(request) {
    try {
        const networkResponse = await fetch(request)

        // Cache successful GET responses
        if (networkResponse.ok) {
            const cache = await caches.open(API_CACHE)
            cache.put(request, networkResponse.clone())
        }

        return networkResponse
    } catch (error) {
        // Network failed, try cache
        const cachedResponse = await caches.match(request)
        if (cachedResponse) {
            console.log('[SW] Serving API from cache:', request.url)
            return cachedResponse
        }

        // Return offline JSON response
        return new Response(
            JSON.stringify({
                success: false,
                offline: true,
                error: 'You are offline'
            }),
            {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            }
        )
    }
}

// Handle image requests - Cache first
async function handleImageRequest(request) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
        return cachedResponse
    }

    try {
        const networkResponse = await fetch(request)

        if (networkResponse.ok) {
            const cache = await caches.open(IMAGE_CACHE)
            cache.put(request, networkResponse.clone())
        }

        return networkResponse
    } catch (error) {
        // Return placeholder image if available
        return caches.match('/images/placeholder.png')
    }
}

// Handle static assets - Cache first
async function handleStaticRequest(request) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
        return cachedResponse
    }

    try {
        const networkResponse = await fetch(request)

        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE)
            cache.put(request, networkResponse.clone())
        }

        return networkResponse
    } catch (error) {
        console.error('[SW] Static asset fetch failed:', request.url)
        throw error
    }
}

// Handle page requests - Network first
async function handlePageRequest(request) {
    try {
        const networkResponse = await fetch(request)

        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE)
            cache.put(request, networkResponse.clone())
        }

        return networkResponse
    } catch (error) {
        // Try cache
        const cachedResponse = await caches.match(request)
        if (cachedResponse) {
            console.log('[SW] Serving page from cache:', request.url)
            return cachedResponse
        }

        // Fall back to offline page
        return caches.match('/offline')
    }
}

// Handle offline POST/PUT/DELETE requests
async function handleOfflineRequest(request) {
    // Queue the request for later sync
    const requestData = {
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers),
        body: await request.text(),
        timestamp: Date.now()
    }

    // Store in IndexedDB via message
    self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
            client.postMessage({
                type: 'QUEUE_REQUEST',
                data: requestData
            })
        })
    })

    // Return optimistic response
    return new Response(
        JSON.stringify({
            success: true,
            offline: true,
            message: 'Request queued for sync'
        }),
        {
            status: 202,
            headers: { 'Content-Type': 'application/json' }
        }
    )
}

// Helper functions
function isImageRequest(request) {
    const url = new URL(request.url)
    return /\.(jpg|jpeg|png|gif|svg|webp|ico)$/i.test(url.pathname)
}

function isStaticAsset(request) {
    const url = new URL(request.url)
    return /\.(js|css|woff|woff2|ttf|eot)$/i.test(url.pathname)
}

// Background sync
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync triggered:', event.tag)

    if (event.tag === 'sync-milk-collections') {
        event.waitUntil(syncMilkCollections())
    } else if (event.tag === 'sync-all') {
        event.waitUntil(syncAllData())
    }
})

async function syncMilkCollections() {
    // Notify clients to sync
    const clients = await self.clients.matchAll()
    clients.forEach((client) => {
        client.postMessage({ type: 'SYNC_MILK_COLLECTIONS' })
    })
}

async function syncAllData() {
    const clients = await self.clients.matchAll()
    clients.forEach((client) => {
        client.postMessage({ type: 'SYNC_ALL' })
    })
}

// Push notifications
self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received')

    const data = event.data?.json() || {
        title: 'DigiDhoodh',
        body: 'You have a new notification',
        icon: '/icons/icon-192x192.png'
    }

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon || '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            vibrate: [100, 50, 100],
            data: data.data,
            actions: data.actions || []
        })
    )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event.action)

    event.notification.close()

    const urlToOpen = event.notification.data?.url || '/dashboard'

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Focus existing window if available
                for (const client of clientList) {
                    if (client.url.includes(urlToOpen) && 'focus' in client) {
                        return client.focus()
                    }
                }
                // Open new window
                if (self.clients.openWindow) {
                    return self.clients.openWindow(urlToOpen)
                }
            })
    )
})

// Message handler
self.addEventListener('message', (event) => {
    console.log('[SW] Message received:', event.data)

    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting()
    }

    if (event.data.type === 'CACHE_FARMERS') {
        caches.open(API_CACHE).then((cache) => {
            const response = new Response(JSON.stringify(event.data.farmers))
            cache.put('/api/farmers/cached', response)
        })
    }
})

console.log('[SW] Service worker loaded')
