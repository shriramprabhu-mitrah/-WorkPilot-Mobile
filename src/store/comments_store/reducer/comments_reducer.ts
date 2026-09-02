import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  CommentItem,
  CommentsState,
  GetUserStoryCommentByIdResponse,
  GetUserStoryCommentRepliesResponse,
  GetUserStoryCommentsResponse,
  GetTaskCommentsResponse,
} from '../../../types/comments.type';
import {
  Attachment,
  UploadUserStoryCommentAttachmentResponse,
  TaskCommentAttachmentResponse,
} from '../../../types/attachment.type';
import {
  fetchUserStoryComments,
  fetchTaskComments,
  createTaskComment,
  updateTaskComment,
  deleteTaskComment,
  fetchTaskCommentReplies,
  createUserStoryComment,
  getUserStoryCommentById,
  updateUserStoryComment,
  deleteUserStoryComment,
  fetchUserStoryCommentReplies,
  uploadUserStoryCommentAttachment,
  uploadTaskCommentAttachment,
} from '../action/comments.thunk';
export interface ExtendedCommentsState extends CommentsState {
  userStoryCommentAttachments: Attachment[];
  taskCommentAttachments: Attachment[];
  uploading: boolean;
  deleting: boolean;
  refreshing: boolean;
}

const initialState: ExtendedCommentsState = {
  comments: [],
  meta: null,
  loading: false,
  error: null,
  userStoryCommentAttachments: [],
  taskCommentAttachments: [],
  uploading: false,
  deleting: false,
  refreshing: false,
};

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearCommentsState: state => {
      state.comments = [];
      state.meta = null;
      state.loading = false;
      state.error = null;
    },
    updateCommentLocally: (
      state,
      action: PayloadAction<{ commentId: string; content: string }>,
    ) => {
      const comments = state.comments;
      const index = comments.findIndex(c => c.id === action.payload.commentId);
      if (index !== -1) {
        comments[index].content = action.payload.content;
      }
    },
    deleteCommentLocally: (state, action: PayloadAction<string>) => {
      const comments = state.comments;
      state.comments = comments.filter(c => c.id !== action.payload);
    },
    setComments: (state, action: PayloadAction<CommentItem[]>) => {
      state.comments = action.payload;
    },
    addCommentLocally: (state, action: PayloadAction<CommentItem>) => {
      state.comments.unshift(action.payload);
    },
    replaceCommentLocally: (
      state,
      action: PayloadAction<{ oldId: string; comment: CommentItem }>,
    ) => {
      const comments = state.comments;
      const index = comments.findIndex(c => c.id === action.payload.oldId);
      if (index !== -1) {
        comments[index] = action.payload.comment;
      }
    },
    incrementReplyCount: (state, action: PayloadAction<string>) => {
      const comments = state.comments;
      const target = comments.find(c => c.id === action.payload);
      if (target) {
        target.replies_count = (target.replies_count ?? 0) + 1;
      }
    },
    decrementReplyCount: (state, action: PayloadAction<string>) => {
      const comments = state.comments;
      const target = comments.find(c => c.id === action.payload);
      if (target) {
        target.replies_count = Math.max(0, (target.replies_count ?? 0) - 1);
      }
    },
    markCommentFailed: (state, action: PayloadAction<string>) => {
      const comments = state.comments;
      const index = comments.findIndex(c => c.id === action.payload);
      if (index !== -1) {
        const target = comments[index] as any;
        target.is_pending = false;
        target.is_failed = true;
        target.retry_count = (target.retry_count || 0) + 1;

        // Initial failure = 1, Retry 1 = 2, Retry 2 = 3, Retry 3 = 4.
        if (target.retry_count >= 4) {
          state.comments.splice(index, 1);
        }
      }
    },
    clearCommentAttachmentsState: state => {
      state.userStoryCommentAttachments = [];
      state.taskCommentAttachments = [];
      state.loading = false;
      state.uploading = false;
      state.deleting = false;
      state.refreshing = false;
      state.error = null;
    },
    clearUserStoryCommentAttachments: state => {
      state.userStoryCommentAttachments = [];
    },
    clearTaskCommentAttachments: state => {
      state.taskCommentAttachments = [];
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchUserStoryComments.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserStoryComments.fulfilled,
        (state, action: PayloadAction<GetUserStoryCommentsResponse>) => {
          state.loading = false;
          state.comments = action.payload.data;
          state.meta = action.payload.meta;
        },
      )
      .addCase(fetchUserStoryComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch user story comments';
      })
      .addCase(fetchTaskComments.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchTaskComments.fulfilled,
        (state, action: PayloadAction<GetTaskCommentsResponse>) => {
          state.loading = false;
          state.comments = action.payload.data;
          state.meta = action.payload.meta;
        },
      )
      .addCase(fetchTaskComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch task comments';
      })
      .addCase(createTaskComment.pending, state => {
        state.error = null;
      })
      .addCase(createTaskComment.fulfilled, state => {
        state.loading = false;
      })
      .addCase(createTaskComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create task comment';
      })
      .addCase(updateTaskComment.rejected, (state, action) => {
        state.error = action.payload || 'Failed to update comment';
      })
      .addCase(deleteTaskComment.rejected, (state, action) => {
        state.error = action.payload || 'Failed to delete comment';
      })
      .addCase(
        fetchTaskCommentReplies.fulfilled,
        (state, action: PayloadAction<GetTaskCommentsResponse>) => {
          const incoming = action.payload?.data || [];
          const comments = state.comments;
          const existingIds = new Set(comments.map(c => c.id));
          incoming.forEach(c => {
            if (!existingIds.has(c.id)) {
              comments.push(c);
            }
          });
        },
      )
      .addCase(createUserStoryComment.pending, state => {
        state.error = null;
      })
      .addCase(createUserStoryComment.fulfilled, state => {
        state.loading = false;
      })
      .addCase(createUserStoryComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create user story comment';
      })
      .addCase(getUserStoryCommentById.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getUserStoryCommentById.fulfilled,
        (state, action: PayloadAction<GetUserStoryCommentByIdResponse>) => {
          state.loading = false;
          const incomingData = action.payload?.data;
          const incoming = Array.isArray(incomingData)
            ? incomingData[0]
            : (incomingData as unknown as CommentItem);
          if (incoming?.id) {
            const comments = state.comments;
            const index = comments.findIndex(c => c.id === incoming.id);
            if (index !== -1) {
              comments[index] = incoming;
            }
          }
        },
      )
      .addCase(getUserStoryCommentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch user story comment';
      })
      .addCase(updateUserStoryComment.rejected, (state, action) => {
        state.error = action.payload || 'Failed to update user story comment';
      })
      .addCase(deleteUserStoryComment.rejected, (state, action) => {
        state.error = action.payload || 'Failed to delete user story comment';
      })
      .addCase(
        fetchUserStoryCommentReplies.fulfilled,
        (state, action: PayloadAction<GetUserStoryCommentRepliesResponse>) => {
          const incoming = action.payload?.data || [];
          const comments = state.comments;
          const existingIds = new Set(comments.map(c => c.id));
          incoming.forEach(c => {
            if (!existingIds.has(c.id)) {
              comments.push(c);
            }
          });
        },
      )
      .addCase(uploadUserStoryCommentAttachment.pending, state => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(
        uploadUserStoryCommentAttachment.fulfilled,
        (
          state,
          action: PayloadAction<UploadUserStoryCommentAttachmentResponse>,
        ) => {
          state.uploading = false;
          const dataList = action.payload?.data;
          const uploaded =
            Array.isArray(dataList) && dataList.length > 0
              ? dataList[0]
              : undefined;
          if (uploaded?.id) {
            const attachment: Attachment = {
              id: uploaded.id,
              project_id: uploaded.project_id,
              user_story_id: uploaded.user_story_id,
              comment_id: uploaded.comment_id,
              original_filename: uploaded.original_filename,
              mime_type: uploaded.mime_type,
              file_size: uploaded.file_size,
              url: uploaded.url,
              uploaded_by: uploaded.uploaded_by,
              uploaded_by_name: uploaded.uploaded_by_name,
              uploaded_at: uploaded.uploaded_at,
              updated_at: uploaded.updated_at,
            };
            const existingIds = new Set(
              state.userStoryCommentAttachments.map(a => a.id),
            );
            if (!existingIds.has(attachment.id)) {
              state.userStoryCommentAttachments.push(attachment);
            }
          }
        },
      )
      .addCase(uploadUserStoryCommentAttachment.rejected, (state, action) => {
        state.uploading = false;
        state.error =
          action.payload || 'Failed to upload user story comment attachment';
      })
      .addCase(uploadTaskCommentAttachment.pending, state => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(
        uploadTaskCommentAttachment.fulfilled,
        (state, action: PayloadAction<TaskCommentAttachmentResponse>) => {
          state.uploading = false;
          const dataList = action.payload?.data;
          const uploaded =
            Array.isArray(dataList) && dataList.length > 0
              ? dataList[0]
              : undefined;
          if (uploaded?.id) {
            const attachment: Attachment = {
              id: uploaded.id,
              project_id: uploaded.project_id,
              task_id: uploaded.task_id,
              comment_id: uploaded.comment_id,
              original_filename: uploaded.original_filename,
              mime_type: uploaded.mime_type,
              file_size: uploaded.file_size,
              url: uploaded.url,
              uploaded_by: uploaded.uploaded_by,
              uploaded_by_name: uploaded.uploaded_by_name,
              uploaded_at: uploaded.uploaded_at,
              updated_at: uploaded.updated_at,
            };
            const existingIds = new Set(
              state.taskCommentAttachments.map(a => a.id),
            );
            if (!existingIds.has(attachment.id)) {
              state.taskCommentAttachments.push(attachment);
            }
          }
        },
      )
      .addCase(uploadTaskCommentAttachment.rejected, (state, action) => {
        state.uploading = false;
        state.error =
          action.payload || 'Failed to upload task comment attachment';
      });
  },
});

export const {
  clearCommentsState,
  updateCommentLocally,
  deleteCommentLocally,
  setComments,
  addCommentLocally,
  replaceCommentLocally,
  incrementReplyCount,
  decrementReplyCount,
  markCommentFailed,
  clearCommentAttachmentsState,
  clearUserStoryCommentAttachments,
  clearTaskCommentAttachments,
} = commentsSlice.actions;
export default commentsSlice.reducer;
