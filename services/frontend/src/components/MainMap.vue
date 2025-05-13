<template>
  <div ref="mapContainer" style="height: 100dvh;">
    
    <LayerUI @addLayerToMap="addLayerToMap" @toggleLayerVisibility="toggleLayerVisibility" @addCoverageLayerToMap="addCoverageLayerToMap" @toggleCoverageLayerVisibility="toggleCoverageLayerVisibility"> </LayerUI>
    <LegendUI></LegendUI>
    <MenuUI @removeLayerFromMap="removeLayerFromMap" @addLayerToMap="addLayerToMap"></MenuUI>
    <FilterUI v-if="activeMenu=='filter'" @activateBufferTool="activateBufferTool" @addGeojsonLayer="addGeojsonLayer" @fitBoundsToBBOX="fitBoundsToBBOX" @removeLayerFromMap="removeLayerFromMap" @removeDrawControl="removeDrawControl" @activatePolygonTool="activatePolygonTool"> </FilterUI>
    <XAI v-if="activeMenu=='xai' || activeMenu=='filter'" @addCoverageLayerToMap="addCoverageLayerToMap" @toggleCoverageLayerVisibility="toggleCoverageLayerVisibility" @getClickedCoordinate="getClickedCoordinate" @removeLayerFromMap="removeLayerFromMap" @toggleCoverageLayerVisibilityWithValue="toggleCoverageLayerVisibilityWithValue" @addXaiPulseLayer="addPulseLayerToMap"></XAI>
    <GeovisUI v-if="activeMenu=='geovis'" @addCircleLayerToMap="addCircleLayerToMap" @addSquareLayerToMap="addSquareLayerToMap" @addLayerToMap="addLayerToMap" @addFuzzyLayerToMap="addFuzzyLayerToMap" @addPositionLayerToMap="addPositionLayerToMap" @addArrowLayerToMap="addArrowLayerToMap" @addCircleLayerWithUncertainty="addCircleLayerWithUncertainty"></GeovisUI>
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
import GeovisUI from "@/components/GeovisUI.vue";
import AlertUI from "@/components/AlertUI.vue";
import  FilterUI from '@/components/FilterUI.vue'
import { addPopupToMap, addDeckglPopupToMap } from '../utils/mapUtils';
import { addPulseLayer } from '../utils/pulseLayer';

import { useMenuStore } from '../stores/menu'
import { useXAIStore } from '../stores/xai'
import { useFilterStore } from '../stores/filter'

import * as turf from "@turf/turf";

