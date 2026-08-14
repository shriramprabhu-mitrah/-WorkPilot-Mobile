import { get } from '../components/common/httpClient';
import { GET_AUDIT } from '../constants/apiServiceEndpoint';
import { AuditResponse } from '../types/home.type';

export interface GetAuditServiceParams {
  type: 'viewed' | 'activity';
  page?: number;
  page_size?: number;
}

export const getAuditService = async (
  params?: Record<string, any>,
): Promise<AuditResponse> => {
  try {
    const { type, ...queryParams } = params || {};

    // Map 'viewed' to 'view' endpoint segment
    const endpointType = type === 'viewed' ? 'view' : 'activity';
    const url = `${GET_AUDIT}/${endpointType}`;

    return await get<AuditResponse>(url, queryParams);
  } catch (error) {
    console.error('Get Audit API failed:', error);
    throw error;
  }
};
