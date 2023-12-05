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
  const response = await HTTP.post("get_indicatort_data", indicator);
  return response.data;
}

export async function getGeoserverCoverageSources() {
  const coveragesList = process.env.VUE_APP_GEOSERVER_URL + "/rest/workspaces/brandenburg/coveragestores/raster_sources/coverages";
    const authHeader = 'Basic ' + btoa(process.env.VUE_APP_GEOSERVER_USERNAME + ':' + process.env.VUE_APP_GEOSERVER_PASSWORD);

    const formatObject = originalObject => {
        // Check if originalObject is an array and has a map function
        if (Array.isArray(originalObject) && originalObject.map) {
            return originalObject.map(item => {
                const { name, metadata } = item;
                return {
                    name,
                    type: "Raster",
                    metadata
                };
            });
        } else {
            console.error('Unexpected structure returned from GeoServer:', originalObject);
            return [];
        }
    };

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
        const formattedInfo = formatObject(geoServerInfo.coverages.coverage);

        return formattedInfo;
    } catch (error) {
        console.error('Error fetching GeoServer Info:', error);
        // Propagate the error
        throw error;
    }
}



