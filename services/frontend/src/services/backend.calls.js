import { HTTP } from '../utils/http-call';

export async function getTableNames() {
  try {
      const response = await HTTP.get("/api/get_table_names");
      const transformedData = response.data.map(item => {
          const [name, type, metadata] = item;
          return {
              name,
              type,
              metadata
          };
      });
      return transformedData;
  } catch (error) {
      console.error("Error fetching table names:", error);
      throw error;
  }
}

export async function getIndicatorNames() {
  const response = await HTTP.get("/api/indcators_list")
  return response.data;
}

export async function getIndicatorData(indicator) {
    const response = await HTTP.post(
        "/api/get_indicatort_data",
        {
            "indicator": indicator
        }
    );
    return response.data;
}

export async function getGeoserverCoverageSources() {
  const coveragesList = process.env.VUE_APP_GEOSERVER_URL + "/rest/workspaces/geoxai/coveragestores.json";
    const authHeader = 'Basic ' + btoa(process.env.VUE_APP_GEOSERVER_USERNAME + ':' + process.env.VUE_APP_GEOSERVER_PASSWORD);

    try {
        const response = await fetch(coveragesList, {
            headers: {
                'Accept': 'application/json',
                'Authorization': authHeader,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const geoServerInfo = await response.json();
        return geoServerInfo;
    } catch (error) {
        console.error('Error fetching GeoServer Info:', error);
        // Propagate the error
        throw error;
    }
}

export async function getLocalShapValues (coordinates) {
    const response = await HTTP.post(
        "/api/local_shap",
        {
            "coordinates": coordinates
        }
    );
    return response.data;
}


/*export async function getHistogram() {
    const response = await HTTP.get("/api/get_histogram")
    console.log(response)
    return response;
  }*/

  export async function getGeojsonDataFromDB (tablename) {
    console.log(tablename)
    const response = await HTTP.post(
        "/api/get_geojson",
        {
            "tablename": tablename,
        }
    );
    return response.data;
}
export async function getTableGeojson (tablename) {
    const response = await HTTP.post(
        "/api/get_table_geojson",
        {
            "tablename": tablename,
        }
    );
    return response.data;
}


export async function zonalStatistics (predictorName, bbox) {
    const response = await HTTP.post(
        "/api/get_zonal_statistics",
        {
            "predictorName": predictorName,
            "bbox": bbox
        }
    );
    return response;
}

export async function getMunicipalityNames () {
    const response = await HTTP.get("/api/get_municipality_names")
    return response.data;
}

export async function getTableInstance (municipality) {
    const response = await HTTP.post("/api/get_table_instance",
        {
            "tableName": 'kommunale_gebiete_aoi',
            "instanceId": municipality.id
        }
    )
    return response.data;
}

export async function getShapForBuffer(geojson){
    const response = await HTTP.post("/api/get_shap_bufefr",
        {
            "geojson": geojson,
        }
    )
    return response.data;
}
export async function getShapForPolygon(geojson){
    const response = await HTTP.post("/api/get_shap_polygon",
        {
            "geojson": geojson,
        }
    )
    return response.data;
}
