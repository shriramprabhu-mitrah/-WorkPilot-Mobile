import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from '@react-native-vector-icons/ionicons';
import { AppText, AppInput } from '../../components';
import { useTheme } from '../../hooks/useTheme';
import { useAuthLayout } from '../../hooks/useAuthLayout';
import { Radius } from '../../constants/Radius';
import { WorkItemIcon } from '../../components/common/getWorkItemIcon';
import { RootState, useAppDispatch, useAppSelector } from '../../store';
import { useGetUserStoriesQuery } from '../../store/api/projectApi';
import {
  favouriteUserStoryThunk,
  unfavouriteUserStoryThunk,
} from '../../store/project_store/action/projectBoard.thunk';
import { showSnackbar } from '../../components/common/Snackbar';
import { skipToken } from '@reduxjs/toolkit/query';
import { UserStory } from '../../types/project.type';
import ListSkeleton from '../../components/skeleton/ListSkeleton';
import ProjectCardSkeleton from '../../components/skeleton/ProjectCardSkeleton';
import { RootStackParamList } from '../../types/navigationTypes';
import DeleteColumnModal from '../../components/DeleteColumnModal';
import { useDeleteUserStoryMutation } from '../../store/api/userStoryApi';
import { usePermissions } from '../../hooks/usePermissions';
import SwipeableOption from '../../components/SwipeableOption';

