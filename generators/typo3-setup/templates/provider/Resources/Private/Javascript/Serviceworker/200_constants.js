const version = 'VERSION';
const staticCacheName = `static-${version}`;
const imageCacheName = 'images';
const pagesCacheName = 'pages';
const cacheList = [staticCacheName, imageCacheName, pagesCacheName];
const frequentlyUpdated = [
    // Add frequently updated resource patterns here
    // May be strings like '/' or '/page.html' or regular expressions like /^\/page\/?$/
];
const skipDomains = [
    // Add domains that the service worker generally shouldn't care for
];
const dontCacheDomains = [
    'connect.facebook.net',
    'www.facebook.com',
    // Add domains that shouldn't be cached by the service worker
];
