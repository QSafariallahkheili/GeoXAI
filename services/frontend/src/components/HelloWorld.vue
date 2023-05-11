<template>
  <div ref="mapContainer" style="height: 100vh;">
  </div>
</template>

<script setup>
import { Map } from 'maplibre-gl';
import axios from 'axios';
import { ref, onMounted, onUnmounted } from "vue";

const mapContainer = ref(null);
const map = ref(null);

onMounted(() => {
  console.log("test")
  map.value = new Map({
    container: mapContainer.value,
    style: 'https://api.maptiler.com/maps/a2eb63ba-7d0e-4b25-9cfc-9ef74d786ec4/style.json?key=XgdreUwN4V3uEHHZHsWO',
    center: [ 13.259101,52.538625],
    zoom: 7,
  });

  axios.get('/')
  .then((res) => {
    console.log(res.data)
  })
  .catch((error) => {
    console.error(error);
  });

  
    
})

onUnmounted(() => {
      if (map.value) {
        map.value.remove();
      }
});

</script>

<style scoped>

</style>