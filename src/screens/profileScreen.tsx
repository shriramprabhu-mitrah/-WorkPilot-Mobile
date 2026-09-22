import React, { useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
// If your project uses Expo instead of a bare RN CLI setup, swap the import
// above for: import LinearGradient from 'expo-linear-gradient';
import {
  useNavigation,
  useFocusEffect,
  DrawerActions,
} from '@react-navigation/native';
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
import { Radius } from '../constants/Radius';
import { getRoleLabel } from '../constants/role';
import { Activity, UserInsights } from '../types/home.type';
import { formatAction, formatDate, getInitials } from '../utils/utils';
import { WorkItemIcon } from '../components/common/getWorkItemIcon';
import ProjectCardSkeleton from '../components/skeleton/ProjectCardSkeleton';
import RecentActivitySkeleton from '../components/skeleton/RecentActivitySkeleton';
import { useGetAuditQuery } from '../store/api/homeApi';
import { useGetUserInsightsQuery } from '../store/api/profileApi';
import { useGetProjectsQuery } from '../store/api/projectApi';
import { FilterChipSkeleton } from '../components/skeleton/filterChipSkeleton';
import { Project } from '../types/project.type';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

// Vibrant palette used to cycle color accents across stats / project chips.
// Falls back gracefully if `colors` from the theme doesn't define these.
const ACCENT_PALETTE = [
  '#7C3AED', // violet
  '#EC4899', // pink
  '#F59E0B', // amber
  '#10B981', // emerald
  '#3B82F6', // blue
  '#EF4444', // red
];

const EMPTY_INSIGHTS: UserInsights = {
  total_assigned: 0,
  in_progress: 0,
  completed: 0,
  completion_percentage: 0,
};

const withOpacity = (hex: string, opacity: number) => {
  if (!hex || !hex.startsWith('#')) return hex;
  const clean = hex.replace('#', '');
  const bigint = parseInt(
    clean.length === 3
      ? clean
          .split('')
          .map(c => c + c)
          .join('')
      : clean,
    16,
  );
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const ProfileScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors, strings } = useTheme();
  const { layout, moderateScale, isSmallHeight, hp } = useAuthLayout();
  const dispatch = useAppDispatch();
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isActivityFullScreen, setIsActivityFullScreen] = useState(false);
  const [isProjectSheetVisible, setIsProjectSheetVisible] = useState(false);
  const [activityPage, setActivityPage] = useState(1);
  const profileIcons = strings.profile?.icons;

  const { user } = useAppSelector(state => state.auth);

  const {
    data: auditResponse,
    isLoading: auditLoading,
    isFetching: auditFetching,
  } = useGetAuditQuery(
    { type: 'activity', page: activityPage },
    {
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
    },
  );

  const { data: insights, isLoading: insightsLoading } =
    useGetUserInsightsQuery(
      {},
      {
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true,
      },
    );

  const { data: projectsResponse, isLoading: projectsLoading } =
    useGetProjectsQuery(
      { page: 1 },
      { refetchOnFocus: true, refetchOnMountOrArgChange: true },
    );

  const activities = auditResponse?.data?.activities ?? [];
  const homeUser = auditResponse?.data?.user ?? null;
  const meta = auditResponse?.meta ?? auditResponse?.data?.pagination ?? null;
  const isFetchingMore = auditFetching && activityPage > 1;
  const stats = getStats(colors, insights ?? EMPTY_INSIGHTS);
  const quickLinks = getQuickLinks(colors, strings);
  const projects = (projectsResponse?.data as Project[] | undefined) ?? [];

  const handleLogoutConfirm = () => {
    setIsLogoutModalVisible(false);
    dispatch(logoutUser());
  };

  useFocusEffect(
    useCallback(() => {
      setActivityPage(1);
    }, []),
  );

  // Navigation to full-screen activity
  const openActivityFullScreen = useCallback(() => {
    setIsActivityFullScreen(true);
  }, []);

  const closeActivityFullScreen = useCallback(() => {
    setIsActivityFullScreen(false);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (auditLoading && activities.length === 0) {
      return;
    }
    if (auditFetching) {
      return;
    }

    const hasNextPage =
      meta?.has_next ??
      (meta?.total_pages !== undefined
        ? activityPage < meta.total_pages
        : true);

    if (!hasNextPage) {
      return;
    }

    setActivityPage(previousPage => previousPage + 1);
  }, [activities.length, auditFetching, auditLoading, activityPage, meta]);

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

  const renderActivityItem = ({
    item,
    index,
  }: {
    item: Activity;
    index: number;
  }) => {
    const activityUser = homeUser || user;
    const userName = activityUser?.name || 'User';
    const actionText = formatAction(item.action);
    const formattedDate = formatDate(item.created_at);
    const resourceType = item.resource_type || 'task';
    const title = item.title || item.details || 'Activity Details';
    const key = item.task_key || item.key || '';
    const accent = ACCENT_PALETTE[index % ACCENT_PALETTE.length];

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        className='mb-3 flex-row overflow-hidden rounded-2xl border'
        style={{
          backgroundColor: colors.background,
          borderColor: colors.border,
        }}
        onPress={() => handleActivityNavigation(item)}
      >
        {/* Colored accent rail */}
        <View style={{ width: 4, backgroundColor: accent }} />

        <View className='flex-1 flex-row items-center p-4'>
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
              <LinearGradient
                colors={[accent, withOpacity(accent, 0.6)]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: moderateScale(40),
                  height: moderateScale(40),
                  borderRadius: moderateScale(20),
                  alignItems: 'center',
                  justifyContent: 'center',
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
              </LinearGradient>
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
              <View
                className='mt-1 self-start rounded-full px-2 py-0.5'
                style={{ backgroundColor: withOpacity(accent, 0.14) }}
              >
                <AppText
                  variant='caption'
                  style={{
                    fontSize: moderateScale(11),
                    color: accent,
                    fontWeight: '600',
                  }}
                  numberOfLines={1}
                >
                  {key}
                </AppText>
              </View>
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
          {auditLoading && activities.length === 0 ? (
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
                !auditLoading ? (
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

  const avatarSize = moderateScale(88);

  // Regular Profile View
  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: isSmallHeight ? hp(20) : hp(12),
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover-photo style gradient header */}
        <View style={{ position: 'relative' }}>
          <View
            style={{
              position: 'relative',
              height: moderateScale(150),
              overflow: 'hidden',
            }}
          >
            {user?.cover_img_url ? (
              <Image
                source={{ uri: user.cover_img_url }}
                resizeMode='cover'
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  transform: [{ scale: 1.2 }],
                }}
              />
            ) : (
              <LinearGradient
                colors={[colors.primary, colors.white, colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
            )}
            {user?.cover_img_url && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.15)',
                }}
              />
            )}
            <View
              style={{
                flex: 1,
                paddingHorizontal: layout.paddingHorizontal,
                paddingTop: layout.paddingTop,
              }}
            >
              <View className='flex-row items-center justify-between'>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.dispatch(DrawerActions.openDrawer())
                  }
                  className='items-center justify-center rounded-full'
                  style={{
                    width: moderateScale(36),
                    height: moderateScale(36),
                    backgroundColor: 'rgba(0,0,0,0.35)',
                  }}
                >
                  <Ionicons
                    name='menu-outline'
                    size={moderateScale(22)}
                    color={colors.white}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('Settings')}
                  className='items-center justify-center rounded-full'
                  style={{
                    width: moderateScale(36),
                    height: moderateScale(36),
                    backgroundColor: 'rgba(0,0,0,0.35)',
                  }}
                >
                  <Ionicons
                    name={
                      (profileIcons?.settings ||
                        'settings-outline') as IoniconName
                    }
                    size={18}
                    color={colors.white}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Floating avatar overlapping the cover edge */}
          <View
            style={{
              position: 'absolute',
              left: layout.paddingHorizontal,
              bottom: -(avatarSize / 2),
            }}
          >
            <View className='relative'>
              <View
                className='items-center justify-center'
                style={{
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: Radius.circle,
                  borderWidth: 4,
                  borderColor: colors.surface,
                  backgroundColor: colors.surface,
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
                  <LinearGradient
                    colors={[colors.accentOrange || '#E03E15', '#7C3AED']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: Radius.circle,
                      alignItems: 'center',
                      justifyContent: 'center',
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
                  </LinearGradient>
                )}
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('updateDetails')}
                className='absolute bottom-0 right-0 items-center justify-center rounded-full border'
                style={{
                  width: moderateScale(28),
                  height: moderateScale(28),
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
          </View>
        </View>

        {/* Name / role / email under the avatar */}
        <View
          style={{
            paddingHorizontal: layout.paddingHorizontal,
            paddingTop: avatarSize / 2 + moderateScale(12),
            marginBottom: layout.sectionGap,
          }}
        >
          <AppText variant='h3' color={colors.text}>
            {user?.name}
          </AppText>
          <View
            className='mt-1 self-start rounded-full px-3 py-1'
            style={{ backgroundColor: withOpacity(colors.primary, 0.12) }}
          >
            <AppText
              variant='caption'
              style={{ color: colors.primary, fontWeight: '600' }}
            >
              {getRoleLabel(user?.role) ||
                strings.profile?.role ||
                'Senior Software Engineer'}
            </AppText>
          </View>
          <AppText
            variant='caption'
            color={colors.textSecondary}
            className='mt-2'
          >
            {user?.email || 'alex.johnson@company.com'}
          </AppText>
        </View>

        {/* Stats Section — colorful tinted cards */}
        <View
          style={{
            marginBottom: layout.sectionGap,
            paddingHorizontal: layout.paddingHorizontal,
          }}
        >
          {insightsLoading ? (
            <View className='flex-row justify-between'>
              {Array.from({ length: 4 }).map((_, idx) => (
                <View
                  key={idx}
                  className='mr-2 flex-1 items-center rounded-2xl py-4'
                  style={{ backgroundColor: colors.border }}
                >
                  <View
                    className='rounded'
                    style={{
                      width: moderateScale(40),
                      height: moderateScale(24),
                      backgroundColor: colors.background,
                    }}
                  />
                  <View
                    className='mt-2 rounded'
                    style={{
                      width: moderateScale(50),
                      height: moderateScale(10),
                      backgroundColor: colors.background,
                    }}
                  />
                </View>
              ))}
            </View>
          ) : (
            <View className='flex-row justify-between'>
              {stats.map((item, idx) => {
                const accent =
                  item.color || ACCENT_PALETTE[idx % ACCENT_PALETTE.length];
                return (
                  <View
                    key={item.label}
                    className='items-center rounded-2xl py-4'
                    style={{
                      flex: 1,
                      marginRight:
                        idx !== stats.length - 1 ? moderateScale(8) : 0,
                      backgroundColor: withOpacity(accent, 0.12),
                    }}
                  >
                    <AppText
                      variant='title'
                      style={{ color: accent, fontWeight: '800' }}
                    >
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
                );
              })}
            </View>
          )}
        </View>

        {/* Projects Section — colorful chips */}
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
              {projects.slice(0, 2).map((projectItem, idx) => {
                const accent = ACCENT_PALETTE[idx % ACCENT_PALETTE.length];
                return (
                  <TouchableOpacity
                    key={projectItem.id}
                    activeOpacity={0.8}
                    className='flex-row items-center rounded-xl px-3 py-2'
                    style={{
                      backgroundColor: withOpacity(accent, 0.12),
                      borderWidth: 1,
                      borderColor: withOpacity(accent, 0.35),
                      maxWidth: moderateScale(150),
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
                        width: moderateScale(20),
                        height: moderateScale(20),
                        backgroundColor: accent,
                      }}
                    >
                      <WorkItemIcon
                        type='project'
                        size={moderateScale(12)}
                        color={colors.white}
                      />
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
                );
              })}
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

          {auditLoading && activities.length === 0 ? (
            <RecentActivitySkeleton />
          ) : activities.length > 0 ? (
            <View>
              {activities.slice(0, 4).map((item: Activity, index: number) => {
                const accent = ACCENT_PALETTE[index % ACCENT_PALETTE.length];
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => handleActivityNavigation(item)}
                    activeOpacity={0.7}
                    className='mb-2 flex-row items-start overflow-hidden rounded-xl'
                    style={{ backgroundColor: withOpacity(accent, 0.08) }}
                  >
                    <View style={{ width: 4, backgroundColor: accent }} />
                    <View className='flex-1 flex-row items-start px-4 py-3'>
                      <View
                        className='mr-3 mt-1 rounded-full'
                        style={{
                          width: moderateScale(8),
                          height: moderateScale(8),
                          backgroundColor: accent,
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
                    </View>
                  </TouchableOpacity>
                );
              })}
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

        {/* Quick Links */}
        <View
          style={{
            marginBottom: layout.sectionGap,
            paddingHorizontal: layout.paddingHorizontal,
          }}
        >
          <View
            className='rounded-2xl'
            style={{ backgroundColor: colors.background }}
          >
            {quickLinks.map((item: QuickLinks, index: number) => {
              const accent =
                item.color || ACCENT_PALETTE[index % ACCENT_PALETTE.length];
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
                  <View
                    className='mr-4 items-center justify-center rounded-xl'
                    style={{
                      width: moderateScale(36),
                      height: moderateScale(36),
                      backgroundColor: withOpacity(accent, 0.14),
                    }}
                  >
                    <Ionicons
                      name={item.iconName as IoniconName}
                      size={18}
                      color={accent}
                    />
                  </View>
                  <AppText
                    variant='body'
                    color={colors.text}
                    className='flex-1 font-medium'
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

        {/* Logout Button — solid gradient danger button */}
        <View style={{ paddingHorizontal: layout.paddingHorizontal }}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setIsLogoutModalVisible(true)}
          >
            <LinearGradient
              colors={[colors.error, '#B91C1C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className='flex-row items-center justify-center gap-2 rounded-xl py-3'
            >
              <Ionicons
                name={
                  (profileIcons?.logout || 'log-out-outline') as IoniconName
                }
                size={18}
                color={colors.white}
              />
              <AppText
                variant='body'
                color={colors.white}
                className='font-semibold'
              >
                {strings.profile?.logout || 'Log out'}
              </AppText>
            </LinearGradient>
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
