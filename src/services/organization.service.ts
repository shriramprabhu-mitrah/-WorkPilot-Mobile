import { del, get, patch, post } from '../components/common/httpClient';
import {
  CREATE_ORGANIZATION,
  INVITE_ORGANIZATION,
  UPDATE_ORGANIZATION,
  GET_ORG_MEMBERS,
  GET_ROLES,
  CREATE_ROLE,
  DELETE_ROLE,
  UPDATE_ROLE,
} from '../constants/apiServiceEndpoint';
import {
  createOrganizationResponse,
  GetOrganizationResponse,
  InviteOrganizationPayload,
  InviteOrganizationResponse,
  UpdateOrganizationPayload,
  GetOrganizationMembersResponse,
  getOrganizationMemberPayload,
  GetRolesResponse,
  CreateRolePayload,
  CreateRoleResponse,
  DeleteRoleResponse,
  UpdateRolePayload,
  UpdateRoleResponse,
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

export const updateOrganizationService = async (
  payload: UpdateOrganizationPayload,
): Promise<GetOrganizationResponse> => {
  try {
    const formData = new FormData();
    if (payload.name !== undefined) {
      formData.append('name', payload.name);
    }
    if (payload.domain !== undefined) {
      formData.append('domain', payload.domain);
    }
    if (payload.team_size !== undefined) {
      formData.append('team_size', payload.team_size);
    }
    if (payload.country_id !== undefined) {
      formData.append('country_id', payload.country_id);
    }
    if (payload.logo) {
      formData.append('logo', {
        uri: payload.logo.uri,
        name: payload.logo.name,
        type: payload.logo.type,
      } as any);
    }

    return await patch<GetOrganizationResponse>(UPDATE_ORGANIZATION, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  } catch (error) {
    console.error('Update Organization API failed:', error);
    throw error;
  }
};

export const getOrganizationMembersService = async (
  params: getOrganizationMemberPayload,
): Promise<GetOrganizationMembersResponse> => {
  try {
    return await get<GetOrganizationMembersResponse>(GET_ORG_MEMBERS, {
      params,
    });
  } catch (error) {
    console.error('Get Organization Members API failed:', error);
    throw error;
  }
};

export const getRolesService = async (): Promise<GetRolesResponse> => {
  try {
    return await get<GetRolesResponse>(GET_ROLES);
  } catch (error) {
    console.error('Get roles API failed:', error);
    throw error;
  }
};

export const createRoleService = async (
  payload: CreateRolePayload,
): Promise<CreateRoleResponse> => {
  try {
    return await post<CreateRoleResponse, CreateRolePayload>(
      CREATE_ROLE,
      payload,
    );
  } catch (error) {
    console.error('Create role API failed:', error);
    throw error;
  }
};

export const updateRoleService = async (
  roleId: string,
  payload: UpdateRolePayload,
): Promise<UpdateRoleResponse> => {
  try {
    return await patch<UpdateRoleResponse, UpdateRolePayload>(
      UPDATE_ROLE.replace('{role_id}', roleId),
      payload,
    );
  } catch (error) {
    console.error('Update role API failed:', error);
    throw error;
  }
};

export const deleteRoleService = async (
  roleId: string,
): Promise<DeleteRoleResponse> => {
  try {
    return await del<DeleteRoleResponse>(
      DELETE_ROLE.replace('{role_id}', roleId),
    );
  } catch (error) {
    console.error('Delete role API failed:', error);
    throw error;
  }
};
