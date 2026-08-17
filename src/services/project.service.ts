import { del, get, patch, post } from '../components/common/httpClient';
import {
  CREATE_PROJECT,
  DELETE_PROJECT,
  GET_PROJECT_BY_ID,
  GET_PROJECTS,
  UPDATE_PROJECT,
} from '../constants/apiServiceEndpoint';
import {
  CreateProjectPayload,
  CreateProjectResponse,
  DeleteProjectResponse,
  GetProjectByIdResponse,
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

export const getProjectByIdService = async (
  projectId: string,
): Promise<GetProjectByIdResponse> => {
  const url = GET_PROJECT_BY_ID.replace('{project_id}', projectId);

  return await get<GetProjectByIdResponse>(url);
};

export const deleteProjectService = async (
  projectId: string,
): Promise<DeleteProjectResponse> => {
  const url = DELETE_PROJECT.replace('{project_id}', projectId);

  return await del<DeleteProjectResponse>(url);
};
