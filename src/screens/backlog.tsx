import React from 'react';
import { View, TouchableOpacity, FlatList } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import SprintSection from '../components/sprint';
import { getBacklogData } from '../data/backlogData';
import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { Radius } from '../constants/Radius';
const Backlog = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors, strings } = useTheme();
  const { layout, isSmallHeight, hp } = useAuthLayout();
  const backlogData = getBacklogData(colors);
  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
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
        <View
          className='flex-row items-center'
          style={{ gap: layout.sectionGap }}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name='arrow-back' size={24} color={colors.text} />
          </TouchableOpacity>
          <AppText variant='title' color={colors.text} className='font-bold'>
            {strings.backlog?.title || 'Backlog'}
          </AppText>
        </View>
        <View
          className='flex-row items-center'
          style={{ gap: layout.largeSectionGap }}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            className='items-center justify-center border'
            style={{
              width: layout.iconSize * 2,
              height: layout.iconSize * 2,
              borderColor: colors.border,
              borderRadius: Radius.circle,
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
            className='items-center justify-center border'
            style={{
              borderRadius: Radius.circle,
              width: layout.iconSize * 2,
              height: layout.iconSize * 2,
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
      <FlatList
        contentContainerStyle={{
          paddingBottom: isSmallHeight ? hp(20) : hp(12),
        }}
        data={backlogData}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <SprintSection sprint={item} />}
      />
    </Screen>
  );
};

export default Backlog;
