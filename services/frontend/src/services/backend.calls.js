import { HTTP } from '../utils/http-call';

export async function getTableNames() {
    const response = await HTTP.get("")
    return response.data;
  }

export async function getIndicatorNames() {
  const response = await HTTP.get("/indcators_list")
  return response.data;
}

export async function getIndicatorData(indicator) {
  const response = await HTTP.post("get_indicatort_data", indicator);
  return response.data;
}