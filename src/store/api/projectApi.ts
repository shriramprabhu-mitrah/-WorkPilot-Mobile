import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from './axiosBaseQuery';
import {
  GET_PROJECTS,
  GET_SPRINTS,
  GET_PROJECT_BY_ID,
  GET_SPRINT_BY_Id,
} from '../../constants/apiServiceEndpoint';
import {
  GetProjectsParams,
  GetProjectsResponse,
  GetSprintsParams,
  GetSprintResponse,
  GetProjectByIdResponse,
  ProjectDetails,
  GetSprintByIdParams,
  GetSprintByIdResponse,
} from '../../types/project.type';

export interface GetProjectsQueryArgs extends GetProjectsParams {
  /** Changing this value forces a refetch. Not sent to the API. */
  _refetchKey?: number;
}

export interface GetSprintsQueryArgs extends GetSprintsParams {
  /** Changing this value forces a refetch. Not sent to the API. */
  _refetchKey?: number;
}

export interface GetProjectByIdQueryArgs {
  project_id: string;
  _refetchKey?: number;
}

export interface GetSprintByIdQueryArgs extends GetSprintByIdParams {
  _refetchKey?: number;
}

export const projectApi = createApi({
  reducerPath: 'projectApi',
  baseQuery: axiosBaseQuery,
  tagTypes: ['Projects', 'Sprints', 'ProjectDetails', 'SprintDetails'],
  endpoints: build => ({
    getProjects: build.query<GetProjectsResponse, GetProjectsQueryArgs | void>({
      query: args => {
        const { _refetchKey, ...params } = args || {};
        return {
          url: GET_PROJECTS,
          params,
        };
      },

      // Cache key based on endpointName and non-pagination params
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { page, _refetchKey, ...rest } = queryArgs || {};
        return `${endpointName}_${JSON.stringify(rest)}`;
      },

      // Merge paginated responses into the shared cache entry
      merge(currentCache, newItems, { arg }) {
        if (
          (arg?.page || 1) === 1 ||
          !currentCache?.data ||
          !Array.isArray(currentCache.data)
        ) {
          return newItems;
        }

        const existingIds = new Set(
          currentCache.data.map(
            (p: any) => p.id?.toString() || p._id?.toString(),
          ),
        );
        const incoming = Array.isArray(newItems?.data) ? newItems.data : [];
        const uniqueNew = incoming.filter(
          (p: any) => !existingIds.has(p.id?.toString() || p._id?.toString()),
        );
        currentCache.data.push(...uniqueNew);
        currentCache.meta = newItems.meta;
      },

      // Force refetch whenever page or _refetchKey changes
      forceRefetch({ currentArg, previousArg }) {
        return (
          currentArg?.page !== previousArg?.page ||
          currentArg?._refetchKey !== previousArg?._refetchKey
        );
      },

      providesTags: ['Projects'],
    }),

    getSprints: build.query<GetSprintResponse, GetSprintsQueryArgs>({
      query: ({ project_id, _refetchKey, ...params }) => ({
        url: GET_SPRINTS.replace('{project_id}', project_id),
        params,
      }),

      // Cache key based on endpointName, project_id, and other filter params
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { page, _refetchKey, ...rest } = queryArgs;
        return `${endpointName}_${JSON.stringify(rest)}`;
      },

      // Merge paginated responses for the same project
      merge(currentCache, newItems, { arg }) {
        if (
          (arg?.page || 1) === 1 ||
          !currentCache?.data ||
          !Array.isArray(currentCache.data)
        ) {
          return newItems;
        }

        const existingIds = new Set(
          currentCache.data.map(
            (s: any) => s.id?.toString() || s._id?.toString(),
          ),
        );
        const incoming = Array.isArray(newItems?.data) ? newItems.data : [];
        const uniqueNew = incoming.filter(
          (s: any) => !existingIds.has(s.id?.toString() || s._id?.toString()),
        );
        currentCache.data.push(...uniqueNew);
        currentCache.meta = newItems.meta;
      },

      // Force refetch whenever page or _refetchKey changes
      forceRefetch({ currentArg, previousArg }) {
        return (
          currentArg?.page !== previousArg?.page ||
          currentArg?._refetchKey !== previousArg?._refetchKey
        );
      },

      providesTags: ['Sprints'],
    }),

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

    /* ---------------------------------------------------------------------- */
    /*                            Get Sprint By ID                             */
    /* ---------------------------------------------------------------------- */

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
        {
          type: 'SprintDetails',
          id: `${project_id}_${sprint_id}`,
        },
      ],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetSprintsQuery,
  useLazyGetProjectsQuery,
  useLazyGetSprintsQuery,
  useGetProjectByIdQuery,
  useLazyGetProjectByIdQuery,
  useGetSprintByIdQuery,
  useLazyGetSprintByIdQuery,
} = projectApi;

// Aliases matching thunk names
export const useGetAllProjectInfoQuery = useGetProjectsQuery;
export const useGetSprintsThunkQuery = useGetSprintsQuery;
export const useGetSprintByIdThunkQuery = useGetSprintByIdQuery;
