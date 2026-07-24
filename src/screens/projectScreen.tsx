import React, { useMemo, useState } from 'react';
import { View, TouchableOpacity, TextInput, FlatList } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import AppText from '../components/common/AppText';
import ProjectCard from '../components/common/ProjectCard';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { RootStackParamList } from '../types/navigationTypes';
import { PROJECTS } from '../data/projectData';

const ProjectScreen = () => {
  const { colors, strings } = useTheme();
  const { layout } = useAuthLayout();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [selectedTab, setSelectedTab] = useState<'all' | 'starred'>('all');
  const [search, setSearch] = useState('');

  const filteredProjects = useMemo(() => {
    let data = PROJECTS;

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
  }, [selectedTab, search]);

  return (
    <SafeAreaView
      style={{ backgroundColor: colors.background }}
      className='flex-1'
      edges={['top']}
    >
      <View className='flex-1'>
        {/* Header Section */}
        <View
          style={{
            backgroundColor: colors.card || colors.surface,
            paddingHorizontal: layout.paddingHorizontal,
            paddingTop: layout.elementGap,
            paddingBottom: layout.elementGap,
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
                width: layout.controlSize * 1.5,
                height: layout.controlSize * 1.5,
                backgroundColor: colors.primary,
              }}
              className='items-center justify-center rounded-full'
            >
              <Ionicons
                name='add'
                size={layout.iconSize}
                color={colors.white}
              />
            </TouchableOpacity>
          </View>
        </View>
        {/* Tab Switcher */}
        <View
          style={{
            backgroundColor: colors.card || colors.surface,
            borderBottomWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View className='flex-row'>
            {/* All Projects Tab */}
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
            {/* Starred Tab */}
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
                  color={colors.warning || '#FFAB00'}
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

        {/* Search Input Bar */}
        <View
          style={{
            paddingHorizontal: layout.paddingHorizontal,
            paddingVertical: layout.elementGap,
          }}
        >
          <View
            className='flex-row items-center rounded-xl border'
            style={{
              backgroundColor: colors.surface || colors.card,
              borderColor: colors.border,
              paddingHorizontal: layout.paddingHorizontal / 1.5,
              paddingVertical: layout.tightGap * 2,
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
                marginLeft: layout.tightGap * 2,
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

        {/* Projects List */}
        <FlatList
          data={filteredProjects}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
          contentContainerStyle={{
            paddingHorizontal: layout.paddingHorizontal,
            paddingBottom: layout.sectionGap * 2,
          }}
          renderItem={({ item }) => <ProjectCard item={item} />}
          ListEmptyComponent={
            <View
              className='items-center justify-center'
              style={{ paddingVertical: layout.sectionGap * 3 }}
            >
              <Ionicons
                name='folder-open-outline'
                size={layout.iconSize * 2.5}
                color={colors.placeholder || colors.textSecondary}
              />

              <AppText
                variant='title'
                color={colors.text}
                className='mt-4 font-semibold'
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
      </View>
    </SafeAreaView>
  );
};

export default ProjectScreen;
