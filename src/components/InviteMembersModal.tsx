import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  TextInput,
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
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { showSnackbar } from './common/Snackbar';
import { useInviteOrganizationMutation } from '../store/api/homeApi';

interface MemberItem {
  id: string;
  email: string;
}

interface InviteMembersModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const InviteMembersModal: React.FC<InviteMembersModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { colors } = useTheme();
  const { moderateScale } = useAuthLayout();
  const scrollViewRef = useRef<ScrollView>(null);

  const [members, setMembers] = useState<MemberItem[]>([
    { id: '1', email: '' },
    { id: '2', email: '' },
  ]);

  const [inviteOrganization, { isLoading }] = useInviteOrganizationMutation();

  // Reset modal state on open/close
  useEffect(() => {
    if (visible) {
      setMembers([
        { id: '1', email: '' },
        { id: '2', email: '' },
      ]);
    }
  }, [visible]);

  const handleAddMember = () => {
    setMembers(prev => [
      ...prev,
      { id: Date.now().toString(), email: '' },
    ]);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleRemoveMember = (indexToRemove: number) => {
    if (members.length <= 1) {
      setMembers([{ id: Date.now().toString(), email: '' }]);
      return;
    }
    setMembers(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleEmailChange = (index: number, text: string) => {
    setMembers(prev =>
      prev.map((item, idx) => (idx === index ? { ...item, email: text } : item)),
    );
  };

  const handleSubmit = async () => {
    const trimmedMembers = members
      .map(m => ({ ...m, email: m.email.trim() }))
      .filter(m => m.email.length > 0);

    if (trimmedMembers.length === 0) {
      showSnackbar({
        message: 'Please enter at least one member email',
        type: 'error',
      });
      return;
    }

    const invalidEmail = trimmedMembers.find(m => !EMAIL_REGEX.test(m.email));
    if (invalidEmail) {
      showSnackbar({
        message: `Invalid email: ${invalidEmail.email}`,
        type: 'error',
      });
      return;
    }

    try {
      const response = await inviteOrganization({
        members: trimmedMembers.map(m => ({ email: m.email })),
      }).unwrap();

      showSnackbar({
        message: response?.message || 'Invitations sent successfully!',
        type: 'success',
      });
      onSuccess?.();
      onClose();
    } catch (error: any) {
      const errorMsg =
        error?.data?.message ||
        error?.message ||
        'Failed to send invitations. Please try again.';
      showSnackbar({
        message: errorMsg,
        type: 'error',
      });
    }
  };

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
          className='flex-1 items-center justify-center px-4'
          style={styles.backdrop}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className='w-full items-center justify-center'
          >
            <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
              <View
                className='w-full max-w-md rounded-2xl border p-5'
                style={[
                  styles.modalContainer,
                  {
                    backgroundColor: colors.card || '#FFFFFF',
                    borderColor: colors.border || '#E2E8F0',
                  },
                ]}
              >
                {/* Header */}
                <View className='flex-row items-start justify-between'>
                  <View className='flex-1 pr-2'>
                    <AppText
                      variant='bodyLarge'
                      className='text-lg font-bold'
                      color={colors.text || '#0F172A'}
                    >
                      Invite Team Members
                    </AppText>
                    <AppText
                      variant='caption'
                      className='mt-1 text-sm leading-5'
                      color={colors.textSecondary || '#64748B'}
                    >
                      Members will receive an email invitation to join.
                    </AppText>
                  </View>

                  <TouchableOpacity
                    onPress={onClose}
                    disabled={isLoading}
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

                {/* Member Cards Scrollable Area (scrolls when member count > 2) */}
                <ScrollView
                  ref={scrollViewRef}
                  className='mt-4'
                  style={
                    members.length > 2
                      ? { maxHeight: moderateScale(225) }
                      : undefined
                  }
                  scrollEnabled={members.length > 2}
                  showsVerticalScrollIndicator={members.length > 2}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps='handled'
                >
                  <View style={{ gap: moderateScale(12) }}>
                    {members.map((member, index) => (
                      <View
                        key={member.id}
                        className='rounded-xl border p-3.5'
                        style={{
                          backgroundColor: colors.card || '#FFFFFF',
                          borderColor: colors.border || '#E2E8F0',
                        }}
                      >
                        {/* Member Card Header */}
                        <View className='flex-row items-center justify-between'>
                          <AppText
                            variant='body'
                            className='font-bold'
                            color={colors.text || '#1E293B'}
                          >
                            Member {index + 1}
                          </AppText>

                          <TouchableOpacity
                            activeOpacity={0.7}
                            disabled={isLoading}
                            onPress={() => handleRemoveMember(index)}
                            className='flex-row items-center'
                            style={{ gap: 4 }}
                          >
                            <Ionicons
                              name='close'
                              size={moderateScale(14)}
                              color={colors.textSecondary || '#64748B'}
                            />
                            <AppText
                              variant='caption'
                              className='font-medium'
                              color={colors.textSecondary || '#64748B'}
                            >
                              Remove
                            </AppText>
                          </TouchableOpacity>
                        </View>

                        {/* Email Input */}
                        <View
                          className='mt-2.5 flex-row items-center rounded-lg border px-3'
                          style={{
                            height: moderateScale(44),
                            backgroundColor: colors.surface || '#FFFFFF',
                            borderColor: colors.border || '#CBD5E1',
                          }}
                        >
                          <Ionicons
                            name='mail-outline'
                            size={moderateScale(18)}
                            color={colors.textSecondary || '#94A3B8'}
                            style={{ marginRight: 8 }}
                          />
                          <TextInput
                            value={member.email}
                            onChangeText={text =>
                              handleEmailChange(index, text)
                            }
                            placeholder='email@company.com'
                            placeholderTextColor={
                              colors.textSecondary || '#9CA3AF'
                            }
                            keyboardType='email-address'
                            autoCapitalize='none'
                            autoCorrect={false}
                            editable={!isLoading}
                            className='flex-1 p-0 text-sm'
                            style={{
                              color: colors.text || '#0F172A',
                            }}
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>

                {/* Add Member Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={isLoading}
                  onPress={handleAddMember}
                  className='mt-3 flex-row items-center justify-center rounded-xl border'
                  style={{
                    height: moderateScale(44),
                    backgroundColor: colors.card || '#FFFFFF',
                    borderColor: colors.text || '#000000',
                    borderWidth: 1.5,
                    gap: 6,
                  }}
                >
                  <Ionicons
                    name='add'
                    size={moderateScale(18)}
                    color={colors.primary || '#2563EB'}
                  />
                  <AppText
                    variant='button'
                    className='font-bold'
                    color={colors.primary || '#2563EB'}
                    style={{ fontSize: moderateScale(14) }}
                  >
                    Add Member
                  </AppText>
                </TouchableOpacity>

                {/* Footer */}
                <View
                  className='mt-4 flex-row items-center justify-between border-t pt-4'
                  style={{
                    borderColor: colors.border || '#F1F5F9',
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={0.7}
                    disabled={isLoading}
                    onPress={onClose}
                    className='py-2'
                  >
                    <AppText
                      variant='body'
                      className='font-bold'
                      color={colors.text || '#1E293B'}
                    >
                      Cancel
                    </AppText>
                  </TouchableOpacity>

                  <AppText
                    variant='caption'
                    className='font-medium'
                    color={colors.textSecondary || '#64748B'}
                  >
                    {members.length} {members.length === 1 ? 'member' : 'members'}
                  </AppText>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={isLoading}
                    onPress={handleSubmit}
                    className='items-center justify-center rounded-xl px-4'
                    style={{
                      height: moderateScale(40),
                      backgroundColor: colors.primary || '#2563EB',
                      minWidth: moderateScale(130),
                    }}
                  >
                    {isLoading ? (
                      <ActivityIndicator
                        size='small'
                        color={colors.white || '#FFFFFF'}
                      />
                    ) : (
                      <AppText
                        variant='button'
                        className='font-bold'
                        color={colors.white || '#FFFFFF'}
                        style={{ fontSize: moderateScale(13) }}
                      >
                        Submit Invitations
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

export default InviteMembersModal;
