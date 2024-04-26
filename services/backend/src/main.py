from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os
import subprocess
import pandas as pd
import joblib
import shap
import numpy as np
from .models import CoordinatesRequest, IndicatorRequest, TableRequest, PredictorRequest
from .database import (
    get_home_data,
    get_indicator_list,
    get_indicator_data,
    get_geojson_data
)
import matplotlib.pyplot as plt
import rioxarray
#from osgeo import gdal
import json


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080","http://localhost", "http://127.0.0.1:8080", "http://127.0.0.1", "http://geo-xai.fh-potsdam.de:8080", "http://geo-xai.fh-potsdam.de"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


model_path = os.getenv('RANDOM_FOREST_MODEL_PATH', '/Users/qasemsafariallahkheili/Downloads/wildfire/sample/random_sample/random_forest_model.joblib')
try:
    rf_model = joblib.load(model_path)
    print("Random Forest model loaded successfully.")
except Exception as e:
    print("Error loading the Random Forest model:", e)

@app.get("/api/")
def home():
    data = get_home_data()
    return data

@app.get("/api/indcators_list")
def indicator_list():
    indicators = get_indicator_list()
    return indicators

@app.post("/api/local_shap")
async def compute_local_shap(
    request: Request,
    coordinates_request: CoordinatesRequest
):
    coordinates = coordinates_request.coordinates
    
    tif_directory = os.getenv('GEOTIFF_DIRECTORY', '/Users/qasemsafariallahkheili/Downloads/wildfire/predictors')
    predictors = [f for f in os.listdir(tif_directory) if f.endswith(".tif")]
    # Dictionary to store results
    locationinfo_dict = {}

    # Iterate over each GeoTIFF file  
    for tif_file in predictors:
        file_path = os.path.join(tif_directory, tif_file)
        lng = coordinates[0]
        lat = coordinates[1]
        command = f"gdallocationinfo {file_path} -valonly -wgs84 {lng} {lat}"
        # Execute the GDAL command
        try:
            result = subprocess.check_output(command, shell=True, text=True)
            result_float = float(result.strip())
            # Remove ".tif" extension from the filename
            root, _ = os.path.splitext(tif_file)
            locationinfo_dict[root] = result_float

        except subprocess.CalledProcessError as e:
            locationinfo_dict[tif_file] = f"Error: {e}"

    
    try:
        input_df = pd.DataFrame([locationinfo_dict])
        correct_order = ['aspect', 'dem', 'ndvi', 'slope', 'drought_index', 'global_radiation', 'gndvi', 'landcover', 'ndmi', 'precipitation', 'lst']
        # Reorder the columns to match the correct order in randomforest model
        input_df = input_df[correct_order]
        predicted_probability = rf_model.predict_proba(input_df)
        predicted_probability = {
            'probability_not_fire': predicted_probability[0][0],
            'probability_fire': predicted_probability[0][1]
        }

        explainer = shap.TreeExplainer(rf_model)
        shap_values = explainer.shap_values(input_df)

        #shap.force_plot(explainer.expected_value[1], shap_values[1], input_df,  matplotlib=True)

        shap_values_list = {
            'class_not_fire': shap_values[0][0].tolist(),
            'class_fire': shap_values[1][0].tolist()
        }

        # Assign feature names to the SHAP values
        shap_values_dict = {
            'shap_values':{
                'class_not_fire': dict(zip(correct_order, shap_values_list['class_not_fire'])),
                'class_fire': dict(zip(correct_order, shap_values_list['class_fire'])),
            },
        
            'predicted_probability': predicted_probability,
            'raster_values_at_clicked_point': locationinfo_dict
        }

        # Convert to list 
        shap_values_dict['shap_values']['class_not_fire'] = [{feature: value} for feature, value in shap_values_dict['shap_values']['class_not_fire'].items()]
        shap_values_dict['shap_values']['class_fire'] = [{feature: value} for feature, value in shap_values_dict['shap_values']['class_fire'].items()]

        return shap_values_dict
    except:
        return "Please click inside the Area of Interest"
    

