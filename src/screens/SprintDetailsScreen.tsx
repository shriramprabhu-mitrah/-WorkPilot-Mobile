import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FlatList, StatusBar, useWindowDimensions, View } from 'react-native';
import { skipToken } from '@reduxjs/toolkit/query';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppText } from '../components';
import { useTheme } from '../theme/ThemeProvider';
import { useResponsive } from '../utils/responsive';
import { usePermissions } from '../hooks/usePermissions';
import { RootStackParamList } from '../types/navigationTypes';
import { CreateUserStoryPayload } from '../types/project.type';
import { RootState, useAppDispatch, useAppSelector } from '../store';
import {
  getSprintByIdThunk,
  getUserStories,
} from '../store/project_store/action/project_thunk';
import {
  favouriteUserStoryThunk,
  unfavouriteUserStoryThunk,
  favouriteTaskThunk,
  unfavouriteTaskThunk,
} from '../store/project_store/action/projectBoard.thunk';
import {
  deleteUserStoryLocally,
  toggleUserStoryFavoriteLocally,
} from '../store/project_store/reducer/project_reducer';
import {
  useCompleteSprintMutation,
  useGetCustomStatusQuery,
  useStartSprintMutation,
  useUpdateSprintDetailsMutation,
} from '../store/api/projectApi';
import {
  useCreateUserStoryMutation,
  useDeleteUserStoryMutation,
  useDeleteTaskMutation,
  useGetTasksQuery,
  useUploadUserStoryAttachmentMutation,
} from '../store/api/userStoryApi';
import { deleteSprint } from '../services/sprint.service';
import { showSnackbar } from '../components/common/Snackbar';
import {
  FilterTab,
  SPRINT_ACTION_CONFIG,
  calculateSprintTimeline,
  calculateSprintProgress,
  ACCENT_PALETTE,
  SprintItem,
  SprintDetailsScreenProps,
} from '../utils/sprintUtil';
import DeleteColumnModal from '../components/DeleteColumnModal';
import UpdateSprintModal from '../components/UpdateSprintModal';
import CreateProjectModal, {
  StoryAttachmentFile,
} from '../components/createProjectModel';
import CreateTaskBottomSheet from '../components/createTaskBottomSheet';
import UserStoriesPaginationSkeleton from '../components/skeleton/UserStoriesPaginationSkeleton';
import SprintDetailsSkeleton from '../components/skeleton/SprintDetailsSkeleton';
import SprintHeader from './SprintDetails/components/SprintHeader';
import SprintMetricCard from './SprintDetails/components/SprintMetricCard';
import SprintGoalCard from './SprintDetails/components/SprintGoalCard';
import SprintFilterBar from './SprintDetails/components/SprintFilterBar';
import SprintItemCard from './SprintDetails/components/SprintItemCard';
import SprintActionMenuModal from './SprintDetails/components/SprintActionMenuModal';

const PAGE_SIZE = 10;

