import { createAsyncThunk } from '@reduxjs/toolkit';

import { updateTask } from '../../../services/task.service';

import {
  UpdateTaskPayload,
  UpdateTaskResponse,
} from '../../../types/task.type';

interface UpdateTaskParams {
  projectId: string;
  taskId: string;
  payload: UpdateTaskPayload;
}

export const updateTaskThunk = createAsyncThunk<
  UpdateTaskResponse,
  UpdateTaskParams,
  { rejectValue: string }
>(
  'project/updateTask',
  async ({ projectId, taskId, payload }, { rejectWithValue }) => {
    try {
      const response = await updateTask(projectId, taskId, payload);

      console.log('Update Task Response:', response);

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update task',
      );
    }
  },
);
