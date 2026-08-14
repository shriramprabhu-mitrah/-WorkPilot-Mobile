import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from './common/AppText';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { Radius } from '../constants/Radius';
import { RootState, useAppDispatch, useAppSelector } from '../store';
import { getAllProjectInfo } from '../store/project_store/action/project_thunk';
import { AppInput } from './common/Input';

interface ProjectListModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectProject?: (projectId: string) => void;
  title?: string;
}

const PAGE_SIZE = 10;

export const ProjectListModal: React.FC<ProjectListModalProps> = ({
  visible,
  onClose,
  onSelectProject,
  title = 'Select Project',
}) => {
  const { colors, strings } = useTheme();
  const { layout, hp } = useAuthLayout();
  const dispatch = useAppDispatch();

  const { projects, loading, isFetchingMore, page, hasMore } = useAppSelector(
    (state: RootState) => state.projects,
  );

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

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
    if (visible) {
      fetchProjects(1, debouncedSearch);
    }
  }, [visible, fetchProjects, debouncedSearch]);

  const handleLoadMore = () => {
    if (!loading && !isFetchingMore && hasMore) {
      fetchProjects(page + 1, debouncedSearch);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 justify-end bg-black/50"
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableWithoutFeedback>
          <View
            className="relative rounded-t-3xl border p-1.5"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              height: hp(80),
              paddingBottom: hp(3),
            }}
          >
            <View className="mb-2.5 mt-4 flex-row items-center justify-between px-5">
              <TouchableOpacity
                className="items-center justify-center border p-1.5"
                style={{
                  borderColor: colors.border,
                  borderRadius: Radius.circle,
                }}
                onPress={onClose}
              >
                <Ionicons
                  name="close"
                  size={layout.iconSize}
                  color={colors.text}
                />
              </TouchableOpacity>
              <AppText variant="title" className="font-bold">
                {title}
              </AppText>
              <View style={{ width: layout.iconSize }} />
            </View>
            <View className="px-5 py-2">
              <AppInput
                placeholder={
                  strings?.projects?.searchPlaceholder || 'Search projects...'
                }
                value={search}
                onChangeText={setSearch}
                leftIcon={
                  <Ionicons
                    name="search-outline"
                    size={layout.iconSize * 0.85}
                    color={colors.placeholder || colors.textSecondary}
                  />
                }
              />
            </View>
            {loading && page === 1 ? (
              <View className="py-10 items-center justify-center">
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <FlatList
                data={projects}
                keyExtractor={item => item.id.toString()}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 8 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      onSelectProject?.(item.id);
                      onClose();
                    }}
                    className="flex-row items-center justify-between py-3.5 border-b"
                    style={{ borderColor: colors.border }}
                  >
                    <View className="flex-row items-center gap-3">
                      <Ionicons
                        name="folder-outline"
                        size={layout.iconSize}
                        color={colors.primary}
                      />
                      <AppText
                        variant="body"
                        className="font-medium"
                        color={colors.text}
                      >
                        {item.name}
                      </AppText>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                )}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.2}
                ListFooterComponent={
                  isFetchingMore ? (
                    <View className="py-3 items-center">
                      <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                  ) : null
                }
                ListEmptyComponent={
                  <View className="py-10 items-center">
                    <AppText color={colors.textSecondary}>
                      No projects found
                    </AppText>
                  </View>
                }
              />
            )}
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};