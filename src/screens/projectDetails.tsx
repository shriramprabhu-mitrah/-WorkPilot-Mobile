import React, { useState, useCallback } from 'react';
import Screen from '../components/common/ScreenWapper';
import ProjectTopNavigator from '../navigation/projectTopNavigator';
import CommonHeader from '../components/common/CommonHeader';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigationTypes';
import { RootState, useAppDispatch, useAppSelector } from '../store';
import { getProjectById } from '../store/project_store/action/project_thunk';
import { ViewState } from '../screens/projectScreens/setting';
import ProjectListBottomSheet from '../components/common/ProjectBottomSheet';
import { useTheme } from '../theme/ThemeProvider';
import { getProjectName } from '../store/project_store/reducer/project_reducer';

const ProjectDetails = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [projectSheetVisible, setProjectSheetVisible] = useState(false);
  const [settingsView, setSettingsView] = useState<ViewState>('MAIN_SETTINGS');
  const [activeTab, setActiveTab] = useState<string>('Summary');
  const { colors } = useTheme();

  const { project, projectName } = useAppSelector(
    (state: RootState) => state?.projects,
  );
  const dispatch = useAppDispatch();

  useFocusEffect(
    useCallback(() => {
      setSettingsView('MAIN_SETTINGS');
    }, []),
  );

  const handleSuccess = () => {
    setSettingsView('MAIN_SETTINGS');
    // navigation.navigate('projectDetails');
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

  // Return specific sub-view titles for inner settings, otherwise always return project name
  const getHeaderTitle = () => {
    if (activeTab.toLowerCase() === 'settings') {
      if (settingsView === 'DETAILS') {
        return 'Project details';
      }
      if (settingsView === 'FEATURES') {
        return 'Features';
      }
    }
    return projectName || project?.name || 'My Software Team';
  };

  const handleBackPress = () => {
    if (settingsView !== 'MAIN_SETTINGS') {
      setSettingsView('MAIN_SETTINGS');
    } else {
      navigation.goBack();
    }
  };

  // Show dropdown arrow and enable project selector sheet on all tabs (at root settings view level)
  // const canShowDropdown = settingsView === 'MAIN_SETTINGS';

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <CommonHeader
        variant='projectdetails'
        title={getHeaderTitle()}
        onBackPress={handleBackPress}
        showDropdownIcon={settingsView === 'MAIN_SETTINGS'}
        onProjectTitlePress={
          settingsView === 'MAIN_SETTINGS'
            ? () => setProjectSheetVisible(true)
            : undefined
        }
      />

      <ProjectTopNavigator
        settingsView={settingsView}
        setSettingsView={setSettingsView}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <ProjectListBottomSheet
        visible={projectSheetVisible}
        onDismiss={() => setProjectSheetVisible(false)}
        onSelectProject={handleOnSelectProject}
      />
    </Screen>
  );
};

export default ProjectDetails;
