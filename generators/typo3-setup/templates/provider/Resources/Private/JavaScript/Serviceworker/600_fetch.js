/**
 * Test whether a response allows caching
 *
 * @param {Response} response Response
 * @return {boolean} Allows caching
 */
const cachingAllowed = function cachingAllowed(response) {
    const cacheControl = response.headers.get('Cache-Control');
    return !cacheControl || (cacheControl.toLowerCase().indexOf('no-store') < 0);
}

/**
 * Return a resource from the network → from the cache → from a fallback and update the cache in the background
 *
 * @param {Event} fetchEvent Fetch event
 * @param {Request} request Request
 * @param {String} cacheId Cache identifier
 * @param {String} fallback Fallback URL
 */
const fetchNetworkCacheFallback = function fetchNetworkCacheFallback(fetchEvent, request, cacheId, fallback) {
    // console.debug(`network → cache → fallback: ${request.url}`);
    fetchEvent.respondWith(
        caches.open(cacheId).then(cache => {
            return fetch(fetchEvent.request).then(response => {
                if (cachingAllowed(response)) {
                    cache.put(fetchEvent.request, response.clone());
                }
                return response;
            }).catch(error => {
                return caches.match(request).then(cachehit => {
                    if (cachehit) {
                        // console.debug('Cache hit: ', request.url);
                        return cachehit;
                    }
                    if (fallback) {
                        // console.debug(`Couldn\'t fetch ${request.url}, returning fallback`);
                        return caches.match(fallback);
                    } else {
                        // console.debug(`Couldn\'t fetch ${request.url}, no fallback provided`);
                    }
                });
            });
        })
    );
}

/**
 * Return a resource from the cache → from the network → from a fallback and update the cache in the background
 *
 * @param {Event} fetchEvent Fetch event
 * @param {Request} request Request
 * @param {String} cacheId Cache identifier
 * @param {String} fallback Fallback URL
 */
const fetchCacheNetworkFallback = function fetchCacheNetworkFallback(fetchEvent, request, cacheId, fallback) {
    // console.debug(`cache → network → fallback: ${request.url}`);
    fetchEvent.respondWith(
        caches.open(cacheId).then(cache => {
            return caches.match(request).then(cachehit => {
                if (cachehit) {
                    fetch(fetchEvent.request).then(response => {
                        if (cachingAllowed(response)) {
                            cache.put(fetchEvent.request, response);
                        }
                    }).catch(error => {
                        // Ignore error
                    });

                    // console.debug('Cache hit for: ', request.url);
                    return cachehit;
                }

                return fetch(fetchEvent.request).then(response => {
                    if (cachingAllowed(response)) {
                        cache.put(fetchEvent.request, response.clone());
                    }
                    return response;
                }).catch(error => {
                    if (fallback) {
                        // console.debug(`Couldn\'t fetch ${request.url}, returning fallback`);
                        return caches.match(fallback);
                    } else {
                        // console.debug(`Couldn\'t fetch ${request.url}, no fallback provided`);
                    }
                });
            })
        })
    );
}

/**
 * Return a resource from the cache → from the network and update the cache in the background
 *
 * @param {Event} fetchEvent Fetch event
 * @param {Request} request Request
 * @param {String} cacheId Cache identifier
 */
const fetchCacheNetwork = function fetchCacheNetwork(fetchEvent, request, cacheId) {
    // console.debug(`cache → network: ${request.url}`);
    caches.match(request).then(cachehit => {
        if (cachehit) {
            // console.debug('Cache hit for: ', request.url);
            return cachehit;
        }

        caches.open(cacheId).then(cache => {
            return fetch(fetchEvent.request).then(response => {
                if (cachingAllowed(response)) {
                    cache.put(fetchEvent.request, response.clone());
                }
                return response;
            }).catch(error => {
                // console.debug(`Couldn\'t fetch ${request.url}`);
            });
        })
    });
}

/**
 * Return a resource from the network → from a fallback
 *
 * @param {Event} fetchEvent Fetch event
 * @param {Request} request Request
 * @param {String} fallback Fallback URL
 */
const fetchNetworkFallback = function fetchNetworkFallback(fetchEvent, request, fallback) {
    // console.debug(`network → fallback: ${request.url}`);
    fetchEvent.respondWith(
        fetch(fetchEvent.request).catch(error => {
            if (fallback) {
                // console.debug(`Couldn\'t fetch ${request.url}, returning fallback`);
                return caches.match(fallback);
            } else {
                // console.debug(`Couldn\'t fetch ${request.url}, no fallback provided`);
            }
        })
    );
}

/**
 * Fetch event handler
 */
addEventListener('fetch', fetchEvent => {
    const request = fetchEvent.request;
    const url = new URL(request.url);
    if ((request.method === 'GET') && (skipDomains.indexOf(url.hostname) < 0) && (url.pathname.indexOf('/typo3/') !== 0)) {
        const accept = request.headers.get('Accept');

        // Test if caching should be bypassed
        const bypassCache = (dontCacheDomains.indexOf(url.hostname) >= 0) || pathMatchesPattern(url.pathname, dontCachePaths);

        // If an HTML page was requested
        if (accept.includes('text/html')) {
            const fallback = '/festival/offline/';
            bypassCache ? fetchNetworkFallback(fetchEvent, request, fallback) :
                (pathMatchesPattern(url.pathname, frequentlyUpdated) ?
                    fetchNetworkCacheFallback(fetchEvent, request, 'pages', fallback) :
                    fetchCacheNetworkFallback(fetchEvent, request, 'pages', fallback));

            // Else: If an image was requested
        } else if (accept.includes('image')) {
            bypassCache ? fetchNetworkFallback(fetchEvent, request, fallbackImage) :
                fetchCacheNetworkFallback(fetchEvent, request, 'images', fallbackImage);

            // Else: All other resources
        } else if (!bypassCache) {
            fetchCacheNetwork(fetchEvent, request, 'misc');
        }
    }
});