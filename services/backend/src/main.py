from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from os import getenv


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
dbConfig = {
    'host': getenv('DB_HOST', 'brandenburg_db'),
    'port': getenv('DB_PORT', 5432),
    'dbname': getenv('DB_NAME', 'brandenburg'),
    'user': getenv('DB_USER', 'berlinberlin'),
    'password': getenv('DB_PASSWORD', '1234')
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
    cur.execute("""select table_name from information_schema.columns where column_name = 'geom'
        AND table_name NOT in ('bike_network', 'counties_daily', 'drive_network', 'parcel', 'building', 'walk_network', 'geocoded_address', 'counties', 'pop', 'elbvertiefung',	'bezirke', 'gemarkungen', 'stadtteile', 'statistischegebiete')  """)
    user = cur.fetchall()
    cur.close()
    conn.close()
    return user
