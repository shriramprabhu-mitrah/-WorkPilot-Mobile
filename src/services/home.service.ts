import { get } from '../components/common/httpClient';
import {
  GET_AUDIT,
  GET_INSIGHTS,
  GLOBAL_SEARCH,
} from '../constants/apiServiceEndpoint';
import {
  AuditResponse,
  SearchResponse,
  UserInsightsResponse,
} from '../types/home.type';
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

export const globalSearch = async (query: string): Promise<SearchResponse> => {
  try {
    return await get<SearchResponse>(GLOBAL_SEARCH, {
      params: {
        q: query,
      },
    });
  } catch (error) {
    console.error('Global search API failed:', error);
    throw error;
  }
};

export const getUserInsights = async (): Promise<UserInsightsResponse> => {
  try {
    return await get<UserInsightsResponse>(GET_INSIGHTS);
  } catch (error) {
    console.error('Get user insights API failed:', error);
    throw error;
  }
};
