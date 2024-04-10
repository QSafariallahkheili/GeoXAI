
import { MercatorCoordinate } from 'maplibre-gl';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const geojson = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [13.259101, 52.538625]
            },
            properties: {
                height:200
            }
        },
        {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [13.260160, 52.539369]
            },
            properties: {
                height:75
            }
        },
        {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [13.256713, 52.539653]
            },
            properties: {
                height:35
            }
        },
        {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [13.243634, 52.535957]
            },
            properties: {
                height:150
            }
        },
        {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [13.248096, 52.530054]
            },
            properties: {
                height:220
            }
        },
        {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [13.350107810008536, 52.51450686356818]
            },
            properties: {
                height:50
            }
        }
    ]
};


function calculateDistanceMercatorToMeters(from, to) {
    const mercatorPerMeter = from.meterInMercatorCoordinateUnits();
    // mercator x: 0=west, 1=east
    const dEast = to.x - from.x;
    const dEastMeter = dEast / mercatorPerMeter;
    // mercator y: 0=north, 1=south
    const dNorth = from.y - to.y;
    const dNorthMeter = dNorth / mercatorPerMeter;
    return {dEastMeter, dNorthMeter};
}

async function loadModel() {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync('Lowpoly_tree_sample.gltf');
    const model = gltf.scene;
    
    return model;
}

//const sceneOrigin =[13.259101, 52.538625]


const modelOrigin = [13.259101, 52.538625];
const modelAltitude = 0;
const modelRotate = [0, 0, 0];

const modelAsMercatorCoordinate =MercatorCoordinate.fromLngLat(
    modelOrigin,
    modelAltitude
);
// transformation parameters to position, rotate and scale the 3D model onto the map
const modelTransform = {
    translateX: modelAsMercatorCoordinate.x,
    translateY: modelAsMercatorCoordinate.y,
    translateZ: modelAsMercatorCoordinate.z,
    rotateX: modelRotate[0],
    rotateY: modelRotate[1],
    rotateZ: modelRotate[2],
    scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
};



export function addThrejs3DModel (map, layerID) {
    const customLayer = {
        id: layerID,
        type: 'custom',
        renderingMode: '3d',

        onAdd(map, gl) {
            

            this.camera = new THREE.Camera();
            this.scene = new THREE.Scene();
            // In threejs, y points up - we're rotating the scene such that it's y points along maplibre's up.
            this.scene.rotateX(Math.PI / 2);
            // In threejs, z points toward the viewer - mirroring it such that z points along maplibre's north.
            this.scene.scale.multiply(new THREE.Vector3(1, 1, -1));
            // We now have a scene with (x=east, y=up, z=north)

            const light = new THREE.DirectionalLight(0xffffff);
            // Making it just before noon - light coming from south-east.
            light.position.set(50, 70, -30).normalize();
            this.scene.add(light);

            // Axes helper to show how threejs scene is oriented.
            //const axesHelper = new THREE.AxesHelper(60);
            //this.scene.add(axesHelper);

            const sceneElevation = map.queryTerrainElevation(modelOrigin) || 0;
            const sceneOriginMercator = MercatorCoordinate.fromLngLat(modelOrigin);
           


            loadModel().then(model => {
                for (let i = 0; i < geojson.features.length; i++) {
                    const feature = geojson.features[i];
                    const modelElevation = map.queryTerrainElevation(feature.geometry.coordinates) || 0;
                    const modelUp = modelElevation - sceneElevation;
                    const modelMercator = MercatorCoordinate.fromLngLat(feature.geometry.coordinates);
                    const { dEastMeter: modelEast, dNorthMeter: modelNorth } = calculateDistanceMercatorToMeters(sceneOriginMercator, modelMercator);

                    const clonedModel = model.clone();
                    clonedModel.position.set(modelEast, modelUp, modelNorth);
                    this.scene.add(clonedModel);
                    
                }
            }).catch(error => {
                console.error('Error loading model:', error);
            });
          
            // Use the MapLibre GL JS map canvas for three.js.
            this.renderer = new THREE.WebGLRenderer({
                canvas: map.getCanvas(),
                context: gl,
                antialias: true
            });

            this.renderer.autoClear = false;
        },

        render(gl, matrix) {

            const rotationX = new THREE.Matrix4().makeRotationAxis(
                new THREE.Vector3(1, 0, 0),
                modelTransform.rotateX
            );
            const rotationY = new THREE.Matrix4().makeRotationAxis(
                new THREE.Vector3(0, 1, 0),
                modelTransform.rotateY
            );
            const rotationZ = new THREE.Matrix4().makeRotationAxis(
                new THREE.Vector3(0, 0, 1),
                modelTransform.rotateZ
            );

            const m = new THREE.Matrix4().fromArray(matrix);
            const l = new THREE.Matrix4()
                .makeTranslation(
                    modelTransform.translateX,
                    modelTransform.translateY,
                    modelTransform.translateZ
                )
                .scale(
                    new THREE.Vector3(
                        modelTransform.scale,
                        -modelTransform.scale,
                        modelTransform.scale
                    )
                )
                .multiply(rotationX)
                .multiply(rotationY)
                .multiply(rotationZ);

            this.camera.projectionMatrix = m.multiply(l);
            this.renderer.resetState();
            this.renderer.render(this.scene, this.camera);
            this.map.triggerRepaint();
        }
    };
  
    map.addLayer(customLayer);

}





