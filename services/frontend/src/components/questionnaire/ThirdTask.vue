<template>
  <v-container fluid class="task-container d-flex align-center justify-center">
    <v-sheet max-width="1000" rounded="xl" elevation="2" class="pa-3">
      <!-- SUBTASK 0: INTRO -->
        <div v-if="subStep === 0">
            <h1 class="text-h5 font-weight-bold mb-4">{{ $t("task3.title") }}</h1>
            <p class="mb-4">
                {{ $t("task3.instruction1") }}
            </p>
            <p class="mb-4">
                {{ $t("task3.instruction2") }}
            </p>
            <p class="mb-4">
                 {{ $t("task3.instruction3") }}
            </p>
            <p class="mb-4">
                 {{ $t("task3.instruction4") }}
            </p>
        </div>

        <!-- SUBTASK 1: 2x2 MAP GRID WITH RADIO SELECTION -->
        <div v-if="subStep === 1">

            <p>{{ $t("task3.title1") }}</p>

            <!-- 2x2 Map Grid -->
            <div class="maps-grid">
                <div
                  v-for="map in maps"
                  :key="map.key"
                  class="map-card"
                  :class="{ 'map-card--selected': selectedMap === map.key }"
                  @click="selectedMap = map.key"
                >
                    <!-- Radio button + label row -->
                    <div class="map-card-header">
                        <v-radio-group v-model="selectedMap" hide-details inline>
                            <v-radio
                              :value="map.key"
                              :label="$t(map.key)"
                              color="primary"
                             
                            />
                        </v-radio-group>
                    </div>

                    <!-- Map image -->
                    <div class="map-wrapper">
                        <img
                            :src="'task_images/' + map.file"
                            class="map-image"
                            :alt="map.key"
                        />
                    </div>
                </div>
            </div>

            <!-- Shared Legend -->
            <div class="legend-wrapper">
                <img
                    src="task_images/shap_legend.png"
                    class="legend-image"
                    alt="SHAP Legend"
                />
            </div>

            <!-- Sliders -->
            <div class="slider-wrapper">
                <!-- Confusion slider -->
                <div class="slider-container">
                    <div class="slider-top-row">
                        <span class="slider-title">{{ $t("task1.task1-confusing-title") }}</span>
                        <span class="slider-label-right">{{ $t("task1.task1-confusing-high") }}</span>
                    </div>
                    <v-slider
                        v-model="answers.confusion"
                        min="1"
                        max="7"
                        step="1"
                        tick-size="4"
                        show-ticks="always"
                        hide-details
                    ></v-slider>
                    <div class="slider-bottom-row">
                        <span class="slider-label-left">{{ $t("task1.task1-confusing-low") }}</span>
                    </div>
                </div>

                <!-- Appeal slider -->
                <div class="slider-container">
                    <div class="slider-top-row">
                        <span class="slider-title">{{ $t("task1.task1-appealing-title") }}</span>
                        <span class="slider-label-right">{{ $t("task1.task1-appealing-high") }}</span>
                    </div>
                    <v-slider
                        v-model="answers.appeal"
                        min="1"
                        max="7"
                        step="1"
                        tick-size="4"
                        show-ticks="always"
                        hide-details
                    ></v-slider>
                    <div class="slider-bottom-row">
                        <span class="slider-label-left">{{ $t("task1.task1-appealing-low") }}</span>
                    </div>
                </div>
            </div>

        </div>
        <div v-if="subStep === 2"> 
            <p>
               {{ $t("task3.task3-title2") }}
            </p>

            <!-- Map + Legend -->
            <div class="map-legend-container">
                <!-- Map -->
                <div class="map-wrapper-single">
                    <img
                        src="task_images/wildfire.png"
                        class="map-image-1"
                    />
                    <div class="grid-overlay">
                    <div
                        v-for="(cell, index) in 100"
                        :key="index"
                        class="grid-cell"
                    ></div>
                    </div>
                </div>
                

                
            </div>
            <div >
                <img
                    src="task_images/shap_chart.png"
                    class="shap-chart"
                    />
            </div>
            <div class="quiz-section">
        

    
        </div>
            <div class="slider-wrapper">
                <!-- Q1: Most increasing -->
            <p class="quiz-question">Please choose one option below:</p>
            <div class="mb-2">
                <v-radio-group v-model="selectedMap" inline >
                    <v-radio label="Drought Index" value="Drought Index"></v-radio>
                    <v-radio label="NDVI" value="NDVI"></v-radio>
                    <v-radio label="Sun Radiation" value="Sun Radiation"></v-radio>
                    <v-radio label="Aspect" value="Aspect"></v-radio>
                </v-radio-group>
            </div>
            
                <!-- Confusion slider -->
                <div class="slider-container">
                    <!-- Top row: title left, right label top-right -->
                    <div class="slider-top-row">
                    <span class="slider-title">{{ $t("task1.task1-confusing-title") }}</span>
                    <span class="slider-label-right">{{ $t("task1.task1-confusing-high") }}</span>
                    </div>

                    <!-- Slider itself -->
                    <v-slider
                    v-model="answers.confusion"
                    min="1"
                    max="7"
                    step="1"
                    tick-size="4"
                    show-ticks="always"
                    hide-details
                    ></v-slider>

                    <!-- Bottom row: left label -->
                    <div class="slider-bottom-row">
                    <span class="slider-label-left">{{ $t("task1.task1-confusing-low") }}</span>
                    </div>
                </div>

                <!-- Appeal slider -->
                <div class="slider-container">
                    <div class="slider-top-row">
                    <span class="slider-title">{{ $t("task1.task1-appealing-title") }}</span>
                    <span class="slider-label-right">{{ $t("task1.task1-appealing-high") }}</span>
                    </div>

                    <v-slider
                    v-model="answers.appeal"
                    min="1"
                    max="7"
                    step="1"
                    tick-size="4"
                    show-ticks="always"
                    hide-details
                    ></v-slider>

                    <div class="slider-bottom-row">
                    <span class="slider-label-left">{{ $t("task1.task1-appealing-low") }}</span>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="subStep === 3"> 
            <p>
               {{ $t("task3.task3-title3") }}
            </p>

            <!-- Map + Legend -->
            <div class="map-legend-container">
                <!-- Map -->
                <div class="map-wrapper-single">
                    <img
                        src="task_images/wildfire1.png"
                        class="map-image-1"
                    />
                    <div class="grid-overlay">
                    <div
                        v-for="(cell, index) in 100"
                        :key="index"
                        class="grid-cell"
                    ></div>
                    </div>
                </div>
                

                
            </div>
            <div >
                <img
                    src="task_images/shap_chart1.png"
                    class="shap-chart"
                    />
            </div>
            
            <div class="slider-wrapper">
                <div class="quiz-section mb-4">
                <p class="quiz-question">Which of the following statements is correct?</p>
                    <div class="radio-col">
                    <label v-for="(q, index) in shapQuestions" :key="index" class="radio-option">
                        <input type="radio" name="shapQuestion" :value="index" v-model="selectedMap" />
                        {{ q.text }}
                    </label>
                </div>
                
                </div>
                <!-- Confusion slider -->
                <div class="slider-container">
                    <!-- Top row: title left, right label top-right -->
                    <div class="slider-top-row">
                    <span class="slider-title">{{ $t("task1.task1-confusing-title") }}</span>
                    <span class="slider-label-right">{{ $t("task1.task1-confusing-high") }}</span>
                    </div>

                    <!-- Slider itself -->
                    <v-slider
                        v-model="answers.confusion"
                        min="1"
                        max="7"
                        step="1"
                        tick-size="4"
                        show-ticks="always"
                        hide-details
                    ></v-slider>

                    <!-- Bottom row: left label -->
                    <div class="slider-bottom-row">
                    <span class="slider-label-left">{{ $t("task1.task1-confusing-low") }}</span>
                    </div>
                </div>

                <!-- Appeal slider -->
                <div class="slider-container">
                    <div class="slider-top-row">
                    <span class="slider-title">{{ $t("task1.task1-appealing-title") }}</span>
                    <span class="slider-label-right">{{ $t("task1.task1-appealing-high") }}</span>
                    </div>

                    <v-slider
                    v-model="answers.appeal"
                    min="1"
                    max="7"
                    step="1"
                    tick-size="4"
                    show-ticks="always"
                    hide-details
                    ></v-slider>

                    <div class="slider-bottom-row">
                    <span class="slider-label-left">{{ $t("task1.task1-appealing-low") }}</span>
                    </div>
                </div>
            </div>
        </div>

    </v-sheet>

    <!-- NAVIGATION -->
    <div class="nav">
      <v-btn
        color="primary"
        size="large"
        variant="elevated"
        append-icon="mdi-arrow-right"
        @click="nextSubStep"
        :disabled="subStep > 0 && selectedMap === null"
      >
      {{ isLastSubStep ? $t("buttons.finish") : $t("buttons.next") }}
      </v-btn>
    </div>
  </v-container>
