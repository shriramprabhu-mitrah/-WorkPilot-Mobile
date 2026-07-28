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
  quickLinks,
  recentActivity,
  stats,
  teams,
} from '../data/profileScreenData';
import { useAppDispatch } from '../store';
import { logoutUser } from '../store/auth_store/action/auth.thunks';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const ProfileScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors, strings } = useTheme();
  const { layout, moderateScale } = useAuthLayout();
  const dispatch = useAppDispatch();
  const profileIcons = strings.profile?.icons;
  const onLogout = () => {
    dispatch(logoutUser());
  };
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
        <View className='mb-6 flex-row items-center justify-between'>
          <AppText variant='h4' color={colors.white}>
            {strings.profile?.title || 'Profile'}
          </AppText>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Settings')}
            className='items-center justify-center rounded-full bg-white/20'
            style={{
              width: moderateScale(36),
              height: moderateScale(36),
            }}
          >
            <Ionicons
              name={
                (profileIcons?.settings || 'settings-outline') as IoniconName
              }
              size={18}
              color={colors.white}
            />
          </TouchableOpacity>
        </View>
        <View className='flex-row items-end gap-4'>
          <View className='relative'>
            <View
              className='items-center justify-center rounded-full'
              style={{
                width: moderateScale(72),
                height: moderateScale(72),
                backgroundColor: colors.avatarBg,
              }}
            >
              <AppText variant='h2' color={colors.white}>
                AJ
              </AppText>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              className='absolute bottom-0 right-0 items-center justify-center rounded-full border'
              style={{
                width: moderateScale(26),
                height: moderateScale(26),
                backgroundColor: colors.background,
                borderColor: colors.border,
              }}
            >
              <Ionicons
                name={(profileIcons?.edit || 'create-outline') as IoniconName}
                size={14}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
          <View style={{ gap: layout.tightGap / 2 }}>
            <AppText variant='h3' color={colors.white}>
              Alex Johnson
            </AppText>
            <AppText variant='body' color={colors.textOnPrimarySubtle}>
              {strings.profile?.role || 'Senior Software Engineer'}
            </AppText>
            <AppText variant='caption' color={colors.textOnPrimarySubtle}>
              alex.johnson@company.com
            </AppText>
          </View>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: layout.largeSectionGap * 2,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            marginTop: layout.sectionGap,
            marginBottom: layout.sectionGap,
            paddingHorizontal: layout.paddingHorizontal,
          }}
        >
          <View
            className='flex-row justify-between rounded-2xl border py-4'
            style={{
              backgroundColor: colors.background,
              borderColor: colors.border,
            }}
          >
            {stats.map(item => (
              <View key={item.label} className='flex-1 items-center'>
                <AppText variant='h2' style={{ color: item.color }}>
                  {item.value}
                </AppText>

                <AppText
                  variant='caption'
                  color={colors.textSecondary}
                  className='mt-1 text-center'
                >
                  {item.label}
                </AppText>
              </View>
            ))}
          </View>
        </View>
        <View
          style={{
            marginBottom: layout.sectionGap,
            paddingHorizontal: layout.paddingHorizontal,
          }}
        >
          <AppText
            variant='bodyLarge'
            color={colors.text}
            style={{ marginBottom: layout.elementGap }}
          >
            {strings.profile?.teamsTitle || 'Teams & Projects'}
          </AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {teams.map(team => (
              <View
                key={team.name}
                className='mr-2 flex-row items-center rounded-xl border px-3 py-2'
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                }}
              >
                <View
                  className='mr-2 rounded-md'
                  style={{
                    width: moderateScale(18),
                    height: moderateScale(18),
                    backgroundColor: team.color,
                  }}
                />
                <AppText
                  variant='body'
                  color={colors.text}
                  className='font-medium'
                >
                  {team.name}
                </AppText>
              </View>
            ))}
          </ScrollView>
        </View>
        <View
          style={{
            marginBottom: layout.sectionGap,
            paddingHorizontal: layout.paddingHorizontal,
          }}
        >
          <View
            className='flex-row items-center justify-between'
            style={{ marginBottom: layout.elementGap }}
          >
            <AppText variant='bodyLarge' color={colors.text}>
              {strings.profile?.recentActivity || 'Recent Activity'}
            </AppText>
            <TouchableOpacity activeOpacity={0.7}>
              <AppText
                variant='body'
                color={colors.primary}
                className='font-medium'
              >
                {strings.profile?.viewAll || 'View all'}
              </AppText>
            </TouchableOpacity>
          </View>
          <View
            className='rounded-xl border'
            style={{
              backgroundColor: colors.background,
              borderColor: colors.border,
            }}
          >
            {recentActivity.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                onPress={() =>
                  navigation.navigate('issue', { id: item.target })
                }
                activeOpacity={0.7}
                className={`flex-row items-start px-4 py-3 ${
                  index !== recentActivity.length - 1 ? 'border-b' : ''
                }`}
                style={{
                  borderColor: colors.itemDivider,
                }}
              >
                <View
                  className='mr-3 mt-2 rounded-full'
                  style={{
                    width: moderateScale(8),
                    height: moderateScale(8),
                    backgroundColor: item.color,
                  }}
                />
                <View className='flex-1'>
                  <AppText variant='body' color={colors.text}>
                    {item.action}{' '}
                    <AppText
                      variant='body'
                      color={colors.primary}
                      className='font-bold'
                    >
                      {item.target}
                    </AppText>
                  </AppText>
                  <AppText
                    variant='caption'
                    color={colors.textSecondary}
                    className='mt-1'
                    numberOfLines={1}
                  >
                    {item.detail}
                  </AppText>
                </View>
                <AppText variant='caption' color={colors.textSecondary}>
                  {item.time}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View
          style={{
            marginBottom: layout.sectionGap,
            paddingHorizontal: layout.paddingHorizontal,
          }}
        >
          <View
            className='rounded-xl border'
            style={{
              backgroundColor: colors.background,
              borderColor: colors.border,
            }}
          >
            {quickLinks.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                activeOpacity={0.7}
                className={`flex-row items-center px-4 py-4 ${
                  index !== quickLinks.length - 1 ? 'border-b' : ''
                }`}
                style={{
                  borderColor: colors.itemDivider,
                }}
                onPress={() => {
                  if (item.navigateUrl) {
                    navigation.navigate(item.navigateUrl);
                  }
                }}
              >
                <Ionicons name={item.iconName} size={20} color={item.color} />

                <AppText
                  variant='body'
                  color={colors.text}
                  className='flex-1 pl-4 font-medium'
                >
                  {item.label}
                </AppText>
                <Ionicons
                  name={
                    (profileIcons?.chevronRight ||
                      'chevron-forward') as IoniconName
                  }
                  size={18}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={{ paddingHorizontal: layout.paddingHorizontal }}>
          <TouchableOpacity
            activeOpacity={0.8}
            // onPress={() => navigation.navigate('login')}
            onPress={onLogout}
            className='flex-row items-center justify-center gap-2 rounded-xl border-2 py-3'
            style={{
              borderColor: colors.error,
            }}
          >
            <Ionicons
              name={(profileIcons?.logout || 'log-out-outline') as IoniconName}
              size={18}
              color={colors.error}
            />
            <AppText
              variant='body'
              color={colors.error}
              className='font-semibold'
            >
              {strings.profile?.logout || 'Log out'}
            </AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
};

export default ProfileScreen;
