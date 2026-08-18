import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { Radius } from '../constants/Radius';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface TaskDetailsScreenProps {
  navigation?: any;
}

export const TaskDetailsScreen: React.FC<TaskDetailsScreenProps> = ({
  navigation,
}) => {
  const { colors } = useTheme();
  const { moderateScale, layout } = useAuthLayout();

  // Accordion state management
  const [sections, setSections] = useState({
    description: true,
    parentWorkItem: true,
    details: true,
    moreFields: false,
  });

  const toggleSection = (key: keyof typeof sections) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Screen scroll={true} backgroundColor={colors.background}>
      <View
        style={{ paddingHorizontal: layout.paddingHorizontal }}
        className='pb-20 pt-3'
      >
        {/* 1. TOP NAVBAR */}
        <View className='mb-4 flex-row items-center justify-between'>
          <TouchableOpacity
            onPress={() => navigation?.goBack?.()}
            style={{
              width: moderateScale(38),
              height: moderateScale(38),
              borderRadius: Radius.circle,
              backgroundColor: colors.surface || '#1C1C1E',
            }}
            className='items-center justify-center'
          >
            <Ionicons name='chevron-back' size={20} color={colors.text} />
          </TouchableOpacity>

          <View className='flex-row items-center gap-2'>
            <View
              style={{
                backgroundColor: colors.surface || '#1C1C1E',
                borderRadius: moderateScale(20),
                paddingHorizontal: 8,
                paddingVertical: 6,
              }}
              className='flex-row items-center gap-4'
            >
              <TouchableOpacity>
                <Ionicons name='eye-outline' size={18} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name='attach-outline' size={18} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons
                  name='ellipsis-horizontal'
                  size={18}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 2. TASK BREADCRUMB & TITLE */}
        <TouchableOpacity className='mb-1 flex-row items-center gap-1.5'>
          <Ionicons name='bookmark-outline' size={14} color={colors.primary} />
          <AppText
            variant='caption'
            style={{ color: colors.textSecondary || '#8E8E93' }}
            className='font-semibold'
          >
            WOR-8
          </AppText>
        </TouchableOpacity>

        <AppText
          variant='h1'
          style={{ fontSize: moderateScale(22) }}
          className='mb-4 font-bold'
        >
          User Registration
        </AppText>

        {/* 3. STATUS & ACTION BUTTONS */}
        <View className='mb-6 flex-row items-center gap-3'>
          <TouchableOpacity
            style={{
              backgroundColor: colors.surface || '#1C1C1E',
              borderRadius: moderateScale(8),
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
            className='flex-row items-center gap-2'
          >
            <AppText variant='body' className='font-semibold'>
              To Do
            </AppText>
            <Ionicons name='chevron-down' size={16} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: colors.surface || '#1C1C1E',
              borderRadius: moderateScale(8),
              width: moderateScale(36),
              height: moderateScale(36),
            }}
            className='items-center justify-center'
          >
            <Ionicons name='flash-outline' size={16} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* 4. DESCRIPTION CARD */}
        <View
          style={{
            backgroundColor: colors.surface || '#1C1C1E',
            borderRadius: moderateScale(16),
            padding: moderateScale(16),
          }}
          className='mb-4'
        >
          <TouchableOpacity
            onPress={() => toggleSection('description')}
            className='flex-row items-center justify-between'
          >
            <AppText variant='title' className='font-bold'>
              Description
            </AppText>
            <Ionicons
              name={sections.description ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textSecondary || '#8E8E93'}
            />
          </TouchableOpacity>

          {sections.description && (
            <TouchableOpacity className='mt-3'>
              <AppText
                variant='body'
                style={{ color: colors.textSecondary || '#8E8E93' }}
              >
                Add a description...
              </AppText>
            </TouchableOpacity>
          )}
        </View>

        {/* 5. PARENT WORK ITEM CARD */}
        <View
          style={{
            backgroundColor: colors.surface || '#1C1C1E',
            borderRadius: moderateScale(16),
            padding: moderateScale(16),
          }}
          className='mb-4'
        >
          <TouchableOpacity
            onPress={() => toggleSection('parentWorkItem')}
            className='flex-row items-center justify-between'
          >
            <AppText variant='title' className='font-bold'>
              Parent work item
            </AppText>
            <Ionicons
              name={sections.parentWorkItem ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textSecondary || '#8E8E93'}
            />
          </TouchableOpacity>

          {sections.parentWorkItem && (
            <TouchableOpacity className='mt-2'>
              <AppText
                variant='body'
                style={{ color: colors.textSecondary || '#8E8E93' }}
              >
                None
              </AppText>
            </TouchableOpacity>
          )}
        </View>

        {/* 6. DETAILS CARD (Dynamic Key-Value List) */}
        <View
          style={{
            backgroundColor: colors.surface || '#1C1C1E',
            borderRadius: moderateScale(16),
            padding: moderateScale(16),
          }}
          className='mb-4'
        >
          <TouchableOpacity
            onPress={() => toggleSection('details')}
            className='flex-row items-center justify-between'
          >
            <AppText variant='title' className='font-bold'>
              Details
            </AppText>
            <Ionicons
              name={sections.details ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textSecondary || '#8E8E93'}
            />
          </TouchableOpacity>

          {sections.details && (
            <View className='mt-2 gap-y-4'>
              {/* Issue Type */}
              <View>
                <AppText
                  variant='caption'
                  style={{ color: colors.textSecondary || '#8E8E93' }}
                  className='mb-1'
                >
                  Issue Type
                </AppText>
                <View className='flex-row items-center gap-2'>
                  <View
                    style={{
                      backgroundColor: '#27856A',
                      padding: 3,
                      borderRadius: 4,
                    }}
                  >
                    <Ionicons name='bookmark' size={12} color='#FFF' />
                  </View>
                  <AppText variant='body' className='font-semibold'>
                    Story
                  </AppText>
                </View>
              </View>

              {/* Assignee */}
              <View>
                <AppText
                  variant='caption'
                  style={{ color: colors.textSecondary || '#8E8E93' }}
                >
                  Assignee
                </AppText>
                <AppText
                  variant='body'
                  style={{ color: colors.textSecondary || '#8E8E93' }}
                  className='mt-0.5'
                >
                  None
                </AppText>
              </View>

              {/* Due Date */}
              <View>
                <AppText
                  variant='caption'
                  style={{ color: colors.textSecondary || '#8E8E93' }}
                >
                  Due date
                </AppText>
                <AppText
                  variant='body'
                  style={{ color: colors.textSecondary || '#8E8E93' }}
                  className='mt-0.5'
                >
                  None
                </AppText>
              </View>

              {/* Labels */}
              <View>
                <AppText
                  variant='caption'
                  style={{ color: colors.textSecondary || '#8E8E93' }}
                >
                  Labels
                </AppText>
                <AppText
                  variant='body'
                  style={{ color: colors.textSecondary || '#8E8E93' }}
                  className='mt-0.5'
                >
                  None
                </AppText>
              </View>

              {/* Team */}
              <View>
                <AppText
                  variant='caption'
                  style={{ color: colors.textSecondary || '#8E8E93' }}
                >
                  Team
                </AppText>
                <AppText
                  variant='body'
                  style={{ color: colors.textSecondary || '#8E8E93' }}
                  className='mt-0.5'
                >
                  None
                </AppText>
              </View>

              {/* Start Date */}
              <View>
                <AppText
                  variant='caption'
                  style={{ color: colors.textSecondary || '#8E8E93' }}
                >
                  Start date
                </AppText>
                <AppText
                  variant='body'
                  style={{ color: colors.textSecondary || '#8E8E93' }}
                  className='mt-0.5'
                >
                  None
                </AppText>
              </View>

              {/* Sprint */}
              <View>
                <AppText
                  variant='caption'
                  style={{ color: colors.textSecondary || '#8E8E93' }}
                >
                  Sprint
                </AppText>
                <AppText variant='body' className='mt-0.5 font-semibold'>
                  Workpilot Sprint- 1
                </AppText>
              </View>

              {/* Story Point Estimate */}
              <View>
                <AppText
                  variant='caption'
                  style={{ color: colors.textSecondary || '#8E8E93' }}
                >
                  Story point estimate
                </AppText>
                <AppText
                  variant='body'
                  style={{ color: colors.textSecondary || '#8E8E93' }}
                  className='mt-0.5'
                >
                  None
                </AppText>
              </View>

              {/* Reporter */}
              <View>
                <AppText
                  variant='caption'
                  style={{ color: colors.textSecondary || '#8E8E93' }}
                  className='mb-1.5'
                >
                  Reporter
                </AppText>
                <View
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: Radius.circle,
                    paddingRight: 12,
                    paddingLeft: 4,
                    paddingVertical: 4,
                    alignSelf: 'flex-start',
                  }}
                  className='flex-row items-center gap-2'
                >
                  <View
                    style={{
                      width: moderateScale(22),
                      height: moderateScale(22),
                      borderRadius: Radius.circle,
                      backgroundColor: '#E05638',
                    }}
                    className='items-center justify-center'
                  >
                    <AppText
                      style={{ fontSize: 11, color: '#FFF' }}
                      className='font-bold'
                    >
                      H
                    </AppText>
                  </View>
                  <AppText variant='body' className='font-semibold'>
                    Hariharan
                  </AppText>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* 7. MORE FIELDS ACCORDION */}
        <View
          style={{
            backgroundColor: colors.surface || '#1C1C1E',
            borderRadius: moderateScale(16),
            padding: moderateScale(16),
          }}
          className='mb-6'
        >
          <TouchableOpacity
            onPress={() => toggleSection('moreFields')}
            className='flex-row items-center justify-between'
          >
            <AppText variant='title' className='font-bold'>
              More fields
            </AppText>
            <Ionicons
              name={sections.moreFields ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.textSecondary || '#8E8E93'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 8. FIXED BOTTOM COMMENT BAR */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: colors.border || '#2C2C2E',
          backgroundColor: colors.background,
          paddingHorizontal: layout.paddingHorizontal,
          paddingVertical: 12,
        }}
        className='absolute bottom-0 left-0 right-0 flex-row items-center'
      >
        <TextInput
          placeholder='Add a comment...'
          placeholderTextColor={colors.textSecondary || '#8E8E93'}
          style={{
            color: colors.text,
            fontSize: moderateScale(14),
            flex: 1,
          }}
        />
      </View>
    </Screen>
  );
};

export default TaskDetailsScreen;
