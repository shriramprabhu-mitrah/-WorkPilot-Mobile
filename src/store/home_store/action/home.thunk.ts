import { createAsyncThunk } from '@reduxjs/toolkit';
import { getAuditLogService } from '../../../services/home.service';

export interface GetActivityParams {
  page?: number;
  limit?: number;
  [key: string]: any;
}

export const getActivity = createAsyncThunk(
  'home/getActivity',
  async (params: GetActivityParams = {}, { rejectWithValue }) => {
    try {
      const response = await getAuditLogService(params);
      return response?.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user activities',
      );
    }
  },
);
