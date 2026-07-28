import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { StackNavigationProp } from '@react-navigation/stack';

import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import {
  getPriorityColor,
  getStatusStyle,
  getTypeIcon,
  myIssues,
  recentProjects,
  starredIssues,
} from '../data/homeScreenData';
import { Radius } from '../constants/Radius';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const HomeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors, strings } = useTheme();
  const { layout, moderateScale } = useAuthLayout();
  const homeIcons = strings.home?.icons;

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <View
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: layout.paddingHorizontal,
          paddingTop: layout.paddingTop,
          paddingBottom: layout.largeSectionGap,
        }}
      >
        <View
          className='flex-row items-center justify-between'
          style={{ paddingBottom: layout.paddingBottom * 1.5 }}
        >
          <View
            className='flex-row items-center'
            style={{ gap: layout.elementGap }}
          >
            <View
              className='items-center justify-center rounded-full'
              style={{
                width: moderateScale(40),
                height: moderateScale(40),
                backgroundColor: colors.avatarBg,
              }}
            >
              <AppText
                variant='body'
                className='font-bold'
                color={colors.white}
              >
                AJ
              </AppText>
            </View>
            <View>
              <AppText
                variant='caption'
                style={{ color: colors.textOnPrimary }}
              >
                {strings.home?.greeting || 'Good morning,'}
              </AppText>
              <AppText
                variant='bodyLarge'
                className='font-bold'
                style={{ color: colors.white }}
              >
                {strings.home?.userName || 'Alex Johnson'}
              </AppText>
            </View>
          </View>
          <View
            className='flex-row items-center'
            style={{ gap: layout.tightGap }}
          >
            {/* <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Projects')}
                className='items-center justify-center rounded-full bg-white/20'
                style={{
                  width: moderateScale(36),
                  height: moderateScale(36),
                  }}
                  >
                  <Ionicons
                  name={(homeIcons?.add || 'add') as IoniconName}
                  size={20}
                  color='#FFFFFF'
                  />
                  </TouchableOpacity> */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Inbox')}
              className='relative items-center justify-center rounded-full'
              style={{
                width: moderateScale(36),
                height: moderateScale(36),
                backgroundColor: `${colors.white}2A`,
              }}
            >
              <Ionicons
                name={
                  (homeIcons?.notifications ||
                    'notifications-outline') as IoniconName
                }
                size={18}
                style={{ color: colors.white }}
              />
              <View
                className='absolute items-center justify-center rounded-full'
                style={{
                  top: moderateScale(-3),
                  right: moderateScale(-3),
                  width: layout.controlSize,
                  height: layout.controlSize,
                  backgroundColor: colors.error,
                }}
              >
                <AppText
                  variant='caption'
                  className='font-bold'
                  style={{ color: colors.white }}
                >
                  5
                </AppText>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Search')}
          className='flex-row items-center'
          style={{
            borderRadius: Radius.sm,
            backgroundColor: `${colors.white}2A`,
            paddingVertical: layout.largeSectionGap * 1,
            paddingHorizontal: layout.paddingHorizontal,
            gap: layout.elementGap,
          }}
        >
          <Ionicons
            name={(homeIcons?.search || 'search-outline') as IoniconName}
            size={18}
            style={{ color: colors.textOnPrimary }}
          />
          <AppText variant='body' style={{ color: colors.textOnPrimary }}>
            {strings.home?.searchPlaceholder || 'Search issues, projects...'}
          </AppText>
        </TouchableOpacity>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: layout.largeSectionGap * 2,
          flexGrow: 1,
        }}
      >
        <View
          style={{
            paddingHorizontal: layout.paddingHorizontal,
          }}
        >
          <View>
            <View
              className='flex-row items-center justify-between'
              style={{
                paddingTop: layout.paddingTop,
                paddingBottom: layout.paddingBottom,
              }}
            >
              <AppText
                variant='bodyLarge'
                color={colors.text}
                className='font-bold'
              >
                {strings.home?.recentProjects || 'Recent Projects'}
              </AppText>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Projects')}
              >
                <AppText
                  variant='body'
                  color={colors.primary}
                  className='font-medium'
                >
                  {strings.common?.viewAll || 'View all'}
                </AppText>
              </TouchableOpacity>
            </View>
            <View
              style={{ gap: layout.elementGap }}
              className='flex-row flex-wrap justify-between'
            >
              {recentProjects.map(item => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() =>
                    navigation.navigate('projectDetails', { id: item.id })
                  }
                  activeOpacity={0.8}
                  style={{
                    width: '48.5%',
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  }}
                  className='rounded-xl border shadow'
                >
                  <View
                    className='flex-row items-center'
                    style={{
                      gap: layout.largeSectionGap,
                      paddingTop: layout.paddingTop,
                      paddingBottom: layout.paddingBottom,
                      paddingHorizontal: layout.paddingHorizontal * 0.5,
                    }}
                  >
                    <View
                      className='items-center justify-center'
                      style={{
                        borderRadius: Radius.sm,
                        width: moderateScale(36),
                        height: moderateScale(36),
                        backgroundColor: item.color,
                      }}
                    >
                      <AppText
                        variant='body'
                        className='font-bold'
                        color={colors.white}
                      >
                        {item.avatar}
                      </AppText>
                    </View>
                    <View className='flex-1'>
                      <AppText
                        variant='body'
                        color={colors.text}
                        className='font-semibold'
                        numberOfLines={1}
                      >
                        {item.name}
                      </AppText>
                      <AppText variant='caption' color={colors.textSecondary}>
                        {item.key}
                      </AppText>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View>
            <View
              className='flex-row items-center justify-between'
              style={{
                paddingTop: layout.paddingTop,
                paddingBottom: layout.paddingBottom,
              }}
            >
              <View
                className='flex-row items-center'
                style={{ gap: layout.elementGap }}
              >
                <Ionicons
                  name={(homeIcons?.time || 'time-outline') as IoniconName}
                  size={18}
                  color={colors.textSecondary}
                />
                <AppText
                  variant='bodyLarge'
                  color={colors.text}
                  className='font-bold'
                >
                  {strings.home?.myWork || 'My Work'}
                </AppText>
              </View>
              <View
                className='rounded-full'
                style={{
                  backgroundColor: colors.border,
                  paddingHorizontal: layout.paddingHorizontal * 0.3,
                  paddingVertical: layout.tightGap,
                }}
              >
                <AppText
                  variant='caption'
                  color={colors.textSecondary}
                  className='font-medium'
                >
                  {myIssues.length}
                </AppText>
              </View>
            </View>
            <View style={{ gap: layout.largeSectionGap }}>
              {myIssues.map(issue => {
                const type = getTypeIcon(issue.type);
                const statusStyle = getStatusStyle(issue.status);
                return (
                  <TouchableOpacity
                    key={issue.id}
                    onPress={() =>
                      navigation.navigate('issue', { id: issue.id })
                    }
                    activeOpacity={0.8}
                    className='flex-row items-start border shadow'
                    style={{
                      borderRadius: Radius.sm,
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      paddingHorizontal: layout.paddingHorizontal * 0.5,
                      paddingVertical: layout.largeSectionGap * 1,
                      gap: layout.largeSectionGap,
                    }}
                  >
                    <View
                      className='flex-row items-center'
                      style={{ gap: layout.sectionGap }}
                    >
                      <View
                        className='items-center justify-center rounded-lg'
                        style={{
                          width: moderateScale(28),
                          height: moderateScale(28),
                          backgroundColor: type.color,
                        }}
                      >
                        <AppText
                          variant='caption'
                          className='font-bold'
                          color={colors.white}
                        >
                          {type.icon}
                        </AppText>
                      </View>
                      <View
                        className='rounded-full'
                        style={{
                          width: moderateScale(8),
                          height: moderateScale(8),
                          backgroundColor: getPriorityColor(issue.priority),
                        }}
                      />
                    </View>
                    <View className='flex-1' style={{ gap: layout.tightGap }}>
                      <AppText
                        ellipsizeMode='tail'
                        numberOfLines={1}
                        variant='body'
                        color={colors.text}
                        className='font-semibold'
                      >
                        {issue.title}
                      </AppText>

                      <View
                        className='flex-row items-center'
                        style={{ gap: layout.largeSectionGap }}
                      >
                        <AppText variant='caption' color={colors.textSecondary}>
                          {issue.id}
                        </AppText>
                        <View
                          style={{
                            borderRadius: Radius.lg,
                            width: moderateScale(4),
                            height: moderateScale(4),
                            backgroundColor: colors.textSecondary,
                          }}
                        />
                        <View
                          className='rounded-full'
                          style={{
                            backgroundColor: statusStyle.bg,
                            paddingHorizontal: layout.paddingHorizontal * 0.5,
                            paddingVertical: layout.tightGap,
                          }}
                        >
                          <AppText
                            variant='caption'
                            style={{ color: statusStyle.text }}
                            className='font-medium'
                          >
                            {issue.status}
                          </AppText>
                        </View>
                      </View>
                    </View>
                    <Ionicons
                      name={
                        (homeIcons?.chevronRight ||
                          'chevron-forward') as IoniconName
                      }
                      size={18}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          <View>
            <View
              className='flex-row items-center'
              style={{
                paddingTop: layout.paddingTop,
                paddingBottom: layout.paddingBottom,
                gap: layout.elementGap,
              }}
            >
              <Ionicons
                name={(homeIcons?.star || 'star') as IoniconName}
                size={18}
                color={colors.avatarBg}
              />
              <AppText
                variant='bodyLarge'
                color={colors.text}
                className='font-bold'
              >
                {strings.home?.starred || 'Starred'}
              </AppText>
            </View>
            <View
              className='rounded border shadow'
              style={{
                borderRadius: Radius.lg,
                backgroundColor: colors.background,
                borderColor: colors.border,
                paddingVertical: layout.elementGap,
              }}
            >
              {starredIssues.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={() =>
                    navigation.navigate('issue', { id: item.label })
                  }
                  activeOpacity={0.7}
                  className={`flex-row items-center justify-between ${
                    index !== starredIssues.length - 1 ? 'border-b' : ''
                  }`}
                  style={{
                    borderColor: colors.border,
                    paddingHorizontal: layout.paddingHorizontal * 0.75,
                    paddingVertical: layout.largeSectionGap,
                    gap: layout.elementGap,
                  }}
                >
                  <View
                    className='flex-1 flex-row items-center'
                    style={{ gap: layout.largeSectionGap }}
                  >
                    <Ionicons
                      name={(homeIcons?.star || 'star') as IoniconName}
                      size={16}
                      color={colors.avatarBg}
                    />
                    <AppText
                      variant='body'
                      color={colors.text}
                      className='flex-1'
                      numberOfLines={1}
                    >
                      {item.label}
                    </AppText>
                  </View>
                  <View
                    style={{
                      borderRadius: Radius.lg,
                      backgroundColor: colors.surface,
                      paddingHorizontal: layout.paddingHorizontal * 0.5,
                      paddingVertical: layout.tightGap,
                    }}
                  >
                    <AppText variant='caption' color={colors.textSecondary}>
                      {item.tag}
                    </AppText>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

export default HomeScreen;
