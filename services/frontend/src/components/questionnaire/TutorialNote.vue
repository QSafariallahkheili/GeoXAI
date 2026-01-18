<template>
  <v-container
    fluid
    class="tutorial-container d-flex align-center justify-center"
  >
    <v-sheet
      max-width="1000"
      class="tutorial-sheet"
      rounded="xl"
      elevation="2"
    >
      <div class="content">

        <!-- Title -->
        <h1 class="text-h5 text-md-h4 font-weight-bold mb-4 mb-md-6">
          What You Will See
        </h1>

        <p class="text-body-2 text-md-body-1 mb-6 mb-md-8">
          You will interact with maps showing
          <strong>wildfire susceptibility predictors</strong>
          for different regions.
        </p>

        <!-- Sections -->
        <v-row dense>

          <!-- Predictor -->
          <v-col cols="12" md="4">
            <v-card variant="tonal" class="pa-4 fill-height">
              <h2 class="text-h6 font-weight-medium mb-3">
                1. Predictor Values (Features)
              </h2>

              <p class="mb-2">
                Environmental factors related to wildfire susceptibility:
              </p>

              <ul class="mb-3">
                <li>Vegetation conditions</li>
                <li>Drought</li>
                <li>Land Surface Temperature</li>
              </ul>

              <p class="text-medium-emphasis">
                Values are shown using visual size, color, or patterns.
              </p>
            </v-card>
          </v-col>

          <!-- SHAP -->
          <v-col cols="12" md="4">
            <v-card variant="tonal" class="pa-4 fill-height">
              <h2 class="text-h6 font-weight-medium mb-3">
                2. Model Explanation (SHAP)
              </h2>

              <p class="mb-3">
                Some maps show how strongly a predictor contributes to wildfire
                susceptibility.
              </p>

              <ul class="mb-3">
                <li><strong>Positive</strong>: increases susceptibility</li>
                <li><strong>Negative</strong>: decreases susceptibility</li>
              </ul>

              <v-alert
                type="info"
                variant="tonal"
                density="comfortable"
                class="text-body-2 text-md-body-1"
              >
                No prior knowledge of SHAP is required.
              </v-alert>
            </v-card>
          </v-col>

          <!-- Uncertainty -->
          <v-col cols="12" md="4">
            <v-card variant="tonal" class="pa-4 fill-height">
              <h2 class="text-h6 font-weight-medium mb-3">
                3. Uncertainty
              </h2>

              <p class="mb-3">
                Uncertainty shows how reliable the model explanation is at each location.
              </p>

              <ul class="mb-3">
                <li><strong>Higher</strong>: lower confidence</li>
                <li><strong>Lower</strong>: higher confidence</li>
              </ul>

              <p class="text-medium-emphasis">
                Shown using blur, noise, patterns, or texture.
              </p>
            </v-card>
          </v-col>

        </v-row>

      </div>
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
.tutorial-container {
  min-height: 100vh;
  padding: 16px;
}

.tutorial-sheet {
  width: 100%;
  max-height: 100vh;
  padding: clamp(16px, 4vw, 48px);
  overflow-y: auto;
}

.content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* If viewport is very short, remove vertical centering */
@media (max-height: 700px) {
  .content {
    justify-content: flex-start;
  }
}

/* Optional: better list spacing for small screens */
ul {
  padding-left: 1rem;
}

li {
  margin-bottom: 6px;
}
.nav {
  position: fixed;
  bottom: 24px;
  right: 24px;
}
</style>
