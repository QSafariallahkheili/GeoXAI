import { defineStore } from 'pinia'

export const useXAIStore = defineStore ({
    id: 'xai',
    state: () => ({
        clickedCoordinates: [0,0],
        localShapValues: null
    }),
    actions: {
        assignClickedCoordinates(data) {
            this.clickedCoordinates= data.clickedCoordinates
           
        },
        assignLocalShapValues(payload){
            this.localShapValues = payload
        }
       
    }
})