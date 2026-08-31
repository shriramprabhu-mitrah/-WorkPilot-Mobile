import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getAuditService,
  getUserInsights,
  globalSearch,
} from '../../../services/home.service';
import { SearchResponse, UserInsightsResponse } from '../../../types/home.type';

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

export const globalSearchData = createAsyncThunk<
  SearchResponse,
  { query: string },
  { rejectValue: string }
>('search/globalSearch', async ({ query }, { rejectWithValue }) => {
  try {
    const response = await globalSearch(query);

    console.log('Global Search Response:', response);

    return response;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch search results',
    );
  }
});

export const getUserInsightsData = createAsyncThunk<
  UserInsightsResponse,
  void,
  { rejectValue: string }
>('home/getUserInsights', async (_, { rejectWithValue }) => {
  try {
    const response = await getUserInsights();

    console.log('User Insights Response:', response);

    return response;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch user insights',
    );
  }
});
