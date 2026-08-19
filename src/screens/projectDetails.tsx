import React, { useState, useCallback, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import Screen from '../components/common/ScreenWapper';
import ProjectTopNavigator from '../navigation/projectTopNavigator';
import CommonHeader from '../components/common/CommonHeader';
import AppText from '../components/common/AppText';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigationTypes';
import { RootState, useAppDispatch, useAppSelector } from '../store';
import {
  getProjectById,
  getSprintByIdThunk,
} from '../store/project_store/action/project_thunk';
import { ViewState } from '../screens/projectScreens/setting';
import ProjectListBottomSheet from '../components/common/ProjectBottomSheet';
import { moderateScale } from '../utils/responsive';
import { Sprint } from '../types/project.type';
import { useTheme } from '../theme/ThemeProvider';
import { getProjectName } from '../store/project_store/reducer/project_reducer';

const ProjectDetails = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { project, projectName } = useAppSelector(
    (state: RootState) => state?.projects,
  );
  const [projectSheetVisible, setProjectSheetVisible] = useState(false);
  const [sprintListVisible, setSprintListVisible] = useState(false);
  const [settingsView, setSettingsView] = useState<ViewState>('MAIN_SETTINGS');
  const [activeTab, setActiveTab] = useState<string>('Summary');
  const [selectedSprint, setSelectedSprint] = useState<Sprint | any>(null);

  useFocusEffect(
    useCallback(() => {
      setSettingsView('MAIN_SETTINGS');
    }, []),
  );

  // Auto-select active sprint or default to the last sprint on initial load/project change
  useEffect(() => {
    const sprints: Sprint[] = project?.sprints || [];
    if (sprints.length > 0) {
      const activeSprint = sprints.find(
        (s: any) => s.status?.toLowerCase() === 'active' || s.is_active,
      );
      const targetSprint = activeSprint || sprints[sprints.length - 1];
      setSelectedSprint(targetSprint);
    } else {
      setSelectedSprint(null);
    }
  }, [project?.sprints]);

  const handleSuccess = () => {
    setSettingsView('MAIN_SETTINGS');
  };

  const handleOnSelectProject = (id: string, name: string) => {
    dispatch(getProjectName(name));
    setProjectSheetVisible(false);
    dispatch(
      getProjectById({
        projectId: id,
        handleSuccess,
      }),
    );
  };

  const handleSelectSprint = (sprintId: string) => {
    setSprintListVisible(false);
    const sprints: Sprint[] = project?.sprints || [];
    const foundSprint = sprints.find(
      (s: any) => (s.id?.toString() || s._id?.toString()) === sprintId,
    );

    if (foundSprint) {
      setSelectedSprint(foundSprint);
    }

    const projectId =
      project?.id?.toString() || (project as any)?._id?.toString();
    if (projectId && sprintId) {
      dispatch(
        getSprintByIdThunk({
          project_id: projectId,
          sprint_id: sprintId,
        }),
      );
    }
  };

  const getHeaderTitle = () => {
    if (activeTab.toLowerCase() === 'settings') {
      if (settingsView === 'DETAILS') {
        return 'Project details';
      }
      if (settingsView === 'FEATURES') {
        return 'Features';
      }
    }
    return projectName || project?.name || 'Select Project';
  };

  const handleBackPress = () => {
    if (settingsView !== 'MAIN_SETTINGS') {
      setSettingsView('MAIN_SETTINGS');
    } else {
      navigation.goBack();
    }
  };

  const currentSprintName =
    selectedSprint?.name ||
    selectedSprint?.sprint_name ||
    (selectedSprint
      ? `Sprint ${selectedSprint.id || selectedSprint._id}`
      : 'Select Sprint');

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <CommonHeader
        variant='projectdetails'
        title={getHeaderTitle()}
        onBackPress={handleBackPress}
        showDropdownIcon={false}
      />

      {/* Project Name and Sprint Name Dropdowns in Flex Row */}
      {(settingsView === 'MAIN_SETTINGS' || settingsView === 'DETAILS') && (
        <View
          className='flex-row items-center justify-between gap-3 border-b px-4 py-2'
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          {/* Project Name Dropdown */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setProjectSheetVisible(true)}
            className='flex-1 flex-row items-center justify-between rounded-xl border px-3 py-2'
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
          >
            <View className='flex-1 pr-1'>
              <AppText
                variant='caption'
                color={colors.textSecondary}
                style={{ fontSize: moderateScale(11) }}
              >
                Project
              </AppText>
              <AppText
                variant='body'
                color={colors.primary}
                className='font-semibold'
                numberOfLines={1}
              >
                {getHeaderTitle()}
              </AppText>
            </View>
            <Ionicons
              name={
                projectSheetVisible
                  ? 'chevron-up-outline'
                  : 'chevron-down-outline'
              }
              size={moderateScale(16)}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Sprint Name Dropdown */}
          {
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setSprintListVisible(true)}
              className='flex-1 flex-row items-center justify-between rounded-xl border px-3 py-2'
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
            >
              <View className='flex-1 pr-1'>
                <AppText
                  variant='caption'
                  color={colors.textSecondary}
                  style={{ fontSize: moderateScale(11) }}
                >
                  Sprint
                </AppText>
                <AppText
                  variant='body'
                  color={colors.primary}
                  className='font-semibold'
                  numberOfLines={1}
                >
                  {currentSprintName}
                </AppText>
              </View>
              <Ionicons
                name={
                  sprintListVisible
                    ? 'chevron-up-outline'
                    : 'chevron-down-outline'
                }
                size={moderateScale(16)}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          }
        </View>
      )}

      <ProjectTopNavigator
        settingsView={settingsView}
        setSettingsView={setSettingsView}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Project Selector Bottom Sheet */}
      <ProjectListBottomSheet
        visible={projectSheetVisible}
        onDismiss={() => setProjectSheetVisible(false)}
        onSelectProject={handleOnSelectProject}
      />

      {/* Sprint Selector Bottom Sheet */}
      <ProjectListBottomSheet
        isSprint={true}
        visible={sprintListVisible}
        onDismiss={() => setSprintListVisible(false)}
        title='Select Sprint'
        onSelectSprint={handleSelectSprint}
      />
    </Screen>
  );
};

export default ProjectDetails;