</template>

<script setup>
import { ref,watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useQuestionnaireStore } from '../../stores/questionnaire'
import { completeTask, questionnaireTaskOne } from '@/services/backend.calls.js'
import { useI18n } from 'vue-i18n'

let {session_id, currentStep} = storeToRefs(useQuestionnaireStore());


const subStep = ref(0)
const selectedMap = ref(null)
const answers = ref({ confusion: null, appeal: null })
const subtaskStartTime = ref(performance.now())
const taskResponses = ref([])
//let selectedAnswer=ref(null)
const { t } = useI18n()
let shapQuestions = [
    { text: t("task3.shap-option1") },
    { text: t("task3.shap-option2") },
    { text: t("task3.shap-option3") },
    { text: t("task3.shap-option4") },
]
watch(subStep, () => {
  subtaskStartTime.value = performance.now()
})
const maps = [
  { key: 'Drought Index', file: 'shap_drought_index.png' },
  { key: 'Digital Elevation Model', file: 'shap_dem.png'},
  { key: 'Land Surface Temperature', file: 'shap_lst.png'},
  { key: 'Vegetation Index',file: 'shap_ndvi.png'},
]

const nextSubStep = async() =>  {
  // Only save payload for real subtasks
  const duration = performance.now() - subtaskStartTime.value
    selectedMap.value = null
    answers.value.confusion = 0
    answers.value.appeal = 0
    
  if (subStep.value >= 0) {
    subStep.value++
    
  }
  if (subStep.value == 2){
    const payload = {
        task_id: 'task_3',
        subtask_id: 'task_3_1',
        response: {
            region_index: selectedMap.value,
            confusion: answers.value.confusion,
            appeal: answers.value.appeal,
        },

        correct_region_index: "Vegetation Index",
        is_correct: "Vegetation Index" === selectedMap.value,

        time_ms: Math.round(duration),
        timestamp: new Date().toISOString(),
    }

    taskResponses.value.push(payload)
    console.log("Task 3 payload:", taskResponses.value)
  }
  if (subStep.value == 3) {
    console.log(duration, "time spent")
    console.log("Selected map:", selectedMap.value)
    const payload = {
        task_id: 'task_3',
        subtask_id: 'task_3_2',
        response: {
        region_index: selectedMap.value,
        confusion: answers.value.confusion,
        appeal: answers.value.appeal,
        },

        correct_region_index: "NDVI",
        is_correct: "NDVI" === selectedMap.value,

        time_ms: Math.round(duration),
        timestamp: new Date().toISOString(),
    }

        taskResponses.value.push(payload)
        console.log("Task 3 payload:", taskResponses.value)
    
    
  }
  if (subStep.value == 4) {

    console.log("Selected map:", selectedMap.value)
    const payload = {
        task_id: 'task_3',
        subtask_id: 'task_3_3',
        response: {
        region_index: selectedMap.value,
        confusion: answers.value.confusion,
        appeal: answers.value.appeal,
        },

        correct_region_index: 1,
        is_correct: 1 === selectedMap.value,

        time_ms: Math.round(duration),
        timestamp: new Date().toISOString(),
    }

        taskResponses.value.push(payload)
        console.log("Task 3 payload:", taskResponses.value)
        currentStep.value++
    
        await questionnaireTaskOne(taskResponses.value, session_id.value)

        await completeTask(true, session_id.value)
  }

  
}
</script>

