from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os
import subprocess
import pandas as pd
import joblib
import shap
import numpy as np
from .models import IndicatorRequest
from .models import CoordinatesRequest
from .database import (
    get_home_data,
    get_indicator_list,
    get_indicator_data
)
import matplotlib.pyplot as plt
import rioxarray


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080","http://localhost", "http://194.94.235.195:8080", "http://127.0.0.1:8080", "http://127.0.0.1", "http://194.94.235.195"],
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

@app.get("/")
def home():
    data = get_home_data()
    return data

@app.get("/indcators_list")
def indicator_list():
    indicators = get_indicator_list()
    return indicators

@app.post("/local_shap")
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
    

@app.post("/get_indicatort_data")
async def get_indicatort_data(
    request: Request, 
    indicator_request: IndicatorRequest,
):
    indicator = indicator_request.indicator
    data = get_indicator_data(indicator)
    return data

@app.get("/get_histogram")
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

