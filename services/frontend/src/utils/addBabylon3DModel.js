
import { MercatorCoordinate } from 'maplibre-gl';
import {Vector3, Matrix, Quaternion, Engine, Scene, Camera, HemisphericLight, SceneLoader, MeshBuilder, Color3, StandardMaterial, Color4, Mesh, MultiMaterial, SubMesh, DynamicTexture } from '@babylonjs/core'; 
import "@babylonjs/loaders/glTF";
import earcut from 'earcut'
import { zonalStatistics } from "../services/backend.calls";

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



const worldOrigin = [13.259101,52.538625];
const worldAltitude = 0;


const worldRotate = [Math.PI / 2, 0, 0];

// Calculate mercator coordinates and scale
const worldOriginMercator = MercatorCoordinate.fromLngLat(
    worldOrigin,
    worldAltitude
);
const worldScale = worldOriginMercator.meterInMercatorCoordinateUnits();
  // Calculate world matrix
const worldMatrix = Matrix.Compose(
    new Vector3(worldScale, worldScale, worldScale),
    Quaternion.FromEulerAngles(
        worldRotate[0],
        worldRotate[1],
        worldRotate[2],
    ),
    new Vector3(
        worldOriginMercator.x,
        worldOriginMercator.y,
        worldOriginMercator.z
    )
);


export async function addCustom3DLayer (map, layerID, ThreeDmodel) {
    const pointGeojson =  await getGeojsonDataFromDB('baum')
  const customLayer = {
        id: layerID,
        type: 'custom',
        renderingMode: '3d',
        onAdd (map, gl) {
            this.engine = new Engine(
                gl,
                true,
                {
                    useHighPrecisionMatrix: true, // Important to prevent jitter at mercator scale
                    
                },
                true
            );
           
            this.scene = new Scene(this.engine);
            this.scene.autoClear = false;
            
            this.scene.detachControl();

            this.scene.beforeRender = () => {
                this.engine.wipeCaches(true);
            };

            // create simple camera (will have its project matrix manually calculated)
            this.camera = new Camera(
                'Camera',
                new Vector3(0, 0, 0),
                this.scene
            );

            // create simple light
            const light = new HemisphericLight(
                'light1',
                new Vector3(0, 0, 100),
                this.scene
            );
            light.intensity = 3;
            const sceneOriginMercator = MercatorCoordinate.fromLngLat(worldOrigin);
            // Add debug axes viewer, positioned at origin, 10 meter axis lengths
            //new AxesViewer(this.scene, 10);
            // load GLTF model in to the scene
            
          
                
            SceneLoader.LoadAssetContainerAsync(ThreeDmodel, '', this.scene).then(modelContainer => {
                modelContainer.addAllToScene();
                const meshes = [];
                modelContainer.meshes.forEach((mesh) => {
                    if (mesh.geometry) {
                        meshes.push(mesh);
                    }
                });
            
                // Merge all meshes into a single mesh
                const mergedMesh = Mesh.MergeMeshes(meshes, true, true, undefined, false, true);
            
                const instances = [];
                for (let i = 0; i < pointGeojson.features.length; i++) {
                    const coords = pointGeojson.features[i].geometry.coordinates;
                    const babylonCoords = MercatorCoordinate.fromLngLat(coords);
                    const { dEastMeter: model1east, dNorthMeter: model1north } = calculateDistanceMercatorToMeters(sceneOriginMercator, babylonCoords);
                    const instance = mergedMesh.createInstance(`tree_instance_${i}`);
                    instance.position.x = model1east;
                    instance.position.z = model1north;
                    let scale = 0.35;
                    instance.scaling = new Vector3(scale, scale, scale);
                    instances.push(instance);
                }
                mergedMesh.renderOutline = true;
                mergedMesh.outlineColor = new Color3(0, 0, 0);
                mergedMesh.outlineWidth = 0.4;
            });
       
            this.map = map;
            //Mesh.MergeMeshes(meshes, true, true, undefined, false, true);
            //this.map = map;

        /*SceneLoader.ImportMesh(
            "", 
            "", 
            ThreeDmodel, 
            this.scene, 
            function (newMeshes
            ) {
                var mesh = newMeshes[1]
                // Make the "root" mesh not visible. The instanced versions of it that we
                // create below will be visible.
                mesh.isVisible = false;
                for (let i = 0; i < pointGeojson.features.length; i++) {
                    var newInstance = mesh.createInstance("tree" + i);
                    const coords = pointGeojson.features[i].geometry.coordinates;
                    // Getting model x and y (in meters) relative to scene origin.
                   
                    const babylonCoords = MercatorCoordinate.fromLngLat(coords)
                    const {dEastMeter: model1east, dNorthMeter: model1north} = calculateDistanceMercatorToMeters(sceneOriginMercator, babylonCoords);
                    newInstance.position.x = model1east;
                    newInstance.position.z = model1north;
                    let scale = 0.5
                    newInstance.scaling = new Vector3(scale, scale,scale); 
                    newInstance.position.set(model1east,  scale/2, model1north);
                    meshes.push(newInstance)
                }
            }
        );
        Mesh.MergeMeshes(meshes, true, true, undefined, false, true);*/
        
        },
        render (gl, matrix) {
            
            if(this.scene) {
                const cameraMatrix = Matrix.FromArray(matrix);

                // world-view-projection matrix
                const wvpMatrix = worldMatrix.multiply(cameraMatrix);
    
                this.camera.freezeProjectionMatrix(wvpMatrix);
    
                this.scene.render(false);
                this.map.triggerRepaint();


                
           }
        }
    };

    
    map.addLayer(customLayer);
}




