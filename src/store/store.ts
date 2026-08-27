import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer from './auth_store/reducer/auth.reducer';
import commonReducer from './commonSlice';
import { createMMKV } from 'react-native-mmkv';
import { persistStore, persistReducer } from 'redux-persist';
import reactotron from '../config/ReactotronConfig';
import issueReducer from './issue_store/reducer/issue.reducer';
import homeReducer from './home_store/reducer/home.reducer';
import projectReducer from './project_store/reducer/project_reducer';
import projectBoardReducer from './project_store/reducer/projectBoard.reducer';
import commentsReducer from './comments_store/reducer/comments_reducer';
import attachmentReducer from './comments_store/reducer/attachment.reducer';

export const RESET_STORE = 'RESET_STORE';

export const resetStore = () => ({
  type: RESET_STORE,
});

export const mmkv = createMMKV();

const mmkvStorage = {
  setItem: (key: string, value: string) => {
    try {
      mmkv.set(key, value);
    } catch (error) {
      console.error(
        `❌ MMKV.set failed for key "${key}" (${(value?.length / 1024).toFixed(
          1,
        )} KB):`,
        error,
      );
    }
    return Promise.resolve(true);
  },

  getItem: (key: string) => {
    const value = mmkv.getString(key);
    return Promise.resolve(value);
  },

  removeItem: (key: string) => {
    mmkv.remove(key);
    return Promise.resolve();
  },
};

export const clearStorage = () => {
  const onboardingCompleted = mmkv.getBoolean('onboardingCompleted') ?? false;
  mmkv.clearAll();
  mmkv.set('onboardingCompleted', onboardingCompleted);
};

// ── Per-slice persist configs ──
// Each heavy slice gets its own MMKV key to avoid hitting per-value size limits.

const authPersistConfig = {
  key: 'auth',
  storage: mmkvStorage,
};

const appReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  common: commonReducer,
  issue: issueReducer,
  home: homeReducer,
  projects: projectReducer,
  projectBoard: projectBoardReducer,
  comments: commentsReducer,
  attachments: attachmentReducer,
});

const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: any,
) => {
  if (action.type === RESET_STORE) {
    state = undefined;
  }

  return appReducer(state, action);
};

export type RootState = ReturnType<typeof rootReducer>;

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: __DEV__,
  enhancers: getDefaultEnhancers => {
    if (__DEV__) {
      return getDefaultEnhancers().concat(reactotron.createEnhancer());
    }
    return getDefaultEnhancers();
  },
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
