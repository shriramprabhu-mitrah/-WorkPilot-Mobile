import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
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
  useGetProjectByIdQuery,
  useGetSprintByIdQuery,
} from '../store/api/projectApi';
import { useGetSprintsQuery } from '../store/api/projectApi';
import { skipToken } from '@reduxjs/toolkit/query';
import { ViewState } from '../screens/projectScreens/setting';
import ProjectListBottomSheet from '../components/common/ProjectBottomSheet';
import { moderateScale } from '../utils/responsive';
import { Sprint } from '../types/project.type';
import { useTheme } from '../theme/ThemeProvider';
import {
  getProjectName,
  getProjectData,
  getCurrentSprintData,
} from '../store/project_store/reducer/project_reducer';
const ProjectDetails: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'projectDetails'>>();
  const routeProjectId = route.params?.projectId;
  const routeProjectName = route.params?.projectName;
  const { colors } = useTheme();
  const dispatch = useAppDispatch();

  // Redux Selectors for reactive UI rendering
  const { projectName, sprints, active_sprint } = useAppSelector(
    (state: RootState) => state?.projects,
  );

  const {
    data: projectDetails,
    isLoading: projectDetailsLoading,
    isFetching: projectDetailsFetching,
  } = useGetProjectByIdQuery(
    routeProjectId
      ? {
          project_id: routeProjectId,
        }
      : skipToken,
  );

  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [sprintRefetchKey, setSprintRefetchKey] = useState(0);
  const [currentSprintIdState, setCurrentSprintIdState] = useState<
    string | undefined
  >(undefined);

  // Tracks if the user explicitly clicked a sprint to stop auto-reversion
  const userHasSelected = useRef(false);

  const { data: sprintsResponse } = useGetSprintsQuery(
    routeProjectId
      ? { project_id: routeProjectId, _refetchKey: sprintRefetchKey }
      : skipToken,
  );

  const {
    data: sprintByIdData,
    isLoading: sprintByIdLoading,
    isFetching: sprintByIdFetching,
  } = useGetSprintByIdQuery(
    currentSprintIdState && routeProjectId
      ? { project_id: routeProjectId, sprint_id: currentSprintIdState }
      : skipToken,
  );

  const currentSprint = sprintByIdData?.data;
  const getCurrentSprintLoading = sprintByIdLoading || sprintByIdFetching;

  const [projectSheetVisible, setProjectSheetVisible] =
    useState<boolean>(false);
  const [sprintListVisible, setSprintListVisible] = useState<boolean>(false);
  const [settingsView, setSettingsView] = useState<ViewState>('MAIN_SETTINGS');
  const [activeTab, setActiveTab] = useState<string>('Summary');

  const sprintList = useMemo<Sprint[]>(() => {
    return projectDetails?.sprints || sprintsResponse?.data || sprints || [];
  }, [projectDetails?.sprints, sprintsResponse?.data, sprints]);

  // Reset sprint selection tracking when the route project changes
  useEffect(() => {
    userHasSelected.current = false;
    setCurrentSprintIdState(undefined);
    setSelectedSprint(null);
  }, [routeProjectId]);

  // Initial sprint selection (only triggers if user hasn't made a manual pick)
  useEffect(() => {
    if (userHasSelected.current || !routeProjectId) return;

    const availableSprints = sprintList;
    if (!availableSprints || availableSprints.length === 0) return;

    const activeSprint = projectDetails?.active_sprint || active_sprint;
    const totalCount =
      projectDetails?.metrics?.total_sprints ?? availableSprints.length;

    const targetSprint =
      activeSprint ||
      availableSprints[totalCount - 1] ||
      availableSprints[availableSprints.length - 1];

    const targetSprintId =
      targetSprint?.id?.toString() || (targetSprint as any)?._id?.toString();

    if (targetSprintId && targetSprintId !== currentSprintIdState) {
      setCurrentSprintIdState(targetSprintId);
      setSelectedSprint(targetSprint);
    }
  }, [
    sprintList,
    projectDetails?.active_sprint,
    projectDetails?.metrics?.total_sprints,
    active_sprint,
    routeProjectId,
    currentSprintIdState,
  ]);

  useFocusEffect(
    useCallback(() => {
      setSettingsView('MAIN_SETTINGS');

      if (routeProjectName) {
        dispatch(getProjectName(routeProjectName));
      }

      if (routeProjectId) {
        setSprintRefetchKey(prev => prev + 1);
      }
    }, [routeProjectId, routeProjectName, dispatch]),
  );

  useEffect(() => {
    dispatch(
      getProjectData({
        data: projectDetails,
        isLoading: projectDetailsLoading,
        isFetching: projectDetailsFetching,
      }),
    );
  }, [projectDetails, projectDetailsLoading, projectDetailsFetching, dispatch]);

  useEffect(() => {
    if (sprintByIdData?.data) {
      dispatch(getCurrentSprintData(sprintByIdData.data));
    }
  }, [sprintByIdData, dispatch]);

  const handleOnSelectProject = (id: string, name: string) => {
    if (!id || id === routeProjectId) {
      setProjectSheetVisible(false);
      return;
    }

    dispatch(getProjectName(name));
    setProjectSheetVisible(false);
    navigation.push('projectDetails', {
      projectId: id,
      projectName: name,
    });
  };

  const handleSelectSprint = (sprintId: string) => {
    if (!sprintId) {
      setSprintListVisible(false);
      return;
    }

    const foundSprint = sprintList.find(
      (sprint: Sprint) =>
        (sprint.id?.toString() || (sprint as any)._id?.toString()) ===
        sprintId.toString(),
    );

    // Lock automatic selection and apply manual choice
    userHasSelected.current = true;
    if (foundSprint) {
      setSelectedSprint(foundSprint);
    }
    setCurrentSprintIdState(sprintId.toString());
    setSprintListVisible(false);
  };

  const getHeaderTitle = (): string => {
    if (activeTab.toLowerCase() === 'settings') {
      if (settingsView === 'DETAILS') return 'Project details';
      if (settingsView === 'FEATURES') return 'Features';
    }
    return projectDetails?.name || projectName || 'Select Project';
  };

  const handleBackPress = () => {
    if (settingsView !== 'MAIN_SETTINGS') {
      setSettingsView('MAIN_SETTINGS');
    } else {
      navigation.goBack();
    }
  };

  const currentSprintName = currentSprint?.name || selectedSprint?.name;

  const currentProjectId =
    projectDetails?.id?.toString() ||
    (projectDetails as any)?._id?.toString() ||
    routeProjectId;

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
        projectName={projectDetails?.name || projectName}
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
