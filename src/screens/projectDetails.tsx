import React, { useState } from 'react';
import Screen from '../components/common/ScreenWapper';
import ProjectTopNavigator from '../navigation/projectTopNavigator';
import CommonHeader from '../components/common/CommonHeader';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigationTypes';
import { RootState, useAppDispatch, useAppSelector } from '../store';
import PopupModel from '../components/popupModel';
import { getProjectById } from '../store/project_store/action/project_thunk';
import { useTheme } from '../theme/ThemeProvider';

const ProjectDetails = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [projectListVisible, setProjectListVisible] = useState(false);
  const { project } = useAppSelector((state: RootState) => state?.projects);
  const dispatch = useAppDispatch();
  const { colors } = useTheme();

  const handleSuccess = () => {
    navigation.navigate('projectDetails');
  };
  const handleSelectProject = (projectId: string) => {
    dispatch(
      getProjectById({
        projectId,
        handleSuccess,
      }),
    );
  };

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <CommonHeader
        variant='projectdetails'
        title={project?.name || 'My Software Team'}
        onBackPress={() => {
          navigation.goBack();
        }}
        onProjectTitlePress={() => setProjectListVisible(true)}
      />
      <ProjectTopNavigator />
      <PopupModel
        mode='projectList'
        visible={projectListVisible}
        onClose={() => setProjectListVisible(false)}
        onSelectProject={handleSelectProject}
        title='Select Project'
      />
    </Screen>
  );
};

export default ProjectDetails;
