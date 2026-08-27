import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  BoardCard,
  BoardColumn,
  FavoriteItem,
  FavoriteTaskItem,
  FavoriteUserStoryItem,
  PaginationMeta,
} from '../../../types/projectBoard.type';
import {
  favouriteTaskThunk,
  favouriteUserStoryThunk,
  getFavouritesThunk,
  unfavouriteTaskThunk,
  unfavouriteUserStoryThunk,
} from '../action/projectBoard.thunk';

export interface ProjectBoardState {
  columns: BoardColumn[];
  favoriteStoryIds: string[];
  favoriteTaskIds: string[];
  favorites: FavoriteItem[];
  favoritesTotal: number;
  favoritesTotalTasks: number;
  favoritesTotalUserStories: number;
  favoritesMeta: PaginationMeta | null;
  favoritesLoading: boolean;
  favoritesError: string | null;
  favouriteActionLoading: boolean;
  favouriteActionError: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectBoardState = {
  columns: [
    {
      id: 'todo',
      title: 'To Do',
      cards: [],
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      cards: [],
    },
    {
      id: 'in-review',
      title: 'In Review',
      cards: [],
    },
    {
      id: 'done',
      title: 'Done',
      cards: [],
    },
  ],
  favoriteStoryIds: [],
  favoriteTaskIds: [],
  favorites: [],
  favoritesTotal: 0,
  favoritesTotalTasks: 0,
  favoritesTotalUserStories: 0,
  favoritesMeta: null,
  favoritesLoading: false,
  favoritesError: null,
  favouriteActionLoading: false,
  favouriteActionError: null,
  loading: false,
  error: null,
};

const projectBoardSlice = createSlice({
  name: 'projectBoard',
  initialState,

  reducers: {
    /**
     * Toggle Favorite User Story
     */
    toggleStoryFavorite: (state, action: PayloadAction<string>) => {
      const storyId = action.payload;
      const index = state.favoriteStoryIds.indexOf(storyId);
      if (index >= 0) {
        state.favoriteStoryIds.splice(index, 1);
      } else {
        state.favoriteStoryIds.push(storyId);
      }
    },

    /**
     * Toggle Favorite Task
     */
    toggleTaskFavorite: (
      state,
      action: PayloadAction<string | { storyId?: string; taskId: string }>,
    ) => {
      const taskId =
        typeof action.payload === 'string'
          ? action.payload
          : action.payload.taskId;
      const index = state.favoriteTaskIds.indexOf(taskId);
      if (index >= 0) {
        state.favoriteTaskIds.splice(index, 1);
      } else {
        state.favoriteTaskIds.push(taskId);
      }
    },

    /**
     * Set complete board columns
     */
    setColumns: (state, action: PayloadAction<BoardColumn[]>) => {
      state.columns = action.payload;
    },

    /**
     * Add a new column
     */
    addColumn: (state, action: PayloadAction<BoardColumn>) => {
      state.columns.push(action.payload);
    },

    addTaskToTodo: (state, action: PayloadAction<BoardCard>) => {
      const todoColumn = state.columns.find(column => column.id === 'todo');

      if (todoColumn) {
        todoColumn.cards.push(action.payload);
      }
    },

    /**
     * Update column
     */
    updateColumn: (
      state,
      action: PayloadAction<{
        id: string;
        title: string;
      }>,
    ) => {
      const column = state.columns.find(
        column => column.id === action.payload.id,
      );

      if (column) {
        column.title = action.payload.title;
      }
    },

    moveColumnRight: (state, action: PayloadAction<string>) => {
      const columnIndex = state.columns.findIndex(
        column => column.id === action.payload,
      );

      if (columnIndex === -1) {
        return;
      }

      if (columnIndex === state.columns.length - 1) {
        return;
      }

      const currentColumn = state.columns[columnIndex];
      const nextColumn = state.columns[columnIndex + 1];

      state.columns[columnIndex] = nextColumn;
      state.columns[columnIndex + 1] = currentColumn;
    },

    /**
     * Delete column
     */
    deleteColumn: (state, action: PayloadAction<string>) => {
      state.columns = state.columns.filter(
        column => column.id !== action.payload,
      );
    },

    /**
     * Add card to a column
     */
    addCard: (
      state,
      action: PayloadAction<{
        columnId: string;
        card: BoardCard;
      }>,
    ) => {
      const column = state.columns.find(
        column => column.id === action.payload.columnId,
      );

      if (!column) {
        return;
      }

      column.cards.push(action.payload.card);
    },

    /**
     * Update card
     */
    updateCard: (
      state,
      action: PayloadAction<{
        columnId: string;
        card: BoardCard;
      }>,
    ) => {
      const column = state.columns.find(
        column => column.id === action.payload.columnId,
      );

      if (!column) {
        return;
      }

      const cardIndex = column.cards.findIndex(
        card => card.id === action.payload.card.id,
      );

      if (cardIndex === -1) {
        return;
      }

      column.cards[cardIndex] = action.payload.card;
    },

    /**
     * Delete card
     */
    deleteCard: (
      state,
      action: PayloadAction<{
        columnId: string;
        cardId: string;
      }>,
    ) => {
      const column = state.columns.find(
        column => column.id === action.payload.columnId,
      );

      if (!column) {
        return;
      }

      column.cards = column.cards.filter(
        card => card.id !== action.payload.cardId,
      );
    },

    /**
     * Move card between columns
     */
    moveCard: (
      state,
      action: PayloadAction<{
        cardId: string;
        fromColumnId: string;
        toColumnId: string;
      }>,
    ) => {
      const { cardId, fromColumnId, toColumnId } = action.payload;

      const fromColumn = state.columns.find(
        column => column.id === fromColumnId,
      );

      const toColumn = state.columns.find(column => column.id === toColumnId);

      if (!fromColumn || !toColumn) {
        return;
      }

      if (fromColumnId === toColumnId) {
        return;
      }

      const cardIndex = fromColumn.cards.findIndex(card => card.id === cardId);

      if (cardIndex === -1) {
        return;
      }

      const [card] = fromColumn.cards.splice(cardIndex, 1);

      toColumn.cards.push(card);
    },

    /**
     * Clear board
     */
    clearBoard: state => {
      state.columns = [];
    },

    /**
     * Loading state
     */
    setBoardLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    resetBoard: () => initialState,

    /**
     * Reset favorites
     */
    resetFavorites: state => {
      state.favorites = [];
      state.favoriteStoryIds = [];
      state.favoriteTaskIds = [];
      state.favoritesTotal = 0;
      state.favoritesTotalTasks = 0;
      state.favoritesTotalUserStories = 0;
      state.favoritesMeta = null;
      state.favoritesLoading = false;
      state.favoritesError = null;
      state.favouriteActionLoading = false;
      state.favouriteActionError = null;
    },

    /**
     * Error state
     */
    setBoardError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    /**
     * Reset error
     */
    clearBoardError: state => {
      state.error = null;
    },
  },

  extraReducers: builder => {
    builder
      // ─── Get Favourites ──────────────────────────────────────────────────
      .addCase(getFavouritesThunk.pending, state => {
        state.favoritesLoading = true;
        state.favoritesError = null;
      })
      .addCase(getFavouritesThunk.fulfilled, (state, action) => {
        state.favoritesLoading = false;
        state.favoritesError = null;

        const responseData = action.payload.response.data;
        const incoming = responseData?.favorites || [];
        const currentPage = action.payload.page;

        if (currentPage === 1) {
          state.favorites = incoming;
        } else {
          const existingIds = new Set(state.favorites.map(f => f.id));
          const unique = incoming.filter(f => !existingIds.has(f.id));
          state.favorites = [...state.favorites, ...unique];
        }

        state.favoritesTotal = responseData?.total ?? incoming.length;
        state.favoritesTotalTasks = responseData?.total_tasks;
        state.favoritesTotalUserStories = responseData?.total_user_stories;
        state.favoritesMeta = action.payload.response.meta || null;

        const storyIds = incoming
          .filter(
            item =>
              item.item_type === 'user_story' ||
              (item as any).user_story_id ||
              (item as any).user_story,
          )
          .map(
            item =>
              (item as FavoriteUserStoryItem).user_story_id ||
              (item as FavoriteUserStoryItem).user_story?.id ||
              item.id,
          );

        const taskIds = incoming
          .filter(
            item =>
              item.item_type === 'task' ||
              (item as any).task_id ||
              (item as any).task,
          )
          .map(
            item =>
              (item as FavoriteTaskItem).task_id ||
              (item as FavoriteTaskItem).task?.id ||
              item.id,
          );

        if (currentPage === 1) {
          state.favoriteStoryIds = Array.from(new Set(storyIds));
          state.favoriteTaskIds = Array.from(new Set(taskIds));
        } else {
          state.favoriteStoryIds = Array.from(
            new Set([...state.favoriteStoryIds, ...storyIds]),
          );
          state.favoriteTaskIds = Array.from(
            new Set([...state.favoriteTaskIds, ...taskIds]),
          );
        }
      })
      .addCase(getFavouritesThunk.rejected, (state, action) => {
        state.favoritesLoading = false;
        state.favoritesError = action.payload ?? 'Failed to fetch favourites';
      })

      // ─── Favourite Task ──────────────────────────────────────────────────
      .addCase(favouriteTaskThunk.pending, state => {
        state.favouriteActionLoading = true;
        state.favouriteActionError = null;
      })
      .addCase(favouriteTaskThunk.fulfilled, (state, action) => {
        state.favouriteActionLoading = false;
        state.favouriteActionError = null;
        const taskId = action.payload.taskId;
        if (!state.favoriteTaskIds.includes(taskId)) {
          state.favoriteTaskIds.push(taskId);
        }
      })
      .addCase(favouriteTaskThunk.rejected, (state, action) => {
        state.favouriteActionLoading = false;
        state.favouriteActionError =
          action.payload ?? 'Failed to favourite task';
      })

      // ─── Unfavourite Task ────────────────────────────────────────────────
      .addCase(unfavouriteTaskThunk.pending, state => {
        state.favouriteActionLoading = true;
        state.favouriteActionError = null;
      })
      .addCase(unfavouriteTaskThunk.fulfilled, (state, action) => {
        state.favouriteActionLoading = false;
        state.favouriteActionError = null;
        const taskId = action.payload.taskId;
        state.favoriteTaskIds = state.favoriteTaskIds.filter(
          id => id !== taskId,
        );
        state.favorites = state.favorites.filter(
          item =>
            !(
              (item.item_type === 'task' &&
                (item as FavoriteTaskItem).task_id === taskId) ||
              item.id === taskId
            ),
        );
      })
      .addCase(unfavouriteTaskThunk.rejected, (state, action) => {
        state.favouriteActionLoading = false;
        state.favouriteActionError =
          action.payload ?? 'Failed to unfavourite task';
      })

      // ─── Favourite User Story ────────────────────────────────────────────
      .addCase(favouriteUserStoryThunk.pending, state => {
        state.favouriteActionLoading = true;
        state.favouriteActionError = null;
      })
      .addCase(favouriteUserStoryThunk.fulfilled, (state, action) => {
        state.favouriteActionLoading = false;
        state.favouriteActionError = null;
        const storyId = action.payload.userStoryId;
        if (!state.favoriteStoryIds.includes(storyId)) {
          state.favoriteStoryIds.push(storyId);
        }
      })
      .addCase(favouriteUserStoryThunk.rejected, (state, action) => {
        state.favouriteActionLoading = false;
        state.favouriteActionError =
          action.payload ?? 'Failed to favourite user story';
      })

      // ─── Unfavourite User Story ──────────────────────────────────────────
      .addCase(unfavouriteUserStoryThunk.pending, state => {
        state.favouriteActionLoading = true;
        state.favouriteActionError = null;
      })
      .addCase(unfavouriteUserStoryThunk.fulfilled, (state, action) => {
        state.favouriteActionLoading = false;
        state.favouriteActionError = null;
        const storyId = action.payload.userStoryId;
        state.favoriteStoryIds = state.favoriteStoryIds.filter(
          id => id !== storyId,
        );
        state.favorites = state.favorites.filter(
          item =>
            !(
              (item.item_type === 'user_story' &&
                (item as FavoriteUserStoryItem).user_story_id === storyId) ||
              item.id === storyId
            ),
        );
      })
      .addCase(unfavouriteUserStoryThunk.rejected, (state, action) => {
        state.favouriteActionLoading = false;
        state.favouriteActionError =
          action.payload ?? 'Failed to unfavourite user story';
      });
  },
});

export const {
  toggleStoryFavorite,
  toggleTaskFavorite,
  setColumns,
  addColumn,
  updateColumn,
  moveColumnRight,
  deleteColumn,
  addCard,
  updateCard,
  deleteCard,
  moveCard,
  clearBoard,
  setBoardLoading,
  setBoardError,
  addTaskToTodo,
  resetBoard,
  resetFavorites,
  clearBoardError,
} = projectBoardSlice.actions;

export default projectBoardSlice.reducer;
