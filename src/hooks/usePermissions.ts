import { useCallback, useMemo } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import { Role, RolePermissionsMap } from '../types/auth.type';
import { useAppSelector } from '../store';
import { useGetRolesQuery } from '../store/api/homeApi';
import { useGetProjectUserRoleQuery } from '../store/api/projectApi';

export type PermissionResource = keyof RolePermissionsMap;
export type PermissionAction = 'view' | 'add' | 'modify' | 'delete';
export type Permission = `${PermissionResource}.${PermissionAction}`;

type UsePermissionsOptions = {
  role?: string | null;
  projectId?: string | null;
};

type ProjectRoleData = {
  role?: string | Role | null;
  role_id?: string | number | null;
  role_name?: string | null;
  permissions?: RolePermissionsMap | null;
};

const normalizeRole = (role?: string | null): string =>
  role?.toLowerCase().replace(/[\s_-]+/g, '') ?? '';

const ADMIN_ROLES = new Set([
  'admin',
  'orgadmin',
  'organizationadmin',
  'superadmin',
]);

const DEFAULT_ADMIN_PERMISSIONS: RolePermissionsMap = {
  projects: { view: true, add: true, modify: true, delete: true },
  sprints: { view: true, add: true, modify: true, delete: true },
  user_stories: { view: true, add: true, modify: true, delete: true },
  tasks: { view: true, add: true, modify: true, delete: true },
  comments: { view: true, add: true, modify: true, delete: true },
};

const DEFAULT_NO_PERMISSIONS: RolePermissionsMap = {
  projects: { view: false, add: false, modify: false, delete: false },
  sprints: { view: false, add: false, modify: false, delete: false },
  user_stories: { view: false, add: false, modify: false, delete: false },
  tasks: { view: false, add: false, modify: false, delete: false },
  comments: { view: false, add: false, modify: false, delete: false },
};

