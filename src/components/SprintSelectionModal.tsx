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
import { Sprint } from '../types/project.type';

interface SprintSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  sprints: Sprint[];
  selectedSprintId: string | null;
  onSelectSprint: (sprint: Sprint | null) => void;
  isLoading?: boolean;
  colors: ThemeColors;
}

const formatSprintDate = (dStr?: string) => {
  if (!dStr) return '';
  try {
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return dStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dStr;
  }
};

export const SprintSelectionModal: React.FC<SprintSelectionModalProps> = ({
  visible,
  onClose,
  sprints,
  selectedSprintId,
  onSelectSprint,
  isLoading = false,
  colors,
}) => {
  const { layout, hp } = useAuthLayout();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const filteredSprints = useMemo(() => {
    if (!search.trim()) return sprints;
    const q = search.toLowerCase();
    return sprints.filter(
      s =>
        s.name?.toLowerCase().includes(q) ||
        s.status?.toLowerCase().includes(q) ||
        s.goal?.toLowerCase().includes(q),
    );
  }, [sprints, search]);

  const handleSelect = (sprint: Sprint | null) => {
    onSelectSprint(sprint);
    onClose();
  };

  const getStatusColor = (status?: string) => {
    const st = (status || '').toLowerCase();
    if (st === 'active' || st === 'in_progress') return colors.success || '#10B981';
    if (st === 'completed' || st === 'closed') return colors.textSecondary;
    return colors.primary;
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
            <View className='mb-2.5 mt-3 flex-row items-center justify-between px-4'>
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
              <AppText variant='title' className='font-bold'>
                Select Sprint
              </AppText>
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
                  placeholder='Search sprint...'
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
                data={filteredSprints}
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
                          <Ionicons
                            name='file-tray'
                            size={16}
                            color={colors.textSecondary}
                          />
                        </View>
                        <View>
                          <AppText
                            variant='body'
                            className='text-sm font-semibold'
                            color={
                              selectedSprintId === null
                                ? colors.primary
                                : colors.text
                            }
                          >
                            No Sprint (Backlog)
                          </AppText>
                          <AppText
                            variant='caption'
                            color={colors.textSecondary}
                            className='text-xs'
                          >
                            Move issue to project backlog
                          </AppText>
                        </View>
                      </View>
                      {selectedSprintId === null && (
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
                  const isSelected = selectedSprintId === item.id;
                  const statusColor = getStatusColor(item.status);
                  const startDateStr = formatSprintDate(item.start_date);
                  const endDateStr = formatSprintDate(item.end_date);
                  const dateText =
                    startDateStr && endDateStr
                      ? `${startDateStr} - ${endDateStr}`
                      : startDateStr || endDateStr || '';

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
                        className='mr-2 flex-1 flex-row items-center'
                        style={{ gap: 10 }}
                      >
                        <View
                          className='items-center justify-center rounded-lg border'
                          style={{
                            width: 32,
                            height: 32,
                            backgroundColor: colors.card || colors.surface,
                            borderColor: colors.border,
                          }}
                        >
                          <WorkItemIcon type='sprint' size={18} />
                        </View>
                        <View className='flex-1'>
                          <View
                            className='flex-row items-center'
                            style={{ gap: 6 }}
                          >
                            <AppText
                              variant='body'
                              className='text-sm font-semibold'
                              color={isSelected ? colors.primary : colors.text}
                              numberOfLines={1}
                              style={{ flexShrink: 1 }}
                            >
                              {item.name}
                            </AppText>
                            {item.status ? (
                              <View
                                className='rounded px-1.5 py-0.5'
                                style={{
                                  backgroundColor: `${statusColor}1A`,
                                }}
                              >
                                <AppText
                                  variant='caption'
                                  style={{
                                    fontSize: 10,
                                    fontWeight: '600',
                                    color: statusColor,
                                    textTransform: 'capitalize',
                                  }}
                                >
                                  {item.status.replace('_', ' ')}
                                </AppText>
                              </View>
                            ) : null}
                          </View>
                          {dateText ? (
                            <AppText
                              variant='caption'
                              color={colors.textSecondary}
                              className='mt-0.5 text-xs'
                            >
                              {dateText}
                            </AppText>
                          ) : null}
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
                      name='sync-outline'
                      size={36}
                      color={colors.textSecondary}
                      style={{ opacity: 0.5, marginBottom: 8 }}
                    />
                    <AppText variant='caption' color={colors.textSecondary}>
                      {search ? 'No sprints matching search' : 'No sprints found'}
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

