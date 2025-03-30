export default class Interactions {
    constructor({
        userDocId = '',
        events = {
            mouseMovements: [],       // { x: number, y: number }
            mouseClicks: [],         // { x: number, y: number, buttonType: string }
            scrollEvents: [],        // { deltaX: number, deltaY: number }
            buttonPresses: [],       // { buttonId: string, actionType: string }
            keyboardEvents: [],      // { key: string, actionType: 'keydown'|'keyup' }
            focusEvents: [],         // { elementId: string, actionType: 'focus'|'blur' }
            touchEvents: []          // For mobile { x: number, y: number, type: string }
        },
        createdAt = new Date()
    } = {}) {
        this.userDocId = userDocId;
        this.events = events;
        this.createdAt = createdAt;
    }

    /* Conversion Methods */
    static toInteractions(data) {
        return new Interactions({
            userDocId: data.userDocId,
            events: data.events || {},
            createdAt: data.createdAt?.toDate() || new Date()
        });
    }

    toFirestore() {
        return {
            userDocId: this.userDocId,
            events: this.events,
            createdAt: this.createdAt
        };
    }

    /* Event Recording Methods */
    recordMouseMove(x, y) {
        this.events.mouseMovements.push({ x, y });
    }

    recordClick(x, y, buttonType = 'left') {
        this.events.mouseClicks.push({ x, y, buttonType });
    }

    recordScroll(deltaX, deltaY) {
        this.events.scrollEvents.push({ deltaX, deltaY });
    }

    recordButtonPress(buttonId, actionType = 'click') {
        this.events.buttonPresses.push({ buttonId, actionType });
    }

    recordKeyPress(key, actionType = 'keydown') {
        this.events.keyboardEvents.push({ key, actionType });
    }

    recordFocusChange(elementId, actionType) {
        this.events.focusEvents.push({ elementId, actionType });
    }

    recordTouchEvent(x, y, type) {
        this.events.touchEvents.push({ x, y, type });
    }
}