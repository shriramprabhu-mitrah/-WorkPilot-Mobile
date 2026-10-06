import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { skipToken } from '@reduxjs/toolkit/query';
import { useFocusEffect } from '@react-navigation/native';
import { AppInput, AppText } from '../components';
import { Radius } from '../constants/Radius';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { useTheme } from '../hooks/useTheme';
import { RootState, useAppSelector } from '../store';
import {
  useGetProjectMembersQuery,
  useRemoveProjectMemberMutation,
  useUpdateProjectMemberRoleMutation,
  useAddProjectMembersMutation,
} from '../store/api/projectApi';
import {
  useGetOrganizationMembersQuery,
  useGetRolesQuery,
} from '../store/api/homeApi';
import { ProjectMember } from '../types/project.type';
import ListSkeleton from '../components/skeleton/ListSkeleton';
import ProjectCardSkeleton from '../components/skeleton/ProjectCardSkeleton';
import DeleteColumnModal from '../components/DeleteColumnModal';
import { showSnackbar } from '../components/common/Snackbar';
import { RoleApiItem } from '../types/auth.type';
import CustomDropdown from '../components/CustomDropdown';
import AddProjectMemberModal from '../components/projectMemberIniviteModel';

const PAGE_SIZE = 10;

const MemberItemSeparator = () => <View className='h-3' />;