const SprintDetailsScreen: React.FC<SprintDetailsScreenProps> = ({ route }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { width: screenWidth } = useWindowDimensions();
  const { sprintId, sprintName, projectId: routeProjectId } = route.params;
  const { colors } = useTheme();
  const { hp, wp, moderateScale } = useResponsive();

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteItem, setDeleteItem] = useState<SprintItem | null>(null);
  const [deleteUserStory, { isLoading: isDeletingStory }] =
    useDeleteUserStoryMutation();
  const [deleteTaskMutation, { isLoading: isDeletingTask }] =
    useDeleteTaskMutation();
  const [createUserStory, { isLoading: isCreatingStory }] =
    useCreateUserStoryMutation();
  const [uploadUserStoryAttachment] = useUploadUserStoryAttachmentMutation();

  const [isEditSprintVisible, setIsEditSprintVisible] = useState(false);
  const [isCompleteSprintVisible, setIsCompleteSprintVisible] = useState(false);
  const [completeSprintError, setCompleteSprintError] = useState('');
  const [sprintModalMode, setSprintModalMode] = useState<'start' | 'update'>(
    'update',
  );
  const [isActionMenuVisible, setIsActionMenuVisible] = useState(false);
  const [isCreateStoryVisible, setIsCreateStoryVisible] = useState(false);
  const [isCreateTaskVisible, setIsCreateTaskVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const [isUpdatingSprint, setIsUpdatingSprint] = useState(false);
  const [startSprint, { isLoading: isStartingSprint }] =
    useStartSprintMutation();
  const [completeSprint, { isLoading: isCompletingSprint }] =
    useCompleteSprintMutation();
  const [updateSprintDetails] = useUpdateSprintDetailsMutation();

  // User Story Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const lastRequestedPageRef = useRef(1);

  // Storyless Task Pagination State
  const [taskPage, setTaskPage] = useState(1);
  const lastRequestedTaskPageRef = useRef(1);
  const [taskRefetchKey, setTaskRefetchKey] = useState(0);

  // Store Selectors
  const {
    project,
    currentSprint,
    userStories = [],
    userStoryMeta,
    userStoryLoading: loading,
    isFetchingMore,
    getCurrentSprintLoading,
    error,
    userStoryError,
  } = useAppSelector((state: RootState) => state.projects);

  const projectId = routeProjectId
    ? String(routeProjectId)
    : project?.id
      ? String(project.id)
      : undefined;

  const {
    permissionsReady,
    canEditSprint,
    canDeleteSprint,
    canDeleteUserStory,
    canDeleteTask,
    canCreateUserStory,
    canCreateTask,
  } = usePermissions({
    projectId: projectId?.toString(),
  });

  const { data: customStatusResponse } = useGetCustomStatusQuery(
    { project_id: projectId || '' },
    { skip: !projectId },
  );

  // Storyless Tasks Query with pagination support
  const {
    data: storylessTasksResponse,
    isLoading: isStorylessLoading,
    isFetching: isStorylessFetching,
    refetch: refetchStorylessTasks,
  } = useGetTasksQuery(
    projectId && sprintId
      ? {
          projectId,
          sprint_id: sprintId,
          storyless_task: true,
          storyless: true,
          page: taskPage,
          page_size: PAGE_SIZE,
          search: debouncedSearchQuery || undefined,
          _refetchKey: taskRefetchKey,
        }
      : skipToken,
  );

  // Raw storyless tasks directly from RTK Query cache (merging already handled by userStoryApi)
  const rawStorylessTasks = useMemo(() => {
    if (!storylessTasksResponse?.data) return [];
    return Array.isArray(storylessTasksResponse.data)
      ? storylessTasksResponse.data
      : [];
  }, [storylessTasksResponse?.data]);

  // Reliable determination of whether more stories exist
  const hasMoreStories = useMemo(() => {
    if (!userStoryMeta) return false;
    if (userStoryMeta.total_items !== undefined) {
      return userStories.length < userStoryMeta.total_items;
    }
    if (userStoryMeta.total_pages !== undefined) {
      return currentPage < userStoryMeta.total_pages;
    }
    return Boolean(userStoryMeta.has_next);
  }, [userStoryMeta, userStories.length, currentPage]);

  // Reliable determination of whether more tasks exist
  const hasMoreTasks = useMemo(() => {
    const meta = storylessTasksResponse?.meta;
    if (!meta) return false;
    if (meta.total_items !== undefined) {
      return rawStorylessTasks.length < meta.total_items;
    }
    if (meta.total_pages !== undefined) {
      return taskPage < meta.total_pages;
    }
    return Boolean(meta.has_next);
  }, [storylessTasksResponse?.meta, rawStorylessTasks.length, taskPage]);

  const isSameSprint = Boolean(
    currentSprint?.id && String(currentSprint.id) === String(sprintId),
  );

  const [hasLoadedForThisSprint, setHasLoadedForThisSprint] =
    useState(isSameSprint);

  useEffect(() => {
    if (isSameSprint) {
      setHasLoadedForThisSprint(true);
      return;
    }
    const timer = setTimeout(() => {
      setHasLoadedForThisSprint(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, [sprintId, isSameSprint]);

  useEffect(() => {
    if (
      !getCurrentSprintLoading &&
      !loading &&
      (isSameSprint || error || userStoryError)
    ) {
      setHasLoadedForThisSprint(true);
    }
  }, [isSameSprint, getCurrentSprintLoading, loading, error, userStoryError]);

  // Initial sprint details fetch on mount / sprint change
  useEffect(() => {
    if (!sprintId || !projectId) return;

    dispatch(
      getSprintByIdThunk({
        project_id: projectId,
        sprint_id: sprintId,
      }),
    );
  }, [dispatch, projectId, sprintId]);

  // Fetch user stories on mount or when debounced search query changes
  useEffect(() => {
    if (!sprintId || !projectId) return;
    setCurrentPage(1);
    lastRequestedPageRef.current = 1;

    setTaskPage(1);
    lastRequestedTaskPageRef.current = 1;

    dispatch(
      getUserStories({
        projectId,
        payload: {
          sprint_id: sprintId,
          page: 1,
          page_size: PAGE_SIZE,
          search: debouncedSearchQuery || undefined,
        },
      }),
    );
  }, [dispatch, projectId, sprintId, debouncedSearchQuery]);

  // Sprint details fallback
  const sprint = useMemo(() => {
    const fallbackStartDate = new Date();

    return {
      id: currentSprint?.id || sprintId,
      name: currentSprint?.name || sprintName || 'Sprint',
      startDate: currentSprint?.start_date || fallbackStartDate.toISOString(),
      endDate: currentSprint?.end_date,
      status: currentSprint?.status || 'Active',
      goal: currentSprint?.goal || 'Set goal for this sprint.',
    };
  }, [currentSprint, sprintId, sprintName]);

  const sprintStatus = sprint.status?.trim().toLowerCase() ?? 'planned';
  const sprintAction =
    SPRINT_ACTION_CONFIG[sprintStatus] ?? SPRINT_ACTION_CONFIG.planned;

  const refreshSprintContent = useCallback(() => {
    if (!projectId || !sprintId) return;
    setCurrentPage(1);
    lastRequestedPageRef.current = 1;

    setTaskPage(1);
    lastRequestedTaskPageRef.current = 1;
    setTaskRefetchKey(prev => prev + 1);

    dispatch(
      getUserStories({
        projectId,
        payload: {
          sprint_id: sprintId,
          page: 1,
          page_size: PAGE_SIZE,
          search: debouncedSearchQuery || undefined,
        },
      }),
    );
    dispatch(
      getSprintByIdThunk({
        project_id: projectId,
        sprint_id: sprintId,
      }),
    );
    refetchStorylessTasks();
  }, [
    dispatch,
    projectId,
    sprintId,
    debouncedSearchQuery,
    refetchStorylessTasks,
  ]);

  const handleCreateUserStory = useCallback(
    async (payload: CreateUserStoryPayload, file?: StoryAttachmentFile) => {
      if (!projectId || !sprintId) {
        throw new Error('Project and sprint are required to create a story.');
      }
      const response = await createUserStory({
        projectId,
        payload: { ...payload, sprint_id: sprintId },
      }).unwrap();
      const userStoryId = response.data?.id;
      if (userStoryId && file) {
        await uploadUserStoryAttachment({
          projectId,
          userStoryId: String(userStoryId),
          file,
        }).unwrap();
      }
    },
    [createUserStory, projectId, sprintId, uploadUserStoryAttachment],
  );

  // Stable sprint counts that accurately reflect the sprint's items
  const storiesCount = useMemo(() => {
    return userStoryMeta?.total_items ?? userStories.length;
  }, [userStoryMeta?.total_items, userStories.length]);

  const storylessTasksCount = useMemo(() => {
    return (
      storylessTasksResponse?.meta?.total_items ?? rawStorylessTasks.length
    );
  }, [storylessTasksResponse?.meta?.total_items, rawStorylessTasks.length]);

  const highPriorityCount = useMemo(() => {
    const hpStories = userStories.filter(
      s => s.priority?.trim().toLowerCase() === 'high',
    ).length;
    const hpTasks = rawStorylessTasks.filter(
      t => t.priority?.trim().toLowerCase() === 'high',
    ).length;
    return hpStories + hpTasks;
  }, [userStories, rawStorylessTasks]);

  const allCount = storiesCount + storylessTasksCount;

  // Unified items mapped from stores
  const mappedStories: SprintItem[] = useMemo(() => {
    return userStories.map(s => {
      const storyType = (s as any).type
        ? ['story', 'user_story', 'userstory'].includes(
            String((s as any).type).toLowerCase(),
          )
          ? 'userStory'
          : (s as any).type
        : 'userStory';

      return {
        id: String(s.id),
        key: s.key,
        title: s.title,
        priority: s.priority,
        status: s.status,
        is_favourite: s.is_favourite,
        total_tasks: s.total_tasks,
        isStoryless: false,
        type: storyType,
        rawItem: s,
      };
    });
  }, [userStories]);

  const mappedStorylessTasks: SprintItem[] = useMemo(() => {
    return rawStorylessTasks.map(t => {
      const taskType = t.type
        ? String(t.type).toLowerCase() === 'task'
          ? 'Task'
          : t.type
        : 'Task';

      return {
        id: String(t.id),
        key: t.key || (t as any).task_key || t.formatted_serial_number || '',
        title: t.title,
        priority: t.priority,
        status: t.status,
        is_favourite: t.is_favourite,
        total_tasks: 0,
        isStoryless: true,
        type: taskType,
        rawItem: t,
      };
    });
  }, [rawStorylessTasks]);

  // Display items filtered purely in memory by activeTab and local search
  const displayItems: SprintItem[] = useMemo(() => {
    let items: SprintItem[];
    switch (activeTab) {
      case 'stories':
        items = mappedStories;
        break;
      case 'storyless':
        items = mappedStorylessTasks;
        break;
      case 'high_priority':
        items = [...mappedStories, ...mappedStorylessTasks].filter(
          item => item.priority?.trim().toLowerCase() === 'high',
        );
        break;
      case 'all':
      default:
        items = [...mappedStories, ...mappedStorylessTasks];
        break;
    }

    const trimmedSearch = searchQuery.trim().toLowerCase();
    if (!trimmedSearch) {
      return items;
    }

    return items.filter(
      item =>
        item.title?.toLowerCase().includes(trimmedSearch) ||
        item.key?.toLowerCase().includes(trimmedSearch),
    );
  }, [activeTab, mappedStories, mappedStorylessTasks, searchQuery]);

  // Completed & in-progress calculation
  const completedStoryCount = useMemo(() => {
    return userStories.filter(story =>
      ['completed', 'done'].includes(story.status?.trim().toLowerCase()),
    ).length;
  }, [userStories]);

  const inProgressStoryCount = useMemo(() => {
    return Math.max(0, userStories.length - completedStoryCount);
  }, [userStories.length, completedStoryCount]);

  // Timeline & progress calculation from sprintUtil
  const timeline = useMemo(() => {
    return calculateSprintTimeline(sprint.startDate, sprint.endDate);
  }, [sprint.startDate, sprint.endDate]);

  const progressPercent = useMemo(() => {
    return calculateSprintProgress(
      sprintStatus,
      timeline?.progress,
      completedStoryCount,
      userStories.length,
    );
  }, [sprintStatus, timeline, userStories.length, completedStoryCount]);

  const daysLeft = timeline?.daysLeft ?? 0;

  // Pagination handler supporting all tabs ('all', 'stories', 'storyless', 'high_priority')
  const handleLoadMore = useCallback(() => {
    if (!projectId || !sprintId) return;

    // Helper to paginate user stories
    const loadNextStories = () => {
      if (loading || isFetchingMore || !hasMoreStories) {
        return;
      }

      const nextPage = currentPage + 1;
      if (lastRequestedPageRef.current === nextPage) return;
      lastRequestedPageRef.current = nextPage;

      dispatch(
        getUserStories({
          projectId,
          payload: {
            sprint_id: sprintId,
            page: nextPage,
            page_size: PAGE_SIZE,
            search: debouncedSearchQuery || undefined,
          },
        }),
      )
        .unwrap()
        .then(() => {
          setCurrentPage(nextPage);
        })
        .catch(err => {
          lastRequestedPageRef.current = currentPage;
          console.error('Failed to fetch more user stories:', err);
        });
    };

    // Helper to paginate storyless tasks
    const loadNextTasks = () => {
      if (isStorylessLoading || isStorylessFetching || !hasMoreTasks) {
        return;
      }

      const nextTaskPage = taskPage + 1;
      if (lastRequestedTaskPageRef.current === nextTaskPage) return;
      lastRequestedTaskPageRef.current = nextTaskPage;
      setTaskPage(nextTaskPage);
    };

    if (activeTab === 'stories') {
      loadNextStories();
    } else if (activeTab === 'storyless') {
      loadNextTasks();
    } else if (activeTab === 'all' || activeTab === 'high_priority') {
      if (hasMoreStories) {
        loadNextStories();
      }
      if (hasMoreTasks) {
        loadNextTasks();
      }
    }
  }, [
    activeTab,
    projectId,
    sprintId,
    loading,
    isFetchingMore,
    hasMoreStories,
    currentPage,
    debouncedSearchQuery,
    dispatch,
    isStorylessLoading,
    isStorylessFetching,
    hasMoreTasks,
    taskPage,
  ]);

  const handleToggleFavorite = useCallback(
    async (item: SprintItem) => {
      if (!projectId) return;
      if (item.isStoryless) {
        const currentFav = item.is_favourite ?? false;
        try {
          if (currentFav) {
            await dispatch(
              unfavouriteTaskThunk({ projectId, taskId: item.id }),
            ).unwrap();
          } else {
            await dispatch(
              favouriteTaskThunk({ projectId, taskId: item.id }),
            ).unwrap();
          }
          refetchStorylessTasks();
        } catch {
          showSnackbar({
            message: 'Failed to update favourite',
            type: 'error',
          });
        }
      } else {
        const currentFav = item.is_favourite ?? false;
        const nextFav = !currentFav;

        dispatch(
          toggleUserStoryFavoriteLocally({
            userStoryId: item.id,
            is_favourite: nextFav,
          }),
        );

        try {
          if (currentFav) {
            await dispatch(
              unfavouriteUserStoryThunk({ projectId, userStoryId: item.id }),
            ).unwrap();
          } else {
            await dispatch(
              favouriteUserStoryThunk({ projectId, userStoryId: item.id }),
            ).unwrap();
          }
        } catch {
          dispatch(
            toggleUserStoryFavoriteLocally({
              userStoryId: item.id,
              is_favourite: currentFav,
            }),
          );
          showSnackbar({
            message: 'Failed to update favourite',
            type: 'error',
          });
        }
      }
    },
    [dispatch, projectId, refetchStorylessTasks],
  );

  const handleConfirmDelete = async () => {
    if (!deleteItem || !projectId) return;

    if (deleteItem.isStoryless) {
      if (!permissionsReady || !canDeleteTask) return;
      try {
        await deleteTaskMutation({
          projectId,
          taskIds: [deleteItem.id],
        }).unwrap();
        setDeleteItem(null);
        refetchStorylessTasks();
        showSnackbar({
          message: 'Task deleted successfully',
          type: 'success',
        });
      } catch (err: any) {
        showSnackbar({
          message:
            err?.data?.message || err?.message || 'Failed to delete task',
          type: 'error',
        });
      }
    } else {
      if (!permissionsReady || !canDeleteUserStory) return;
      try {
        const response = await deleteUserStory({
          projectId: projectId.toString(),
          userStoryId: deleteItem.id,
        }).unwrap();

        dispatch(deleteUserStoryLocally(deleteItem.id));
        setDeleteItem(null);

        showSnackbar({
          message: response?.message || 'User story deleted successfully',
          type: 'success',
        });
      } catch (err: any) {
        showSnackbar({
          message:
            err?.data?.message || err?.message || 'Failed to delete user story',
          type: 'error',
        });
      }
    }
  };

  const handleDeleteSprint = async (
    targetProjectId: string,
    targetSprintId: string,
  ) => {
    if (
      !permissionsReady ||
      !canDeleteSprint ||
      !targetProjectId ||
      !targetSprintId ||
      isDeleting
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteSprint(targetProjectId, targetSprintId);
      setIsDeleteModalVisible(false);
      navigation.goBack();
    } catch (err) {
      console.error('Failed to delete sprint:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCompleteSprint = async () => {
    if (
      !permissionsReady ||
      !canEditSprint ||
      !projectId ||
      !sprintId ||
      isCompletingSprint
    ) {
      return;
    }
    setCompleteSprintError('');
    try {
      await completeSprint({
        project_id: projectId,
        sprint_id: sprintId,
      }).unwrap();
      setIsCompleteSprintVisible(false);
      showSnackbar({
        message: 'Sprint completed successfully',
        type: 'success',
      });
      dispatch(
        getSprintByIdThunk({ project_id: projectId, sprint_id: sprintId }),
      )
        .unwrap()
        .catch(err =>
          console.error('Failed to refresh completed sprint:', err),
        );
    } catch (err: any) {
      setCompleteSprintError(
        err?.data?.error?.message ||
          err?.data?.message ||
          err?.message ||
          'Failed to complete sprint. Please try again.',
      );
    }
  };

  const handleSprintAction = useCallback(() => {
    switch (sprintAction.action) {
      case 'start':
        setSprintModalMode('start');
        setIsEditSprintVisible(true);
        break;

      case 'complete':
        setCompleteSprintError('');
        setIsCompleteSprintVisible(true);
        break;

      case 'resume':
        showSnackbar({
          message: 'Resume sprint API is not implemented yet',
          type: 'info',
        });
        break;

      case 'none':
      default:
        break;
    }
  }, [sprintAction.action]);

  const handlePressItem = useCallback(
    (item: SprintItem) => {
      if (item.isStoryless) {
        navigation.navigate('issue', {
          projectId,
          taskId: item.id,
          task: { ...item.rawItem, type: item.type },
        });
      } else {
        navigation.navigate('issue', {
          projectId,
          userStoryId: item.id,
          story: { ...item.rawItem, type: item.type },
        });
      }
    },
    [navigation, projectId],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: SprintItem; index: number }) => {
      const canDeleteItem = item.isStoryless
        ? permissionsReady && canDeleteTask
        : permissionsReady && canDeleteUserStory;
      const accentColor = ACCENT_PALETTE[index % ACCENT_PALETTE.length];

      return (
        <SprintItemCard
          item={item}
          isSelected={false}
          canDelete={canDeleteItem}
          colors={colors}
          onPress={() => handlePressItem(item)}
          onToggleFavorite={() => handleToggleFavorite(item)}
          onDelete={() => setDeleteItem(item)}
          accentColor={accentColor}
        />
      );
    },
    [
      permissionsReady,
      canDeleteTask,
      canDeleteUserStory,
      colors,
      handlePressItem,
      handleToggleFavorite,
    ],
  );

  const keyExtractor = useCallback(
    (item: SprintItem) => `${item.isStoryless ? 'task' : 'story'}_${item.id}`,
    [],
  );

  const ListHeaderComponent = useMemo(
    () => (
      <View
        style={{
          width: screenWidth,
          backgroundColor: colors.background,
        }}
      >
        <SprintHeader
          sprint={sprint}
          progressPercent={progressPercent}
          daysLeft={daysLeft}
          permissionsReady={permissionsReady}
          canEditSprint={canEditSprint}
          canDeleteSprint={canDeleteSprint}
          onBack={() => navigation.goBack()}
          onEditSprint={() => {
            setSprintModalMode('update');
            setIsEditSprintVisible(true);
          }}
          onOpenActionMenu={() => setIsActionMenuVisible(true)}
          colors={colors}
        />

        <View
          style={{ paddingHorizontal: wp(4), paddingTop: moderateScale(14) }}
        >
          {/* Three Metric Cards Row (Stories, Storyless Tasks, High Priority) */}
          <View
            style={{
              flexDirection: 'row',
              gap: moderateScale(10),
            }}
          >
            <SprintMetricCard
              type='stories'
              count={storiesCount}
              label='Stories'
              onPress={() => {
                setActiveTab('stories');
                setIsFilterActive(true);
              }}
              colors={colors}
            />

            <SprintMetricCard
              type='storyless'
              count={storylessTasksCount}
              label='Storyless Tasks'
              onPress={() => {
                setActiveTab('storyless');
                setIsFilterActive(true);
              }}
              colors={colors}
            />

            <SprintMetricCard
              type='high_priority'
              count={highPriorityCount}
              label='High priority'
              onPress={() => {
                setActiveTab('high_priority');
                setIsFilterActive(true);
              }}
              colors={colors}
            />
          </View>

          {/* Sprint Goal Card */}
          <SprintGoalCard
            goal={sprint.goal}
            sprintName={sprint.name}
            canEdit={permissionsReady && canEditSprint}
            onPress={() => {
              if (!permissionsReady || !canEditSprint) return;
              setSprintModalMode('update');
              setIsEditSprintVisible(true);
            }}
            colors={colors}
          />

          <SprintFilterBar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            isFilterActive={isFilterActive}
            onToggleFilter={() => {
              setIsFilterActive(prev => {
                const next = !prev;
                if (!next) {
                  setActiveTab('all');
                }
                return next;
              });
            }}
            isSearchActive={isSearchActive}
            onToggleSearch={() => setIsSearchActive(prev => !prev)}
            searchQuery={searchQuery}
            onChangeSearchQuery={setSearchQuery}
            totalFilteredCount={displayItems.length}
            allCount={allCount}
            storiesCount={storiesCount}
            storylessCount={storylessTasksCount}
            highPriorityCount={highPriorityCount}
            colors={colors}
          />
        </View>
      </View>
    ),
    [
      screenWidth,
      colors,
      sprint,
      progressPercent,
      daysLeft,
      permissionsReady,
      canEditSprint,
      canDeleteSprint,
      navigation,
      wp,
      moderateScale,
      storiesCount,
      storylessTasksCount,
      highPriorityCount,
      allCount,
      activeTab,
      isFilterActive,
      isSearchActive,
      searchQuery,
      displayItems.length,
    ],
  );

  const isListLoading =
    (activeTab === 'storyless' &&
      isStorylessLoading &&
      rawStorylessTasks.length === 0) ||
    (activeTab !== 'storyless' && loading && userStories.length === 0);

  if (!hasLoadedForThisSprint) {
    return <SprintDetailsSkeleton onBack={() => navigation.goBack()} />;
  }

  return (
    <View
      style={{
        flex: 1,
        width: screenWidth,
        backgroundColor: colors.background,
      }}
    >
      <StatusBar
        barStyle='light-content'
        translucent
        backgroundColor='transparent'
      />

      <FlatList
        data={displayItems}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        style={{ width: screenWidth, flex: 1 }}
        contentContainerStyle={{
          width: screenWidth,
          paddingBottom: hp(8),
        }}
        ListHeaderComponent={ListHeaderComponent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          isListLoading ? (
            <View
              style={{
                marginHorizontal: wp(4),
                marginTop: moderateScale(4),
              }}
            >
              <UserStoriesPaginationSkeleton />
            </View>
          ) : !loading && !isFetchingMore && !isStorylessFetching ? (
            <View
              style={{
                marginHorizontal: wp(4),
                marginTop: moderateScale(12),
                alignItems: 'center',
                borderRadius: moderateScale(18),
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                padding: moderateScale(28),
              }}
            >
              <Ionicons
                name='albums-outline'
                size={moderateScale(32)}
                color={colors.textSecondary}
              />
              <AppText
                variant='body'
                style={{
                  marginTop: moderateScale(8),
                  color: colors.textSecondary,
                  textAlign: 'center',
                }}
              >
                {searchQuery
                  ? 'No items match your search'
                  : activeTab === 'storyless'
                    ? 'No storyless tasks in this sprint yet'
                    : activeTab === 'high_priority'
                      ? 'No high priority items in this sprint'
                      : 'No user stories in this sprint yet'}
              </AppText>
            </View>
          ) : null
        }
        ListFooterComponent={
          isFetchingMore || (taskPage > 1 && isStorylessFetching) ? (
            <UserStoriesPaginationSkeleton />
          ) : null
        }
      />

      {/* Action Menu Modal (Three dots) */}
      <SprintActionMenuModal
        visible={isActionMenuVisible}
        onClose={() => setIsActionMenuVisible(false)}
        canCreateUserStory={canCreateUserStory}
        canCreateTask={canCreateTask}
        canEditSprint={canEditSprint}
        canDeleteSprint={canDeleteSprint}
        permissionsReady={permissionsReady}
        sprintAction={sprintAction}
        onCreateStory={() => setIsCreateStoryVisible(true)}
        onCreateStorylessTask={() => setIsCreateTaskVisible(true)}
        onSprintAction={handleSprintAction}
        onEditSprint={() => {
          setSprintModalMode('update');
          setIsEditSprintVisible(true);
        }}
        onDeleteSprint={() => setIsDeleteModalVisible(true)}
        colors={colors}
      />

      {/* Create Story Modal */}
      <CreateProjectModal
        visible={isCreateStoryVisible}
        onClose={() => setIsCreateStoryVisible(false)}
        mode='story'
        title='Create User Story'
        projectId={projectId}
        sprintId={sprintId}
        statuses={customStatusResponse?.data}
        onCreateStory={handleCreateUserStory}
        isCreatingStory={isCreatingStory}
        onSuccess={() => {
          setIsCreateStoryVisible(false);
          refreshSprintContent();
        }}
      />

      {/* Create Storyless Task Bottom Sheet */}
      <CreateTaskBottomSheet
        visible={isCreateTaskVisible}
        onClose={() => setIsCreateTaskVisible(false)}
        projectId={projectId}
        sprintId={sprintId}
        storyless={true}
        onSuccess={refreshSprintContent}
      />

      {/* Delete Sprint Modal */}
      {isDeleteModalVisible && (
        <DeleteColumnModal
          visible={isDeleteModalVisible}
          columnTitle='Want to delete this sprint?'
          onClose={() => {
            if (!isDeleting) {
              setIsDeleteModalVisible(false);
            }
          }}
          onDelete={async () => {
            await handleDeleteSprint(projectId || '', sprintId);
          }}
          loading={isDeleting}
        />
      )}

      {/* Delete Story / Task Modal */}
      {Boolean(deleteItem) && (
        <DeleteColumnModal
          visible={Boolean(deleteItem)}
          title={deleteItem?.isStoryless ? 'Delete Task' : 'Delete User Story'}
          columnTitle={
            deleteItem?.title ??
            (deleteItem?.isStoryless ? 'this task' : 'this user story')
          }
          colors={colors}
          loading={isDeletingStory || isDeletingTask}
          onClose={() => setDeleteItem(null)}
          onDelete={handleConfirmDelete}
        />
      )}

      {/* Start / Update Sprint Modal */}
      {isEditSprintVisible && (
        <UpdateSprintModal
          visible={isEditSprintVisible}
          onClose={() => setIsEditSprintVisible(false)}
          mode={sprintModalMode}
          sprint={sprint}
          isUpdating={isUpdatingSprint || isStartingSprint}
          onStart={async payload => {
            if (
              !permissionsReady ||
              !canEditSprint ||
              !projectId ||
              !sprintId
            ) {
              return;
            }
            await startSprint({
              project_id: projectId,
              sprint_id: sprintId,
              payload,
            }).unwrap();
            setIsEditSprintVisible(false);
            await dispatch(
              getSprintByIdThunk({
                project_id: projectId || '',
                sprint_id: sprintId,
              }),
            ).unwrap();
            showSnackbar({
              message: 'Sprint started successfully',
              type: 'success',
            });
          }}
          onUpdate={async payload => {
            if (
              !permissionsReady ||
              !canEditSprint ||
              !projectId ||
              !sprintId
            ) {
              return;
            }
            try {
              setIsUpdatingSprint(true);
              await updateSprintDetails({
                project_id: projectId || '',
                sprint_id: sprintId,
                payload: {
                  name: payload.name ?? currentSprint?.name ?? '',
                  goal: payload.goal ?? currentSprint?.goal ?? undefined,
                  start_date:
                    payload.start_date ??
                    currentSprint?.start_date ??
                    sprint.startDate,
                  end_date:
                    payload.end_date ??
                    currentSprint?.end_date ??
                    sprint.endDate,
                },
              }).unwrap();

              setIsEditSprintVisible(false);
              await dispatch(
                getSprintByIdThunk({
                  project_id: projectId || '',
                  sprint_id: sprintId,
                }),
              ).unwrap();

              showSnackbar({
                message: 'Sprint updated successfully',
                type: 'success',
              });
            } finally {
              setIsUpdatingSprint(false);
            }
          }}
        />
      )}

      {/* Complete Sprint Modal */}
      {isCompleteSprintVisible && (
        <UpdateSprintModal
          visible={isCompleteSprintVisible}
          mode='complete'
          onClose={() => {
            if (!isCompletingSprint) setIsCompleteSprintVisible(false);
          }}
          sprint={sprint}
          isUpdating={isCompletingSprint}
          error={completeSprintError}
          completedStoryCount={completedStoryCount}
          inProgressStoryCount={inProgressStoryCount}
          onComplete={handleCompleteSprint}
          onUpdate={() => {}}
        />
      )}
    </View>
  );
};

export default SprintDetailsScreen;
