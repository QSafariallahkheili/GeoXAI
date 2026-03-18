<template>
  <v-container fluid class="task-container d-flex align-center justify-center">
    <v-sheet max-width="1000" rounded="xl" elevation="2" class="pa-3">
      <!-- SUBTASK 0: INTRO -->
        <div v-if="subStep === 0">
            <h1 class="text-h5 font-weight-bold mb-4">{{ $t("task2.title") }}</h1>
            <p class="mb-4">

                {{ $t("task2.instruction1") }}

            </p>
            <p class="mb-4">

                {{ $t("task2.instruction2") }}

            </p>
            
            <p class="mb-4">
                 {{ $t("task2.instruction3") }}
            </p>
            <p class="mb-4">
                 {{ $t("task2.instruction4") }}
            </p>

        </div>
         <!-- SUBTASK 1: GRID ONLY -->
        <div v-if="subStep === 1">
        
            <p>{{ $t("task2.task2-title1") }}</p>

           
            <!-- Map + Legend -->
            <div class="map-legend-container">
                <!-- Map -->
                <div class="map-wrapper">
                    <img
                        src="task_images/bivariate_choropleth1.png"
                        class="map-image"
                    />
                    <div class="grid-overlay">
                        <div
                        v-for="(cell, index) in 100"
                        :key="index"
                        class="grid-cell"
                        :class="{ selected: selectedIndex === index }"
                        @click="handleCellClick(index)"
                        ></div>
                    </div>
                </div>

                <!-- Legend -->
                <div class="legend-wrapper">
                <img
                    src="task_images/bivariate_choropleth_legend.png"
                    class="legend-image"
                    alt="Legend"
                />
                </div>
            </div>
            <div class="slider-wrapper">
                <!-- Confusion slider -->
                <div class="slider-container">
                    <!-- Top row: title left, right label top-right -->
                    <div class="slider-top-row">
                    <span class="slider-title">{{ $t("task1.task1-confusing-title") }}</span>
                    <span class="slider-label-right">{{ $t("task1.task1-confusing-low") }}</span>
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
                    <span class="slider-label-left">{{ $t("task1.task1-confusing-high") }}</span>
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
         <!-- SUBTASK 2: GRID ONLY -->
        <div v-if="subStep === 2">
        
            <p>
               {{ $t("task2.task2-title2") }}
            </p>

            <!-- Map + Legend -->
            <div class="map-legend-container">
                <!-- Map -->
                <div class="map-wrapper">
                    <img
                        src="task_images/bivariate_proportional1.png"
                        class="map-image"
                    />
                    <div class="grid-overlay">
                        <div
                        v-for="(cell, index) in 100"
                        :key="index"
                        class="grid-cell"
                        :class="{ selected: selectedIndex === index }"
                        @click="handleCellClick(index)"
                        ></div>
                    </div>
                </div>

                <!-- Legend -->
                <div class="legend-wrapper">
                <img
                    src="task_images/bivariate_proportional_legend.png"
                    class="legend-image"
                    alt="Legend"
                />
                </div>
            </div>
            <div class="slider-wrapper">
                <!-- Confusion slider -->
                <div class="slider-container">
                    <!-- Top row: title left, right label top-right -->
                    <div class="slider-top-row">
                    <span class="slider-title">{{ $t("task1.task1-confusing-title") }}</span>
                    <span class="slider-label-right">{{ $t("task1.task1-confusing-low") }}</span>
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
                    <span class="slider-label-left">{{ $t("task1.task1-confusing-high") }}</span>
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
         <!-- SUBTASK 3: GRID ONLY -->
        <div v-if="subStep === 3">
        
            <p>
               {{ $t("task2.task2-title3") }}
            </p>

            <!-- Map + Legend -->
            <div class="map-legend-container">
                <!-- Map -->
                <div class="map-wrapper">
                    <img
                        src="task_images/bivariate_choropleth2.png"
                        class="map-image"
                    />
                    <div class="grid-overlay">
                        <div
                        v-for="(cell, index) in 100"
                        :key="index"
                        class="grid-cell"
                        :class="{ selected: selectedIndex === index }"
                        @click="handleCellClick(index)"
                        ></div>
                    </div>
                </div>

                <!-- Legend -->
                <div class="legend-wrapper">
                <img
                    src="task_images/bivariate_choropleth_legend.png"
                    class="legend-image"
                    alt="Legend"
                />
                </div>
            </div>
            <div class="slider-wrapper">
                <!-- Confusion slider -->
                <div class="slider-container">
                    <!-- Top row: title left, right label top-right -->
                    <div class="slider-top-row">
                    <span class="slider-title">{{ $t("task1.task1-confusing-title") }}</span>
                    <span class="slider-label-right">{{ $t("task1.task1-confusing-low") }}</span>
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
                    <span class="slider-label-left">{{ $t("task1.task1-confusing-high") }}</span>
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
         <!-- SUBTASK 3: GRID ONLY -->
        <div v-if="subStep === 4">
        
            <p>
               {{ $t("task2.task2-title4") }}
            </p>

            <!-- Map + Legend -->
            <div class="map-legend-container">
                <!-- Map -->
                <div class="map-wrapper">
                    <img
                        src="task_images/bivariate_choropleth_uncertainty1.png"
                        class="map-image"
                    />
                    <div class="grid-overlay">
                        <div
                        v-for="(cell, index) in 100"
                        :key="index"
                        class="grid-cell"
                        :class="{ selected: selectedIndex === index }"
                        @click="handleCellClick(index)"
                        ></div>
                    </div>
                </div>

                <!-- Legend -->
                <div class="legend-wrapper">
                <img
                    src="task_images/bivariate_choropleth_uncertainty_legend.png"
                    class="legend-image"
                    alt="Legend"
                />
                </div>
            </div>
            <div class="slider-wrapper">
                <!-- Confusion slider -->
                <div class="slider-container">
                    <!-- Top row: title left, right label top-right -->
                    <div class="slider-top-row">
                    <span class="slider-title">{{ $t("task1.task1-confusing-title") }}</span>
                    <span class="slider-label-right">{{ $t("task1.task1-confusing-low") }}</span>
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
                    <span class="slider-label-left">{{ $t("task1.task1-confusing-high") }}</span>
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
        :disabled="subStep > 0 && answers.region === null"
      >
      {{ isLastSubStep ? $t("buttons.finish") : $t("buttons.next") }}
      </v-btn>
    </div>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuestionnaireStore } from '../../stores/questionnaire'
