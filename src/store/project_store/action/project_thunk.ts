import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  CreateProjectResponse,
  CreateProjectThunkParams,
  DeleteProjectPayload,
  GetProjectByIdThunkPayload,
  GetProjectsParams,
  GetProjectsResponse,
  GetUserStoriesResponse,
  GetUserStorieThunkArgs,
  GetRecentProjectResponse,
  GetSprintByIdParams,
  GetSprintByIdResponse,
  GetSprintResponse,
  GetSprintsParams,
  GetUserStoryByIdParams,
  GetUserStoryByIdResponse,
  ProjectDetails,
  RecentProject,
  UpdateProjectResponse,
  UpdateProjectThunkPayload,
  GetTaskByIdResponse,
  GetTaskByIdParams,
} from '../../../types/project.type';
import {
  createNewProjectService,
  deleteProjectService,
  getProjectByIdService,
  getProjectService,
  getUserStorieService,
  recentProjectService,
  getUserStoryByIdService,
  updateProjectService,
  getTaskByIdService,
} from '../../../services/project.service';
import { handleLoading } from '../../auth_store/reducer/auth.reducer';
import { getSprintById, getSprints } from '../../../services/sprint.service';
// import { RecentProject } from '../../../data/projectDetailScreenData';

export const getAllProjectInfo = createAsyncThunk<
  { response: GetProjectsResponse; page: number },
  GetProjectsParams | undefined,
  { rejectValue: string }
>('project/get', async (params, { rejectWithValue }) => {
  try {
    const response = await getProjectService(params);
    console.log(response);
    return { response, page: params?.page || 1, include_sprints: true };
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch projects',
    );
  }
});

export const createNewProject = createAsyncThunk<
  CreateProjectResponse,
  CreateProjectThunkParams,
  {
    rejectValue: string;
  }
>(
  'project/create',
  async (
    { payload, showSuccessToast, handleSuccess },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const response = await createNewProjectService(payload);
      console.log('Create Project Response:', response);
      if (response.success) {
        showSuccessToast?.(
          response.message || 'Project created successfully',
          'success',
        );
        handleSuccess?.();
        return response;
      }
      return rejectWithValue(response.message || 'Failed to create project');
    } catch (error: any) {
      showSuccessToast?.(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to create project',
        'error',
      );
      return rejectWithValue(error?.message || 'Failed to create project');
    } finally {
      dispatch(handleLoading(false));
    }
  },
);

export const updateProject = createAsyncThunk<
  UpdateProjectResponse,
  UpdateProjectThunkPayload,
  {
    rejectValue: string;
  }
>(
  'project/updateProject',
  async (
    { projectId, payload, onSuccess, onError, onFinally },
    { rejectWithValue },
  ) => {
    try {
      const response = await updateProjectService(projectId, payload);
      onSuccess?.(response.message);
      return response;
    } catch (error: any) {
      onError?.(error?.response?.data?.message || 'Failed to update project');
      return rejectWithValue(
        error?.response?.data?.message || 'Failed to update project',
      );
    } finally {
      onFinally?.();
    }
  },
);

export const getProjectById = createAsyncThunk<
  ProjectDetails,
  GetProjectByIdThunkPayload,
  { rejectValue: string }
>('project/getProjectById', async ({ projectId }, { rejectWithValue }) => {
  try {
    const response = await getProjectByIdService(projectId);
    if (response.success) {
      // handleSuccess();
      return response.data;
    }
    return rejectWithValue(response.message || 'Failed to retrieve project');
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message ||
        error?.message ||
        'Failed to retrieve project',
    );
  }
});

export const deleteProject = createAsyncThunk(
  'project/deleteProject',
  async (
    { projectId, onSuccess, onError, onFinally }: DeleteProjectPayload,
    { rejectWithValue },
  ) => {
    try {
      const data = await deleteProjectService(projectId);
      const successMessage = data?.message || 'Project deleted successfully';
      onSuccess?.(successMessage);

      return { projectId, data };
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete project';

      onError?.(errorMessage);
      return rejectWithValue(errorMessage);
    } finally {
      onFinally?.();
    }
  },
);

export const getUserStorie = createAsyncThunk<
  { response: GetUserStoriesResponse; page: number },
  GetUserStorieThunkArgs,
  { rejectValue: string }
>(
  'project/user-stories',
  async ({ projectId, payload }, { rejectWithValue }) => {
    try {
      const response = await getUserStorieService(projectId, payload);
      console.log(response);
      return { response, page: payload?.page || 1 };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user stories',
      );
    }
  },
);

export const getSprintsThunk = createAsyncThunk<
  GetSprintResponse,
  GetSprintsParams,
  { rejectValue: string }
>('sprints/getSprints', async (params, { rejectWithValue }) => {
  try {
    const response = await getSprints(params);

    return response;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message ||
        error?.message ||
        'Failed to get sprints',
    );
  }
});

export const getSprintByIdThunk = createAsyncThunk<
  GetSprintByIdResponse,
  GetSprintByIdParams,
  { rejectValue: string }
>('sprints/getSprintById', async (params, { rejectWithValue }) => {
  try {
    const response = await getSprintById(params);

    return response;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message ||
        error?.message ||
        'Failed to get sprint',
    );
  }
});

export const getRecentProjects = createAsyncThunk<
  RecentProject[],
  void,
  {
    rejectValue: string;
  }
>('projects/recentProjects', async (_, { rejectWithValue }) => {
  try {
    const response = await recentProjectService();

    return response.data.project;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message ||
        error?.message ||
        'Failed to get recent projects',
    );
  }
});

export const getUserStoryById = createAsyncThunk<
  GetUserStoryByIdResponse,
  GetUserStoryByIdParams,
  { rejectValue: string }
>('project/user-story-by-id', async (params, { rejectWithValue }) => {
  try {
    const response = await getUserStoryByIdService(params);
    console.log(response);
    return response;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch user story details',
    );
  }
});

export const getTaskById = createAsyncThunk<
  GetTaskByIdResponse,
  GetTaskByIdParams,
  { rejectValue: string }
>('project/task-by-id', async (params, { rejectWithValue }) => {
  try {
    const response = await getTaskByIdService(params);
    console.log(response);
    return response;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch task details',
    );
  }
});
