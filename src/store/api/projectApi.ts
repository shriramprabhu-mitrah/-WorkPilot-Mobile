import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from './axiosBaseQuery';
import {
  GET_PROJECTS,
  GET_SPRINTS,
  GET_PROJECT_BY_ID,
  GET_SPRINT_BY_Id,
  GETPROJECTOVERVIEW,
  GET_CUSTOMSTATUS,
  GET_USERSTORY_STATUS,
  GET_USERSTORY,
  GET_BURNDOWN_BY_PROJECT_SPRINT,
  DELETE_PROJECT,
  UPDATE_PROJECT,
  GETPROJECTMEMBERS,
  DELETEPROJECTMEMBER,
} from '../../constants/apiServiceEndpoint';
import {
  GetProjectsResponse,
  GetSprintResponse,
  GetProjectByIdResponse,
  ProjectDetails,
  GetSprintByIdResponse,
  GetProjectOverviewResponse,
  GetUserStoriesResponse,
  GetProjectsQueryArgs,
  GetSprintsQueryArgs,
  GetProjectByIdQueryArgs,
  GetProjectOverviewQueryArgs,
  GetSprintByIdQueryArgs,
  GetCustomStatusQueryArgs,
  GetUserStoryStatusQueryArgs,
  GetUserStoriesQueryArgs,
  GetBurndownChartQueryArgs,
  UpdateProjectPayload,
  UpdateProjectResponse,
  DeleteProjectResponse,
  GetProjectMembersQueryArgs,
  GetProjectMembersResponse,
  RemoveProjectMemberArgs,
  RemoveProjectMemberResponse,
} from '../../types/project.type';
import {
  GetBurndownResponse,
  GetBurnbownParams,
} from '../../types/project.type';
import {
  GetCustomStatusResponse,
  GetUserStoryStatusResponse,
} from '../../types/customstatus.type';

