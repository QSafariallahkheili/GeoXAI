<template>
  <div ref="mapContainer" style="height: 100dvh;">
    
    <LayerUI @addLayerToMap="addLayerToMap" @toggleLayerVisibility="toggleLayerVisibility" @addCoverageLayerToMap="addCoverageLayerToMap" @toggleCoverageLayerVisibility="toggleCoverageLayerVisibility"> </LayerUI>
    <LegendUI></LegendUI>
    <MenuUI @removeLayerFromMap="removeLayerFromMap"></MenuUI>
    <FilterUI v-if="activeMenu=='filter'" @activateBufferTool="activateBufferTool" @addGeojsonLayer="addGeojsonLayer" @fitBoundsToBBOX="fitBoundsToBBOX" @removeLayerFromMap="removeLayerFromMap" @removeDrawControl="removeDrawControl" @activatePolygonTool="activatePolygonTool"> </FilterUI>
    <XAI v-if="activeMenu=='xai' || activeMenu=='filter'" @addCoverageLayerToMap="addCoverageLayerToMap" @toggleCoverageLayerVisibility="toggleCoverageLayerVisibility" @getClickedCoordinate="getClickedCoordinate" @removeLayerFromMap="removeLayerFromMap" @toggleCoverageLayerVisibilityWithValue="toggleCoverageLayerVisibilityWithValue" @addXaiPulseLayer="addPulseLayerToMap"></XAI>
    
  </div>
  
  <MetadataDialog> </MetadataDialog>
  <AlertUI> </AlertUI>
  
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
import AlertUI from "@/components/AlertUI.vue";
import  FilterUI from '@/components/FilterUI.vue'
import { addPopupToMap } from '../utils/mapUtils';
import { addPulseLayer } from '../utils/pulseLayer';

import { useMenuStore } from '../stores/menu'
import { useXAIStore } from '../stores/xai'
import { useFilterStore } from '../stores/filter'

import * as turf from "@turf/turf";

import { MaplibreTerradrawControl } from '@watergis/maplibre-gl-terradraw';
import '@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css';

//import {addCubeGeometry} from '../utils/addBabylon3DModel';
let { activeMenu } = storeToRefs(useMenuStore())
let { drawControl } = storeToRefs(useFilterStore())
const filterStore = useFilterStore()

const XAIStore = useXAIStore();



const { center, zoom, style, maxPitch } = storeToRefs(useMapStore())

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
    maxPitch: maxPitch.value
  });
    drawControl = new MaplibreTerradrawControl({
        modes: ['circle', 'polygon'], // Drawing modes to enable
        open: false, 
    });

      // Add the drawing control to the map
      map.addControl(drawControl, 'bottom-left');
  
})

const addLayerToMap = (layerSpecification)=>{
  
  let vectorSourceLayer = "public"+"."+layerSpecification.layerNameInDatabase;
  let vectorUrl = vectorServer + vectorSourceLayer + "/{z}/{x}/{y}.pbf";
  console.log(layerSpecification, "layerSpecification")
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
    console.log(geoserver_base_url, "geoserver_base_url")
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
      }
    );
  }
  map.moveLayer(clickedLayerName, 'road_major');
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
    map.moveLayer(clickedLayerName, 'road_major');
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
    //const canvasCoords = [e.point.x, e.point.y];
    //const picked = map.getLayer("cube")?.implementation?.scene.pick(canvasCoords[0], canvasCoords[1]);
    if (activeMenu.value=='xai'){
      XAIStore.assignClickedCoordinates({
        clickedCoordinates: [e.lngLat.lng,  e.lngLat.lat]
      })
    }
  });
  
}

const addPulseLayerToMap = (payload) => {
  addPulseLayer(map, payload.layerId, payload.lng,  payload.lat)
  //addCubeGeometry(map, "cube", payload.lng,  payload.lat, XAIStore.localShapValues)
}


const toggleCoverageLayerVisibilityWithValue = (layerID, visStatus)=>{
  const layer = map.getLayer(layerID)
  if(layer  !== undefined){
    map.setLayoutProperty(layerID, 'visibility', visStatus)
    if(visStatus=='visible'){
      map.moveLayer(layerID, "xai-pulse")
    }
  }
  map.moveLayer(layerID, 'road_major');
  
  
}
const activateBufferTool=()=>{
    if (drawControl) {
      map.removeControl(drawControl);
      drawControl = null;
    }
    drawControl = new MaplibreTerradrawControl({
        modes: ['circle', 'delete'], // Drawing modes to enable
        open: true, 
    });

    map.addControl(drawControl, 'bottom-left');
    const drawInstance = drawControl.getTerraDrawInstance();
    drawInstance.on('finish', (id) => {
      // to remove previous buffers
      let addedBufferIds = drawInstance.getSnapshot()
      if(addedBufferIds.length> 1){
        drawInstance.removeFeatures([addedBufferIds[0].id]);
      }
      
      const feature = Object.values(drawInstance._store.store).find(item => item.id === id);
      const centroid = turf.centroid(feature);
      const area = turf.area(feature);
      filterStore.assignBufferData({
        bufferCenter: centroid.geometry.coordinates,
        bufferArea: area/1000000,
        bufferRadius: feature.properties.radiusKilometers,
        geojson: feature.geometry
      })
    });
    
 
}
const activatePolygonTool=()=>{
  if (drawControl) {
      map.removeControl(drawControl);
      drawControl = null;
    }
  drawControl = new MaplibreTerradrawControl({
      modes: ['polygon', 'delete'], // Drawing modes to enable
      open: true, 
  });

  map.addControl(drawControl, 'bottom-left');
  const drawInstance = drawControl.getTerraDrawInstance();
    drawInstance.on('finish', (id) => {
      // to remove previous buffers
      let addedPolygonIds = drawInstance.getSnapshot()
      if(addedPolygonIds.length> 1){
        drawInstance.removeFeatures([addedPolygonIds[0].id]);
      }
      
      const feature = Object.values(drawInstance._store.store).find(item => item.id === id);
      const area = turf.area(feature);
      filterStore.assignPolygonData({
        polygonArea: area/1000000,
        geojson: feature.geometry
      })
    });
  
  

}
const removeDrawControl = ()=>{
    map.removeControl(drawControl);
    drawControl = null
}

const addGeojsonLayer= (layerSpecification)=>{
  map.addSource(layerSpecification.id, {
        'type': 'geojson',
        'data': layerSpecification.data
       
  });
  let layer = {
      "id": layerSpecification.id,
      "source": layerSpecification.id,
      
      "type": layerSpecification.type,
      "paint":  layerSpecification.style,
      'layout': {}
  };
  
  map.addLayer(layer) 
}
const fitBoundsToBBOX = (payload)=>{
  let bbox = payload.bbox
  map.fitBounds([
    [bbox[0], bbox[1]], // [lng, lat] - southwestern corner of the bounds
    [bbox[2], bbox[3]] // [lng, lat] - northeastern corner of the bounds
  ]);
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