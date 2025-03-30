<template>
    <div>
        <div class="link-input-container">
            <label for="link1">First Link (Version A)</label>
            <input 
                type="url" 
                id="link1" 
                v-model="link1" 
                placeholder="https://version-a.example.com" 
                required
            >
        </div>
        
        <div class="link-input-container">
            <label for="link2">Second Link (Version B)</label>
            <input 
                type="url" 
                id="link2" 
                v-model="link2" 
                placeholder="https://version-b.example.com" 
                required
            >
        </div>

        <button @click="saveLinks" class="save-button">Save Links</button>

        <!-- Display section for saved links -->
        <div v-if="savedLinks" class="links-display">
            <h3>Saved A/B Test Links:</h3>
            <div class="link-item">
                <strong>Version A:</strong> 
                <a :href="savedLinks.linkA" target="_blank">{{ savedLinks.linkA }}</a>
            </div>
            <div class="link-item">
                <strong>Version B:</strong> 
                <a :href="savedLinks.linkB" target="_blank">{{ savedLinks.linkB }}</a>
            </div>
        </div>

        <div v-if="loading" class="loading">Loading links...</div>
        <div v-if="error" class="error">{{ error }}</div>
    </div>
</template>

<script>
export default {
    name: 'LinkInputs',
    data() {
        return {
            link1: '',
            link2: '',
            savedLinks: null,
            loading: false,
            error: null
        }
    },
    computed: {
        // Get links from Vuex store
        storeLinks() {
            return this.$store.getters.abTestLinks
        }
    },
    methods: {
        async saveLinks() {
            try {
                this.loading = true
                this.error = null
                await this.$store.dispatch('saveAbTestLinks', {
                    linkA: this.link1,
                    linkB: this.link2,
                })
                // Update local display with newly saved links
                this.savedLinks = {
                    linkA: this.link1,
                    linkB: this.link2
                }
                this.$toast.success('Links saved successfully!')
            } catch (error) {
                console.error("Error when storing to Firebase:", error)
                this.error = "Failed to save links. Please try again."
                this.$toast.error('Failed to save links')
            } finally {
                this.loading = false
            }
        },
        async fetchLinks() {
            try {
                this.loading = true
                this.error = null
                await this.$store.dispatch('loadAbTestLinks')
                
                // If links exist in store, display them
                if (this.storeLinks && (this.storeLinks.linkA || this.storeLinks.linkB)) {
                    this.savedLinks = { ...this.storeLinks }
                    this.link1 = this.storeLinks.linkA || ''
                    this.link2 = this.storeLinks.linkB || ''
                }
            } catch (error) {
                console.error("Error fetching links:", error)
                this.error = "Failed to load saved links."
            } finally {
                this.loading = false
            }
        }
    },
    mounted() {
        this.fetchLinks()
    },
    watch: {
        // Update local state if store links change
        storeLinks(newVal) {
            if (newVal) {
                this.savedLinks = { ...newVal }
                this.link1 = newVal.linkA || ''
                this.link2 = newVal.linkB || ''
            }
        }
    }
}
</script>

<style scoped>
.link-input-container {
    margin-bottom: 1.5rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
    color: #333;
}

input[type="url"] {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.3s;
}

input[type="url"]:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.save-button {
    background-color: #4a90e2;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    margin-bottom: 2rem;
    transition: background-color 0.3s;
}

.save-button:hover {
    background-color: #3a7bc8;
}

.links-display {
    margin-top: 2rem;
    padding: 1.5rem;
    background-color: #f8f9fa;
    border-radius: 6px;
    border: 1px solid #eee;
}

.links-display h3 {
    margin-top: 0;
    color: #333;
    border-bottom: 1px solid #ddd;
    padding-bottom: 0.5rem;
}

.link-item {
    margin: 1rem 0;
    padding: 0.5rem;
    background-color: white;
    border-radius: 4px;
}

.link-item a {
    color: #4a90e2;
    text-decoration: none;
    word-break: break-all;
}

.link-item a:hover {
    text-decoration: underline;
}

.loading {
    color: #666;
    font-style: italic;
    margin: 1rem 0;
}

.error {
    color: #e74c3c;
    margin: 1rem 0;
}
</style>s