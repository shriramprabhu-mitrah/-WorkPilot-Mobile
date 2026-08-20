import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  CreateTaskCommentParams,
  CreateTaskCommentResponse,
  DeleteCommentParams,
  DeleteCommentResponse,
  GetTaskCommentRepliesParams,
  GetTaskCommentsParams,
  GetTaskCommentsResponse,
  GetUserStoryCommentsParams,
  GetUserStoryCommentsResponse,
  UpdateCommentParams,
  UpdateCommentResponse,
} from '../../../types/comments.type';
import {
  createTaskCommentService,
  deleteTaskCommentService,
  getTaskCommentRepliesService,
  getTaskCommentsService,
  getUserStoryCommentsService,
  updateCommentService,
} from '../../../services/comments.services';

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
    console.log('25', response);
    return response;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to fetch user story comments';
    return rejectWithValue(errorMessage);
  }
});

export const createTaskComment = createAsyncThunk<
  CreateTaskCommentResponse,
  CreateTaskCommentParams,
  { rejectValue: string }
>('comments/createTaskComment', async (params, { rejectWithValue }) => {
  try {
    if (!params.taskId) {
      return rejectWithValue('Cannot create comment: Invalid taskId');
    }
    const response = await createTaskCommentService(params);
    console.log('Response', response);
    return response;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to create task comment';
    return rejectWithValue(errorMessage);
  }
});

export const fetchTaskComments = createAsyncThunk<
  GetTaskCommentsResponse,
  GetTaskCommentsParams,
  { rejectValue: string }
>('comments/fetchTaskComments', async (params, { rejectWithValue }) => {
  try {
    if (!params.taskId) {
      return rejectWithValue('Cannot fetch comments: Invalid taskId');
    }
    const response = await getTaskCommentsService(params);
    console.log('Task Comments API Response:', response);
    return response;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to fetch task comments';
    return rejectWithValue(errorMessage);
  }
});

export const updateTaskComment = createAsyncThunk<
  UpdateCommentResponse,
  UpdateCommentParams,
  { rejectValue: string }
>('comments/updateTaskComment', async (params, { rejectWithValue }) => {
  try {
    if (!params.taskId || !params.commentId) {
      return rejectWithValue(
        'Cannot update comment: Missing taskId or commentId',
      );
    }
    if (!params.content.trim()) {
      return rejectWithValue('Cannot update comment: Content cannot be empty');
    }
    const response = await updateCommentService(params);
    console.log('Update Comment API Response:', response);
    return response;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to update comment';
    return rejectWithValue(errorMessage);
  }
});

export const deleteTaskComment = createAsyncThunk<
  DeleteCommentResponse,
  DeleteCommentParams,
  { rejectValue: string }
>('comments/deleteTaskComment', async (params, { rejectWithValue }) => {
  try {
    if (!params.taskId || !params.commentId) {
      return rejectWithValue(
        'Cannot delete comment: Missing taskId or commentId',
      );
    }
    const response = await deleteTaskCommentService(params);
    console.log('Delete Comment API Response:', response);
    return response;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to delete comment';
    return rejectWithValue(errorMessage);
  }
});

export const fetchTaskCommentReplies = createAsyncThunk<
  GetTaskCommentsResponse,
  GetTaskCommentRepliesParams,
  { rejectValue: string }
>('comments/fetchTaskCommentReplies', async (params, { rejectWithValue }) => {
  try {
    const response = await getTaskCommentRepliesService(params);
    return response;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to fetch comment replies';
    return rejectWithValue(errorMessage);
  }
});
