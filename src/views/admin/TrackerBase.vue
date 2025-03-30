<template>
  <div>
    <h2>Received Events</h2>
    <div class="container">
      <ul>
        <li v-for="(event, index) in recentEvents" :key="index">
          <strong>{{ event.type }}</strong>: {{ event.details }}
          <span class="timestamp">{{ event.timestamp }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      recentEvents: [] 
    };
  },

  mounted() {
    window.addEventListener("message", this.handleMessage);
  },

  beforeUnmount() {
    window.removeEventListener("message", this.handleMessage);
  },
  computed: {
    currentUserTestAnswer() {
        return this.$store.getters.currentUserTestAnswer
    },
  },
  methods: {
    formatEventDetails(eventType, details) {
      try {
        const parsedDetails = typeof details === 'string' ? JSON.parse(details) : details;
        
        switch(eventType) {
          case 'mousemove':
            return {
              x: parsedDetails.x,
              y: parsedDetails.y
            };
          case 'click':
            return {
              x: parsedDetails.x,
              y: parsedDetails.y,
              buttonType: parsedDetails.buttonType || 'left'
            };
          case 'scroll':
            return {
              deltaX: parsedDetails.deltaX || 0,
              deltaY: parsedDetails.deltaY || 0
            };
          case 'button-press':
            return {
              buttonId: parsedDetails.buttonId,
              actionType: parsedDetails.actionType || 'click'
            };
          case 'key-press':
            return {
              key: parsedDetails.key,
              actionType: parsedDetails.actionType || 'keydown'
            };
          case 'focus-change':
            return {
              elementId: parsedDetails.elementId,
              actionType: parsedDetails.actionType || 'focus'
            };
          case 'touch':
            return {
              x: parsedDetails.x,
              y: parsedDetails.y,
              type: parsedDetails.type || 'touchstart'
            };
          default:
            return parsedDetails;
        }
      } catch (e) {
        return details;
      }
    },

    async handleMessage(event) {
      try {
        const eventData = JSON.parse(event.data);
        const timestamp = new Date().toISOString();
        
        // Add to recent events for display
        this.recentEvents.unshift({
          type: eventData.type,
          details: typeof eventData.details === 'object' ? 
                  JSON.stringify(eventData.details) : eventData.details,
          timestamp
        });
        if (this.recentEvents.length > 100) this.recentEvents.pop();

        // Format data to match Interactions class structure
        const formattedEvent = this.formatEventDetails(eventData.type, eventData.details);
        
        const testAnswerData = {
          userDocId: eventData.userId,
          events: {
            [this.getEventCategory(eventData.type)]: [formattedEvent]
          },
          createdAt: new Date()
        };

        this.currentUserTestAnswer.userDocId = eventData.userDocId
        this.currentUserTestAnswer.events = {
            [this.getEventCategory(eventData.type)]: [formattedEvent]
          }
        this.currentUserTestAnswer.createdAt = new Date()
        console.log("succesful")

      } catch (error) {
        console.error("Error processing event:", error);
        this.recentEvents.unshift({
          type: 'error',
          details: `Failed to record event: ${error.message}`,
          timestamp: new Date().toISOString()
        });
      }
    },

    getEventCategory(type) {
      switch(type) {
        case 'mousemove': return 'mouseMovements';
        case 'click': return 'mouseClicks';
        case 'scroll': return 'scrollEvents';
        case 'button-press': return 'buttonPresses';
        case 'key-press': return 'keyboardEvents';
        case 'focus-change': return 'focusEvents';
        case 'touch': return 'touchEvents';
        default: return 'otherEvents';
      }
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  gap: 20px;
}

ul {
  flex: 1;
  max-height: 600px;
  overflow-y: auto;
  border: 1px solid #eee;
  padding: 10px;
  list-style-type: none;
}

li {
  padding: 5px 0;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
}

.timestamp {
  color: #666;
  font-size: 0.8em;
}

li strong {
  color: #2c3e50;
}
</style>