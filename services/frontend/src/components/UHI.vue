<template >
    
        <v-card class="uhi-ui" v-if="activeMenu=='uhi'" width="350" max-height="900">
            <v-tabs
                v-model="activeTab"
                color="deep-purple-accent-400"
                grow
                align-tabs="center"
            >
                <v-tab value="feature">
                    Feature
                </v-tab>
                <v-tab value="shap">
                    SHAP

                </v-tab>
                <v-tab value="moran">
                    Moran's I
                </v-tab>
                <v-tab value="bivariate">
                    Bivariate
                </v-tab>
                
                <v-tab value="ternary">
                    Ternary
                </v-tab>
                
            </v-tabs>
            <v-card-text v-show="activeTab==='feature'">
                <v-row >
                    <v-col cols="12" >
                        <v-select
                            v-model="selectedFeature"
                            :items="features"
                            hide-details
                            placeholder="Please select 2nd feature"
                            item-title="name" 
                            return-object
                            variant="outlined"
                            @update:modelValue="addUHIPredictorToMap"
                        ></v-select>
                        
                    </v-col>
                    
                     
                </v-row>
                <v-row  v-if="selectedFeature">
                    <v-col cols="12" sm="3" style="float: left;" class="mt-1">
                        <div class="v-label" >Opacity</div>
                    </v-col>
                 
                    <v-col  cols="12" sm="8" style="float: left;" class="mt-0" >
                    
                        <v-slider
                            min="0"
                            max="1"
                            step="0.05"
                            hide-details
                            tick-size="4"
                            :thumb-size="0"
                            color="#54B8C4"
                            track-color="#000000"
                            thumb-color="black"
                        
                            v-model="featureLayerOpacity"
                            @update:modelValue="changeFeatureLayerOpacity"
                        >
                        </v-slider>

                    </v-col>
                </v-row>
                <v-row>
                    <v-checkbox
                        v-model="uhiVector"
                        label="UHI Overlay"
                        class="ml-1"
                        @update:modelValue="addUHIVectorOverlay"
                    ></v-checkbox>
                </v-row>
            
                
            </v-card-text>
            <v-card-text v-show="activeTab==='shap'">
                <v-row >
                    <v-col cols="12" >
                        <v-select
                            v-model="selectedShapFeature"
                            :items="features"
                            placeholder="Please select"
                            hide-details
                            item-title="name" 
                            return-object
                            variant="outlined"
                            @update:modelValue="addUHIShapToMap"
                        ></v-select>
                        
                    </v-col>
                    
                     
                </v-row>
                <v-row  >
                    <v-col cols="12" sm="3" style="float: left;" class="mt-1">
                        <div class="v-label" >Opacity</div>
                    </v-col>
                 
                    <v-col  cols="12" sm="8" style="float: left;" class="mt-0" >
                    
                        <v-slider
                            min="0"
                            max="1"
                            step="0.05"
                            hide-details
                            tick-size="4"
                            :thumb-size="0"
                            color="#54B8C4"
                            track-color="#000000"
                            thumb-color="black"
                            :disabled="!selectedShapFeature"
                            v-model="shapLayerOpacity"
                            @update:modelValue="changeShapLayerOpacity"
                        >
                        </v-slider>

                    </v-col>
                </v-row>
         
            
                
            </v-card-text>
            <v-card-text v-show="activeTab==='bivariate'">
                <v-row >
                    <v-col cols="12" >
                        <!--<v-select
                            v-model="selectedBivariateFeature"
                            :items="features"
                            hide-details
                            label="Select Predictor"
                            item-title="name" 
                            return-object
                            variant="outlined"
                            @update:modelValue="addUHIBivariateToMap"
                        ></v-select>-->
                        <v-select
                            v-model="selectedBivariateFeature"
                            :items="bivariateFeatures1"
                            placeholder="Please select 1st feature"
                            hide-details
                            item-title="name" 
                            return-object
                            variant="outlined"
                        ></v-select>
                    </v-col>
                    <v-col cols="12" >
                        <v-select
                            v-model="selectedBivariateFeature2"
                            :items="filteredBivariateFeatures2"
                            placeholder="Please select 2nd feature"
                            hide-details
                            item-title="name" 
                            return-object
                            variant="outlined"
                            @update:modelValue="addUHIBivariateToMap"
                        ></v-select>
                        
                    </v-col>
                    
                     
                </v-row>
                <v-row  v-if="selectedBivariateFeature && selectedBivariateFeature2">
                    <v-col cols="12" sm="3" style="float: left;" class="mt-1">
                        <div class="v-label" >Opacity</div>
                    </v-col>
                 
                    <v-col  cols="12" sm="8" style="float: left;" class="mt-0" >
                    
                        <v-slider
                            min="0"
                            max="1"
                            step="0.05"
                            hide-details
                            tick-size="4"
                            :thumb-size="0"
                            color="#54B8C4"
                            track-color="#000000"
                            thumb-color="black"
                        
                            v-model="bivariateLayerOpacity"
                            @update:modelValue="changeBivariateLayerOpacity"
                        >
                        </v-slider>

                    </v-col>
                </v-row>
               
            
                
            </v-card-text>
            <v-card-text v-show="activeTab==='moran'">
               
                <v-row v-show="activeTab==='moran'">
                    <v-col cols="12" >
                       <v-select
                            v-model="selectedMoranFeature"
                            :items="moranFeatures"
                            placeholder="Please select"
                            hide-details
                            item-title="name" 
                            return-object
                            variant="outlined"
                            @update:modelValue="addUHIMoranToMap"
                        ></v-select>
                    </v-col>
                    
                    
                </v-row>
                 <v-row  >
                    <v-col cols="12" sm="3" style="float: left;" class="mt-1">
                        <div class="v-label" >Opacity</div>
                    </v-col>
                 
                    <v-col  cols="12" sm="8" style="float: left;" class="mt-0" >
                    
                        <v-slider
                            min="0"
                            max="1"
                            step="0.05"
                            hide-details
                            tick-size="4"
                            :thumb-size="0"
                            color="#54B8C4"
                            track-color="#000000"
                            thumb-color="black"
                            :disabled="!selectedMoranFeature"
                            v-model="moranLayerOpacity"
                            @update:modelValue="changeMoranLayerOpacity"
                        >
                        </v-slider>

                    </v-col>
                </v-row>

                <v-row>
                    <v-checkbox
                        v-model="moranUncertainty"
                        label="P-value"
                        class="ml-1"
                        :disabled="!selectedMoranFeature"
                        @update:modelValue="applyMoranUncertaintyOverlay(uncertainty, selectedMoranFeature.value)"
                    ></v-checkbox>
                </v-row>
                
            </v-card-text>
            <v-card-text v-show="activeTab==='ternary'">
                <v-row >
                    <v-col cols="12" >
                        <v-select
                            v-model="selectedTernaryfeature"
                            :items="features"
                            placeholder="Please select a feature"
                            hide-details
                            item-title="name" 
                            return-object
                            variant="outlined"
                            @update:modelValue="addUHITernaryToMap"
                        ></v-select>
                        
                    </v-col>
                    
                     
                </v-row>
                <v-row  >
                    <v-col cols="12" sm="3" style="float: left;" class="mt-1">
                        <div class="v-label" >Opacity</div>
                    </v-col>
                 
                    <v-col  cols="12" sm="8" style="float: left;" class="mt-0" >
                    
                        <v-slider
                            min="0"
                            max="1"
                            step="0.05"
                            hide-details
                            tick-size="4"
                            :thumb-size="0"
                            color="#54B8C4"
                            track-color="#000000"
                            thumb-color="black"
                            :disabled="!selectedTernaryfeature"
                            v-model="ternaryLayerOpacity"
                            @update:modelValue="changeTernaryLayerOpacity"
                        >
                        </v-slider>

                    </v-col>
                </v-row>
               <v-row>
                    <v-checkbox
                        v-model="uncertainty"
                         label="Uncertainty"
                          :disabled="!selectedTernaryfeature"
                        class="ml-1"
                        @update:modelValue="applyUncertaintyOverlay(uncertainty, selectedTernaryfeature.value)"
                    ></v-checkbox>
                </v-row>
            
                
            </v-card-text>
            
           
        
        </v-card>
        <v-card  class="uhi-legend-ui" v-if="activeMenu=='uhi' && activeTab==='ternary'">
             <div id="ternary-legend" style="width: 350px; height: 300px;"></div>
        </v-card>
        
