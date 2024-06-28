<template >
    <XAILineChart @addHoveredLayerToMap="addHoveredLayerToMap" @toggleCoverageLayerVisibility="toggleCoverageLayerVisibility" @toggleCoverageLayerVisibilityWithValue ="toggleCoverageLayerVisibilityWithValue" @addXaiPulseLayer="addXaiPulseLayer"> </XAILineChart>
          
</template>
<script setup>
import { onMounted, defineEmits, ref, onUnmounted} from "vue"
import XAILineChart from "@/components/XAILineChart.vue";
import { useLayersStore } from '../stores/layers'
import { storeToRefs } from 'pinia'
import { useMapLegendStore } from '../stores/mapLegend'
const legendStore = useMapLegendStore();
//import {getHistogram} from '../services/backend.calls'
let { DBTableNames, addedLayers } = storeToRefs(useLayersStore())


const emit = defineEmits(["addCoverageLayerToMap", "getClickedCoordinate", "toggleCoverageLayerVisibility", "removeLayerFromMap", "toggleCoverageLayerVisibilityWithValue", "addXaiPulseLayer"]);
let layerName = "fire_susceptibility"
let layerType = ref("raster")
let style = ref({'raster-opacity' : 1})

const addFireSusceptibilityToMap = () => {
    emit("addCoverageLayerToMap", layerName, layerType, style)
    emit("getClickedCoordinate")
}
const addHoveredLayerToMap = (hoveredLayer) => {
    let index = DBTableNames.value.findIndex(obj => obj.name==hoveredLayer);
    console.log(index)
    if (index!=-1){
        DBTableNames.value[index].checked=!DBTableNames.value[index].checked
        DBTableNames.value = [...DBTableNames.value];
    }
    
    if (!addedLayers.value.includes(hoveredLayer)) {
        emit("addCoverageLayerToMap", hoveredLayer, layerType, style)
        addedLayers.value.push(hoveredLayer);
    }
    else {
        emit("toggleCoverageLayerVisibility", hoveredLayer)

    }
    
    legendStore.setActivatedLegend('visible',hoveredLayer)
}

const toggleCoverageLayerVisibilityWithValue = (layerId, visStatus)=>{
    emit("toggleCoverageLayerVisibilityWithValue", layerId, visStatus)
    if (layerId){
        legendStore.setActivatedLegend(visStatus,layerId)
        
    }
           
}

const addXaiPulseLayer = (clickedCoordinates) => {
    let payload = {
        layerId: "xai-pulse",
        lng: clickedCoordinates[0],
        lat: clickedCoordinates[1]
    }
    emit("addXaiPulseLayer", payload)
}


/*const getHistogramFromBackend = () => {
    getHistogram()
}*/
onMounted(() => {
    addFireSusceptibilityToMap()
    //getHistogramFromBackend()

})

onUnmounted(()=>{
    emit("removeLayerFromMap", "xai-pulse")
})

</script>
    
<style scoped>
.xai-ui{
    overflow-y: scroll;
    background: transparent;
    border-radius: 8px;
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 10;
    background-color: rgba(255,255,255,0.6);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    -moz-backdrop-filter: blur(5px);
    -ms-backdrop-filter: blur(5px);
    border: 1px solid rgba(0, 0, 0, 0.2);   
   
}


</style>