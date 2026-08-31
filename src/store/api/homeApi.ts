import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from './axiosBaseQuery';
import { AuditResponse } from '../../types/home.type';
import {
  GET_AUDIT,
  GET_RECENT_PROJECTS,
  GET_USER,
  GET_ORGANIZATION_DETAIL,
  GET_FAVOURITES,
} from '../../constants/apiServiceEndpoint';
import {
  GetRecentProjectResponse,
  RecentProject,
} from '../../types/project.type';
import {
  GetUserResponse,
  GetOrganizationResponse,
} from '../../types/auth.type';
import {
  GetFavoritesResponse,
  GetFavouritesParams,
} from '../../types/projectBoard.type';

export interface GetAuditQueryArgs {
  type: 'viewed' | 'activity';
  page: number;
  page_size?: number;
  /** Changing this value forces a refetch on screen focus. Not sent to the API. */
  _refetchKey?: number;
}

export interface GetFavouritesQueryArgs extends GetFavouritesParams {
  /** Changing this value forces a refetch on screen focus. Not sent to the API. */
  _refetchKey?: number;
}

export const homeApi = createApi({
  reducerPath: 'homeApi',
  baseQuery: axiosBaseQuery,
  endpoints: build => ({
    getAudit: build.query<AuditResponse, GetAuditQueryArgs>({
      query: ({ type, page, page_size }) => {
        const endpointType = type === 'viewed' ? 'view' : 'activity';
        return {
          url: `${GET_AUDIT}/${endpointType}`,
          params: { page, ...(page_size !== undefined ? { page_size } : {}) },
        };
      },

      // Cache key based on `type` only — all pages for the same type
      // share a single cache entry so paginated data can be merged.
      serializeQueryArgs: ({ queryArgs }) => queryArgs.type,

      // Merge paginated responses into the shared cache entry.
      // Page 1 replaces (fresh data); subsequent pages append unique items.
      merge(currentCache, newItems, { arg }) {
        if (arg.page === 1 || !currentCache?.data?.activities) {
          return newItems;
        }

        const existingIds = new Set(
          currentCache.data.activities.map(a => a.id?.toString()),
        );
        const uniqueNew = newItems.data.activities.filter(
          a => !existingIds.has(a.id?.toString()),
        );
        currentCache.data.activities.push(...uniqueNew);
        currentCache.meta = newItems.meta;

        if (newItems.data.user) {
          currentCache.data.user = newItems.data.user;
        }
      },

      // Re-fetch whenever page or _refetchKey changes, even though the
      // serialized cache key (type) stays the same.
      forceRefetch({ currentArg, previousArg }) {
        return (
          currentArg?.page !== previousArg?.page ||
          currentArg?.type !== previousArg?.type ||
          currentArg?._refetchKey !== previousArg?._refetchKey
        );
      },
    }),

    getRecentProjects: build.query<RecentProject[], void>({
      query: () => ({
        url: GET_RECENT_PROJECTS,
      }),
      // Extract the project array from the nested response
      transformResponse: (response: GetRecentProjectResponse) =>
        response.data.project,
    }),

    getUserProfile: build.query<GetUserResponse, void>({
      query: () => ({ url: GET_USER }),
    }),

    getOrganizationDetail: build.query<GetOrganizationResponse, void>({
      query: () => ({ url: GET_ORGANIZATION_DETAIL }),
    }),

    getFavourites: build.query<GetFavoritesResponse, GetFavouritesQueryArgs>({
      query: ({ _refetchKey, ...params }) => ({
        url: GET_FAVOURITES,
        params,
      }),
      // Cache key based on endpoint name only, ignoring pagination params
      serializeQueryArgs: ({ endpointName }) => endpointName,
      // Merge paginated responses
      merge(currentCache, newItems, { arg }) {
        if (arg.page === 1 || !currentCache?.data?.favorites) {
          return newItems;
        }

        const existingIds = new Set(
          currentCache.data.favorites.map(f => f.id?.toString()),
        );
        const uniqueNew = newItems.data.favorites.filter(
          f => !existingIds.has(f.id?.toString()),
        );
        currentCache.data.favorites.push(...uniqueNew);
        currentCache.meta = newItems.meta;
      },
      // Refetch if page or refetchKey changes
      forceRefetch({ currentArg, previousArg }) {
        return (
          currentArg?.page !== previousArg?.page ||
          currentArg?._refetchKey !== previousArg?._refetchKey
        );
      },
    }),
  }),
});

export const {
  useGetAuditQuery,
  useGetRecentProjectsQuery,
  useGetUserProfileQuery,
  useGetOrganizationDetailQuery,
  useGetFavouritesQuery,
} = homeApi;
