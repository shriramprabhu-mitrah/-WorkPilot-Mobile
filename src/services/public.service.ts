import { get } from '../components/common/httpClient';
import { GET_COUNTRIES } from '../constants/apiServiceEndpoint';
import { GetCountriesResponse } from '../types/auth.type';

export const getCountryService = async (): Promise<GetCountriesResponse> => {
  try {
    return await get<GetCountriesResponse>(GET_COUNTRIES);
  } catch (error) {
    console.error('Get countries API failed:', error);
    throw error;
  }
};