export function addThrejsCylinderGeometry(map, layerID) {
    const customLayer = {
        id: layerID,
        type: 'custom',
        renderingMode: '3d',

        onAdd(map, gl) {
            

            this.camera = new THREE.Camera();
            this.scene = new THREE.Scene();
            // In threejs, y points up - we're rotating the scene such that it's y points along maplibre's up.
            this.scene.rotateX(Math.PI / 2);
            // In threejs, z points toward the viewer - mirroring it such that z points along maplibre's north.
            this.scene.scale.multiply(new THREE.Vector3(1, 1, -1));
            // We now have a scene with (x=east, y=up, z=north)

            const light = new THREE.DirectionalLight(0xffffff);
            // Making it just before noon - light coming from south-east.
            light.position.set(50, 70, -30).normalize();
            this.scene.add(light);


            const sceneElevation = map.queryTerrainElevation(modelOrigin) || 0;
            const sceneOriginMercator = MercatorCoordinate.fromLngLat(modelOrigin);
           

            for (let i = 0; i < geojson.features.length; i++) {
                const feature = geojson.features[i];
                const extrusionValue = feature.properties.height
                const modelElevation = map.queryTerrainElevation(feature.geometry.coordinates) || 0;
                const modelUp = modelElevation - sceneElevation;
                const modelMercator = MercatorCoordinate.fromLngLat(feature.geometry.coordinates);
                const { dEastMeter: modelEast, dNorthMeter: modelNorth } = calculateDistanceMercatorToMeters(sceneOriginMercator, modelMercator);

                
                // Add cylinders alongside the 3D models
                const cylinderGeometry = new THREE.CylinderGeometry(10, 10, extrusionValue, 60); // Adjust parameters as needed
                const cylinderMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // Adjust color as needed
                const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
                cylinder.position.set(modelEast, modelUp + extrusionValue/2, modelNorth); // Adjust position to place the cylinder properly
                this.scene.add(cylinder);

                
            }
        
          
            // Use the MapLibre GL JS map canvas for three.js.
            this.renderer = new THREE.WebGLRenderer({
                canvas: map.getCanvas(),
                context: gl,
                antialias: true
            });

            this.renderer.autoClear = false;
        },

        render(gl, matrix) {

            const rotationX = new THREE.Matrix4().makeRotationAxis(
                new THREE.Vector3(1, 0, 0),
                modelTransform.rotateX
            );
            const rotationY = new THREE.Matrix4().makeRotationAxis(
                new THREE.Vector3(0, 1, 0),
                modelTransform.rotateY
            );
            const rotationZ = new THREE.Matrix4().makeRotationAxis(
                new THREE.Vector3(0, 0, 1),
                modelTransform.rotateZ
            );

            const m = new THREE.Matrix4().fromArray(matrix);
            const l = new THREE.Matrix4()
                .makeTranslation(
                    modelTransform.translateX,
                    modelTransform.translateY,
                    modelTransform.translateZ
                )
                .scale(
                    new THREE.Vector3(
                        modelTransform.scale,
                        -modelTransform.scale,
                        modelTransform.scale
                    )
                )
                .multiply(rotationX)
                .multiply(rotationY)
                .multiply(rotationZ);

            this.camera.projectionMatrix = m.multiply(l);
            this.renderer.resetState();
            this.renderer.render(this.scene, this.camera);
            this.map.triggerRepaint();
        }
    };
  
    map.addLayer(customLayer);

}


   