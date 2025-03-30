import Interactions from '@/models/Interactions';
import { db } from '@/firebase';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';

export default {
    namespaced: true,
    state: {
        currentUserInteractions: null, // Holds the Interactions instance for current user
        allInteractions: {}           // Cache of all loaded interactions { userId: Interactions }
    },

    mutations: {
        // Initialize or replace user's interaction tracker
        SET_INTERACTIONS(state, { userId, interactions }) {
            state.allInteractions[userId] = interactions;
            if (userId === state.currentUser?.id) {
                state.currentUserInteractions = interactions;
            }
        },

        // Interaction-specific mutations
        ADD_MOUSE_MOVEMENT(state, { userId, x, y }) {
            const interactions = state.allInteractions[userId];
            if (interactions) interactions.recordMouseMove(x, y);
        },

        ADD_MOUSE_CLICK(state, { userId, x, y, buttonType }) {
            const interactions = state.allInteractions[userId];
            if (interactions) interactions.recordClick(x, y, buttonType);
        },

        ADD_SCROLL_EVENT(state, { userId, deltaX, deltaY }) {
            const interactions = state.allInteractions[userId];
            if (interactions) interactions.recordScroll(deltaX, deltaY);
        },

        ADD_BUTTON_PRESS(state, { userId, buttonId, actionType }) {
            const interactions = state.allInteractions[userId];
            if (interactions) interactions.recordButtonPress(buttonId, actionType);
        },

        ADD_KEY_PRESS(state, { userId, key, actionType }) {
            const interactions = state.allInteractions[userId];
            if (interactions) interactions.recordKeyPress(key, actionType);
        },

        ADD_FOCUS_EVENT(state, { userId, elementId, actionType }) {
            const interactions = state.allInteractions[userId];
            if (interactions) interactions.recordFocusChange(elementId, actionType);
        }
    },

    actions: {
        // Load or create user's interaction tracker
        async initializeUserTracker({ commit, rootState }) {
            const userId = rootState.user?.id;
            if (!userId) return;

            try {
                // Check Firestore for existing interactions
                const docRef = doc(db, 'user_interactions', userId);
                const docSnap = await getDoc(docRef);

                let interactions;
                if (docSnap.exists()) {
                    interactions = Interactions.toInteractions(docSnap.data());
                } else {
                    interactions = new Interactions({ userDocId: userId });
                    await setDoc(docRef, interactions.toFirestore());
                }

                commit('SET_INTERACTIONS', { userId, interactions });
            } catch (error) {
                console.error('Error initializing interaction tracker:', error);
            }
        },

        // Generic action to record any interaction
        async recordInteraction({ commit, rootState }, { type, data }) {
            const userId = rootState.user?.id;
            if (!userId) return;

            try {
                // Update local state first
                switch (type) {
                    case 'mousemove':
                        commit('ADD_MOUSE_MOVEMENT', { userId, ...data });
                        break;
                    case 'click':
                        commit('ADD_MOUSE_CLICK', { userId, ...data });
                        break;
                    case 'scroll':
                        commit('ADD_SCROLL_EVENT', { userId, ...data });
                        break;
                    case 'button':
                        commit('ADD_BUTTON_PRESS', { userId, ...data });
                        break;
                    case 'keypress':
                        commit('ADD_KEY_PRESS', { userId, ...data });
                        break;
                    case 'focus':
                        commit('ADD_FOCUS_EVENT', { userId, ...data });
                        break;
                }

                // Batch Firestore updates (optimization: update every 10 seconds)
                await this.dispatch('interactions/maybeUpdateFirestore', userId, { root: true });
            } catch (error) {
                console.error('Error recording interaction:', error);
            }
        },

        // Throttled Firestore updates
        async maybeUpdateFirestore({ state }, userId) {
            if (!state.updateTimeout) {
                state.updateTimeout = setTimeout(async () => {
                    const interactions = state.allInteractions[userId];
                    if (interactions) {
                        await updateDoc(
                            doc(db, 'user_interactions', userId),
                            { events: interactions.events }
                        );
                    }
                    state.updateTimeout = null;
                }, 10000); // 10 second debounce
            }
        }
    },

    getters: {
        // Get all events for current user
        currentUserEvents: (state) => state.currentUserInteractions?.events || {},

        // Get specific event types
        mouseMovements: (state) => state.currentUserInteractions?.events.mouseMovements || [],
        mouseClicks: (state) => state.currentUserInteractions?.events.mouseClicks || [],
        scrollEvents: (state) => state.currentUserInteractions?.events.scrollEvents || [],
        buttonPresses: (state) => state.currentUserInteractions?.events.buttonPresses || [],

        // Statistics
        totalClicks: (state) => state.currentUserInteractions?.events.mouseClicks.length || 0,
        totalScrollDistance: (state) => {
            const scrolls = state.currentUserInteractions?.events.scrollEvents || [];
            return scrolls.reduce((total, { deltaY }) => total + Math.abs(deltaY), 0);
        },

        // Get interactions for any user (admin view)
        getUserInteractions: (state) => (userId) => state.allInteractions[userId]?.events || null
    }
};