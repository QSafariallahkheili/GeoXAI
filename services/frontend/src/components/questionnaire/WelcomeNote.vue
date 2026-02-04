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
        {{ $t("welcome.title") }}
      </v-card-title>

      <v-card-text class="text-body-2 text-md-body-1">
        <p class="mb-4">
          {{ $t("welcome.subtitle") }}
        </p>

        <p class="mb-4">
          {{ $t("welcome.description1") }}
        </p>

        <p class="mb-4">
          {{ $t("welcome.description2") }}
        </p>

        <v-divider class="my-6" />

        <p class="text-medium-emphasis">
          {{ $t("welcome.description3") }}
        </p>

        <v-alert
          type="info"
          variant="tonal"
          density="comfortable"
          class="mt-6 text-body-2 text-md-body-1"
        >
          {{ $t("welcome.time-declaration") }}
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
  bottom: 15px;
  right: 15px;
}
</style>
