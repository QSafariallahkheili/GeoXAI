<template>
    <v-card class="geovis-ui" v-show="activeMenu=='geovis'" width="400" max-height="900">
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
                                v-model="selectedVisualVariable1"
                                :items="visualVariables"
                                hide-details
                                label="1st vis variable"
                                item-title="name" 
                                return-object
                                variant="outlined"
                                :disabled="featureRetrieved == false? true : false"
                            ></v-select>

                 
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="6" v-if="selectedVisualVariable1?.value!==null && secondPropertiesAllowed==false">
                       <v-btn :disabled="selectedVisualVariable1?.value==null?true:false" variant="outlined" prepend-icon="mdi-plus-circle" @click="secondPropertiesAllowed=true">
                        <template v-slot:prepend>
                            <v-icon color="success" ></v-icon>
                        </template>
                        add variable
                        </v-btn>

                    </v-col>
                </v-row>
                <v-row v-if="secondPropertiesAllowed==true">
                    <v-col cols="6">
                        <v-select
                                v-model="selectedfeatureProperties2"
                                :items="selectedfeature?.value=='fire_susceptibility'?FFSProperties:featureProperties"
                                hide-details
                                label="2nd variable"
                                item-title="name" 
                                return-object
                                round
                                variant="outlined"
                                :disabled="featureRetrieved == false? true : false"
                            ></v-select>
                    </v-col>
                    <v-col cols="6">
                        <v-select
                                v-model="selectedVisualVariable2"
                                :items="visualVariables"
                                hide-details
                                label="2nd vis variable"
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

                <v-row v-if="relatedUncertaintyStyles.length > 0">
                        <v-col cols="12" >
                            <v-select
                                v-model="selectedUncertaintyStyle"
                                :items="relatedUncertaintyStyles"
                                hide-details
                                label="Select Uncertainty Style"
                                item-title="name" 
                                return-object
                                variant="outlined"
                            ></v-select>
                            
                        
                        </v-col>
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
               
                <v-row v-if="selectedColorPalette" no-gutters style="" class="d-flex mt-4 mb-4">
                    <v-col cols="12" sm="2" class=" ">
                        <div class="v-label" >color palette</div>
                    </v-col>
                    <v-col cols="12" sm="9" class="d-flex justify-end align-center">
                        <v-menu :close-on-content-click="true"  location="start">
                            <template v-slot:activator="{ props }">
                                <span
                                    v-for="(colorItem, j) in selectedColorPalette.colors"
                                    :key="j"
                                    v-bind="props"
                                    :style="{
                                        backgroundColor: colorItem,
                                        width: '36px',
                                        height: '12px',
                                        display: 'inline-block',
                                        margin: '0px',
                                        cursor: 'pointer'
                                    }"
                                ></span>
                            </template>
                            <v-list style="max-height:300px" v-if="selectedfeatureProperties1?.value=='value'">
                                <v-list-item  v-for="([, item], i) in Object.entries(colorbrewer.default.schemeGroups.sequential).filter(([key]) => key !== 'schemeGroups')"  :key="i" >
                                        <div @click="assignColorPalette(item, colorbrewer.default[item][5])">
                                            
                                            <span
                                                v-for="(colorItem, j) in (colorbrewer.default[item][5])"
                                                :key="j"
                                                :style="{
                                                    backgroundColor: colorItem,
                                                    width: '30px',
                                                    height: '20px',
                                                    display: 'inline-block',
                                                    margin: '0px',
                                                    cursor: 'pointer'
                                                }"
                                            ></span>
                                        </div>
                                        
                                </v-list-item>
                            </v-list>
                            <v-list v-else style="max-height:300px" >
                                <v-list-item  v-for="([, item], i) in Object.entries(colorbrewer.default.schemeGroups.diverging).filter(([key]) => key !== 'schemeGroups')"  :key="i" >
                                        <div @click="assignColorPalette(i, colorbrewer.default[item][5])">
                                            
                                            <span
                                                v-for="(colorItem, j) in (colorbrewer.default[item][5])"
                                                :key="j"
                                                :style="{
                                                    backgroundColor: colorItem,
                                                    width: '30px',
                                                    height: '20px',
                                                    display: 'inline-block',
                                                    margin: '0px',
                                                    cursor: 'pointer'
                                                }"
                                            ></span>
                                        </div>
                                        
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    
                    </v-col>

                </v-row>
            
            </v-card-text>
        </div>
    </v-card>
