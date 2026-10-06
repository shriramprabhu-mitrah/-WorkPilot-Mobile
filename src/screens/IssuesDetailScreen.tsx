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
} from '../types/project.type';
import { UpdateTaskPayload } from '../types/task.type';
import Screen from '../components/common/ScreenWapper';
import CommonHeader from '../components/common/CommonHeader';
import AppText from '../components/common/AppText';
import { showSnackbar } from '../components/common/Snackbar';
import PopupModel from '../components/Model';
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
} from '../store/api/projectApi';
import { skipToken } from '@reduxjs/toolkit/query';
import {
  AttachmentFile,
  TaskCommentAttachmentResponse,
  UploadUserStoryCommentAttachmentResponse,
} from '../types/attachment.type';

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
    isFetching: tasksFetching,
    refetch: refetchTasks,
  } = useGetTasksQuery(
    projectId && userStoryId
      ? { projectId, page: 1, page_size: 8, user_story_id: userStoryId }
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
  const [assignee, setAssignee] = useState<{
    id: string | null;
    name: string;
  } | null>(null);
  const [reporter, setReporter] = useState<{
    id: string | null;
    name: string;
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

  const isTaskView = Boolean(taskId);
  const currentItem: any = isTaskView
    ? (taskResponse ?? task)
    : (userStoryResponse ?? userStory);
  const isDetailsLoading = isTaskView ? taskLoading : userStoryLoading;

  const apiComments = isTaskView
    ? (taskCommentsResponse?.data ?? [])
    : (userStoryCommentsResponse?.data ?? []);

  const commentsLoading = isTaskView
    ? taskCommentsLoading
    : userStoryCommentsLoading;

  const { data: membersResponse, isLoading: membersLoading } =
    useGetProjectMembersQuery(
      projectId
        ? { project_id: projectId, page: 1, page_size: 50 }
        : skipToken,
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

      setPriority(p);
      setStoryPoints(sp);
      setLocalDescription(desc);
      setStoryPointsText(sp.toString());
      setAssignee({ id: assId, name: assName });
      setReporter({ id: repId, name: repName });
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
  }, [currentItem]);

  useFocusEffect(
    useCallback(() => {
      if (!projectId) return;
      if (taskId) {
        refetchTask();
        refetchCustomStatus();
        refetchTaskComments();
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
    return [
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
        color: colors.primary,
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
        color: colors.secondary,
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
    ];
  }, [
    currentItem,
    colors,
    assignee,
    reporter,
    priority,
    storyPoints,
    isDetailsLoading,
    storyPointsText,
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
          error?.data?.message ||
          error?.message ||
          'Failed to update priority';
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
      const newName =
        member?.full_name || member?.username || 'Unassigned';

      setAssignee({ id: targetUserId, name: newName });

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
          error?.data?.message ||
          error?.message ||
          'Failed to update assignee';
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
      const newName =
        member?.full_name || member?.username || 'N/A';

      setReporter({ id: targetUserId, name: newName });

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
          error?.data?.message ||
          error?.message ||
          'Failed to update reporter';
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
        error?.data?.message ||
        error?.message ||
        'Failed to update status';
      showSnackbar({
        message: errorMessage,
        type: 'error',
      });
    }
  };

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <CommonHeader
        variant='custom'
        title={
          currentItem?.title ||
          currentItem?.user_story_name ||
          currentItem?.task_name ||
          userStroyName ||
          taskName
        }
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
              status={status}
              statuses={statuses}
              activeStatusColor={activeStatusColor}
              showStatusPicker={showStatusPicker}
              onToggleStatusPicker={toggleStatusPicker}
              onSelectStatus={selectStatus}
              onSelectId={selectStatusId}
              isLoading={isDetailsLoading}
            />
            <IssueMetaDetails
              details={details}
              colors={colors}
              editableFields={{
                priority: true,
                storyPoints: true,
                assignee: true,
                reporter: true,
              }}
              onPrioritySelect={handlePrioritySelect}
              onAssigneeSelect={handleAssigneeSelect}
              onReporterSelect={handleReporterSelect}
              members={members}
              membersLoading={membersLoading}
              storyPointsInputProps={{
                value: storyPointsText,
                onChangeText: setStoryPointsText,
                onBlur: () => handleStoryPointsBlur(storyPointsText),
                editable: true,
              }}
            />
            <IssueDescriptionSection
              description={currentDescription}
              colors={colors}
              onEdit={handleOpenEditModal}
              isLoading={isDetailsLoading}
            />
            <IssueAttachments
              colors={colors}
              projectId={projectId}
              userStoryId={userStoryId}
              taskId={taskId}
            />
            {!isTaskView && (
              <IssueChildTasksSection
                tasks={tasks}
                colors={colors}
                projectId={projectId}
                navigation={navigation}
                meta={tasksMeta}
                loading={tasksLoading}
                loadingMore={tasksFetching}
                userStoryId={userStoryId}
                onTaskCreated={() => {
                  refetchTasks();
                  refetchUserStory();
                }}
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
          />
        </View>
      </KeyboardAvoidingView>

      <PopupModel
        visible={isEditingDescription}
        initialDescription={currentDescription}
        onClose={handleCloseEditModal}
        onSave={handleSaveDescription}
      />
    </Screen>
  );
};

export default IssueDetailScreen;
