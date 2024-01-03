<template >
    <canvas class="xai-chart" ref="shapChart" width="600" height="400"></canvas>
    <v-card
        class="mx-auto xai-ui"  width="400" max-height="400"
    >
    <div >
       
       XAI UI
    </div>
    
    </v-card>
          
</template>
<script setup>
import { onMounted, defineEmits, ref, watch, onBeforeUnmount } from "vue"
import { storeToRefs } from 'pinia'
import { useXAIStore } from '../stores/xai'
import { getLocalShapValues } from "../services/backend.calls";
import Chart from 'chart.js/auto';

let { clickedCoordinates } = storeToRefs(useXAIStore())

const emit = defineEmits(["addCoverageLayerToMap", "getClickedCoordinate"]);
let layerName = "fire_susceptibility_color"
let layerType = ref("raster")
let style = ref({'raster-opacity' : 1})
let shapValues = ref(null)
let raster_values_at_clicked_point = ref(null)
let shapChart = ref(null);
let chartInstance = null;

const addCoverageLayerToMap = () => {
    emit("addCoverageLayerToMap", layerName, layerType, style)
    emit("getClickedCoordinate")
}
const renderChart = () => {
  if (chartInstance){
    chartInstance.destroy();
  }
    
    const ctx = shapChart.value.getContext('2d');
    const labels = shapValues.value.map(obj => Object.keys(obj)[0]);
    const values = shapValues.value.map(obj => Object.values(obj)[0]);


    const positiveValues = values.map(value => Math.max(0, value));
    const negativeValues = values.map(value => Math.min(0, value));

    const positiveColors = positiveValues.map(() => 'rgba(75, 192, 192, 0.7)');
    const negativeColors = negativeValues.map(() => 'rgba(255, 99, 132, 0.7)');
    chartInstance = new Chart(ctx, {
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
              position: 'top',
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


watch(clickedCoordinates, async () => {
    const response =  await getLocalShapValues(clickedCoordinates.value)
    shapValues.value = response.shap_values.class_not_fire
    raster_values_at_clicked_point.value = response.raster_values_at_clicked_point
    renderChart()


})

onMounted(() => {
    addCoverageLayerToMap()
})
onBeforeUnmount(() => {
      if (chartInstance) {
        chartInstance.destroy(); // Make sure to destroy the chart when the component is unmounted
      }
    
    });

</script>
    
<style scoped>
.xai-ui{
    overflow-y: scroll;
    background: transparent;
    border-radius: 8px;
    position: absolute;
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