import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from './axiosBaseQuery';
import { GET_INSIGHTS } from '../../constants/apiServiceEndpoint';
import { UserInsights } from '../../types/home.type';

export interface GetUserInsightsQueryArgs {
  _refetchKey?: number;
}

export const profileApi = createApi({
  reducerPath: 'profileApi',
  baseQuery: axiosBaseQuery,
  tagTypes: ['UserInsights'],
  endpoints: build => ({
    getUserInsights: build.query<UserInsights, GetUserInsightsQueryArgs>({
      query: () => ({
        url: GET_INSIGHTS,
      }),
      transformResponse: (response: { data: UserInsights }) => response.data,
      providesTags: ['UserInsights'],

      serializeQueryArgs: ({ endpointName }) => endpointName,

      forceRefetch({ currentArg, previousArg }) {
        return currentArg?._refetchKey !== previousArg?._refetchKey;
      },
    }),
  }),
});

export const { useGetUserInsightsQuery } = profileApi;
