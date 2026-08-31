import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View, TouchableOpacity, ScrollView, FlatList } from 'react-native';
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
  syncUserProfile,
  syncOrganizationDetail,
} from '../store/auth_store/reducer/auth.reducer';
import {
  setActiveTab,
  setUser,
} from '../store/home_store/reducer/home.reducer';
import {
  useGetAuditQuery,
  useGetRecentProjectsQuery,
  useGetUserProfileQuery,
  useGetOrganizationDetailQuery,
  useGetFavouritesQuery,
} from '../store/api/homeApi';
import ProjectListBottomSheet from '../components/common/ProjectBottomSheet';
import { getAllProjectInfo } from '../store/project_store/action/project_thunk';
import { getProjectName } from '../store/project_store/reducer/project_reducer';
import { Activity } from '../types/home.type';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigationTypes';
import { formatAction } from '../utils/utils';
import RecentProjectsSkeleton from '../components/skeleton/RecentProjectsSkeleton';
import { WorkItemIcon } from '../components/common/getWorkItemIcon';
import ListSkeleton from '../components/skeleton/ListSkeleton';
import ProjectCardSkeleton from '../components/skeleton/ProjectCardSkeleton';

export const Home: React.FC = () => {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const stackNavigation =
    useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { layout, moderateScale, hp, isSmallHeight } = useAuthLayout();
  const { project, include_sprints } = useAppSelector(state => state.projects);
  const { activeTab } = useAppSelector(state => state.home);

  const [projectSheetVisible, setProjectSheetVisible] = useState(false);
  const currentPageRef = useRef(1);
  const fetchingRef = useRef(false);
  const lastRequestedPageRef = useRef<number | null>(null);
  const currentTabRef = useRef<'viewed' | 'favorites' | 'activity'>(activeTab);
  currentTabRef.current = activeTab;

  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // ── RTK Query: Recent projects ──
  const {
    data: recentProjects,
    isLoading: isRecentLoading,
    refetch: refetchRecentProjects,
  } = useGetRecentProjectsQuery();

  // ── RTK Query: Viewed tab audit data ──
  const [auditPage, setAuditPage] = useState(1);
  const [refetchKey, setRefetchKey] = useState(0);

  const {
    data: auditData,
    isLoading: auditIsLoading,
    isFetching: auditIsFetching,
  } = useGetAuditQuery(
    { type: 'viewed', page: auditPage, _refetchKey: refetchKey },
    { skip: activeTab === 'favorites' },
  );

  const activities = useMemo(
    () => auditData?.data?.activities ?? [],
    [auditData],
  );
  const loading = auditIsLoading;
  const meta = useMemo(() => auditData?.meta ?? null, [auditData]);

  // ── RTK Query: Favorites tab data ──
  const [favoritesPage, setFavoritesPage] = useState(1);
  const [refetchFavoritesKey, setRefetchFavoritesKey] = useState(0);

  const {
    data: favoritesData,
    isLoading: favoritesIsLoading,
    isFetching: favoritesIsFetching,
  } = useGetFavouritesQuery(
    { page: favoritesPage, _refetchKey: refetchFavoritesKey },
    { skip: activeTab !== 'favorites' },
  );

  const boardFavorites = useMemo(
    () => favoritesData?.data?.favorites ?? [],
    [favoritesData],
  );
  const favoritesMeta = useMemo(
    () => favoritesData?.meta ?? null,
    [favoritesData],
  );
  const favoritesTotalTasks = favoritesData?.data?.total_tasks ?? 0;
  const favoritesTotalUserStories =
    favoritesData?.data?.total_user_stories ?? 0;

  // ── RTK Query: Auth data ──
  const { data: userProfileData, refetch: refetchUserProfile } =
    useGetUserProfileQuery();

  const { data: orgDetailData, refetch: refetchOrganizationDetail } =
    useGetOrganizationDetailQuery();

  // Sync auth data to Redux
  useEffect(() => {
    if (userProfileData?.data) {
      dispatch(syncUserProfile(userProfileData.data));
    }
  }, [userProfileData?.data, dispatch]);

  useEffect(() => {
    if (orgDetailData?.data) {
      dispatch(syncOrganizationDetail(orgDetailData.data));
    }
  }, [orgDetailData?.data, dispatch]);

  // Sync user data from RTK Query to Redux for other screens
  useEffect(() => {
    if (auditData?.data?.user) {
      dispatch(setUser(auditData.data.user));
    }
  }, [auditData?.data?.user, dispatch]);

  // Pagination loading indicator
  const showPaginationLoader =
    isFetchingMore ||
    (activeTab === 'viewed' && auditIsFetching && auditPage > 1) ||
    (activeTab === 'favorites' && favoritesIsFetching && favoritesPage > 1);

  const isMainListLoading =
    (activeTab === 'favorites' &&
      favoritesIsLoading &&
      boardFavorites.length === 0) ||
    (activeTab === 'viewed' && loading && activities.length === 0);

  useFocusEffect(
    useCallback(() => {
      currentPageRef.current = 1;
      lastRequestedPageRef.current = null;
      fetchingRef.current = false;
      setIsFetchingMore(false);

      refetchUserProfile();
      refetchOrganizationDetail();
      refetchRecentProjects();

      if (currentTabRef.current === 'favorites') {
        setFavoritesPage(1);
        setRefetchFavoritesKey(prev => prev + 1);
      } else {
        // RTK Query: reset page and trigger refetch via key change
        setAuditPage(1);
        setRefetchKey(prev => prev + 1);
      }

      return () => {
        fetchingRef.current = false;
        setIsFetchingMore(false);
      };
    }, [dispatch]),
  );

  const handleOpenDrawer = () => {
    navigation.openDrawer();
  };

  const handleTabChange = (tab: 'viewed' | 'favorites') => {
    if (activeTab === tab) {
      return;
    }
    currentPageRef.current = 1;
    lastRequestedPageRef.current = null;
    fetchingRef.current = false;
    currentTabRef.current = tab;
    setIsFetchingMore(false);

    dispatch(setActiveTab(tab));

    if (tab === 'favorites') {
      setFavoritesPage(1);
      setRefetchFavoritesKey(prev => prev + 1);
    } else {
      // RTK Query: reset page and trigger refetch via key change
      setAuditPage(1);
      setRefetchKey(prev => prev + 1);
    }
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
    const isFav = activeTab === 'favorites';

    // Guard against concurrent fetches
    if (isFav) {
      if (favoritesIsFetching) {
        return;
      }
    } else {
      if (auditIsFetching) {
        return;
      }
    }

    const currentList = isFav ? boardFavorites : activities;
    const currentMeta = isFav ? favoritesMeta : meta;

    if (currentList.length === 0) {
      return;
    }

    const currentPage = isFav ? favoritesPage : auditPage;

    const hasNextPage =
      currentMeta?.has_next !== undefined
        ? currentMeta.has_next
        : currentMeta?.total_pages !== undefined
          ? currentPage < currentMeta.total_pages
          : false;

    if (!hasNextPage) {
      return;
    }

    const nextPage = currentPage + 1;
    if (lastRequestedPageRef.current === nextPage) {
      return;
    }

    lastRequestedPageRef.current = nextPage;

    if (isFav) {
      setFavoritesPage(nextPage);
      currentPageRef.current = nextPage;
    } else {
      // RTK Query: update page — the hook handles the fetch and merge
      setAuditPage(nextPage);
      currentPageRef.current = nextPage;
    }
  }, [
    activeTab,
    activities,
    meta,
    auditPage,
    auditIsFetching,
    boardFavorites,
    favoritesIsFetching,
    favoritesPage,
    favoritesMeta,
    dispatch,
  ]);

  const handleViewAll = () => {
    dispatch(getAllProjectInfo({ include_sprints }));
    setProjectSheetVisible(true);
  };

  const handleListNavigation = (item: Activity) => {
    const resourceType =
      item?.resource_type?.toLowerCase() ||
      (item as any)?.item_type?.toLowerCase() ||
      (item as any)?.type?.toLowerCase();

    const targetProjectId =
      item?.project_id || (item as any)?.projectId || (project as any)?.id;

    if (resourceType === 'project' || resourceType === 'sprint') {
      const projectId = item?.project_id?.toString() || item?.id?.toString();
      if (!projectId) return;
      handleOnSelectProject(projectId, item?.project_name);
    } else if (resourceType === 'user_story' || resourceType === 'userstory') {
      const userStoryId = item?.resource_id || item?.user_story_id || item?.id;
      stackNavigation.navigate('issue', {
        projectId: targetProjectId,
        userStoryId: userStoryId,
        story: item,
        storyName: item?.title || item?.user_story_name, // <-- Pass as 'story' to match RootStackParamList definition
      });
    } else if (resourceType === 'task') {
      const taskId = item?.resource_id || item?.task_id || item?.id;
      const userStoryId = item?.user_story_id;
      stackNavigation.navigate('issue', {
        projectId: targetProjectId,
        userStoryId: userStoryId,
        taskId: taskId,
        task: item,
        taskName: item?.title || item?.task_name,
      });
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
            className='flex-1 flex-row items-center justify-center rounded-full py-1.5'
            style={{
              backgroundColor:
                activeTab === 'viewed' ? colors.primary : 'transparent',
              gap: 6,
            }}
          >
            <Ionicons
              name={activeTab === 'viewed' ? 'eye' : 'eye-outline'}
              size={moderateScale(16)}
              color={
                activeTab === 'viewed' ? colors.white : colors.textSecondary
              }
            />
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
            onPress={() => handleTabChange('favorites')}
            className='flex-1 flex-row items-center justify-center rounded-full py-1.5'
            style={{
              backgroundColor:
                activeTab === 'favorites' ? colors.primary : 'transparent',
              gap: 6,
            }}
          >
            <Ionicons
              name={activeTab === 'favorites' ? 'star' : 'star-outline'}
              size={moderateScale(16)}
              color={
                activeTab === 'favorites' ? '#FFD700' : colors.textSecondary
              }
            />
            <AppText
              variant='caption'
              className='font-semibold'
              color={
                activeTab === 'favorites' ? colors.white : colors.textSecondary
              }
            >
              Favorites
            </AppText>
          </TouchableOpacity>
        </View>
      </View>

      <View className='flex-row items-center justify-between'>
        {activeTab !== 'favorites' && (
          <AppText
            variant='caption'
            className='font-bold tracking-wider'
            color={colors.textSecondary}
          >
            TODAY
          </AppText>
        )}
        {activeTab === 'favorites' && (
          <View
            className='flex-row items-center rounded-full border px-3 py-2'
            style={{
              backgroundColor: colors.background,
              borderColor: colors.border,
              gap: 8,
            }}
          >
            <View className='flex-row items-center' style={{ gap: 4 }}>
              <WorkItemIcon type='task' size={moderateScale(12)} />
              <AppText
                variant='caption'
                className='font-bold'
                color={colors.text}
                style={{ fontSize: moderateScale(11) }}
              >
                {favoritesTotalTasks}
              </AppText>
            </View>

            <View
              style={{
                width: 1,
                height: moderateScale(10),
                backgroundColor: colors.border,
              }}
            />

            <View className='flex-row items-center' style={{ gap: 4 }}>
              <WorkItemIcon type='user_story' size={moderateScale(12)} />
              <AppText
                variant='caption'
                className='font-bold'
                color={colors.text}
                style={{ fontSize: moderateScale(11) }}
              >
                {favoritesTotalUserStories}
              </AppText>
            </View>
          </View>
        )}
        {project && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              const projectId =
                project?.id?.toString() || (project as any)?._id?.toString();
              if (projectId) {
                handleOnSelectProject(projectId, project?.name);
              }
            }}
            className='flex-row items-center rounded-full border px-3 py-1.5 shadow-sm'
            style={{
              backgroundColor: colors.background,
              borderColor: colors.border,
              gap: 6,
            }}
          >
            <WorkItemIcon type='project' size={moderateScale(12)} />
            <AppText
              variant='caption'
              className='font-bold capitalize'
              color={colors.text}
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

  const renderItemCard = ({ item }: { item: any }) => {
    const title =
      item.title ||
      item.name ||
      item.details ||
      (item.action ? formatAction(item.action) : 'Activity Item');
    const resourceType =
      item.resource_type || item.type || item.item_type || 'task';

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
    ...(activeTab === 'favorites' &&
    favoritesIsLoading &&
    boardFavorites.length === 0
      ? []
      : activeTab === 'favorites' &&
          boardFavorites.length === 0 &&
          !favoritesIsLoading
        ? [{ id: 'EMPTY_STATE', type: 'empty' }]
        : activeTab === 'favorites'
          ? boardFavorites
          : activities.length === 0 && !loading
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
              : 'No favorites'}
          </AppText>
        </View>
      );
    }
    return renderItemCard({ item });
  };
  const handleSelectSearch = () => {
    stackNavigation.navigate('Search');
  };

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <CommonHeader
        variant='home'
        titleAlignment='center'
        onDrawerPress={handleOpenDrawer}
        onSearchPress={handleSelectSearch}
        onRightActionPress={() => {}}
      />

      {isMainListLoading ? (
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
            showPaginationLoader ? (
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
