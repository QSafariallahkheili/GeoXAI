import { defineStore } from 'pinia'

export const useUhiStore = defineStore ({
    id: 'uhi',
    state: () => ({
        ternaryArray: [],
        selectedHighlight:null,
        uncertaintyArray:[],
        moranUncertaintyArray:[],
        features: [
            { 
                name: 'Average Building Height',
                value: 'uhi_average_building_height', 
                feature_classes: [-2.717144250869751, 3.1058053970336914, 9.199895858764648, 16.047508239746094, 27.080949783325195, 210.88894653320312], 
                feature_color_palette: ['#ffffb2','#fecc5c','#fd8d3c','#f03b20','#bd0026'], 
                shap_classes: [-2.0327737, -0.38721052, -0.07575861, 0.087170735, 0.28997248, 1.7274714], 
                shap_color_palette: ['#2b83ba', '#abdda4', '#ffffbf', '#fdae61', '#d7191c']
            },
            { 
                name: 'Building Density', 
                value: 'uhi_building_density', 
                feature_classes: [0.0, 0.0917171910405159, 0.2767798900604248, 0.5016921162605286, 0.7891435027122498, 1.0], 
                feature_color_palette: ['#ffffd4','#fed98e','#fe9929','#d95f0e','#993404'],
                shap_classes: [-0.7965774, -0.17146002, -0.030211167, 0.07138047, 0.31318372, 1.5333356], 
                shap_color_palette: ['#2b83ba', '#abdda4', '#ffffbf', '#fdae61', '#d7191c']
            },
            { 
                name: 'Impervious Surface Area', 
                value: 'uhi_isa', 
                feature_classes: [0.0, 10.0, 31.0, 55.0, 82.0, 100.0], 
                feature_color_palette: ["#018571", "#80cdc1", "#f5f5f5", "#dfc27d", "#a6611a"], 
                shap_classes: [-1.9521816, -0.65094745, 0.233631, 0.9040625, 1.6850698, 3.7822056], 
                shap_color_palette: ['#2b83ba', '#abdda4', '#ffffbf', '#fdae61', '#d7191c']
            },
            { 
                name: 'POI Density', 
                value: 'uhi_poi_density', 
                feature_classes: [0.0, 3.8071460723876953, 11.812843322753906, 23.536455154418945, 41.18374252319336, 128.7958526611328], 
                feature_color_palette: ["#0b0405", "#1e2c33", "#27585c", "#318384", "#3aaead"], 
                shap_classes: [-1.1703776, -0.19720133, 0.010727792, 0.28481585, 0.6668735, 1.9780186], 
                shap_color_palette: ['#2b83ba', '#abdda4', '#ffffbf', '#fdae61', '#d7191c']
            },
            { 
                name: 'NDVI', 
                value: 'uhi_ndvi', 
                feature_classes: [-0.4859574437141418, 0.1580228805541992, 0.3744909465312958, 0.5678408145904541, 0.7419787645339966, 0.9284414649009703], 
                feature_color_palette: ["#edf8fb", "#b2e2e2", "#66c2a4", "#2ca25f", "#006d2c"], 
                shap_classes: [-1.7726027, -0.32987458, 0.043973625, 0.5144682, 1.2804238, 3.3988357], 
                shap_color_palette: ['#2b83ba', '#abdda4', '#ffffbf', '#fdae61', '#d7191c']
            },
            { 
                name: 'Population Density', 
                value: 'uhi_population_density', 
                feature_classes: [0.0, 6.233833369435947, 18.010599246491946, 30.31475301457744, 40.63769440532731, 49.60496989888648], 
                feature_color_palette: ["#feebe2", "#f5adbf", "#e465a4", "#bf278b", "#7a0177"], 
                shap_classes: [-3.4025595, -1.8480083, -0.6221649, 0.47150183, 1.2049942, 3.2424288], 
                shap_color_palette: ['#2b83ba', '#abdda4', '#ffffbf', '#fdae61', '#d7191c']
            },
            { 
                name: 'Surface Albedo', 
                value: 'uhi_surface_albedo', 
                feature_classes: [0.0271725610738556, 0.1030182042637959, 0.1369303755527529, 0.1547811319956228, 0.1734388516489466, 0.2297285678360031], 
                feature_color_palette: ['#ffffcc','#a1dab4','#41b6c4','#2c7fb8','#253494'], 
                shap_classes: [-3.376017, -1.225974, -0.3233625, 0.31471187, 0.95051765, 3.5398011], 
                shap_color_palette: ['#2b83ba', '#abdda4', '#ffffbf', '#fdae61', '#d7191c'] 
            },
            { 
                name: 'Sky View Factor', 
                value: 'uhi_svf', 
                feature_classes: [0.199480801820755, 0.7834688425064087, 0.8721259832382202, 0.9309770464897156, 0.971514105796814, 1.0], 
                feature_color_palette: ["#00204d", "#414d6b", "#7d7c78", "#beaf6f", "#ffea46"], 
                shap_classes: [-1.9234178, -0.37205976, -0.07392513, 0.25411052, 0.9552845, 3.2741644], 
                shap_color_palette: ['#2b83ba', '#abdda4', '#ffffbf', '#fdae61', '#d7191c'] 
            },
            { 
                name: 'DEM', 
                value: 'uhi_dem', 
                feature_classes: [19.09000015258789, 38.470001220703125, 45.95000076293945, 53.29999923706055, 68.37999725341797, 122.27999877929688], 
                feature_color_palette: ["#00204d", "#414d6b", "#7d7c78", "#beaf6f", "#ffea46"], 
                shap_classes: [-4.1051183, -0.4493853, -0.1681387, 0.0592358, 0.30724713, 1.827926], 
                shap_color_palette: ['#2b83ba', '#abdda4', '#ffffbf', '#fdae61', '#d7191c'] 
            },
            { 
                name: 'Tree Cover Density', 
                value: 'uhi_tcd', 
                feature_classes: [0.0, 4.0, 68.0, 79.0, 90.0, 100.0], 
                feature_color_palette: ["#f7fcf5", "#c9eac2", "#7bc77c", "#2a924b", "#00441b"],
                shap_classes: [-2.138954, -0.89952475, -0.47146288, 0.050045345, 0.5954314, 1.8969434], 
                shap_color_palette: ['#2b83ba', '#abdda4', '#ffffbf', '#fdae61', '#d7191c'] 
            },
            { 
                name: 'Road Density', 
                value: 'uhi_road_density', 
                feature_classes: [0.0, 0.0026798660401254, 0.0076544573530554, 0.0117770489305257, 0.0184439569711685, 0.0484551340341568], 
                feature_color_palette: ["#440154", "#3b528b", "#20908c", "#5dc962", "#fde725"], 
                shap_classes: [-0.8373771, -0.06167056, 0.039722156, 0.17627494, 0.36671805, 1.6097349], 
                shap_color_palette: ['#2b83ba', '#abdda4', '#ffffbf', '#fdae61', '#d7191c'] 
            },
            { 
                name: 'Water', 
                value: 'uhi_water', 
                feature_classes: [0,1,2,3,4,5], 
                feature_color_palette: ["#d8b365", "#4b4ee2ff", "#5ab4ac", "#5ab4ac", "#5ab4ac"], 
                shap_classes: [-3.7036762, -2.0835602, -1.3287474, -0.3892078, 0.20915551, 0.793509], 
                shap_color_palette: ['#2b83ba', '#abdda4', '#ffffbf', '#fdae61', '#d7191c'] 
            },
            { 
                name: 'Aspect', 
                value: 'uhi_aspect', 
                feature_classes: [0.0, 72.84423828125, 146.24562072753906, 218.924560546875, 289.8041687011719, 360.0], 
                feature_color_palette: ["#00204d", "#414d6b", "#7d7c78", "#beaf6f", "#ffea46"], 
                shap_classes: [-0.61377573, -0.070549294, -0.012989363, 0.03933976, 0.11382819, 1.515893], 
                shap_color_palette: ['#2b83ba', '#abdda4', '#ffffbf', '#fdae61', '#d7191c'] 
            },
            { 
                name: 'Slope', 
                value: 'uhi_slope', 
                feature_classes: [0.0, 0.763019323348999, 2.052020311355591, 4.238768100738525, 7.927489757537842, 23.98984718322754], 
                feature_color_palette: ["#edf8fb", "#b3cde3", "#8c96c6", "#8856a7", "#810f7c"], 
                shap_classes: [-1.3924153, -0.2443829, -0.07055252, 0.029992487, 0.1336713, 1.183656], 
                shap_color_palette: ['#2b83ba', '#abdda4', '#ffffbf', '#fdae61', '#d7191c'] 
            },
        ],
        bivariateFeatures1: [
            { 
                name: 'Average Building Height',
                value: 'uhi_average_building_height', 
                feature_classes: [-2.717144250869751, 3.1058053970336914, 9.199895858764648, 16.047508239746094, 27.080949783325195, 210.88894653320312], 
                feature_color_palette: ['#ffffb2','#fecc5c','#fd8d3c','#f03b20','#bd0026'], 
            },
            { 
                name: 'Building Density', 
                value: 'uhi_building_density', 
                feature_classes: [0.0, 0.0917171910405159, 0.2767798900604248, 0.5016921162605286, 0.7891435027122498, 1.0], 
                feature_color_palette: ['#ffffd4','#fed98e','#fe9929','#d95f0e','#993404'],
               
            },
            { 
                name: 'Impervious Surface Area', 
                value: 'uhi_isa', 
                feature_classes: [0.0, 10.0, 31.0, 55.0, 82.0, 100.0], 
                feature_color_palette: ["#018571", "#80cdc1", "#f5f5f5", "#dfc27d", "#a6611a"], 
                
            },
            { 
                name: 'POI Density', 
                value: 'uhi_poi_density', 
                feature_classes: [0.0, 3.8071460723876953, 11.812843322753906, 23.536455154418945, 41.18374252319336, 128.7958526611328], 
                feature_color_palette: ["#0b0405", "#1e2c33", "#27585c", "#318384", "#3aaead"], 
               
            },
            { 
                name: 'NDVI', 
                value: 'uhi_ndvi', 
                feature_classes: [-0.4859574437141418, 0.1580228805541992, 0.3744909465312958, 0.5678408145904541, 0.7419787645339966, 0.9284414649009703], 
                feature_color_palette: ["#edf8fb", "#b2e2e2", "#66c2a4", "#2ca25f", "#006d2c"], 
               
            },
            { 
                name: 'Population Density', 
                value: 'uhi_population_density', 
                feature_classes: [0.0, 6.233833369435947, 18.010599246491946, 30.31475301457744, 40.63769440532731, 49.60496989888648], 
                feature_color_palette: ["#feebe2", "#f5adbf", "#e465a4", "#bf278b", "#7a0177"], 
               
            },
            { 
                name: 'Surface Albedo', 
                value: 'uhi_surface_albedo', 
                feature_classes: [0.0271725610738556, 0.1030182042637959, 0.1369303755527529, 0.1547811319956228, 0.1734388516489466, 0.2297285678360031], 
                feature_color_palette: ['#ffffcc','#a1dab4','#41b6c4','#2c7fb8','#253494'], 
                
            },
            { 
                name: 'Sky View Factor', 
                value: 'uhi_svf', 
                feature_classes: [0.199480801820755, 0.7834688425064087, 0.8721259832382202, 0.9309770464897156, 0.971514105796814, 1.0], 
                feature_color_palette: ["#00204d", "#414d6b", "#7d7c78", "#beaf6f", "#ffea46"], 

            },
            { 
                name: 'DEM', 
                value: 'uhi_dem', 
                feature_classes: [19.09000015258789, 38.470001220703125, 45.95000076293945, 53.29999923706055, 68.37999725341797, 122.27999877929688], 
                feature_color_palette: ["#00204d", "#414d6b", "#7d7c78", "#beaf6f", "#ffea46"], 
               
            },
            { 
                name: 'Tree Cover Density', 
                value: 'uhi_tcd', 
                feature_classes: [0.0, 4.0, 68.0, 79.0, 90.0, 100.0], 
                feature_color_palette: ["#f7fcf5", "#c9eac2", "#7bc77c", "#2a924b", "#00441b"],
                
            },
            { 
                name: 'Road Density', 
                value: 'uhi_road_density', 
                feature_classes: [0.0, 0.0026798660401254, 0.0076544573530554, 0.0117770489305257, 0.0184439569711685, 0.0484551340341568], 
                feature_color_palette: ["#440154", "#3b528b", "#20908c", "#5dc962", "#fde725"], 
               
            },
            { 
                name: 'Water', 
                value: 'uhi_water', 
                feature_classes: [0,1,2,3,4,5], 
                feature_color_palette: ["#d8b365", "#4b4ee2ff", "#5ab4ac", "#5ab4ac", "#5ab4ac"], 
               
            },
            { 
                name: 'Aspect', 
                value: 'uhi_aspect', 
                feature_classes: [0.0, 72.84423828125, 146.24562072753906, 218.924560546875, 289.8041687011719, 360.0], 
                feature_color_palette: ["#00204d", "#414d6b", "#7d7c78", "#beaf6f", "#ffea46"], 
               
            },
            { 
                name: 'Slope', 
                value: 'uhi_slope', 
                feature_classes: [0.0, 0.763019323348999, 2.052020311355591, 4.238768100738525, 7.927489757537842, 23.98984718322754], 
                feature_color_palette: ["#edf8fb", "#b3cde3", "#8c96c6", "#8856a7", "#810f7c"], 
               
            },
        ],
        bivariateFeatures2: [

            {
                name: ' Prediction (UHI)', 
                value: 'uhi', 
                shap_classes: [23.022674560546875, 27.449453353881836, 30.74370002746582, 33.243282318115234, 35.5252799987793, 50.74635696411133], 
                shap_color_palette: ["#2b83ba","#abdda4","#ffffbf","#fdae61","#d7191c"]},
            { 
                name: 'Average Building Height SHAP',
                value: 'uhi_average_building_height_shap', 
                shap_classes: [-2.0327737, -0.38721052, -0.07575861, 0.087170735, 0.28997248, 1.7274714], 
                shap_color_palette: ['#2b83ba', '#abdda4', '#ffffbf', '#fdae61', '#d7191c']
            },
            { 
                name: 'Building Density SHAP', 
                value: 'uhi_building_density_shap', 
                shap_classes: [-0.7965774, -0.17146002, -0.030211167, 0.07138047, 0.31318372, 1.5333356], 
                shap_color_palette: ['#2b83ba', '#abdda4', '#ffffbf', '#fdae61', '#d7191c']
            },
            { 
                name: 'Impervious Surface Area SHAP', 
                value: 'uhi_isa_shap', 
                shap_classes: [-1.9521816, -0.65094745, 0.233631, 0.9040625, 1.6850698, 3.7822056], 
                shap_color_palette: ['#2b83ba', '#abdda4', '#ffffbf', '#fdae61', '#d7191c']
            },
            { 
                name: 'POI Density SHAP', 
                value: 'uhi_poi_density_shap', 
                shap_classes: [-1.1703776, -0.19720133, 0.010727792, 0.28481585, 0.6668735, 1.9780186], 
                shap_color_palette: ['#2b83ba', '#abdda4', '#ffffbf', '#fdae61', '#d7191c']
            },
            { 
                name: 'NDVI SHAP', 
                value: 'uhi_ndvi_shap', 
                shap_classes: [-1.7726027, -0.32987458, 0.043973625, 0.5144682, 1.2804238, 3.3988357], 
                shap_color_palette: ['#2b83ba', '#abdda4', '#ffffbf', '#fdae61', '#d7191c']
            },
            { 
                name: 'Population Density SHAP', 
                value: 'uhi_population_density_shap', 
                shap_classes: [-3.4025595, -1.8480083, -0.6221649, 0.47150183, 1.2049942, 3.2424288], 
                shap_color_palette: ['#2b83ba', '#abdda4', '#ffffbf', '#fdae61', '#d7191c']
            },
            { 
                name: 'Surface Albedo SHAP', 
                value: 'uhi_surface_albedo_shap', 
                shap_classes: [-3.376017, -1.225974, -0.3233625, 0.31471187, 0.95051765, 3.5398011], 
                shap_color_palette: ['#2b83ba', '#abdda4', '#ffffbf', '#fdae61', '#d7191c'] 
            },
            { 
                name: 'Sky View Factor SHAP', 
                value: 'uhi_svf_shap', 
                shap_classes: [-1.9234178, -0.37205976, -0.07392513, 0.25411052, 0.9552845, 3.2741644], 
                shap_color_palette: ['#2b83ba', '#abdda4', '#ffffbf', '#fdae61', '#d7191c'] 
            },
            { 
                name: 'DEM SHAP', 
                value: 'uhi_dem_shap', 
                shap_classes: [-4.1051183, -0.4493853, -0.1681387, 0.0592358, 0.30724713, 1.827926], 
                shap_color_palette: ['#2b83ba', '#abdda4', '#ffffbf', '#fdae61', '#d7191c'] 
            },
            { 
                name: 'Tree Cover Density SHAP', 
                value: 'uhi_tcd_shap', 
                shap_classes: [-2.138954, -0.89952475, -0.47146288, 0.050045345, 0.5954314, 1.8969434], 
                shap_color_palette: ['#2b83ba', '#abdda4', '#ffffbf', '#fdae61', '#d7191c'] 
            },
            { 
                name: 'Road Density SHAP', 
                value: 'uhi_road_density_shap', 
                shap_classes: [-0.8373771, -0.06167056, 0.039722156, 0.17627494, 0.36671805, 1.6097349], 
                shap_color_palette: ['#2b83ba', '#abdda4', '#ffffbf', '#fdae61', '#d7191c'] 
            },
            { 
                name: 'Water SHAP', 
                value: 'uhi_water_shap', 
                shap_classes: [-3.7036762, -2.0835602, -1.3287474, -0.3892078, 0.20915551, 0.793509], 
                shap_color_palette: ['#2b83ba', '#abdda4', '#ffffbf', '#fdae61', '#d7191c'] 
            },
            { 
                name: 'Aspect SHAP', 
                value: 'uhi_aspect_shap', 
                shap_classes: [-0.61377573, -0.070549294, -0.012989363, 0.03933976, 0.11382819, 1.515893], 
                shap_color_palette: ['#2b83ba', '#abdda4', '#ffffbf', '#fdae61', '#d7191c'] 
            },
            { 
                name: 'Slope SHAP', 
                value: 'uhi_slope_shap', 
                shap_classes: [-1.3924153, -0.2443829, -0.07055252, 0.029992487, 0.1336713, 1.183656], 
                shap_color_palette: ['#2b83ba', '#abdda4', '#ffffbf', '#fdae61', '#d7191c'] 
            },
        ],
        moranFeatures:[
            { name: 'NDVI', value: 'ndvi', target_attribute: 'ndvi' },
            { name: 'NDVI SHAP', value: 'ndvi', target_attribute: 'ndvi_shap'},
            { name: 'ISA', value: 'isa', target_attribute: 'isa' },
            { name: 'ISA SHAP', value: 'isa', target_attribute: 'isa_shap'},
            { name: 'TCD', value: 'tcd', target_attribute: 'tcd' },
            { name: 'TCD SHAP', value: 'tcd', target_attribute: 'tcd_shap'},
            { name: 'DEM', value: 'dem', target_attribute: 'dem' },
            { name: 'DEM SHAP', value: 'dem', target_attribute: 'dem_shap'},
            { name: 'SVF', value: 'svf', target_attribute: 'svf' },
            { name: 'SVF SHAP', value: 'svf', target_attribute: 'svf_shap'},
            { name: 'Surface Albedo', value: 'surface_albedo', target_attribute: 'surface_albedo' },
            { name: 'Surface Albedo SHAP', value: 'surface_albedo', target_attribute: 'surface_albedo_shap'},
            { name: 'Population Density', value: 'population_density', target_attribute: 'population_density' },
            { name: 'Population Density SHAP', value: 'population_density', target_attribute: 'population_density_shap'},
            { name: 'POI Density', value: 'poi_density', target_attribute: 'poi_density' },
            { name: 'POI Density SHAP', value: 'poi_density', target_attribute: 'poi_density_shap'},
            { name: 'Building Density', value: 'building_density', target_attribute: 'building_density' },
            { name: 'Building Density SHAP', value: 'building_density', target_attribute: 'building_density_shap'},
            { name: 'Average Building Height', value: 'average_building_height', target_attribute: 'average_building_height' },
            { name: 'Average Building Height SHAP', value: 'average_building_height', target_attribute: 'average_building_height_shap' },
            { name: 'Water', value: 'water', target_attribute: 'water' },
            { name: 'Water SHAP', value: 'water', target_attribute: 'water_shap' },
            { name: 'Road Density', value: 'road_density', target_attribute: 'road_density' },
            { name: 'Road Density SHAP', value: 'road_density', target_attribute: 'road_density_shap' },
            { name: 'Aspect', value: 'aspect', target_attribute: 'aspect' },
            { name: 'Aspect SHAP', value: 'aspect', target_attribute: 'aspect_shap' },
            { name: 'Slope', value: 'slope', target_attribute: 'slope' },
            { name: 'Slope SHAP', value: 'slope', target_attribute: 'slope_shap' }
        ],
        UHIVectorSpecification: 
            { 
                name: 'Urban Heat Island (UHI) prediction', 
                value: 'uhi', 
                feature_classes: [23.022674560546875, 27.449453353881836, 30.74370002746582, 33.243282318115234, 35.5252799987793, 50.74635696411133], 
                feature_color_palette: ["#2b83ba","#abdda4","#ffffbf","#fdae61","#d7191c"],
                
            },
     
    
        UHI_BIVARIATE_COLORS: [
            "#e8e8e8", "#c2e6e6", "#96e3e3", "#5edfdf", "#00d9d9", 
            "#e2bcdb", "#c2bcdb", "#96bcdb", "#5ebcdb", "#00bcd9", 
            "#dc8ecd", "#c28ecd", "#968ecd", "#5e8ecd", "#008ecd", 
            "#d55abd", "#c25abd", "#965abd", "#5e5abd", "#005abd", 
            "#c900a1", "#c200a1", "#9600a1", "#5e00a1", "#0000a1"]
    }),
    actions: {
        assignTernaryArray(data) {
           
            this.ternaryArray= data.ternaryArray
        },
        setSelectedTernary(value){
            this.selectedHighlight=value
            console.log('selectedHighlight set to:', this.selectedHighlight)
        },
        assignUncertaintyArray(data) {
           
            this.uncertaintyArray= data.uncertaintyArray
        },
        assignMoranUncertaintyArray(data){
            this.moranUncertaintyArray= data.moranUncertaintyArray

        }

       
       
    }
})