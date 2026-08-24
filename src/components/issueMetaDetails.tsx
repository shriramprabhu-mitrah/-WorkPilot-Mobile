import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from './common/AppText';
import Avatar from './Avatar';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { moderateScale } from '../utils/responsive';
import { ThemeColors } from '../constants/Colors';
import { Radius } from '../constants/Radius';
import {
  getPriorityLabel,
  TaskPriority,
  TASK_PRIORITY_OPTIONS,
  getPriorityThemeColor,
} from '../utils/enum';

interface DetailItem {
  label: string;
  value: string;
  initials?: string;
  color?: string;
  dot?: string;
}

interface Props {
  details: DetailItem[];
  colors: ThemeColors;
  editableFields?: {
    priority?: boolean;
    storyPoints?: boolean;
  };
  onPrioritySelect?: (priority: string) => void;
  storyPointsInputProps?: {
    value: string;
    onChangeText: (text: string) => void;
    onBlur: () => void;
    editable?: boolean;
  };
}

export const IssueMetaDetails: React.FC<Props> = ({
  details,
  colors,
  editableFields,
  onPrioritySelect,
  storyPointsInputProps,
}) => {
  const { layout, isSmallHeight } = useAuthLayout();
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  const togglePriorityDropdown = () => {
    if (!editableFields?.priority) {
      return;
    }
    setShowPriorityDropdown(prev => !prev);
  };
  const handlePrioritySelect = (option: TaskPriority) => {
    setShowPriorityDropdown(false);
    onPrioritySelect?.(option);
  };

  return (
    <View
      className='mt-3'
      style={{ backgroundColor: colors.card || colors.surface }}
    >
      {details.map(item => {
        const isPriorityRow = item.label === 'Priority';
        const isStoryPointsRow = item.label === 'Story pts';
        const isPriorityEditable = isPriorityRow && editableFields?.priority;
        const isStoryPointsEditable =
          isStoryPointsRow && editableFields?.storyPoints;

        return (
          <View
            key={item.label}
            className='flex-row items-center justify-between border-b'
            style={{
              borderColor: colors.itemDivider || colors.border,
              paddingHorizontal: layout.paddingHorizontal,
              paddingVertical: isSmallHeight
                ? layout.largeSectionGap
                : layout.sectionGap,
            }}
          >
            <AppText variant='body' color={colors.textSecondary}>
              {item.label}
            </AppText>

            {isPriorityEditable ? (
              <View className='relative z-50 items-end'>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={togglePriorityDropdown}
                  className='flex-row items-center rounded-md border'
                  style={{
                    backgroundColor: `${getPriorityThemeColor(
                      item.value.toLowerCase() as TaskPriority,
                      colors,
                    )}1A`,
                    borderColor: colors.border,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    gap: 4,
                  }}
                >
                  <View
                    className='mr-0.5 rounded-full'
                    style={{
                      width: 6,
                      height: 6,
                      backgroundColor: getPriorityThemeColor(
                        item.value.toLowerCase() as TaskPriority,
                        colors,
                      ),
                    }}
                  />
                  <AppText
                    variant='body'
                    color={getPriorityThemeColor(
                      item.value.toLowerCase() as TaskPriority,
                      colors,
                    )}
                    className='text-xs font-semibold'
                  >
                    {item.value}
                  </AppText>
                  <Ionicons
                    name={showPriorityDropdown ? 'chevron-up' : 'chevron-down'}
                    size={12}
                    color={getPriorityThemeColor(
                      item.value.toLowerCase() as TaskPriority,
                      colors,
                    )}
                  />
                </TouchableOpacity>

                {showPriorityDropdown && (
                  <>
                    <TouchableWithoutFeedback onPress={togglePriorityDropdown}>
                      <View
                        className='absolute inset-0 z-40'
                        style={{
                          width: 1000,
                          height: 1000,
                          left: -500,
                          top: -500,
                        }}
                      />
                    </TouchableWithoutFeedback>

                    <View
                      className='absolute right-0 z-50 w-36 border shadow-md'
                      style={{
                        top: '100%',
                        marginTop: 2,
                        borderRadius: Radius.sm,
                        backgroundColor: colors.card || colors.surface,
                        borderColor: colors.border,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        gap: 2,
                      }}
                    >
                      {TASK_PRIORITY_OPTIONS.map(option => {
                        const isSelected = item.value.toLowerCase() === option;
                        const optionColor = getPriorityThemeColor(
                          option,
                          colors,
                        );
                        return (
                          <TouchableOpacity
                            key={option}
                            activeOpacity={0.8}
                            onPress={() => handlePrioritySelect(option)}
                            className='flex-row items-center rounded px-2 py-1.5'
                            style={{ gap: 8 }}
                          >
                            <View
                              className='rounded-full'
                              style={{
                                width: 6,
                                height: 6,
                                backgroundColor: optionColor,
                              }}
                            />
                            <AppText
                              variant='body'
                              color={isSelected ? optionColor : colors.text}
                              className={
                                isSelected
                                  ? 'text-xs font-bold'
                                  : 'text-xs font-normal'
                              }
                            >
                              {getPriorityLabel(option)}
                            </AppText>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </>
                )}
              </View>
            ) : isStoryPointsEditable && storyPointsInputProps ? (
              <View
                className='flex-row items-center justify-end'
                style={{ gap: layout.elementGap }}
              >
                <TextInput
                  value={storyPointsInputProps.value}
                  onChangeText={storyPointsInputProps.onChangeText}
                  onBlur={storyPointsInputProps.onBlur}
                  editable={storyPointsInputProps.editable ?? true}
                  keyboardType='numeric'
                  textAlign='center'
                  maxLength={3}
                  style={{
                    width: moderateScale(42),
                    paddingVertical: 2,
                    paddingHorizontal: 6,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    color: colors.text,
                    fontSize: layout.bodyFontSize * 0.9,
                  }}
                />
              </View>
            ) : item.initials ? (
              <View
                className='flex-row items-center'
                style={{ gap: layout.elementGap }}
              >
                <Avatar
                  size='small'
                  initials={item.initials}
                  color={item.color || colors.primary}
                />
                <AppText variant='body' color={colors.text}>
                  {item.value}
                </AppText>
              </View>
            ) : item.dot ? (
              <View
                className='flex-row items-center'
                style={{ gap: layout.elementGap }}
              >
                <Ionicons name='flag' size={14} color={item.dot} />
                <AppText variant='body' color={colors.text}>
                  {item.value}
                </AppText>
              </View>
            ) : (
              <AppText variant='body' color={colors.text}>
                {item.value}
              </AppText>
            )}
          </View>
        );
      })}
    </View>
  );
};