export function addCustomCylinderLayer (map, layerID) {
    
    const customLayer = {
        id: layerID,
        type: 'custom',
        renderingMode: '3d',
        onAdd (map, gl) {
            this.engine = new Engine(
                gl,
                true,
                {
                    useHighPrecisionMatrix: true // Important to prevent jitter at mercator scale
                },
                true
            );
            this.scene = new Scene(this.engine);
            this.scene.autoClear = false;
            
            this.scene.detachControl();

            this.scene.beforeRender = () => {
                this.engine.wipeCaches(true);
            };
    
            // create simple camera (will have its project matrix manually calculated)
            this.camera = new Camera(
                'Camera',
                new Vector3(0, 0, 0),
                this.scene
            );
    
            // create simple light
            const light = new HemisphericLight(
                'light1',
                new Vector3(-1, -1, 0),
                this.scene
            );
            light.intensity = 4;
    
                //const cylinder = new MeshBuilder.CreateCylinder("cylinder", {height:100, diameterTop:20, diameterBottom: 20 });
            const sceneOriginMercator = MercatorCoordinate.fromLngLat(worldOrigin);
            let meshes = []
            for (let i = 1; i < geojson.features.length; i++){
                    
                const coords = geojson.features[i].geometry.coordinates;
                const extrusionValue = geojson.features[i].properties.height
                // Getting model x and y (in meters) relative to scene origin.
                
                const babylonCoords = MercatorCoordinate.fromLngLat(coords)
                const {dEastMeter: model1east, dNorthMeter: model1north} = calculateDistanceMercatorToMeters(sceneOriginMercator, babylonCoords);

                
                //const clonedCylinder = cylinder.clone();
                /*const faceColors = [ ];
                faceColors[0] = new Color4(1, 0, 0,0)
                faceColors[1] = new Color4(1, 0.5, 0.5, 0)
                faceColors[2] = new Color4(0.5, 0.5, 0.5, 0)*/
                
                const cylinder = new MeshBuilder.CreateCylinder("cylinder"+i, {height:extrusionValue, diameter:20, tessellation:6,/*faceColors: faceColors */});
                
                cylinder.position.x = model1east;
                cylinder.position.z = model1north;
                let scale = 2
                cylinder.scaling = new Vector3(scale, scale,scale); 

                cylinder.position.set(model1east,  extrusionValue * (scale/2), model1north);
                cylinder.createNormals(true);
                cylinder.enableEdgesRendering();
                cylinder.edgesWidth = 200;
                cylinder.edgesColor = new Color4(0, 0, 0, 0.2);


                let mat = new StandardMaterial("Mat");
                mat.diffuseColor = new Color3(0, 0, 1);
                mat.alpha = 0.8;	
                cylinder.material = mat;
                meshes.push(cylinder)

                
                const box = MeshBuilder.CreateBox('box'+i, { height: 60, width: 60, depth: 60 }, this.scene);
                box.position.set(model1east,  60 /2, model1north);
                box.material = mat;
                // Associate GeoJSON feature with the cylinder
                cylinder.geojsonFeature = geojson.features[i];
                meshes.push(box)
        
            }
            Mesh.MergeMeshes(meshes, true, true, undefined, false, true);
            this.map = map;
            map.on('click', this.onCanvasClick.bind(this));
        },
        render (gl, matrix) {
            
           

            if(this.scene) {
            
                const cameraMatrix = Matrix.FromArray(matrix);

                // world-view-projection matrix
                const wvpMatrix = worldMatrix.multiply(cameraMatrix);

                this.camera.freezeProjectionMatrix(wvpMatrix);

                this.scene.render(false);
                this.map.triggerRepaint();
                
            }
        },
        onCanvasClick(e) {
            const canvasCoords = [e.point.x, e.point.y];

            // Use Babylon's scene.pick method to check if any 3D objects were clicked
            const picked = this.scene.pick(canvasCoords[0], canvasCoords[1]);

            // If an object was picked, log its name to the console
            if (picked && picked.hit) {
                console.log("Object clicked:", picked.pickedMesh.name);

                // Retrieve the associated GeoJSON feature
                const geojsonFeature = picked.pickedMesh.geojsonFeature;
                if (geojsonFeature) {
                    console.log("GeoJSON feature properties:", geojsonFeature.properties, "GeoJSON feature coordinates:", geojsonFeature.geometry.coordinates);
                }
            }
        }
    };
    
    map.addLayer(customLayer);
}


