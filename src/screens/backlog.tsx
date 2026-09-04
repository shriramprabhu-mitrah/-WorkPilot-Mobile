import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from '@react-native-vector-icons/ionicons';
import { AppText, AppInput } from '../components';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { Radius } from '../constants/Radius';
import { WorkItemIcon } from '../components/common/getWorkItemIcon';
import { useAppDispatch, useAppSelector } from '../store';
import { getUserStories } from '../store/project_store/action/project_thunk';
import { UserStory } from '../types/project.type';
import ListSkeleton from '../components/skeleton/ListSkeleton';
import ProjectCardSkeleton from '../components/skeleton/ProjectCardSkeleton';
import {
  RootStackParamList,
  ProjectTopTabParamList,
} from '../types/navigationTypes';
import { useGetProjectByIdQuery } from '../store/api/projectDetailsApi';
import { skipToken } from '@reduxjs/toolkit/query';

export const Backlogs = () => {
  const { colors } = useTheme();
  const { moderateScale, layout, hp } = useAuthLayout();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const route = useRoute<RouteProp<ProjectTopTabParamList, 'Backlogs'>>();
  const { projectId } = route.params ?? {};

  const { data: projectDetails, isLoading: projectLoading } =
    useGetProjectByIdQuery(projectId ? { project_id: projectId } : skipToken);

  const [searchQuery, setSearchQuery] = useState('');
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Track the project ID that was previously loaded to determine when to trigger skeleton
  const prevProjectIdRef = useRef<string | number | undefined>(undefined);

  // Expanded state map for toggling nested tasks per user story
  const [expandedStoryIds, setExpandedStoryIds] = useState<
    Record<string, boolean>
  >({});

  // Using separate backlog state keys from Redux store
  const { backlogUserStories, backlogUserStoryMeta, backlogUserStoryLoading } =
    useAppSelector(state => state.projects);

  const effectiveProjectId = projectDetails?.id?.toString() || projectId;

  // Show skeleton ONLY on first screen focus or when projectId changes
  const showSkeleton = isInitialLoading;
  const showFooterSpinner = backlogUserStoryLoading && isFetchingNextPage;

  // Fetch backlog stories on focus
  useFocusEffect(
    useCallback(() => {
      if (!effectiveProjectId) {
        setIsInitialLoading(false);
        return;
      }

      let isMounted = true;
      const isProjectChangedOrFirstLoad =
        prevProjectIdRef.current !== effectiveProjectId;

      // Only enable full-screen skeleton if first time loading or project changed
      if (isProjectChangedOrFirstLoad) {
        setIsInitialLoading(true);
      }

      setIsFetchingNextPage(false);

      dispatch(
        getUserStories({
          projectId: effectiveProjectId,
          payload: {
            page: 1,
            page_size: 10,
            sprint_id: null,
          },
        }),
      ).finally(() => {
        if (isMounted) {
          setIsInitialLoading(false);
          prevProjectIdRef.current = effectiveProjectId;
        }
      });

      return () => {
        isMounted = false;
      };
    }, [dispatch, effectiveProjectId]),
  );

  const handleLoadMore = async () => {
    if (
      !backlogUserStoryLoading &&
      !isFetchingNextPage &&
      !isInitialLoading &&
      backlogUserStoryMeta?.has_next &&
      effectiveProjectId
    ) {
      try {
        setIsFetchingNextPage(true);
        await dispatch(
          getUserStories({
            projectId: effectiveProjectId,
            payload: {
              page: (backlogUserStoryMeta.page || 1) + 1,
              page_size: backlogUserStoryMeta.page_size || 10,
              sprint_id: null,
            },
          }),
        );
      } catch (error) {
        console.error('Failed to load next page for backlog:', error);
      } finally {
        setIsFetchingNextPage(false);
      }
    }
  };

  const toggleExpandStory = useCallback((storyId: string) => {
    setExpandedStoryIds(prev => ({
      ...prev,
      [storyId]: !prev[storyId],
    }));
  }, []);

  const rawStories = useMemo(
    () => (backlogUserStories as UserStory[]) || [],
    [backlogUserStories],
  );

  const filteredStories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return rawStories;

    return rawStories.filter(story => {
      const title = story?.title || '';
      const serial = story?.formatted_serial_number || '';
      const sprint = story?.sprint_name || '';
      const status = story?.status || '';

      return (
        title.toLowerCase().includes(query) ||
        serial.toLowerCase().includes(query) ||
        sprint.toLowerCase().includes(query) ||
        status.toLowerCase().includes(query)
      );
    });
  }, [rawStories, searchQuery]);

  const getPriorityConfig = useCallback(
    (priority?: string) => {
      const p = (priority || '').toLowerCase();
      switch (p) {
        case 'highest':
        case 'high':
          return { label: 'High', color: colors.error, bgColor: '#FEE2E2' };
        case 'medium':
          return { label: 'Medium', color: '#F59E0B', bgColor: '#FEF3C7' };
        case 'low':
        case 'lowest':
          return { label: 'Low', color: '#10B981', bgColor: '#D1FAE5' };
        default:
          return {
            label: priority || 'Normal',
            color: colors.textSecondary,
            bgColor: colors.surface,
          };
      }
    },
    [colors],
  );

  const renderFooter = useCallback(() => {
    if (!showFooterSpinner) return null;
    return (
      <View className='items-center justify-center py-4'>
        <ActivityIndicator size='small' color={colors.primary} />
      </View>
    );
  }, [showFooterSpinner, colors.primary]);

  const renderEmptyState = useCallback(() => {
    if (showSkeleton) {
      return (
        <View className='px-4 py-3'>
          <ListSkeleton
            count={5}
            containerStyle={{ gap: layout.elementGap - 2 }}
            renderItem={index => <ProjectCardSkeleton key={index} />}
          />
        </View>
      );
    }

    return (
      <View className='flex-1 items-center justify-center px-6 py-12'>
        <AppText
          variant='body'
          className='mb-1 text-center text-lg font-bold'
          color={colors.text}
        >
          {searchQuery.trim()
            ? 'No Matching Stories'
            : 'No Backlog Stories Found'}
        </AppText>

        <AppText
          variant='caption'
          className='mb-5 text-center text-sm leading-5'
          color={colors.textSecondary}
        >
          {searchQuery.trim()
            ? `We couldn't find any backlog items matching "${searchQuery}". Check for typos or try another search.`
            : 'There are no user stories in the backlog for this project.'}
        </AppText>

        {searchQuery.trim() ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setSearchQuery('')}
            className='border px-4 py-2'
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: Radius.md,
            }}
          >
            <AppText
              variant='caption'
              className='font-bold'
              color={colors.primary}
            >
              Clear Search
            </AppText>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }, [showSkeleton, searchQuery, colors, layout.elementGap]);

  // User Story Card Renderer
  const renderStoryCard = useCallback(
    ({ item }: { item: UserStory & { tasks?: any[]; sub_tasks?: any[] } }) => {
      const priorityConfig = getPriorityConfig(item.priority);
      const isExpanded = !!expandedStoryIds[item.id];
      const taskList = item.tasks || item.sub_tasks || [];
      const taskCount = taskList.length;

      return (
        <View className='mb-3 px-4'>
          <View
            className='overflow-hidden border'
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: Radius.md,
            }}
          >
            {/* User Story Header Bar */}
            <View className='flex-row items-center p-3.5'>
              {/* Main Navigable Area */}
              <TouchableOpacity
                activeOpacity={0.8}
                className='flex-1 flex-row items-center'
                onPress={() =>
                  navigation.navigate('issue', {
                    projectId: effectiveProjectId,
                    userStoryId: item?.id,
                    story: item,
                  })
                }
                style={{ gap: layout.elementGap }}
              >
                {/* Left Icon Box */}
                <View
                  className='items-center justify-center'
                  style={{
                    width: moderateScale(38),
                    height: moderateScale(38),
                    backgroundColor: colors.primary,
                    borderRadius: Radius.sm,
                  }}
                >
                  <WorkItemIcon
                    type='userStory'
                    size={18}
                    color={colors.white}
                  />
                </View>

                {/* Middle Story Details */}
                <View className='flex-1' style={{ gap: 2 }}>
                  <View className='flex-row items-center gap-1.5'>
                    <AppText
                      variant='caption'
                      color={colors.textSecondary}
                      numberOfLines={1}
                    >
                      {item.formatted_serial_number || `#${item.serial_number}`}
                      {item.sprint_name ? ` • ${item.sprint_name}` : ''}
                    </AppText>

                    {/* Tasks Count Indicator Badge */}
                    <View
                      className='rounded px-1.5 py-0.5'
                      style={{ backgroundColor: `${colors.primary}15` }}
                    >
                      <AppText
                        variant='caption'
                        className='text-[10px] font-bold'
                        style={{ color: colors.primary }}
                      >
                        {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
                      </AppText>
                    </View>
                  </View>

                  <AppText
                    variant='body'
                    color={colors.text}
                    className='font-bold'
                    numberOfLines={1}
                  >
                    {item.title
                      ? item.title.charAt(0).toUpperCase() + item.title.slice(1)
                      : ''}
                  </AppText>
                </View>

                {/* Right Status & Priority Badges */}
                <View
                  className='items-end'
                  style={{ gap: layout.elementGap / 2 }}
                >
                  <View
                    className='rounded-md px-2.5 py-0.5'
                    style={{ backgroundColor: priorityConfig.bgColor }}
                  >
                    <AppText
                      variant='caption'
                      className='text-[10px] font-semibold capitalize'
                      style={{ color: priorityConfig.color }}
                    >
                      {priorityConfig.label}
                    </AppText>
                  </View>

                  <View
                    className='items-center justify-center px-2 py-0.5'
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: Radius.circle,
                    }}
                  >
                    <AppText
                      variant='caption'
                      style={{ color: colors.primary }}
                      className='text-[11px] font-semibold'
                    >
                      {item.status}
                    </AppText>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Expand/Collapse Chevron Button */}
              <TouchableOpacity
                activeOpacity={0.7}
                className='ml-2 items-center justify-center p-1'
                onPress={() => toggleExpandStory(item.id)}
              >
                <Ionicons
                  name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                  size={moderateScale(18)}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Nested Tasks Section */}
            {isExpanded && (
              <View
                className='border-t pb-3 pl-9 pr-3 pt-2'
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                }}
              >
                {taskList.length > 0 ? (
                  <View
                    className='border-l-2 pl-3'
                    style={{
                      borderColor: `${colors.primary}40`,
                      gap: moderateScale(8),
                    }}
                  >
                    {taskList.map((task: any) => (
                      <TouchableOpacity
                        key={task.id || task.serial_number}
                        activeOpacity={0.7}
                        className='flex-row items-center border p-2.5'
                        style={{
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                          borderRadius: Radius.sm,
                          gap: layout.elementGap,
                        }}
                        onPress={() =>
                          navigation.navigate('issue', {
                            projectId,
                            taskId: task.id,
                            task: task,
                          })
                        }
                      >
                        <WorkItemIcon
                          type='task'
                          size={16}
                          color={colors.primary}
                        />

                        <View className='flex-1 justify-center'>
                          <AppText
                            variant='caption'
                            className='text-[10px]'
                            color={colors.textSecondary}
                          >
                            {task.formatted_serial_number ||
                              `#${task.serial_number}`}
                          </AppText>
                          <AppText
                            variant='body'
                            className='text-xs font-semibold'
                            color={colors.text}
                            numberOfLines={1}
                          >
                            {task.title}
                          </AppText>
                        </View>

                        <View
                          className='rounded-full px-2 py-0.5'
                          style={{
                            backgroundColor: `${colors.primary}15`,
                          }}
                        >
                          <AppText
                            variant='caption'
                            className='text-[10px] font-medium capitalize'
                            style={{ color: colors.primary }}
                          >
                            {task.status || 'To Do'}
                          </AppText>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View className='py-2 pl-2'>
                    <AppText
                      variant='caption'
                      className='italic'
                      color={colors.textSecondary}
                    >
                      No linked tasks found for this story.
                    </AppText>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      );
    },
    [
      colors,
      expandedStoryIds,
      getPriorityConfig,
      layout.elementGap,
      moderateScale,
      navigation,
      projectId,
      toggleExpandStory,
    ],
  );

  return (
    <View className='flex-1' style={{ backgroundColor: colors.surface }}>
      {/* Search Header */}
      <View className='px-4 pt-3' style={{ backgroundColor: colors.surface }}>
        <View className='mb-3'>
          <AppInput
            placeholder='Search backlog stories, tasks, status...'
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={
              <Ionicons
                name='search-outline'
                size={moderateScale(18)}
                color={colors.textSecondary}
              />
            }
          />
        </View>

        {!showSkeleton && filteredStories.length > 0 ? (
          <View
            className='mb-3 flex-row items-center'
            style={{ gap: layout.elementGap }}
          >
            <AppText
              variant='caption'
              className='font-bold tracking-wider'
              color={colors.textSecondary}
            >
              Backlog Stories
            </AppText>
            <View
              className='items-center justify-center'
              style={{
                minWidth: moderateScale(22),
                height: moderateScale(22),
                paddingHorizontal: 6,
                backgroundColor: colors.primary,
                borderRadius: Radius.circle,
              }}
            >
              <AppText
                variant='caption'
                className='text-xs font-bold'
                color={colors.white}
              >
                {backlogUserStoryMeta?.total_items || filteredStories.length}
              </AppText>
            </View>
          </View>
        ) : null}
      </View>

      {/* Backlog List */}
      <FlatList
        data={showSkeleton ? [] : filteredStories}
        keyExtractor={(item: UserStory, index: number) =>
          item.id?.toString() || index.toString()
        }
        renderItem={renderStoryCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: hp(20),
        }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

export default Backlogs;
