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
  const coveragesList = process.env.VUE_APP_GEOSERVER_URL + "/rest/workspaces/brandenburg/coveragestores.json";
    const authHeader = 'Basic ' + btoa('admin' + ':' + 'geoserver');

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


