import {CustomFuzzyCircleLayer, CustomScatterplotLayer} from "./shaders"

import {MapboxLayer} from '@deck.gl/mapbox';
import { addDeckglPopupToMap } from '../utils/mapUtils';
import { PolygonLayer, ScatterplotLayer} from '@deck.gl/layers';
import { ScenegraphLayer } from '@deck.gl/mesh-layers';
import * as turf from "@turf/turf";
import { MercatorCoordinate } from 'maplibre-gl';
import * as colorbrewer from 'colorbrewer';
import {hexToRgb} from '../utils/colorConversion';
import { useMapLegendStore } from '../stores/mapLegend'
let bivariateColorpalette = ({
             'high_low': '#be64ac', 'high_medium': '#8c62aa', 'high_high':'#3b4994',
             'medium_low': '#dfb0d6', 'medium_medium': '#a5add3', 'medium_high':'#5698b9',
            'low_low': '#e8e8e8', 'low_medium': '#ace4e4', 'low_high':'#5ac8c8'
})


export function addDeckglCircleLayer (geojson, prop1, prop2 , classes, classes1, visVar1, visVar2, map){
  let radiusVariable
  let colorVariable
  let classForRadius
  let classesForColor
  let bivariateColorVariable1
  let bivariateColorVariable2

  
  if(visVar1=='color' && visVar2=='size'){
    colorVariable= prop1;
    radiusVariable= prop2;

    classForRadius = classes;
    classesForColor = classes1;
  }
  else if(visVar1=='size' && visVar2=='color'){
    colorVariable= prop2;
    radiusVariable= prop1;

    classForRadius = classes1;
    classesForColor = classes;
  }
  else if(visVar1=='color' && visVar2=='color'){
    bivariateColorVariable1 = prop1;
    bivariateColorVariable2 = prop2;
  }

  // to support univariate mapping
  else if(visVar2==undefined){
    if(visVar1=='color'){
      colorVariable= prop1;
      classesForColor = classes1;
    }
    else if(visVar1=='size'){
      radiusVariable= prop1;
      classForRadius = classes1;
    }
  }
 
  let colorPalette = null;
 
  let colorPaletteName
  if (colorVariable== 'value'){
    colorPaletteName = colorbrewer.default.schemeGroups.sequential[1];
  }
  else{
    colorPaletteName = colorbrewer.default.schemeGroups.diverging[1];
  }
  colorPalette = colorbrewer.default[colorPaletteName][5];
  useMapLegendStore().assignColorPalette({name: colorPaletteName, colors: colorPalette});
  let scatter
  if(bivariateColorVariable1 && bivariateColorVariable2){
     scatter = new MapboxLayer({
        id: 'hexagon',
        type: ScatterplotLayer,
        data:  [...geojson.features],
        getPosition: d => d.geometry.coordinates,
        getRadius: 1200 * (362/1200),

        radiusUnits: 'meters',
        getFillColor: d => {
          const category1 = d.properties[bivariateColorVariable1+'3'];
          const category2 = d.properties[bivariateColorVariable2+'3'];
          if(category1 == "low" && category2 == "low"){
            return hexToRgb(bivariateColorpalette['low_low'])
          }
          else if(category1 == "low" && category2 == "medium"){
            return hexToRgb(bivariateColorpalette['low_medium'])
          }
          else if(category1 == "low" && category2 == "high"){
            return hexToRgb(bivariateColorpalette['low_high'])
          }
          else if(category1 == "medium" && category2 == "low"){
            return hexToRgb(bivariateColorpalette['medium_low'])
          }
          else if(category1 == "medium" && category2 == "medium"){
            return hexToRgb(bivariateColorpalette['medium_medium'])
          }
          else if(category1 == "medium" && category2 == "high"){
            return hexToRgb(bivariateColorpalette['medium_high'])
          }
          else if(category1 == "high" && category2 == "low"){
             return hexToRgb(bivariateColorpalette['high_low'])
          }
          else if(category1 == "high" && category2 == "medium"){
             return hexToRgb(bivariateColorpalette['high_medium'])
          }
          else if(category1 == "high" && category2 == "high"){
             return hexToRgb(bivariateColorpalette['high_high'])
          }

        },
        getLineColor: [0, 0, 0],
        getLineWidth: 0,
        radiusScale: 1,
        pickable: true,
        autoHighlight: true,
        highlightColor: [0, 255, 0],
        onClick: (info) => console.log('Clicked:', info),
        onHover: (info)=> addDeckglPopupToMap(info, prop1, prop2),
    
    });
     
  }
  else {
      scatter = new MapboxLayer({
        id: 'hexagon',
        type: ScatterplotLayer,
        data:  [...geojson.features],
        getPosition: d => d.geometry.coordinates,
        getRadius: d => {
          if (radiusVariable!==undefined){
            const category = d.properties[radiusVariable];
            const value5 = JSON.parse(classForRadius)
            if(category<value5[0]){
              return 150 * (362/1200)
            }
            else if(category>value5[0] && category<=value5[1]){
              return 400 * (362/1200)
            }
            else if(category>value5[1] && category<=value5[2]){
              return 600 * (362/1200)
            }
            else if(category>value5[2] && category<=value5[3]){
              return 900 * (362/1200)
            }
            else if(category>value5[3] && category<=value5[4]){
              return 1200 * (362/1200)
            }
            else {
              return 1200 * (362/1200)
            }
          }
          else{
            return 1200 * (362/1200)
          }
          
          
        },
        radiusUnits: 'meters',
        getFillColor: d => {
          if (colorVariable!==undefined){
            const category = d.properties[colorVariable];
            //const value5 = JSON.parse(d.propertiesd[prop2+'5'])
            const value5 = JSON.parse(classesForColor)
            if(category<value5[0]){
              //return [215,25,28]; 
              return hexToRgb(colorPalette[0]);
            }
            else if(category>value5[0] && category<=value5[1]){
              //return [253,174,97]; 
              return hexToRgb(colorPalette[1]);
            }
            else if(category>value5[1] && category<=value5[2]){
              // return [255,255,191]; 
              return hexToRgb(colorPalette[2]);
            }
            else if(category>value5[2] && category<=value5[3]){
              //return [166,217,106];
              return hexToRgb(colorPalette[3]);
            }
            else if(category>value5[3] && category<=value5[4]){
              //return [26,150,65];
              return hexToRgb(colorPalette[4]);
            }
            else {
              return [0, 0, 0]; // black
            }
          }
          else {
              return [255, 0, 0]; // red
          }
          
        },
        getLineColor: [0, 0, 0],
        getLineWidth: 0,
        radiusScale: 1,
        pickable: true,
        autoHighlight: true,
        highlightColor: [0, 255, 0],
        onClick: (info) => console.log('Clicked:', info),
        onHover: (info)=> addDeckglPopupToMap(info, prop1, prop2),
    
    });
  }
  
  map.addLayer(scatter);

}

