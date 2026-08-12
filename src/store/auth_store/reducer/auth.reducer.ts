import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '../../../types/auth.type';
import {
  signUpUser,
  signInUser,
  refreshToken,
  logoutUser,
  changePassword,
  passwordResetRequest,
  passwordResetConfirm,
  checkAuthOnAppStart,
  getUserProfileInfo,
  getOrganizationDetail,
} from '../action/auth.thunks';
import { jwtDecode } from 'jwt-decode';
import reactotron from 'reactotron-react-native';

const initialState: AuthState = {
  loading: false,
  isAuthenticated: false,
  error: null,
  message: null,
  user: null,
  organization: null,
  tokens: {
    accessToken: null,
    refreshToken: null,
  },
};

interface JwtPayload {
  user_id: string;
  role: string;
  exp: number;
  iat: number;
}

const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch (error) {
    console.log('Invalid token:', error);
    return null;
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.tokens = {
        accessToken: null,
        refreshToken: null,
      };
      state.loading = false;
      state.error = null;
    },
    updateTokens(
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
      }>,
    ) {
      state.tokens = action.payload;
    },
    authenticateWithToken(
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken?: string | null;
      }>,
    ) {
      const { accessToken, refreshToken } = action.payload;

      state.loading = false;
      state.isAuthenticated = true;

      reactotron.log('LINE83', accessToken);
      state.tokens = {
        accessToken,
        refreshToken: refreshToken ?? null,
      };

      const decoded = decodeToken(accessToken);

      console.log('LINE91', decoded);

      if (decoded) {
        state.user = {
          id: decoded.user_id,
          role: decoded.role,
        };
      }
    },
    handleLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(signUpUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, state => {
        state.loading = false;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(signInUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.tokens = {
          accessToken: action.payload?.access_token ?? null,
          refreshToken: action.payload?.refresh_token ?? null,
        };
        console.log('isAuthenticated', state.isAuthenticated);
        const decoded = decodeToken(action.payload!.access_token);
        if (decoded) {
          state.user = {
            id: decoded.user_id,
            role: decoded.role,
          };
        }
      })

      .addCase(signInUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.tokens = {
          accessToken: action.payload?.access_token ?? null,
          refreshToken: action.payload?.refresh_token ?? null,
        };
      })
      .addCase(refreshToken.rejected, state => {
        state.isAuthenticated = false;
        state.user = null;
        state.tokens = {
          accessToken: null,
          refreshToken: null,
        };
      })
      .addCase(logoutUser.pending, state => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, state => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.tokens = {
          accessToken: null,
          refreshToken: null,
        };
      })
      .addCase(logoutUser.rejected, state => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.tokens = {
          accessToken: null,
          refreshToken: null,
        };
      })
      .addCase(changePassword.pending, state => {
        state.loading = true;
      })
      .addCase(changePassword.fulfilled, state => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(passwordResetRequest.pending, state => {
        state.loading = true;
      })
      .addCase(passwordResetRequest.fulfilled, state => {
        state.loading = false;
      })
      .addCase(passwordResetRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(passwordResetConfirm.pending, state => {
        state.loading = true;
      })

      .addCase(passwordResetConfirm.fulfilled, state => {
        state.loading = false;
      })

      .addCase(passwordResetConfirm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(checkAuthOnAppStart.pending, state => {
        state.loading = true;
      })
      .addCase(checkAuthOnAppStart.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.tokens = action.payload;
      })
      .addCase(checkAuthOnAppStart.rejected, state => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.tokens = {
          accessToken: null,
          refreshToken: null,
        };
      })
      .addCase(getOrganizationDetail.fulfilled, (state, action) => {
        state.organization = action.payload ?? null;
      })
      .addCase(getOrganizationDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getOrganizationDetail.pending, (state, action) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProfileInfo.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProfileInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload as User;
      })
      .addCase(getUserProfileInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  logout,
  clearError,
  updateTokens,
  handleLoading,
  authenticateWithToken,
} = authSlice.actions;

export default authSlice.reducer;
