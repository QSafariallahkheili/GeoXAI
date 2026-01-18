<template>
  <v-container
    fluid
    class="welcome-container d-flex align-center justify-center"
  >
    <v-sheet
      max-width="1000"
      class="welcome-sheet"
      rounded="xl"
      elevation="2"
    >
      <v-card-title class="text-h5 text-md-h4 font-weight-bold mb-4 mb-md-6">
        Welcome and Thank You
      </v-card-title>

      <v-card-text class="text-body-2 text-md-body-1">
        <p class="mb-4">
          Thank you for participating in this study.
        </p>

        <p class="mb-4">
          In this session, you will explore a set of interactive maps related to
          <strong>wildfire susceptibility</strong> and answer questions about what
          you see.
        </p>

        <p class="mb-4">
          The study focuses on how different map designs support understanding of
          <strong>machine learning model explanations</strong> and
          <strong>uncertainty</strong>.
        </p>

        <v-divider class="my-6" />

        <p class="text-medium-emphasis">
          There are no right or wrong visualization styles —
          we are interested in how people interpret them.
        </p>

        <v-alert
          type="info"
          variant="tonal"
          density="comfortable"
          class="mt-6 text-body-2 text-md-body-1"
        >
          The session will take approximately <strong>15–20 minutes</strong>.
        </v-alert>
      </v-card-text>
    </v-sheet>
    <div class="nav">
       <v-btn
        color="primary"
        size="large"
        variant="elevated"
        append-icon="mdi-arrow-right"
        @click="currentStep++"
      >
        Next
      </v-btn>
    </div>
  </v-container>
</template>

<script setup>
    import { storeToRefs } from 'pinia'
    import { useQuestionnaireStore } from '../../stores/questionnaire'
    let {currentStep} = storeToRefs(useQuestionnaireStore());
</script>
<style scoped>
.welcome-container {
  min-height: 100vh;
  padding: 16px;
}

.welcome-sheet {
  width: 100%;
  max-height: 100vh;
  padding: clamp(16px, 4vw, 48px);
  overflow-y: auto;
}

/* Optional: for very short screens */
@media (max-height: 700px) {
  .welcome-sheet {
    padding-top: 24px;
    padding-bottom: 24px;
  }
}
  .nav {
  position: fixed;
  bottom: 24px;
  right: 24px;
}
</style>