import {getGeojsonDataFromDB} from "../services/backend.calls";

export async function addCustomPolygonLayer (map, layerID) {
    const polygonGeojson =  await getGeojsonDataFromDB('gebaeude')
    const customLayer = {
        id: layerID,
        type: 'custom',
        renderingMode: '3d',
        onAdd (map, gl) {
            this.engine = new Engine(
                gl,
                true,
                {
                    useHighPrecisionMatrix: true // Important to prevent jitter at mercator scale
                },
                true
            );
            this.scene = new Scene(this.engine);
            this.scene.autoClear = false;
            
            this.scene.detachControl();

            this.scene.beforeRender = () => {
                this.engine.wipeCaches(true);
            };
    
            // create simple camera (will have its project matrix manually calculated)
            this.camera = new Camera(
                'Camera',
                new Vector3(0, 1, 0),
                this.scene
            );    
            // create simple light
            const light = new HemisphericLight(
                'light1',
                new Vector3(0, 1, 0),
                this.scene
            );
            light.intensity = 1.5;
    
            //const cylinder = new MeshBuilder.CreateCylinder("cylinder", {height:100, diameterTop:20, diameterBottom: 20 });
            const sceneOriginMercator = MercatorCoordinate.fromLngLat(worldOrigin);
            
            /*const polygonGeojson = {
                type: "FeatureCollection",
                features: [
                  {
                    type: "Feature",
                    properties: {
                        height: 10
                    },
                    geometry: {
                      type: "Polygon",
                      coordinates: [[13.259005, 52.536713], [13.259426, 52.536683], [13.259406, 52.536584], [13.258985, 52.536615]]
                    }
                  },
                  {
                    type: "Feature",
                    properties: {
                        height: 20
                    },
                    geometry: {
                      type: "Polygon",
                      coordinates: [[13.255430840843115, 52.53719227540887 ], 
                      [13.256094689072446, 52.53713925337073], 
                      [13.256030816512704, 52.536842315325806], 
                      [13.256168950114684, 52.5368321184483], 
                      [13.256195773103705, 52.53695325393853], 
                      [13.256349329289444, 52.5369406099550 ], 
                      [13.25632384793228,52.536818251107576],
                      [13.256395503313989, 52.53681243489944],
                      [13.25635431064123, 52.536629267248934],
                      [ 13.255615257040906, 52.536687735113055],
                      [13.255679939354241, 52.536987370461745],
                      [13.255391116200286, 52.53701076446046]]
                    }
                  }
                ]
            };*/

            let mat = new StandardMaterial("Mat");
            mat.diffuseColor = new Color3(0.5, 0.5, 0.5);
            mat.specularColor = new Color3(0, 0, 0);
            mat.alpha = 1;	
            // Disable backface culling for the material
            mat.backFaceCulling = false;

           
   
            let meshes = []
            //let finalMeshes = []
            for (let i=1; i< polygonGeojson.features.length; i++) {
                let geomCoordsArray = polygonGeojson.features[i].geometry.coordinates[0][0]
                
                //console.log(geomCoordsArray)
                //let extrusionValue = polygonGeojson.features[i].properties.height
                let extrusionValue = 10
                let points = []
                //let internalMeshes = []
                for (let j =0; j<geomCoordsArray.length; j++) {
                    const coords = geomCoordsArray[j];
                    const babylonCoords = MercatorCoordinate.fromLngLat(coords)
                    
                    const {dEastMeter: model1east, dNorthMeter: model1north} = calculateDistanceMercatorToMeters(sceneOriginMercator, babylonCoords);
                    points.push(new Vector3(model1east,extrusionValue, model1north))
    
                }
                //// TODO: cloning or instancing meshes to consume less memory for huge dataset
                
                const polygon = MeshBuilder.ExtrudePolygon("polygon"+i, {shape: points, depth: extrusionValue}, this.scene, earcut);
                polygon.position.y = extrusionValue;
                polygon.material = mat;
                
                polygon.geojsonFeature = polygonGeojson.features[i];
                //////// !!!Edge rendering decreases the performance!!!  /////              
                /*polygon.enableEdgesRendering();
                polygon.edgesWidth = 100;
                polygon.edgesColor = new Color4(0, 0, 0, 0.3);
                polygon.renderOutline = false;
                polygon.outlineColor = new Color3(0, 0, 0);
                polygon.outlineWidth = 0.8;*/
                // Create instance
                meshes.push(polygon)
                ///////////////// create Pyramidal roof ////////////////////
                if (points.length==5){
                    //let height = 5
                    const pointsArray = points.slice(0,4)
                    let midPoint = new Vector3(
                        (pointsArray[0].x + pointsArray[1].x + pointsArray[2].x + pointsArray[3].x) / 4,
                        14, // Assuming constant y-coordinate for the base
                        (pointsArray[0].z + pointsArray[1].z + pointsArray[2].z + pointsArray[3].z) / 4
                    );
                    const apex = new Vector3(midPoint.x, 14, midPoint.z);
                   
                   
                    const roofParames = { 
                        "name":"Pyramidal roof", 
                        "category":["roof"], 
                        "vertex":[[pointsArray[0].x, pointsArray[0].y, pointsArray[0].z],[pointsArray[1].x, pointsArray[1].y, pointsArray[1].z],[pointsArray[2].x, pointsArray[2].y, pointsArray[2].z],[pointsArray[3].x, pointsArray[3].y, pointsArray[3].z],[apex.x,apex.y, apex.z]],
                        "face":[[0, 1, 4],[1, 2, 4],[2, 3, 4],[3, 0, 4]]
                    };
                    const pyramidalRoof = MeshBuilder.CreatePolyhedron("roof"+i, {custom: roofParames}, this.scene);
                    
                    pyramidalRoof.material = mat;
                    pyramidalRoof.enableEdgesRendering();
                    pyramidalRoof.edgesWidth = 100;
                    pyramidalRoof.edgesColor = new Color4(0, 0, 0, 0.8);
                    meshes.push(pyramidalRoof)
              
                    //parameters - arrayOfMeshes, disposeSource, allow32BitsIndices, meshSubclass, subdivideWithSubMeshes, multiMultiMaterial
                    //Mesh.MergeMeshes([hipRoof, polygon], true, true, undefined, false, true);

                }
               
       
            }
            
            const mergedMeshes = Mesh.MergeMeshes(meshes, true, true, undefined, false, true);
            mergedMeshes.enableEdgesRendering(0.9999);
            mergedMeshes.edgesColor = new Color4(0, 0, 0, 0.7);
            mergedMeshes.edgesWidth = 100;
            mergedMeshes.renderOutline = false;
            mergedMeshes.outlineColor = new Color3(0, 0, 0);
            mergedMeshes.outlineWidth = 0.4;
            //newMesh.outlineWidth = 0.0001;

            
            this.map = map;
            map.on('click', this.onCanvasClick.bind(this));
        },
        render (gl, matrix) {
            
           

            if(this.scene) {
            
                const cameraMatrix = Matrix.FromArray(matrix);

                // world-view-projection matrix
                const wvpMatrix = worldMatrix.multiply(cameraMatrix);

                this.camera.freezeProjectionMatrix(wvpMatrix);

                this.scene.render(false);
                this.map.triggerRepaint();
                
            }
        },
        onCanvasClick(e) {
            const canvasCoords = [e.point.x, e.point.y];

            // Use Babylon's scene.pick method to check if any 3D objects were clicked
            const picked = this.scene.pick(canvasCoords[0], canvasCoords[1]);

            // If an object was picked, log its name to the console
            if (picked && picked.hit) {
                console.log("Object clicked:", picked.pickedMesh.name);

                // Retrieve the associated GeoJSON feature
                const geojsonFeature = picked.pickedMesh.geojsonFeature;
                if (geojsonFeature) {
                    console.log("GeoJSON feature properties:", geojsonFeature.properties, "GeoJSON feature coordinates:", geojsonFeature.geometry.coordinates);
                }
            }
        }
    };
    
    map.addLayer(customLayer);
}


