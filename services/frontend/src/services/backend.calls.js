import { HTTP } from '../utils/http-call';

export async function getTableNames() {
  try {
      const response = await HTTP.get("");
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
  const response = await HTTP.get("/indcators_list")
  return response.data;
}

export async function getIndicatorData(indicator) {
    const response = await HTTP.post(
        "get_indicatort_data",
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
        "local_shap",
        {
            "coordinates": coordinates
        }
    );
    return response.data;
}


/*export async function getHistogram() {
    const response = await HTTP.get("/get_histogram")
    console.log(response)
    return response;
  }*/

  export async function getGeojsonDataFromDB (tablename) {
    console.log(tablename)
    const response = await HTTP.post(
        "get_geojson",
        {
            "tablename": tablename,
        }
    );
    return response.data;
}

export async function zonalStatistics (predictorName, bbox) {
    const response = await HTTP.post(
        "get_zonal_statistics",
        {
            "predictorName": predictorName,
            "bbox": bbox
        }
    );
    return response;
}