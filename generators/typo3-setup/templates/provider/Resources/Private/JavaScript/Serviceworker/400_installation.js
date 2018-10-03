addEventListener('install', installEvent => {
    // Install & activate immediately
    skipWaiting();

    // Warm cache with static resources
    installEvent.waitUntil(
        caches.open(staticCacheName).then(staticCache => {
            return staticCache.addAll(resources);
        }).catch(error => {
            // console.debug('Couldn\'t open static cache ' + staticCacheName, error);
        })
    );
});