import React from 'react';
import {
  View,
  TouchableOpacity,
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
  onSelect: (item: DropdownItem<T>) => void;
  isOpen: boolean;
  onToggle: () => void;
  placeholder?: string;
  width?: DimensionValue;
  containerStyle?: StyleProp<ViewStyle>;
  direction?: 'up' | 'down';
  showIndicatorDot?: boolean;
}

export const CustomDropdown = <T extends string | number>({
  label,
  items,
  selectedValue,
  onSelect,
  isOpen,
  onToggle,
  placeholder = 'Select option',
  width = '100%',
  containerStyle,
  direction = 'up',
  showIndicatorDot = true,
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
          className='flex-row items-center rounded-md border'
          style={{
            minHeight: layout.controlSize * 1.4,
            backgroundColor: selectedItem ? `${activeColor}1A` : colors.surface,
            borderColor: colors.border || '#E2E8F0',
            paddingHorizontal: layout.paddingHorizontal || moderateScale(10),
            paddingVertical: layout.elementGap || moderateScale(6),
            gap: layout.elementGap || moderateScale(6),
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
              color={selectedItem ? activeColor : colors.textSecondary}
              numberOfLines={1}
              ellipsizeMode='tail'
              className={selectedItem ? 'font-semibold' : 'font-normal'}
              style={{ fontSize: moderateScale(13) }}
            >
              {selectedItem?.name || placeholder}
            </AppText>
          </View>

          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={moderateScale(14)}
            color={selectedItem ? activeColor : colors.textSecondary}
          />
        </TouchableOpacity>

        {isOpen && (
          <View
            className='absolute left-0 z-50 border shadow-lg'
            style={[
              dropdownPositionStyle,
              {
                width: '100%',
                borderRadius: Radius.sm || moderateScale(8),
                backgroundColor: colors.card || colors.surface,
                borderColor: colors.border || '#E2E8F0',
                paddingHorizontal: layout.paddingHorizontal || moderateScale(8),
                paddingVertical: layout.elementGap || moderateScale(6),
                gap: layout.tightGap || moderateScale(4),
              },
            ]}
          >
            {items.map(item => {
              const isSelected =
                selectedValue !== undefined &&
                String(item.id) === String(selectedValue);
              const itemColor = item.color || colors.text;

              return (
                <TouchableOpacity
                  key={String(item.id)}
                  activeOpacity={0.8}
                  onPress={() => onSelect(item)}
                  className='flex-row items-center rounded-md'
                  style={{
                    minHeight: layout.controlSize * 1.2,
                    paddingVertical: layout.tightGap || moderateScale(4),
                    paddingHorizontal: moderateScale(4),
                    gap: layout.elementGap || moderateScale(6),
                  }}
                >
                  {showIndicatorDot && (
                    <View
                      style={{
                        width: moderateScale(8),
                        height: moderateScale(8),
                        borderRadius: moderateScale(4),
                        backgroundColor: item.color || colors.textSecondary,
                      }}
                    />
                  )}

                  <AppText
                    variant='body'
                    color={isSelected ? itemColor : colors.text}
                    className={isSelected ? 'font-bold' : 'font-normal'}
                    numberOfLines={1}
                    style={{ fontSize: moderateScale(13) }}
                  >
                    {item.name}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
};

export default CustomDropdown;
