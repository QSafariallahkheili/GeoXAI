<template>
 <div style="position: absolute; top: 10px;left: 10px; z-index: 10;" >
    <v-card
        class="mx-auto" style="overflow-y: scroll;"
        max-width="600"
        max-height="400"
    >
        <v-toolbar
        color="white"
        >
   
            <v-card-text >
                <v-text-field
                    
                    placeholder="search layers by name"
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
    <v-list lines="one">
        <div v-for="(item,index) in filteredItems" :key="index">
            <v-list-item
                :prepend-avatar= "getIcon(item[1])"
            >
            
            <template v-slot:subtitle >
                <div style="text-align: left;">
                    <input
                        type="checkbox"
                        :value="item[0]"
                        @change="toggleClickedLayer(item[0],item[1])"
                    >
                    
                    <span class="font-weight-bold ml-2" >{{ item[0] }}</span> 
                </div>
            </template>
            </v-list-item>
            <v-divider v-if="index < tableNames.length - 1"></v-divider>
        </div>

    </v-list>
  
  </v-card>
 </div>
</template>
<script setup>
import { ref, onMounted, defineEmits, computed} from "vue"
import {
    getTableNames
} from "../services/backend.calls";

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
            'fill-color': 'blue',
            "fill-opacity": 0.7,
            "fill-outline-color": "black",
        }
        layerType.value = "fill"
    }
    else if (geomType == "MultiLineString" || geomType == "LineString" || geomType == "Line"){
        style.value = {
            'line-width': 2,
            'line-color': "#0000FF",
            'line-opacity': 1,
           
        }
        layerType.value = "line"
    }
    else if (geomType == "Point") {
        style.value = {
            'circle-color': '#00FF00',
            'circle-stroke-color': 'white',
            'circle-stroke-width': 1,
            'circle-opacity': 1
        } 
        layerType.value = "circle"
    }
    emit("addLayerToMap", layerName, layerType, style)
    selectedItems.value.push(layerName);
} else {
    emit("toggleLayerVisibility", layerName)
}

}
const sendQuestRequest = async () => {
  const tablenamesfromDB =  await getTableNames()
  tableNames.value = tablenamesfromDB
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

<style>



</style>