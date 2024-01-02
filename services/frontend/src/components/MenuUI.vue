<template>
<div class="menue-ui">
    <v-tooltip text="layers" location="top">
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
    </v-tooltip>

    <v-tooltip text="dashboard" location="top">
        <template v-slot:activator="{ props }">
            <v-btn 
                v-bind="props"
                class="ml-2"
                v-ripple="{ class: 'primary--text' }"
                @click="setActiveButton('dashboard')"
                :style="{ color: activeMenu === 'dashboard' ? 'blue' : '' }"
            >
                <v-icon size="small">
                    <font-awesome-icon :icon="['fas', 'chart-column']" />
                </v-icon>
               
               
            </v-btn> 
        </template>
    </v-tooltip>

</div>    

      
</template>
<script setup>
import { ref } from 'vue';
import { useMenuStore } from '../stores/menu'
const menuStore = useMenuStore();

const activeMenu = ref(null);

function setActiveButton(button) {
    activeMenu.value = button;
    menuStore.setActivatedMenu(activeMenu.value)
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