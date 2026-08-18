import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  CommentsState,
  GetUserStoryCommentsResponse,
} from '../../../types/comments.type';
import { fetchUserStoryComments } from '../action/comments.thunk';

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
      });
  },
});

export const { clearCommentsState } = commentsSlice.actions;
export default commentsSlice.reducer;
