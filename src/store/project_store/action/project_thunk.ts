import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  CreateProjectResponse,
  CreateProjectThunkParams,
  GetProjectByIdThunkPayload,
  GetProjectsParams,
  GetProjectsResponse,
  ProjectDetails,
  UpdateProjectResponse,
  UpdateProjectThunkPayload,
} from '../../../types/project.type';
import {
  createNewProjectService,
  getProjectByIdService,
  getProjectService,
  updateProjectService,
} from '../../../services/project.service';
import { handleLoading } from '../../auth_store/reducer/auth.reducer';

export const getAllProjectInfo = createAsyncThunk<
  { response: GetProjectsResponse; page: number },
  GetProjectsParams | undefined,
  { rejectValue: string }
>('project/get', async (params, { rejectWithValue }) => {
  try {
    const response = await getProjectService(params);
    console.log(response);
    return { response, page: params?.page || 1 };
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
>(
  'project/getProjectById',
  async ({ projectId, handleSuccess }, { rejectWithValue }) => {
    try {
      const response = await getProjectByIdService(projectId);
      if (response.success) {
        handleSuccess();
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
  },
);
