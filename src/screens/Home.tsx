import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import Ionicons from '@react-native-vector-icons/ionicons';
import { DrawerParamList } from '../navigation/DrawerNavigator';
import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import { CommonHeader } from '../components/common/CommonHeader';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { useAppDispatch, useAppSelector } from '../store';
import {
  getOrganizationDetail,
  getUserProfileInfo,
} from '../store/auth_store/action/auth.thunks';
import {
  setActiveTab,
  resetAuditData,
} from '../store/home_store/reducer/home.reducer';
import ListSkeleton from '../components/skeleton/ListSkeleton';
import ProjectCardSkeleton from '../components/skeleton/ProjectCardSkeleton';
import { WorkItemIcon } from '../components/common/getWorkItemIcon';
import { getAudit } from '../store/home_store/action/home.thunk';
import ProjectListBottomSheet from '../components/common/ProjectBottomSheet';
import {
  getAllProjectInfo,
  getRecentProjects,
} from '../store/project_store/action/project_thunk';
import { getProjectName } from '../store/project_store/reducer/project_reducer';
import { Activity } from '../types/home.type';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigationTypes';
import { formatAction, formatDate, getInitials } from '../utils/utils';
import RecentProjectsSkeleton from '../components/skeleton/RecentProjectsSkeleton';

