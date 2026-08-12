import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AppText from '../components/common/AppText';
import ProjectCard from '../components/common/ProjectCard';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { RootStackParamList } from '../types/navigationTypes';
import Screen from '../components/common/ScreenWapper';
import CommonHeader from '../components/common/CommonHeader';
import { moderateScale } from '../utils/responsive';
import ProjectCardSkeleton from '../components/skeleton/ProjectCardSkeleton';
import ListSkeleton from '../components/skeleton/ListSkeleton';
import { RootState, useAppDispatch, useAppSelector } from '../store';
import { AppInput } from '../components';
import { getAllProjectInfo } from '../store/project_store/action/project_thunk';
import PopupModel from '../components/popupModel';

const PAGE_SIZE = 10;

const ProjectScreen = () => {
  const { colors, strings } = useTheme();
  const { layout, isSmallHeight, hp } = useAuthLayout();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [selectedTab, setSelectedTab] = useState<'all' | 'starred'>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [starredProjectIds, setStarredProjectIds] = useState<string[]>([]);
  const [createProjectModalVisible, setCreateProjectModalVisible] =
    useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const isMomentumScroll = useRef(false);

  const dispatch = useAppDispatch();
  const { projects, loading, isFetchingMore, page, hasMore } = useAppSelector(
    (state: RootState) => state.projects,
  );
  const { user } = useAppSelector((state: RootState) => state.auth);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  const fetchProjects = useCallback(
    (pageNumber: number, searchQuery: string) => {
      dispatch(
        getAllProjectInfo({
          page: pageNumber,
          page_size: PAGE_SIZE,
          name: searchQuery.trim() || undefined,
        }),
      );
    },
    [dispatch],
  );

  useEffect(() => {
    fetchProjects(1, debouncedSearch);
  }, [fetchProjects, debouncedSearch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(
      getAllProjectInfo({
        page: 1,
        page_size: PAGE_SIZE,
        name: debouncedSearch.trim() || undefined,
      }),
    );
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (isMomentumScroll.current && !loading && !isFetchingMore && hasMore) {
      fetchProjects(page + 1, debouncedSearch);
      isMomentumScroll.current = false;
    }
  };

  const toggleStar = (id: string) => {
    setStarredProjectIds(prev =>
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id],
    );
  };

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects
      .map(project => ({
        ...project,
        starred: starredProjectIds.includes(project.id),
      }))
      .filter(project => {
        return (
          selectedTab === 'all' ||
          (selectedTab === 'starred' && project.starred)
        );
      });
  }, [projects, selectedTab, starredProjectIds]);

  const renderFooter = () => {
    if (!isFetchingMore) return null;
    return (
      <View
        style={{ paddingVertical: layout.elementGap, alignItems: 'center' }}
      >
        <ActivityIndicator size='small' color={colors.primary} />
      </View>
    );
  };

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <CommonHeader
        variant='project'
        title='Projects'
        user={user ?? undefined}
        onProfilePress={() => navigation.navigate('Profile')}
        onRightActionPress={() => setCreateProjectModalVisible(true)}
      />
      <View
        style={{
          backgroundColor: colors.card || colors.surface,
          borderBottomWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View className='flex-row'>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedTab('all')}
            className='flex-1 items-center'
            style={{
              paddingVertical: layout.elementGap,
              borderBottomWidth: 2,
              borderColor:
                selectedTab === 'all' ? colors.primary : 'transparent',
            }}
          >
            <AppText
              variant='body'
              color={
                selectedTab === 'all' ? colors.primary : colors.textSecondary
              }
              className='font-semibold'
            >
              {strings?.projects?.allProjects || 'All Projects'}
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedTab('starred')}
            className='flex-1 items-center'
            style={{
              paddingVertical: layout.elementGap,
              borderBottomWidth: 2,
              borderColor:
                selectedTab === 'starred' ? colors.primary : 'transparent',
            }}
          >
            <View
              className='flex-row items-center'
              style={{ gap: layout.mediumGap }}
            >
              <Ionicons
                name='star'
                size={layout.iconSize * 0.75}
                color={colors.warning}
                style={{ marginRight: layout.tightGap }}
              />
              <AppText
                variant='body'
                color={
                  selectedTab === 'starred'
                    ? colors.primary
                    : colors.textSecondary
                }
                className='font-semibold'
              >
                {strings?.projects?.starred || 'Starred'}
              </AppText>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={{
          paddingHorizontal: layout.paddingHorizontal,
          paddingVertical: layout.elementGap,
        }}
      >
        <AppInput
          placeholder={
            strings?.projects?.searchPlaceholder || 'Search projects...'
          }
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
      {loading && page === 1 ? (
        <ListSkeleton
          count={10}
          containerStyle={{
            paddingHorizontal: layout.paddingHorizontal,
            paddingBottom: hp(18),
            gap: isSmallHeight ? layout.sectionGap + 2 : layout.elementGap - 2,
          }}
          renderItem={index => <ProjectCardSkeleton key={index} />}
        />
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={filteredProjects}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
          contentContainerStyle={{
            paddingHorizontal: layout.paddingHorizontal,
            paddingBottom: moderateScale(150),
            gap: isSmallHeight ? layout.sectionGap + 2 : layout.elementGap - 2,
          }}
          renderItem={({ item }) => (
            <ProjectCard item={item} onToggleStar={() => toggleStar(item.id)} />
          )}
          onMomentumScrollBegin={() => {
            isMomentumScroll.current = true;
          }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.2}
          ListFooterComponent={renderFooter}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View
              className='items-center justify-center'
              style={{
                paddingVertical: layout.sectionGap * 3,
                gap: layout.sectionGap,
              }}
            >
              <Ionicons
                name='folder-open-outline'
                size={layout.iconSize * 2.5}
                color={colors.placeholder || colors.textSecondary}
              />
              <AppText
                variant='title'
                color={colors.text}
                className='font-semibold'
              >
                {strings?.projects?.noResultsTitle || 'No projects found'}
              </AppText>
              <AppText
                variant='body'
                color={colors.textSecondary}
                className='mt-1 text-center'
              >
                {strings?.projects?.noResultsSubtitle ||
                  'Try searching for a different name.'}
              </AppText>
            </View>
          }
        />
      )}
      <PopupModel
        mode='createProject'
        visible={createProjectModalVisible}
        onClose={() => setCreateProjectModalVisible(false)}
      />
    </Screen>
  );
};

export default ProjectScreen;
