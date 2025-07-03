<template>
  <div ref="mapContainer" style="height: 100dvh;">
    
    <LayerUI @addLayerToMap="addLayerToMap" @toggleLayerVisibility="toggleLayerVisibility" @addCoverageLayerToMap="addCoverageLayerToMap" @toggleCoverageLayerVisibility="toggleCoverageLayerVisibility"> </LayerUI>
    <LegendUI></LegendUI>
    <MenuUI @removeLayerFromMap="removeLayerFromMap" @addLayerToMap="addLayerToMap"></MenuUI>
    <FilterUI v-if="activeMenu=='filter'" @activateBufferTool="activateBufferTool" @addGeojsonLayer="addGeojsonLayer" @fitBoundsToBBOX="fitBoundsToBBOX" @removeLayerFromMap="removeLayerFromMap" @removeDrawControl="removeDrawControl" @activatePolygonTool="activatePolygonTool"> </FilterUI>
    <XAI v-if="activeMenu=='xai' || activeMenu=='filter'" @addCoverageLayerToMap="addCoverageLayerToMap" @toggleCoverageLayerVisibility="toggleCoverageLayerVisibility" @getClickedCoordinate="getClickedCoordinate" @removeLayerFromMap="removeLayerFromMap" @toggleCoverageLayerVisibilityWithValue="toggleCoverageLayerVisibilityWithValue" @addXaiPulseLayer="addPulseLayerToMap"></XAI>
    <GeovisUI v-if="activeMenu=='geovis'" @addCircleLayerToMap="addCircleLayerToMap" @addSquareLayerToMap="addSquareLayerToMap" @addLayerToMap="addLayerToMap" @addFuzzyLayerToMap="addFuzzyLayerToMap" @addPositionLayerToMap="addPositionLayerToMap" @addArrowLayerWithThreePropToMap="addArrowLayerWithThreePropToMap" @addCircleLayerWithInkUncertainty="addCircleLayerWithInkUncertainty" @addPatternLayerToMap="addPatternLayerToMap" @addCircleLayerWithInkUncertaintyOneProp="addCircleLayerWithInkUncertaintyOneProp" @addFuzzyLayerWithThreePropToMap="addFuzzyLayerWithThreePropToMap" @addPatternLayerWithOrientationToMap="addPatternLayerWithOrientationToMap" @addArrowLayerWithTwoPropToMap="addArrowLayerWithTwoPropToMap" @addCustomMapboxBorderLayerToMap="addCustomMapboxBorderLayerToMap" @addCustomMapboxGrainNoiseLayerToMap="addCustomMapboxGrainNoiseLayerToMap"></GeovisUI>
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
import { addPopupToMap } from '../utils/mapUtils';
import { addPulseLayer } from '../utils/pulseLayer';

import { useMenuStore } from '../stores/menu'
import { useXAIStore } from '../stores/xai'
import { useFilterStore } from '../stores/filter'

import * as turf from "@turf/turf";

import { MaplibreTerradrawControl } from '@watergis/maplibre-gl-terradraw';
import '@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css';
import {addDeckglCircleLayerWithUncertainty, addDeckglCircleLayerOnePropWithUncertainty,addDeckglSquareLayerToMap, addDeckglFuzzyLayerToMap, addDeckglPositionLayerToMap, addDeckglArrowLayerWithThreePropToMap, addCustomPatternLayerToMap,addDeckglCircleLayer, addDeckglFuzzyLayerWithThreePropToMap, addCustomPatternLayerWithOrientationToMap, addDeckglArrowLayerWithtwoPropToMap, addCustomBorderLayerToMap, addCustomBorderLayerWithNoisegrainToMap} from '../utils/deckglLayers';


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

const addPatternLayerToMap = (geojson, prop1,prop2, classes)=>{
      removeDeckglLayers()
      addCustomPatternLayerToMap(geojson, prop1, prop2, classes, map)
}
const addCustomMapboxBorderLayerToMap=(geojson, prop1,prop2, classes)=>{
  preserveSquareLayer = true;
  removeDeckglLayers()
  addCustomBorderLayerToMap(geojson, prop1, prop2, classes, map)
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

const addArrowLayerWithThreePropToMap = (geojson, prop1, prop2, prop3, classes, classes1, visVar1, visVar2,)=>{
  removeDeckglLayers()
  addDeckglArrowLayerWithThreePropToMap(geojson, prop1, prop2, prop3, classes, classes1, visVar1, visVar2, map)
}
const addArrowLayerWithTwoPropToMap= (geojson, prop1,prop2, classes, classes1,visVar1, visVar2)=>{
  removeDeckglLayers()
  addDeckglArrowLayerWithtwoPropToMap(geojson, prop1,prop2, classes, classes1,visVar1, visVar2, map)
}

const addCustomMapboxGrainNoiseLayerToMap=(geojson, prop1,prop2, classes)=>{
  preserveSquareLayer = true;
  removeDeckglLayers()
  addCustomBorderLayerWithNoisegrainToMap(geojson, prop1,prop2, classes, map)
}

let preserveSquareLayer = false;
const removeDeckglLayers = ()=>{
  let deckglLayers = [ 'fuzzy-layer-three-props','hexagon', 'glow-points', 'ffs-uncertainty-dot-layer', 'scatterplot', 'scatterplotCenter', 'arrow-layer', 'ink-layer', 'square-layer']
  let mapboxLayers = ['highlight', 'border-uncertainty', 'border-uncertainty-noise-grain']
  if (mapboxOverlayLayer.value ) {
    map.removeControl(mapboxOverlayLayer.value);
    mapboxOverlayLayer.value = null;
  }
  for (let i = 0; i < deckglLayers.length; i++) {
    if (map.getLayer(deckglLayers[i])!== undefined) {
      if (preserveSquareLayer ) continue;
      map.removeLayer(deckglLayers[i])
      map.__deck.setProps({ layers: [] })
    }
  }
  for (let i = 0; i < mapboxLayers.length; i++) {
    if (map.getLayer(mapboxLayers[i])!== undefined) {
      map.removeLayer(mapboxLayers[i])
    }
  }
  preserveSquareLayer = false;
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