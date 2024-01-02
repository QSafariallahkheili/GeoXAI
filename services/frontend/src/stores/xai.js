import { defineStore } from 'pinia'

export const useXAIStore = defineStore ({
    id: 'xai',
    state: () => ({
        clickedCoordinates: [0,0]
    })
})