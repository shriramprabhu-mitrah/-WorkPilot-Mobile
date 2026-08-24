import { get } from '../components/common/httpClient';
import { GET_CUSTOMSTATUS } from '../constants/apiServiceEndpoint';
import { GetCustomStatusResponse } from '../types/customstatus.type';

export const getCustomStatus = async (
  projectId: string,
): Promise<GetCustomStatusResponse> => {
  try {
    const url = GET_CUSTOMSTATUS.replace('{project_id}', projectId);

    return await get<GetCustomStatusResponse>(url);
  } catch (error) {
    console.error('Get custom status API failed:', error);
    throw error;
  }
};
