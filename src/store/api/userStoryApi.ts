import { projectApi } from './projectApi';
import {
  GET_USERSTORY_BY_ID,
  UPDATE_USER_STORY,
  GET_TASK_BY_ID,
  USERSTORIES_COMMENT,
  USERSTORIES_COMMENT_BY_ID,
  USER_STORIES_COMMENT_REPLIES,
  TASK_COMMENT,
  TASK_COMMENT_ID,
  TASK_COMMENT_REPLIES,
  GET_TASKS,
  CREATE_TASK,
  USATTACHMENT,
  DELETEUSATTACHMENT,
  TASKATTACHMENT,
  DELETETASKATTACHMENT,
  UPDATE_TASKS,
  CREATE_USERSTORY,
  DELETE_USERSTORY,
} from '../../constants/apiServiceEndpoint';
import {
  GetUserStoryByIdParams,
  GetUserStoryByIdResponse,
  UpdateUserStoryPayload,
  UpdateUserStoryResponse,
  DeleteUserStoryResponse,
  UserStoryDetail,
  GetTaskByIdParams,
  GetTaskByIdResponse,
  TaskData,
  CreateUserStoryResponse,
  CreateUserStoryPayload,
} from '../../types/project.type';
import {
  GetUserStoryCommentsParams,
  GetUserStoryCommentsResponse,
  GetTaskCommentsParams,
  GetTaskCommentsResponse,
  GetUserStoryCommentRepliesParams,
  GetUserStoryCommentRepliesResponse,
  GetTaskCommentRepliesParams,
  CreateUserStoryCommentParams,
  CreateUserStoryCommentResponse,
  UpdateUserStoryCommentParams,
  UpdateUserStoryCommentResponse,
  DeleteUserStoryCommentParams,
  DeleteUserStoryCommentResponse,
  CreateTaskCommentParams,
  CreateTaskCommentResponse,
  UpdateCommentParams,
  UpdateCommentResponse,
  DeleteCommentParams,
  DeleteCommentResponse,
} from '../../types/comments.type';
import {
  GetUserStoryAttachmentsParams,
  GetUserStoryAttachmentsResponse,
  GetTaskCommentAttachmentsParams,
  GetTaskCommentAttachmentsResponse,
  UploadUserStoryAttachmentParams,
  UploadUserStoryAttachmentResponse,
  DeleteUserStoryAttachmentParams,
  DeleteUserStoryAttachmentResponse,
  UploadTaskCommentAttachmentParams,
  UploadTaskCommentAttachmentResponse,
  DeleteTaskCommentAttachmentParams,
  DeleteTaskCommentAttachmentResponse,
  Attachment,
  UploadUserStoryCommentAttachmentParams,
  UploadUserStoryCommentAttachmentResponse,
  UploadTaskCommentByTaskAttachmentParams,
  TaskCommentAttachmentResponse,
} from '../../types/attachment.type';
import {
  GetTasksParams,
  GetTasksResponse,
  UpdateTaskPayload,
  UpdateTaskResponse,
  CreateTaskPayload,
  CreateTaskResponse,
} from '../../types/task.type';
import {
  uploadTaskAttachmentService,
  uploadUserStoryAttachmentService,
} from '../../services/attachment.service';
import {
  uploadTaskCommentAttachmentService,
  uploadUserStoryCommentAttachmentService,
} from '../../services/comments.services';

const userStoryApiWithTags = projectApi.enhanceEndpoints({
  addTagTypes: [
    'UserStoryDetail',
    'UserStories',
    'TaskDetail',
    'Tasks',
    'Comments',
    'Attachments',
  ],
});

