import React from 'react';
import { View, TouchableOpacity, FlatList } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import SprintSection from '../components/sprint';
import { backlogData } from '../data/backlogData';
import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
const Backlog = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors, strings } = useTheme();
  const { layout, moderateScale } = useAuthLayout();

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      {/* Header Bar */}
      <View
        className='flex-row items-center justify-between border-b'
        style={{
          backgroundColor: colors.background,
          borderColor: colors.border,
          paddingHorizontal: layout.paddingHorizontal,
          paddingTop: layout.paddingTop,
          paddingBottom: layout.elementGap,
        }}
      >
        {/* Title & Back Button */}
        <View className='flex-row items-center'>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name='arrow-back' size={24} color={colors.text} />
          </TouchableOpacity>

          <AppText
            variant='h3'
            color={colors.text}
            style={{ marginLeft: layout.elementGap }}
          >
            {strings.backlog?.title || 'Backlog'}
          </AppText>
        </View>

        {/* Action Buttons */}
        <View className='flex-row items-center'>
          <TouchableOpacity
            activeOpacity={0.8}
            className='items-center justify-center rounded-full border'
            style={{
              width: moderateScale(38),
              height: moderateScale(38),
              borderColor: colors.border,
              marginRight: layout.tightGap,
            }}
          >
            <Ionicons
              name='funnel-outline'
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            className='items-center justify-center rounded-full border'
            style={{
              width: moderateScale(38),
              height: moderateScale(38),
              borderColor: colors.border,
            }}
          >
            <Ionicons
              name='ellipsis-horizontal'
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Backlog List */}
      <FlatList
        data={backlogData}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: layout.largeSectionGap * 2,
        }}
        renderItem={({ item }) => <SprintSection sprint={item} />}
      />
    </Screen>
  );
};

export default Backlog;
