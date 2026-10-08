import React, { useMemo, useState } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from './common/AppText';
import AppInput from './common/Input/AppInput';
import { useTheme } from '../hooks/useTheme';
import { moderateScale } from '../utils/responsive';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { ThemeColors } from '../constants/Colors';
import {
  getPriorityLabel,
  getPriorityThemeColor,
  TASK_PRIORITY_OPTIONS,
} from '../utils/enum';
import { ProjectMember } from '../types/project.type';
import { CustomStatus } from '../types/customstatus.type';

export type FilterCategory = 'assignee' | 'status' | 'priority' | 'work_type';

export interface FilterItemOption {
  id: string;
  label: string;
  color?: string;
  avatarChar?: string;
  avatarUrl?: string | null;
}

export interface SelectedFilters {
  assignee: string[];
  status: string[];
  priority: string[];
  work_type: string[];
}

interface BoardFilterModalProps {
  visible: boolean;
  onClose: () => void;
  members?: ProjectMember[];
  statuses?: CustomStatus[];
  selectedFilters: SelectedFilters;
  onApplyFilters: (filters: SelectedFilters) => void;
  onLoadMoreAssignees?: () => void;
  hasMoreAssignees?: boolean;
  isLoadingAssignees?: boolean;
}

const CATEGORIES: { key: FilterCategory; label: string }[] = [
  { key: 'assignee', label: 'Assignee' },
  { key: 'status', label: 'Status' },
  { key: 'priority', label: 'Priority' },
  { key: 'work_type', label: 'Work type' },
];

const WORK_TYPE_OPTIONS: FilterItemOption[] = [
  { id: 'task', label: 'Task' },
  { id: 'bug', label: 'Bug' },
  { id: 'story', label: 'Story' },
];

