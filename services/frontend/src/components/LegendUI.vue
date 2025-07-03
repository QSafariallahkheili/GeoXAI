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
        <v-card-item  v-if="activatedGeovisStyle === 'bivariate'">
            <div class="bivariate-legend-container">
                <span  style="text-orientation: mixed;  writing-mode: vertical-rl; "> 
                        
                       {{firstProperties }}
                </span>
                    
                <div class="bivariate-y-axis">
                    <span>High</span>
                    <span style="font-weight: bold; font-size: 1.5rem;">&uarr;</span>
                    <span>Low</span>
                        
                 </div>
                    
                    

                <!-- Legend Grid -->
                <div class="bivariate-legend">
                
                    <div class="bivariate-legend-grid">
                        <div
                            v-for="(color, index) in bivariateColorpalette"
                            :key="index"
                            :id="'bivariate'+index"
                            :style="{ backgroundColor: color }"
                            class="bivariate-legend-cell"
                        >
                        <!--<span class="bivariate-legend-label">{{ key.replace('_', ' / ') }}</span>-->
                        </div>
                    </div>

                    <!-- X-axis Labels and Arrow -->
                    <div class="bivariate-x-axis">
                        <span>Low</span>
                        
                        <span style="font-weight: bold; font-size: 1.5rem;">&rarr;</span>
                        
                        <span>High</span>
                    </div>
                    <span> 
                    
                    {{ secondProperties }}
                    </span>
                    
                
                    
                </div>
            </div>
        </v-card-item>
          <!-- Legend for ink circle uncertainty -->
        <v-card-item style="font-size: 0.7rem;" v-if=" uncertaintyStyle === 'ink'">
          <div class="legend-item mr-1">
            <div class="ink-circle ink-level-very-low"></div>
            <span>Very Low</span>
          </div>
          <div class="legend-item mr-1">
            <div class="ink-circle ink-level-low"></div>
            <span>Low</span>
          </div>
          <div class="legend-item mr-1">
            <div class="ink-circle ink-level-medium"></div>
            <span>Medium</span>
          </div>
          <div class="legend-item mr-1">
            <div class="ink-circle ink-level-high"></div>
            <span>High</span>
          </div>
          <div class="legend-item">
            <div class="ink-circle ink-level-very-high"></div>
            <span>Very High</span>
          </div>
          <div class="font-weight-bold">
            Uncertainty
          </div>
        </v-card-item>
         <!-- Legend for fuzzy circle uncertainty -->
        <v-card-item style="font-size: 0.7rem;"  v-if="uncertaintyStyle === 'fuzzy'">
            <div class="legend-item mr-1">
                <div class="fuzzy-circle level-very-low"></div>
                <span>Very Low</span>
            </div>
            <div class="legend-item mr-1">
                <div class="fuzzy-circle level-low"></div>
                <span>Low</span>
            </div>
            <div class="legend-item mr-1">
                <div class="fuzzy-circle level-medium"></div>
                <span>Medium</span>
            </div>
            <div class="legend-item mr-1">
                <div class="fuzzy-circle level-high"></div>
                <span>High</span>
            </div>
            <div class="legend-item">
                <div class="fuzzy-circle level-very-high"></div>
                <span>Very High</span>
            </div>
            <div class="font-weight-bold">
                Uncertainty
            </div>
            
        </v-card-item>
        <!-- Legend for Circle position uncertainty -->
        <v-card-item v-if="uncertaintyStyle === 'position'">
            <div class="circle">
                <div class="point center"></div>
                <div class="label center-label">Certain</div>
                <div class="point edge"></div>
                <div class="label edge-label">Uncertain</div>
                <div class="arrow"></div>
                </div>
                <div class="font-weight-bold">
                Uncertainty
                </div>
        </v-card-item>
        <!-- Legend for Circle and Square styles that applies the first selected variable always mapped on color -->
        <v-card-item v-if="(activatedGeovisStyle === 'circle' || activatedGeovisStyle === 'square') && (legendVisVar1 === 'color' || legendVisVar2 === 'color')">
           
            <div class="legend-item">
                <div class="color-strip strip1"  :style="{ backgroundColor: selectedColorPalette.colors[0]}"></div>
                <div class="legend-label">{{  legendVisVar1 === 'color'?firstPropertiesClassIntervals[0].toFixed(2):secondPropertiesClassIntervals[0].toFixed(2)}}</div>
            </div>
            <div class="legend-item">
                <div class="color-strip strip2" :style="{ backgroundColor: selectedColorPalette.colors[1]}"></div>
                <div class="legend-label">{{ legendVisVar1 === 'color'?firstPropertiesClassIntervals[1].toFixed(2):secondPropertiesClassIntervals[1].toFixed(2) }}</div>
            </div>
            <div class="legend-item">
                <div class="color-strip strip3" :style="{ backgroundColor: selectedColorPalette.colors[2]}"></div>
                <div class="legend-label">{{ legendVisVar1 === 'color'?firstPropertiesClassIntervals[2].toFixed(2):secondPropertiesClassIntervals[2].toFixed(2) }}</div>
            </div>
            <div class="legend-item">
                <div class="color-strip strip4" :style="{ backgroundColor: selectedColorPalette.colors[3]}"></div>
                <div class="legend-label">{{ legendVisVar1 === 'color'?firstPropertiesClassIntervals[3].toFixed(2):secondPropertiesClassIntervals[3].toFixed(2) }}</div>
            </div>
            <div class="legend-item">
                <div class="color-strip strip5" :style="{ backgroundColor: selectedColorPalette.colors[4]}"></div>
                <div class="legend-label">{{ legendVisVar1 === 'color'?firstPropertiesClassIntervals[4].toFixed(2):secondPropertiesClassIntervals[4].toFixed(2) }}</div>
           
            </div>
            <div class="mb-0 font-weight-bold">
                {{legendVisVar1 === 'color'?firstProperties:secondProperties}}    
            </div>
        </v-card-item>
        <!-- Legend for Circle size -->
        <v-card-item style="font-size: 0.7rem;" v-if="(activatedGeovisStyle === 'circle'|| activatedGeovisStyle === 'square') && (legendVisVar1 === 'size' || legendVisVar2 === 'size')">
            <div class="diagonal-line"></div>
            <div class="horizontal-line"></div>
            <div class="legend-item mr-1">
                <div :class="[
                  activatedGeovisStyle === 'circle' ? 'circle-very-low' :
                  activatedGeovisStyle === 'square' ? 'square-very-low' : ''
                ]"></div>
               <div >{{  legendVisVar1 === 'size'?firstPropertiesClassIntervals[0].toFixed(2):secondPropertiesClassIntervals[0].toFixed(2)}}</div>
            </div>
            <div class="legend-item mr-6">
               <div :class="[
                  activatedGeovisStyle === 'circle' ? 'circle-low' :
                  activatedGeovisStyle === 'square' ? 'square-low' : ''
                ]"></div>
               <div >{{  legendVisVar1 === 'size'?firstPropertiesClassIntervals[1].toFixed(2):secondPropertiesClassIntervals[1].toFixed(2)}}</div>
            </div>
            <div class="legend-item mr-6">
               <div :class="[
                  activatedGeovisStyle === 'circle' ? 'circle-medium' :
                  activatedGeovisStyle === 'square' ? 'square-medium' : ''
                ]"></div>
               <div >{{  legendVisVar1 === 'size'?firstPropertiesClassIntervals[2].toFixed(2):secondPropertiesClassIntervals[2].toFixed(2)}}</div>
            </div>
            <div class="legend-item  mr-6">
                <div :class="[
                  activatedGeovisStyle === 'circle' ? 'circle-high' :
                  activatedGeovisStyle === 'square' ? 'square-high' : ''
                ]"></div>
               <div >{{  legendVisVar1 === 'size'?firstPropertiesClassIntervals[3].toFixed(2):secondPropertiesClassIntervals[3].toFixed(2)}}</div>
            </div>
            <div class="legend-item">
               <div :class="[
                  activatedGeovisStyle === 'circle' ? 'circle-very-high' :
                  activatedGeovisStyle === 'square' ? 'square-very-high' : ''
                ]"></div>
               <div >{{  legendVisVar1 === 'size'?firstPropertiesClassIntervals[4].toFixed(2):secondPropertiesClassIntervals[4].toFixed(2)}}</div>
           
            </div>
            <div class="mb-0 font-weight-bold">
               {{legendVisVar1 === 'size'?firstProperties:secondProperties}}        
            </div>
        </v-card-item>

      

        
    </v-card>
