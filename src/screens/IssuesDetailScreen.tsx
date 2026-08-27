import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { ScrollView } from 'react-native';
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
  getTaskById,
  getUserStoryById,
  updateUserStory,
} from '../store/project_store/action/project_thunk';
import {
  fetchUserStoryComments,
  fetchTaskComments,
  createTaskComment,
  updateTaskComment,
  deleteTaskComment,
  createUserStoryComment,
  updateUserStoryComment,
  deleteUserStoryComment,
} from '../store/comments_store/action/comments.thunk';
import {
  deleteCommentLocally,
  setComments,
  updateCommentLocally,
  addCommentLocally,
  replaceCommentLocally,
} from '../store/comments_store/reducer/comments_reducer';
import {
  CommentItem,
  CreateTaskCommentResponse,
  CreateUserStoryCommentResponse,
} from '../types/comments.type';
import {
  UpdateUserStoryPayload,
  UserStoryPriority,
} from '../types/project.type';
import { UpdateTaskPayload } from '../types/task.type';
import {
  getTasks,
  updateTaskThunk,
} from '../store/task_store/action/task.thunk';

import Screen from '../components/common/ScreenWapper';
import CommonHeader from '../components/common/CommonHeader';
import AppText from '../components/common/AppText';
import PopupModel from '../components/Model';
import { IssueHeaderSection } from '../components/issueHeaderSection';
import { IssueMetaDetails } from '../components/issueMetaDetails';
import { IssueDescriptionSection } from '../components/issueDescriptionSection';
import { IssueChildTasksSection } from '../components/issueChildTasksSection';
import { IssueCommentsSection } from '../components/issueCommentsSection';
import { IssueCommentInput } from '../components/issueCommentInput';
import {
  getCustomStatusData,
  getUserStoryStatusData,
} from '../store/customStatus_store/action/customstatus.thunk';

type IssueDetailRouteProp = RouteProp<RootStackParamList, 'issue'>;

