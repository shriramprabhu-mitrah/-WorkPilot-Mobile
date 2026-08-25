import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  GetBurndownResponse,
  GetTaskByIdResponse,
  Project,
  ProjectState,
  Sprint,
  SprintBurndownData,
  Task,
  TaskData,
  UserStory,
  UserStoryDetail,
  UserStoryMeta,
} from '../../../types/project.type';
import {
  getAllProjectInfo,
  getBurndownChartThunk,
  getProjectById,
  getRecentProjects,
  getSprintByIdThunk,
  getSprintsThunk,
  getTaskById,
  getUserStories,
  getUserStoryById,
  updateUserStory,
} from '../action/project_thunk';
import {
  CustomStatus,
  UserStoryStatusItem,
} from '../../../types/customstatus.type';
import {
  getCustomStatusData,
  getUserStoryStatusData,
} from '../../customStatus_store/action/customstatus.thunk';
import { getTasks, updateTaskThunk } from '../../task_store/action/task.thunk';
import { TaskMeta } from '../../../types/task.type';

export interface TaskFilterState {
  status: string | null;
  assignee: string | null;
  priority: string | null;
  type: string | null;
}

// Extended Initial State
const initialState: ProjectState & {
  projectName: string;
  tasks: Task[];
  tasksMeta: TaskMeta | null;
  loadingMore: boolean;
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
  customStatuses: CustomStatus[];
  customStatusLoading: boolean;
  customStatusError: string | null;
  userStoryStatuses: UserStoryStatusItem[];
  userStoryStatusLoading: boolean;
  userStoryStatusError: string | null;
  taskUpdateLoading: boolean;
  taskUpdateError: string | null;
  getCurrentSprintLoading: boolean;
  burndownData: SprintBurndownData | null;
  burndownLoading: boolean;
  burndownError: any | null;
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
  tasks: [] as Task[],
  tasksMeta: null,
  loadingMore: false,
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
  customStatuses: [],
  customStatusLoading: false,
  customStatusError: null,
  userStoryStatuses: [],
  userStoryStatusLoading: false,
  userStoryStatusError: null,

  taskUpdateLoading: false,
  taskUpdateError: null,
  getCurrentSprintLoading: false,
  burndownData: null,
  burndownLoading: false,
  burndownError: null,
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

    resetSprints: state => {
      state.sprints = [];
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

    setTasks: (state, action: PayloadAction<Task[]>) => {
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
        const totalPages = action.payload.response?.meta?.total_pages ?? 1;

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
        state.hasMore = currentPage < totalPages;
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
      .addCase(getSprintsThunk.pending, (state, action) => {
        const isFirstPage = (action.meta.arg?.page || 1) === 1;
        if (isFirstPage) {
          state.loading = true;
        } else {
          state.isFetchingMore = true;
        }
        state.error = null;
      })
      .addCase(getSprintsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isFetchingMore = false;
        state.error = null;

        const fetchedSprints = action.payload.response.data || [];
        const currentPage = action.payload.page;
        const totalPages = action.payload.response.meta?.total_pages ?? 1;

        if (currentPage === 1) {
          state.sprints = fetchedSprints;
        } else {
          const existingIds = new Set(state.sprints.map((s: Sprint) => s.id));
          const uniqueNewSprints = fetchedSprints.filter(
            (s: Sprint) => !existingIds.has(s.id),
          );
          state.sprints = [...state.sprints, ...uniqueNewSprints];
        }

        state.page = currentPage;
        state.hasMore = currentPage < totalPages;
      })
      .addCase(getSprintsThunk.rejected, (state, action) => {
        state.loading = false;
        state.isFetchingMore = false;
        state.error = action.payload ?? 'Failed to fetch sprints';
      })
      .addCase(getSprintByIdThunk.fulfilled, (state, action) => {
        state.getCurrentSprintLoading = false;
        state.error = null;
        state.currentSprint = action.payload.data;
      })
      .addCase(getSprintByIdThunk.rejected, (state, action) => {
        state.getCurrentSprintLoading = false;
        state.error = action.payload ?? 'Failed to fetch sprint';
      })
      .addCase(getSprintByIdThunk.pending, state => {
        state.getCurrentSprintLoading = true;
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
      })
      .addCase(getCustomStatusData.pending, state => {
        state.customStatusLoading = true;
        state.customStatusError = null;
      })

      .addCase(getCustomStatusData.fulfilled, (state, action) => {
        state.customStatusLoading = false;
        state.customStatusError = null;
        state.customStatuses = action.payload.data || [];
      })

      .addCase(getCustomStatusData.rejected, (state, action) => {
        state.customStatusLoading = false;
        state.customStatusError =
          action.payload ?? 'Failed to fetch custom statuses';
      })
      .addCase(getUserStoryStatusData.pending, state => {
        state.userStoryStatusLoading = true;
        state.userStoryStatusError = null;
      })

      .addCase(getUserStoryStatusData.fulfilled, (state, action) => {
        state.userStoryStatusLoading = false;
        state.userStoryStatusError = null;
        state.userStoryStatuses = action.payload.data || [];
      })

      .addCase(getUserStoryStatusData.rejected, (state, action) => {
        state.userStoryStatusLoading = false;
        state.userStoryStatusError =
          action.payload ?? 'Failed to fetch user story statuses';
      })
      // .addCase(updateTaskThunk.pending, state => {
      //   state.taskUpdateLoading = true;
      //   state.taskUpdateError = null;
      // })

      // .addCase(updateTaskThunk.fulfilled, state => {
      //   state.taskUpdateLoading = false;
      //   state.taskUpdateError = null;
      // })

      // .addCase(updateTaskThunk.rejected, (state, action) => {
      //   state.taskUpdateLoading = false;
      //   state.taskUpdateError = action.payload ?? 'Failed to update task';
      // })
      .addCase(getBurndownChartThunk.pending, state => {
        state.burndownLoading = true;
        state.burndownError = null;
      })

      .addCase(getBurndownChartThunk.fulfilled, (state, action) => {
        state.burndownLoading = false;
        state.burndownError = null;
        state.burndownData = action.payload.data;
      })

      .addCase(getBurndownChartThunk.rejected, (state, action) => {
        state.burndownLoading = false;
        state.burndownError =
          action.payload ?? 'Failed to fetch burndown chart data';
      })
      .addCase(getTasks.pending, (state, action) => {
        const isFirstPage = (action.meta.arg?.page || 1) === 1;
        if (isFirstPage) {
          state.loading = true;
        } else {
          state.loadingMore = true;
        }
        state.error = null;
      })
      .addCase(getTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = null;
        state.tasksMeta = action.payload.meta;
        const incoming = action.payload.data || [];
        if ((action.meta.arg?.page || 1) === 1) {
          state.tasks = incoming;
        } else {
          const existingIds = new Set(state.tasks.map(t => t.id));
          const uniqueNew = incoming.filter(t => !existingIds.has(t.id));
          state.tasks = [...state.tasks, ...uniqueNew];
        }
      })
      .addCase(getTasks.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload ?? 'Failed to fetch tasks';
      })
      // .addCase(getCustomStatusData.pending, state => {
      //   state.customStatusLoading = true;
      //   state.customStatusError = null;
      // })

      // .addCase(getCustomStatusData.fulfilled, (state, action) => {
      //   state.customStatusLoading = false;
      //   state.customStatusError = null;
      //   state.customStatuses = action.payload.data || [];
      // })

      // .addCase(getCustomStatusData.rejected, (state, action) => {
      //   state.customStatusLoading = false;
      //   state.customStatusError =
      //     action.payload ?? 'Failed to fetch custom statuses';
      // })
      .addCase(updateTaskThunk.pending, state => {
        state.taskUpdateLoading = true;
        state.taskUpdateError = null;
      })

      .addCase(updateTaskThunk.fulfilled, (state, action) => {
        state.taskUpdateLoading = false;
        state.taskUpdateError = null;
        const updatedTask = action.payload?.data as TaskData | undefined;
        if (
          updatedTask &&
          state.selectedTask &&
          updatedTask.id === state.selectedTask.id
        ) {
          state.selectedTask = {
            ...state.selectedTask,
            ...updatedTask,
          };
        }
      })

      .addCase(updateTaskThunk.rejected, (state, action) => {
        state.taskUpdateLoading = false;
        state.taskUpdateError = action.payload ?? 'Failed to update task';
      })

      .addCase(updateUserStory.fulfilled, (state, action) => {
        const updatedStory = action.payload?.data;
        if (
          updatedStory &&
          state.selectedUserStory &&
          updatedStory.id === state.selectedUserStory.id
        ) {
          state.selectedUserStory = {
            ...state.selectedUserStory,
            ...updatedStory,
          };
        }
      })

      .addCase(updateUserStory.rejected, (state, action) => {
        state.userStoryDetailError =
          action.payload ?? 'Failed to update user story';
      });
  },
});

export const {
  getProjectName,
  resetProjects,
  resetSprints,
  setSelectedDate,
  setFilter,
  resetFilters,
  setTasks,
} = projectSlice.actions;

export default projectSlice.reducer;
