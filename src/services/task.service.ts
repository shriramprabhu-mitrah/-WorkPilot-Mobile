import {
  GetTasksParams,
  GetTasksResponse,
  UpdateTaskPayload,
  UpdateTaskResponse,
} from '../types/task.type';
import { GET_TASKS, UPDATE_TASKS } from '../constants/apiServiceEndpoint';
import { get, patch } from '../components/common/httpClient';

export const updateTask = async (
  projectId: string,
  taskId: string,
  payload: UpdateTaskPayload,
): Promise<UpdateTaskResponse> => {
  try {
    const url = UPDATE_TASKS.replace('{project_id}', projectId).replace(
      '{task_id}',
      taskId,
    );

    return await patch<UpdateTaskResponse>(url, payload);
  } catch (error) {
    console.error('Update task API failed:', error);
    throw error;
  }
};

export const getTasksService = async ({
  projectId,
  ...params
}: GetTasksParams): Promise<GetTasksResponse> => {
  try {
    const url = GET_TASKS.replace('{project_id}', projectId);
    const cleanedParams = Object.fromEntries(
      Object.entries(params).filter(([_, val]) => {
        if (val === undefined || val === null || val === '') return false;
        if (val === false) return false;
        return true;
      }),
    );
    return await get<GetTasksResponse>(url, { params: cleanedParams });
  } catch (error) {
    console.error('Get Tasks API failed:', error);
    throw error;
  }
};
