import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Activity, PaginationMeta, User } from '../../../types/home.type';
import { getAudit } from '../action/home.thunk';
export interface QuickAccessItem {
  id: string;
  title: string;
  subtitle?: string;
  type: string;
}

interface HomeState {
  loading: boolean;
  activeTab: 'viewed' | 'favorites';
  quickAccessItems: QuickAccessItem[];
  isSearching: boolean;
  searchQuery: string;
  selectedFilter: string | null;
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
      }
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
} = homeSlice.actions;

export default homeSlice.reducer;
