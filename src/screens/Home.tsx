import React, { useCallback, useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerParamList } from '../navigation/DrawerNavigator';
import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import { CommonHeader } from '../components/common/CommonHeader';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { VIEWED_DATA } from '../data/newHomeData';
import { useAppDispatch, useAppSelector } from '../store';
import {
  getOrganizationDetail,
  getUserProfileInfo,
} from '../store/auth_store/action/auth.thunks';
import {
  setActiveTab,
  setLoading,
} from '../store/home_store/reducer/home.reducer';
import ListSkeleton from '../components/skeleton/ListSkeleton';
import ProjectCardSkeleton from '../components/skeleton/ProjectCardSkeleton';
import { WorkItemIcon } from '../components/common/getWorkItemIcon';
import { getActivity } from '../store/home_store/action/home.thunk';

// Static Data for Recent Projects
const RECENT_PROJECTS_DATA = [
  {
    id: '1',
    name: 'Mobile App Redesign',
    category: 'Software',
    key: 'MAR',
  },
  {
    id: '2',
    name: 'Marketing Campaign',
    category: 'Business',
    key: 'MC',
  },
  {
    id: '3',
    name: 'Backend API Migration',
    category: 'Engineering',
    key: 'BAM',
  },
  {
    id: '4',
    name: 'UI Design System',
    category: 'Design',
    key: 'UDS',
  },
];

