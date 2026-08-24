import { del, get, patch, post } from '../components/common/httpClient';
import {
  CREATE_PROJECT,
  DELETE_PROJECT,
  GET_PROJECT_BY_ID,
  GET_PROJECTS,
  GET_USERSTORY,
  GET_RECENT_PROJECTS,
  GET_USERSTORY_BY_ID,
  GET_TASK_BY_ID,
  UPDATE_PROJECT,
  UPDATE_USER_STORY,
} from '../constants/apiServiceEndpoint';
import {
  CreateProjectPayload,
  CreateProjectResponse,
  DeleteProjectResponse,
  GetBurnbownParams,
  GetBurndownResponse,
  GetProjectByIdResponse,
  GetProjectsParams,
  GetProjectsResponse,
  GetRecentProjectResponse,
  GetTaskByIdParams,
  GetTaskByIdResponse,
  GetUserStoriesPayload,
  GetUserStoriesResponse,
  GetUserStoryByIdParams,
  GetUserStoryByIdResponse,
  UpdateProjectPayload,
  UpdateProjectResponse,
  UpdateUserStoryPayload,
  UpdateUserStoryResponse,
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

export const recentProjectService =
  async (): Promise<GetRecentProjectResponse> => {
    try {
      return await get<GetRecentProjectResponse>(GET_RECENT_PROJECTS);
    } catch (error) {
      console.error('Get Recent Projects API failed:', error);

      throw error;
    }
  };

export const getUserStorieService = async (
  projectId: string,
  payload?: GetUserStoriesPayload,
): Promise<GetUserStoriesResponse> => {
  try {
    const url = GET_USERSTORY.replace('{project_id}', projectId);

    const cleanedParams = payload
      ? Object.fromEntries(
          Object.entries(payload)
            .filter(([_, val]) => val !== undefined && val !== '--')
            .map(([key, val]) => [key, val === null ? 'null' : val]),
        )
      : undefined;

    return await get<GetUserStoriesResponse>(url, { params: cleanedParams });
  } catch (error) {
    console.error('Get User Stories API failed:', error);
    throw error;
  }
};

export const getUserStoryByIdService = async ({
  projectId,
  userStoryId,
}: GetUserStoryByIdParams): Promise<GetUserStoryByIdResponse> => {
  try {
    const url = GET_USERSTORY_BY_ID.replace('{project_id}', projectId).replace(
      '{user_story_id}',
      userStoryId,
    );

    return await get<GetUserStoryByIdResponse>(url);
  } catch (error) {
    console.error('Get User Story By ID API failed:', error);
    throw error;
  }
};

export const getTaskByIdService = async ({
  projectId,
  taskId,
}: GetTaskByIdParams): Promise<GetTaskByIdResponse> => {
  try {
    const url = GET_TASK_BY_ID.replace('{project_id}', projectId).replace(
      '{task_id}',
      taskId,
    );
    return await get<GetTaskByIdResponse>(url);
  } catch (error) {
    console.error('Get Task By ID API failed:', error);
    throw error;
  }
};
export const updateUserStoryService = async (
  projectId: string,
  userStoryId: string,
  payload: UpdateUserStoryPayload,
): Promise<UpdateUserStoryResponse> => {
  const url = UPDATE_USER_STORY.replace('{project_id}', projectId).replace(
    '{user_story_id}',
    userStoryId,
  );

  return await patch<UpdateUserStoryResponse, UpdateUserStoryPayload>(
    url,
    payload,
  );
};

export const getBurndownChartService = async ({
  projectId,
  sprintId,
}: GetBurnbownParams): Promise<GetBurndownResponse> => {
  try {
    const url = GET_BURNDOWN_BY_PROJECT_SPRINT.replace(
      '{project_id}',
      projectId,
    ).replace('{sprint_id}', sprintId);
    return await get<GetBurndownResponse>(url);
  } catch (error) {
    console.error('Get burn down chart API failed:', error);
    throw error;
  }
};
