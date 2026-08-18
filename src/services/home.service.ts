import { get } from '../components/common/httpClient';
import { GET_AUDIT } from '../constants/apiServiceEndpoint';
import { AuditResponse } from '../types/home.type';
export interface GetAuditServiceParams {
  type: 'viewed' | 'activity';
  page: number;
  page_size?: number;
}

export const getAuditService = async (
  params: GetAuditServiceParams,
): Promise<AuditResponse> => {
  try {
    const { type, ...queryParams } = params;
    const endpointType = type === 'viewed' ? 'view' : 'activity';
    const url = `${GET_AUDIT}/${endpointType}`;
    console.log('Get Audit API:', {
      url,
      queryParams,
    });

    return await get<AuditResponse>(url, {
      params: queryParams,
    });
  } catch (error) {
    console.error('Get Audit API failed:', error);
    throw error;
  }
};
