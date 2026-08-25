import { createAsyncThunk } from '@reduxjs/toolkit';

import { getTasksService, updateTask } from '../../../services/task.service';

import {
  GetTasksParams,
  GetTasksResponse,
  UpdateTaskPayload,
  UpdateTaskResponse,
} from '../../../types/task.type';

export interface UpdateTaskParams {
  projectId: string;
  taskId: string;
  payload: UpdateTaskPayload;
  onSuccess?: (response: UpdateTaskResponse) => void;
  onError?: (message: string) => void;
  onFinally?: () => void;
}

export const updateTaskThunk = createAsyncThunk<
  UpdateTaskResponse,
  UpdateTaskParams,
  { rejectValue: string }
>(
  'project/updateTask',
  async (
    { projectId, taskId, payload, onSuccess, onError, onFinally },
    { rejectWithValue },
  ) => {
    try {
      const response = await updateTask(projectId, taskId, payload);
      onSuccess?.(response);
      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update task';
      onError?.(message);
      return rejectWithValue(message);
    } finally {
      onFinally?.();
    }
  },
);

export const getTasks = createAsyncThunk<
  GetTasksResponse,
  GetTasksParams,
  { rejectValue: string }
>('project/getTasks', async (params, { rejectWithValue }) => {
  try {
    const response = await getTasksService(params);
    console.log('Get Tasks API Response:', response);
    return response;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch tasks',
    );
  }
});