</template>

<script setup>
import { ref, defineEmits, computed } from 'vue'
import { useMenuStore } from '../stores/menu'
import { storeToRefs } from 'pinia'
import {getTableGeojson} from '../services/backend.calls'
import { useMapLegendStore } from '../stores/mapLegend'
import * as colorbrewer from 'colorbrewer';

let {activatedGeovisStyle, firstProperties, firstPropertiesClassIntervals, secondProperties, selectedColorPalette, uncertaintyStyle, legendVisVar1, legendVisVar2} = storeToRefs(useMapLegendStore())
const emit = defineEmits(["addCircleLayerToMap", "addSquareLayerToMap", "addLayerToMap", "addFuzzyLayerToMap", "addPositionLayerToMap", "addPatternLayerToMap", "addCircleLayerWithInkUncertainty", "addCircleLayerWithInkUncertaintyOneProp", "addFuzzyLayerWithThreePropToMap", "addArrowLayerWithTwoPropToMap", "addCustomBorderLayerToMap", "addCustomMapboxGrainNoiseLayerToMap"]);


let { activeMenu } = storeToRefs(useMenuStore())
let selectedStyle = ref(null)
let geovisStyles = ref([
    { name: 'Circular symbol', value: 'circle', symbol: 'circle' },
    { name: 'Square symbol', value: 'square', symbol: 'square' },
    //{ name: 'Bivariate', value: 'bivariate', symbol: 'bivariate' },
    { name: 'Arrow', value: 'arrow', symbol: 'arrow' },

])
let uncertaintyStyles = ref([
    { name: 'Pattern Width', value: 'pattern_width'},
    { name: 'Pattern Orientation', value: 'pattern_orientation'},
    { name: 'Fuzzy', value: 'fuzzy'},
    { name: 'Ink', value: 'ink'},
    { name: 'Position', value: 'position'},
    { name: 'Orientation', value: 'orientation'},
    { name: 'Noise With Line Width', value: 'noise_with_line_width'},
    { name: 'Noise With Grain Size', value: 'noise_with_grain_size'},
    
])
let selectedUncertaintyStyle = ref(null)
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
let secondPropertiesAllowed = ref(false)
let visualVariables = ref([
    { name: 'Color', value: 'color' },
    { name: 'Size', value: 'size' },
]);
let selectedVisualVariable1 = ref(null)
let selectedVisualVariable2 = ref(null)
const relatedUncertaintyStyles = computed(() => {
  const styleMap = {
    circle: ['fuzzy', 'ink', 'position'],
    square: ['pattern_width', 'pattern_orientation','noise_with_line_width', 'noise_with_grain_size'],
    arrow: ['orientation'],
    bivariate: ['noise_with_line_width', 'noise_with_grain_size']
  };

  const selected = selectedStyle.value?.value;
  const allowedValues = styleMap[selected] || [];

  return uncertaintyStyles.value.filter(style =>
    allowedValues.includes(style.value)
  );
});

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
    uncertaintyStyle.value=selectedUncertaintyStyle.value?.value
    if (selectedStyle.value.value=='circle'){
        if (selectedUncertaintyStyle.value?.value=='ink'){
            if (secondPropertiesAllowed.value==true){
                emit("addCircleLayerWithInkUncertainty", 
                    selectedFeatureGeojson.value, 
                    selectedfeatureProperties1.value.value, 
                    selectedfeatureProperties2.value.value, 
                    'uncertainty', 
                    selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties2.value.value+'5'], 
                    selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties1.value.value+'5'],
                    selectedVisualVariable1.value.value,
                    selectedVisualVariable2.value.value
                )

            }
            else {
                emit("addCircleLayerWithInkUncertaintyOneProp", 
                selectedFeatureGeojson.value, 
                selectedfeatureProperties1.value.value, 
                selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties1.value.value+'5'],
                'uncertainty',
                selectedVisualVariable1.value.value,
                )
            }
        }
        else if(selectedUncertaintyStyle.value?.value=='fuzzy'){
            if(secondPropertiesAllowed.value==true){
                emit("addFuzzyLayerWithThreePropToMap", 
                    selectedFeatureGeojson.value, 
                    selectedfeatureProperties1.value.value, 
                    selectedfeatureProperties2.value.value, 
                    'uncertainty', 
                    selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties2.value.value+'5'], 
                    selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties1.value.value+'5'],
                    selectedVisualVariable1.value.value,
                    selectedVisualVariable2.value.value
                )
            }
            else {
                emit("addFuzzyLayerToMap", 
                    selectedFeatureGeojson.value, 
                    selectedfeatureProperties1.value.value, 
                    selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties1.value.value+'5'],
                    'uncertainty',
                    selectedVisualVariable1.value.value,
                )
                
            }

        }
        else if (selectedUncertaintyStyle.value?.value=='position'){
            emit("addPositionLayerToMap", 
                selectedFeatureGeojson.value, 
                selectedfeatureProperties1.value.value, 
                'uncertainty',
                selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties1.value.value+'5']
            )
            
        }
        else {
             emit("addCircleLayerToMap", 
                selectedFeatureGeojson.value, 
                selectedfeatureProperties1.value.value, 
                selectedfeatureProperties2?.value?.value, 
                selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties2?.value?.value+'5'], 
                selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties1.value.value+'5'],
                selectedVisualVariable1.value.value,
                selectedVisualVariable2?.value?.value
            )

        }
        specifyLegendProperties(
            selectedVisualVariable1.value.value=='color' && selectedVisualVariable2?.value?.value ==='color'? activatedGeovisStyle.value = 'bivariate': activatedGeovisStyle.value ='circle',
            firstProperties.value=selectedfeatureProperties1.value.name,
            firstPropertiesClassIntervals.value = JSON.parse(selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties1.value.value+'5']),
            legendVisVar1.value= selectedVisualVariable1.value.value,
            legendVisVar2.value=selectedVisualVariable2?.value?.value,
            
        )
        
    }
    else if (selectedStyle.value.value=='square'){
        if (selectedUncertaintyStyle.value?.value=='pattern_width'){

            emit("addPatternLayerToMap",
                selectedFeatureGeojson.value, 
                selectedfeatureProperties1.value.value, 
                'uncertainty', 
                selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties1.value.value+'5']
            )

        }
        else if(selectedUncertaintyStyle.value?.value=='pattern_orientation'){
            emit("addPatternLayerWithOrientationToMap", 
                selectedFeatureGeojson.value, 
                selectedfeatureProperties1.value.value,  
                'uncertainty', 
                selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties1.value.value+'5']
            )
        }
        else if (selectedUncertaintyStyle.value?.value=='noise_with_line_width'){
            emit("addCustomMapboxBorderLayerToMap", 
                selectedFeatureGeojson.value, 
                selectedfeatureProperties1.value.value, 
                'uncertainty', 
                selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties1.value.value+'5']
            )

        }
        else if(selectedUncertaintyStyle.value?.value=='noise_with_grain_size'){
            emit("addCustomMapboxGrainNoiseLayerToMap",  selectedFeatureGeojson.value, selectedfeatureProperties1.value.value, 'uncertainty', selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties1.value.value+'5'])

        }
        else {
            emit("addSquareLayerToMap",
                selectedFeatureGeojson.value, 
                selectedfeatureProperties1.value.value, 
                selectedfeatureProperties2?.value?.value, 
                selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties2?.value?.value+'5'], 
                selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties1?.value?.value+'5'],
                selectedVisualVariable1.value.value,
                selectedVisualVariable2?.value?.value
            )
        }
        specifyLegendProperties(
            selectedVisualVariable1.value.value=='color' && selectedVisualVariable2?.value?.value ==='color'? activatedGeovisStyle.value = 'bivariate': activatedGeovisStyle.value ='circle',
            firstProperties.value=selectedfeatureProperties1.value.name,
            firstPropertiesClassIntervals.value = JSON.parse(selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties1.value.value+'5']),
            legendVisVar1.value= selectedVisualVariable1.value.value,
            legendVisVar2.value=selectedVisualVariable2?.value?.value,
            
        )

    }
    else if (selectedStyle.value.value=='arrow'){
        if (selectedUncertaintyStyle.value?.value=='orientation'){
            emit("addArrowLayerWithThreePropToMap", 
                selectedFeatureGeojson.value, 
                selectedfeatureProperties1.value.value, 
                selectedfeatureProperties2.value.value, 
                'uncertainty', 
                selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties2.value.value+'5'], 
                selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties1.value.value+'5'],
                selectedVisualVariable1.value.value,
                selectedVisualVariable2.value.value
            )
          
        }  
        else {
            emit("addArrowLayerWithTwoPropToMap",
                selectedFeatureGeojson.value, 
                selectedfeatureProperties1.value.value, 
                selectedfeatureProperties2.value.value, 
                selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties2.value.value+'5'], 
                selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties1.value.value+'5'],
                selectedVisualVariable1.value.value,
                selectedVisualVariable2.value.value
            )
                
        }
           
    }
    
    else if (selectedStyle.value.value=='bivariate'){
        let matchExpression = []
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
        activatedGeovisStyle.value = 'bivariate'
        firstProperties.value=selectedfeatureProperties1.value.name
        secondProperties.value=selectedfeatureProperties2.value.name
        //emit("setLayerPaintProperty",'grid', 'fill-color', matchExpression)
        if (selectedUncertaintyStyle.value?.value=='noise_with_line_width'){
            emit("addCustomMapboxBorderLayerToMap",  selectedFeatureGeojson.value, selectedfeatureProperties1.value.value, 'uncertainty', selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties1.value.value+'5'])

        }
        else if(selectedUncertaintyStyle.value?.value=='noise_with_grain_size'){
            emit("addCustomMapboxGrainNoiseLayerToMap",  selectedFeatureGeojson.value, selectedfeatureProperties1.value.value, 'uncertainty', selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties1.value.value+'5'])

        }

    }
    else if(selectedStyle.value.value=='fuzzy'){
        emit("addFuzzyLayerToMap", selectedFeatureGeojson.value, selectedfeatureProperties1.value.value, selectedfeatureProperties2.value.value)

    }
    else if (selectedStyle.value.value=='position'){
        emit("addPositionLayerToMap", selectedFeatureGeojson.value, selectedfeatureProperties1.value.value, selectedfeatureProperties2.value.value)

    }
  
    else if(selectedStyle.value.value=='pattern'){
        emit("addPatternLayerToMap", selectedFeatureGeojson.value, selectedfeatureProperties1.value.value, selectedfeatureProperties2.value.value, selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties2.value.value+'5'])

    }
}
const assignColorPalette = (item, palette) => {
    useMapLegendStore().assignColorPalette({name: item, colors: palette});
    applyStyle()
    /*if (selectedStyle.value.value==='circle'){
       
        if (selectedUncertaintyStyle.value?.value=='ink'){
            emit("addCircleLayerWithInkUncertainty", selectedFeatureGeojson.value, selectedfeatureProperties1.value.value, selectedfeatureProperties2.value.value, 'uncertainty', selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties2.value.value+'5'], selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties1.value.value+'5'] )
        }
        else {
             emit("addCircleLayerToMap", selectedFeatureGeojson.value, selectedfeatureProperties1.value.value, selectedfeatureProperties2.value.value, selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties2.value.value+'5'], selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties1.value.value+'5'])

        }
        activatedGeovisStyle.value = 'circle'
    }
    else if (selectedStyle.value.value=='square'){
        emit("addSquareLayerToMap", selectedFeatureGeojson.value, selectedfeatureProperties1.value.value, selectedfeatureProperties2.value.value, selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties2.value.value+'5'], selectedFeatureGeojson.value.features[0].properties[selectedfeatureProperties1.value.value+'5'])
    }*/
   
}

const specifyLegendProperties =(payload)=>{
    console.log(payload, "payload")
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