var dontCachePaths = [
    // Add frequently updated resource patterns here
    // May be strings like '/offline.html' or regular expressions like /^\/blog\/[0-9]+\/?$/
];

/**
 * Test whether a URL is matching a pattern
 *
 * @param {String} path URL path
 * @param {Array} patterns Patterns to test against
 * @return {boolean} Path matches a pattern
 */
var pathMatchesPattern = function pathMatchesPattern(path, patterns) {
    var match = false;
    for (var pattern of patterns) {
        if (pattern instanceof RegExp) {
            if (pattern.test(path)) {
                match = true;
                break;
            }
        } else if (pattern === path) {
            match = true;
            break;
        }
    }
    return match;
}
