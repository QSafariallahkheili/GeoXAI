import psycopg2
from os import getenv

dbConfig = {
    'host': getenv('POSTGRES_HOST', 'localhost'),
    'port': getenv('POSTGRES_PORT', 5432),
    'dbname': getenv('POSTGRES_DB', 'geoxai'),
    'user': getenv('POSTGRES_USER', 'postgres'),
    'password': getenv('POSTGRES_PASSWORD', '1234')
}

def connect():
    print(dbConfig['host'], dbConfig['dbname'], dbConfig['user'], dbConfig['password'])
    return psycopg2.connect(
    host=dbConfig['host'],
    port=dbConfig['port'], 
    dbname=dbConfig['dbname'], 
    user=dbConfig['user'], 
    password=dbConfig['password'])

def get_home_data():
    conn = connect()
    cur = conn.cursor()
    cur.execute(r"""
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
    data = cur.fetchall()
    cur.close()
    conn.close()
    return data

def get_indicator_list():
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

def get_indicator_data(indicator):
    conn = connect()
    cur = conn.cursor()
    cur.execute(""" select zeit_wert_array from dashboard_data where indikator = '%s'; """ % (indicator,))
    data = cur.fetchall()
    cur.close()
    conn.close()
    return data

def get_geojson_data(tablename):
    conn = connect()
    cur = conn.cursor()
  
    cur.execute("""
        select json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(t.*)::json)
        )
    from (select * from %s where ST_Within(geom, ST_Transform(ST_Buffer(ST_Transform(ST_SetSRID(ST_Point(13.056074,52.400586), 4326), 3857), 3000), 4326))) as t
        ;""" %(tablename))
    user = cur.fetchall()[0][0]
    cur.close()
    conn.close()
    return user