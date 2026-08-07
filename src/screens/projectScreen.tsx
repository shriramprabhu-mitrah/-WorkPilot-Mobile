import React, { useEffect, useMemo, useState } from 'react';
import { View, TouchableOpacity, TextInput, FlatList } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AppText from '../components/common/AppText';
import ProjectCard from '../components/common/ProjectCard';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { RootStackParamList } from '../types/navigationTypes';
import { getProjects } from '../data/projectData';
import Screen from '../components/common/ScreenWapper';
import { Radius } from '../constants/Radius';
import { moderateScale } from '../utils/responsive';
import ProjectCardSkeleton from '../components/skeleton/ProjectCardSkeleton';
import ListSkeleton from '../components/skeleton/ListSkeleton';

const ProjectScreen = () => {
  const { colors, strings } = useTheme();
  const { layout, isSmallHeight, hp } = useAuthLayout();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [selectedTab, setSelectedTab] = useState<'all' | 'starred'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const filteredProjects = useMemo(() => {
    let data = getProjects(colors);
    if (selectedTab === 'starred') {
      data = data.filter(item => item.starred);
    }
    if (search.trim()) {
      const query = search.toLowerCase();
      data = data.filter(
        item =>
          item.name.toLowerCase().includes(query) ||
          item.code.toLowerCase().includes(query),
      );
    }
    return data;
  }, [colors, selectedTab, search]);

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <View
        style={{
          backgroundColor: colors.card || colors.surface,
          paddingHorizontal: layout.paddingHorizontal,
          paddingTop: layout.paddingTop,
          paddingBottom: layout.paddingBottom,
          borderBottomWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View className='flex-row items-center justify-between'>
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
            onPress={() => navigation.navigate('newIssues')}
            style={{
              padding: moderateScale(2),
              backgroundColor: colors.primary,
            }}
            className='items-center justify-center rounded-full'
          >
            <Ionicons name='add' size={layout.iconSize} color={colors.white} />
          </TouchableOpacity>
        </View>
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
          paddingBottom: layout.paddingBottom,
        }}
      >
        <View
          className='flex-row items-center border'
          style={{
            borderRadius: Radius.sm,
            backgroundColor: colors.surface || colors.card,
            borderColor: colors.border,
            paddingHorizontal: layout.paddingHorizontal * 0.5,
            paddingVertical: layout.tightGap,
            gap: layout.sectionGap,
          }}
        >
          <Ionicons
            name='search-outline'
            size={layout.iconSize * 0.85}
            color={colors.placeholder || colors.textSecondary}
          />
          <TextInput
            placeholder={
              strings?.projects?.searchPlaceholder || 'Search projects...'
            }
            placeholderTextColor={colors.placeholder || colors.textSecondary}
            value={search}
            onChangeText={setSearch}
            className='flex-1'
            style={{
              color: colors.text,
              fontSize: layout.bodyFontSize,
            }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons
                name='close'
                size={layout.iconSize * 0.8}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {loading ? (
        <ListSkeleton
          count={8}
          containerStyle={{
            paddingHorizontal: layout.paddingHorizontal,
            paddingBottom: isSmallHeight ? hp(20) : hp(12),
            gap: isSmallHeight ? layout.sectionGap + 2 : layout.elementGap - 2,
          }}
          renderItem={() => <ProjectCardSkeleton />}
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
                  'Try searching for a different name or code.'}
              </AppText>
            </View>
          }
        />
      )}
    </Screen>
  );
};

export default ProjectScreen;