</template>
<script setup>
import { storeToRefs } from 'pinia'
import { useMenuStore } from '../stores/menu'
import { ref, defineEmits, watch, computed, onMounted } from 'vue'
import * as d3 from "d3";
import { useUhiStore } from '../stores/uhi'
import { useMapLegendStore } from '../stores/mapLegend'
const legendStore = useMapLegendStore();

let { activeMenu } = storeToRefs(useMenuStore())
const emit = defineEmits(["addDynamicTernaryGridToMap", "removeLayerFromMap", "highlightMapHex", "addDynamicUncertaintyOverlay", "removeCustomLayerFromMap", "addMoranFeatureToMap", "addDynamicMoranUncertaintyOverlay", "setLayerPaintProperty", "addDynamicFeatureGridToMap"]);

let selectedTernaryfeature = ref(null)
let selectedMoranFeature = ref(null)
let selectedFeature = ref(null)
let selectedShapFeature = ref(null)
let selectedBivariateFeature = ref(null)
let selectedBivariateFeature2 = ref(null)
let activeTab = ref('feature')
let {ternaryArray, selectedHighlight, uncertaintyArray, moranUncertaintyArray, features, moranFeatures, UHI_BIVARIATE_COLORS,UHIVectorSpecification, bivariateFeatures1, bivariateFeatures2}= storeToRefs( useUhiStore())


