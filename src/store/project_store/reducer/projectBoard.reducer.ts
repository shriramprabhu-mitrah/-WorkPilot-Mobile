import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BoardCard, BoardColumn } from '../../../types/projectBoard.type';

interface ProjectBoardState {
  columns: BoardColumn[];
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
  loading: false,
  error: null,
};

const projectBoardSlice = createSlice({
  name: 'projectBoard',
  initialState,

  reducers: {
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

      // Already last column
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

      // Don't do anything if moving to same column
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
});

export const {
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
  clearBoardError,
} = projectBoardSlice.actions;

export default projectBoardSlice.reducer;
