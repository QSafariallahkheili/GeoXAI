import { defineStore } from 'pinia'

export const useXAIStore = defineStore ({
    id: 'xai',
    state: () => ({
        clickedCoordinates: [0,0]
    }),
    actions: {
        assignClickedCoordinates(data) {
            this.clickedCoordinates= data.clickedCoordinates
           
        }
       
    }
})