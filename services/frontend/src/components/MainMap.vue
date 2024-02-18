<template>
  <div ref="mapContainer" style="height: 100vh;">
    <LayerUI @addLayerToMap="addLayerToMap" @toggleLayerVisibility="toggleLayerVisibility" @addCoverageLayerToMap="addCoverageLayerToMap" @toggleCoverageLayerVisibility="toggleCoverageLayerVisibility"> </LayerUI>
    <LegendUI></LegendUI>
    <MenuUI></MenuUI>
    <XAI v-if="activeMenu=='xai'" @addCoverageLayerToMap="addCoverageLayerToMap" @toggleCoverageLayerVisibility="toggleCoverageLayerVisibility" @getClickedCoordinate="getClickedCoordinate" @removeLayerFromMap="removeLayerFromMap" @toggleCoverageLayerVisibilityWithValue="toggleCoverageLayerVisibilityWithValue" @addXaiPulseLayer="addPulseLayerToMap"></XAI>
  </div>
  <MetadataDialog> </MetadataDialog>
  
</template>

<script setup>
import { Map } from 'maplibre-gl';
import { ref, onMounted, onUnmounted } from "vue";
import { storeToRefs } from 'pinia'
import { useMapStore } from '../stores/map'
import LayerUI from "@/components/LayerUI.vue";
import LegendUI from "@/components/LegendUI.vue";
import MenuUI from "@/components/MenuUI.vue";
import MetadataDialog from "@/components/MetadataDialog.vue";
import XAI from "@/components/XAI.vue";
import { addPopupToMap } from '../utils/mapUtils';
import { addPulseLayer } from '../utils/pulseLayer';

import { useMenuStore } from '../stores/menu'
import { useXAIStore } from '../stores/xai'

let { activeMenu } = storeToRefs(useMenuStore())

const XAIStore = useXAIStore();




const { center, zoom, style } = storeToRefs(useMapStore())

const mapContainer = ref(null);

let vectorServer = process.env.VUE_APP_TILE_SERVER_URL+'/';
let map = null;
//let popup = null
let selectedFeatureId = null;


onMounted(() => {

  map = new Map({
    container: mapContainer.value,
    style: style.value,
    center: center.value,
    zoom: zoom.value,
  });

  
})

const addLayerToMap = (layerSpecification)=>{

  let vectorSourceLayer = "public"+"."+layerSpecification.layerNameInDatabase;
  let vectorUrl = vectorServer + vectorSourceLayer + "/{z}/{x}/{y}.pbf";
  if(map.getSource(layerSpecification.id)==undefined){
    map.addSource(layerSpecification.id, {
        "type": "vector",
        "tiles": [vectorUrl],
        "promoteId":'id',
        "minzoom": 0,
        "maxzoom": 22
    });
    let layer = {
        "id": layerSpecification.id,
        "source": layerSpecification.id,
        "source-layer": vectorSourceLayer,
        "type": layerSpecification.layerType.value,
        "paint":  layerSpecification.style.value
    };
    map.addLayer(layer)  
  }
  map.on('click', layerSpecification.id, function(e) {
    addPopupToMap(map, layerSpecification.id, vectorSourceLayer, selectedFeatureId, e)
    
});

  
  map.on('mouseenter', layerSpecification.id, function() {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', layerSpecification.id, function() {
    map.getCanvas().style.cursor = '';
  });

 
}


const toggleLayerVisibility = (clickedLayerName)=>{
    let visibility = map.getLayoutProperty(
    clickedLayerName,
    'visibility'
  );
  if (visibility == 'visible'){
    map.setLayoutProperty(clickedLayerName,'visibility', 'none')
  }
  else if (visibility == undefined){
    map.setLayoutProperty(clickedLayerName,'visibility', 'none')
  }
  else {
    map.setLayoutProperty(clickedLayerName,'visibility', 'visible')
  }

}

const addCoverageLayerToMap = (clickedLayerName, layerType, style) =>{
  let coverageLayer = map.getLayer(clickedLayerName);
  
  if(typeof coverageLayer == 'undefined') {
    let geoserver_base_url= process.env.VUE_APP_GEOSERVER_URL
    map.addSource(clickedLayerName, {
      'type': layerType.value,
      'tiles': [
        geoserver_base_url+'/geoxai/wms?BBOX={bbox-epsg-3857}&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG:3857&WIDTH=256&HEIGHT=256&LAYERS=geoxai:'+clickedLayerName+'&FORMAT=image/PNG&transparent=true'
      ],
      'tileSize': 256
    });
    map.addLayer({
      'id': clickedLayerName,
      'type': layerType.value,
      'source': clickedLayerName,
      'paint': style.value
      },
    'road_major'
    );
  }
  map.moveLayer(clickedLayerName);
  
}
const toggleCoverageLayerVisibility = (clickedLayerName)=>{
    let visibility = map.getLayoutProperty(
    clickedLayerName,
    'visibility'
  );
  
  if (visibility == 'visible'){
    map.setLayoutProperty(clickedLayerName,'visibility', 'none')
  }
  else if (visibility == undefined){
    map.setLayoutProperty(clickedLayerName,'visibility', 'none')
  }
  else {   
    map.setLayoutProperty(clickedLayerName,'visibility', 'visible')
    map.moveLayer(clickedLayerName);
  }

}

const removeLayerFromMap = (layerId)=>{
  let layer = map.getLayer(layerId);

  if(typeof layer !== 'undefined') {

      map.removeLayer(layerId).removeSource(layerId);
  }
}

const getClickedCoordinate = ()=>{
  
    map.on('click', (e) => {
      
      if (activeMenu.value=='xai'){
        
        XAIStore.assignClickedCoordinates({
          clickedCoordinates: [e.lngLat.lng,  e.lngLat.lat]
        })
             
      }
    
  });
    
  
}

const addPulseLayerToMap = (payload) => {
  addPulseLayer(map, payload.layerId, payload.lng,  payload.lat)
}


const toggleCoverageLayerVisibilityWithValue = (layerID, visStatus)=>{
  const layer = map.getLayer(layerID)
  if(layer  !== undefined){
    map.setLayoutProperty(layerID, 'visibility', visStatus)
    if(visStatus=='visible'){
      map.moveLayer(layerID, "xai-pulse")
    }
  }
  
  
}


onUnmounted(() => {
      if (map) {
        map.remove();
      }
});

</script>

<style scoped>
  ::v-deep .maplibregl-popup-content {
    border-radius:10px;
    background: rgba(255,255,255,0.6);
    backdrop-filter: blur(5px);
    animation: easeOutElastic 0.5s;
    border: 1px solid rgba(0, 0, 0, 0.2);   
  }
  @keyframes easeOutElastic {
  0% {
    transform: scale(0.98);
  }
  20% {
    transform: scale(1);
  }
  40% {
    transform: scale(0.99);
  }
  60% {
    transform: scale(1);
  }
  80% {
    transform: scale(0.999);
  }
  100% {
    transform: scale(1);
  }
}



</style>