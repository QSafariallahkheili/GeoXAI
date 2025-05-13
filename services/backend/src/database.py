import psycopg2
from os import getenv
import json

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
def get_table_geojson(tablename):
    conn = connect()
    cur = conn.cursor()
  
    cur.execute("""
                SELECT json_build_object(
            'type', 'FeatureCollection',
            'features', json_agg(
                json_build_object(
                    'type', 'Feature',
                    'geometry', ST_AsGeoJSON(t.geom)::json,
                    'properties', to_jsonb(t) - 'geom'
                )
            )
        )
    from "%s" as t
        ;""" %(tablename))
    user = cur.fetchall()[0][0]
    cur.close()
    conn.close()
    return user

def get_municipality_names():
    conn = connect()
    cur = conn.cursor()
    cur.execute(""" select distinct(name), ogc_fid from kommunale_gebiete_aoi; """)
    data = cur.fetchall()
    cur.close()
    conn.close()
    return data 

def get_single_geom_instance(tablename, instanceId):
    conn = connect()
    cur = conn.cursor()
    cur.execute("""
        SELECT json_build_object(
            'type', 'FeatureCollection',
            'features', json_agg(
                json_build_object(
                    'type', 'Feature',
                    'geometry', ST_AsGeoJSON(t.geom)::json,
                    'properties', to_jsonb(t) - 'geom'
                )
            )
        )
    from (select * from %s where ogc_fid = %s) as t
        ;""" %(tablename,instanceId,))
    user = cur.fetchall()[0]
    cur.close()
    conn.close()
    return user

def get_shap_per_table_for_municipality( instanceId):
    conn = connect()
    cur = conn.cursor()
    tables = [
        "aspect", "dem", "ndvi", "slope", "drought_index",
        "global_radiation", "gndvi", "landcover", "ndmi",
        "precipitation", "lst"
    ]
    result = {}
    for table in tables:
        sql = f"""
            SELECT 
                AVG(t.value) AS value,
                AVG(t.shap) AS shap
            FROM {table} t,
                (SELECT * FROM kommunale_gebiete_aoi WHERE ogc_fid = %s) AS aoi
            WHERE ST_Intersects(t.geom, aoi.geom)
        """
        cur.execute(sql, (instanceId,))
        row = cur.fetchone()
        result[table] = {
            "value": row[0] if row and row[0] is not None else None,
            "shap": row[1] if row and row[1] is not None else None
        }
    sql1 = f"""
            SELECT 
                AVG(t.value) AS value
            FROM fire_susceptibility t,
                (SELECT * FROM kommunale_gebiete_aoi WHERE ogc_fid = %s) AS aoi
            WHERE ST_Intersects(t.geom, aoi.geom)
        """
    cur.execute(sql1, (instanceId,))
    row = cur.fetchone()
    result["ffs"] = {
        "value": row[0] if row and row[0] is not None else None,
    }
    cur.close()
    conn.close()
    return result

def get_shap_per_table_for_buffer(geojson, srid=4326):
    conn = connect()
    cur = conn.cursor()
    geojson_str = json.dumps(geojson)  # ✅ Convert to string
    
    tables = [
        "aspect", "dem", "ndvi", "slope", "drought_index",
        "global_radiation", "gndvi", "landcover", "ndmi",
        "precipitation", "lst"
    ]
    result = {}

    for table in tables:
        sql = f"""
            SELECT 
                AVG(t.value) AS value,
                AVG(t.shap) AS shap
            FROM {table} t
            WHERE ST_Intersects(
                t.geom,
                ST_SetSRID(ST_GeomFromGeoJSON(%s), %s)
            )
        """
        cur.execute(sql, (geojson_str, srid))  # ✅ Use the string
        row = cur.fetchone()
        result[table] = {
            "value": row[0] if row and row[0] is not None else None,
            "shap": row[1] if row and row[1] is not None else None
        }

    sql1 = f"""
        SELECT 
            AVG(t.value) AS value
        FROM fire_susceptibility t
        WHERE ST_Intersects(
            t.geom,
            ST_SetSRID(ST_GeomFromGeoJSON(%s), %s)
        )
    """
    cur.execute(sql1, (geojson_str, srid))  # ✅ Use the string
    row = cur.fetchone()
    result["ffs"] = {
        "value": row[0] if row and row[0] is not None else None,
    }

    cur.close()
    conn.close()
    return result