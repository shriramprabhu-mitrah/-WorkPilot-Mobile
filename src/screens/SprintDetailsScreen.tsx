import React, {
  ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AppText } from '../components';
import { useTheme } from '../theme/ThemeProvider';
import { useResponsive } from '../utils/responsive';
import {
  getSprintByIdThunk,
  getUserStories,
} from '../store/project_store/action/project_thunk';
import { RootState, useAppDispatch, useAppSelector } from '../store';
import { UserStory } from '../types/project.type';
import Screen from '../components/common/ScreenWapper';
import Ionicons from '@react-native-vector-icons/ionicons';
import { deleteSprint, updateSprintById } from '../services/sprint.service';
import DeleteColumnModal from '../components/DeleteColumnModal';
import UpdateSprintModal from '../components/UpdateSprintModal';
import { showSuccessToast } from '../utils/utils';
import SprintDetailsSkeleton from '../components/skeleton/SprintDetailsSkeleton';
import UserStoriesPaginationSkeleton from '../components/skeleton/UserStoriesPaginationSkeleton';
import { RootStackParamList } from '../types/navigationTypes';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { renderParsedHtml } from '../utils/htmlParser';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type SprintStat = {
  label: string;
  value: number;
  color: string;
  icon: IoniconName;
};

interface SprintDetailsScreenProps {
  route: {
    params: {
      sprintId: string;
      sprintName?: string;
    };
  };
}

// Fixed semantic accents (priority / status / stat tiles)
const AMBER = '#F59E0B';
const GREEN = '#22C55E';
const INDIGO = '#6366F1';
const VIOLET = '#7C3AED';

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

