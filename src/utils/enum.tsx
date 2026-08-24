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

export enum IssueStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  TESTING = 'testing',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
}

export const STATUS_OPTIONS: IssueStatus[] = [
  IssueStatus.TODO,
  IssueStatus.IN_PROGRESS,
  IssueStatus.IN_REVIEW,
  IssueStatus.TESTING,
  IssueStatus.COMPLETED,
  IssueStatus.BLOCKED,
];

export const TASK_STATUS_LABELS: Record<IssueStatus, string> = {
  [IssueStatus.TODO]: 'To Do',
  [IssueStatus.IN_PROGRESS]: 'In Progress',
  [IssueStatus.IN_REVIEW]: 'In Review',
  [IssueStatus.TESTING]: 'Testing',
  [IssueStatus.COMPLETED]: 'Completed',
  [IssueStatus.BLOCKED]: 'Blocked',
};

export const getStatusLabel = (status: string | undefined): string => {
  if (!status) return 'To Do';
  const enumValue = status.toLowerCase() as IssueStatus;
  return TASK_STATUS_LABELS[enumValue] || status;
};

export const getStatusThemeColor = (
  status: string | undefined,
  colors: Record<string, string>,
): string => {
  if (!status) return colors.primary;
  const enumValue = status.toLowerCase() as IssueStatus;

  switch (enumValue) {
    case IssueStatus.TODO:
      return colors.secondary || colors.textSecondary || '#6B7280';
    case IssueStatus.IN_PROGRESS:
      return colors.info || colors.primary || '#3B82F6';
    case IssueStatus.IN_REVIEW:
      return colors.warning || '#F59E0B';
    case IssueStatus.TESTING:
      return colors.purple || '#8B5CF6';
    case IssueStatus.COMPLETED:
      return colors.success || '#10B981';
    case IssueStatus.BLOCKED:
      return colors.error || '#EF4444';
    default:
      return colors.primary;
  }
};

export enum TaskPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export const TASK_PRIORITY_OPTIONS: TaskPriority[] = [
  TaskPriority.CRITICAL,
  TaskPriority.HIGH,
  TaskPriority.MEDIUM,
  TaskPriority.LOW,
];

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  [TaskPriority.CRITICAL]: 'Critical',
  [TaskPriority.HIGH]: 'High',
  [TaskPriority.MEDIUM]: 'Medium',
  [TaskPriority.LOW]: 'Low',
};

export const getPriorityLabel = (priority: string | undefined): string => {
  if (!priority) return 'Medium';
  const enumValue = priority.toLowerCase() as TaskPriority;
  return TASK_PRIORITY_LABELS[enumValue] || priority;
};

export const getPriorityThemeColor = (
  priority: string | undefined,
  colors: Record<string, string>,
): string => {
  if (!priority) return colors.primary;
  const enumValue = priority.toLowerCase() as TaskPriority;

  switch (enumValue) {
    case TaskPriority.CRITICAL:
      return colors.error || '#EF4444';
    case TaskPriority.HIGH:
      return colors.warning || '#F97316';
    case TaskPriority.MEDIUM:
      return colors.accentOrange || '#F59E0B';
    case TaskPriority.LOW:
      return colors.success || '#10B981';
    default:
      return colors.primary;
  }
};
