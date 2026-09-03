import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from './axiosBaseQuery';
import { GET_PROJECTS, GET_SPRINTS } from '../../constants/apiServiceEndpoint';
import {
  GetProjectsParams,
  GetProjectsResponse,
  GetSprintsParams,
  GetSprintResponse,
} from '../../types/project.type';

export interface GetProjectsQueryArgs extends GetProjectsParams {
  /** Changing this value forces a refetch. Not sent to the API. */
  _refetchKey?: number;
}

export interface GetSprintsQueryArgs extends GetSprintsParams {
  /** Changing this value forces a refetch. Not sent to the API. */
  _refetchKey?: number;
}

export const projectApi = createApi({
  reducerPath: 'projectApi',
  baseQuery: axiosBaseQuery,
  tagTypes: ['Projects', 'Sprints'],
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
  }),
});

export const {
  useGetProjectsQuery,
  useGetSprintsQuery,
  useLazyGetProjectsQuery,
  useLazyGetSprintsQuery,
} = projectApi;

// Aliases matching thunk names
export const useGetAllProjectInfoQuery = useGetProjectsQuery;
export const useGetSprintsThunkQuery = useGetSprintsQuery;