import { MaplibreTerradrawControl } from '@watergis/maplibre-gl-terradraw';
import '@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css';
import {/*MapboxOverlay,*/ MapboxLayer} from '@deck.gl/mapbox';
import { ScatterplotLayer,PolygonLayer} from '@deck.gl/layers';
//import {addCubeGeometry} from '../utils/addBabylon3DModel';
import {CustomScatterplotLayer, CustomFuzzyCircleLayer} from "../utils/shaders"
import { ScenegraphLayer } from '@deck.gl/mesh-layers';


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
    if(layerSpecification.id!=="grid"){
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
  console.log(clickedLayerName, "raster")
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
  map.moveLayer(clickedLayerName, /*'road_major'*/);
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

/*const addCircleLayerToMap = (geojson, prop1, prop2, classes)=>{
  
  removeDeckglLayers()
  mapboxOverlayLayer.value = new MapboxOverlay({
    interleaved: true,
    layers: [
      new ScatterplotLayer({
        id: 'hexagon',
        data: geojson.features,
        getPosition: d => d.geometry.coordinates,
        getRadius: d => d.properties[prop1+'_d'] * (362/1200),
        radiusUnits: 'meters',
        getFillColor: d => {
          const category = d.properties[prop2];
          //const value5 = JSON.parse(d.propertiesd[prop2+'5'])
          const value5 = JSON.parse(classes)
          if(category<value5[0]){
            return [215,25,28]; 
          }
          else if(category>value5[0] && category<=value5[1]){
            return [253,174,97]; 
          }
          else if(category>value5[1] && category<=value5[2]){
            return [255,255,191]; 
          }
          else if(category>value5[2] && category<=value5[3]){
            return [166,217,106];
          }
          else if(category>value5[3] && category<=value5[4]){
            return [26,150,65];
          }
          else {
            return [0, 0, 0]; // black
          }
        },
        getLineColor: [0, 0, 0],
        getLineWidth: 0,
        radiusScale: 1,
        pickable: true,
        autoHighlight: true,
        highlightColor: [0, 255, 0],
        onClick: (info) => console.log('Clicked:', info.object.properties),
        onHover: (info)=> addDeckglPopupToMap(info, prop1, prop2),
        
          
      })
    ]
  });
  map.addControl(mapboxOverlayLayer.value);
  
}
*/
const addCircleLayerWithUncertainty = (geojson, prop1, prop2, prop3, classes)=>{
  console.log(geojson, prop1, prop2, prop3, classes)
  removeDeckglLayers()
   // 5-class YlOrRd from colorbrewer
   
  let customLayer = new MapboxLayer({
        id: 'hexagon',
        type: CustomFuzzyCircleLayer,
        data: geojson.features,
        getPosition: d => d.geometry.coordinates,
        getRadius: d => d.properties[prop1+'_d'] * (362/1200),
        radiusUnits: 'meters',
        getFillColor: d => {
          const category = d.properties[prop2];
          //const value5 = JSON.parse(d.propertiesd[prop2+'5'])
          const value5 = JSON.parse(classes)
          if(category<value5[0]){
            return [215,25,28]; 
          }
          else if(category>value5[0] && category<=value5[1]){
            return [253,174,97]; 
          }
          else if(category>value5[1] && category<=value5[2]){
            return [255,255,191]; 
          }
          else if(category>value5[2] && category<=value5[3]){
            return [166,217,106];
          }
          else if(category>value5[3] && category<=value5[4]){
            return [26,150,65];
          }
          else {
            return [0, 0, 0]; // black
          }
        },
        getLineColor: [0, 0, 0],
        getLineWidth: 0,
        radiusScale: 1,
        pickable: true,
        autoHighlight: true,
        highlightColor: [0, 255, 0],
        getUncertainty: d => {
          //console.log(d.properties.uncertainty);
          if(prop3){
            return d.properties[prop3];
          }
          else {
            return 0;
          }
        },
        //getUncertainty:0,
        updateTriggers: {
          getUncertainty: [prop3]
        },
        onClick: (info) => console.log('Clicked:', info.object.properties),
        onHover: (info)=> addDeckglPopupToMap(info, prop1, prop2, prop3),
    
  });
  map.addLayer(customLayer);

}
const addSquareLayerToMap = (geojson, prop1,prop2, classes)=>{
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

        return {
          type: "Feature",
          geometry: createSquarePolygonFromPoint(center, size),
          properties: feature.properties,
        };
      })
    };
    console.log(squareGeojson, "squareGeojson")
    let customLayer = new MapboxLayer({
        id: 'hexagon',
        type: PolygonLayer,
        data: squareGeojson.features,
        getPolygon: d => d.geometry.coordinates,
        getFillColor: d => {
          const category = d.properties[prop2];
          //const value5 = JSON.parse(d.propertiesd[prop2+'5'])
          const value5 = JSON.parse(classes)
          if(category<value5[0]){
            return [215,25,28]; 
          }
          else if(category>value5[0] && category<=value5[1]){
            return [253,174,97]; 
          }
          else if(category>value5[1] && category<=value5[2]){
            return [255,255,191]; 
          }
          else if(category>value5[2] && category<=value5[3]){
            return [166,217,106];
          }
          else if(category>value5[3] && category<=value5[4]){
            return [26,150,65];
          }
          else {
            return [0, 0, 0]; // black
          }
        },
        getLineColor: [0, 0, 0],
        getLineWidth: 0,
        pickable: true,
       
        onHover: (info)=> addDeckglPopupToMap(info, prop1, prop2)
    
  });
  map.addLayer(customLayer);
    

}





