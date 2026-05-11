<template>
  <div class="progress-container">

      <h2 v-if="progress >= 1">{{$t("progress.msg")}}: {{((progress - 1) / 13 * 100).toFixed(0)}}%</h2>
    </div>
</template>
<script setup>
import { storeToRefs } from 'pinia'
import { useQuestionnaireStore } from '../../stores/questionnaire'

let {progress} = storeToRefs(useQuestionnaireStore());

</script>
<style scoped>
.progress-container {
  position: absolute;
  top: 10px;
  left: 10px;
}

.progress-container h2 {
  /* Option 1: clamp() — smoothly scales between a min and max size */
  font-size: clamp(0.875rem, 2.5vw, 1.5rem);

  /* Option 2: viewport units alone (pick one approach) */
  /* font-size: 2.5vw; */

  /* Option 3: media queries for explicit breakpoints */
  margin: 0;
}

/* Option 3 example */
@media (max-width: 600px) {
  .progress-container h2 {
    font-size: 0.875rem;
  }
}

@media (min-width: 601px) and (max-width: 1024px) {
  .progress-container h2 {
    font-size: 1.125rem;
  }
}

</style>