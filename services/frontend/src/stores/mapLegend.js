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
        legendVisVar1: null,
        legendVisVar2: null,
        secondPropertiesClassIntervals: null,
        ffs_layer_activated:false,
        selectedMoranFeature:null,
        uhi_activated_tab: "feature",
        uhi_layer_activated:false,
        selectedUHIFeatureSpecification: null,
        selectedUHIShapSpecification: null,
        selectedUHIBivariateFeatureSpecification: null,
    }),
    actions: {
        assignClassificationValues(data) {
            this.minMax= data.minMax
            this.classIntervalsAndColor = data.classIntervalsAndColor
           
        },
        setActivatedLegend(visStatus,layerId, workspace) {
            console.log("setActivatedLegend called with workspace:", workspace)
            if (visStatus=='visible'){
                this.rasterLegendUrl=process.env.VUE_APP_GEOSERVER_URL+'/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=15&HEIGHT=15&LAYER='+workspace+':'+layerId+'&legend_options=dx:10;dy:0;fontSize:12;countMatched:true;fontAntiAliasing:true&Transparent=True'
                this.rasterLegendTitle = layerId
            }
            else {
                this.rasterLegendUrl=null
                this.rasterLegendTitle = null
            }
            
        },
        assignColorPalette(colorPalette) {
            this.selectedColorPalette = colorPalette
        },
        SetMoranLegendSpecifications(featureName) {
           this.selectedMoranFeature = featureName
        },
        SetActivatedUHITab(tabName){
            this.uhi_activated_tab = tabName
        },
        SetLegendSpecifications(feature){
            this.selectedUHIFeatureSpecification = feature
        },
        SetLegendSpecificationsforShap(feature){
            this.selectedUHIShapSpecification = feature
        },
        SetUHIBivariateLegendSpecifications(feature, secondVariable, colorPalette){
            this.selectedUHIBivariateFeatureSpecification = feature
            console.log(this.selectedUHIBivariateFeatureSpecification, "selectedUHIBivariateFeatureSpecification in store")
            this.selectedUHIBivariateFeatureSpecification['secondVariable'] = secondVariable
            this.selectedUHIBivariateFeatureSpecification['colorPalette'] = colorPalette
        }
       
    }
})