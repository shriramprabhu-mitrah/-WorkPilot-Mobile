import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  GetUserStoryAttachmentsParams,
  GetUserStoryAttachmentsResponse,
  UploadUserStoryAttachmentParams,
  UploadUserStoryAttachmentResponse,
  DeleteUserStoryAttachmentParams,
  DeleteUserStoryAttachmentResponse,
  DownloadUserStoryAttachmentParams,
  DownloadUserStoryAttachmentResponse,
  GetTaskCommentAttachmentsParams,
  GetTaskCommentAttachmentsResponse,
  UploadTaskCommentAttachmentParams,
  UploadTaskCommentAttachmentResponse,
  DeleteTaskCommentAttachmentParams,
  DeleteTaskCommentAttachmentResponse,
  DownloadTaskCommentAttachmentParams,
  DownloadTaskCommentAttachmentResponse,
} from '../../../types/attachment.type';
import {
  getUserStoryAttachmentsService,
  uploadUserStoryAttachmentService,
  deleteUserStoryAttachmentService,
  downloadUserStoryAttachmentService,
  getTaskCommentAttachmentsService,
  uploadTaskCommentAttachmentService,
  deleteTaskCommentAttachmentService,
  downloadTaskCommentAttachmentService,
} from '../../../services/attachment.service';

export const fetchUserStoryAttachments = createAsyncThunk<
  GetUserStoryAttachmentsResponse,
  GetUserStoryAttachmentsParams,
  { rejectValue: string }
>(
  'attachments/fetchUserStoryAttachments',
  async (params, { rejectWithValue }) => {
    try {
      const response = await getUserStoryAttachmentsService(params);
      return response;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch user story attachments';
      return rejectWithValue(errorMessage);
    }
  },
);

export const uploadUserStoryAttachment = createAsyncThunk<
  UploadUserStoryAttachmentResponse,
  UploadUserStoryAttachmentParams,
  { rejectValue: string }
>(
  'attachments/uploadUserStoryAttachment',
  async (params, { rejectWithValue }) => {
    try {
      const response = await uploadUserStoryAttachmentService(params);
      return response;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to upload user story attachment';
      return rejectWithValue(errorMessage);
    }
  },
);

export const deleteUserStoryAttachment = createAsyncThunk<
  DeleteUserStoryAttachmentResponse,
  DeleteUserStoryAttachmentParams,
  { rejectValue: string }
>(
  'attachments/deleteUserStoryAttachment',
  async (params, { rejectWithValue }) => {
    try {
      const response = await deleteUserStoryAttachmentService(params);
      return response;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to delete user story attachment';
      return rejectWithValue(errorMessage);
    }
  },
);

export const downloadUserStoryAttachment = createAsyncThunk<
  DownloadUserStoryAttachmentResponse,
  DownloadUserStoryAttachmentParams,
  { rejectValue: string }
>(
  'attachments/downloadUserStoryAttachment',
  async (params, { rejectWithValue }) => {
    try {
      const response = await downloadUserStoryAttachmentService(params);
      return response;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to download user story attachment';
      return rejectWithValue(errorMessage);
    }
  },
);

export const fetchTaskAttachments = createAsyncThunk<
  GetTaskCommentAttachmentsResponse,
  GetTaskCommentAttachmentsParams,
  { rejectValue: string }
>('attachments/fetchTaskAttachments', async (params, { rejectWithValue }) => {
  try {
    const response = await getTaskCommentAttachmentsService(params);
    return response;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to fetch task comment attachments';
    return rejectWithValue(errorMessage);
  }
});

export const uploadTaskAttachment = createAsyncThunk<
  UploadTaskCommentAttachmentResponse,
  UploadTaskCommentAttachmentParams,
  { rejectValue: string }
>('attachments/uploadTaskAttachment', async (params, { rejectWithValue }) => {
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
});

export const deleteTaskAttachment = createAsyncThunk<
  DeleteTaskCommentAttachmentResponse,
  DeleteTaskCommentAttachmentParams,
  { rejectValue: string }
>('attachments/deleteTaskAttachment', async (params, { rejectWithValue }) => {
  try {
    const response = await deleteTaskCommentAttachmentService(params);
    return response;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to delete task comment attachment';
    return rejectWithValue(errorMessage);
  }
});

export const downloadTaskAttachment = createAsyncThunk<
  DownloadTaskCommentAttachmentResponse,
  DownloadTaskCommentAttachmentParams,
  { rejectValue: string }
>('attachments/downloadTaskAttachment', async (params, { rejectWithValue }) => {
  try {
    const response = await downloadTaskCommentAttachmentService(params);
    return response;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to download task comment attachment';
    return rejectWithValue(errorMessage);
  }
});
