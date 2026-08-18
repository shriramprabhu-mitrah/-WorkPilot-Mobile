import { createAsyncThunk } from '@reduxjs/toolkit';
import { getAuditService } from '../../../services/home.service';

export interface GetAuditParams {
  type: 'viewed' | 'activity';
  page: number;
  page_size?: number;
}

export const getAudit = createAsyncThunk(
  'home/getAudit',
  async (params: GetAuditParams, { rejectWithValue }) => {
    try {
      const response = await getAuditService(params);

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || 'Failed to fetch audit data',
      );
    }
  },
);
