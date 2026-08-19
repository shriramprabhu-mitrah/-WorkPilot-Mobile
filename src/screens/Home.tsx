import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
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
  getProjectById,
  getRecentProjects,
  getSprintByIdThunk,
  getSprintsThunk,
} from '../store/project_store/action/project_thunk';
import { Sprint } from '../types/project.type';
import { getProjectName } from '../store/project_store/reducer/project_reducer';

const getInitials = (name?: string): string => {
  if (!name) {
    return 'U';
  }
  const words = name.trim().split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const formatDate = (isoString?: string): string => {
  if (!isoString) {
    return 'Recently';
  }
  try {
    const date = new Date(isoString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', {
      month: 'short',
    });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return 'Recently';
  }
};

const formatAction = (action?: string): string => {
  if (!action) {
    return 'viewed';
  }
  return action
    .replace(/^project_|^task_|^tasks_|^sprint_/, '')
    .replace(/_/g, ' ');
};

export const Home: React.FC = () => {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { layout, moderateScale, hp, isSmallHeight } = useAuthLayout();
  const { user } = useAppSelector(state => state.auth);
  const { project, projects, recentProjects, include_sprints, sprints } =
    useAppSelector(state => state.projects);
  const {
    activities,
    user: homeUser,
    activeTab,
    loading,
    meta,
  } = useAppSelector(state => state.home);

  const [projectSheetVisible, setProjectSheetVisible] = useState(false);
  const [isRecentLoading, setIsRecentLoading] = useState(true);

  const currentPageRef = useRef(1);
  const fetchingRef = useRef(false);
  const lastRequestedPageRef = useRef<number | null>(null);
  const currentTabRef = useRef<'viewed' | 'activity'>(activeTab);
  currentTabRef.current = activeTab;

  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Safe navigation helper function aligned with CustomDrawerContent
  const handleNavigation = (routeName: string) => {
    if (navigation && typeof (navigation as any).navigate === 'function') {
      (navigation as any).navigate(routeName);
    }
  };

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
    }, [dispatch]), // Removed activeTab to avoid re-triggering when changing tabs
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

    // Fetch audit logs for the newly selected tab directly
    dispatch(
      getAudit({
        type: tab,
        page: 1,
      }),
    );
  };

  const handleOnSelectProject = async (id: string, name: string) => {
    if (!id) {
      return;
    }

    // 1. Dispatch project name & navigate immediately
    dispatch(getProjectName(name));
    handleNavigation('projectDetails');

    // 2. Fetch API data asynchronously in the background
    try {
      const [, sprintsData] = await Promise.all([
        dispatch(getProjectById({ projectId: id })).unwrap(),
        dispatch(getSprintsThunk({ project_id: id })).unwrap(),
      ]);

      // Bypasses strict interface checks to safely extract sprint array properties
      const response = sprintsData as any;
      const projectSprints: Sprint[] = Array.isArray(response)
        ? response
        : response?.data || response?.items || [];

      if (projectSprints.length > 0) {
        const activeSprint = projectSprints.find(
          (s: any) => s.status === 'active',
        );
        const targetSprint =
          activeSprint || projectSprints[projectSprints.length - 1];

        const sprintId =
          targetSprint?.id?.toString() ||
          (targetSprint as any)?._id?.toString();

        if (sprintId) {
          await dispatch(
            getSprintByIdThunk({
              project_id: id,
              sprint_id: sprintId,
            }),
          ).unwrap();
        }
      }
    } catch (error) {
      console.error('Failed to fetch project details:', error);
    }
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

  const renderHeader = () => (
    <View
      style={{
        gap: layout.sectionGap,
        paddingTop: layout.elementGap,
        marginBottom: layout.elementGap,
      }}
    >
      {/* Recent Projects */}
      <View
        style={{
          gap: layout.elementGap,
        }}
      >
        <View
          className='flex-row items-center justify-between'
          style={{
            marginBottom: layout.tightGap,
          }}
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
          contentContainerStyle={{
            gap: layout.mediumGap,
          }}
        >
          {isRecentLoading ? (
            <View
              className='flex-row items-center justify-center rounded-xl border p-3'
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border,
                width: moderateScale(200),
                height: moderateScale(64),
              }}
            >
              <ActivityIndicator size='small' color={colors.primary} />
            </View>
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
                    className='items-center justify-center rounded-lg'
                    style={{
                      width: moderateScale(40),
                      height: moderateScale(40),
                      backgroundColor: colors.primary,
                    }}
                  >
                    <AppText
                      className='font-bold'
                      style={{
                        fontSize: moderateScale(14),
                        color: colors.white,
                      }}
                    >
                      {getInitials(projectName)}
                    </AppText>
                  </View>

                  <View className='flex-1'>
                    <AppText
                      variant='body'
                      className='font-semibold'
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

      {/* Tabs */}
      <View
        style={{
          marginBottom: layout.tightGap,
        }}
      >
        <View
          className='flex-row rounded-full border p-1'
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          {/* Viewed */}
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

          {/* Activity */}
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

      {/* Today Header & Clickable Current Project Chip */}
      <View className='flex-row items-center justify-between'>
        <AppText
          variant='caption'
          className='font-bold tracking-wider'
          color={colors.textSecondary}
        >
          TODAY
        </AppText>

        {/* Interactive Current Project Chip */}
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
              className='font-bold'
              color={colors.primary}
              numberOfLines={1}
              style={{ maxWidth: moderateScale(140) }}
            >
              {project?.name || 'Select Project'}
            </AppText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderActivityItem = ({ item }: { item: any }) => {
    const activityUser = homeUser || user;
    const userName = activityUser?.name || 'User';
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
        // onPress =
        style={{
          backgroundColor: colors.background,
          borderColor: colors.border,
        }}
      >
        <View className='flex-row items-center'>
          <View className='relative mr-3.5 self-center'>
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

            <View
              className='absolute -bottom-1 -right-1 items-center justify-center rounded border'
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                padding: 2,
              }}
            >
              <WorkItemIcon
                type={resourceType}
                size={moderateScale(11)}
                // color={colors.primary}
              />
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
              {userName} {actionText} {resourceType} • {formattedDate}
            </AppText>

            <AppText
              variant='body'
              className='font-bold'
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
              className='font-bold'
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

            <View
              className='flex-row items-center'
              style={{
                gap: 4,
              }}
            >
              {/* <WorkItemIcon
                type={resourceType}
                size={moderateScale(12)}
                color={colors.textSecondary}
              /> */}
              <AppText
                variant='caption'
                className='font-medium capitalize'
                color={colors.textSecondary}
                style={{
                  fontSize: moderateScale(11),
                }}
              >
                {resourceType}
              </AppText>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <CommonHeader
        variant='home'
        titleAlignment='center'
        onDrawerPress={handleOpenDrawer}
        onRightActionPress={() => {}}
      />

      {/* Initial loading */}
      {loading && activities.length === 0 ? (
        <View
          style={{
            paddingHorizontal: layout.paddingHorizontal,
          }}
        >
          {renderHeader()}

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
          data={activities}
          keyExtractor={(item, index) =>
            item.id?.toString() || index.toString()
          }
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{
            paddingHorizontal: layout.paddingHorizontal,
            paddingBottom: hp(20),
          }}
          renderItem={
            activeTab === 'viewed' ? renderViewedItem : renderActivityItem
          }
          ListEmptyComponent={
            <View className='items-center justify-center py-10'>
              <AppText variant='body' color={colors.textSecondary}>
                {activeTab === 'viewed'
                  ? 'No recently viewed items'
                  : 'No recent activity'}
              </AppText>
            </View>
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.2}
          ListFooterComponent={
            isFetchingMore ? (
              <View className='items-center justify-center py-4'>
                <ActivityIndicator size='small' color={colors.primary} />
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
