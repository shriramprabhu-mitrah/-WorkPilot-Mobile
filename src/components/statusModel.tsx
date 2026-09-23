import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useTheme } from '../theme/ThemeProvider';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { Spacing } from '../constants/Spacing';
import AppText from './common/AppText';
import AppInput from './common/Input/AppInput';
import ColorPicker from './colorPicker';
import { Radius } from '../constants/Radius';
import { PrimaryButton } from './common/Button';

export interface StatusItem {
  id: string;
  name: string;
  color: string;
  display_order: string;
  is_default: boolean;
  is_final: boolean;
}

export interface StatusModalProps {
  visible: boolean;
  editItem: StatusItem | null;
  onClose: () => void;
  onSave: (
    name: string,
    color: string,
    is_final: boolean,
  ) => void | Promise<void>;
  saving?: boolean;
}

export const StatusModal: React.FC<StatusModalProps> = ({
  visible,
  editItem,
  onClose,
  onSave,
  saving = false,
}) => {
  const { colors } = useTheme();
  const { moderateScale } = useAuthLayout();
  const insets = useSafeAreaInsets();

  const [color, setColor] = useState('#2563EB');
  const [name, setName] = useState('');
  const [isFinal, setIsFinal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      setColor(editItem?.color ?? '#2563EB');
      setName(editItem?.name ?? '');
      setIsFinal(editItem?.is_final ?? false);
      setDropdownOpen(false);
    }
  }, [visible, editItem]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    try {
      await onSave(trimmed, color, isFinal);
      onClose();
    } catch {
      // Keep the editor open when the request fails; the API layer reports the error.
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <View
            style={{
              maxHeight: '82%',
              marginTop: moderateScale(24),
              backgroundColor: colors.background,
              borderTopLeftRadius: moderateScale(24),
              borderTopRightRadius: moderateScale(24),
              borderTopWidth: 1.5,
              borderLeftWidth: 1,
              borderRightWidth: 1,
              borderTopColor: colors.border,
              borderColor: colors.border,
              paddingHorizontal: Spacing.lg,
              paddingTop: Spacing.lg,
              paddingBottom: Math.max(insets.bottom, Spacing.lg) + Spacing.xs,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: Spacing.md,
              }}
            >
              <AppText
                variant='h4'
                color={colors.text}
                style={{ fontWeight: '700', fontSize: moderateScale(20) }}
              >
                {editItem ? 'Edit Status' : 'Add Status'}
              </AppText>

              <TouchableOpacity
                onPress={onClose}
                hitSlop={8}
                style={{
                  width: moderateScale(32),
                  height: moderateScale(32),
                  borderRadius: moderateScale(16),
                  borderWidth: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
              >
                <Ionicons
                  name='close'
                  size={moderateScale(18)}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps='handled'
              contentContainerStyle={{
                gap: moderateScale(16),
                paddingBottom: Spacing.sm,
              }}
            >
              <View style={{ gap: moderateScale(8) }}>
                <AppText
                  variant='bodyLarge'
                  color={colors.text}
                  style={{ fontWeight: '600' }}
                >
                  Status Color
                </AppText>
                <ColorPicker value={color} onChange={setColor} />
              </View>

              <View style={{ gap: moderateScale(8) }}>
                <AppText
                  variant='bodyLarge'
                  color={colors.text}
                  style={{ fontWeight: '600' }}
                >
                  Status Name
                </AppText>
                <AppInput
                  value={name}
                  onChangeText={setName}
                  placeholder='Enter status name'
                />
              </View>

              <View style={{ gap: moderateScale(8) }}>
                <AppText
                  variant='bodyLarge'
                  color={colors.text}
                  style={{ fontWeight: '600' }}
                >
                  Final?
                </AppText>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setDropdownOpen(prev => !prev)}
                  style={{
                    borderWidth: 1,
                    borderColor: dropdownOpen ? colors.primary : colors.border,
                    backgroundColor: colors.surface,
                    borderRadius: Radius.md,
                    paddingHorizontal: moderateScale(14),
                    paddingVertical: moderateScale(13),
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <AppText variant='body' color={colors.text}>
                    {isFinal ? 'Yes' : 'No'}
                  </AppText>
                  <Ionicons
                    name={dropdownOpen ? 'chevron-up' : 'chevron-down'}
                    size={moderateScale(17)}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>

                {dropdownOpen && (
                  <View
                    style={{
                      borderWidth: 1,
                      overflow: 'hidden',
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      borderRadius: Radius.md,
                    }}
                  >
                    {[
                      { label: 'No', value: false },
                      { label: 'Yes', value: true },
                    ].map(opt => {
                      const isSelected = isFinal === opt.value;
                      return (
                        <TouchableOpacity
                          key={String(opt.value)}
                          activeOpacity={0.7}
                          onPress={() => {
                            setIsFinal(opt.value);
                            setDropdownOpen(false);
                          }}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingHorizontal: Spacing.lg,
                            paddingVertical: moderateScale(12),
                            borderBottomWidth: StyleSheet.hairlineWidth,
                            borderBottomColor: colors.border,
                            backgroundColor: isSelected
                              ? `${colors.primary}12`
                              : 'transparent',
                          }}
                        >
                          <AppText
                            variant='body'
                            color={isSelected ? colors.primary : colors.text}
                            style={{ fontWeight: isSelected ? '600' : '400' }}
                          >
                            {opt.label}
                          </AppText>
                          {isSelected && (
                            <Ionicons
                              name='checkmark'
                              size={moderateScale(16)}
                              color={colors.primary}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            </ScrollView>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingTop: Spacing.sm,
                gap: moderateScale(12),
              }}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onClose}
                disabled={saving}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderColor: colors.border,
                  borderRadius: Radius.md,
                  paddingVertical:
                    Platform.OS === 'ios'
                      ? moderateScale(14)
                      : moderateScale(12),
                }}
              >
                <AppText variant='button' color={colors.text}>
                  Cancel
                </AppText>
              </TouchableOpacity>

              <PrimaryButton
                title='Save'
                onPress={handleSave}
                disabled={!name.trim() || saving}
                loading={saving}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default StatusModal;
