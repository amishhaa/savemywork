<template>
  <div>
    <h2>Received Events</h2>
    <ul>
      <li v-for="(event, index) in events" :key="index">
        <strong>{{ event.type }}</strong>: {{ event.details }}
      </li>
    </ul>
    
    <h2>Heatmap</h2>
    <img 
      v-if="heatmapImage" 
      :src="heatmapImage" 
      alt="Generated Heatmap"
      style="border: 1px solid #ccc; max-width: 100%; height: auto;"
    />
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      events: [],
      heatmapImage: "", 
    };
  },
  mounted() {
    window.addEventListener("message", this.handleMessage);
  },
  methods: {
    async handleMessage(event) {
      this.events.unshift({
        type: event.data.type,
        details: event.data.type === "cursorMove"
          ? `X: ${event.data.x}, Y: ${event.data.y}`
          : JSON.stringify(event.data.details),
        x: event.data.x,
        y: event.data.y,
      });

      if (this.events.length > 50) {
        this.events.pop();
      }

      try {
        const response = await axios.post(
          `${process.env.VUE_APP_FIREBASE_PYTHON_FUNCTION}get_heatmap`,
          {
            x: event.data.x,
            y: event.data.y,
          }
        );

        if (response.data.image_base64) {
          console.log("succesful")
          this.heatmapImage = `data:image/png;base64,${response.data.image_base64}`;
        }
      } catch (e) {
        console.error("Cloud Function Error", e);
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

