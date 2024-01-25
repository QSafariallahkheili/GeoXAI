<template >
   <!--<canvas v-show="shapValues!==null" class="xai-chart" id="shapChart" width="600" height="400" ></canvas>--> 
   <div>
    <svg v-show="shapValues !== null" class="xai-chart" id="shapChart"></svg>
  </div>
</template>
<script setup>
import { ref, watch, onUnmounted, onMounted, defineEmits } from "vue"
import { storeToRefs } from 'pinia'
import { useXAIStore } from '../stores/xai'
import { getLocalShapValues } from "../services/backend.calls";
//import Chart from 'chart.js/auto';
import * as turf from "@turf/turf";
import * as d3 from "d3";

let { clickedCoordinates } = storeToRefs(useXAIStore())

let shapValues = ref(null)
let raster_values_at_clicked_point = ref(null)
let predict_proba = ref(null)
let chartInstance = null;
let hoveredElement = ref(null)

const emit = defineEmits(["addHoveredLayerToMap", "toggleCoverageLayerVisibilityWithValue"]);


const renderChart = () => {
  const svg = d3.select('#shapChart');
  svg.selectAll('*').remove(); // Clear existing chart
  var margin = { top: 40, right: 20, bottom: 60, left: 150 };
  let width = 600 - margin.left - margin.right;
  let height = 400 - margin.top - margin.bottom;

  svg.attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

  const chartGroup = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  // Create a tooltip element
  const tooltip = d3.select('body')
    .append('div')
    .style('position', 'absolute')
    .style('background-color', 'black')
    .style('border', '1px solid black')
    .style('padding', '5px')
    .style('color', 'white')
    .style('border-radius', '5px')
    .style('opacity', 0)
    .style('z-index', 11) // Set a higher z-index
    .style('pointer-events', 'none'); // Allow mouse events to pass through

  if (shapValues.value) {
    // Extract data for the chart
    const labels = shapValues.value.map(obj => Object.keys(obj)[0]);
    const values = shapValues.value.map(obj => Object.values(obj)[0]);

    // Find the maximum absolute value in the dataset
    const maxAbsValue = Math.max(
      Math.abs(d3.min(values)),
      Math.abs(d3.max(values))
    );

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([-maxAbsValue, maxAbsValue])
      .range([0, width]);
    const yScale = d3.scaleBand().domain(labels).range([height, 0]).padding(0.1);

    // Create bars without transition for entering elements
    const barsEnter = chartGroup.selectAll('rect')
      .data(shapValues.value)
      .enter()
      .append('rect')
      .attr('y', d => yScale(Object.keys(d)[0]))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => Object.values(d)[0] >= 0 ? 'rgba(75, 192, 192, 0.8)' : 'rgba(255, 99, 132, 0.8)')
      .attr('stroke', 'grey') // Add grey border
      .attr('stroke-width', 1) // Set border width
      .attr('rx', 5) // Set horizontal radius for rounded ends
      .attr('ry', 5) // Set vertical radius for rounded ends
 
      .on('mouseover', function (event, d) {
       
        hoveredElement.value = Object.keys(d)[0];
        emit ("addHoveredLayerToMap", hoveredElement.value )
        // Highlight the bar on mouseover
        d3.select(this).attr('fill', d => Object.values(d)[0] >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)');

        // Show tooltip on mouseover
        tooltip.transition().duration(400).style('opacity', 0.7);
        tooltip.html(`Value: ${Object.values(d)[0].toFixed(2)}`)
          .style('left', `${event.pageX}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', function () {
       
        console.log(hoveredElement.value, "mouseout")
        emit ("addHoveredLayerToMap", hoveredElement.value )
       
        // Restore the original color on mouseout
        d3.select(this).attr('fill', d => Object.values(d)[0] >= 0 ? 'rgba(75, 192, 192, 0.8)' : 'rgba(255, 99, 132, 0.8)');

        // Hide tooltip on mouseout
        tooltip.transition().duration(500).style('opacity', 0);
      });

    // Apply transition for updating elements
    const barsUpdate = chartGroup.selectAll('rect')  // Select only existing rectangles
    .data(shapValues.value)
      .transition()
      .duration(1000) // Set the duration of the transition
      .attr('y', d => yScale(Object.keys(d)[0]))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => Object.values(d)[0] >= 0 ? 'rgba(75, 192, 192, 0.8)' : 'rgba(255, 99, 132, 0.8)');

    // Combine the entering and updating elements
    const bars = barsEnter.merge(barsUpdate);
    // Apply transition for merged elements
    bars.transition()
      .duration(1000) // Set the duration of the transition
      .attr('x', d => xScale(Math.min(0, Object.values(d)[0])))
      .attr('width', d => Math.abs(xScale(Object.values(d)[0]) - xScale(0)));

    // Create axes with transition
    const xAxis = d3.axisBottom(xScale)
   

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => `${d} : ${raster_values_at_clicked_point.value[d].toFixed(3)}`);

    chartGroup.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .transition()
      .duration(1000) // Set the duration of the transition

    chartGroup.append('g')
      .call(yAxis)
      
      .transition()
      .duration(1000) // Set the duration of the transition

    // Add chart title
    chartGroup.append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 10)
      .attr('text-anchor', 'middle')
      .text('SHAP values');

    chartGroup.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -margin.left + 10)
      .attr('dy', '1em')
      .attr('text-anchor', 'middle')
      .text('Predictors');

    // Add chart title
    chartGroup.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top + 20)
      .attr('text-anchor', 'middle')
      .text(`SHAP Values (wildfire probability: ${predict_proba?.value?.toFixed(3)})`);

      




  
  }
};


onMounted( async ()=>{

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
      
      renderChart();
      
    }
    else {
        alert(response)
    }
  }
  
    
    
})

watch(hoveredElement, async () => {
  console.log(hoveredElement.value, "watched")
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