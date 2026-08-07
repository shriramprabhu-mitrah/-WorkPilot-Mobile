export enum ROLE_TYPE {
  ORG_ADMIN = 'org_admin',
  PROJECT_MANAGER = 'project_manager',
  DEVELOPER = 'developer',
  VIEWER = 'viewer',
  GUEST = 'guest',
}

export const ROLE_LABELS: Record<ROLE_TYPE, string> = {
  [ROLE_TYPE.ORG_ADMIN]: 'Admin',
  [ROLE_TYPE.PROJECT_MANAGER]: 'Project Manager',
  [ROLE_TYPE.DEVELOPER]: 'Developer',
  [ROLE_TYPE.VIEWER]: 'Viewer',
  [ROLE_TYPE.GUEST]: 'Guest',
};

export const getRoleLabel = (role?: string): string => {
  if (!role) {
    return ROLE_LABELS[ROLE_TYPE.VIEWER];
  }
  return ROLE_LABELS[role as ROLE_TYPE] ?? role;
};
