(function (w, d) {
    'use strict';

    if (((typeof exports !== 'undefined') && exports.AddToHomescreen) || w.Tollwerk.AddToHomescreen) {
        return;
    }

    /**
     * Add To Homescreen Proxy
     *
     * @constructor
     */
    function AddToHomescreen() {
        this.callback = null;
        this.deferred = null;
    }

    /**
     * Handle the beforeinstallprompt event
     *
     * @param {Event} e Event
     */
    AddToHomescreen.prototype.prompt = function (e) {
        e.preventDefault();
        this.deferred = e;
        if (this.callback) {
            this.callback(e);
        }
    }

    /**
     * Register the install handler
     *
     * @param {Function} callback Install handler
     */
    AddToHomescreen.prototype.handle = function (callback) {
        this.callback = callback;
        if (this.deferred) {
            this.callback(this.deferred);
        }
    }

    // Export as CommonJS module
    if (typeof exports !== 'undefined') {
        exports.AddToHomescreen = new AddToHomescreen();

        // Else create a global instance
    } else {
        w.Tollwerk.AddToHomescreen = new AddToHomescreen();
        w.addEventListener('beforeinstallprompt', AddToHomescreen.prototype.prompt.bind(w.Tollwerk.AddToHomescreen));
    }

})(typeof global !== 'undefined' ? global : this, document);