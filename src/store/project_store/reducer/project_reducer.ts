import { createSlice } from '@reduxjs/toolkit';
import { Project, ProjectState } from '../../../types/project.type';
import { getAllProjectInfo } from '../action/project_thunk';

const initialState: ProjectState = {
  projects: [],
  loading: false,
  isFetchingMore: false,
  page: 1,
  hasMore: true,
  error: null,
};

const projectSlice = createSlice({
  name: 'project',
  initialState,

  reducers: {
    resetProjects: state => {
      state.projects = [];
      state.page = 1;
      state.hasMore = true;
      state.error = null;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(getAllProjectInfo.pending, (state, action) => {
        const isFirstPage = (action.meta.arg?.page || 1) === 1;
        if (isFirstPage) {
          state.loading = true;
        } else {
          state.isFetchingMore = true;
        }
        state.error = null;
      })

      .addCase(getAllProjectInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.isFetchingMore = false;
        state.error = null;

        const fetchedProjects = action.payload.response.data || [];
        const currentPage = action.payload.page;

        if (currentPage === 1) {
          state.projects = fetchedProjects;
        } else {
          const existingIds = new Set(state.projects.map(p => p.id));
          const uniqueNewProjects = fetchedProjects.filter(
            (p: Project) => !existingIds.has(p.id),
          );
          state.projects = [...state.projects, ...uniqueNewProjects];
        }

        state.page = currentPage;
        state.hasMore =
          fetchedProjects.length >= (action.meta.arg?.page_size || 10);
      })

      .addCase(getAllProjectInfo.rejected, (state, action) => {
        state.loading = false;
        state.isFetchingMore = false;
        state.error = action.payload ?? 'Failed to fetch projects';
      });
  },
});

export const { resetProjects } = projectSlice.actions;
export default projectSlice.reducer;
