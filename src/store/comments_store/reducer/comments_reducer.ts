import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  CommentsState,
  GetUserStoryCommentsResponse,
  GetTaskCommentsResponse,
} from '../../../types/comments.type';
import {
  fetchUserStoryComments,
  fetchTaskComments,
  createTaskComment,
  updateTaskComment,
  deleteTaskComment,
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
      const index = state.comments.findIndex(
        c => c.id === action.payload.commentId,
      );
      if (index !== -1) {
        state.comments[index].content = action.payload.content;
      }
    },
    deleteCommentLocally: (state, action: PayloadAction<string>) => {
      state.comments = state.comments.filter(c => c.id !== action.payload);
    },
    setComments: (state, action: PayloadAction<any[]>) => {
      state.comments = action.payload;
    },
    addCommentLocally: (state, action: PayloadAction<any>) => {
      state.comments.unshift(action.payload);
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
      });
  },
});

export const {
  clearCommentsState,
  updateCommentLocally,
  deleteCommentLocally,
  setComments,
  addCommentLocally,
} = commentsSlice.actions;
export default commentsSlice.reducer;
