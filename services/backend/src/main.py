from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from os import getenv


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://193.175.29.219:8080","http://193.175.29.219"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
dbConfig = {
    'host': getenv('DB_HOST', 'brandenburg_db'),
    'port': getenv('DB_PORT', 5432),
    'dbname': getenv('DB_NAME', 'brandenburg'),
    'user': getenv('DB_USER', 'postgres'),
    'password': getenv('DB_PASSWORD', '1234')
}

def connect():
  return psycopg2.connect(
    host='brandenburg_db',
    port=5432, 
    dbname='brandenburg', 
    user='postgres', 
    password='1234')
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
