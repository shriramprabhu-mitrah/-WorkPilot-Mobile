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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
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
import { RootStackParamList } from '../types/navigationTypes';
import AddProjectMemberModal from '../components/projectMemberIniviteModel';
import EditMemberRoleModal from '../components/EditMemberRoleModal';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { usePermissions } from '../hooks/usePermissions';

const PAGE_SIZE = 10;

const SwipeRightActions = ({
  onEdit,
  onDelete,
  isEditDisabled = false,
  isDeleteDisabled = false,
}: {
  onEdit: () => void;
  onDelete: () => void;
  isEditDisabled?: boolean;
  isDeleteDisabled?: boolean;
}) => {
  const { colors } = useTheme();
  const { moderateScale } = useAuthLayout();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: moderateScale(8),
        gap: moderateScale(8),
      }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={isEditDisabled ? undefined : onEdit}
        disabled={isEditDisabled}
        style={{
          width: moderateScale(54),
          height: '100%',
          borderRadius: Radius.md,
          backgroundColor: '#10B981',
          opacity: isEditDisabled ? 0.35 : 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons
          name='create-outline'
          size={moderateScale(25)}
          color='#FFFFFF'
        />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={isDeleteDisabled ? undefined : onDelete}
        disabled={isDeleteDisabled}
        style={{
          width: moderateScale(54),
          height: '100%',
          borderRadius: Radius.md,
          backgroundColor: colors.error,
          opacity: isDeleteDisabled ? 0.35 : 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons
          name='trash-outline'
          size={moderateScale(25)}
          color='#FFFFFF'
        />
      </TouchableOpacity>
    </View>
  );
};

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
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { layout, moderateScale } = useAuthLayout();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(
    null,
  );
  const [memberToEdit, setMemberToEdit] = useState<ProjectMember | null>(null);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [debouncedModalSearch, setDebouncedModalSearch] = useState('');
  const [isAddMemberModalVisible, setIsAddMemberModalVisible] = useState(false);

  const projectId = useAppSelector(
    (state: RootState) =>
      state.projects.project?.id?.toString() ||
      (state.projects.project as any)?._id?.toString(),
  );
  const { permissionsReady, canEditProject, canDeleteProject, isOrgAdmin } =
    usePermissions({ projectId });
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
      page_size: 50,
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

  const projectMembers = membersResponse?.data ?? [];
  const membersMeta = membersResponse?.meta;

  const existingMemberIds = useMemo(() => {
    const ids = new Set<string>();
    projectMembers.forEach(pm => {
      if (pm.user_id) ids.add(String(pm.user_id));
      if ((pm as any).id) ids.add(String((pm as any).id));
      if ((pm as any)._id) ids.add(String((pm as any)._id));
      if (pm.username) ids.add(String(pm.username).toLowerCase());
    });
    return ids;
  }, [projectMembers]);

  const availableOrgMembers = useMemo(() => {
    return orgMembersList.filter(m => {
      const memberId = String(
        m.id || (m as any)._id || (m as any).user_id || '',
      );
      const username = m.username ? String(m.username).toLowerCase() : '';
      if (memberId && existingMemberIds.has(memberId)) return false;
      if (username && existingMemberIds.has(username)) return false;
      return true;
    });
  }, [orgMembersList, existingMemberIds]);

  useFocusEffect(
    useCallback(() => {
      if (projectId) {
        lastRequestedPageRef.current = 1;
        refetch();
        refetchRoles();
        refetchOrgMembers();
      }
    }, [projectId, refetch, refetchRoles, refetchOrgMembers]),
  );

  const [removeProjectMember, { isLoading: isRemovingMember }] =
    useRemoveProjectMemberMutation();

  const [updateProjectMemberRole, { isLoading: isUpdatingRole }] =
    useUpdateProjectMemberRoleMutation();
  const [addProjectMembers, { isLoading: isSubmittingMembers }] =
    useAddProjectMembersMutation();

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
    if (!permissionsReady || !canDeleteProject) {
      showSnackbar({
        message: 'You do not have permission to remove project members.',
        type: 'error',
      });
      return;
    }
    if (!projectId || !memberToRemove) return;

    if (memberToRemove.role === 'org_admin') {
      showSnackbar({
        message: 'Organization admin cannot be removed.',
        type: 'error',
      });
      setMemberToRemove(null);
      return;
    }

    try {
      const response = await removeProjectMember({
        project_id: projectId,
        user_id: memberToRemove.user_id,
      }).unwrap();
      await refetch();
      refetchOrgMembers();
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
  }, [
    memberToRemove,
    projectId,
    removeProjectMember,
    refetch,
    refetchOrgMembers,
  ]);

  const handleAddMembersSubmit = async (
    members: { user_id: string; role_id: string }[],
  ) => {
    if (!permissionsReady || !canEditProject) {
      showSnackbar({
        message: 'You do not have permission to add project members.',
        type: 'error',
      });
      return;
    }
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
      refetchOrgMembers();
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

  const handleSaveMemberRole = async (userId: string, roleId: string) => {
    if (!permissionsReady || !canEditProject) {
      showSnackbar({
        message: 'You do not have permission to update member roles.',
        type: 'error',
      });
      return;
    }
    if (!projectId) return;
    try {
      await updateProjectMemberRole({
        project_id: projectId,
        user_id: userId,
        payload: {
          role_id: roleId,
        },
      }).unwrap();
      showSnackbar({ message: 'Role updated successfully', type: 'success' });
      setMemberToEdit(null);
      await refetch();
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
        {permissionsReady && canEditProject && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsAddMemberModalVisible(true)}
            className='flex-row items-center rounded-md px-3 py-2'
            style={{
              backgroundColor: colors.primary,
              gap: moderateScale(5),
            }}
          >
            <Ionicons
              name='add'
              size={moderateScale(16)}
              color={colors.white}
            />
            <AppText
              variant='caption'
              className='font-bold'
              color={colors.white}
            >
              Add Members
            </AppText>
          </TouchableOpacity>
        )}
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
            const isOrgAdmin = item.role === 'org_admin';

            return (
              <Swipeable
                renderRightActions={() => {
                  if (!permissionsReady) return null;
                  if (!canEditProject && !canDeleteProject) return null;
                  return (
                    <SwipeRightActions
                      onEdit={() => setMemberToEdit(item)}
                      onDelete={() => setMemberToRemove(item)}
                      isEditDisabled={isOrgAdmin || !canEditProject}
                      isDeleteDisabled={isOrgAdmin || !canDeleteProject}
                    />
                  );
                }}
                overshootRight={false}
              >
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => {
                    if (isOrgAdmin) {
                      navigation.navigate('userDetail', {
                        userId: item.user_id,
                        projectId,
                        member: item,
                      });
                    }
                  }}
                  className='flex-row items-center border p-3.5 px-3'
                  style={{
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: Radius.md,
                    gap: layout.elementGap,
                  }}
                >
                  {/* Member Avatar */}
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

                  {/* Member Role Badge (Non-editable) */}
                  <View
                    className='rounded-md px-3 py-1.5'
                    style={{
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <AppText
                      variant='caption'
                      className='font-semibold capitalize'
                      color={colors.primary}
                    >
                      {item.role || 'Member'}
                    </AppText>
                  </View>
                </TouchableOpacity>
              </Swipeable>
            );
          }}
        />
      )}

      {/* Add Member Modal */}
      <AddProjectMemberModal
        visible={isAddMemberModalVisible}
        roles={rolesList}
        members={availableOrgMembers}
        searchQuery={modalSearchQuery}
        onSearchChange={setModalSearchQuery}
        isSubmitting={isSubmittingMembers}
        onSubmit={handleAddMembersSubmit}
        onClose={() => {
          setIsAddMemberModalVisible(false);
          setModalSearchQuery('');
        }}
      />

      {/* Edit Member Role Modal */}
      <EditMemberRoleModal
        visible={Boolean(memberToEdit)}
        member={memberToEdit}
        roles={rolesList}
        isLoading={isUpdatingRole}
        onClose={() => setMemberToEdit(null)}
        onSave={handleSaveMemberRole}
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
