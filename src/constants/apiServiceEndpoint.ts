export const SIGNUP = `/auth/signup`;
export const SIGNIN = `/auth/signin`;
export const REFRESH_TOKEN = `/auth/refresh`;
export const LOGOUT = `/auth/logout`;
export const CHANGE_PASSWORD = `/auth/change-password`;
export const UPDATE_USER = `/auth/update`;
export const GET_USER = `/auth/me`;
export const EMAIL_VERIFICATION = `/auth/verify-email`;
export const RESEND_EMAIL_VERIFICATION = `/auth/resend-verification-otp`;
export const USER_VALIDATE = `/auth/validate`;
export const GET_INSIGHTS = `/auth/me/insights`;

// PASSWORD RESET
export const PASSWORD_RESET_REQUEST = `/auth/password-reset/request`;
export const PASSWORD_RESET_CONFIRM = `/auth/password-reset/confirm`;

// ORGANIZATION
export const GET_ORGANIZATION_DETAIL = `/organization/get`;
export const CREATE_ORGANIZATION = `/organization/create`;

//PROJECT
export const PROJECTS = `/project`;
export const GET_PROJECTS = `/project/get`;
export const CREATE_PROJECT = `/project/create`;
export const GET_PROJECT_BY_ID = `/project/{project_id}/detail`;
export const UPDATE_PROJECT = `/project/update/{project_id}`;
export const DELETE_PROJECT = `/project/{project_id}`;
export const GET_RECENT_PROJECTS = `/project/recent`;
export const UPDATE_USER_STORY = `/projects/{project_id}/user-stories/{user_story_id}`;
//Activity
export const GET_AUDIT = `/audit`;

//UserStory
export const GET_USERSTORY = `/projects/{project_id}/user-stories`;
export const GET_USERSTORY_STATUS = `/projects/{project_id}/user-story-statuses`;

//SPRINT
export const GET_SPRINTS = `/projects/{project_id}/sprint`;
export const GET_SPRINT_BY_Id = `projects/{project_id}/sprint/{sprint_id}`;
export const GET_USERSTORY_BY_ID = `/projects/{project_id}/user-stories/{user_story_id}`;
export const GET_BURNDOWN_BY_PROJECT_SPRINT = `/projects/{project_id}/sprint/{sprint_id}/burndown`;

//TASK
export const GET_TASK_BY_ID = `/projects/{project_id}/tasks/{task_id}`;

//COMMENT
export const USERSTORIES_COMMENT = `/projects/{project_id}/user-stories/{user_story_id}/comments`; //post user story API
export const USERSTORIES_COMMENT_BY_ID = `/projects/{project_id}/user-stories/{user_story_id}/comments/{comment_id}`; //get by ID and Update by Id delete by ID
export const USER_STORIES_COMMENT_REPLIES = `/projects/{project_id}/user-stories/{user_story_id}/comments/replies/{comment_id}`; //get by replise Id API Call
export const TASK_COMMENT = `/task/{task_id}/comments`;
export const TASK_COMMENT_REPLIES = `/task/{task_id}/comments/replies/{parent_comment_id}`;
export const TASK_COMMENT_ID = `/task/{task_id}/comments/{comment_id}`;

//CustomStatus
export const GET_CUSTOMSTATUS = `/projects/{project_id}/custom-statuses`;
export const CREATE_CUSTOMSTATUS = `/projects/{project_id}/custom-statuses`;
export const DELETE_CUSTOMSTATUS = `/projects/{project_id}/custom-statuses/{status_id}`;
export const UPDATE_CUSTOMSTATUS = `/projects/{project_id}/custom-statuses/{status_id}`;

//Tasks
export const UPDATE_TASKS = `/projects/{project_id}/tasks/{task_id}`;
export const GET_TASKS = `/projects/{project_id}/tasks`;

//Favourites
export const GET_FAVOURITES = `/favorites`;
export const FAVOURITE_TASK = `/projects/{project_id}/tasks/{task_id}/favorite`;
export const UNFAVOURITE_TASK = `/projects/{project_id}/tasks/{task_id}/favorite`;
export const FAVOURITE_USERSTORY = `/projects/{project_id}/user-stories/{user_story_id}/favorite`;
export const UNFAVOURITE_USERSTORY = `/projects/{project_id}/user-stories/{user_story_id}/favorite`;

//UserStory Attachment
export const USATTACHMENT = `/projects/{project_id}/user-stories/{user_story_id}/attachments`; //GET AND POST
export const DELETEUSATTACHMENT = `/projects/{project_id}/user-stories/{user_story_id}/attachments/{attachment_id}`;
export const GETUSATTACHMENTDOWNLOAD = `/projects/{project_id}/user-stories/{user_story_id}/attachments/{attachment_id}/download`;

//Task Attachment
export const TASKATTACHMENT = `/projects/{project_id}/tasks/{task_id}/attachments`; //GET AND POST
export const DELETETASKATTACHMENT = `/projects/{project_id}/tasks/{task_id}/attachments/{attachment_id}`;
export const GETTASKATTACHMENTDOWNLOAD = `/projects/{project_id}/tasks/{task_id}/attachments/{attachment_id}/download`;

//Global Search
export const GLOBAL_SEARCH = '/search';
