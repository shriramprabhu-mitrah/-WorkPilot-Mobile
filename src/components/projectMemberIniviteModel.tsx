import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from './common/AppText';
import { AppInput } from '../components';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { showSnackbar } from './common/Snackbar';
import { OrganizationMember, RoleApiItem } from '../types/auth.type';
import CustomDropdown, { DropdownItem } from './CustomDropdown';

export interface ProjectMemberAssignment {
  userId: string;
  name: string;
  roleId: string;
}

interface AddProjectMemberModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (members: { user_id: string; role_id: string }[]) => Promise<void>;
  isSubmitting?: boolean;
  members: OrganizationMember[];
  roles: RoleApiItem[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const AddProjectMemberModal: React.FC<AddProjectMemberModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isSubmitting = false,
  members = [],
  roles = [],
  searchQuery,
  onSearchChange,
}) => {
  const { colors } = useTheme();
  const { moderateScale } = useAuthLayout();

  const getRoleLabel = (item: any): string =>
    typeof item === 'string' ? item : item?.name || item?.slug || '';

  // Format roles for dropdown
  const formattedRoleItems: DropdownItem<string>[] = useMemo(() => {
    return roles.map((role: any) => ({
      id: String(role.id),
      name: getRoleLabel(role),
    }));
  }, [roles]);

  // Format members for dropdown
  const formattedMemberItems: DropdownItem<string>[] = useMemo(() => {
    return members.map((m: any) => ({
      id: String(m.id || m._id || m.user_id || ''),
      name: m.full_name || m.username || m.email || 'Member',
    }));
  }, [members]);

  const defaultRole =
    formattedRoleItems.length > 0 ? formattedRoleItems[0].id : '';

  // Selection & Dropdown State
  const [selectedMembers, setSelectedMembers] = useState<
    ProjectMemberAssignment[]
  >([]);
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);
  const [activeRoleDropdownId, setActiveRoleDropdownId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (visible) {
      setSelectedMembers([]);
      setIsMemberDropdownOpen(false);
      setActiveRoleDropdownId(null);
    }
  }, [visible]);

  // Multi-select toggle
  const handleMemberSelect = (selectedItem: DropdownItem<string>) => {
    const memberId = String(selectedItem.id);
    const displayName = selectedItem.name;

    setSelectedMembers(prev => {
      const exists = prev.some(m => m.userId === memberId);
      if (exists) {
        return prev.filter(m => m.userId !== memberId);
      }
      return [
        ...prev,
        {
          userId: memberId,
          name: displayName,
          roleId: defaultRole,
        },
      ];
    });
  };

  const handleRemoveMember = (userId: string) => {
    setSelectedMembers(prev => prev.filter(m => m.userId !== userId));
  };

  const handleRoleSelect = (userId: string, roleId: string) => {
    setSelectedMembers(prev =>
      prev.map(m => (m.userId === userId ? { ...m, roleId } : m)),
    );
    setActiveRoleDropdownId(null);
  };

  const closeAllDropdowns = () => {
    setIsMemberDropdownOpen(false);
    setActiveRoleDropdownId(null);
  };

  const handleSubmit = async () => {
    if (selectedMembers.length === 0) {
      showSnackbar({
        message: 'Please select at least one member to add.',
        type: 'error',
      });
      return;
    }

    const payload = selectedMembers.map(m => ({
      user_id: m.userId,
      role_id: m.roleId,
    }));

    await onSubmit(payload);
  };

  const getButtonText = () => {
    if (selectedMembers.length === 0) return 'Add Members';
    if (selectedMembers.length === 1) return 'Add 1 Member';
    return `Add ${selectedMembers.length} Members`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={isSubmitting ? undefined : onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback
        onPress={() => {
          if (!isSubmitting) {
            closeAllDropdowns();
            onClose();
          }
        }}
      >
        <View
          className='flex-1 items-center justify-center px-4'
          style={styles.backdrop}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className='w-full items-center justify-center'
          >
            <TouchableWithoutFeedback
              onPress={e => {
                e.stopPropagation();
                closeAllDropdowns();
              }}
            >
              <View
                className='w-full max-w-md rounded-2xl border p-5'
                style={[
                  styles.modalContainer,
                  {
                    backgroundColor: colors.card || '#FFFFFF',
                    borderColor: colors.border || '#E2E8F0',
                    height: moderateScale(600),
                  },
                ]}
              >
                {/* Header */}
                <View
                  className='flex-row items-start justify-between'
                  style={{ height: moderateScale(48) }}
                >
                  <View className='flex-1 pr-2'>
                    <AppText
                      variant='bodyLarge'
                      className='text-lg font-bold'
                      color={colors.text || '#0F172A'}
                    >
                      Add Members
                    </AppText>
                    <AppText
                      variant='caption'
                      className='mt-0.5 text-sm leading-5'
                      color={colors.textSecondary || '#64748B'}
                    >
                      Select members to add to this project.
                    </AppText>
                  </View>

                  <TouchableOpacity
                    onPress={onClose}
                    disabled={isSubmitting}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    className='items-center justify-center p-1'
                  >
                    <Ionicons
                      name='close'
                      size={moderateScale(20)}
                      color={colors.textSecondary || '#94A3B8'}
                    />
                  </TouchableOpacity>
                </View>

                {/* Member Dropdown Section */}
                <View className='mt-2' style={{ zIndex: 3000 }}>
                  <AppText
                    variant='body'
                    className='mb-1 font-bold'
                    color={colors.text || '#1E293B'}
                  >
                    Members
                  </AppText>

                  <CustomDropdown<string>
                    items={formattedMemberItems}
                    selectedValue=''
                    selectedValues={selectedMembers.map(m => m.userId)}
                    placeholder={
                      selectedMembers.length > 0
                        ? `${selectedMembers.length} member${selectedMembers.length > 1 ? 's' : ''} selected`
                        : 'Select members to add'
                    }
                    isOpen={isMemberDropdownOpen}
                    direction='down'
                    onToggle={() => {
                      setActiveRoleDropdownId(null);
                      setIsMemberDropdownOpen(prev => !prev);
                    }}
                    onSelect={handleMemberSelect}
                    showIndicatorDot={false}
                    renderSearchBar={
                      isMemberDropdownOpen
                        ? () => (
                            <View className='pb-2'>
                              <AppInput
                                placeholder='Search members...'
                                value={searchQuery}
                                onChangeText={onSearchChange}
                                leftIcon={
                                  <Ionicons
                                    name='search-outline'
                                    size={moderateScale(16)}
                                    color={colors.textSecondary || '#64748B'}
                                  />
                                }
                              />
                            </View>
                          )
                        : undefined
                    }
                  />

                  {/* Selected Tags Box */}
                  <View
                    className='mt-2 rounded-xl border border-dashed px-2 py-1.5'
                    style={{
                      height: moderateScale(76),
                      borderColor: colors.border || '#E2E8F0',
                      backgroundColor: colors.surface || '#F8FAFC',
                    }}
                  >
                    {selectedMembers.length === 0 ? (
                      <View className='flex-1 items-center justify-center'>
                        <AppText
                          variant='caption'
                          className='text-xs'
                          color={colors.textSecondary || '#94A3B8'}
                        >
                          No members selected yet
                        </AppText>
                      </View>
                    ) : (
                      <ScrollView
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={true}
                        contentContainerStyle={{
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          gap: 6,
                          paddingVertical: 2,
                        }}
                      >
                        {selectedMembers.map(item => (
                          <View
                            key={item.userId}
                            className='flex-row items-center rounded-lg px-2.5 py-1'
                            style={{ backgroundColor: colors.primary + '20' }}
                          >
                            <AppText
                              variant='caption'
                              className='font-medium text-blue-600'
                            >
                              {item.name}
                            </AppText>
                            <TouchableOpacity
                              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                              onPress={ev => {
                                ev.stopPropagation();
                                handleRemoveMember(item.userId);
                              }}
                              className='ml-1.5'
                            >
                              <Ionicons
                                name='close'
                                size={14}
                                color='#2563EB'
                              />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </ScrollView>
                    )}
                  </View>
                </View>

                {/* Member Roles Scroll Section */}
                <View className='mt-3 flex-1' style={{ zIndex: 1000 }}>
                  <AppText
                    variant='body'
                    className='mb-1.5 font-bold'
                    color={colors.text || '#1E293B'}
                  >
                    Member Roles
                  </AppText>

                  {selectedMembers.length === 0 ? (
                    <View className='flex-1 items-center justify-center rounded-xl border border-dashed border-gray-300'>
                      <AppText
                        variant='body'
                        color={colors.textSecondary || '#64748B'}
                      >
                        Select members above to configure roles
                      </AppText>
                    </View>
                  ) : (
                    <ScrollView
                      nestedScrollEnabled
                      keyboardShouldPersistTaps='handled'
                      showsVerticalScrollIndicator={true}
                      className='flex-1'
                      contentContainerStyle={{
                        paddingBottom: moderateScale(40),
                        gap: moderateScale(10),
                      }}
                    >
                      {selectedMembers.map((member, index) => {
                        const isDropdownOpen =
                          activeRoleDropdownId === member.userId;

                        return (
                          <View
                            key={member.userId}
                            className='rounded-xl border p-2.5'
                            style={{
                              backgroundColor: colors.card || '#FFFFFF',
                              borderColor: colors.border || '#E2E8F0',
                              zIndex: isDropdownOpen
                                ? 999
                                : selectedMembers.length - index,
                            }}
                          >
                            <View className='flex-row items-center justify-between gap-3'>
                              <AppText
                                variant='body'
                                className='flex-1 font-medium'
                                color={colors.text || '#1E293B'}
                                numberOfLines={1}
                              >
                                {member.name}
                              </AppText>

                              <View
                                style={{
                                  width: moderateScale(155),
                                  zIndex: 1000,
                                }}
                              >
                                <CustomDropdown<string>
                                  items={formattedRoleItems}
                                  selectedValue={member.roleId}
                                  placeholder='Select Role'
                                  isOpen={isDropdownOpen}
                                  direction={
                                    index >= selectedMembers.length - 2 &&
                                    selectedMembers.length > 2
                                      ? 'up'
                                      : 'down'
                                  }
                                  onToggle={() => {
                                    setIsMemberDropdownOpen(false);
                                    setActiveRoleDropdownId(prev =>
                                      prev === member.userId
                                        ? null
                                        : member.userId,
                                    );
                                  }}
                                  onSelect={selectedItem => {
                                    handleRoleSelect(
                                      member.userId,
                                      String(selectedItem.id),
                                    );
                                  }}
                                  showIndicatorDot={false}
                                />
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </ScrollView>
                  )}
                </View>

                {/* Footer Buttons */}
                <View
                  className='mt-2 flex-row items-center justify-end border-t pt-3'
                  style={{
                    borderColor: colors.border || '#F1F5F9',
                    height: moderateScale(52),
                    gap: 12,
                    zIndex: 1,
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={0.7}
                    disabled={isSubmitting}
                    onPress={onClose}
                    className='items-center justify-center rounded-xl border px-5'
                    style={{
                      height: moderateScale(40),
                      borderColor: colors.border || '#CBD5E1',
                    }}
                  >
                    <AppText
                      variant='body'
                      className='font-bold'
                      color={colors.text || '#1E293B'}
                    >
                      Cancel
                    </AppText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={isSubmitting || selectedMembers.length === 0}
                    onPress={handleSubmit}
                    className='items-center justify-center rounded-xl px-4'
                    style={{
                      height: moderateScale(40),
                      backgroundColor:
                        selectedMembers.length === 0
                          ? colors.primary + '50'
                          : colors.primary || '#2563EB',
                      minWidth: moderateScale(130),
                    }}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator
                        size='small'
                        color={colors.white || '#FFFFFF'}
                      />
                    ) : (
                      <AppText
                        variant='button'
                        className='font-bold'
                        color={
                          selectedMembers.length === 0
                            ? colors.white + '50'
                            : colors.white || '#FFFFFF'
                        }
                        style={{ fontSize: moderateScale(13) }}
                      >
                        {getButtonText()}
                      </AppText>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  modalContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
});

export default AddProjectMemberModal;
