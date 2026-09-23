import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, FlatList, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { AppText } from '../../components';
import CommonHeader from '../../components/common/CommonHeader';
import { Radius } from '../../constants/Radius';
import { Shadows } from '../../constants/Shadows';
import { Spacing } from '../../constants/Spacing';
import { useAuthLayout } from '../../hooks/useAuthLayout';
import { useTheme } from '../../hooks/useTheme';
import { RootStackParamList } from '../../types/navigationTypes';
import { RootState, useAppSelector } from '../../store';
import StatusModal, { StatusItem } from '../../components/statusModel';
import { skipToken } from '@reduxjs/toolkit/query';
import {
  useCreateCustomStatusMutation,
  useUpdateCustomStatusMutation,
  useDeleteCustomStatusMutation,
  useCreateUserStoryStatusMutation,
  useUpdateUserStoryStatusMutation,
  useDeleteUserStoryStatusMutation,
  useGetCustomStatusQuery,
  useGetUserStoryStatusQuery,
} from '../../store/api/projectApi';
import Screen from '../../components/common/ScreenWapper';
import DeleteColumnModal from '../../components/DeleteColumnModal';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = 'userStory' | 'task';

// ─── Skeleton Loader Component ────────────────────────────────────────────────

const StatusRowSkeleton: React.FC = () => {
  const { colors } = useTheme();
  const { moderateScale } = useAuthLayout();
  const opacityAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.85,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacityAnim]);

  const swatchSize = moderateScale(34);
  const btnSize = moderateScale(32);
  const skeletonColor = colors.border || '#E0E0E0';

  return (
    <Animated.View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: moderateScale(14),
        paddingVertical: moderateScale(12),
        backgroundColor: colors.background,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        opacity: opacityAnim,
      }}
    >
      {/* 1. Color Swatch Placeholder */}
      <View style={{ width: moderateScale(42), alignItems: 'center' }}>
        <View
          style={{
            width: swatchSize,
            height: swatchSize,
            borderRadius: Radius.circle,
            backgroundColor: skeletonColor,
          }}
        />
      </View>

      {/* 2. Name Placeholder */}
      <View style={{ flex: 1, paddingLeft: moderateScale(14) }}>
        <View
          style={{
            width: '65%',
            height: moderateScale(14),
            borderRadius: Radius.xs,
            backgroundColor: skeletonColor,
          }}
        />
      </View>

      {/* 3. Final Badge Placeholder */}
      <View style={{ width: moderateScale(70), alignItems: 'center' }}>
        <View
          style={{
            width: moderateScale(42),
            height: moderateScale(20),
            borderRadius: Radius.xs,
            backgroundColor: skeletonColor,
          }}
        />
      </View>

      {/* 4. Action Buttons Placeholder */}
      <View
        style={{
          width: 76,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 6,
        }}
      >
        <View
          style={{
            width: btnSize,
            height: btnSize,
            borderRadius: Radius.sm,
            backgroundColor: skeletonColor,
          }}
        />
        <View
          style={{
            width: btnSize,
            height: btnSize,
            borderRadius: Radius.sm,
            backgroundColor: skeletonColor,
          }}
        />
      </View>
    </Animated.View>
  );
};

// ─── Table Header ─────────────────────────────────────────────────────────────

