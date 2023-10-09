<template>
    <v-card
        class="mx-auto layer-ui"  width="400" max-height="400" v-show="activeMenu=='layers'"
    >
        <v-toolbar class="sticky">
   
            <v-card-text>
                <v-text-field
                    :placeholder="'looking for (' +  tableNames?.length + ' datasets)'"
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
                    :prepend-avatar= "getIcon(item[1])"
                    size="x-small"
                >
                    <v-switch 
                        :v-model="selectedItems.includes(item[0])?true:false"
                        style="width:fit-content; justify-content: center; align-items: center; display: flex;"
                        :label= item[0] 
                        :value="item[0]"
                        @click="toggleClickedLayer(item[0],item[1])"
                        color="indigo"
                        inset
                    ></v-switch>
                <template v-slot:append>

                    <v-icon
                        icon="mdi-information"
                        variant="text"
                        density="compact"
                        @click="showMetadata(item[2], item[0])"
                    ></v-icon>
                </template>

                </v-list-item>
                <v-divider style="margin-left: 15px; margin-right: 15px;" class="mt-2 mb-2" v-if="index < tableNames.length - 1"></v-divider>

            </div>
            
        </v-list>
  
    </v-card>
</template>
<script setup>
import { ref, onMounted, defineEmits, computed} from "vue"
import {
    getTableNames
} from "../services/backend.calls";
import { useMetadataDialogStore } from '../stores/metadataDialog'
import { storeToRefs } from 'pinia'
import { useMenuStore } from '../stores/menu'

let { activeMenu } = storeToRefs(useMenuStore())

const metadataDialogStore = useMetadataDialogStore();

let tableNames = ref(null)
const selectedItems = ref([]);
let style = ref(null)
let layerType = ref(null)
let layerSearchText= ref("")

const emit = defineEmits(["addLayerToMap", "toggleLayerVisibility"]);



const toggleClickedLayer = (layerName, geomType) => {
if (!selectedItems.value.includes(layerName)) {
   
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
    emit("addLayerToMap", layerName, layerType, style)
    selectedItems.value.push(layerName);
} else {
    emit("toggleLayerVisibility", layerName)
    console.log(selectedItems)
}

}
const sendQuestRequest = async () => {
  const tablenamesfromDB =  await getTableNames()
  tableNames.value = tablenamesfromDB
  console.log(tablenamesfromDB)
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
    else {
        return "point.png" 
    }
}

const clearSearch =()=>{
    layerSearchText.value = "";
}

const showMetadata = (metadata, tablename) => {
    //console.log(metadata)
    metadataDialogStore.assignMetadata(metadata, tablename)
}
const filteredItems = computed(() => {
  if (!layerSearchText.value) {
    return tableNames.value;
  }

  return tableNames.value.filter(item =>
    item[0].toLowerCase().includes(layerSearchText.value.toLowerCase())
  )
  
});

onMounted(() => {
  sendQuestRequest();
 
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
</style>