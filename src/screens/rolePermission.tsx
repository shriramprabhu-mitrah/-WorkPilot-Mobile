import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { showSnackbar } from '../components/common/Snackbar';
import { useAuthLayout } from '../hooks/useAuthLayout';
import {
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useGetRolesQuery,
  useUpdateRoleMutation,
} from '../store/api/homeApi';
import { RootStackParamList } from '../types/navigationTypes';
import Screen from '../components/common/ScreenWapper';
import CommonHeader from '../components/common/CommonHeader';
import PopupModel from '../components/popupModel';
import DeleteColumnModal from '../components/DeleteColumnModal';
import AppText from '../components/common/AppText';
import { WorkItemIcon } from '../components/common/getWorkItemIcon';
import { useTheme } from '../hooks/useTheme';
import {
  ActionMeta,
  GroupMeta,
  PermissionActions,
  RolePermissionsMap,
} from '../types/auth.type';
import RolePermissionSkeleton from '../components/skeleton/rolePermissionSkeleton';

const ACTION_METAS: ActionMeta[] = [
  {
    key: 'view',
    label: 'View',
    subtitle: 'Can view records',
    icon: 'eye-outline',
  },
  {
    key: 'add',
    label: 'Add',
    subtitle: 'Can create new records',
    icon: 'add-outline',
  },
  {
    key: 'modify',
    label: 'Modify',
    subtitle: 'Can edit records',
    icon: 'pencil-outline',
  },
  {
    key: 'delete',
    label: 'Delete',
    subtitle: 'Can delete records',
    icon: 'trash-outline',
  },
];

const PERMISSION_GROUPS: GroupMeta[] = [
  { id: 'projects', title: 'Projects', icon: 'project', actions: ACTION_METAS },
  { id: 'sprints', title: 'Sprints', icon: 'sprint', actions: ACTION_METAS },
  {
    id: 'user_stories',
    title: 'User Stories',
    icon: 'story',
    actions: ACTION_METAS,
  },
  { id: 'tasks', title: 'Tasks', icon: 'task', actions: ACTION_METAS },
  { id: 'comments', title: 'Comments', icon: 'comment', actions: ACTION_METAS },
];

const getRoleIcon = (name: string) => {
  switch (name?.toLowerCase()) {
    case 'project_manager':
      return 'person-outline';
    case 'developer':
      return 'code-slash-outline';
    case 'qa':
      return 'shield-outline';
    case 'stakeholder':
      return 'people-outline';
    default:
      return 'ribbon-outline';
  }
};

const formatRoleTitle = (name: string) =>
  name
    ? name
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    : '';

const normalizeRoleName = (name: string) =>
  name
    .trim()
    .replace(/[_\s]+/g, ' ')
    .toLowerCase();

const createDefaultPermissions = (): RolePermissionsMap => ({
  comments: { add: false, delete: false, modify: false, view: true },
  projects: { add: false, delete: false, modify: false, view: true },
  sprints: { add: false, delete: false, modify: false, view: true },
  tasks: { add: false, delete: false, modify: false, view: true },
  user_stories: { add: false, delete: false, modify: false, view: true },
});

