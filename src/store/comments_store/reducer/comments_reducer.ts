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
} from '../action/comments.thunk';

const initialState: CommentsState = {
  comments: [],
  meta: null,
  loading: false,
  error: null,
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
          const incoming = Array.isArray(incomingData) ? incomingData[0] : (incomingData as unknown as CommentItem);
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
      );
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
} = commentsSlice.actions;
export default commentsSlice.reducer;
