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
          {{ $t('tutorial.title') }}
        </h1>

        <p class="text-body-2 text-md-body-1 mb-6 mb-md-8">
         {{ $t('tutorial.subtitle') }}
        </p>

        <!-- Sections -->
        <v-row dense>

          <!-- Predictor -->
          <v-col cols="12" md="4">
            <v-card variant="tonal" class="pa-4 fill-height">
              <h2 class="text-h6 font-weight-medium mb-3">
                {{ $t('tutorial.predictor-title') }}
              </h2>

              <p class="mb-2">
                {{ $t('tutorial.predictor-subtitle') }}
              </p>

              <ul class="mb-3">
                <li>{{ $t('tutorial.predictor-item1') }}</li>
                <li>{{ $t('tutorial.predictor-item2') }}</li>
                <li>{{ $t('tutorial.predictor-item3') }}</li>
              </ul>

              <p class="text-medium-emphasis">
                {{ $t('tutorial.predictor-footer') }}
              </p>
            </v-card>
          </v-col>

          <!-- SHAP -->
          <v-col cols="12" md="4">
            <v-card variant="tonal" class="pa-4 fill-height">
              <h2 class="text-h6 font-weight-medium mb-3">
                {{ $t('tutorial.shap-title') }}
              </h2>

              <p class="mb-3">
                {{ $t('tutorial.shap-subtitle') }}
              </p>

              <ul class="mb-3">
                <li>{{ $t('tutorial.shap-item1') }}</li>
                <li>{{ $t('tutorial.shap-item2') }}</li>
              </ul>

              <v-alert
                type="info"
                variant="tonal"
                density="comfortable"
                class="text-body-2 text-md-body-1"
              >
                {{ $t('tutorial.shap-footer') }}
              </v-alert>
            </v-card>
          </v-col>

          <!-- Uncertainty -->
          <v-col cols="12" md="4">
            <v-card variant="tonal" class="pa-4 fill-height">
              <h2 class="text-h6 font-weight-medium mb-3">
                {{ $t('tutorial.uncertainty-title') }}
              </h2>

              <p class="mb-3">
                {{ $t('tutorial.uncertainty-subtitle') }}
              </p>

              <ul class="mb-3">
                <li>{{ $t('tutorial.uncertainty-item1') }}</li>
                <li>{{ $t('tutorial.uncertainty-item2') }}</li>
              </ul>

              <p class="text-medium-emphasis">
                {{ $t('tutorial.uncertainty-footer') }}
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
  bottom: 15px;
  right: 15px;
}
</style>
