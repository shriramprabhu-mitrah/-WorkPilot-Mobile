import { UpdateTaskPayload, UpdateTaskResponse } from '../types/task.type';
import { UPDATE_TASKS } from '../constants/apiServiceEndpoint';
import { patch } from '../components/common/httpClient';

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
