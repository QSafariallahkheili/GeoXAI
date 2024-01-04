<template >
    <XAILineChart> </XAILineChart>
    <v-card
        class="mx-auto xai-ui"  width="400" max-height="400"
    >
    <div >
       
       XAI UI
    </div>
    
    </v-card>
          
</template>
<script setup>
import { onMounted, defineEmits, ref} from "vue"
import XAILineChart from "@/components/XAILineChart.vue";

const emit = defineEmits(["addCoverageLayerToMap", "getClickedCoordinate"]);
let layerName = "fire_susceptibility_color"
let layerType = ref("raster")
let style = ref({'raster-opacity' : 1})

const addCoverageLayerToMap = () => {
    emit("addCoverageLayerToMap", layerName, layerType, style)
    emit("getClickedCoordinate")
}

onMounted(() => {
    addCoverageLayerToMap()
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