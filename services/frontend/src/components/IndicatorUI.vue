<template>
 <v-card
        class="mx-auto indicator-ui"  max-width="400" max-height="400" v-show="activeMenu=='dashboard'"
    >
        <v-toolbar class="sticky">
   
            <v-card-text>
                <v-text-field
                    placeholder="search for indicators ..."
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
                    v-model="indicatorSearchText"
                >
                </v-text-field>
            </v-card-text>
               
        </v-toolbar>
        <v-list lines="one" style="overflow-y: scroll; background: transparent; text-align: left; ">
           
            <div v-for="(item,index) in filteredItems"  :key="index">
                <v-list-item
                    :value="item"
                    :title="item"
                    size="x-small"
                    @click="handleItemClick(item)"
                    color="primary"
                >
                </v-list-item>

                <v-divider class="mt-2 mb-2" v-if="index < indicatorNames.length - 1"></v-divider>

            </div>
        </v-list>
    </v-card>

   
</template>
<script setup>
import { onMounted, ref, computed, defineEmits} from "vue"
import {getIndicatorNames, getIndicatorData} from "../services/backend.calls";
import {Quantiles} from "../utils/classificationMethods"
import { useMapLegendStore } from '../stores/mapLegend'
import { useMenuStore } from '../stores/menu'
import { storeToRefs } from 'pinia'


const emit = defineEmits(["addStyleExpressionByYear", "addCommuneTileLayer"]);

const mapLegendStore = useMapLegendStore();
let indicatorNames = ref(null)
let indicatorSearchText= ref("")
let indicatorArray = ref(null)
let selectedYear = [];
let matchExpression = [];
let classIntervals = ref(null)
let minMaX = ref(null)

let { activeMenu } = storeToRefs(useMenuStore())


onMounted(() => {
    sendIndicarorRequest();

})

const sendIndicarorRequest = async () => {
  const indicatornamesfromDB =  await getIndicatorNames()
  indicatorNames.value = indicatornamesfromDB
}

const filteredItems = computed(() => {
  if (!indicatorSearchText.value) {
    return indicatorNames.value;
  }

  return indicatorNames.value.filter(item =>
    item.toLowerCase().includes(indicatorSearchText.value.toLowerCase())
  )
  
});

const handleItemClick = async (item) => {
  await addCommuneTileLayer();
  getIndicator(item);
};
const addCommuneTileLayer = async () => {
    emit("addCommuneTileLayer")
};

const getIndicator = async (indicatorName) => {
    const indocatorData =  await getIndicatorData(indicatorName)
    indicatorArray.value = indocatorData
    
    selectedYear = []
    matchExpression = null
    for (const subArray of indicatorArray.value) {
        const firstElement = subArray[0][0];
        selectedYear.push(firstElement);
    }    
    
    ////////////////////// ** classification ** /////////////////
    const wertArray = selectedYear.map(item => item.wert);
    classIntervals.value = Quantiles(wertArray, 5)
    minMaX.value = [wertArray[0], wertArray[wertArray.length - 1]]
    mapLegendStore.assignClassificationValues({
        minMax: minMaX.value,
        classIntervalsAndColor: [
            {
                interval1 : classIntervals.value[0], color1: '#feebe2'
            },
            {
                interval2 : classIntervals.value[1], color2: '#fbb4b9'
            },
            {
                interval3 : classIntervals.value[2], color3: '#f768a1'
            },
            {
                interval4 : classIntervals.value[3], color4: '#c51b8a'
            },
            {
                interval5 : minMaX.value[1], color5: '#7a0177'
            }
        ]
    })

    ////////////////////// ** stylization ** /////////////////

    // Build a GL expression that defines the color for every pg_tileserve (vector tile) feature
    matchExpression = ['match', ['get', 'nationalco']];

    // conditions for each communale gebiete code
    for (const row of selectedYear) {
        const value = row['wert'];
        let color;

        if (value <= classIntervals.value[0]) {
            color = '#feebe2'; // Class 1
        } else if (value <= classIntervals.value[1]) {
            color = '#fbb4b9'; // Class 2
        } else if (value <= classIntervals.value[2]) {
            color = '#f768a1'; // Class 3
        } else if (value <= classIntervals.value[3]) {
            color = '#c51b8a'; // Class 4
        } else {
            color = '#7a0177'; // Class 5 (Default color)
        }

        matchExpression.push(row['kennziffer'].toString(), color);
    }

    // Last value is the default color, used where there is no data
    matchExpression.push('rgba(0, 0, 0, 0)');
    emit("addStyleExpressionByYear",matchExpression)

}

const clearSearch =()=>{
    indicatorSearchText.value = "";
}

</script>

<style scoped>
.indicator-ui{
    overflow-y: scroll;
    background: transparent;
    border-radius: 8px;
    position: absolute;
    overflow-x: scroll; 
    top: 10px;
    left: 10px;
    z-index: 10;
    background-color: rgba(255,255,255,0.6);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    -moz-backdrop-filter: blur(5px);
    -ms-backdrop-filter: blur(5px);       
   
}
.sticky{
    position: sticky;
    top: 0;
    z-index: 1;
}
</style>