<template>
    <v-card class="filter-ui" v-show="activeMenu=='filter'" width="400" max-height="400">
        <v-tabs
            v-model="tab"
            align-tabs="center"
            bg-color="blue"
        >
            <v-tab value="municipality">
                Municipality
            </v-tab>
            <v-tab value="buffer" @click="activateBufferTool">
                Buffer
            </v-tab>
            <v-tab value="polygon" @click="activatePolygonTool">
                Polygon
            </v-tab>
           

        </v-tabs>
        <div v-show="tab=='polygon'">
            <v-card-text v-if="polygonData">
                <v-row>
                    <v-col cols="8" class="text-left">
                    
                    <span>Area: {{ polygonData?.polygonArea.toFixed(3) }}  &#13218;</span>  
                    </v-col>
                    
                    <v-col cols="4" class="text-right">
                        <v-icon
                            icon="mdi-texture-box"
                            size="small"
                        ></v-icon>

                    </v-col>
                
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-btn
                            @click="applyPolygon"
                            color="rgba(75, 192, 192, 0.8)"
                            dark
                            block
                            style="color: white;"
                            :disabled="polygonData?.polygonArea? false : true"
                        >
                            Apply Filter
                        </v-btn>
                    </v-col>
                </v-row>
            
            </v-card-text>
            <v-card-text v-else>
                please draw polygon on the map

            </v-card-text>
        </div>
        <div v-show="tab=='buffer'">
            <v-card-text v-if="bufferData">
                <v-row>
                    <v-col cols="10" class="text-left">
                    
                    <span>Buffer Center: Lng: {{ bufferData?.bufferCenter[0].toFixed(3) }} | Lat: {{ bufferData?.bufferCenter[1].toFixed(3) }} </span>  
                    </v-col>
                    
                    <v-col cols="2" class="text-right">
                        <v-icon
                            icon="mdi-map-marker-circle"
                            size="small"
                        ></v-icon>

                    </v-col>
                
                </v-row>
                <v-row>
                    <v-col cols="8" class="text-left">
                    
                    <span>Buffer Distance: {{ bufferData?.bufferRadius.toFixed(3) }} KM</span>  
                    </v-col>
                    
                    <v-col cols="4" class="text-right">
                        <v-icon
                            icon="mdi-map-marker-distance"
                            size="small"
                        ></v-icon>

                    </v-col>
                
                </v-row>
                
                <v-row>
                    <v-col cols="8" class="text-left">
                    
                    <span>Area: {{bufferData?.bufferArea.toFixed(3)}} &#13218;</span>  
                    </v-col>
                    
                    <v-col cols="4" class="text-right">
                        <v-icon
                            icon="mdi-texture-box"
                            size="small"
                        ></v-icon>

                    </v-col>
                
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-btn
                            @click="applyBuffer"
                            color="rgba(75, 192, 192, 0.8)"
                            block
                            style="color:white"
                            :disabled="bufferData?.bufferArea? false : true"
                        >
                            Apply Filter
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-text v-else>
                please draw buffer on the map
            </v-card-text>

        </div>
        <div v-show="tab=='municipality'">
            <v-card-text>
                <v-row>
                        <v-col cols="12" >
                            <v-select
                                v-model="selectedMunicipality"
                                :items="municipalityNames"
                                hide-details
                                label="Select Municipality"
                                item-title="name" 
                                return-object
                                @update:modelValue="getMunicipality()"
                            ></v-select>
                            
                            
                        
                        </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-btn
                            @click="getShapResultsForMunicipality"
                            color="rgba(75, 192, 192, 0.8)"
                            dark
                            block
                            style="color: white;"
                            :disabled="selectedMunicipality? false : true"
                        >
                            Apply Filter
                        </v-btn>
                    </v-col>
                </v-row>
            
            </v-card-text>
        </div>
    </v-card>
</template>

<script setup>
import { ref, defineEmits, onMounted, watch, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMenuStore } from '../stores/menu'
import { useFilterStore } from '../stores/filter'
import {getMunicipalityNames, getTableInstance, getShapForBuffer, getShapForPolygon} from '../services/backend.calls'
import { useXAIStore } from '../stores/xai'
const XAIStore = useXAIStore();

import * as turf from "@turf/turf";

let { bufferData, polygonData } = storeToRefs(useFilterStore())
const filterStore = useFilterStore()
let municipalityNames = ref(null)
let selectedMunicipality = ref(null)
let addedMunicipalityLayerId = ref(null)
const emit = defineEmits(["activateBufferTool","activatePolygonTool", "addGeojsonLayer","removeLayerFromMap", "removeDrawControl"]);

let { activeMenu } = storeToRefs(useMenuStore())
let tab = ref(null)

