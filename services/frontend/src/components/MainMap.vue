<template>
  <div ref="mapContainer" style="height: 100vh;">
    <AppLogo> </AppLogo>
    <LayerUI @addLayerToMap="addLayerToMap" @toggleLayerVisibility="toggleLayerVisibility" @addCoverageLayerToMap="addCoverageLayerToMap" @toggleCoverageLayerVisibility="toggleCoverageLayerVisibility"> </LayerUI>
    <IndicatorUI @addStyleExpressionByYear="addStyleExpressionByYear" @addCommuneTileLayer="addCommuneTileLayer"> </IndicatorUI>
    <LegendUI></LegendUI>
    <MenuUI></MenuUI>
    <XAI v-if="activeMenu=='xai'" @addCoverageLayerToMap="addCoverageLayerToMap" @toggleCoverageLayerVisibility="toggleCoverageLayerVisibility" @getClickedCoordinate="getClickedCoordinate"></XAI>
  </div>
  <MetadataDialog> </MetadataDialog>
  
</template>

<script setup>
import { Map,/*Popup*/ } from 'maplibre-gl';
import { ref, onMounted, onUnmounted } from "vue";
import { storeToRefs } from 'pinia'
import { useMapStore } from '../stores/map'
import AppLogo from "@/components/AppLogo.vue";
import LayerUI from "@/components/LayerUI.vue";
import IndicatorUI from "@/components/IndicatorUI.vue";
import LegendUI from "@/components/LegendUI.vue";
import MenuUI from "@/components/MenuUI.vue";
import MetadataDialog from "@/components/MetadataDialog.vue";
import XAI from "@/components/XAI.vue";
import { addPopupToMap } from '../utils/mapUtils';

//import { createHTMLAttributeTable } from '../utils/createHTMLAttributeTable';
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

const size = 200;
 

const pulsingDot = {
  width: size,
  height: size,
  data: new Uint8Array(size * size * 4),
 

  onAdd: function () {
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    this.context = canvas.getContext('2d');
  },
 
  // Call once before every frame where the icon will be used.
  render: function () {
    const duration = 1000;
    const t = (performance.now() % duration) / duration;
 
    const radius = (size / 2) * 0.1;
    const outerRadius = (size / 2) * 0.7 * t + radius;
    const context = this.context;
 
    // Draw the outer circle.
    context.clearRect(0, 0, this.width, this.height);
    context.beginPath();
    context.arc(
      this.width / 2,
      this.height / 2,
      outerRadius,
      0,
      Math.PI * 2
    );
    context.fillStyle = `rgba(121, 7, 222, ${1 - t})`;
    context.fill();
  
    // Draw the inner circle.
    context.beginPath();
    context.arc(
      this.width / 2,
      this.height / 2,
      radius,
      0,
      Math.PI * 2
    );
    context.fillStyle = 'rgba(121, 7, 222, 1)';
    context.strokeStyle = 'white';
    context.lineWidth = 2 + 4 * (1 - t);
    context.fill();
    context.stroke();
 
    // Update this image's data with data from the canvas.
    this.data = context.getImageData(
      0,
      0,
      this.width,
      this.height
    ).data;
 
    // Continuously repaint the map, resulting
    // in the smooth animation of the dot.
    map.triggerRepaint();
 
    // Return `true` to let the map know that the image was updated.
    return true;
  }
};
 
map.on('load', () => {
  map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });
  
  map.addSource('dot-point', {
    'type': 'geojson',
    'data': {
      'type': 'FeatureCollection',
      'features': [
        {
          'type': 'Feature',
          'geometry': {
            'type': 'Point',
            'coordinates': [13.259101,52.538625]
          }
        }
      ]
    }
  });
  map.addLayer({
    'id': 'layer-with-pulsing-dot',
    'type': 'symbol',
    'source': 'dot-point',
    'layout': {
      'icon-image': 'pulsing-dot'
    }
  });
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




const addStyleExpressionByYear = (fillStyle)=>{   
  map.setPaintProperty(
    "kommunales_gebiet", 
    'fill-color', fillStyle
  );
  
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
        geoserver_base_url+'/brandenburg/wms?BBOX={bbox-epsg-3857}&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG:3857&WIDTH=256&HEIGHT=256&LAYERS=brandenburg:'+clickedLayerName+'&FORMAT=image/PNG&transparent=true'
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