export const userStoryApi = userStoryApiWithTags.injectEndpoints({
  endpoints: build => ({
    getUserStoryById: build.query<UserStoryDetail, GetUserStoryByIdParams>({
      query: ({ projectId, userStoryId }) => ({
        url: GET_USERSTORY_BY_ID.replace('{project_id}', projectId).replace(
          '{user_story_id}',
          userStoryId,
        ),
        method: 'GET',
      }),
      transformResponse: (response: GetUserStoryByIdResponse) => response.data,
      providesTags: (_result, _error, { userStoryId }) => [
        { type: 'UserStoryDetail', id: userStoryId },
      ],
    }),

    createUserStory: build.mutation<
      CreateUserStoryResponse,
      { projectId: string; payload: CreateUserStoryPayload }
    >({
      query: ({ projectId, payload }) => {
        const cleanPayload = { ...payload };
        if (cleanPayload.sprint_id === 'all' || !cleanPayload.sprint_id) {
          delete (cleanPayload as any).sprint_id;
        }
        return {
          url: CREATE_USERSTORY.replace('{project_id}', projectId),
          method: 'POST',
          data: cleanPayload,
        };
      },
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'UserStories', id: projectId },
        { type: 'Board', id: `${projectId}_STORIES` },
        { type: 'Board' },
      ],
    }),

    getTaskById: build.query<TaskData, GetTaskByIdParams>({
      query: ({ projectId, taskId }) => ({
        url: GET_TASK_BY_ID.replace('{project_id}', projectId).replace(
          '{task_id}',
          taskId,
        ),
      }),
      transformResponse: (response: GetTaskByIdResponse) => response.data,
      providesTags: (_result, _error, { projectId, taskId }) => [
        { type: 'TaskDetail', id: `${projectId}_${taskId}` },
      ],
    }),

    getUserStoryComments: build.query<
      GetUserStoryCommentsResponse,
      GetUserStoryCommentsParams
    >({
      query: ({ projectId, userStoryId, page = 1, pageSize = 10 }) => ({
        url: USERSTORIES_COMMENT.replace('{project_id}', projectId).replace(
          '{user_story_id}',
          userStoryId,
        ),
        params: { page, page_size: pageSize },
      }),
      providesTags: (_result, _error, { userStoryId }) => [
        { type: 'Comments', id: `userStory_${userStoryId}` },
      ],
    }),

    getTaskComments: build.query<
      GetTaskCommentsResponse,
      GetTaskCommentsParams
    >({
      query: ({ taskId, page = 1, pageSize = 10 }) => ({
        url: TASK_COMMENT.replace('{task_id}', taskId),
        params: { page, page_size: pageSize },
      }),
      providesTags: (_result, _error, { taskId }) => [
        { type: 'Comments', id: `task_${taskId}` },
      ],
    }),

    getUserStoryCommentReplies: build.query<
      GetUserStoryCommentRepliesResponse,
      GetUserStoryCommentRepliesParams
    >({
      query: ({
        projectId,
        userStoryId,
        commentId,
        page = 1,
        pageSize = 10,
      }) => ({
        url: USER_STORIES_COMMENT_REPLIES.replace('{project_id}', projectId)
          .replace('{user_story_id}', userStoryId)
          .replace('{comment_id}', commentId),
        params: { page, page_size: pageSize },
      }),
      providesTags: (_result, _error, { userStoryId, commentId }) => [
        { type: 'Comments', id: `userStory_${userStoryId}_${commentId}` },
      ],
    }),

    getTaskCommentReplies: build.query<
      GetTaskCommentsResponse,
      GetTaskCommentRepliesParams
    >({
      query: ({ taskId, parentCommentId, page = 1, pageSize = 10 }) => ({
        url: TASK_COMMENT_REPLIES.replace('{task_id}', taskId!).replace(
          '{parent_comment_id}',
          parentCommentId!,
        ),
        params: { page, page_size: pageSize },
      }),
      providesTags: (_result, _error, { taskId, parentCommentId }) => [
        { type: 'Comments', id: `task_${taskId}_${parentCommentId}` },
      ],
    }),

    getTasks: build.query<GetTasksResponse, GetTasksParams>({
      query: ({ projectId, _refetchKey, ...params }) => {
        const url = GET_TASKS.replace('{project_id}', projectId);
        const cleanedParams = Object.fromEntries(
          Object.entries(params).filter(([key, val]) => {
            if (val === undefined || val === null || val === '') return false;
            if (key === 'sprint_id' && (val === 'all' || !val)) return false;
            return true;
          }),
        );
        return {
          url,
          params: cleanedParams,
        };
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { page, _refetchKey, ...rest } = queryArgs || {};
        return `${endpointName}_${JSON.stringify({ ...rest })}`;
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
          currentCache.data.map((t: any) => t.id?.toString()),
        );
        const incoming = Array.isArray(newItems?.data) ? newItems.data : [];
        const uniqueNew = incoming.filter(
          (t: any) => !existingIds.has(t.id?.toString()),
        );
        currentCache.data.push(...uniqueNew);
        currentCache.meta = newItems.meta;
      },
      forceRefetch({ currentArg, previousArg }) {
        return (
          currentArg?.page !== previousArg?.page ||
          currentArg?.user_story_id !== previousArg?.user_story_id ||
          currentArg?.unassigned_task !== previousArg?.unassigned_task ||
          currentArg?.storyless_task !== previousArg?.storyless_task ||
          currentArg?._refetchKey !== previousArg?._refetchKey
        );
      },
      providesTags: (_result, _error, { projectId, user_story_id, unassigned_task }) => [
        {
          type: 'Tasks',
          id: `${projectId}_${user_story_id ?? (unassigned_task ? 'unassigned' : 'all')}`,
        },
      ],
    }),

    getUserStoryAttachments: build.query<
      Attachment[],
      GetUserStoryAttachmentsParams
    >({
      query: ({ projectId, userStoryId }) => ({
        url: USATTACHMENT.replace('{project_id}', projectId).replace(
          '{user_story_id}',
          userStoryId,
        ),
      }),
      transformResponse: (response: GetUserStoryAttachmentsResponse) =>
        response.data,
      providesTags: (_result, _error, { userStoryId }) => [
        { type: 'Attachments', id: `userStory_${userStoryId}` },
      ],
    }),

    getTaskAttachments: build.query<
      Attachment[],
      GetTaskCommentAttachmentsParams
    >({
      query: ({ projectId, taskId }) => ({
        url: TASKATTACHMENT.replace('{project_id}', projectId).replace(
          '{task_id}',
          taskId,
        ),
      }),
      transformResponse: (response: GetTaskCommentAttachmentsResponse) =>
        response.data,
      providesTags: (_result, _error, { taskId }) => [
        { type: 'Attachments', id: `task_${taskId}` },
      ],
    }),

    updateUserStory: build.mutation<
      UpdateUserStoryResponse,
      {
        projectId: string;
        userStoryId: string;
        payload: UpdateUserStoryPayload;
      }
    >({
      query: ({ projectId, userStoryId, payload }) => ({
        url: UPDATE_USER_STORY.replace('{project_id}', projectId).replace(
          '{user_story_id}',
          userStoryId,
        ),
        method: 'PATCH',
        data: payload,
      }),
      invalidatesTags: (_result, _error, { userStoryId, projectId }) => [
        { type: 'UserStoryDetail', id: userStoryId },
        { type: 'UserStories' },
        { type: 'Board', id: `${projectId}_STORIES` },
        { type: 'Board' },
        { type: 'Sprints' },
      ],
    }),

    deleteUserStory: build.mutation<
      DeleteUserStoryResponse,
      { projectId: string; userStoryId: string }
    >({
      query: ({ projectId, userStoryId }) => ({
        url: DELETE_USERSTORY.replace('{project_id}', projectId).replace(
          '{user_story_id}',
          userStoryId,
        ),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { userStoryId, projectId }) => [
        { type: 'UserStoryDetail', id: userStoryId },
        { type: 'UserStories' },
        { type: 'Board', id: `${projectId}_STORIES` },
        { type: 'Board' },
      ],
    }),

    updateTask: build.mutation<
      UpdateTaskResponse,
      { projectId: string; taskId: string; payload: UpdateTaskPayload }
    >({
      query: ({ projectId, taskId, payload }) => ({
        url: UPDATE_TASKS.replace('{project_id}', projectId).replace(
          '{task_id}',
          taskId,
        ),
        method: 'PATCH',
        data: payload,
      }),
      invalidatesTags: (_result, _error, { projectId, taskId }) => [
        { type: 'TaskDetail', id: `${projectId}_${taskId}` },
        { type: 'Tasks' },
        { type: 'Board', id: `${projectId}_STORIES` },
        { type: 'Board' },
      ],
    }),

    uploadUserStoryAttachment: build.mutation<
      UploadUserStoryAttachmentResponse,
      UploadUserStoryAttachmentParams
    >({
      queryFn: async args => {
        const data = await uploadUserStoryAttachmentService(args);
        return { data };
      },
      invalidatesTags: (_result, _error, { userStoryId }) => [
        { type: 'Attachments', id: `userStory_${userStoryId}` },
      ],
    }),

    deleteUserStoryAttachment: build.mutation<
      DeleteUserStoryAttachmentResponse,
      DeleteUserStoryAttachmentParams
    >({
      query: ({ projectId, userStoryId, attachmentId }) => ({
        url: DELETEUSATTACHMENT.replace('{project_id}', projectId)
          .replace('{user_story_id}', userStoryId)
          .replace('{attachment_id}', attachmentId),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { userStoryId }) => [
        { type: 'Attachments', id: `userStory_${userStoryId}` },
      ],
    }),

    uploadTaskAttachment: build.mutation<
      UploadTaskCommentAttachmentResponse,
      UploadTaskCommentAttachmentParams
    >({
      queryFn: async args => ({
        data: await uploadTaskAttachmentService(args),
      }),

      invalidatesTags: (_result, _error, { taskId }) => [
        { type: 'Attachments', id: `task_${taskId}` },
      ],
    }),

    deleteTaskAttachment: build.mutation<
      DeleteTaskCommentAttachmentResponse,
      DeleteTaskCommentAttachmentParams
    >({
      query: ({ projectId, taskId, attachmentId }) => ({
        url: DELETETASKATTACHMENT.replace('{project_id}', projectId)
          .replace('{task_id}', taskId)
          .replace('{attachment_id}', attachmentId),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { taskId }) => [
        { type: 'Attachments', id: `task_${taskId}` },
      ],
    }),

    createUserStoryComment: build.mutation<
      CreateUserStoryCommentResponse,
      CreateUserStoryCommentParams
    >({
      query: ({ projectId, userStoryId, content, parentCommentId }) => ({
        url: USERSTORIES_COMMENT.replace('{project_id}', projectId).replace(
          '{user_story_id}',
          userStoryId,
        ),
        method: 'POST',
        data: { content, parent_comment_id: parentCommentId },
      }),
      invalidatesTags: (_result, _error, { userStoryId }) => [
        { type: 'Comments', id: `userStory_${userStoryId}` },
      ],
    }),

    updateUserStoryComment: build.mutation<
      UpdateUserStoryCommentResponse,
      UpdateUserStoryCommentParams
    >({
      query: ({ projectId, userStoryId, commentId, content }) => ({
        url: USERSTORIES_COMMENT_BY_ID.replace('{project_id}', projectId)
          .replace('{user_story_id}', userStoryId)
          .replace('{comment_id}', commentId),
        method: 'PATCH',
        data: { content },
      }),
      invalidatesTags: (_result, _error, { userStoryId }) => [
        { type: 'Comments', id: `userStory_${userStoryId}` },
      ],
    }),

    deleteUserStoryComment: build.mutation<
      DeleteUserStoryCommentResponse,
      DeleteUserStoryCommentParams
    >({
      query: ({ projectId, userStoryId, commentId }) => ({
        url: USERSTORIES_COMMENT_BY_ID.replace('{project_id}', projectId)
          .replace('{user_story_id}', userStoryId)
          .replace('{comment_id}', commentId),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { userStoryId }) => [
        { type: 'Comments', id: `userStory_${userStoryId}` },
      ],
    }),

    createTaskComment: build.mutation<
      CreateTaskCommentResponse,
      CreateTaskCommentParams
    >({
      query: ({ taskId, content, parentCommentId }) => ({
        url: TASK_COMMENT.replace('{task_id}', taskId),
        method: 'POST',
        data: { content, parent_comment_id: parentCommentId },
      }),
      invalidatesTags: (_result, _error, { taskId }) => [
        { type: 'Comments', id: `task_${taskId}` },
      ],
    }),

    updateTaskComment: build.mutation<
      UpdateCommentResponse,
      UpdateCommentParams
    >({
      query: ({ taskId, commentId, content }) => ({
        url: TASK_COMMENT_ID.replace('{task_id}', taskId).replace(
          '{comment_id}',
          commentId,
        ),
        method: 'PATCH',
        data: { content },
      }),
      invalidatesTags: (_result, _error, { taskId }) => [
        { type: 'Comments', id: `task_${taskId}` },
      ],
    }),

    deleteTaskComment: build.mutation<
      DeleteCommentResponse,
      DeleteCommentParams
    >({
      query: ({ taskId, commentId }) => ({
        url: TASK_COMMENT_ID.replace('{task_id}', taskId).replace(
          '{comment_id}',
          commentId,
        ),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { taskId }) => [
        { type: 'Comments', id: `task_${taskId}` },
      ],
    }),

    createTask: build.mutation<
      CreateTaskResponse,
      { projectId: string; payload: CreateTaskPayload }
    >({
      query: ({ projectId, payload }) => {
        const cleanPayload = { ...payload };
        if ((cleanPayload as any).sprint_id === 'all' || !(cleanPayload as any).sprint_id) {
          delete (cleanPayload as any).sprint_id;
        }
        return {
          url: CREATE_TASK.replace('{project_id}', projectId),
          method: 'POST',
          data: cleanPayload,
        };
      },
      invalidatesTags: (_result, _error, { projectId, payload }) => [
        { type: 'Tasks', id: `${projectId}_${payload.user_story_id ?? 'all'}` },
        { type: 'Tasks', id: `${projectId}_unassigned` },
        ...(payload.user_story_id
          ? [{ type: 'UserStoryDetail' as const, id: payload.user_story_id }]
          : []),
      ],
    }),

    uploadUserStoryCommentAttachment: build.mutation<
      UploadUserStoryCommentAttachmentResponse,
      UploadUserStoryCommentAttachmentParams
    >({
      queryFn: async args => ({
        data: await uploadUserStoryCommentAttachmentService(args),
      }),

      invalidatesTags: (_result, _error, { userStoryId }) => [
        { type: 'Comments', id: `userStory_${userStoryId}` },
      ],
    }),

    uploadTaskCommentAttachment: build.mutation<
      TaskCommentAttachmentResponse,
      UploadTaskCommentByTaskAttachmentParams
    >({
      queryFn: async args => ({
        data: await uploadTaskCommentAttachmentService(args),
      }),

      invalidatesTags: (_result, _error, { taskId }) => [
        { type: 'Comments', id: `task_${taskId}` },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUserStoryByIdQuery,
  useCreateUserStoryMutation,
  useUpdateUserStoryMutation,
  useDeleteUserStoryMutation,
  useUpdateTaskMutation,
  useCreateTaskMutation,
  useGetTaskByIdQuery,
  useGetUserStoryCommentsQuery,
  useGetTaskCommentsQuery,
  useGetUserStoryCommentRepliesQuery,
  useGetTaskCommentRepliesQuery,
  useLazyGetUserStoryCommentRepliesQuery,
  useLazyGetTaskCommentRepliesQuery,
  useGetTasksQuery,
  useGetUserStoryAttachmentsQuery,
  useGetTaskAttachmentsQuery,
  useUploadUserStoryAttachmentMutation,
  useDeleteUserStoryAttachmentMutation,
  useUploadTaskAttachmentMutation,
  useDeleteTaskAttachmentMutation,
  useCreateUserStoryCommentMutation,
  useUpdateUserStoryCommentMutation,
  useDeleteUserStoryCommentMutation,
  useCreateTaskCommentMutation,
  useUpdateTaskCommentMutation,
  useDeleteTaskCommentMutation,
  useUploadUserStoryCommentAttachmentMutation,
  useUploadTaskCommentAttachmentMutation,
} = userStoryApi;
