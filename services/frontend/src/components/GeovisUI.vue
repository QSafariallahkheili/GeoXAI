<template>
    <v-card class="geovis-ui" v-show="activeMenu=='geovis'" width="400" max-height="400">
        <div >
            <v-card-text>
                <v-row>
                        <v-col cols="12" >
                            <v-select
                                v-model="selectedfeature"
                                :items="features"
                                hide-details
                                label="Select Predictor"
                                item-title="name" 
                                return-object
                                variant="outlined"
                                @update:modelValue="getPredictor()"
                            ></v-select>
                            
                            
                        
                        </v-col>
                </v-row>
                
                <v-row>
                        <v-col cols="12" >
                            <v-select
                                v-model="selectedStyle"
                                :items="selectedfeature?.value==='fire_susceptibility'?geovisStylesFFS:geovisStyles"
                                hide-details
                                label="Select Geovis Style"
                                item-title="name" 
                                return-object
                                variant="outlined"
                                :disabled="featureRetrieved == false? true : false"
                            ></v-select>
                            
                        
                        </v-col>
                </v-row>
                <v-row>
                    <v-col cols="6">
                        <v-select
                                v-model="selectedfeatureProperties1"
                                :items="selectedfeature?.value=='fire_susceptibility'?FFSProperties:featureProperties"
                                hide-details
                                label="1st variable"
                                item-title="name" 
                                return-object
                                round
                                variant="outlined"
                                :disabled="featureRetrieved == false? true : false"
                            ></v-select>
                    </v-col>
                    <v-col cols="6">
                        <v-select
                                v-model="selectedfeatureProperties2"
                                :items="selectedfeature?.value=='fire_susceptibility'?FFSProperties:featureProperties"
                                hide-details
                                label="2nd variable"
                                item-title="name" 
                                return-object
                                variant="outlined"
                                :disabled="featureRetrieved == false? true : false"
                            ></v-select>

                    </v-col>
                </v-row>
                <v-row v-if="selectedfeature?.value=='fire_susceptibility' && selectedStyle?.value=='arrow'">
                    <v-col cols="6">
                        <v-select
                                v-model="selectedfeatureProperties3"
                                :items="features"
                                hide-details
                                label="1st variable"
                                item-title="name" 
                                return-object
                                round
                                variant="outlined"
                                @update:modelValue="getShapForPredictor()"
                                :disabled="featureRetrieved == false? true : false"
                            ></v-select>
                    </v-col>
                </v-row>
                <v-row v-if="selectedStyle?.value=='circle'">
                    <v-checkbox
                        v-model="uncertainty"
                        hide-details
                        class="ml-1"
                        :label="`Uncertainty: ${uncertainty.toString()}`"
                    ></v-checkbox>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-btn
                            color="rgba(75, 192, 192, 0.8)"
                            dark
                            block
                            style="color: white;"
                            :disabled="selectedStyle? false : true"
                            @click="applyStyle()"
                        >
                            Apply Style
                        </v-btn>
                    </v-col>
                </v-row>
            
            </v-card-text>
        </div>
    </v-card>
</template>

<script setup>
import { ref, defineEmits } from 'vue'
import { useMenuStore } from '../stores/menu'
import { storeToRefs } from 'pinia'
import {getTableGeojson} from '../services/backend.calls'
const emit = defineEmits(["addCircleLayerToMap", "addSquareLayerToMap", "addLayerToMap", "addFuzzyLayerToMap", "addPositionLayerToMap", "addPatternLayerToMap"]);


let { activeMenu } = storeToRefs(useMenuStore())
let selectedStyle = ref(null)
let geovisStyles = ref([
    { name: 'Circular symbol', value: 'circle', symbol: 'circle' },
    { name: 'Square symbol', value: 'square', symbol: 'square' },
    { name: 'Bivariate', value: 'bivariate', symbol: 'bivariate' },
    { name: 'Pattern', value: 'pattern', symbol: 'pattern' },


])
let geovisStylesFFS = ref([
    { name: 'Fuzzy', value: 'fuzzy' },
    { name: 'Position', value: 'position' },
    { name: 'Arrow', value: 'arrow' },
   
])

let features = ref([
    { name: 'Aspect', value: 'aspect'},
    { name: 'DEM', value: 'dem'},
    { name: 'Drought Index', value: 'drought_index'},
    { name: 'Global Radiation', value: 'global_radiation'},
    { name: 'GNDVI', value: 'gndvi'},
    { name: 'Landcover', value: 'landcover'},
    { name: 'LST', value: 'lst'},
    { name: 'NDMI', value: 'ndmi'},
    { name: 'NDVI', value: 'ndvi'},
    { name: 'Precipitation', value: 'precipitation'},
    { name: 'Slope', value: 'slope'},
    { name: 'Fire Susceptibility', value: 'fire_susceptibility'}
    
])
let featureProperties = ref([
    { name: 'SHAP Value', value: 'shap'},
    { name: 'Feature Value', value: 'value'}, 
])
let FFSProperties = ref([
    { name: 'Value', value: 'value'},
    { name: 'Uncertainty', value: 'uncertainty'}, 
])
let selectedfeatureProperties1 = ref(null)
let selectedfeatureProperties2 = ref(null)
let selectedfeatureProperties3 = ref(null)
let selectedfeature = ref(null)
let selectedFeatureGeojson = ref(null)
let featureRetrieved = ref(false)
let bivariateColorpalette = ref({
             'high_low': '#be64ac', 'high_medium': '#8c62aa', 'high_high':'#3b4994',
             'medium_low': '#dfb0d6', 'medium_medium': '#a5add3', 'medium_high':'#5698b9',
            'low_low': '#e8e8e8', 'low_medium': '#ace4e4', 'low_high':'#5ac8c8'
        })

