import { defineStore } from 'pinia'

export const useFilterStore = defineStore ({
    id: 'filter',
    state: () => ({
        drawControl:null,
        bufferData: null,
        polygonData: null,
        municipalityShapSummary: null,
    }),
    actions: {
        assignBufferData(payload) {
            this.bufferData = payload
            
        },
        assignMunicipalityShapSummary(payload) {
            
            this.municipalityShapSummary = payload
           
            
        },
        assignPolygonData(payload) {
            this.polygonData = payload
        }
    }
})