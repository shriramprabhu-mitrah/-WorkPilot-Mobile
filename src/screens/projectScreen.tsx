import React, { useEffect, useMemo, useState } from 'react';
import { View, TouchableOpacity, FlatList, Image } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AppText from '../components/common/AppText';
import ProjectCard from '../components/common/ProjectCard';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { RootStackParamList } from '../types/navigationTypes';
import { getAllProjectInfo } from '../store/project_store/action/project_thunk';
import Screen from '../components/common/ScreenWapper';
import { Radius } from '../constants/Radius';
import { moderateScale } from '../utils/responsive';
import ProjectCardSkeleton from '../components/skeleton/ProjectCardSkeleton';
import ListSkeleton from '../components/skeleton/ListSkeleton';
import { RootState, useAppDispatch, useAppSelector } from '../store';
import PopupModel from '../components/popupModel';
import { AppInput } from '../components';

const ProjectScreen = () => {
  const { colors, strings } = useTheme();
  const { layout, isSmallHeight, hp } = useAuthLayout();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [selectedTab, setSelectedTab] = useState<'all' | 'starred'>('all');
  const [search, setSearch] = useState('');
  const [createProjectModalVisible, setCreateProjectModalVisible] =
    useState(false);
  const dispatch = useAppDispatch();
  const { projects, loading } = useAppSelector(
    (state: RootState) => state.projects,
  );
  const { user } = useAppSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(getAllProjectInfo());
  }, [dispatch]);

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    const query = search.trim().toLowerCase();
    return projects.filter(project => {
      const matchesSearch =
        !query ||
        project.name?.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query);

      return matchesSearch;
    });
  }, [projects, search, selectedTab]);

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <View
        className='flex-row items-center justify-between'
        style={{
          backgroundColor: colors.card || colors.surface,
          paddingHorizontal: layout.paddingHorizontal,
          paddingVertical: moderateScale(10),
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          className='items-center justify-center rounded-full'
          style={{
            width: moderateScale(40),
            height: moderateScale(40),
            borderRadius: Radius.circle,
          }}
        >
          {user?.avatar_url ? (
            <Image
              source={{ uri: user.avatar_url }}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: moderateScale(26),
              }}
              resizeMode='cover'
            />
          ) : (
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              className='items-center justify-center'
              style={{
                width: moderateScale(40),
                height: moderateScale(40),
                backgroundColor: colors.accentOrange,
                borderRadius: Radius.circle,
              }}
            >
              <AppText
                style={{
                  fontSize: moderateScale(18),
                  fontWeight: 'bold',
                  color: colors.white,
                }}
              >
                {user?.name
                  ?.split(' ')
                  .map(word => word[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase() || 'U'}
              </AppText>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
        <AppText
          variant='title'
          color={colors.text}
          className='font-bold'
          style={{ fontSize: layout.titleFontSize }}
        >
          {strings?.projects?.title || 'Projects'}
        </AppText>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setCreateProjectModalVisible(true)}
          style={{
            width: moderateScale(38),
            height: moderateScale(38),
            borderRadius: Radius.circle,
            backgroundColor: colors.primary,
          }}
          className='items-center justify-center'
        >
          <Ionicons name='add' size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
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
            <View className='flex-row items-center'>
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
      {loading ? (
        <ListSkeleton
          count={projects?.length}
          containerStyle={{
            paddingHorizontal: layout.paddingHorizontal,
            paddingBottom: isSmallHeight ? hp(20) : hp(12),
            gap: isSmallHeight ? layout.sectionGap + 2 : layout.elementGap - 2,
          }}
          renderItem={index => <ProjectCardSkeleton key={index} />}
        />
      ) : (
        <FlatList
          data={filteredProjects}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
          contentContainerStyle={{
            paddingHorizontal: layout.paddingHorizontal,
            paddingBottom: isSmallHeight ? hp(20) : hp(12),
            gap: isSmallHeight ? layout.sectionGap + 2 : layout.elementGap - 2,
          }}
          renderItem={({ item }) => <ProjectCard item={item} />}
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
