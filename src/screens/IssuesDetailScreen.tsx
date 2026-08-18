import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AppText from '../components/common/AppText';
import Avatar from '../components/Avatar';
import Screen from '../components/common/ScreenWapper';
import { AppInput } from '../components';
import PopupModel from '../components/Model';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { RootStackParamList } from '../types/navigationTypes';
import { Radius } from '../constants/Radius';
import { RootState, useAppDispatch, useAppSelector } from '../store';
import {
  setDescription,
  setIsEditingDescription,
} from '../store/issue_store/reducer/issue.reducer';
import {
  getUserStoryById,
  getTaskById,
} from '../store/project_store/action/project_thunk';
import {
  getStatusLabel,
  getStatusThemeColor,
  IssueStatus,
  STATUS_OPTIONS,
  TASK_STATUS_LABELS,
} from '../utils/enum';
import CommonHeader from '../components/common/CommonHeader';
import { fetchUserStoryComments } from '../store/comments_store/action/comments.thunk';

const IssueDetailScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<any>();

  // Support route params for both User Stories and Tasks
  const projectId = route.params?.projectId || route.params?.id;
  const taskId = route.params?.taskId || route.params?.id2;
  const userStoryId =
    route.params?.userStoryId || (!taskId ? route.params?.id : null);

  const { colors } = useTheme();
  const { layout, isSmallHeight, hp } = useAuthLayout();
  const dispatch = useAppDispatch();

  const { isEditingDescription } = useAppSelector(
    (state: RootState) => state.issue,
  );

  const {
    selectedUserStory,
    userStoryDetailLoading,
    selectedTask,
    taskDetailLoading,
  } = useAppSelector((state: RootState) => state.projects);

  // Redux state selector for comments
  const { comments: apiComments, loading: commentsLoading } = useAppSelector(
    (state: RootState) => state.comments || { comments: [], loading: false },
  );

  const [comment, setComment] = useState<string>('');
  const [status, setStatus] = useState<IssueStatus | string>('');
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<'All' | 'Comments' | 'History'>(
    'All',
  );

  // Check if current view is loading task or story
  const isTaskView = Boolean(taskId);
  const isLoading = isTaskView ? taskDetailLoading : userStoryDetailLoading;

  // Unified item reference for active display data
  const currentItem = isTaskView ? selectedTask : selectedUserStory;

  // Dispatch API Calls based on whether taskId or userStoryId is present
  useEffect(() => {
    if (projectId) {
      if (taskId) {
        dispatch(getTaskById({ projectId, taskId }));
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
    }
  }, [dispatch, projectId, taskId, userStoryId]);

  useEffect(() => {
    if (currentItem?.status) {
      setStatus(currentItem.status);
    }
  }, [currentItem]);

  const currentDescription =
    (currentItem && 'description' in currentItem
      ? (currentItem as any).description
      : '') || '';

  const activeStatusColor = useMemo(
    () => getStatusThemeColor(status || currentItem?.status, colors),
    [status, currentItem, colors],
  );

  const details = useMemo(() => {
    if (!currentItem) {
      return [];
    }

    const assigneeName =
      ('assignee_name' in currentItem && currentItem.assignee_name) ||
      currentItem.reporter?.name ||
      'Unassigned';

    const assigneeInitials =
      assigneeName !== 'Unassigned'
        ? assigneeName
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
        : 'U';

    const reporterName = currentItem.reporter_name || 'N/A';

    return [
      {
        label: 'Assignee',
        value: assigneeName,
        initials: assigneeInitials,
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
        value: currentItem.story_points?.toString() || '0',
      },
    ];
  }, [currentItem, colors]);

  const handleOpenEditModal = () => {
    dispatch(setIsEditingDescription(true));
  };

  const handleCloseEditModal = () => {
    dispatch(setIsEditingDescription(false));
  };

  const handleSaveDescription = (newDescription: string) => {
    const targetId = taskId || userStoryId;
    if (!targetId) return;
    dispatch(
      setDescription({
        issueId: targetId,
        description: newDescription,
      }),
    );
    dispatch(setIsEditingDescription(false));
  };

  const handleSendComment = () => {
    if (!comment.trim()) return;
    // Handle comment creation API dispatch here when required
    setComment('');
  };

  const subtasks = selectedUserStory?.tasks || [];

  if (isLoading) {
    return (
      <Screen scroll={false} backgroundColor={colors.surface}>
        <View className='flex-1 items-center justify-center'>
          <ActivityIndicator size='large' color={colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      {/* Top Header */}
      <CommonHeader
        variant='custom'
        title={currentItem?.title}
        onBackPress={() => navigation.navigate('projectDetails')}
        rightComponent={
          <AppText
            variant='caption'
            color={colors.textSecondary}
            className='text-xs font-semibold'
            numberOfLines={1}
          >
            {currentItem?.formatted_serial_number ||
              ('key' in (currentItem || {})
                ? currentItem?.key
                : currentItem?.id)}
          </AppText>
        }
      />

      <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
        {/* Title and Dynamic Enum Status Dropdown */}
        <View
          className='border-b'
          style={{
            backgroundColor: colors.card || colors.surface,
            borderColor: colors.border,
            paddingHorizontal: layout.paddingHorizontal,
            paddingVertical: layout.largeSectionGap,
            gap: layout.elementGap,
          }}
        >
          <AppText
            variant='title'
            color={colors.text}
            className='text-xl font-bold'
          >
            {currentItem?.title}
          </AppText>

          <View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowStatusPicker(!showStatusPicker)}
              className='flex-row items-center self-start rounded-lg border'
              style={{
                backgroundColor: `${activeStatusColor}1A`,
                borderColor: colors.border,
                paddingHorizontal: layout.paddingHorizontal,
                paddingVertical: layout.elementGap,
                gap: layout.tightGap,
              }}
            >
              <View
                className='mr-1 rounded-full'
                style={{
                  width: 8,
                  height: 8,
                  backgroundColor: activeStatusColor,
                }}
              />
              <AppText
                variant='body'
                color={activeStatusColor}
                className='font-semibold'
              >
                {getStatusLabel(status || currentItem?.status)}
              </AppText>
              <Ionicons
                name='chevron-down'
                size={layout.controlSize * 0.8}
                color={activeStatusColor}
              />
            </TouchableOpacity>

            {showStatusPicker && (
              <View
                className='absolute left-0 top-14 border'
                style={{
                  borderRadius: Radius.lg,
                  width: '55%',
                  backgroundColor: colors.card || colors.surface,
                  borderColor: colors.border,
                  paddingHorizontal: layout.paddingHorizontal,
                  paddingVertical: layout.tightGap,
                  shadowColor: colors.black,
                  shadowOpacity: 0.12,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 4 },
                  zIndex: 999,
                }}
              >
                {STATUS_OPTIONS.map(enumKey => {
                  const isSelected =
                    (status || currentItem?.status)?.toLowerCase() === enumKey;
                  const itemColor = getStatusThemeColor(enumKey, colors);
                  return (
                    <TouchableOpacity
                      key={enumKey}
                      activeOpacity={0.8}
                      onPress={() => {
                        setStatus(enumKey);
                        setShowStatusPicker(false);
                      }}
                      className='flex-row items-center'
                      style={{
                        paddingVertical: layout.elementGap,
                        gap: layout.largeSectionGap,
                      }}
                    >
                      <View
                        className='rounded-full'
                        style={{
                          width: 8,
                          height: 8,
                          backgroundColor: itemColor,
                        }}
                      />
                      <AppText
                        variant='body'
                        color={isSelected ? itemColor : colors.text}
                        className={isSelected ? 'font-bold' : 'font-normal'}
                      >
                        {TASK_STATUS_LABELS[enumKey]}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {/* Details Section */}
        <View
          className='mt-3'
          style={{ backgroundColor: colors.card || colors.surface }}
        >
          {details.map(item => (
            <View
              key={item.label}
              className='flex-row items-center justify-between border-b'
              style={{
                borderColor: colors.itemDivider || colors.border,
                paddingHorizontal: layout.paddingHorizontal,
                paddingVertical: isSmallHeight
                  ? layout.largeSectionGap
                  : layout.sectionGap,
              }}
            >
              <AppText variant='body' color={colors.textSecondary}>
                {item.label}
              </AppText>
              {item.initials ? (
                <View
                  className='flex-row items-center'
                  style={{ gap: layout.elementGap }}
                >
                  <Avatar
                    size='small'
                    initials={item.initials}
                    color={item.color || colors.primary}
                  />
                  <AppText variant='body' color={colors.text}>
                    {item.value}
                  </AppText>
                </View>
              ) : item.dot ? (
                <View
                  className='flex-row items-center'
                  style={{ gap: layout.elementGap }}
                >
                  <Ionicons name='flag' size={14} color={item.dot} />
                  <AppText variant='body' color={colors.text}>
                    {item.value}
                  </AppText>
                </View>
              ) : (
                <AppText variant='body' color={colors.text}>
                  {item.value}
                </AppText>
              )}
            </View>
          ))}
        </View>

        {/* Description Section */}
        <View
          className='mt-3'
          style={{
            backgroundColor: colors.card || colors.surface,
            paddingHorizontal: layout.paddingHorizontal,
            paddingVertical: layout.sectionGap,
            gap: layout.sectionGap,
          }}
        >
          <View className='flex-row items-center justify-between'>
            <AppText
              variant='bodyLarge'
              color={colors.text}
              className='font-bold'
            >
              Description
            </AppText>
            <TouchableOpacity onPress={handleOpenEditModal}>
              <Ionicons
                name='pencil-sharp'
                size={layout.iconSize * 0.8}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          <AppText variant='body' color={colors.text} className='leading-6'>
            {currentDescription || 'No description provided.'}
          </AppText>
        </View>

        {/* Attachments Section */}
        <View
          className='mt-3'
          style={{
            backgroundColor: colors.card || colors.surface,
            paddingHorizontal: layout.paddingHorizontal,
            paddingVertical: layout.sectionGap,
          }}
        >
          <AppText
            variant='bodyLarge'
            color={colors.text}
            className='mb-3 font-bold'
          >
            Attachments
          </AppText>

          <View
            className='items-center justify-center rounded-lg border border-dashed p-6'
            style={{ borderColor: colors.border }}
          >
            <AppText
              variant='body'
              color={colors.textSecondary}
              className='font-semibold'
            >
              No attachments
            </AppText>
            <AppText
              variant='caption'
              color={colors.placeholder}
              className='mt-1'
            >
              Attachments coming soon
            </AppText>
          </View>
        </View>

        {/* Child Tickets Section (Only shown when viewing a User Story) */}
        {!isTaskView && (
          <View
            className='mt-3'
            style={{
              backgroundColor: colors.card || colors.surface,
              paddingHorizontal: layout.paddingHorizontal,
              paddingVertical: layout.sectionGap,
            }}
          >
            <View className='mb-3 flex-row items-center justify-between'>
              <AppText
                variant='bodyLarge'
                color={colors.text}
                className='font-bold'
              >
                Child Story ({subtasks.length})
              </AppText>
            </View>

            {subtasks.length > 0 ? (
              <View style={{ gap: layout.elementGap || 10 }}>
                {subtasks.map(item => {
                  const rawStatus = (
                    item.status ||
                    item.status_id ||
                    ''
                  ).toLowerCase();

                  const displayStatus =
                    TASK_STATUS_LABELS[
                      rawStatus as keyof typeof TASK_STATUS_LABELS
                    ] ||
                    getStatusLabel(rawStatus) ||
                    item.status ||
                    'To Do';

                  const subtaskStatusColor = getStatusThemeColor(
                    rawStatus,
                    colors,
                  );

                  const avatarLetter = (item.title || 'D')
                    .charAt(0)
                    .toUpperCase();

                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.7}
                      onPress={() =>
                        navigation.navigate('issue', {
                          projectId: projectId,
                          taskId: item.id,
                        })
                      }
                      className='flex-row items-center justify-between rounded-2xl border p-4'
                      style={{
                        borderColor: colors.border,
                        backgroundColor: colors.card || colors.surface,
                      }}
                    >
                      <View
                        className='flex-1 flex-row items-center'
                        style={{ gap: 12 }}
                      >
                        <View
                          className='h-12 w-12 items-center justify-center rounded-xl'
                          style={{
                            backgroundColor: colors.primary || '#0066FF',
                          }}
                        >
                          <AppText
                            variant='title'
                            color='#FFFFFF'
                            className='text-lg font-bold'
                          >
                            {avatarLetter}
                          </AppText>
                        </View>

                        <View
                          className='flex-1 justify-center'
                          style={{ gap: 2 }}
                        >
                          <AppText
                            variant='body'
                            color={colors.text}
                            className='text-base font-bold'
                            numberOfLines={1}
                          >
                            {item.title || 'demooooo'}
                          </AppText>

                          <AppText
                            variant='caption'
                            color={colors.textSecondary}
                            className='text-xs'
                            numberOfLines={1}
                          >
                            {item.key || item.formatted_serial_number || 'demo'}
                          </AppText>

                          <View
                            className='mt-1 flex-row items-center'
                            style={{ gap: 8 }}
                          >
                            <AppText
                              variant='caption'
                              color={colors.textSecondary}
                              className='text-xs'
                            >
                              {item.created_at
                                ? new Date(item.created_at).toLocaleDateString(
                                    'en-US',
                                    {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    },
                                  )
                                : '-'}
                            </AppText>
                          </View>
                        </View>
                      </View>

                      <View
                        className='mt-1 self-start rounded-full px-3 py-1'
                        style={{
                          backgroundColor: `${subtaskStatusColor}15`,
                        }}
                      >
                        <AppText
                          variant='caption'
                          color={subtaskStatusColor}
                          className='text-xs font-semibold capitalize'
                        >
                          {displayStatus}
                        </AppText>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <AppText variant='body' color={colors.textSecondary}>
                No child tickets.
              </AppText>
            )}
          </View>
        )}

        {/* Activity Section */}
        <View
          className='mt-3'
          style={{
            backgroundColor: colors.card || colors.surface,
            paddingHorizontal: layout.paddingHorizontal,
            paddingVertical: layout.sectionGap,
          }}
        >
          <AppText
            variant='bodyLarge'
            color={colors.text}
            className='mb-3 font-bold'
          >
            Activity
          </AppText>

          <View
            className='mb-4 flex-row border-b'
            style={{ borderColor: colors.border }}
          >
            {(['All', 'Comments', 'History'] as const).map(tab => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className='mr-4 pb-2'
                style={{
                  borderBottomWidth: activeTab === tab ? 2 : 0,
                  borderBottomColor: colors.primary,
                }}
              >
                <AppText
                  variant='body'
                  color={
                    activeTab === tab ? colors.primary : colors.textSecondary
                  }
                  className={activeTab === tab ? 'font-bold' : 'font-normal'}
                >
                  {tab}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === 'Comments' || activeTab === 'All' ? (
            commentsLoading ? (
              <ActivityIndicator
                size='small'
                color={colors.primary}
                className='my-4'
              />
            ) : apiComments && apiComments.length > 0 ? (
              apiComments.map((item: any) => {
                const authorName = item.user?.name || item.author || 'User';
                const avatarInitials = authorName
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase();

                return (
                  <View
                    key={item.id}
                    style={{ gap: layout.largeSectionGap }}
                    className='mb-5 flex-row'
                  >
                    <Avatar
                      size='medium'
                      initials={avatarInitials}
                      color={colors.primary}
                    />
                    <View className='flex-1' style={{ gap: layout.tightGap }}>
                      <View
                        className='flex-row items-center'
                        style={{ gap: layout.elementGap }}
                      >
                        <AppText
                          variant='body'
                          color={colors.text}
                          className='font-bold'
                        >
                          {authorName}
                        </AppText>
                        <AppText variant='caption' color={colors.textSecondary}>
                          {item.created_at
                            ? new Date(item.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : item.time || ''}
                        </AppText>
                      </View>
                      <AppText
                        variant='body'
                        color={colors.text}
                        className='leading-6'
                      >
                        {item.comment || item.text || ''}
                      </AppText>
                    </View>
                  </View>
                );
              })
            ) : (
              <AppText variant='body' color={colors.textSecondary}>
                No comments yet.
              </AppText>
            )
          ) : (
            <AppText variant='body' color={colors.textSecondary}>
              Showing history...
            </AppText>
          )}
        </View>
      </ScrollView>

      {/* Add Comment Input */}
      <View
        className='flex-row items-center border-t'
        style={{
          paddingHorizontal: layout.paddingHorizontal,
          paddingTop: layout.paddingTop,
          borderColor: colors.border,
          gap: isSmallHeight ? layout.largeSectionGap : layout.sectionGap,
          backgroundColor: colors.card,
          paddingBottom: isSmallHeight ? hp(8.75) : hp(8),
        }}
      >
        <Avatar
          size='medium'
          initials='AJ'
          color={colors.avatarBg || colors.warning || colors.primary}
        />
        <View className='flex-1'>
          <AppInput
            value={comment}
            onChangeText={setComment}
            placeholder='Add a comment...'
            style={{
              fontSize: layout.bodyFontSize,
            }}
            rightSendButton={
              <TouchableOpacity
                disabled={!comment.trim()}
                onPress={handleSendComment}
              >
                <AppText
                  variant='body'
                  color={comment.trim() ? colors.primary : colors.secondary}
                  className='font-bold'
                >
                  Send
                </AppText>
              </TouchableOpacity>
            }
          />
        </View>
      </View>

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
