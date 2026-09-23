const CACHE_NAME = 'letsgym-v7';
const urlsToCache = [
    './',
    './index.html',
    './css/style.css',
    './js/storage.js',
    './js/bodyMap.js',
    './js/timer.js',
    './js/workout.js',
    './js/history.js',
    './js/app.js',
    './manifest.json',
    './icons/apple-touch-icon.png',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/favicon-32.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request, { ignoreSearch: true })
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});
