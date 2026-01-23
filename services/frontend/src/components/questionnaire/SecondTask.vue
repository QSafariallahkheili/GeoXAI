<template>
  <v-container fluid class="task-container d-flex align-center justify-center">
    <v-sheet max-width="1000" rounded="xl" elevation="2" class="pa-6">
      <!-- SUBTASK 0: INTRO -->
        <div v-if="subStep === 0">
            <h1 class="text-h5 font-weight-bold mb-4">Task Type 2</h1>
            <p class="mb-4">

                This task involves interpreting bivariate maps that show the relationship between two variables.

            </p>
            <p class="mb-4">

                The variables represented are <strong>feature</strong> and its <strong>SHAP value</strong> (feature impact on prediction).

            </p>
            
            <p class="mb-4">
                For each map, you will answer one or more questions.
            </p>
            <p class="mb-4">
                Please answer as <strong>accurately</strong> and as <strong>quickly</strong> as possible.
            </p>

        </div>
         <!-- SUBTASK 1: GRID ONLY -->
        <div v-if="subStep === 1">
        
            <p>
               Task 2.1.Highlight the area with: Highest feature value (LST) and Lowest SHAP contribution
            </p>

            <div class="map-grid-wrapper">
                <!-- MAP IMAGE -->
                <img
                    src='task_images/bivariate_choropleth.png'
                    class="map-image"
                />

                <!-- GRID OVERLAY -->
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
            <p class="mb-2 mt-2">
                How confusing was it to identify the area (rating 1-7)?
            </p>
            <div>
                <v-slider
                    v-model="answers.confusion"
                    min="1"
                    max="7"
                    step="1"
                    tick-size="4"
                    show-ticks="always"
                    hide-details
                >
                    <template #append>
                        <span class="ml-3 font-weight-medium">
                            {{ answers.confusion }}
                        </span>
                    </template>
                </v-slider>
            </div>
            <p class="mb-2 mt-2">
                How visually appealing do you find this map?
            </p>
            <div>
                <v-slider
                    v-model="answers.appeal"
                    min="1"
                    max="7"
                    step="1"
                    tick-size="4"
                    show-ticks="always"
                    hide-details
                >
                    <template #append>
                        <span class="ml-3 font-weight-medium">
                            {{ answers.appeal }}
                        </span>
                    </template>
                </v-slider>
            </div>
            

        </div>
         <!-- SUBTASK 2: GRID ONLY -->
        <div v-if="subStep === 2">
        
            <p>
               Task 2.1.Highlight the area with: Highest feature value (LST) and Lowest SHAP contribution
            </p>

            <div class="map-grid-wrapper">
                <!-- MAP IMAGE -->
                <img
                    src='task_images/bivariate_proportional.png'
                    class="map-image"
                />

                <!-- GRID OVERLAY -->
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
            <p class="mb-2 mt-2">
                How confusing was it to identify the area (rating 1-7)?
            </p>
            <div>
                <v-slider
                    v-model="answers.confusion"
                    min="1"
                    max="7"
                    step="1"
                    tick-size="4"
                    show-ticks="always"
                    hide-details
                >
                    <template #append>
                        <span class="ml-3 font-weight-medium">
                            {{ answers.confusion }}
                        </span>
                    </template>
                </v-slider>
            </div>
            <p class="mb-2 mt-2">
                How visually appealing do you find this map?
            </p>
            <div>
                <v-slider
                    v-model="answers.appeal"
                    min="1"
                    max="7"
                    step="1"
                    tick-size="4"
                    show-ticks="always"
                    hide-details
                >
                    <template #append>
                        <span class="ml-3 font-weight-medium">
                            {{ answers.appeal }}
                        </span>
                    </template>
                </v-slider>
            </div>
            

        </div>
         <!-- SUBTASK 3: GRID ONLY -->
        <div v-if="subStep === 3">
        
            <p>
               Task 2.1.Highlight the area with: Lowest feature value (NDVI) and Lowest SHAP contribution
            </p>

            <div class="map-grid-wrapper">
                <!-- MAP IMAGE -->
                <img
                    src='task_images/bivariate_choropleth2.png'
                    class="map-image"
                />

                <!-- GRID OVERLAY -->
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
            <p class="mb-2 mt-2">
                How confusing was it to identify the area (rating 1-7)?
            </p>
            <div>
                <v-slider
                    v-model="answers.confusion"
                    min="1"
                    max="7"
                    step="1"
                    tick-size="4"
                    show-ticks="always"
                    hide-details
                >
                    <template #append>
                        <span class="ml-3 font-weight-medium">
                            {{ answers.confusion }}
                        </span>
                    </template>
                </v-slider>
            </div>
            <p class="mb-2 mt-2">
                How visually appealing do you find this map?
            </p>
            <div>
                <v-slider
                    v-model="answers.appeal"
                    min="1"
                    max="7"
                    step="1"
                    tick-size="4"
                    show-ticks="always"
                    hide-details
                >
                    <template #append>
                        <span class="ml-3 font-weight-medium">
                            {{ answers.appeal }}
                        </span>
                    </template>
                </v-slider>
            </div>
            

        </div>
         <!-- SUBTASK 3: GRID ONLY -->
        <div v-if="subStep === 4">
        
            <p>
               Task 2.1.Highlight the area with: Lowest feature value (NDVI) and Lowest SHAP contribution
            </p>

            <div class="map-grid-wrapper">
                <!-- MAP IMAGE -->
                <img
                    src='task_images/bivariate_choropleth_uncertainty.png'
                    class="map-image"
                />

                <!-- GRID OVERLAY -->
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
            <p class="mb-2 mt-2">
                How confusing was it to identify the area (rating 1-7)?
            </p>
            <div>
                <v-slider
                    v-model="answers.confusion"
                    min="1"
                    max="7"
                    step="1"
                    tick-size="4"
                    show-ticks="always"
                    hide-details
                >
                    <template #append>
                        <span class="ml-3 font-weight-medium">
                            {{ answers.confusion }}
                        </span>
                    </template>
                </v-slider>
            </div>
            <p class="mb-2 mt-2">
                How visually appealing do you find this map?
            </p>
            <div>
                <v-slider
                    v-model="answers.appeal"
                    min="1"
                    max="7"
                    step="1"
                    tick-size="4"
                    show-ticks="always"
                    hide-details
                >
                    <template #append>
                        <span class="ml-3 font-weight-medium">
                            {{ answers.appeal }}
                        </span>
                    </template>
                </v-slider>
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
      >
      {{ isLastSubStep ? 'Finish Task' : 'Next' }}
      </v-btn>
    </div>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useQuestionnaireStore } from '../../stores/questionnaire'
import {questionnaireTaskOne, completeTask} from '@/services/backend.calls.js'


const subStep = ref(0)
const selectedIndex = ref(null)
const taskResponses = ref([])
const subtaskStartTime = ref(performance.now())
let {session_id, currentStep, progress} = storeToRefs(useQuestionnaireStore());


const isLastSubStep = computed(() => subStep.value === 4)
const answers = reactive({
    region: null,
    confusion: 4,
    appeal: 4,
    time_ms: null,
})
const subtasks = [
  {
    id: 'task_2_1',
    map: 'bivariate_choropleth',
    correctRegions: [23],
  },
  {
    id: 'task_2_2',
    map: 'bivariate_proportional',
   correctRegions: [61],
  },
  {
    id: 'task_2_3',
    map: 'bivariate_choropleth2',
    correctRegions: [64, 65, 96],
  },
  {
    id: 'task_2_4',
    map: 'bivariate_choropleth_uncertainty',
    correctRegions: [53,54,63,64,73,75, 83,85,94,95],
  }
]

watch(subStep, () => {
  subtaskStartTime.value = performance.now()
})
const resetAnswers = () => {
  answers.region = null
  answers.confusion = 4
  answers.appeal = 4
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
    await completeTask(true, session_id.value)
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


</style>