@app.post("/api/get_indicatort_data")
async def get_indicatort_data(
    request: Request, 
    indicator_request: IndicatorRequest,
):
    indicator = indicator_request.indicator
    data = get_indicator_data(indicator)
    return data

@app.get("/api/get_histogram")
def get_all_histogram_data():
    tif_directory = "/Users/qasemsafariallahkheili/Downloads/wildfire/predictors"
    # GeoTIFF directory inside the docker
    #tif_directory = "/app/data/forest_fire_predictor"
    tif_files = [file for file in os.listdir(tif_directory) if file.endswith(".tif")]

    all_data = {}
    for tif_file in tif_files:
        file_path = os.path.join(tif_directory, tif_file)
        if os.path.isfile(file_path):
            lidar_dem_im = rioxarray.open_rasterio(file_path, masked=True)

            # Handle NaN values
            values = lidar_dem_im.values.flatten()
            values = values[~np.isnan(values)]

            # Calculate histogram data
            histogram_counts, histogram_values  = np.histogram(values, bins=40)
            data = {"values": histogram_values.tolist(), "counts": histogram_counts.tolist()}

            # Remove ".tif" extension from the filename
            root, _ = os.path.splitext(tif_file)
            all_data[root] = data
            

    return all_data

@app.post("/api/get_geojson")
def get_geojson_data_from_db(
    request: Request, 
    table_request: TableRequest,
):
    tablename = table_request.tablename
    print(tablename)
    geojson = get_geojson_data(tablename)
    return geojson

@app.post("/api/get_zonal_statistics")
def get_zonal_statistics(
    request: Request, 
    predictor_request: PredictorRequest,
):
    predictorName = predictor_request.predictorName
    bbox = predictor_request.bbox
    tif_directory = os.getenv('GEOTIFF_DIRECTORY', '/Users/qasemsafariallahkheili/Downloads/wildfire/predictors/')
    '''
    file_path = tif_directory+predictorName+'.tif'
    command = f"gdalinfo -json -proj4 {file_path} "
    # Execute the GDAL command
    result = subprocess.check_output(command, shell=True, text=True)
    info = json.loads(result)

    dataset = gdal.Open(file_path, gdal.GA_ReadOnly)
    band = dataset.GetRasterBand(1)
    
    geotransform = dataset.GetGeoTransform()

    xinit = info['geoTransform'][0]
    yinit = info['geoTransform'][3]

    xsize =info['geoTransform'][1]
    ysize = info['geoTransform'][5]
    print(geotransform, "geotransform")
    print(info['geoTransform'], "info['geoTransform']")
    p1 = (bbox[0]["minX"], bbox[0]["maxY"]) 
    p2 = (bbox[0]["maxX"], bbox[0]["minY"]) 

    row1 = int((p1[1] - yinit)/ysize)
    col1 = int((p1[0] - xinit)/xsize)

    row2 = int((p2[1] - yinit)/ysize)
    col2 = int((p2[0] - xinit)/xsize)

    data = band.ReadAsArray(col1, row1, col2 - col1 + 1, row2 - row1 + 1)
    #perform come calculations with ...
    mean = np.mean(data)
    max = np.max(data)
    min = np.min(data)
    std = np.std(data)

    res_local = {"mean": float(mean), "max": float(max), "min": float(min), "std": float(std)}


    ##### global statistics
    res_global = {"mean": float(info["bands"][0]["metadata"]['']['STATISTICS_MEAN']), "max": float(info["bands"][0]["metadata"]['']['STATISTICS_MAXIMUM']), "min": float(info["bands"][0]["metadata"]['']['STATISTICS_MINIMUM']), "std": float(info["bands"][0]["metadata"]['']['STATISTICS_STDDEV'])}

    res = {
        "res_local": res_local,
        "res_global": res_global
    }
    
    '''
    return "ok"