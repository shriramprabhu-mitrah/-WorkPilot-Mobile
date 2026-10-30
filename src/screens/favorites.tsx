import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import { View, TouchableOpacity, FlatList } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from '@react-native-vector-icons/ionicons';
import Avatar from '../components/Avatar';
import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import { CommonHeader } from '../components/common/CommonHeader';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { useGetFavouritesQuery } from '../store/api/homeApi';
import { FavoriteItem } from '../types/projectBoard.type';
import { RootStackParamList } from '../types/navigationTypes';
import { WorkItemIcon } from '../components/common/getWorkItemIcon';
import ListSkeleton from '../components/skeleton/ListSkeleton';
import ProjectCardSkeleton from '../components/skeleton/ProjectCardSkeleton';
import { getPriorityThemeColor } from '../utils/enum';
import { useAppDispatch } from '../store';
import {
  unfavouriteTaskThunk,
  unfavouriteUserStoryThunk,
} from '../store/project_store/action/projectBoard.thunk';
import { showSnackbar } from '../components/common/Snackbar';

const ACCENT_PALETTE = [
  '#7C3AED',
  '#EC4899',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#EF4444',
];

const Favorites = () => {
  const { colors } = useTheme();
  const { layout, hp, moderateScale } = useAuthLayout();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [page, setPage] = useState(1);
  const [refetchKey, setRefetchKey] = useState(0);
  const [unfavoritingId, setUnfavoritingId] = useState<string | null>(null);
  const [optimisticallyRemovedItems, setOptimisticallyRemovedItems] = useState<
    Record<string, FavoriteItem>
  >({});
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const lastRequestedPageRef = useRef(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const prevItemsCountRef = useRef(0);
  const prevPageRef = useRef(1);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      lastRequestedPageRef.current = 1;
      setHasMoreData(true);
      prevItemsCountRef.current = 0;
      prevPageRef.current = 1;
      setDebouncedSearch(searchQuery.trim());
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const {
    currentData: favoritesData,
    isLoading,
    isFetching,
    refetch: refetchFavoritesData,
  } = useGetFavouritesQuery({
    page,
    search: debouncedSearch || undefined,
    _refetchKey: refetchKey,
  });

  useFocusEffect(
    useCallback(() => {
      refetchFavoritesData();
    }, [refetchFavoritesData]),
  );

  const items = useMemo(
    () => favoritesData?.data?.favorites ?? [],
    [favoritesData],
  );
  const visibleItems = useMemo(
    () => items.filter(item => !optimisticallyRemovedItems[item.id]),
    [items, optimisticallyRemovedItems],
  );
  const removedItemsInCurrentResults = useMemo(
    () => items.filter(item => optimisticallyRemovedItems[item.id]),
    [items, optimisticallyRemovedItems],
  );

  const meta = useMemo(() => favoritesData?.meta ?? null, [favoritesData]);

  const totalCount = useMemo(() => {
    if (typeof favoritesData?.data?.total === 'number') {
      return favoritesData.data.total;
    }
    if (typeof favoritesData?.meta?.total_items === 'number') {
      return favoritesData.meta.total_items;
    }
    const tasks = favoritesData?.data?.total_tasks;
    const stories = favoritesData?.data?.total_user_stories;
    if (typeof tasks === 'number' || typeof stories === 'number') {
      return (tasks ?? 0) + (stories ?? 0);
    }
    return null;
  }, [favoritesData]);

  const visibleTotalCount =
    totalCount === null
      ? null
      : Math.max(0, totalCount - removedItemsInCurrentResults.length);

  const totalPages = meta?.total_pages;
  const hasNextMeta = meta?.has_next;

  useEffect(() => {
    if (!isFetching && favoritesData) {
      if (page > 1 && page !== prevPageRef.current) {
        if (items.length <= prevItemsCountRef.current) {
          setHasMoreData(false);
        }
        prevPageRef.current = page;
      }
      prevItemsCountRef.current = items.length;
    }
  }, [isFetching, favoritesData, page, items.length]);

  const isTotalOver = useMemo(() => {
    if (isLoading && visibleItems.length === 0) {
      return false;
    }

    if (visibleTotalCount !== null) {
      return visibleItems.length >= visibleTotalCount;
    }

    if (typeof hasNextMeta === 'boolean') {
      return !hasNextMeta;
    }

    if (typeof totalPages === 'number' && totalPages > 0) {
      return page >= totalPages;
    }

    if (!isFetching && visibleItems.length > 0 && visibleItems.length < 10) {
      return true;
    }

    if (!isLoading && !isFetching && visibleItems.length === 0) {
      return true;
    }

    return !hasMoreData;
  }, [
    isLoading,
    isFetching,
    visibleItems.length,
    visibleTotalCount,
    hasNextMeta,
    totalPages,
    page,
    hasMoreData,
  ]);

  const handleLoadMore = useCallback(() => {
    if (
      isFetching ||
      isLoading ||
      isTotalOver ||
      (visibleItems.length === 0 && hasNextMeta !== true)
    ) {
      return;
    }

    const nextPage = page + 1;
    if (lastRequestedPageRef.current >= nextPage) {
      return;
    }
    lastRequestedPageRef.current = nextPage;
    setPage(nextPage);
  }, [
    hasNextMeta,
    isFetching,
    isLoading,
    isTotalOver,
    page,
    visibleItems.length,
  ]);

  const handleItemPress = useCallback(
    (item: FavoriteItem) => {
      if (item.item_type === 'task') {
        const taskId = (item as any).task_id || item.id;
        const userStoryId = (item as any).user_story_id;
        navigation.navigate('issue', {
          projectId: item.project_id,
          userStoryId: userStoryId,
          taskId,
          task: item as any,
          taskName: item.task_title || item.title,
        });
      } else if (item.item_type === 'user_story') {
        const userStoryId = (item as any).user_story_id || item.id;
        navigation.navigate('issue', {
          projectId: item.project_id,
          userStoryId,
          story: item as any,
          storyName: item.user_story_title || item.title,
        });
      }
    },
    [navigation],
  );

  const handleUnfavorite = useCallback(
    async (item: FavoriteItem) => {
      if (unfavoritingId) return;
      setUnfavoritingId(item.id);
      setOptimisticallyRemovedItems(previous => ({
        ...previous,
        [item.id]: item,
      }));
      try {
        if (item.item_type === 'task') {
          await dispatch(
            unfavouriteTaskThunk({
              projectId: item.project_id,
              taskId: item.task_id,
            }),
          ).unwrap();
        } else {
          await dispatch(
            unfavouriteUserStoryThunk({
              projectId: item.project_id,
              userStoryId: item.user_story_id,
            }),
          ).unwrap();
        }

        setPage(1);
        lastRequestedPageRef.current = 1;
        prevItemsCountRef.current = 0;
        prevPageRef.current = 1;
        setHasMoreData(true);
        setRefetchKey(key => key + 1);
      } catch (error) {
        setOptimisticallyRemovedItems(previous => {
          const next = { ...previous };
          delete next[item.id];
          return next;
        });
        showSnackbar({
          message:
            typeof error === 'string' ? error : 'Failed to remove favorite.',
          type: 'error',
        });
      } finally {
        setUnfavoritingId(null);
      }
    },
    [dispatch, unfavoritingId],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: FavoriteItem; index: number }) => {
      const workItem = item.item_type === 'task' ? item.task : item.user_story;
      const title =
        item.item_type === 'task'
          ? item.task_title || item.title
          : item.user_story_title || item.title;

      const isUnassigned = !workItem?.assignee;

      const accent = isUnassigned
        ? ACCENT_PALETTE[index % ACCENT_PALETTE.length]
        : workItem?.assignee?.color ||
          ACCENT_PALETTE[index % ACCENT_PALETTE.length];
      const priorityColor = getPriorityThemeColor(workItem?.priority, colors);
      const assigneeName =
        workItem?.assignee_name || workItem?.assignee?.name || 'Unassigned';
      const assigneeAvatar = workItem?.assignee?.avatar_url;
      const type =
        item.item_type ||
        (item as any).resource_type ||
        (item as any).type ||
        '';
      const displayType =
        type?.toLowerCase() === 'user_story' ||
        type?.toLowerCase() === 'userstory'
          ? 'user story'
          : type?.replace(/_/g, ' ') || '';

      return (
        <TouchableOpacity
          activeOpacity={0.8}
          className='mb-3 rounded-2xl border p-4'
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            overflow: 'hidden',
          }}
          onPress={() => handleItemPress(item)}
        >
          <View
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: moderateScale(4),
              backgroundColor: accent,
            }}
          />
          <View className='flex-row items-center'>
            <View
              className='mr-3 items-center justify-center rounded-xl'
              style={{
                width: moderateScale(40),
                height: moderateScale(40),
                backgroundColor: `${colors.primary}18`,
              }}
            >
              <WorkItemIcon type={type} size={moderateScale(20)} />
            </View>
            <View className='flex-1 justify-center'>
              <AppText
                variant='body'
                className='font-bold capitalize'
                color={colors.text}
                style={{
                  fontSize: moderateScale(15),
                  lineHeight: moderateScale(20),
                  marginBottom: 2,
                }}
                numberOfLines={1}
              >
                {title}
              </AppText>
              <AppText
                variant='caption'
                color={colors.textSecondary}
                numberOfLines={1}
                style={{ marginTop: moderateScale(3) }}
              >
                {item.item_type === 'task'
                  ? item.task?.key ||
                    item.task?.formatted_serial_number ||
                    'Task'
                  : item.user_story?.formatted_serial_number || 'User story'}
              </AppText>
            </View>
            <View className='flex-row items-center' style={{ gap: 2 }}>
              <TouchableOpacity
                activeOpacity={0.7}
                disabled={Boolean(unfavoritingId)}
                accessibilityRole='button'
                accessibilityLabel={`Remove ${title} from favorites`}
                onPress={event => {
                  event.stopPropagation();
                  handleUnfavorite(item);
                }}
                className='items-center justify-center rounded-full'
                style={{
                  width: moderateScale(30),
                  height: moderateScale(30),
                  opacity: unfavoritingId === item.id ? 0.45 : 1,
                }}
              >
                <Ionicons
                  name='star'
                  size={moderateScale(17)}
                  color={colors.warning || '#F59E0B'}
                />
              </TouchableOpacity>
              <Ionicons
                name='chevron-forward'
                size={moderateScale(16)}
                color={colors.textSecondary}
              />
            </View>
          </View>
          <View
            className='mt-3 flex-row items-center justify-between border-t pt-3'
            style={{ borderColor: colors.border }}
          >
            <View
              className='flex-row items-center'
              style={{ gap: moderateScale(8), flex: 1 }}
            >
              <View
                className='rounded-full px-2 py-1'
                style={{ backgroundColor: `${priorityColor}18` }}
              >
                <AppText
                  variant='caption'
                  color={priorityColor}
                  className='font-semibold capitalize'
                >
                  {workItem?.priority || 'No priority'}
                </AppText>
              </View>
              <View
                className='rounded-full px-2 py-1'
                style={{ backgroundColor: `${workItem.status_color}20` }}
              >
                <AppText
                  variant='caption'
                  color={colors.textSecondary}
                  numberOfLines={1}
                >
                  {workItem?.status || displayType}
                </AppText>
              </View>
            </View>
            <View
              className='flex-row items-center'
              style={{ gap: moderateScale(6), maxWidth: '50%' }}
            >
              {assigneeName === 'Unassigned' ? (
                <View
                  className='items-center justify-center rounded-full'
                  style={{
                    width: moderateScale(26),
                    height: moderateScale(26),
                    backgroundColor: `${accent}20`,
                  }}
                >
                  <Ionicons
                    name='person'
                    size={moderateScale(14)}
                    color={accent}
                  />
                </View>
              ) : (
                <Avatar
                  dimension={moderateScale(26)}
                  initials={assigneeName.charAt(0).toUpperCase()}
                  color={accent}
                  imageUrl={assigneeAvatar}
                />
              )}
              <AppText
                variant='caption'
                color={colors.textSecondary}
                numberOfLines={1}
                style={{ maxWidth: moderateScale(90) }}
              >
                {assigneeName}
              </AppText>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [colors, handleItemPress, handleUnfavorite, moderateScale, unfavoritingId],
  );

  const taskCount = Math.max(
    0,
    (favoritesData?.data?.total_tasks ?? 0) -
      removedItemsInCurrentResults.filter(item => item.item_type === 'task')
        .length,
  );
  const userStoryCount = Math.max(
    0,
    (favoritesData?.data?.total_user_stories ?? 0) -
      removedItemsInCurrentResults.filter(
        item => item.item_type === 'user_story',
      ).length,
  );

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <CommonHeader
        variant='search'
        title='Favorites'
        titleAlignment='left'
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <View
            className='flex-row items-center rounded-full border px-2.5 py-1.5'
            style={{
              backgroundColor: colors.background,
              borderColor: colors.border,
              gap: moderateScale(8),
            }}
          >
            <View className='flex-row items-center' style={{ gap: 4 }}>
              <Ionicons
                name='checkbox'
                size={moderateScale(13)}
                color={colors.primary}
              />
              <AppText
                variant='caption'
                color={colors.text}
                style={{ fontSize: moderateScale(10), fontWeight: '700' }}
              >
                {taskCount}
              </AppText>
            </View>
            <View
              style={{
                width: 1,
                height: moderateScale(13),
                backgroundColor: colors.border,
              }}
            />
            <View className='flex-row items-center' style={{ gap: 4 }}>
              <Ionicons
                name='bookmark'
                size={moderateScale(13)}
                color='#16A34A'
              />
              <AppText
                variant='caption'
                color={colors.text}
                style={{ fontSize: moderateScale(10), fontWeight: '700' }}
              >
                {userStoryCount}
              </AppText>
            </View>
          </View>
        }
        searchQuery={searchQuery}
        onChangeSearchQuery={setSearchQuery}
        searchPlaceholder='Search favorites...'
      />

      {(isLoading || (isFetching && !favoritesData)) && items.length === 0 ? (
        <View style={{ paddingHorizontal: layout.paddingHorizontal }}>
          <ListSkeleton
            count={5}
            containerStyle={{ gap: layout.elementGap }}
            renderItem={() => <ProjectCardSkeleton />}
          />
        </View>
      ) : (
        <FlatList
          data={visibleItems}
          keyExtractor={(item, index) =>
            item.id?.toString() || `favorite-${index}`
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className='flex-1 items-center justify-center py-12'>
              <Ionicons
                name='star-outline'
                size={moderateScale(46)}
                color={colors.textSecondary}
              />
              <AppText
                variant='body'
                color={colors.textSecondary}
                style={{ marginTop: moderateScale(12) }}
              >
                No favorites found.
              </AppText>
            </View>
          }
          contentContainerStyle={{
            paddingHorizontal: layout.paddingHorizontal,
            paddingBottom: hp(20),
            flexGrow: visibleItems.length === 0 ? 1 : undefined,
          }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetching && visibleItems.length > 0 && !isTotalOver ? (
              <View className='py-2'>
                <ProjectCardSkeleton />
              </View>
            ) : null
          }
        />
      )}
    </Screen>
  );
};

export default Favorites;
