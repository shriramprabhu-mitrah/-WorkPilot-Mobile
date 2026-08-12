import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  CreateProjectResponse,
  CreateProjectThunkParams,
  GetProjectsResponse,
} from '../../../types/project.type';
import {
  createNewProjectService,
  getProjectService,
} from '../../../services/project.service';
import { handleLoading } from '../../auth_store/reducer/auth.reducer';

export const getAllProjectInfo = createAsyncThunk<
  GetProjectsResponse,
  void,
  { rejectValue: string }
>('project/get', async (_, { rejectWithValue }) => {
  try {
    const response = await getProjectService();
    return response;
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
