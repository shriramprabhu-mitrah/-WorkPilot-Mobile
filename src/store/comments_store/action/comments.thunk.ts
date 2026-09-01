import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  CreateTaskCommentParams,
  CreateTaskCommentResponse,
  CreateUserStoryCommentParams,
  CreateUserStoryCommentResponse,
  DeleteCommentParams,
  DeleteCommentResponse,
  DeleteUserStoryCommentParams,
  DeleteUserStoryCommentResponse,
  GetTaskCommentRepliesParams,
  GetTaskCommentsParams,
  GetTaskCommentsResponse,
  GetUserStoryCommentByIdParams,
  GetUserStoryCommentByIdResponse,
  GetUserStoryCommentRepliesParams,
  GetUserStoryCommentRepliesResponse,
  GetUserStoryCommentsParams,
  GetUserStoryCommentsResponse,
  UpdateCommentParams,
  UpdateCommentResponse,
  UpdateUserStoryCommentParams,
  UpdateUserStoryCommentResponse,
} from '../../../types/comments.type';
import {
  createTaskCommentService,
  deleteTaskCommentService,
  getTaskCommentRepliesService,
  getTaskCommentsService,
  getUserStoryCommentByIdService,
  getUserStoryCommentRepliesService,
  getUserStoryCommentsService,
  updateCommentService,
  createUserStoryCommentService,
  deleteUserStoryCommentService,
  updateUserStoryCommentService,
  uploadTaskCommentAttachmentService,
  uploadUserStoryCommentAttachmentService,
} from '../../../services/comments.services';
import {
  TaskCommentAttachmentResponse,
  UploadTaskCommentByTaskAttachmentParams,
  UploadUserStoryCommentAttachmentParams,
  UploadUserStoryCommentAttachmentResponse,
} from '../../../types/attachment.type';

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

export const createUserStoryComment = createAsyncThunk<
  CreateUserStoryCommentResponse,
  CreateUserStoryCommentParams,
  { rejectValue: string }
>('comments/createUserStoryComment', async (params, { rejectWithValue }) => {
  try {
    if (!params.projectId || !params.userStoryId) {
      return rejectWithValue(
        'Cannot create comment: Invalid projectId or userStoryId',
      );
    }
    const response = await createUserStoryCommentService(params);
    console.log('Response', response);
    return response;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to create user story comment';
    return rejectWithValue(errorMessage);
  }
});

export const getUserStoryCommentById = createAsyncThunk<
  GetUserStoryCommentByIdResponse,
  GetUserStoryCommentByIdParams,
  { rejectValue: string }
>('comments/getUserStoryCommentById', async (params, { rejectWithValue }) => {
  try {
    if (!params.projectId || !params.userStoryId || !params.commentId) {
      return rejectWithValue(
        'Cannot fetch comment: Invalid projectId, userStoryId, or commentId',
      );
    }
    const response = await getUserStoryCommentByIdService(params);
    return response;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to fetch user story comment';
    return rejectWithValue(errorMessage);
  }
});

export const updateUserStoryComment = createAsyncThunk<
  UpdateUserStoryCommentResponse,
  UpdateUserStoryCommentParams,
  { rejectValue: string }
>('comments/updateUserStoryComment', async (params, { rejectWithValue }) => {
  try {
    if (!params.projectId || !params.userStoryId || !params.commentId) {
      return rejectWithValue(
        'Cannot update comment: Missing projectId, userStoryId, or commentId',
      );
    }
    if (!params.content.trim()) {
      return rejectWithValue('Cannot update comment: Content cannot be empty');
    }
    const response = await updateUserStoryCommentService(params);
    console.log('Update Comment API Response:', response);
    return response;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to update user story comment';
    return rejectWithValue(errorMessage);
  }
});

export const deleteUserStoryComment = createAsyncThunk<
  DeleteUserStoryCommentResponse,
  DeleteUserStoryCommentParams,
  { rejectValue: string }
>('comments/deleteUserStoryComment', async (params, { rejectWithValue }) => {
  try {
    if (!params.projectId || !params.userStoryId || !params.commentId) {
      return rejectWithValue(
        'Cannot delete comment: Missing projectId, userStoryId, or commentId',
      );
    }
    const response = await deleteUserStoryCommentService(params);
    console.log('Delete Comment API Response:', response);
    return response;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to delete user story comment';
    return rejectWithValue(errorMessage);
  }
});

export const fetchUserStoryCommentReplies = createAsyncThunk<
  GetUserStoryCommentRepliesResponse,
  GetUserStoryCommentRepliesParams,
  { rejectValue: string }
>(
  'comments/fetchUserStoryCommentReplies',
  async (params, { rejectWithValue }) => {
    try {
      const response = await getUserStoryCommentRepliesService(params);
      return response;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch user story comment replies';
      return rejectWithValue(errorMessage);
    }
  },
);

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

export const uploadUserStoryCommentAttachment = createAsyncThunk<
  UploadUserStoryCommentAttachmentResponse,
  UploadUserStoryCommentAttachmentParams,
  { rejectValue: string }
>(
  'commentAttachments/uploadUserStoryCommentAttachment',
  async (params, { rejectWithValue }) => {
    try {
      const response = await uploadUserStoryCommentAttachmentService(params);
      return response;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to upload user story comment attachment';
      return rejectWithValue(errorMessage);
    }
  },
);

export const uploadTaskCommentAttachment = createAsyncThunk<
  TaskCommentAttachmentResponse,
  UploadTaskCommentByTaskAttachmentParams,
  { rejectValue: string }
>(
  'commentAttachments/uploadTaskCommentAttachment',
  async (params, { rejectWithValue }) => {
    try {
      const response = await uploadTaskCommentAttachmentService(params);
      return response;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to upload task comment attachment';
      return rejectWithValue(errorMessage);
    }
  },
);
