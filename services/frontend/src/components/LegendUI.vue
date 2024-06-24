<template>
    <v-card class="legend-ui" >

       
        <v-card-item v-if="classIntervalsAndColor" >
            <div class="legend-item">
                <div class="color-strip strip1"  :style="{ backgroundColor: classIntervalsAndColor[0]['color1']}"></div>
                <div class="legend-label">{{ minMax[0] }}</div>
            </div>
            <div class="legend-item">
                <div class="color-strip strip2" :style="{ backgroundColor: classIntervalsAndColor[1]['color2']}"></div>
                <div class="legend-label">{{ classIntervalsAndColor[0]['interval1'] }}</div>
            </div>
            <div class="legend-item">
                <div class="color-strip strip3" :style="{ backgroundColor: classIntervalsAndColor[2]['color3']}"></div>
                <div class="legend-label">{{ classIntervalsAndColor[1]['interval2'] }}</div>
            </div>
            <div class="legend-item">
                <div class="color-strip strip4" :style="{ backgroundColor: classIntervalsAndColor[3]['color4']}"></div>
                <div class="legend-label">{{ classIntervalsAndColor[2]['interval3'] }}</div>
            </div>
            <div class="legend-item">
                <div class="color-strip strip5" :style="{ backgroundColor: classIntervalsAndColor[4]['color5']}"></div>
                <div class="legend-label">{{ classIntervalsAndColor[3]['interval4'] }}</div>
                <div class="legend-label-max">{{ minMax[1] }}</div>
            </div>
        </v-card-item>
        <v-card-item v-if="rasterLegendUrl">
            <div class="mb-2">
                <v-icon
                        size="small"
                        variant="text"
                        density="compact"
                        @click="showMetadata(rasterLegendTitle)"
                    >
                    <font-awesome-icon :icon="['fas', 'circle-info']" />
                </v-icon>
                {{rasterLegendTitle}}
                
            </div>
            <div>
                 <img :src="rasterLegendUrl" alt="Legend" />
            </div>
        </v-card-item>
    </v-card>
</template>
<script setup>
import { storeToRefs } from 'pinia'
import { useMapLegendStore } from '../stores/mapLegend'
import { useMetadataDialogStore } from '../stores/metadataDialog'
import featureMetadata from '../assets/featureMetadata'

const metadataDialogStore = useMetadataDialogStore();
let { minMax, classIntervalsAndColor, rasterLegendUrl, rasterLegendTitle} = storeToRefs(useMapLegendStore())

const showMetadata = (featureName) =>{
    metadataDialogStore.assignMetadata(featureMetadata[featureName].metadata, featureName)

}
</script>

<style scoped>

.legend-ui {
    position: absolute;
    right: 10px;
    bottom: 10px;
    z-index:10;
    background: white;
    background-color: rgba(255,255,255,0.6);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    -moz-backdrop-filter: blur(5px);
    -ms-backdrop-filter: blur(5px);
    width: auto;
    border-radius: 8px;
}
.color-strip {
  width: 60px; 
  height: 12px; 
  display: inline-block; 
}

.legend-item {
    display: inline-block; 
  
}

.legend-label {
  text-align: left;
  font-size: 0.7rem;
}
.legend-label-max {
    position: absolute;
    top:30px;
    left: 300px;
    white-space: normal;
    justify-content: center;
    font-size: 0.7rem;
}

</style>