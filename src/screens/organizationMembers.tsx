import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Image, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from '@react-native-vector-icons/ionicons';
import { skipToken } from '@reduxjs/toolkit/query';
import { useFocusEffect } from '@react-navigation/native';
import { AppInput, AppText } from '../components';
import { Radius } from '../constants/Radius';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { useTheme } from '../hooks/useTheme';
import { useGetOrganizationMembersQuery } from '../store/api/homeApi';
import { OrganizationMember } from '../types/auth.type';
import ListSkeleton from '../components/skeleton/ListSkeleton';
import ProjectCardSkeleton from '../components/skeleton/ProjectCardSkeleton';
import { getRoleLabel } from '../constants/role';
import { CommonHeader } from '../components/common/CommonHeader';
import { RootStackParamList } from '../types/navigationTypes';
import Screen from '../components/common/ScreenWapper';

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
  const { colors } = useTheme();
  const { layout, moderateScale } = useAuthLayout();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFocused, setIsFocused] = useState(false);
  const [refetchKey, setRefetchKey] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      setDebouncedSearch(searchQuery.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      setRefetchKey(previous => previous + 1);

      return () => setIsFocused(false);
    }, []),
  );

  const {
    data: membersResponse,
    isLoading,
    isFetching,
  } = useGetOrganizationMembersQuery(
    isFocused
      ? {
          page: currentPage,
          page_size: PAGE_SIZE,
          include_org_admins: true,
          full_name: debouncedSearch,
          _refetchKey: refetchKey,
        }
      : skipToken,
  );

  const members = useMemo(
    () => (membersResponse?.data as OrganizationMember[] | undefined) ?? [],
    [membersResponse?.data],
  );

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
    if (membersMeta?.has_next && !isFetching) {
      setCurrentPage(previous => previous + 1);
    }
  }, [isFetching, membersMeta?.has_next]);

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
      </View>
    ),
    [colors.text, colors.textSecondary, debouncedSearch, moderateScale],
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
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={MemberItemSeparator}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => {
            const displayName = item.name || item.username || '';
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
                {item.avatar_url ? (
                  <Image
                    source={{ uri: item.avatar_url }}
                    style={{
                      width: moderateScale(44),
                      height: moderateScale(44),
                      borderRadius: Radius.circle,
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
                      borderRadius: Radius.circle,
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

                <View
                  className='rounded-md px-3 py-1'
                  style={{ backgroundColor: colors.surface }}
                >
                  <AppText
                    variant='caption'
                    className='font-semibold capitalize'
                    color={colors.primary}
                  >
                    {getRoleLabel(item.role)}
                  </AppText>
                </View>

                <View
                  style={{
                    width: moderateScale(10),
                    height: moderateScale(10),
                    borderRadius: Radius.circle,
                    backgroundColor: item.is_active
                      ? colors.success
                      : colors.textSecondary,
                  }}
                />
              </View>
            );
          }}
        />
      )}
    </Screen>
  );
};

export default OrganizationMembers;