const styles = StyleSheet.create({
  countBadge: {
    paddingHorizontal: 6,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});

const Members = () => {
  const { colors } = useTheme();
  const { layout, moderateScale } = useAuthLayout();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(
    null,
  );
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [debouncedModalSearch, setDebouncedModalSearch] = useState('');
  const [activeRoleDropdown, setActiveRoleDropdown] = useState<string | null>(
    null,
  );
  const [isAddMemberModalVisible, setIsAddMemberModalVisible] = useState(false);

  const projectId = useAppSelector(
    (state: RootState) =>
      state.projects.project?.id?.toString() ||
      (state.projects.project as any)?._id?.toString(),
  );
  const lastRequestedPageRef = useRef(1);

  useEffect(() => {
    const timeout = setTimeout(() => {
      lastRequestedPageRef.current = 1;
      setCurrentPage(1);
      setDebouncedSearch(searchQuery.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedModalSearch(modalSearchQuery.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [modalSearchQuery]);

  const { data: rolesData, refetch: refetchRoles } = useGetRolesQuery();
  const { data: orgMembersData, refetch: refetchOrgMembers } =
    useGetOrganizationMembersQuery({
      page: 1,
      page_size: 10,
      full_name: debouncedModalSearch || undefined,
    });

  const rolesList = useMemo(() => rolesData?.data || [], [rolesData]);
  const orgMembersList = useMemo(
    () => orgMembersData?.data || [],
    [orgMembersData],
  );

  const {
    data: membersResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetProjectMembersQuery(
    projectId
      ? {
          project_id: projectId,
          page: currentPage,
          page_size: PAGE_SIZE,
          name: debouncedSearch || undefined,
        }
      : skipToken,
  );
  useFocusEffect(
    useCallback(() => {
      if (projectId) {
        lastRequestedPageRef.current = 1;
        refetch();
        refetchRoles();
        refetchOrgMembers();
      }
    }, [projectId, refetch]),
  );

  const [removeProjectMember, { isLoading: isRemovingMember }] =
    useRemoveProjectMemberMutation();

  const [updateProjectMemberRole] = useUpdateProjectMemberRoleMutation();
  const [addProjectMembers, { isLoading: isSubmittingMembers }] =
    useAddProjectMembersMutation();

  const projectMembers = membersResponse?.data ?? [];
  const membersMeta = membersResponse?.meta;

  const handleLoadMore = useCallback(() => {
    const hasNext =
      membersMeta?.has_next !== undefined
        ? membersMeta.has_next
        : membersMeta?.total_pages !== undefined
          ? currentPage < membersMeta.total_pages
          : projectMembers.length >= PAGE_SIZE;

    if (hasNext && !isFetching && projectMembers.length > 0) {
      const nextPage = currentPage + 1;
      if (lastRequestedPageRef.current === nextPage) return;
      lastRequestedPageRef.current = nextPage;
      setCurrentPage(nextPage);
    }
  }, [isFetching, membersMeta, projectMembers.length, currentPage]);

  const handleConfirmRemoveMember = useCallback(async () => {
    if (!projectId || !memberToRemove) return;

    try {
      const response = await removeProjectMember({
        project_id: projectId,
        user_id: memberToRemove.user_id,
      }).unwrap();
      await refetch();
      showSnackbar({
        message: response.message || 'Member removed successfully',
        type: 'success',
      });

      setMemberToRemove(null);
    } catch (error: any) {
      showSnackbar({
        message:
          error?.data?.message || error?.message || 'Failed to remove member',
        type: 'error',
      });
    }
  }, [memberToRemove, projectId, removeProjectMember, refetch]);

  const handleAddMembersSubmit = async (
    members: { user_id: string; role_id: string }[],
  ) => {
    if (!projectId) {
      showSnackbar({
        message: 'Project ID is missing.',
        type: 'error',
      });
      return;
    }

    try {
      const response = await addProjectMembers({
        project_id: projectId,
        members,
      }).unwrap();

      showSnackbar({
        message:
          response?.message || 'Members added successfully to the project!',
        type: 'success',
      });

      setIsAddMemberModalVisible(false);
      setModalSearchQuery('');
      await refetch();
    } catch (error: any) {
      const errorMsg =
        error?.data?.message ||
        error?.message ||
        'Failed to add members to project. Please try again.';
      showSnackbar({
        message: errorMsg,
        type: 'error',
      });
    }
  };

  const handleRoleSelect = async (userId: string, roleName: string) => {
    if (!projectId) return;
    setActiveRoleDropdown(null);
    const selectedRole = rolesList.find((role: any) => role.name === roleName);
    if (!selectedRole) return;
    try {
      await updateProjectMemberRole({
        project_id: projectId,
        user_id: userId,
        payload: {
          role_id: selectedRole.id,
        },
      }).unwrap();
      showSnackbar({ message: 'Role updated successfully', type: 'success' });
    } catch (error: any) {
      showSnackbar({
        message: error?.data?.message || 'Failed to update role',
        type: 'error',
      });
    }
  };

  const renderHeader = useCallback(() => {
    if (projectMembers.length === 0) return null;

    return (
      <View className='mb-3 flex-row items-center justify-between pt-2'>
        <View
          className='flex-row items-center'
          style={{ gap: layout.elementGap }}
        >
          <AppText
            variant='caption'
            className='font-bold tracking-wider'
            color={colors.textSecondary}
          >
            Project Members
          </AppText>
          <View
            className='items-center justify-center'
            style={[
              styles.countBadge,
              {
                minWidth: moderateScale(22),
                height: moderateScale(22),
                backgroundColor: colors.primary,
                borderRadius: Radius.circle,
              },
            ]}
          >
            <AppText
              variant='caption'
              className='text-xs font-bold'
              color={colors.white}
            >
              {membersMeta?.total_items ?? projectMembers.length}
            </AppText>
          </View>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setIsAddMemberModalVisible(true)}
          className='flex-row items-center rounded-md px-3 py-2'
          style={{
            backgroundColor: colors.primary,
            gap: moderateScale(5),
          }}
        >
          <Ionicons name='add' size={moderateScale(16)} color={colors.white} />
          <AppText variant='caption' className='font-bold' color={colors.white}>
            Add Members
          </AppText>
        </TouchableOpacity>
      </View>
    );
  }, [
    colors.primary,
    colors.textSecondary,
    colors.white,
    layout.elementGap,
    projectMembers.length,
    membersMeta?.total_items,
    moderateScale,
  ]);

  const renderEmptyState = useCallback(
    () => (
      <View className='flex-1 items-center justify-center px-6 py-12'>
        <Ionicons
          name='people-outline'
          size={moderateScale(48)}
          color={colors.textSecondary}
        />
        <AppText
          variant='bodyLarge'
          className='mb-1 mt-4 text-center font-bold'
          color={colors.text}
        >
          {debouncedSearch ? 'No Members Found' : 'No Project Members'}
        </AppText>
        <AppText
          variant='caption'
          className='text-center leading-5'
          color={colors.textSecondary}
        >
          {debouncedSearch
            ? `We couldn't find members matching "${debouncedSearch}".`
            : 'There are no members assigned to this project yet.'}
        </AppText>
      </View>
    ),
    [colors.text, colors.textSecondary, debouncedSearch, moderateScale],
  );

  // Skeleton card for paginated loading at the bottom
  const renderFooter = useCallback(() => {
    if (!isFetching || currentPage === 1) return null;

    return (
      <View className='pt-3'>
        <ProjectCardSkeleton />
      </View>
    );
  }, [currentPage, isFetching]);

  return (
    <View className='flex-1 pt-3' style={{ backgroundColor: colors.surface }}>
      <View className='mb-2 px-4'>
        <AppInput
          placeholder='Search project members...'
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

      {isLoading ? (
        <View className='flex-1 px-4 py-6'>
          <ListSkeleton
            count={5}
            containerStyle={{ gap: layout.elementGap - 2 }}
            renderItem={index => <ProjectCardSkeleton key={index} />}
          />
        </View>
      ) : (
        <FlatList
          data={projectMembers}
          keyExtractor={item => item.user_id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={MemberItemSeparator}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={2.5}
          renderItem={({ item }) => {
            const displayName = item.full_name || item.username || '';
            const initials = displayName
              .split(' ')
              .filter(Boolean)
              .map(name => name.charAt(0))
              .join('')
              .slice(0, 2)
              .toUpperCase();
            const isRoleOpen = activeRoleDropdown === item.user_id;

            return (
              <View
                className='flex-row items-center border p-3.5 px-2'
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: Radius.md,
                  gap: layout.elementGap,
                }}
              >
                {/* Member Avatar */}
                <View
                  style={{
                    position: 'relative',
                    width: moderateScale(44),
                    height: moderateScale(44),
                  }}
                >
                  <View
                    className='items-center justify-center overflow-hidden'
                    style={{
                      width: moderateScale(44),
                      height: moderateScale(44),
                      backgroundColor: item?.color || colors.primary,
                      borderRadius: Radius.circle,
                    }}
                  >
                    {item.avatar_url ? (
                      <Image
                        source={{ uri: item.avatar_url }}
                        style={{
                          width: '100%',
                          height: '100%',
                        }}
                        resizeMode='cover'
                      />
                    ) : (
                      <AppText
                        variant='body'
                        className='font-bold'
                        color={colors.white}
                      >
                        {initials || '?'}
                      </AppText>
                    )}
                  </View>
                  <View
                    style={{
                      position: 'absolute',
                      right: -1,
                      bottom: -1,
                      width: moderateScale(12),
                      height: moderateScale(12),
                      borderRadius: Radius.circle,
                      backgroundColor: '#4CAF50',
                      borderWidth: 2,
                      borderColor: colors.card,
                    }}
                  />
                </View>

                {/* Member Details */}
                <View className='flex-1' style={{ gap: layout.tightGap }}>
                  <AppText
                    variant='bodyLarge'
                    className='font-bold'
                    color={colors.text}
                    numberOfLines={1}
                  >
                    {displayName}
                  </AppText>

                  <AppText
                    variant='caption'
                    color={colors.textSecondary}
                    numberOfLines={1}
                  >
                    @{item.username}
                  </AppText>
                </View>
                {/* Member Role */}
                {item?.role !== 'org_admin' ? (
                  <CustomDropdown
                    items={rolesList.map((role: RoleApiItem) => ({
                      id: role.id,
                      name: role.name,
                    }))}
                    selectedValue={
                      rolesList.find(
                        (role: RoleApiItem) => role.name === item.role,
                      )?.id
                    }
                    onSelect={role => {
                      handleRoleSelect(item.user_id, role.name);
                    }}
                    isOpen={isRoleOpen}
                    onToggle={() =>
                      setActiveRoleDropdown(isRoleOpen ? null : item.user_id)
                    }
                    direction='down'
                    width={moderateScale(130)}
                    showIndicatorDot={false}
                  />
                ) : (
                  <View
                    className='rounded-md px-3 py-1'
                    style={{ backgroundColor: colors.surface }}
                  >
                    <AppText
                      variant='caption'
                      className='font-semibold capitalize'
                      color={colors.primary}
                    >
                      {item.role}
                    </AppText>
                  </View>
                )}

                {/* Remove Member */}
                <TouchableOpacity
                  accessibilityLabel={`Remove ${displayName}`}
                  accessibilityRole='button'
                  activeOpacity={0.7}
                  onPress={() => setMemberToRemove(item)}
                  className='items-center justify-center rounded-md p-2'
                  style={{ backgroundColor: colors.surface }}
                >
                  <Ionicons
                    name='trash-outline'
                    size={moderateScale(18)}
                    color={colors.error}
                  />
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}

      {/* Add Member Modal */}
      <AddProjectMemberModal
        visible={isAddMemberModalVisible}
        roles={rolesList}
        members={orgMembersList}
        searchQuery={modalSearchQuery}
        onSearchChange={setModalSearchQuery}
        isSubmitting={isSubmittingMembers}
        onSubmit={handleAddMembersSubmit}
        onClose={() => {
          setIsAddMemberModalVisible(false);
          setModalSearchQuery('');
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteColumnModal
        visible={Boolean(memberToRemove)}
        title='Remove Member'
        columnTitle={
          memberToRemove?.full_name || memberToRemove?.username || 'this member'
        }
        colors={colors}
        loading={isRemovingMember}
        onClose={() => setMemberToRemove(null)}
        onDelete={handleConfirmRemoveMember}
      />
    </View>
  );
};

export default Members;
