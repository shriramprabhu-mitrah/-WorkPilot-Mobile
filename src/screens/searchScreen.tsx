import React, { useMemo, useState } from 'react';
import { View, TextInput, TouchableOpacity, FlatList } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AppText from '../components/common/AppText';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { RootStackParamList } from '../types/navigationTypes';
import {
  FILTERS,
  RECENT_SEARCHES,
  getSearchResultsData,
  getTrendingData,
} from '../data/searchScreenData';
import Screen from '../components/common/ScreenWapper';
import { moderateScale } from '../utils/responsive';

const SearchScreen = () => {
  const { colors, strings } = useTheme();
  const { layout } = useAuthLayout();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const trendingList = useMemo(() => getTrendingData(colors), [colors]);
  const searchResultsList = useMemo(
    () => getSearchResultsData(colors),
    [colors],
  );

  const filteredResults = useMemo(() => {
    return searchResultsList.filter(item => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        selectedFilter === 'All' || item.type === selectedFilter;

      return matchesSearch && matchesFilter;
    });
  }, [search, selectedFilter]);

  // Helper to resolve dynamic color keys to theme colors
  const getItemBgColor = (colorKey?: string) => {
    if (!colorKey) return colors.primary;
    return (colors as Record<string, string>)[colorKey] || colors.primary;
  };

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      {/* Search Header Container */}
      <View
        style={{
          backgroundColor: colors.card || colors.surface,
          paddingHorizontal: layout.paddingHorizontal,
          paddingTop: layout.elementGap,
          paddingBottom: layout.elementGap,
          borderBottomWidth: 1,
          borderColor: colors.border,
        }}
      >
        {/* Search Input Box */}
        <View
          className='flex-row items-center rounded-xl border'
          style={{
            backgroundColor: colors.surface || colors.background,
            borderColor: colors.border,
            paddingHorizontal: layout.paddingHorizontal / 1.5,
          }}
        >
          <Ionicons
            name='search-outline'
            size={layout.iconSize * 0.8}
            color={colors.placeholder || colors.textSecondary}
          />
          <TextInput
            placeholder={
              strings?.search?.placeholder ||
              'Search issues, projects, people...'
            }
            placeholderTextColor={colors.placeholder || colors.textSecondary}
            value={search}
            onChangeText={setSearch}
            className='flex-1'
            style={{
              color: colors.text,
              fontSize: layout.bodyFontSize,
              marginLeft: layout.tightGap,
            }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons
                name='close'
                size={layout.iconSize * 0.8}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
        {/* Filter Chips Horizontal List */}
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: layout.elementGap,
          }}
          renderItem={({ item }) => {
            const active = item === selectedFilter;
            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSelectedFilter(item)}
                className='rounded-full border'
                style={{
                  backgroundColor: active
                    ? colors.primary
                    : colors.surface || colors.background,
                  borderColor: active ? colors.primary : colors.border,
                  paddingHorizontal: layout.paddingHorizontal,
                  paddingVertical: moderateScale(5),
                  marginRight: layout.tightGap * 1.5,
                }}
              >
                <AppText
                  variant='body'
                  color={active ? colors.white : colors.textSecondary}
                  className='font-medium'
                >
                  {item}
                </AppText>
              </TouchableOpacity>
            );
          }}
        />
      </View>
      {/* Content Area */}
      {search.trim().length === 0 ? (
        <FlatList
          data={trendingList}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: layout.sectionGap * 2,
          }}
          ListHeaderComponent={
            <View
              style={{
                paddingHorizontal: layout.paddingHorizontal,
                paddingTop: layout.elementGap * 1.5,
              }}
            >
              {/* Recent Searches Header */}
              <View
                className='mb-3 flex-row items-center'
                style={{ gap: layout.tightGap }}
              >
                <Ionicons
                  name='time-outline'
                  size={layout.iconSize * 0.8}
                  color={colors.textSecondary}
                />
                <AppText
                  variant='title'
                  color={colors.text}
                  className='text-base font-semibold'
                >
                  {strings?.search?.recentSearches || 'Recent searches'}
                </AppText>
              </View>
              {/* Recent Searches Group Card */}
              <View
                className='mb-6 overflow-hidden rounded-2xl border'
                style={{
                  backgroundColor: colors.card || colors.surface,
                  borderColor: colors.border,
                }}
              >
                {RECENT_SEARCHES.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.8}
                    className='flex-row items-center'
                    style={{
                      paddingHorizontal: layout.paddingHorizontal,
                      paddingVertical: layout.elementGap,
                      borderBottomWidth:
                        index !== RECENT_SEARCHES.length - 1 ? 1 : 0,
                      borderColor: colors.itemDivider || colors.border,
                    }}
                    onPress={() => setSearch(item)}
                  >
                    <Ionicons
                      name='time-outline'
                      size={layout.iconSize * 0.75}
                      color={colors.placeholder || colors.textSecondary}
                    />
                    <AppText
                      variant='body'
                      color={colors.text}
                      className='ml-3 flex-1'
                    >
                      {item}
                    </AppText>

                    <Ionicons
                      name='chevron-forward'
                      size={layout.iconSize * 0.75}
                      color={colors.placeholder || colors.textSecondary}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              {/* Trending Header */}
              <View
                className='mb-3 flex-row items-center'
                style={{ gap: layout.tightGap }}
              >
                <Ionicons
                  name='trending-up-outline'
                  size={layout.iconSize * 0.8}
                  color={colors.textSecondary}
                />
                <AppText
                  variant='title'
                  color={colors.text}
                  className='text-base font-semibold'
                >
                  {strings?.search?.trendingTitle ||
                    'Trending in your workspace'}
                </AppText>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('issue', { id: item.id })}
              activeOpacity={0.85}
              className='mb-3 flex-row items-center rounded-2xl border'
              style={{
                marginHorizontal: layout.paddingHorizontal,
                backgroundColor: colors.card || colors.surface,
                borderColor: colors.border,
                paddingHorizontal: layout.paddingHorizontal,
                paddingVertical: layout.elementGap,
              }}
            >
              {/* Badge Avatar */}
              <View
                className='items-center justify-center rounded'
                style={{
                  width: layout.avatarSizeSmall,
                  height: layout.avatarSizeSmall,
                  backgroundColor: getItemBgColor(item.color),
                }}
              >
                <AppText
                  variant='caption'
                  color={colors.white}
                  className='font-bold'
                >
                  {item.letter}
                </AppText>
              </View>
              {/* Info Text */}
              <View className='ml-3 flex-1'>
                <AppText
                  variant='body'
                  color={colors.text}
                  numberOfLines={1}
                  className='font-semibold'
                >
                  {item.title}
                </AppText>
                <AppText
                  variant='caption'
                  color={colors.textSecondary}
                  className='mt-1'
                >
                  {item.subtitle}
                </AppText>
              </View>
              <Ionicons
                name='chevron-forward'
                size={layout.iconSize * 0.75}
                color={colors.placeholder || colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        />
      ) : (
        /* Search Results Container */
        <View
          className='flex-1'
          style={{ paddingHorizontal: layout.paddingHorizontal }}
        >
          <AppText
            variant='caption'
            color={colors.textSecondary}
            className='my-3'
          >
            {filteredResults.length}{' '}
            {filteredResults.length === 1
              ? strings?.search?.resultSingle || 'result'
              : strings?.search?.resultPlural || 'results'}{' '}
            {strings?.search?.for || 'for'} "{search}"
          </AppText>

          <FlatList
            data={filteredResults}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps='handled'
            contentContainerStyle={{
              paddingBottom: layout.sectionGap * 2,
            }}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.navigate('issue', { id: item.id })}
                className='mb-3 flex-row items-center rounded-2xl border'
                style={{
                  backgroundColor: colors.card || colors.surface,
                  borderColor: colors.border,
                  paddingHorizontal: layout.paddingHorizontal,
                  paddingVertical: layout.elementGap,
                }}
              >
                {/* Badge Avatar */}
                <View
                  className='items-center justify-center rounded'
                  style={{
                    width: layout.avatarSizeSmall,
                    height: layout.avatarSizeSmall,
                    backgroundColor: getItemBgColor(item.color),
                  }}
                >
                  <AppText
                    variant='caption'
                    color={colors.white}
                    className='font-bold'
                  >
                    {item.letter}
                  </AppText>
                </View>
                <View className='ml-3 flex-1'>
                  <AppText
                    variant='body'
                    color={colors.text}
                    numberOfLines={1}
                    className='font-semibold'
                  >
                    {item.title}
                  </AppText>
                  <AppText
                    variant='caption'
                    color={colors.textSecondary}
                    className='mt-1'
                  >
                    {item.subtitle}
                  </AppText>
                </View>
                <Ionicons
                  name='chevron-forward'
                  size={layout.iconSize * 0.75}
                  color={colors.placeholder || colors.textSecondary}
                />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View
                className='items-center justify-center'
                style={{ paddingVertical: layout.sectionGap * 3 }}
              >
                <Ionicons
                  name='search-outline'
                  size={layout.iconSize * 2.5}
                  color={colors.placeholder || colors.textSecondary}
                />
                <AppText
                  variant='title'
                  color={colors.text}
                  className='mt-4 font-semibold'
                >
                  {strings?.search?.noResultsTitle || 'No results found'}
                </AppText>
                <AppText
                  variant='body'
                  color={colors.textSecondary}
                  className='mt-1 text-center'
                >
                  {strings?.search?.noResultsSubtitle ||
                    'Try searching with a different keyword.'}
                </AppText>
              </View>
            }
          />
        </View>
      )}
    </Screen>
  );
};

export default SearchScreen;
