import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Activity,
  PaginationMeta,
  User,
  SearchResponse,
  UserInsights,
} from '../../../types/home.type';
import {
  getAudit,
  getUserInsightsData,
  globalSearchData,
} from '../action/home.thunk';

export interface QuickAccessItem {
  id: string;
  title: string;
  subtitle?: string;
  type: string;
}

interface HomeState {
  loading: boolean;
  activeTab: 'viewed' | 'favorites' | 'activity';
  quickAccessItems: QuickAccessItem[];
  isSearching: boolean;
  searchQuery: string;
  selectedFilter: string | null;
  searchResults: SearchResponse['data'];
  searchLoading: boolean;
  searchError: string | null;
  insights: UserInsights | null;
  insightsLoading: boolean;
  insightsError: string | null;
  isProjectSheetVisible: boolean;
  user: User | null;
  activities: Activity[];
  favorites: Activity[];
  meta: PaginationMeta | null;
}

const initialState: HomeState = {
  loading: false,
  activeTab: 'viewed',
  quickAccessItems: [],
  isSearching: false,
  searchQuery: '',
  selectedFilter: null,
  searchResults: {
    tasks: [],
    user_stories: [],
    projects: [],
    members: [],
    sprints: [],
  },
  searchLoading: false,
  searchError: null,
  insights: null,
  insightsLoading: false,
  insightsError: null,
  isProjectSheetVisible: false,
  user: null,
  activities: [],
  favorites: [],
  meta: null,
};

const MAX_LIMIT = 6;

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<'viewed' | 'favorites'>) => {
      state.activeTab = action.payload;
    },
    setIsSearching: (state, action: PayloadAction<boolean>) => {
      state.isSearching = action.payload;
      if (!action.payload) {
        state.searchQuery = '';
        state.searchResults = {
          tasks: [],
          user_stories: [],
          projects: [],
          members: [],
          sprints: [],
        };
        state.searchError = null;
      }
    },
    clearSearchResults: state => {
      state.searchResults = {
        tasks: [],
        user_stories: [],
        projects: [],
        members: [],
        sprints: [],
      };
      state.searchError = null;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedFilter: (state, action: PayloadAction<string | null>) => {
      state.selectedFilter = action.payload;
    },
    setProjectSheetVisible: (state, action: PayloadAction<boolean>) => {
      state.isProjectSheetVisible = action.payload;
    },
    resetAuditData: state => {
      state.activities = [];
      state.meta = null;
      state.loading = false;
    },
    addQuickAccessItem: (state, action: PayloadAction<QuickAccessItem>) => {
      const exists = state.quickAccessItems.some(
        item => item.id === action.payload.id,
      );
      if (!exists && state.quickAccessItems.length < MAX_LIMIT) {
        state.quickAccessItems.push(action.payload);
        state.isSearching = false;
        state.searchQuery = '';
      }
    },
    removeQuickAccessItem: (state, action: PayloadAction<string>) => {
      state.quickAccessItems = state.quickAccessItems.filter(
        item => item.id !== action.payload,
      );
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getAudit.pending, state => {
        state.loading = true;
      })
      .addCase(getAudit.fulfilled, (state, action) => {
        state.loading = false;
        if (!action.payload) {
          return;
        }
        const newActivities = action.payload.data.activities ?? [];
        const currentMeta = action.payload.meta ?? null;
        state.user = action.payload.data.user ?? state.user;
        const requestedPage = action.meta.arg.page;
        if (requestedPage === 1) {
          state.activities = newActivities;
        } else {
          const existingIds = new Set(
            state.activities.map(item => item.id?.toString()),
          );
          const uniqueActivities = newActivities.filter(item => {
            if (!item.id) {
              return true;
            }
            const id = item.id.toString();
            if (existingIds.has(id)) {
              return false;
            }
            existingIds.add(id);
            return true;
          });
          state.activities = [...state.activities, ...uniqueActivities];
        }
        state.meta = currentMeta;
      })
      .addCase(getAudit.rejected, state => {
        state.loading = false;
      })
      .addCase(globalSearchData.pending, state => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(globalSearchData.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchError = null;

        if (!action.payload) {
          return;
        }

        state.searchResults = action.payload.data ?? {
          tasks: [],
          user_stories: [],
          projects: [],
          members: [],
          sprints: [],
        };
      })
      .addCase(globalSearchData.rejected, (state, action) => {
        state.searchLoading = false;

        state.searchError = action.payload || 'Failed to fetch search results';
        state.searchResults = {
          tasks: [],
          user_stories: [],
          projects: [],
          members: [],
          sprints: [],
        };
      })
      .addCase(getUserInsightsData.pending, state => {
        state.insightsLoading = true;
        state.insightsError = null;
      })
      .addCase(getUserInsightsData.fulfilled, (state, action) => {
        state.insightsLoading = false;
        state.insightsError = null;
        if (!action.payload) {
          return;
        }
        state.insights = action.payload.data;
      })
      .addCase(getUserInsightsData.rejected, (state, action) => {
        state.insightsLoading = false;
        state.insightsError = action.payload || 'Failed to fetch user insights';
      });
  },
});

export const {
  setLoading,
  setActiveTab,
  setIsSearching,
  setSearchQuery,
  setSelectedFilter,
  setProjectSheetVisible,
  resetAuditData,
  addQuickAccessItem,
  removeQuickAccessItem,
  setUser,
  clearSearchResults,
} = homeSlice.actions;

export default homeSlice.reducer;
