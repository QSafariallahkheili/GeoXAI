<template>
  <div ref="mapContainer" style="height: 100vh;">
    <LayerUI @addLayerToMap="addLayerToMap" @toggleLayerVisibility="toggleLayerVisibility"/>
  </div>
  
</template>

<script setup>
import { Map, Popup } from 'maplibre-gl';
import { ref, onMounted, onUnmounted } from "vue";
import { storeToRefs } from 'pinia'
import { useMapStore } from '../stores/map'
import LayerUI from "@/components/LayerUI.vue";
import { createHTMLAttributeTable } from '../utils/createHTMLAttributeTable';

const { center, zoom, style } = storeToRefs(useMapStore())

const mapContainer = ref(null);
let map = null;


onMounted(() => {

  map = new Map({
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
  
    map.addSource(vectorSource, {
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
  map.addLayer(layer)  
  let popup = new Popup()
  map.on('click', "public"+"."+clickedLayerName, function(e) {
    
    const coordinates = [e.lngLat.lng, e.lngLat.lat]
    console.log(e.features[0].properties)
    popup.setLngLat(coordinates)
    popup.setDOMContent(
      createHTMLAttributeTable(
        e.lngLat.lng,
        e.lngLat.lat,
        e.features[0].properties
      )
    )
    popup.addTo(map);

    // modifyinh popup's default style
    document.getElementsByClassName('maplibregl-popup-content')[0].style.borderRadius="8px"
    document.getElementsByClassName('maplibregl-popup-content')[0].style.width="fit-content"

  });
  map.on('mouseenter', "public"+"."+clickedLayerName, function() {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', "public"+"."+clickedLayerName, function() {
    map.getCanvas().style.cursor = '';
  });

 
}
const toggleLayerVisibility = (clickedLayerName)=>{
    let visibility = map.getLayoutProperty(
    'public'+'.'+clickedLayerName,
    'visibility'
  );
  if (visibility == 'visible'){
    map.setLayoutProperty('public'+'.'+clickedLayerName,'visibility', 'none')
  }
  else if (visibility == undefined){
    map.setLayoutProperty('public'+'.'+clickedLayerName,'visibility', 'none')
  }
  else {
    map.setLayoutProperty('public'+'.'+clickedLayerName,'visibility', 'visible')
  }

}

onUnmounted(() => {
      if (map) {
        map.remove();
      }
});

</script>

<style scoped>

</style>