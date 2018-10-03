(function (w, d) {
    'use strict';
    var debounce = null;

    /**
     * Breakpoint manager constructor
     *
     * @param {Number} delay Debounce delay
     * @constructor
     */
    function BreakpointManager(delay) {
        this.delay = delay;
        this.components = {};
        this.resizables = [];
        this.callback = this.adapt.bind(this);
        this.count = 0;
        this.breakpoint = this.currentBreakpoint();

        this.resize();
    }

    /**
     * Return the current breakpoint
     *
     * @return {Number} Current breakpoint
     */
    BreakpointManager.prototype.currentBreakpoint = function () {
        var breakPoint = parseInt(window.getComputedStyle(d.documentElement).zIndex, 10);
        return isNaN(breakPoint) ? 0 : breakPoint;
    }

    /**
     * Adapt a single component
     *
     * @param {Object} component Component
     */
    BreakpointManager.prototype.adaptComponent = function (component) {
        // Run through all defined states and determine the future one
        var nextState = null;
        for (var s = 0, state; s < component.states.length; ++s) {
            state = component.states[s];
            if (((state.lower === null) || (this.breakpoint >= state.lower)) && ((state.upper === null) || (this.breakpoint <= state.upper))) {
                nextState = s;
                break;
            }
        }

        // If a state adaption is required
        if (nextState !== component.state) {
            // Tear down the current state
            if (component.state !== null) {
                component.states[component.state].teardown();
                component.state = null;
            }

            // Setup the future state
            if (nextState !== null) {
                component.states[nextState].setup();
                component.state = nextState;
            }
        }
    }

    /**
     * Adapt to resized window
     */
    BreakpointManager.prototype.adapt = function () {
        this.breakpoint = this.currentBreakpoint();
        // Run through all components and adapt
        for (var c in this.components) {
            this.adaptComponent(this.components[c]);
        }

        // Run through all resizable callbacks
        for (var r = 0; r < this.resizables.length; ++r) {
            this.resizables[r]();
        }
    }

    /**
     * Debounced listening to resize events
     */
    BreakpointManager.prototype.resize = function () {

        // Clear the running timeout (if any)
        clearTimeout(debounce);

        // Set a timeout to adapt
        debounce = setTimeout(this.callback, this.delay);
    }

    /**
     * Register a component for breakpoint based construction / descruction
     *
     * @param {Element} component Component
     * @param {Number|Array} lower Lower breakpoint or Array of registrations
     * @param {Number} upper Upper breakpoint
     * @param {Function} setup Setup callback
     * @param {Function} teardown Teardown callback
     * @param {Boolean} _debounce Debounce rendering
     * @return {Number} Number of registered components
     * @throws {String} If the setup callback is not a function
     * @throws {String} If the teardown callback is not a function
     */
    BreakpointManager.prototype.registerComponent = function (component, lower, upper, setup, teardown, _debounce) {
        component.id = component.id || ('bpm-' + this.count);

        // If an array of registrations is given
        if (lower instanceof Array) {

            // Run through all registrations
            for (var c = 0; c < lower.length; ++c) {
                if (lower[c] instanceof Array) {
                    var reg = lower[c];
                    reg.unshift(component);
                    reg[5] = true;
                    this.registerComponent.apply(this, reg);
                }
            }

            // Else if it's a single component registration
        } else {
            if (typeof setup !== 'function') {
                throw 'BreakpointManager: setup callback must be a function';
            }
            if (typeof teardown !== 'function') {
                throw 'BreakpointManager: teardown callback must be a function';
            }

            // If this is the first time the component is registered
            if (!(component.id in this.components)) {
                this.components[component.id] = { state: null, states: [], element: component };
                ++this.count;
            }

            // Register the component state
            this.components[component.id].states.push({
                lower: lower,
                upper: upper,
                setup: setup.bind(component),
                teardown: teardown.bind(component)
            });
        }

        // If rendering shouldn't be debounced further
        if (!_debounce) {
            this.adaptComponent(this.components[component.id]);
        }

        return this.count;
    }

    /**
     * Get current breakpoint
     * @returns {Number}
     */
    BreakpointManager.prototype.getCurrentBreakpoint = function () {
        return this.currentBreakpoint();
    }

    /**
     * Register a resizable callback
     *
     * @param {Function} resizable Resizable callback
     */
    BreakpointManager.prototype.registerResizable = function (resizable) {
        if (typeof resizable === 'function') {
            this.resizables.push(resizable);
        }
    }

    /**
     * Deregister a resizable callback
     *
     * @param {Function} resizable Resizable callback
     */
    BreakpointManager.prototype.deregisterResizable = function (resizable) {
        if (typeof resizable === 'function') {
            this.resizables = this.resizables.filter(function (r) {
                return r !== resizable;
            });
        }
    }

    /**
     * Listen to resize events
     *
     * @param {Window} win Window
     */
    BreakpointManager.prototype.listen = function (win) {
        win.addEventListener('resize', this.resize.bind(this));
    }

    // Export as CommonJS module
    if (typeof exports !== 'undefined') {
        exports.BreakpointManager = new BreakpointManager(100);

        // Else create a global instance
    } else {
        w.Tollwerk.BreakpointManager = new BreakpointManager(100);
        w.Tollwerk.BreakpointManager.listen(w);
    }

})(typeof global !== 'undefined' ? global : this, document);
