import { get, patch, post } from '../components/common/httpClient';
import {
  CREATE_PROJECT,
  GET_PROJECTS,
  UPDATE_PROJECT,
} from '../constants/apiServiceEndpoint';
import {
  CreateProjectPayload,
  CreateProjectResponse,
  GetProjectsParams,
  GetProjectsResponse,
  UpdateProjectPayload,
  UpdateProjectResponse,
} from '../types/project.type';

export const getProjectService = async (
  params?: GetProjectsParams,
): Promise<GetProjectsResponse> => {
  try {
    return await get<GetProjectsResponse>(GET_PROJECTS, { params });
  } catch (error) {
    console.error('Get Projects API failed:', error);
    throw error;
  }
};

export const createNewProjectService = async (
  payload: CreateProjectPayload,
): Promise<CreateProjectResponse> => {
  return await post<CreateProjectResponse>(CREATE_PROJECT, payload);
};

export const updateProjectService = async (
  projectId: string,
  payload: UpdateProjectPayload,
): Promise<UpdateProjectResponse> => {
  const url = UPDATE_PROJECT.replace('{project_id}', projectId);

  return await patch<UpdateProjectResponse, UpdateProjectPayload>(url, payload);
};
