import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getUserProfileInfo } from '../action/user.thunks';
import { UserProfile, UserState } from '../../../types/user.type';

const initialState: UserState = {
  loading: false,
  updating: false,
  error: null,
  message: null,
  user: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,

  reducers: {
    clearUserError(state) {
      state.error = null;
    },
    clearUserProfile(state) {
      state.user = null;
      state.error = null;
      state.message = null;
      state.loading = false;
      state.updating = false;
    },
    setUserProfile(state, action: PayloadAction<UserProfile>) {
      state.user = action.payload;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(getUserProfileInfo.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProfileInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getUserProfileInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUserError, clearUserProfile, setUserProfile } =
  userSlice.actions;

export default userSlice.reducer;
