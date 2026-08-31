import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AppText from '../components/common/AppText';
import { AppInput } from '../components/common/Input';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { useAppDispatch, useAppSelector } from '../store';
import { globalSearchData } from '../store/home_store/action/home.thunk';
import { clearSearchResults } from '../store/home_store/reducer/home.reducer';
import { SearchItem } from '../types/home.type';
import CommonHeader from '../components/common/CommonHeader';
import { RootStackParamList } from '../types/navigationTypes';
import Screen from '../components/common/ScreenWapper';
import { showSuccessToast } from '../utils/utils';

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

const ICONS: Record<string, string> = {
  task: 'checkbox',
  user_story: 'bookmark',
  project: 'folder',
  sprint: 'repeat',
  member: 'person-outline',
};

const SearchScreen = () => {
  const { colors } = useTheme();
  const { layout, hp, moderateScale } = useAuthLayout();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { searchResults, searchLoading, searchError } = useAppSelector(
    state => state.home,
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<SearchCategory>('all');

  useEffect(() => {
    setSearchQuery('');
    setSelectedCategory('all');
    dispatch(clearSearchResults());
  }, [dispatch]);

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();
    const timeoutId = setTimeout(() => {
      if (trimmedQuery.length > 0) {
        dispatch(globalSearchData({ query: trimmedQuery }));
      } else {
        dispatch(clearSearchResults());
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, dispatch]);

  const filteredResults = useMemo(() => {
    if (!searchResults) return [];

    if (selectedCategory === 'all') {
      return (
        Object.keys(CATEGORY_STORE_KEY_MAP) as Exclude<SearchCategory, 'all'>[]
      ).flatMap(cat => {
        const storeKey = CATEGORY_STORE_KEY_MAP[cat];
        return (searchResults[storeKey] || []).map((item: SearchItem) => ({
          ...item,
          type: cat,
        }));
      });
    }

    const storeKey = CATEGORY_STORE_KEY_MAP[selectedCategory];
    const categoryData = searchResults[storeKey] || [];

    return categoryData.map((item: SearchItem) => ({
      ...item,
      type: selectedCategory,
    }));
  }, [searchResults, selectedCategory]);

  const getItemSubtitle = (item: SearchItem) => {
    if (item.project_name) return item.project_name;
    if (item.status) return item.status;
    if (item.priority) return item.priority;
    if (item.description) return item.description;
    return item.type ? item.type.replace('_', ' ') : '';
  };

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
            navigation.navigate('projectDetails', {
              projectId: item.project_id,
              projectName: item.project_name || 'Project Details',
            });
          } else {
            showSuccessToast('No project linked to this sprint', 'error');
          }
          break;

        default:
          showSuccessToast(
            'No access or detail view available for this item',
            'error',
          );
          break;
      }
    },
    [navigation],
  );

  const renderResultItem = useCallback(
    ({ item }: { item: SearchItem }) => {
      const title = item.title || 'Untitled';
      const subtitle = getItemSubtitle(item);
      const iconName = ICONS[item.type] || 'person-outline';

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
          <View
            className='items-center justify-center rounded-lg'
            style={{
              width: moderateScale(36),
              height: moderateScale(36),
              backgroundColor: colors.surface,
            }}
          >
            <Ionicons
              name={iconName as any}
              size={moderateScale(20)}
              color={colors.primary}
            />
          </View>
          <View className='flex-1'>
            <AppText
              variant='body'
              className='font-bold capitalize'
              color={colors.text}
              style={{
                fontSize: moderateScale(14),
                lineHeight: moderateScale(18),
              }}
              numberOfLines={1}
            >
              {title}
            </AppText>
            {item.key && (
              <AppText
                variant='caption'
                color={colors.textSecondary}
                numberOfLines={1}
                style={{ fontSize: moderateScale(11) }}
              >
                {item.key}
              </AppText>
            )}
            <AppText
              variant='caption'
              color={colors.textSecondary}
              numberOfLines={1}
              style={{ fontSize: moderateScale(11) }}
            >
              {subtitle}
            </AppText>
          </View>
          <Ionicons
            name='chevron-forward'
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
          : searchError
            ? searchError
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
      />
      <View
        style={{
          paddingHorizontal: layout.paddingHorizontal,
          paddingBottom: layout.elementGap,
        }}
      >
        <AppInput
          autoFocus={true}
          placeholder='Search tasks, stories, projects...'
          leftIcon={
            <Ionicons
              name='search-outline'
              size={moderateScale(18)}
              color={colors.textSecondary}
            />
          }
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View
        style={{
          paddingHorizontal: layout.paddingHorizontal,
          paddingBottom: layout.elementGap,
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: layout.elementGap / 2 }}
        >
          {CATEGORY_OPTIONS.map(cat => {
            const isActive = selectedCategory === cat.value;
            return (
              <TouchableOpacity
                key={cat.value}
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(cat.value)}
                className='rounded-full border px-3 py-1.5'
                style={{
                  backgroundColor: isActive
                    ? colors.primary
                    : colors.background,
                  borderColor: isActive ? colors.primary : colors.border,
                }}
              >
                <AppText
                  variant='caption'
                  className='font-semibold'
                  color={isActive ? colors.white : colors.textSecondary}
                >
                  {cat.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View
        style={{
          flex: 1,
          paddingHorizontal: layout.paddingHorizontal,
        }}
      >
        <FlatList
          data={filteredResults}
          keyExtractor={(item, index) => `${item.id}-${item.type}-${index}`}
          renderItem={renderResultItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={{
            paddingBottom: hp(10),
            gap: layout.tightGap,
          }}
          keyboardShouldPersistTaps='handled'
        />
      </View>
    </Screen>
  );
};

export default SearchScreen;
