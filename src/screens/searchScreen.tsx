import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, TouchableOpacity, FlatList, Image } from 'react-native';
import { usePermissions } from '../hooks/usePermissions';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AppText from '../components/common/AppText';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { useGlobalSearchQuery } from '../store/api/homeApi';
import { skipToken } from '@reduxjs/toolkit/query';
import { SearchItem } from '../types/home.type';
import CommonHeader from '../components/common/CommonHeader';
import { RootStackParamList } from '../types/navigationTypes';
import Screen from '../components/common/ScreenWapper';
import { showSnackbar } from '../components/common/Snackbar';
import { renderParsedHtml } from '../utils/htmlParser';
import { getStatusThemeColor, getPriorityThemeColor } from '../utils/enum';
import { WorkItemIcon } from '../components/common/getWorkItemIcon';

type SearchCategory =
  'all' | 'task' | 'user_story' | 'project' | 'member' | 'sprint';

const CATEGORY_OPTIONS: { label: string; value: SearchCategory }[] = [
  { label: 'All', value: 'all' },
  { label: 'Tasks', value: 'task' },
  { label: 'User Stories', value: 'user_story' },
  { label: 'Projects', value: 'project' },
  { label: 'Members', value: 'member' },
  { label: 'Sprints', value: 'sprint' },
];

