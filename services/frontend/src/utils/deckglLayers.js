import {CustomFuzzyCircleLayer, CustomScatterplotLayer} from "./shaders"

import {MapboxLayer} from '@deck.gl/mapbox';
import { addDeckglPopupToMap } from '../utils/mapUtils';
import { PolygonLayer, ScatterplotLayer} from '@deck.gl/layers';
import { ScenegraphLayer } from '@deck.gl/mesh-layers';
import * as turf from "@turf/turf";
import { MercatorCoordinate } from 'maplibre-gl';



export function addDeckglCircleLayerWithUncertainty (geojson, prop1, prop2, prop3, classes, map){
    console.log(geojson, prop1, prop2, prop3, classes)
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
          onClick: (info) => console.log('Clicked:', info),
          onHover: (info)=> addDeckglPopupToMap(info, prop1, prop2, prop3),
      
    });
    map.addLayer(customLayer);
  
}

export function addDeckglSquareLayerToMap (geojson, prop1,prop2, classes, map) {
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
     
      onHover: (info)=> addDeckglPopupToMap(info, prop1, prop2),
  
  });
  map.addLayer(customLayer);
  
}

export function addDeckglFuzzyLayerToMap (geojson, prop1, prop2, map){
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
    
}

export function addDeckglPositionLayerToMap (geojson, prop1, prop2, map){
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

export function addDeckglArrowLayerToMap (geojson, prop1, prop2, prop3, map){
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