const RolePermission = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { moderateScale } = useAuthLayout();
  const { colors } = useTheme();

  const { data: rolesResponse, isLoading, refetch } = useGetRolesQuery();
  const [createRole, { isLoading: isCreatingRole }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdatingRole }] = useUpdateRoleMutation();
  const [deleteRole, { isLoading: isDeletingRole }] = useDeleteRoleMutation();
  const roles = useMemo(() => rolesResponse?.data ?? [], [rolesResponse]);

  const [searchRole, setSearchRole] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({ projects: true });
  const [createRoleVisible, setCreateRoleVisible] = useState(false);
  const [deleteRoleVisible, setDeleteRoleVisible] = useState(false);

  const [permissionsState, setPermissionsState] = useState<
    Record<string, RolePermissionsMap>
  >({});
  const [initialPermissions, setInitialPermissions] = useState<
    Record<string, RolePermissionsMap>
  >({});

  useEffect(() => {
    if (roles.length > 0) {
      const initialMap: Record<string, RolePermissionsMap> = {};
      roles.forEach(role => {
        initialMap[role.id] = { ...role.permissions };
      });
      setPermissionsState(initialMap);
      setInitialPermissions(initialMap);

      setSelectedRoleId(currentRoleId =>
        !currentRoleId || !roles.some(role => role.id === currentRoleId)
          ? roles[0].id
          : currentRoleId,
      );
    }
  }, [roles]);

  const isDirty = useMemo(
    () =>
      JSON.stringify(permissionsState) !== JSON.stringify(initialPermissions),
    [permissionsState, initialPermissions],
  );

  const activeRole = useMemo(
    () => roles.find(r => r.id === selectedRoleId) || roles[0],
    [roles, selectedRoleId],
  );

  const toggleSection = useCallback((groupId: string) => {
    setExpandedSections(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  }, []);

  const togglePermission = useCallback(
    (roleId: string, groupKey: string, actionKey: keyof PermissionActions) => {
      setPermissionsState(prev => {
        const rolePerms = prev[roleId] || {};
        const groupPerms = rolePerms[groupKey] || {
          view: false,
          add: false,
          modify: false,
          delete: false,
        };

        return {
          ...prev,
          [roleId]: {
            ...rolePerms,
            [groupKey]: { ...groupPerms, [actionKey]: !groupPerms[actionKey] },
          },
        };
      });
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!activeRole) return;

    try {
      await updateRole({
        roleId: activeRole.id,
        payload: {
          permissions:
            permissionsState[activeRole.id] ?? activeRole.permissions,
        },
      }).unwrap();
      await refetch();
      setInitialPermissions({ ...permissionsState });
      showSnackbar({
        message: `${formatRoleTitle(activeRole.name)} permissions updated`,
        type: 'success',
      });
    } catch {
      // API errors handled by client
    }
  }, [activeRole, permissionsState, refetch, updateRole]);

  const handleDelete = useCallback(() => {
    if (activeRole?.is_system) {
      showSnackbar({
        message: 'System default roles cannot be deleted',
        type: 'error',
      });
      return;
    }
    setDeleteRoleVisible(true);
  }, [activeRole]);

  const handleConfirmDelete = useCallback(async () => {
    if (!activeRole) return;

    try {
      await deleteRole({ roleId: activeRole.id }).unwrap();
      setDeleteRoleVisible(false);
      setSelectedRoleId('');
      await refetch();
      showSnackbar({
        message: `${formatRoleTitle(activeRole.name)} role deleted`,
        type: 'success',
      });
    } catch {
      // API errors handled by client
    }
  }, [activeRole, deleteRole, refetch]);

  const filteredRoles = useMemo(() => {
    if (!searchRole.trim()) return roles;
    return roles.filter(r =>
      formatRoleTitle(r.name).toLowerCase().includes(searchRole.toLowerCase()),
    );
  }, [roles, searchRole]);

  const validateRoleName = useCallback(
    (name: string) => {
      if (!name.trim()) return 'Role name is required';
      const normalizedName = normalizeRoleName(name);
      if (roles.some(role => normalizeRoleName(role.name) === normalizedName)) {
        return 'A role with this name already exists';
      }
      return undefined;
    },
    [roles],
  );

  const handleCreateRole = useCallback(
    async (name: string) => {
      const validationError = validateRoleName(name);
      if (validationError) {
        showSnackbar({ message: validationError, type: 'error' });
        throw new Error(validationError);
      }

      await createRole({
        name: name.trim(),
        permissions: createDefaultPermissions(),
      }).unwrap();
      await refetch();
      showSnackbar({
        message: `Role "${name.trim()}" created`,
        type: 'success',
      });
    },
    [createRole, refetch, validateRoleName],
  );

  if (isLoading) {
    return <RolePermissionSkeleton />;
  }

  return (
    <Screen backgroundColor={colors.surface}>
      <CommonHeader
        variant='organizationMembers'
        title='Permissions'
        titleAlignment='left'
        onBackPress={() => navigation.goBack()}
        searchQuery={searchRole}
        onChangeSearchQuery={setSearchRole}
        searchPlaceholder='Search roles...'
      />

      <PopupModel
        visible={createRoleVisible}
        mode='createRole'
        title='Create Role'
        onClose={() => setCreateRoleVisible(false)}
        onRoleCreate={handleCreateRole}
        validateRoleName={validateRoleName}
        isCreatingRole={isCreatingRole}
      />

      <DeleteColumnModal
        visible={deleteRoleVisible}
        columnTitle={formatRoleTitle(activeRole?.name ?? '')}
        colors={colors}
        title='Delete Role'
        loading={isDeletingRole}
        onClose={() => setDeleteRoleVisible(false)}
        onDelete={handleConfirmDelete}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: moderateScale(100) }}
        className='px-4 pt-3'
      >
        {/* Horizontal Role Selector */}
        <View className='mb-4 flex-row items-center'>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className='flex-1'
            contentContainerStyle={{
              gap: 8,
              alignItems: 'center',
              paddingRight: 8,
            }}
          >
            {filteredRoles.map(role => {
              const isSelected = selectedRoleId === role.id;
              return (
                <TouchableOpacity
                  key={role.id}
                  activeOpacity={0.8}
                  onPress={() => setSelectedRoleId(role.id)}
                  className='relative items-center justify-center rounded-2xl border px-3 py-2.5'
                  style={{
                    width: 78,
                    height: 78,
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  }}
                >
                  {isSelected && (
                    <Ionicons
                      name='checkmark-circle'
                      size={14}
                      color={colors.white}
                      style={{ position: 'absolute', top: 6, right: 6 }}
                    />
                  )}
                  <Ionicons
                    name={getRoleIcon(role.name)}
                    size={22}
                    color={isSelected ? colors.white : colors.textSecondary}
                    style={{ marginBottom: 4 }}
                  />
                  <AppText
                    style={{
                      fontSize: 11,
                      textAlign: 'center',
                      lineHeight: 13,
                      color: isSelected ? colors.white : colors.text,
                      fontWeight: isSelected ? '700' : '500',
                    }}
                    numberOfLines={2}
                  >
                    {formatRoleTitle(role.name)}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setCreateRoleVisible(true)}
            className='ml-1 items-center justify-center rounded-2xl border px-3 py-2.5'
            style={{
              width: 78,
              height: 78,
              borderStyle: 'dashed',
              borderColor: colors.primary,
              backgroundColor: colors.card,
            }}
          >
            <Ionicons name='add' size={24} color={colors.primary} />
            <AppText
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: colors.primary,
                marginTop: 2,
              }}
              numberOfLines={1}
            >
              New Role
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Active Role Overview Card */}
        {activeRole && (
          <View
            className='mb-4 flex-row items-center justify-between rounded-2xl border p-3.5'
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <View className='flex-1 flex-row items-center pr-3'>
              <View
                className='mr-3 h-11 w-11 items-center justify-center rounded-xl'
                style={{ backgroundColor: colors.primary }}
              >
                <Ionicons
                  name={getRoleIcon(activeRole.name)}
                  size={22}
                  color={colors.white}
                />
              </View>
              <View className='flex-1 justify-center'>
                <AppText
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: colors.text,
                  }}
                  numberOfLines={1}
                >
                  {formatRoleTitle(activeRole.name)}
                </AppText>
                <AppText
                  style={{
                    fontSize: 12,
                    marginTop: 2,
                    color: colors.textSecondary,
                  }}
                >
                  {activeRole.is_system ? 'System Default' : 'Custom Role'}
                </AppText>
              </View>
            </View>

            <View className='flex-row items-center gap-2'>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSave}
                disabled={!isDirty || isUpdatingRole}
                className='h-9 w-9 items-center justify-center rounded-full'
                style={{
                  backgroundColor: isUpdatingRole
                    ? colors.border
                    : colors.primary,
                  opacity: isUpdatingRole ? 0.6 : 1,
                }}
              >
                <Ionicons name='checkmark' size={20} color={colors.white} />
              </TouchableOpacity>
              {!activeRole.is_system && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleDelete}
                  className='h-9 w-9 items-center justify-center rounded-full'
                  style={{ backgroundColor: colors.error + '1A' }}
                >
                  <Ionicons
                    name='trash-outline'
                    size={17}
                    color={colors.error}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Permissions Accordion */}
        <View className='gap-3'>
          {PERMISSION_GROUPS.map(group => {
            const isExpanded = Boolean(expandedSections[group.id]);
            const rolePerms = permissionsState[activeRole?.id]?.[group.id] || {
              view: false,
              add: false,
              modify: false,
              delete: false,
            };
            const activeCount = Object.values(rolePerms).filter(Boolean).length;

            return (
              <View
                key={group.id}
                className='overflow-hidden rounded-2xl border'
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => toggleSection(group.id)}
                  className='flex-row items-center justify-between p-4'
                >
                  <View className='flex-row items-center gap-4'>
                    <WorkItemIcon
                      type={group.icon}
                      size={20}
                      color={colors.primary}
                    />
                    <AppText
                      style={{
                        fontSize: 15,
                        fontWeight: '700',
                        color: colors.text,
                      }}
                    >
                      {group.title}
                    </AppText>
                  </View>

                  <View className='flex-row items-center gap-2.5'>
                    <View
                      className='rounded-full px-2.5 py-0.5'
                      style={{ backgroundColor: colors.primary + '1A' }}
                    >
                      <AppText
                        style={{
                          fontSize: 12,
                          fontWeight: '600',
                          color: colors.primary,
                        }}
                      >
                        {`${activeCount}/${group.actions.length}`}
                      </AppText>
                    </View>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={colors.textSecondary}
                    />
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View
                    className='border-t px-4'
                    style={{ borderTopColor: colors.border }}
                  >
                    {group.actions.map((action, idx) => {
                      const isEnabled = Boolean(rolePerms[action.key]);
                      const isLast = idx === group.actions.length - 1;

                      return (
                        <View
                          key={action.key}
                          className='flex-row items-center justify-between py-3.5'
                          style={
                            !isLast
                              ? {
                                  borderBottomWidth: StyleSheet.hairlineWidth,
                                  borderBottomColor: colors.border,
                                }
                              : undefined
                          }
                        >
                          <View className='flex-1 flex-row items-center pr-3'>
                            <Ionicons
                              name={action.icon}
                              size={18}
                              color={colors.textSecondary}
                              style={{ marginRight: 12, width: 20 }}
                            />
                            <View className='flex-1'>
                              <AppText
                                style={{
                                  fontSize: 14,
                                  fontWeight: '600',
                                  color: colors.text,
                                }}
                              >
                                {action.label}
                              </AppText>
                              <AppText
                                style={{
                                  fontSize: 12,
                                  marginTop: 1,
                                  color: colors.textSecondary,
                                }}
                              >
                                Can {action.key} {group.title.toLowerCase()}
                              </AppText>
                            </View>
                          </View>

                          <Switch
                            value={isEnabled}
                            disabled={action.key === 'view'}
                            onValueChange={() =>
                              togglePermission(
                                activeRole.id,
                                group.id,
                                action.key,
                              )
                            }
                            trackColor={{
                              false: colors.border,
                              true: colors.primary,
                            }}
                            thumbColor={colors.white}
                          />
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
};

export default RolePermission;