</template>
<script setup>
import {ref} from 'vue'
import { storeToRefs } from 'pinia'
import { useMapLegendStore } from '../stores/mapLegend'
import { useMetadataDialogStore } from '../stores/metadataDialog'
import featureMetadata from '../assets/featureMetadata'

const metadataDialogStore = useMetadataDialogStore();
let { minMax, classIntervalsAndColor, rasterLegendUrl, rasterLegendTitle, activatedGeovisStyle, firstProperties, firstPropertiesClassIntervals, secondProperties,secondPropertiesClassIntervals, selectedColorPalette, uncertaintyStyle, legendVisVar1, legendVisVar2} = storeToRefs(useMapLegendStore())
let  bivariateColorpalette= ref({
             'high_low': '#be64ac', 'high_medium': '#8c62aa', 'high_high':'#3b4994',
             'medium_low': '#dfb0d6', 'medium_medium': '#a5add3', 'medium_high':'#5698b9',
            'low_low': '#e8e8e8', 'low_medium': '#ace4e4', 'low_high':'#5ac8c8'
        }) 
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
.bivariate-legend-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.bivariate-legend {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bivariate-legend-grid {
  display: grid;
  grid-template-columns: repeat(3, 50px); /* 3 columns */
  grid-template-rows: repeat(3, 50px); /* 3 rows */
  gap: 0px;
}

.bivariate-legend-cell {
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.bivariate-legend-label {
  font-size: 0.8rem;
  color: #333;
  text-align: center;
}

/* X-axis Labels and Arrow */
.bivariate-x-axis {
  display: flex;
  justify-content: space-between;
  width: 150px; /* To match the width of the grid */
  margin-top: 5px;
  font-size: 0.7rem;
  text-align: center;
}

/* Y-axis Labels and Arrow */
.bivariate-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 150px; /* To match the height of the grid */
  margin-right: 5px;
  margin-bottom: 15px;
  font-size: 0.7rem;
  text-align: center;
}

.label-container {
    display: flex;
    flex-direction: columnrow; /* Horizontal layout */
    gap: 30px; /* Optional: space between items */
    align-items: center; /* Align items vertically in the center */
    font-size: 0.7rem;
}

.circle {
  position: relative;
  width: 100px;
  height: 100px;
  border: 1px solid black;
  border-radius: 50%;
  margin-left: 32%;
  }

.point {
  position: absolute;
  width: 7px;
  height: 7px;
  background-color: red;
  border-radius: 50%;
}

.center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.edge {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(225deg) translateX(50px);
}

.arrow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 50px;
  height: 1.5px;
  background-color: rgb(14, 8, 8);
  transform-origin: left center;
  transform: rotate(225deg);
}

