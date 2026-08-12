import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
}

const initialState: HomeState = {
  loading: false,
  activeTab: 'viewed',
  quickAccessItems: [], // Set to empty array initially
  isSearching: false,
  searchQuery: '',
  selectedFilter: null,
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
});

export const {
  setLoading,
  setActiveTab,
  setIsSearching,
  setSearchQuery,
  setSelectedFilter,
  addQuickAccessItem,
  removeQuickAccessItem,
} = homeSlice.actions;

export default homeSlice.reducer;
