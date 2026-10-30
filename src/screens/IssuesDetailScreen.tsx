import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import {
  ScrollView,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useNavigation,
  useRoute,
  RouteProp,
  useFocusEffect,
} from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { RootState, useAppDispatch, useAppSelector } from '../store';
import { getStatusThemeColor, IssueStatus } from '../utils/enum';
import {
  setDescription,
  setIsEditingDescription,
} from '../store/issue_store/reducer/issue.reducer';
import {
  useGetUserStoryByIdQuery,
  useGetTaskByIdQuery,
  useGetUserStoryCommentsQuery,
  useGetTaskCommentsQuery,
  useGetTasksQuery,
  useUpdateUserStoryMutation,
  useUpdateTaskMutation,
  useCreateUserStoryCommentMutation,
  useUpdateUserStoryCommentMutation,
  useDeleteUserStoryCommentMutation,
  useCreateTaskCommentMutation,
  useUpdateTaskCommentMutation,
  useDeleteTaskCommentMutation,
  useUploadUserStoryCommentAttachmentMutation,
  useUploadTaskCommentAttachmentMutation,
} from '../store/api/userStoryApi';
import {
  deleteCommentLocally,
  setComments,
  updateCommentLocally,
  addCommentLocally,
  replaceCommentLocally,
  markCommentFailed,
} from '../store/comments_store/reducer/comments_reducer';
import {
  CommentItem,
  CreateTaskCommentResponse,
  CreateUserStoryCommentResponse,
} from '../types/comments.type';
import {
  ProjectMember,
  UpdateUserStoryPayload,
  UserStoryPriority,
  Sprint,
  UserStory,
} from '../types/project.type';
import { UpdateTaskPayload } from '../types/task.type';
import Screen from '../components/common/ScreenWapper';
import CommonHeader from '../components/common/CommonHeader';
import AppText from '../components/common/AppText';
import { showSnackbar } from '../components/common/Snackbar';
import PopupModel from '../components/Model';
import TaskDatePickerModal from '../components/TaskDatePickerModal';
import { SprintSelectionModal } from '../components/SprintSelectionModal';
import { UserStorySelectionModal } from '../components/UserStorySelectionModal';
import { IssueHeaderSection } from '../components/issueHeaderSection';
import { IssueMetaDetails } from '../components/issueMetaDetails';
import { IssueDescriptionSection } from '../components/issueDescriptionSection';
import { IssueAttachments } from '../components/issueAttachments';
import { IssueChildTasksSection } from '../components/issueChildTasksSection';
import { IssueCommentsSection } from '../components/issueCommentsSection';
import {
  IssueCommentInput,
  IssueCommentInputRef,
} from '../components/issueCommentInput';
import {
  useGetCustomStatusQuery,
  useGetUserStoryStatusQuery,
  useGetProjectMembersQuery,
  useGetSprintsQuery,
  useGetUserStoriesQuery,
} from '../store/api/projectApi';
import { skipToken } from '@reduxjs/toolkit/query';
import {
  AttachmentFile,
  TaskCommentAttachmentResponse,
  UploadUserStoryCommentAttachmentResponse,
} from '../types/attachment.type';
import usePermissions from '../hooks/usePermissions';

type IssueDetailRouteProp = RouteProp<RootStackParamList, 'issue'>;

const parseCommentContent = (
  html: string,
): { content: string; images: string[] } => {
  const imageSrcRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
  const images: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = imageSrcRegex.exec(html)) !== null) {
    images.push(match[1]);
  }
  const content = html.replace(imageSrcRegex, '').trim();
  return { content, images };
};

const IssueDetailScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<IssueDetailRouteProp>();
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const commentInputRef = useRef<IssueCommentInputRef>(null);
  const refreshRepliesRef = useRef<
    ((rootCommentId: string) => Promise<void>) | null
  >(null);

  const projectId = route.params?.projectId || (route.params?.id as string);
  const taskId = route.params?.taskId;
  const userStoryId = route.params?.userStoryId;
  const userStory = route.params?.story;
  const task = route.params?.task;
  const userStroyName = route.params?.storyName;
  const taskName = route.params?.taskName;

  const {
    permissionsReady,
    canEditTask,
    canEditUserStory,
    canCreateTask,
    canAddComments,
    canEditComments,
    canDeleteComments,
  } = usePermissions({
    projectId,
  });
  const { isEditingDescription } = useAppSelector(
    (state: RootState) => state.issue,
  );
  const {
    data: userStoryResponse,
    isLoading: userStoryLoading,
    refetch: refetchUserStory,
  } = useGetUserStoryByIdQuery(
    projectId && userStoryId ? { projectId, userStoryId } : skipToken,
  );

  const {
    data: taskResponse,
    isLoading: taskLoading,
    refetch: refetchTask,
  } = useGetTaskByIdQuery(
    projectId && taskId ? { projectId, taskId } : skipToken,
  );

  const {
    data: userStoryCommentsResponse,
    isLoading: userStoryCommentsLoading,
    refetch: refetchUserStoryComments,
  } = useGetUserStoryCommentsQuery(
    projectId && userStoryId
      ? { projectId, userStoryId, page: 1, pageSize: 10 }
      : skipToken,
  );

  const {
    data: taskCommentsResponse,
    isLoading: taskCommentsLoading,
    refetch: refetchTaskComments,
  } = useGetTaskCommentsQuery(
    taskId ? { taskId, page: 1, pageSize: 10 } : skipToken,
  );

  const {
    data: tasksResponse,
    isLoading: tasksLoading,
    refetch: refetchTasks,
  } = useGetTasksQuery(
    projectId && userStoryId
      ? { projectId, page: 1, page_size: 4, user_story_id: userStoryId }
      : skipToken,
  );

  const [updateUserStory] = useUpdateUserStoryMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [createUserStoryComment] = useCreateUserStoryCommentMutation();
  const [updateUserStoryComment] = useUpdateUserStoryCommentMutation();
  const [deleteUserStoryComment] = useDeleteUserStoryCommentMutation();
  const [createTaskComment] = useCreateTaskCommentMutation();
  const [updateTaskComment] = useUpdateTaskCommentMutation();
  const [deleteTaskComment] = useDeleteTaskCommentMutation();
  const [uploadUserStoryCommentAttachment] =
    useUploadUserStoryCommentAttachmentMutation();
  const [uploadTaskCommentAttachment] =
    useUploadTaskCommentAttachmentMutation();

  const [priority, setPriority] = useState<string>('');
  const [storyPoints, setStoryPoints] = useState<number>(0);
  const [localDescription, setLocalDescription] = useState<string>('');
  const [storyPointsText, setStoryPointsText] = useState<string>('');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [assignee, setAssignee] = useState<{
    id: string | null;
    name: string;
    color?: string;
    imageUrl?: string | null;
  } | null>(null);
  const [reporter, setReporter] = useState<{
    id: string | null;
    name: string;
    color?: string;
    imageUrl?: string | null;
  } | null>(null);
  const currentItemIdRef = useRef<string | null>(null);
  const [comment, setComment] = useState<string>('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [status, setStatus] = useState<IssueStatus | string>('');
  const [statusId, setStatusId] = useState<string>('');
  const [showStatusPicker, setShowStatusPicker] = useState<boolean>(false);
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(
    null,
  );
  const [expandedCommentIds, setExpandedCommentIds] = useState<
    Record<string, boolean>
  >({});
  const [commentAttachments, setCommentAttachments] = useState<
    AttachmentFile[]
  >([]);
  const [sprint, setSprint] = useState<{
    id: string | null;
    name: string;
  }>({ id: null, name: '' });
  const [userStoryState, setUserStoryState] = useState<{
    id: string | null;
    title: string;
  }>({ id: null, title: '' });
  const [sprintModalOpen, setSprintModalOpen] = useState(false);
  const [userStoryModalOpen, setUserStoryModalOpen] = useState(false);

  const isTaskView = Boolean(taskId);
  const currentItem: any = isTaskView
    ? (taskResponse ?? task)
    : (userStoryResponse ?? userStory);
  const isDetailsLoading = isTaskView ? taskLoading : userStoryLoading;

  const {
    data: sprintsResponse,
    isLoading: sprintsLoading,
    refetch: refetchSprints,
  } = useGetSprintsQuery(
    projectId ? { project_id: projectId, page: 1, page_size: 100 } : skipToken,
  );

  const sprints: Sprint[] = useMemo(() => {
    return Array.isArray(sprintsResponse?.data)
      ? (sprintsResponse.data as Sprint[])
      : [];
  }, [sprintsResponse?.data]);

  const {
    data: userStoriesResponse,
    isLoading: userStoriesLoading,
    refetch: refetchUserStories,
  } = useGetUserStoriesQuery(
    projectId && isTaskView
      ? {
          projectId,
          payload: {
            page: 1,
            page_size: 100,
            ...(sprint.id ? { sprint_id: sprint.id } : {}),
          },
        }
      : skipToken,
  );

  const userStories: UserStory[] = useMemo(() => {
    return Array.isArray(userStoriesResponse?.data)
      ? (userStoriesResponse.data as UserStory[])
      : [];
  }, [userStoriesResponse?.data]);

  const apiComments = isTaskView
    ? (taskCommentsResponse?.data ?? [])
    : (userStoryCommentsResponse?.data ?? []);

  const commentsLoading = isTaskView
    ? taskCommentsLoading
    : userStoryCommentsLoading;

  const canEdit =
    permissionsReady && (isTaskView ? canEditTask : canEditUserStory);

  const { data: membersResponse, isLoading: membersLoading } =
    useGetProjectMembersQuery(
      projectId ? { project_id: projectId, page: 1, page_size: 50 } : skipToken,
    );

  const members: ProjectMember[] = useMemo(() => {
    return (membersResponse?.data as ProjectMember[]) ?? [];
  }, [membersResponse?.data]);

  const tasks = tasksResponse?.data ?? [];
  const tasksMeta = tasksResponse?.meta ?? null;

  const handleDismissInputFocus = useCallback(() => {
    Keyboard.dismiss();
    commentInputRef.current?.dismissFocus();
  }, []);

  const handleRefreshRepliesReady = useCallback(
    (refresh: (rootCommentId: string) => Promise<void>) => {
      refreshRepliesRef.current = refresh;
    },
    [],
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      handleDismissInputFocus();
    });
    return unsubscribe;
  }, [navigation, handleDismissInputFocus]);

  useEffect(() => {
    if (currentItem && currentItem.id !== currentItemIdRef.current) {
      currentItemIdRef.current = currentItem.id;
      const p = currentItem.priority || 'medium';
      const sp = currentItem.story_points || 0;
      const desc = currentItem.description || '';
      const assName =
        ('assignee_name' in currentItem && currentItem.assignee_name) ||
        currentItem.assignee?.name ||
        currentItem.assignee?.full_name ||
        'Unassigned';
      const assId =
        currentItem.assignee_id ||
        currentItem.assignee?.id ||
        currentItem.assignee?.user_id ||
        null;
      const repName =
        ('reporter_name' in currentItem && currentItem.reporter_name) ||
        currentItem.reporter?.name ||
        currentItem.reporter?.full_name ||
        'N/A';
      const repId =
        currentItem.reporter_id ||
        currentItem.reporter?.id ||
        currentItem.reporter?.user_id ||
        null;
      const due = currentItem.due_date || null;
      const sId = currentItem.sprint_id ?? null;
      const sName = currentItem.sprint_name || '';
      const uId =
        currentItem.user_story_id && currentItem.user_story_id !== 'storyless'
          ? currentItem.user_story_id
          : null;
      const uTitle =
        currentItem.user_story_title &&
        currentItem.user_story_title !== 'Storyless'
          ? currentItem.user_story_title
          : '';

      setPriority(p);
      setStoryPoints(sp);
      setLocalDescription(desc);
      setStoryPointsText(sp.toString());
      setAssignee({
        id: assId,
        name: assName,
        color: currentItem.assignee?.color,
        imageUrl: currentItem.assignee?.avatar_url,
      });
      setReporter({
        id: repId,
        name: repName,
        color: currentItem.reporter?.color,
        imageUrl: currentItem.reporter?.avatar_url,
      });
      setDueDate(due);
      setSprint({ id: sId, name: sName });
      setUserStoryState({ id: uId, title: uTitle });
    }
  }, [currentItem]);

  const currentDescription = localDescription || '';

  const replyingToName = useMemo(() => {
    if (!replyingToCommentId) return undefined;
    const parent = (apiComments || []).find(
      c => c.id === replyingToCommentId,
    ) as CommentItem | undefined;
    if (!parent) return undefined;
    return parent.full_name || parent.user_name || undefined;
  }, [replyingToCommentId, apiComments]);

  const toggleExpanded = (id: string) =>
    setExpandedCommentIds(prev => ({ ...prev, [id]: !prev[id] }));

  const getRootCommentId = (commentId: string): string => {
    const byId = new Map<string, CommentItem>(
      (apiComments || []).map(c => [c.id, c]),
    );
    let currentId = commentId;
    const seen = new Set<string>([currentId]);
    while (true) {
      const current = byId.get(currentId);
      const pid = current?.parent_comment_id || null;
      if (!pid || !byId.has(pid) || seen.has(pid)) break;
      seen.add(pid);
      currentId = pid;
    }
    return currentId;
  };

  const { data: customStatusData, refetch: refetchCustomStatus } =
    useGetCustomStatusQuery(projectId ? { project_id: projectId } : skipToken);

  const { data: userStoryStatusData, refetch: refetchUserStoryStatus } =
    useGetUserStoryStatusQuery(
      projectId ? { project_id: projectId } : skipToken,
    );

  const statuses = isTaskView
    ? (customStatusData?.data ?? [])
    : (userStoryStatusData?.data ?? []);

  useEffect(() => {
    if (currentItem?.status) {
      setStatus(currentItem.status);
    }
    if (currentItem?.status_id) {
      setStatusId(currentItem.status_id);
    }
    if (currentItem?.sprint_id !== undefined) {
      setSprint({
        id: currentItem.sprint_id || null,
        name: currentItem.sprint_name || '',
      });
    }
    if (isTaskView && currentItem?.user_story_id !== undefined) {
      setUserStoryState({
        id:
          currentItem.user_story_id && currentItem.user_story_id !== 'storyless'
            ? currentItem.user_story_id
            : null,
        title:
          currentItem.user_story_title &&
          currentItem.user_story_title !== 'Storyless'
            ? currentItem.user_story_title
            : '',
      });
    }
  }, [currentItem, isTaskView]);

  useFocusEffect(
    useCallback(() => {
      if (!projectId) return;
      refetchSprints();
      if (taskId) {
        refetchTask();
        refetchCustomStatus();
        refetchTaskComments();
        refetchUserStories();
      } else if (userStoryId) {
        refetchUserStory();
        refetchUserStoryStatus();
        refetchUserStoryComments();
        refetchTasks();
      }
    }, [
      projectId,
      taskId,
      userStoryId,
      refetchCustomStatus,
      refetchUserStoryStatus,
      refetchTask,
      refetchTaskComments,
      refetchUserStory,
      refetchUserStoryComments,
      refetchTasks,
      refetchSprints,
      refetchUserStories,
    ]),
  );

  const activeStatusColor = useMemo(() => {
    if (statusId) {
      const matchedStatus = statuses.find(s => s.id === statusId);
      if (matchedStatus) {
        return matchedStatus.color;
      }
    }
    return getStatusThemeColor(status || currentItem?.status, colors);
  }, [statuses, statusId, status, currentItem, colors]);

  const displaySprintName = useMemo(() => {
    if (sprint.name) return sprint.name;
    if (sprint.id) {
      const found = sprints.find(s => s.id === sprint.id);
      if (found?.name) return found.name;
      return 'Sprint';
    }
    return 'No Sprint';
  }, [sprint, sprints]);

  const displayUserStoryTitle = useMemo(() => {
    if (userStoryState.title) return userStoryState.title;
    if (userStoryState.id) {
      const found = userStories.find(u => u.id === userStoryState.id);
      if (found?.title) return found.title;
      return 'User Story';
    }
    return 'None';
  }, [userStoryState, userStories]);

  const details = useMemo(() => {
    if (!currentItem) return [];
    const assigneeName =
      assignee?.name ||
      ('assignee_name' in currentItem && currentItem.assignee_name) ||
      currentItem.reporter?.name ||
      'Unassigned';
    const reporterName =
      reporter?.name ||
      ('reporter_name' in currentItem && currentItem.reporter_name) ||
      currentItem.reporter?.name ||
      'N/A';
    const displayPriority = priority || currentItem.priority || 'medium';
    const displayStoryPoints =
      storyPointsText ||
      (storyPoints ?? currentItem.story_points ?? 0).toString();

    const formatDueDateDisplay = (dateVal?: string | null): string => {
      if (!dateVal) return 'None';
      try {
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return dateVal;
        const dateStr = d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        const hasTime =
          dateVal.includes('T') &&
          !dateVal.endsWith('T00:00:00Z') &&
          !dateVal.endsWith('T00:00:00.000Z') &&
          !dateVal.endsWith('T00:00:00');
        if (hasTime) {
          const hours = String(d.getHours()).padStart(2, '0');
          const minutes = String(d.getMinutes()).padStart(2, '0');
          return `${dateStr} ${hours}:${minutes}`;
        }
        return dateStr;
      } catch {
        return dateVal || 'None';
      }
    };

    const items = [
      {
        label: 'Assignee',
        value: assigneeName,
        initials:
          assigneeName !== 'Unassigned'
            ? assigneeName
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
            : 'U',
        color:
          assignee?.color ||
          currentItem.assignee?.color ||
          members.find(member => member.user_id === assignee?.id)?.color ||
          colors.primary,
        imageUrl:
          assignee?.imageUrl ??
          currentItem.assignee?.avatar_url ??
          members.find(member => member.user_id === assignee?.id)?.avatar_url,
        isLoading: isDetailsLoading,
      },
      {
        label: 'Reporter',
        value: reporterName,
        initials:
          reporterName !== 'N/A' && reporterName !== 'Unassigned'
            ? reporterName
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
            : 'N/A',
        color:
          reporter?.color ||
          currentItem.reporter?.color ||
          members.find(member => member.user_id === reporter?.id)?.color ||
          colors.secondary,
        imageUrl:
          reporter?.imageUrl ??
          currentItem.reporter?.avatar_url ??
          members.find(member => member.user_id === reporter?.id)?.avatar_url,
        isLoading: isDetailsLoading,
      },
      {
        label: 'Priority',
        value:
          displayPriority.charAt(0).toUpperCase() + displayPriority.slice(1),
        dot: colors.warning,
        isLoading: isDetailsLoading,
      },
      {
        label: 'Story pts',
        value: displayStoryPoints.toString(),
        isLoading: isDetailsLoading,
      },
      {
        label: 'Due date',
        value: formatDueDateDisplay(dueDate ?? currentItem.due_date),
        isLoading: isDetailsLoading,
      },
      {
        label: 'Sprint',
        value: displaySprintName,
        isLoading: isDetailsLoading || sprintsLoading,
      },
    ];

    if (isTaskView) {
      items.push({
        label: 'User story',
        value: displayUserStoryTitle,
        isLoading: isDetailsLoading || userStoriesLoading,
      });
    }

    return items;
  }, [
    currentItem,
    members,
    colors,
    assignee,
    reporter,
    priority,
    storyPoints,
    isDetailsLoading,
    storyPointsText,
    dueDate,
    isTaskView,
    sprint,
    sprints,
    sprintsLoading,
    userStoryState,
    userStories,
    userStoriesLoading,
  ]);

  const handleOpenEditModal = useCallback(
    () => dispatch(setIsEditingDescription(true)),
    [dispatch],
  );
  const handleCloseEditModal = useCallback(
    () => dispatch(setIsEditingDescription(false)),
    [dispatch],
  );

  const handleSaveDescription = useCallback(
    async (newDescription: string) => {
      const targetId = taskId || userStoryId;
      if (!targetId || !projectId) {
        return;
      }

      const trimmedDescription = newDescription.trim();
      const prevDescription = localDescription;
      setLocalDescription(trimmedDescription);
      dispatch(
        setDescription({ issueId: targetId, description: trimmedDescription }),
      );
      dispatch(setIsEditingDescription(false));

      try {
        if (taskId) {
          const taskPayload: UpdateTaskPayload = {
            description: trimmedDescription,
          };
          await updateTask({
            projectId,
            taskId,
            payload: taskPayload,
          }).unwrap();
          refetchTask();
        } else if (userStoryId) {
          const userStoryPayload: UpdateUserStoryPayload = {
            description: trimmedDescription,
          };
          await updateUserStory({
            projectId,
            userStoryId,
            payload: userStoryPayload,
          }).unwrap();
          refetchUserStory();
        }
      } catch (error: any) {
        setLocalDescription(prevDescription);
        dispatch(
          setDescription({ issueId: targetId, description: prevDescription }),
        );
        const errorMessage =
          error?.data?.message ||
          error?.message ||
          'Failed to update description';
        showSnackbar({
          message: errorMessage,
          type: 'error',
        });
        console.error('Failed to update description:', error);
      }
    },
    [
      taskId,
      userStoryId,
      projectId,
      localDescription,
      dispatch,
      updateTask,
      updateUserStory,
      refetchTask,
      refetchUserStory,
    ],
  );

  const handlePrioritySelect = useCallback(
    async (selectedPriority: string) => {
      const prevPriority = priority;
      setPriority(selectedPriority);
      if (!projectId) {
        return;
      }
      try {
        if (taskId) {
          const taskPayload: UpdateTaskPayload = {
            priority: selectedPriority,
          };
          await updateTask({
            projectId,
            taskId,
            payload: taskPayload,
          }).unwrap();
          refetchTask();
        } else if (userStoryId) {
          const userStoryPayload: UpdateUserStoryPayload = {
            priority: selectedPriority as UserStoryPriority,
          };
          await updateUserStory({
            projectId,
            userStoryId,
            payload: userStoryPayload,
          }).unwrap();
          refetchUserStory();
        }
      } catch (error: any) {
        setPriority(prevPriority);
        const errorMessage =
          error?.data?.message || error?.message || 'Failed to update priority';
        showSnackbar({
          message: errorMessage,
          type: 'error',
        });
      }
    },
    [
      taskId,
      userStoryId,
      projectId,
      priority,
      updateTask,
      updateUserStory,
      refetchTask,
      refetchUserStory,
    ],
  );

  const handleAssigneeSelect = useCallback(
    async (member: ProjectMember | null) => {
      if (!projectId) return;
      const prevAssignee = assignee;
      const targetUserId = member?.user_id ?? null;
      const newName = member?.full_name || member?.username || 'Unassigned';

      setAssignee({
        id: targetUserId,
        name: newName,
        color: member?.color,
        imageUrl: member?.avatar_url,
      });

      try {
        if (taskId) {
          await updateTask({
            projectId,
            taskId,
            payload: {
              assignee_id: targetUserId,
            },
          }).unwrap();
          refetchTask();
        } else if (userStoryId) {
          await updateUserStory({
            projectId,
            userStoryId,
            payload: {
              assignee_id: targetUserId,
            },
          }).unwrap();
          refetchUserStory();
        }
      } catch (error: any) {
        setAssignee(prevAssignee);
        const errorMessage =
          error?.data?.message || error?.message || 'Failed to update assignee';
        showSnackbar({
          message: errorMessage,
          type: 'error',
        });
      }
    },
    [
      taskId,
      userStoryId,
      projectId,
      assignee,
      updateTask,
      updateUserStory,
      refetchTask,
      refetchUserStory,
    ],
  );

  const handleReporterSelect = useCallback(
    async (member: ProjectMember | null) => {
      if (!projectId) return;
      const prevReporter = reporter;
      const targetUserId = member?.user_id ?? null;
      const newName = member?.full_name || member?.username || 'N/A';

      setReporter({
        id: targetUserId,
        name: newName,
        color: member?.color,
        imageUrl: member?.avatar_url,
      });

      try {
        if (taskId) {
          await updateTask({
            projectId,
            taskId,
            payload: {
              reporter_id: targetUserId,
            },
          }).unwrap();
          refetchTask();
        } else if (userStoryId) {
          await updateUserStory({
            projectId,
            userStoryId,
            payload: {
              reporter_id: targetUserId,
            },
          }).unwrap();
          refetchUserStory();
        }
      } catch (error: any) {
        setReporter(prevReporter);
        const errorMessage =
          error?.data?.message || error?.message || 'Failed to update reporter';
        showSnackbar({
          message: errorMessage,
          type: 'error',
        });
      }
    },
    [
      taskId,
      userStoryId,
      projectId,
      reporter,
      updateTask,
      updateUserStory,
      refetchTask,
      refetchUserStory,
    ],
  );

  const handleStoryPointsBlur = useCallback(
    async (value: string) => {
      const parsed = parseInt(value.trim(), 10);
      const sanitized = Number.isNaN(parsed)
        ? 0
        : Math.max(0, Math.min(100, parsed));
      const currentPoints = currentItem?.story_points ?? 0;
      const prevStoryPoints = storyPoints;
      const prevStoryPointsText = storyPointsText;
      setStoryPoints(sanitized);
      setStoryPointsText(sanitized.toString());
      if (!projectId) {
        return;
      }
      if (sanitized === currentPoints) {
        return;
      }
      try {
        if (taskId) {
          const taskPayload: UpdateTaskPayload = {
            story_points: sanitized,
          };
          await updateTask({
            projectId,
            taskId,
            payload: taskPayload,
          }).unwrap();
          refetchTask();
        } else if (userStoryId) {
          const userStoryPayload: UpdateUserStoryPayload = {
            story_points: sanitized,
          };
          await updateUserStory({
            projectId,
            userStoryId,
            payload: userStoryPayload,
          }).unwrap();
          refetchUserStory();
        }
      } catch (error: any) {
        setStoryPoints(prevStoryPoints);
        setStoryPointsText(prevStoryPointsText);
        const errorMessage =
          error?.data?.message ||
          error?.message ||
          'Failed to update story points';
        showSnackbar({
          message: errorMessage,
          type: 'error',
        });
      }
    },
    [
      taskId,
      userStoryId,
      projectId,
      currentItem,
      storyPoints,
      storyPointsText,
      updateTask,
      updateUserStory,
      refetchTask,
      refetchUserStory,
    ],
  );

  const handleDueDateConfirm = useCallback(
    async (isoString: string) => {
      if (!projectId) return;
      const prevDueDate = dueDate;
      setDueDate(isoString);

      try {
        if (taskId) {
          const taskPayload: UpdateTaskPayload = {
            due_date: isoString,
          };
          await updateTask({
            projectId,
            taskId,
            payload: taskPayload,
          }).unwrap();
          refetchTask();
        } else if (userStoryId) {
          const userStoryPayload: UpdateUserStoryPayload = {
            due_date: isoString,
          };
          await updateUserStory({
            projectId,
            userStoryId,
            payload: userStoryPayload,
          }).unwrap();
          refetchUserStory();
        }
      } catch (error: any) {
        setDueDate(prevDueDate);
        const errorMessage =
          error?.data?.message || error?.message || 'Failed to update due date';
        showSnackbar({
          message: errorMessage,
          type: 'error',
        });
      }
    },
    [
      taskId,
      userStoryId,
      projectId,
      dueDate,
      updateTask,
      updateUserStory,
      refetchTask,
      refetchUserStory,
    ],
  );

  const handleDueDateClear = useCallback(async () => {
    if (!projectId) return;
    const prevDueDate = dueDate;
    setDueDate(null);

    try {
      if (taskId) {
        const taskPayload: UpdateTaskPayload = {
          due_date: null,
        };
        await updateTask({
          projectId,
          taskId,
          payload: taskPayload,
        }).unwrap();
        refetchTask();
      } else if (userStoryId) {
        const userStoryPayload: UpdateUserStoryPayload = {
          due_date: null,
        };
        await updateUserStory({
          projectId,
          userStoryId,
          payload: userStoryPayload,
        }).unwrap();
        refetchUserStory();
      }
    } catch (error: any) {
      setDueDate(prevDueDate);
      const errorMessage =
        error?.data?.message || error?.message || 'Failed to update due date';
      showSnackbar({
        message: errorMessage,
        type: 'error',
      });
    }
  }, [
    taskId,
    userStoryId,
    projectId,
    dueDate,
    updateTask,
    updateUserStory,
    refetchTask,
    refetchUserStory,
  ]);

  const handleSprintSelect = useCallback(
    async (selectedSprintItem: Sprint | null) => {
      if (!projectId) return;
      const prevSprint = sprint;
      const prevUserStory = userStoryState;
      const newSprintId = selectedSprintItem?.id ?? null;
      const newSprintName = selectedSprintItem?.name ?? 'No Sprint';

      setSprint({ id: newSprintId, name: newSprintName });

      try {
        if (taskId) {
          await updateTask({
            projectId,
            taskId,
            payload: {
              sprint_id: newSprintId,
            },
          }).unwrap();
          refetchTask();
          showSnackbar({
            message: 'Sprint updated successfully',
            type: 'success',
          });
        } else if (userStoryId) {
          await updateUserStory({
            projectId,
            userStoryId,
            payload: {
              sprint_id: newSprintId,
            },
          }).unwrap();
          refetchUserStory();
          showSnackbar({
            message: 'Sprint updated successfully',
            type: 'success',
          });
        }
      } catch (error: any) {
        setSprint(prevSprint);
        setUserStoryState(prevUserStory);
        const errorMessage =
          error?.data?.message || error?.message || 'Failed to update sprint';
        showSnackbar({
          message: errorMessage,
          type: 'error',
        });
      }
    },
    [
      projectId,
      taskId,
      userStoryId,
      sprint,
      userStoryState,
      updateTask,
      updateUserStory,
      refetchTask,
      refetchUserStory,
    ],
  );

  const handleUserStorySelect = useCallback(
    async (selectedStoryItem: UserStory | null) => {
      if (!projectId || !taskId) return;
      const prevUserStory = userStoryState;
      const prevSprint = sprint;
      const newUserStoryId = selectedStoryItem?.id ?? null;
      const newUserStoryTitle = selectedStoryItem?.title ?? 'None';

      setUserStoryState({ id: newUserStoryId, title: newUserStoryTitle });

      try {
        const payload: UpdateTaskPayload = {
          user_story_id: newUserStoryId,
        };
        if (
          selectedStoryItem?.sprint_id &&
          selectedStoryItem.sprint_id !== sprint.id
        ) {
          payload.sprint_id = selectedStoryItem.sprint_id;
          setSprint({
            id: selectedStoryItem.sprint_id,
            name: selectedStoryItem.sprint_name || '',
          });
        }
        await updateTask({
          projectId,
          taskId,
          payload,
        }).unwrap();
        refetchTask();
        showSnackbar({
          message: 'User story updated successfully',
          type: 'success',
        });
      } catch (error: any) {
        setUserStoryState(prevUserStory);
        setSprint(prevSprint);
        const errorMessage =
          error?.data?.message ||
          error?.message ||
          'Failed to update user story';
        showSnackbar({
          message: errorMessage,
          type: 'error',
        });
      }
    },
    [projectId, taskId, userStoryState, sprint, updateTask, refetchTask],
  );

  // 1. Uploads file immediately upon selection and saves its URL to the item
  const handleUploadCommentAttachment = async (file: AttachmentFile) => {
    try {
      let uploadedUrl: string | undefined;
      let attachment_id: string | undefined;
      if (taskId) {
        const result = await uploadTaskCommentAttachment({
          taskId,
          file: {
            uri: file.uri,
            name: file.name,
            type: file.mimeType || file.type,
          },
        });
        if (result.data) {
          const payload = result.data as TaskCommentAttachmentResponse;
          uploadedUrl = payload?.data?.[0]?.url;
          attachment_id = payload?.data?.[0]?.id;
        }
      } else if (userStoryId) {
        const result = await uploadUserStoryCommentAttachment({
          projectId,
          userStoryId,
          file: {
            uri: file.uri,
            name: file.name,
            type: file.mimeType || file.type,
          },
        });
        if (result.data) {
          const payload =
            result.data as UploadUserStoryCommentAttachmentResponse;
          uploadedUrl = payload?.data?.[0]?.url;
          attachment_id = payload?.data?.[0]?.id;
        }
      }

      if (uploadedUrl && attachment_id) {
        setCommentAttachments(prev =>
          prev.map(item =>
            item.id === file.id
              ? {
                  ...item,
                  id: attachment_id,
                  remoteUrl: uploadedUrl,
                  isUploading: false,
                }
              : item,
          ),
        );
      } else {
        setCommentAttachments(prev => prev.filter(item => item.id !== file.id));
      }
    } catch (err) {
      setCommentAttachments(prev => prev.filter(item => item.id !== file.id));
    }
  };

  // 2. Inserts uploaded URLs into HTML and sends comment on Send button click
  const handleSendComment = async () => {
    const rawText = comment.trim();
    if ((!rawText && commentAttachments.length === 0) || isSubmittingComment) {
      return;
    }

    // Embed all pre-uploaded URLs as HTML <img> / <video> tags
    let mediaHtml = '';
    commentAttachments.forEach(att => {
      if (att.remoteUrl) {
        if (att.type === 'video') {
          mediaHtml += `<p><video src="${att.remoteUrl}" controls style="max-width: 100%; border-radius: 8px;"></video></p>`;
        } else {
          mediaHtml += `<p><img src="${att.remoteUrl}?attachment_id=${att.id}" alt="${att.name}" style="max-width: 100%; border-radius: 8px;" /></p>`;
        }
      }
    });

    const finalContent = `${rawText}${
      mediaHtml ? `<br/>${mediaHtml}` : ''
    }`.trim();

    if (!finalContent) {
      return;
    }

    setIsSubmittingComment(true);
    const authorName =
      (currentItem &&
        'reporter_name' in currentItem &&
        currentItem.reporter_name) ||
      currentItem?.reporter?.name ||
      'User';
    const parentCommentId = replyingToCommentId;
    const tempId = 'temp-' + Date.now();

    // Optimistic pending item with flag `is_pending: true`
    const tempComment: any = {
      id: tempId,
      task_id: taskId,
      user_story_id: userStoryId,
      user_id: 'temp-user',
      user_name: authorName,
      full_name: authorName,
      email: '',
      avatar_url: null,
      content: finalContent,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_deleted: false,
      replies_count: 0,
      parent_comment_id: parentCommentId,
      is_pending: true, // Shows "Sending..." text
      is_failed: false,
    };

    setIsSubmittingComment(true);
    dispatch(addCommentLocally(tempComment));

    // Instantly reset input box and focus
    setComment('');
    setCommentAttachments([]);
    setReplyingToCommentId(null);
    handleDismissInputFocus();

    try {
      if (taskId) {
        const result = await createTaskComment({
          taskId,
          content: finalContent,
          parentCommentId: parentCommentId ?? null,
        });

        if (result.data) {
          const created = (result.data as CreateTaskCommentResponse | undefined)
            ?.data;
          if (created?.id) {
            dispatch(
              replaceCommentLocally({
                oldId: tempId,
                comment: {
                  ...tempComment,
                  ...created,
                  id: created.id,
                  content: finalContent,
                  task_id: taskId,
                  parent_comment_id: parentCommentId,
                  is_deleted: false,
                  replies_count: 0,
                  is_pending: false,
                  is_failed: false,
                },
              }),
            );
            if (parentCommentId) {
              const rootId = getRootCommentId(parentCommentId);
              setExpandedCommentIds(prev => ({
                ...prev,
                [rootId]: true,
              }));
              await refreshRepliesRef.current?.(rootId);
            }
          } else {
            dispatch(markCommentFailed(tempId));
          }
        } else {
          dispatch(markCommentFailed(tempId));
        }
      } else if (userStoryId) {
        const result = await createUserStoryComment({
          projectId,
          userStoryId,
          content: finalContent,
          parentCommentId: parentCommentId ?? null,
        });

        if (result.data) {
          const created = (
            result.data as CreateUserStoryCommentResponse | undefined
          )?.data;
          if (created?.id) {
            dispatch(
              replaceCommentLocally({
                oldId: tempId,
                comment: {
                  ...tempComment,
                  ...created,
                  id: created.id,
                  content: finalContent,
                  user_story_id: userStoryId,
                  parent_comment_id: parentCommentId,
                  is_deleted: false,
                  replies_count: 0,
                  is_pending: false,
                  is_failed: false,
                },
              }),
            );
            if (parentCommentId) {
              const rootId = getRootCommentId(parentCommentId);
              setExpandedCommentIds(prev => ({
                ...prev,
                [rootId]: true,
              }));
              await refreshRepliesRef.current?.(rootId);
            }
          } else {
            dispatch(markCommentFailed(tempId));
          }
        } else {
          dispatch(markCommentFailed(tempId));
        }
      }
    } catch (error) {
      dispatch(markCommentFailed(tempId));
      console.error('Error creating comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleRetryComment = async (commentId: string) => {
    const failedComment = apiComments.find(
      (c: any) => c.id === commentId,
    ) as any;
    if (!failedComment) {
      return;
    }

    const content = failedComment.content;
    const parentCommentId = failedComment.parent_comment_id || null;

    // Mark as pending again (Sending...)
    dispatch(
      replaceCommentLocally({
        oldId: commentId,
        comment: {
          ...failedComment,
          is_pending: true,
          is_failed: false,
        },
      }),
    );

    try {
      if (taskId) {
        const result = await createTaskComment({
          taskId,
          content,
          parentCommentId,
        });

        if (result.data) {
          const created = (result.data as CreateTaskCommentResponse | undefined)
            ?.data;
          if (created?.id) {
            dispatch(
              replaceCommentLocally({
                oldId: commentId,
                comment: {
                  ...failedComment,
                  ...created,
                  id: created.id,
                  content,
                  task_id: taskId,
                  parent_comment_id: parentCommentId,
                  is_deleted: false,
                  replies_count: 0,
                  is_pending: false,
                  is_failed: false,
                },
              }),
            );
            if (parentCommentId) {
              const rootId = getRootCommentId(parentCommentId);
              setExpandedCommentIds(prev => ({
                ...prev,
                [rootId]: true,
              }));
              await refreshRepliesRef.current?.(rootId);
            }
          } else {
            dispatch(markCommentFailed(commentId));
          }
        } else {
          dispatch(markCommentFailed(commentId));
        }
      } else if (userStoryId) {
        const result = await createUserStoryComment({
          projectId,
          userStoryId,
          content,
          parentCommentId,
        });

        if (result.data) {
          const created = (
            result.data as CreateUserStoryCommentResponse | undefined
          )?.data;
          if (created?.id) {
            dispatch(
              replaceCommentLocally({
                oldId: commentId,
                comment: {
                  ...failedComment,
                  ...created,
                  id: created.id,
                  content,
                  user_story_id: userStoryId,
                  parent_comment_id: parentCommentId,
                  is_deleted: false,
                  replies_count: 0,
                  is_pending: false,
                  is_failed: false,
                },
              }),
            );
            if (parentCommentId) {
              const rootId = getRootCommentId(parentCommentId);
              setExpandedCommentIds(prev => ({
                ...prev,
                [rootId]: true,
              }));
              await refreshRepliesRef.current?.(rootId);
            }
          } else {
            dispatch(markCommentFailed(commentId));
          }
        } else {
          dispatch(markCommentFailed(commentId));
        }
      }
    } catch (error) {
      dispatch(markCommentFailed(commentId));
      console.error('Error retrying comment:', error);
    }
  };

  const handleUpdateComment = async () => {
    const rawText = comment.trim();
    if (!editingCommentId || isSubmittingComment) {
      return;
    }
    const commentIdToUpdate = editingCommentId;
    const previousComments = [...apiComments];

    let mediaHtml = '';
    commentAttachments.forEach(att => {
      const url = att.remoteUrl || att.uri;
      if (url) {
        mediaHtml += `<p><img src="${url}" alt="${att.name}" style="max-width: 100%; border-radius: 8px;" /></p>`;
      }
    });

    const finalContent =
      `${rawText}${mediaHtml ? `<br/>${mediaHtml}` : ''}`.trim();

    if (!finalContent) {
      return;
    }

    setIsSubmittingComment(true);
    dispatch(
      updateCommentLocally({
        commentId: commentIdToUpdate,
        content: finalContent,
      }),
    );

    setComment('');
    setCommentAttachments([]);
    setEditingCommentId(null);
    handleDismissInputFocus();

    try {
      let isSuccess = false;

      if (taskId) {
        const result = await updateTaskComment({
          taskId,
          commentId: commentIdToUpdate,
          content: finalContent,
        });
        if (result.data) {
          isSuccess = true;
        } else {
          dispatch(setComments(previousComments));
        }
      } else if (userStoryId) {
        const result = await updateUserStoryComment({
          projectId,
          userStoryId,
          commentId: commentIdToUpdate,
          content: finalContent,
        });
        if (result.data) {
          isSuccess = true;
        } else {
          dispatch(setComments(previousComments));
        }
      }
    } catch (error) {
      dispatch(setComments(previousComments));
      console.error('Error updating comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      if (!taskId && !userStoryId) {
        return;
      }
      const previousComments = [...apiComments];
      dispatch(deleteCommentLocally(commentId));
      try {
        if (taskId) {
          const result = await deleteTaskComment({
            taskId,
            commentId,
          });
          if (!result.data) {
            dispatch(setComments(previousComments));
          }
        } else if (userStoryId) {
          const result = await deleteUserStoryComment({
            projectId,
            userStoryId,
            commentId,
          });
          if (!result.data) {
            dispatch(setComments(previousComments));
          }
        }
      } catch (error) {
        dispatch(setComments(previousComments));
        console.error('Error deleting comment:', error);
      }
    },
    [
      dispatch,
      taskId,
      userStoryId,
      projectId,
      apiComments,
      deleteTaskComment,
      deleteUserStoryComment,
    ],
  );

  const handleStartEditComment = (commentId: string, text: string) => {
    setReplyingToCommentId(null);

    const { content, images } = parseCommentContent(text);
    setEditingCommentId(commentId);
    setComment(content);

    const restoredAttachments: AttachmentFile[] = images.map((url, index) => ({
      id: `existing-${commentId}-${index}-${Date.now()}`,
      uri: url,
      name: url.split('/').pop() || `image-${index + 1}`,
      type: 'image' as const,
      mimeType: 'image/*',
      remoteUrl: url,
      isUploading: false,
    }));
    setCommentAttachments(restoredAttachments);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setComment('');
    setCommentAttachments([]);
  };

  const handleCommentSubmit = () => {
    if (editingCommentId) {
      handleUpdateComment();
    } else {
      handleSendComment();
    }
  };

  const toggleStatusPicker = () => setShowStatusPicker(prev => !prev);
  const selectStatus = (selected: IssueStatus | string) => {
    setStatus(selected);
    setShowStatusPicker(false);
  };
  const selectStatusId = async (selected: string) => {
    if (
      !selected ||
      selected === statusId ||
      (!taskId && !userStoryId) ||
      !projectId
    ) {
      return;
    }
    const prevStatus = status;
    const prevStatusId = statusId;
    const matched = statuses.find(s => s.id === selected);
    if (matched?.name) {
      setStatus(matched.name);
    }
    setStatusId(selected);

    try {
      if (taskId) {
        await updateTask({
          projectId,
          taskId,
          payload: {
            status_id: selected,
          },
        }).unwrap();
        refetchTask();
      } else if (userStoryId) {
        await updateUserStory({
          projectId,
          userStoryId,
          payload: {
            status_id: selected,
          },
        }).unwrap();
        refetchUserStory();
      }
    } catch (error: any) {
      setStatus(prevStatus);
      setStatusId(prevStatusId);
      const errorMessage =
        error?.data?.message || error?.message || 'Failed to update status';
      showSnackbar({
        message: errorMessage,
        type: 'error',
      });
    }
  };

  const title =
    currentItem?.title ||
    currentItem?.user_story_name ||
    currentItem?.task_name ||
    userStroyName ||
    taskName;

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <CommonHeader
        variant='custom'
        title={title}
        onBackPress={() => {
          handleDismissInputFocus();
          navigation.goBack();
        }}
        rightComponent={
          <AppText
            variant='caption'
            color={colors.textSecondary}
            className='text-xs font-semibold'
            numberOfLines={1}
          >
            {currentItem?.formatted_serial_number}
          </AppText>
        }
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback
          onPress={handleDismissInputFocus}
          accessible={false}
        >
          <ScrollView
            className='flex-1'
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps='handled'
            onScrollBeginDrag={handleDismissInputFocus}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <IssueHeaderSection
              colors={colors}
              currentItem={currentItem}
              title={title}
              status={status}
              statuses={statuses}
              activeStatusColor={activeStatusColor}
              showStatusPicker={showStatusPicker}
              onToggleStatusPicker={toggleStatusPicker}
              onSelectStatus={selectStatus}
              onSelectId={selectStatusId}
              isLoading={isDetailsLoading}
              canEditStatus={canEdit}
            />
            <IssueMetaDetails
              details={details}
              colors={colors}
              editableFields={{
                priority: true,
                storyPoints: true,
                assignee: true,
                reporter: true,
                dueDate: true,
                sprint: true,
                userStory: isTaskView,
              }}
              onPrioritySelect={handlePrioritySelect}
              onAssigneeSelect={handleAssigneeSelect}
              onReporterSelect={handleReporterSelect}
              onDueDatePress={() => setDatePickerOpen(true)}
              onSprintPress={() => setSprintModalOpen(true)}
              onUserStoryPress={() => setUserStoryModalOpen(true)}
              members={members}
              membersLoading={membersLoading}
              storyPointsInputProps={{
                value: storyPointsText,
                onChangeText: setStoryPointsText,
                onBlur: () => handleStoryPointsBlur(storyPointsText),
                editable: true,
              }}
              canEditDetails={canEdit}
            />
            <IssueDescriptionSection
              description={currentDescription}
              colors={colors}
              onEdit={handleOpenEditModal}
              isLoading={isDetailsLoading}
              canEditDescription={canEdit}
            />
            <IssueAttachments
              colors={colors}
              projectId={projectId}
              userStoryId={userStoryId}
              taskId={taskId}
              canAddAttachment={canEdit}
              canDeleteAttachment={canEdit}
            />
            {!isTaskView && (
              <IssueChildTasksSection
                tasks={tasks}
                colors={colors}
                projectId={projectId}
                navigation={navigation}
                meta={tasksMeta}
                loading={tasksLoading}
                userStoryId={userStoryId}
                onTaskCreated={() => {
                  refetchTasks();
                  refetchUserStory();
                }}
                canAddTask={canCreateTask}
              />
            )}
            <IssueCommentsSection
              colors={colors}
              commentsLoading={commentsLoading}
              apiComments={apiComments}
              editingCommentId={editingCommentId}
              onStartEdit={handleStartEditComment}
              onDeleteComment={handleDeleteComment}
              onReply={commentId => setReplyingToCommentId(commentId)}
              onRetry={handleRetryComment}
              expandedCommentIds={expandedCommentIds}
              onToggleExpand={toggleExpanded}
              onRefreshReplies={handleRefreshRepliesReady}
              taskId={taskId}
              userStoryId={userStoryId}
              projectId={projectId}
              canAddComment={permissionsReady && canAddComments}
              canEditComment={permissionsReady && canEditComments}
              canDeleteComment={permissionsReady && canDeleteComments}
            />
          </ScrollView>
        </TouchableWithoutFeedback>

        <View
          style={{
            paddingBottom: insets.bottom,
            backgroundColor: colors.surface,
          }}
        >
          <IssueCommentInput
            ref={commentInputRef}
            colors={colors}
            comment={comment}
            onChangeComment={setComment}
            editingCommentId={editingCommentId}
            onCancelEdit={handleCancelEditComment}
            isSubmittingComment={isSubmittingComment}
            onSubmit={handleCommentSubmit}
            currentItem={currentItem}
            replyingToCommentId={replyingToCommentId}
            replyingToName={replyingToName}
            onCancelReply={() => setReplyingToCommentId(null)}
            attachments={commentAttachments}
            onAttachmentsChange={setCommentAttachments}
            onUploadAttachment={handleUploadCommentAttachment}
            canAddComment={permissionsReady && canAddComments}
            canEditComment={permissionsReady && canEditComments}
          />
        </View>
      </KeyboardAvoidingView>

      {isEditingDescription && (
        <PopupModel
          visible={isEditingDescription}
          initialDescription={currentDescription}
          onClose={handleCloseEditModal}
          onSave={handleSaveDescription}
        />
      )}

      <TaskDatePickerModal
        visible={datePickerOpen}
        onClose={() => setDatePickerOpen(false)}
        onConfirm={handleDueDateConfirm}
        onClear={handleDueDateClear}
        initialDate={dueDate ?? currentItem?.due_date}
        colors={colors}
      />

      <SprintSelectionModal
        visible={sprintModalOpen}
        onClose={() => setSprintModalOpen(false)}
        sprints={sprints}
        selectedSprintId={sprint.id}
        onSelectSprint={handleSprintSelect}
        isLoading={sprintsLoading}
        colors={colors}
      />

      {isTaskView && (
        <UserStorySelectionModal
          visible={userStoryModalOpen}
          onClose={() => setUserStoryModalOpen(false)}
          stories={userStories}
          selectedStoryId={userStoryState.id}
          onSelectStory={handleUserStorySelect}
          isLoading={userStoriesLoading}
          colors={colors}
          sprintName={
            displaySprintName !== 'No Sprint' ? displaySprintName : undefined
          }
        />
      )}
    </Screen>
  );
};

export default IssueDetailScreen;