let svgRef = null; 
let uncertainty = ref(false)
let moranUncertainty = ref(false)
let ternaryLayerOpacity = ref(1)
let moranLayerOpacity = ref(1)
let featureLayerOpacity = ref(1)
let shapLayerOpacity = ref(1)
let bivariateLayerOpacity = ref(1)
let uhiVector = ref(true)

onMounted(() => {
    let featuresToRemove = [
        ...features.value,
        UHIVectorSpecification.value
    ]
    emit('addDynamicFeatureGridToMap', UHIVectorSpecification.value, featuresToRemove)
    legendStore.SetActivatedUHITab(activeTab.value);
    legendStore.SetLegendSpecifications(UHIVectorSpecification.value);
})
const filteredBivariateFeatures2 = computed(() => {
  if (!selectedBivariateFeature.value) {
    return bivariateFeatures2
  }

  return bivariateFeatures2.value.filter(item => {
    // always keep Prediction (UHI)
    if (item.value === 'uhi') return true

    // match shap variable
    return item.value === `${selectedBivariateFeature.value.value}_shap`
  })
})
const addUHITernaryToMap = () => {
    legendStore.SetActivatedUHITab(activeTab.value);
    uncertainty.value = false;
    ternaryLayerOpacity.value = 1;
    emit('addDynamicTernaryGridToMap', selectedTernaryfeature.value.value, features.value)
    svgRef = drawTernaryBase("#ternary-legend", 260);
    
}
// ============= TERNARY FUNCTIONS ============= //

function ternaryToXY(P, F, S, size) {
  const height = Math.sqrt(3) / 2 * size;
  return {
    x: size * (0.5 * (2 * S + P)),
    y: height * (1 - P)
  };
}

