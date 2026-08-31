import React, { useState, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import Screen from '../components/common/ScreenWapper';
import ProjectTopNavigator from '../navigation/projectTopNavigator';
import CommonHeader from '../components/common/CommonHeader';
import AppText from '../components/common/AppText';
import Ionicons from '@react-native-vector-icons/ionicons';
import {
  useNavigation,
  useFocusEffect,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigationTypes';
import { RootState, useAppDispatch, useAppSelector } from '../store';
import {
  getProjectById,
  getSprintByIdThunk,
  getSprintsThunk,
} from '../store/project_store/action/project_thunk';
import { ViewState } from '../screens/projectScreens/setting';
import ProjectListBottomSheet from '../components/common/ProjectBottomSheet';
import { moderateScale } from '../utils/responsive';
import { Sprint } from '../types/project.type';
import { useTheme } from '../theme/ThemeProvider';
import { getProjectName } from '../store/project_store/reducer/project_reducer';

const ProjectDetails: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'projectDetails'>>();
  const routeProjectId = route.params?.projectId;
  const routeProjectName = route.params?.projectName;
  const { colors } = useTheme();
  const dispatch = useAppDispatch();

  // Redux Selectors for reactive UI rendering
  const {
    project,
    projectName,
    currentSprint,
    sprints,
    active_sprint,
    getCurrentSprintLoading,
  } = useAppSelector((state: RootState) => state?.projects);

  const [projectSheetVisible, setProjectSheetVisible] =
    useState<boolean>(false);
  const [sprintListVisible, setSprintListVisible] = useState<boolean>(false);
  const [settingsView, setSettingsView] = useState<ViewState>('MAIN_SETTINGS');
  const [activeTab, setActiveTab] = useState<string>('Summary');
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);

  const fetchProjectDetailsData = async (id: string) => {
    try {
      const [projectData, sprintsResponse] = await Promise.all([
        dispatch(
          getProjectById({
            projectId: id,
            handleSuccess: () => setSettingsView('MAIN_SETTINGS'),
          }),
        ).unwrap(),
        dispatch(getSprintsThunk({ project_id: id })).unwrap(),
      ]);

      const fetchedSprints: Sprint[] = sprintsResponse?.response?.data || [];
      const activeSprint = projectData?.active_sprint || active_sprint;
      const totalCount =
        projectData?.metrics?.total_sprints ?? fetchedSprints.length;

      const targetSprint =
        activeSprint ||
        fetchedSprints[totalCount - 1] ||
        fetchedSprints[fetchedSprints.length - 1];

      const targetSprintId =
        targetSprint?.id?.toString() || (targetSprint as any)?._id?.toString();

      if (targetSprintId) {
        await dispatch(
          getSprintByIdThunk({
            project_id: id,
            sprint_id: targetSprintId,
          }),
        ).unwrap();
      }
    } catch (error) {
      console.error('Failed to fetch project details:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setSettingsView('MAIN_SETTINGS');

      const targetProjectId =
        routeProjectId ||
        project?.id?.toString() ||
        (project as any)?._id?.toString();

      if (routeProjectName) {
        dispatch(getProjectName(routeProjectName));
      }

      if (targetProjectId) {
        fetchProjectDetailsData(targetProjectId);
      }
    }, [routeProjectId, routeProjectName, dispatch]),
  );

  // Sync selected sprint state using total_sprints metric and active sprint
  useEffect(() => {
    const sprintList: Sprint[] = project?.sprints || sprints || [];
    const totalSprints =
      project?.metrics?.total_sprints ?? sprintList.length ?? 0;

    if (totalSprints > 0) {
      const active = project?.active_sprint || active_sprint;
      const targetSprint =
        active ||
        sprintList[totalSprints - 1] ||
        sprintList[sprintList.length - 1];
      setSelectedSprint(targetSprint || null);
    } else {
      setSelectedSprint(null);
    }
  }, [
    project?.sprints,
    project?.metrics?.total_sprints,
    project?.active_sprint,
    active_sprint,
    sprints,
  ]);

  const handleOnSelectProject = (id: string, name: string) => {
    const currentId =
      project?.id?.toString() || (project as any)?._id?.toString();
    if (!id || id === currentId) return;

    dispatch(getProjectName(name));
    setProjectSheetVisible(false);
    fetchProjectDetailsData(id);
  };

  const handleSelectSprint = (sprintId: string) => {
    if (!sprintId || sprintId === currentSprint?.id?.toString()) return;
    setSprintListVisible(false);

    const sprintList: Sprint[] = project?.sprints || sprints || [];
    const foundSprint = sprintList.find(
      (s: Sprint) =>
        (s.id?.toString() || (s as any)._id?.toString()) === sprintId,
    );

    if (foundSprint) {
      setSelectedSprint(foundSprint);
    }

    const projectId =
      project?.id?.toString() ||
      (project as any)?._id?.toString() ||
      routeProjectId;

    if (projectId && sprintId) {
      dispatch(
        getSprintByIdThunk({
          project_id: projectId,
          sprint_id: sprintId,
        }),
      );
    }
  };

  const getHeaderTitle = (): string => {
    if (activeTab.toLowerCase() === 'settings') {
      if (settingsView === 'DETAILS') {
        return 'Project details';
      }
      if (settingsView === 'FEATURES') {
        return 'Features';
      }
    }
    return project?.name || projectName || 'Select Project';
  };

  const handleBackPress = () => {
    if (settingsView !== 'MAIN_SETTINGS') {
      setSettingsView('MAIN_SETTINGS');
    } else {
      navigation.goBack();
    }
  };

  const currentSprintName = currentSprint?.name;

  const currentProjectId =
    project?.id?.toString() || (project as any)?._id?.toString();

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <CommonHeader
        variant='projectdetails'
        title={getHeaderTitle()}
        onBackPress={handleBackPress}
        showDropdownIcon={false}
      />

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
                className='font-semibold capitalize'
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

          {/* Sprint Name Dropdown with Loader */}
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={getCurrentSprintLoading}
            onPress={() => setSprintListVisible(true)}
            className='flex-1 flex-row items-center justify-between rounded-xl border px-3 py-2'
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
          >
            <View className='flex-1 justify-center pr-1'>
              <AppText
                variant='caption'
                color={colors.textSecondary}
                style={{ fontSize: moderateScale(11) }}
              >
                Sprint
              </AppText>

              {getCurrentSprintLoading ? (
                <View className='items-start py-0.5'>
                  <ActivityIndicator size='small' color={colors.primary} />
                </View>
              ) : (
                <AppText
                  variant='body'
                  color={colors.primary}
                  className='font-semibold capitalize'
                  numberOfLines={1}
                >
                  {currentSprintName || 'Select Sprint'}
                </AppText>
              )}
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
        </View>
      )}

      <ProjectTopNavigator
        settingsView={settingsView}
        setSettingsView={setSettingsView}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        projectName={project?.name || projectName}
      />

      {/* Project Bottom Sheet */}
      <ProjectListBottomSheet
        visible={projectSheetVisible}
        mode='projects'
        onDismiss={() => setProjectSheetVisible(false)}
        onSelectProject={handleOnSelectProject}
      />

      {/* Sprint Bottom Sheet */}
      <ProjectListBottomSheet
        visible={sprintListVisible}
        mode='sprints'
        projectId={currentProjectId}
        onDismiss={() => setSprintListVisible(false)}
        title='Select Sprint'
        onSelectSprint={handleSelectSprint}
      />
    </Screen>
  );
};

export default ProjectDetails;
