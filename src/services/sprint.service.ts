import { get } from '../components/common/httpClient';
import { GET_SPRINT_BY_Id, GET_SPRINTS } from '../constants/apiServiceEndpoint';
import {
  GetSprintByIdParams,
  GetSprintByIdResponse,
  GetSprintResponse,
  GetSprintsParams,
} from '../types/project.type';

export const getSprints = async (
  params: GetSprintsParams,
): Promise<GetSprintResponse> => {
  try {
    const { project_id, ...queryParams } = params;

    const url = GET_SPRINTS.replace('{project_id}', project_id);

    return await get<GetSprintResponse>(url, {
      params: queryParams,
    });
  } catch (error) {
    console.error('Get Sprints API failed:', error);
    throw error;
  }
};

export const getSprintById = async (
  params: GetSprintByIdParams,
): Promise<GetSprintByIdResponse> => {
  try {
    const { project_id, sprint_id } = params;

    const url = GET_SPRINT_BY_Id.replace('{project_id}', project_id).replace(
      '{sprint_id}',
      sprint_id,
    );

    return await get<GetSprintByIdResponse>(url);
  } catch (error) {
    console.error('Get Sprint By ID API failed:', error);
    throw error;
  }
};
