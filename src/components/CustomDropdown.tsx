import React, { useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleProp,
  ViewStyle,
  DimensionValue,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
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
  const buttonRef = useRef<View>(null);
  const [dropdownCoords, setDropdownCoords] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>({ x: 0, y: 0, width: 0, height: 0 });

  const selectedItem = items.find(
    item =>
      selectedValue !== undefined && String(item.id) === String(selectedValue),
  );
  const activeColor = selectedItem?.color || colors.textSecondary;

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      buttonRef.current.measureInWindow((x, y, btnWidth, btnHeight) => {
        setDropdownCoords({ x, y, width: btnWidth, height: btnHeight });
        onToggle();
      });
    } else {
      onToggle();
    }
  };
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
          style={{ fontWeight: '600', fontSize: moderateScale(14) }}
        >
          {label}
        </AppText>
      ) : null}

      <View ref={buttonRef} collapsable={false} style={{ width: '100%' }}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleToggle}
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
      </View>

      <Modal
        visible={isOpen}
        transparent
        animationType='none'
        onRequestClose={onToggle}
      >
        <TouchableWithoutFeedback onPress={onToggle}>
          <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  {
                    position: 'absolute',
                    left: dropdownCoords.x,
                    width: dropdownCoords.width || moderateScale(150),
                    borderRadius: Radius.md || moderateScale(10),
                    backgroundColor: colors.card || '#FFFFFF',
                    borderColor: colors.border || '#E2E8F0',
                    borderWidth: 1,
                    paddingVertical: moderateScale(2),
                    elevation: 25,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    overflow: 'hidden',
                  },
                  direction === 'up'
                    ? {
                        bottom:
                          Dimensions.get('window').height -
                          dropdownCoords.y +
                          moderateScale(6),
                      }
                    : {
                        top:
                          dropdownCoords.y +
                          dropdownCoords.height +
                          moderateScale(6),
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
                  style={{ maxHeight: moderateScale(240) }}
                  contentContainerStyle={{ flexGrow: 0 }}
                >
                  {items.map((item, _index) => {
                    const selected = isItemSelected(item.id);

                    return (
                      <TouchableOpacity
                        key={String(item.id)}
                        activeOpacity={0.7}
                        onPress={() => {
                          onSelect(item);
                          onToggle();
                        }}
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
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default CustomDropdown;
