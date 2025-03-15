/**
 * Template Store Module
 * @module Tracker
 */
import Tracker from "@/models/Tracker";
import { db } from "@/firebase";
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs, query, where } from "firebase/firestore";

export default {
    state: {
        trackers: [], // Local state to store trackers
    },

    mutations: {
        ADD_TRACKER(state, tracker) {
            state.trackers.push(tracker);
        },
        UPDATE_TRACKER(state, updatedTracker) {
            const index = state.trackers.findIndex((t) => t.id === updatedTracker.id);
            if (index !== -1) {
                state.trackers[index] = new Tracker(updatedTracker);
            }
        },
        DELETE_TRACKER(state, trackerId) {
            state.trackers = state.trackers.filter((t) => t.id !== trackerId);
        },
        INCREMENT_CLICKS(state, trackerId) {
            const tracker = state.trackers.find((t) => t.id === trackerId);
            if (tracker) tracker.incrementClicks();
        },
        SET_TRACKERS(state, trackers) {
            state.trackers = trackers;
        },
    },

    actions: {
        async fetchTrackers({ commit }) {
            try {
                const querySnapshot = await getDocs(collection(db, "events"));
                const trackers = querySnapshot.docs.map((doc) => {
                    const data = doc.data();
                    return new Tracker({ id: doc.id, ...data });
                });
                commit("SET_TRACKERS", trackers);
                console.log("Trackers fetched from Firestore");
            } catch (error) {
                console.error("Error fetching trackers:", error);
            }
        },

        async addTracker({ commit }, trackerData) {
            const tracker = new Tracker(trackerData);

            try {
                const docRef = await addDoc(collection(db, "events"), tracker.toFirestore());
                tracker.id = docRef.id; // Assign Firestore ID
                commit("ADD_TRACKER", tracker);
                console.log("Event saved to Firestore:", docRef.id);
            } catch (error) {
                console.error("Error adding event to Firestore:", error);
            }
        },

        async updateTracker({ commit }, updatedTracker) {
            try {
                const trackerRef = doc(db, "events", updatedTracker.id);
                await updateDoc(trackerRef, updatedTracker.toFirestore());
                commit("UPDATE_TRACKER", updatedTracker);
                console.log("Event updated in Firestore");
            } catch (error) {
                console.error("Error updating event:", error);
            }
        },

        async deleteTracker({ commit }, trackerId) {
            try {
                await deleteDoc(doc(db, "events", trackerId));
                commit("DELETE_TRACKER", trackerId);
                console.log("Event deleted from Firestore");
            } catch (error) {
                console.error("Error deleting event:", error);
            }
        },

        async incrementClicks({ commit, state }, trackerId) {
            const tracker = state.trackers.find((t) => t.id === trackerId);
            if (tracker) {
                tracker.incrementClicks();

                try {
                    const trackerRef = doc(db, "events", trackerId);
                    await updateDoc(trackerRef, { clicks: tracker.clicks });
                    commit("INCREMENT_CLICKS", trackerId);
                    console.log("Click count updated in Firestore");
                } catch (error) {
                    console.error("Error updating click count:", error);
                }
            }
        },
    },

    getters: {
        getTrackerById: (state) => (id) => state.trackers.find((t) => t.id === id),

        getTrackersByUser: (state) => (userId) =>
            state.trackers.filter((t) => t.userId === userId),

        getTrackersByEventType: (state) => (eventType) =>
            state.trackers.filter((t) => t.eventType === eventType),

        getTotalClicksByEventType: (state) => (eventType) => {
            const trackers = state.trackers.filter((t) => t.eventType === eventType);
            return trackers.reduce((total, tracker) => total + tracker.clicks, 0);
        },

        getEventTypeSummary: (state) => {
            const eventTypeMap = {};
            state.trackers.forEach((tracker) => {
                if (!eventTypeMap[tracker.eventType]) {
                    eventTypeMap[tracker.eventType] = 0;
                }
                eventTypeMap[tracker.eventType] += tracker.clicks;
            });
            return Object.entries(eventTypeMap).map(([eventType, clicks]) => ({
                eventType,
                clicks,
            }));
        },
    },
};