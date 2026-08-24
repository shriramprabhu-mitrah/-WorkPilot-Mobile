import { createAsyncThunk } from '@reduxjs/toolkit';
import { getCustomStatus } from '../../../services/customstatus.service';
import { GetCustomStatusResponse } from '../../../types/customstatus.type';

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
