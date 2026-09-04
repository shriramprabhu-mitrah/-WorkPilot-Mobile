import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from './axiosBaseQuery';
import {
  GET_PROJECT_BY_ID,
  GET_SPRINT_BY_Id,
} from '../../constants/apiServiceEndpoint';
import {
  GetProjectByIdResponse,
  ProjectDetails,
  GetSprintByIdParams,
  GetSprintByIdResponse,
} from '../../types/project.type';

export interface GetProjectByIdQueryArgs {
  project_id: string;
  _refetchKey?: number;
}

export interface GetSprintByIdQueryArgs extends GetSprintByIdParams {
  _refetchKey?: number;
}

export const projectDetailsApi = createApi({
  reducerPath: 'projectByIdApi',

  baseQuery: axiosBaseQuery,

  tagTypes: ['ProjectDetails', 'SprintDetails'],

  endpoints: build => ({
    getProjectById: build.query<ProjectDetails, GetProjectByIdQueryArgs>({
      query: ({ project_id }) => ({
        url: GET_PROJECT_BY_ID.replace('{project_id}', project_id),
        method: 'GET',
      }),

      transformResponse: (response: GetProjectByIdResponse) => response.data,

      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}_${queryArgs.project_id}`;
      },

      forceRefetch({ currentArg, previousArg }) {
        return (
          currentArg?.project_id !== previousArg?.project_id ||
          currentArg?._refetchKey !== previousArg?._refetchKey
        );
      },

      providesTags: (_result, _error, { project_id }) => [
        {
          type: 'ProjectDetails',
          id: project_id,
        },
      ],
    }),

    getSprintById: build.query<GetSprintByIdResponse, GetSprintByIdQueryArgs>({
      query: ({ project_id, sprint_id }) => ({
        url: GET_SPRINT_BY_Id.replace('{project_id}', project_id).replace(
          '{sprint_id}',
          sprint_id,
        ),
        method: 'GET',
      }),

      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { _refetchKey, ...rest } = queryArgs;
        return `${endpointName}_${JSON.stringify(rest)}`;
      },

      forceRefetch({ currentArg, previousArg }) {
        return (
          currentArg?.sprint_id !== previousArg?.sprint_id ||
          currentArg?._refetchKey !== previousArg?._refetchKey
        );
      },

      providesTags: (_result, _error, { project_id, sprint_id }) => [
        { type: 'SprintDetails', id: `${project_id}_${sprint_id}` },
      ],
    }),
  }),
});

export const {
  useGetProjectByIdQuery,
  useLazyGetProjectByIdQuery,
  useGetSprintByIdQuery,
  useLazyGetSprintByIdQuery,
} = projectDetailsApi;

// Aliases
export const useGetSprintByIdThunkQuery = useGetSprintByIdQuery;