const TableHeader: React.FC = () => {
  const { colors } = useTheme();
  const { moderateScale } = useAuthLayout();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg + moderateScale(14),
        paddingTop: Spacing.md,
        paddingBottom: Spacing.xs, // Reduced to balance the space before the list
      }}
    >
      {/* Color Column */}
      <View style={{ width: moderateScale(42), alignItems: 'center' }}>
        <AppText
          variant='caption'
          color={colors.textSecondary}
          style={{
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          Color
        </AppText>
      </View>

      {/* Name Column */}
      <View style={{ flex: 1, paddingLeft: moderateScale(14) }}>
        <AppText
          variant='caption'
          color={colors.textSecondary}
          style={{
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          Name
        </AppText>
      </View>

      {/* Closed? Column */}
      <View style={{ width: moderateScale(70), alignItems: 'center' }}>
        <AppText
          variant='caption'
          color={colors.textSecondary}
          style={{
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          Final
        </AppText>
      </View>

      {/* Actions Column */}
      <View style={{ width: moderateScale(76), alignItems: 'center' }}>
        <AppText
          variant='caption'
          color={colors.textSecondary}
          style={{
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          Actions
        </AppText>
      </View>
    </View>
  );
};

// ─── Status Row ───────────────────────────────────────────────────────────────

interface StatusRowProps {
  item: StatusItem;
  onEdit: (item: StatusItem) => void;
  onDelete: (id: string) => void;
}

const StatusRow: React.FC<StatusRowProps> = ({ item, onEdit, onDelete }) => {
  const { colors } = useTheme();
  const { moderateScale } = useAuthLayout();

  const swatchSize = moderateScale(34);
  const btnSize = moderateScale(32);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: moderateScale(14),
        paddingVertical: moderateScale(12),
        backgroundColor: colors.background,
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {/* 1. Color Cell */}
      <View style={{ width: moderateScale(42), alignItems: 'center' }}>
        <View
          style={{
            width: swatchSize,
            height: swatchSize,
            borderRadius: Radius.circle,
            backgroundColor: item.color,
          }}
        />
      </View>

      {/* 2. Name Cell */}
      <View style={{ flex: 1, paddingLeft: moderateScale(14) }}>
        <AppText
          variant='body'
          color={colors.text}
          numberOfLines={1}
          style={{ fontWeight: '600', fontSize: moderateScale(14) }}
        >
          {item.name}
        </AppText>
      </View>

      {/* 3. Closed? Cell */}
      {item.is_final && (
        <View style={{ width: moderateScale(70), alignItems: 'center' }}>
          <View
            style={{
              paddingHorizontal: Spacing.sm,
              paddingVertical: 3,
              backgroundColor: item.is_final
                ? `${colors.success}18`
                : `${colors.error}18`,
              borderRadius: Radius.xs,
            }}
          >
            <AppText
              variant='caption'
              color={item.is_final ? colors.success : colors.error}
              style={{ fontWeight: '700', fontSize: moderateScale(11) }}
            >
              {item.is_final ? 'YES' : 'NO'}
            </AppText>
          </View>
        </View>
      )}

      {/* 4. Action Buttons */}
      <View
        style={{
          width: 76,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 6,
        }}
      >
        <TouchableOpacity
          onPress={() => onEdit(item)}
          hitSlop={8}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: btnSize,
            height: btnSize,
            borderRadius: Radius.sm,
            backgroundColor: `${colors.primary}15`,
          }}
        >
          <Ionicons
            name='pencil-outline'
            size={moderateScale(15)}
            color={colors.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onDelete(item.id)}
          disabled={item.is_default}
          hitSlop={8}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: btnSize,
            height: btnSize,
            borderRadius: Radius.sm,
            backgroundColor: `${colors.error}15`,
            opacity: item.is_default ? 0.6 : 1,
          }}
        >
          <Ionicons
            name='trash-outline'
            size={moderateScale(15)}
            color={colors.error}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const ProjectStatus = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { layout, moderateScale } = useAuthLayout();
  const insets = useSafeAreaInsets();

  const { project } = useAppSelector((state: RootState) => state.projects);
  const projectId =
    project?.id?.toString() || (project as any)?._id?.toString();

  const [activeTab, setActiveTab] = useState<TabKey>('userStory');
  const [userStoryList, setUserStoryList] = useState<StatusItem[]>([]);
  const [taskList, setTaskList] = useState<StatusItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<StatusItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<StatusItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: userStoryStatusResponse,
    isLoading: isUserStoryLoading,
    refetch: refetchUserStoryStatus,
  } = useGetUserStoryStatusQuery(
    projectId ? { project_id: projectId } : skipToken,
  );

  const {
    data: customStatusResponse,
    isLoading: isTaskListLoading,
    refetch: refetchCustomStatus,
  } = useGetCustomStatusQuery(
    projectId ? { project_id: projectId } : skipToken,
  );

  useFocusEffect(
    useCallback(() => {
      if (!projectId) return;
      refetchUserStoryStatus();
      refetchCustomStatus();
    }, [projectId, refetchUserStoryStatus, refetchCustomStatus]),
  );

  const [createCustomStatus, createCustomState] =
    useCreateCustomStatusMutation();
  const [updateCustomStatus, updateCustomState] =
    useUpdateCustomStatusMutation();
  const [deleteCustomStatus, deleteCustomState] =
    useDeleteCustomStatusMutation();
  const [createUserStoryStatus, createUserStoryState] =
    useCreateUserStoryStatusMutation();
  const [updateUserStoryStatus, updateUserStoryState] =
    useUpdateUserStoryStatusMutation();
  const [deleteUserStoryStatus, deleteUserStoryState] =
    useDeleteUserStoryStatusMutation();

  const isLoading =
    activeTab === 'userStory' ? isUserStoryLoading : isTaskListLoading;

  useEffect(() => {
    if (userStoryStatusResponse?.data) {
      setUserStoryList(
        userStoryStatusResponse.data.map(item => ({
          id: String(item.id),
          name: item.name,
          color: item.color,
          display_order: String(item.display_order ?? '0'),
          is_default: Boolean(item.is_default),
          is_final: Boolean(item.is_final),
        })),
      );
    }
  }, [userStoryStatusResponse]);

  useEffect(() => {
    if (customStatusResponse?.data) {
      setTaskList(
        customStatusResponse.data.map((item: any) => ({
          id: String(item.id),
          name: item.name,
          color: item.color,
          display_order: String(item.order ?? item.display_order ?? '0'),
          is_default: Boolean(item.default ?? item.is_default),
          is_final: Boolean(item.final ?? item.is_final),
        })),
      );
    }
  }, [customStatusResponse]);

  const statuses = activeTab === 'userStory' ? userStoryList : taskList;
  const filtered = searchQuery.trim()
    ? statuses.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : statuses;

  const openAdd = () => {
    setEditItem(null);
    setModalVisible(true);
  };

  const openEdit = (item: StatusItem) => {
    setEditItem(item);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    const item = statuses.find(status => status.id === id);
    if (item) setDeleteItem(item);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem || !projectId) return;
    try {
      if (activeTab === 'userStory') {
        await deleteUserStoryStatus({
          project_id: projectId,
          status_id: deleteItem.id,
        }).unwrap();
      } else {
        await deleteCustomStatus({
          project_id: projectId,
          status_id: deleteItem.id,
        }).unwrap();
      }
      setDeleteItem(null);
    } catch {
      // Keep confirmation open when the API request fails.
    }
  };

  const handleSave = async (name: string, color: string, is_final: boolean) => {
    if (!projectId) return;
    const payload = {
      project_id: projectId,
      name,
      color,
      display_order: editItem
        ? Number(editItem.display_order) || 0
        : statuses.length + 1,
      is_final,
    };
    if (activeTab === 'userStory') {
      if (editItem) {
        await updateUserStoryStatus({
          ...payload,
          status_id: editItem.id,
        }).unwrap();
      } else {
        await createUserStoryStatus(payload).unwrap();
      }
    } else if (editItem) {
      await updateCustomStatus({ ...payload, status_id: editItem.id }).unwrap();
    } else {
      await createCustomStatus(payload).unwrap();
    }
  };

  const isDeleting =
    deleteCustomState.isLoading || deleteUserStoryState.isLoading;
  const isSaving =
    activeTab === 'userStory'
      ? editItem
        ? updateUserStoryState.isLoading
        : createUserStoryState.isLoading
      : editItem
        ? updateCustomState.isLoading
        : createCustomState.isLoading;

  return (
    <Screen scroll={false} backgroundColor={colors.background}>
      <CommonHeader
        variant='status'
        title='Statuses'
        titleAlignment='left'
        onBackPress={() => navigation.goBack()}
        searchQuery={searchQuery}
        onChangeSearchQuery={setSearchQuery}
        searchPlaceholder='Search statuses...'
      >
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: colors.background,
            borderRadius: Radius.lg,
            padding: moderateScale(4),
            borderWidth: 1,
            borderColor: colors.border,
            gap: moderateScale(4),
          }}
        >
          {[
            {
              key: 'userStory' as TabKey,
              label: `User Story (${userStoryList.length})`,
            },
            {
              key: 'task' as TabKey,
              label: `Task (${taskList.length})`,
            },
          ].map(tab => {
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.85}
                onPress={() => setActiveTab(tab.key)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: moderateScale(9),
                  borderRadius: Radius.md,
                  backgroundColor: active ? colors.primary : 'transparent',
                }}
              >
                <AppText
                  variant='body'
                  style={{
                    textAlign: 'center',
                    fontWeight: active ? '700' : '500',
                    fontSize: moderateScale(13),
                    color: active ? '#FFFFFF' : colors.textSecondary,
                  }}
                >
                  {tab.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      </CommonHeader>

      {/* Table Column Headers */}
      <TableHeader />

      {/* Table Data Rows / Skeleton Loader */}
      {isLoading ? (
        <View
          style={{
            flex: 1,
            paddingHorizontal: Spacing.lg,
            paddingTop: moderateScale(12),
            gap: moderateScale(10),
          }}
        >
          {[1, 2, 3, 4, 5, 6].map(key => (
            <StatusRowSkeleton key={key} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <StatusRow item={item} onEdit={openEdit} onDelete={handleDelete} />
          )}
          ItemSeparatorComponent={() => (
            <View style={{ height: moderateScale(10) }} />
          )}
          style={{ flex: 1, backgroundColor: colors.surface }}
          contentContainerStyle={{
            paddingHorizontal: Spacing.lg,
            paddingTop: moderateScale(12), // Adds clear breathing space under TableHeader
            paddingBottom: moderateScale(110),
            backgroundColor: colors.surface,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Ionicons
                name='list-outline'
                size={moderateScale(48)}
                color={colors.placeholder}
              />
              <AppText
                variant='body'
                color={colors.textSecondary}
                style={{ marginTop: Spacing.sm }}
              >
                No statuses found
              </AppText>
            </View>
          }
        />
      )}

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={openAdd}
        style={{
          position: 'absolute',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.primary,
          bottom: Math.max(insets.bottom, Spacing.lg) + moderateScale(12),
          right: layout?.paddingHorizontal ?? Spacing.lg,
          width: moderateScale(56),
          height: moderateScale(56),
          borderRadius: Radius.circle,
          ...Shadows.button,
        }}
      >
        <Ionicons name='add' size={moderateScale(28)} color='#FFFFFF' />
      </TouchableOpacity>

      <StatusModal
        visible={modalVisible}
        editItem={editItem}
        saving={isSaving}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
      <DeleteColumnModal
        visible={Boolean(deleteItem)}
        title='Delete Status'
        columnTitle={deleteItem?.name ?? 'this status'}
        colors={colors}
        loading={isDeleting}
        onClose={() => setDeleteItem(null)}
        onDelete={handleConfirmDelete}
      />
    </Screen>
  );
};

export default ProjectStatus;
