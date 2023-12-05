<template>
  <div ref="mapContainer" style="height: 100vh;">
    <AppLogo> </AppLogo>
    <LayerUI @addLayerToMap="addLayerToMap" @toggleLayerVisibility="toggleLayerVisibility" @addCoverageLayerToMap="addCoverageLayerToMap" @toggleCoverageLayerVisibility="toggleCoverageLayerVisibility"> </LayerUI>
    <IndicatorUI @addStyleExpressionByYear="addStyleExpressionByYear" @addCommuneTileLayer="addCommuneTileLayer"> </IndicatorUI>
    <LegendUI></LegendUI>
    <MenuUI></MenuUI>
  </div>
  <MetadataDialog> </MetadataDialog>
  
</template>

<script setup>
import { Map,Popup } from 'maplibre-gl';
import { ref, onMounted, onUnmounted } from "vue";
import { storeToRefs } from 'pinia'
import { useMapStore } from '../stores/map'
import AppLogo from "@/components/AppLogo.vue";
import LayerUI from "@/components/LayerUI.vue";
import IndicatorUI from "@/components/IndicatorUI.vue";
import LegendUI from "@/components/LegendUI.vue";
import MenuUI from "@/components/MenuUI.vue";
import MetadataDialog from "@/components/MetadataDialog.vue";
import { createHTMLAttributeTable } from '../utils/createHTMLAttributeTable';



const { center, zoom, style } = storeToRefs(useMapStore())

const mapContainer = ref(null);

let vectorServer = process.env.VUE_APP_TILE_SERVER_URL+'/';
let map = null;
let popup = null
let selectedFeatureId = null;


onMounted(() => {

  map = new Map({
    container: mapContainer.value,
    style: style.value,
    center: center.value,
    zoom: zoom.value,
  });

  
})

const addLayerToMap = (clickedLayerName, layerType, style)=>{
  let vectorSource = "public"+"."+clickedLayerName;
  let vectorSourceLayer = "public"+"."+clickedLayerName;
  let vectorUrl = vectorServer + vectorSourceLayer + "/{z}/{x}/{y}.pbf";
    
    map.addSource(vectorSource, {
      "type": "vector",
      "tiles": [vectorUrl],
      "promoteId":'id',
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

  map.on('click', "public"+"."+clickedLayerName, function(e) {

    popup?.remove()
    popup = new Popup({ closeOnClick: false })
    const coordinates = [e.lngLat.lng, e.lngLat.lat]
    popup.setLngLat(coordinates)
    popup.setDOMContent(
      createHTMLAttributeTable(
        e.lngLat.lng,
        e.lngLat.lat,
        e.features[0].properties
      )
    )
    popup.addTo(map);
   

    
    if (e.features.length > 0) {
      if (selectedFeatureId) {
        map.removeFeatureState({
          source: "public"+"."+clickedLayerName,
          sourceLayer: "public"+"."+clickedLayerName,
          id: selectedFeatureId
        });
      }

      selectedFeatureId = e.features[0].id;

      map.setFeatureState({
        source: "public"+"."+clickedLayerName,
        sourceLayer: "public"+"."+clickedLayerName,
        id: selectedFeatureId,
      }, {
        clicked: true
      });
    }
    popup.on("close", ()=>{
      if (selectedFeatureId) {
        map.removeFeatureState({
          source: "public"+"."+clickedLayerName,
          sourceLayer: "public"+"."+clickedLayerName,
          id: selectedFeatureId
        });
      }
    })    
  });
  
  
  map.on('mouseenter', "public"+"."+clickedLayerName, function() {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', "public"+"."+clickedLayerName, function() {
    map.getCanvas().style.cursor = '';
  });

 
}

const addCommuneTileLayer = ()=>{
  if(map.getSource("kommunales_gebiet")==undefined){
    map.addSource("kommunales_gebiet", {
      "type": "vector",
      "tiles": [vectorServer + "public.kommunales_gebiet" + "/{z}/{x}/{y}.pbf"],
      "promoteId":'id',
      "minzoom": 0,
      "maxzoom": 22
    });
    let layer = {
        "id": "kommunales_gebiet",
        "source": "kommunales_gebiet",
        "source-layer": "public.kommunales_gebiet",
        "type": "fill",
        'paint': {
          'fill-color': '#0080ff',
          'fill-opacity': 1,
          'fill-outline-color': 'white'

        }
    };
    map.addLayer(layer, "label_place_other")
  }
    
}


const addStyleExpressionByYear = (fillStyle)=>{   
  map.setPaintProperty(
    "kommunales_gebiet", 
    'fill-color', fillStyle
  );
  
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

const addCoverageLayerToMap = (clickedLayerName, layerType, style) =>{
  console.log(layerType, style)
  let geoserver_base_url= process.env.VUE_APP_GEOSERVER_URL
  map.addSource(clickedLayerName, {
    'type': layerType.value,
    'tiles': [
      geoserver_base_url+'/brandenburg/wms?BBOX={bbox-epsg-3857}&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG:3857&WIDTH=256&HEIGHT=256&LAYERS=brandenburg:'+clickedLayerName+'&FORMAT=image/PNG&transparent=true'
    ],
    'tileSize': 256
  });
  map.addLayer(
  {
    'id': clickedLayerName,
    'type': layerType.value,
    'source': clickedLayerName,
    'paint': style.value
  }, 'road_major'
  );
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