import React, {
  ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../components';
import { useTheme } from '../theme/ThemeProvider';
import { useResponsive } from '../utils/responsive';
import {
  getSprintByIdThunk,
  getUserStories,
} from '../store/project_store/action/project_thunk';
import {
  favouriteUserStoryThunk,
  unfavouriteUserStoryThunk,
} from '../store/project_store/action/projectBoard.thunk';
import {
  deleteUserStoryLocally,
  toggleUserStoryFavoriteLocally,
} from '../store/project_store/reducer/project_reducer';
import { RootState, useAppDispatch, useAppSelector } from '../store';
import { UserStory } from '../types/project.type';
import Ionicons from '@react-native-vector-icons/ionicons';
import { deleteSprint } from '../services/sprint.service';
import {
  useCompleteSprintMutation,
  useStartSprintMutation,
  useUpdateSprintDetailsMutation,
} from '../store/api/projectApi';
import DeleteColumnModal from '../components/DeleteColumnModal';
import UpdateSprintModal from '../components/UpdateSprintModal';
import UserStoriesPaginationSkeleton from '../components/skeleton/UserStoriesPaginationSkeleton';
import SprintDetailsSkeleton from '../components/skeleton/SprintDetailsSkeleton';
import { RootStackParamList } from '../types/navigationTypes';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import SwipeableOption from '../components/SwipeableOption';
import { useDeleteUserStoryMutation } from '../store/api/userStoryApi';
import { showSnackbar } from '../components/common/Snackbar';
import { usePermissions } from '../hooks/usePermissions';

const SunsetHeaderImage = require('../assets/images/Serene Mountain Lake at Sunset.png');

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface SprintDetailsScreenProps {
  route: {
    params: {
      sprintId: string;
      sprintName?: string;
      projectId?: string | number;
    };
  };
}

// Colors and styling constants
const COLOR_MINT = '#14E8A8';
const COLOR_BLUE = '#2563EB';
const COLOR_ROSE = '#F43F5E';
const COLOR_GREEN = '#10B981';

const withOpacity = (hex: string, opacity: number) => {
  if (!hex || !hex.startsWith('#')) return hex;
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map(c => c + c)
          .join('')
      : clean;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${opacity})`;
};

const parseDate = (value?: string) => {
  if (!value) return null;
  const t = Date.parse(value);
  return Number.isNaN(t) ? null : new Date(t);
};

const cleanHtmlText = (html?: string) => {
  if (!html) return '';
  return html
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
};

type FilterTab = 'all' | 'stories' | 'tasks' | 'high_priority';

const SprintDetailsScreen: React.FC<SprintDetailsScreenProps> = ({ route }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { sprintId, sprintName, projectId: routeProjectId } = route.params;

  const { colors, theme, mode } = useTheme();
  const isDark = Boolean(theme?.dark || mode === 'dark');
  const { hp, wp, moderateScale } = useResponsive();

  const [selectedStories, setSelectedStories] = useState<string[]>([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStoryItem, setDeleteStoryItem] = useState<UserStory | null>(
    null,
  );

  const [deleteUserStory, { isLoading: isDeletingStory }] =
    useDeleteUserStoryMutation();

  const [isEditSprintVisible, setIsEditSprintVisible] = useState(false);
  const [isCompleteSprintVisible, setIsCompleteSprintVisible] = useState(false);
  const [completeSprintError, setCompleteSprintError] = useState('');
  const [sprintModalMode, setSprintModalMode] = useState<'start' | 'update'>(
    'update',
  );
  const [isActionMenuVisible, setIsActionMenuVisible] = useState(false);

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const filterScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (isFilterActive && activeTab === 'high_priority') {
      setTimeout(() => {
        filterScrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [isFilterActive, activeTab]);

  const [isUpdatingSprint, setIsUpdatingSprint] = useState(false);
  const [startSprint, { isLoading: isStartingSprint }] =
    useStartSprintMutation();
  const [completeSprint, { isLoading: isCompletingSprint }] =
    useCompleteSprintMutation();
  const [updateSprintDetails] = useUpdateSprintDetailsMutation();

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [hasMoreStories, setHasMoreStories] = useState(true);
  const lastRequestedPageRef = useRef(1);

  // Store Selectors
  const {
    project,
    currentSprint,
    userStories = [],
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
  } = usePermissions({
    projectId: projectId?.toString(),
  });

  const isSameSprint = Boolean(
    currentSprint?.id && String(currentSprint.id) === String(sprintId),
  );

  const [hasLoadedForThisSprint, setHasLoadedForThisSprint] =
    useState(isSameSprint);

  useEffect(() => {
    setHasLoadedForThisSprint(isSameSprint);
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasLoadedForThisSprint(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, [sprintId]);

  // Fetch Sprint & User Stories on Mount
  useEffect(() => {
    if (!sprintId || !projectId) return;

    setCurrentPage(1);
    lastRequestedPageRef.current = 1;
    setHasMoreStories(true);

    dispatch(
      getSprintByIdThunk({
        project_id: projectId,
        sprint_id: sprintId,
      }),
    );

    dispatch(
      getUserStories({
        projectId,
        payload: {
          sprint_id: sprintId,
          page: 1,
          page_size: PAGE_SIZE,
          sort_by: 'created_at',
          sort_order: 'DESC',
        },
      }),
    );
  }, [dispatch, projectId, sprintId]);

  // Sprint details fallback
  const sprint = useMemo(() => {
    return {
      id: currentSprint?.id || sprintId,
      name: currentSprint?.name || sprintName || 'Test11',
      startDate: currentSprint?.start_date || '2026-10-14',
      endDate: currentSprint?.end_date || '2026-10-15',
      status: currentSprint?.status || 'Active',
      goal:
        currentSprint?.goal ||
        'Build and ship the core features for ' +
          (currentSprint?.name || sprintName || 'Test11') +
          ' sprint.',
    };
  }, [currentSprint, sprintId, sprintName]);

  const storiesData: UserStory[] = userStories.length > 0 ? userStories : [];

  type SprintAction = 'start' | 'complete' | 'resume' | 'none';

  const sprintActionConfig: Record<
    string,
    { label: string; icon: IoniconName; action: SprintAction }
  > = {
    planned: {
      label: 'Start Sprint',
      icon: 'play-outline',
      action: 'start',
    },
    active: {
      label: 'Complete Sprint',
      icon: 'checkmark-done-outline',
      action: 'complete',
    },
    on_hold: {
      label: 'Resume Sprint',
      icon: 'play-outline',
      action: 'resume',
    },
    completed: {
      label: 'Completed',
      icon: 'checkmark-circle-outline',
      action: 'none',
    },
    cancelled: {
      label: 'Cancelled',
      icon: 'close-circle-outline',
      action: 'none',
    },
    archived: {
      label: 'Archived',
      icon: 'archive-outline',
      action: 'none',
    },
  };

  const sprintStatus = sprint.status?.trim().toLowerCase() ?? 'planned';
  const sprintAction =
    sprintActionConfig[sprintStatus] ?? sprintActionConfig.planned;

  const completedStoryCount = storiesData.filter(story =>
    ['completed', 'done'].includes(story.status?.trim().toLowerCase()),
  ).length;
  const inProgressStoryCount = Math.max(
    0,
    storiesData.length - completedStoryCount,
  );

  const totalTasks = useMemo(() => {
    return storiesData.reduce((sum, s) => sum + (s?.total_tasks ?? 0), 0);
  }, [storiesData]);

  const highPriorityCount = useMemo(() => {
    return storiesData.filter(s => s.priority?.trim().toLowerCase() === 'high')
      .length;
  }, [storiesData]);

  // Timeline & progress calculation
  const timeline = useMemo(() => {
    const start = parseDate(sprint.startDate);
    const end = parseDate(sprint.endDate);
    if (!start || !end || end <= start) {
      return { progress: 1, daysLeft: 0 };
    }
    const now = Date.now();
    const progress = Math.min(
      1,
      Math.max(0, (now - start.getTime()) / (end.getTime() - start.getTime())),
    );
    const daysLeft = Math.max(0, Math.ceil((end.getTime() - now) / 86400000));
    return { progress, daysLeft };
  }, [sprint.startDate, sprint.endDate]);

  const progressPercent = useMemo(() => {
    if (sprintStatus === 'completed') return 100;
    if (timeline) {
      return Math.round(timeline.progress * 100);
    }
    if (storiesData.length > 0) {
      return Math.round((completedStoryCount / storiesData.length) * 100);
    }
    return 100;
  }, [sprintStatus, timeline, storiesData.length, completedStoryCount]);

  const daysLeft = timeline?.daysLeft ?? 0;

  // Filtered stories
  const filteredStories = useMemo(() => {
    let list = storiesData;

    if (activeTab === 'stories') {
      list = list.filter(s => (s as any).issue_type?.toLowerCase() !== 'task');
    } else if (activeTab === 'tasks') {
      list = list.filter(s => (s?.total_tasks ?? 0) > 0);
    } else if (activeTab === 'high_priority') {
      list = list.filter(s => s.priority?.toLowerCase() === 'high');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        s =>
          s.title?.toLowerCase().includes(q) ||
          s.key?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q),
      );
    }

    return list;
  }, [storiesData, activeTab, searchQuery]);

  const handleLoadMore = useCallback(() => {
    if (
      !projectId ||
      !sprintId ||
      loading ||
      isFetchingMore ||
      !hasMoreStories ||
      storiesData.length === 0
    ) {
      return;
    }

    const nextPage = currentPage + 1;
    if (lastRequestedPageRef.current === nextPage) {
      return;
    }
    lastRequestedPageRef.current = nextPage;

    dispatch(
      getUserStories({
        projectId,
        payload: {
          sprint_id: sprintId,
          page: nextPage,
          page_size: PAGE_SIZE,
          sort_by: 'created_at',
          sort_order: 'DESC',
        },
      }),
    )
      .unwrap()
      .then(response => {
        const newStories = response?.response?.data ?? [];
        const meta = response?.response?.meta;

        setCurrentPage(nextPage);

        if (meta?.has_next !== undefined) {
          if (!meta.has_next) setHasMoreStories(false);
        } else if (meta?.total_pages !== undefined) {
          if (nextPage >= meta.total_pages) setHasMoreStories(false);
        } else if (newStories.length === 0) {
          setHasMoreStories(false);
        }
      })
      .catch(error => {
        lastRequestedPageRef.current = currentPage;
        console.error('Failed to fetch more user stories:', error);
      });
  }, [
    projectId,
    sprintId,
    loading,
    isFetchingMore,
    hasMoreStories,
    storiesData.length,
    currentPage,
    dispatch,
  ]);

  const getPriorityColor = useCallback(
    (priority?: string) => {
      switch (priority?.toLowerCase()) {
        case 'high':
          return COLOR_ROSE;
        case 'medium':
          return '#F59E0B';
        case 'low':
          return COLOR_GREEN;
        default:
          return colors.textSecondary;
      }
    },
    [colors],
  );

  const getStatusColor = useCallback(
    (status?: string) => {
      const s = status?.toLowerCase() || '';
      if (s.includes('active') || s.includes('progress')) return COLOR_GREEN;
      if (s.includes('plan') || s.includes('todo') || s.includes('backlog'))
        return '#6366F1';
      if (s.includes('done') || s.includes('complete')) return '#8B5CF6';
      return colors.textSecondary;
    },
    [colors],
  );

  const handleToggleStoryFavorite = useCallback(
    async (storyId: string) => {
      if (!projectId) return;
      const story = storiesData.find(s => s.id === storyId);
      const currentFav = story?.is_favourite ?? false;
      const nextFav = !currentFav;

      dispatch(
        toggleUserStoryFavoriteLocally({
          userStoryId: storyId,
          is_favourite: nextFav,
        }),
      );

      try {
        if (currentFav) {
          await dispatch(
            unfavouriteUserStoryThunk({ projectId, userStoryId: storyId }),
          ).unwrap();
        } else {
          await dispatch(
            favouriteUserStoryThunk({ projectId, userStoryId: storyId }),
          ).unwrap();
        }
      } catch {
        dispatch(
          toggleUserStoryFavoriteLocally({
            userStoryId: storyId,
            is_favourite: currentFav,
          }),
        );
        showSnackbar({
          message: 'Failed to update favourite',
          type: 'error',
        });
      }
    },
    [dispatch, projectId, storiesData],
  );

  const handleConfirmDeleteStory = async () => {
    if (
      !permissionsReady ||
      !canDeleteUserStory ||
      !deleteStoryItem ||
      !projectId
    ) {
      return;
    }
    const storyIdToDelete = deleteStoryItem.id;
    try {
      const response = await deleteUserStory({
        projectId: projectId.toString(),
        userStoryId: storyIdToDelete,
      }).unwrap();

      dispatch(deleteUserStoryLocally(storyIdToDelete));
      setDeleteStoryItem(null);

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
    } catch (error) {
      console.error('Failed to delete sprint:', error);
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
        .catch(error =>
          console.error('Failed to refresh completed sprint:', error),
        );
    } catch (error: any) {
      setCompleteSprintError(
        error?.data?.error?.message ||
          error?.data?.message ||
          error?.message ||
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

  const renderStory = useCallback(
    ({ item }: { item: UserStory }) => {
      const isSelected = selectedStories.includes(item.id);
      const priorityColor = getPriorityColor(item.priority);
      const statusColor = getStatusColor(item.status);

      return (
        <SwipeableOption
          enabled={permissionsReady && canDeleteUserStory}
          actionWidth={moderateScale(65)}
          actions={[
            {
              key: 'delete-story',
              icon: 'trash-outline',
              accessibilityLabel: 'Delete user story',
              onPress: () => setDeleteStoryItem(item),
              width: moderateScale(65),
              iconSize: moderateScale(22),
            },
          ]}
          containerStyle={{
            marginHorizontal: wp(4),
            marginBottom: moderateScale(12),
            borderRadius: moderateScale(18),
            overflow: 'hidden',
          }}
          rightThreshold={40}
        >
          <View
            style={{
              borderRadius: moderateScale(18),
              backgroundColor: isSelected
                ? withOpacity(colors.primary, isDark ? 0.16 : 0.06)
                : colors.card,
              borderWidth: 1,
              borderColor: isSelected ? colors.primary : colors.border,
              overflow: 'hidden',
              elevation: 1,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isDark ? 0.2 : 0.05,
              shadowRadius: 3,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() =>
                navigation.navigate('issue', {
                  projectId,
                  userStoryId: item.id,
                })
              }
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              {/* Priority accent rail */}
              <View
                style={{
                  width: moderateScale(4),
                  alignSelf: 'stretch',
                  backgroundColor: priorityColor,
                }}
              />

              <View
                style={{
                  flex: 1,
                  paddingHorizontal: moderateScale(14),
                  paddingVertical: moderateScale(12),
                }}
              >
                {/* Top row: Key chip & Favorite star */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <View
                    style={{
                      backgroundColor: isDark
                        ? 'rgba(37, 99, 235, 0.25)'
                        : '#DBEAFE',
                      borderRadius: moderateScale(6),
                      paddingHorizontal: moderateScale(8),
                      paddingVertical: moderateScale(2),
                    }}
                  >
                    <AppText
                      variant='caption'
                      style={{
                        color: isDark ? '#60A5FA' : COLOR_BLUE,
                        fontSize: moderateScale(11),
                        fontWeight: '700',
                      }}
                      numberOfLines={1}
                    >
                      {item?.key}
                    </AppText>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={e => {
                      e.stopPropagation();
                      handleToggleStoryFavorite(item.id);
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={{
                      padding: 4,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons
                      name={item.is_favourite ? 'star' : 'star-outline'}
                      size={moderateScale(18)}
                      color={
                        item.is_favourite ? '#F59E0B' : colors.textSecondary
                      }
                    />
                  </TouchableOpacity>
                </View>

                {/* Story Title */}
                <AppText
                  variant='body'
                  style={{
                    marginTop: moderateScale(6),
                    fontWeight: '700',
                    color: colors.text,
                    fontSize: moderateScale(14),
                  }}
                  numberOfLines={2}
                >
                  {item?.title || ''}
                </AppText>

                {/* Meta badges */}
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    marginTop: moderateScale(10),
                    gap: moderateScale(6),
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderRadius: moderateScale(12),
                      backgroundColor: isDark ? colors.surface : '#F1F5F9',
                      paddingHorizontal: moderateScale(8),
                      paddingVertical: moderateScale(3),
                    }}
                  >
                    <Ionicons
                      name='list-outline'
                      size={moderateScale(12)}
                      color={colors.textSecondary}
                    />
                    <AppText
                      variant='caption'
                      style={{
                        marginLeft: moderateScale(4),
                        color: colors.textSecondary,
                        fontSize: moderateScale(11),
                        fontWeight: '500',
                      }}
                    >
                      {item?.total_tasks ?? 0} Tasks
                    </AppText>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderRadius: moderateScale(12),
                      backgroundColor: withOpacity(
                        priorityColor,
                        isDark ? 0.22 : 0.12,
                      ),
                      paddingHorizontal: moderateScale(8),
                      paddingVertical: moderateScale(3),
                    }}
                  >
                    <Ionicons
                      name='flag'
                      size={moderateScale(11)}
                      color={priorityColor}
                    />
                    <AppText
                      variant='caption'
                      style={{
                        marginLeft: moderateScale(4),
                        color: priorityColor,
                        fontSize: moderateScale(11),
                        fontWeight: '600',
                        textTransform: 'capitalize',
                      }}
                    >
                      {item.priority}
                    </AppText>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderRadius: moderateScale(12),
                      backgroundColor: withOpacity(
                        statusColor,
                        isDark ? 0.22 : 0.12,
                      ),
                      paddingHorizontal: moderateScale(8),
                      paddingVertical: moderateScale(3),
                    }}
                  >
                    <View
                      style={{
                        width: moderateScale(6),
                        height: moderateScale(6),
                        borderRadius: moderateScale(3),
                        backgroundColor: statusColor,
                        marginRight: moderateScale(4),
                      }}
                    />
                    <AppText
                      variant='caption'
                      style={{
                        color: statusColor,
                        fontSize: moderateScale(11),
                        fontWeight: '600',
                        textTransform: 'capitalize',
                      }}
                    >
                      {item.status}
                    </AppText>
                  </View>
                </View>
              </View>

              <View style={{ paddingRight: moderateScale(12) }}>
                <Ionicons
                  name='chevron-forward'
                  size={moderateScale(18)}
                  color={colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
          </View>
        </SwipeableOption>
      );
    },
    [
      selectedStories,
      colors,
      isDark,
      moderateScale,
      getPriorityColor,
      getStatusColor,
      navigation,
      projectId,
      handleToggleStoryFavorite,
      wp,
    ],
  );

  const keyExtractor = useCallback((item: UserStory) => item.id, []);

  // SVG Circular Ring Calculation
  const circleRadius = 12;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset =
    circleCircumference * (1 - Math.min(1, Math.max(0, progressPercent / 100)));

  const ListHeaderComponent = useMemo(
    () => (
      <View
        style={{
          width: screenWidth,
          backgroundColor: isDark ? colors.background : '#F6F9FD',
        }}
      >
        {/* Top Serene Sunset Header Image with exact curved bottom corners */}
        <View
          style={{
            width: screenWidth,
            borderBottomLeftRadius: moderateScale(30),
            borderBottomRightRadius: moderateScale(30),
            overflow: 'hidden',
            backgroundColor: isDark ? '#0F172A' : '#1E293B',
          }}
        >
          <ImageBackground
            source={SunsetHeaderImage}
            resizeMode='cover'
            fadeDuration={0}
            style={{
              width: screenWidth,
              paddingTop:
                insets.top > 0
                  ? insets.top + moderateScale(4)
                  : moderateScale(14),
              paddingHorizontal: wp(4),
              paddingBottom: moderateScale(14),
            }}
            imageStyle={{
              width: screenWidth,
              borderBottomLeftRadius: moderateScale(30),
              borderBottomRightRadius: moderateScale(30),
            }}
          >
            {/* Subtle natural contrast gradient */}
            <LinearGradient
              colors={[
                'rgba(15, 23, 42, 0.35)',
                'transparent',
                'rgba(10, 25, 65, 0.25)',
              ]}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />

            {/* Top Bar: Back Button, Title, and Right Action Buttons */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => navigation.goBack()}
                  style={{
                    width: moderateScale(38),
                    height: moderateScale(38),
                    borderRadius: moderateScale(19),
                    backgroundColor: 'rgba(255, 255, 255, 0.22)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons
                    name='arrow-back'
                    size={moderateScale(20)}
                    color='#FFFFFF'
                  />
                </TouchableOpacity>

                <AppText
                  variant='h3'
                  style={{
                    marginLeft: moderateScale(14),
                    fontSize: moderateScale(18),
                    fontWeight: '700',
                    color: '#FFFFFF',
                  }}
                >
                  Sprint Detail
                </AppText>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {/* Edit Button */}
                {permissionsReady && canEditSprint && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      setSprintModalMode('update');
                      setIsEditSprintVisible(true);
                    }}
                    style={{
                      width: moderateScale(38),
                      height: moderateScale(38),
                      borderRadius: moderateScale(19),
                      backgroundColor: 'rgba(255, 255, 255, 0.22)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: moderateScale(8),
                    }}
                  >
                    <Ionicons
                      name='pencil'
                      size={moderateScale(17)}
                      color='#FFFFFF'
                    />
                  </TouchableOpacity>
                )}

                {/* More Options Button */}
                {permissionsReady && (canEditSprint || canDeleteSprint) && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setIsActionMenuVisible(true)}
                    style={{
                      width: moderateScale(38),
                      height: moderateScale(38),
                      borderRadius: moderateScale(19),
                      backgroundColor: 'rgba(255, 255, 255, 0.22)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons
                      name='ellipsis-vertical'
                      size={moderateScale(18)}
                      color='#FFFFFF'
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Sprint Info Row: Rocket + Details */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: moderateScale(14),
              }}
            >
              {/* Rocket icon */}
              <LinearGradient
                colors={['#3B82F6', '#1D4ED8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: moderateScale(54),
                  height: moderateScale(54),
                  borderRadius: moderateScale(16),
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: moderateScale(10),
                  elevation: 3,
                  shadowColor: '#1D4ED8',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                }}
              >
                <Ionicons
                  name='rocket'
                  size={moderateScale(28)}
                  color='#FFFFFF'
                />
              </LinearGradient>

              {/* Sprint Details Text Column */}
              <View
                style={{
                  flex: 1,
                  marginRight: moderateScale(8),
                  justifyContent: 'center',
                }}
              >
                <AppText
                  variant='h3'
                  numberOfLines={1}
                  style={{
                    fontSize: moderateScale(18),
                    fontWeight: '800',
                    color: '#FFFFFF',
                    marginTop: moderateScale(1),
                  }}
                >
                  {sprint.name}
                </AppText>

                {/* Dates */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: moderateScale(3),
                  }}
                >
                  <Ionicons
                    name='calendar-outline'
                    size={moderateScale(12)}
                    color='rgba(255, 255, 255, 0.85)'
                  />
                  <AppText
                    variant='caption'
                    numberOfLines={1}
                    style={{
                      marginLeft: moderateScale(4),
                      fontSize: moderateScale(11),
                      color: 'rgba(255, 255, 255, 0.9)',
                    }}
                  >
                    {sprint.startDate?.split('T')[0]} →{' '}
                    {sprint.endDate?.split('T')[0]}
                  </AppText>
                </View>

                {/* Status Badge */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignSelf: 'flex-start',
                    marginTop: moderateScale(5),
                    backgroundColor: 'rgba(16, 185, 129, 0.28)',
                    borderRadius: moderateScale(12),
                    paddingHorizontal: moderateScale(8),
                    paddingVertical: moderateScale(2.5),
                  }}
                >
                  <View
                    style={{
                      width: moderateScale(6),
                      height: moderateScale(6),
                      borderRadius: moderateScale(3),
                      backgroundColor: '#34D399',
                      marginRight: moderateScale(5),
                    }}
                  />
                  <AppText
                    variant='caption'
                    style={{
                      fontSize: moderateScale(11),
                      fontWeight: '600',
                      color: '#6EE7B7',
                      textTransform: 'capitalize',
                    }}
                  >
                    {sprint.status}
                  </AppText>
                </View>
              </View>
            </View>

            {/* Full-width Neon Progress Bar */}
            <View style={{ marginTop: moderateScale(14) }}>
              <View
                style={{
                  height: moderateScale(7),
                  borderRadius: moderateScale(4),
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.max(0, progressPercent))}%`,
                    borderRadius: moderateScale(4),
                    backgroundColor: COLOR_MINT,
                  }}
                />
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: moderateScale(6),
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Svg
                    width={moderateScale(15)}
                    height={moderateScale(15)}
                    viewBox='0 0 30 30'
                    style={{ marginRight: moderateScale(5) }}
                  >
                    <Circle
                      cx={15}
                      cy={15}
                      r={circleRadius}
                      stroke='rgba(255, 255, 255, 0.25)'
                      strokeWidth={4}
                      fill='none'
                    />
                    <Circle
                      cx={15}
                      cy={15}
                      r={circleRadius}
                      stroke={COLOR_MINT}
                      strokeWidth={4}
                      strokeDasharray={circleCircumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap='round'
                      fill='none'
                      transform='rotate(-90 15 15)'
                    />
                  </Svg>
                  <AppText
                    variant='caption'
                    style={{
                      fontSize: moderateScale(11),
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: '500',
                    }}
                  >
                    {progressPercent}% completed
                  </AppText>
                </View>

                <AppText
                  variant='caption'
                  style={{
                    fontSize: moderateScale(11),
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: '500',
                  }}
                >
                  {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
                </AppText>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Body Container */}
        <View
          style={{ paddingHorizontal: wp(4), paddingTop: moderateScale(14) }}
        >
          {/* Three Metric Cards Row (Stories, Tasks, High Priority) */}
          <View
            style={{
              flexDirection: 'row',
              gap: moderateScale(10),
            }}
          >
            {/* Card 1: Stories */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setActiveTab('stories');
                setIsFilterActive(true);
              }}
              style={{
                flex: 1,
                backgroundColor: isDark ? '#1E293B' : '#E6F0FD',
                borderRadius: moderateScale(22),
                padding: moderateScale(14),
                overflow: 'hidden',
                position: 'relative',
                minHeight: moderateScale(116),
                justifyContent: 'space-between',
                borderWidth: isDark ? 1 : 0,
                borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
              }}
            >
              {/* Subtle bottom-right corner wave */}
              <Svg
                width={moderateScale(55)}
                height={moderateScale(42)}
                viewBox='0 0 55 42'
                style={{
                  position: 'absolute',
                  right: 0,
                  bottom: 0,
                }}
              >
                <Path
                  d='M0,42 C18,36 32,22 36,0 L55,0 L55,42 Z'
                  fill={isDark ? 'rgba(59, 130, 246, 0.18)' : '#D0E5FC'}
                />
              </Svg>

              {/* Document icon in rounded container */}
              <View
                style={{
                  width: moderateScale(36),
                  height: moderateScale(36),
                  borderRadius: moderateScale(12),
                  backgroundColor: isDark
                    ? 'rgba(59, 130, 246, 0.25)'
                    : '#D8EAFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Svg width={18} height={18} viewBox='0 0 18 18'>
                  <Path
                    d='M4 2.5C4 1.67 4.67 1 5.5 1H10.5L14 4.5V15.5C14 16.33 13.33 17 12.5 17H5.5C4.67 17 4 16.33 4 15.5V2.5Z'
                    fill={isDark ? '#38BDF8' : '#1D8FF2'}
                  />
                  <Path
                    d='M6 7H12M6 10H12M6 13H10'
                    stroke='#FFFFFF'
                    strokeWidth={1.4}
                    strokeLinecap='round'
                  />
                </Svg>
              </View>

              {/* Number, Label, and Chevron */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: moderateScale(8),
                }}
              >
                <View>
                  <AppText
                    variant='h2'
                    style={{
                      fontSize: moderateScale(22),
                      fontWeight: '800',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    }}
                  >
                    {storiesData.length}
                  </AppText>
                  <AppText
                    variant='caption'
                    style={{
                      fontSize: moderateScale(12.5),
                      fontWeight: '600',
                      color: isDark ? '#94A3B8' : '#475569',
                      marginTop: moderateScale(1),
                    }}
                  >
                    Stories
                  </AppText>
                </View>

                <Ionicons
                  name='chevron-forward'
                  size={moderateScale(17)}
                  color={isDark ? '#60A5FA' : '#2563EB'}
                />
              </View>
            </TouchableOpacity>

            {/* Card 2: Tasks */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setActiveTab('tasks');
                setIsFilterActive(true);
              }}
              style={{
                flex: 1,
                backgroundColor: isDark ? '#142E24' : '#E8F8F4',
                borderRadius: moderateScale(22),
                padding: moderateScale(14),
                overflow: 'hidden',
                position: 'relative',
                minHeight: moderateScale(116),
                justifyContent: 'space-between',
                borderWidth: isDark ? 1 : 0,
                borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'transparent',
              }}
            >
              {/* Subtle bottom-right corner wave */}
              <Svg
                width={moderateScale(55)}
                height={moderateScale(42)}
                viewBox='0 0 55 42'
                style={{
                  position: 'absolute',
                  right: 0,
                  bottom: 0,
                }}
              >
                <Path
                  d='M0,42 C18,36 32,22 36,0 L55,0 L55,42 Z'
                  fill={isDark ? 'rgba(16, 185, 129, 0.18)' : '#CEF2E6'}
                />
              </Svg>

              {/* Checkmark icon in rounded container */}
              <View
                style={{
                  width: moderateScale(36),
                  height: moderateScale(36),
                  borderRadius: moderateScale(12),
                  backgroundColor: isDark
                    ? 'rgba(16, 185, 129, 0.25)'
                    : '#D4F6EB',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Svg width={20} height={20} viewBox='0 0 20 20'>
                  <Circle cx={10} cy={10} r={9} fill='#10B981' />
                  <Path
                    d='M6 10L8.8 13L14 7'
                    stroke='#FFFFFF'
                    strokeWidth={2}
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </Svg>
              </View>

              {/* Number, Label, and Chevron */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: moderateScale(8),
                }}
              >
                <View>
                  <AppText
                    variant='h2'
                    style={{
                      fontSize: moderateScale(22),
                      fontWeight: '800',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    }}
                  >
                    {totalTasks}
                  </AppText>
                  <AppText
                    variant='caption'
                    style={{
                      fontSize: moderateScale(12.5),
                      fontWeight: '600',
                      color: isDark ? '#94A3B8' : '#475569',
                      marginTop: moderateScale(1),
                    }}
                  >
                    Tasks
                  </AppText>
                </View>

                <Ionicons
                  name='chevron-forward'
                  size={moderateScale(17)}
                  color={isDark ? '#34D399' : '#10B981'}
                />
              </View>
            </TouchableOpacity>

            {/* Card 3: High priority */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setActiveTab('high_priority');
                setIsFilterActive(true);
              }}
              style={{
                flex: 1,
                backgroundColor: isDark ? '#2E1922' : '#FEEBF1',
                borderRadius: moderateScale(22),
                padding: moderateScale(14),
                overflow: 'hidden',
                position: 'relative',
                minHeight: moderateScale(116),
                justifyContent: 'space-between',
                borderWidth: isDark ? 1 : 0,
                borderColor: isDark ? 'rgba(244, 63, 94, 0.3)' : 'transparent',
              }}
            >
              {/* Subtle bottom-right corner wave */}
              <Svg
                width={moderateScale(55)}
                height={moderateScale(42)}
                viewBox='0 0 55 42'
                style={{
                  position: 'absolute',
                  right: 0,
                  bottom: 0,
                }}
              >
                <Path
                  d='M0,42 C18,36 32,22 36,0 L55,0 L55,42 Z'
                  fill={isDark ? 'rgba(244, 63, 94, 0.18)' : '#FDD9E3'}
                />
              </Svg>

              {/* Flame icon in rounded container */}
              <View
                style={{
                  width: moderateScale(36),
                  height: moderateScale(36),
                  borderRadius: moderateScale(12),
                  backgroundColor: isDark
                    ? 'rgba(244, 63, 94, 0.25)'
                    : '#FEDEE6',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons
                  name='flame'
                  size={moderateScale(19)}
                  color='#F43F5E'
                />
              </View>

              {/* Number, Label, and Chevron */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: moderateScale(8),
                }}
              >
                <View>
                  <AppText
                    variant='h2'
                    style={{
                      fontSize: moderateScale(22),
                      fontWeight: '800',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                    }}
                  >
                    {highPriorityCount}
                  </AppText>
                  <AppText
                    variant='caption'
                    style={{
                      fontSize: moderateScale(12.5),
                      fontWeight: '600',
                      color: isDark ? '#94A3B8' : '#475569',
                      marginTop: moderateScale(1),
                    }}
                  >
                    High priority
                  </AppText>
                </View>

                <Ionicons
                  name='chevron-forward'
                  size={moderateScale(17)}
                  color={isDark ? '#FB7185' : '#F43F5E'}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Sprint Goal Card */}
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={!permissionsReady || !canEditSprint}
            onPress={() => {
              if (!permissionsReady || !canEditSprint) return;
              setSprintModalMode('update');
              setIsEditSprintVisible(true);
            }}
            style={{
              marginTop: moderateScale(14),
              backgroundColor: isDark ? '#1E1B38' : '#EDF0FD',
              borderRadius: moderateScale(22),
              padding: moderateScale(16),
              overflow: 'hidden',
              position: 'relative',
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: isDark ? 1 : 0,
              borderColor: isDark ? 'rgba(124, 58, 237, 0.3)' : 'transparent',
            }}
          >
            {/* Subtle bottom-right corner wave */}
            <Svg
              width={moderateScale(75)}
              height={moderateScale(55)}
              viewBox='0 0 75 55'
              style={{
                position: 'absolute',
                right: 0,
                bottom: 0,
              }}
            >
              <Path
                d='M0,55 C25,48 45,30 50,0 L75,0 L75,55 Z'
                fill={isDark ? 'rgba(124, 58, 237, 0.18)' : '#DDE2FE'}
              />
            </Svg>

            {/* Target icon with arrow */}
            <View
              style={{
                width: moderateScale(48),
                height: moderateScale(48),
                borderRadius: moderateScale(16),
                backgroundColor: isDark
                  ? 'rgba(124, 58, 237, 0.25)'
                  : '#E3E7FE',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: moderateScale(14),
              }}
            >
              <Svg
                width={moderateScale(28)}
                height={moderateScale(28)}
                viewBox='0 0 28 28'
              >
                <Circle
                  cx={14}
                  cy={14}
                  r={11}
                  stroke='#6366F1'
                  strokeWidth={2.2}
                  fill='none'
                />
                <Circle
                  cx={14}
                  cy={14}
                  r={6.5}
                  stroke='#6366F1'
                  strokeWidth={2.2}
                  fill='none'
                />
                <Circle cx={14} cy={14} r={2.5} fill='#6366F1' />
                <Path
                  d='M21 7L14 14'
                  stroke='#6366F1'
                  strokeWidth={2.2}
                  strokeLinecap='round'
                />
                <Path d='M23 3L25 5L22 8L20 6Z' fill='#6366F1' />
              </Svg>
            </View>

            <View style={{ flex: 1, marginRight: moderateScale(8) }}>
              <AppText
                variant='body'
                style={{
                  fontSize: moderateScale(15),
                  fontWeight: '700',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                }}
              >
                Sprint Goal
              </AppText>
              <AppText
                variant='caption'
                numberOfLines={2}
                style={{
                  fontSize: moderateScale(12.5),
                  color: isDark ? '#CBD5E1' : '#475569',
                  marginTop: moderateScale(3),
                  lineHeight: moderateScale(17),
                }}
              >
                {cleanHtmlText(sprint.goal) ||
                  'Build and ship the core features for ' +
                    sprint.name +
                    ' sprint.'}
              </AppText>
            </View>

            <Ionicons
              name='chevron-forward'
              size={moderateScale(18)}
              color={isDark ? '#A78BFA' : '#6366F1'}
            />
          </TouchableOpacity>

          {/* User Stories Header Row */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: moderateScale(22),
              marginBottom:
                !isFilterActive && !isSearchActive ? moderateScale(14) : 0,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AppText
                variant='h2'
                style={{
                  fontSize: moderateScale(20),
                  fontWeight: '800',
                  color: isDark ? colors.text : '#0F172A',
                }}
              >
                User Stories
              </AppText>

              <View
                style={{
                  backgroundColor: isDark
                    ? 'rgba(37, 99, 235, 0.25)'
                    : '#DBEAFE',
                  borderRadius: moderateScale(12),
                  paddingHorizontal: moderateScale(9),
                  paddingVertical: moderateScale(2),
                  marginLeft: moderateScale(8),
                }}
              >
                <AppText
                  variant='caption'
                  style={{
                    color: isDark ? '#60A5FA' : COLOR_BLUE,
                    fontSize: moderateScale(12),
                    fontWeight: '700',
                  }}
                >
                  {filteredStories.length}
                </AppText>
              </View>
            </View>

            {/* Action Buttons: Search & Filter */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsSearchActive(prev => !prev)}
                style={{
                  width: moderateScale(38),
                  height: moderateScale(38),
                  borderRadius: moderateScale(19),
                  backgroundColor: isSearchActive
                    ? isDark
                      ? 'rgba(37, 99, 235, 0.3)'
                      : '#DBEAFE'
                    : isDark
                      ? colors.card
                      : '#F1F5F9',
                  borderWidth: isDark ? 1 : 0,
                  borderColor: isDark ? colors.border : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: moderateScale(8),
                }}
              >
                <Ionicons
                  name='search-outline'
                  size={moderateScale(18)}
                  color={
                    isSearchActive
                      ? isDark
                        ? '#60A5FA'
                        : COLOR_BLUE
                      : isDark
                        ? colors.text
                        : '#475569'
                  }
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setIsFilterActive(prev => {
                    const next = !prev;
                    if (!next) {
                      setActiveTab('all');
                    }
                    return next;
                  });
                }}
                style={{
                  width: moderateScale(38),
                  height: moderateScale(38),
                  borderRadius: moderateScale(19),
                  backgroundColor: isFilterActive
                    ? isDark
                      ? 'rgba(37, 99, 235, 0.3)'
                      : '#DBEAFE'
                    : isDark
                      ? colors.card
                      : '#F1F5F9',
                  borderWidth: isDark ? 1 : 0,
                  borderColor: isDark ? colors.border : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons
                  name='options-outline'
                  size={moderateScale(18)}
                  color={
                    isFilterActive
                      ? isDark
                        ? '#60A5FA'
                        : COLOR_BLUE
                      : isDark
                        ? colors.text
                        : '#475569'
                  }
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Input Bar (when toggled) */}
          {isSearchActive && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: isDark ? colors.card : '#FFFFFF',
                borderRadius: moderateScale(14),
                borderWidth: 1,
                borderColor: isDark ? colors.border : '#CBD5E1',
                paddingHorizontal: moderateScale(12),
                paddingVertical: moderateScale(6),
                marginTop: moderateScale(10),
                marginBottom: !isFilterActive ? moderateScale(14) : 0,
              }}
            >
              <Ionicons
                name='search'
                size={moderateScale(16)}
                color={colors.textSecondary}
                style={{ marginRight: moderateScale(6) }}
              />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder='Search stories by title or key...'
                placeholderTextColor={isDark ? colors.placeholder : '#94A3B8'}
                style={{
                  flex: 1,
                  fontSize: moderateScale(13),
                  color: isDark ? colors.text : '#0F172A',
                  paddingVertical: 0,
                }}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons
                    name='close-circle'
                    size={moderateScale(16)}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Filter Tabs Pills Row (when toggled via filter icon) */}
          {isFilterActive && (
            <ScrollView
              ref={filterScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: wp(4),
              }}
              style={{
                marginHorizontal: -wp(4),
                marginTop: moderateScale(12),
                marginBottom: moderateScale(14),
              }}
            >
              {/* All Tab */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setActiveTab('all')}
                style={{
                  backgroundColor:
                    activeTab === 'all' ? COLOR_BLUE : 'transparent',
                  borderRadius: moderateScale(18),
                  paddingHorizontal: moderateScale(12),
                  paddingVertical: moderateScale(6),
                }}
              >
                <AppText
                  variant='caption'
                  style={{
                    fontSize: moderateScale(12),
                    fontWeight: activeTab === 'all' ? '700' : '500',
                    color:
                      activeTab === 'all'
                        ? '#FFFFFF'
                        : isDark
                          ? colors.textSecondary
                          : '#64748B',
                  }}
                >
                  All ({storiesData.length})
                </AppText>
              </TouchableOpacity>

              {/* Stories Tab */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setActiveTab('stories')}
                style={{
                  backgroundColor:
                    activeTab === 'stories' ? COLOR_BLUE : 'transparent',
                  borderRadius: moderateScale(18),
                  paddingHorizontal: moderateScale(12),
                  paddingVertical: moderateScale(6),
                }}
              >
                <AppText
                  variant='caption'
                  style={{
                    fontSize: moderateScale(12),
                    fontWeight: activeTab === 'stories' ? '700' : '500',
                    color:
                      activeTab === 'stories'
                        ? '#FFFFFF'
                        : isDark
                          ? colors.textSecondary
                          : '#64748B',
                  }}
                >
                  Stories ({storiesData.length})
                </AppText>
              </TouchableOpacity>

              {/* Vertical Divider */}
              <View
                style={{
                  width: 1,
                  height: moderateScale(14),
                  backgroundColor: isDark ? colors.border : '#CBD5E1',
                  marginHorizontal: moderateScale(6),
                }}
              />

              {/* Tasks Tab */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setActiveTab('tasks')}
                style={{
                  backgroundColor:
                    activeTab === 'tasks' ? COLOR_BLUE : 'transparent',
                  borderRadius: moderateScale(18),
                  paddingHorizontal: moderateScale(12),
                  paddingVertical: moderateScale(6),
                }}
              >
                <AppText
                  variant='caption'
                  style={{
                    fontSize: moderateScale(12),
                    fontWeight: activeTab === 'tasks' ? '700' : '500',
                    color:
                      activeTab === 'tasks'
                        ? '#FFFFFF'
                        : isDark
                          ? colors.textSecondary
                          : '#64748B',
                  }}
                >
                  Tasks ({totalTasks})
                </AppText>
              </TouchableOpacity>

              {/* High priority Tab */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setActiveTab('high_priority')}
                style={{
                  backgroundColor:
                    activeTab === 'high_priority' ? COLOR_BLUE : 'transparent',
                  borderRadius: moderateScale(18),
                  paddingHorizontal: moderateScale(12),
                  paddingVertical: moderateScale(6),
                }}
              >
                <AppText
                  variant='caption'
                  style={{
                    fontSize: moderateScale(12),
                    fontWeight: activeTab === 'high_priority' ? '700' : '500',
                    color:
                      activeTab === 'high_priority'
                        ? '#FFFFFF'
                        : isDark
                          ? colors.textSecondary
                          : '#64748B',
                  }}
                >
                  High priority ({highPriorityCount})
                </AppText>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    ),
    [
      screenWidth,
      isDark,
      colors,
      SunsetHeaderImage,
      insets.top,
      moderateScale,
      wp,
      navigation,
      sprint,
      circleRadius,
      circleCircumference,
      strokeDashoffset,
      progressPercent,
      daysLeft,
      storiesData.length,
      totalTasks,
      highPriorityCount,
      filteredStories.length,
      isSearchActive,
      searchQuery,
      activeTab,
      isFilterActive,
    ],
  );

  if (!hasLoadedForThisSprint) {
    return <SprintDetailsSkeleton onBack={() => navigation.goBack()} />;
  }

  return (
    <View
      style={{
        flex: 1,
        width: screenWidth,
        backgroundColor: isDark ? colors.background : '#F6F9FD',
      }}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'light-content'}
        translucent
        backgroundColor='transparent'
      />

      <FlatList
        data={filteredStories}
        keyExtractor={keyExtractor}
        renderItem={renderStory}
        showsVerticalScrollIndicator={false}
        style={{ width: screenWidth, flex: 1 }}
        contentContainerStyle={{
          width: screenWidth,
          paddingBottom: hp(8),
        }}
        ListHeaderComponent={ListHeaderComponent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={2.5}
        ListEmptyComponent={
          loading && storiesData.length === 0 ? (
            <View
              style={{
                marginHorizontal: wp(4),
                marginTop: moderateScale(4),
              }}
            >
              <UserStoriesPaginationSkeleton />
            </View>
          ) : !loading && !isFetchingMore ? (
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
                  ? 'No user stories match your search'
                  : 'No user stories in this sprint yet'}
              </AppText>
            </View>
          ) : null
        }
        ListFooterComponent={
          isFetchingMore ? <UserStoriesPaginationSkeleton /> : null
        }
      />

      {/* Action Menu Modal (Three dots) */}
      <Modal
        visible={isActionMenuVisible}
        transparent
        animationType='fade'
        onRequestClose={() => setIsActionMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsActionMenuVisible(false)}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
              justifyContent: 'flex-end',
            }}
          >
            <TouchableWithoutFeedback>
              <View
                style={{
                  backgroundColor: colors.card,
                  borderTopLeftRadius: moderateScale(24),
                  borderTopRightRadius: moderateScale(24),
                  paddingHorizontal: wp(5),
                  paddingTop: moderateScale(16),
                  paddingBottom:
                    insets.bottom > 0
                      ? insets.bottom + moderateScale(10)
                      : moderateScale(24),
                  borderTopWidth: isDark ? 1 : 0,
                  borderColor: colors.border,
                }}
              >
                {/* Drag handle */}
                <View
                  style={{
                    width: moderateScale(36),
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: colors.border,
                    alignSelf: 'center',
                    marginBottom: moderateScale(16),
                  }}
                />

                <AppText
                  variant='h3'
                  style={{
                    fontSize: moderateScale(17),
                    fontWeight: '700',
                    color: colors.text,
                    marginBottom: moderateScale(14),
                  }}
                >
                  Sprint Actions
                </AppText>

                {/* Start or Complete sprint option */}
                {permissionsReady &&
                  canEditSprint &&
                  sprintAction.action !== 'none' && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        setIsActionMenuVisible(false);
                        handleSprintAction();
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: moderateScale(12),
                      }}
                    >
                      <View
                        style={{
                          width: moderateScale(38),
                          height: moderateScale(38),
                          borderRadius: moderateScale(19),
                          backgroundColor: isDark
                            ? 'rgba(16, 185, 129, 0.2)'
                            : '#ECFDF5',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: moderateScale(12),
                        }}
                      >
                        <Ionicons
                          name={sprintAction.icon}
                          size={moderateScale(20)}
                          color='#10B981'
                        />
                      </View>
                      <AppText
                        variant='body'
                        style={{
                          fontSize: moderateScale(15),
                          fontWeight: '600',
                          color: colors.text,
                        }}
                      >
                        {sprintAction.label}
                      </AppText>
                    </TouchableOpacity>
                  )}

                {/* Edit Sprint Option */}
                {permissionsReady && canEditSprint && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      setIsActionMenuVisible(false);
                      setSprintModalMode('update');
                      setIsEditSprintVisible(true);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: moderateScale(12),
                    }}
                  >
                    <View
                      style={{
                        width: moderateScale(38),
                        height: moderateScale(38),
                        borderRadius: moderateScale(19),
                        backgroundColor: isDark
                          ? 'rgba(37, 99, 235, 0.2)'
                          : '#EFF6FF',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: moderateScale(12),
                      }}
                    >
                      <Ionicons
                        name='pencil-outline'
                        size={moderateScale(19)}
                        color={COLOR_BLUE}
                      />
                    </View>
                    <AppText
                      variant='body'
                      style={{
                        fontSize: moderateScale(15),
                        fontWeight: '600',
                        color: colors.text,
                      }}
                    >
                      Edit Sprint Details
                    </AppText>
                  </TouchableOpacity>
                )}

                {/* Delete Sprint Option */}
                {permissionsReady && canDeleteSprint && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      setIsActionMenuVisible(false);
                      setIsDeleteModalVisible(true);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: moderateScale(12),
                    }}
                  >
                    <View
                      style={{
                        width: moderateScale(38),
                        height: moderateScale(38),
                        borderRadius: moderateScale(19),
                        backgroundColor: isDark
                          ? 'rgba(239, 68, 68, 0.2)'
                          : '#FFF1F2',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: moderateScale(12),
                      }}
                    >
                      <Ionicons
                        name='trash-outline'
                        size={moderateScale(19)}
                        color={COLOR_ROSE}
                      />
                    </View>
                    <AppText
                      variant='body'
                      style={{
                        fontSize: moderateScale(15),
                        fontWeight: '600',
                        color: COLOR_ROSE,
                      }}
                    >
                      Delete Sprint
                    </AppText>
                  </TouchableOpacity>
                )}

                {/* Cancel Button */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setIsActionMenuVisible(false)}
                  style={{
                    marginTop: moderateScale(10),
                    backgroundColor: isDark ? colors.surface : '#F1F5F9',
                    borderRadius: moderateScale(14),
                    paddingVertical: moderateScale(12),
                    alignItems: 'center',
                  }}
                >
                  <AppText
                    variant='body'
                    style={{
                      fontSize: moderateScale(14),
                      fontWeight: '600',
                      color: colors.textSecondary,
                    }}
                  >
                    Cancel
                  </AppText>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

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

      {/* Delete Story Modal */}
      {Boolean(deleteStoryItem) && (
        <DeleteColumnModal
          visible={Boolean(deleteStoryItem)}
          title='Delete User Story'
          columnTitle={deleteStoryItem?.title ?? 'this user story'}
          colors={colors}
          loading={isDeletingStory}
          onClose={() => setDeleteStoryItem(null)}
          onDelete={handleConfirmDeleteStory}
        />
      )}

      {/* Start / Update Sprint Modal */}
      {isEditSprintVisible && (
        <UpdateSprintModal
          visible={isEditSprintVisible}
          onClose={() => setIsEditSprintVisible(false)}
          mode={sprintModalMode}
          sprint={currentSprint}
          isUpdating={isUpdatingSprint || isStartingSprint}
          onStart={async payload => {
            if (!permissionsReady || !canEditSprint || !projectId || !sprintId) {
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
            if (!permissionsReady || !canEditSprint || !projectId || !sprintId) {
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
                  end_date: payload.end_date ?? currentSprint?.end_date ?? '',
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
