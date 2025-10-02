// Service Worker for Anapana Meditation Timer PWA
const CACHE_NAME = 'anapana-timer-nuclear-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/sounds/wooden-bell.wav',
    '/sounds/ambient/meditate1.mp3',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap'
];

// Install event - cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.log('Failed to cache resources:', error);
                // Cache individual resources, skip failed ones
                return caches.open(CACHE_NAME).then(cache => {
                    return Promise.allSettled(
                        urlsToCache.map(url => cache.add(url))
                    );
                });
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Clone the request because it's a stream
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(response => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response because it's a stream
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
    );
});

// Background sync for session data
self.addEventListener('sync', event => {
    if (event.tag === 'meditation-session-sync') {
        event.waitUntil(syncMeditationData());
    }
});

// Handle push notifications for reminders
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'Time for your meditation practice',
        icon: '/icons/meditation-icon.png',
        badge: '/icons/meditation-badge.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
        },
        actions: [
            {
                action: 'start-meditation',
                title: 'Start Now',
                icon: '/icons/play-icon.png'
            },
            {
                action: 'remind-later',
                title: 'Later',
                icon: '/icons/clock-icon.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Meditation Reminder', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'start-meditation') {
        // Open the app and start meditation
        event.waitUntil(
            clients.openWindow('/')
        );
    } else if (event.action === 'remind-later') {
        // Schedule another reminder in 30 minutes
        scheduleReminder(30);
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Periodic background sync for reminders
self.addEventListener('periodicsync', event => {
    if (event.tag === 'daily-reminder') {
        event.waitUntil(checkAndSendReminder());
    }
});

// Helper functions
async function syncMeditationData() {
    // This would sync meditation data to a server if implemented
    console.log('Syncing meditation data...');
    return Promise.resolve();
}

function scheduleReminder(minutes) {
    // This would schedule a future reminder
    console.log(`Reminder scheduled for ${minutes} minutes`);
}

async function checkAndSendReminder() {
    // Check if user has meditation reminder enabled
    const settings = await getStorageItem('meditationSettings');
    if (settings && settings.dailyReminder) {
        const now = new Date();
        const [hours, minutes] = settings.reminderTime.split(':');
        const reminderTime = new Date();
        reminderTime.setHours(parseInt(hours), parseInt(minutes));
        
        // Check if it's reminder time (within 1 hour window)
        const timeDiff = Math.abs(now.getTime() - reminderTime.getTime());
        if (timeDiff < 3600000) { // 1 hour in milliseconds
            return self.registration.showNotification('Daily Meditation Reminder', {
                body: 'Take a moment for your Anapana practice',
                icon: '/icons/meditation-icon.png',
                tag: 'daily-reminder'
            });
        }
    }
}

function getStorageItem(key) {
    return new Promise((resolve) => {
        // Since we can't access localStorage in service worker,
        // we'd need to use IndexedDB or postMessage to main thread
        resolve(null);
    });
}