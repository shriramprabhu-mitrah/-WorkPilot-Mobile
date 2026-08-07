import { createSlice } from '@reduxjs/toolkit';

interface CommonState {
  isNetworkError: boolean;
}

const initialState: CommonState = {
  isNetworkError: false,
};

const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    setNetworkError: (state, action) => {
      state.isNetworkError = action.payload;
    },
  },
});

export const { setNetworkError } = commonSlice.actions;
export default commonSlice.reducer;
