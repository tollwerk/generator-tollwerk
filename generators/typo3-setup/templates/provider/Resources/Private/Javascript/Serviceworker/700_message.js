/**
 * Listen to messages
 */
addEventListener('message', messageEvent => {
    if (messageEvent.data == 'clear-pages') {
        caches.open(pagesCacheName).then(cache => {
            cache.keys().then(items => {
                items.forEach(function (item) {
                    return cache.delete(item);
                });
            });
        });
    }
});