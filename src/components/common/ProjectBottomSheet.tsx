import React, { useState, useMemo } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Pressable,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from './AppText';
import AppInput from './Input/AppInput';
import ProjectCard from '../common/ProjectCard';
import ListSkeleton from '../skeleton/ListSkeleton';
import ProjectCardSkeleton from '../skeleton/ProjectCardSkeleton';
import { useTheme } from '../../hooks/useTheme';
import { useAuthLayout } from '../../hooks/useAuthLayout';
import { moderateScale } from '../../utils/responsive';
<<<<<<< Updated upstream
import { useAppDispatch, useAppSelector } from '../../store';
=======
import { RootState, useAppDispatch, useAppSelector } from '../../store';
import {
  getAllProjectInfo,
  getSprintsThunk,
} from '../../store/project_store/action/project_thunk';
import {
  resetProjects,
  resetSprints,
} from '../../store/project_store/reducer/project_reducer';
import { WorkItemIcon } from './getWorkItemIcon';
>>>>>>> Stashed changes

export interface ProjectListBottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  isSprint?: boolean; // Prop to toggle between sprint mode and project mode
  onSelectProject?: (projectId: string, projectName: string) => void;
  onSelectSprint?: (sprintId: string) => void; // Separate onPress handler for sprint
  // Pagination props
  onEndReached?: () => void;
  hasMore?: boolean;
  isFetchingMore?: boolean;
}