function drawTernaryBase(selector, size = 260) {
  const container = d3.select(selector);
  container.selectAll("*").remove();

  const svg = container
    .append("svg")
    .attr("width", size + 60)
    .attr("height", size + 60)
    .append("g")
    .attr("transform", "translate(25,25)");

  const height = Math.sqrt(3) / 2 * size;

  // Triangle
  svg.append("polygon")
    .attr("points", `0,${height} ${size},${height} ${size/2},0`)
    .attr("fill", "none")
    .attr("stroke", "#444")
    .attr("stroke-width", 2);

  // Grid
  const steps = d3.range(0.1, 1.0, 0.1);
  steps.forEach(t => {
    let p1 = ternaryToXY(t, 1 - t, 0, size);
    let p2 = ternaryToXY(t, 0, 1 - t, size);
    svg.append("line").attr("x1", p1.x).attr("y1", p1.y)
      .attr("x2", p2.x).attr("y2", p2.y).attr("stroke", "#ddd");

    let f1 = ternaryToXY(1 - t, t, 0, size);
    let f2 = ternaryToXY(0, t, 1 - t, size);
    svg.append("line").attr("x1", f1.x).attr("y1", f1.y)
      .attr("x2", f2.x).attr("y2", f2.y).attr("stroke", "#ddd");

    let s1 = ternaryToXY(1 - t, 0, t, size);
    let s2 = ternaryToXY(0, 1 - t, t, size);
    svg.append("line").attr("x1", s1.x).attr("y1", s1.y)
      .attr("x2", s2.x).attr("y2", s2.y).attr("stroke", "#ddd");
  });
  // ===== AXIS TICKS =====
  const tickValues = d3.range(0, 1.01, 0.1); // 0..100%

  tickValues.forEach(t => {
    const label = (t * 100).toFixed(0);

    // === Feature axis (left bottom → right bottom)
    let F = t;
    let pF = ternaryToXY(0, F, 1 - F, size);
    svg.append("text")
      .attr("x", pF.x)
      .attr("y", pF.y + 14)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .attr("fill", "green") 
      .text(label);

    // === SHAP axis (right bottom → top)
    let S = t;
    let pS = ternaryToXY(1 - S, 0, S, size);
    svg.append("text")
      .attr("x", pS.x + 12)
      .attr("y", pS.y + 4)
      .style("font-size", "10px")
      .attr("fill", "blue") 
      .text(label);

    // === Prediction axis (top → left bottom)
    let P = t;
    let pP = ternaryToXY(P, 1 - P, 0, size);
    svg.append("text")
      .attr("x", pP.x - 12)
      .attr("y", pP.y + 4)
      .attr("text-anchor", "end")
      .style("font-size", "10px")
      .attr("fill", "red") 
      .text(label);
  });
  // Labels
  svg.append("text")
    .attr("x", size / 2).attr("y", -15)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .attr("fill", "red") 
    .text("Prediction (%)");

  svg.append("text")
    .attr("x", -20).attr("y", height + 30)
    .attr("text-anchor", "start")
    .style("font-size", "12px")
    .attr("fill", "green") 
    .text("Feature (%)");

  svg.append("text")
    .attr("x", size + 20).attr("y", height + 30)
    .attr("text-anchor", "end")
    .style("font-size", "12px")
    .attr("fill", "blue") 
    .text("SHAP (%)");

  return svg;
}
function updateTernaryPoints(svg, data, size = 260) {
  if (!svg) return;

  // Join data
  const points = svg.selectAll("circle.ternary-point")
    .data(data, (d, i) => i); // use index as key

// Remove old handlers on UPDATE selection
  points.on(".mouseover", null).on(".mouseout", null);
  // EXIT — animate fade out
  points.exit()
    .transition()
    .duration(600)
    .attr("opacity", 0)
    .remove();

  // ENTER — create new points
  const enter = points.enter()
    .append("circle")
    .attr("class", "ternary-point")
    .attr("r", 4)
    .attr("opacity", 0)
    .attr("cx", size / 2)    // start from center
    .attr("cy", size / 2)
    .on("mouseover", function(event, d) {
        d3.select(this)
            .attr("r", 7)
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        emit("highlightMapHex", {
            hex_id: d.hex_id,
            selected_feature: selectedTernaryfeature.value.value
        });
    })
    .on("mouseout", function (event, d) {
        if (event, d){
            emit("highlightMapHex", {
            hex_id: null,
            selected_feature: selectedTernaryfeature.value.value
        });
        d3.select(this)
            .attr("r", 4)
            .attr("stroke", "none");
        }
        

    })
    .attr("fill", "black");  // temporary color

  // ENTER + UPDATE — merge + animate
  enter.merge(points)
    .transition()
    .duration(800)
    .ease(d3.easeCubicInOut)
    .attr("cx", d => ternaryToXY(d.P, d.F, d.S, size).x)
    .attr("cy", d => ternaryToXY(d.P, d.F, d.S, size).y)
    .attr("fill", d => `rgb(${255*d.P},${255*d.F},${255*d.S})`)
    .attr("opacity", 0.9)
    .attr("stroke", "#222")
    .attr("stroke-width", 0.2);
}
function highlightTernaryPoint(svg, P, F, S, size = 260) {
  if (!svg) return;


  svg.selectAll(".highlight-line").remove();
  svg.selectAll(".highlight-dot").remove();

  const pt = ternaryToXY(P, F, S, size);

  // === 1️⃣ Prediction grid line (parallel to P=constant lines)
  let predA = ternaryToXY(P, 1 - P, 0, size);
  let predB = ternaryToXY(P, 0, 1 - P, size);

  svg.append("line")
    .attr("class", "highlight-line")
    .attr("x1", predA.x).attr("y1", predA.y)
    .attr("x2", predB.x).attr("y2", predB.y)
    .attr("stroke", "red")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "4 3")
    .attr("opacity", 0.9);

  // === 2️⃣ Feature grid line (parallel to F=constant lines)
  let featA = ternaryToXY(1 - F, F, 0, size);
  let featB = ternaryToXY(0, F, 1 - F, size);

  svg.append("line")
    .attr("class", "highlight-line")
    .attr("x1", featA.x).attr("y1", featA.y)
    .attr("x2", featB.x).attr("y2", featB.y)
    .attr("stroke", "green")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "4 3")
    .attr("opacity", 0.9);

  // === 3️⃣ SHAP grid line (parallel to S=constant lines)
  let shapA = ternaryToXY(1 - S, 0, S, size);
  let shapB = ternaryToXY(0, 1 - S, S, size);

  svg.append("line")
    .attr("class", "highlight-line")
    .attr("x1", shapA.x).attr("y1", shapA.y)
    .attr("x2", shapB.x).attr("y2", shapB.y)
    .attr("stroke", "blue")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "4 3")
    .attr("opacity", 0.9);

  // === Dot at the selected point
  svg.append("circle")
    .attr("class", "highlight-dot")
    .attr("cx", pt.x)
    .attr("cy", pt.y)
    .attr("r", 4)
    .attr("fill", "transparent")
    .attr("stroke", "black")
    .attr("stroke-width", 1);
}

