import { defineStore } from 'pinia'

export const useMapStore = defineStore ({
    id: 'map',
    state: () => ({
        center: [13.405910, 52.518824],
        zoom: 9,
        //style: "https://api.maptiler.com/maps/a2eb63ba-7d0e-4b25-9cfc-9ef74d786ec4/style.json?key=XgdreUwN4V3uEHHZHsWO",
        style: "https://api.maptiler.com/maps/openstreetmap/style.json?key=XgdreUwN4V3uEHHZHsWO",
        maxPitch: 85,
        mapLoaded: false
    })
})