const List = () => {
  const { colors } = useTheme();
  const { moderateScale, layout } = useAuthLayout();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [allStories, setAllStories] = useState<UserStory[]>([]);
  const [hasNoMore, setHasNoMore] = useState(false);
  const [deleteStoryItem, setDeleteStoryItem] = useState<UserStory | null>(
    null,
  );
  const lastRequestedPageRef = useRef(1);

  const [deleteUserStory, { isLoading: isDeleting }] =
    useDeleteUserStoryMutation();

  // 1. Stable Primitive Selectors
  const projectId = useAppSelector(
    (state: RootState) =>
      state.projects.project?.id?.toString() ||
      (state.projects.project as any)?._id?.toString(),
  );
  const { canDeleteUserStory, isLoading: permissionsLoading } = usePermissions({
    projectId: projectId,
  });

  const rawActiveSprintId = useAppSelector(
    (state: RootState) =>
      state.projects.currentSprint?.id?.toString() ||
      (state.projects.currentSprint as any)?._id?.toString(),
  );

  const activeSprintId =
    rawActiveSprintId === 'all' || !rawActiveSprintId
      ? undefined
      : rawActiveSprintId;

  // 2. Query reads from cache immediately if preloaded by parent
  const {
    data: userStoriesResponse,
    isLoading: userStoriesLoading,
    isFetching: userStoriesFetching,
    refetch: refetchUserStories,
  } = useGetUserStoriesQuery(
    projectId
      ? {
          projectId,
          payload: {
            page: currentPage,
            page_size: 10,
            ...(activeSprintId ? { sprint_id: activeSprintId } : {}),
          },
        }
      : skipToken,
    { refetchOnFocus: true },
  );

  // 3. Screen focus lifecycle - refresh without wiping preloaded cache
  useFocusEffect(
    useCallback(() => {
      if (projectId) {
        refetchUserStories();
      }
    }, [projectId, refetchUserStories]),
  );

  // Reset pagination and list when project or sprint changes
  useEffect(() => {
    setCurrentPage(1);
    setAllStories([]);
    setHasNoMore(false);
    lastRequestedPageRef.current = 1;
  }, [projectId, rawActiveSprintId]);

  // 4. Append paginated API data
  useEffect(() => {
    if (!userStoriesResponse?.data) return;
    const incomingStories = (userStoriesResponse.data as UserStory[]) || [];
    if (incomingStories.length === 0 && currentPage > 1) {
      setHasNoMore(true);
      return;
    }
    if (userStoriesResponse.meta?.has_next === false) {
      setHasNoMore(true);
    } else if (
      userStoriesResponse.meta?.total_pages &&
      currentPage >= userStoriesResponse.meta.total_pages
    ) {
      setHasNoMore(true);
    }

    if (currentPage === 1) {
      setAllStories(incomingStories);
    } else {
      setAllStories(prev => {
        const existingIds = new Set(prev.map(item => item.id));
        const newStories = incomingStories.filter(
          item => !existingIds.has(item.id),
        );
        return [...prev, ...newStories];
      });
    }
  }, [userStoriesResponse, currentPage]);

  const rawStories =
    (userStoriesResponse?.data as UserStory[] | undefined) ?? [];
  const userStories = allStories.length > 0 ? allStories : rawStories;
  const userStoryMeta = userStoriesResponse?.meta ?? null;

  // Show full skeleton only on cold initial fetch (no cached data yet)

  const handleLoadMore = useCallback(() => {
    const hasNext =
      userStoryMeta?.has_next !== undefined
        ? userStoryMeta.has_next
        : userStoryMeta?.total_pages !== undefined
          ? currentPage < userStoryMeta.total_pages
          : !hasNoMore;

    if (!userStoriesFetching && hasNext && userStories.length > 0) {
      const nextPage = currentPage + 1;
      if (lastRequestedPageRef.current === nextPage) return;
      lastRequestedPageRef.current = nextPage;
      setCurrentPage(nextPage);
    }
  }, [
    userStoriesFetching,
    userStoryMeta,
    hasNoMore,
    userStories.length,
    currentPage,
  ]);

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

  const handleToggleStoryFavorite = useCallback(
    async (storyId: string) => {
      if (!projectId) return;
      const story = userStories.find(s => s.id === storyId);
      const currentFav = story?.is_favourite ?? false;
      const nextFav = !currentFav;

      // Optimistic update
      setAllStories(prev => {
        const baseList = prev.length > 0 ? prev : rawStories;
        return baseList.map(s =>
          s.id === storyId ? { ...s, is_favourite: nextFav } : s,
        );
      });

      try {
        if (currentFav) {
          await dispatch(
            unfavouriteUserStoryThunk({ projectId, userStoryId: storyId }),
          ).unwrap();
        } else {
          await dispatch(
            favouriteUserStoryThunk({ projectId, userStoryId: storyId }),
          ).unwrap();
        }

        refetchUserStories();
      } catch {
        // Rollback on failure
        setAllStories(prev => {
          const baseList = prev.length > 0 ? prev : rawStories;
          return baseList.map(s =>
            s.id === storyId ? { ...s, is_favourite: currentFav } : s,
          );
        });
        showSnackbar({
          message: 'Failed to update favourite',
          type: 'error',
        });
      }
    },
    [dispatch, projectId, userStories, rawStories, refetchUserStories],
  );

  const handleConfirmDelete = async () => {
    if (
      permissionsLoading ||
      !canDeleteUserStory ||
      !deleteStoryItem ||
      !projectId
    )
      return;
    try {
      await deleteUserStory({
        projectId,
        userStoryId: deleteStoryItem.id,
      }).unwrap();

      setAllStories(prev => {
        const baseList = prev.length > 0 ? prev : rawStories;
        return baseList.filter(s => s.id !== deleteStoryItem.id);
      });
      setDeleteStoryItem(null);
      showSnackbar({
        message: 'User story deleted successfully',
        type: 'success',
      });
      refetchUserStories();
    } catch (err: any) {
      showSnackbar({
        message:
          err?.data?.message || err?.message || 'Failed to delete user story',
        type: 'error',
      });
    }
  };

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
      <View className='py-3'>
        <ListSkeleton
          count={1}
          containerStyle={{ gap: layout.elementGap - 2 }}
          renderItem={index => <ProjectCardSkeleton key={index} />}
        />
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
          onEndReachedThreshold={2.5}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          renderItem={({ item }: { item: UserStory }) => {
            const priorityConfig = getPriorityConfig(item.priority);

            return (
              <SwipeableOption
                enabled={!permissionsLoading && canDeleteUserStory}
                actionWidth={moderateScale(68)}
                leftInset={moderateScale(8)}
                actions={[
                  {
                    key: 'delete-story',
                    icon: 'trash-outline',
                    accessibilityLabel: 'Delete user story',
                    onPress: () => setDeleteStoryItem(item),
                    width: moderateScale(60),
                    iconSize: moderateScale(25),
                  },
                ]}
              >
                <View
                  style={{
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: Radius.md,
                    overflow: 'hidden',
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={0.7}
                    className='flex-row items-center p-3.5'
                    onPress={() =>
                      navigation.navigate('issue', {
                        projectId,
                        userStoryId: item?.id,
                        story: item,
                      })
                    }
                    style={{
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
                        {item.formatted_serial_number ||
                          `#${item.serial_number}`}
                        {item.sprint_name ? ` • ${item.sprint_name}` : ''}
                      </AppText>
                      <AppText
                        variant='bodyLarge'
                        color={colors.text}
                        className='font-bold'
                        numberOfLines={1}
                      >
                        {item.title
                          ? item.title.charAt(0).toUpperCase() +
                            item.title.slice(1)
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

                      {/* Favorite Star Button */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={e => {
                          e.stopPropagation();
                          handleToggleStoryFavorite(item.id);
                        }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={{
                          padding: 4,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Ionicons
                          name={item.is_favourite ? 'star' : 'star-outline'}
                          size={moderateScale(18)}
                          color={
                            item.is_favourite
                              ? colors.warning
                              : colors.textSecondary
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </View>
              </SwipeableOption>
            );
          }}
        />
      )}

      <DeleteColumnModal
        visible={Boolean(deleteStoryItem)}
        title='Delete User Story'
        columnTitle={deleteStoryItem?.title ?? 'this user story'}
        colors={colors}
        loading={isDeleting}
        onClose={() => setDeleteStoryItem(null)}
        onDelete={handleConfirmDelete}
      />
    </View>
  );
};

export default List;
