import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project, ProjectState } from '../../../types/project.type';
import { getAllProjectInfo, getProjectById } from '../action/project_thunk';

const mockTasks = [
  {
    id: '1',
    key: 'SCRUM-6',
    title: 'Frf',
    status: 'To Do',
    dueDate: '2026-08-13',
    priority: 'Medium',
    assignee: 'John Doe',
    type: 'Task',
  },
  {
    id: '2',
    key: 'SCRUM-12',
    title: 'Fix Navigation Bug',
    status: 'In Progress',
    dueDate: '2026-08-13',
    priority: 'High',
    assignee: 'Jane Smith',
    type: 'Bug',
  },
  {
    id: '3',
    key: 'SCRUM-15',
    title: 'Design System Review',
    status: 'Done',
    dueDate: '2026-08-14',
    priority: 'Low',
    assignee: 'John Doe',
    type: 'Story',
  },
  {
    id: '4',
    key: 'SCRUM-20',
    title: 'Update API Endpoints',
    status: 'To Do',
    dueDate: '2026-08-19',
    priority: 'High',
    assignee: 'Alex',
    type: 'Task',
  },
];

export interface TaskItem {
  id: string;
  key: string;
  title: string;
  status: string;
  dueDate: string;
  priority?: string;
  assignee?: string;
  type?: string;
}

export interface TaskFilterState {
  status: string | null;
  assignee: string | null;
  priority: string | null;
  type: string | null;
}

// Extended Initial State
const initialState: ProjectState & {
  tasks: TaskItem[];
  selectedDate: string;
  filters: TaskFilterState;
} = {
  projects: [],
  project: null,
  loading: false,
  isFetchingMore: false,
  page: 1,
  hasMore: true,
  error: null,

  // Calendar & Task States
  tasks: mockTasks as TaskItem[],
  selectedDate: '2026-08-13',
  filters: {
    status: null,
    assignee: null,
    priority: null,
    type: null,
  },
};

const projectSlice = createSlice({
  name: 'project',
  initialState,

  reducers: {
    resetProjects: state => {
      state.projects = [];
      state.project = null;
      state.page = 1;
      state.hasMore = true;
      state.error = null;
    },

    // Task & Calendar Actions
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },

    setFilter: (
      state,
      action: PayloadAction<{
        key: keyof TaskFilterState;
        value: string | null;
      }>,
    ) => {
      state.filters[action.payload.key] = action.payload.value;
    },

    resetFilters: state => {
      state.filters = {
        status: null,
        assignee: null,
        priority: null,
        type: null,
      };
    },

    setTasks: (state, action: PayloadAction<TaskItem[]>) => {
      state.tasks = action.payload;
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
      })
      .addCase(getProjectById.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.project = action.payload;
      })
      .addCase(getProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch project';
        state.project = null;
      });
  },
});

export const {
  resetProjects,
  setSelectedDate,
  setFilter,
  resetFilters,
  setTasks,
} = projectSlice.actions;

export default projectSlice.reducer;
