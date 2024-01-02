<template >
<div style="z-index: 9999;position: absolute;left: 20px; top:20px" v-if="activeMenu=='xai'">
    <p>dvcevrej kvregv</p>
</div>
   
   
          
</template>
<script setup>
import { storeToRefs } from 'pinia'
import { useMenuStore } from '../stores/menu'

let { activeMenu } = storeToRefs(useMenuStore())

console.log("xai component loaded")
</script>
    
<style scoped>



</style>