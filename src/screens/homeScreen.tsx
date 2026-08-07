import React, { useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, Image } from 'react-native';
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
  getStatusBgStyle,
  getStatusTextStyle,
  getTypeIcon,
  myIssues,
  getRecentProjects,
  starredIssues,
} from '../data/homeScreenData';
import { useAppDispatch, useAppSelector } from '../store';
import { getUserProfileInfo } from '../store/auth_store/action/auth.thunks';
import { Radius } from '../constants/Radius';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const HomeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors, strings } = useTheme();
  const dispatch = useAppDispatch();
  const { layout, moderateScale, hp, isSmallHeight } = useAuthLayout();
  const homeIcons = strings.home?.icons;
  const recentProjects = getRecentProjects(colors);
  const { user } = useAppSelector(state => state.auth);
  useEffect(() => {
    dispatch(getUserProfileInfo());
  }, []);
  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <View
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: layout.paddingHorizontal,
          paddingTop: layout.paddingTop,
          paddingBottom: layout.sectionGap * 1.5,
        }}
      >
        {/* Top User Info & Header Actions */}
        <View className='mb-6 flex-row items-center justify-between'>
          <View className='flex-row items-center gap-3'>
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              className='items-center justify-center'
              style={{
                width: moderateScale(40),
                height: moderateScale(40),
                borderRadius: Radius.circle,
              }}
            >
              {user?.avatar_url ? (
                <Image
                  source={{ uri: user.avatar_url }}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: moderateScale(26),
                  }}
                  resizeMode='cover'
                />
              ) : (
                <TouchableOpacity
                  onPress={() => navigation.navigate('Profile')}
                  className='items-center justify-center'
                  style={{
                    width: moderateScale(40),
                    height: moderateScale(40),
                    backgroundColor: colors.accentOrange,
                    borderRadius: Radius.circle,
                  }}
                >
                  <AppText
                    style={{
                      fontSize: moderateScale(18),
                      fontWeight: 'bold',
                      color: colors.white,
                    }}
                  >
                    {user?.name
                      ?.split(' ')
                      .map(word => word[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase() || 'U'}
                  </AppText>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
            <View>
              <AppText variant='caption' color='#B3D4FF'>
                {strings.home?.greeting || 'Good morning,'}
              </AppText>
              <AppText
                variant='bodyLarge'
                className='font-semibold'
                color='#FFFFFF'
              >
                {user?.username || strings.home?.userName || 'Alex Johnson'}
              </AppText>
            </View>
          </View>
          <View className='flex-row items-center gap-2'>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Inbox')}
              className='relative items-center justify-center rounded-full bg-white/20'
              style={{
                width: moderateScale(36),
                height: moderateScale(36),
              }}
            >
              <Ionicons
                name={
                  (homeIcons?.notifications ||
                    'notifications-outline') as IoniconName
                }
                size={18}
                color='#FFFFFF'
              />
              <View
                className='absolute items-center justify-center rounded-full bg-[#FF5630]'
                style={{
                  top: moderateScale(2),
                  right: moderateScale(2),
                  width: moderateScale(14),
                  height: moderateScale(14),
                }}
              >
                <AppText
                  variant='caption'
                  className='text-[9px] font-bold'
                  color='#FFFFFF'
                >
                  5
                </AppText>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        {/* Search Trigger */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Search')}
          className='flex-row items-center rounded-xl bg-white/20 px-4 py-3'
        >
          <Ionicons
            name={(homeIcons?.search || 'search-outline') as IoniconName}
            size={18}
            color='rgba(255,255,255,0.7)'
          />
          <AppText
            variant='body'
            color='rgba(255,255,255,0.8)'
            className='ml-2'
          >
            {strings.home?.searchPlaceholder || 'Search issues, projects...'}
          </AppText>
        </TouchableOpacity>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: isSmallHeight ? hp(20) : hp(12),
        }}
      >
        <View
          style={{
            paddingHorizontal: layout.paddingHorizontal,
            paddingVertical: layout.paddingBottom,
            gap: layout.elementGap,
          }}
        >
          <View style={{ gap: layout.elementGap }}>
            <View className='flex-row items-center justify-between'>
              <AppText
                variant='bodyLarge'
                color={colors.text}
                className='font-bold'
              >
                {strings.home?.recentProjects || 'Recent Projects'}
              </AppText>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('Project')}
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
            <View className='flex-row flex-wrap justify-between'>
              {recentProjects.map(item => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate('projectDetails', { id: item.key })
                  }
                  style={{
                    width: '48.5%',
                    backgroundColor: colors.background,
                    borderColor: colors.border || '#E5E7EB',
                    marginBottom: layout.elementGap,
                  }}
                  className='rounded-xl border p-3'
                >
                  <View className='flex-row items-center'>
                    <View
                      className='items-center justify-center rounded-lg'
                      style={{
                        width: moderateScale(36),
                        height: moderateScale(36),
                        backgroundColor: item.color,
                      }}
                    >
                      <AppText
                        variant='body'
                        className='font-bold'
                        color='#FFFFFF'
                      >
                        {item.avatar}
                      </AppText>
                    </View>
                    <View className='ml-2 flex-1'>
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
          <View style={{ gap: layout.elementGap }}>
            <View
              className='flex-row items-center'
              style={{ gap: layout.tightGap }}
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
            <View>
              {myIssues.map(issue => {
                const type = getTypeIcon(issue.type, colors);
                return (
                  <TouchableOpacity
                    key={issue.id}
                    activeOpacity={0.8}
                    onPress={() =>
                      navigation.navigate('issue', { id: issue.id })
                    }
                    className='mb-3 flex-row items-start rounded-xl border p-3.5'
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.border || '#E5E7EB',
                    }}
                  >
                    <View className='mr-3 mt-0.5 flex-row items-center gap-2'>
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
                          color='#FFFFFF'
                        >
                          {type.icon}
                        </AppText>
                      </View>
                      <View
                        className='rounded-full'
                        style={{
                          width: moderateScale(8),
                          height: moderateScale(8),
                          backgroundColor: getPriorityColor(
                            issue.priority,
                            colors,
                          ),
                        }}
                      />
                    </View>
                    <View
                      className='flex-1'
                      style={{ gap: layout.tightGap / 2 }}
                    >
                      <AppText
                        variant='body'
                        color={colors.text}
                        className='font-semibold'
                        numberOfLines={2}
                      >
                        {issue.title}
                      </AppText>
                      <View className='flex-row items-center gap-2'>
                        <AppText variant='caption' color={colors.textSecondary}>
                          {issue.id}
                        </AppText>
                        <View
                          className='rounded-full'
                          style={{
                            width: moderateScale(4),
                            height: moderateScale(4),
                            backgroundColor: colors.textSecondary || '#9CA3AF',
                          }}
                        />
                        <View
                          className='rounded-full px-2 py-0.5'
                          style={{
                            backgroundColor:
                              issue.status === 'To Do'
                                ? colors.surface
                                : getStatusBgStyle(issue.status, colors),
                          }}
                        >
                          <AppText
                            variant='caption'
                            style={{
                              color:
                                issue.status === 'To Do'
                                  ? colors.textSecondary
                                  : getStatusTextStyle(issue.status, colors),
                            }}
                            className='text-[11px] font-medium'
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
                      color={colors.textSecondary || '#B3BAC5'}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          {/* Starred Section */}
          <View style={{ gap: layout.elementGap }}>
            <View className='flex-row items-center gap-2'>
              <Ionicons
                name={(homeIcons?.star || 'star') as IoniconName}
                size={18}
                color='#FFAB00'
              />
              <AppText variant='bodyLarge' color={colors.text}>
                {strings.home?.starred || 'Starred'}
              </AppText>
            </View>
            <View
              className='rounded-xl border'
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border || '#E5E7EB',
              }}
            >
              {starredIssues.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('issue', { id: item.id })}
                  className={`flex-row items-center justify-between px-4 py-3.5 ${
                    index !== starredIssues.length - 1 ? 'border-b' : ''
                  }`}
                  style={{
                    borderColor: colors.border || '#F3F4F6',
                  }}
                >
                  <View className='mr-2 flex-1 flex-row items-center'>
                    <Ionicons
                      name={(homeIcons?.star || 'star') as IoniconName}
                      size={16}
                      color='#FFAB00'
                    />
                    <AppText
                      variant='body'
                      color={colors.text}
                      className='ml-3 flex-1'
                      numberOfLines={1}
                    >
                      {item.label}
                    </AppText>
                  </View>
                  <View
                    className='rounded-full px-2.5 py-0.5'
                    style={{ backgroundColor: colors.surface || '#F3F4F6' }}
                  >
                    <AppText
                      variant='caption'
                      color={colors.textSecondary}
                      className='text-[11px]'
                    >
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
