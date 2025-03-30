/**
 * Tracker Store Module
 * @module Tracker
 */
import Tracker from "@/models/Tracker";
import { db } from "@/firebase";
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs, query, where } from "firebase/firestore";

export default {
    state: {
        trackers: [],
    },

    mutations: {
        ADD_TRACKER(state, tracker) {
            state.trackers.push(tracker);
        },
        UPDATE_TRACKER(state, updatedTracker) {
            const index = state.trackers.findIndex(t => t.id === updatedTracker.id);
            if (index !== -1) {
                state.trackers.splice(index, 1, updatedTracker);
            }
        },
        DELETE_TRACKER(state, trackerId) {
            state.trackers = state.trackers.filter(t => t.id !== trackerId);
        },
        SET_TRACKERS(state, trackers) {
            state.trackers = trackers;
        },
        // Interaction-specific mutations
        ADD_MOUSE_MOVEMENT(state, { trackerId, x, y }) {
            const tracker = state.trackers.find(t => t.id === trackerId);
            if (tracker) tracker.recordMouseMovement(x, y);
        },
        ADD_MOUSE_CLICK(state, { trackerId, x, y, buttonType }) {
            const tracker = state.trackers.find(t => t.id === trackerId);
            if (tracker) tracker.recordMouseClick(x, y, buttonType);
        },
        ADD_SCROLL_EVENT(state, { trackerId, deltaX, deltaY }) {
            const tracker = state.trackers.find(t => t.id === trackerId);
            if (tracker) tracker.recordScroll(deltaX, deltaY);
        },
        ADD_BUTTON_PRESS(state, { trackerId, buttonId, actionType }) {
            const tracker = state.trackers.find(t => t.id === trackerId);
            if (tracker) tracker.recordButtonPress(buttonId, actionType);
        },
        ADD_KEY_PRESS(state, { trackerId, key, actionType }) {
            const tracker = state.trackers.find(t => t.id === trackerId);
            if (tracker) tracker.recordKeyPress(key, actionType);
        }
    },

    actions: {
        async fetchTrackers({ commit }) {
            try {
                const querySnapshot = await getDocs(collection(db, "trackers"));
                const trackers = querySnapshot.docs.map(doc =>
                    Tracker.fromFirestore({ id: doc.id, ...doc.data() })
                );
                commit("SET_TRACKERS", trackers);
            } catch (error) {
                console.error("Error fetching trackers:", error);
            }
        },

        async fetchUserTracker({ commit, state }, userId) {
            try {
                // Check if we already have it locally
                const existing = state.trackers.find(t => t.userId === userId);
                if (existing) return existing;

                // Fetch from Firestore
                const q = query(collection(db, "trackers"), where("userId", "==", userId));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    const tracker = Tracker.fromFirestore({ id: doc.id, ...doc.data() });
                    commit("ADD_TRACKER", tracker);
                    return tracker;
                }

                // Create new if doesn't exist
                return await this.dispatch("createTracker", userId);
            } catch (error) {
                console.error("Error fetching user tracker:", error);
            }
        },

        async createTracker({ commit }, userId) {
            const tracker = new Tracker({ userId });
            try {
                const docRef = await addDoc(collection(db, "trackers"), tracker.toFirestore());
                tracker.id = docRef.id;
                commit("ADD_TRACKER", tracker);
                return tracker;
            } catch (error) {
                console.error("Error creating tracker:", error);
            }
        },

        async updateTracker({ commit }, tracker) {
            try {
                await updateDoc(doc(db, "trackers", tracker.id), tracker.toFirestore());
                commit("UPDATE_TRACKER", tracker);
            } catch (error) {
                console.error("Error updating tracker:", error);
            }
        },

        async recordInteraction({ commit, dispatch }, { userId, type, data }) {
            try {
                // Get or create user's tracker
                const tracker = await dispatch("fetchUserTracker", userId);
                if (!tracker) return;

                // Record the interaction
                switch (type) {
                    case "mouseMovement":
                        commit("ADD_MOUSE_MOVEMENT", { trackerId: tracker.id, ...data });
                        break;
                    case "mouseClick":
                        commit("ADD_MOUSE_CLICK", { trackerId: tracker.id, ...data });
                        break;
                    case "scroll":
                        commit("ADD_SCROLL_EVENT", { trackerId: tracker.id, ...data });
                        break;
                    case "buttonPress":
                        commit("ADD_BUTTON_PRESS", { trackerId: tracker.id, ...data });
                        break;
                    case "keyPress":
                        commit("ADD_KEY_PRESS", { trackerId: tracker.id, ...data });
                        break;
                }

                // Batch updates could be implemented here for performance
                await dispatch("updateTracker", tracker);
            } catch (error) {
                console.error("Error recording interaction:", error);
            }
        }
    },

    getters: {
        getUserTracker: (state) => (userId) =>
            state.trackers.find(t => t.userId === userId),

        getMouseMovements: (state) => (userId) => {
            const tracker = state.trackers.find(t => t.userId === userId);
            return tracker?.interactions.mouseMovements || [];
        },

        getMouseClicks: (state) => (userId) => {
            const tracker = state.trackers.find(t => t.userId === userId);
            return tracker?.interactions.mouseClicks || [];
        },

        getScrollEvents: (state) => (userId) => {
            const tracker = state.trackers.find(t => t.userId === userId);
            return tracker?.interactions.scrollEvents || [];
        },

        getHeatmapData: (state) => (userId) => {
            const tracker = state.trackers.find(t => t.userId === userId);
            if (!tracker) return [];

            return [
                ...tracker.interactions.mouseMovements.map(m => ({ x: m.x, y: m.y, value: 1 })),
                ...tracker.interactions.mouseClicks.map(m => ({ x: m.x, y: m.y, value: 5 }))
            ];
        }
    }
};