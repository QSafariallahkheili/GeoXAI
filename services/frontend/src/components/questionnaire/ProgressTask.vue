<template>
  <div class="progress-container">

      <h2 v-if="progress >= 1">Progress: {{(progress - 1) / 10 * 100}}%</h2>
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
  top: 20px;
  left: 20px;
}


</style>