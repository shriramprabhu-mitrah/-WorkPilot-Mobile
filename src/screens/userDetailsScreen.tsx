import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Image, Modal, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import CommonHeader from '../components/common/CommonHeader';
import Screen from '../components/common/ScreenWapper';
import BoardFilterModal, { SelectedFilters } from '../components/filterModal';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import {
  useGetCustomStatusQuery,
  useGetProjectMembersQuery,
  useLazyGetUserByIdQuery,
} from '../store/api/projectApi';
import { useGetTasksQuery } from '../store/api/userStoryApi';
import { UserAssignedProject, Task } from '../types/project.type';
import { RootStackParamList } from '../types/navigationTypes';
import { CustomStatus } from '../types/customstatus.type';
import { ProjectStatus, STATUS_LABELS, getValidStatus } from '../utils/enum';
import UserProfileCard, {
  UserProfileData,
} from '../components/userProfileCard';
import {
  UserDetailsFilterBar,
  UserDetailsSearchBar,
} from '../components/userDetailsControls';
import UserItemCard from '../components/userItemCard';
import { UserDetailsSkeleton } from '../components/skeleton/userDetailsSkeleton';
import Ionicons from '@react-native-vector-icons/ionicons';
import { AppText } from '../components';
import { skipToken } from '@reduxjs/toolkit/query';
import { ACCENT_PALETTE } from '../utils/utils';

const UserDetailsScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'userDetail'>>();
  const { colors } = useTheme();
  const { layout, moderateScale } = useAuthLayout();
  const insets = useSafeAreaInsets();

  const userId = route.params?.userId;
  const projectId = route.params?.projectId;
  const isProjectContext = Boolean(projectId);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isImagePreviewVisible, setIsImagePreviewVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    assignee: [],
    status: [],
    priority: [],
    work_type: [],
  });
  const [page, setPage] = useState(1);
  const requestedTaskPage = useRef(1);
  const requestIdRef = useRef(0);

  const [
    getUserById,
    {
      currentData: userResponse,
      isLoading: isProjectLoading,
      isFetching: isUserFetching,
    },
  ] = useLazyGetUserByIdQuery();

  const { currentData: membersResponse, refetch: refetchMembers } =
    useGetProjectMembersQuery(
      projectId
        ? {
            project_id: projectId,
            user_id: userId,
          }
        : skipToken,
    );

  const {
    currentData: tasksResponse,
    isLoading: isTaskLoading,
    isFetching: isTasksFetching,
    refetch: refetchTasks,
  } = useGetTasksQuery(
    {
      projectId: projectId!,
      page,
      page_size: 10,
      search: debouncedSearch || undefined,
      status_id: selectedFilters.status.join(',') || undefined,
      priority: selectedFilters.priority.join(',') || undefined,
      type: selectedFilters.work_type.join(',') || undefined,
      assignee_id: userId,
    },
    { skip: !isProjectContext || !userId },
  );

  const {
    currentData: customStatusesResponse,
    refetch: refetchCustomStatuses,
  } = useGetCustomStatusQuery(
    { project_id: projectId! },
    { skip: !isProjectContext || !projectId },
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
    requestedTaskPage.current = 1;
  }, [
    debouncedSearch,
    selectedStatus,
    selectedFilters.status,
    selectedFilters.priority,
    selectedFilters.work_type,
    userId,
    isProjectContext,
  ]);

  useEffect(() => {
    if (!userId) return;

    const currentId = ++requestIdRef.current;

    getUserById(
      isProjectContext
        ? { user_id: userId }
        : {
            user_id: userId,
            page,
            page_size: 10,
            search: debouncedSearch || undefined,
            status:
              selectedStatus === 'all' || !selectedStatus
                ? undefined
                : getValidStatus(selectedStatus),
          },
    );

    return () => {
      requestIdRef.current = currentId;
    };
  }, [
    getUserById,
    userId,
    isProjectContext,
    page,
    debouncedSearch,
    selectedStatus,
  ]);

  const handleRefresh = useCallback(async () => {
    setPage(1);
    requestedTaskPage.current = 1;
    requestIdRef.current = 0;

    if (isProjectContext) {
      await refetchTasks();
      await refetchMembers();
      await refetchCustomStatuses();
    } else if (userId) {
      getUserById({ user_id: userId });
    }
  }, [
    isProjectContext,
    userId,
    getUserById,
    refetchTasks,
    refetchMembers,
    refetchCustomStatuses,
  ]);

  useFocusEffect(
    useCallback(() => {
      handleRefresh();
    }, [handleRefresh]),
  );

  const projects: UserAssignedProject[] = userResponse?.data?.project ?? [];
  const tasks: Task[] = tasksResponse?.data ?? [];

  const knownTaskStatuses: Record<string, string> = {};
  tasks.forEach(task => {
    if (task.status_id && task.status) {
      knownTaskStatuses[task.status_id] = task.status;
    }
  });

  const apiUser = projectId ? membersResponse?.data?.[0] : userResponse?.data;
  const member = route.params?.member;
  const user = apiUser
    ? {
        full_name: apiUser.full_name,
        user_name: apiUser.user_name || apiUser?.username,
        email: apiUser.email,
        avatar_url: apiUser.avatar_url,
        color: apiUser.color,
        role: apiUser.role,
      }
    : member
      ? {
          full_name: member.full_name || member?.name,
          user_name: member.username || member?.user_name,
          email: member.email,
          avatar_url: member.avatar_url,
          color: member.color,
          role: member.role,
        }
      : undefined;

  const showListSkeleton =
    page === 1 && (isProjectContext ? isTasksFetching : isUserFetching);
  const isFetchingMore = isProjectContext ? isTasksFetching : isUserFetching;

  const statusOptions = [
    { id: 'all', name: 'ALL' },
    ...(isProjectContext
      ? Object.entries(knownTaskStatuses).map(([id, name]) => ({
          id,
          name: name.toUpperCase(),
        }))
      : Object.values(ProjectStatus).map(status => ({
          id: status,
          name: STATUS_LABELS[status as ProjectStatus],
        }))),
  ];

  const taskFilterStatuses: CustomStatus[] =
    customStatusesResponse?.data ??
    Object.entries(knownTaskStatuses).map(([id, name], index) => ({
      id,
      project_id: projectId || '',
      name,
      color: colors.primary,
      display_order: index,
      is_default: false,
    }));

  const appliedFiltersCount =
    selectedFilters.assignee.length +
    selectedFilters.status.length +
    selectedFilters.priority.length +
    selectedFilters.work_type.length;

  const totalCount = isProjectContext
    ? (tasksResponse?.meta?.total_items ?? tasks.length)
    : (userResponse?.meta?.total_items ?? projects.length);

  const listData = isProjectContext ? tasks : projects;

  const handleLoadMore = () => {
    if (isProjectContext) {
      const nextPage = page + 1;
      if (
        isTasksFetching ||
        !tasksResponse?.meta?.has_next ||
        requestedTaskPage.current >= nextPage
      ) {
        return;
      }
      requestedTaskPage.current = nextPage;
      setPage(nextPage);
    } else {
      if (!isUserFetching && (userResponse?.meta?.has_next ?? false)) {
        setPage(current => current + 1);
      }
    }
  };

  return (
    <Screen backgroundColor={colors.surface}>
      <CommonHeader
        variant='custom'
        title={isProjectContext ? 'Project Member Details' : 'User Profile'}
        titleAlignment='left'
        onBackPress={() => navigation.goBack()}
      />

      <View style={{ flex: 1 }}>
        {user ? (
          <View
            style={{
              paddingHorizontal: layout.paddingHorizontal,
              paddingTop: moderateScale(8),
              paddingBottom: moderateScale(4),
              gap: layout.elementGap,
              zIndex: 10,
            }}
          >
            <UserProfileCard
              user={user as UserProfileData}
              isProjectContext={isProjectContext}
              totalCount={totalCount}
              onImagePress={
                user.avatar_url
                  ? () => setIsImagePreviewVisible(true)
                  : undefined
              }
            />

            <UserDetailsFilterBar
              isProjectContext={isProjectContext}
              totalCount={totalCount}
              appliedFiltersCount={appliedFiltersCount}
              statusOptions={statusOptions}
              selectedStatus={selectedStatus}
              isStatusDropdownOpen={isStatusDropdownOpen}
              onSelectStatus={statusId => {
                setSelectedStatus(statusId);
                setIsStatusDropdownOpen(false);
              }}
              onToggleStatusDropdown={() =>
                setIsStatusDropdownOpen(prev => !prev)
              }
              onOpenFilterModal={() => setIsFilterModalVisible(true)}
            />

            <UserDetailsSearchBar
              searchQuery={searchQuery}
              isProjectContext={isProjectContext}
              onChangeSearch={setSearchQuery}
              onClearSearch={() => setSearchQuery('')}
            />
          </View>
        ) : null}

        <FlatList<Task | UserAssignedProject>
          data={isProjectLoading || isTaskLoading ? [] : listData}
          keyExtractor={item => ('id' in item ? item.id : item.project_id)}
          renderItem={({ item, index }) => {
            const accentColor =
              ACCENT_PALETTE[(index % ACCENT_PALETTE.length) as number];
            return isProjectContext ? (
              <UserItemCard
                type='task'
                task={item as Task}
                accentColor={accentColor}
                onPress={(taskId, taskTitle) =>
                  navigation.navigate('issue', {
                    taskId,
                    taskName: taskTitle,
                    projectId: projectId!,
                  })
                }
              />
            ) : (
              <UserItemCard
                type='project'
                project={item as UserAssignedProject}
                accentColor={accentColor}
                onPress={(navProjectId, projectName) =>
                  navigation.navigate('projectDetails', {
                    projectId: navProjectId,
                    projectName: projectName,
                  })
                }
              />
            );
          }}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: layout.paddingHorizontal,
            paddingTop: moderateScale(8),
            paddingBottom: insets.bottom + moderateScale(24),
            gap: layout.elementGap,
            flexGrow: 1,
          }}
          ListEmptyComponent={
            showListSkeleton ? (
              <UserDetailsSkeleton />
            ) : !user ? (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: moderateScale(28),
                  gap: moderateScale(9),
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: moderateScale(16),
                  backgroundColor: colors.card,
                }}
              >
                <Ionicons
                  name='alert-circle-outline'
                  size={moderateScale(28)}
                  color={colors.textSecondary}
                />
                <AppText
                  color={colors.textSecondary}
                  style={{ textAlign: 'center' }}
                >
                  User information not available.
                </AppText>
              </View>
            ) : (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: moderateScale(28),
                  gap: moderateScale(9),
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: moderateScale(16),
                  backgroundColor: colors.card,
                }}
              >
                <Ionicons
                  name={
                    isProjectContext
                      ? 'checkbox-outline'
                      : 'folder-open-outline'
                  }
                  size={moderateScale(28)}
                  color={colors.textSecondary}
                />
                <AppText
                  color={colors.textSecondary}
                  style={{ textAlign: 'center' }}
                >
                  {isProjectContext
                    ? 'No tasks found for this member.'
                    : 'No projects found.'}
                </AppText>
              </View>
            )
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.45}
          ListFooterComponent={
            isFetchingMore && listData.length > 0 ? (
              <UserDetailsSkeleton />
            ) : null
          }
        />
      </View>

      <BoardFilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        hideAssignee
        statuses={taskFilterStatuses}
        selectedFilters={selectedFilters}
        onApplyFilters={filters => setSelectedFilters(filters)}
      />

      <Modal
        transparent
        visible={isImagePreviewVisible}
        animationType='fade'
        onRequestClose={() => setIsImagePreviewVisible(false)}
        statusBarTranslucent
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setIsImagePreviewVisible(false)}
            style={{
              flex: 1,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {!!user?.avatar_url && (
              <Image
                source={{ uri: user.avatar_url }}
                style={{
                  width: '80%',
                  height: '80%',
                  borderRadius: moderateScale(12),
                }}
                resizeMode='contain'
              />
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </Screen>
  );
};

export default UserDetailsScreen;
