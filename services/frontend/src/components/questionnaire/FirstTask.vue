<template>
  <v-container fluid class="task-container d-flex align-center justify-center">
    <v-sheet max-width="1000" rounded="xl" elevation="2" class="pa-6">
      <!-- SUBTASK 0: INTRO -->
        <div v-if="subStep === 0">
            <h1 class="text-h5 font-weight-bold mb-4">{{ $t("task1.title") }}</h1>
            <p class="mb-4">
                {{ $t("task1.instruction1") }}
            </p>
            <p class="mb-4">
                {{ $t("task1.instruction2") }}
            </p>
            <p class="mb-4">
                {{ $t("task1.instruction3") }}
            </p>

            <h2 class="text-h6 font-weight-medium">
            {{ $t("task1.task1-title") }}
            </h2>
            <p class="mb-4">
                {{ $t("task1.task1-subtitle") }}
            </p>
        </div>

       <!-- SUBTASK 1: GRID ONLY -->
        <div v-if="subStep === 1">
        
            <p>
               {{ $t("task1.task1-title1") }}
            </p>

            <div class="map-grid-wrapper">
                <!-- MAP IMAGE -->
                <img
                    src='task_images/uncertainty_fuzzy.png'
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
                {{ $t("task1.task1-confusing-title") }}
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
                    <!-- Left label -->
                    <template #prepend>
                        <span class="text-caption font-weight-medium">
                            {{ $t("task1.task1-confusing-low") }}
                        </span>
                        </template>

                        <!-- Right label -->
                        <template #append>
                        <span class="text-caption font-weight-medium">
                            {{ $t("task1.task1-confusing-high") }}
                        </span>
                    </template>
                </v-slider>
            </div>
            <p class="mb-2 mt-2">
                {{ $t("task1.task1-appealing-title") }}
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
                    <!-- Left label -->
                    <template #prepend>
                        <span class="text-caption font-weight-medium">
                        {{ $t("task1.task1-appealing-low") }}
                        </span>
                        </template>

                        <!-- Right label -->
                        <template #append>
                        <span class="text-caption font-weight-medium">
                            {{ $t("task1.task1-appealing-high") }}
                        </span>
                    </template>
                </v-slider>
            </div>
            

        </div>

        <!-- SUBTASK 2: QUESTION -->
        <div v-if="subStep === 2">
            
            <p>
               {{ $t("task1.task1-title2") }} 
            </p>

            <div class="map-grid-wrapper">
                <!-- MAP IMAGE -->
                <img
                    src='task_images/uncertainty_ink.png'
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
                    {{ $t("task1.task1-confusing-title") }}
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
                    <!-- Left label -->
                    <template #prepend>
                        <span class="text-caption font-weight-medium">
                            {{ $t("task1.task1-confusing-low") }}
                        </span>
                        </template>

                        <!-- Right label -->
                        <template #append>
                        <span class="text-caption font-weight-medium">
                            {{ $t("task1.task1-confusing-high") }}
                        </span>
                    </template>
                </v-slider>
            </div>
            <p class="mb-2 mt-2">
                {{ $t("task1.task1-appealing-title") }}
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
                    <!-- Left label -->
                    <template #prepend>
                        <span class="text-caption font-weight-medium">
                        {{ $t("task1.task1-appealing-low") }}
                        </span>
                        </template>

                        <!-- Right label -->
                        <template #append>
                        <span class="text-caption font-weight-medium">
                            {{ $t("task1.task1-appealing-high") }}
                        </span>
                    </template>
                </v-slider>
            </div>
        </div>

        <!-- SUBTASK 3: QUESTION -->
        <div v-if="subStep === 3">
            <p>
               {{ $t("task1.task1-title3") }} 
            </p>

            <div class="map-grid-wrapper">
                <!-- MAP IMAGE -->
                <img
                    src='task_images/uncertainty_pattern_width.png'
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
                    {{ $t("task1.task1-confusing-title") }}
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
                     <!-- Left label -->
                    <template #prepend>
                        <span class="text-caption font-weight-medium">
                            {{ $t("task1.task1-confusing-low") }}
                        </span>
                        </template>

                        <!-- Right label -->
                        <template #append>
                        <span class="text-caption font-weight-medium">
                            {{ $t("task1.task1-confusing-high") }}
                        </span>
                    </template>
                </v-slider>
            </div>
            <p class="mb-2 mt-2">
                {{ $t("task1.task1-appealing-title") }}
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
                    <!-- Left label -->
                    <template #prepend>
                        <span class="text-caption font-weight-medium">
                        {{ $t("task1.task1-appealing-low") }}
                        </span>
                        </template>

                        <!-- Right label -->
                        <template #append>
                        <span class="text-caption font-weight-medium">
                            {{ $t("task1.task1-appealing-high") }}
                        </span>
                    </template>
                </v-slider>
            </div>
        </div>
        <!-- SUBTASK 4: QUESTION -->
        <div v-if="subStep === 4">
            <p>
               {{ $t("task1.task1-title4") }} 
            </p>

            <div class="map-grid-wrapper">
                <!-- MAP IMAGE -->
                <img
                    src='task_images/uncertainty_pattern_orientation.png'
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
                   {{ $t("task1.task1-confusing-title") }}
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
                   <!-- Left label -->
                    <template #prepend>
                        <span class="text-caption font-weight-medium">
                            {{ $t("task1.task1-confusing-low") }}
                        </span>
                        </template>

                        <!-- Right label -->
                        <template #append>
                        <span class="text-caption font-weight-medium">
                            {{ $t("task1.task1-confusing-high") }}
                        </span>
                    </template>
                </v-slider>
            </div>
            <p class="mb-2 mt-2">
               {{ $t("task1.task1-appealing-title") }}
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
                    <!-- Left label -->
                    <template #prepend>
                        <span class="text-caption font-weight-medium">
                            {{ $t("task1.task1-appealing-low") }}
                        </span>
                        </template>

                        <!-- Right label -->
                        <template #append>
                        <span class="text-caption font-weight-medium">
                            {{ $t("task1.task1-appealing-high") }}
                        </span>
                    </template>
                </v-slider>
            </div>
        </div>
        <!-- SUBTASK 5: QUESTION -->
        <div v-if="subStep === 5">
            <p>
               {{ $t("task1.task1-title5") }} 
            </p>

            <div class="map-grid-wrapper">
                <!-- MAP IMAGE -->
                <img
                    src='task_images/uncertainty_noise_width.png'
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
                    {{ $t("task1.task1-confusing-title") }}
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
                    <!-- Left label -->
                    <template #prepend>
                        <span class="text-caption font-weight-medium">
                            {{ $t("task1.task1-confusing-low") }}
                        </span>
                        </template>

                        <!-- Right label -->
                        <template #append>
                        <span class="text-caption font-weight-medium">
                            {{ $t("task1.task1-confusing-high") }}
                        </span>
                    </template>
                </v-slider>
            </div>
            <p class="mb-2 mt-2">
                {{ $t("task1.task1-appealing-title") }}
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
                    <!-- Left label -->
                    <template #prepend>
                        <span class="text-caption font-weight-medium">
                            {{ $t("task1.task1-appealing-low") }}
                        </span>
                        </template>

                        <!-- Right label -->
                        <template #append>
                        <span class="text-caption font-weight-medium">
                            {{ $t("task1.task1-appealing-high") }}
                        </span>
                    </template>
                </v-slider>
            </div>
        </div>
        <!-- SUBTASK 6: QUESTION -->
        <div v-if="subStep === 6">
            <p>
               {{ $t("task1.task1-title6") }}
            </p>

            <div class="map-grid-wrapper">
                <!-- MAP IMAGE -->
                <img
                    src='task_images/uncertainty_noise_frequency.png'
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
                    {{ $t("task1.task1-confusing-title") }}
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
                    <!-- Left label -->
                    <template #prepend>
                        <span class="text-caption font-weight-medium">
                            {{ $t("task1.task1-confusing-low") }}
                        </span>
                        </template>

                        <!-- Right label -->
                        <template #append>
                        <span class="text-caption font-weight-medium">
                            {{ $t("task1.task1-confusing-high") }}
                        </span>
                    </template>
                </v-slider>
            </div>
            <p class="mb-2 mt-2">
                {{ $t("task1.task1-appealing-title") }}
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
                    <!-- Left label -->
                    <template #prepend>
                        <span class="text-caption font-weight-medium">
                            {{ $t("task1.task1-appealing-low") }}
                        </span>
                        </template>

                        <!-- Right label -->
                        <template #append>
                        <span class="text-caption font-weight-medium">
                            {{ $t("task1.task1-appealing-high") }}
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
        {{ isLastSubStep ? $t("buttons.finish") : $t("buttons.next") }}
      </v-btn>
    </div>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {questionnaireTaskOne} from '@/services/backend.calls.js'
