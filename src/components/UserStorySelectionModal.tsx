import React, { useState, useMemo } from 'react';
import {
  Modal,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  FlatList,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from './common/AppText';
import { WorkItemIcon } from './common/getWorkItemIcon';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { Radius } from '../constants/Radius';
import { ThemeColors } from '../constants/Colors';
import { UserStory } from '../types/project.type';
import { getPriorityThemeColor, TaskPriority } from '../utils/enum';

interface UserStorySelectionModalProps {
  visible: boolean;
  onClose: () => void;
  stories: UserStory[];
  selectedStoryId: string | null;
  onSelectStory: (story: UserStory | null) => void;
  isLoading?: boolean;
  colors: ThemeColors;
  sprintName?: string;
}

export const UserStorySelectionModal: React.FC<UserStorySelectionModalProps> = ({
  visible,
  onClose,
  stories,
  selectedStoryId,
  onSelectStory,
  isLoading = false,
  colors,
  sprintName,
}) => {
  const { layout, hp } = useAuthLayout();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const filteredStories = useMemo(() => {
    if (!search.trim()) return stories;
    const q = search.toLowerCase();
    return stories.filter(
      s =>
        s.title?.toLowerCase().includes(q) ||
        s.key?.toLowerCase().includes(q) ||
        s.formatted_serial_number?.toLowerCase().includes(q) ||
        s.status?.toLowerCase().includes(q),
    );
  }, [stories, search]);

  const handleSelect = (story: UserStory | null) => {
    onSelectStory(story);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableOpacity
        className='flex-1 justify-end bg-black/50'
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableWithoutFeedback>
          <View
            className='relative rounded-t-3xl border p-2'
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              height: hp(70),
              paddingBottom: Math.max(insets.bottom, 24) + 16,
            }}
          >
            {/* Header */}
            <View className='mb-2 mt-3 flex-row items-center justify-between px-4'>
              <TouchableOpacity
                className='items-center justify-center border p-1.5'
                style={{
                  borderColor: colors.border,
                  borderRadius: Radius.circle,
                }}
                onPress={onClose}
              >
                <Ionicons
                  name='close'
                  size={layout.iconSize * 0.85}
                  color={colors.text}
                />
              </TouchableOpacity>
              <View className='items-center'>
                <AppText variant='title' className='font-bold'>
                  Select User Story
                </AppText>
                {sprintName ? (
                  <AppText
                    variant='caption'
                    color={colors.primary}
                    className='text-xs font-medium'
                  >
                    Sprint: {sprintName}
                  </AppText>
                ) : null}
              </View>
              <View style={{ width: layout.iconSize * 0.85 }} />
            </View>

            {/* Search Bar */}
            <View className='px-4 py-2'>
              <View
                className='flex-row items-center rounded-lg border px-3 py-2'
                style={{
                  backgroundColor: colors.card || colors.surface,
                  borderColor: colors.border,
                }}
              >
                <Ionicons
                  name='search-outline'
                  size={layout.iconSize * 0.75}
                  color={colors.textSecondary}
                />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder='Search user story...'
                  placeholderTextColor={colors.textSecondary}
                  style={{
                    flex: 1,
                    marginLeft: 8,
                    padding: 0,
                    color: colors.text,
                    fontSize: 13,
                  }}
                />
                {search ? (
                  <TouchableOpacity onPress={() => setSearch('')}>
                    <Ionicons
                      name='close-circle'
                      size={16}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* Content */}
            {isLoading ? (
              <View className='flex-1 items-center justify-center py-10'>
                <ActivityIndicator size='large' color={colors.primary} />
              </View>
            ) : (
              <FlatList
                data={filteredStories}
                keyExtractor={item => item.id}
                keyboardShouldPersistTaps='handled'
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingTop: 8,
                  paddingBottom: Math.max(insets.bottom, 24) + 50,
                }}
                ListHeaderComponent={
                  !search.trim() ? (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleSelect(null)}
                      className='flex-row items-center justify-between border-b py-3.5'
                      style={{ borderColor: colors.itemDivider || colors.border }}
                    >
                      <View className='flex-row items-center' style={{ gap: 10 }}>
                        <View
                          className='items-center justify-center rounded-lg border'
                          style={{
                            width: 32,
                            height: 32,
                            backgroundColor: colors.card || colors.surface,
                            borderColor: colors.border,
                          }}
                        >
                          <WorkItemIcon
                            type='user_story'
                            size={18}
                            color={colors.textSecondary}
                          />
                        </View>
                        <View>
                          <AppText
                            variant='body'
                            className='text-sm font-semibold'
                            color={
                              selectedStoryId === null
                                ? colors.primary
                                : colors.text
                            }
                          >
                            Storyless (No User Story)
                          </AppText>
                          <AppText
                            variant='caption'
                            color={colors.textSecondary}
                            className='text-xs'
                          >
                            Keep this task unassigned from stories
                          </AppText>
                        </View>
                      </View>
                      {selectedStoryId === null && (
                        <Ionicons
                          name='checkmark-circle'
                          size={20}
                          color={colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  ) : null
                }
                renderItem={({ item }) => {
                  const isSelected = selectedStoryId === item.id;
                  const itemKey =
                    item.formatted_serial_number || item.key || '';
                  const priorityColor = item.priority
                    ? getPriorityThemeColor(
                        item.priority.toLowerCase() as TaskPriority,
                        colors,
                      )
                    : colors.textSecondary;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.7}
                      onPress={() => handleSelect(item)}
                      className='flex-row items-center justify-between border-b py-3'
                      style={{
                        borderColor: colors.itemDivider || colors.border,
                      }}
                    >
                      <View
                        className='mr-2 flex-1 flex-row items-start'
                        style={{ gap: 10 }}
                      >
                        <View
                          className='items-center justify-center rounded-lg border'
                          style={{
                            width: 32,
                            height: 32,
                            backgroundColor: colors.card || colors.surface,
                            borderColor: colors.border,
                            marginTop: 2,
                          }}
                        >
                          <WorkItemIcon type='user_story' size={18} />
                        </View>
                        <View className='flex-1'>
                          <View
                            className='flex-row flex-wrap items-center'
                            style={{ gap: 6 }}
                          >
                            {itemKey ? (
                              <View
                                className='rounded px-1.5 py-0.5'
                                style={{
                                  backgroundColor: `${colors.primary}15`,
                                }}
                              >
                                <AppText
                                  variant='caption'
                                  style={{
                                    fontSize: 10,
                                    fontWeight: '700',
                                    color: colors.primary,
                                  }}
                                >
                                  {itemKey}
                                </AppText>
                              </View>
                            ) : null}
                            {item.priority ? (
                              <View
                                className='flex-row items-center rounded px-1.5 py-0.5'
                                style={{
                                  backgroundColor: `${priorityColor}15`,
                                  gap: 4,
                                }}
                              >
                                <View
                                  className='rounded-full'
                                  style={{
                                    width: 5,
                                    height: 5,
                                    backgroundColor: priorityColor,
                                  }}
                                />
                                <AppText
                                  variant='caption'
                                  style={{
                                    fontSize: 10,
                                    fontWeight: '600',
                                    color: priorityColor,
                                    textTransform: 'capitalize',
                                  }}
                                >
                                  {item.priority}
                                </AppText>
                              </View>
                            ) : null}
                          </View>
                          <AppText
                            variant='body'
                            className='mt-1 text-sm font-semibold'
                            color={isSelected ? colors.primary : colors.text}
                            numberOfLines={2}
                          >
                            {item.title}
                          </AppText>
                        </View>
                      </View>

                      {isSelected && (
                        <Ionicons
                          name='checkmark-circle'
                          size={20}
                          color={colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <View className='items-center justify-center py-10'>
                    <Ionicons
                      name='bookmark-outline'
                      size={36}
                      color={colors.textSecondary}
                      style={{ opacity: 0.5, marginBottom: 8 }}
                    />
                    <AppText
                      variant='caption'
                      color={colors.textSecondary}
                      className='text-center'
                    >
                      {search
                        ? 'No user stories matching search'
                        : sprintName
                        ? `No user stories found in ${sprintName}`
                        : 'No user stories found'}
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

