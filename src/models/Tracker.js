export default class Tracker {
    /**
     * @param {{
     *   id?: string,
     *   userId: string,
     *   mouseMovements?: Array<{x: number, y: number}>,
     *   mouseClicks?: Array<{x: number, y: number, buttonType: string}>,
     *   scrollEvents?: Array<{deltaX: number, deltaY: number}>,
     *   buttonPresses?: Array<{buttonId: string, actionType: string}>,
     *   keyboardEvents?: Array<{key: string, actionType: string}>
     * }} params
     */
    constructor({
        id = null,
        userId,
        mouseMovements = [],
        mouseClicks = [],
        scrollEvents = [],
        buttonPresses = [],
        keyboardEvents = []
    } = {}) {
        this.id = id;
        this.userId = userId;
        this.interactions = {
            mouseMovements,
            mouseClicks,
            scrollEvents,
            buttonPresses,
            keyboardEvents
        };
    }

    /**
     * Creates Tracker from Firestore data
     * @param {firestore.DocumentSnapshot} doc
     * @returns {Tracker}
     */
    static fromFirestore(doc) {
        const data = doc.data();
        return new Tracker({
            id: doc.id,
            userId: data.userId,
            mouseMovements: data.interactions?.mouseMovements || [],
            mouseClicks: data.interactions?.mouseClicks || [],
            scrollEvents: data.interactions?.scrollEvents || [],
            buttonPresses: data.interactions?.buttonPresses || [],
            keyboardEvents: data.interactions?.keyboardEvents || []
        });
    }

    /**
     * Converts to Firestore format
     * @returns {Object}
     */
    toFirestore() {
        return {
            userId: this.userId,
            interactions: this.interactions
        };
    }

    // === Interaction Recording Methods === //

    /**
     * Records mouse position
     * @param {number} x
     * @param {number} y
     */
    recordMouseMovement(x, y) {
        this.interactions.mouseMovements.push({ x, y });
    }

    /**
     * Records mouse click
     * @param {number} x
     * @param {number} y
     * @param {string} [buttonType='left']
     */
    recordMouseClick(x, y, buttonType = 'left') {
        this.interactions.mouseClicks.push({ x, y, buttonType });
    }

    /**
     * Records scroll event
     * @param {number} deltaX
     * @param {number} deltaY
     */
    recordScroll(deltaX, deltaY) {
        this.interactions.scrollEvents.push({ deltaX, deltaY });
    }

    /**
     * Records button press
     * @param {string} buttonId
     * @param {string} [actionType='click']
     */
    recordButtonPress(buttonId, actionType = 'click') {
        this.interactions.buttonPresses.push({ buttonId, actionType });
    }

    /**
     * Records keyboard event
     * @param {string} key
     * @param {string} [actionType='keydown']
     */
    recordKeyPress(key, actionType = 'keydown') {
        this.interactions.keyboardEvents.push({ key, actionType });
    }
}