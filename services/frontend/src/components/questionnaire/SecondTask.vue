<template>
  <v-container fluid class="task-container d-flex align-center justify-center">
    <v-sheet max-width="1000" rounded="xl" elevation="2" class="pa-6">
      <!-- SUBTASK 0: INTRO -->
        <div v-if="subStep === 0">
            <h1 class="text-h5 font-weight-bold mb-4">Task Type 2</h1>
            <p class="mb-4">

                Identify regions that simultaneously exhibit high Land Surface Temperature (LST) values and a strong negative SHAP contribution.

            </p>
            <p class="mb-4">

                This indicates areas where the model strongly decreases predictions despite high temperatures.

            </p>
            
            <p class="mb-4">
                For each map, you will answer one or more questions.
            </p>
            <p class="mb-4">
                Please answer as <strong>accurately</strong> and as <strong>quickly</strong> as possible.
            </p>

        </div>

    


    </v-sheet>

    <!-- NAVIGATION -->
    <div class="nav">
      <v-btn
        color="primary"
        size="large"
        variant="elevated"
        append-icon="mdi-arrow-right"
    
      >
      {{ isLastSubStep ? 'Finish Task' : 'Next' }}
      </v-btn>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'

const subStep = ref(0)
const isLastSubStep = computed(() => subStep.value === 6)

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
