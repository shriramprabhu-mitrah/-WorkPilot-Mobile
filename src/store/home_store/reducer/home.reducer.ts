import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Activity, User } from '../../../types/home.type';
import { getAudit } from '../action/home.thunk';

export interface QuickAccessItem {
  id: string;
  title: string;
  subtitle?: string;
  type: string;
}

interface HomeState {
  loading: boolean;
  activeTab: 'viewed' | 'activity';
  quickAccessItems: QuickAccessItem[];
  isSearching: boolean;
  searchQuery: string;
  selectedFilter: string | null;
  isProjectSheetVisible: boolean;
  user: User | null;
  activities: Activity[];
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
};

const MAX_LIMIT = 6;

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<'viewed' | 'activity'>) => {
      state.activeTab = action.payload;
    },
    setIsSearching: (state, action: PayloadAction<boolean>) => {
      state.isSearching = action.payload;
      if (!action.payload) state.searchQuery = '';
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
        if (action.payload) {
          state.user = action.payload.user ?? null;
          state.activities = action.payload.activities ?? [];
        }
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
  addQuickAccessItem,
  removeQuickAccessItem,
} = homeSlice.actions;

export default homeSlice.reducer;
