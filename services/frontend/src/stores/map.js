import { defineStore } from 'pinia'

export const useMapStore = defineStore ({
    id: 'map',
    state: () => ({
        center: [13.405910, 52.518824],
        zoom: 9,
        //style: "https://api.maptiler.com/maps/a2eb63ba-7d0e-4b25-9cfc-9ef74d786ec4/style.json?key=XgdreUwN4V3uEHHZHsWO",
        style: "https://api.maptiler.com/maps/58fde0bf-e9f9-431e-8992-db2503cd5a1b/style.json?key=XgdreUwN4V3uEHHZHsWO",
        maxPitch: 85
    })
})