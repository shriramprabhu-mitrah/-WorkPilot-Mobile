import { get } from '../components/common/httpClient';
import { GET_USERSTORIES_COMMENT } from '../constants/apiServiceEndpoint';
import {
  GetUserStoryCommentsParams,
  GetUserStoryCommentsResponse,
} from '../types/comments.type';

export const getUserStoryCommentsService = async ({
  projectId,
  userStoryId,
  page = 1,
  pageSize = 10,
}: GetUserStoryCommentsParams): Promise<GetUserStoryCommentsResponse> => {
  try {
    if (!projectId || !userStoryId) {
      throw new Error(
        'Missing required route parameter: projectId or userStoryId',
      );
    }
    const url = GET_USERSTORIES_COMMENT.replace(
      '{project_id}',
      projectId,
    ).replace('{user_story_id}', userStoryId);

    return await get<GetUserStoryCommentsResponse>(url, {
      params: {
        page,
        page_size: pageSize,
      },
    });
  } catch (error) {
    console.error('Get User Story Comments API failed:', error);
    throw error;
  }
};