.arrow::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  border-left: 8px solid rgb(11, 11, 11);
}
.label {
  position: absolute;
  color: black;
  font-size: 12px;
  font-family: sans-serif;
}

.center-label {
  top: 90%;
  left: 50%;
  transform: translate(-50%, -150%); /* above center point */
}

.edge-label {
  top: 40%;
  left: 10%;
  transform: rotate(225deg) translateX(65px) rotate(-225deg); /* follow arrow direction */
}



.fuzzy-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: radial-gradient(circle, black 0%, transparent 80%);
}

.level-very-low {
  background: radial-gradient(circle, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 100%);
}

/* Low Uncertainty — small fade */
.level-low {
  background: radial-gradient(circle, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 0.1) 100%);
}

/* Medium Uncertainty — moderate fade */
.level-medium {
  background: radial-gradient(circle, rgba(0, 0, 0, 0.8) 30%, rgba(0, 0, 0, 0.05) 100%);
}

/* High Uncertainty — noticeable fuzzy edge */
.level-high {
  background: radial-gradient(circle, rgba(0, 0, 0, 0.6) 20%, rgba(0, 0, 0, 0) 100%);
}

/* Very High Uncertainty — almost invisible center */
.level-very-high {
  background: radial-gradient(circle, rgba(0, 0, 0, 0.4) 10%, rgba(0, 0, 0, 0) 100%);
}

