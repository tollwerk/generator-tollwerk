(function (w, d) {
    'use strict';

    if (((typeof exports !== 'undefined') && exports.Init) || w.Tollwerk.Init) {
        return;
    }

    // Register the serviceworker
    if (navigator.serviceWorker) {
        navigator.serviceWorker.register('/serviceworker.js');
    }

    /**
     * Initializer constructor
     *
     * @constructor
     */
    function Initializer() {
        this._onReady = [];
        this._onDisplay = [];
    }

    /**
     * Register an onDocumentReady callback
     *
     * @param {Function} callback Callback
     */
    Initializer.prototype.registerOnReady = function (callback) {
        (this._onReady === null) ? callback() : this._onReady.push(callback);
    }

    /**
     * Register an onDisplay callback
     *
     * @param {Function} callback Callback
     */
    Initializer.prototype.registerOnDisplay = function (callback) {
        (this._onDisplay === null) ? callback() : this._onDisplay.push(callback);
    }

    /**
     * Run initializers
     */
    Initializer.prototype.run = function () {
        for (var c = 0; c < this._onReady.length; ++c) {
            this._onReady[c]();
        }
        this._onReady = null;
    }

    /**
     * Run display routines
     */
    Initializer.prototype.display = function () {
        for (var c = 0; c < this._onDisplay.length; ++c) {
            this._onDisplay[c]();
        }
        this._onDisplay = null;
    }

    // Export as CommonJS module
    if (typeof exports !== 'undefined') {
        exports.Init = new Initializer();

        // Else create a global instance
    } else {
        w.Tollwerk.Init = new Initializer();
        d.addEventListener('DOMContentLoaded', Initializer.prototype.display.bind(w.Tollwerk.Init));
        w.addEventListener('load', Initializer.prototype.run.bind(w.Tollwerk.Init));
    }
})(typeof global !== 'undefined' ? global : this, document);