export function addDeckglCircleLayerWithUncertainty (geojson, prop1, prop2, prop3, classes, classes1, visVar1, visVar2, map){

  
  let radiusVariable
  let colorVariable
  let classForRadius
  let classesForColor
   let bivariateColorVariable1
  let bivariateColorVariable2
  if(visVar1=='color' && visVar2=='size'){
    colorVariable= prop1;
    radiusVariable= prop2;

    classForRadius = classes;
    classesForColor = classes1;
  }
  else if(visVar1=='size' && visVar2=='color'){
    colorVariable= prop2;
    radiusVariable= prop1;

    classForRadius = classes1;
    classesForColor = classes;
  }
  else if(visVar1=='color' && visVar2=='color'){
    bivariateColorVariable1 = prop1;
    bivariateColorVariable2 = prop2;
  }
  let colorPalette = null;
  let colorPaletteName

  if (useMapLegendStore().selectedColorPalette!==null) {
    colorPalette = useMapLegendStore().selectedColorPalette.colors;
  }
  else {
    if (colorVariable== 'value'){
      colorPaletteName = colorbrewer.default.schemeGroups.sequential[1];
    }
    else{
      colorPaletteName = colorbrewer.default.schemeGroups.diverging[1];
    }
     colorPalette = colorbrewer.default[colorPaletteName][5];
    useMapLegendStore().assignColorPalette({name: colorPaletteName, colors: colorPalette});
  }

  let customLayer = new MapboxLayer({
        id: 'ink-layer',
        type: CustomFuzzyCircleLayer,
        data: [...geojson.features],
        getPosition: d => d.geometry.coordinates,
        getRadius: d => {
          if(radiusVariable!==undefined){
            const category = d.properties[radiusVariable];
            const value5 = JSON.parse(classForRadius)
            if(category<value5[0]){
              return 150 * (362/1200)
            }
            else if(category>value5[0] && category<=value5[1]){
              return 400 * (362/1200)
            }
            else if(category>value5[1] && category<=value5[2]){
              return 600 * (362/1200)
            }
            else if(category>value5[2] && category<=value5[3]){
              return 900 * (362/1200)
            }
            else if(category>value5[3] && category<=value5[4]){
              return 1200 * (362/1200)
            }
            else {
              return 1200 * (362/1200)
            }

          }

          else if(bivariateColorVariable1 && bivariateColorVariable2){
            return 1200 * (362/1200)
          }   
          
        },
        radiusUnits: 'meters',
        getFillColor: d => {
          if(colorVariable!==undefined){
            const category = d.properties[colorVariable];
            //const value5 = JSON.parse(d.propertiesd[prop2+'5'])
            const value5 = JSON.parse(classesForColor)
            if(category<value5[0]){
              //return [215,25,28]; 
              return hexToRgb(colorPalette[0]);
            }
            else if(category>value5[0] && category<=value5[1]){
              //return [253,174,97]; 
              return hexToRgb(colorPalette[1]);
            }
            else if(category>value5[1] && category<=value5[2]){
              // return [255,255,191]; 
              return hexToRgb(colorPalette[2]);
            }
            else if(category>value5[2] && category<=value5[3]){
              //return [166,217,106];
              return hexToRgb(colorPalette[3]);
            }
            else if(category>value5[3] && category<=value5[4]){
              //return [26,150,65];
              return hexToRgb(colorPalette[4]);
            }
            else {
              return [0, 0, 0]; // black
            }
          }
          else if(bivariateColorVariable1 && bivariateColorVariable2){
              const category1 = d.properties[bivariateColorVariable1+'3'];
            const category2 = d.properties[bivariateColorVariable2+'3'];
            if(category1 == "low" && category2 == "low"){
              return hexToRgb(bivariateColorpalette['low_low'])
            }
            else if(category1 == "low" && category2 == "medium"){
              return hexToRgb(bivariateColorpalette['low_medium'])
            }
            else if(category1 == "low" && category2 == "high"){
              return hexToRgb(bivariateColorpalette['low_high'])
            }
            else if(category1 == "medium" && category2 == "low"){
              return hexToRgb(bivariateColorpalette['medium_low'])
            }
            else if(category1 == "medium" && category2 == "medium"){
              return hexToRgb(bivariateColorpalette['medium_medium'])
            }
            else if(category1 == "medium" && category2 == "high"){
              return hexToRgb(bivariateColorpalette['medium_high'])
            }
            else if(category1 == "high" && category2 == "low"){
                return hexToRgb(bivariateColorpalette['high_low'])
            }
            else if(category1 == "high" && category2 == "medium"){
                return hexToRgb(bivariateColorpalette['high_medium'])
            }
            else if(category1 == "high" && category2 == "high"){
                return hexToRgb(bivariateColorpalette['high_high'])
            }
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
        onClick: (info) => console.log('Clicked:', info),
        onHover: (info)=> addDeckglPopupToMap(info, prop1, prop2, prop3),
    
  });
  map.addLayer(customLayer);
  
}
export function addDeckglCircleLayerOnePropWithUncertainty (geojson, prop1, classes1, prop2, visVar1, map){
  let radiusVariable
  let colorVariable
  let classForRadius
  let classesForColor
  if(visVar1=='color'){
    colorVariable= prop1;
    classesForColor = classes1;
  }
  else if(visVar1=='size'){
    radiusVariable= prop1;

    classForRadius = classes1;
  }
  let colorPalette = null;
  if (useMapLegendStore().selectedColorPalette!==null) {
    colorPalette = useMapLegendStore().selectedColorPalette.colors;
  }
  else {
    let colorPaletteName
    if (colorVariable== 'value'){
      colorPaletteName = colorbrewer.default.schemeGroups.sequential[1];
    }
    else{
      colorPaletteName = colorbrewer.default.schemeGroups.diverging[1];
    }
     colorPalette = colorbrewer.default[colorPaletteName][5];
    useMapLegendStore().assignColorPalette({name: colorPaletteName, colors: colorPalette});
  }
  console.log(colorVariable, radiusVariable, "colorVariable, radiusVariable")
  console.log(classForRadius, classesForColor, "classForRadius, classesForColor")

    let customLayer = new MapboxLayer({
      id: 'ink-layer',
      type: CustomFuzzyCircleLayer,
      data: [...geojson.features],
      getPosition: d => d.geometry.coordinates,
      getRadius: d => {
        if(radiusVariable!==undefined){
          const category = d.properties[radiusVariable];
          const value5 = JSON.parse(classForRadius)
          if(category<value5[0]){
            return 150 * (362/1200)
          }
          else if(category>value5[0] && category<=value5[1]){
            return 400 * (362/1200)
          }
          else if(category>value5[1] && category<=value5[2]){
            return 600 * (362/1200)
          }
          else if(category>value5[2] && category<=value5[3]){
            return 900 * (362/1200)
          }
          else if(category>value5[3] && category<=value5[4]){
            return 1200 * (362/1200)
          }
          else {
            return 1200 * (362/1200)
          }
          
        }else{
          return 360
        }
      },
      radiusUnits: 'meters',
      getFillColor: d => {
        if(colorVariable!==undefined){
          const category = d.properties[colorVariable];
          //const value5 = JSON.parse(d.propertiesd[prop2+'5'])
          const value5 = JSON.parse(classesForColor)
          if(category<value5[0]){
            //return [215,25,28]; 
            return hexToRgb(colorPalette[0]);
          }
          else if(category>value5[0] && category<=value5[1]){
            //return [253,174,97]; 
            return hexToRgb(colorPalette[1]);
          }
          else if(category>value5[1] && category<=value5[2]){
            // return [255,255,191]; 
            return hexToRgb(colorPalette[2]);
          }
          else if(category>value5[2] && category<=value5[3]){
            //return [166,217,106];
            return hexToRgb(colorPalette[3]);
          }
          else if(category>value5[3] && category<=value5[4]){
            //return [26,150,65];
            return hexToRgb(colorPalette[4]);
          }
          else {
            return [0, 0, 0]; // black
          }
        }
        else{
          return [255, 0, 0]; // black
        }
        
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
  
}

export function addDeckglSquareLayerToMap (geojson, prop1,prop2, classes,classes1,visVar1, visVar2, map) {
  let radiusVariable
  let colorVariable
  let classForRadius
  let classesForColor
  let bivariateColorVariable1
  let bivariateColorVariable2

  
  if(visVar1=='color' && visVar2=='size'){
    colorVariable= prop1;
    radiusVariable= prop2;

    classForRadius = classes;
    classesForColor = classes1;
  }
  else if(visVar1=='size' && visVar2=='color'){
    colorVariable= prop2;
    radiusVariable= prop1;

    classForRadius = classes1;
    classesForColor = classes;
  }
  else if(visVar1=='color' && visVar2=='color'){
    bivariateColorVariable1 = prop1;
    bivariateColorVariable2 = prop2;
  }
  // to support univariate mapping
  else if(visVar2==undefined){
    if(visVar1=='color'){
      colorVariable= prop1;
      classesForColor = classes1;
    }
    else if(visVar1=='size'){
      radiusVariable= prop1;
      classForRadius = classes1;
    }
  }
 
  let colorPalette = null;
 
  let colorPaletteName
  if (colorVariable== 'value'){
    colorPaletteName = colorbrewer.default.schemeGroups.sequential[1];
  }
  else{
    colorPaletteName = colorbrewer.default.schemeGroups.diverging[1];
  }
  colorPalette = colorbrewer.default[colorPaletteName][5];
  useMapLegendStore().assignColorPalette({name: colorPaletteName, colors: colorPalette});
  
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
        //const size = feature.properties[prop1+'_d']* (720/1200);
        let size;
        if (radiusVariable!== undefined){
          const category = feature.properties[radiusVariable];
          const value5 = JSON.parse(classForRadius)
          
          if(category<value5[0]){
            size =  150 * (720/1200)
          }
          else if(category>value5[0] && category<=value5[1]){
            size = 400 * (720/1200)
          }
          else if(category>value5[1] && category<=value5[2]){
            size = 600 * (720/1200)
          }
          else if(category>value5[2] && category<=value5[3]){
            size = 900 * (720/1200)
          }
          else if(category>value5[3] && category<=value5[4]){
            size = 1180 * (720/1200)
          }
          else {
            size = 1200 * (720/1200)
          }
        }
        else{
          size = 1100 * (720/1200)
        }

        return {
          type: "Feature",
          geometry: createSquarePolygonFromPoint(center, size),
          properties: feature.properties,
        };
      })
    };
  

    let customLayer = new MapboxLayer({
      id: 'square-layer',
      type: PolygonLayer,
      data: [...squareGeojson.features],
      getPolygon: d => d.geometry.coordinates,
      getFillColor: d => {
        if (colorVariable!==undefined ){
          const category = d.properties[colorVariable];
          //const value5 = JSON.parse(d.propertiesd[prop2+'5'])
          const value5 = JSON.parse(classesForColor)
          if(category<value5[0]){
            //return [215,25,28]; 
            return hexToRgb(colorPalette[0]);
          }
          else if(category>value5[0] && category<=value5[1]){
            //return [253,174,97]; 
            return hexToRgb(colorPalette[1]);
          }
          else if(category>value5[1] && category<=value5[2]){
          // return [255,255,191]; 
          return hexToRgb(colorPalette[2]);
          }
          else if(category>value5[2] && category<=value5[3]){
            //return [166,217,106];
            return hexToRgb(colorPalette[3]);
          }
          else if(category>value5[3] && category<=value5[4]){
            //return [26,150,65];
            return hexToRgb(colorPalette[4]);
          }
          else {
            return [0, 0, 0]; // black
          }
        }
        else if (bivariateColorVariable1 && bivariateColorVariable2) {
          const category1 = d.properties[bivariateColorVariable1+'3'];
          const category2 = d.properties[bivariateColorVariable2+'3'];
          if(category1 == "low" && category2 == "low"){
            return hexToRgb(bivariateColorpalette['low_low'])
          }
          else if(category1 == "low" && category2 == "medium"){
            return hexToRgb(bivariateColorpalette['low_medium'])
          }
          else if(category1 == "low" && category2 == "high"){
            return hexToRgb(bivariateColorpalette['low_high'])
          }
          else if(category1 == "medium" && category2 == "low"){
            return hexToRgb(bivariateColorpalette['medium_low'])
          }
          else if(category1 == "medium" && category2 == "medium"){
            return hexToRgb(bivariateColorpalette['medium_medium'])
          }
          else if(category1 == "medium" && category2 == "high"){
            return hexToRgb(bivariateColorpalette['medium_high'])
          }
          else if(category1 == "high" && category2 == "low"){
             return hexToRgb(bivariateColorpalette['high_low'])
          }
          else if(category1 == "high" && category2 == "medium"){
             return hexToRgb(bivariateColorpalette['high_medium'])
          }
          else if(category1 == "high" && category2 == "high"){
             return hexToRgb(bivariateColorpalette['high_high'])
          }
        }
        else {
          return [255, 0, 0]; // red
        }
      },
      getLineColor: [0, 0, 0],
      getLineWidth: 0,
      pickable: true,
     
      onHover: (info)=> addDeckglPopupToMap(info, prop1, prop2),
  
  });
  map.addLayer(customLayer);


  
}

export function addDeckglFuzzyLayerToMap (geojson, prop1, classes1, prop2, visVar1, map){
  let radiusVariable
  let colorVariable
  let classForRadius
  let classesForColor
  if(visVar1=='color'){
    colorVariable= prop1;
    classesForColor = classes1;
  }
  else if(visVar1=='size'){
    radiusVariable= prop1;

    classForRadius = classes1;
  }
  let colorPalette = null;
  if (useMapLegendStore().selectedColorPalette!==null) {
    colorPalette = useMapLegendStore().selectedColorPalette.colors;
  }
  else {
    let colorPaletteName
    if (colorVariable== 'value'){
      colorPaletteName = colorbrewer.default.schemeGroups.sequential[1];
    }
    else{
      colorPaletteName = colorbrewer.default.schemeGroups.diverging[1];
    }
     colorPalette = colorbrewer.default[colorPaletteName][5];
    useMapLegendStore().assignColorPalette({name: colorPaletteName, colors: colorPalette});
  }
    let customLayer = new MapboxLayer({
      id: 'glow-points',
      type: CustomScatterplotLayer,
      data: [...geojson.features],
      getPosition: d => d.geometry.coordinates,
      getRadius: d => {
        if(radiusVariable!==undefined){
          const category = d.properties[radiusVariable];
          const value5 = JSON.parse(classForRadius)
          if(category<value5[0]){
            return 150 * (362/1200)
          }
          else if(category>value5[0] && category<=value5[1]){
            return 400 * (362/1200)
          }
          else if(category>value5[1] && category<=value5[2]){
            return 600 * (362/1200)
          }
          else if(category>value5[2] && category<=value5[3]){
            return 900 * (362/1200)
          }
          else if(category>value5[3] && category<=value5[4]){
            return 1200 * (362/1200)
          }
          else {
            return 1200 * (362/1200)
          }
          
        }else{
          return 360
        }
      },
      radiusUnits: 'meters',
      getFillColor: d => {
        if(colorVariable!==undefined){
          const category = d.properties[colorVariable];
          //const value5 = JSON.parse(d.propertiesd[prop2+'5'])
          const value5 = JSON.parse(classesForColor)
          if(category<value5[0]){
            //return [215,25,28]; 
            return hexToRgb(colorPalette[0]);
          }
          else if(category>value5[0] && category<=value5[1]){
            //return [253,174,97]; 
            return hexToRgb(colorPalette[1]);
          }
          else if(category>value5[1] && category<=value5[2]){
            // return [255,255,191]; 
            return hexToRgb(colorPalette[2]);
          }
          else if(category>value5[2] && category<=value5[3]){
            //return [166,217,106];
            return hexToRgb(colorPalette[3]);
          }
          else if(category>value5[3] && category<=value5[4]){
            //return [26,150,65];
            return hexToRgb(colorPalette[4]);
          }
          else {
            return [0, 0, 0]; // black
          }
        }
        else{
          return [255, 0, 0]; // black
        }
        
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
    
}
export function addDeckglFuzzyLayerWithThreePropToMap (geojson, prop1, prop2, prop3, classes, classes1, visVar1, visVar2, map){
  let radiusVariable
  let colorVariable
  let classForRadius
  let classesForColor
  let bivariateColorVariable1
  let bivariateColorVariable2
  if(visVar1=='color' && visVar2=='size'){
    colorVariable= prop1;
    radiusVariable= prop2;

    classForRadius = classes;
    classesForColor = classes1;
  }
  else if(visVar1=='size' && visVar2=='color'){
    colorVariable= prop2;
    radiusVariable= prop1;

    classForRadius = classes1;
    classesForColor = classes;
  }
  else if(visVar1=='color' && visVar2=='color'){
    bivariateColorVariable1 = prop1;
    bivariateColorVariable2 = prop2;
  }

  let colorPalette = null;
  let colorPaletteName

  if (useMapLegendStore().selectedColorPalette!==null) {
    colorPalette = useMapLegendStore().selectedColorPalette.colors;
  }
  else {
    if (colorVariable== 'value'){
      colorPaletteName = colorbrewer.default.schemeGroups.sequential[1];
      colorPalette = colorbrewer.default[colorPaletteName][5];
    }
    else if(colorVariable== 'shap'){
      colorPaletteName = colorbrewer.default.schemeGroups.diverging[1];
      colorPalette = colorbrewer.default[colorPaletteName][5];
    }
     
    useMapLegendStore().assignColorPalette({name: colorPaletteName, colors: colorPalette});
  }
      console.log(radiusVariable, "radiusVariable")
        console.log( bivariateColorVariable1, bivariateColorVariable2,"bivar")
 let customLayerr = new MapboxLayer({
   id: 'fuzzy-layer-three-props',
   type: CustomScatterplotLayer,
   data: [...geojson.features],
   getPosition: d => d.geometry.coordinates,
   getRadius: d => {
      if(radiusVariable!==undefined){
        const category = d.properties[radiusVariable];
        const value5 = JSON.parse(classForRadius)
        if(category<value5[0]){
          return 150 * (362/1200)
        }
        else if(category>value5[0] && category<=value5[1]){
          return 400 * (362/1200)
        }
        else if(category>value5[1] && category<=value5[2]){
          return 600 * (362/1200)
        }
        else if(category>value5[2] && category<=value5[3]){
          return 900 * (362/1200)
        }
        else if(category>value5[3] && category<=value5[4]){
          return 1200 * (362/1200)
        }
        else {
          return 1200 * (362/1200)
        }

      }

      else if(bivariateColorVariable1 && bivariateColorVariable2){
        return 1200 * (362/1200)
      }   
          
    },
   radiusUnits: 'meters',
   getFillColor: d => {
      if(colorVariable!==undefined){
        const category = d.properties[colorVariable];
        //const value5 = JSON.parse(d.propertiesd[prop2+'5'])
        const value5 = JSON.parse(classesForColor)
        if(category<value5[0]){
          //return [215,25,28]; 
          return hexToRgb(colorPalette[0]);
        }
        else if(category>value5[0] && category<=value5[1]){
          //return [253,174,97]; 
          return hexToRgb(colorPalette[1]);
        }
        else if(category>value5[1] && category<=value5[2]){
          // return [255,255,191]; 
          return hexToRgb(colorPalette[2]);
        }
        else if(category>value5[2] && category<=value5[3]){
          //return [166,217,106];
          return hexToRgb(colorPalette[3]);
        }
        else if(category>value5[3] && category<=value5[4]){
          //return [26,150,65];
          return hexToRgb(colorPalette[4]);
        }
        else {
          return [0, 0, 0]; // black
        }
      }
      else if(bivariateColorVariable1 && bivariateColorVariable2){
          const category1 = d.properties[bivariateColorVariable1+'3'];
        const category2 = d.properties[bivariateColorVariable2+'3'];
        if(category1 == "low" && category2 == "low"){
          return hexToRgb(bivariateColorpalette['low_low'])
        }
        else if(category1 == "low" && category2 == "medium"){
          return hexToRgb(bivariateColorpalette['low_medium'])
        }
        else if(category1 == "low" && category2 == "high"){
          return hexToRgb(bivariateColorpalette['low_high'])
        }
        else if(category1 == "medium" && category2 == "low"){
          return hexToRgb(bivariateColorpalette['medium_low'])
        }
        else if(category1 == "medium" && category2 == "medium"){
          return hexToRgb(bivariateColorpalette['medium_medium'])
        }
        else if(category1 == "medium" && category2 == "high"){
          return hexToRgb(bivariateColorpalette['medium_high'])
        }
        else if(category1 == "high" && category2 == "low"){
            return hexToRgb(bivariateColorpalette['high_low'])
        }
        else if(category1 == "high" && category2 == "medium"){
            return hexToRgb(bivariateColorpalette['high_medium'])
        }
        else if(category1 == "high" && category2 == "high"){
            return hexToRgb(bivariateColorpalette['high_high'])
        }
      }
          
    },

   filled: true,
   stroked: true,
   getLineColor: [0, 0, 0, 100],
   getLineWidth: 1,
   lineWidthMinPixels: 1,
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
   //onClick: (info) => console.log('Clicked:', info.object.properties),
   pickable: true,
   onHover: (info)=> addDeckglPopupToMap(info, prop1, prop2, prop3)
   
 });
 map.addLayer(customLayerr);
 
}

export function addDeckglPositionLayerToMap (geojson, prop1, prop2, prop3, classes, classes1, visVar1, visVar2, map){
    let radiusVariable
    let colorVariable
    let classForRadius
    let classesForColor
    let bivariateColorVariable1
    let bivariateColorVariable2
    if(visVar1=='color' && visVar2=='size'){
      colorVariable= prop1;
      radiusVariable= prop2;

      classForRadius = classes;
      classesForColor = classes1;
    }
    else if(visVar1=='size' && visVar2=='color'){
      colorVariable= prop2;
      radiusVariable= prop1;

      classForRadius = classes1;
      classesForColor = classes;
    }
    else if(visVar1=='color' && visVar2=='color'){
      bivariateColorVariable1 = prop1;
      bivariateColorVariable2 = prop2;
    }

    let colorPalette = null;
    let colorPaletteName

    if (useMapLegendStore().selectedColorPalette!==null) {
      colorPalette = useMapLegendStore().selectedColorPalette.colors;
    }
    else {
      if (colorVariable== 'value'){
        colorPaletteName = colorbrewer.default.schemeGroups.sequential[1];
      }
      else if(colorVariable== 'shap'){
        colorPaletteName = colorbrewer.default.schemeGroups.diverging[1];
      }
      colorPalette = colorbrewer.default[colorPaletteName][5];
      useMapLegendStore().assignColorPalette({name: colorPaletteName, colors: colorPalette});
    }
   
   
    let customLayer = new MapboxLayer({
      id: 'ffs-uncertainty-dot-layer',
      type: ScatterplotLayer,
      data: [...geojson.features],
      getPosition: d => d.geometry.coordinates,
      getRadius: d => {
      if(radiusVariable!==undefined){
        const category = d.properties[radiusVariable];
        const value5 = JSON.parse(classForRadius)
        if(category<value5[0]){
          return 150 * (362/1200)
        }
        else if(category>value5[0] && category<=value5[1]){
          return 400 * (362/1200)
        }
        else if(category>value5[1] && category<=value5[2]){
          return 600 * (362/1200)
        }
        else if(category>value5[2] && category<=value5[3]){
          return 900 * (362/1200)
        }
        else if(category>value5[3] && category<=value5[4]){
          return 1200 * (362/1200)
        }
        else {
          return 1200 * (362/1200)
        }

      }

      else if(bivariateColorVariable1 && bivariateColorVariable2){
        return 1200 * (362/1200)
      }   
          
    },
   radiusUnits: 'meters',
   getFillColor: d => {
      if(colorVariable!==undefined){
        const category = d.properties[colorVariable];
        //const value5 = JSON.parse(d.propertiesd[prop2+'5'])
        const value5 = JSON.parse(classesForColor)
        if(category<value5[0]){
          //return [215,25,28]; 
          return hexToRgb(colorPalette[0]);
        }
        else if(category>value5[0] && category<=value5[1]){
          //return [253,174,97]; 
          return hexToRgb(colorPalette[1]);
        }
        else if(category>value5[1] && category<=value5[2]){
          // return [255,255,191]; 
          return hexToRgb(colorPalette[2]);
        }
        else if(category>value5[2] && category<=value5[3]){
          //return [166,217,106];
          return hexToRgb(colorPalette[3]);
        }
        else if(category>value5[3] && category<=value5[4]){
          //return [26,150,65];
          return hexToRgb(colorPalette[4]);
        }
        else {
          return [0, 0, 0]; // black
        }
      }
      else if(bivariateColorVariable1 && bivariateColorVariable2){
          const category1 = d.properties[bivariateColorVariable1+'3'];
        const category2 = d.properties[bivariateColorVariable2+'3'];
        if(category1 == "low" && category2 == "low"){
          return hexToRgb(bivariateColorpalette['low_low'])
        }
        else if(category1 == "low" && category2 == "medium"){
          return hexToRgb(bivariateColorpalette['low_medium'])
        }
        else if(category1 == "low" && category2 == "high"){
          return hexToRgb(bivariateColorpalette['low_high'])
        }
        else if(category1 == "medium" && category2 == "low"){
          return hexToRgb(bivariateColorpalette['medium_low'])
        }
        else if(category1 == "medium" && category2 == "medium"){
          return hexToRgb(bivariateColorpalette['medium_medium'])
        }
        else if(category1 == "medium" && category2 == "high"){
          return hexToRgb(bivariateColorpalette['medium_high'])
        }
        else if(category1 == "high" && category2 == "low"){
            return hexToRgb(bivariateColorpalette['high_low'])
        }
        else if(category1 == "high" && category2 == "medium"){
            return hexToRgb(bivariateColorpalette['high_medium'])
        }
        else if(category1 == "high" && category2 == "high"){
            return hexToRgb(bivariateColorpalette['high_high'])
        }
      }
          
    },

      getLineColor: [255, 255, 255],
      lineWidthMinPixels: 1,
      getUncertainty: d => {
        //console.log(d.properties.uncertainty);
        return d.properties[prop3];
      },
      //getUncertainty:1,
      updateTriggers: {
        getUncertainty: [prop3]
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

export function addDeckglArrowLayerWithThreePropToMap (geojson, prop1, prop2, prop3, classes, classes1, visVar1, visVar2, map){
    let radiusVariable
  let colorVariable
  let classForRadius
  let classesForColor

  
  if(visVar1=='color' && visVar2=='size'){
    colorVariable= prop1;
    radiusVariable= prop2;

    classForRadius = classes;
    classesForColor = classes1;
  }
  else if(visVar1=='size' && visVar2=='color'){
    colorVariable= prop2;
    radiusVariable= prop1;

    classForRadius = classes1;
    classesForColor = classes;
  }
  
 
  let colorPalette = null;
 
  let colorPaletteName
  if (colorVariable== 'value'){
    colorPaletteName = colorbrewer.default.schemeGroups.sequential[1];
  }
  else{
    colorPaletteName = colorbrewer.default.schemeGroups.diverging[1];
  }
  colorPalette = colorbrewer.default[colorPaletteName][5];
  useMapLegendStore().assignColorPalette({name: colorPaletteName, colors: colorPalette});
    const sceneLayer = new MapboxLayer({
    id: 'arrow-layer',
    type: ScenegraphLayer,
    data: [...geojson.features],
    scenegraph: 'direction_arrow.glb', // public path
    getColor: d => {
      const category = d.properties[colorVariable];
      //const value5 = JSON.parse(d.propertiesd[prop2+'5'])
      const value5 = JSON.parse(classesForColor)
      if(category<value5[0]){
        //return [215,25,28]; 
        return hexToRgb(colorPalette[0]);
      }
      else if(category>value5[0] && category<=value5[1]){
        //return [253,174,97]; 
        return hexToRgb(colorPalette[1]);
      }
      else if(category>value5[1] && category<=value5[2]){
        // return [255,255,191]; 
        return hexToRgb(colorPalette[2]);
      }
      else if(category>value5[2] && category<=value5[3]){
        //return [166,217,106];
        return hexToRgb(colorPalette[3]);
      }
      else if(category>value5[3] && category<=value5[4]){
        //return [26,150,65];
        return hexToRgb(colorPalette[4]);
      }
      else {
        return [0, 0, 0]; // black
      }
    },
    getPosition: d => d.geometry.coordinates,
    getOrientation: d => {
      const u = d.properties[prop3] ?? 0;
      const yaw = 90 - 180 * u; // Maps 0 → 90, 1 → -90
      return [0, yaw, 90];       // [pitch, yaw, roll]
    },
    //getOrientation: [0, 90, 90],
    sizeScale: 100,
    getScale: d => {
      const category = d.properties[radiusVariable];
      //const value5 = JSON.parse(d.propertiesd[prop2+'5'])
      const value5 = JSON.parse(classForRadius)
      if (radiusVariable){
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
    onHover: (info)=> addDeckglPopupToMap(info, prop1, prop2,prop3)

  });
  
  map.addLayer(sceneLayer);
  
}
export function addDeckglArrowLayerWithtwoPropToMap (geojson, prop1, prop2 , classes, classes1, visVar1, visVar2, map){
  let radiusVariable
  let colorVariable
  let classForRadius
  let classesForColor

  
  if(visVar1=='color' && visVar2=='size'){
    colorVariable= prop1;
    radiusVariable= prop2;

    classForRadius = classes;
    classesForColor = classes1;
  }
  else if(visVar1=='size' && visVar2=='color'){
    colorVariable= prop2;
    radiusVariable= prop1;

    classForRadius = classes1;
    classesForColor = classes;
  }
  
 
  let colorPalette = null;
 
  let colorPaletteName
  if (colorVariable== 'value'){
    colorPaletteName = colorbrewer.default.schemeGroups.sequential[1];
  }
  else{
    colorPaletteName = colorbrewer.default.schemeGroups.diverging[1];
  }
  colorPalette = colorbrewer.default[colorPaletteName][5];
  useMapLegendStore().assignColorPalette({name: colorPaletteName, colors: colorPalette});

  const sceneLayer = new MapboxLayer({
  id: 'arrow-layer',
  type: ScenegraphLayer,
  data: [...geojson.features],
  scenegraph: 'direction_arrow.glb', // public path
  getColor: d => {
    const category = d.properties[colorVariable];
    //const value5 = JSON.parse(d.propertiesd[prop2+'5'])
    const value5 = JSON.parse(classesForColor)
    if(category<value5[0]){
      //return [215,25,28]; 
      return hexToRgb(colorPalette[0]);
    }
    else if(category>value5[0] && category<=value5[1]){
      //return [253,174,97]; 
      return hexToRgb(colorPalette[1]);
    }
    else if(category>value5[1] && category<=value5[2]){
      // return [255,255,191]; 
      return hexToRgb(colorPalette[2]);
    }
    else if(category>value5[2] && category<=value5[3]){
      //return [166,217,106];
      return hexToRgb(colorPalette[3]);
    }
    else if(category>value5[3] && category<=value5[4]){
      //return [26,150,65];
      return hexToRgb(colorPalette[4]);
    }
    else {
      return [0, 0, 0]; // black
    }
  },
  getPosition: d => d.geometry.coordinates,
  
  getOrientation: [0, 90, 90],
  sizeScale: 100,
  getScale: d => {
    const category = d.properties[radiusVariable];
    //const value5 = JSON.parse(d.propertiesd[prop2+'5'])
    const value5 = JSON.parse(classForRadius)
    if (radiusVariable){
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
  onHover: (info)=> addDeckglPopupToMap(info, prop1, prop2)
 
});

map.addLayer(sceneLayer);

}

export function addCustomPatternLayerToMap (geojson, prop1,prop2, classes, map){
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
            const size = 600;
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
    
            float stripeCount = 10.0;
            float xNorm = (v_local.x + 1.0) / 2.0;
            float posInStripe = mod(xNorm * stripeCount, 1.0);

            // Scale stripe width based on uncertainty
            float u = v_uncertainty;
            float stripeWidth = mix(1.0, 0.01, u);  // ← clean inversion

            // Color only inside the stripe
            float isInStripe = step(posInStripe, stripeWidth);
            //fragColor = vec4(v_color.rgb, isInStripe);
            if (u == 0.0001) {
                fragColor = vec4(v_color.rgb, 1.0); // Full color, no stripes
            } else {
                fragColor = vec4(v_color.rgb, isInStripe); // Stripe logic
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

            const category = props[prop1];
            const value5 = JSON.parse(classes); // assuming `classes` is defined outside
            let colorPalette = null;
            if (useMapLegendStore().selectedColorPalette!==null) {
              colorPalette = useMapLegendStore().selectedColorPalette.colors;
            }
            else {
              let colorPaletteName
              if (prop1== 'value'){
                colorPaletteName = colorbrewer.default.schemeGroups.sequential[1];
              }
              else{
                colorPaletteName = colorbrewer.default.schemeGroups.diverging[1];
              }
              colorPalette = colorbrewer.default[colorPaletteName][5];
              useMapLegendStore().assignColorPalette({name: colorPaletteName, colors: colorPalette});
            }
            let color
            if(category<value5[0]){
              //return [215,25,28]; 
              color= hexToRgb(colorPalette[0]);
            }
            else if(category>value5[0] && category<=value5[1]){
              //return [253,174,97]; 
              color= hexToRgb(colorPalette[1]);
            }
            else if(category>value5[1] && category<=value5[2]){
             // return [255,255,191]; 
             color= hexToRgb(colorPalette[2]);
            }
            else if(category>value5[2] && category<=value5[3]){
              //return [166,217,106];
              color= hexToRgb(colorPalette[3]);
            }
            else if(category>value5[3] && category<=value5[4]){
              //return [26,150,65];
              color= hexToRgb(colorPalette[4]);
            }
            else {
              color= [0, 0, 0]; // black
            }
            /*if (category < value5[0]) color = [215, 25, 28];
            else if (category <= value5[1]) color = [253, 174, 97];
            else if (category <= value5[2]) color = [255, 255, 191];
            else if (category <= value5[3]) color = [166, 217, 106];
            else if (category <= value5[4]) color = [26, 150, 65];
            else color = [0, 0, 0];*/
            
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
export function addCustomPatternLayerWithOrientationToMap (geojson, prop1,prop2, classes, map){
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
          const size = 600;
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

        const category = props[prop1];
            const value5 = JSON.parse(classes); // assuming `classes` is defined outside
            let colorPalette = null;
            if (useMapLegendStore().selectedColorPalette!==null) {
              colorPalette = useMapLegendStore().selectedColorPalette.colors;
            }
            else {
              let colorPaletteName
              if (prop1== 'value'){
                colorPaletteName = colorbrewer.default.schemeGroups.sequential[1];
              }
              else{
                colorPaletteName = colorbrewer.default.schemeGroups.diverging[1];
              }
              colorPalette = colorbrewer.default[colorPaletteName][5];
              useMapLegendStore().assignColorPalette({name: colorPaletteName, colors: colorPalette});
            }
            let color
            if(category<value5[0]){
              //return [215,25,28]; 
              color= hexToRgb(colorPalette[0]);
            }
            else if(category>value5[0] && category<=value5[1]){
              //return [253,174,97]; 
              color= hexToRgb(colorPalette[1]);
            }
            else if(category>value5[1] && category<=value5[2]){
             // return [255,255,191]; 
             color= hexToRgb(colorPalette[2]);
            }
            else if(category>value5[2] && category<=value5[3]){
              //return [166,217,106];
              color= hexToRgb(colorPalette[3]);
            }
            else if(category>value5[3] && category<=value5[4]){
              //return [26,150,65];
              color= hexToRgb(colorPalette[4]);
            }
            else {
              color= [0, 0, 0]; // black
            }
        
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


export function addCustomBorderLayerToMap (geojson, prop1,prop2, classes, map){
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
          const size = 1100 * (720/1200)
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
  const highlightLayer = {
      id: 'border-uncertainty',
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

        // Simple 2D noise (you can replace with better noise later)
        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

            void main() {
                // Convert [-1, 1] space to [0, 1]
                vec2 uv = (v_local + 1.0) / 2.0;

                // Distance to center (0.5, 0.5)
                float distToCenter = max(abs(uv.x - 0.5), abs(uv.y - 0.5));  // square ring

                // Border thickness based on uncertainty (min 0.01, max 0.3)
                float thickness = mix(0.0, 0.3, clamp(v_uncertainty, 0.0, 1.0));

                // Only render if in border region
                if (distToCenter >= (0.5 - thickness) && distToCenter <= 0.5) {
                    float noise = random(uv * 100.0); // add scale to spread noise
                  fragColor = vec4(vec3(noise), 1.0);  // black and white (grayscale)
                } else {
                    discard; // transparent inside square
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

          const category = props[prop1];
          const value5 = JSON.parse(classes); // assuming `classes` is defined outside
          let colorPalette = null;
          if (useMapLegendStore().selectedColorPalette!==null) {
            colorPalette = useMapLegendStore().selectedColorPalette.colors;
          }
          else {
            let colorPaletteName
            if (prop1== 'value'){
              colorPaletteName = colorbrewer.default.schemeGroups.sequential[1];
            }
            else{
              colorPaletteName = colorbrewer.default.schemeGroups.diverging[1];
            }
            colorPalette = colorbrewer.default[colorPaletteName][5];
            useMapLegendStore().assignColorPalette({name: colorPaletteName, colors: colorPalette});
          }
          let color
          if(category<value5[0]){
            //return [215,25,28]; 
            color= hexToRgb(colorPalette[0]);
          }
          else if(category>value5[0] && category<=value5[1]){
            //return [253,174,97]; 
            color= hexToRgb(colorPalette[1]);
          }
          else if(category>value5[1] && category<=value5[2]){
           // return [255,255,191]; 
           color= hexToRgb(colorPalette[2]);
          }
          else if(category>value5[2] && category<=value5[3]){
            //return [166,217,106];
            color= hexToRgb(colorPalette[3]);
          }
          else if(category>value5[3] && category<=value5[4]){
            //return [26,150,65];
            color= hexToRgb(colorPalette[4]);
          }
          else {
            color= [0, 0, 0]; // black
          }
          /*if (category < value5[0]) color = [215, 25, 28];
          else if (category <= value5[1]) color = [253, 174, 97];
          else if (category <= value5[2]) color = [255, 255, 191];
          else if (category <= value5[3]) color = [166, 217, 106];
          else if (category <= value5[4]) color = [26, 150, 65];
          else color = [0, 0, 0];*/
          
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

      addDeckglPopupToMap(feat, prop1, 'shap', 'uncertainty')
  });

}

export function addCustomBorderLayerWithNoisegrainToMap (geojson, prop1,prop2, classes, map){
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
          const size = size = 1100 * (720/1200);
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
  const highlightLayer = {
      id: 'border-uncertainty-noise-grain',
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

  float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }
      vec4 permute(vec4 x) {
  return mod((34.0 * x + 1.0) * x, 289.0);
}

// Cellular noise, returning F1 and F2 in a vec2.
// Speeded up by using 2x2 search window instead of 3x3,
// at the expense of some strong pattern artifacts.
// F2 is often wrong and has sharp discontinuities.
// If you need a smooth F2, use the slower 3x3 version.
// F1 is sometimes wrong, too, but OK for most purposes.
vec2 cellular2x2(vec2 P) {
	#define K 0.142857142857 // 1/7
	#define K2 0.0714285714285 // K/2
	#define jitter 0.8 // jitter 1.0 makes F1 wrong more often
	vec2 Pi = mod(floor(P), 289.0);
 	vec2 Pf = fract(P);
	vec4 Pfx = Pf.x + vec4(-0.5, -1.5, -0.5, -1.5);
	vec4 Pfy = Pf.y + vec4(-0.5, -0.5, -1.5, -1.5);
	vec4 p = permute(Pi.x + vec4(0.0, 1.0, 0.0, 1.0));
	p = permute(p + Pi.y + vec4(0.0, 0.0, 1.0, 1.0));
	vec4 ox = mod(p, 7.0)*K+K2;
	vec4 oy = mod(floor(p*K),7.0)*K+K2;
	vec4 dx = Pfx + jitter*ox;
	vec4 dy = Pfy + jitter*oy;
	vec4 d = dx * dx + dy * dy; // d11, d12, d21 and d22, squared
	// Sort out the two smallest distances
#if 0
	// Cheat and pick only F1
	d.xy = min(d.xy, d.zw);
	d.x = min(d.x, d.y);
	return d.xx; // F1 duplicated, F2 not computed
#else
	// Do it right and find both F1 and F2
	d.xy = (d.x < d.y) ? d.xy : d.yx; // Swap if smaller
	d.xz = (d.x < d.z) ? d.xz : d.zx;
	d.xw = (d.x < d.w) ? d.xw : d.wx;
	d.y = min(d.y, d.z);
	d.y = min(d.y, d.w);
	return sqrt(d.xy);
#endif
}


  void main() {
      vec2 uv = (v_local + 1.0) / 2.0;
      float distToCenter = max(abs(uv.x - 0.5), abs(uv.y - 0.5));  

      float thickness = 0.1;  // constant border width

      if (distToCenter >= (0.5 - thickness) && distToCenter <= 0.5) {
       // Sketchiness from cellular noise
        vec2 F = cellular2x2(uv * 20.0);
        float n = smoothstep(0., v_uncertainty, F.x);  // n ∈ [0, 1]

        fragColor = vec4(0.,0.,0.,1.-n); 
      } else {
          discard;
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

          const category = props[prop1];
          const value5 = JSON.parse(classes); // assuming `classes` is defined outside
          let colorPalette = null;
          if (useMapLegendStore().selectedColorPalette!==null) {
            colorPalette = useMapLegendStore().selectedColorPalette.colors;
          }
          else {
            let colorPaletteName
            if (prop1== 'value'){
              colorPaletteName = colorbrewer.default.schemeGroups.sequential[1];
            }
            else{
              colorPaletteName = colorbrewer.default.schemeGroups.diverging[1];
            }
            colorPalette = colorbrewer.default[colorPaletteName][5];
            useMapLegendStore().assignColorPalette({name: colorPaletteName, colors: colorPalette});
          }
          let color
          if(category<value5[0]){
            //return [215,25,28]; 
            color= hexToRgb(colorPalette[0]);
          }
          else if(category>value5[0] && category<=value5[1]){
            //return [253,174,97]; 
            color= hexToRgb(colorPalette[1]);
          }
          else if(category>value5[1] && category<=value5[2]){
           // return [255,255,191]; 
           color= hexToRgb(colorPalette[2]);
          }
          else if(category>value5[2] && category<=value5[3]){
            //return [166,217,106];
            color= hexToRgb(colorPalette[3]);
          }
          else if(category>value5[3] && category<=value5[4]){
            //return [26,150,65];
            color= hexToRgb(colorPalette[4]);
          }
          else {
            color= [0, 0, 0]; // black
          }
          
          
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

      addDeckglPopupToMap(feat, prop1, 'shap', 'uncertainty')
  });

}