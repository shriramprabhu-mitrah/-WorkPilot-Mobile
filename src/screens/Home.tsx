import React, { useCallback } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import { CommonHeader } from '../components/common/CommonHeader';
import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { VIEWED_DATA, ACTIVITY_DATA } from '../data/newHomeData';
import { useAppDispatch, useAppSelector } from '../store';
import {
  getOrganizationDetail,
  getUserProfileInfo,
} from '../store/auth_store/action/auth.thunks';
import {
  setActiveTab,
  setLoading,
} from '../store/home_store/reducer/home.reducer';
import ListSkeleton from '../components/skeleton/ListSkeleton';
import ProjectCardSkeleton from '../components/skeleton/ProjectCardSkeleton';
import { Radius } from '../constants/Radius';
import { getWorkItemIcon } from '../components/common/getWorkItemIcon';

export const Home: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { layout, moderateScale, hp, isSmallHeight, verticalScale } =
    useAuthLayout();

  const { user, organization } = useAppSelector(state => state.auth);
  const { activeTab, loading, quickAccessItems } = useAppSelector(
    state => state.home,
  );

  useFocusEffect(
    useCallback(() => {
      dispatch(getUserProfileInfo());
      dispatch(getOrganizationDetail());

      dispatch(setLoading(true));
      const timer = setTimeout(() => {
        dispatch(setLoading(false));
      }, 2000);

      return () => clearTimeout(timer);
    }, [dispatch]),
  );

  const hasQuickAccess = quickAccessItems && quickAccessItems.length > 0;

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <CommonHeader
        variant='home'
        titleAlignment='left'
        user={user ?? undefined}
        workspaceName={organization?.name || 'reactproject'}
        onProfilePress={() => navigation.navigate('Profile')}
        onRightActionPress={() => navigation.navigate('Create')}
        onSearchPress={() => navigation.navigate('Search')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: isSmallHeight ? hp(20) : hp(12),
        }}
      >
        {/* Quick Access / Shortcuts Section */}
        {!hasQuickAccess ? (
          /* Empty State: Pin Button */
          <View style={{ paddingHorizontal: layout.paddingHorizontal }}>
            <TouchableOpacity
              activeOpacity={0.7}
              className='flex-row items-center'
              style={{
                paddingHorizontal: layout.paddingHorizontal,
                paddingVertical: verticalScale(14),
                marginBottom: layout.elementGap,
                backgroundColor: colors.background,
                borderRadius: Radius.md,
                borderColor: colors.border,
                borderWidth: 1,
                gap: layout.elementGap,
              }}
              onPress={() => navigation.navigate('QuickAccess')}
            >
              <Ionicons
                name='compass-outline'
                size={moderateScale(18)}
                color={colors.primary}
              />
              <AppText
                variant='body'
                color={colors.text}
                className='font-medium'
              >
                Pin your most important work
              </AppText>
            </TouchableOpacity>
          </View>
        ) : (
          /* Has Items State: Horizontal Items Scroll + Edit Button */
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingLeft: layout.paddingHorizontal,
              paddingRight: layout.paddingHorizontal,
              gap: layout.elementGap,
            }}
            style={{ marginBottom: layout.elementGap }}
          >
            {quickAccessItems.map((sc: any) => (
              <TouchableOpacity
                key={sc.id}
                activeOpacity={0.8}
                className='flex-row items-center rounded-2xl border p-3'
                style={{
                  minWidth: moderateScale(150),
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                }}
              >
                <View
                  className='mr-2.5 items-center justify-center rounded-lg border'
                  style={{
                    width: moderateScale(34),
                    height: moderateScale(34),
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }}
                >
                  {getWorkItemIcon(sc.type, {
                    size: moderateScale(16),
                    color: colors.text,
                  })}
                </View>
                <View className='flex-1 pr-2'>
                  <AppText
                    variant='caption'
                    className='font-semibold'
                    color={colors.text}
                    numberOfLines={1}
                  >
                    {sc.title}
                  </AppText>
                  {sc.subtitle && (
                    <AppText
                      variant='caption'
                      color={colors.textSecondary}
                      className='text-[11px]'
                      numberOfLines={1}
                    >
                      {sc.subtitle}
                    </AppText>
                  )}
                </View>
              </TouchableOpacity>
            ))}

            {/* Trailing Edit Card */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('QuickAccess')}
              className='items-center justify-center rounded-2xl border px-6 py-3'
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border,
              }}
            >
              <AppText
                variant='body'
                className='font-semibold'
                color={colors.text}
              >
                Edit
              </AppText>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Segmented Tab Control */}
        <View
          style={{
            paddingHorizontal: layout.paddingHorizontal,
            marginBottom: layout.elementGap,
          }}
        >
          <View
            className='flex-row rounded-full border p-1'
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => dispatch(setActiveTab('viewed'))}
              className='flex-1 items-center rounded-full py-1.5'
              style={{
                backgroundColor:
                  activeTab === 'viewed' ? colors.primary : 'transparent',
              }}
            >
              <AppText
                variant='caption'
                className='font-semibold'
                color={
                  activeTab === 'viewed' ? colors.white : colors.textSecondary
                }
              >
                Viewed
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => dispatch(setActiveTab('activity'))}
              className='flex-1 items-center rounded-full py-1.5'
              style={{
                backgroundColor:
                  activeTab === 'activity' ? colors.primary : 'transparent',
              }}
            >
              <AppText
                variant='caption'
                className='font-semibold'
                color={
                  activeTab === 'activity' ? colors.white : colors.textSecondary
                }
              >
                Activity
              </AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Sub-header */}
        <View
          style={{
            paddingHorizontal: layout.paddingHorizontal,
            marginBottom: layout.tightGap,
          }}
        >
          <AppText
            variant='caption'
            className='font-bold tracking-wider'
            color={colors.textSecondary}
          >
            TODAY
          </AppText>
        </View>

        {/* Main List Area */}
        <View
          style={{
            paddingHorizontal: layout.paddingHorizontal,
            gap: layout.elementGap,
          }}
        >
          {loading ? (
            <ListSkeleton
              count={8}
              containerStyle={{
                gap: isSmallHeight
                  ? layout.sectionGap + 2
                  : layout.elementGap - 2,
              }}
              renderItem={() => <ProjectCardSkeleton />}
            />
          ) : activeTab === 'viewed' ? (
            VIEWED_DATA.map((item: any) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('issue', { id: item.id })}
                className='flex-row items-center rounded-lg px-2 py-2.5'
                style={{ backgroundColor: colors.background }}
              >
                <View
                  className='mr-3 items-center justify-center rounded-lg border'
                  style={{
                    width: moderateScale(32),
                    height: moderateScale(32),
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }}
                >
                  {getWorkItemIcon(item.type, {
                    size: moderateScale(16),
                    color: colors.text,
                  })}
                </View>
                <View className='flex-1'>
                  <AppText
                    variant='body'
                    className='font-medium'
                    color={colors.text}
                    numberOfLines={1}
                  >
                    {item.title}
                  </AppText>
                  <AppText
                    variant='caption'
                    color={colors.textSecondary}
                    numberOfLines={1}
                  >
                    {item.key
                      ? item.key
                      : item.projectName
                        ? `${item.category} • in ${item.projectName}`
                        : item.category}
                  </AppText>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            ACTIVITY_DATA.map((item: any) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('issue', { id: item.id })}
                className='rounded-2xl border p-3.5'
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  gap: layout.tightGap,
                }}
              >
                <AppText variant='caption' color={colors.textSecondary}>
                  {item.user.name} {item.action} • {item.formattedDate}
                </AppText>

                <View className='flex-row items-center'>
                  <View className='relative mr-3'>
                    <View
                      className='items-center justify-center rounded-full'
                      style={{
                        width: moderateScale(32),
                        height: moderateScale(32),
                        backgroundColor: colors.accentOrange,
                      }}
                    >
                      <AppText
                        variant='caption'
                        className='font-bold'
                        color={colors.white}
                      >
                        {item.user.avatarInitial}
                      </AppText>
                    </View>
                    <View
                      className='absolute -bottom-1 -right-1 rounded border p-0.5'
                      style={{
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      }}
                    >
                      {getWorkItemIcon(item.type, {
                        size: moderateScale(10),
                        color: colors.primary,
                      })}
                    </View>
                  </View>

                  <View className='flex-1'>
                    <AppText
                      variant='body'
                      className='font-medium'
                      color={colors.text}
                      numberOfLines={1}
                    >
                      {item.title}
                    </AppText>
                    <AppText
                      variant='caption'
                      color={colors.textSecondary}
                      numberOfLines={1}
                    >
                      {item.key} • {item.projectName}
                    </AppText>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
};

export default Home;