export function addCubeGeometry (map, layerID, lng, lat, localShapValues) {
    let bbox
    const customLayer = {
        id: layerID,
        type: 'custom',
        renderingMode: '3d',
        onAdd (map, gl) {
            this.engine = new Engine(
                gl,
                true,
                {
                    useHighPrecisionMatrix: true // Important to prevent jitter at mercator scale
                },
                true
            );
            this.scene = new Scene(this.engine);
            this.scene.autoClear = false;
            
            this.scene.detachControl();

            this.scene.beforeRender = () => {
                this.engine.wipeCaches(true);
            };
    
            // create simple camera (will have its project matrix manually calculated)
            this.camera = new Camera(
                'Camera',
                new Vector3(0, 0, 0),
                this.scene
            );
    
            // create simple light
            const light = new HemisphericLight(
                'light1',
                new Vector3(-1, -1, 0),
                this.scene
            );
            light.intensity = 4;
            const sceneOriginMercator = MercatorCoordinate.fromLngLat(worldOrigin);
           
            const coords = [lng, lat];
            const babylonCoords = MercatorCoordinate.fromLngLat(coords)
            
            const {dEastMeter: model1east, dNorthMeter: model1north} = calculateDistanceMercatorToMeters(sceneOriginMercator, babylonCoords);
            
            let squareSideLength = 10000
            const box = MeshBuilder.CreateBox('box', { height: squareSideLength, width: squareSideLength, depth: squareSideLength}, this.scene);
            let distanceFromGround = 20000
            box.position.set(model1east,  distanceFromGround, model1north);


            //////////////////////// footprint box //////////////////////////
            let mat = new StandardMaterial("Mat");
            mat.diffuseColor = new Color3(0, 0, 1);
            mat.alpha = 0;	

            const boxFootprint = MeshBuilder.CreateBox('boxfootprint', { height: distanceFromGround - (squareSideLength/2), width: squareSideLength, depth: squareSideLength }, this.scene);
            boxFootprint.position.set(model1east,  (distanceFromGround - (squareSideLength/2))/2, model1north);
            boxFootprint.scaling = new Vector3(1, 1,1); 
            boxFootprint.material = mat;
            boxFootprint.enableEdgesRendering();
            boxFootprint.edgesWidth = 300;
            boxFootprint.edgesColor = new Color4(0.5, 0.5, 0.5, 0.5);
            /////////////////////////// compute bbox //////////////////////////////

            var R = 6371000; // Earth's radius in meters
            let boxDiameter = squareSideLength * Math.sqrt(2)
            let d = (boxDiameter/2) / R; 

            let bearing1 = 315 * (Math.PI/180);
            let bearing2 = 135 * (Math.PI/180);
            let lat1Rad = (lat * Math.PI) / 180; 
            let lng1Rad = (lng * Math.PI) / 180;
            let lat2Rad = Math.asin(Math.sin(lat1Rad) * Math.cos(d) + Math.cos(lat1Rad) * Math.sin(d) * Math.cos(bearing1));
            let lng2Rad = lng1Rad + Math.atan2(Math.sin(bearing1) * Math.sin(d) * Math.cos(lat1Rad), Math.cos(d) - Math.sin(lat1Rad) * Math.sin(lat2Rad));
     
            let topLeft = [(lng2Rad * 180) / Math.PI , (lat2Rad * 180) / Math.PI]


            let lat3Rad = Math.asin(Math.sin(lat1Rad) * Math.cos(d) + Math.cos(lat1Rad) * Math.sin(d) * Math.cos(bearing2));
            let lng3Rad = lng1Rad + Math.atan2(Math.sin(bearing2) * Math.sin(d) * Math.cos(lat1Rad),
            Math.cos(d) - Math.sin(lat1Rad) * Math.sin(lat2Rad));

            let bottomRight = [(lng3Rad * 180) / Math.PI , (lat3Rad * 180) / Math.PI]

            bbox = {'minX': topLeft[0], 'maxY': topLeft[1], 'maxX': bottomRight[0], 'minY':  bottomRight[1]}
            let bboxText = bbox.minX+','+ bbox.minY+','+bbox.maxX+','+bbox.maxY

            /////////////////////////// get the first 5 contributing predictors (positive or negative) from shap values //////////////////////////////
            
            // Rank the local shap objects based on the absolute values of their shap value
            const rankedShapValues = localShapValues.shap_values.class_fire.sort((a, b) => {
                const aValue = Math.abs(Object.values(a)[0]);
                const bValue = Math.abs(Object.values(b)[0]);
                return bValue - aValue; // Sort in descending order of absolute values
            });
           
            const firstFiveElements = rankedShapValues.slice(0, 5);
            console.log(firstFiveElements)
            /////////////////////////// apply the texture on cube faces coming from geoserver as png //////////////////////////////
            let geoserver_base_url= process.env.VUE_APP_GEOSERVER_URL
            const multiMaterial = new MultiMaterial("multi", this.scene);
            const textureResolution = 512;
            let materials = []
            for (let i = 0; i < 5; i++){
                
                let textureGround = new DynamicTexture("dynamic texture", textureResolution, this.scene);   
                let textureContext = textureGround.getContext();
                let material = new StandardMaterial("material"+i, this.scene);    				
                material.diffuseTexture = textureGround;
     
                let textOnCubeFace = Object.values(firstFiveElements[i])[0] > 0 ? `${Object.keys(firstFiveElements[i])[0] } ${i+1} \u2193` : `${Object.keys(firstFiveElements[i])[0] } ${i+1} \u2191`
                let img = new Image();
                img.crossOrigin='anonymous'
                img.src = geoserver_base_url+'/geoxai/wms?BBOX='+bboxText+'&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG:4326&WIDTH='+textureResolution+'&HEIGHT='+textureResolution+'&LAYERS=geoxai:'+Object.keys(firstFiveElements[i])[0]+'&FORMAT=image/PNG&transparent=true';
                img.onload = function() {
                    //Add image to dynamic texture
                    textureContext.drawImage(this, 0,0);
                    textureGround.update();	
                    //Add text to dynamic texture
                    var font = "bold 20px serif";
                    textureGround.drawText(textOnCubeFace, 10, 25, font, "yellow", null, true, true);
                }  
                if (i==0){
                    material.diffuseTexture.wAng = 90 * (Math.PI/180);
                }
                else if (i==2){
                    material.diffuseTexture.wAng = 180 * (Math.PI/180);
                }
                else if (i==4){
                    material.diffuseTexture.wAng = 0 * (Math.PI/180);
                }
                materials.push(material)
            }
            multiMaterial.subMaterials.push(materials[4]);
            multiMaterial.subMaterials.push(materials[1]);
            multiMaterial.subMaterials.push(materials[2]);
            multiMaterial.subMaterials.push(materials[3]);
            multiMaterial.subMaterials.push(materials[0]);
            
            //apply material
            box.subMeshes=[];

            // Iterate over each face of the cube
            for (let i = 0; i < 5; i++) {
                const startIndex = i * 6; // Each face has 6 vertices
                const subMesh = new SubMesh(i, 0, box.getTotalVertices(), startIndex, 6, box);
                subMesh.materialIndex = i; // Assign the material index

                // assign the shap values info to submeshes
                if (subMesh.indexStart==24){
                    subMesh.meshInformation = firstFiveElements[0]
                }
                else if (subMesh.indexStart==0){
                    subMesh.meshInformation = firstFiveElements[4]
                }
                else {
                    subMesh.meshInformation = firstFiveElements[i]
                }
                box.subMeshes.push(subMesh);
                
            }

            box.material = multiMaterial
            box.createNormals(true);
            box.enableEdgesRendering();
            box.edgesWidth = 200;
            box.edgesColor = new Color4(0, 0, 0, 1);

            
            this.map = map;
            map.on('click', this.onCanvasClick.bind(this));
        },
        render (gl, matrix) {
            
           

            if(this.scene) {
            
                const cameraMatrix = Matrix.FromArray(matrix);

                // world-view-projection matrix
                const wvpMatrix = worldMatrix.multiply(cameraMatrix);

                this.camera.freezeProjectionMatrix(wvpMatrix);

                this.scene.render(false);
                this.map.triggerRepaint();
                
            }
        },
        async onCanvasClick(e)  {
            const canvasCoords = [e.point.x, e.point.y];

            // Use Babylon's scene.pick method to check if any 3D objects were clicked
            const picked = this.scene.pick(canvasCoords[0], canvasCoords[1]);
            // If an object was picked, log its name to the console
            if (picked && picked.hit) {
                // Check if a submesh was clicked
                if (picked.subMeshId !== undefined) {
                    const subMeshId = picked.subMeshId;
                    // Now you can access the submesh using its id
                    const subMesh = picked.pickedMesh.subMeshes[subMeshId];
                    console.log("Submesh details:", subMesh.meshInformation);
                    const response =  await zonalStatistics(String(Object.keys(subMesh.meshInformation)), [bbox])
                    console.log(response.data)
                }
                
            }
            
        }
    };
    let layer = map.getLayer("cube");

    if(typeof layer !== 'undefined') {

        map.removeLayer("cube")
    }
    map.addLayer(customLayer);
    return { customLayer }; 
}

