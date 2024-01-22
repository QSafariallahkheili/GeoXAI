<template >
    <canvas v-show="shapValues!==null" class="xai-chart" id="shapChart" width="600" height="400" ></canvas>
</template>
<script setup>
import { ref, watch, onUnmounted, onMounted } from "vue"
import { storeToRefs } from 'pinia'
import { useXAIStore } from '../stores/xai'
import { getLocalShapValues } from "../services/backend.calls";
import Chart from 'chart.js/auto';
import * as turf from "@turf/turf";

let { clickedCoordinates } = storeToRefs(useXAIStore())

let shapValues = ref(null)
let raster_values_at_clicked_point = ref(null)
let predict_proba = ref(null)
let chartInstance = null;


const renderChart = () => {
  if (chartInstance){
    chartInstance.destroy();
    chartInstance = null;
  }
  
      const canvas = document.getElementById('shapChart');
      console.log(canvas, 'canvas')
      if (canvas){
        const ctx = canvas.getContext('2d');
        chartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: "",
            datasets: [
              
            ]
          },
          options: {
  
            indexAxis: 'y',
            responsive: false,
            plugins: {
              
              title: {
                display: true,
                //text: `SHAP Values (wildfire pobability: ${predict_proba?.value?.toFixed(3)})`,
              },
              legend: {
                position: 'top',
              },
            },
            scales: {
              x: {
     
                
              },
              y: {
                stacked: true
              }
            }
          },
          
        });
      }
      
      
}

onMounted( async ()=>{
  renderChart()
})
watch(clickedCoordinates, async () => {
  // check if the clicked coordinates are inside the AOI
  let layerBBOX = [11.266490630334411, 51.791199895877064, 14.4502996603007, 53.558814880433424]
  let poly = turf.bboxPolygon(layerBBOX);
  let isInside = turf.inside(clickedCoordinates.value, poly);

  if(isInside==true){
    const response =  await getLocalShapValues(clickedCoordinates.value)
    if(response.shap_values){
      shapValues.value = response.shap_values.class_not_fire
      raster_values_at_clicked_point.value = response.raster_values_at_clicked_point
      predict_proba.value = response.predicted_probability.probability_fire
      //renderChart()



      let labels = shapValues.value.map(obj => Object.keys(obj)[0]);
      labels = labels.map(label => `${label}: ${raster_values_at_clicked_point.value[label].toFixed(3)}`);
      const values = shapValues.value.map(obj => Object.values(obj)[0]);

      const positiveValues = values.map(value => Math.max(0, value));
      const negativeValues = values.map(value => Math.min(0, value));

      const positiveColors = positiveValues.map(() => 'rgba(75, 192, 192, 0.8)');
      const positiveColorsBorder = positiveValues.map(() => 'rgba(75, 192, 192, 1)');
      const negativeColors = negativeValues.map(() => 'rgba(255, 99, 132, 0.8)');
      const negativeColorsBorder = negativeValues.map(() => 'rgba(255, 99, 132, 1)');
      let  chartData=  {
        labels: labels,
        datasets: [
          {
            label: 'Importance Value (non-fire)',
            data: positiveValues,
            backgroundColor: positiveColors,
            borderColor: positiveColorsBorder,
            borderRadius: 5,
            borderWidth: 2,
            borderSkipped: false,
          },
          {
            label: 'Importance Value (fire)',
            data: negativeValues,
            backgroundColor: negativeColors,
            borderColor: negativeColorsBorder,
            borderRadius: 5,
            borderWidth: 2,
            borderSkipped: false,
          },
        ]
      }
      if (chartInstance) {
        chartInstance.data = chartData;
        chartInstance.options.plugins.title = {
          display: true,
          text: `SHAP Values (wildfire pobability: ${predict_proba?.value?.toFixed(3)})`,
        }
        chartInstance.update();
      }
          

    }
    else {
        alert(response)
    }
  }
    
    
})


onUnmounted(() => {
  if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null
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
    border-radius: 8px;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    -moz-backdrop-filter: blur(5px);
    -ms-backdrop-filter: blur(5px);
    border: 1px solid rgba(0, 0, 0, 0.2);    
}


</style>