<template>
  <div class="questionnaire" v-if="currentStep !== null">
      <ConsentForm 
        v-if="currentStep === -1" 
      />
      <WelcomeNote 
        v-if="currentStep === 0" 
      />

      <TutorialNote 
        v-if="currentStep === 1" 
      />

      <BackgroundUI 
        v-if="currentStep === 2" 
      />
      <FirstTask 
        v-if="currentStep === 3"
      />
      <SecondTask 
        v-if="currentStep === 4"
      />
      <ThankYou 
        v-if="currentStep === 5"
      />
   
      <ProgressTask 
       v-if="currentStep === 3 || currentStep === 4"
      />
     
  </div>
</template>

<script setup>
  import { storeToRefs } from 'pinia'
  import ConsentForm from '@/components/questionnaire/ConsentForm.vue'
  import WelcomeNote from '@/components/questionnaire/WelcomeNote.vue'
  import TutorialNote from '@/components/questionnaire/TutorialNote.vue'
  import BackgroundUI from '@/components/questionnaire/BackgroundUI.vue'
  import FirstTask from '@/components/questionnaire/FirstTask.vue'
  import SecondTask from '@/components/questionnaire/SecondTask.vue'
  import ThankYou from '@/components/questionnaire/ThankYou.vue'
  import ProgressTask from '@/components/questionnaire/ProgressTask.vue'

  import { useQuestionnaireStore } from '../stores/questionnaire'
  let {currentStep} = storeToRefs(useQuestionnaireStore());


</script>
<style scoped>



</style>