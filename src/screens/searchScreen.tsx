import React, { useCallback } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { usePermissions } from '../hooks/usePermissions';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { useGlobalSearch } from '../hooks/useGlobalSearch';
import { SearchCategory, SearchItem } from '../types/home.type';
import CommonHeader from '../components/common/CommonHeader';
import { RootStackParamList } from '../types/navigationTypes';
import Screen from '../components/common/ScreenWapper';
import { showSnackbar } from '../components/common/Snackbar';
import { SearchItemCard } from '../components/search/cards/SearchItemCard';
import { SearchFooter } from '../components/search/SearchFooter';
import { SearchEmptyState } from '../components/search/SearchEmptyState';

const SearchScreen = () => {
  const { colors } = useTheme();
  const { layout, hp, moderateScale } = useAuthLayout();
  const { isOrgAdmin } = usePermissions();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const {
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    selectedCategory,
    setSelectedCategory,
    currentCategoryPagination,
    categoryOptions,
    filteredResults,
    isInitialLoading,
    isPaginating,
    isRefreshing,
    handleRefresh,
    handleLoadMore,
  } = useGlobalSearch();

  // Handle item navigation
  const handleItemPress = useCallback(
    (item: SearchItem) => {
      const itemType =
        item.type || (item.email || item.user_name ? 'member' : 'unknown');

      switch (itemType) {
        case 'project':
          navigation.navigate('projectDetails', {
            projectId: item.id || item.project_id || '',
            projectName: item.project_name || item.title || 'Project Details',
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
                full_name: item.name || item.title || '',
                name: item.name || item.title || '',
                username: item.username || item.user_name || '',
                user_name: item.user_name || item.username || '',
                email: item.email || '',
                role: item.role || 'member',
                avatar_url: item.avatar_url || null,
                color: item.color || null,
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

  // Main Render Item Router with before-last-5-items pagination trigger
  const renderResultItem = useCallback(
    ({ item, index }: { item: SearchItem; index: number }) => {
      // Trigger pagination proactively when reaching before the last 5 items
      if (
        index >= filteredResults.length - 5 &&
        currentCategoryPagination?.has_next &&
        !isPaginating &&
        !isInitialLoading
      ) {
        handleLoadMore();
      }

      return <SearchItemCard item={item} onPress={handleItemPress} />;
    },
    [
      filteredResults.length,
      currentCategoryPagination?.has_next,
      isPaginating,
      isInitialLoading,
      handleLoadMore,
      handleItemPress,
    ],
  );

  // Footer for Pagination (Skeleton loaders during pagination or end-of-results message)
  const renderFooter = useCallback(
    () => (
      <SearchFooter
        isPaginating={isPaginating}
        hasNext={currentCategoryPagination?.has_next}
        hasResults={filteredResults.length > 0}
        debouncedQuery={debouncedQuery}
        isMemberCategory={selectedCategory === 'members'}
      />
    ),
    [
      isPaginating,
      currentCategoryPagination?.has_next,
      filteredResults.length,
      debouncedQuery,
      selectedCategory,
    ],
  );

  // Empty State / Initial Loading State
  const renderEmptyState = useCallback(
    () => (
      <SearchEmptyState
        isInitialLoading={isInitialLoading}
        debouncedQuery={debouncedQuery}
      />
    ),
    [isInitialLoading, debouncedQuery],
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
        categoryOptions={categoryOptions}
        selectedCategory={selectedCategory}
        onSelectCategory={value => setSelectedCategory(value as SearchCategory)}
      />

      <FlatList
        data={filteredResults}
        keyExtractor={(item, index) => `${item.type}-${item.id}-${index}`}
        renderItem={renderResultItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          debouncedQuery ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          ) : undefined
        }
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
