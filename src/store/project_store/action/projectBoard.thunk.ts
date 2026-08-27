import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  favouriteTaskService,
  favouriteUserStoryService,
  getFavouriteService,
  unfavouriteTaskService,
  unfavouriteUserStoryService,
  FavouriteResponse,
  FavouriteTaskParams,
  FavouriteUserStoryParams,
} from '../../../services/favourite.service';
import {
  GetFavoritesResponse,
  GetFavouritesParams,
} from '../../../types/projectBoard.type';

export interface FavouriteTaskThunkPayload extends FavouriteTaskParams {
  onSuccess?: (response: FavouriteResponse) => void;
  onError?: (error: string) => void;
  onFinally?: () => void;
}

export interface FavouriteUserStoryThunkPayload extends FavouriteUserStoryParams {
  onSuccess?: (response: FavouriteResponse) => void;
  onError?: (error: string) => void;
  onFinally?: () => void;
}

export interface GetFavouritesThunkParams {
  params?: GetFavouritesParams;
  onSuccess?: (response: GetFavoritesResponse) => void;
  onError?: (error: string) => void;
  onFinally?: () => void;
}

export const getFavouritesThunk = createAsyncThunk<
  { response: GetFavoritesResponse; page: number },
  GetFavouritesParams | GetFavouritesThunkParams | undefined,
  { rejectValue: string }
>('projectBoard/getFavourites', async (arg, { rejectWithValue }) => {
  try {
    const isPayloadWrapper =
      arg &&
      typeof arg === 'object' &&
      ('params' in arg ||
        'onSuccess' in arg ||
        'onError' in arg ||
        'onFinally' in arg);

    const params = isPayloadWrapper
      ? (arg as GetFavouritesThunkParams).params
      : (arg as GetFavouritesParams | undefined);
    const onSuccess = isPayloadWrapper
      ? (arg as GetFavouritesThunkParams).onSuccess
      : undefined;
    const onError = isPayloadWrapper
      ? (arg as GetFavouritesThunkParams).onError
      : undefined;
    const onFinally = isPayloadWrapper
      ? (arg as GetFavouritesThunkParams).onFinally
      : undefined;

    try {
      const response = await getFavouriteService(params);
      onSuccess?.(response);
      return { response, page: params?.page || 1 };
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to fetch favourites';
      onError?.(errorMessage);
      return rejectWithValue(errorMessage);
    } finally {
      onFinally?.();
    }
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message ||
        error?.message ||
        'Failed to fetch favourites',
    );
  }
});

export const favouriteTaskThunk = createAsyncThunk<
  { response: FavouriteResponse; projectId: string; taskId: string },
  FavouriteTaskThunkPayload,
  { rejectValue: string }
>(
  'projectBoard/favouriteTask',
  async (
    { projectId, taskId, onSuccess, onError, onFinally },
    { rejectWithValue },
  ) => {
    try {
      const response = await favouriteTaskService({ projectId, taskId });
      onSuccess?.(response);
      return { response, projectId, taskId };
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to favourite task';
      onError?.(errorMessage);
      return rejectWithValue(errorMessage);
    } finally {
      onFinally?.();
    }
  },
);

export const unfavouriteTaskThunk = createAsyncThunk<
  { response: FavouriteResponse; projectId: string; taskId: string },
  FavouriteTaskThunkPayload,
  { rejectValue: string }
>(
  'projectBoard/unfavouriteTask',
  async (
    { projectId, taskId, onSuccess, onError, onFinally },
    { rejectWithValue },
  ) => {
    try {
      const response = await unfavouriteTaskService({ projectId, taskId });
      onSuccess?.(response);
      return { response, projectId, taskId };
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to unfavourite task';
      onError?.(errorMessage);
      return rejectWithValue(errorMessage);
    } finally {
      onFinally?.();
    }
  },
);

export const favouriteUserStoryThunk = createAsyncThunk<
  { response: FavouriteResponse; projectId: string; userStoryId: string },
  FavouriteUserStoryThunkPayload,
  { rejectValue: string }
>(
  'projectBoard/favouriteUserStory',
  async (
    { projectId, userStoryId, onSuccess, onError, onFinally },
    { rejectWithValue },
  ) => {
    try {
      const response = await favouriteUserStoryService({
        projectId,
        userStoryId,
      });
      onSuccess?.(response);
      return { response, projectId, userStoryId };
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to favourite user story';
      onError?.(errorMessage);
      return rejectWithValue(errorMessage);
    } finally {
      onFinally?.();
    }
  },
);

export const unfavouriteUserStoryThunk = createAsyncThunk<
  { response: FavouriteResponse; projectId: string; userStoryId: string },
  FavouriteUserStoryThunkPayload,
  { rejectValue: string }
>(
  'projectBoard/unfavouriteUserStory',
  async (
    { projectId, userStoryId, onSuccess, onError, onFinally },
    { rejectWithValue },
  ) => {
    try {
      const response = await unfavouriteUserStoryService({
        projectId,
        userStoryId,
      });
      onSuccess?.(response);
      return { response, projectId, userStoryId };
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to unfavourite user story';
      onError?.(errorMessage);
      return rejectWithValue(errorMessage);
    } finally {
      onFinally?.();
    }
  },
);

export const getFavourites = getFavouritesThunk;
export const getFavorites = getFavouritesThunk;
export const getFavoritesThunk = getFavouritesThunk;
export const favoriteTaskThunk = favouriteTaskThunk;
export const unfavoriteTaskThunk = unfavouriteTaskThunk;
export const favoriteUserStoryThunk = favouriteUserStoryThunk;
export const unfavoriteUserStoryThunk = unfavouriteUserStoryThunk;