const applyUncertaintyOverlay = () => {
    if (uncertainty.value===true){
        emit("addDynamicUncertaintyOverlay", uncertaintyArray.value);
       
    }
    else {
        emit("removeCustomLayerFromMap", "uncertainty-noise-layer");
    }
    
}
const applyMoranUncertaintyOverlay = ()=>{
   if (moranUncertainty.value===true){
        emit("addDynamicMoranUncertaintyOverlay", moranUncertaintyArray.value);
       
    }
    else {
        emit("removeCustomLayerFromMap", "moran-uncertainty-noise-layer");
    } 
} 
const addUHIMoranToMap = () => {
    legendStore.SetActivatedUHITab(activeTab.value);
    moranLayerOpacity.value = 1;
    legendStore.SetMoranLegendSpecifications(selectedMoranFeature.value.name);
    emit('addMoranFeatureToMap', selectedMoranFeature.value.value, selectedMoranFeature.value.target_attribute, moranFeatures)
}

const changeTernaryLayerOpacity = (value) => {
    emit('setLayerPaintProperty', `${selectedTernaryfeature.value.value}_summary`, "fill-opacity", value )
}
const changeFeatureLayerOpacity = (value) => {
    emit('setLayerPaintProperty', `${selectedFeature.value.value}_summary`, "fill-opacity", value )
}
const changeShapLayerOpacity = (value)=>{
    emit('setLayerPaintProperty', `${selectedShapFeature.value.value}_summary`, "fill-opacity", value )
}
const changeMoranLayerOpacity = (value) => {
    emit('setLayerPaintProperty', `uhi_${selectedMoranFeature.value.value}_moran_summary`, "fill-opacity", value )
}
const changeBivariateLayerOpacity = (value) => {
    emit('setLayerPaintProperty', `${selectedBivariateFeature.value.value}_summary`, "fill-opacity", value )
}
const addUHIPredictorToMap = ()=>{
    featureLayerOpacity.value = 1

    legendStore.SetActivatedUHITab(activeTab.value);
    legendStore.SetLegendSpecifications(selectedFeature.value);

    emit('addDynamicFeatureGridToMap', selectedFeature.value, features.value)
}
const addUHIShapToMap = ()=>{
    console.log("activeTab", activeTab);
    legendStore.SetActivatedUHITab(activeTab.value);
    legendStore.SetLegendSpecificationsforShap(selectedShapFeature.value);

     emit('addDynamicShapGridToMap', selectedShapFeature.value, features.value)
}
const addUHIVectorOverlay = ()=>{
    if (uhiVector.value===true){
        emit('addDynamicFeatureGridToMap', UHIVectorSpecification.value, features.value)
        legendStore.SetActivatedUHITab(activeTab.value);
        legendStore.SetLegendSpecifications(UHIVectorSpecification.value);

    }
    else {
        emit("removeLayerFromMap", "uhi_summary");
    }
    
    
}
const addUHIBivariateToMap = ()=>{
    ternaryLayerOpacity.value = 1
    
    legendStore.SetActivatedUHITab(activeTab.value);
    legendStore.SetUHIBivariateLegendSpecifications(selectedBivariateFeature.value, selectedBivariateFeature2.value, UHI_BIVARIATE_COLORS.value);
    console.log(selectedBivariateFeature.value, "selectedBivariateFeature.value")
    emit('addDynamicBivariateGridToMap', selectedBivariateFeature.value, selectedBivariateFeature2.value, UHI_BIVARIATE_COLORS.value, features.value)
}
watch(ternaryArray, (newVal) => {
  updateTernaryPoints(svgRef , newVal, 260);
});
watch(selectedHighlight, (val) => {
  highlightTernaryPoint(svgRef, val.P, val.F, val.S);
});
watch(uncertaintyArray, (val) => {
     if (uncertainty.value===true){
         emit("addDynamicUncertaintyOverlay", val);
     }
});
watch(moranUncertaintyArray, (val) => {
     if (moranUncertainty.value===true){
         emit("addDynamicMoranUncertaintyOverlay", val);
     }
});

</script>
    
<style scoped>
.uhi-ui{
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
.uhi-legend-ui{
    position: absolute;
    bottom: 10px;
    right: 10px;
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