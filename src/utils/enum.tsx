// Enum matching exact backend allowed values
export enum ProjectStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  PLANNING = 'planning',
}

// Map status enum keys to UI display labels
export const STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.ACTIVE]: 'Active',
  [ProjectStatus.ARCHIVED]: 'Archived',
  [ProjectStatus.ON_HOLD]: 'On Hold',
  [ProjectStatus.COMPLETED]: 'Completed',
  [ProjectStatus.CANCELLED]: 'Cancelled',
  [ProjectStatus.PLANNING]: 'Planning',
};

// Helper to validate and fallback to a valid status
export const getValidStatus = (incomingStatus?: string): ProjectStatus => {
  const normalized = incomingStatus?.toLowerCase().trim();
  const validStatuses = Object.values(ProjectStatus);
  return validStatuses.includes(normalized as ProjectStatus)
    ? (normalized as ProjectStatus)
    : ProjectStatus.PLANNING;
};
