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
          {{ $t("background.title") }}
        </h1>

        <v-form ref="form" v-model="valid" lazy-validation>

          <!-- B1. GIS / Cartography Experience -->
          <v-card variant="tonal" class="pa-4 mb-4">
                <h2 class="text-h6 font-weight-medium mb-2">
                {{ $t("background.b1-title") }}
                </h2>
                <p class="mb-2">
                {{ $t("background.b1-subtitle") }}
                </p>

                <v-radio-group
                v-model="background_info.datavis"
                inline
                class="radio-group"
                column
                >
                <v-radio :label="$t('background.b1-option1')" value="None" />
                <v-radio :label="$t('background.b1-option2')" value="Basic" />
                <v-radio :label="$t('background.b1-option3')" value="Intermediate" />
                <v-radio :label="$t('background.b1-option4')" value="Advanced" />
                <v-radio :label="$t('background.b1-option5')" value="Expert" />
                </v-radio-group>
            </v-card>

            <!-- B2. ML -->
            <v-card variant="tonal" class="pa-4 mb-4">
                <h2 class="text-h6 font-weight-medium mb-2">
                {{ $t("background.b2-title") }}
                </h2>
                <p class="mb-2">
                {{ $t("background.b2-subtitle") }}
                </p>

                <v-radio-group
                v-model="background_info.ml"
                inline
                class="radio-group"
                column
                >
                <v-radio :label="$t('background.b2-option1')" value="Not at all" />
                <v-radio :label="$t('background.b2-option2')" value="Slightly familiar" />
                <v-radio :label="$t('background.b2-option3')" value="Moderately familiar" />
                <v-radio :label="$t('background.b2-option4')" value="Very familiar" />
                <v-radio :label="$t('background.b2-option5')" value="Expert" />
                </v-radio-group>
            </v-card>

            <!-- B3. Decision-Making -->
            <v-card variant="tonal" class="pa-4 mb-4" >
                <h2 class="text-h6 font-weight-medium mb-2">
                {{ $t("background.b3-title") }}
                </h2>
                <p class="mb-2">
                {{ $t("background.b3-subtitle") }}
                </p>

                <v-radio-group
                v-model="background_info.decision"
                inline
                class="radio-group"
                >
                <v-radio :label="$t('background.b3-option1')" value="Yes" />
                <v-radio :label="$t('background.b3-option2')" value="No" />
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
        {{ $t("buttons.next") }}
      </v-btn>
    </div>
  </v-container>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'

import { useQuestionnaireStore } from '../../stores/questionnaire'
let {currentStep, session_id} = storeToRefs(useQuestionnaireStore());
import {questionnaireUserBackgroundInfo} from '@/services/backend.calls.js'
const background_info = reactive({
  datavis: null,
  ml: null,
  decision: null,
})

const valid = ref(false)

const postuserBackgroundInfo = async ()=>{
    console.log("Posting background info:", background_info)
    const response = await questionnaireUserBackgroundInfo(background_info, session_id.value)
    console.log(response, "Background info saved response")
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
  bottom: 15px;
  right: 15px;
}
</style>
