import React from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleProp,
  ViewStyle,
  DimensionValue,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from './common/AppText';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { Radius } from '../constants/Radius';
import { moderateScale } from '../utils/responsive';

export interface DropdownItem<T = string | number> {
  id: T;
  name: string;
  color?: string;
}

interface CustomDropdownProps<T = string | number> {
  label?: string;
  items: DropdownItem<T>[];
  selectedValue?: T;
  selectedValues?: T[];
  onSelect: (item: DropdownItem<T>) => void;
  isOpen: boolean;
  onToggle: () => void;
  placeholder?: string;
  width?: DimensionValue;
  containerStyle?: StyleProp<ViewStyle>;
  direction?: 'up' | 'down';
  showIndicatorDot?: boolean;
  renderSearchBar?: () => React.ReactNode;
}

export const CustomDropdown = <T extends string | number>({
  label,
  items,
  selectedValue,
  selectedValues,
  onSelect,
  isOpen,
  onToggle,
  placeholder = 'Select option',
  width = '100%',
  containerStyle,
  direction = 'up',
  showIndicatorDot = false,
  renderSearchBar,
}: CustomDropdownProps<T>) => {
  const { colors } = useTheme();
  const { layout } = useAuthLayout();

  const selectedItem = items.find(
    item =>
      selectedValue !== undefined && String(item.id) === String(selectedValue),
  );
  const activeColor = selectedItem?.color || colors.textSecondary;

  const dropdownPositionStyle: ViewStyle =
    direction === 'up'
      ? { bottom: '100%', marginBottom: moderateScale(6) }
      : { top: '100%', marginTop: moderateScale(6) };

  const isItemSelected = (itemId: T) => {
    if (selectedValues && Array.isArray(selectedValues)) {
      return selectedValues.some(val => String(val) === String(itemId));
    }
    return (
      selectedValue !== undefined && String(selectedValue) === String(itemId)
    );
  };

  return (
    <View style={[{ width, gap: moderateScale(6) }, containerStyle]}>
      {label ? (
        <AppText
          variant='body'
          color={colors.text}
          style={{
            fontWeight: '600',
            fontSize: moderateScale(14),
          }}
        >
          {label}
        </AppText>
      ) : null}

      <View className='relative' style={{ width: '100%' }}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onToggle}
          className='flex-row items-center rounded-lg border'
          style={{
            minHeight: layout.controlSize * 1.35,
            backgroundColor: colors.surface || '#FFFFFF',
            borderColor: colors.border || '#E2E8F0',
            paddingHorizontal: moderateScale(12),
            paddingVertical: moderateScale(8),
            gap: moderateScale(8),
          }}
        >
          {showIndicatorDot && (
            <View
              style={{
                width: moderateScale(8),
                height: moderateScale(8),
                borderRadius: moderateScale(4),
                backgroundColor: activeColor,
              }}
            />
          )}

          <View className='min-w-0 flex-1'>
            <AppText
              variant='body'
              color={selectedItem ? colors.text : colors.textSecondary}
              numberOfLines={1}
              ellipsizeMode='tail'
              style={{ fontSize: moderateScale(13) }}
            >
              {selectedItem
                ? selectedItem.name.charAt(0).toUpperCase() +
                  selectedItem.name.slice(1)
                : placeholder}
            </AppText>
          </View>

          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={moderateScale(15)}
            color={colors.textSecondary || '#64748B'}
          />
        </TouchableOpacity>

        {isOpen && (
          <View
            className='absolute left-0 z-50 overflow-hidden border shadow-lg'
            style={[
              dropdownPositionStyle,
              {
                width: '100%',
                borderRadius: Radius.md || moderateScale(10),
                backgroundColor: colors.card || '#FFFFFF',
                borderColor: colors.border || '#E2E8F0',
                paddingVertical: moderateScale(2),
                elevation: 20,
                zIndex: 99999,
              },
            ]}
          >
            {renderSearchBar && (
              <View className='px-3 pt-2'>{renderSearchBar()}</View>
            )}
            <ScrollView
              nestedScrollEnabled
              keyboardShouldPersistTaps='handled'
              showsVerticalScrollIndicator
              style={{
                maxHeight: moderateScale(240),
              }}
              contentContainerStyle={{
                flexGrow: 0,
              }}
            >
              {items.map((item, _index) => {
                const selected = isItemSelected(item.id);

                return (
                  <View key={String(item.id)}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => onSelect(item)}
                      className='flex-row items-center justify-between'
                      style={{
                        paddingVertical: moderateScale(10),
                        paddingHorizontal: moderateScale(14),
                        backgroundColor: selected
                          ? 'rgba(37, 99, 235, 0.08)'
                          : 'transparent',
                      }}
                    >
                      <AppText
                        variant='body'
                        numberOfLines={1}
                        style={{
                          fontSize: moderateScale(13.5),
                          color: selected
                            ? colors.primary || '#2563EB'
                            : colors.text || '#1E293B',
                          fontWeight: selected ? '500' : '400',
                          flex: 1,
                        }}
                      >
                        {item.name}
                      </AppText>

                      {selected && (
                        <Ionicons
                          name='checkmark-sharp'
                          size={moderateScale(15)}
                          color={colors.primary || '#2563EB'}
                          style={{ marginLeft: moderateScale(8) }}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
};

export default CustomDropdown;
