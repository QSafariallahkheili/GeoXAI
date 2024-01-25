import { defineStore } from 'pinia'

export const useLayersStore = defineStore ({
    id: 'layers',
    state: () => ({
        DBTableNames: [],
        addedLayers: []
    }),
    actions: {
        
    }
})