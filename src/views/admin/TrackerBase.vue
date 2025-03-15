<template>
  <div>
    <h2>Received Events</h2>
    <ul>
      <li v-for="(event, index) in events" :key="index">
        <strong>{{ event.type }}</strong>: {{ event.details }}
      </li>
    </ul>
  </div>
</template>

<script>
import Tracker from "@/models/Tracker";
export default {
  data() {
    return {
      events: [], // Local state to store events
    };
  },

  mounted() {
    this.fetchEvents();
    window.addEventListener("message", this.handleMessage);
  },

  beforeUnmount() {
    window.removeEventListener("message", this.handleMessage);
  },

  methods: {
    /**
     * Fetches events from the store and updates the local state.
     */
    async fetchEvents() {
      try {
        // Access the state directly from the store
        this.events = store.state.Tracker.events;
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    },

    /**
     * Handles incoming messages (events) and processes them.
     * @param {MessageEvent} event - The message event containing event data.
     */
    async handleMessage(event) {
      try {
        const eventData = JSON.parse(event.data);
        const tracker = new Tracker({
          eventType: eventData.type,
          eventId: eventData.id,
          timestamp: Date.now(),
          userId: eventData.userId,
          metadata: eventData.details,
        });
        await this.$store.dispatch("addTracker", tracker);

        //this.events = store.state.Tracker.events;

        console.log("Event processed and saved:", tracker);
      } catch (error) {
        console.error("Error processing event:", error);
      }
    },
  },
};
</script>

<style scoped>
img {
  border: 1px solid #ccc;
}
</style>

