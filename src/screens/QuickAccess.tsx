import React, { useRef } from 'react';
import { View, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import { CommonHeader } from '../components/common/CommonHeader';
import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { useAppDispatch, useAppSelector } from '../store';
import {
  setIsSearching,
  setSearchQuery,
  setSelectedFilter,
  addQuickAccessItem,
  removeQuickAccessItem,
  QuickAccessItem,
} from '../store/home_store/reducer/home.reducer';
import { getWorkItemIcon } from '../components/common/getWorkItemIcon';
import { ViewedItem } from '../types/home.type';

const ALL_AVAILABLE_ITEMS: ViewedItem[] = [
  {
    id: 'v1',
    title: 'Workpilot Project Planning',
    type: 'project',
    category: 'Business project',
  },
  {
    id: 'v2',
    title: 'WORK board',
    type: 'board',
    category: 'Board',
    projectName: 'Workpilot',
  },
  {
    id: 'v3',
    title: 'WOR board',
    type: 'board',
    category: 'Board',
    projectName: 'Workpilotsprints',
  },
  {
    id: 'v4',
    title: 'Loan type selection',
    type: 'task',
    category: 'Task',
    key: 'WOR-11',
    projectName: 'Workpilotsprints',
  },
  {
    id: 'v5',
    title: 'Forgot Password',
    type: 'userStory',
    category: 'User Story',
    key: 'WOR-10',
    projectName: 'Workpilotsprints',
  },
  {
    id: 'v6',
    title: 'User Login',
    type: 'userStory',
    category: 'User Story',
    key: 'WOR-9',
    projectName: 'Workpilotsprints',
  },
  {
    id: 'v7',
    title: 'Authentication screens',
    type: 'epic',
    category: 'Epic',
    key: 'WOR-4',
    projectName: 'Workpilotsprints',
  },
  {
    id: 'v8',
    title: 'User Registration',
    type: 'userStory',
    category: 'User Story',
    key: 'WOR-8',
    projectName: 'Workpilotsprints',
  },
  {
    id: 'v9',
    title: 'Payment Gateway Integration',
    type: 'epic',
    category: 'Epic',
    key: 'WOR-12',
    projectName: 'Workpilot',
  },
  {
    id: 'v10',
    title: 'Profile Settings Redesign',
    type: 'task',
    category: 'Task',
    key: 'WOR-13',
    projectName: 'Workpilotsprints',
  },
  {
    id: 'v11',
    title: 'Push Notifications Setup',
    type: 'task',
    category: 'Task',
    key: 'WOR-14',
    projectName: 'Workpilot',
  },
  {
    id: 'v12',
    title: 'Dashboard Analytics Chart',
    type: 'userStory',
    category: 'User Story',
    key: 'WOR-15',
    projectName: 'Workpilotsprints',
  },
  {
    id: 'v13',
    title: 'Bug: Navigation Bar Alignment',
    type: 'bug',
    category: 'Bug',
    key: 'WOR-16',
    projectName: 'Workpilotsprints',
  },
  {
    id: 'v14',
    title: 'Dark Mode Theme Implementation',
    type: 'task',
    category: 'Task',
    key: 'WOR-17',
    projectName: 'Workpilot',
  },
  {
    id: 'v15',
    title: 'KANBAN board',
    type: 'board',
    category: 'Board',
    projectName: 'Workpilot',
  },
  {
    id: 'v16',
    title: 'User Onboarding Flow',
    type: 'epic',
    category: 'Epic',
    key: 'WOR-18',
    projectName: 'Workpilot',
  },
  {
    id: 'v17',
    title: 'Bug: Session Timeout Crash',
    type: 'bug',
    category: 'Bug',
    key: 'WOR-19',
    projectName: 'Workpilotsprints',
  },
  {
    id: 'v18',
    title: 'Export Report to PDF',
    type: 'userStory',
    category: 'User Story',
    key: 'WOR-20',
    projectName: 'Workpilot',
  },
  {
    id: 'v19',
    title: 'Mobile App Optimization',
    type: 'project',
    category: 'Software project',
  },
  {
    id: 'v20',
    title: 'Role-based Access Controls',
    type: 'task',
    category: 'Task',
    key: 'WOR-21',
    projectName: 'Workpilotsprints',
  },
];
const FILTER_TAGS = ['Board', 'Filter', 'Work item', 'Space'];
const MAX_LIMIT = 6;

export const QuickAccess: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { layout, moderateScale, hp, isSmallHeight } = useAuthLayout();

  // Redux Store Selectors
  const { quickAccessItems, isSearching, searchQuery, selectedFilter } =
    useAppSelector(state => state.home);

  // Store initial snapshot to track changes
  const initialItemsRef = useRef<QuickAccessItem[]>(quickAccessItems);

  // Validation logic for Tick Icon
  const hasItems = quickAccessItems.length > 0;
  const isModified =
    quickAccessItems.length !== initialItemsRef.current.length ||
    quickAccessItems.some(
      (item, idx) => item.id !== initialItemsRef.current[idx]?.id,
    );
  const isSaveEnabled = hasItems && isModified;

  // Filter list strictly based on Search Query (List items remain fixed)
  const filteredSearchItems = ALL_AVAILABLE_ITEMS.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <CommonHeader
        variant='quickAccess'
        title='Quick access'
        titleAlignment='center'
        leftComponent={
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              if (isSearching) {
                dispatch(setIsSearching(false));
              } else {
                navigation.goBack();
              }
            }}
            className='items-center justify-center rounded-full'
            style={{
              width: moderateScale(36),
              height: moderateScale(36),
              backgroundColor: colors.background,
            }}
          >
            <Ionicons
              name={isSearching ? 'chevron-back' : 'close'}
              size={moderateScale(20)}
              color={colors.text}
            />
          </TouchableOpacity>
        }
        rightComponent={
          !isSearching ? (
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={!isSaveEnabled}
              onPress={() => navigation.goBack()}
              className='items-center justify-center rounded-full'
              style={{
                width: moderateScale(36),
                height: moderateScale(36),
                backgroundColor: isSaveEnabled ? colors.primary : colors.border,
              }}
            >
              <Ionicons
                name='checkmark'
                size={moderateScale(20)}
                color={isSaveEnabled ? colors.white : colors.textSecondary}
              />
            </TouchableOpacity>
          ) : undefined
        }
      >
        {isSearching && (
          <View>
            <View
              className='flex-row items-center rounded-full border px-3 py-2'
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border,
              }}
            >
              <Ionicons
                name='search-outline'
                size={moderateScale(18)}
                color={colors.textSecondary}
                style={{ marginRight: layout.tightGap }}
              />
              <TextInput
                value={searchQuery}
                onChangeText={text => dispatch(setSearchQuery(text))}
                placeholder='Search'
                placeholderTextColor={colors.textSecondary}
                autoFocus
                style={{
                  flex: 1,
                  color: colors.text,
                  fontSize: moderateScale(14),
                  padding: 0,
                }}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => dispatch(setSearchQuery(''))}>
                  <Ionicons
                    name='close-circle'
                    size={moderateScale(18)}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className='mt-3 flex-row'
              contentContainerStyle={{ gap: layout.tightGap * 1.5 }}
            >
              {FILTER_TAGS.map(tag => {
                const isSelected = selectedFilter === tag;
                return (
                  <TouchableOpacity
                    key={tag}
                    activeOpacity={0.8}
                    onPress={() =>
                      dispatch(setSelectedFilter(isSelected ? null : tag))
                    }
                    className='rounded-full border px-4 py-1.5'
                    style={{
                      backgroundColor: isSelected
                        ? colors.primary
                        : colors.background,
                      borderColor: colors.border,
                    }}
                  >
                    <AppText
                      variant='caption'
                      className='font-semibold'
                      color={isSelected ? colors.white : colors.text}
                    >
                      {tag}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </CommonHeader>

      {!isSearching ? (
        /* --- PREVIEW VIEW MODE --- */
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: layout.paddingHorizontal,
            paddingTop: layout.elementGap,
            paddingBottom: isSmallHeight ? hp(15) : hp(10),
          }}
        >
          <AppText
            variant='caption'
            className='mb-3 font-bold tracking-wider'
            color={colors.textSecondary}
          >
            PREVIEW
          </AppText>

          <View
            className='flex-row flex-wrap'
            style={{ gap: layout.elementGap }}
          >
            {quickAccessItems.map(item => (
              <View
                key={item.id}
                className='relative flex-row items-center rounded-2xl border p-3'
                style={{
                  width: '47%',
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                }}
              >
                <View
                  className='mr-2.5 items-center justify-center rounded-lg border'
                  style={{
                    width: moderateScale(34),
                    height: moderateScale(34),
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }}
                >
                  {getWorkItemIcon(item.type, {
                    size: moderateScale(16),
                    color: colors.text,
                  })}
                </View>

                <View className='flex-1 pr-3'>
                  <AppText
                    variant='caption'
                    className='font-semibold'
                    color={colors.text}
                    numberOfLines={1}
                  >
                    {item.title}
                  </AppText>
                  {item.subtitle && (
                    <AppText
                      variant='caption'
                      color={colors.textSecondary}
                      className='text-[11px]'
                      numberOfLines={1}
                    >
                      {item.subtitle}
                    </AppText>
                  )}
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => dispatch(removeQuickAccessItem(item.id))}
                  className='absolute -right-1 -top-1 items-center justify-center rounded-full border'
                  style={{
                    width: moderateScale(18),
                    height: moderateScale(18),
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }}
                >
                  <Ionicons
                    name='close'
                    size={moderateScale(12)}
                    color={colors.text}
                  />
                </TouchableOpacity>
              </View>
            ))}

            {quickAccessItems.length < MAX_LIMIT && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => dispatch(setIsSearching(true))}
                className='flex-row items-center rounded-2xl border border-dashed px-4 py-3.5'
                style={{
                  width: '47%',
                  borderColor: colors.border,
                  backgroundColor: 'transparent',
                }}
              >
                <Ionicons
                  name='add'
                  size={moderateScale(20)}
                  color={colors.text}
                  style={{ marginRight: layout.tightGap }}
                />
                <AppText
                  variant='body'
                  className='font-semibold'
                  color={colors.text}
                >
                  Add item
                </AppText>
              </TouchableOpacity>
            )}
          </View>

          <AppText
            variant='caption'
            className='mt-3 font-medium'
            color={colors.textSecondary}
          >
            Add up to {MAX_LIMIT} items.
          </AppText>

          <AppText
            variant='caption'
            className='mt-8 font-bold tracking-wider'
            color={colors.textSecondary}
          >
            YOUR STARRED ITEMS
          </AppText>
        </ScrollView>
      ) : (
        /* --- SEARCH SELECTION MODE --- */
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: layout.paddingHorizontal,
            paddingTop: layout.elementGap,
            paddingBottom: isSmallHeight ? hp(15) : hp(10),
          }}
        >
          <AppText
            variant='caption'
            className='mb-3 font-bold tracking-wider'
            color={colors.textSecondary}
          >
            SUGGESTIONS
          </AppText>

          <View
            className='rounded-2xl border'
            style={{
              backgroundColor: colors.background,
              borderColor: colors.border,
              overflow: 'hidden',
            }}
          >
            {filteredSearchItems.length > 0 ? (
              filteredSearchItems.map((item, index) => {
                const isAlreadyAdded = quickAccessItems.some(
                  added => added.id === item.id,
                );

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    disabled={isAlreadyAdded}
                    onPress={() => dispatch(addQuickAccessItem(item))}
                    className='flex-row items-center px-4 py-3.5'
                    style={{
                      borderBottomWidth:
                        index === filteredSearchItems.length - 1 ? 0 : 1,
                      borderBottomColor: colors.border,
                      opacity: isAlreadyAdded ? 0.5 : 1,
                    }}
                  >
                    <View
                      className='mr-3.5 items-center justify-center rounded-lg border'
                      style={{
                        width: moderateScale(34),
                        height: moderateScale(34),
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      }}
                    >
                      {getWorkItemIcon(item.type, {
                        size: moderateScale(16),
                        color: colors.text,
                      })}
                    </View>

                    <AppText
                      variant='body'
                      className='flex-1 font-semibold'
                      color={colors.text}
                      numberOfLines={1}
                    >
                      {item.title}
                    </AppText>

                    {isAlreadyAdded && (
                      <Ionicons
                        name='checkmark-circle'
                        size={moderateScale(18)}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })
            ) : (
              <View className='items-center p-4'>
                <AppText variant='body' color={colors.textSecondary}>
                  No items match your search.
                </AppText>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </Screen>
  );
};

export default QuickAccess;
