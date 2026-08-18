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

//Activity
export const GET_AUDIT = `/audit`;

//UserStory
export const GET_USERSTORY = `project/{project_id}/user-stories`;
