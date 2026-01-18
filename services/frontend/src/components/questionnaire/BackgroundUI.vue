<template>
  <v-container
    fluid
    class="background-container d-flex align-center justify-center"
  >
    <v-sheet
      max-width="1000"
      class="background-sheet"
      rounded="xl"
      elevation="2"
    >
      <div class="content">

        <h1 class="text-h5 text-md-h4 font-weight-bold mb-6">
          Background
        </h1>

        <v-form ref="form" v-model="valid" lazy-validation>

          <!-- B1. GIS / Cartography Experience -->
          <v-card variant="tonal" class="pa-4 mb-4">
                <h2 class="text-h6 font-weight-medium mb-2">
                B1. Map / Data Visualisation
                </h2>
                <p class="mb-2">
                How would you describe your experience with map and data visualisation?
                </p>

                <v-radio-group
                v-model="background_info.datavis"
                inline
                class="radio-group"
                column
                >
                <v-radio label="None" value="None" />
                <v-radio label="Basic" value="Basic" />
                <v-radio label="Intermediate" value="Intermediate" />
                <v-radio label="Advanced" value="Advanced" />
                <v-radio label="Expert" value="Expert" />
                </v-radio-group>
            </v-card>

            <!-- B2. ML -->
            <v-card variant="tonal" class="pa-4 mb-4">
                <h2 class="text-h6 font-weight-medium mb-2">
                B2. Familiarity with Machine Learning
                </h2>
                <p class="mb-2">
                How familiar are you with machine learning methods?
                </p>

                <v-radio-group
                v-model="background_info.ml"
                inline
                class="radio-group"
                column
                >
                <v-radio label="Not at all" value="Not at all" />
                <v-radio label="Slightly familiar" value="Slightly familiar" />
                <v-radio label="Moderately familiar" value="Moderately familiar" />
                <v-radio label="Very familiar" value="Very familiar" />
                <v-radio label="Expert" value="Expert" />
                </v-radio-group>
            </v-card>

            <!-- B3. Decision-Making -->
            <v-card variant="tonal" class="pa-4 mb-4" >
                <h2 class="text-h6 font-weight-medium mb-2">
                B3. Decision-Making Context
                </h2>
                <p class="mb-2">
                Have you previously used maps for risk assessment or environmental decision-making?
                </p>

                <v-radio-group
                v-model="background_info.decision"
                inline
                class="radio-group"
                >
                <v-radio label="Yes" value="Yes" />
                <v-radio label="No" value="No" />
                </v-radio-group>
            </v-card>

        </v-form>

      </div>
    </v-sheet>
    <div class="nav">
       <v-btn
        color="primary"
        size="large"
        variant="elevated"
        append-icon="mdi-arrow-right"
        @click="currentStep++; postuserBackgroundInfo()"
      >
        Next
      </v-btn>
    </div>
  </v-container>
</template>

<script setup>
import { reactive, ref } from 'vue'
import {questionnaireUserBackgroundInfo} from '@/services/backend.calls.js'
const background_info = reactive({
  datavis: null,
  ml: null,
  decision: null,
})

const valid = ref(false)

const postuserBackgroundInfo = async ()=>{
    console.log("Posting background info:", background_info)
    const response = await questionnaireUserBackgroundInfo(background_info)
    let session_id = response.session_id
    console.log("Received session ID:", session_id)
}
</script>

<style scoped>
.background-container {
  min-height: 100vh;
  padding: 16px;
}

.background-sheet {
  width: 100%;
  max-height: 100vh;
  padding: clamp(16px, 4vw, 48px);
  overflow-y: auto;
}

.content {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

/* Compact radio buttons */
.radio-group {
  gap: 12px;          /* Reduce spacing between radio buttons */
  flex-wrap: wrap;     /* Wrap on small screens */
  margin-top: 8px;     /* Tighten vertical spacing */
}
.nav {
  position: fixed;
  bottom: 24px;
  right: 24px;
}
</style>
