from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from os import getenv


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080","http://localhost", "http://193.175.29.219:8080", "http://127.0.0.1", "http://193.175.29.219"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
dbConfig = {
    'host': getenv('DB_HOST', 'localhost'),
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
        AND format_type(a.atttypid, a.atttypmod) LIKE 'geometry%')
        
        select * from table_specification where length(data_type)>0; """
    )
    user = cur.fetchall()
    cur.close()
    conn.close()
    return user
