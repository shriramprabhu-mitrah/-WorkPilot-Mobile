import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
  description: string;
  isEditingDescription: boolean;
}

const initialState: UserState = {
  description: '',
  isEditingDescription: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setDescription: (state, action: PayloadAction<string>) => {
      const formattedDescription = action.payload
        .trim()
        .replace(/[ \t]+/g, ' ')
        .replace(/ *\n */g, '\n')
        .replace(/\n{3,}/g, '\n\n');
      state.description = formattedDescription;
    },

    setIsEditingDescription: (state, action: PayloadAction<boolean>) => {
      state.isEditingDescription = action.payload;
    },
  },
});

export const { setDescription, setIsEditingDescription } = userSlice.actions;

export default userSlice.reducer;