export const usePermissions = (options: UsePermissionsOptions = {}) => {
  const { role: requestedRole, projectId } = options;

  const orgRole = useAppSelector(state => state.auth.user?.role);

  const isInspectingRole = requestedRole != null;
  const isProjectScope = Boolean(projectId) && !isInspectingRole;

  const {
    currentData: projectRoleResponse,
    isLoading: projectRoleLoading,
    isFetching: projectRoleFetching,
    isError: projectRoleError,
    refetch: refetchProjectRole,
  } = useGetProjectUserRoleQuery(isProjectScope ? projectId! : skipToken);

  const {
    data: rolesResponse,
    isLoading: rolesLoading,
    isFetching: rolesFetching,
    isError: rolesError,
    refetch: refetchRoles,
  } = useGetRolesQuery();

  const roles = useMemo<Role[]>(() => {
    const data = rolesResponse?.data;
    return Array.isArray(data) ? data : [];
  }, [rolesResponse]);

  const isOrgAdmin = ADMIN_ROLES.has(normalizeRole(orgRole));

  const projectRoleData = projectRoleResponse?.data as
    ProjectRoleData | undefined;

  const projectRoleObject: Role | null =
    projectRoleData?.role && typeof projectRoleData.role === 'object'
      ? (projectRoleData.role as Role)
      : null;

  const projectRole =
    typeof projectRoleData?.role === 'string'
      ? projectRoleData.role
      : (projectRoleObject?.name ?? projectRoleData?.role_name ?? null);

  const projectRoleId =
    projectRoleData?.role_id != null
      ? String(projectRoleData.role_id)
      : projectRoleObject?.id != null
        ? String(projectRoleObject.id)
        : null;

  const selectedRole = isInspectingRole
    ? requestedRole
    : isProjectScope
      ? projectRole
      : (orgRole ?? null);

  const currentRole = useMemo<Role | null>(() => {
    // 1. Prefer the role ID returned by the project-role API.
    if (isProjectScope && projectRoleId) {
      const roleById = roles.find(item => String(item.id) === projectRoleId);

      if (roleById) return roleById;
    }

    // 2. Use the embedded role object if it contains permissions.
    if (projectRoleObject?.permissions) {
      return projectRoleObject;
    }

    if (!selectedRole) return null;

    // 3. Resolve the selected role by ID.
    const roleById = roles.find(
      item => String(item.id) === String(selectedRole),
    );

    if (roleById) return roleById;

    // 4. Resolve the selected role by name.
    const normalizedRole = normalizeRole(selectedRole);

    return (
      roles.find(item => normalizeRole(item.name) === normalizedRole) ?? null
    );
  }, [roles, isProjectScope, projectRoleId, projectRoleObject, selectedRole]);

  const isLoading =
    rolesLoading ||
    rolesFetching ||
    (isProjectScope && (projectRoleLoading || projectRoleFetching));

  const isError = rolesError || (isProjectScope && projectRoleError);

  const isProjectRoleReady =
    !isProjectScope ||
    (!!projectRoleResponse &&
      !projectRoleLoading &&
      !projectRoleFetching &&
      !projectRoleError &&
      Boolean(projectRole || projectRoleId || projectRoleObject));

  const permissionsReady =
    !isLoading &&
    !isError &&
    isProjectRoleReady &&
    (!isInspectingRole && isOrgAdmin ? true : !!currentRole?.permissions);

  const effectiveRole = isProjectScope
    ? projectRole
    : !isInspectingRole && isOrgAdmin
      ? 'org_admin'
      : selectedRole;

  const userPermissions = useMemo<RolePermissionsMap>(() => {
    if (!isInspectingRole && isOrgAdmin) {
      return DEFAULT_ADMIN_PERMISSIONS;
    }

    return currentRole?.permissions ?? DEFAULT_NO_PERMISSIONS;
  }, [isInspectingRole, isOrgAdmin, currentRole]);

  const can = useCallback(
    (resource: PermissionResource, action: PermissionAction): boolean => {
      if (!permissionsReady) return false;

      if (!isInspectingRole && isOrgAdmin) {
        return true;
      }

      return userPermissions[resource]?.[action] === true;
    },
    [permissionsReady, isInspectingRole, isOrgAdmin, userPermissions],
  );

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      const [resource, action, ...extra] = permission.split('.');

      if (
        extra.length > 0 ||
        !resource ||
        !action ||
        !['view', 'add', 'modify', 'delete'].includes(action)
      ) {
        return false;
      }

      return can(resource as PermissionResource, action as PermissionAction);
    },
    [can],
  );

  const canAny = useCallback(
    (checks: Array<[PermissionResource, PermissionAction]>) =>
      checks.some(([resource, action]) => can(resource, action)),
    [can],
  );

  const canAll = useCallback(
    (checks: Array<[PermissionResource, PermissionAction]>) =>
      checks.every(([resource, action]) => can(resource, action)),
    [can],
  );

  const hasAnyPermission = useCallback(
    (permissions: Permission[]) => permissions.some(hasPermission),
    [hasPermission],
  );

  const hasAllPermissions = useCallback(
    (permissions: Permission[]) => permissions.every(hasPermission),
    [hasPermission],
  );

  const hasRole = useCallback(
    (role: string | string[]) => {
      const current = normalizeRole(currentRole?.name ?? selectedRole);

      const requested = Array.isArray(role) ? role : [role];

      return (
        !!current && requested.some(item => normalizeRole(item) === current)
      );
    },
    [currentRole, selectedRole],
  );

  const canManageProjects = useCallback(() => can('projects', 'modify'), [can]);

  const refetch = useCallback(() => {
    refetchRoles();

    if (isProjectScope) {
      refetchProjectRole();
    }
  }, [refetchRoles, isProjectScope, refetchProjectRole]);

  return {
    orgRole,
    projectRole,
    projectRoleId,
    effectiveRole,
    selectedRole,
    currentRole,
    userPermissions,
    permissionsReady,
    isOrgAdmin,
    isLoading,
    isError,
    refetch,
    can,
    hasPermission,
    canAny,
    canAll,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    canManageProjects,

    canViewProjects: can('projects', 'view'),
    canCreateProject: can('projects', 'add'),
    canEditProject: can('projects', 'modify'),
    canDeleteProject: can('projects', 'delete'),

    canViewSprints: can('sprints', 'view'),
    canCreateSprint: can('sprints', 'add'),
    canEditSprint: can('sprints', 'modify'),
    canDeleteSprint: can('sprints', 'delete'),

    canViewUserStories: can('user_stories', 'view'),
    canCreateUserStory: can('user_stories', 'add'),
    canEditUserStory: can('user_stories', 'modify'),
    canDeleteUserStory: can('user_stories', 'delete'),

    canViewTasks: can('tasks', 'view'),
    canCreateTask: can('tasks', 'add'),
    canEditTask: can('tasks', 'modify'),
    canDeleteTask: can('tasks', 'delete'),

    canViewComments: can('comments', 'view'),
    canAddComments: can('comments', 'add'),
    canEditComments: can('comments', 'modify'),
    canDeleteComments: can('comments', 'delete'),
  };
};

export default usePermissions;
