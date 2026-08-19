import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../theme/ThemeProvider';
import AppText from './common/AppText';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { Radius } from '../constants/Radius';

const TaskCard = ({ item, projectId }: any) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { layout, moderateScale, isSmallHeight } = useAuthLayout();

  const openIssue = () => {
    navigation.navigate('issue', { projectId: projectId, taskId: item?.id });
    const rootNavigation = navigation.getParent()?.getParent()?.getParent();

    if (rootNavigation) {
      rootNavigation.navigate('issue');
    }
  };

  return (
    <TouchableOpacity
      onPress={openIssue}
      className='border shadow'
      style={{
        gap: layout.elementGap,
        paddingHorizontal: layout.paddingHorizontal,
        paddingVertical: isSmallHeight
          ? layout.largeSectionGap
          : layout.elementGap,
        backgroundColor: colors.background,
        borderColor: colors.border,
        borderRadius: Radius.sm,
      }}
    >
      <AppText
        variant='body'
        className='font-semibold leading-6'
        style={{ color: colors.text }}
      >
        {item.title}
      </AppText>

      <View className='flex-row items-center justify-between'>
        <View
          className='flex-row items-center'
          style={{ gap: layout.sectionGap }}
        >
          <View
            style={{
              backgroundColor: item.avatarColor,
              width: moderateScale(20),
              height: moderateScale(20),
            }}
            className='items-center justify-center rounded'
          >
            <AppText
              variant='caption'
              className='font-bold'
              color={colors.white}
            >
              {item.avatar}
            </AppText>
          </View>

          <AppText
            variant='caption'
            className='font-semibold'
            style={{ color: colors.textSecondary }}
          >
            {item.id}
          </AppText>
        </View>

        <View
          className='flex-row items-center'
          style={{ gap: layout.elementGap }}
        >
          <View
            style={{
              backgroundColor: item.priority,
              width: moderateScale(7),
              height: moderateScale(7),
            }}
            className='rounded-full'
          />

          <View
            style={{
              backgroundColor: colors.surface,
              paddingHorizontal: layout.paddingHorizontal * 0.25,
              borderRadius: Radius.circle,
              paddingTop: layout.paddingTop * 0.25,
              paddingBottom: layout.paddingBottom * 0.25,
            }}
          >
            <AppText
              variant='caption'
              className='font-semibold'
              color={colors.textSecondary}
            >
              {item.points}
            </AppText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default TaskCard;
