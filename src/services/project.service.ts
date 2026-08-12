import { get, post } from '../components/common/httpClient';
import { CREATE_PROJECT, GET_PROJECTS } from '../constants/apiServiceEndpoint';
import {
  CreateProjectPayload,
  CreateProjectResponse,
  GetProjectsResponse,
} from '../types/project.type';

export const getProjectService = async (): Promise<GetProjectsResponse> => {
  try {
    return await get<GetProjectsResponse>(GET_PROJECTS);
  } catch (error) {
    console.error('Get User API failed:', error);
    throw error;
  }
};

export const createNewProjectService = async (
  payload: CreateProjectPayload,
): Promise<CreateProjectResponse> => {
  return await post<CreateProjectResponse>(CREATE_PROJECT, payload);
};
