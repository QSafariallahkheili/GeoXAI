<template>
  <div ref="mapContainer" style="height: 100dvh;">
    
    <LayerUI @addLayerToMap="addLayerToMap" @toggleLayerVisibility="toggleLayerVisibility" @addCoverageLayerToMap="addCoverageLayerToMap" @toggleCoverageLayerVisibility="toggleCoverageLayerVisibility"> </LayerUI>
    <LegendUI></LegendUI>
    <MenuUI @removeLayerFromMap="removeLayerFromMap" @addLayerToMap="addLayerToMap" ></MenuUI>
    <FilterUI v-if="activeMenu=='filter'" @activateBufferTool="activateBufferTool" @addGeojsonLayer="addGeojsonLayer" @fitBoundsToBBOX="fitBoundsToBBOX" @removeLayerFromMap="removeLayerFromMap" @removeDrawControl="removeDrawControl" @activatePolygonTool="activatePolygonTool"> </FilterUI>
    <XAI v-if="activeMenu=='xai' || activeMenu=='filter' || activeMenu=='uhi'" @addCoverageLayerToMap="addCoverageLayerToMap" @toggleCoverageLayerVisibility="toggleCoverageLayerVisibility" @getClickedCoordinate="getClickedCoordinate" @removeLayerFromMap="removeLayerFromMap" @toggleCoverageLayerVisibilityWithValue="toggleCoverageLayerVisibilityWithValue" @addXaiPulseLayer="addPulseLayerToMap"></XAI>
    <GeovisUI v-show="activeMenu=='geovis'" @addCircleLayerToMap="addCircleLayerToMap" @addSquareLayerToMap="addSquareLayerToMap" @addLayerToMap="addLayerToMap" @addFuzzyLayerToMap="addFuzzyLayerToMap" @addPositionLayerToMap="addPositionLayerToMap" @addArrowLayerWithThreePropToMap="addArrowLayerWithThreePropToMap" @addCircleLayerWithInkUncertainty="addCircleLayerWithInkUncertainty" @addPatternLayerToMap="addPatternLayerToMap" @addCircleLayerWithInkUncertaintyOneProp="addCircleLayerWithInkUncertaintyOneProp" @addFuzzyLayerWithThreePropToMap="addFuzzyLayerWithThreePropToMap" @addPatternLayerWithOrientationToMap="addPatternLayerWithOrientationToMap" @addArrowLayerWithTwoPropToMap="addArrowLayerWithTwoPropToMap" @addCustomMapboxBorderLayerToMap="addCustomMapboxBorderLayerToMap" @addCustomMapboxGrainNoiseLayerToMap="addCustomMapboxGrainNoiseLayerToMap" @addAggregatedSHAPLayerToMap="addAggregatedSHAPLayerToMap"></GeovisUI>
    <UHI v-if="activeMenu=='uhi'" @addDynamicTernaryGridToMap="addDynamicTernaryGridToMap" @removeLayerFromMap="removeLayerFromMap" @highlightMapHex="highlightMapHex" @addDynamicUncertaintyOverlay="addDynamicUncertaintyOverlay" @removeCustomLayerFromMap="removeCustomLayerFromMap" @addMoranFeatureToMap="addMoranFeatureToMap" @addDynamicMoranUncertaintyOverlay="addDynamicMoranUncertaintyOverlay" @setLayerPaintProperty="setLayerPaintProperty" @addDynamicFeatureGridToMap="addDynamicFeatureGridToMap" @addDynamicShapGridToMap="addDynamicShapGridToMap" @addDynamicBivariateGridToMap="addDynamicBivariateGridToMap"></UHI>

  </div>
  
  <MetadataDialog> </MetadataDialog>
  <AlertUI> </AlertUI>
  <ProgressUI> </ProgressUI>
  
</template>

<script setup>
import { Map } from 'maplibre-gl';
import { ref, onMounted, onUnmounted } from "vue";
import { storeToRefs } from 'pinia'
import { useMapStore } from '../stores/map'
import LayerUI from "@/components/LayerUI.vue";
import LegendUI from "@/components/LegendUI.vue";
import MenuUI from "@/components/MenuUI.vue";
import UHI from "@/components/UHI.vue";

import MetadataDialog from "@/components/MetadataDialog.vue";
import XAI from "@/components/XAI.vue";
import ProgressUI from "@/components/ProgressUI.vue";
import GeovisUI from "@/components/GeovisUI.vue";
import AlertUI from "@/components/AlertUI.vue";
import  FilterUI from '@/components/FilterUI.vue'
import { addPopupToMap } from '../utils/mapUtils';
import { addPulseLayer } from '../utils/pulseLayer';

import { useMenuStore } from '../stores/menu'
import { useXAIStore } from '../stores/xai'
import { useFilterStore } from '../stores/filter'
import { useUhiStore } from '../stores/uhi'
import { useProgressStore } from '@/stores/progress'
import { useMapLegendStore } from '../stores/mapLegend'

import * as turf from "@turf/turf";

import { MaplibreTerradrawControl } from '@watergis/maplibre-gl-terradraw';
import '@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css';
import {addDeckglCircleLayerWithUncertainty, addDeckglCircleLayerOnePropWithUncertainty,addDeckglSquareLayerToMap, addDeckglFuzzyLayerToMap, addDeckglPositionLayerToMap, addDeckglArrowLayerWithThreePropToMap, addCustomPatternLayerToMap,addDeckglCircleLayer, addDeckglFuzzyLayerWithThreePropToMap, addCustomPatternLayerWithOrientationToMap, addDeckglArrowLayerWithtwoPropToMap, addCustomBorderLayerToMap, addCustomBorderLayerWithNoisegrainToMap, addDeckglAggregationPieLayer, addNoiseMapWithGrainSizeToMap, addNoiseMapWithGrainSizeForMoranPValueToMap} from '../utils/deckglLayers';
//import MinimapControl from "maplibregl-minimap";

