import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  GetTaskByIdResponse,
  Project,
  ProjectState,
  Sprint,
  TaskData,
  UserStory,
  UserStoryDetail,
  UserStoryMeta,
} from '../../../types/project.type';
import {
  getAllProjectInfo,
  getProjectById,
  getRecentProjects,
  getSprintByIdThunk,
  getSprintsThunk,
  getTaskById,
  getUserStories,
  getUserStoryById,
} from '../action/project_thunk';

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
  projectName: string;
  tasks: TaskItem[];
  selectedDate: string;
  filters: TaskFilterState;
  userStories: UserStory[];
  userStoryMeta: UserStoryMeta | null;
  userStoryLoading: boolean;
  userStoryError: string | null;
  selectedUserStory: UserStoryDetail | null;
  userStoryDetailLoading: boolean;
  userStoryDetailError: string | null;
  selectedTask: TaskData | null;
  taskDetailLoading: boolean;
  taskDetailError: string | null;
} = {
  projectName: '',
  projects: [],
  project: null,
  loading: false,
  isFetchingMore: false,
  include_sprints: true,
  page: 1,
  hasMore: true,
  error: null,
  sprints: [],
  currentSprint: {} as Sprint,
  recentProjects: [],
  // Calendar & Task States
  tasks: mockTasks as TaskItem[],
  selectedDate: '2026-08-13',
  filters: {
    status: null,
    assignee: null,
    priority: null,
    type: null,
  },

  userStories: [],
  userStoryMeta: null,
  userStoryLoading: false,
  userStoryError: null,
  selectedUserStory: null,
  userStoryDetailLoading: false,
  userStoryDetailError: null,
  selectedTask: null,
  taskDetailLoading: false,
  taskDetailError: null,
};

const projectSlice = createSlice({
  name: 'project',
  initialState,

  reducers: {
    getProjectName: (state, action: PayloadAction<string>) => {
      state.projectName = action.payload;
    },
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
      })
      .addCase(getSprintsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.sprints = action.payload.data;
      })
      .addCase(getSprintsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch sprints';
      })
      .addCase(getSprintsThunk.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSprintByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.currentSprint = action.payload.data;
      })
      .addCase(getSprintByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to fetch sprint';
      })
      .addCase(getSprintByIdThunk.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRecentProjects.pending, state => {
        state.error = null;
      })

      .addCase(getRecentProjects.fulfilled, (state, action) => {
        state.recentProjects = action.payload;
      })

      .addCase(getRecentProjects.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to get recent projects';
      })
      .addCase(getUserStories.pending, state => {
        state.loading = true;
        state.userStoryError = null;
      })
      .addCase(getUserStories.fulfilled, (state, action) => {
        state.loading = false;
        state.userStoryError = null;
        state.userStories = action.payload.response.data || [];
        state.userStoryMeta = action.payload.response.meta || null;
      })
      .addCase(getUserStories.rejected, (state, action) => {
        state.loading = false;
        state.userStoryError = action.payload ?? 'Failed to fetch user stories';
      })
      .addCase(getUserStoryById.pending, state => {
        state.userStoryDetailLoading = true;
        state.userStoryDetailError = null;
      })
      .addCase(getUserStoryById.fulfilled, (state, action) => {
        state.userStoryDetailLoading = false;
        state.userStoryDetailError = null;
        state.selectedUserStory = action.payload.data;
      })
      .addCase(getUserStoryById.rejected, (state, action) => {
        state.userStoryDetailLoading = false;
        state.userStoryDetailError =
          action.payload ?? 'Failed to fetch user story details';
      })
      .addCase(getTaskById.pending, state => {
        state.loading = true;
        state.taskDetailError = null;
      })
      .addCase(
        getTaskById.fulfilled,
        (state, action: PayloadAction<GetTaskByIdResponse>) => {
          state.loading = false;
          state.taskDetailError = null;
          state.selectedTask = action.payload.data;
        },
      )
      .addCase(getTaskById.rejected, (state, action) => {
        state.loading = false;
        state.taskDetailError =
          action.payload ?? 'Failed to fetch task details';
      });
  },
});

export const {
  getProjectName,
  resetProjects,
  setSelectedDate,
  setFilter,
  resetFilters,
  setTasks,
} = projectSlice.actions;

export default projectSlice.reducer;