const addFuzzyLayerToMap = (geojson, prop1, prop2) => {
  removeDeckglLayers()
   // 5-class YlOrRd from colorbrewer
   const colorPalette = [
    [255, 255, 178], // 0.04111
    [254, 204, 92], // 0.1862
    [253, 141, 60], // 0.43577
    [240, 59, 32], // 0.72144
    [189, 0, 38] // >0.72144
  ];
 
  let customLayer = new MapboxLayer({
    id: 'glow-points',
    type: CustomScatterplotLayer,
    data: geojson.features,
    getPosition: d => d.geometry.coordinates,
    getRadius: 360,
    radiusUnits: 'meters',
    getFillColor: d => {
        const category = d.properties[prop1];
        if (category <= 0.04111) return colorPalette[0];
        else if (category <= 0.1862) return colorPalette[1];
        else if (category <= 0.43577) return colorPalette[2];
        else if (category <= 0.72144) return colorPalette[3];
        else return colorPalette[4];
      },

    filled: true,
    stroked: true,
    getLineColor: [0, 0, 0],
    getLineWidth: 1,
    lineWidthMinPixels: 1,
    getUncertainty: d => {
      //console.log(d.properties.uncertainty);
      return d.properties[prop2];
    },
    //getUncertainty:1,
    updateTriggers: {
      getUncertainty: [prop2]
    },
    //onClick: (info) => console.log('Clicked:', info.object.properties),
    pickable: true,
    onHover: (info)=> addDeckglPopupToMap(info, prop1, prop2)
    
  });
  map.addLayer(customLayer);
  
};

const addPositionLayerToMap = (geojson, prop1, prop2)=>{
  removeDeckglLayers()
// 5-class YlOrRd from colorbrewer
const colorPalette = [
    [255, 255, 178], // 0.04111
    [254, 204, 92], // 0.1862
    [253, 141, 60], // 0.43577
    [240, 59, 32], // 0.72144
    [189, 0, 38] // >0.72144
  ];
 
  let customLayer = new MapboxLayer({
    id: 'ffs-uncertainty-dot-layer',
    type: ScatterplotLayer,
    data: geojson.features,
    getPosition: d => d.geometry.coordinates,
    getRadius: 360,
    getFillColor: d => {
        const category = d.properties[prop1];
        if (category <= 0.04111) return colorPalette[0];
        else if (category <= 0.1862) return colorPalette[1];
        else if (category <= 0.43577) return colorPalette[2];
        else if (category <= 0.72144) return colorPalette[3];
        else return colorPalette[4];
      },
    getLineColor: [255, 255, 255],
    lineWidthMinPixels: 1,
    getUncertainty: d => {
      //console.log(d.properties.uncertainty);
      return d.properties[prop2];
    },
    //getUncertainty:1,
    updateTriggers: {
      getUncertainty: [prop2]
    },
    //onClick: (info) => console.log('Clicked:', info.object.properties)
    pickable: true,
    onHover: (info)=> addDeckglPopupToMap(info, prop1, prop2)
    
  });
  map.addLayer(customLayer);

  function shiftPosition(center, uncertainty) {
  const [lon, lat] = center;

  // Approximate meters per degree at given latitude
  const metersPerDegreeLat = 111320;
  const metersPerDegreeLon = 40075000 * Math.cos(lat * Math.PI / 180) / 360;

  // Circle radius in meters (fixed to 360 meters in this case)
  const radius = 360;
  const shiftDistance = uncertainty * radius; // Shift depends on uncertainty

  // Calculate shift in degrees
  const shiftLon = shiftDistance / metersPerDegreeLon;
  const shiftLat = shiftDistance / metersPerDegreeLat;

  // Calculate the shift in the direction of 45 degrees (π/4 radians)
  const angle = - 5 * (Math.PI / 4); // 45 degrees
  const offsetLon = shiftLon * Math.cos(angle);
  const offsetLat = shiftLat * Math.sin(angle);

  // Return the new shifted position
  return [lon + offsetLon, lat + offsetLat];
}

function applyUncertaintyShiftToFeatures(features) {
  return features.map(feature => {
    const center = feature.geometry.coordinates;
    const uncertainty = feature.properties.uncertainty; // Assuming uncertainty is stored here

    // Get the shifted position based on uncertainty
    const shiftedPosition = shiftPosition(center, uncertainty);

    // Return the feature with the updated position
    return {
      ...feature,
      geometry: {
        ...feature.geometry,
        coordinates: shiftedPosition
      }
    };
  });
  }
  const shiftedFeatures = applyUncertaintyShiftToFeatures(geojson.features);
// Now, you can use the shifted data in a ScatterplotLayer
let dotLayerCenter = new MapboxLayer({
  id: 'scatterplotCenter',
  type: ScatterplotLayer,
 
  data: geojson.features,
  getPosition: d => d.geometry.coordinates, // Use the shifted position
  getRadius: 20,
  getFillColor: [0, 0, 0],
  //coordinateSystem: COORDINATE_SYSTEM.LNGLAT, // Use lat/lng coordinate system
});
map.addLayer(dotLayerCenter);
let dotLayer = new MapboxLayer({
  id: 'scatterplot',
  type: ScatterplotLayer,
 
  data: shiftedFeatures,
  getPosition: d => d.geometry.coordinates, // Use the shifted position
  getRadius: 20,
  getFillColor: [255, 0, 0],
  //coordinateSystem: COORDINATE_SYSTEM.LNGLAT, // Use lat/lng coordinate system
});
map.addLayer(dotLayer);

  
}

