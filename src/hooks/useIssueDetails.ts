import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
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
  getUserStoryById,
  getTaskById,
} from '../store/project_store/action/project_thunk';
import {
  fetchUserStoryComments,
  fetchTaskComments,
  createTaskComment,
  updateTaskComment,
  deleteTaskComment,
} from '../store/comments_store/action/comments.thunk';

type IssueDetailRouteProp = RouteProp<RootStackParamList, 'issue'>;

export const useIssueDetails = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<IssueDetailRouteProp>();
  const { colors } = useTheme();
  const dispatch = useAppDispatch();

  const projectId = route.params?.projectId || route.params?.id;
  const taskId = route.params?.taskId;
  const userStoryId = route.params?.userStoryId;

  const { isEditingDescription } = useAppSelector(
    (state: RootState) => state.issue,
  );
  const { selectedUserStory, loading, selectedTask } = useAppSelector(
    (state: RootState) => state.projects,
  );
  const { comments: apiComments, loading: commentsLoading } = useAppSelector(
    (state: RootState) => state.comments || { comments: [], loading: false },
  );

  const [comment, setComment] = useState<string>('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [status, setStatus] = useState<IssueStatus | string>('');
  const [showStatusPicker, setShowStatusPicker] = useState<boolean>(false);

  const isTaskView = Boolean(taskId);
  const currentItem = isTaskView ? selectedTask : selectedUserStory;

  useEffect(() => {
    if (!projectId) {
      return;
    }
    if (taskId) {
      dispatch(getTaskById({ projectId, taskId }));
      dispatch(fetchTaskComments({ taskId, page: 1, pageSize: 10 }));
    } else if (userStoryId) {
      dispatch(getUserStoryById({ projectId, userStoryId }));
      dispatch(
        fetchUserStoryComments({
          projectId,
          userStoryId,
          page: 1,
          pageSize: 10,
        }),
      );
    }
  }, [dispatch, projectId, taskId, userStoryId]);

  useEffect(() => {
    if (currentItem?.status) {
      setStatus(currentItem.status);
    }
  }, [currentItem]);

  const currentDescription =
    (currentItem && 'description' in currentItem
      ? currentItem.description
      : '') || '';
  const activeStatusColor = useMemo(
    () => getStatusThemeColor(status || currentItem?.status, colors),
    [status, currentItem, colors],
  );

  const details = useMemo(() => {
    if (!currentItem) return [];
    const assigneeName =
      ('assignee_name' in currentItem && currentItem.assignee_name) ||
      currentItem.reporter?.name ||
      'Unassigned';
    const reporterName =
      ('reporter_name' in currentItem && currentItem.reporter_name) ||
      currentItem.reporter?.name ||
      'N/A';

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
      },
      {
        label: 'Reporter',
        value: reporterName,
        initials:
          reporterName !== 'N/A'
            ? reporterName
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
            : 'N/A',
        color: colors.secondary,
      },
      {
        label: 'Priority',
        value: currentItem.priority
          ? currentItem.priority.charAt(0).toUpperCase() +
            currentItem.priority.slice(1)
          : 'Medium',
        dot: colors.warning,
      },
      {
        label: 'Story pts',
        value:
          ('story_points' in currentItem
            ? currentItem.story_points?.toString()
            : '0') || '0',
      },
    ];
  }, [currentItem, colors]);

  const handleOpenEditModal = useCallback(
    () => dispatch(setIsEditingDescription(true)),
    [dispatch],
  );
  const handleCloseEditModal = useCallback(
    () => dispatch(setIsEditingDescription(false)),
    [dispatch],
  );

  const handleSaveDescription = useCallback(
    (newDescription: string) => {
      const targetId = taskId || userStoryId;
      if (!targetId) return;
      dispatch(
        setDescription({ issueId: targetId, description: newDescription }),
      );
      dispatch(setIsEditingDescription(false));
    },
    [dispatch, taskId, userStoryId],
  );

  const handleSendComment = async () => {
    const trimmed = comment.trim();
    if (!trimmed || isSubmittingComment) {
      return;
    }
    try {
      setIsSubmittingComment(true);
      if (taskId) {
        dispatch(createTaskComment({ taskId, content: trimmed }));
        dispatch(fetchTaskComments({ taskId, page: 1, pageSize: 10 }));
      } else if (userStoryId && projectId) {
        dispatch(
          fetchUserStoryComments({
            projectId,
            userStoryId,
            page: 1,
            pageSize: 10,
          }),
        );
      }
      setComment('');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleUpdateComment = async () => {
    const trimmed = comment.trim();
    if (!trimmed || !editingCommentId || isSubmittingComment) return;
    try {
      setIsSubmittingComment(true);
      if (taskId) {
        dispatch(
          updateTaskComment({
            taskId,
            commentId: editingCommentId,
            content: trimmed,
          }),
        );
        dispatch(fetchTaskComments({ taskId, page: 1, pageSize: 10 }));
      }
      setComment('');
      setEditingCommentId(null);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      if (!taskId) return;
      try {
        dispatch(deleteTaskComment({ taskId, commentId }));
        dispatch(fetchTaskComments({ taskId, page: 1, pageSize: 10 }));
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    },
    [dispatch, taskId],
  );

  return {
    navigation,
    colors,
    loading,
    currentItem,
    status,
    setStatus,
    showStatusPicker,
    setShowStatusPicker,
    activeStatusColor,
    details,
    currentDescription,
    isEditingDescription,
    isTaskView,
    subtasks: selectedUserStory?.tasks || [],
    apiComments,
    commentsLoading,
    comment,
    setComment,
    editingCommentId,
    setEditingCommentId,
    isSubmittingComment,
    projectId,
    handleOpenEditModal,
    handleCloseEditModal,
    handleSaveDescription,
    handleSendComment,
    handleUpdateComment,
    handleDeleteComment,
  };
};
