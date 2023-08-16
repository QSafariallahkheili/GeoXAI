<template>
 <div style="position: absolute; top: 10px;left: 10px; z-index: 10;" >
    <v-card
    class="mx-auto" style="overflow-y: scroll;"
    max-width="600"
    max-height="400"
  >
  
    <v-list lines="one">
        <div v-for="(item,index) in tableNames" :key="index">
            <v-list-item
                :prepend-avatar= "getIcon(item[1])"
            >
            <template v-slot:subtitle >
                <div style="text-align: left;">
                    <input
                        type="checkbox"
                        :value="item[0]"
                        @change="toggleClickedLayer(item[0])"
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
import { ref, onMounted, defineEmits} from "vue"
import {
    getTableNames
} from "../services/backend.calls";

let tableNames = ref(null)
const selectedItems = ref([]);

const emit = defineEmits(["addLayerToMap", "toggleLayerVisibility"]);

const toggleClickedLayer = (layerName) => {
//const index = selectedItems.value.indexOf(layerName);
if (!selectedItems.value.includes(layerName)) {
    console.log(selectedItems)
    emit("addLayerToMap", layerName)
    selectedItems.value.push(layerName);
} else {
    console.log("must toggle")
    emit("toggleLayerVisibility", layerName)
}


    //
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


onMounted(() => {
  sendQuestRequest();
 
})

</script>

<style>

.layer-ui{
    overflow-y: scroll;
}

</style>