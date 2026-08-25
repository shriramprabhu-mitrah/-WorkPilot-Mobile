import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getCustomStatus,
  getUserStoryStatus,
} from '../../../services/customstatus.service';
import {
  GetCustomStatusResponse,
  GetUserStoryStatusResponse,
} from '../../../types/customstatus.type';

export const getCustomStatusData = createAsyncThunk<
  GetCustomStatusResponse,
  { projectId: string },
  { rejectValue: string }
>('project/getCustomStatus', async ({ projectId }, { rejectWithValue }) => {
  try {
    const response = await getCustomStatus(projectId);

    console.log('Custom Status Response:', response);

    return response;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch custom statuses',
    );
  }
});

export const getUserStoryStatusData = createAsyncThunk<
  GetUserStoryStatusResponse,
  { projectId: string },
  { rejectValue: string }
>('project/getUserStoryStatus', async ({ projectId }, { rejectWithValue }) => {
  try {
    const response = await getUserStoryStatus(projectId);

    console.log('User Story Status Response:', response);

    return response;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch user story statuses',
    );
  }
});
