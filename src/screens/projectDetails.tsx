import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { View, TouchableOpacity, Animated, Easing } from 'react-native';
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
  useGetSprintsQuery,
  useGetProjectDashboardQuery,
  useGetUpcomingDeadlinesQuery,
  useGetCustomStatusQuery,
  useGetUserStoryStatusQuery,
  useGetUserStoriesQuery,
  useGetBurndownChartQuery,
  useGetTeamWorkloadQuery,
  useGetWeeklyProgressQuery,
  useGetProjectMembersQuery,
  useGetBoardStoriesQuery,
} from '../store/api/projectApi';
import { useGetTasksQuery } from '../store/api/userStoryApi';
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

const ALL_SPRINTS_OPTION: Sprint = {
  id: 'all',
  name: 'All sprints',
  status: 'active',
  start_date: '',
  end_date: '',
  goal: '',
};

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
    {
      refetchOnFocus: true,
    },
  );

  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(
    ALL_SPRINTS_OPTION,
  );
  const [isSprintChanging, setIsSprintChanging] = useState(false);
  const [currentSprintIdState, setCurrentSprintIdState] = useState<
    string | undefined
  >('all');
  const [activeTab, setActiveTab] = useState<string>('Summary');

  const handleTabChange = useCallback((tabName: string) => {
    setActiveTab(prev => {
      const wasSettings = prev?.toLowerCase() === 'settings';
      const isSettings = tabName?.toLowerCase() === 'settings';
      if (wasSettings !== isSettings) {
        return tabName;
      }
      return prev;
    });
  }, []);

  // Tracks if the user explicitly clicked a sprint to stop auto-reversion
  const userHasSelected = useRef(false);
  const progressAnim = useRef(new Animated.Value(-1)).current;

  const { data: sprintsResponse, refetch: refetchSprints } = useGetSprintsQuery(
    routeProjectId ? { project_id: routeProjectId } : skipToken,
  );

  const {
    data: sprintByIdData,
    isLoading: sprintByIdLoading,
    isFetching: sprintByIdFetching,
    refetch: refetchSprintById,
  } = useGetSprintByIdQuery(
    currentSprintIdState && currentSprintIdState !== 'all' && routeProjectId
      ? { project_id: routeProjectId, sprint_id: currentSprintIdState }
      : skipToken,
  );

  // ---------------------------------------------------------------------------
  // Preload GET API queries for all tabs (Summary, Board, List, Report, Backlogs, Members)
  // so content is immediately available when the user switches tabs smoothly.
  // ---------------------------------------------------------------------------
  const todayStr = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const effectiveProjectId =
    routeProjectId ||
    projectDetails?.id?.toString() ||
    (projectDetails as any)?._id?.toString();

  // 1. Summary Tab Preload
  useGetProjectDashboardQuery(
    effectiveProjectId
      ? {
          project_id: effectiveProjectId,
          sprint_id:
            currentSprintIdState && currentSprintIdState !== 'all'
              ? currentSprintIdState
              : undefined,
        }
      : skipToken,
  );
  useGetUpcomingDeadlinesQuery(
    effectiveProjectId ? { project_id: effectiveProjectId } : skipToken,
  );

  // 2. Board Tab Preload
  useGetBoardStoriesQuery(
    effectiveProjectId
      ? {
          project_id: effectiveProjectId,
          page: 1,
          page_size: 10,
          sprint_id:
            currentSprintIdState && currentSprintIdState !== 'all'
              ? currentSprintIdState
              : undefined,
          tasks_per_status: 5,
        }
      : skipToken,
  );
  useGetTasksQuery(
    effectiveProjectId
      ? {
          projectId: effectiveProjectId,
          sprint_id:
            currentSprintIdState && currentSprintIdState !== 'all'
              ? currentSprintIdState
              : undefined,
          storyless_task: true,
          page: 1,
          page_size: 100,
        }
      : skipToken,
  );

  useGetCustomStatusQuery(
    effectiveProjectId ? { project_id: effectiveProjectId } : skipToken,
  );
  useGetUserStoryStatusQuery(
    effectiveProjectId ? { project_id: effectiveProjectId } : skipToken,
  );
  useGetUserStoriesQuery(
    effectiveProjectId
      ? {
          projectId: effectiveProjectId,
          payload: {
            page: 1,
            page_size: 5,
            ...(currentSprintIdState && currentSprintIdState !== 'all'
              ? { sprint_id: currentSprintIdState }
              : {}),
          },
        }
      : skipToken,
  );

  // 3. List Tab Preload
  useGetUserStoriesQuery(
    effectiveProjectId
      ? {
          projectId: effectiveProjectId,
          payload: {
            page: 1,
            page_size: 10,
            ...(currentSprintIdState && currentSprintIdState !== 'all'
              ? { sprint_id: currentSprintIdState }
              : {}),
          },
        }
      : skipToken,
  );

  // 4. Report Tab Preload (Preloaded for immediate availability on switch)
  useGetBurndownChartQuery(
    effectiveProjectId
      ? {
          projectId: effectiveProjectId,
          sprintId:
            currentSprintIdState && currentSprintIdState !== 'all'
              ? currentSprintIdState
              : undefined,
        }
      : skipToken,
  );
  useGetTeamWorkloadQuery(
    effectiveProjectId
      ? {
          projectId: effectiveProjectId,
          sprintId:
            currentSprintIdState && currentSprintIdState !== 'all'
              ? currentSprintIdState
              : undefined,
        }
      : skipToken,
  );
  useGetWeeklyProgressQuery(
    effectiveProjectId
      ? {
          projectId: effectiveProjectId,
          start_date: todayStr,
          end_date: todayStr,
        }
      : skipToken,
  );

  // 5. Backlogs Tab Preload (Unassigned User Stories & Unassigned Tasks)
  useGetUserStoriesQuery(
    effectiveProjectId
      ? {
          projectId: effectiveProjectId,
          payload: {
            page: 1,
            page_size: 10,
            sort_by: 'created_at',
            sort_order: 'DESC',
            is_unassigned_story: true,
          },
        }
      : skipToken,
  );
  useGetTasksQuery(
    effectiveProjectId
      ? {
          projectId: effectiveProjectId,
          page: 1,
          page_size: 10,
          sort_by: 'created_at',
          sort_order: 'DESC',
          is_deleted: false,
          unassigned_task: true,
          storyless_task: false,
        }
      : skipToken,
  );

  // 6. Members Tab Preload
  useGetProjectMembersQuery(
    effectiveProjectId
      ? {
          project_id: effectiveProjectId,
          page: 1,
          page_size: 10,
        }
      : skipToken,
  );

  const currentSprint = sprintByIdData?.data;
  const getCurrentSprintLoading =
    sprintByIdLoading || isSprintChanging || sprintByIdFetching;

  useEffect(() => {
    if (!isSprintChanging) return;
    if (!sprintByIdFetching && !sprintByIdLoading) {
      setIsSprintChanging(false);
    }
  }, [isSprintChanging, sprintByIdFetching, sprintByIdLoading]);

  useEffect(() => {
    if (!getCurrentSprintLoading) {
      progressAnim.stopAnimation();
      progressAnim.setValue(-1);
      return;
    }
    const animation = Animated.loop(
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => {
      animation.stop();
    };
  }, [getCurrentSprintLoading, progressAnim]);

  const [projectSheetVisible, setProjectSheetVisible] =
    useState<boolean>(false);
  const [sprintListVisible, setSprintListVisible] = useState<boolean>(false);
  const [settingsView, setSettingsView] = useState<ViewState>('MAIN_SETTINGS');

  const sprintList = useMemo<Sprint[]>(() => {
    return projectDetails?.sprints || sprintsResponse?.data || sprints || [];
  }, [projectDetails?.sprints, sprintsResponse?.data, sprints]);

  // Reset sprint selection tracking when the route project changes -> default to All sprints
  useEffect(() => {
    userHasSelected.current = false;
    setCurrentSprintIdState('all');
    setSelectedSprint(ALL_SPRINTS_OPTION);
    dispatch(getCurrentSprintData(ALL_SPRINTS_OPTION));
  }, [routeProjectId, dispatch]);

  useFocusEffect(
    useCallback(() => {
      setSettingsView('MAIN_SETTINGS');

      if (routeProjectName) {
        dispatch(getProjectName(routeProjectName));
      }

      if (routeProjectId) {
        refetchSprints();
        if (currentSprintIdState && currentSprintIdState !== 'all') {
          refetchSprintById();
        }
      }
    }, [
      routeProjectId,
      routeProjectName,
      currentSprintIdState,
      dispatch,
      refetchSprints,
      refetchSprintById,
    ]),
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
    if (currentSprintIdState === 'all') {
      dispatch(getCurrentSprintData(ALL_SPRINTS_OPTION));
    } else if (sprintByIdData?.data) {
      dispatch(getCurrentSprintData(sprintByIdData.data));
    }
  }, [currentSprintIdState, sprintByIdData, dispatch]);

  const handleOnSelectProject = (id: string, name: string) => {
    if (!id || id === effectiveProjectId) {
      setProjectSheetVisible(false);
      return;
    }

    setProjectSheetVisible(false);

    // 1. Update Project Name and optimistic project in Redux immediately
    dispatch(getProjectName(name));
    dispatch(
      getProjectData({
        data: { id, name } as any,
        isLoading: true,
        isFetching: true,
      }),
    );

    // 2. Reset Sprint Selection to 'All sprints' immediately
    userHasSelected.current = false;
    setCurrentSprintIdState('all');
    setSelectedSprint(ALL_SPRINTS_OPTION);
    dispatch(getCurrentSprintData(ALL_SPRINTS_OPTION));

    // 3. Update current route params so child tabs & hooks read the new project immediately
    navigation.setParams({
      projectId: id,
      projectName: name,
    });
  };

  const handleSelectSprint = (sprintId: string) => {
    if (!sprintId || isSprintChanging) {
      setSprintListVisible(false);
      return;
    }

    if (sprintId === 'all') {
      setIsSprintChanging(true);
      userHasSelected.current = true;
      setSelectedSprint(ALL_SPRINTS_OPTION);
      setCurrentSprintIdState('all');
      dispatch(getCurrentSprintData(ALL_SPRINTS_OPTION));
      setSprintListVisible(false);
      setTimeout(() => setIsSprintChanging(false), 150);
      return;
    }

    const foundSprint = sprintList.find(
      (sprint: Sprint) =>
        (sprint.id?.toString() || (sprint as any)._id?.toString()) ===
        sprintId.toString(),
    );

    const targetSprint: Sprint = foundSprint || {
      id: sprintId.toString(),
      name: 'Sprint',
      status: 'active',
      start_date: '',
      end_date: '',
      goal: '',
    };

    setIsSprintChanging(true);
    // Lock automatic selection and apply manual choice
    userHasSelected.current = true;
    setSelectedSprint(targetSprint);
    setCurrentSprintIdState(sprintId.toString());
    dispatch(getCurrentSprintData(targetSprint));
    setSprintListVisible(false);
  };

  const getHeaderTitle = (): string => {
    if (activeTab.toLowerCase() === 'settings') {
      if (settingsView === 'DETAILS') return 'Project details';
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

  const currentSprintName =
    currentSprintIdState === 'all'
      ? 'All sprints'
      : selectedSprint?.name || sprintByIdData?.data?.name || 'All sprints';

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
              position: 'relative',
              overflow: 'hidden',
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

              <AppText
                variant='body'
                color={colors.primary}
                className='font-semibold capitalize'
                numberOfLines={1}
              >
                {currentSprintName || 'Select Sprint'}
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
            {getCurrentSprintLoading && (
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  backgroundColor: colors.border,
                  overflow: 'hidden',
                }}
              >
                <Animated.View
                  style={{
                    position: 'absolute',
                    width: '35%',
                    height: '100%',
                    backgroundColor: colors.primary,
                    transform: [
                      {
                        translateX: progressAnim.interpolate({
                          inputRange: [-1, 1],
                          outputRange: [-100, 250],
                        }),
                      },
                    ],
                  }}
                />
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      <ProjectTopNavigator
        settingsView={settingsView}
        setSettingsView={setSettingsView}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        projectName={projectDetails?.name || projectName}
      />

      {/* Project Bottom Sheet */}
      <ProjectListBottomSheet
        visible={projectSheetVisible}
        mode='projects'
        projectId={currentProjectId}
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