const IssueDetailScreen = () => {
  // ── Navigation / route ──
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<IssueDetailRouteProp>();
  const { colors } = useTheme();
  const dispatch = useAppDispatch();

  const projectId = route.params?.projectId || (route.params?.id as string);
  const taskId = route.params?.taskId;
  const userStoryId = route.params?.userStoryId;
  const userStory = route.params?.story;
  const task = route.params?.task;
  const fromUserStory = route.params?.fromUserStory;

  // ── Selectors ──
  const { isEditingDescription } = useAppSelector(
    (state: RootState) => state.issue,
  );
  const {
    selectedUserStory,
    loading,
    selectedTask,
    tasks,
    tasksMeta,
    loadingMore,
    customStatuses,
    userStoryStatuses,
  } = useAppSelector((state: RootState) => state.projects);

  const { comments: apiComments, loading: commentsLoading } = useAppSelector(
    (state: RootState) => state.comments || { comments: [], loading: false },
  );

  // ── State ──
  const [priority, setPriority] = useState<string>('');
  const [storyPoints, setStoryPoints] = useState<number>(0);
  const [localDescription, setLocalDescription] = useState<string>('');
  const [storyPointsText, setStoryPointsText] = useState<string>('');
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

  const isTaskView = Boolean(taskId);
  const currentItem: any = isTaskView
    ? task || selectedTask
    : userStory || selectedUserStory;

  useEffect(() => {
    if (currentItem && currentItem.id !== currentItemIdRef.current) {
      currentItemIdRef.current = currentItem.id;
      const p = currentItem.priority || 'medium';
      const sp = currentItem.story_points ?? 0;
      const desc = currentItem.description || '';
      setPriority(p);
      setStoryPoints(sp);
      setLocalDescription(desc);
      setStoryPointsText(sp.toString());
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

  // Resolve the root parent id of a comment by walking parent_comment_id upward.
  // Used so newly created replies auto-expand the correct root thread.
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

  // ── Effects ──

  useFocusEffect(
    useCallback(() => {
      if (!projectId) {
        return;
      }
      dispatch(getCustomStatusData({ projectId }));
      dispatch(getUserStoryStatusData({ projectId }));
    }, [dispatch, projectId]),
  );

  useEffect(() => {
    if (!projectId) {
      return;
    }
    if (taskId && statusId) {
      dispatch(
        updateTaskThunk({
          projectId,
          taskId: taskId,
          payload: {
            status_id: statusId,
          },
        }),
      );
    } else if (userStoryId && statusId) {
      dispatch(
        updateUserStory({
          projectId,
          userStoryId,
          payload: {
            status_id: statusId,
          },
        }),
      );
    }
  }, [dispatch, statusId]);

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
      dispatch(
        getTasks({
          projectId,
          page: 1,
          page_size: 8,
          user_story_id: userStoryId,
        }),
      );
    }
  }, [dispatch, projectId, taskId, userStoryId]);

  useEffect(() => {
    if (currentItem?.status) {
      setStatus(currentItem.status);
    }
  }, [currentItem]);

  // ── Derived values ──
  const activeStatusColor = useMemo(() => {
    if (!isTaskView && statusId) {
      const matchedStatus = userStoryStatuses.find(s => s.id === statusId);
      if (matchedStatus) {
        return matchedStatus.color;
      }
    }
    return getStatusThemeColor(status || currentItem?.status, colors);
  }, [isTaskView, statusId, userStoryStatuses, status, currentItem, colors]);

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
        value:
          displayPriority.charAt(0).toUpperCase() + displayPriority.slice(1),
        dot: colors.warning,
      },
      {
        label: 'Story pts',
        value: displayStoryPoints.toString(),
      },
    ];
  }, [currentItem, colors, priority, storyPoints]);

  // ── Handlers ──
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
      if (!targetId || !projectId) return;

      const trimmedDescription = newDescription.trim();
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
          dispatch(
            updateTaskThunk({
              projectId,
              taskId,
              payload: taskPayload,
            }),
          );
        } else if (userStoryId) {
          const userStoryPayload: UpdateUserStoryPayload = {
            description: trimmedDescription,
          };
          dispatch(
            updateUserStory({
              projectId,
              userStoryId,
              payload: userStoryPayload,
            }),
          );
        }
      } catch (error) {
        console.error('Failed to update description:', error);
      }
    },
    [dispatch, taskId, userStoryId, projectId],
  );

  const handlePrioritySelect = useCallback(
    (selectedPriority: string) => {
      setPriority(selectedPriority);
      if (!projectId) {
        return;
      }
      if (taskId) {
        const taskPayload: UpdateTaskPayload = {
          priority: selectedPriority,
        };
        dispatch(
          updateTaskThunk({
            projectId,
            taskId,
            payload: taskPayload,
          }),
        );
      } else if (userStoryId) {
        const userStoryPayload: UpdateUserStoryPayload = {
          priority: selectedPriority as UserStoryPriority,
        };
        dispatch(
          updateUserStory({
            projectId,
            userStoryId,
            payload: userStoryPayload,
          }),
        );
      }
    },
    [dispatch, taskId, userStoryId, projectId],
  );

  const handleStoryPointsBlur = useCallback(
    (value: string) => {
      const parsed = parseInt(value, 10);
      const sanitized = Number.isNaN(parsed)
        ? 0
        : Math.max(0, Math.min(100, parsed));
      setStoryPoints(sanitized);
      if (!projectId) {
        return;
      }
      if (taskId) {
        const taskPayload: UpdateTaskPayload = {
          story_points: sanitized,
        };
        dispatch(
          updateTaskThunk({
            projectId,
            taskId,
            payload: taskPayload,
          }),
        );
      } else if (userStoryId) {
        const userStoryPayload: UpdateUserStoryPayload = {
          story_points: sanitized,
        };
        dispatch(
          updateUserStory({
            projectId,
            userStoryId,
            payload: userStoryPayload,
          }),
        );
      }
    },
    [dispatch, taskId, userStoryId, projectId],
  );

  const handleSendComment = async () => {
    const trimmed = comment.trim();
    if (!trimmed || isSubmittingComment) {
      return;
    }
    const previousComments = [...apiComments];
    const authorName =
      (currentItem &&
        'reporter_name' in currentItem &&
        currentItem.reporter_name) ||
      currentItem?.reporter?.name ||
      'User';
    const parentCommentId = replyingToCommentId;
    const tempId = 'temp-' + Date.now();
    const tempComment = {
      id: tempId,
      task_id: taskId,
      user_story_id: userStoryId,
      user_id: 'temp-user',
      user_name: authorName,
      full_name: authorName,
      email: '',
      avatar_url: null,
      content: trimmed,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_deleted: false,
      replies_count: 0,
      parent_comment_id: parentCommentId,
    };
    setComment('');
    setReplyingToCommentId(null);
    setIsSubmittingComment(true);
    dispatch(addCommentLocally(tempComment));
    try {
      if (taskId) {
        const result = await dispatch(
          createTaskComment({
            taskId,
            content: trimmed,
            parentCommentId: parentCommentId ?? null,
          }),
        );

        if (result.meta.requestStatus === 'fulfilled') {
          const created = (
            result.payload as CreateTaskCommentResponse | undefined
          )?.data;
          if (created?.id) {
            dispatch(
              replaceCommentLocally({
                oldId: tempId,
                comment: {
                  ...tempComment,
                  ...created,
                  id: created.id,
                  content: trimmed,
                  task_id: taskId,
                  parent_comment_id: parentCommentId,
                  is_deleted: false,
                  replies_count: 0,
                },
              }),
            );
            if (parentCommentId) {
              const rootId = getRootCommentId(parentCommentId);
              setExpandedCommentIds(prev => ({
                ...prev,
                [rootId]: true,
              }));
            }
          } else {
            dispatch(setComments(previousComments));
            console.error(
              'Create comment succeeded but no id returned; reverted.',
            );
          }
        } else {
          dispatch(setComments(previousComments));
          console.error('Failed to create comment on server, reverted.');
        }
      } else if (userStoryId) {
        const result = await dispatch(
          createUserStoryComment({
            projectId,
            userStoryId,
            content: trimmed,
            parentCommentId: parentCommentId ?? null,
          }),
        );

        if (result.meta.requestStatus === 'fulfilled') {
          const created = (
            result.payload as CreateUserStoryCommentResponse | undefined
          )?.data;
          if (created?.id) {
            dispatch(
              replaceCommentLocally({
                oldId: tempId,
                comment: {
                  ...tempComment,
                  ...created,
                  id: created.id,
                  content: trimmed,
                  user_story_id: userStoryId,
                  parent_comment_id: parentCommentId,
                  is_deleted: false,
                  replies_count: 0,
                },
              }),
            );
            if (parentCommentId) {
              const rootId = getRootCommentId(parentCommentId);
              setExpandedCommentIds(prev => ({
                ...prev,
                [rootId]: true,
              }));
            }
          } else {
            dispatch(setComments(previousComments));
            console.error(
              'Create comment succeeded but no id returned; reverted.',
            );
          }
        } else {
          dispatch(setComments(previousComments));
          console.error('Failed to create comment on server, reverted.');
        }
      }
    } catch (error) {
      dispatch(setComments(previousComments));
      console.error('Error creating comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleUpdateComment = async () => {
    const trimmed = comment.trim();
    if (!trimmed || !editingCommentId || isSubmittingComment) {
      return;
    }
    const commentIdToUpdate = editingCommentId;
    const previousComments = [...apiComments];
    setComment('');
    setEditingCommentId(null);
    dispatch(
      updateCommentLocally({ commentId: commentIdToUpdate, content: trimmed }),
    );

    try {
      if (taskId) {
        const result = await dispatch(
          updateTaskComment({
            taskId,
            commentId: commentIdToUpdate,
            content: trimmed,
          }),
        );
        if (result.meta.requestStatus !== 'fulfilled') {
          dispatch(setComments(previousComments));
          console.error('Failed to update comment on server, reverted.');
        }
      } else if (userStoryId) {
        const result = await dispatch(
          updateUserStoryComment({
            projectId,
            userStoryId,
            commentId: commentIdToUpdate,
            content: trimmed,
          }),
        );
        if (result.meta.requestStatus !== 'fulfilled') {
          dispatch(setComments(previousComments));
          console.error('Failed to update comment on server, reverted.');
        }
      }
    } catch (error) {
      dispatch(setComments(previousComments));
      console.error('Error updating comment:', error);
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
          const result = await dispatch(
            deleteTaskComment({
              taskId,
              commentId,
            }),
          );
          if (result.meta.requestStatus !== 'fulfilled') {
            dispatch(setComments(previousComments));
            console.error('Failed to delete comment on server, reverted.');
          }
        } else if (userStoryId) {
          const result = await dispatch(
            deleteUserStoryComment({
              projectId,
              userStoryId,
              commentId,
            }),
          );
          if (result.meta.requestStatus !== 'fulfilled') {
            dispatch(setComments(previousComments));
            console.error('Failed to delete comment on server, reverted.');
          }
        }
      } catch (error) {
        dispatch(setComments(previousComments));
        console.error('Error deleting comment:', error);
      }
    },
    [dispatch, taskId, userStoryId, projectId, apiComments],
  );

  const handleStartEditComment = (commentId: string, text: string) => {
    setReplyingToCommentId(null);
    setEditingCommentId(commentId);
    setComment(text);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setComment('');
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

  const selectStatusId = (selected: string) => {
    setStatusId(selected);
  };

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <CommonHeader
        variant='custom'
        title={
          currentItem?.title ||
          currentItem?.user_story_name ||
          currentItem?.task_name
        }
        onBackPress={() => navigation.goBack()}
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

      <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
        <IssueHeaderSection
          colors={colors}
          currentItem={currentItem}
          status={status}
          customStatuses={customStatuses}
          userStoryStatuses={userStoryStatuses}
          isUserStory={!!userStoryId}
          activeStatusColor={activeStatusColor}
          showStatusPicker={showStatusPicker}
          onToggleStatusPicker={toggleStatusPicker}
          onSelectStatus={selectStatus}
          onSelectId={selectStatusId}
        />
        <IssueMetaDetails
          details={details}
          colors={colors}
          editableFields={{
            priority: true,
            storyPoints: true,
          }}
          onPrioritySelect={handlePrioritySelect}
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
        />
        {!isTaskView && (
          <IssueChildTasksSection
            tasks={tasks}
            colors={colors}
            projectId={projectId}
            navigation={navigation}
            meta={tasksMeta}
            loading={loading}
            loadingMore={loadingMore}
            userStoryId={userStoryId}
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
          expandedCommentIds={expandedCommentIds}
          onToggleExpand={toggleExpanded}
          taskId={taskId}
          userStoryId={userStoryId}
          projectId={projectId}
        />
      </ScrollView>

      <IssueCommentInput
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
      />

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
