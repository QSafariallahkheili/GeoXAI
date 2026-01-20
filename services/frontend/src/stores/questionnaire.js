import { defineStore } from 'pinia'




export const useQuestionnaireStore = defineStore ({
    id: 'questionnaire',
    state: () => ({
        currentStep: -1,
        session_id: null,
        progress: 0,
    }),
    actions: {
       setProgressBar(data) {
        this.progress=data.progress
        this.text = data.text
       }
       
    }
})