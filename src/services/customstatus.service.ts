import { get } from '../components/common/httpClient';
import {
  GET_CUSTOMSTATUS,
  GET_USERSTORY_STATUS,
} from '../constants/apiServiceEndpoint';
import {
  GetCustomStatusResponse,
  GetUserStoryStatusResponse,
} from '../types/customstatus.type';

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

export const getUserStoryStatus = async (
  projectId: string,
): Promise<GetUserStoryStatusResponse> => {
  try {
    const url = GET_USERSTORY_STATUS.replace('{project_id}', projectId);

    return await get<GetUserStoryStatusResponse>(url);
  } catch (error) {
    console.error('Get user story status API failed:', error);
    throw error;
  }
};
