import React, { useState } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import Ionicons, {
  IoniconsIconName,
} from '@react-native-vector-icons/ionicons';
import AppText from '../components/common/AppText';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { useAppDispatch, useAppSelector } from '../store';
import { Radius } from '../constants/Radius';
import Screen from './common/ScreenWapper';
import { ProjectListBottomSheet } from './common/ProjectBottomSheet';
import { getAllProjectInfo } from '../store/project_store/action/project_thunk';
import CustomBottomSheet from '../components/common/CustomBottomDialog';
import { logoutUser } from '../store/auth_store/action/auth.thunks';
import { showSuccessToast } from '../utils/utils';

export const CustomDrawerContent: React.FC<
  DrawerContentComponentProps
> = props => {
  const { colors, strings } = useTheme();
  const dispatch = useAppDispatch();
  const { moderateScale, layout } = useAuthLayout();
  const { user } = useAppSelector(state => state.auth);
  const [projectSheetVisible, setProjectSheetVisible] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  const handleNavigation = (routeName: string) => {
    if (props.navigation && typeof props.navigation.navigate === 'function') {
      props.navigation.navigate(routeName);
    }
  };

  const drawerList = [
    {
      id: 1,
      name: 'Home',
      icon: 'home-outline',
      route: 'Home',
    },
    {
      id: 2,
      name: 'Project Selection',
      icon: 'list-outline',
      route: 'ProjectSelection',
    },
    {
      id: 3,
      name: 'Sprint Selection',
      icon: 'time-outline',
      route: 'SprintSelection',
    },
    {
      id: 4,
      name: 'Profile',
      icon: 'person-outline',
      route: 'Profile',
    },
    {
      id: 5,
      name: 'Teams',
      icon: 'people-outline',
      route: 'Teams',
    },
    {
      id: 6,
      name: 'Notifications',
      icon: 'notifications-outline',
      route: 'Notifications',
    },
    {
      id: 7,
      name: 'Settings',
      icon: 'settings-outline',
      route: 'Settings',
    },
    {
      id: 8,
      name: 'Logout',
      icon: 'log-out-outline',
      route: 'Logout',
    },
  ];

  const handleItemPress = (item: (typeof drawerList)[0]) => {
    if (item.route === 'ProjectSelection') {
      props.navigation.closeDrawer();
      dispatch(getAllProjectInfo());
      setTimeout(() => setProjectSheetVisible(true), 300);
    } else if (item.route === 'Logout') {
      props.navigation.closeDrawer();
      setTimeout(() => setIsLogoutModalVisible(true), 300);
    } else {
      handleNavigation(item.route);
    }
  };

  const handleLogoutConfirm = () => {
    dispatch(logoutUser(showSuccessToast));
  };

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      {/* 1. Header Profile Section (Blue Background) */}
      <View
        style={{
          backgroundColor: colors.primary, // Primary Jira Blue
          paddingHorizontal: layout.paddingHorizontal,
          paddingTop: layout.paddingTop,
          paddingBottom: layout.paddingTop,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleNavigation('Profile')}
        >
          {/* Avatar Circle */}
          <View
            style={{
              width: moderateScale(48),
              height: moderateScale(48),
              borderRadius: Radius.circle,
              backgroundColor: colors.accentOrange,
            }}
            className='mb-3 items-center justify-center overflow-hidden'
          >
            {user?.avatar_url ? (
              <Image
                source={{ uri: user.avatar_url }}
                className='h-full w-full'
                resizeMode='cover'
              />
            ) : (
              <AppText
                style={{
                  fontSize: moderateScale(18),
                  color: colors.white,
                }}
                className='font-bold'
              >
                {user?.name
                  ?.split(' ')
                  .map(word => word[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase() || 'JD'}
              </AppText>
            )}
          </View>

          {/* Name & Email */}
          <AppText
            variant='body'
            style={{
              fontSize: moderateScale(18),
              color: colors.white,
            }}
            className='font-bold'
          >
            {user?.name || 'John Doe'}
          </AppText>

          <AppText
            variant='caption'
            style={{ color: colors.white }}
            className='mt-0.5'
            numberOfLines={1}
          >
            {user?.email || 'john@example.com'}
          </AppText>
        </TouchableOpacity>
      </View>

      {/* 2. Drawer Items List */}
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 12 }}
      >
        {drawerList.map(item => (
          <React.Fragment key={item.id}>
            <TouchableOpacity
              activeOpacity={0.7}
              className='flex-row items-center px-5 py-3.5'
              onPress={() => handleItemPress(item)}
              style={{ gap: moderateScale(30) }}
            >
              <Ionicons
                name={item.icon as IoniconsIconName}
                size={moderateScale(22)}
                color={item.route === 'Logout' ? colors.error : colors.text}
                className='mr-4'
              />
              <AppText
                variant='title'
                color={item.route === 'Logout' ? colors.error : colors.text}
              >
                {item.name}
              </AppText>
            </TouchableOpacity>

            {/* Dividers added after Home (id: 1) and after Notifications (id: 6) */}
            {(item.id === 1 || item.id === 6) && (
              <View
                className='mx-5 my-1.5 h-px'
                style={{ backgroundColor: colors.border || '#EBECF0' }}
              />
            )}
          </React.Fragment>
        ))}
      </DrawerContentScrollView>

      {/* Bottom Sheet for Project List */}
      <ProjectListBottomSheet
        visible={projectSheetVisible}
        onDismiss={() => setProjectSheetVisible(false)}
      />

      {/* Bottom Sheet for Logout Confirmation */}
      <CustomBottomSheet
        visible={isLogoutModalVisible}
        onDismiss={() => setIsLogoutModalVisible(false)}
        title={strings?.profile?.logout || 'Logout'}
        message='Are you sure you want to log out?'
        confirmText={strings?.profile?.logout || 'Logout'}
        cancelText='Cancel'
        onConfirm={handleLogoutConfirm}
        confirmButtonColor={colors.error}
        showCancel={true}
        showCloseIcon={true}
        confirmTextColor={colors.white}
      />
    </Screen>
  );
};