import { useQuestionnaireStore } from '../../stores/questionnaire'

let {session_id, currentStep, progress} = storeToRefs(useQuestionnaireStore());

const subStep = ref(0)
const subtaskStartTime = ref(performance.now())
const selectedIndex = ref(null)
const subtasks = [
  {
    id: 'task_1_1',
    map: 'uncertainty_fuzzy',
    correctRegion: 64,
  },
  {
    id: 'task_1_2',
    map: 'uncertainty_ink',
    correctRegion: 45,
  },
  {
    id: 'task_1_3',
    map: 'uncertainty_pattern_width',
    correctRegion: 21,
  },
  {
    id: 'task_1_4',
    map: 'uncertainty_pattern_orientation',
    correctRegion: 46,
  },
  {
    id: 'task_1_5',
    map: 'uncertainty_noise_width',
    correctRegion: 70,
  },
  {
    id: 'task_1_6',
    map: 'uncertainty_noise_frequency',
    correctRegion: 80,
  },
]

const answers = reactive({
    region: null,
    confusion: 4,
    appeal: 4,
    time_ms: null,
})
const taskResponses = ref([])

watch(subStep, () => {
  subtaskStartTime.value = performance.now()
})



const isLastSubStep = computed(() => subStep.value === 6)
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
      task_id: 'task_1',
      subtask_id: subtask.id,
      map_id: subtask.map,

      response: {
        region_index: answers.region,
        confusion: answers.confusion,
        appeal: answers.appeal,
      },

      correct_region_index: subtask.correctRegion,
      is_correct: answers.region === subtask.correctRegion,

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
    progress.value++
    currentStep.value++
  } else {
    subStep.value++
    progress.value++
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
