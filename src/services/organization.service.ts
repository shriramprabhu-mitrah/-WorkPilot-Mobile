import { post } from '../components/common/httpClient';
import {
  CREATE_ORGANIZATION,
  INVITE_ORGANIZATION,
} from '../constants/apiServiceEndpoint';
import {
  createOrganizationResponse,
  InviteOrganizationPayload,
  InviteOrganizationResponse,
} from '../types/auth.type';

export const createOrganizationService = async (
  formData: FormData,
): Promise<createOrganizationResponse> => {
  try {
    return await post<createOrganizationResponse, FormData>(
      CREATE_ORGANIZATION,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
  } catch (error) {
    console.error('Create Organization API failed:', error);
    throw error;
  }
};

export const inviteOrganizationService = async (
  payload: InviteOrganizationPayload,
): Promise<InviteOrganizationResponse> => {
  try {
    return await post<InviteOrganizationResponse, InviteOrganizationPayload>(
      INVITE_ORGANIZATION,
      payload,
    );
  } catch (error) {
    console.error('Sign In API failed:', error);
    throw error;
  }
};
