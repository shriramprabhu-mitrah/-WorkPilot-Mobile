import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from './common/AppText';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import Avatar from './Avatar';
import { ProjectMember } from '../types/project.type';
import { RoleApiItem } from '../types/auth.type';
import CustomDropdown, { DropdownItem } from './CustomDropdown';

interface EditMemberRoleModalProps {
  visible: boolean;
  member: ProjectMember | null;
  roles: RoleApiItem[];
  isLoading?: boolean;
  onClose: () => void;
  onSave: (userId: string, roleId: string) => Promise<void> | void;
}

const EditMemberRoleModal: React.FC<EditMemberRoleModalProps> = ({
  visible,
  member,
  roles = [],
  isLoading = false,
  onClose,
  onSave,
}) => {
  const { colors } = useTheme();
  const { moderateScale, layout, isSmallHeight } = useAuthLayout();

  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (visible && member) {
      const currentRole = roles.find(r => r.name === member.role);
      setSelectedRoleId(currentRole ? String(currentRole.id) : '');
      setIsDropdownOpen(false);
    }
  }, [visible, member, roles]);

  if (!member) return null;

  const displayName = member.full_name || member.username || 'Member';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(name => name.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const dropdownRoles: DropdownItem<string>[] = roles.map(role => ({
    id: String(role.id),
    name: role.name,
  }));

  const handleSave = () => {
    if (!selectedRoleId || !member) return;
    onSave(member.user_id, selectedRoleId);
  };

  const verticalPadding = isSmallHeight ? moderateScale(16) : moderateScale(20);
  const contentGap = isSmallHeight ? moderateScale(14) : layout.sectionGap;

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={isLoading ? undefined : onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={isLoading ? undefined : onClose}>
        <View
          className='flex-1 items-center justify-center'
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)' }}
        >
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View
              className='w-11/12 max-w-sm rounded-2xl border'
              style={{
                backgroundColor: colors.card || colors.surface,
                borderColor: colors.border,
                paddingHorizontal: layout.paddingHorizontal,
                paddingVertical: verticalPadding,
                gap: contentGap,
              }}
            >
              {/* Modal Header */}
              <View className='flex-row items-center justify-between'>
                <AppText
                  variant='title'
                  color={colors.text}
                  className='flex-1 font-bold'
                  numberOfLines={1}
                >
                  Edit Member Role
                </AppText>

                <TouchableOpacity
                  onPress={onClose}
                  disabled={isLoading}
                  className='items-center justify-center rounded-full'
                  style={{
                    width: moderateScale(30),
                    height: moderateScale(30),
                    backgroundColor: colors.surface || colors.background,
                  }}
                  hitSlop={10}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name='close'
                    size={moderateScale(16)}
                    color={colors.textSecondary || colors.text}
                  />
                </TouchableOpacity>
              </View>

              {/* Member Details Card (Read-only) */}
              <View
                className='flex-row items-center rounded-xl border p-3'
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  gap: layout.elementGap,
                }}
              >
                {/* Avatar */}
                <Avatar
                  dimension={moderateScale(42)}
                  initials={initials || '?'}
                  color={member.color || colors.primary}
                  imageUrl={member.avatar_url}
                />

                {/* Info */}
                <View className='flex-1' style={{ gap: 2 }}>
                  <AppText
                    variant='body'
                    className='font-bold'
                    color={colors.text}
                    numberOfLines={1}
                  >
                    {displayName}
                  </AppText>
                  <AppText
                    variant='caption'
                    color={colors.textSecondary}
                    numberOfLines={1}
                  >
                    @{member.username}
                  </AppText>
                </View>
              </View>

              {/* Role Selection Dropdown (Editable) */}
              <View style={{ gap: moderateScale(6), zIndex: 10 }}>
                <AppText
                  variant='caption'
                  className='font-bold tracking-wider'
                  color={colors.textSecondary}
                >
                  PROJECT ROLE
                </AppText>

                <CustomDropdown
                  items={dropdownRoles}
                  selectedValue={selectedRoleId}
                  onSelect={item => {
                    setSelectedRoleId(String(item.id));
                    setIsDropdownOpen(false);
                  }}
                  isOpen={isDropdownOpen}
                  onToggle={() => setIsDropdownOpen(prev => !prev)}
                  placeholder='Select role'
                  direction='down'
                  showIndicatorDot={false}
                />
              </View>

              {/* Action Buttons */}
              <View
                className='flex-row items-center justify-end'
                style={{ gap: moderateScale(10), marginTop: moderateScale(4) }}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={onClose}
                  disabled={isLoading}
                  className='items-center justify-center rounded-lg border px-4 py-2.5'
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }}
                >
                  <AppText
                    variant='body'
                    className='font-semibold'
                    color={colors.text}
                  >
                    Cancel
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleSave}
                  disabled={isLoading || !selectedRoleId}
                  className='items-center justify-center rounded-lg px-5 py-2.5'
                  style={{
                    backgroundColor: colors.primary,
                    opacity: isLoading || !selectedRoleId ? 0.6 : 1,
                  }}
                >
                  {isLoading ? (
                    <ActivityIndicator size='small' color={colors.white} />
                  ) : (
                    <AppText
                      variant='body'
                      className='font-bold'
                      color={colors.white}
                    >
                      Update Role
                    </AppText>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default EditMemberRoleModal;