let { activeMenu } = storeToRefs(useMenuStore())
let { drawControl } = storeToRefs(useFilterStore())
const filterStore = useFilterStore()
const progressStore = useProgressStore()
let { uhi_activated_tab} = storeToRefs(useMapLegendStore())

const XAIStore = useXAIStore();
const uhiStore = useUhiStore()



const { center, zoom, style, maxPitch, mapLoaded } = storeToRefs(useMapStore())

const mapContainer = ref(null);

let vectorServer = process.env.VUE_APP_TILE_SERVER_URL+'/';
let map = null;
//let popup = null
let selectedFeatureId = null;
let mapboxOverlayLayer = ref(null)
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
  map.on("load", ()=>{
    mapLoaded.value= true
    //map.setPaintProperty('place_suburb', 'text-halo-width', 0);
    //map.setPaintProperty('place_suburb', 'text-halo-blur', 0);
    map.setLayoutProperty('place_suburb', 'text-font', [
      'Open Sans Bold',
      'Arial Unicode MS Bold'
    ]);
    map.setPaintProperty('place_suburb', 'text-color', '#1f1f1f');
    map.setPaintProperty('place_suburb', 'text-halo-color', '#ffffff');


    map.setPaintProperty('place_state', 'text-halo-width', 0);
    map.setPaintProperty('place_state', 'text-halo-blur', 0);
    map.setLayoutProperty('place_state', 'text-font', [
      'Open Sans Bold',
      'Arial Unicode MS Bold'
    ]);
    map.setPaintProperty('place_state', 'text-color', '#1f1f1f');
    map.setPaintProperty('place_state', 'text-halo-color', '#ffffff');
     map.setLayoutProperty('place_city_large', 'visibility', 'none');
          
  map.on('moveend', () => {
    console.log(map.getCenter(), "map center");
    console.log(map.getZoom(), "map zoom");
    console.log(map.getBounds(), "map bbox");
    
  });

    
  })
map.on('style.load', () => {
  map.getStyle().layers.forEach(l => {
    if (
      l.source === 'openmaptiles' &&
      l['source-layer'] === 'building'
    ) {
      map.setLayoutProperty(l.id, 'visibility', 'none');
    }
  });
});
  /*map.on("load", () => {
    const miniMapConfig = {
      id: "myCustomMiniMap",
      width: "180px",
      height: "180px",
      zoomLevelOffset:0,
      initialMinimized: false,
      minimizableMinimap: true,
      collapsedWidth: "30px",
      collapsedHeight: "30px",
      borderRadius: "5px",
    };
    map.addControl(new MinimapControl(miniMapConfig), 'top-right');
  });

  map.on('moveend', () => {
    console.log(map.getCenter(), "map center");
    console.log(map.getZoom(), "map zoom");
    console.log(map.getBounds(), "map bbox");
    
  });*/
  
      
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
  else {
    toggleLayerVisibility(layerSpecification.id)
  }
  map.on('click', layerSpecification.id, function(e) {
    if(layerSpecification.id!=="grid" || layerSpecification.id!=="grid-polygon"){
      addPopupToMap(map, layerSpecification.id, vectorSourceLayer, selectedFeatureId, e)
    }
    
});

  
  map.on('mouseenter', layerSpecification.id, function() {
    if(layerSpecification.id!=="grid"){
      map.getCanvas().style.cursor = 'pointer';
    }
    
  });
  map.on('mouseleave', layerSpecification.id, function() {
    map.getCanvas().style.cursor = '';
  });

 
}

