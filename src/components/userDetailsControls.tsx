import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppInput from './common/Input/AppInput';
import { useTheme } from '../theme/ThemeProvider';
import AppText from './common/AppText';
import { Radius } from '../constants/Radius';
import { moderateScale } from '../utils/responsive';
import CustomDropdown from './CustomDropdown';

interface UserDetailsFilterBarProps {
  isProjectContext: boolean;
  totalCount: number;
  appliedFiltersCount: number;
  statusOptions: { id: string; name: string }[];
  selectedStatus: string;
  isStatusDropdownOpen: boolean;
  onSelectStatus: (statusId: string) => void;
  onToggleStatusDropdown: () => void;
  onOpenFilterModal: () => void;
}

export const UserDetailsFilterBar: React.FC<UserDetailsFilterBarProps> =
  React.memo(
    ({
      isProjectContext,
      totalCount,
      appliedFiltersCount,
      statusOptions,
      selectedStatus,
      isStatusDropdownOpen,
      onSelectStatus,
      onToggleStatusDropdown,
      onOpenFilterModal,
    }) => {
      const { colors } = useTheme();

      return (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            marginTop: 2,
            zIndex: 20,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <AppText variant='h4' style={{ fontWeight: '800' }}>
              {isProjectContext ? 'Assigned Tasks' : 'Projects'}
            </AppText>
            <View
              style={{
                minWidth: 24,
                alignItems: 'center',
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: Radius.circle,
                backgroundColor: colors.primary,
              }}
            >
              <AppText
                variant='caption'
                color={colors.white}
                style={{ fontWeight: '700' }}
              >
                {totalCount}
              </AppText>
            </View>
          </View>

          {isProjectContext ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onOpenFilterModal}
              className='ml-2 flex-row items-center'
              style={{
                backgroundColor: colors.primary,
                borderRadius: Radius.md,
                paddingHorizontal: moderateScale(10),
                paddingVertical: moderateScale(7),
              }}
            >
              <Ionicons
                name='filter-outline'
                size={moderateScale(16)}
                color={colors.white}
              />
              <AppText
                variant='caption'
                className='ml-1 font-bold'
                color={colors.white}
              >
                Filter{' '}
                {appliedFiltersCount > 0 ? `(${appliedFiltersCount})` : ''}
              </AppText>
            </TouchableOpacity>
          ) : (
            <CustomDropdown
              items={statusOptions}
              selectedValue={selectedStatus}
              onSelect={item => onSelectStatus(String(item.id))}
              isOpen={isStatusDropdownOpen}
              onToggle={onToggleStatusDropdown}
              placeholder='Filter status'
              width={moderateScale(150)}
              direction='down'
            />
          )}
        </View>
      );
    },
  );

interface UserDetailsSearchBarProps {
  searchQuery: string;
  isProjectContext: boolean;
  onChangeSearch: (query: string) => void;
  onClearSearch: () => void;
}

export const UserDetailsSearchBar: React.FC<UserDetailsSearchBarProps> =
  React.memo(
    ({ searchQuery, isProjectContext, onChangeSearch, onClearSearch }) => {
      const { colors } = useTheme();

      return (
        <View style={{ backgroundColor: colors.card, borderRadius: Radius.md }}>
          <AppInput
            value={searchQuery}
            onChangeText={onChangeSearch}
            placeholder={
              isProjectContext
                ? 'Search tasks by title or key...'
                : 'Search projects or organizations...'
            }
            placeholderTextColor={colors.placeholder}
            returnKeyType='search'
            leftIcon={
              <Ionicons
                name='search-outline'
                size={moderateScale(18)}
                color={colors.textSecondary}
              />
            }
            rightIcon={
              !!searchQuery ? (
                <TouchableOpacity
                  accessibilityLabel='Clear search'
                  onPress={onClearSearch}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Ionicons
                    name='close-circle'
                    size={moderateScale(18)}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              ) : null
            }
          />
        </View>
      );
    },
  );
