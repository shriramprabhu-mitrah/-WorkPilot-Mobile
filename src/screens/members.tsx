import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
} from '../store/api/projectApi';
import { ProjectMember } from '../types/project.type';
import ListSkeleton from '../components/skeleton/ListSkeleton';
import ProjectCardSkeleton from '../components/skeleton/ProjectCardSkeleton';
import DeleteColumnModal from '../components/DeleteColumnModal';
import { showSuccessToast } from '../utils/utils';
import { getRoleLabel } from '../constants/role';

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

  const projectId = useAppSelector(
    (state: RootState) =>
      state.projects.project?.id?.toString() ||
      (state.projects.project as any)?._id?.toString(),
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      setDebouncedSearch(searchQuery.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

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
        }
      : skipToken,
  );
  useFocusEffect(
    useCallback(() => {
      if (projectId) {
        refetch();
      }
    }, [projectId, refetch]),
  );

  const [removeProjectMember, { isLoading: isRemovingMember }] =
    useRemoveProjectMemberMutation();

  const members = useMemo(
    () => (membersResponse?.data as ProjectMember[]) ?? [],
    [membersResponse?.data],
  );

  const filteredMembers = useMemo(() => {
    const search = debouncedSearch.toLowerCase();

    if (!search) return members;

    return members.filter(
      member =>
        member.full_name?.toLowerCase().includes(search) ||
        member.username?.toLowerCase().includes(search),
    );
  }, [members, debouncedSearch]);

  const membersMeta = membersResponse?.meta;

  const handleLoadMore = useCallback(() => {
    if (membersMeta?.has_next && !isFetching) {
      setCurrentPage(previous => previous + 1);
    }
  }, [isFetching, membersMeta?.has_next]);

  const handleConfirmRemoveMember = useCallback(async () => {
    if (!projectId || !memberToRemove) return;

    try {
      const response = await removeProjectMember({
        project_id: projectId,
        user_id: memberToRemove.user_id,
      }).unwrap();
      await refetch();
      showSuccessToast(response.message, 'success');

      setMemberToRemove(null);
    } catch (error: any) {
      showSuccessToast(
        error?.data?.message || error?.message || 'Failed to remove member',
        'error',
      );
    }
  }, [memberToRemove, projectId, removeProjectMember]);

  const renderHeader = useCallback(() => {
    if (members.length === 0) return null;

    return (
      <View
        className='mb-3 flex-row items-center pt-2'
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
            {membersMeta?.total_items ?? members.length}
          </AppText>
        </View>
      </View>
    );
  }, [
    colors.primary,
    colors.textSecondary,
    colors.white,
    layout.elementGap,
    members.length,
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
          data={filteredMembers}
          keyExtractor={item => item.user_id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={MemberItemSeparator}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => {
            const displayName = item.full_name || item.username || '';
            const initials = displayName
              .split(' ')
              .filter(Boolean)
              .map(name => name.charAt(0))
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <View
                className='flex-row items-center border p-3.5'
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
                {/* Member Role */}
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
