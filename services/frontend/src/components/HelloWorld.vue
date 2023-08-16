<template>
  <div ref="mapContainer" style="height: 100vh;">
    <LayerUI @addLayerToMap="addLayerToMap" @toggleLayerVisibility="toggleLayerVisibility"/>
  </div>
  
</template>

<script setup>
import { Map } from 'maplibre-gl';
import { ref, onMounted, onUnmounted } from "vue";
import { storeToRefs } from 'pinia'
import { useMapStore } from '../stores/map'
import LayerUI from "@/components/LayerUI.vue";
const { center, zoom, style } = storeToRefs(useMapStore())

const mapContainer = ref(null);
const map = ref(null);


onMounted(() => {

  map.value = new Map({
    container: mapContainer.value,
    style: style.value,
    center: center.value,
    zoom: zoom.value,
  });

})
const addLayerToMap = (clickedLayerName, layerType, style)=>{
  let vectorServer = process.env.VUE_APP_TILE_SERVER_URL+'/';
  let vectorSource = "public"+"."+clickedLayerName;
  let vectorSourceLayer = "public"+"."+clickedLayerName;
  let vectorUrl = vectorServer + vectorSourceLayer + "/{z}/{x}/{y}.pbf";
  map.value.addSource(vectorSource, {
      "type": "vector",
      "tiles": [vectorUrl],
      "minzoom": 0,
      "maxzoom": 22
  });
  let layer = {
      "id": "public"+"."+clickedLayerName,
      "source": vectorSource,
      "source-layer": "public"+"."+clickedLayerName,
      "type": layerType.value,
      "paint":  style.value
  };
  map.value.addLayer(layer)  
 
}
const toggleLayerVisibility = (clickedLayerName)=>{
    let visibility = map.value.getLayoutProperty(
    'public'+'.'+clickedLayerName,
    'visibility'
  );
  if (visibility == 'visible'){
    map.value.setLayoutProperty('public'+'.'+clickedLayerName,'visibility', 'none')
  }
  else if (visibility == undefined){
    map.value.setLayoutProperty('public'+'.'+clickedLayerName,'visibility', 'none')
  }
  else {
    map.value.setLayoutProperty('public'+'.'+clickedLayerName,'visibility', 'visible')
  }

}

onUnmounted(() => {
      if (map.value) {
        map.value.remove();
      }
});

</script>

<style scoped>

</style>