const FilterCategoryItem = ({
  category,
  isSelected,
  count,
  onPress,
  colors,
}: {
  category: { key: FilterCategory; label: string };
  isSelected: boolean;
  count: number;
  onPress: () => void;
  colors: ThemeColors;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className='flex-row items-center justify-between border-b py-4 pl-3'
    style={{
      borderBottomColor: colors.border,
      backgroundColor: isSelected ? `${colors.primary}15` : colors.background,
    }}
  >
    <View className='flex-1 flex-row items-center gap-2'>
      <AppText
        variant='body'
        style={{ color: isSelected ? colors.primary : colors.text }}
        className={isSelected ? 'font-bold' : ''}
      >
        {category.label}
      </AppText>
      {count > 0 && (
        <View
          className='items-center justify-center rounded-full px-0.5 py-0.5'
          style={{ backgroundColor: colors.primary, minWidth: 18 }}
        >
          <AppText variant='caption' className='font-bold' color={colors.white}>
            {count}
          </AppText>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

const FilterOptionRow = ({
  item,
  isChecked,
  onPress,
  colors,
  showAvatar = false,
  showColor = false,
}: {
  item: FilterItemOption;
  isChecked: boolean;
  onPress: () => void;
  colors: ThemeColors;
  showAvatar?: boolean;
  showColor?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className='flex-row items-center py-2'
  >
    <View
      className='mr-3 items-center justify-center rounded border'
      style={{
        width: 18,
        height: 18,
        borderColor: isChecked ? colors.primary : colors.black + '50',
        backgroundColor: isChecked ? colors.primary : 'transparent',
      }}
    >
      {isChecked && <Ionicons name='checkmark' size={12} color='#FFFFFF' />}
    </View>

    {showAvatar && (item.avatarUrl || item.avatarChar) && (
      <View
        className='mr-2 items-center justify-center rounded-full'
        style={{
          width: 22,
          height: 22,
          backgroundColor: item.color || colors.primary,
        }}
      >
        {item.avatarUrl ? (
          <Image
            source={{ uri: item.avatarUrl }}
            style={{ width: 22, height: 22, borderRadius: 11 }}
          />
        ) : (
          <AppText
            variant='caption'
            color={colors.white}
            style={{ fontSize: 10, fontWeight: 'bold' }}
          >
            {item.avatarChar}
          </AppText>
        )}
      </View>
    )}

    {!showAvatar && showColor && item.color && (
      <View
        className='mr-2 rounded-full'
        style={{
          width: 12,
          height: 12,
          backgroundColor: item.color,
        }}
      />
    )}

    <AppText
      variant='body'
      numberOfLines={1}
      style={{ color: colors.text }}
      className='flex-1'
    >
      {item.label}
    </AppText>
  </TouchableOpacity>
);

export const BoardFilterModal: React.FC<BoardFilterModalProps> = ({
  visible,
  onClose,
  members,
  statuses,
  selectedFilters,
  onApplyFilters,
  onLoadMoreAssignees,
  hasMoreAssignees = false,
  isLoadingAssignees = false,
}) => {
  const { colors } = useTheme();
  const { layout } = useAuthLayout();
  const insets = useSafeAreaInsets();

  const [activeCategory, setActiveCategory] =
    useState<FilterCategory>('assignee');
  const [localFilters, setLocalFilters] =
    useState<SelectedFilters>(selectedFilters);
  const [searchQuery, setSearchQuery] = useState('');

  const [assigneePage, setAssigneePage] = useState(1);
  const [statusPage, setStatusPage] = useState(1);
  const PAGE_SIZE = 10;

  const closeIconSize = moderateScale(20);
  const bottomPadding = Math.max(insets.bottom, 16);

  const assigneeOptions = useMemo(() => {
    if (!members) return [];
    return members.map(member => ({
      id: member.user_id,
      label: member.full_name || member.username,
      color: member.color || colors.primary,
      avatarUrl: member.avatar_url,
      avatarChar: (member.full_name || member.username).charAt(0).toUpperCase(),
    }));
  }, [members, colors.primary]);

  const statusOptions = useMemo(() => {
    if (!statuses) return [];
    return statuses.map(status => ({
      id: status.id,
      label: status.name,
      color: status.color,
    }));
  }, [statuses]);

  const priorityOptions = useMemo(() => {
    return TASK_PRIORITY_OPTIONS.map(priority => ({
      id: priority,
      label: getPriorityLabel(priority),
      color: getPriorityThemeColor(priority, colors),
    }));
  }, [colors]);

  const options = useMemo(
    () => ({
      assignee: assigneeOptions,
      status: statusOptions,
      priority: priorityOptions,
      work_type: WORK_TYPE_OPTIONS,
    }),
    [assigneeOptions, statusOptions, priorityOptions],
  );

  React.useEffect(() => {
    if (visible) {
      setLocalFilters(selectedFilters);
      setSearchQuery('');
      setAssigneePage(1);
      setStatusPage(1);
    }
  }, [visible, selectedFilters]);

  React.useEffect(() => {
    if (activeCategory === 'assignee') setAssigneePage(1);
    if (activeCategory === 'status') setStatusPage(1);
  }, [searchQuery, activeCategory]);

  const toggleOption = (categoryId: FilterCategory, id: string) => {
    setLocalFilters(prev => {
      const currentList = prev[categoryId] || [];
      const updated = currentList.includes(id)
        ? currentList.filter(item => item !== id)
        : [...currentList, id];
      return { ...prev, [categoryId]: updated };
    });
  };

  const handleClearAll = () => {
    const cleared: SelectedFilters = {
      assignee: [],
      status: [],
      priority: [],
      work_type: [],
    };
    setLocalFilters(cleared);
    onApplyFilters(cleared);
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const currentCategoryOptions = useMemo(() => {
    const list = options[activeCategory] || [];
    if (!searchQuery.trim()) return list;
    return list.filter(item =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [options, activeCategory, searchQuery]);

  const paginatedOptions = useMemo(() => {
    if (activeCategory === 'assignee') return currentCategoryOptions;
    if (activeCategory === 'status') {
      return currentCategoryOptions.slice(0, statusPage * PAGE_SIZE);
    }
    return currentCategoryOptions;
  }, [currentCategoryOptions, activeCategory, assigneePage, statusPage]);

  const hasMoreOptions =
    paginatedOptions.length < currentCategoryOptions.length;

  const handleLoadMore = () => {
    if (activeCategory === 'assignee') onLoadMoreAssignees?.();
    else if (activeCategory === 'status') {
      setStatusPage(prev => prev + 1);
    }
  };

  const selectedCountForCategory = (cat: FilterCategory) =>
    localFilters[cat]?.length || 0;

  const handleCategoryPress = (category: FilterCategory) => {
    setActiveCategory(category);
    setSearchQuery('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className='flex-1 justify-end bg-black/50'>
        {/* Backdrop dismiss */}
        <Pressable className='flex-1' onPress={onClose} />

        {/* Bottom Sheet Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            paddingBottom: bottomPadding + 8,
            maxHeight: '88%',
          }}
          className='rounded-t-3xl border shadow-xl'
        >
          {/* Grab Handle */}
          <View className='items-center pb-2 pt-3'>
            <View
              style={{ backgroundColor: colors.border || '#E2E8F0' }}
              className='h-1.5 w-12 rounded-full'
            />
          </View>

          {/* Header Row */}
          <View
            className='flex-row items-center justify-between border-b px-6 pb-3 pt-1'
            style={{ borderBottomColor: colors.border }}
          >
            <AppText
              variant='h2'
              color={colors.text}
              style={{ fontSize: moderateScale(18) }}
              className='font-bold'
            >
              Filter
            </AppText>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
              className='rounded-full border p-2'
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name='close-outline'
                size={closeIconSize}
                color={colors.textSecondary || '#6B778C'}
              />
            </TouchableOpacity>
          </View>

          {/* Master-Detail Filter Body */}
          <View className='flex-row' style={{ height: moderateScale(350) }}>
            {/* Left Sidebar */}
            <ScrollView
              style={{
                width: moderateScale(150),
                flexGrow: 0,
                borderRightWidth: 1,
                borderRightColor: colors.border,
                backgroundColor: colors.background,
              }}
              showsVerticalScrollIndicator={false}
            >
              {CATEGORIES.map(category => {
                const isSelected = activeCategory === category.key;
                const count = selectedCountForCategory(category.key);
                return (
                  <FilterCategoryItem
                    key={category.key}
                    category={category}
                    isSelected={isSelected}
                    count={count}
                    onPress={() => handleCategoryPress(category.key)}
                    colors={colors}
                  />
                );
              })}
            </ScrollView>

            {/* Right Options Content */}
            <View className='flex-1'>
              {/* Search Field */}
              <View className='mx-3 mt-3'>
                <AppInput
                  placeholder={`Search ${CATEGORIES.find(c => c.key === activeCategory)?.label.toLowerCase()}...`}
                  placeholderTextColor={colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  leftIcon={
                    <Ionicons
                      name='search-outline'
                      size={16}
                      color={colors.textSecondary}
                    />
                  }
                />
              </View>

              {/* Category Subtitle */}
              <AppText
                variant='caption'
                className='mx-3 mb-2 mt-3 text-[11px] font-bold tracking-wide'
                style={{ color: colors.textSecondary }}
              >
                FILTER BY{' '}
                {CATEGORIES.find(
                  c => c.key === activeCategory,
                )?.label.toUpperCase()}
              </AppText>

              {/* Options */}
              <ScrollView
                className='flex-1 px-3'
                showsVerticalScrollIndicator={false}
              >
                {paginatedOptions.map(item => (
                  <FilterOptionRow
                    key={item.id}
                    item={item}
                    isChecked={localFilters[activeCategory].includes(item.id)}
                    onPress={() => toggleOption(activeCategory, item.id)}
                    colors={colors}
                    showAvatar={activeCategory === 'assignee'}
                    showColor={activeCategory === 'status'}
                  />
                ))}

                {(activeCategory === 'assignee'
                  ? hasMoreAssignees
                  : hasMoreOptions) && (
                  <TouchableOpacity
                    onPress={
                      activeCategory === 'assignee'
                        ? onLoadMoreAssignees
                        : handleLoadMore
                    }
                    disabled={
                      activeCategory === 'assignee' && isLoadingAssignees
                    }
                    activeOpacity={0.7}
                    className='py-3'
                  >
                    <AppText
                      variant='body'
                      color={colors.primary}
                      className='font-semibold'
                    >
                      {activeCategory === 'assignee' && isLoadingAssignees
                        ? 'Loading…'
                        : 'Load more'}
                    </AppText>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          </View>

          {/* Action Buttons Footer */}
          <View
            className='flex-row items-center justify-end border-t px-6 pt-3'
            style={{
              borderTopColor: colors.border,
              gap: layout.sectionGap,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleClearAll}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
              className='rounded-xl border px-5 py-3'
            >
              <AppText
                variant='body'
                color={colors.text}
                style={{ fontSize: moderateScale(14) }}
                className='font-semibold'
              >
                Reset
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleApply}
              style={{
                backgroundColor: colors.primary,
              }}
              className='rounded-xl px-6 py-3'
            >
              <AppText
                variant='body'
                color={colors.white || '#FFFFFF'}
                style={{ fontSize: moderateScale(14) }}
                className='font-bold'
              >
                Apply
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default BoardFilterModal;
