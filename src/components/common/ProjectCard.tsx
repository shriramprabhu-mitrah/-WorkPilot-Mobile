import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import AppText from '../common/AppText';
import { Project } from '../../screens/projectScreen';
import { RootStackParamList } from '../../types/navigationTypes';
import { useTheme } from '../../hooks/useTheme';
import { useAuthLayout } from '../../hooks/useAuthLayout';

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
      className='rounded-2xl border shadow-sm'
      style={{
        backgroundColor: colors.card || colors.background,
        borderColor: colors.border,
        paddingHorizontal: layout.paddingHorizontal,
        paddingVertical: layout.paddingHorizontal,
        marginBottom: layout.elementGap,
      }}
    >
      <View className='flex-row items-center'>
        {/* Project Code Avatar Badge */}
        <View
          className='items-center justify-center rounded-xl'
          style={{
            width: moderateScale(48),
            height: moderateScale(48),
            backgroundColor: item.color || colors.primary,
          }}
        >
          <AppText variant='h3' color={colors.white}>
            {item.code}
          </AppText>
        </View>

        {/* Project Details */}
        <View className='flex-1' style={{ marginLeft: layout.elementGap }}>
          <View className='flex-row items-center'>
            <AppText
              variant='bodyLarge'
              color={colors.text}
              className='flex-1 font-bold'
              numberOfLines={1}
            >
              {item.name}
            </AppText>
          </View>

          <View
            className='flex-row flex-wrap items-center'
            style={{ marginTop: layout.tightGap / 2 }}
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

        {/* Star Icon */}
        {item.starred && (
          <Ionicons
            name='star'
            size={16}
            color={colors.warning}
            style={{ marginRight: layout.tightGap }}
          />
        )}

        {/* Chevron Icon */}
        <Ionicons
          name='chevron-forward'
          size={20}
          color={colors.placeholder || colors.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );
};

export default ProjectCard;
