Tollwerk.Init.registerOnReady(function () {

    // Lazyloading images: Remove either the src or srcset attribute of images
    var removeAttribute = ('srcset' in document.createElement('img')) ? 'src' : 'srcset';
    document.querySelectorAll('img[srcset][src]').forEach(function (img) {
        img.removeAttribute(removeAttribute);
    });

    // Offline caching
    try {
        if (!pathMatchesPattern(window.location.pathname, dontCachePaths)) {
            var breadcrumbs = document.querySelectorAll('.Breadcrumb li');
            if (breadcrumbs.length) {
                var title = Array.prototype.slice.call(breadcrumbs).map(function (breadcrumb) {
                    return breadcrumb.innerText.trim();
                }).join(' › ');
            } else {
                var title = document.getElementsByTagName('title')[0].innerText;
            }
            var data = {
                title: title,
                path: window.location.pathname || '/',
                date: new Date()
            };
            localStorage.setItem('offline-cache:' + data.path, JSON.stringify(data));
        }
    } catch (exception) {
        // No support for cached pages listing
    }
});