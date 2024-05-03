<template>
    <div class="text-center ma-2">
     
      <v-snackbar
        v-model="snackbar"
        :timeout="timeout"
        
      >
        {{ text }}
  
        <template v-slot:actions>
          <v-btn
            :color="btnColor"
            variant="text"
            @click="snackbar = false"
          >
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </div>
  </template>
<script setup>
import { storeToRefs } from 'pinia'
import { useAlertStore } from '../stores/alert'
let { snackbar, text, timeout, btnColor } = storeToRefs(useAlertStore())


</script>