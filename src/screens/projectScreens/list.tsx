import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from '@react-native-vector-icons/ionicons';
import { AppText, AppInput } from '../../components';
import { useTheme } from '../../hooks/useTheme';
import { useAuthLayout } from '../../hooks/useAuthLayout';
import { Radius } from '../../constants/Radius';
import { WorkItemIcon } from '../../components/common/getWorkItemIcon';
import { useAppDispatch, useAppSelector } from '../../store';
import { getUserStories } from '../../store/project_store/action/project_thunk';
import { Sprint, UserStory } from '../../types/project.type';
import ListSkeleton from '../../components/skeleton/ListSkeleton';
import ProjectCardSkeleton from '../../components/skeleton/ProjectCardSkeleton';
import { RootStackParamList } from '../../types/navigationTypes';

const List = () => {
  const { colors } = useTheme();
  const { moderateScale, layout, hp } = useAuthLayout();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [searchQuery, setSearchQuery] = useState('');
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [isFocusLoading, setIsFocusLoading] = useState(true);

  const {
    userStories,
    currentSprint,
    project,
    userStoryLoading,
    userStoryMeta,
  } = useAppSelector(state => state.projects);

  const activeSprint =
    currentSprint ||
    project?.sprints?.find((sprint: Sprint) => sprint.status === 'active') ||
    project?.sprints?.find((sprint: Sprint) => sprint.status === 'planning');

  const projectId = project?.id;

  // Force skeleton during screen focus or initial page 1 Redux load
  const showSkeleton =
    isFocusLoading || (userStoryLoading && !isFetchingNextPage);
  const showFooterSpinner = userStoryLoading && isFetchingNextPage;

  useFocusEffect(
    useCallback(() => {
      if (!projectId || !activeSprint?.id) {
        setIsFocusLoading(false);
        return;
      }

      let isMounted = true;
      setIsFocusLoading(true);
      setIsFetchingNextPage(false);

      dispatch(
        getUserStories({
          projectId,
          payload: {
            page: 1,
            page_size: 10,
            sprint_id: activeSprint.id,
          },
        }),
      ).finally(() => {
        if (isMounted) {
          setIsFocusLoading(false);
        }
      });

      return () => {
        isMounted = false;
      };
    }, [dispatch, projectId, activeSprint?.id]),
  );

  const handleLoadMore = async () => {
    if (
      !userStoryLoading &&
      !isFetchingNextPage &&
      !isFocusLoading &&
      userStoryMeta?.has_next &&
      projectId &&
      activeSprint?.id
    ) {
      try {
        setIsFetchingNextPage(true);
        await dispatch(
          getUserStories({
            projectId,
            payload: {
              page: (userStoryMeta.page || 1) + 1,
              page_size: userStoryMeta.page_size || 10,
              sprint_id: activeSprint.id,
            },
          }),
        );
      } catch (error) {
        console.error('Failed to load next page:', error);
      } finally {
        setIsFetchingNextPage(false);
      }
    }
  };

  const rawStories = (userStories as UserStory[]) || [];

  const filteredStories = rawStories.filter(story => {
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

  const getPriorityConfig = (priority?: string) => {
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
  };

  const renderFooter = () => {
    if (!showFooterSpinner) return null;
    return (
      <View className='items-center justify-center py-4'>
        <ActivityIndicator size='small' color={colors.primary} />
      </View>
    );
  };

  return (
    <ScrollView className='pt-3' style={{ backgroundColor: colors.surface }} showsVerticalScrollIndicator={false}>
      <View className='flex-1 px-4 pt-3'>
        {/* Search Bar */}
        <View className='mb-4'>
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

        {/* User Stories Count Header */}
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
        ) : null}

        {/* Story List / Loading / Empty State */}
        {showSkeleton ? (
          <View className='py-10'>
            <ListSkeleton
              count={5}
              containerStyle={{ gap: layout.elementGap - 2 }}
              renderItem={index => <ProjectCardSkeleton key={index} />}
            />
          </View>
        ) : filteredStories.length > 0 ? (
          <FlatList
            data={filteredStories}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
            ItemSeparatorComponent={() => <View className='h-3' />}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
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
                    className='items-center justify-center'
                    style={{
                      width: moderateScale(44),
                      height: moderateScale(44),
                      backgroundColor: colors.primary,
                      borderRadius: Radius.sm,
                    }}
                  >
                    <WorkItemIcon
                      type='userStory'
                      size={20}
                      color={colors.white}
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
                        ? item.title.charAt(0).toUpperCase() +
                          item.title.slice(1)
                        : ''}
                    </AppText>
                  </View>

                  {/* Right Status Badge */}
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
        ) : (
          /* Empty State */
          <View className='flex-1 items-center justify-center px-6 py-12'>
            <AppText
              variant='body'
              className='mb-1 text-center text-lg font-bold'
              color={colors.text}
            >
              {searchQuery.trim()
                ? 'No Matching Stories'
                : 'No User Stories Found'}
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
        )}
      </View>
    </ScrollView>
  );
};

export default List;

