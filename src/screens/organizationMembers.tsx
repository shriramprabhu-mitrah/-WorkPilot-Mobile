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
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../components';
import { Radius } from '../constants/Radius';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { useTheme } from '../hooks/useTheme';
import {
  useGetOrganizationMembersQuery,
  useRemoveOrganizationMemberMutation,
} from '../store/api/homeApi';
import { OrganizationMember } from '../types/auth.type';
import ListSkeleton from '../components/skeleton/ListSkeleton';
import ProjectCardSkeleton from '../components/skeleton/ProjectCardSkeleton';
import { getRoleLabel } from '../constants/role';
import { CommonHeader } from '../components/common/CommonHeader';
import { RootStackParamList } from '../types/navigationTypes';
import Screen from '../components/common/ScreenWapper';
import DeleteColumnModal from '../components/DeleteColumnModal';
import InviteMembersModal from '../components/InviteMembersModal';
import { showSnackbar } from '../components/common/Snackbar';

const STATUS_OPTIONS = [
  { label: 'ALL', value: '' },
  { label: 'ACTIVE', value: 'active' },
  { label: 'PENDING', value: 'pending' },
  { label: 'EXPIRED', value: 'expired' },
  { label: 'INACTIVE', value: 'inactive' },
] as const;

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

const OrganizationMembers = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { layout, moderateScale } = useAuthLayout();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [memberToRemove, setMemberToRemove] =
    useState<OrganizationMember | null>(null);
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('active');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [removeOrganizationMember, { isLoading: isRemovingMember }] =
    useRemoveOrganizationMemberMutation();

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
    lastRequestedPageRef.current = 1;
    setCurrentPage(1);
  }, [selectedStatus]);

  const {
    data: membersResponse,
    isLoading,
    isFetching,
    refetch: refetchOrganizationMembers,
  } = useGetOrganizationMembersQuery({
    page: currentPage,
    page_size: PAGE_SIZE,
    include_org_admins: true,
    full_name: debouncedSearch,
    status: selectedStatus || undefined,
  });

  useFocusEffect(
    useCallback(() => {
      lastRequestedPageRef.current = 1;
      refetchOrganizationMembers();
    }, [refetchOrganizationMembers]),
  );

  const members = useMemo(
    () => (membersResponse?.data as OrganizationMember[] | undefined) ?? [],
    [membersResponse?.data],
  );
  console.log('members', members);
  const filteredMembers = useMemo(() => {
    const search = debouncedSearch.toLowerCase();

    if (!search) return members;

    return members.filter(
      member =>
        member.name?.toLowerCase().includes(search) ||
        member.username?.toLowerCase().includes(search) ||
        member.email?.toLowerCase().includes(search),
    );
  }, [members, debouncedSearch]);

  const membersMeta = membersResponse?.meta;

  const handleLoadMore = useCallback(() => {
    const hasNext =
      membersMeta?.has_next !== undefined
        ? membersMeta.has_next
        : membersMeta?.total_pages !== undefined
          ? currentPage < membersMeta.total_pages
          : members.length >= PAGE_SIZE;

    if (hasNext && !isFetching && members.length > 0) {
      const nextPage = currentPage + 1;
      if (lastRequestedPageRef.current === nextPage) return;
      lastRequestedPageRef.current = nextPage;
      setCurrentPage(nextPage);
    }
  }, [isFetching, membersMeta, members.length, currentPage]);

  const handleConfirmRemoveMember = async () => {
    if (!memberToRemove?.id) return;
    try {
      await removeOrganizationMember({
        user_id: memberToRemove.id,
      }).unwrap();
      setMemberToRemove(null);
      refetchOrganizationMembers();
      showSnackbar({
        message: 'Member removed successfully',
        type: 'success',
      });
    } catch (error: any) {
      console.error('Failed to remove organization member:', error);
      showSnackbar({
        message: error?.data?.message || 'Failed to remove member',
        type: 'error',
      });
    }
  };
  const renderHeader = useCallback(() => {
    const selectedOption = STATUS_OPTIONS.find(
      opt => opt.value === selectedStatus,
    );

    return (
      <View className='mb-3 pt-2' style={{ gap: moderateScale(10) }}>
        {/* Row 1: Title & Count on left, Add Member button on right */}
        <View
          className='flex-row items-center justify-between'
          style={{ gap: layout.elementGap }}
        >
          <View
            className='flex-row items-center'
            style={{ gap: layout.elementGap }}
          >
            <AppText
              variant='caption'
              className='font-bold tracking-wider'
              color={colors.textSecondary}
            >
              Organization Members
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
          <View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsInviteModalVisible(true)}
              style={{
                backgroundColor: colors.primary,
              }}
              className='flex-row items-center gap-1 rounded-lg px-2 py-2'
            >
              <Ionicons
                name='add'
                size={moderateScale(14)}
                color={colors.white}
                className='font-semibold'
              />
              <AppText
                variant='button'
                color={colors.white}
                style={{ fontSize: moderateScale(12) }}
                className='font-semibold'
              >
                Add Member
              </AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Row 2: Status Dropdown Filter Button below the title */}
        <View className='flex-row items-center justify-start'>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsDropdownOpen(true)}
            className='flex-row items-center justify-between rounded-xl border px-3'
            style={{
              height: moderateScale(36),
              minWidth: moderateScale(125),
              backgroundColor: colors.card || '#FFFFFF',
              borderColor: colors.border || '#CBD5E1',
              borderWidth: 1.5,
              gap: 8,
            }}
          >
            <AppText
              variant='body'
              className='text-xs font-bold'
              color={colors.text || '#0F172A'}
            >
              {selectedOption?.label ?? 'ACTIVE'}
            </AppText>
            <Ionicons
              name='chevron-down'
              size={moderateScale(15)}
              color={colors.textSecondary || '#64748B'}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [
    colors.border,
    colors.card,
    colors.primary,
    colors.text,
    colors.textSecondary,
    colors.white,
    layout.elementGap,
    members.length,
    membersMeta?.total_items,
    moderateScale,
    selectedStatus,
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
          {debouncedSearch ? 'No Members Found' : 'No Organization Members'}
        </AppText>
        <AppText
          variant='caption'
          className='text-center leading-5'
          color={colors.textSecondary}
        >
          {debouncedSearch
            ? `We couldn't find members matching "${debouncedSearch}".`
            : 'There are no members in this organization yet.'}
        </AppText>
        {/* {!debouncedSearch && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsInviteModalVisible(true)}
            style={{
              backgroundColor: colors.primary,
              marginTop: 16,
            }}
            className='flex-row items-center gap-1.5 rounded-lg px-4 py-2.5'
          >
            <Ionicons
              name='add'
              size={moderateScale(16)}
              color={colors.white}
            />
            <AppText
              variant='button'
              color={colors.white}
              style={{ fontSize: moderateScale(13) }}
              className='font-semibold'
            >
              Add Member
            </AppText>
          </TouchableOpacity>
        )} */}
      </View>
    ),
    [
      colors.primary,
      colors.text,
      colors.textSecondary,
      colors.white,
      debouncedSearch,
      moderateScale,
    ],
  );

  const renderFooter = useCallback(() => {
    if (!isFetching || currentPage === 1) return null;

    return (
      <View className='pt-3'>
        <ProjectCardSkeleton />
      </View>
    );
  }, [currentPage, isFetching]);

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <CommonHeader
        variant='organizationMembers'
        title='Organization Members'
        onBackPress={() => navigation.goBack()}
        searchQuery={searchQuery}
        onChangeSearchQuery={setSearchQuery}
        searchPlaceholder='Search members...'
      />
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
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingBottom:
                Math.max(insets.bottom, moderateScale(16)) + moderateScale(48),
            },
          ]}
          ItemSeparatorComponent={MemberItemSeparator}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={2.5}
          renderItem={({ item }) => {
            const displayName = item.name || item.username || '';
            const initials = displayName
              .split(' ')
              .filter(Boolean)
              .map(name => name.charAt(0))
              .join('')
              .slice(0, 2)
              .toUpperCase();

            const totalTasks =
              item.tasks ??
              item.total_tasks ??
              item.total_assigned ??
              (item.completed ?? 0) + (item.open ?? item.in_progress ?? 0);

            const doneTasks =
              item.done ?? item.completed_tasks ?? item.completed ?? 0;

            const openTasks =
              item.open ??
              item.open_tasks ??
              item.in_progress ??
              (totalTasks > doneTasks ? totalTasks - doneTasks : 0);

            const progress =
              item.progress ??
              item.completion_percentage ??
              (totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0);

            const normalizedStatus = (item.status || '').toUpperCase();
            const isPending =
              normalizedStatus === 'PENDING' || normalizedStatus === 'INVITED';
            const isActive =
              normalizedStatus === 'ACTIVE' || (!item.status && item.is_active);

            const statusStyle = isPending
              ? {
                  bg: '#FEFCE8',
                  border: '#FDE047',
                  text: '#CA8A04',
                  label: 'PENDING',
                }
              : isActive
                ? {
                    bg: '#F0FDF4',
                    border: '#86EFAC',
                    text: '#16A34A',
                    label: 'ACTIVE',
                  }
                : {
                    bg: '#F8FAFC',
                    border: '#E2E8F0',
                    text: '#64748B',
                    label: normalizedStatus || 'INACTIVE',
                  };

            return (
              <View
                className='border p-3.5'
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: Radius.md,
                }}
              >
                {/* Top Row: Avatar, Member Info, Status & Remove */}
                <View
                  className='flex-row items-center'
                  style={{ gap: layout.elementGap }}
                >
                  {item.avatar_url ? (
                    <Image
                      source={{ uri: item.avatar_url }}
                      style={{
                        width: moderateScale(44),
                        height: moderateScale(44),
                        borderRadius: moderateScale(12),
                      }}
                      resizeMode='cover'
                    />
                  ) : (
                    <View
                      className='items-center justify-center overflow-hidden'
                      style={{
                        width: moderateScale(44),
                        height: moderateScale(44),
                        backgroundColor: item?.color || colors.primary,
                        borderRadius: moderateScale(12),
                      }}
                    >
                      <AppText
                        variant='body'
                        className='font-bold'
                        color={colors.white}
                      >
                        {initials || '?'}
                      </AppText>
                    </View>
                  )}

                  <View className='flex-1' style={{ gap: 2 }}>
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
                      className='capitalize'
                    >
                      {item.role || 'Member'}
                    </AppText>
                  </View>

                  <View
                    className='flex-row items-center'
                    style={{ gap: moderateScale(8) }}
                  >
                    <View
                      className='rounded-full border px-2.5 py-0.5'
                      style={{
                        backgroundColor: statusStyle.bg,
                        borderColor: statusStyle.border,
                      }}
                    >
                      <AppText
                        variant='caption'
                        className='text-[10px] font-bold uppercase tracking-wider'
                        style={{ color: statusStyle.text }}
                      >
                        {statusStyle.label}
                      </AppText>
                    </View>

                    <TouchableOpacity
                      accessibilityLabel={`Remove ${displayName}`}
                      accessibilityRole='button'
                      activeOpacity={0.7}
                      onPress={() => setMemberToRemove(item)}
                      className='items-center justify-center rounded-md p-1.5'
                      style={{ backgroundColor: colors.surface }}
                    >
                      <Ionicons
                        name='trash-outline'
                        size={moderateScale(16)}
                        color={colors.error}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Bottom Row: Progress bar & 3 Counts (tasks, done, open) */}
                <View className='mt-3 flex-row items-center justify-between pt-1'>
                  {/* Progress section on left */}
                  <View className='flex-1 pr-6'>
                    <View className='mb-1 flex-row items-center justify-between'>
                      <AppText
                        variant='caption'
                        className='text-xs'
                        color={colors.textSecondary}
                      >
                        Progress
                      </AppText>
                      <AppText
                        variant='caption'
                        className='text-xs font-semibold'
                        color={colors.primary}
                      >
                        {progress}%
                      </AppText>
                    </View>

                    {/* Progress Track */}
                    <View
                      className='h-1.5 w-full overflow-hidden rounded-full'
                      style={{ backgroundColor: colors.border }}
                    >
                      <View
                        className='h-full rounded-full'
                        style={{
                          width: `${Math.min(Math.max(progress, 0), 100)}%`,
                          backgroundColor: colors.primary,
                        }}
                      />
                    </View>
                  </View>

                  {/* Three counts on right (tasks, done, open) */}
                  <View
                    className='flex-row items-center'
                    style={{ gap: moderateScale(22) }}
                  >
                    <AppText
                      variant='body'
                      className='text-sm font-semibold'
                      color={colors.text}
                    >
                      {totalTasks}
                    </AppText>
                    <AppText
                      variant='body'
                      className='text-sm font-semibold'
                      style={{ color: '#16A34A' }}
                    >
                      {doneTasks}
                    </AppText>
                    <AppText
                      variant='body'
                      className='text-sm font-semibold'
                      color={colors.text}
                    >
                      {openTasks}
                    </AppText>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
      <DeleteColumnModal
        visible={Boolean(memberToRemove)}
        title='Remove Member'
        columnTitle={
          memberToRemove?.name || memberToRemove?.username || 'this member'
        }
        colors={colors}
        loading={isRemovingMember}
        onClose={() => setMemberToRemove(null)}
        onDelete={handleConfirmRemoveMember}
      />
      <InviteMembersModal
        visible={isInviteModalVisible}
        onClose={() => setIsInviteModalVisible(false)}
        onSuccess={() => refetchOrganizationMembers()}
      />

      {/* Centered Status Filter Modal Dialog */}
      <Modal
        transparent
        visible={isDropdownOpen}
        animationType='fade'
        onRequestClose={() => setIsDropdownOpen(false)}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={() => setIsDropdownOpen(false)}>
          <View
            className='flex-1 items-center justify-center px-6'
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)' }}
          >
            <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
              <View
                className='w-full max-w-xs rounded-2xl border p-4 shadow-xl'
                style={{
                  backgroundColor: colors.card || '#FFFFFF',
                  borderColor: colors.border || '#E2E8F0',
                  elevation: 10,
                }}
              >
                {/* Modal Header */}
                <View
                  className='flex-row items-center justify-between border-b pb-3'
                  style={{ borderColor: colors.border || '#F1F5F9' }}
                >
                  <AppText
                    variant='bodyLarge'
                    className='font-bold'
                    color={colors.text || '#0F172A'}
                  >
                    Filter by Status
                  </AppText>
                  <TouchableOpacity
                    onPress={() => setIsDropdownOpen(false)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    className='p-1'
                  >
                    <Ionicons
                      name='close'
                      size={moderateScale(18)}
                      color={colors.textSecondary || '#64748B'}
                    />
                  </TouchableOpacity>
                </View>

                {/* Status Options List */}
                <View className='mt-2' style={{ gap: moderateScale(4) }}>
                  {STATUS_OPTIONS.map(option => {
                    const isSelected = selectedStatus === option.value;
                    return (
                      <TouchableOpacity
                        key={option.label}
                        activeOpacity={0.7}
                        onPress={() => {
                          setSelectedStatus(option.value);
                          setIsDropdownOpen(false);
                          setCurrentPage(1);
                        }}
                        className='flex-row items-center justify-between rounded-xl px-4 py-3'
                        style={{
                          backgroundColor: isSelected
                            ? `${colors.primary}15`
                            : 'transparent',
                        }}
                      >
                        <AppText
                          variant='body'
                          className='text-sm font-semibold'
                          style={{
                            color: isSelected
                              ? colors.primary || '#2563EB'
                              : colors.text || '#1E293B',
                          }}
                        >
                          {option.label}
                        </AppText>
                        {isSelected && (
                          <Ionicons
                            name='checkmark-circle'
                            size={moderateScale(18)}
                            color={colors.primary || '#2563EB'}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </Screen>
  );
};

export default OrganizationMembers;
