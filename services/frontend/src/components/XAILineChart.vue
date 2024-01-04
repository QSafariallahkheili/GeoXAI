<template >
    <canvas v-if="toggle"  class="xai-chart" id="shapChart" width="600" height="400" ></canvas>
</template>
<script setup>
import { ref, watch, onUnmounted, nextTick } from "vue"
import { storeToRefs } from 'pinia'
import { useXAIStore } from '../stores/xai'
import { getLocalShapValues } from "../services/backend.calls";
import Chart from 'chart.js/auto';
import * as turf from "@turf/turf";

let { clickedCoordinates } = storeToRefs(useXAIStore())

let shapValues = ref(null)
let raster_values_at_clicked_point = ref(null)
let chartInstance = ref(null);
let toggle = ref(false)


const renderChart = () => {
  toggle.value=true
  if (chartInstance.value){
    chartInstance.value.destroy();
  }
  
  nextTick(() => {
    if (shapValues.value){
    
      let labels = shapValues.value.map(obj => Object.keys(obj)[0]);
      labels = labels.map(label => `${label}: ${raster_values_at_clicked_point.value[label].toFixed(3)}`);
      const values = shapValues.value.map(obj => Object.values(obj)[0]);

      const positiveValues = values.map(value => Math.max(0, value));
      const negativeValues = values.map(value => Math.min(0, value));

      const positiveColors = positiveValues.map(() => 'rgba(75, 192, 192, 0.7)');
      const negativeColors = negativeValues.map(() => 'rgba(255, 99, 132, 0.7)');
      let id = document.getElementById('shapChart').getContext('2d');
      if (id){
        chartInstance.value = new Chart('shapChart', {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Positive',
                data: positiveValues,
                backgroundColor: positiveColors,
                borderColor: positiveColors,
                borderWidth: 1,
              },
              {
                label: 'Negative',
                data: negativeValues,
                backgroundColor: negativeColors,
                borderColor: negativeColors,
                borderWidth: 1,
              },
            ]
          },
          options: {
            indexAxis: 'y',
            responsive: false,
            plugins: {
              
              title: {
                display: true,
                text: 'SHAP Values'
              },
              legend: {
                position: 'right',
              },
            },
            scales: {
              x: {
                ticks: {
                  beginAtZero: true,
                  callback: function(value) {
                    return value < 0 ? '-' + Math.abs(value) : value;
                  }
                }
                
              },
              y: {
                stacked: true
              }
            }
          }
        });
      }
      
    }
  })

}


watch(clickedCoordinates, async () => {

    // check if the clicked coordinates are inside the AOI
    let layerBBOX = [11.266490630334411, 51.791199895877064, 14.4502996603007, 53.558814880433424]
    let poly = turf.bboxPolygon(layerBBOX);
    let isInside = turf.inside(clickedCoordinates.value, poly);

    if(isInside==true){
        const response =  await getLocalShapValues(clickedCoordinates.value)
        console.log(response)
        if(response.shap_values){
            shapValues.value = response.shap_values.class_not_fire
            raster_values_at_clicked_point.value = response.raster_values_at_clicked_point
            renderChart()
        }
        else {
            alert(response)
        }
    }
    
    
    
})


onUnmounted(() => {
    toggle.value=false
    if (chartInstance.value) {
        chartInstance.value.destroy();
    }
    
});


</script>
    
<style scoped>

.xai-chart {
    position: absolute;
    top: 10px;
    right: 10px;
    bottom: 100px;
    z-index: 10;
    background-color: rgba(255,255,255,0.6);
    
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    -moz-backdrop-filter: blur(5px);
    -ms-backdrop-filter: blur(5px);
    border: 1px solid rgba(0, 0, 0, 0.2);    
}


</style>