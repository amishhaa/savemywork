/**
 * Represents the event tracker model.
 */
export default class Tracker {
    /**
     * @param {Partial<Tracker>} partial
     */
    constructor({
        id,
        eventType,
        eventId,
        timestamp,
        userId,
        clicks,
        metadata,
        mouseClicks,
        scrollEvents,
        mousePositions
    } = {}) {
        /**
         * Defines the tracker ID.
         * @type {string}
         */
        this.id = id ?? null;

        /**
         * Defines the type of event.
         * @type {string}
         */
        this.eventType = eventType ?? null;

        /**
         * Defines the event ID.
         * @type {string}
         */
        this.eventId = eventId ?? null;

        /**
         * Defines the event timestamp.
         * @type {number}
         */
        this.timestamp = timestamp ?? Date.now();

        /**
         * Defines the user ID associated with the event.
         * @type {string}
         */
        this.userId = userId ?? null;

        /**
         * Defines the number of clicks recorded for this event.
         * @type {number}
         */
        this.clicks = clicks ?? 0;

        /**
         * Defines additional metadata related to the event.
         * @type {Object}
         */
        this.metadata = metadata ?? {};

        /**
         * Stores details of mouse clicks including X and Y coordinates.
         * @type {Array<{x: number, y: number, timestamp: number}>}
         */
        this.mouseClicks = mouseClicks ?? [];

        /**
         * Stores details of scroll events.
         * @type {Array<{deltaY: number, timestamp: number}>}
         */
        this.scrollEvents = scrollEvents ?? [];

        /**
         * Stores details of mouse positions and durations.
         * @type {Array<{x: number, y: number, startTime: number, endTime: number}>}
         */
        this.mousePositions = mousePositions ?? [];
    }

    /**
     * Creates a new Tracker model from a given map.
     * @param {Partial<Tracker>} map The map to be converted.
     * @returns {Tracker} A new Tracker instance.
     */
    static toTracker(map) {
        return new Tracker({
            ...map,
        });
    }

    /**
     * Converts the current Tracker model into a Firestore-compatible format.
     * @returns {Object} A map representing the current tracker instance.
     */
    toFirestore() {
        return {
            eventType: this.eventType,
            eventId: this.eventId,
            timestamp: this.timestamp,
            userId: this.userId,
            clicks: this.clicks,
            metadata: this.metadata,
            mouseClicks: this.mouseClicks,
            scrollEvents: this.scrollEvents,
            mousePositions: this.mousePositions
        };
    }

    /**
     * Records a mouse click with X and Y coordinates.
     * @param {number} x The X coordinate of the click.
     * @param {number} y The Y coordinate of the click.
     */
    recordMouseClick(x, y) {
        this.mouseClicks.push({ x, y, timestamp: Date.now() });
        this.incrementClicks();
    }

    /**
     * Records a scroll event.
     * @param {number} deltaY The amount scrolled vertically.
     */
    recordScrollEvent(deltaY) {
        this.scrollEvents.push({ deltaY, timestamp: Date.now() });
    }

    /**
     * Records the duration the mouse was at a certain position.
     * @param {number} x The X coordinate.
     * @param {number} y The Y coordinate.
     * @param {number} duration The duration in milliseconds.
     */
    recordMousePositionDuration(x, y, duration) {
        const endTime = Date.now();
        const startTime = endTime - duration;
        this.mousePositions.push({ x, y, startTime, endTime });
    }

    /**
     * Increments the click count for the event.
     */
    incrementClicks() {
        this.clicks += 1;
    }
}