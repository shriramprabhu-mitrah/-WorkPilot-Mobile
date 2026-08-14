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
import AppInput from './Input/AppInput'; // Adjust import path if needed
import ProjectCard from '../common/ProjectCard';
import ListSkeleton from '../skeleton/ListSkeleton';
import ProjectCardSkeleton from '../skeleton/ProjectCardSkeleton';
import { useTheme } from '../../hooks/useTheme';
import { useAuthLayout } from '../../hooks/useAuthLayout';
import { moderateScale } from '../../utils/responsive';
import { useAppSelector } from '../../store';

export interface ProjectListBottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  //   projects: any[];
  //   loading?: boolean;
  onSelectProject?: (projectId: string) => void;
  // Pagination props
  onEndReached?: () => void;
  hasMore?: boolean;
  isFetchingMore?: boolean;
}

export const ProjectListBottomSheet: React.FC<ProjectListBottomSheetProps> = ({
  visible,
  onDismiss,
  title = 'Select Project',
  //   projects = [],
  //   loading = false,
  onSelectProject,
  onEndReached,
  hasMore = false,
  isFetchingMore = false,
}) => {
  const { colors, strings } = useTheme();
  const { layout } = useAuthLayout();
  const insets = useSafeAreaInsets();
  const closeIconSize = moderateScale(20);
  const bottomPadding = Math.max(insets.bottom, 16);
  const { projects, loading } = useAppSelector(state => state.projects);

  const [search, setSearch] = useState('');

  // Filter projects based on search query
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    const query = search.trim().toLowerCase();
    return projects.filter(project => {
      return (
        !query ||
        project.name?.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query)
      );
    });
  }, [projects, search]);

  const handleSelect = (id: string) => {
    onSelectProject?.(id);
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
            maxHeight: '80%', // Caps sheet height at 80% screen height
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
              {title}
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
              data={filteredProjects}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps='handled'
              contentContainerStyle={{
                gap: layout.elementGap - 2,
                paddingBottom: 16,
              }}
              renderItem={({ item }) => (
                <ProjectCard item={item} onPress={handleSelect} />
              )}
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
                    className='text-center'
                  >
                    {strings?.projects?.noResultsSubtitle ||
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
