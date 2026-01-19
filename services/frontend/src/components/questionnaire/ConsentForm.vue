<template>
  <v-container fluid class="d-flex justify-center">
    <v-sheet
      max-width="900"
      rounded="xl"
      elevation="2"
      class="pa-6 pa-md-8"
    >
      <!-- HEADER -->
      <div class="text-center mb-6">
        <v-icon size="36" color="primary" class="mb-2">
          mdi-shield-check
        </v-icon>
        <h1 class="text-h5 font-weight-bold">
          Informed Consent
        </h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          Please read carefully before continuing
        </p>
      </div>

      <!-- CONTENT -->
      <v-card
        variant="outlined"
        rounded="lg"
        class="pa-4 pa-md-6 mb-6"
      >
        <p class="mb-4">
          You are invited to participate in a research study conducted as part of a
          doctoral dissertation entitled:
        </p>

        <p class="font-italic text-medium-emphasis mb-4">
          “Towards Transparent Geospatial AI: Investigating Strategies and Techniques
          for Explainability and Trustworthiness in AI-Driven Geospatial Decision-Making.”
        </p>

        <v-divider class="my-4" />

        <p class="mb-3 font-weight-medium">
          By participating in this study, you acknowledge that:
        </p>

        <ul class="consent-list">
          <li>Your participation is voluntary and you may withdraw at any time.</li>
          <li>Your responses will be used exclusively for scientific research.</li>
          <li>All collected data will be processed and published in anonymized form.</li>
          <li>No personally identifiable information will be collected.</li>
          <li>The content of your responses will not be altered or falsified.</li>
        </ul>

        <v-divider class="my-4" />

        <p class="text-body-2 text-medium-emphasis">
          By providing your consent, you agree to participate in this study.
        </p>
      </v-card>

      <!-- CONSENT ACTION -->
      <v-card
        rounded="lg"
        variant="tonal"
        color="primary"
        class="pa-4 d-flex align-center justify-space-between flex-wrap"
      >
        <v-checkbox
          v-model="consentGiven"
          hide-details
          density="comfortable"
        >
          <template #label>
            <span class="font-weight-medium">
              I consent to participate in this study
            </span>
          </template>
        </v-checkbox>

        <v-btn
          color="primary"
          size="large"
          class="mt-3 mt-sm-0"
          :disabled="!consentGiven"
          @click=" applyConsent()"
        >
          Continue
          <v-icon end>mdi-arrow-right</v-icon>
        </v-btn>
      </v-card>
    </v-sheet>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'

import { useQuestionnaireStore } from '../../stores/questionnaire'
import { saveConsentToDatabase } from '@/services/backend.calls.js'
let {currentStep} = storeToRefs(useQuestionnaireStore());
let {session_id} = storeToRefs(useQuestionnaireStore());

const consentGiven = ref(false)
const applyConsent = async () => {
  if (consentGiven.value) {
    const response = await saveConsentToDatabase(consentGiven.value)
    session_id.value = response.session_id
    console.log("Consent saved, session ID:", session_id.value)
    currentStep.value++;
  }
}
</script>

<style scoped>
.consent-list {
  padding-left: 1.2rem;
}

.consent-list li {
  margin-bottom: 0.6rem;
  line-height: 1.6;
}
</style>
