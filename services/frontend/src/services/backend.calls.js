import { HTTP } from '../utils/http-call';

export async function getTableNames() {
    const response = await HTTP.get("")
    return response.data;
  }