onMounted(() => {
    getMunicipalities();
})
const activateBufferTool=()=>{
    emit("activateBufferTool")
    
}
const applyBuffer = async() => {
    const bufferShapResults =  await getShapForBuffer(bufferData.value.geojson)
    let predicted_probability ={
        "probability_not_fire": bufferShapResults.ffs.value
    }
    delete bufferShapResults.ffs

    let raster_values = Object.entries(bufferShapResults).map(([key, value]) => ({
        [key]: value.value}))
    raster_values = raster_values.reduce((acc, item) => {
        const key = Object.keys(item)[0]; // Get the first (and only) key
        acc[key] = item[key];             // Assign the value to that key in the accumulator
        return acc;                       // Return the updated accumulator
        }, {});

    let shap_values = Object.entries(bufferShapResults).map(([key, value]) => ({
        [key]: value.shap}))
    let shap = {
        shap_values:{
            class_not_fire:shap_values
        },
        predicted_probability: predicted_probability,
        raster_values_at_clicked_point: raster_values
       
    }
    XAIStore.assignLocalShapValues(shap)
   
    XAIStore.assignClickedCoordinates({
        clickedCoordinates: [12.88071255707, 52.6782439669]
      })
    
}
const applyPolygon = async()=>{
    const polygonShapResults =  await getShapForPolygon(polygonData.value.geojson)
    let predicted_probability ={
        "probability_not_fire": polygonShapResults.ffs.value
    }
    delete polygonShapResults.ffs

    let raster_values = Object.entries(polygonShapResults).map(([key, value]) => ({
        [key]: value.value}))
    raster_values = raster_values.reduce((acc, item) => {
        const key = Object.keys(item)[0]; // Get the first (and only) key
        acc[key] = item[key];             // Assign the value to that key in the accumulator
        return acc;                       // Return the updated accumulator
        }, {});

    let shap_values = Object.entries(polygonShapResults).map(([key, value]) => ({
        [key]: value.shap}))
    let shap = {
        shap_values:{
            class_not_fire:shap_values
        },
        predicted_probability: predicted_probability,
        raster_values_at_clicked_point: raster_values
       
    }
    XAIStore.assignLocalShapValues(shap)
   
    XAIStore.assignClickedCoordinates({
        clickedCoordinates: [12.88071255707, 52.6782439669]
      })

}
const getMunicipalities = async () => {
    
    const municipalities =  await getMunicipalityNames()
    municipalityNames.value= municipalities.map(item => ({
      name: item[0],
      id: item[1]   
    }));
    // Sort the array by the 'name' property (alphabetically)
    municipalityNames.value.sort((a, b) => {
        if (a.name < b.name) {
            return -1; // a comes before b
        }
        if (a.name > b.name) {
            return 1; // b comes before a
        }
        return 0; // a and b are equal
    });

}
const getMunicipality = async () => {
    if(addedMunicipalityLayerId.value!== null){
        emit("removeLayerFromMap", addedMunicipalityLayerId.value)
        emit("removeLayerFromMap", addedMunicipalityLayerId.value+'-line')
    }
    const municipality =  await getTableInstance(selectedMunicipality.value)
    let geojson = municipality.geojson[0]
    emit("addGeojsonLayer", {
        data: geojson,
        id: geojson.features[0].properties.name,
        type: "fill",
        style: {
            'fill-color': '#0080ff', // blue color fill
            'fill-opacity': 0.3
        }
    })
    emit("addGeojsonLayer", {
        data: geojson,
        id: geojson.features[0].properties.name+"-line",
        type: "line",
        style: {
            "line-color": "#267ee0",
            "line-width": 3
        }
    })
    addedMunicipalityLayerId.value = geojson.features[0].properties.name
    let properties = geojson.features[0].properties
    delete properties.ogc_fid
    delete properties.name
    delete properties._uid_
    properties = Object.entries(properties).map(([key, value]) => ({
        [key]: value}))
    filterStore.assignMunicipalityShapSummary(properties)
    let predicted_probability ={
        "probability_not_fire": municipality.shap_values.ffs.value
    }
    delete municipality.shap_values.ffs
    let raster_values = Object.entries(municipality.shap_values).map(([key, value]) => ({
        [key]: value.value}))
    raster_values = raster_values.reduce((acc, item) => {
        const key = Object.keys(item)[0]; // Get the first (and only) key
        acc[key] = item[key];             // Assign the value to that key in the accumulator
        return acc;                       // Return the updated accumulator
        }, {});

    let shap_values = Object.entries(municipality.shap_values).map(([key, value]) => ({
        [key]: value.shap}))
    let shap = {
        shap_values:{
            class_not_fire:shap_values
        },
        predicted_probability: predicted_probability,
        raster_values_at_clicked_point: raster_values
       
    }
    
    XAIStore.assignLocalShapValues(shap)

    var bbox = turf.bbox(geojson);
    emit("fitBoundsToBBOX", {
        bbox: bbox
    })
    XAIStore.assignClickedCoordinates({
        clickedCoordinates: [12.88071255707, 52.6782439669]
      })

}
const activatePolygonTool=()=>{
    emit("activatePolygonTool")
}

watch(() => tab.value, (newValue) => {
    bufferData.value = null
    polygonData.value = null
    if(newValue == "municipality"){
        emit("removeDrawControl")
    }
    else if(newValue == "buffer" || newValue == "polygon"){
        if(addedMunicipalityLayerId.value!== null){
            emit("removeLayerFromMap", addedMunicipalityLayerId.value)
            emit("removeLayerFromMap", addedMunicipalityLayerId.value+'-line')
        }
    }   
})
onUnmounted(() => {
    emit("removeLayerFromMap", addedMunicipalityLayerId.value)
    emit("removeLayerFromMap", addedMunicipalityLayerId.value+'-line')
    emit("removeDrawControl")
})



</script>

<style lang="scss" scoped>
.filter-ui {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 100;
    background-color: rgba(255,255,255,0.6);
    border-radius: 8px;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    -moz-backdrop-filter: blur(5px);
    -ms-backdrop-filter: blur(5px);
    border: 1px solid rgba(0, 0, 0, 0.2);    
}
</style>