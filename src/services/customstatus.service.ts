import { del, get, post, put } from '../components/common/httpClient';
import {
  CREATE_CUSTOMSTATUS,
  UPDATE_CUSTOMSTATUS,
  DELETE_CUSTOMSTATUS,
  CREATE_US_STATUS,
  UPDATE_US_STATUS,
  DELETE_US_STATUS,
  GET_CUSTOMSTATUS,
  GET_USERSTORY_STATUS,
} from '../constants/apiServiceEndpoint';
import {
  GetCustomStatusResponse,
  GetUserStoryStatusResponse,
  StatusMutationArgs,
  StatusMutationPayload,
  StatusMutationResponse,
} from '../types/customstatus.type';

const statusUrl = (endpoint: string, projectId: string, statusId?: string) =>
  endpoint
    .replace('{project_id}', projectId)
    .replace('{status_id}', statusId ?? '');

export const createCustomStatus = ({
  project_id,
  ...payload
}: StatusMutationArgs) =>
  post<StatusMutationResponse, StatusMutationPayload>(
    statusUrl(CREATE_CUSTOMSTATUS, project_id),
    payload,
  );
export const updateCustomStatus = ({
  project_id,
  status_id,
  ...payload
}: StatusMutationArgs) =>
  put<StatusMutationResponse, StatusMutationPayload>(
    statusUrl(UPDATE_CUSTOMSTATUS, project_id, status_id),
    payload,
  );
export const deleteCustomStatus = (projectId: string, statusId: string) =>
  del<StatusMutationResponse>(
    statusUrl(DELETE_CUSTOMSTATUS, projectId, statusId),
  );

export const createUserStoryStatus = ({
  project_id,
  ...payload
}: StatusMutationArgs) =>
  post<StatusMutationResponse, StatusMutationPayload>(
    statusUrl(CREATE_US_STATUS, project_id),
    payload,
  );
export const updateUserStoryStatus = ({
  project_id,
  status_id,
  ...payload
}: StatusMutationArgs) =>
  put<StatusMutationResponse, StatusMutationPayload>(
    statusUrl(UPDATE_US_STATUS, project_id, status_id),
    payload,
  );
export const deleteUserStoryStatus = (projectId: string, statusId: string) =>
  del<StatusMutationResponse>(statusUrl(DELETE_US_STATUS, projectId, statusId));

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