const SprintDetailsScreen: React.FC<SprintDetailsScreenProps> = ({ route }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const dispatch = useAppDispatch();
  const { sprintId, sprintName } = route.params;

  const { colors } = useTheme();
  const { hp, wp, moderateScale } = useResponsive();

  const [selectedStories, setSelectedStories] = useState<string[]>([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isEditSprintVisible, setIsEditSprintVisible] = useState(false);

  const [isUpdatingSprint, setIsUpdatingSprint] = useState(false);

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
  } = useAppSelector((state: RootState) => state.projects);

  const projectId = project?.id;

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

  // Sprint details fallback from params or Redux store
  const sprint = useMemo(() => {
    return {
      id: currentSprint?.id || sprintId,
      name: currentSprint?.name || sprintName || 'Sprint 1',
      startDate: currentSprint?.start_date || 'Sep 21, 2026',
      endDate: currentSprint?.end_date || 'Sep 26, 2026',
      status: currentSprint?.status || 'Active',
      goal: currentSprint?.goal || '-',
    };
  }, [currentSprint, sprintId, sprintName]);

  const storiesData: UserStory[] = userStories.length > 0 ? userStories : [];

  const allSelected =
    storiesData.length > 0 && selectedStories.length === storiesData.length;

  // Timeline progress (only shown when both dates are parseable)
  const timeline = useMemo(() => {
    const start = parseDate(sprint.startDate);
    const end = parseDate(sprint.endDate);
    if (!start || !end || end <= start) return null;
    const now = Date.now();
    const progress = Math.min(
      1,
      Math.max(0, (now - start.getTime()) / (end.getTime() - start.getTime())),
    );
    const daysLeft = Math.max(0, Math.ceil((end.getTime() - now) / 86400000));
    return { progress, daysLeft };
  }, [sprint.startDate, sprint.endDate]);

  const stats = useMemo<SprintStat[]>(() => {
    const totalTasks = storiesData.reduce(
      (sum, s) => sum + (s?.total_tasks ?? 0),
      0,
    );

    const high = storiesData.filter(
      s => s.priority?.toLowerCase() === 'high',
    ).length;

    return [
      {
        label: 'Stories',
        value: storiesData.length,
        color: colors.primary,
        icon: 'albums-outline',
      },
      {
        label: 'Tasks',
        value: totalTasks,
        color: AMBER,
        icon: 'checkbox-outline',
      },
      {
        label: 'High priority',
        value: high,
        color: colors.error,
        icon: 'flame-outline',
      },
    ];
  }, [storiesData, colors]);

  const toggleStory = useCallback((storyId: string) => {
    setSelectedStories(prev =>
      prev.includes(storyId)
        ? prev.filter(id => id !== storyId)
        : [...prev, storyId],
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedStories([]);
    } else {
      setSelectedStories(storiesData.map(story => story.id));
    }
  }, [allSelected, storiesData]);

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
    (priority: string) => {
      switch (priority?.toLowerCase()) {
        case 'high':
          return colors.error;
        case 'medium':
          return AMBER;
        case 'low':
          return GREEN;
        default:
          return colors.textSecondary;
      }
    },
    [colors],
  );

  const getStatusColor = useCallback(
    (status?: string) => {
      const s = status?.toLowerCase() || '';
      if (s.includes('active') || s.includes('progress')) return GREEN;
      if (s.includes('plan') || s.includes('todo') || s.includes('backlog'))
        return INDIGO;
      if (s.includes('done') || s.includes('complete'))
        return colors.textSecondary;
      return colors.textSecondary;
    },
    [colors],
  );

  const renderStory = useCallback(
    ({ item }: { item: UserStory }) => {
      const isSelected = selectedStories.includes(item.id);
      const priorityColor = getPriorityColor(item.priority);
      const statusColor = getStatusColor(item.status);

      return (
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() =>
            navigation.navigate('issue', {
              projectId,
              userStoryId: item.id,
            })
          }
          className='mb-3 flex-row overflow-hidden rounded-2xl border'
          style={{
            backgroundColor: isSelected
              ? withOpacity(colors.primary, 0.07)
              : colors.card,
            borderColor: isSelected ? colors.primary : colors.border,
          }}
        >
          {/* Priority accent rail */}
          <View style={{ width: 4, backgroundColor: priorityColor }} />

          <View className='flex-1' style={{ padding: moderateScale(14) }}>
            {/* Row 1: checkbox, id chip, title */}
            <View className='flex-row items-center'>
              {/* <View
                className='mr-3 items-center justify-center rounded-md border'
                style={{
                  width: moderateScale(20),
                  height: moderateScale(20),
                  borderColor: isSelected
                    ? colors.primary
                    : colors.textSecondary,
                  backgroundColor: isSelected ? colors.primary : 'transparent',
                }}
              >
                {isSelected && (
                  <Ionicons
                    name='checkmark'
                    size={moderateScale(14)}
                    color='#fff'
                  />
                )}
              </View> */}

              <View
                className='mr-2 rounded-md'
                style={{
                  backgroundColor: withOpacity(colors.primary, 0.12),
                  paddingHorizontal: moderateScale(7),
                  paddingVertical: moderateScale(2),
                }}
              >
                <AppText
                  variant='caption'
                  style={{
                    color: colors.primary,
                    fontSize: moderateScale(11),
                    fontWeight: '700',
                  }}
                  numberOfLines={1}
                >
                  {item?.key}
                </AppText>
              </View>
            </View>

            <AppText
              variant='body'
              color={colors.text}
              className='mt-2 font-semibold'
              numberOfLines={2}
            >
              {item?.title || ''}
            </AppText>

            {item.description ? (
              <AppText
                variant='caption'
                color={colors.textSecondary}
                className='mt-1'
                numberOfLines={2}
              >
                {renderParsedHtml(item.description, {
                  color: colors.textSecondary,
                  fontSize: moderateScale(13),
                })}
              </AppText>
            ) : null}

            {/* Row 2: meta chips (wraps on narrow screens) */}
            <View
              className='flex-row flex-wrap items-center'
              style={{ marginTop: moderateScale(10), gap: moderateScale(6) }}
            >
              <View
                className='flex-row items-center rounded-full px-2.5 py-1'
                style={{ backgroundColor: colors.surface }}
              >
                <Ionicons
                  name='list-outline'
                  size={moderateScale(12)}
                  color={colors.textSecondary}
                />
                <AppText
                  variant='caption'
                  color={colors.textSecondary}
                  className='ml-1'
                  style={{ fontSize: moderateScale(11) }}
                >
                  {item?.total_tasks ?? 0} tasks
                </AppText>
              </View>

              <View
                className='flex-row items-center rounded-full px-2.5 py-1'
                style={{ backgroundColor: withOpacity(priorityColor, 0.14) }}
              >
                <Ionicons
                  name='flag'
                  size={moderateScale(11)}
                  color={priorityColor}
                />
                <AppText
                  variant='caption'
                  className='ml-1 font-semibold capitalize'
                  style={{ color: priorityColor, fontSize: moderateScale(11) }}
                >
                  {item.priority}
                </AppText>
              </View>

              <View
                className='flex-row items-center rounded-full px-2.5 py-1'
                style={{ backgroundColor: withOpacity(statusColor, 0.14) }}
              >
                <View
                  className='mr-1.5 rounded-full'
                  style={{
                    width: moderateScale(6),
                    height: moderateScale(6),
                    backgroundColor: statusColor,
                  }}
                />
                <AppText
                  variant='caption'
                  className='font-semibold capitalize'
                  style={{ color: statusColor, fontSize: moderateScale(11) }}
                >
                  {item.status}
                </AppText>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [
      selectedStories,
      colors,
      moderateScale,
      getPriorityColor,
      getStatusColor,
      toggleStory,
    ],
  );

  const handleDeleteSprint = async (projectId: string, sprintId: string) => {
    if (!projectId || !sprintId || isDeleting) return;

    try {
      setIsDeleting(true);

      await deleteSprint(projectId, sprintId);

      setIsDeleteModalVisible(false);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to delete sprint:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const keyExtractor = useCallback((item: UserStory) => item.id, []);

  const ListHeaderComponent = useMemo(
    () => (
      <Screen scroll={false} backgroundColor={colors.surface}>
        {/* Gradient hero */}
        <LinearGradient
          colors={[colors.primary, colors.accentPurple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: moderateScale(22),
            padding: moderateScale(18),
          }}
        >
          <View className='flex-row items-center justify-between'>
            {/* Back button + Sprint status */}
            <View className='flex-row items-center'>
              {/* Back navigation button */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.goBack()}
                className='mr-3 items-center justify-center rounded-full'
                style={{
                  width: moderateScale(34),
                  height: moderateScale(34),
                  backgroundColor: 'rgba(255,255,255,0.22)',
                }}
              >
                <Ionicons
                  name='arrow-back'
                  size={moderateScale(19)}
                  color='#fff'
                />
              </TouchableOpacity>

              {/* Sprint status */}
              <View
                className='flex-row items-center rounded-full px-3 py-1.5'
                style={{ backgroundColor: 'rgba(255,255,255,0.22)' }}
              >
                <View
                  className='mr-1.5 rounded-full'
                  style={{
                    width: moderateScale(7),
                    height: moderateScale(7),
                    backgroundColor: '#fff',
                  }}
                />
                <AppText
                  variant='caption'
                  className='font-semibold capitalize'
                  style={{ color: '#fff', fontSize: moderateScale(11) }}
                >
                  {sprint.status}
                </AppText>
              </View>
            </View>

            {/* Edit and Delete buttons */}
            <View className='flex-row items-center'>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsEditSprintVisible(true)}
                className='items-center justify-center rounded-full'
                style={{
                  width: moderateScale(34),
                  height: moderateScale(34),
                  backgroundColor: 'rgba(255,255,255,0.22)',
                }}
              >
                <Ionicons
                  name='pencil-outline'
                  size={moderateScale(16)}
                  color='#fff'
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsDeleteModalVisible(true)}
                className='ml-2 items-center justify-center rounded-full'
                style={{
                  width: moderateScale(34),
                  height: moderateScale(34),
                  backgroundColor: 'rgba(255,255,255,0.22)',
                }}
              >
                <Ionicons
                  name='trash-outline'
                  size={moderateScale(16)}
                  color='#fff'
                />
              </TouchableOpacity>
            </View>
          </View>

          <AppText
            variant='h3'
            className='mt-4 font-extrabold'
            style={{ color: '#fff' }}
            numberOfLines={2}
          >
            {sprint.name}
          </AppText>

          <View className='mt-2 flex-row items-center'>
            <Ionicons
              name='calendar-outline'
              size={moderateScale(14)}
              color='rgba(255,255,255,0.85)'
            />
            <AppText
              variant='body'
              className='ml-1.5'
              style={{ color: 'rgba(255,255,255,0.9)' }}
            >
              {sprint.startDate?.split('T')[0]} →{' '}
              {sprint.endDate?.split('T')[0]}
            </AppText>
          </View>

          {timeline ? (
            <View style={{ marginTop: moderateScale(16) }}>
              <View
                className='overflow-hidden rounded-full'
                style={{
                  height: moderateScale(8),
                  backgroundColor: 'rgba(255,255,255,0.25)',
                }}
              >
                <View
                  className='rounded-full'
                  style={{
                    height: '100%',
                    width: `${Math.round(timeline.progress * 100)}%`,
                    backgroundColor: '#fff',
                  }}
                />
              </View>
              <View className='mt-2 flex-row items-center justify-between'>
                <AppText
                  variant='caption'
                  style={{ color: 'rgba(255,255,255,0.9)' }}
                >
                  {Math.round(timeline.progress * 100)}% elapsed
                </AppText>
                <AppText
                  variant='caption'
                  className='font-semibold'
                  style={{ color: '#fff' }}
                >
                  {timeline.daysLeft} {timeline.daysLeft === 1 ? 'day' : 'days'}{' '}
                  left
                </AppText>
              </View>
            </View>
          ) : null}
        </LinearGradient>

        {/* Stat tiles */}
        <View
          className='flex-row'
          style={{ marginTop: moderateScale(14), gap: moderateScale(10) }}
        >
          {stats.map(item => (
            <View
              key={item.label}
              className='flex-1 items-center rounded-2xl'
              style={{
                backgroundColor: withOpacity(item.color, 0.12),
                paddingVertical: moderateScale(14),
              }}
            >
              <Ionicons
                name={item?.icon}
                size={moderateScale(18)}
                color={item.color}
              />
              <AppText
                variant='title'
                className='mt-1'
                style={{ color: item.color, fontWeight: '800' }}
              >
                {item.value}
              </AppText>
              <AppText
                variant='caption'
                color={colors.textSecondary}
                className='text-center'
                style={{ fontSize: moderateScale(11) }}
                numberOfLines={1}
              >
                {item.label}
              </AppText>
            </View>
          ))}
        </View>

        {/* Goal card */}
        <View
          className='flex-row items-start rounded-2xl border'
          style={{
            marginTop: moderateScale(14),
            padding: moderateScale(14),
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
        >
          <View
            className='mr-3 items-center justify-center rounded-xl'
            style={{
              width: moderateScale(36),
              height: moderateScale(36),
              backgroundColor: withOpacity(AMBER, 0.15),
            }}
          >
            <Ionicons name='flag' size={moderateScale(18)} color={AMBER} />
          </View>
          <View className='flex-1'>
            <AppText
              variant='caption'
              color={colors.textSecondary}
              className='uppercase'
              style={{ fontSize: moderateScale(10), letterSpacing: 0.8 }}
            >
              Sprint goal
            </AppText>
            <AppText
              variant='body'
              color={colors.text}
              className='mt-1 font-medium'
            >
              {sprint.goal || '-'}
            </AppText>
          </View>
        </View>

        {/* User stories header */}
        <View
          className='flex-row items-center justify-between'
          style={{
            marginTop: moderateScale(24),
            marginBottom: moderateScale(10),
          }}
        >
          <View className='flex-row items-center'>
            <AppText variant='title' color={colors.text} className='font-bold'>
              User Stories
            </AppText>
            <View
              className='ml-2 rounded-full px-2.5 py-0.5'
              style={{ backgroundColor: withOpacity(colors.primary, 0.12) }}
            >
              <AppText
                variant='caption'
                className='font-semibold'
                style={{ color: colors.primary, fontSize: moderateScale(11) }}
              >
                {storiesData.length}
              </AppText>
            </View>
          </View>

          {/* {storiesData.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={toggleSelectAll}
              className='flex-row items-center'
            >
              <View
                className='mr-2 items-center justify-center rounded-md border'
                style={{
                  width: moderateScale(18),
                  height: moderateScale(18),
                  borderColor: allSelected
                    ? colors.primary
                    : colors.textSecondary,
                  backgroundColor: allSelected ? colors.primary : 'transparent',
                }}
              >
                {allSelected && (
                  <Ionicons
                    name='checkmark'
                    size={moderateScale(13)}
                    color='#fff'
                  />
                )}
              </View>
              <AppText variant='caption' color={colors.textSecondary}>
                Select all
              </AppText>
            </TouchableOpacity>
          )} */}
        </View>

        {/* Selection bar */}
        {selectedStories.length > 0 && (
          <View
            className='mb-3 flex-row items-center justify-between rounded-xl px-4 py-2.5'
            style={{ backgroundColor: withOpacity(colors.primary, 0.1) }}
          >
            <AppText
              variant='caption'
              className='font-semibold'
              style={{ color: colors.primary }}
            >
              {selectedStories.length} selected
            </AppText>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setSelectedStories([])}
            >
              <AppText
                variant='caption'
                className='font-semibold'
                style={{ color: colors.primary }}
              >
                Clear
              </AppText>
            </TouchableOpacity>
          </View>
        )}
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

        <UpdateSprintModal
          visible={isEditSprintVisible}
          onClose={() => setIsEditSprintVisible(false)}
          sprint={currentSprint}
          isUpdating={isUpdatingSprint}
          onUpdate={async payload => {
            try {
              setIsUpdatingSprint(true);

              await updateSprintById({
                project_id: projectId || '',
                sprint_id: sprintId,
                payload,
              });

              setIsEditSprintVisible(false);

              // Refetch sprint details
              await dispatch(
                getSprintByIdThunk({
                  project_id: projectId || '',
                  sprint_id: sprintId,
                }),
              ).unwrap();

              showSuccessToast('Sprint updated successfully', 'success');
            } catch (error) {
              throw error;
            } finally {
              setIsUpdatingSprint(false);
            }
          }}
        />
      </Screen>
    ),
    [
      colors,
      sprint,
      timeline,
      stats,
      moderateScale,
      navigation,
      toggleSelectAll,
      allSelected,
      storiesData.length,
      selectedStories.length,
    ],
  );

  return (
    <View
      className='flex-1'
      style={{
        backgroundColor: colors.background,
      }}
    >
      {loading ? (
        <SprintDetailsSkeleton />
      ) : (
        <FlatList
          data={storiesData}
          keyExtractor={keyExtractor}
          renderItem={renderStory}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: wp(4),
            paddingTop: hp(2),
            paddingBottom: hp(6),
          }}
          ListHeaderComponent={ListHeaderComponent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={2.5}
          ListEmptyComponent={
            !loading && !isFetchingMore ? (
              <View
                className='items-center rounded-2xl border'
                style={{
                  padding: moderateScale(28),
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }}
              >
                <Ionicons
                  name='albums-outline'
                  size={moderateScale(32)}
                  color={colors.textSecondary}
                />
                <AppText
                  variant='body'
                  color={colors.textSecondary}
                  className='mt-2 text-center'
                >
                  No user stories in this sprint yet
                </AppText>
              </View>
            ) : null
          }
          ListFooterComponent={
            isFetchingMore ? <UserStoriesPaginationSkeleton /> : null
          }
        />
      )}
    </View>
  );
};

export default SprintDetailsScreen;
