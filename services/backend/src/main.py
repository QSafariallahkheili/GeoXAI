from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from os import getenv
import os
import subprocess
import json

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080","http://localhost", "http://193.175.29.219:8080", "http://127.0.0.1", "http://193.175.29.219", "http://tv4-geo.innowest-brandenburg.de:8080", "http://tv4-geo.innowest-brandenburg.de"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
dbConfig = {
    'host': getenv('POSTGRES_HOST', 'localhost'),
    'port': getenv('POSTGRES_PORT', 5432),
    'dbname': getenv('POSTGRES_DB', 'brandenburg'),
    'user': getenv('POSTGRES_USER', 'postgres'),
    'password': getenv('POSTGRES_PASSWORD', '1234')
}

def connect():
    
    return psycopg2.connect(
    host=dbConfig['host'],
    port=dbConfig['port'], 
    dbname=dbConfig['dbname'], 
    user=dbConfig['user'], 
    password=dbConfig['password'])
@app.get("/")
def home():
    conn = connect()
    cur = conn.cursor()
    cur.execute(""" 
        with table_specification as (SELECT 
            t.table_name,
            regexp_replace(
                regexp_replace(format_type(a.atttypid, a.atttypmod),'[0-9\(\)]+','', 'g'),
                'geometry|,',
                '',
                'g'
            ) AS data_type
        FROM 
            information_schema.tables t
        JOIN 
            pg_attribute a ON t.table_name = a.attrelid::regclass::text
        WHERE 
            t.table_schema = 'public'
        AND format_type(a.atttypid, a.atttypmod) LIKE 'geometry%'
	    ),
        metadata AS (
            select * from metadata
        )
            SELECT ts.table_name, ts.data_type, m.details
            FROM table_specification ts
            LEFT JOIN metadata m ON ts.table_name = m.table_name  where length(ts.data_type)>0;"""
    )
    user = cur.fetchall()
    cur.close()
    conn.close()
    return user

@app.get("/indcators_list")
def indicator_list():
    conn = connect()
    cur = conn.cursor()
    cur.execute(""" 
    select json_agg(distinct indikator) from dashboard_data; 
       """
    )
    indicators = cur.fetchall()[0][0]
    cur.close()
    conn.close()
    return indicators


@app.post("/get_indicatort_data")
async def get_indicatort_data(request: Request):
    indicator = await request.json()
    conn = connect()
    cur = conn.cursor()
    cur.execute(""" 
    select zeit_wert_array from dashboard_data where indikator = '%s';
       """ % (indicator,)
    )
    indicators = cur.fetchall()
    cur.close()
    conn.close()
    return indicators

@app.get("/local_shap")
async def compute_local_shap():
    # Create a temporary file to save the uploaded GeoTIFF
    tif_directory = "/Users/qasemsafariallahkheili/Downloads/wildfire/predictors"
    # List all GeoTIFF files in the specified directory
    predictors = [f for f in os.listdir(tif_directory) if f.endswith(".tif")]
    # Dictionary to store results
    locationinfo_dict = {}

    # Iterate over each GeoTIFF file  
    for tif_file in predictors:
        file_path = os.path.join(tif_directory, tif_file)
        lng = 11.61214
        lat = 52.44401
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
    
    
    return locationinfo_dict