const addArrowLayerToMap = (geojson, prop1, prop2, prop3)=>{
  removeDeckglLayers()
  const colorPalette = [
    [255, 255, 178], // 0.04111
    [254, 204, 92], // 0.1862
    [253, 141, 60], // 0.43577
    [240, 59, 32], // 0.72144
    [189, 0, 38] // >0.72144
  ];
  const sceneLayer = new MapboxLayer({
  id: 'arrow-layer',
  type: ScenegraphLayer,
  data: geojson.features,
  scenegraph: 'direction_arrow.glb', // public path
  getColor: d => {
        const category = d.properties[prop1];
        if (category <= 0.04111) return colorPalette[0];
        else if (category <= 0.1862) return colorPalette[1];
        else if (category <= 0.43577) return colorPalette[2];
        else if (category <= 0.72144) return colorPalette[3];
        else return colorPalette[4];
      },
  getPosition: d => d.geometry.coordinates,
  getOrientation: d => {
    const u = d.properties.uncertainty ?? 0;
    const yaw = 90 - 180 * u; // Maps 0 → 90, 1 → -90
    return [0, yaw, 90];       // [pitch, yaw, roll]
  },
  //getOrientation: [0, 90, 90],
  sizeScale: 100,
  getScale: d => {
          const category = d.properties.shap;
          const value5 = JSON.parse(prop3)
          if (prop3){
            if(category<value5[0]){
            return [1, 1, 1]; 
            }
            else if(category>value5[0] && category<=value5[1]){
              return [1.3, 1, 1.3]; 
            }
            else if(category>value5[1] && category<=value5[2]){
              return [1.6, 1, 1.6]; 
            }
            else if(category>value5[2] && category<=value5[3]){
              return [1.9, 1, 1.9];
            }
            else if(category>value5[3] && category<=value5[4]){
              return [2.2, 1, 2.2];
            }
            else {
              return [1, 1, 1];
            }
          }
          else {
            return [1, 1, 1];
          }
          
        },
        pickable: true,
       onHover: (info)=> addDeckglPopupToMap(info, prop1, prop2,"shap")
 
});

// Add it to your mapbox map
map.addLayer(sceneLayer);


}

const removeDeckglLayers = ()=>{
  console.log("remove")
  let deckglLayers = ['glow-points', 'ffs-uncertainty-dot-layer', 'scatterplot', 'scatterplotCenter',  'arrow-layer', 'hexagon']
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