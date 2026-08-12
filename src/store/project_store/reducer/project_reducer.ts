import { createSlice } from '@reduxjs/toolkit';
import { ProjectState } from '../../../types/project.type';
import { getAllProjectInfo } from '../action/project_thunk';

const initialState: ProjectState = {
  projects: [],
  loading: false,
  error: null,
};

const projectSlice = createSlice({
  name: 'project',
  initialState,

  reducers: {},

  extraReducers: builder => {
    builder
      .addCase(getAllProjectInfo.pending, state => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getAllProjectInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.projects = action.payload.data;
      })

      .addCase(getAllProjectInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch projects';
      });
  },
});

export default projectSlice.reducer;