const SearchScreen = () => {
  const CATEGORY_STORE_KEY_MAP: Record<
    Exclude<SearchCategory, 'all'>,
    'tasks' | 'user_stories' | 'projects' | 'members' | 'sprints'
  > = {
    task: 'tasks',
    user_story: 'user_stories',
    project: 'projects',
    member: 'members',
    sprint: 'sprints',
  };

  const { colors } = useTheme();
  const { layout, hp, moderateScale } = useAuthLayout();
  const { isOrgAdmin } = usePermissions();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<SearchCategory>('all');

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();
    const timeoutId = setTimeout(() => setDebouncedQuery(trimmedQuery), 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const {
    data: searchResponse,
    isLoading: isSearchLoading,
    isFetching: isSearchFetching,
  } = useGlobalSearchQuery(
    debouncedQuery ? { query: debouncedQuery } : skipToken,
    { refetchOnMountOrArgChange: true },
  );

  const searchLoading = isSearchLoading || isSearchFetching;

  const filteredResults = useMemo(() => {
    const searchResults = searchResponse?.data;
    if (!searchResults || !debouncedQuery) return [];

    if (selectedCategory === 'all') {
      return (
        Object.keys(CATEGORY_STORE_KEY_MAP) as Exclude<SearchCategory, 'all'>[]
      ).flatMap(cat => {
        const storeKey = CATEGORY_STORE_KEY_MAP[cat];
        return (searchResults[storeKey] || []).map((item: SearchItem) => ({
          ...item,
          type: item.type || cat,
        }));
      });
    }

    const storeKey = CATEGORY_STORE_KEY_MAP[selectedCategory];
    const categoryData = searchResults[storeKey] || [];

    return categoryData.map((item: SearchItem) => ({
      ...item,
      type: item.type || selectedCategory,
    }));
  }, [searchResponse?.data, selectedCategory, debouncedQuery]);

  const handleItemPress = useCallback(
    (item: SearchItem) => {
      switch (item.type) {
        case 'project':
          navigation.navigate('projectDetails', {
            projectId: item.id,
            projectName: item.project_name || item.title,
          });
          break;

        case 'task':
          navigation.navigate('issue', {
            projectId: item.project_id,
            taskId: item.id,
            task: item as any,
            taskName: item.title,
          });
          break;

        case 'user_story':
          navigation.navigate('issue', {
            projectId: item.project_id,
            userStoryId: item.id,
            story: item as any,
            storyName: item.title,
          });
          break;

        case 'sprint':
          if (item.project_id) {
            navigation.navigate('SprintDetails', {
              sprintId: item.id,
              sprintName: item.name || item.title || 'Sprint Details',
            });
          } else {
            showSnackbar({
              message: 'No project linked to this sprint',
              type: 'error',
            });
          }
          break;

        case 'member':
          if (isOrgAdmin) {
            navigation.navigate('userDetail', {
              userId: item.id,
              member: {
                full_name: item.name || item.title,
                name: item.name || item.title,
                username: item.username,
                user_name: item.user_name,
                email: item.email,
                role: item.role,
                avatar_url: item.avatar_url,
                color: item.color,
              },
            });
          }
          break;

        default:
          showSnackbar({
            message: 'No access or detail view available for this item',
            type: 'error',
          });
          break;
      }
    },
    [navigation, isOrgAdmin],
  );

  const renderCardContent = (item: SearchItem) => {
    switch (item.type) {
      case 'project':
        return (
          <>
            {item.description ? (
              <AppText
                variant='caption'
                color={colors.textSecondary}
                numberOfLines={1}
                style={{ fontSize: moderateScale(11) }}
              >
                {renderParsedHtml(item.description, {
                  color: colors.textSecondary,
                  fontSize: moderateScale(11),
                })}
              </AppText>
            ) : null}
            {item.status && (
              <View
                className='mt-1 self-start rounded px-2 py-0.5'
                style={{ backgroundColor: colors.surface }}
              >
                <AppText
                  variant='caption'
                  style={{
                    fontSize: moderateScale(10),
                    textTransform: 'uppercase',
                    color: getStatusThemeColor(item.status, colors),
                  }}
                >
                  {item.status.replace('_', ' ')}
                </AppText>
              </View>
            )}
          </>
        );

      case 'sprint':
        return (
          <View
            className='mt-1 flex-row flex-wrap items-center'
            style={{ gap: moderateScale(6) }}
          >
            {item.project_name && (
              <AppText
                variant='caption'
                color={colors.textSecondary}
                numberOfLines={1}
                style={{ fontSize: moderateScale(11) }}
              >
                {item.project_name}
              </AppText>
            )}
            {item.status && (
              <View
                className='rounded px-1.5 py-0.5'
                style={{ backgroundColor: colors.surface }}
              >
                <AppText
                  variant='caption'
                  style={{
                    fontSize: moderateScale(10),
                    color: getStatusThemeColor(item.status, colors),
                    textTransform: 'capitalize',
                  }}
                >
                  {item.status}
                </AppText>
              </View>
            )}
          </View>
        );

      case 'member':
        return (
          <View className='mt-1'>
            <View
              className='flex-row items-center'
              style={{ gap: moderateScale(6) }}
            >
              {item.user_name && (
                <AppText
                  variant='caption'
                  color={colors.textSecondary}
                  numberOfLines={1}
                  style={{ fontSize: moderateScale(11) }}
                >
                  @{item.user_name}
                </AppText>
              )}
              {item.email && (
                <AppText
                  variant='caption'
                  color={colors.textSecondary}
                  numberOfLines={1}
                  style={{ fontSize: moderateScale(11) }}
                >
                  {item.user_name ? `• ${item.email}` : item.email}
                </AppText>
              )}
            </View>

            {item.role && (
              <View
                className='mt-1 self-start rounded px-2 py-0.5'
                style={{ backgroundColor: colors.surface }}
              >
                <AppText
                  variant='caption'
                  color={colors.primary}
                  style={{
                    fontSize: moderateScale(10),
                    textTransform: 'capitalize',
                    fontWeight: '600',
                  }}
                >
                  {item.role.replace('_', ' ')}
                </AppText>
              </View>
            )}
          </View>
        );

      case 'task':
      case 'user_story':
      default:
        return (
          <View className='mt-1'>
            {item.project_name && (
              <AppText
                variant='caption'
                color={colors.textSecondary}
                numberOfLines={1}
                style={{
                  fontSize: moderateScale(11),
                  marginBottom: moderateScale(2),
                }}
              >
                {item.project_name}
              </AppText>
            )}
            <View
              className='flex-row items-center'
              style={{ gap: moderateScale(6) }}
            >
              {item.status && (
                <View
                  className='rounded px-1.5 py-0.5'
                  style={{ backgroundColor: colors.surface }}
                >
                  <AppText
                    variant='caption'
                    style={{
                      fontSize: moderateScale(10),
                      color: getStatusThemeColor(item.status, colors),
                    }}
                  >
                    {item.status}
                  </AppText>
                </View>
              )}
              {item.priority && (
                <View
                  className='rounded px-1.5 py-0.5'
                  style={{ backgroundColor: colors.surface }}
                >
                  <AppText
                    variant='caption'
                    style={{
                      fontSize: moderateScale(10),
                      textTransform: 'capitalize',
                      color: getPriorityThemeColor(item.priority, colors),
                    }}
                  >
                    {item.priority}
                  </AppText>
                </View>
              )}
            </View>
          </View>
        );
    }
  };

  const renderResultItem = useCallback(
    ({ item }: { item: SearchItem }) => {
      const title = item.name || item.title || 'Untitled';
      const isMember = item.type === 'member';

      return (
        <TouchableOpacity
          activeOpacity={0.8}
          className='mb-3 flex-row items-center rounded-xl border p-3'
          onPress={() => handleItemPress(item)}
          style={{
            backgroundColor: colors.background,
            borderColor: colors.border,
            gap: layout.elementGap,
          }}
        >
          {isMember ? (
            item.avatar_url ? (
              <Image
                source={{ uri: item.avatar_url }}
                style={{
                  width: moderateScale(38),
                  height: moderateScale(38),
                  borderRadius: moderateScale(19),
                }}
                resizeMode='cover'
              />
            ) : (
              <View
                className='items-center justify-center rounded-full'
                style={{
                  width: moderateScale(38),
                  height: moderateScale(38),
                  backgroundColor: colors.primary,
                }}
              >
                <AppText
                  variant='body'
                  className='font-bold uppercase text-white'
                  style={{ fontSize: moderateScale(14) }}
                >
                  {(
                    item.full_name ||
                    item.user_name ||
                    item.name ||
                    'U'
                  ).charAt(0)}
                </AppText>
              </View>
            )
          ) : (
            <View
              className='items-center justify-center rounded-lg'
              style={{
                width: moderateScale(38),
                height: moderateScale(38),
                backgroundColor: colors.surface,
              }}
            >
              <WorkItemIcon type={item.type} size={moderateScale(20)} />
            </View>
          )}
          <View className='flex-1 justify-center'>
            <View
              className='flex-row items-center'
              style={{ gap: moderateScale(6) }}
            >
              {item.key && (
                <AppText
                  variant='caption'
                  color={colors.primary}
                  numberOfLines={1}
                  className='font-semibold'
                  style={{ fontSize: moderateScale(12) }}
                >
                  {item.key}
                </AppText>
              )}
              <AppText
                variant='body'
                className='flex-1 font-semibold'
                color={colors.text}
                numberOfLines={1}
                style={{
                  fontSize: moderateScale(14),
                  lineHeight: moderateScale(18),
                }}
              >
                {title}
              </AppText>
            </View>
            {renderCardContent(item)}
          </View>
          <WorkItemIcon
            type='chevron-right'
            size={moderateScale(16)}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      );
    },
    [colors, layout.elementGap, moderateScale, handleItemPress],
  );

  const renderEmptyState = () => (
    <View className='items-center justify-center py-10'>
      <AppText variant='body' color={colors.textSecondary}>
        {searchLoading
          ? 'Searching...'
          : searchQuery.trim().length > 0
            ? 'No results found'
            : 'Type something to search'}
      </AppText>
    </View>
  );

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <CommonHeader
        variant='search'
        title='Search'
        onBackPress={() => navigation.goBack()}
        searchQuery={searchQuery}
        onChangeSearchQuery={setSearchQuery}
        searchAutoFocus
        searchPlaceholder='Search tasks, stories, projects...'
        categoryOptions={CATEGORY_OPTIONS.map(opt => ({
          label: opt.label,
          value: opt.value,
        }))}
        selectedCategory={selectedCategory}
        onSelectCategory={value => setSelectedCategory(value as SearchCategory)}
      />

      <FlatList
        data={filteredResults}
        keyExtractor={(item, index) => `${item.type}-${item.id}-${index}`}
        renderItem={renderResultItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        keyboardShouldPersistTaps='handled'
        contentContainerStyle={{
          paddingHorizontal: layout.paddingHorizontal,
          paddingTop: moderateScale(8),
          paddingBottom: hp(10),
          flexGrow: 1,
        }}
      />
    </Screen>
  );
};

export default SearchScreen;
