<template>
    <v-card
        class="mx-auto layer-ui"  width="400" max-height="400" v-show="activeMenu=='layers'"
    >
        <v-toolbar class="sticky">
   
            <v-card-text>
                <v-text-field
                    :placeholder="'looking for (' +  DBTableNames?.length + ' datasets)'"
                    prepend-inner-icon="mdi-magnify"
                    class="expanding-search"
                    filled
                    density="compact"
                    clearable
                    style="float:right; width: 100%;"
                    variant="solo"
                    single-line
                    hide-details
                    @click:clear="clearSearch"
                    v-model="layerSearchText"
                >
                </v-text-field>
            </v-card-text>
               
        </v-toolbar>
        <v-list lines="one" style="overflow-y: scroll; background: transparent;">
            <div v-for="(item,index) in filteredItems" :key="index">
                <v-list-item
                    :prepend-avatar= getIcon(item.type)
                    size="x-small"
                >
                <div class="form-check form-switch ml-1" style="width:fit-content; justify-content: center; align-items: center; display: flex; box-shadow:none !important;">
                    <input
                        @click="toggleClickedLayer(item.name,item.type)" 
                        class="form-check-input"
                        style=" cursor: pointer;"
                        type="checkbox" 
                        role="switch" 
                        :value= 
                        item.name 
                        :id=item.name 
                        :checked="item.checked">
                    <label class="form-check-label ml-2 " for="flexSwitchCheckDefault">{{ item.name }}</label>
                </div>
                   
                <template v-slot:append>

                    <v-icon
                        size="small"
                        variant="text"
                        density="compact"
                        @click="showMetadata(item.metadata, item.name)"
                    >
                    <font-awesome-icon :icon="['fas', 'circle-info']" />
                </v-icon>
                </template>

                </v-list-item>
                <v-divider style="margin-left: 15px; margin-right: 15px;" class="mt-2 mb-2"></v-divider>
               
            </div>
           
        </v-list>
  
    </v-card>
</template>
<script setup>
import { ref, onMounted, defineEmits, computed} from "vue"
import {
    getTableNames, /*getGeoserverCoverageSources*/
} from "../services/backend.calls";
import { useMetadataDialogStore } from '../stores/metadataDialog'
import { storeToRefs } from 'pinia'
import { useMenuStore } from '../stores/menu'
import { useLayersStore } from '../stores/layers'

let { activeMenu } = storeToRefs(useMenuStore())
let { DBTableNames, addedLayers } = storeToRefs(useLayersStore())

const metadataDialogStore = useMetadataDialogStore();

//let tableNames = ref([]);
//let selectedItems = ref([]);
let style = ref(null)
let layerType = ref(null)
let layerSearchText= ref("")

const emit = defineEmits(["addLayerToMap", "toggleLayerVisibility",  "addCoverageLayerToMap", "toggleCoverageLayerVisibility"]);



const toggleClickedLayer = (layerName, geomType) => {
   
    let index = DBTableNames.value.findIndex(obj => obj.name==layerName);
    DBTableNames.value[index].checked=!DBTableNames.value[index].checked
    // Trigger reactivity
    DBTableNames.value = [...DBTableNames.value];
    if (!addedLayers.value.includes(layerName)) {
    
        if (geomType == "MultiPolygon" || geomType == "Polygon"){
            style.value = {
                'fill-color': [
                    'case',
                    ['boolean',['feature-state', 'clicked'], false],
                    '#ffff00', // highlight color
                    '#0000ff', // default color
                ],
                "fill-opacity": 0.7,
                "fill-outline-color": "black",
            }
            layerType.value = "fill"
        }
        else if (geomType == "MultiLineString" || geomType == "LineString" || geomType == "Line"){
            style.value = {
                'line-width': [
                    'case',
                    ['boolean',['feature-state', 'clicked'], false],
                    4, // highlight width
                    2, // default width
                ],
                'line-color': [
                    'case',
                    ['boolean',['feature-state', 'clicked'], false],
                    '#ffff00', // highlight color
                    "#0000FF", // default color
                ],
                'line-opacity': 1,
            
            }
            layerType.value = "line"
        }
        else if (geomType == "Point") {
            style.value = {
                'circle-color': [
                    'case',
                    ['boolean',['feature-state', 'clicked'], false],
                    '#ffff00', // highlight color
                    '#00FF00', // default color
                ],
                'circle-stroke-color': [
                    'case',
                    ['boolean',['feature-state', 'clicked'], false],
                    "#ffffff", 
                    "#000000", 
                ],
                'circle-stroke-width':[
                    'case',
                    ['boolean',['feature-state', 'clicked'], false],
                    4, // highlight stroke-width
                    1, // default stroke-width
                ],
                'circle-opacity': 1
            } 
            layerType.value = "circle"
        }
        else if (geomType == "Raster"){
            style.value = {
                'raster-opacity' : 1
            }
            layerType.value = "raster"
        }
        if (geomType=='Raster'){
            emit("addCoverageLayerToMap", layerName, layerType, style)
        }
        else {
            let layerSpecification = {
                layerNameInDatabase: layerName,
                id: layerName,
                style: style,
                layerType: layerType
            }
            emit("addLayerToMap", layerSpecification);
        }
        addedLayers.value.push(layerName);
    } 
    else {
        if (geomType=='Raster'){
            emit("toggleCoverageLayerVisibility", layerName)
        }
        else {
            emit("toggleLayerVisibility", layerName)
        }
    }

}
const sendQuestRequest = async () => {
    const tablenamesfromDB =  await getTableNames()

    for (let i in tablenamesfromDB) {
        DBTableNames.value.push(tablenamesfromDB[i]);

        // add new key and value per table name to track the checked status of each layer
        DBTableNames.value[i]["checked"]=false
       
    }

}

const getIcon = (value)=> {
    if (value == "MultiPolygon" || value == "Polygon"){
        return "polygon.png"
    }
    else if (value == "MultiLineString" || value == "LineString" || value == "Line") {
        return "line.png"
    }
    else if (value == "Point"){
        return "point.png"
    }
    else if (value == "Raster") {
        return "raster.png" 
    }
    else {
        return "raster.png" 
    }
}

const clearSearch =()=>{
    layerSearchText.value = "";
}

const showMetadata = (metadata, tablename) => {
    metadataDialogStore.assignMetadata(metadata, tablename)
}
const filteredItems = computed(() => {
    if (!layerSearchText.value) {
        return DBTableNames.value;
    }

    return DBTableNames.value.filter(item =>
        item.name.toLowerCase().includes(layerSearchText.value.toLowerCase())
    )
  
});

/*const readGeoserverCoverageSources = async ()=> {
    const response =  await getGeoserverCoverageSources()    
    for (let i in response.coverageStores.coverageStore) {
        DBTableNames.value.push({"name": response.coverageStores.coverageStore[i].name,
        "type": "Raster",
        "checked": false
        });        
    }
}*/


onMounted(() => {
  sendQuestRequest();
  //readGeoserverCoverageSources()
})

</script>

<style scoped>
.layer-ui{
    overflow-y: scroll; background: transparent; border-radius: 8px;  position: absolute;
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
.sticky{
    position: sticky;
    top: 0;
    z-index: 1;
}
.form-switch .form-check-input {width: 4em; height: 2em;}
</style>