// Helper to format date strings into readable format
const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const ProjectListBottomSheet: React.FC<ProjectListBottomSheetProps> = ({
  visible,
  onDismiss,
  title,
  isSprint = false,
  onSelectProject,
  onSelectSprint,
  onEndReached,
  hasMore = false,
  isFetchingMore = false,
}) => {
  const { colors, strings } = useTheme();
  const dispatch = useAppDispatch();
  const { layout } = useAuthLayout();
  const insets = useSafeAreaInsets();
  const closeIconSize = moderateScale(20);
  const bottomPadding = Math.max(insets.bottom, 16);

<<<<<<< Updated upstream
  // Redux state - fetch both projects list and current selected project (for sprints)
  const { projects, project, loading } = useAppSelector(
    state => state.projects,
=======
  // Extract pagination states from Redux
  const {
    projects,
    project,
    sprints,
    loading,
    isFetchingMore: reduxIsFetchingMore,
    hasMore: reduxHasMore,
  } = useAppSelector((state: RootState) => state.projects);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const isSprint = mode === 'sprints';

  // Effective state combining props and Redux store values
  const effectiveHasMore = hasMoreProp ?? reduxHasMore;
  const effectiveIsFetchingMore = isFetchingMoreProp || reduxIsFetchingMore;

  // Resolved active project ID from props or store fallback
  const resolvedProjectId =
    projectId || project?.id?.toString() || (project as any)?._id?.toString();

  // Reset page and trigger initial fetch when modal becomes visible or mode/projectId changes
  useFocusEffect(
    useCallback(() => {
      if (visible) {
        setPage(1);
        if (mode === 'projects') {
          dispatch(resetProjects());
          dispatch(getAllProjectInfo({ page: 1 }));
        } else if (mode === 'sprints' && resolvedProjectId) {
          dispatch(resetSprints());
          dispatch(getSprintsThunk({ project_id: resolvedProjectId, page: 1 }));
        }
      }
    }, [visible, mode, resolvedProjectId, dispatch]),
>>>>>>> Stashed changes
  );
  const [search, setSearch] = useState('');

  // Determine list source based on isSprint flag
  const listData = isSprint ? project?.sprints || [] : projects || [];

  // Dynamic default title
  const sheetTitle = title || (isSprint ? 'Select Sprint' : 'Select Project');

  // Dynamic search placeholder
  const searchPlaceholder = isSprint
    ? 'Search sprints...'
    : strings?.projects?.searchPlaceholder || 'Search projects...';

  // Filter items based on search query
  const filteredData = useMemo(() => {
    if (!listData) return [];
    const query = search.trim().toLowerCase();
    return listData.filter((item: any) => {
      const name = item.name || item.title || item.sprint_name || '';
      const desc = item.description || '';
      return (
        !query ||
        name.toLowerCase().includes(query) ||
        desc.toLowerCase().includes(query)
      );
    });
  }, [listData, search]);

  // Separate onPress handler based on isSprint prop
  const handleSelect = (id: string, name: string) => {
    if (isSprint) {
      onSelectSprint?.(id);
    } else {
      onSelectProject?.(id, name);
    }
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View className='flex-1 justify-end bg-black/50'>
        {/* Backdrop Press Area */}
        <Pressable className='flex-1' onPress={onDismiss} />

        {/* Sheet Body */}
        <View
          style={{
            backgroundColor: colors.surface,
            paddingBottom: bottomPadding + 16,
            borderColor: colors.border,
            maxHeight: '80%',
          }}
          className='w-full rounded-t-3xl border px-5 pt-3 shadow-xl'
        >
          {/* Top Handle Bar */}
          <View className='items-center pb-2'>
            <View
              style={{ backgroundColor: colors.border || '#E2E8F0' }}
              className='h-1.5 w-12 rounded-full'
            />
          </View>

          {/* Sheet Header: Title & Close Button */}
          <View className='flex-row items-center justify-between pb-3'>
            <AppText
              variant='h2'
              color={colors.text}
              style={{ fontSize: moderateScale(20) }}
              className='font-bold'
            >
              {sheetTitle}
            </AppText>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onDismiss}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
              className='rounded-full border p-2'
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name='close-outline'
                size={closeIconSize}
                color={colors.textSecondary || '#6B778C'}
              />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className='pb-3'>
            <AppInput
              placeholder={searchPlaceholder}
              value={search}
              onChangeText={setSearch}
              leftIcon={
                <Ionicons
                  name='search-outline'
                  size={layout.iconSize * 0.85}
                  color={colors.placeholder || colors.textSecondary}
                />
              }
            />
          </View>

          {/* Main List Area with Loading Skeletons */}
          {loading ? (
            <View className='pt-2'>
              <ListSkeleton
                count={5}
                containerStyle={{ gap: layout.elementGap - 2 }}
                renderItem={index => <ProjectCardSkeleton key={index} />}
              />
            </View>
          ) : (
            <FlatList
              data={filteredData}
              keyExtractor={(item: any) =>
                item.id?.toString() || item._id?.toString()
              }
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps='handled'
              contentContainerStyle={{
                gap: layout.elementGap - 2,
                paddingBottom: 16,
              }}
              renderItem={({ item }: { item: any }) => {
                const id = item.id?.toString() || item._id?.toString();

                if (isSprint) {
                  const startDate = item.start_date || item.startDate;
                  const endDate = item.end_date || item.endDate;
                  const status =
                    item.status || (item.is_active ? 'active' : '');

                  return (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleSelect(id, item.name)}
                      className='flex-row items-center justify-between rounded-xl border p-4'
                      style={{
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      }}
                    >
                      <View className='flex-1 pr-2'>
                        {/* Sprint Name & Status Badge */}
                        <View className='flex-row items-center justify-between pr-2'>
                          <AppText
                            variant='title'
                            color={colors.text}
                            className='flex-1 font-semibold'
                          >
                            {item.name ||
                              item.title ||
                              item.sprint_name ||
                              `Sprint ${id}`}
                          </AppText>

                          {status ? (
                            <View
                              style={{
                                backgroundColor:
                                  status.toLowerCase() === 'active'
                                    ? '#DCFCE7'
                                    : '#F1F5F9',
                              }}
                              className='ml-2 rounded-full px-2.5 py-0.5'
                            >
                              <AppText
                                variant='caption'
                                style={{
                                  color:
                                    status.toLowerCase() === 'active'
                                      ? '#15803D'
                                      : colors.textSecondary,
                                  fontSize: moderateScale(11),
                                }}
                                className='font-medium capitalize'
                              >
                                {status}
                              </AppText>
                            </View>
                          ) : null}
                        </View>

                        {/* Sprint Description (if available) */}
                        {item.description ? (
                          <AppText
                            variant='body'
                            color={colors.textSecondary}
                            numberOfLines={1}
                            className='mt-1'
                          >
                            {item.description}
                          </AppText>
                        ) : null}

                        {/* Sprint Start & End Date */}
                        {(startDate || endDate) && (
                          <View className='mt-2 flex-row items-center gap-1.5'>
                            <Ionicons
                              name='calendar-outline'
                              size={moderateScale(14)}
                              color={colors.textSecondary}
                            />
                            <AppText
                              variant='caption'
                              color={colors.textSecondary}
                              style={{ fontSize: moderateScale(12) }}
                            >
                              {formatDate(startDate)}
                              {startDate && endDate ? ' — ' : ''}
                              {formatDate(endDate)}
                            </AppText>
                          </View>
                        )}
                      </View>
                      {/* 
                      <Ionicons
                        name='chevron-forward-outline'
                        size={moderateScale(18)}
                        color={colors.textSecondary}
                      /> */}
                    </TouchableOpacity>
                  );
                }

                return <ProjectCard item={item} onPress={handleSelect} />;
              }}
              /* Pagination Props */
              onEndReached={() => {
                if (hasMore && !isFetchingMore && onEndReached) {
                  onEndReached();
                }
              }}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                isFetchingMore ? (
                  <View className='items-center justify-center py-4'>
                    <ActivityIndicator size='small' color={colors.primary} />
                  </View>
                ) : null
              }
              /* Empty State */
              ListEmptyComponent={
                <View
                  className='items-center justify-center'
                  style={{
                    paddingVertical: layout.sectionGap * 2,
                    gap: layout.sectionGap,
                  }}
                >
                  <Ionicons
                    name={isSprint ? 'time-outline' : 'folder-open-outline'}
                    size={layout.iconSize * 2.5}
                    color={colors.placeholder || colors.textSecondary}
                  />
                  <AppText
                    variant='title'
                    color={colors.text}
                    className='font-semibold'
                  >
                    {isSprint
                      ? 'No sprints found'
                      : strings?.projects?.noResultsTitle ||
                        'No projects found'}
                  </AppText>
                  <AppText
                    variant='body'
                    color={colors.textSecondary}
                    className='text-center'
                  >
                    {isSprint
                      ? 'Try searching for a different name.'
                      : strings?.projects?.noResultsSubtitle ||
                        'Try searching for a different name.'}
                  </AppText>
                </View>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ProjectListBottomSheet;
