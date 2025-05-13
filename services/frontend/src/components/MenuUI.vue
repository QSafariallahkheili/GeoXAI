<template>
<div class="menue-ui">
    <!--<v-tooltip text="layers" location="top">
        <template v-slot:activator="{ props }">
            <v-btn 
                v-bind="props"
                class="ml-2" 
                v-ripple="{ class: 'primary--text' }"
                @click="setActiveButton('layers')"
                :style="{ color: activeMenu === 'layers' ? 'blue' : '' }"
            >
                <v-icon size="small">
                    <font-awesome-icon :icon="['fas', 'layer-group']" />
                </v-icon>
            </v-btn>
        </template>
    </v-tooltip>-->

    <v-tooltip text="xai" location="top">
        <template v-slot:activator="{ props }">
            <v-btn 
                
                v-bind="props"
                class="ml-2"
                v-ripple="{ class: 'primary--text' }"
                @click="setActiveButton('xai')"
                :style="{ color: activeMenu === 'xai' ? 'blue' : '' }"
            >
            <v-icon size="x-large">
               <IconXai />
            </v-icon>
               
            </v-btn> 
        </template>
    </v-tooltip>
    <v-tooltip text="filter" location="top">
        <template v-slot:activator="{ props }">
            <v-btn 
                v-bind="props"
                class="ml-2" 
                v-ripple="{ class: 'primary--text' }"
                @click="setActiveButton('filter')"
                :style="{ color: activeMenu === 'filter' ? 'blue' : '' }"
            >
                <v-icon size="small">
                    <font-awesome-icon :icon="['fas', 'filter']" />
                </v-icon>
            </v-btn>
        </template>
    </v-tooltip>
    <v-tooltip text="geovis" location="top">
        <template v-slot:activator="{ props }">
            <v-btn 
                v-bind="props"
                class="ml-2" 
                v-ripple="{ class: 'primary--text' }"
                @click="setActiveButton('geovis')"
                :style="{ color: activeMenu === 'geovis' ? 'blue' : '' }"
            >
                <v-icon size="small">
                    <font-awesome-icon :icon="['fas', 'palette']" />
                </v-icon>
            </v-btn>
        </template>
    </v-tooltip>

</div>    

      
</template>
<script setup>
import { ref, defineEmits } from 'vue';
import { useMenuStore } from '../stores/menu'
import IconXai from '../assets/icons/IconXai.vue';
import { useAlertStore } from '@/stores/alert'
const menuStore = useMenuStore();
const alertStore = useAlertStore()

const emit = defineEmits(["removeLayerFromMap", "addLayerToMap"]);
let style = ref(null)
let layerType = ref(null)
const activeMenu = ref(null);

function setActiveButton(button) {
    if(activeMenu.value==button){
        activeMenu.value = null
    }
    else {
        activeMenu.value = button;
    }
    menuStore.setActivatedMenu(activeMenu.value)
    if (button==="xai"){
        alertStore.setAlert({
            text: "Click on any pixel inside the Foreset Fire Susceptibility map to get local explanation",
            timeout: 10000,
            btnColor: "blue"
        })
        emit("removeLayerFromMap", "grid")
    }
    else if (button==="filter"){
        emit("removeLayerFromMap", "xai-pulse")
        emit("removeLayerFromMap", "grid")
    }
    else if (button==="geovis"){
        style.value = {
                'line-width': 1,
                'line-color': "#808080",
                'line-opacity': 0.3,
            
            }
            layerType.value = "line"
            let layerSpecification = {
                layerNameInDatabase: "grid",
                id: "grid",
                style: style,
                layerType: layerType
            }
        emit("addLayerToMap",layerSpecification)
        emit("removeLayerFromMap", "fire_susceptibility")
    }
    
}

</script>

<style scoped>
.menue-ui{
    display: flex;
  justify-content: space-between;
  position: absolute;
  z-index: 10;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%); /* Horizontally center the div */
    
}
.menue-ui .v-btn {
  min-width: 36px;
  width: 36px;
}
.menue-ui .v-btn::before{
  background-color: transparent;
}

.menue-ui  .v-btn i:hover{
  transform: scale(1.15);
}


</style>