// Helper function to extract initials from user/project name
const getInitials = (name?: string): string => {
  if (!name) return 'U';
  const words = name.trim().split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Helper function to format API ISO dates into "13 Aug 2026"
const formatDate = (isoString?: string): string => {
  if (!isoString) return 'Recently';
  try {
    const date = new Date(isoString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return 'Recently';
  }
};

// Helper function to clean up API action names (e.g. project_created -> created)
const formatAction = (action?: string): string => {
  if (!action) return 'updated';
  return action.replace(/^project_|^task_|^tasks_/, '').replace(/_/g, ' ');
};

export const Home: React.FC = () => {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { layout, moderateScale, hp, isSmallHeight } = useAuthLayout();

  const { user } = useAppSelector(state => state.auth);
  const { userActivities, activeTab, loading } = useAppSelector(
    state => state.home,
  );

  // Pagination state for activities
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useFocusEffect(
    useCallback(() => {
      dispatch(getUserProfileInfo());
      dispatch(getOrganizationDetail());
      dispatch(getActivity({ page: 1 }));

      dispatch(setLoading(true));
      const timer = setTimeout(() => {
        dispatch(setLoading(false));
      }, 1000);

      return () => clearTimeout(timer);
    }, [dispatch]),
  );

  const handleOpenDrawer = () => {
    navigation.openDrawer();
  };

  // Pagination Handler
  const handleLoadMore = () => {
    if (activeTab === 'activity' && hasMore && !isFetchingMore && !loading) {
      setIsFetchingMore(true);
      const nextPage = page + 1;
      dispatch(getActivity({ page: nextPage }))
        .unwrap()
        .then((res: any) => {
          if (!res?.activities || res?.activities?.length === 0) {
            setHasMore(false);
          } else {
            setPage(nextPage);
          }
        })
        .catch(() => setHasMore(false))
        .finally(() => setIsFetchingMore(false));
    }
  };

  /* Render Header Section containing Recent Projects & Tabs */
  const renderHeader = () => (
    <View
      style={{
        gap: layout.sectionGap,
        paddingTop: layout.elementGap,
        marginBottom: layout.elementGap,
      }}
    >
      {/* ================= RECENT PROJECTS SECTION ================= */}
      <View style={{ gap: layout.elementGap }}>
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
          <TouchableOpacity activeOpacity={0.7}>
            <AppText
              variant='caption'
              className='font-semibold'
              color={colors.primary}
            >
              View all
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Horizontal List of Projects */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: layout.mediumGap }}
        >
          {RECENT_PROJECTS_DATA.map(project => (
            <TouchableOpacity
              key={project.id}
              activeOpacity={0.8}
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
                  {getInitials(project.name)}
                </AppText>
              </View>

              <View className='flex-1'>
                <AppText
                  variant='body'
                  className='font-semibold'
                  color={colors.text}
                  numberOfLines={1}
                >
                  {project.name}
                </AppText>
                <AppText
                  variant='caption'
                  color={colors.textSecondary}
                  numberOfLines={1}
                >
                  {project.category} • {project.key}
                </AppText>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ================= SEGMENTED TAB CONTROL ================= */}
      <View style={{ marginBottom: layout.tightGap }}>
        <View
          className='flex-row rounded-full border p-1'
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => dispatch(setActiveTab('viewed'))}
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
            onPress={() => dispatch(setActiveTab('activity'))}
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

      {/* Section Sub-header */}
      <View>
        <AppText
          variant='caption'
          className='font-bold tracking-wider'
          color={colors.textSecondary}
        >
          TODAY
        </AppText>
      </View>
    </View>
  );

  /* Render Single Activity Item matched with design */
  const renderActivityItem = ({ item }: { item: any }) => {
    // Determine user details from API response or store
    const activityUser = userActivities?.user || user;
    const userName = activityUser?.name || 'User';
    const userInitials = getInitials(userName);
    const actionText = formatAction(item.action);
    const formattedDate = formatDate(item.created_at);
    const resourceType = item.resource_type || 'task';

    // Dynamic field extraction from API
    const title = item.title || item.details || 'Activity Details';
    const key = item.task_key || '';

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
          {/* Left Avatar with Overlaid Type Badge */}
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

            {/* Type Badge Over Avatar */}
            <View
              className='absolute -bottom-1 -right-1 items-center justify-center rounded border'
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                padding: 1.5,
              }}
            >
              <WorkItemIcon
                type={resourceType}
                size={moderateScale(11)}
                color={colors.primary}
              />
            </View>
          </View>

          {/* Right Text Details Column */}
          <View className='flex-1 justify-center'>
            {/* Header Line (Displays: Name action resource_type • Date) */}
            <AppText
              variant='caption'
              color={colors.textSecondary}
              style={{ fontSize: moderateScale(11), marginBottom: 2 }}
              numberOfLines={1}
            >
              {userName} {actionText} {resourceType} • {formattedDate}
            </AppText>

            {/* Title Line */}
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

            {/* Sub-text line (Key) */}
            {key ? (
              <AppText
                variant='caption'
                color={colors.textSecondary}
                style={{ fontSize: moderateScale(12), marginTop: 2 }}
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

  /* Render Single Viewed Item */
  const renderViewedItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      className='mb-2 flex-row items-center rounded-lg px-2 py-2.5'
      style={{ backgroundColor: colors.background }}
    >
      <View
        className='mr-3 items-center justify-center rounded-lg border'
        style={{
          width: moderateScale(32),
          height: moderateScale(32),
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        <WorkItemIcon
          type={item.type}
          size={moderateScale(16)}
          color={colors.text}
        />
      </View>
      <View className='flex-1'>
        <AppText
          variant='body'
          className='font-medium'
          color={colors.text}
          numberOfLines={1}
        >
          {item.title}
        </AppText>
        <AppText
          variant='caption'
          color={colors.textSecondary}
          numberOfLines={1}
        >
          {item.key
            ? item.key
            : item.projectName
              ? `${item.category} • in ${item.projectName}`
              : item.category}
        </AppText>
      </View>
    </TouchableOpacity>
  );

  const listData =
    activeTab === 'viewed' ? VIEWED_DATA : userActivities?.activities || [];

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <CommonHeader
        variant='home'
        titleAlignment='center'
        onDrawerPress={handleOpenDrawer}
        onRightActionPress={() => {}}
      />

      {loading ? (
        <View style={{ paddingHorizontal: layout.paddingHorizontal }}>
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
          data={listData}
          keyExtractor={(item, index) =>
            item.id?.toString() || index.toString()
          }
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{
            paddingHorizontal: layout.paddingHorizontal,
            paddingBottom: isSmallHeight ? hp(20) : hp(20),
          }}
          renderItem={
            activeTab === 'viewed' ? renderViewedItem : renderActivityItem
          }
          /* Pagination Props */
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingMore ? (
              <View className='items-center justify-center py-4'>
                <ActivityIndicator size='small' color={colors.primary} />
              </View>
            ) : null
          }
        />
      )}
    </Screen>
  );
};

export default Home;