export const projectApi = createApi({
  reducerPath: 'projectApi',
  baseQuery: axiosBaseQuery,
  tagTypes: [
    'Projects',
    'Sprints',
    'ProjectDetails',
    'SprintDetails',
    'ProjectOverview',
    'CustomStatus',
    'UserStoryStatus',
    'UserStories',
    'TaskDetail',
    'BurndownChart',
    'ProjectMembers',
    'UserStoryDetail',
    'Tasks',
    'Comments',
    'Attachments',
  ],
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
      }),
      transformResponse: (response: GetProjectByIdResponse) => response.data,
      providesTags: (_result, _error, { project_id }) => [
        { type: 'ProjectDetails', id: project_id },
      ],
    }),

    getSprintById: build.query<GetSprintByIdResponse, GetSprintByIdQueryArgs>({
      query: ({ project_id, sprint_id }) => ({
        url: GET_SPRINT_BY_Id.replace('{project_id}', project_id).replace(
          '{sprint_id}',
          sprint_id,
        ),
      }),
      providesTags: (_result, _error, { project_id, sprint_id }) => [
        { type: 'SprintDetails', id: `${project_id}_${sprint_id}` },
      ],
    }),

    getProjectOverview: build.query<
      GetProjectOverviewResponse,
      GetProjectOverviewQueryArgs
    >({
      query: ({ project_id, sprint_id }) => ({
        url: GETPROJECTOVERVIEW.replace('{project_id}', project_id),
        params: sprint_id ? { sprint_id } : undefined,
      }),
      providesTags: (_result, _error, { project_id }) => [
        { type: 'ProjectOverview', id: project_id },
      ],
    }),

    getCustomStatus: build.query<
      GetCustomStatusResponse,
      GetCustomStatusQueryArgs
    >({
      query: ({ project_id }) => ({
        url: GET_CUSTOMSTATUS.replace('{project_id}', project_id),
      }),
      providesTags: (_result, _error, { project_id }) => [
        { type: 'CustomStatus', id: project_id },
      ],
    }),

    getUserStoryStatus: build.query<
      GetUserStoryStatusResponse,
      GetUserStoryStatusQueryArgs
    >({
      query: ({ project_id }) => ({
        url: GET_USERSTORY_STATUS.replace('{project_id}', project_id),
      }),
      providesTags: (_result, _error, { project_id }) => [
        { type: 'UserStoryStatus', id: project_id },
      ],
    }),

    getUserStories: build.query<
      GetUserStoriesResponse,
      GetUserStoriesQueryArgs
    >({
      query: ({ projectId, payload }) => {
        const { page, page_size, ...rest } = payload || {};

        const cleanedParams = payload
          ? Object.fromEntries(
              Object.entries({ ...rest, page, page_size })
                .filter(([_, val]) => val !== undefined && val !== '--')
                .map(([key, val]) => [key, val === null ? 'null' : val]),
            )
          : undefined;

        return {
          url: GET_USERSTORY.replace('{project_id}', projectId),
          params: cleanedParams,
        };
      },

      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { _refetchKey, payload, ...rest } = queryArgs;
        const { page, ...payloadRest } = payload || {};
        return `${endpointName}_${JSON.stringify({ ...rest, payload: payloadRest })}`;
      },

      merge(currentCache, newItems, { arg }) {
        if (
          (arg?.payload?.page || 1) === 1 ||
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

      forceRefetch({ currentArg, previousArg }) {
        return (
          currentArg?.payload?.page !== previousArg?.payload?.page ||
          currentArg?.payload?.sprint_id !== previousArg?.payload?.sprint_id ||
          currentArg?._refetchKey !== previousArg?._refetchKey
        );
      },

      providesTags: (_result, _error, { projectId, payload }) => [
        {
          type: 'UserStories',
          id: `${projectId}_${payload?.sprint_id ?? 'all'}`,
        },
      ],
    }),

    getBurndownChart: build.query<
      GetBurndownResponse,
      GetBurndownChartQueryArgs
    >({
      query: ({ projectId, sprintId }) => ({
        url: GET_BURNDOWN_BY_PROJECT_SPRINT.replace(
          '{project_id}',
          projectId,
        ).replace('{sprint_id}', sprintId),
      }),
      providesTags: (_result, _error, { projectId, sprintId }) => [
        { type: 'BurndownChart', id: `${projectId}_${sprintId}` },
      ],
    }),

    getProjectMembers: build.query<
      GetProjectMembersResponse,
      GetProjectMembersQueryArgs
    >({
      query: ({ project_id, _refetchKey, ...params }) => ({
        url: GETPROJECTMEMBERS.replace('{project_id}', project_id),
        params,
      }),

      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { page, _refetchKey, ...rest } = queryArgs;
        return `${endpointName}_${JSON.stringify(rest)}`;
      },

      merge(currentCache, newItems, { arg }) {
        if (
          (arg?.page || 1) === 1 ||
          !currentCache?.data ||
          !Array.isArray(currentCache.data)
        ) {
          return newItems;
        }

        const existingIds = new Set(
          currentCache.data.map(member => member.user_id),
        );
        const incoming = Array.isArray(newItems?.data) ? newItems.data : [];
        const uniqueNew = incoming.filter(
          member => !existingIds.has(member.user_id),
        );
        currentCache.data.push(...uniqueNew);
        currentCache.meta = newItems.meta;
      },

      forceRefetch({ currentArg, previousArg }) {
        return (
          currentArg?.page !== previousArg?.page ||
          currentArg?._refetchKey !== previousArg?._refetchKey
        );
      },

      providesTags: (_result, _error, { project_id }) => [
        { type: 'ProjectMembers', id: project_id },
      ],
    }),

    removeProjectMember: build.mutation<
      RemoveProjectMemberResponse,
      RemoveProjectMemberArgs
    >({
      query: ({ project_id, user_id }) => ({
        url: DELETEPROJECTMEMBER.replace('{project_id}', project_id).replace(
          '{user_id}',
          user_id,
        ),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { project_id }) => [
        { type: 'ProjectMembers', id: project_id },
        { type: 'ProjectDetails', id: project_id },
      ],
    }),

    updateProject: build.mutation<
      UpdateProjectResponse,
      { project_id: string; payload: UpdateProjectPayload }
    >({
      query: ({ project_id, payload }) => ({
        url: UPDATE_PROJECT.replace('{project_id}', project_id),
        method: 'PATCH',
        data: payload,
      }),
      invalidatesTags: (_result, _error, { project_id }) => [
        { type: 'ProjectDetails', id: project_id },
        'Projects',
      ],
    }),

    deleteProject: build.mutation<
      DeleteProjectResponse,
      { project_id: string }
    >({
      query: ({ project_id }) => ({
        url: DELETE_PROJECT.replace('{project_id}', project_id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Projects'],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetSprintsQuery,
  useGetProjectByIdQuery,
  useGetSprintByIdQuery,
  useGetProjectOverviewQuery,
  useGetCustomStatusQuery,
  useGetUserStoryStatusQuery,
  useGetUserStoriesQuery,
  useGetBurndownChartQuery,
  useGetProjectMembersQuery,
  useRemoveProjectMemberMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useLazyGetProjectByIdQuery,
} = projectApi;

// Aliases matching thunk names
export const useGetAllProjectInfoQuery = useGetProjectsQuery;
export const useGetSprintsThunkQuery = useGetSprintsQuery;
export const useGetSprintByIdThunkQuery = useGetSprintByIdQuery;
