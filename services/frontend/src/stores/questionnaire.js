import { defineStore } from 'pinia'




export const useQuestionnaireStore = defineStore ({
    id: 'questionnaire',
    state: () => ({
        currentStep: 0,
        session_id: null,
    }),
    actions: {
       setProgressBar(data) {
        this.progress=data.progress
        this.text = data.text
       }
       
    }
})