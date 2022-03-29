(function(exports) {
    "use strict";

    /**
     * EventsHandler provides a Javascript prototype for simple event handling.
     *
     * @param {Array<String>} registeredEvents
     *
     */
    var EventsHandler = function(registeredEvents) {
        var _this = this;
        this.registeredEvents = registeredEvents;
        this.handlers = {};

        /**
         * registerHandler() registers an event handler for this EventsHandler to call later
         *
         * @param {String}      event    - event to register callback to
         * @param {Function}    callback - callback function
         * @param context
         */
        this.registerHandler = function(event, callback, context) {
            if (this.registeredEvents && this.registeredEvents.indexOf(event) === -1) {
                throw "Unknown event registered: " + event;
            }

            // Push callback and context into handler
            var handler = this.handlers[event] || (this.handlers[event] = []);
            handler.push({
                callback: callback,
                context: context
            });
        };

        /**
         * unregisterHandler() unregisters an event handler for this EventsHandler
         * if called with no arguments, remove all event handlers from this EventsHandler
         */
        this.unregisterHandler = function(event, callback) {
            /**
             * Filter will not allow callback through if:
             *      given callback is undefined
             *      given callback matches existing callback in event handler
             */
            function filterCallback(eventHandler) {
                return (callback && callback != eventHandler.callback);
            }

            // Remove callbacks for events
            for (var evt in this.handlers) {
                if (!event || event == evt) {
                    this.handlers[evt] = this.handlers[evt].filter(filterCallback);
                }
            }
        };

        /**
         * trigger() triggers the callbacks for event handler
         *
         * @param {String} event
         * @param args
         */
        this.trigger = function(event, args) {
            if (this.registeredEvents && this.registeredEvents.indexOf(event) === -1) {
                throw "Unknown event triggered: " + event;
            }

            var handler = this.handlers[event];

            // call each callback for the related event handler with arguments passed in
            if (handler) {
                for (var i = 0; i < handler.length; i++) {
                    handler[i].callback.apply(handler[i].context, Array.prototype.slice.call(arguments, 1));
                }
            }
        };


    };

    if (!exports.EventsHandler) exports.EventsHandler = EventsHandler;
})(window);
