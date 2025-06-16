import { defineStore } from 'pinia'

export const useMapLegendStore = defineStore ({
    id: 'mapLegend',
    state: () => ({
        minMax: null,
        classIntervalsAndColor: null,
        rasterLegendUrl: null,
        rasterLegendTitle: null,
        activatedGeovisStyle: null,
        bivariateColorpalette: {
            'high_low': '#be64ac', 'high_medium': '#8c62aa', 'high_high':'#3b4994',
            'medium_low': '#dfb0d6', 'medium_medium': '#a5add3', 'medium_high':'#5698b9',
           'low_low': '#e8e8e8', 'low_medium': '#ace4e4', 'low_high':'#5ac8c8'
        },
        firstProperties: null,
        firstPropertiesClassIntervals: null,
        secondProperties: null,
        selectedColorPalette: null,
        uncertaintyStyle: null,
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
            
        },
        assignColorPalette(colorPalette) {
            this.selectedColorPalette = colorPalette
        }
       
    }
})