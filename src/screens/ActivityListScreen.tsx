import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigationTypes';
import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import { CommonHeader } from '../components/common/CommonHeader';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { useAppDispatch, useAppSelector } from '../store';
import { getAudit } from '../store/home_store/action/home.thunk';
import { resetAuditData } from '../store/home_store/reducer/home.reducer';
import { Activity } from '../types/home.type';
import { formatAction, formatDate, getInitials } from '../utils/utils';
import { WorkItemIcon } from '../components/common/getWorkItemIcon';
import ProjectCardSkeleton from '../components/skeleton/ProjectCardSkeleton';
import { Image } from 'react-native';

const ActivityListScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors, strings } = useTheme();
  const { layout, moderateScale, hp, isSmallHeight } = useAuthLayout();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  
  const {
    activities,
    user: homeUser,
    loading,
    meta,
  } = useAppSelector(state => state.home);

  // Pagination refs
  const currentPageRef = useRef(1);
  const fetchingRef = useRef(false);
  const lastRequestedPageRef = useRef<number | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  useFocusEffect(
    useCallback(() => {
      currentPageRef.current = 1;
      lastRequestedPageRef.current = null;
      fetchingRef.current = false;
      setIsFetchingMore(false);
      dispatch(resetAuditData());
      dispatch(
        getAudit({
          type: 'activity',
          page: 1,
        }),
      );
      return () => {
        fetchingRef.current = false;
        setIsFetchingMore(false);
      };
    }, [dispatch]),
  );

  const handleLoadMore = useCallback(() => {
    if (fetchingRef.current) {
      return;
    }
    if (loading && activities.length === 0) {
      return;
    }
    const currentPage = currentPageRef.current;
    const hasNextPage =
      meta?.has_next !== undefined
        ? meta.has_next
        : meta?.total_pages !== undefined
          ? currentPage < meta.total_pages
          : true;
    if (!hasNextPage) {
      return;
    }
    const nextPage = currentPage + 1;
    if (lastRequestedPageRef.current === nextPage) {
      return;
    }
    fetchingRef.current = true;
    lastRequestedPageRef.current = nextPage;
    setIsFetchingMore(true);
    dispatch(
      getAudit({
        type: 'activity',
        page: nextPage,
      }),
    )
      .unwrap()
      .then(response => {
        const responsePage = response?.meta?.page;
        if (typeof responsePage === 'number' && responsePage >= nextPage) {
          currentPageRef.current = responsePage;
        } else {
          currentPageRef.current = nextPage;
        }
      })
      .catch(error => {
        console.log('Load more error:', error);
        lastRequestedPageRef.current = null;
      })
      .finally(() => {
        fetchingRef.current = false;
        setIsFetchingMore(false);
      });
  }, [activities.length, loading, meta, dispatch]);

  const handleActivityNavigation = (item: Activity) => {
    const resourceType = item?.resource_type?.toLowerCase();

    if (resourceType === 'project' || resourceType === 'sprint') {
      const projectId = item?.project_id?.toString() || item?.id?.toString();
      if (!projectId) return;
      navigation.navigate('projectDetails', {
        projectId,
        projectName: item?.project_name || '',
      });
    } else if (resourceType === 'user_story' || resourceType === 'userstory') {
      navigation.navigate('issue', {
        projectId: item?.project_id,
        userStoryId: item?.resource_id,
      });
    } else if (resourceType === 'task') {
      navigation.navigate('issue', {
        projectId: item?.project_id,
        taskId: item?.resource_id,
      });
    }
  };

  const renderActivityItem = ({ item }: { item: Activity }) => {
    const activityUser = homeUser || user;
    const userName = activityUser?.name || 'User';
    const avatarUrl = activityUser?.avatar_url;
    const userInitials = getInitials(userName);
    const actionText = formatAction(item.action);
    const formattedDate = formatDate(item.created_at);
    const resourceType = item.resource_type || 'task';
    const title = item.title || item.details || 'Activity Details';
    const key = item.task_key || item.key || '';

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        className='mb-3 rounded-2xl border p-4'
        style={{
          backgroundColor: colors.background,
          borderColor: colors.border,
        }}
        onPress={() => handleActivityNavigation(item)}
      >
        <View className='flex-row items-center'>
          <View className='relative mr-3.5 self-center'>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={{
                  width: moderateScale(40),
                  height: moderateScale(40),
                  borderRadius: moderateScale(20),
                }}
                resizeMode='cover'
              />
            ) : (
              <View
                className='items-center justify-center rounded-full'
                style={{
                  width: moderateScale(40),
                  height: moderateScale(40),
                  backgroundColor: colors.accentOrange || '#E03E15',
                }}
              >
                <AppText
                  className='font-bold'
                  style={{
                    fontSize: moderateScale(15),
                    color: colors.white,
                  }}
                >
                  {userInitials}
                </AppText>
              </View>
            )}
            <View
              style={{
                position: 'absolute',
                bottom: moderateScale(-2),
                right: moderateScale(-2),
                width: moderateScale(16),
                height: moderateScale(16),
                borderRadius: moderateScale(4),
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <WorkItemIcon type={resourceType} size={moderateScale(10)} />
            </View>
          </View>

          <View className='flex-1 justify-center'>
            <AppText
              variant='caption'
              color={colors.textSecondary}
              style={{
                fontSize: moderateScale(11),
                marginBottom: 2,
              }}
              numberOfLines={1}
            >
              <AppText
                className='capitalize'
                variant='caption'
                color={colors.textSecondary}
              >
                {userName}
              </AppText>{' '}
              {actionText} {resourceType} • {formattedDate}
            </AppText>
            <AppText
              variant='body'
              className='font-bold capitalize'
              color={colors.text}
              style={{
                fontSize: moderateScale(15),
                lineHeight: moderateScale(20),
              }}
              numberOfLines={1}
            >
              {title}
            </AppText>
            {key ? (
              <AppText
                variant='caption'
                color={colors.textSecondary}
                style={{
                  fontSize: moderateScale(12),
                  marginTop: 2,
                }}
                numberOfLines={1}
              >
                {key}
              </AppText>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <CommonHeader
        variant='custom'
        title='Recent Activities'
        titleAlignment='left'
        onBackPress={() => navigation.goBack()}
      />

      <View
        style={{
          paddingHorizontal: layout.paddingHorizontal,
          paddingTop: layout.paddingTop,
          paddingBottom: isSmallHeight ? hp(20) : hp(12),
        }}
      >
        {loading && activities.length === 0 ? (
          <View>
            {Array.from({ length: 5 }).map((_, idx) => (
              <View key={idx} className='mb-3'>
                <ProjectCardSkeleton />
              </View>
            ))}
          </View>
        ) : (
          <FlatList
            data={activities}
            keyExtractor={(item: Activity, index: number) =>
              item.id?.toString() || index.toString()
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: isSmallHeight ? hp(20) : hp(12),
            }}
            renderItem={renderActivityItem}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.2}
            ListEmptyComponent={
              !loading ? (
                <View className='py-10'>
                  <AppText variant='body' color={colors.textSecondary}>
                    No recent activity
                  </AppText>
                </View>
              ) : null
            }
            ListFooterComponent={
              isFetchingMore ? (
                <View className='py-4'>
                  <ProjectCardSkeleton />
                </View>
              ) : null
            }
          />
        )}
      </View>
    </Screen>
  );
};

export default ActivityListScreen;