let style = ref(null)
let layerType = ref(null)
let shapClassesForArrow= ref(null)
let uncertainty = ref(false)
const getPredictor = async() => {
   
    featureRetrieved.value = false
    const feature =  await getTableGeojson(selectedfeature.value.value)
    selectedFeatureGeojson.value = feature
    featureRetrieved.value = true
    
}
const getShapForPredictor = async() => {
    featureRetrieved.value = false
    const feature =  await getTableGeojson(selectedfeatureProperties3.value.value)
    shapClassesForArrow.value= feature.features[0].properties.shap5
    const shapMap = {};
    feature.features.forEach(feature => {
        shapMap[feature.properties.id] = feature.properties.shap;
    });
    console.log(shapMap, "shapMap")
    selectedFeatureGeojson.value.features.forEach(feature => {
        //console.log(feature.properties, "feature.properties")
    const id = feature.properties.id;
    if (Object.prototype.hasOwnProperty.call(shapMap, id)) {
    feature.properties.shap = shapMap[id];
}
    });
    featureRetrieved.value = true
}
const applyStyle = ()=>{
    if (selectedStyle.value.value=='circle'){
        let uncertaintyProp
        if (uncertainty.value==true){
            uncertaintyProp = "uncertainty"
        }
        else {
            uncertaintyProp = null
        }
        //emit("addCircleLayerToMap", selectedFeatureGeojson.value, selectedfeatureProperties1.value.value, selectedfeatureProperties2.value.value, selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties2.value.value+'5'])
        emit("addCircleLayerWithUncertainty", selectedFeatureGeojson.value, selectedfeatureProperties1.value.value, selectedfeatureProperties2.value.value, uncertaintyProp, selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties2.value.value+'5'] )
    }
    else if (selectedStyle.value.value=='square'){
        emit("addSquareLayerToMap", selectedFeatureGeojson.value, selectedfeatureProperties1.value.value, selectedfeatureProperties2.value.value, selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties2.value.value+'5'])
    }
    else if (selectedStyle.value.value=='bivariate'){
        let matchExpression = []
        console.log(bivariateColorpalette.value)
        matchExpression = ['match', ['get', 'id']];
        for (const row of selectedFeatureGeojson.value.features) {
            const class1 = row.properties[selectedfeatureProperties1.value.value+'3']; // First dataset
            const class2  = row.properties[selectedfeatureProperties2.value.value+'3'];
            let color;
            
            // Combine the two classes (e.g., 'low_low', 'high_medium')
            const colorKey = `${class1}_${class2}`;
            
            // Assign the color based on the bivariate color palette
            color = bivariateColorpalette.value[colorKey]; 

            // Push the result to the match expression
            matchExpression.push(row.properties.id, color);
        }
        matchExpression.push('rgba(0, 0, 0, 0)');
        console.log(matchExpression, "matchExpression")
        style.value = {
               'fill-color': matchExpression,
               'fill-outline-color': '#808080'
            }
            layerType.value = "fill"
            let layerSpecification = {
                layerNameInDatabase: "grid",
                id: "grid-polygon",
                style: style,
                layerType: layerType
            }
        emit("addLayerToMap",layerSpecification)
        //emit("setLayerPaintProperty",'grid', 'fill-color', matchExpression)
    }
    else if(selectedStyle.value.value=='fuzzy'){
        emit("addFuzzyLayerToMap", selectedFeatureGeojson.value, selectedfeatureProperties1.value.value, selectedfeatureProperties2.value.value)

    }
    else if (selectedStyle.value.value=='position'){
        emit("addPositionLayerToMap", selectedFeatureGeojson.value, selectedfeatureProperties1.value.value, selectedfeatureProperties2.value.value)

    }
    else if (selectedStyle.value.value=='arrow'){
        emit("addArrowLayerToMap", selectedFeatureGeojson.value, selectedfeatureProperties1.value.value, selectedfeatureProperties2.value.value, shapClassesForArrow.value)

    }
    else if(selectedStyle.value.value=='pattern'){
        emit("addPatternLayerToMap", selectedFeatureGeojson.value, selectedfeatureProperties1.value.value, selectedfeatureProperties2.value.value, selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties2.value.value+'5'])

    }
}
</script>

<style lang="scss" scoped>
.geovis-ui {
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