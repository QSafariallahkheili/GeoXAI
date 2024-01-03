from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from os import getenv
import os
import subprocess
import json
import pandas as pd
import joblib
import shap
import numpy as np
from dataclasses import dataclass
from .models import IndicatorRequest
from .models import CoordinatesRequest
from .database import (
    get_home_data,
    get_indicator_list,
    get_indicator_data
)


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080","http://localhost", "http://193.175.29.219:8080", "http://127.0.0.1", "http://193.175.29.219", "http://tv4-geo.innowest-brandenburg.de:8080", "http://tv4-geo.innowest-brandenburg.de"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

rf_model = joblib.load('/Users/qasemsafariallahkheili/Downloads/wildfire/sample/random_sample/random_forest_model.joblib')



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
    
    # Create a temporary file to save the uploaded GeoTIFF
    tif_directory = "/Users/qasemsafariallahkheili/Downloads/wildfire/predictors"
    # List all GeoTIFF files in the specified directory
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

       
    input_df = pd.DataFrame([locationinfo_dict])
    correct_order = ['aspect', 'dem', 'ndvi', 'slope', 'drought_index', 'global_radiation', 'gndvi', 'landcover', 'ndmi', 'precipitation', 'lst']
    # Reorder the columns to match the correct order in randomforest model
    input_df = input_df[correct_order]

    predicted_probabilities = rf_model.predict_proba(input_df)
    print(predicted_probabilities)
    
    explainer = shap.TreeExplainer(rf_model)
    shap_values = explainer.shap_values(input_df)
    print(shap_values[0])
    #shap.force_plot(explainer.expected_value[1], shap_values[1], input_df,  matplotlib=True)

    # SHAP numpy array to list
    shap_values_list = {
        'class_not_fire': np.array(shap_values[0]).tolist(),
        'class_fire':np.array(shap_values[1]).tolist()
    }


    
    return shap_values_list

@app.post("/get_indicatort_data")
async def get_indicatort_data(
    request: Request, 
    indicator_request: IndicatorRequest,
):
    indicator = indicator_request.indicator
    data = get_indicator_data(indicator)
    return data
