<template>
  <div>
    <!-- checking whether to show heuristics answer sheet or user answer sheet-->
    <div v-if="testAnswerDocument.type === 'HEURISTICS'">
      <HeuristicsTestAnswer />
    </div>
    <div v-if="testAnswerDocument.type === 'ABTest'">
      <ABTestAnswer />
    </div>
    <div v-else>
      <UserTestAnswer />
    </div>
  </div>
</template>

<script>
import HeuristicsTestAnswer from '@/components/organisms/HeuristicsTestAnswer.vue'
import UserTestAnswer from '@/components/organisms/UserTestAnswer.vue'
import ABTestAnswer from '@/components/organisms/ABTestAnswer.vue'

export default {
  components: {
    HeuristicsTestAnswer,
    UserTestAnswer,
    ABTestAnswer,
  },

  computed: {
    testAnswerDocument() {
      return this.$store.state.Answer.testAnswerDocument
    },
  },
}
</script>

<style></style>