const addDynamicTernaryGridToMap = (name, features) => {

  
  name = JSON.parse(JSON.stringify(name));

  // build source name
  const sourceName = `${name}_summary`;

  // build tile URLs
  const vectorSourceLayer = `public.${sourceName}`;
  const vectorUrl = `http://localhost:7800/${vectorSourceLayer}/{z}/{x}/{y}.pbf`;
  for (let i=0; i<features.length; i++){
        let layerToRemove = features[i].value+"_summary"
        let layerToRemove2 = features[i].value+"_moran_summary"
      let layer2 = map.getLayer(layerToRemove2);
        let layer = map.getLayer(layerToRemove);
        if(typeof layer !== 'undefined') {
            map.removeLayer(layerToRemove).removeSource(layerToRemove);
        }
        if(typeof layer2 !== 'undefined') {
            map.removeLayer(layerToRemove2).removeSource(layerToRemove2);
        }
    }
  map.addSource(sourceName, {
    type: "vector",
    tiles: [vectorUrl],
    promoteId: "id",
    minzoom: 0,
    maxzoom: 22,
  });

  // Remove the prefix "uhi_"
  const str = name.replace(/^uhi_/, "");

  // Build your fill layer dynamically
  map.addLayer({
    id: sourceName,
    source: sourceName,
    "source-layer": "default",
    type: "fill",
    paint: {
      "fill-color": [
        "rgb",
        ["*", 255, ["get", "prediction_ternary"]],     // RED
        ["*", 255, ["get", `${str}_ternary`]],        // GREEN
        ["*", 255, ["get", `${str}_shap_ternary`]]    // BLUE
      ],
      "fill-opacity": 1,
      "fill-outline-color": "#ffffff",
      
    },
  }, 'place_suburb');
  

  map.on('idle', () => {
    
    if(!map.getLayer(sourceName)) return;
    const features = map.queryRenderedFeatures({ layers: [sourceName] });
    let ternaryData = [];
    let uncertaintyData = [];
    features.forEach(f => {
        const P = f.properties.prediction_ternary;
        const F = f.properties[`${str}_ternary`];
        const S = f.properties[`${str}_shap_ternary`];
        const hex_id= f.properties.hex_id
        ternaryData.push({P, F, S, hex_id});
       // 👉 convert vector tile feature → GeoJSON
        

        uncertaintyData.push({
          type: "Feature",
          geometry: f.geometry,
          properties: {
            uncertainty: f.properties.uncertainty ?? f.properties.prediction,
            hex_id
          }
        });
        
      });
      const uncertaintyGeoJSON = {
        type: "FeatureCollection",
        features: uncertaintyData
      };
     uhiStore.assignTernaryArray({ternaryArray: ternaryData})
     uhiStore.assignUncertaintyArray({uncertaintyArray: uncertaintyGeoJSON})
    
     
  });
 
    let isTernaryLoading = false;

    map.on('dataloading', (e) => {
        // Only trigger if it's our specific vector source
        if (e.sourceId === sourceName && uhi_activated_tab.value === 'ternary') {
            isTernaryLoading = true;
            progressStore.setProgressBar({
                text: "Retrieving tiles...",
                progress: true
            });
        }
    });

    // Clean helper to close the progress bar safely
    const hideTernaryProgress = () => {
        if (isTernaryLoading) {
            isTernaryLoading = false;
            progressStore.setProgressBar({ progress: false });
        }
    };

    map.on('data', (e) => {
        if (uhi_activated_tab.value !== 'ternary') return;

        // Check if the source is fully loaded and tiles are ready
        if (e.sourceId === sourceName && e.dataType === 'source' && e.isSourceLoaded) {
            hideTernaryProgress();
        }
    });

    // Safety Net 1: Map finishes rendering completely (handles cache hits perfectly)
    map.on('idle', () => {
        hideTernaryProgress();
    });

    // Safety Net 2: Network or tile rendering errors happen
    map.on('error', () => {
        hideTernaryProgress();
    });
  

  map.on("click", sourceName, (e) => {
    const f = e.features[0];

    const P = f.properties.prediction_ternary;
    const F = f.properties[`${str}_ternary`];
    const S = f.properties[`${str}_shap_ternary`];

    // Save in store if needed
    uhiStore.setSelectedTernary({ P, F, S });
    //highlightMapHex({hex_id: f.properties.hex_id, selected_feature: name})
    highlightMapHex({ hex_id: f.properties.hex_id, selected_feature: name });

  });
  
};
const highlightMapHex = (payload)=>{
   //map.setFilter(payload.selected_feature+"_summary", ["==", "hex_id", payload.hex_id]);
   const feature = map.queryRenderedFeatures({ layers: [payload.selected_feature+"_summary"] });
   let selectedHighlightFeature 
    feature.forEach(f => {
        if(f.properties.hex_id === payload.hex_id){
            selectedHighlightFeature = f
        }
    });
    const sourceId = 'highlight-outline-source';
    const layerId = 'highlight-outline-layer';

    if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
    }
    if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
    }

    // Check if a geometry exists
    if (!selectedHighlightFeature || !selectedHighlightFeature.geometry) {
        return;
    }

    // 2. DEFINE SOURCE
    map.addSource(sourceId, {
        type: 'geojson',
        data: selectedHighlightFeature.geometry
    });

    // 3. ADD LINE LAYER
    map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#FF0000', // Red
            'line-width': 3,
            'line-opacity': 1
        }
    });
}
const addDynamicUncertaintyOverlay =(geojson)=>{
  if (map.getLayer('uncertainty-noise-layer')!== undefined){
    map.removeLayer('uncertainty-noise-layer')
  }
  addNoiseMapWithGrainSizeToMap(geojson, map)
}
const addDynamicMoranUncertaintyOverlay = (geojson)=>{
  if (map.getLayer("moran-uncertainty-noise-layer")!== undefined){
    map.removeLayer("moran-uncertainty-noise-layer")
   }
  addNoiseMapWithGrainSizeForMoranPValueToMap(geojson, map)
}
const addMoranFeatureToMap = (name, attribute, features)=>{
  
    name = JSON.parse(JSON.stringify(name));

    // build source name
    const sourceName = `uhi_${name}_moran_summary`;
  for (let i=0; i<features.value.length; i++){
   
      let layerToRemove = "uhi_"+features.value[i].value+"_moran_summary"
      let layerToRemove2 = "uhi_"+features.value[i].value+"_summary"
      let layer = map.getLayer(layerToRemove);
      let layer2 = map.getLayer(layerToRemove2);
      if(typeof layer !== 'undefined') {
          map.removeLayer(layerToRemove).removeSource(layerToRemove);
      }
      if(typeof layer2 !== 'undefined') {
          map.removeLayer(layerToRemove2).removeSource(layerToRemove2);
      }
  }
  
    // build tile URLs
    const vectorSourceLayer = `public.${sourceName}`;
    const vectorUrl = `http://localhost:7800/${vectorSourceLayer}/{z}/{x}/{y}.pbf`;

    map.addSource(sourceName, {
      type: "vector",
      tiles: [vectorUrl],
      promoteId: "id",
      minzoom: 0,
      maxzoom: 22,
    });
    

    // Build your fill layer dynamically
    map.addLayer({
      id: sourceName,
      source: sourceName,
      "source-layer": "default",
      type: "fill",
      paint: {
        "fill-color": [
          "match",
          ["get",  `${attribute}_local_q`],
            1, "#ff0000", // HH - Red
            2, "#6ecff5", // LH - light Blue
            3, "#0000ff", // LL - blue
            4, "#f2aa1b", // HL - Yellow
          "#ffffff"   // Default color (white)
        ],
        "fill-opacity": 1,
        "fill-outline-color": "#ffffff",
        
      },
    }, 'place_suburb');
     map.on('idle', () => {
    
      if(!map.getLayer(sourceName)) return;
        const features = map.queryRenderedFeatures({ layers: [sourceName] });
        let moranUncertaintyData = [];
        features.forEach(f => {
            //tcd_local_p

            moranUncertaintyData.push({
              type: "Feature",
              geometry: f.geometry,
              properties: {
                uncertainty: f.properties[`${attribute}_local_p`],
                hex_id: f.properties.hex_id
              }
            });
            
          });
          const uncertaintyGeoJSON = {
            type: "FeatureCollection",
            features: moranUncertaintyData
          };
          uhiStore.assignMoranUncertaintyArray({moranUncertaintyArray: uncertaintyGeoJSON})
      });
       let isMoranLoading = false;

    // 1. Start the progress bar ONLY when your specific source starts loading
    map.on('dataloading', (e) => {
        if (uhi_activated_tab.value !== 'moran') return;
        
        if (e.sourceId === sourceName) {
            isMoranLoading = true;
            progressStore.setProgressBar({
                text: "Retrieving the tiles..",
                progress: true
            });
        }
    });

    // Helper to turn off progress bar safely
    const hideMoranProgress = () => {
        if (isMoranLoading) {
            isMoranLoading = false;
            progressStore.setProgressBar({ progress: false });
        }
    };

    // 2. Stop the progress bar when the ENTIRE source is ready (not just one tile)
    map.on('data', (e) => {
        if (uhi_activated_tab.value !== 'moran') return;
        
        if (
            e.sourceId === sourceName &&
            e.dataType === 'source' &&
            e.isSourceLoaded
        ) {
            hideMoranProgress();
        }
    });

    // 3. Safety Nets to prevent hanging loaders on cache hits or network errors
    map.on('idle', () => {
        hideMoranProgress();
    });

    map.on('error', () => {
        hideMoranProgress();
    });
  map.on("click", sourceName, (e) => {
    const f = e.features[0];

    highlightMapHex({ hex_id: f.properties.hex_id, selected_feature: name });

  });
    
}
const addDynamicFeatureGridToMap = (feature, features) => {
  let name = JSON.parse(JSON.stringify(feature.value));

  // build source name
  const sourceName = `${name}_summary`;
  let str
  if (name==='uhi'){
    str = 'prediction'
  }
  else {
    str = name.replace(/^uhi_/, "");
  }
  
  // build tile URLs
  for (let i=0; i<features.length; i++){
   
      let layerToRemove = features[i].value+"_summary"
       let layerToRemove2 = features[i].value+"_moran_summary"
      let layer = map.getLayer(layerToRemove);
      let layer2 = map.getLayer(layerToRemove2);
      if(typeof layer2 !== 'undefined') {
          map.removeLayer(layerToRemove2).removeSource(layerToRemove2);
      }
      if(typeof layer !== 'undefined') {
          map.removeLayer(layerToRemove).removeSource(layerToRemove);
      }
  }
  const vectorSourceLayer = `public.${sourceName}`;
  const vectorUrl = `http://localhost:7800/${vectorSourceLayer}/{z}/{x}/{y}.pbf`;

  map.addSource(sourceName, {
    type: "vector",
    tiles: [vectorUrl],
    promoteId: "id",
    minzoom: 0,
    maxzoom: 22,
  });

  // Remove the prefix "uhi_"
  // Build your fill layer dynamically
  map.addLayer({
    id: sourceName,
    source: sourceName,
    "source-layer": "default",
    type: "fill",
    paint: {
      "fill-color": [
        "step",
        ["get", str],
          feature.feature_color_palette[0],          // Class 1 (≤ 38.59)
          feature.feature_classes[1], feature.feature_color_palette[1],  // Class 2
          feature.feature_classes[2], feature.feature_color_palette[2],  // Class 3
          feature.feature_classes[3], feature.feature_color_palette[3],  // Class 4
          feature.feature_classes[4], feature.feature_color_palette[4]   // Class 5
      ],
      "fill-opacity": 1,
      "fill-outline-color": "#969696",
      
    },
  }, 'place_suburb');

   let isTilesLoading = false;

    map.on('dataloading', (e) => {
        if (e.sourceId === sourceName && uhi_activated_tab.value === 'feature') {
            isTilesLoading = true;
            progressStore.setProgressBar({
                text: `Retrieving ${feature.name} tiles...`,
                progress: true
            });
        }
    });

    const hideProgressBar = () => {
        if (isTilesLoading) {
            isTilesLoading = false;
            progressStore.setProgressBar({ progress: false });
        }
    };

    map.on('data', (e) => {
        if (e.sourceId === sourceName && e.dataType === 'source' && e.isSourceLoaded) {
            hideProgressBar();
        }
    });

    // Safety Net 1: Map has finished rendering and is doing nothing
    map.on('idle', () => {
        hideProgressBar();
    });

    // Safety Net 2: Network or tile loading errors happen
    map.on('error', () => {
        hideProgressBar();
    });
  map.on("click", sourceName, (e) => {
    const f = e.features[0];

   

    //highlightMapHex({hex_id: f.properties.hex_id, selected_feature: name})
    highlightMapHex({ hex_id: f.properties.hex_id, selected_feature: name });

  });
   
    
  
  

}
const addDynamicShapGridToMap = (feature, features) => {
  console.log(feature, "feature in addDynamicFeatureGridToMap")
  let name = JSON.parse(JSON.stringify(feature.value));

  // build source name
  const sourceName = `${name}_summary`;
  let str = name.replace(/^uhi_/, "");
  str = str+"_shap"
  // build tile URLs
  for (let i=0; i<features.length; i++){
    
    let layerToRemove = features[i].value+"_summary"
    let layerToRemove2 = features[i].value+"_moran_summary"
    let layer2 = map.getLayer(layerToRemove2);
    let layer = map.getLayer(layerToRemove);
    if(typeof layer !== 'undefined') {
        map.removeLayer(layerToRemove).removeSource(layerToRemove);
    }
     if(typeof layer2 !== 'undefined') {
          map.removeLayer(layerToRemove2).removeSource(layerToRemove2);
      }
  }
  const vectorSourceLayer = `public.${sourceName}`;
  const vectorUrl = `http://localhost:7800/${vectorSourceLayer}/{z}/{x}/{y}.pbf`;

  map.addSource(sourceName, {
    type: "vector",
    tiles: [vectorUrl],
    promoteId: "id",
    minzoom: 0,
    maxzoom: 22,
  });

  // Remove the prefix "uhi_"
  console.log(str, "str in addDynamicFeatureGridToMap")
  // Build your fill layer dynamically
  map.addLayer({
    id: sourceName,
    source: sourceName,
    "source-layer": "default",
    type: "fill",
    paint: {
      "fill-color": [
        "step",
        ["get", str],
          feature.shap_color_palette[0],          // Class 1 (≤ 38.59)
          feature.shap_classes[1], feature.shap_color_palette[1],  // Class 2
          feature.shap_classes[2], feature.shap_color_palette[2],  // Class 3
          feature.shap_classes[3], feature.shap_color_palette[3],  // Class 4
          feature.shap_classes[4], feature.shap_color_palette[4]   // Class 5
      ],
      "fill-opacity": 1,
      "fill-outline-color": "#969696",
      
    },
  }, 'place_suburb');

  let isShapLoading = false;

  // 1. ONLY turn the progress bar ON when a source starts loading
  map.on('dataloading', (e) => {
      if (uhi_activated_tab.value !== 'shap') return;
      if (e.sourceId === sourceName) {
          isShapLoading = true;
          progressStore.setProgressBar({
              text: `Retrieving the ${feature.name} SHAP tiles..`,
              progress: true
          });
      }
  });

  // Helper to turn off progress bar safely
  const hideShapProgress = () => {
      if (isShapLoading) {
          isShapLoading = false;
          progressStore.setProgressBar({ progress: false });
      }
  };

  // 2. Turn it OFF when your specific source finishes loading
  map.on('data', (e) => {
      if (uhi_activated_tab.value !== 'shap') return;
      
      if (
          e.sourceId === sourceName &&
          e.dataType === 'source' &&
          e.isSourceLoaded
      ) {
          hideShapProgress();
      }
  });

  // 3. SAFETY NETS: Map finishes rendering completely or hits an error
  map.on('idle', () => {
      hideShapProgress();
  });

  map.on('error', () => {
      hideShapProgress();
  });
  map.on("click", sourceName, (e) => {
    const f = e.features[0];

    highlightMapHex({ hex_id: f.properties.hex_id, selected_feature: name });

  });
  
  
  
}
const addDynamicBivariateGridToMap = (feature, feature2, BIVARIATE_COLORS, features) => {
  console.log(feature2, "feature2 in addDynamicBivariateGridToMap")
  let name = JSON.parse(JSON.stringify(feature.value));
  const sourceName = `${name}_summary`;
  // build source name
  const str = name.replace(/^uhi_/, "");
  let secondvarname = null
  if (feature2.value === "uhi"){
    secondvarname = "prediction"
  }
  else {
    secondvarname = feature2.value.replace(/^uhi_/, "")
    secondvarname = str+"_shap"
  }
  for (let i=0; i<features.length; i++){
   
      let layerToRemove = features[i].value+"_summary"
      let layer = map.getLayer(layerToRemove);
      if(typeof layer !== 'undefined') {
          map.removeLayer(layerToRemove).removeSource(layerToRemove);
      }
      let layerToRemove2 = features[i].value+"_moran_summary"
      let layer2 = map.getLayer(layerToRemove2);
      if(typeof layer2 !== 'undefined') {
          map.removeLayer(layerToRemove2).removeSource(layerToRemove2);
      }

  }
  const FEATURE_BREAKS = feature.feature_classes
  const SHAP_BREAKS = feature2.shap_classes
  const featureClass = [
    "step",
    ["get", str],
    0,
    FEATURE_BREAKS[1], 1,
    FEATURE_BREAKS[2], 2,
    FEATURE_BREAKS[3], 3,
    FEATURE_BREAKS[4], 4
  ];

  const shapClass = [
    "step",
    ["get", secondvarname],
    0,
    SHAP_BREAKS[1], 1,
    SHAP_BREAKS[2], 2,
    SHAP_BREAKS[3], 3,
    SHAP_BREAKS[4], 4
  ];
  
  const bivariateIndex = [
    "+",
    ["*", featureClass, 5],
    shapClass
  ];
  
  const vectorSourceLayer = `public.${sourceName}`;
  const vectorUrl = `http://localhost:7800/${vectorSourceLayer}/{z}/{x}/{y}.pbf`;
  map.addSource(sourceName, {
    type: "vector",
    tiles: [vectorUrl],
    promoteId: "id",
    minzoom: 0,
    maxzoom: 22,
  });

  // Remove the prefix "uhi_"
  console.log(str, "str in addDynamicFeatureGridToMap")
  // Build your fill layer dynamically
  map.addLayer({
    id: sourceName,
    source: sourceName,
    "source-layer": "default",
    type: "fill",
    paint: {
      "fill-color": [
        "match",
        bivariateIndex,
        0,  BIVARIATE_COLORS[0],
        1,  BIVARIATE_COLORS[1],
        2,  BIVARIATE_COLORS[2],
        3,  BIVARIATE_COLORS[3],
        4,  BIVARIATE_COLORS[4],
        5,  BIVARIATE_COLORS[5],
        6,  BIVARIATE_COLORS[6],
        7,  BIVARIATE_COLORS[7],
        8,  BIVARIATE_COLORS[8],
        9,  BIVARIATE_COLORS[9],
        10, BIVARIATE_COLORS[10],
        11, BIVARIATE_COLORS[11],
        12, BIVARIATE_COLORS[12],
        13, BIVARIATE_COLORS[13],
        14, BIVARIATE_COLORS[14],
        15, BIVARIATE_COLORS[15],
        16, BIVARIATE_COLORS[16],
        17, BIVARIATE_COLORS[17],
        18, BIVARIATE_COLORS[18],
        19, BIVARIATE_COLORS[19],
        20, BIVARIATE_COLORS[20],
        21, BIVARIATE_COLORS[21],
        22, BIVARIATE_COLORS[22],
        23, BIVARIATE_COLORS[23],
        24, BIVARIATE_COLORS[24],
        "#000000"
      ],
      "fill-opacity": 1,
      "fill-outline-color": "#ffffff",
      
    },
  }, 'place_suburb');

   let isBivariateLoading = false;

    // 1. Start the progress bar ONLY when the source actually starts loading
    map.on('dataloading', (e) => {
        if (uhi_activated_tab.value !== 'bivariate') return;
        
        if (e.sourceId === sourceName) {
            isBivariateLoading = true;
            progressStore.setProgressBar({
                text: "Retrieving the tiles..",
                progress: true
            });
        }
    });

    // Helper to turn off progress bar safely
    const hideBivariateProgress = () => {
        if (isBivariateLoading) {
            isBivariateLoading = false;
            progressStore.setProgressBar({ progress: false });
        }
    };

    // 2. Stop the progress bar when the entire source is finished
    map.on('data', (e) => {
        if (uhi_activated_tab.value !== 'bivariate') return;
        
        if (
            e.sourceId === sourceName &&
            e.dataType === 'source' &&
            e.isSourceLoaded // Checks the whole source, not just one individual tile
        ) {
            hideBivariateProgress();
        }
    });

    // 3. Safety Nets (Essential for Mapbox/Maplibre state stability)
    map.on('idle', () => {
        hideBivariateProgress();
    });

    map.on('error', () => {
        hideBivariateProgress();
    });
  map.on("click", sourceName, (e) => {
    const f = e.features[0];

    highlightMapHex({ hex_id: f.properties.hex_id, selected_feature: name });

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
  let workspace
  if (activeMenu.value=="xai"){
      workspace="geoxai"
  }
  else if (activeMenu.value=="uhi"){
      workspace="uhi"
  }
  if(typeof coverageLayer == 'undefined') {
    let geoserver_base_url= process.env.VUE_APP_GEOSERVER_URL
    map.addSource(clickedLayerName, {
      'type': layerType.value,
      'tiles': [
        geoserver_base_url+'/'+workspace+'/wms?BBOX={bbox-epsg-3857}&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG:3857&WIDTH=256&HEIGHT=256&LAYERS='+workspace+':'+clickedLayerName+'&FORMAT=image/PNG&transparent=true'
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
  map.moveLayer(clickedLayerName, "place_suburb");
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
    map.moveLayer(clickedLayerName, /*'road_major'*/);
  }
  

}
const setLayerPaintProperty = (layerId, styleProperty, fillStyle)=>{
  console.log(layerId, styleProperty, fillStyle, "setLayerPaintProperty");
  map.setPaintProperty(
    layerId,
    styleProperty,
    fillStyle
  );
}

const removeLayerFromMap = (layerId)=>{
  let layer = map.getLayer(layerId);

  if(typeof layer !== 'undefined') {

      map.removeLayer(layerId).removeSource(layerId);
  }
}
const removeCustomLayerFromMap = (layerId)=>{
  let layer = map.getLayer(layerId);

  if(typeof layer !== 'undefined') {

      map.removeLayer(layerId);
  }
}

const getClickedCoordinate = ()=>{
  
  map.on('click', (e) => {
    //const canvasCoords = [e.point.x, e.point.y];
    //const picked = map.getLayer("cube")?.implementation?.scene.pick(canvasCoords[0], canvasCoords[1]);
    if (activeMenu.value=='xai' || activeMenu.value=='uhi'){
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
  map.moveLayer(layerID, /*'road_major'*/);
  
  
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
  if (drawControl) {
      map.removeControl(drawControl);
      drawControl = null;
  }
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

const addCircleLayerToMap = (geojson, prop1, prop2, classes, classes1, visVar1, visVar2)=>{
  
  removeDeckglLayers()
  addDeckglCircleLayer(geojson, prop1, prop2, classes, classes1,visVar1, visVar2, map)
 
}
const addCircleLayerWithInkUncertainty = (geojson, prop1, prop2, prop3, classes, classes1, visVar1, visVar2)=>{
  removeDeckglLayers()
  addDeckglCircleLayerWithUncertainty(geojson, prop1, prop2, prop3, classes, classes1, visVar1, visVar2, map)
}
const addCircleLayerWithInkUncertaintyOneProp = (geojson, prop1, classes1, prop2, visVar1)=>{
  removeDeckglLayers()
  addDeckglCircleLayerOnePropWithUncertainty(geojson, prop1, classes1, prop2,visVar1, map)

}
const addSquareLayerToMap = (geojson, prop1,prop2, classes, classes1,visVar1, visVar2)=>{
    removeDeckglLayers()
    addDeckglSquareLayerToMap(geojson, prop1, prop2, classes, classes1,visVar1, visVar2, map) 
}

const addPatternLayerToMap = (geojson, prop1, prop2, prop3, classes, classes1, visVar1, visVar2)=>{
      removeDeckglLayers()
      addCustomPatternLayerToMap(geojson, prop1, prop2, prop3, classes, classes1, visVar1, visVar2, map)
}
const addCustomMapboxBorderLayerToMap=(geojson, prop1, prop2, prop3, classes, classes1, visVar1, visVar2)=>{
  removeDeckglLayers()
  addCustomBorderLayerToMap(geojson, prop1, prop2, prop3, classes, classes1, visVar1, visVar2, map)
}

const addPatternLayerWithOrientationToMap=(geojson, prop1, prop2, prop3, classes, classes1, visVar1, visVar2)=>{
  removeDeckglLayers()
  addCustomPatternLayerWithOrientationToMap(geojson, prop1, prop2, prop3, classes, classes1, visVar1, visVar2, map)
}
/*const addPatternLayerToMap = (geojson, prop1,prop2, classes)=>{
      removeDeckglLayers()
      function createSquarePolygonFromPoint(center, sizeInMeters) {
        const [lon, lat] = center;

        // Approximate meters per degree at given latitude
        const metersPerDegreeLat = 111320;
        const metersPerDegreeLon = 40075000 * Math.cos(lat * Math.PI / 180) / 360;

        const halfWidthLon = (sizeInMeters / 2) / metersPerDegreeLon;
        const halfHeightLat = (sizeInMeters / 2) / metersPerDegreeLat;

        return {
          type: "Polygon",
          coordinates: [[
            [lon - halfWidthLon, lat - halfHeightLat],
            [lon + halfWidthLon, lat - halfHeightLat],
            [lon + halfWidthLon, lat + halfHeightLat],
            [lon - halfWidthLon, lat + halfHeightLat],
            [lon - halfWidthLon, lat - halfHeightLat], // Close the ring
          ]]
        };
      }
      const squareGeojson = {
      type: "FeatureCollection",
      features: geojson.features.map(feature => {
        const center = feature.geometry.coordinates;
        const size = feature.properties[prop1+'_d']* (720/1200);
        if (feature.properties.uncertainty === 0) {
          feature.properties.uncertainty = 0.0001;
        }
        return {
          type: "Feature",
          geometry: createSquarePolygonFromPoint(center, size),
          properties: feature.properties,
        };
      })
    };
    console.log(squareGeojson, "squareGeojson")
    const highlightLayer = {
      id: 'highlight',
      type: 'custom',

      onAdd(map, gl) {
        const vertexSource = `#version 300 es
          uniform mat4 u_matrix;

          in vec2 a_pos;
          in vec2 a_local;
          in vec3 a_color;

          out vec2 v_local;
          out vec3 v_color;

          in float a_uncertainty;
          out float v_uncertainty;

          void main() {
              gl_Position = u_matrix * vec4(a_pos, 0.0, 1.0);
              v_local = a_local;
              v_color = a_color;
              v_uncertainty = a_uncertainty;
          }`;

        const fragmentSource = `#version 300 es
          precision highp float;

          in vec2 v_local;
          in vec3 v_color;
          in float v_uncertainty;
          out vec4 fragColor;

          void main() {
              // Normalize local coords from [-1, 1] → [0, 1]
              vec2 coord = (v_local + 1.0) / 2.0;

              // Rotate coordinate system based on uncertainty
              float angle = v_uncertainty * 3.1415926; // rotate up to 180 degrees
              float cosA = cos(angle);
              float sinA = sin(angle);
              
              // Apply 2D rotation
              vec2 rotated = vec2(
                  coord.x * cosA - coord.y * sinA,
                  coord.x * sinA + coord.y * cosA
              );

              // Create stripes using rotated x
              float stripeCount = 10.0;  // total number of stripes across 1 unit
              float stripeWidth = 0.7;   // fixed width for each stripe

              float posInStripe = mod(rotated.x * stripeCount, 1.0);
              float isInStripe = step(posInStripe, stripeWidth);

              // If uncertainty is 0 (almost), draw solid color
              if (v_uncertainty < 0.0001) {
                  fragColor = vec4(v_color, 1.0);
              } else {
                  fragColor = vec4(v_color, isInStripe);
              }
          }`;

        // Compile shaders
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexSource);
        gl.compileShader(vertexShader);

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentSource);
        gl.compileShader(fragmentShader);

        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);

        this.aPos = gl.getAttribLocation(this.program, 'a_pos');

        const vertices = [];
        const localCoords = [];
        const colors = [];
        const uncertainties = [];

        squareGeojson.features.forEach(feature => {
          const uncertainty = feature.properties.uncertainty || 1; 
          const stripeWidth = Math.min(Math.max(uncertainty, 0), 10); 

          for (let i = 0; i < 4; i++) {
            uncertainties.push(stripeWidth);
          }
          const coords = feature.geometry.coordinates[0];
          const props = feature.properties;
          const squareLocal = [
            [-1, -1],
            [ 1, -1],
            [ 1,  1],
            [-1,  1]
          ];

          const category = props[prop2];
          const value5 = JSON.parse(classes); // assuming `classes` is defined outside
          let color;

          if (category < value5[0]) color = [215, 25, 28];
          else if (category <= value5[1]) color = [253, 174, 97];
          else if (category <= value5[2]) color = [255, 255, 191];
          else if (category <= value5[3]) color = [166, 217, 106];
          else if (category <= value5[4]) color = [26, 150, 65];
          else color = [0, 0, 0];
          
          coords.slice(0, 4).forEach((coord, i) => {
            const merc = MercatorCoordinate.fromLngLat({ lng: coord[0], lat: coord[1] });
            vertices.push(merc.x, merc.y);
            localCoords.push(...squareLocal[i]);
            colors.push(...color.map(c => c / 255)); // normalize to [0,1] range
          });
        });


        this.vertexCount = squareGeojson.features.length;

        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        // local coord buffer
        this.localBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.localBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(localCoords), gl.STATIC_DRAW);

        this.colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        // uncertainty buffer
        this.uncertaintyBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uncertaintyBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uncertainties), gl.STATIC_DRAW);
      },

      render(gl, args) {
        gl.useProgram(this.program);

        // matrix
        gl.uniformMatrix4fv(
          gl.getUniformLocation(this.program, 'u_matrix'),
          false,
          args.defaultProjectionData.mainMatrix
        );

        // position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.enableVertexAttribArray(this.aPos);
        gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 0, 0);

        // color buffer
        const aColor = gl.getAttribLocation(this.program, 'a_color');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.enableVertexAttribArray(aColor);
        gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);

        // local coord buffer
        const aLocal = gl.getAttribLocation(this.program, 'a_local');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.localBuffer);
        gl.enableVertexAttribArray(aLocal);
        gl.vertexAttribPointer(aLocal, 2, gl.FLOAT, false, 0, 0);

        // Bind uncertainty attribute
        const aUncertainty = gl.getAttribLocation(this.program, 'a_uncertainty');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uncertaintyBuffer);
        gl.enableVertexAttribArray(aUncertainty);
        gl.vertexAttribPointer(aUncertainty, 1, gl.FLOAT, false, 0, 0);

        // draw
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        for (let i = 0; i < this.vertexCount; i++) {
          gl.drawArrays(gl.TRIANGLE_FAN, i * 4, 4);
        }

      }

    };

    // add the custom style layer to the map
    map.addLayer(highlightLayer);
    map.on('click', (e) => {
      const point = turf.point([e.lngLat.lng, e.lngLat.lat]);
      const feature = squareGeojson.features.find(f =>
        turf.booleanPointInPolygon(point, f)
      );
      let feat
        feat ={
          object:{
            "properties": feature?.properties,
          },
          
          x: e.point.x,
          y: e.point.y
        }

        addDeckglPopupToMap(feat, prop1, prop2, 'uncertainty')
    });

    

}
*/
const addFuzzyLayerToMap = (geojson, prop1, classes1, prop2, visVar1) => {
  removeDeckglLayers()
  addDeckglFuzzyLayerToMap(geojson, prop1, classes1, prop2, visVar1, map)
};
const addFuzzyLayerWithThreePropToMap= (geojson, prop1, prop2, prop3, classes, classes1, visVar1, visVar2)=>{
  removeDeckglLayers()
  addDeckglFuzzyLayerWithThreePropToMap(geojson, prop1, prop2, prop3, classes, classes1, visVar1, visVar2, map)
}

const addPositionLayerToMap = (geojson, prop1, prop2, prop3, classes, classes1, visVar1, visVar2,)=>{
  removeDeckglLayers()
  addDeckglPositionLayerToMap(geojson, prop1, prop2, prop3, classes, classes1, visVar1, visVar2, map)
}

const addArrowLayerWithThreePropToMap = (geojson, prop1, prop2, prop3, classes, classes1, visVar1, visVar2)=>{
  removeDeckglLayers()
  addDeckglArrowLayerWithThreePropToMap(geojson, prop1, prop2, prop3, classes, classes1, visVar1, visVar2, map)
}
const addArrowLayerWithTwoPropToMap= (geojson, prop1,prop2, classes, classes1,visVar1, visVar2)=>{
  removeDeckglLayers()
  addDeckglArrowLayerWithtwoPropToMap(geojson, prop1,prop2, classes, classes1,visVar1, visVar2, map)
}

const addCustomMapboxGrainNoiseLayerToMap=(geojson, prop1, prop2, prop3, classes, classes1, visVar1, visVar2)=>{
  removeDeckglLayers()
  addCustomBorderLayerWithNoisegrainToMap(geojson, prop1, prop2, prop3, classes, classes1, visVar1, visVar2, map)
}
const addAggregatedSHAPLayerToMap=(geojson,mode)=>{
  removeDeckglLayers()
  addDeckglAggregationPieLayer(geojson,mode, map)

}
const removeDeckglLayers = ()=>{
  let deckglLayers = [ 'fuzzy-layer-three-props','hexagon', 'glow-points', 'ffs-uncertainty-dot-layer', 'scatterplot', 'scatterplotCenter', 'arrow-layer', 'ink-layer', 'square-layer', 'aggregation-pie-layer']
  let mapboxLayers = ['highlight', 'border-uncertainty', 'border-uncertainty-noise-grain']
  if (mapboxOverlayLayer.value ) {
    map.removeControl(mapboxOverlayLayer.value);
    mapboxOverlayLayer.value = null;
  }
  for (let i = 0; i < deckglLayers.length; i++) {
    if (map.getLayer(deckglLayers[i])!== undefined) {
     
      map.removeLayer(deckglLayers[i])
      map.__deck.setProps({ layers: [] })
    }
  }
  for (let i = 0; i < mapboxLayers.length; i++) {
    if (map.getLayer(mapboxLayers[i])!== undefined) {
      map.removeLayer(mapboxLayers[i])
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