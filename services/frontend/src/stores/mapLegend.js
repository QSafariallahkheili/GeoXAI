import { defineStore } from 'pinia'

export const useMapLegendStore = defineStore ({
    id: 'mapLegend',
    state: () => ({
        minMax: null,
        classIntervalsAndColor: null,
        rasterLegendUrl: null,
        rasterLegendTitle: null
    }),
    actions: {
        assignClassificationValues(data) {
            this.minMax= data.minMax
            this.classIntervalsAndColor = data.classIntervalsAndColor
           
        },
        setActivatedLegend(visStatus,layerId){
            if (visStatus=='visible'){
                this.rasterLegendUrl=process.env.VUE_APP_GEOSERVER_URL+'/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=15&HEIGHT=15&LAYER=geoxai:'+layerId+'&legend_options=fontSize:12;countMatched:true;fontAntiAliasing:true&Transparent=True'
                this.rasterLegendTitle = layerId
            }
            else {
                this.rasterLegendUrl=null
                this.rasterLegendTitle = null
            }
            
        }
       
    }
})