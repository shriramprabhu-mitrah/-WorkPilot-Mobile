import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from '@react-native-vector-icons/ionicons';
import { AppText, AppInput } from '../../components';
import { useTheme } from '../../hooks/useTheme';
import { useAuthLayout } from '../../hooks/useAuthLayout';
import { Radius } from '../../constants/Radius';
import { WorkItemIcon } from '../../components/common/getWorkItemIcon';
import { RootState, useAppSelector } from '../../store';
import { useGetUserStoriesQuery } from '../../store/api/projectApi';
import { skipToken } from '@reduxjs/toolkit/query';
import { UserStory } from '../../types/project.type';
import ListSkeleton from '../../components/skeleton/ListSkeleton';
import ProjectCardSkeleton from '../../components/skeleton/ProjectCardSkeleton';
import { RootStackParamList } from '../../types/navigationTypes';

const List = () => {
  const { colors } = useTheme();
  const { moderateScale, layout } = useAuthLayout();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFocusLoading, setIsFocusLoading] = useState(false);
  const [refetchKey, setRefetchKey] = useState(0);

  // 1. Stable Primitive Selectors
  const projectId = useAppSelector(
    (state: RootState) =>
      state.projects.project?.id?.toString() ||
      (state.projects.project as any)?._id?.toString(),
  );

  const activeSprintId = useAppSelector(
    (state: RootState) =>
      state.projects.currentSprint?.id?.toString() ||
      (state.projects.currentSprint as any)?._id?.toString(),
  );

  // 2. Query runs only when the screen is focused
  const {
    data: userStoriesResponse,
    isLoading: userStoriesLoading,
    isFetching: userStoriesFetching,
  } = useGetUserStoriesQuery(
    isFocusLoading && projectId && activeSprintId
      ? {
          projectId,
          payload: {
            page: currentPage,
            page_size: 10,
            sprint_id: activeSprintId,
          },
          _refetchKey: refetchKey,
        }
      : skipToken,
  );

  // 3. Screen focus lifecycle
  useFocusEffect(
    useCallback(() => {
      setIsFocusLoading(true);
      setRefetchKey(prev => prev + 1);

      return () => {
        setIsFocusLoading(false);
      };
    }, []),
  );

  // 4. Stable data resolution
  const userStories = (userStoriesResponse?.data as UserStory[]) ?? [];
  const userStoryMeta = userStoriesResponse?.meta ?? null;

  // Show full skeleton only on cold initial fetch (no cached data yet)

  const handleLoadMore = useCallback(() => {
    if (userStoryMeta?.has_next && !userStoriesFetching) {
      setCurrentPage(prev => prev + 1);
    }
  }, [userStoryMeta?.has_next, userStoriesFetching]);

  const filteredStories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return userStories;

    return userStories.filter(story => {
      const title = story?.title || '';
      const serial = story?.formatted_serial_number || '';
      const sprint = story?.sprint_name || '';
      const status = story?.status || '';
      const query = searchQuery.toLowerCase();
      return (
        title.toLowerCase().includes(query) ||
        serial.toLowerCase().includes(query) ||
        sprint.toLowerCase().includes(query) ||
        status.toLowerCase().includes(query)
      );
    });
  }, [userStories, searchQuery]);

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
    [colors.error, colors.textSecondary, colors.surface],
  );

  const renderFooter = useCallback(() => {
    if (!userStoriesFetching || currentPage === 1) return null;
    return (
      <View className='items-center justify-center py-4'>
        <ActivityIndicator size='small' color={colors.primary} />
      </View>
    );
  }, [userStoriesFetching, currentPage, colors.primary]);

  const renderHeader = useCallback(() => {
    if (filteredStories.length === 0) return null;
    return (
      <View
        className='mb-3 flex-row items-center pt-2'
        style={{ gap: layout.elementGap }}
      >
        <AppText
          variant='caption'
          className='font-bold tracking-wider'
          color={colors.textSecondary}
        >
          User Stories
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
            {userStoryMeta?.total_items || filteredStories.length}
          </AppText>
        </View>
      </View>
    );
  }, [
    filteredStories.length,
    layout.elementGap,
    colors.textSecondary,
    colors.primary,
    colors.white,
    moderateScale,
    userStoryMeta?.total_items,
  ]);

  const renderEmptyState = useCallback(
    () => (
      <View className='flex-1 items-center justify-center px-6 py-12'>
        <AppText
          variant='body'
          className='mb-1 text-center text-lg font-bold'
          color={colors.text}
        >
          {searchQuery.trim() ? 'No Matching Stories' : 'No User Stories Found'}
        </AppText>

        <AppText
          variant='caption'
          className='mb-5 text-center text-sm leading-5'
          color={colors.textSecondary}
        >
          {searchQuery.trim()
            ? `We couldn't find any stories matching "${searchQuery}". Check for typos or try another search.`
            : 'There are no user stories created or assigned to this sprint yet.'}
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
    ),
    [
      searchQuery,
      colors.text,
      colors.textSecondary,
      colors.card,
      colors.border,
      colors.primary,
    ],
  );

  return (
    <View className='flex-1 pt-3' style={{ backgroundColor: colors.surface }}>
      {/* Fixed Search Bar Container */}
      <View className='mb-2 px-4'>
        <AppInput
          placeholder='Search user stories, sprint, status...'
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

      {/* Main List / Skeleton State */}
      {userStoriesLoading ? (
        <View className='flex-1 px-4 py-6'>
          <ListSkeleton
            count={5}
            containerStyle={{ gap: layout.elementGap - 2 }}
            renderItem={index => <ProjectCardSkeleton key={index} />}
          />
        </View>
      ) : (
        <FlatList
          data={filteredStories}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View className='h-3' />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          renderItem={({ item }: { item: UserStory }) => {
            const priorityConfig = getPriorityConfig(item.priority);

            return (
              <TouchableOpacity
                activeOpacity={0.8}
                className='flex-row items-center border p-3.5'
                onPress={() =>
                  navigation.navigate('issue', {
                    projectId,
                    userStoryId: item?.id,
                    story: item,
                  })
                }
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: Radius.md,
                  gap: layout.elementGap,
                }}
              >
                {/* Left Avatar Icon Box */}
                <View
                  className='items-center justify-center rounded-lg'
                  style={{
                    width: moderateScale(30),
                    height: moderateScale(30),
                    backgroundColor: colors.surface,
                  }}
                >
                  <WorkItemIcon
                    type='user_story'
                    size={moderateScale(20)}
                  />
                </View>

                {/* Middle Details Section */}
                <View className='flex-1' style={{ gap: layout.mediumGap }}>
                  <AppText
                    variant='caption'
                    color={colors.textSecondary}
                    numberOfLines={1}
                  >
                    {item.formatted_serial_number || `#${item.serial_number}`}
                    {item.sprint_name ? ` • ${item.sprint_name}` : ''}
                  </AppText>
                  <AppText
                    variant='bodyLarge'
                    color={colors.text}
                    className='font-bold'
                    numberOfLines={1}
                  >
                    {item.title
                      ? item.title.charAt(0).toUpperCase() + item.title.slice(1)
                      : ''}
                  </AppText>
                </View>

                <View
                  className='flex-row items-center'
                  style={{ gap: layout.elementGap }}
                >
                  <View
                    className='rounded-md px-3 py-1'
                    style={{ backgroundColor: priorityConfig.bgColor }}
                  >
                    <AppText
                      variant='caption'
                      className='text-xs font-semibold capitalize'
                      style={{ color: priorityConfig.color }}
                    >
                      {priorityConfig.label}
                    </AppText>
                  </View>
                  <View
                    className='items-center justify-center px-3 py-1'
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: Radius.circle,
                    }}
                  >
                    <AppText
                      variant='caption'
                      style={{ color: colors.primary }}
                      className='font-semibold'
                    >
                      {item.status}
                    </AppText>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

export default List;
