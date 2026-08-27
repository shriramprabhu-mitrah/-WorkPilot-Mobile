import { del, get, post } from '../components/common/httpClient';
import {
  FAVOURITE_TASK,
  FAVOURITE_USERSTORY,
  GET_FAVOURITES,
  UNFAVOURITE_TASK,
  UNFAVOURITE_USERSTORY,
} from '../constants/apiServiceEndpoint';
import {
  GetFavoritesResponse,
  GetFavouritesParams,
} from '../types/projectBoard.type';

export interface FavouriteTaskParams {
  projectId: string;
  taskId: string;
}

export interface FavouriteUserStoryParams {
  projectId: string;
  userStoryId: string;
}

export interface FavouriteResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
}

export const getFavouriteService = async (params?: GetFavouritesParams) => {
  try {
    return await get<GetFavoritesResponse>(GET_FAVOURITES, { params });
  } catch (error) {
    console.error('Get Favourite API failed:', error);
    throw error;
  }
};

export const favouriteTaskService = async ({
  projectId,
  taskId,
}: FavouriteTaskParams): Promise<FavouriteResponse> => {
  try {
    const url = FAVOURITE_TASK.replace('{project_id}', projectId).replace(
      '{task_id}',
      taskId,
    );
    return await post<FavouriteResponse>(url);
  } catch (error) {
    console.error('Favourite Task API failed:', error);
    throw error;
  }
};

export const unfavouriteTaskService = async ({
  projectId,
  taskId,
}: FavouriteTaskParams): Promise<FavouriteResponse> => {
  try {
    const url = UNFAVOURITE_TASK.replace('{project_id}', projectId).replace(
      '{task_id}',
      taskId,
    );
    return await del<FavouriteResponse>(url);
  } catch (error) {
    console.error('Unfavourite Task API failed:', error);
    throw error;
  }
};

export const favouriteUserStoryService = async ({
  projectId,
  userStoryId,
}: FavouriteUserStoryParams): Promise<FavouriteResponse> => {
  try {
    const url = FAVOURITE_USERSTORY.replace('{project_id}', projectId).replace(
      '{user_story_id}',
      userStoryId,
    );
    return await post<FavouriteResponse>(url);
  } catch (error) {
    console.error('Favourite User Story API failed:', error);
    throw error;
  }
};

export const unfavouriteUserStoryService = async ({
  projectId,
  userStoryId,
}: FavouriteUserStoryParams): Promise<FavouriteResponse> => {
  try {
    const url = UNFAVOURITE_USERSTORY.replace(
      '{project_id}',
      projectId,
    ).replace('{user_story_id}', userStoryId);
    return await del<FavouriteResponse>(url);
  } catch (error) {
    console.error('Unfavourite User Story API failed:', error);
    throw error;
  }
};

// Aliases with US spelling
export const favoriteTaskService = favouriteTaskService;
export const unfavoriteTaskService = unfavouriteTaskService;
export const favoriteUserStoryService = favouriteUserStoryService;
export const unfavoriteUserStoryService = unfavouriteUserStoryService;
