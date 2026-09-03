import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import CustomBottomSheet from '../components/common/CustomBottomDialog';
import ProjectListBottomSheet from '../components/common/ProjectBottomSheet';
import { CommonHeader } from '../components/common/CommonHeader';
import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { QuickLinks, getQuickLinks, getStats } from '../data/profileScreenData';
import { useAppDispatch, useAppSelector } from '../store';
import { logoutUser } from '../store/auth_store/action/auth.thunks';
import { getFavouritesThunk } from '../store/project_store/action/projectBoard.thunk';
import { showSuccessToast } from '../utils/utils';
import { Radius } from '../constants/Radius';
import { getRoleLabel } from '../constants/role';
import { Activity, UserInsights } from '../types/home.type';
import { FavoriteItem } from '../types/projectBoard.type';
import { formatAction, formatDate, getInitials } from '../utils/utils';
import { WorkItemIcon } from '../components/common/getWorkItemIcon';
import ProjectCardSkeleton from '../components/skeleton/ProjectCardSkeleton';
import RecentActivitySkeleton from '../components/skeleton/RecentActivitySkeleton';
import {
  getAudit,
  getUserInsightsData,
} from '../store/home_store/action/home.thunk';
import { resetAuditData } from '../store/home_store/reducer/home.reducer';
import { getAllProjectInfo } from '../store/project_store/action/project_thunk';
import { resetProjects } from '../store/project_store/reducer/project_reducer';
import { FilterChipSkeleton } from '../components/skeleton/filterChipSkeleton';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const ProfileScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors, strings } = useTheme();
  const { layout, moderateScale, isSmallHeight, hp } = useAuthLayout();
  const dispatch = useAppDispatch();
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isActivityFullScreen, setIsActivityFullScreen] = useState(false);
  const [isProjectSheetVisible, setIsProjectSheetVisible] = useState(false);
  const profileIcons = strings.profile?.icons;

  const { user } = useAppSelector(state => state.auth);
  const {
    activities,
    user: homeUser,
    loading,
    meta,
    insights,
    insightsLoading,
  } = useAppSelector(state => state.home);

  const { projects, loading: projectsLoading } = useAppSelector(
    state => state.projects,
  );

  const { favorites, favoritesLoading, favoritesMeta } = useAppSelector(
    state => state.projectBoard,
  );

  const [favoritesExpanded, setFavoritesExpanded] = useState(false);
  const favoritesRef = useRef(false);

  // Pagination refs
  const currentPageRef = useRef(1);
  const fetchingRef = useRef(false);
  const lastRequestedPageRef = useRef<number | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const stats = getStats(colors, insights as UserInsights);
  const quickLinks = getQuickLinks(colors, strings);

  const handleLogoutConfirm = () => {
    dispatch(logoutUser(showSuccessToast));
  };

  // Fetch initial activity data
  useFocusEffect(
    useCallback(() => {
      currentPageRef.current = 1;
      lastRequestedPageRef.current = null;
      fetchingRef.current = false;
      setIsFetchingMore(false);
      dispatch(getUserInsightsData());
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

  useFocusEffect(
    useCallback(() => {
      dispatch(resetProjects());
      dispatch(getAllProjectInfo({ page: 1 }));
      return () => {};
    }, [dispatch]),
  );

  useFocusEffect(
    useCallback(() => {
      favoritesRef.current = false;
      dispatch(getFavouritesThunk({ params: { page: 1 } }));
      return () => {
        favoritesRef.current = false;
      };
    }, [dispatch]),
  );

  // Navigation to full-screen activity
  const openActivityFullScreen = useCallback(() => {
    setIsActivityFullScreen(true);
  }, []);

  const closeActivityFullScreen = useCallback(() => {
    setIsActivityFullScreen(false);
  }, []);

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

  const handleFavoritesScroll = useCallback(
    (event: any) => {
      if (!event?.nativeEvent) {
        if (
          !favoritesRef.current &&
          !favoritesLoading &&
          favoritesMeta?.has_next
        ) {
          favoritesRef.current = true;
          dispatch(
            getFavouritesThunk({
              params: { page: (favoritesMeta?.page || 1) + 1 },
            }),
          );
        }
        return;
      }

      const { contentOffset, layoutMeasurement, contentSize } =
        event.nativeEvent;
      const isNearEnd =
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - moderateScale(50);

      if (
        isNearEnd &&
        !favoritesRef.current &&
        !favoritesLoading &&
        favoritesMeta?.has_next
      ) {
        favoritesRef.current = true;
        dispatch(
          getFavouritesThunk({
            params: { page: (favoritesMeta?.page || 1) + 1 },
          }),
        );
      }
    },
    [dispatch, favoritesLoading, favoritesMeta, moderateScale],
  );

  useEffect(() => {
    if (!favoritesLoading) {
      favoritesRef.current = false;
    }
  }, [favoritesLoading]);

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
        userStroyName: item?.title,
      });
    } else if (resourceType === 'task') {
      navigation.navigate('issue', {
        projectId: item?.project_id,
        taskId: item?.resource_id,
        taskName: item?.title,
      });
    }
  };

  const renderActivityItem = ({ item }: { item: Activity }) => {
    const activityUser = homeUser || user;
    const userName = activityUser?.name || 'User';
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
            {activityUser?.avatar_url ? (
              <Image
                source={{ uri: activityUser.avatar_url }}
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
                  {getInitials(userName)}
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

  // Full Screen Activity View with CommonHeader
  if (isActivityFullScreen) {
    return (
      <Screen scroll={false} backgroundColor={colors.surface}>
        <CommonHeader
          variant='custom'
          title='Recent Activities'
          titleAlignment='left'
          onBackPress={closeActivityFullScreen}
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
  }

  // Regular Profile View
  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <View
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: layout.paddingHorizontal,
          paddingTop: layout.paddingTop,
          paddingBottom: layout.sectionGap * 1.5,
        }}
      >
        <View className='mb-6 flex-row items-center justify-between'>
          <AppText variant='h4' color={colors.white}>
            {strings.profile?.title || 'Profile'}
          </AppText>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Settings')}
            className='items-center justify-center rounded-full bg-white/20'
            style={{
              width: moderateScale(36),
              height: moderateScale(36),
            }}
          >
            <Ionicons
              name={
                (profileIcons?.settings || 'settings-outline') as IoniconName
              }
              size={18}
              color={colors.white}
            />
          </TouchableOpacity>
        </View>
        <View className='flex-row items-end gap-4'>
          <View className='relative'>
            <View
              className='items-center justify-center'
              style={{
                width: moderateScale(74),
                height: moderateScale(74),
                marginRight: moderateScale(14),
                borderRadius: Radius.circle,
              }}
            >
              {user?.avatar_url ? (
                <Image
                  source={{ uri: user.avatar_url }}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: Radius.circle,
                  }}
                  resizeMode='cover'
                />
              ) : (
                <View
                  className='items-center justify-center'
                  style={{
                    width: moderateScale(74),
                    height: moderateScale(74),
                    backgroundColor: colors.accentOrange,
                    borderRadius: Radius.circle,
                  }}
                >
                  <AppText
                    style={{
                      fontSize: moderateScale(28),
                      fontWeight: 'bold',
                      color: colors.white,
                    }}
                  >
                    {user?.name
                      ?.split(' ')
                      .map(word => word[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase() || 'U'}
                  </AppText>
                </View>
              )}
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('updateDetails')}
              className='absolute bottom-0 right-[7%] items-center justify-center rounded-full border'
              style={{
                width: moderateScale(26),
                height: moderateScale(26),
                backgroundColor: colors.background,
                borderColor: colors.border,
              }}
            >
              <Ionicons
                name={(profileIcons?.edit || 'create-outline') as IoniconName}
                size={14}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
          <View style={{ gap: layout.tightGap / 2 }}>
            <AppText variant='h3' color={colors.white}>
              {user?.name}
            </AppText>
            <AppText variant='body' color={colors.textOnPrimarySubtle}>
              {getRoleLabel(user?.role) ||
                strings.profile?.role ||
                'Senior Software Engineer'}
            </AppText>
            <AppText variant='caption' color={colors.textOnPrimarySubtle}>
              {user?.email || 'alex.johnson@company.com'}
            </AppText>
          </View>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: isSmallHeight ? hp(20) : hp(12),
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Section */}
        <View
          style={{
            marginTop: layout.sectionGap,
            marginBottom: layout.sectionGap,
            paddingHorizontal: layout.paddingHorizontal,
          }}
        >
          {insightsLoading ? (
            <View
              className='flex-row justify-between rounded-2xl border py-4'
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border,
              }}
            >
              {Array.from({ length: 4 }).map((_, idx) => (
                <View key={idx} className='flex-1 items-center'>
                  <View
                    className='rounded'
                    style={{
                      width: moderateScale(40),
                      height: moderateScale(24),
                      backgroundColor: colors.border,
                    }}
                  />
                  <View
                    className='mt-2 rounded'
                    style={{
                      width: moderateScale(50),
                      height: moderateScale(10),
                      backgroundColor: colors.border,
                    }}
                  />
                </View>
              ))}
            </View>
          ) : (
            <View
              className='flex-row justify-between rounded-2xl border py-4'
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border,
              }}
            >
              {stats.map(item => (
                <View key={item.label} className='flex-1 items-center'>
                  <AppText variant='title' style={{ color: item.color }}>
                    {item.value}
                  </AppText>

                  <AppText
                    variant='caption'
                    color={colors.textSecondary}
                    className='mt-1 text-center'
                  >
                    {item.label}
                  </AppText>
                </View>
              ))}
            </View>
          )}
        </View>
        <View
          style={{
            marginBottom: layout.sectionGap,
            paddingHorizontal: layout.paddingHorizontal,
          }}
        >
          <View className='flex-row items-center justify-between'>
            <AppText
              variant='bodyLarge'
              color={colors.text}
              style={{ marginBottom: layout.elementGap }}
            >
              {strings.profile?.teamsTitle || 'Projects'}
            </AppText>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsProjectSheetVisible(true)}
            >
              <AppText
                variant='body'
                color={colors.primary}
                className='font-medium'
              >
                {strings.profile?.viewAll || 'View all'}
              </AppText>
            </TouchableOpacity>
          </View>
          {projectsLoading ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: layout.elementGap / 2 }}
            >
              {Array.from({ length: 4 }).map((_, idx) => (
                <FilterChipSkeleton key={`chip-skel-${idx}`} />
              ))}
            </ScrollView>
          ) : projects.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: layout.elementGap / 2 }}
            >
              {projects.slice(0, 2).map(projectItem => (
                <TouchableOpacity
                  key={projectItem.id}
                  activeOpacity={0.8}
                  className='flex-row items-center rounded-xl border px-3 py-2'
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    maxWidth: moderateScale(140),
                  }}
                  onPress={() =>
                    navigation.navigate('projectDetails', {
                      projectId: projectItem.id,
                      projectName: projectItem.name,
                    })
                  }
                >
                  <View
                    className='mr-2 items-center justify-center rounded-md'
                    style={{
                      width: moderateScale(18),
                      height: moderateScale(18),
                      backgroundColor: colors.surface,
                    }}
                  >
                    <WorkItemIcon type='project' size={moderateScale(12)} />
                  </View>
                  <AppText
                    variant='body'
                    color={colors.text}
                    className='font-medium'
                    numberOfLines={1}
                    style={{ maxWidth: moderateScale(90) }}
                  >
                    {projectItem.name}
                  </AppText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View className='p-4'>
              <AppText variant='caption' color={colors.textSecondary}>
                No projects found
              </AppText>
            </View>
          )}
        </View>

        {/* Recent Activity Section */}
        <View
          style={{
            marginBottom: layout.sectionGap,
            paddingHorizontal: layout.paddingHorizontal,
          }}
        >
          <View
            className='flex-row items-center justify-between'
            style={{ marginBottom: layout.elementGap }}
          >
            <AppText variant='bodyLarge' color={colors.text}>
              {strings.profile?.recentActivity || 'Recent Activity'}
            </AppText>
            <TouchableOpacity
              onPress={openActivityFullScreen}
              activeOpacity={0.7}
            >
              <AppText
                variant='body'
                color={colors.primary}
                className='font-medium'
              >
                {strings.profile?.viewAll || 'View all'}
              </AppText>
            </TouchableOpacity>
          </View>

          {loading && activities.length === 0 ? (
            <RecentActivitySkeleton />
          ) : activities.length > 0 ? (
            <View
              className='rounded-xl border'
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border,
              }}
            >
              {activities.slice(0, 4).map((item: Activity, index: number) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleActivityNavigation(item)}
                  activeOpacity={0.7}
                  className={`flex-row items-start px-4 py-3 ${
                    index !== 3 && index !== activities.slice(0, 4).length - 1
                      ? 'border-b'
                      : ''
                  }`}
                  style={{
                    borderColor: colors.itemDivider,
                  }}
                >
                  <View
                    className='mr-3 mt-2 rounded-full'
                    style={{
                      width: moderateScale(8),
                      height: moderateScale(8),
                      backgroundColor: colors.primary,
                    }}
                  />
                  <View className='flex-1'>
                    <AppText variant='body' color={colors.text}>
                      {item.title}
                    </AppText>
                    <AppText
                      variant='caption'
                      color={colors.textSecondary}
                      className='mt-1'
                      numberOfLines={1}
                    >
                      {item.resource_type} • {formatDate(item.created_at)}
                    </AppText>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View
              className='rounded-xl border p-4'
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border,
              }}
            >
              <AppText variant='caption' color={colors.textSecondary}>
                No recent activity
              </AppText>
            </View>
          )}
        </View>

        <View
          style={{
            marginBottom: layout.sectionGap,
            paddingHorizontal: layout.paddingHorizontal,
          }}
        >
          <View
            className='rounded-xl border'
            style={{
              backgroundColor: colors.background,
              borderColor: colors.border,
            }}
          >
            {quickLinks.map((item: QuickLinks, index: number) => {
              return (
                <TouchableOpacity
                  key={item.label}
                  activeOpacity={0.7}
                  className='flex-row items-center px-4 py-4'
                  style={{
                    borderBottomWidth: index !== quickLinks.length - 1 ? 1 : 0,
                    borderColor: colors.itemDivider,
                  }}
                  onPress={() => {
                    if (item.navigateUrl) {
                      navigation.navigate(item.navigateUrl as any);
                    }
                  }}
                >
                  <Ionicons
                    name={item.iconName as IoniconName}
                    size={20}
                    color={item.color}
                  />
                  <AppText
                    variant='body'
                    color={colors.text}
                    className='flex-1 pl-4 font-medium'
                  >
                    {item.label}
                  </AppText>
                  <Ionicons
                    name={
                      (profileIcons?.chevronRight ||
                        'chevron-forward') as IoniconName
                    }
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        {/* Logout Button */}
        <View style={{ paddingHorizontal: layout.paddingHorizontal }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsLogoutModalVisible(true)}
            className='flex-row items-center justify-center gap-2 rounded-xl border-2 py-3'
            style={{
              borderColor: colors.error,
            }}
          >
            <Ionicons
              name={(profileIcons?.logout || 'log-out-outline') as IoniconName}
              size={18}
              color={colors.error}
            />
            <AppText
              variant='body'
              color={colors.error}
              className='font-semibold'
            >
              {strings.profile?.logout || 'Log out'}
            </AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logout Bottom Sheet Dialog */}
      <CustomBottomSheet
        visible={isLogoutModalVisible}
        onDismiss={() => setIsLogoutModalVisible(false)}
        title={strings.profile?.logout || 'Logout'}
        message='Are you sure you want to log out?'
        confirmText={strings.profile?.logout || 'Logout'}
        cancelText='Cancel'
        onConfirm={handleLogoutConfirm}
        confirmButtonColor={colors.error}
        showCancel={true}
        showCloseIcon={true}
        confirmTextColor={colors.white}
      />
      <ProjectListBottomSheet
        visible={isProjectSheetVisible}
        onDismiss={() => setIsProjectSheetVisible(false)}
        title='Projects'
        mode='projects'
        onSelectProject={(projectId, projectName) => {
          setIsProjectSheetVisible(false);
          navigation.navigate('projectDetails', {
            projectId,
            projectName: projectName || '',
          });
        }}
      />
    </Screen>
  );
};

export default ProfileScreen;