import {questionnaireTaskOne} from '@/services/backend.calls.js'


const subStep = ref(0)
const selectedIndex = ref(null)
const taskResponses = ref([])
const subtaskStartTime = ref(performance.now())
let {session_id, currentStep, progress} = storeToRefs(useQuestionnaireStore());


const isLastSubStep = computed(() => subStep.value === 4)
const answers = reactive({
    region: null,
    confusion: 0,
    appeal: 0,
    time_ms: null,
})
const subtasks = [
  {
    id: 'task_2_1',
    map: 'bivariate_choropleth',
    correctRegions: [34],
  },
  {
    id: 'task_2_2',
    map: 'bivariate_proportional',
   correctRegions: [78],
  },
  {
    id: 'task_2_3',
    map: 'bivariate_choropleth2',
    correctRegions: [83],
  },
  {
    id: 'task_2_4',
    map: 'bivariate_choropleth_uncertainty',
    correctRegions: [15,16,26,36],
  }
]

watch(subStep, () => {
  subtaskStartTime.value = performance.now()
})
const resetAnswers = () => {
  answers.region = null
  answers.confusion = 0
  answers.appeal = 0
  answers.time_ms = null
  selectedIndex.value = null
}
const nextSubStep = async() => {
  const duration = performance.now() - subtaskStartTime.value

  // Only save payload for real subtasks
  if (subStep.value > 0) {
    const subtask = subtasks[subStep.value - 1]

    const payload = {
      task_id: 'task_2',
      subtask_id: subtask.id,
      map_id: subtask.map,

      response: {
        region_index: answers.region,
        confusion: answers.confusion,
        appeal: answers.appeal,
      },

      correct_region_index: subtask.correctRegions,
      is_correct: subtask.correctRegions.includes(answers.region),

      time_ms: Math.round(duration),
      timestamp: new Date().toISOString(),
    }

    taskResponses.value.push(payload)
    console.log(taskResponses.value, "final taskResponses.value")
  }

  if (subStep.value === subtasks.length) {
    console.log('TASK COMPLETE → SEND TO BACKEND', taskResponses.value)
    // send taskResponses.value to API
    console.log("Session ID at final stage:", session_id.value)
    await questionnaireTaskOne(taskResponses.value, session_id.value)
    currentStep.value++
  } else {
    if(subStep.value > 0){
       progress.value++
    }
    subStep.value++
    
   
    resetAnswers()
  }
}
const handleCellClick = (index) => {
    selectedIndex.value = index
    answers.region = index
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
.map-grid-wrapper {
  position: relative;
  width: 100%;
  max-width: 500px;
  aspect-ratio: 1 / 1; /* square */
  margin: 16px auto;
}

/* Map image */
.map-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Grid overlay */
.grid-overlay {
  position: absolute;
  inset: 0;

  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: repeat(10, 1fr);

  pointer-events: auto; /* grid visible but not interactive */
  cursor: pointer;
}

.grid-cell {
  border: 1px solid transparent; /* hidden by default */
  cursor: pointer;
}

.grid-cell.selected {
  border: 2px solid #1976d2; /* visible grid line */
  background: rgba(25, 118, 210, 0.15);
}
/* Map + Legend Container */
.map-legend-container {
  display: flex;
  flex-direction: row;
  gap: 16px;
  align-items: flex-end; /* align legend to bottom of map */
  margin: 16px 0;
}

/* Map wrapper */
.map-wrapper {
  position: relative;
  flex: 1 1 250px; /* map takes available space */
  max-width: 460px; /* smaller than before to fit one page */
  max-height: 460px; /* responsive height, fits in viewport */
  aspect-ratio: 1 / 1; /* keeps map square */
}

.legend-wrapper {
  flex: 0 0 230px;   /* wider */
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-bottom: 0;
}

.legend-image {
  width: 100%;
  height: auto;
  display: block;
  max-height: 400px;  /* bigger than 200px */
}
/* Slider wrapper */
.slider-wrapper {
  max-width: 800px;
  width: 90%;
  margin: 16px auto;
}

/* Slider container */
.slider-container {
  position: relative;
  margin-bottom: 10px; /* reduce vertical spacing */
}

/* Top row: title + right label */
.slider-top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

/* Bottom row: left label */
.slider-bottom-row {
  display: flex;
  justify-content: flex-start;
  margin-top: 2px;
}

/* Responsive */
@media (max-width: 900px) {
  .map-legend-container {
    flex-direction: column;
    align-items: center;
  }

  .map-wrapper {
    max-width: 90vw;
    max-height: 90vw;
  }

  .legend-wrapper {
    width: 70%;
    margin-top: 12px;
    justify-content: flex-start;
  }
}


</style>
