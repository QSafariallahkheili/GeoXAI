<template>
  <div class="questionnaire" v-if="currentStep !== null">
      <WelcomeNote 
        v-if="currentStep === 0" 
      />

      <TutorialNote 
        v-if="currentStep === 1" 
      />

      <BackgroundUI 
        v-if="currentStep === 2" 
      />
    
  </div>
</template>

<script setup>
  import { storeToRefs } from 'pinia'

  import WelcomeNote from '@/components/questionnaire/WelcomeNote.vue'
  import TutorialNote from '@/components/questionnaire/TutorialNote.vue'
  import BackgroundUI from '@/components/questionnaire/BackgroundUI.vue'
  import { useQuestionnaireStore } from '../stores/questionnaire'
  let {currentStep} = storeToRefs(useQuestionnaireStore());


</script>
<style scoped>

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.35s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(24px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}

</style>