export const Home: React.FC = () => {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const stackNavigation =
    useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { layout, moderateScale, hp, isSmallHeight } = useAuthLayout();
  const { user } = useAppSelector(state => state.auth);
  const { project, recentProjects, include_sprints } = useAppSelector(
    state => state.projects,
  );
  const {
    activities,
    user: homeUser,
    activeTab,
    loading,
    meta,
  } = useAppSelector(state => state.home);
  console.log('homeUser', homeUser);
  const [projectSheetVisible, setProjectSheetVisible] = useState(false);
  const [isRecentLoading, setIsRecentLoading] = useState(true);
  const currentPageRef = useRef(1);
  const fetchingRef = useRef(false);
  const lastRequestedPageRef = useRef<number | null>(null);
  const currentTabRef = useRef<'viewed' | 'activity'>(activeTab);
  currentTabRef.current = activeTab;
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  useFocusEffect(
    useCallback(() => {
      currentPageRef.current = 1;
      lastRequestedPageRef.current = null;
      fetchingRef.current = false;
      setIsFetchingMore(false);
      setIsRecentLoading(true);
      dispatch(resetAuditData());
      dispatch(getUserProfileInfo());
      dispatch(getOrganizationDetail());
      dispatch(getRecentProjects())
        .unwrap()
        .catch(error => {
          console.error('Failed to fetch recent projects:', error);
        })
        .finally(() => {
          setIsRecentLoading(false);
        });
      dispatch(
        getAudit({
          type: currentTabRef.current,
          page: 1,
        }),
      );
      return () => {
        fetchingRef.current = false;
        setIsFetchingMore(false);
      };
    }, [dispatch]),
  );

  const handleOpenDrawer = () => {
    navigation.openDrawer();
  };

  const handleTabChange = (tab: 'viewed' | 'activity') => {
    if (activeTab === tab) {
      return;
    }
    currentPageRef.current = 1;
    lastRequestedPageRef.current = null;
    fetchingRef.current = false;
    currentTabRef.current = tab;
    setIsFetchingMore(false);
    dispatch(resetAuditData());
    dispatch(setActiveTab(tab));
    dispatch(
      getAudit({
        type: tab,
        page: 1,
      }),
    );
  };

  const handleOnSelectProject = (id: string, name?: string) => {
    if (!id) {
      return;
    }
    if (name) {
      dispatch(getProjectName(name));
    }
    stackNavigation.navigate('projectDetails', {
      projectId: id,
      projectName: name ?? '',
    });
  };

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
        type: activeTab,
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
  }, [activeTab, activities.length, loading, meta, dispatch]);

  const handleViewAll = () => {
    const params = { include_sprints: include_sprints };
    dispatch(getAllProjectInfo(params));
    setProjectSheetVisible(true);
  };

  const handleListNavigation = (item: Activity) => {
    const resourceType = item?.resource_type?.toLowerCase();

    if (resourceType === 'project' || resourceType === 'sprint') {
      const projectId = item?.project_id?.toString() || item?.id?.toString();
      if (!projectId) return;
      handleOnSelectProject(projectId, item?.project_name);
    } else if (resourceType === 'user_story' || resourceType === 'userstory') {
      stackNavigation.navigate('issue', {
        projectId: item?.project_id,
        userStoryId: item?.resource_id,
        story: item,
      });
    } else if (resourceType === 'task') {
      stackNavigation.navigate('issue', {
        projectId: item?.project_id,
        taskId: item?.resource_id,
        task: item,
      });
    } else {
      return;
    }
  };

  const renderRecentProjectsHeader = () => (
    <View
      style={{
        gap: layout.elementGap,
        paddingTop: layout.elementGap,
        marginBottom: layout.elementGap,
      }}
    >
      <View
        className='flex-row items-center justify-between'
        style={{ marginBottom: layout.tightGap }}
      >
        <AppText
          variant='caption'
          className='font-bold tracking-wider'
          color={colors.textSecondary}
        >
          RECENT PROJECTS
        </AppText>
        <TouchableOpacity activeOpacity={0.7} onPress={handleViewAll}>
          <AppText
            variant='caption'
            className='font-semibold'
            color={colors.primary}
          >
            View all
          </AppText>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: layout.mediumGap }}
      >
        {isRecentLoading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <View
              key={`recent_skeleton_${idx}`}
              style={{ width: moderateScale(200) }}
            >
              <RecentProjectsSkeleton />
            </View>
          ))
        ) : recentProjects && recentProjects.length > 0 ? (
          recentProjects.map((proj: any) => {
            const projectId = proj.project_id || proj.id;
            const projectName = proj.project_name || proj.name || 'Untitled';
            const projectStatus = proj.status
              ? proj.status.replace('_', ' ')
              : '';
            const projectRole = proj.role ? proj.role.replace('_', ' ') : '';

            return (
              <TouchableOpacity
                key={projectId}
                activeOpacity={0.8}
                onPress={() => handleOnSelectProject(projectId, projectName)}
                className='flex-row items-center rounded-xl border p-3'
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  width: moderateScale(200),
                  gap: layout.elementGap,
                }}
              >
                <View
                  className='mr-3.5 items-center justify-center rounded-lg'
                  style={{
                    width: moderateScale(30),
                    height: moderateScale(30),
                    backgroundColor: colors.surface,
                  }}
                >
                  <WorkItemIcon type='project' size={moderateScale(20)} />
                </View>
                <View className='flex-1'>
                  <AppText
                    variant='body'
                    style={{
                      fontSize: moderateScale(15),
                      lineHeight: moderateScale(20),
                    }}
                    className='font-bold capitalize'
                    color={colors.text}
                    numberOfLines={1}
                  >
                    {projectName}
                  </AppText>
                  <AppText
                    variant='caption'
                    color={colors.textSecondary}
                    numberOfLines={1}
                    className='capitalize'
                  >
                    {projectStatus}
                    {projectStatus && projectRole ? ' • ' : ''}
                    {projectRole}
                  </AppText>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View className='py-2'>
            <AppText variant='caption' color={colors.textSecondary}>
              No recent projects
            </AppText>
          </View>
        )}
      </ScrollView>
    </View>
  );

  const renderStickyTabsHeader = () => (
    <View
      style={{
        backgroundColor: colors.surface,
        paddingTop: layout.tightGap,
        paddingBottom: layout.tightGap,
        marginBottom: layout.elementGap,
      }}
    >
      <View style={{ marginBottom: layout.elementGap }}>
        <View
          className='flex-row rounded-full border p-1'
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleTabChange('viewed')}
            className='flex-1 items-center rounded-full py-1.5'
            style={{
              backgroundColor:
                activeTab === 'viewed' ? colors.primary : 'transparent',
            }}
          >
            <AppText
              variant='caption'
              className='font-semibold'
              color={
                activeTab === 'viewed' ? colors.white : colors.textSecondary
              }
            >
              Viewed
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleTabChange('activity')}
            className='flex-1 items-center rounded-full py-1.5'
            style={{
              backgroundColor:
                activeTab === 'activity' ? colors.primary : 'transparent',
            }}
          >
            <AppText
              variant='caption'
              className='font-semibold'
              color={
                activeTab === 'activity' ? colors.white : colors.textSecondary
              }
            >
              Activity
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
      <View className='flex-row items-center justify-between'>
        <AppText
          variant='caption'
          className='font-bold tracking-wider'
          color={colors.textSecondary}
        >
          TODAY
        </AppText>
        {project && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (!project) return;
              const projectId =
                project?.id?.toString() || (project as any)?._id?.toString();
              if (projectId) {
                handleOnSelectProject(projectId, project?.name);
              }
            }}
            className='flex-row items-center rounded-full border px-3 py-1.5 shadow-sm'
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.primary,
              gap: 6,
            }}
          >
            <Ionicons
              name='briefcase-outline'
              size={moderateScale(13)}
              color={colors.primary}
            />
            <AppText
              variant='caption'
              className='font-bold capitalize'
              color={colors.primary}
              numberOfLines={1}
              style={{ maxWidth: moderateScale(140) }}
            >
              {project?.name}
            </AppText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderActivityItem = ({ item }: { item: any }) => {
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
        onPress={() => handleListNavigation(item)}
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

  const renderViewedItem = ({ item }: { item: any }) => {
    const title =
      item.title ||
      item.name ||
      item.details ||
      (item.action ? formatAction(item.action) : 'Viewed Item');
    const resourceType = item.resource_type || item.type || 'task';
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        className='mb-3 rounded-2xl border p-4'
        style={{
          backgroundColor: colors.background,
          borderColor: colors.border,
        }}
        onPress={() => handleListNavigation(item)}
      >
        <View className='flex-row items-center'>
          <View
            className='mr-3.5 items-center justify-center rounded-lg'
            style={{
              width: moderateScale(30),
              height: moderateScale(30),
              backgroundColor: colors.surface,
            }}
          >
            <WorkItemIcon type={resourceType} size={moderateScale(20)} />
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
            <View className='flex-row items-center' style={{ gap: 4 }}>
              <AppText
                variant='caption'
                className='font-medium'
                color={colors.textSecondary}
                style={{ fontSize: moderateScale(11) }}
              >
                {resourceType}
              </AppText>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const listData = [
    { id: 'RECENT_PROJECTS_HEADER', type: 'header_recent' },
    { id: 'TABS_HEADER', type: 'header_tabs' },
    ...(activities.length === 0 && !loading
      ? [{ id: 'EMPTY_STATE', type: 'empty' }]
      : activities),
  ];

  const renderListItem = ({ item }: { item: any }) => {
    if (item.type === 'header_recent') {
      return renderRecentProjectsHeader();
    }
    if (item.type === 'header_tabs') {
      return renderStickyTabsHeader();
    }
    if (item.type === 'empty') {
      return (
        <View className='items-center justify-center py-10'>
          <AppText variant='body' color={colors.textSecondary}>
            {activeTab === 'viewed'
              ? 'No recently viewed items'
              : 'No recent activity'}
          </AppText>
        </View>
      );
    }

    return activeTab === 'viewed'
      ? renderViewedItem({ item })
      : renderActivityItem({ item });
  };

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <CommonHeader
        variant='home'
        titleAlignment='center'
        onDrawerPress={handleOpenDrawer}
        onRightActionPress={() => {}}
      />

      {!loading && activities.length !== 0 ? (
        <View style={{ paddingHorizontal: layout.paddingHorizontal }}>
          {renderRecentProjectsHeader()}
          {renderStickyTabsHeader()}
          <View className='mt-4'>
            <ListSkeleton
              count={5}
              containerStyle={{
                gap: isSmallHeight
                  ? layout.sectionGap + 2
                  : layout.elementGap - 2,
              }}
              renderItem={() => <ProjectCardSkeleton />}
            />
          </View>
        </View>
      ) : (
        <FlatList
          data={listData}
          stickyHeaderIndices={[1]}
          keyExtractor={(item: any, index: number) => {
            if (item.type === 'header_recent') return 'header_recent';
            if (item.type === 'header_tabs') return 'header_tabs';
            if (item.type === 'empty') return 'empty_state';
            return item.id?.toString() || index.toString();
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: layout.paddingHorizontal,
            paddingBottom: hp(20),
          }}
          renderItem={renderListItem}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.2}
          ListFooterComponent={
            isFetchingMore ? (
              <View className='py-2'>
                <ProjectCardSkeleton />
              </View>
            ) : null
          }
        />
      )}
      <ProjectListBottomSheet
        visible={projectSheetVisible}
        onDismiss={() => setProjectSheetVisible(false)}
        onSelectProject={(id, name) => handleOnSelectProject(id, name)}
      />
    </Screen>
  );
};

export default Home;
