import { get } from '../components/common/httpClient';
import { GET_ACTIVITIES } from '../constants/apiServiceEndpoint';
import { HomeResponse } from '../types/home.type';

export const getAuditLogService = async (
  params?: Record<string, any>,
): Promise<HomeResponse> => {
  try {
    return await get<HomeResponse>(GET_ACTIVITIES, params);
  } catch (error) {
    console.error('Get Audit Log API failed:', error);
    throw error;
  }
};
