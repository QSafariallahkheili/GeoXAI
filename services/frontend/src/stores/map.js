import { defineStore } from 'pinia'

export const useMapStore = defineStore ({
    id: 'map',
    state: () => ({
        center: [13.259101,52.538625],
        zoom: 7,
        style: 'https://api.maptiler.com/maps/a2eb63ba-7d0e-4b25-9cfc-9ef74d786ec4/style.json?key=XgdreUwN4V3uEHHZHsWO',
        maxPitch: 85
    })
})