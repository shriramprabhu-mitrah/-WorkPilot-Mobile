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
import {
  getAllProjectInfo,
  getProjectById,
  getSprintByIdThunk,
  getSprintsThunk,
} from '../store/project_store/action/project_thunk';
import CustomBottomSheet from '../components/common/CustomBottomDialog';
import { logoutUser } from '../store/auth_store/action/auth.thunks';
import { showSuccessToast } from '../utils/utils';
import { getProjectName } from '../store/project_store/reducer/project_reducer';
import { Sprint } from '../types/project.type';
import { RootStackParamList } from '../types/navigationTypes';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

export const CustomDrawerContent: React.FC<
  DrawerContentComponentProps
> = props => {
  const { colors, strings } = useTheme();
  const dispatch = useAppDispatch();
  const { moderateScale, layout } = useAuthLayout();
  const { user } = useAppSelector(state => state.auth);
  const { projects, project, loading, sprints } = useAppSelector(
    state => state.projects,
  );
  const stackNavigation =
    useNavigation<StackNavigationProp<RootStackParamList>>();
  const [projectSheetVisible, setProjectSheetVisible] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [include_sprints, setInclude_sprints] = useState(true);
  const params = { include_sprints: include_sprints };
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
      id: 4,
      name: 'Profile',
      icon: 'person-outline',
      route: 'Profile',
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
      dispatch(getAllProjectInfo(params));
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
    console.log('project', project);
  };

  // const handleOnSelectProject = (id: string, name: string) => {
  //   dispatch(getProjectName(name));
  //   // 1. Fetch project details
  //   dispatch(
  //     getProjectById({
  //       projectId: id,
  //     }),
  //   );
  //   dispatch(getSprintsThunk({ project_id: id }));
  //   console.log('drawer');
  //   // 2. Extract active/last sprint and trigger sprintById API
  //   const targetProject = projects?.find(
  //     (p: any) => (p.id?.toString() || p._id?.toString()) === id,
  //   );
  //   console.log('targetProject', targetProject, 'sprints', sprints);
  //   // Type assertion to resolve TS error when 'sprints' is missing on Project interface
  //   const projectSprints: Sprint[] = (targetProject as any)?.sprints || [];

  //   if (projectSprints.length > 0) {
  //     const activeSprint = projectSprints.find(
  //       (s: any) => s.status === 'active',
  //     );
  //     const targetSprint =
  //       activeSprint || projectSprints[projectSprints.length - 1];

  //     const sprintId =
  //       targetSprint?.id?.toString() || (targetSprint as any)?._id?.toString();
  //     console.log('sprintId', sprintId, 'targetSprint', targetSprint);
  //     if (sprintId) {
  //       dispatch(
  //         getSprintByIdThunk({
  //           project_id: id,
  //           sprint_id: sprintId,
  //         }),
  //       );
  //     }
  //   }
  //   handleNavigation('projectDetails');
  // };

  const handleOnSelectProject = (id: string, name?: string) => {
    if (!id) {
      return;
    }
    if (name) {
      dispatch(getProjectName(name));
    }
    stackNavigation.navigate('projectDetails', {
      projectId: id,
      projectName: name ?? '',
    });
  };

  return (
    <Screen scroll={false} backgroundColor={colors.primary}>
      {/* 1. Header Profile Section */}
      <View
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: layout.paddingHorizontal,
          paddingTop: layout.paddingTop,
          paddingBottom: layout.paddingTop,
        }}
      >
        <TouchableOpacity activeOpacity={0.8}>
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
            {user?.name}
          </AppText>

          <AppText
            variant='caption'
            style={{ color: colors.white }}
            className='mt-0.5'
            numberOfLines={1}
          >
            {user?.email}
          </AppText>
        </TouchableOpacity>
      </View>

      {/* 2. Drawer Items List Container */}
      <View style={{ flex: 1, backgroundColor: colors.surface }}>
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

              {(item.id === 1 || item.id === 6) && (
                <View
                  className='mx-5 my-1.5 h-px'
                  style={{ backgroundColor: colors.border || '#EBECF0' }}
                />
              )}
            </React.Fragment>
          ))}
        </DrawerContentScrollView>
      </View>

      {/* Bottom Sheet for Project List */}
      <ProjectListBottomSheet
        visible={projectSheetVisible}
        onDismiss={() => setProjectSheetVisible(false)}
        onSelectProject={handleOnSelectProject}
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