<style scoped>
.task-container {
  min-height: 100vh;
  padding: 16px;
}

.nav {
  position: fixed;
  bottom: 15px;
  right: 15px;
}

/* ── 2×2 map grid ── */
.maps-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 16px 0;
}
.grid-cell.selected {
  border: 2px solid #1976d2; /* visible grid line */
  background: rgba(25, 118, 210, 0.15);
}

/* Individual map card */
.map-card {
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 8px;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
}

.map-card:hover {
  border-color: #90caf9;
  background-color: rgba(25, 118, 210, 0.04);
}

.map-card--selected {
  border-color: #1976d2;
  background-color: rgba(25, 118, 210, 0.08);
}

.map-card-header {
  margin-bottom: 6px;
}

.map-wrapper {
  width: 100%;
  max-width: 250px;  /* adjust this value */
  aspect-ratio: 1 / 1;
  margin: 0 auto;
}
.map-wrapper-single {
  width: 100%;
  max-width: 550px;  /* adjust this value */
  aspect-ratio: 1 / 1;
  margin: 0 auto;
}
/* Map + Legend Container */
.map-legend-container {
  display: flex;
  flex-direction: row;
  gap: 16px;
  align-items: flex-end; /* align legend to bottom of map */
  margin: 16px 0;
}

.map-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 6px;
}


/* ── Shared legend ── */
.legend-wrapper {
  display: flex;
  justify-content: center;
  margin: 8px 0 16px;
}

.legend-image {
  max-width: 330px;
  width: 80%;
  height: auto;
  display: block;
}

/* ── Sliders ── */
.slider-wrapper {
  max-width: 800px;
  width: 90%;
  margin: 16px auto;
}

.slider-container {
  position: relative;
  margin-bottom: 10px;
}

.slider-top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.slider-bottom-row {
  display: flex;
  justify-content: flex-start;
  margin-top: 2px;
}

/* ── Responsive ── */
@media (max-width: 600px) {
  .maps-grid {
    grid-template-columns: 1fr;
  }

  .legend-image {
    width: 100%;
  }
}
.radio-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.radio-option {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}
.map-image-1 {
  width: 100%;
  height: auto;          /* was 100% — let height follow naturally */
  object-fit: contain;   /* was cover — avoids cropping on small screens */
  display: block;
  border-radius: 6px;
}

.shap-chart {
  width: 100%;
  max-width: 550px;      /* matches map-wrapper-single */
  height: auto;
  display: block;
  border-radius: 6px;
  margin: 12px auto;     /* centers it like the map */
}
.map-wrapper-single {
  width: 100%;
  max-width: 550px;
  margin: 0 auto;
  /* removed aspect-ratio: 1 / 1 */
}
</style>