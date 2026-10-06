import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import AppText from './AppText';
import AppInput from './Input/AppInput';
import ProjectCard from '../common/ProjectCard';
import ListSkeleton from '../skeleton/ListSkeleton';
import ProjectCardSkeleton from '../skeleton/ProjectCardSkeleton';
import { useTheme } from '../../hooks/useTheme';
import { useAuthLayout } from '../../hooks/useAuthLayout';
import { moderateScale } from '../../utils/responsive';
import { RootState, useAppSelector } from '../../store';
import {
  useGetProjectsQuery,
  useGetSprintsQuery,
} from '../../store/api/projectApi';
import { WorkItemIcon } from './getWorkItemIcon';
import CreateProjectModal from '../createProjectModel';
import { showSnackbar } from './Snackbar';
import CustomSnackbar, { SnackbarType } from './Snackbar/CustomSnackbar';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigationTypes';

export interface ProjectListBottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  mode?: 'projects' | 'sprints';
  projectId?: string;
  onSelectProject?: (projectId: string, projectName: string) => void;
  onSelectSprint?: (sprintId: string) => void;
  onEndReached?: () => void;
  hasMore?: boolean;
  isFetchingMore?: boolean;
}

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
  mode = 'projects',
  projectId,
  onSelectProject,
  onSelectSprint,
  onEndReached: onEndReachedProp,
  hasMore: hasMoreProp,
  isFetchingMore: isFetchingMoreProp,
}) => {
  const { colors, strings } = useTheme();
  const { layout } = useAuthLayout();
  const insets = useSafeAreaInsets();
  const closeIconSize = moderateScale(20);
  const bottomPadding = Math.max(insets.bottom, 16);

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const { project, sprintsName } = useAppSelector(
    (state: RootState) => state.projects,
  );

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [refetchKey, setRefetchKey] = useState(0);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [allSprints, setAllSprints] = useState<any[]>([]);
  const [hasNoMore, setHasNoMore] = useState(false);
  const lastRequestedPageRef = useRef(1);
  const isSprint = mode === 'sprints';

  const [localSnackbarVisible, setLocalSnackbarVisible] = useState(false);
  const [localSnackbarMessage, setLocalSnackbarMessage] = useState('');
  const [localSnackbarType, setLocalSnackbarType] =
    useState<SnackbarType>('success');

  const showLocalSnackbar = (
    message: string,
    type: SnackbarType = 'success',
  ) => {
    setLocalSnackbarMessage(message);
    setLocalSnackbarType(type);
    setLocalSnackbarVisible(true);
    showSnackbar?.({ message, type });
  };

  // Resolved active project ID from props or store fallback
  const resolvedProjectId =
    projectId || project?.id?.toString() || (project as any)?._id?.toString();

  // RTK Query: Fetch projects
  const {
    data: projectsResponse,
    isLoading: isProjectsLoading,
    isFetching: isProjectsFetching,
  } = useGetProjectsQuery(
    { page, page_size: 10, _refetchKey: refetchKey },
    { skip: !visible || isSprint },
  );

  // RTK Query: Fetch sprints
  const {
    data: sprintsResponse,
    isLoading: isSprintsLoading,
    isFetching: isSprintsFetching,
  } = useGetSprintsQuery(
    {
      project_id: resolvedProjectId!,
      page,
      page_size: 10,
      _refetchKey: refetchKey,
    },
    { skip: !visible || !isSprint || !resolvedProjectId },
  );

  // Extract raw response data
  const projectsData = projectsResponse?.data || [];
  const sprintsData = sprintsResponse?.data || [];

  // Append paginated projects data
  useEffect(() => {
    if (!projectsResponse?.data) return;
    const incoming = Array.isArray(projectsResponse.data)
      ? projectsResponse.data
      : [];
    if (incoming.length === 0 && page > 1) {
      setHasNoMore(true);
      return;
    }
    if (projectsResponse.meta?.has_next === false) {
      setHasNoMore(true);
    } else if (
      projectsResponse.meta?.total_pages &&
      page >= projectsResponse.meta.total_pages
    ) {
      setHasNoMore(true);
    }
    if (page === 1) {
      setAllProjects(incoming);
    } else {
      setAllProjects(prev => {
        const existingIds = new Set(
          prev.map((p: any) => p.id?.toString() || p._id?.toString()),
        );
        const unique = incoming.filter(
          (p: any) => !existingIds.has(p.id?.toString() || p._id?.toString()),
        );
        return [...prev, ...unique];
      });
    }
  }, [projectsResponse, page]);

  // Append paginated sprints data
  useEffect(() => {
    if (!sprintsResponse?.data) return;
    const incoming = Array.isArray(sprintsResponse.data)
      ? sprintsResponse.data
      : [];
    if (incoming.length === 0 && page > 1) {
      setHasNoMore(true);
      return;
    }
    if (sprintsResponse.meta?.has_next === false) {
      setHasNoMore(true);
    } else if (
      sprintsResponse.meta?.total_pages &&
      page >= sprintsResponse.meta.total_pages
    ) {
      setHasNoMore(true);
    }
    if (page === 1) {
      setAllSprints(incoming);
    } else {
      setAllSprints(prev => {
        const existingIds = new Set(
          prev.map((s: any) => s.id?.toString() || s._id?.toString()),
        );
        const unique = incoming.filter(
          (s: any) => !existingIds.has(s.id?.toString() || s._id?.toString()),
        );
        return [...prev, ...unique];
      });
    }
  }, [sprintsResponse, page]);

  const listData = useMemo(() => {
    if (!isSprint) {
      return allProjects.length > 0 ? allProjects : projectsData;
    }

    const currentSprints =
      allSprints.length > 0
        ? allSprints
        : sprintsData.length > 0
          ? sprintsData
          : project?.sprints || [];

    if (
      sprintsName &&
      !currentSprints.some((item: any) => item.name === sprintsName)
    ) {
      return [
        {
          id: 'temporary-created-sprint',
          name: sprintsName,
          isTemporary: true,
        },
        ...currentSprints,
      ];
    }

    return currentSprints;
  }, [
    isSprint,
    allProjects,
    projectsData,
    allSprints,
    sprintsData,
    sprintsName,
    project?.sprints,
  ]);

  // Pagination meta
  const currentMeta = isSprint
    ? sprintsResponse?.meta ??
      (sprintsResponse as any)?.pagination ??
      (sprintsResponse as any)?.data?.meta ??
      (sprintsResponse as any)?.data?.pagination
    : projectsResponse?.meta ??
      (projectsResponse as any)?.pagination ??
      (projectsResponse as any)?.data?.meta ??
      (projectsResponse as any)?.data?.pagination;

  const totalLoaded = isSprint ? allSprints.length : allProjects.length;

  const rtkHasMore =
    currentMeta?.has_next !== undefined
      ? Boolean(currentMeta.has_next)
      : currentMeta?.total_pages !== undefined
        ? page < currentMeta.total_pages
        : currentMeta?.total_items !== undefined
          ? totalLoaded < currentMeta.total_items
          : !hasNoMore;

  const isCurrentFetching = isSprint ? isSprintsFetching : isProjectsFetching;
  const isCurrentLoading = isSprint ? isSprintsLoading : isProjectsLoading;

  const isFirstTime = isSprint
    ? allSprints.length === 0 && sprintsResponse === undefined
    : allProjects.length === 0 && projectsResponse === undefined;
  const showSkeleton =
    isFirstTime && (isCurrentLoading || isCurrentFetching) && page === 1;

  const loading = isCurrentLoading || (isCurrentFetching && page === 1);
  const reduxIsFetchingMore = isCurrentFetching && page > 1;

  const effectiveHasMore = hasMoreProp ?? rtkHasMore;
  const effectiveIsFetchingMore = isFetchingMoreProp || reduxIsFetchingMore;

  useEffect(() => {
    if (visible) {
      setPage(1);
      lastRequestedPageRef.current = 1;
      setHasNoMore(false);
      setAllProjects([]);
      setAllSprints([]);
      setRefetchKey(prev => prev + 1);
    }
  }, [visible, mode, resolvedProjectId]);

  const handleLoadMore = useCallback(() => {
    if (search.trim() !== '') return;
    if (
      isCurrentFetching ||
      isCurrentLoading ||
      !effectiveHasMore ||
      listData.length === 0
    ) {
      return;
    }

    const nextPage = page + 1;
    if (lastRequestedPageRef.current === nextPage) return;
    lastRequestedPageRef.current = nextPage;

    setPage(nextPage);
    onEndReachedProp?.();
  }, [
    search,
    isCurrentFetching,
    isCurrentLoading,
    effectiveHasMore,
    listData.length,
    page,
    onEndReachedProp,
  ]);

  const sheetTitle = title || (isSprint ? 'Select Sprint' : 'Select Project');
  const newButtonTitle = isSprint ? 'New Sprint' : 'New Project';
  const searchPlaceholder = isSprint
    ? 'Search sprints...'
    : strings?.projects?.searchPlaceholder || 'Search projects...';

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

  const handleSelect = (id: string, name: string) => {
    if (!id) return;
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
        <Pressable className='flex-1' onPress={onDismiss} />

        <View
          style={{
            backgroundColor: colors.surface,
            paddingBottom: bottomPadding + 16,
            borderColor: colors.border,
            maxHeight: '80%',
          }}
          className='w-full rounded-t-3xl border px-5 pt-3 shadow-xl'
        >
          {/* Grab handle */}
          <View className='items-center pb-2'>
            <View
              style={{ backgroundColor: colors.border || '#E2E8F0' }}
              className='h-1.5 w-12 rounded-full'
            />
          </View>

          {/* Sheet Header */}
          <View className='flex-row items-center justify-between pb-3'>
            <AppText
              variant='h3'
              color={colors.text}
              style={{ fontSize: moderateScale(20) }}
              className='font-bold'
            >
              {sheetTitle}
            </AppText>
            <View className='flex-row items-center gap-5'>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsCreateModalVisible(true)}
                style={{
                  backgroundColor: colors.primary,
                }}
                className='flex-row items-center gap-1 rounded-lg px-2 py-2'
              >
                <Ionicons
                  name='add'
                  size={moderateScale(14)}
                  color={colors.white}
                  className='font-semibold'
                />
                <AppText
                  variant='button'
                  color={colors.white}
                  style={{ fontSize: moderateScale(12) }}
                  className='font-semibold'
                >
                  {newButtonTitle}
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onDismiss}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
                className='rounded-full border p-1'
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons
                  name='close-outline'
                  size={closeIconSize}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Input */}
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

          {/* Content List */}
          {showSkeleton ? (
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
                const name = item.name || item.title || item.sprint_name || '';

                if (isSprint) {
                  const startDate = item.start_date || item.startDate;
                  const endDate = item.end_date || item.endDate;
                  const status =
                    item.status || (item.is_active ? 'active' : '');

                  const handleOpenSprintDetails = () => {
                    navigation.navigate('SprintDetails', {
                      sprintId: id,
                      sprintName: name,
                    });
                    onDismiss();
                  };

                  return (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleSelect(id, name)}
                      className='flex-row items-center justify-between rounded-xl border p-4'
                      style={{
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      }}
                    >
                      <View
                        className='mr-3.5 items-center justify-center rounded-lg'
                        style={{
                          width: moderateScale(30),
                          height: moderateScale(30),
                          backgroundColor: colors.surface,
                        }}
                      >
                        <WorkItemIcon type='sprint' size={moderateScale(20)} />
                      </View>
                      <View className='flex-1 pr-2'>
                        <View className='flex-row items-center'>
                          {' '}
                          <AppText
                            variant='title'
                            color={colors.text}
                            className='flex-1 font-semibold'
                            numberOfLines={1}
                          >
                            {name || `Sprint ${id}`}
                          </AppText>
                          {item.isTemporary ? (
                            <ActivityIndicator
                              size='small'
                              color={colors.primary}
                              style={{ marginLeft: moderateScale(8) }}
                            />
                          ) : status ? (
                            <View
                              style={{
                                backgroundColor: colors.surface,
                              }}
                              className='ml-2 rounded-full px-2.5 py-0.5'
                            >
                              <AppText
                                variant='caption'
                                style={{
                                  color:
                                    status.toLowerCase() === 'active'
                                      ? colors.primary
                                      : colors.textSecondary,
                                  fontSize: moderateScale(11),
                                }}
                                className='font-medium capitalize'
                              >
                                {status}
                              </AppText>
                            </View>
                          ) : null}
                          {!item.isTemporary && (
                            <TouchableOpacity
                              activeOpacity={0.7}
                              onPress={handleOpenSprintDetails}
                              className='ml-2 items-center justify-center'
                              hitSlop={{
                                top: 8,
                                bottom: 8,
                                left: 8,
                                right: 8,
                              }}
                            >
                              <Ionicons
                                name='chevron-forward-circle-outline'
                                size={moderateScale(22)}
                                color={colors.primary}
                              />
                            </TouchableOpacity>
                          )}
                        </View>
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
                    </TouchableOpacity>
                  );
                }

                return (
                  <ProjectCard
                    item={item}
                    onPress={() => handleSelect(id, name)}
                  />
                );
              }}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={2.5}
              ListFooterComponent={
                effectiveIsFetchingMore ? (
                  <View className='items-center justify-center py-4'>
                    <ActivityIndicator size='small' color={colors.primary} />
                  </View>
                ) : null
              }
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

      <CreateProjectModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        mode={isSprint ? 'sprint' : 'project'}
        title={isSprint ? 'Create Sprint' : 'New Project'}
        projectId={resolvedProjectId}
        onSuccess={(msg?: string) => {
          setPage(1);
          setRefetchKey(prev => prev + 1);
          showLocalSnackbar(
            msg ||
              (isSprint
                ? 'Sprint created successfully'
                : 'Project created successfully'),
            'success',
          );
        }}
      />

      {/* In-Modal Snackbar so success/error messages appear on top of ProjectListBottomSheet on Android */}
      <CustomSnackbar
        visible={localSnackbarVisible}
        onDismiss={() => setLocalSnackbarVisible(false)}
        message={localSnackbarMessage}
        type={localSnackbarType}
        duration={3500}
        bottomOffset={bottomPadding + 10}
      />
    </Modal>
  );
};

export default ProjectListBottomSheet;
