import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer from './auth_store/reducer/auth.reducer';
import { createMMKV } from 'react-native-mmkv';
import { persistStore, persistReducer } from 'redux-persist';
import reactotron from '../config/ReactotronConfig';
import issueReducer from './issue_store/reducer/issue.reducer';
import userReducer from './user_store/reducer/user.reducer';

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
  mmkv.clearAll();
};

// ── Per-slice persist configs ──
// Each heavy slice gets its own MMKV key to avoid hitting per-value size limits.

const authPersistConfig = {
  key: 'auth',
  storage: mmkvStorage,
};
const userPersistConfig = {
  key: 'user',
  storage: mmkvStorage,
};
const rootPersistConfig = {
  key: 'root',
  storage: mmkvStorage,
  // Only persist the lightweight slices at root level.
  // audit & response are persisted independently via nested persistReducer.
  // whitelist: ['auth', 'home', 'theme', 'submission'],
};

const rootReducer = combineReducers({
  // home: homeSlice,
  // theme: themeSlice,
  auth: persistReducer(authPersistConfig, authReducer),
  user: persistReducer(userPersistConfig, userReducer),
  issue: issueReducer,
  // audit: persistReducer(auditPersistConfig, auditSlice),
  // response: persistReducer(responsePersistConfig, responseSlice),
  // submission: submissionSlice,
  // ui: uiSlice,
});

export type RootState = ReturnType<typeof rootReducer>;
const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
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

// export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
