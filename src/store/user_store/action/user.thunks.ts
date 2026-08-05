import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  updateUserService,
  getUserService,
} from '../../../services/auth.service';
import { RootState } from '../..';
import { UserProfile } from '../../../types/user.type';
import { AuthState } from '../../../types/auth.type';

export interface UpdateUserProfilePayload {
  full_name?: string;
  username?: string;
  email?: string;
  avatar?: string;
  password?: string;
}
export const getUserProfileInfo = createAsyncThunk<any>(
  'auth/me',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as {
        auth: AuthState;
      };
      const accessToken = state.auth.tokens?.accessToken;
      if (!accessToken) {
        return rejectWithValue('Access Token Missing');
      }
      const response = await getUserService({ accessToken });
      console.log('get response', response.data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user profile',
      );
    }
  },
);

export const updateUserProfileInfo = createAsyncThunk<
  { message: string; data?: UserProfile },
  UpdateUserProfilePayload,
  {
    state: RootState;
    rejectValue: string;
  }
>('auth/update', async (payload, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const accessToken = state.auth.tokens?.accessToken;

    if (!accessToken) {
      return rejectWithValue('Access Token Missing');
    }

    const response = await updateUserService({
      accessToken,
      ...payload,
    });

    return response;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'User Data Update Failed',
    );
  }
});
