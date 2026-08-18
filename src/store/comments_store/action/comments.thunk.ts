import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  GetUserStoryCommentsParams,
  GetUserStoryCommentsResponse,
} from '../../../types/comments.type';
import { getUserStoryCommentsService } from '../../../services/comments.services';

export const fetchUserStoryComments = createAsyncThunk<
  GetUserStoryCommentsResponse,
  GetUserStoryCommentsParams,
  { rejectValue: string }
>('comments/fetchUserStoryComments', async (params, { rejectWithValue }) => {
  try {
    if (!params.projectId || !params.userStoryId) {
      return rejectWithValue(
        'Cannot fetch comments: Invalid projectId or userStoryId',
      );
    }
    const response = await getUserStoryCommentsService(params);
    return response;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to fetch user story comments';
    return rejectWithValue(errorMessage);
  }
});
