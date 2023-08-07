<template>
  <div ref="mapContainer" style="height: 100vh;">
  </div>
</template>

<script setup>
import { Map } from 'maplibre-gl';
import { HTTP } from '../utils/http-call';
import { ref, onMounted, onUnmounted } from "vue";
import { storeToRefs } from 'pinia'
import { useMapStore } from '../stores/map'
const { center, zoom, style } = storeToRefs(useMapStore())

const mapContainer = ref(null);
const map = ref(null);

onMounted(() => {
  //console.log(process.env.VUE_APP_BASE_URI , "test push")
  map.value = new Map({
    container: mapContainer.value,
    style: style.value,
    center: center.value,
    zoom: zoom.value,
  });

  HTTP.get('')
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