.ink-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: radial-gradient(circle, #000000 100%, #000000 100%);
 -webkit-mask-image: radial-gradient(circle, transparent 100%, black 100%);
  mask-image: radial-gradient(circle, transparent 100%, black 100%);
}

/* Very Low — mostly solid, sharp edge */
.ink-level-very-low {
   -webkit-mask-image: radial-gradient(circle, transparent 60%, black 100%);
  mask-image: radial-gradient(circle, transparent 60%, black 100%);
}

/* Low Uncertainty — moderate edge blur */
.ink-level-low {
   -webkit-mask-image: radial-gradient(circle, transparent 50%, black 100%);
  mask-image: radial-gradient(circle, transparent 50%, black 100%);
}

/* Medium Uncertainty — center less visible */
.ink-level-medium {
    -webkit-mask-image: radial-gradient(circle, transparent 40%, black 100%);
  mask-image: radial-gradient(circle, transparent 40%, black 100%);
}

/* High Uncertainty — strong fade inward */
.ink-level-high {
   -webkit-mask-image: radial-gradient(circle, transparent 20%, black 100%);
  mask-image: radial-gradient(circle, transparent 20%, black 100%);
}

/* Very High Uncertainty — center nearly invisible */
.ink-level-very-high {
  -webkit-mask-image: radial-gradient(circle, transparent 10%, black 100%);
  mask-image: radial-gradient(circle, transparent 10%, black 100%);
}

.circle-very-high{
  width: 58px;
  height: 58px;
  border-radius: 50%;
  border: 2px solid black;
}
.circle-high{
 width: 43px;
  height: 43px;
  border-radius: 50%;
  border: 2px solid black;
}
.circle-medium{
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid black;
}
.circle-low{
 width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid black;
}
.circle-very-low{
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid black;
}
.diagonal-line {
  position: absolute;
  bottom: calc(58px); /* top of the very-low circle */
  left: 30px;
  width: calc(60px * 4 + 12px); /* total horizontal span across 5 circles + gaps */
  border-top: 1px solid rgb(43, 41, 41);
  transform: rotate(-12deg); /* adjust angle visually */
  transform-origin: top left;
}
.horizontal-line {
  position: absolute;
  bottom: calc(50px); /* top of the very-low circle */
  left: 30px;
  width: calc(60px * 4 + 14px); /* total horizontal span across 5 circles + gaps */
  border-top: 1px solid rgb(43, 41, 41);
  transform: rotate(0deg); /* adjust angle visually */
  transform-origin: top left;
}
.square-very-high{
  width: 53px;
  height: 53px;
  border: 2px solid black;
}
.square-high{
 width: 40px;
  height: 40px;
  border: 2px solid black;
}
.square-medium{
  width: 30px;
  height: 30px;
  border: 2px solid black;
}
.square-low{
 width: 20px;
  height: 20px;
  border: 2px solid black;
}
.square-very-low{
  width: 10px;
  height: 10px;
  border: 2px solid black;
}

</style>