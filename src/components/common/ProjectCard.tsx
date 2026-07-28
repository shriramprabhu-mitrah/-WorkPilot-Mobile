import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import AppText from '../common/AppText';
import { Project } from '../../data/projectData';
import { RootStackParamList } from '../../types/navigationTypes';
import { useTheme } from '../../hooks/useTheme';
import { useAuthLayout } from '../../hooks/useAuthLayout';
import { Radius } from '../../constants/Radius';

interface Props {
  item: Project;
  onPress?: () => void;
}

const ProjectCard = ({ item, onPress }: Props) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors, strings } = useTheme();
  const { layout, moderateScale } = useAuthLayout();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('projectDetails', { id: item.id });
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      className='flex-row items-start border shadow'
      style={{
        backgroundColor: colors.background,
        borderColor: colors.border,
        paddingHorizontal: layout.paddingHorizontal * 0.5,
        paddingTop: layout.paddingTop * 2,
        paddingBottom: layout.paddingBottom * 2,
        borderRadius: Radius.sm,
      }}
    >
      <View
        className='flex-row items-center'
        style={{ gap: layout.largeSectionGap }}
      >
        <View
          className='items-center justify-center'
          style={{
            width: moderateScale(32),
            height: moderateScale(32),
            backgroundColor: item.color,
            borderRadius: Radius.sm,
          }}
        >
          <AppText variant='body' className='font-bold' color={colors.white}>
            {item.code}
          </AppText>
        </View>
        <View className='flex-1'>
          <View className='flex-row items-center'>
            <AppText
              variant='body'
              color={colors.text}
              className='flex-1 font-bold'
              numberOfLines={1}
            >
              {item.name}
            </AppText>
          </View>
          <View
            className='flex-row flex-wrap items-center'
            style={{ gap: layout.tightGap }}
          >
            <AppText variant='caption' color={colors.textSecondary}>
              {item.type}
            </AppText>
            <AppText
              variant='caption'
              color={colors.placeholder}
              style={{ marginHorizontal: layout.tightGap }}
            >
              •
            </AppText>
            <AppText variant='caption' color={colors.textSecondary}>
              {item.category}
            </AppText>
            <AppText
              variant='caption'
              color={colors.placeholder}
              style={{ marginHorizontal: layout.tightGap }}
            >
              •
            </AppText>
            <AppText variant='caption' color={colors.textSecondary}>
              {item.issues} {strings.projectCard?.issues || 'issues'}
            </AppText>
          </View>
        </View>
        {item.starred && (
          <Ionicons
            name='star'
            size={16}
            color={colors.warning}
            style={{ marginRight: layout.tightGap }}
          />
        )}
        <Ionicons
          name='chevron-forward'
          size={16}
          color={colors.placeholder || colors.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );
};

export default ProjectCard;
